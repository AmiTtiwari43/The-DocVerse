const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { emailTemplates, sendEmail } = require('../utils/emailService');

// Get UPI payment details (QR code)
exports.getUPIPaymentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Atomic upsert: reuse existing pending payment or create a new one
    // This prevents duplicate pending entries due to race conditions
    let payment = await Payment.findOneAndUpdate(
      {
        appointmentId: appointment._id,
        status: 'pending'
      },
      {
        $setOnInsert: {
          appointmentId: appointment._id,
          patientId: req.user.id,
          doctorId: appointment.doctorId._id,
          amount: appointment.doctorId.fees,
          status: 'pending',
          paymentMethod: 'UPI',
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: appointment.doctorId.fees,
        upiId: process.env.UPI_ID || 'tiwari.amit4356-1@oksbi',
        qrCodeData: `upi://pay?pa=${process.env.UPI_ID || 'tiwari.amit4356-1@oksbi'}&pn=DocVerse&am=${appointment.doctorId.fees}&cu=INR`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm UPI payment (after user scans QR and pays)
exports.confirmUPIPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    payment.status = 'completed';
    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    payment.transactionId = transactionId.trim();
    payment.completedAt = new Date();
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentId = payment._id;
      appointment.status = 'confirmed';
      await appointment.save();

      // Send Confirmation Email
      try {
        const doctor = await Doctor.findById(appointment.doctorId);
        const patient = await User.findById(appointment.patientId);
        if (patient && patient.email) {
          const emailData = emailTemplates.appointmentConfirmation(appointment, doctor, patient, payment);
          await sendEmail({
            to: patient.email,
            ...emailData
          });
        }
      } catch (err) {
        console.error('Error sending confirmation email:', err);
      }
    }

    res.status(200).json({ success: true, data: payment, message: 'Payment confirmed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .populate('appointmentId')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: get all payments
exports.adminGetPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('appointmentId')
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: approve a payment (mark as admin-approved)
exports.adminApprovePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId');
    
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.adminStatus = 'approved';
    
    // IMPORTANT: We do NOT auto-confirm the appointment status to 'confirmed'.
    // We only associate the payment. The DOCTOR must accept it.
    if (payment.status === 'completed') {
      const appointment = await Appointment.findById(payment.appointmentId);
      if (appointment) {
        // appointment.status = 'confirmed'; // Removed auto-confirm
        appointment.paymentId = payment._id;
        await appointment.save();
      }
    }

    await payment.save();

    // Send notifications for 2-step flow
    try {
      const appointmentDate = payment.appointmentId?.date ? new Date(payment.appointmentId.date).toLocaleDateString() : 'N/A';
      const appointmentSlot = payment.appointmentId?.slot || 'N/A';
      
      // Email to patient: "Payment Verified, waiting for Doctor"
      const patientEmailData = emailTemplates.paymentVerifiedPatient(payment, payment.doctorId, payment.patientId);
      await sendEmail({
        to: payment.patientId?.email,
        ...patientEmailData
      });

      // Email to doctor: "Action Required"
      const doctorEmail = payment.doctorId?.userId?.email;
      const doctorEmailData = emailTemplates.paymentVerifiedDoctor(payment, payment.doctorId, payment.patientId, appointmentDate, appointmentSlot);
      await sendEmail({
        to: doctorEmail,
        ...doctorEmailData
      });

    } catch (emailErr) {
      console.error('Error sending approval emails:', emailErr);
    }

    res.status(200).json({ success: true, data: payment, message: 'Payment approved. Emails sent to patient and doctor.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: reject a payment (mark as fraud / rejected)
exports.adminRejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId');
    
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.adminStatus = 'rejected';
    // mark gateway status as failed for clarity
    payment.status = 'failed';
    await payment.save();

    // update appointment to cancelled and clear payment association
    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.status = 'cancelled';
      appointment.paymentId = payment._id;
      await appointment.save();
    }

    // Send rejection notification emails
    try {
      const appointmentDate = payment.appointmentId?.date ? new Date(payment.appointmentId.date).toLocaleDateString() : 'N/A';
      const appointmentSlot = payment.appointmentId?.slot || 'N/A';

      // Email to patient
      await sendEmail({
        to: payment.patientId?.email,
        subject: 'Payment Rejected - Appointment Cancelled',
        text: `Your payment for the appointment with Dr. ${payment.doctorId?.name} has been rejected. The appointment has been cancelled. Please contact support@docverse.com for assistance.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="margin: 0;">⚠ Payment Rejected</h2>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Dear ${payment.patientId?.name || 'Patient'},</p>
              <p>Unfortunately, your payment for the appointment has been <strong style="color: #EF4444;">rejected</strong> by our admin team.</p>
              
              <div style="background: white; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #EF4444;">Cancelled Appointment:</h4>
                <p><strong>Doctor:</strong> Dr. ${payment.doctorId?.name}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time Slot:</strong> ${appointmentSlot}</p>
                <p><strong>Amount:</strong> ₹${payment.amount}</p>
                <p><strong>Transaction ID:</strong> ${payment.transactionId || payment._id.toString().slice(-8)}</p>
              </div>
              
              <p style="background: #FEF3C7; padding: 12px; border-radius: 4px; border-left: 4px solid #F59E0B;">
                <strong>📌 Next Steps:</strong> Please verify your payment details and try booking again, or contact our support team.
              </p>
              
              <p>For assistance, please reach out to us at <strong>support@docverse.com</strong></p>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Best regards,<br/>
                <strong>THE DocVerse Team</strong>
              </p>
            </div>
          </div>
        `,
      });

      // Email to doctor
      await sendEmail({
        to: payment.doctorId?.email,
        subject: 'Appointment Cancelled - Payment Rejected',
        text: `An appointment with patient ${payment.patientId?.name} on ${appointmentDate} at ${appointmentSlot} has been cancelled. The payment was rejected by admin review. The time slot is now available for rebooking.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="margin: 0;">⚠ Appointment Cancelled</h2>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Dear Dr. ${payment.doctorId?.name},</p>
              <p>An appointment has been <strong style="color: #EF4444;">cancelled</strong> due to payment rejection during admin review.</p>
              
              <div style="background: white; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin-top: 0; color: #EF4444;">Cancelled Appointment Details:</h4>
                <p><strong>Patient Name:</strong> ${payment.patientId?.name}</p>
                <p><strong>Patient Email:</strong> ${payment.patientId?.email}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time Slot:</strong> ${appointmentSlot}</p>
                <p><strong>Amount:</strong> ₹${payment.amount}</p>
                <p><strong>Cancellation Reason:</strong> <span style="color: #EF4444; font-weight: bold;">Payment Rejected</span></p>
              </div>
              
              <p style="background: #DBEAFE; padding: 12px; border-radius: 4px; border-left: 4px solid #3B82F6;">
                <strong>📌 Note:</strong> The time slot is now available for rebooking by other patients. No payment has been transferred for this appointment.
              </p>
              
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Best regards,<br/>
                <strong>THE DocVerse Team</strong>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Error sending rejection emails:', emailErr);
    }

    res.status(200).json({ success: true, data: payment, message: 'Payment rejected by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

