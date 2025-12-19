const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function simulateBooking() {
  try {
    // Load env
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) throw new Error('Environment file not found');
    dotenv.config({ path: envPath });

    const connectDB = require('./config/db');
    await connectDB();

    const User = require('./models/User');
    const Doctor = require('./models/Doctor');
    const Appointment = require('./models/Appointment');
    const Payment = require('./models/Payment');

    // 1. Find a patient and a doctor
    const patient = await User.findOne({ role: 'patient' });
    const doctor = await Doctor.findOne({}); // Any doctor

    if (!patient || !doctor) {
      console.log('Error: Could not find patient or doctor to simulate booking.');
      process.exit(1);
    }

    console.log(`Simulating booking for Patient: ${patient.email}, Doctor: ${doctor.name}`);

    // 2. Create Appointment
    const appointment = new Appointment({
      doctorId: doctor._id,
      patientId: patient._id,
      date: new Date(),
      slot: '10:00-11:00', // Mock slot
      status: 'pending'
    });
    await appointment.save();
    console.log('Appointment Created:', appointment._id);

    // 3. Initiate Payment (This creates the Payment record)
    // In the real app, this is called by POST /api/payments/upi-details
    const payment = await Payment.findOneAndUpdate(
      { appointmentId: appointment._id, status: 'pending' },
      {
        $setOnInsert: {
          appointmentId: appointment._id,
          patientId: patient._id,
          doctorId: doctor._id,
          amount: doctor.fees,
          status: 'pending',
          paymentMethod: 'UPI',
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Payment Record Created:', payment._id);
    console.log('Payment CreatedAt:', payment.createdAt);
    console.log('Payment UpdatedAt:', payment.updatedAt);

    // 4. Verify Admin Fetch (simulate)
    const adminPayments = await Payment.find({})
        .sort({ updatedAt: -1 })
        .limit(5);

    console.log('\nTop 5 Admin Payments:');
    adminPayments.forEach((p, i) => {
        console.log(`${i+1}. ID: ${p._id}, Updated: ${p.updatedAt}, Status: ${p.status} ${p._id.toString() === payment._id.toString() ? '<< NEWLY CREATED' : ''}`);
    });

    const found = adminPayments.find(p => p._id.toString() === payment._id.toString());
    if (found) {
        console.log('\nSUCCESS: New booking payment found in Admin Dashboard Query!');
    } else {
        console.log('\nFAILURE: New booking payment NOT found in top 5.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simulateBooking();
