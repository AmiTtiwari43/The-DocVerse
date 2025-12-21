require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const backfill = async () => {
  try {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not defined");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update Users
    const users = await User.find(); // Find ALL users to be safe, or check specifically for missing
    console.log(`Checking ${users.length} users...`);
    let userCount = 0;
    
    for (const user of users) {
      if (!user.createdAt) {
          user.createdAt = user._id.getTimestamp();
          user.updatedAt = user._id.getTimestamp();
          await user.save();
          userCount++;
      }
    }
    console.log(`Updated ${userCount} users`);

    // Update Doctors
    const doctors = await Doctor.find();
    console.log(`Checking ${doctors.length} doctors...`);
    let doctorCount = 0;

    for (const doctor of doctors) {
       if (!doctor.createdAt) {
          doctor.createdAt = doctor._id.getTimestamp();
          doctor.updatedAt = doctor._id.getTimestamp();
          await doctor.save();
          doctorCount++;
       }
    }
    console.log(`Updated ${doctorCount} doctors`);

    console.log('Backfill complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

backfill();
