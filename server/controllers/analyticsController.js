const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Get doctor analytics
exports.getDoctorAnalytics = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id });
    const reviews = await Review.find({ doctorId: doctor._id });
    const payments = await Payment.find({ doctorId: doctor._id, status: 'completed' });

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthPayments = payments.filter(
        (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    // Appointment status breakdown
    const statusBreakdown = {
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalAppointments: appointments.length,
        totalRevenue,
        avgRating,
        totalReviews: reviews.length,
        monthlyRevenue,
        statusBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get admin analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      verifiedDoctors,
      pendingDoctors,
      allPayments,
      allUsers,
      allDoctors,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Doctor.countDocuments({ status: 'verified' }),
      Doctor.countDocuments({ status: 'pending' }),
      Payment.find({ status: 'completed' }).select('amount createdAt'),
      User.find().select('createdAt role'),
      Doctor.find().select('createdAt'),
    ]);

    // Calculate total patients
    const totalPatients = allUsers.filter(u => u.role === 'patient').length;

    // Generate monthly revenue data (last 12 months)
    const monthlyRevenue = [];
    const monthlySales = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthPayments = allPayments.filter(
        (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: revenue,
      });
      monthlySales.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        sales: monthPayments.length,
      });
    }

    // Generate monthly doctors count data (last 12 months)
    const monthlyDoctors = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const doctorsUpToMonth = allDoctors.filter(
        (d) => d.createdAt <= monthEnd
      );
      
      monthlyDoctors.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: doctorsUpToMonth.length,
      });
    }

    // Generate monthly patients count data (last 12 months)
    const monthlyPatients = [];
    const patients = allUsers.filter(u => u.role === 'patient');
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const patientsUpToMonth = patients.filter(
        (p) => p.createdAt <= monthEnd
      );
      
      monthlyPatients.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: patientsUpToMonth.length,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        monthlySales,
        monthlyDoctors,
        monthlyPatients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

