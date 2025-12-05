const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Review = require('./models/Review');
const Appointment = require('./models/Appointment');
const Favorite = require('./models/Favorite');
const Payment = require('./models/Payment');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];
const specializations = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 
  'Pediatrician', 'General Physician', 'Psychiatrist', 'Dentist',
  'Ophthalmologist', 'Gynecologist', 'Urologist'
];

const names = [
  'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel', 'Dr. Sneha Reddy',
  'Dr. Vikram Singh', 'Dr. Anjali Mehta', 'Dr. Rohit Gupta', 'Dr. Kavita Nair',
  'Dr. Sanjay Verma', 'Dr. Meera Joshi'
];

const patientNames = [
  'Rahul Mehta', 'Sneha Patel', 'Arjun Singh', 'Priya Reddy', 'Vikram Kumar',
  'Anjali Sharma', 'Rohit Gupta', 'Kavita Nair', 'Sanjay Verma', 'Meera Joshi',
  'Amit Patel', 'Divya Sharma', 'Karan Malhotra', 'Neha Gupta', 'Ravi Kumar',
  'Shreya Singh', 'Aditya Verma', 'Pooja Reddy', 'Manish Joshi', 'Anita Nair'
];

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Review.deleteMany({});
    await Appointment.deleteMany({});
    await Favorite.deleteMany({});
    await Payment.deleteMany({});

    console.log('Cleared existing data...');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created:', admin.email);

    // Create Patients
    const patients = [];
    for (let i = 0; i < 20; i++) {
      const patient = await User.create({
        name: patientNames[i],
        email: `patient${i + 1}@demo.com`,
        password: 'patient123',
        role: 'patient',
        gender: i % 2 === 0 ? 'male' : 'female',
      });
      patients.push(patient);
    }
    console.log(`Created ${patients.length} patients`);

    // Create Doctors
    const doctors = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        name: names[i],
        email: `doctor${i + 1}@demo.com`,
        password: 'doctor123',
        role: 'doctor',
        gender: i % 2 === 0 ? 'male' : 'female',
      });

      const isVerified = i < 7; // First 7 verified, last 3 pending
      const doctor = await Doctor.create({
        userId: user._id,
        name: names[i],
        specialization: specializations[i % specializations.length],
        experience: Math.floor(Math.random() * 20) + 5,
        fees: Math.floor(Math.random() * 2000) + 500,
        city: cities[i % cities.length],
        bio: `Experienced ${specializations[i % specializations.length]} with ${Math.floor(Math.random() * 20) + 5} years of practice.`,
        gender: i % 2 === 0 ? 'male' : 'female',
        licenseNumber: `LIC${1000 + i}`,
        status: isVerified ? 'verified' : 'pending',
        isVerified,
        verificationRequestedAt: isVerified ? new Date() : null,
        workingHours: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      doctors.push(doctor);
    }
    console.log(`Created ${doctors.length} doctors (7 verified, 3 pending)`);

    // Create Demo Doctor User
    const demoDoctorUser = await User.create({
      name: 'Demo Doctor',
      email: 'doctor@demo.com',
      password: 'doctor123',
      role: 'doctor',
      gender: 'male',
    });

    const demoDoctor = await Doctor.create({
      userId: demoDoctorUser._id,
      name: 'Dr. Demo Doctor',
      specialization: 'General Physician',
      experience: 15,
      fees: 1000,
      city: 'Delhi',
      bio: 'Experienced general physician ready to help.',
      gender: 'male',
      licenseNumber: 'LIC9999',
      status: 'verified',
      isVerified: true,
      verificationRequestedAt: new Date(),
      workingHours: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '09:00',
        endTime: '18:00',
      },
    });
    doctors.push(demoDoctor);
    console.log('Demo doctor created');

    // Create Demo Patient
    const demoPatient = await User.create({
      name: 'Demo Patient',
      email: 'patient@demo.com',
      password: 'patient123',
      role: 'patient',
      gender: 'male',
    });
    patients.push(demoPatient);
    console.log('Demo patient created');

    // Create Reviews
    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      
      const review = await Review.create({
        doctorId: doctor._id,
        patientId: patient._id,
        rating,
        comment: `Great doctor! Very professional and helpful. ${rating >= 4 ? 'Highly recommended!' : 'Could be better.'}`,
      });
      reviews.push(review);
    }
    console.log(`Created ${reviews.length} reviews`);

    // Create Appointments
    const appointments = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    for (let i = 0; i < 30; i++) {
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const date = generateRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      const slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
      
      const appointment = await Appointment.create({
        doctorId: doctor._id,
        patientId: patient._id,
        date,
        slot: slots[Math.floor(Math.random() * slots.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
      appointments.push(appointment);
    }
    console.log(`Created ${appointments.length} appointments`);

    // Create Favorites
    const favorites = [];
    for (let i = 0; i < 15; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      const favorite = await Favorite.create({
        userId: patient._id,
        doctorId: doctor._id,
      });
      favorites.push(favorite);
    }
    console.log(`Created ${favorites.length} favorites`);

    // Create Payments for completed appointments
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const payments = [];
    for (const appointment of completedAppointments) {
      const doctor = doctors.find(d => d._id.toString() === appointment.doctorId.toString());
      if (doctor) {
        const payment = await Payment.create({
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          amount: doctor.fees,
          status: 'completed',
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
        payments.push(payment);
        appointment.paymentId = payment._id;
        await appointment.save();
      }
    }
    console.log(`Created ${payments.length} payments`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Doctor: doctor@demo.com / doctor123');
    console.log('Patient: patient@demo.com / patient123');
    console.log('\nTotal created:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Doctors: ${await Doctor.countDocuments()}`);
    console.log(`- Reviews: ${await Review.countDocuments()}`);
    console.log(`- Appointments: ${await Appointment.countDocuments()}`);
    console.log(`- Favorites: ${await Favorite.countDocuments()}`);
    console.log(`- Payments: ${await Payment.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

