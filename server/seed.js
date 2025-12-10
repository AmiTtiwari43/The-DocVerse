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

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Kochi', 'Thiruvananthapuram'
];
const specializations = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 
  'Pediatrician', 'General Physician', 'Psychiatrist', 'Dentist',
  'Ophthalmologist', 'Gynecologist', 'Urologist', 'Endocrinologist', 'Gastroenterologist'
];

const clinicAddresses = {
  'Delhi': [
    { street: '123 MG Road', zipCode: '110001', state: 'Delhi', fullAddress: '123 MG Road, Delhi - 110001' },
    { street: '456 Connaught Place', zipCode: '110001', state: 'Delhi', fullAddress: '456 Connaught Place, Delhi - 110001' },
    { street: '789 Rajpath', zipCode: '110011', state: 'Delhi', fullAddress: '789 Rajpath, Delhi - 110011' },
  ],
  'Mumbai': [
    { street: '321 Marine Drive', zipCode: '400020', state: 'Maharashtra', fullAddress: '321 Marine Drive, Mumbai - 400020' },
    { street: '654 Fort Area', zipCode: '400023', state: 'Maharashtra', fullAddress: '654 Fort Area, Mumbai - 400023' },
  ],
  'Bangalore': [
    { street: '111 MG Road', zipCode: '560001', state: 'Karnataka', fullAddress: '111 MG Road, Bangalore - 560001' },
    { street: '222 Brigade Road', zipCode: '560025', state: 'Karnataka', fullAddress: '222 Brigade Road, Bangalore - 560025' },
  ],
  'Pune': [
    { street: '333 FC Road', zipCode: '411004', state: 'Maharashtra', fullAddress: '333 FC Road, Pune - 411004' },
  ],
  'Hyderabad': [
    { street: '444 HITEC City', zipCode: '500081', state: 'Telangana', fullAddress: '444 HITEC City, Hyderabad - 500081' },
  ],
  'Chennai': [
    { street: '555 Mount Road', zipCode: '600002', state: 'Tamil Nadu', fullAddress: '555 Mount Road, Chennai - 600002' },
  ],
  'Kolkata': [
    { street: '666 AJC Bose Road', zipCode: '700001', state: 'West Bengal', fullAddress: '666 AJC Bose Road, Kolkata - 700001' },
  ],
  'Ahmedabad': [
    { street: '777 CG Road', zipCode: '380009', state: 'Gujarat', fullAddress: '777 CG Road, Ahmedabad - 380009' },
  ],
  'Jaipur': [
    { street: '888 MI Road', zipCode: '302001', state: 'Rajasthan', fullAddress: '888 MI Road, Jaipur - 302001' },
  ],
  'Lucknow': [
    { street: '999 Hazratganj', zipCode: '226001', state: 'Uttar Pradesh', fullAddress: '999 Hazratganj, Lucknow - 226001' },
  ],
  'Chandigarh': [
    { street: '101 Sector 17', zipCode: '160017', state: 'Chandigarh', fullAddress: '101 Sector 17, Chandigarh - 160017' },
  ],
  'Indore': [
    { street: '202 AB Road', zipCode: '452001', state: 'Madhya Pradesh', fullAddress: '202 AB Road, Indore - 452001' },
  ],
  'Bhopal': [
    { street: '303 MP Nagar', zipCode: '462011', state: 'Madhya Pradesh', fullAddress: '303 MP Nagar, Bhopal - 462011' },
  ],
  'Nagpur': [
    { street: '404 Sitabuldi', zipCode: '440012', state: 'Maharashtra', fullAddress: '404 Sitabuldi, Nagpur - 440012' },
  ],
  'Kochi': [
    { street: '505 MG Road', zipCode: '682001', state: 'Kerala', fullAddress: '505 MG Road, Kochi - 682001' },
  ],
  'Thiruvananthapuram': [
    { street: '606 MG Road', zipCode: '695001', state: 'Kerala', fullAddress: '606 MG Road, Thiruvananthapuram - 695001' },
  ]
};

