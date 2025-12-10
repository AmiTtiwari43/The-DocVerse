const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;

    // Validation
    if (!doctorId || !date || !slot) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Normalize date to start of day for comparison
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if appointment already exists for this slot (prevent double booking)
    // Only confirmed and pending appointments block the slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: { $gte: appointmentDate, $lt: nextDay },
      slot,
      status: { $in: ['pending', 'confirmed'] }, // Only pending and confirmed block slots
    }).populate('patientId', 'name email');

    if (existingAppointment) {
      const patientName = existingAppointment.patientId?.name || 'Another patient';
      const bookingTime = existingAppointment.createdAt 
        ? new Date(existingAppointment.createdAt).toLocaleString() 
        : 'recently';
      return res.status(400).json({ 
        success: false, 
        message: `Slot already booked by ${patientName} at ${bookingTime}`,
        bookingDetails: {
          patientName: patientName,
          bookedAt: bookingTime,
          status: existingAppointment.status
        }
      });
    }

    const appointment = new Appointment({
      doctorId,
      patientId: req.user.id,
      date: new Date(date),
      slot,
    });

    await appointment.save();

    // Send confirmation email
    const patient = await User.findById(req.user.id);
    if (patient && patient.email) {
      // Send Pending Email (Payment Required)
      const emailData = emailTemplates.appointmentPending(appointment, doctor, patient);
      await sendEmail({
        to: patient.email,
        ...emailData,
      });
    }

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments by user
exports.getAppointmentsByUser = async (req, res) => {
  try {
    let filter = {};

    // If user is a doctor, show their appointments
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (doctor) {
      filter.doctorId = doctor._id;
    } else {
      // Otherwise show patient's appointments
      filter.patientId = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization city fees')
      .populate('patientId', 'name email phone')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify authorization - patient or doctor can update
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isDoctor = doctor && appointment.doctorId.toString() === doctor._id.toString();
    const isPatient = appointment.patientId.toString() === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // New Check: Prevent doctor from confirming if payment not approved
    if (status === 'confirmed') {
        const Payment = require('../models/Payment');
        const payment = await Payment.findOne({ appointmentId: appointment._id });
        if (payment && payment.adminStatus !== 'approved') {
             return res.status(400).json({ 
                 success: false, 
                 message: 'Cannot confirm appointment. Payment verification by Admin is pending.' 
             });
        }
    }

    appointment.status = status;
    await appointment.save();

    // Send notifications based on doctor's action
    if (isDoctor) {
      const patient = await User.findById(appointment.patientId);
      const doctorUser = await Doctor.findById(appointment.doctorId);

      if (status === 'confirmed') {
        // Step 2 Complete: Doctor Confirmed -> Email Patient
        // Fetch payment to include in receipt
        const Payment = require('../models/Payment');
        const payment = await Payment.findOne({ appointmentId: appointment._id });
        
        const emailData = emailTemplates.appointmentConfirmation(appointment, doctorUser, patient, payment);
        await sendEmail({
          to: patient.email,
          ...emailData
        });
      } else if (status === 'cancelled' || status === 'rejected') {
        // Doctor Rejected -> Email Patient
         const emailData = emailTemplates.appointmentRejectedByDoctor(appointment, doctorUser, patient);
         await sendEmail({
           to: patient.email,
           ...emailData
         });
      }
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment status updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available slots for a doctor on a date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Doctor ID and date are required' });
    }

    // All possible slots
    const allSlots = [
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
    ];

    // Normalize date to start of day for comparison
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find booked slots with patient details
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: { $gte: appointmentDate, $lt: nextDay },
      status: { $in: ['pending', 'confirmed', 'completed'] }, // Pending, confirmed, and completed block slots
    })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    // Create a map of slot -> booking details
    const slotDetails = {};
    bookedAppointments.forEach((apt) => {
      slotDetails[apt.slot] = {
        isBooked: true,
        patientName: apt.patientId?.name || 'Unknown',
        patientEmail: apt.patientId?.email || '',
        bookedAt: apt.createdAt ? new Date(apt.createdAt).toLocaleString() : 'Unknown',
        status: apt.status,
        appointmentId: apt._id,
      };
    });

    // Create response with both available and booked slots
    const slotsWithDetails = allSlots.map((slot) => {
      if (slotDetails[slot]) {
        return {
          slot,
          available: false,
          ...slotDetails[slot],
        };
      }
      return {
        slot,
        available: true,
      };
    });

    const availableSlots = allSlots.filter((slot) => !slotDetails[slot]);

    res.status(200).json({ 
      success: true, 
      data: availableSlots, // Keep backward compatibility
      slotsWithDetails, // New detailed information
      bookedSlots: Object.keys(slotDetails), // List of booked slots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark appointment as completed
exports.markAsCompleted = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isDoctor = doctor && appointment.doctorId._id.toString() === doctor._id.toString();

    if (!isDoctor) {
      return res.status(403).json({ success: false, message: 'Only doctor can mark as completed' });
    }

    appointment.status = 'completed';
    await appointment.save();

    // Notify patient to review
    await Notification.create({
      userId: appointment.patientId._id,
      type: 'appointment_confirmed',
      message: `Your appointment with Dr. ${appointment.doctorId.name} is completed. Please leave a review!`,
      link: `/doctor/${appointment.doctorId._id}`,
    });

    await appointment.save();

    // Send review request email
    const patient = await User.findById(appointment.patientId._id);
    if (patient && patient.email) {
      const emailData = emailTemplates.reviewRequest(appointment, appointment.doctorId, patient);
      await sendEmail({
        to: patient.email,
        ...emailData,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment marked as completed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, slot } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify authorization - patient or doctor can reschedule
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isDoctor = doctor && appointment.doctorId._id.toString() === doctor._id.toString();
    const isPatient = appointment.patientId._id.toString() === req.user.id;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Validation
    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot are required' });
    }

    // Normalize date to start of day for comparison
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if new slot is available (prevent double booking)
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId._id,
      date: { $gte: appointmentDate, $lt: nextDay },
      slot,
      status: { $in: ['pending', 'confirmed'] }, // Only pending and confirmed block slots
      _id: { $ne: appointment._id },
    }).populate('patientId', 'name email');

    if (existingAppointment) {
      const patientName = existingAppointment.patientId?.name || 'Another patient';
      const bookingTime = existingAppointment.createdAt 
        ? new Date(existingAppointment.createdAt).toLocaleString() 
        : 'recently';
      return res.status(400).json({ 
        success: false, 
        message: `Slot already booked by ${patientName} at ${bookingTime}`,
        bookingDetails: {
          patientName: patientName,
          bookedAt: bookingTime,
          status: existingAppointment.status
        }
      });
    }

    // Update appointment
    appointment.date = new Date(date);
    appointment.slot = slot;
    appointment.status = 'confirmed'; // Reset to confirmed when rescheduled
    await appointment.save();

    // Send notification
    await Notification.create({
      userId: isDoctor ? appointment.patientId._id : appointment.doctorId.userId,
      type: 'appointment_rescheduled',
      message: `Your appointment has been rescheduled to ${new Date(date).toLocaleDateString()} at ${slot}`,
      link: `/appointments`,
    });

    // Send email notification
    const userToNotify = await User.findById(isDoctor ? appointment.patientId._id : appointment.doctorId.userId);
    if (userToNotify && userToNotify.email) {
      // Fetch payment details for the receipt
      const Payment = require('../models/Payment');
      const payment = await Payment.findOne({ appointmentId: appointment._id });

      const emailData = emailTemplates.appointmentConfirmation(appointment, appointment.doctorId, userToNotify, payment);
      await sendEmail({
        to: userToNotify.email,
        subject: 'Appointment Rescheduled',
        ...emailData,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment rescheduled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
