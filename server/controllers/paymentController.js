const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

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

    // Create pending payment record
    const payment = new Payment({
      appointmentId: appointment._id,
      patientId: req.user.id,
      doctorId: appointment.doctorId._id,
      amount: appointment.doctorId.fees,
      status: 'pending',
      paymentMethod: 'UPI',
    });

    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: appointment.doctorId.fees,
        upiId: process.env.UPI_ID || 'tiwari.amit4356-1@oksbi',
        qrCodeData: `upi://pay?pa=${process.env.UPI_ID || 'tiwari.amit4356-1@oksbi'}&pn=Mediverse&am=${appointment.doctorId.fees}&cu=INR`,
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
    payment.transactionId = transactionId || `UPI_${Date.now()}`;
    payment.completedAt = new Date();
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentId = payment._id;
      appointment.status = 'confirmed';
      await appointment.save();
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

