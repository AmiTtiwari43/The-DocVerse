const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is provided
if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create transporter (configure with your email service)
const createTransporter = () => {
  // Use SendGrid SMTP if API key is provided
  if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // Fallback to Gmail or other SMTP
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Use SendGrid API if configured
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'noreply@docverse.com',
        subject,
        text,
        html,
      };

      await sgMail.send(msg);
      console.log('✅ Email sent via SendGrid:', { to, subject });
      return { success: true, message: 'Email sent via SendGrid' };
    }

    // Use SMTP (Gmail or other)
    const hasSMTP = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (!hasSMTP) {
      console.log('📧 Email would be sent:', { to, subject, body: text || 'HTML Content' });
      return { success: true, message: 'Email service not configured (dev mode)' };
    }

    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_USER || 'noreply@docverse.com';
    
    if (!to) {
        console.warn('⚠️ Warning: No recipient email provided. Skipping email send.');
        return { success: false, message: 'No recipient email provided' };
    }

    const info = await transporter.sendMail({
      from: `"THE DocVerse" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('✅ Email sent successfully:', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  appointmentConfirmation: (appointment, doctor, patient, payment) => {
    const transactionId = payment?.transactionId || 'N/A';
    const clinicAddress = doctor.address?.fullAddress || `${doctor.city}`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;

    return {
      subject: 'Booking Confirmed - THE DocVerse',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Appointment Confirmed</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Your payment was successful</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Paid</p>
              <h2 style="font-size: 36px; color: #10B981; margin: 0;">₹${doctor.fees}</h2>
              <p style="font-size: 12px; color: #999; margin-top: 5px;">Transaction ID: ${transactionId}</p>
            </div>

            <hr style="border: none; border-top: 1px dashed #e5e7eb; margin: 25px 0;">

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0;">👩‍⚕️ Doctor Details</h3>
              <p style="margin: 5px 0;"><strong>Dr. ${doctor.name}</strong></p>
              <p style="margin: 5px 0; color: #666;">${doctor.specialization}</p>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0;">📅 Appointment</h3>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="font-size: 12px; color: #666; margin-bottom: 2px;">DATE</p>
                  <p style="margin: 0; font-weight: 600;">${new Date(appointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style="font-size: 12px; color: #666; margin-bottom: 2px;">TIME</p>
                  <p style="margin: 0; font-weight: 600;">${appointment.slot}</p>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937; margin-top: 0;">📍 Location</h3>
              <p style="margin: 5px 0 10px;">${clinicAddress}</p>
              <a href="${mapLink}" style="color: #0EA5E9; text-decoration: none; font-size: 14px;">Get Directions →</a>
            </div>

            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #4B5563;">
                <strong>Patient:</strong> ${patient.name}
              </p>
            </div>

            <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
              Need help? Contact support@docverse.com
            </p>
          </div>
        </div>
      `,
      text: `Appointment Confirmed\n\nConfirmed with Dr. ${doctor.name}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.slot}\nLocation: ${clinicAddress}\n\nAmount Paid: ₹${doctor.fees}\nTransaction ID: ${transactionId}\n\nPlease show this at the clinic.`,
    };
  },

  appointmentPending: (appointment, doctor, patient) => {
    const clinicAddress = doctor.address?.fullAddress || `${doctor.city}`;
    
    return {
      subject: 'Action Required: Complete Payment - THE DocVerse',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Payment Pending</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Your slot is reserved. Please pay to confirm.</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Amount Due</p>
              <h2 style="font-size: 36px; color: #F59E0B; margin: 0;">₹${doctor.fees}</h2>
            </div>

            <hr style="border: none; border-top: 1px dashed #e5e7eb; margin: 25px 0;">

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0;">👩‍⚕️ Doctor Details</h3>
              <p style="margin: 5px 0;"><strong>Dr. ${doctor.name}</strong></p>
              <p style="margin: 5px 0; color: #666;">${doctor.specialization}</p>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0;">📅 Appointment</h3>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="font-size: 12px; color: #666; margin-bottom: 2px;">DATE</p>
                  <p style="margin: 0; font-weight: 600;">${new Date(appointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style="font-size: 12px; color: #666; margin-bottom: 2px;">TIME</p>
                  <p style="margin: 0; font-weight: 600;">${appointment.slot}</p>
                </div>
              </div>
            </div>

            <div style="background: #FFFBEB; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 25px;">
               <p style="margin: 0; font-size: 14px; color: #92400E;">
                 <strong>Note:</strong> Please complete the payment via your dashboard to confirm this appointment. Unpaid appointments may be cancelled.
               </p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Go to Dashboard & Pay</a>
            </div>

            <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
              Need help? Contact support@docverse.com
            </p>
          </div>
        </div>
      `,
      text: `Appointment Pending Payment\n\nBooking initiated with Dr. ${doctor.name}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.slot}\n\nPlease complete the payment of ₹${doctor.fees} to confirm your appointment.\nGo to your dashboard: ${process.env.CLIENT_URL}/dashboard`
    };
  },

  appointmentReminder: (appointment, doctor, patient) => ({
    subject: 'Appointment Reminder - THE DocVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0EA5E9;">Appointment Reminder</h2>
        <p>Hello ${patient.name},</p>
        <p>This is a reminder about your upcoming appointment:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.slot}</p>
        </div>
        <p>Please arrive 10 minutes early.</p>
      </div>
    `,
    text: `Reminder: Appointment with Dr. ${doctor.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot}`,
  }),

  reviewRequest: (appointment, doctor, patient) => ({
    subject: 'Share Your Experience - THE DocVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0EA5E9;">How was your visit?</h2>
        <p>Hello ${patient.name},</p>
        <p>Your appointment with Dr. ${doctor.name} has been completed.</p>
        <p>We'd love to hear about your experience! Please take a moment to leave a review.</p>
        <a href="${process.env.CLIENT_URL}/doctor/${doctor._id}" style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Leave a Review</a>
      </div>
    `,
    text: `Please review your visit with Dr. ${doctor.name}`,
  }),

  profileVerified: (doctor) => ({
    subject: 'Profile Verified - THE DocVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Profile Verified!</h2>
        <p>Hello Dr. ${doctor.name},</p>
        <p>Great news! Your profile has been verified and is now visible to patients.</p>
        <p>You can now start receiving appointment requests!</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">View Dashboard</a>
      </div>
    `,
    text: 'Your profile has been verified!',
  }),

  paymentVerifiedPatient: (payment, doctor, patient) => ({
    subject: `Payment Receipt - Transaction ID: ${payment.transactionId || payment._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Payment Receipt</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Payment Verified Successfully</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Paid</p>
            <h2 style="font-size: 36px; color: #10B981; margin: 0;">₹${payment.amount}</h2>
            <div style="background: #ECFDF5; color: #059669; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; font-weight: 600;">
              Verified by Admin
            </div>
          </div>

          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6B7280; font-size: 14px;">Transaction ID</span>
              <span style="font-weight: 600; font-family: monospace;">${payment.transactionId || payment._id.toString().slice(-8).toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6B7280; font-size: 14px;">Date</span>
              <span style="font-weight: 600;">${new Date().toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6B7280; font-size: 14px;">Payment Method</span>
              <span style="font-weight: 600;">${payment.paymentMethod.toUpperCase()}</span>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px;">Appointment Details</h3>
            <div style="margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctor.name}</p>
              <p style="margin: 5px 0; color: #666;">${doctor.specialization}</p>
              <p style="margin: 15px 0 5px;"><strong>Status:</strong> <span style="color: #F59E0B; font-weight: bold;">Waiting for Doctor Confirmation</span></p>
              <p style="font-size: 13px; color: #6B7280; margin: 0;">We have notified Dr. ${doctor.name}. You will receive a final confirmation email shortly.</p>
            </div>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
            This is a system generated receipt.
          </p>
        </div>
      </div>
    `,
    text: `Payment Receipt\n\nTransaction ID: ${payment.transactionId}\nAmount: ₹${payment.amount}\nStatus: Verified, Waiting for Doctor Confirmation`,
  }),

  appointmentRescheduled: (appointment, doctor, patient) => ({
    subject: 'Booking Update: Appointment Rescheduled - THE DocVerse',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Booking Update</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Your appointment has been rescheduled</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #EFF6FF; border: 1px solid #DBEAFE; padding: 15px; border-radius: 8px;">
               <p style="margin: 0; color: #1E40AF; font-weight: 500;">Please note the new time for your appointment</p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
             <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">New Appointment Details</h3>
             <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                <div style="margin-bottom: 15px;">
                  <span style="display: block; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</span>
                  <span style="font-size: 16px; font-weight: 600; color: #111;">Dr. ${doctor.name}</span>
                  <span style="display: block; font-size: 14px; color: #666;">${doctor.specialization}</span>
                </div>
                
                <div style="display: flex; gap: 40px;">
                  <div>
                    <span style="display: block; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Date</span>
                    <span style="font-size: 16px; font-weight: 600; color: #111;">${new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span style="display: block; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Time</span>
                    <span style="font-size: 16px; font-weight: 600; color: #111;">${appointment.slot}</span>
                  </div>
                </div>
             </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">📍 Location</h3>
            <p style="margin: 5px 0; color: #4B5563;">${doctor.address?.fullAddress || doctor.city}</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Booking</a>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px;">
            If you have questions, please contact support@docverse.com
          </p>
        </div>
      </div>
    `,
    text: `Appointment Rescheduled\n\nNew Details:\nDoctor: Dr. ${doctor.name}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.slot}`,
  }),

  paymentVerifiedDoctor: (payment, doctor, patient, appointmentDate, appointmentSlot) => ({
    subject: 'Action Required: New Appointment Request (Payment Verified)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">New Appointment Request</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Dear Dr. ${doctor.name},</p>
          <p>A new appointment request has been received and the payment of <strong>₹${payment.amount}</strong> has been <strong>verified</strong>.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0;">
            <p><strong>Patient:</strong> ${patient.name}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Slot:</strong> ${appointmentSlot}</p>
          </div>

          <p>Please log in to your dashboard to <strong>Confirm</strong> or <strong>Reject</strong> this appointment.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Go to Dashboard</a>
        </div>
      </div>
    `,
    text: `New appointment request from ${patient.name} on ${appointmentDate} at ${appointmentSlot}. Payment verified. Please confirm in dashboard.`,
  }),

  appointmentRejectedByDoctor: (appointment, doctor, patient) => ({
    subject: 'Appointment Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">Appointment Rejected</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Dear ${patient.name},</p>
          <p>Unfortunately, your appointment request with <strong>Dr. ${doctor.name}</strong> for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot} has been declined by the doctor.</p>
          <p>If you have already paid, our support team will initiate a refund shortly.</p>
          <p>Please contact support@docverse.com for assistance.</p>
        </div>
      </div>
    `,
    text: `Appointment with Dr. ${doctor.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot} has been rejected.`,
  }),

  contactSupport: (data) => ({
    subject: `New Contact Message: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366F1; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">New User Inquiry</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
           <p><strong>From:</strong> ${data.name} (${data.email})</p>
           <p><strong>Subject:</strong> ${data.subject}</p>
           <div style="background: white; padding: 15px; border-left: 4px solid #6366F1; margin: 20px 0; border-radius: 4px;">
             <strong>Message:</strong><br/>
             <p style="white-space: pre-wrap;">${data.message}</p>
           </div>
           <p style="font-size: 12px; color: #666;">Reply directly to this email to contact the user.</p>
        </div>
      </div>
    `,
    text: `New message from ${data.name} (${data.email}):\n\n${data.message}`,
  }),

  verifyEmail: (otp) => ({
    subject: 'Verify Your Email - THE DocVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563EB; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">Verify Your Email</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
          <p>Welcome to THE DocVerse! Please use the following OTP to verify your email address.</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2563EB;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes.</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    text: `Your verification code is: ${otp}`,
  }),
};

module.exports = { sendEmail, emailTemplates };