const names = [
  'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel', 'Dr. Sneha Reddy',
  'Dr. Vikram Singh', 'Dr. Anjali Mehta', 'Dr. Rohit Gupta', 'Dr. Kavita Nair',
  'Dr. Sanjay Verma', 'Dr. Meera Joshi', 'Dr. Arjun Malhotra', 'Dr. Neha Kapoor',
  'Dr. Ravi Shastri', 'Dr. Simran Khan', 'Dr. Kabir Das', 'Dr. Pooja Hegde',
  'Dr. Manoj Bajpayee', 'Dr. Vidya Balan', 'Dr. Shah Rukh', 'Dr. Deepika P',
  'Dr. Ranveer S', 'Dr. Alia B', 'Dr. Ranbir K', 'Dr. Katrina K', 'Dr. Salman K'
];

const patientNames = [
  'Rahul Mehta', 'Sneha Patel', 'Arjun Singh', 'Priya Reddy', 'Vikram Kumar',
  'Anjali Sharma', 'Rohit Gupta', 'Kavita Nair', 'Sanjay Verma', 'Meera Joshi',
  'Amit Patel', 'Divya Sharma', 'Karan Malhotra', 'Neha Gupta', 'Ravi Kumar',
  'Shreya Singh', 'Aditya Verma', 'Pooja Reddy', 'Manish Joshi', 'Anita Nair',
  'Hardik P', 'Virat K', 'Rohit S', 'KL R', 'Rishabh P', 'Jasprit B',
  'Ravindra J', 'Shikhar D', 'Yuzvendra C', 'Mohammed S', 'Ishant S'
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

    const getHistoryDate = (monthsBack) => {
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * monthsBack));
      date.setDate(Math.floor(Math.random() * 28) + 1);
      return date;
    };

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'at5518109@gmail.com',
      password: 'Amittiwari1',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin created:', admin.email);

    // Create Patients
    const patients = [];
    for (let i = 0; i < 50; i++) {
      const createdAt = getHistoryDate(12); // Random date in last 12 months
      const patient = await User.create({
        name: patientNames[i % patientNames.length] + (i > 30 ? ` ${i}` : ''),
        email: `patient${i + 1}@demo.com`,
        password: 'patient123',
        role: 'patient',
        gender: i % 2 === 0 ? 'male' : 'female',
        createdAt,
        updatedAt: createdAt,
        isVerified: true,
      });
      patients.push(patient);
    }
    console.log(`Created ${patients.length} patients`);

    // Create Doctors
    const doctors = [];
    for (let i = 0; i < 50; i++) {
        const createdAt = getHistoryDate(12);
        const user = await User.create({
        name: names[i % names.length] + (i > 25 ? ` ${i}` : ''),
        email: `doctor${i + 1}@demo.com`,
        password: 'doctor123',
        role: 'doctor',
        gender: i % 2 === 0 ? 'male' : 'female',
        createdAt,
        updatedAt: createdAt,
        isVerified: true,
      });

      const isVerified = i < 40; // 80% verified
      const doctorCity = cities[i % cities.length];
      const cityAddresses = clinicAddresses[doctorCity] || [];
      const selectedAddress = cityAddresses.length > 0 
        ? cityAddresses[i % cityAddresses.length] 
        : { street: 'Sample Street', zipCode: '000000', state: 'State', fullAddress: `Sample Address, ${doctorCity}` };
      
      const doctor = await Doctor.create({
        userId: user._id,
        name: user.name,
        specialization: specializations[i % specializations.length],
        experience: Math.floor(Math.random() * 25) + 3,
        fees: Math.floor(Math.random() * 2000) + 500,
        city: doctorCity,
        address: selectedAddress,
        bio: `Experienced ${specializations[i % specializations.length]} with ${Math.floor(Math.random() * 20) + 5} years of practice.`,
        gender: i % 2 === 0 ? 'male' : 'female',
        licenseNumber: `LIC${1000 + i}`,
        status: isVerified ? 'verified' : 'pending',
        isVerified,
        verificationRequestedAt: isVerified ? createdAt : null,
        createdAt,
        updatedAt: createdAt,
        workingHours: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
        },
        clinicImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop", // Hospital hallway
          "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=1200&auto=format&fit=crop", // Medical equipment
          "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop", // Waiting room
          "https://images.unsplash.com/photo-1516549655169-df83a25a836d?q=80&w=1200&auto=format&fit=crop", // Doctors talking
        ],
      });
      doctors.push(doctor);
    }
    console.log(`Created ${doctors.length} doctors`);

    // Create Demo Doctor User
    const demoCreatedAt = getHistoryDate(6);
    const demoDoctorUser = await User.create({
      name: 'Demo Doctor',
      email: 'doctor@demo.com',
      password: 'doctor123',
      role: 'doctor',
      gender: 'male',
      createdAt: demoCreatedAt,
      updatedAt: demoCreatedAt,
      isVerified: true,
    });

    const demoDoctor = await Doctor.create({
      userId: demoDoctorUser._id,
      name: 'Dr. Demo Doctor',
      specialization: 'General Physician',
      experience: 15,
      fees: 1000,
      city: 'Delhi',
      address: clinicAddresses['Delhi'][0],
      bio: 'Experienced general physician ready to help.',
      gender: 'male',
      licenseNumber: 'LIC9999',
      status: 'verified',
      isVerified: true,
      verificationRequestedAt: demoCreatedAt,
      createdAt: demoCreatedAt,
      updatedAt: demoCreatedAt,
      workingHours: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '09:00',
        endTime: '18:00',
      },
      clinicImages: [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop", // Modern Clinic
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop", // Hallway
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop", // Reception
      ],
    });
    doctors.push(demoDoctor);
    console.log('Demo doctor created');

    // Create Demo Patient
    const demoPatientCreatedAt = getHistoryDate(6);
    const demoPatient = await User.create({
      name: 'Demo Patient',
      email: 'patient@demo.com',
      password: 'patient123',
      role: 'patient',
      gender: 'male',
      createdAt: demoPatientCreatedAt,
      updatedAt: demoPatientCreatedAt,
      isVerified: true,
    });
    patients.push(demoPatient);
    console.log('Demo patient created');

    // Create Reviews
    const reviews = [];
    for (let i = 0; i < 200; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      
      const reviewDate = new Date(Math.max(new Date(doctor.createdAt).getTime(), new Date(patient.createdAt).getTime()) + Math.random() * (Date.now() - Math.max(new Date(doctor.createdAt).getTime(), new Date(patient.createdAt).getTime())));

      const review = await Review.create({
        doctorId: doctor._id,
        patientId: patient._id,
        rating,
        comment: `Great doctor! Very professional and helpful. ${rating >= 4 ? 'Highly recommended!' : 'Could be better.'}`,
        createdAt: reviewDate,
        updatedAt: reviewDate
      });
      reviews.push(review);
    }
    console.log(`Created ${reviews.length} reviews`);

    // Create Appointments
    const appointments = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    for (let i = 0; i < 150; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
      
      // Appointment date relative to doctor/patient creation (randomly in future or past)
      const baseDate = new Date(Math.max(new Date(doctor.createdAt).getTime(), new Date(patient.createdAt).getTime()));
      // Allow dates from baseDate to +2 months from now
      const date = new Date(baseDate.getTime() + Math.random() * (Date.now() + 60*24*60*60*1000 - baseDate.getTime()));
      
      const slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
      
      const appointment = await Appointment.create({
        doctorId: doctor._id,
        patientId: patient._id,
        date,
        slot: slots[Math.floor(Math.random() * slots.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(date.getTime() - 24*60*60*1000), // Created 1 day before appointment
        updatedAt: new Date(date.getTime() - 24*60*60*1000)
      });
      appointments.push(appointment);
    }
    console.log(`Created ${appointments.length} appointments`);

    // Create Favorites
    const favorites = [];
    const favoritePairs = new Set();
    let attempts = 0;
    const maxAttempts = 100;
    
    while (favorites.length < 15 && attempts < maxAttempts) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const pairKey = `${patient._id}-${doctor._id}`;
      
      if (!favoritePairs.has(pairKey)) {
        try {
          const favorite = await Favorite.create({
            userId: patient._id,
            doctorId: doctor._id,
          });
          favorites.push(favorite);
          favoritePairs.add(pairKey);
        } catch (error) {
          // Skip if duplicate (shouldn't happen with Set check, but just in case)
          console.log(`Skipping duplicate favorite: ${pairKey}`);
        }
      }
      attempts++;
    }
    console.log(`Created ${favorites.length} favorites`);

    // Create Payments for completed appointments
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const payments = [];
    for (const appointment of completedAppointments) {
      const doctor = doctors.find(d => d._id.toString() === appointment.doctorId.toString());
      if (doctor) {
        const paymentDate = new Date(appointment.date); // Payment on appointment date
        const payment = await Payment.create({
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          amount: doctor.fees,
          status: 'completed',
          adminStatus: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
          transactionId: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentMethod: 'UPI',
          createdAt: paymentDate,
          updatedAt: paymentDate
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

