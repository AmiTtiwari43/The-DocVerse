const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('./emailService');

// Check and send appointment reminders
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Find appointments tomorrow that haven't been reminded
    const appointments = await Appointment.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfter,
      },
      status: { $in: ['pending', 'confirmed'] },
      reminderSent: false,
    })
      .populate('doctorId')
      .populate('patientId');

    for (const appointment of appointments) {
      if (appointment.patientId && appointment.patientId.email) {
        const emailData = emailTemplates.appointmentReminder(
          appointment,
          appointment.doctorId,
          appointment.patientId
        );

        await sendEmail({
          to: appointment.patientId.email,
          ...emailData,
        });

        appointment.reminderSent = true;
        await appointment.save();
      }
    }

    console.log(`Sent ${appointments.length} appointment reminders`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};

// Run reminder check every hour
if (process.env.NODE_ENV !== 'test') {
  setInterval(checkAndSendReminders, 60 * 60 * 1000); // Every hour
  // Also run immediately on startup
  setTimeout(checkAndSendReminders, 5000); // After 5 seconds
}

module.exports = { checkAndSendReminders };

