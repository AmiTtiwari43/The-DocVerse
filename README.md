# 🏥 Doctor Review Management System

A comprehensive full-stack platform for doctor reviews, appointments, and health recommendations built with MERN stack.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

2. **Environment Setup**

The `.env` files are already configured! If you need to recreate them:

**`server/.env`:**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
UPI_ID=your_upi_id
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start the Application**

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🌱 Seed Database (Optional)

To populate with demo data:
```bash
cd server
node seed.js
```

**Demo Credentials:**
- Admin: `admin@demo.com` / `admin123`
- Doctor: `doctor@demo.com` / `doctor123`
- Patient: `patient@demo.com` / `patient123`

## ✨ Features

- ✅ User Authentication & Authorization (JWT)
- ✅ Doctor Registration & Verification
- ✅ Appointment Booking System
- ✅ Review & Rating System
- ✅ UPI QR Code Payment Integration
- ✅ 2-Step Payment & Appointment Approval
- ✅ Detailed Digital Booking Receipts
- ✅ Email Notifications (SendGrid)
- ✅ Favorites/Wishlist
- ✅ Admin Dashboard
- ✅ Analytics & Reports
- ✅ AI Health Assistant
- ✅ Advanced Search & Filtering
- ✅ Dark Mode Support

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Shadcn/UI Components
- React Router
- Axios
- Lucide React Icons

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- SendGrid (Email)
- Nodemailer

## 📁 Project Structure

```
Doctor-Review-Management-System-main/
├── server/              # Backend
│   ├── .env            # Environment variables
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/    # Business logic
│   └── utils/           # Utilities
│
└── client/              # Frontend
    ├── .env            # Environment variables
    ├── src/
    │   ├── pages/      # Page components
    │   ├── components/ # Reusable components
    │   └── context/    # React contexts
```

## 🔐 Security

- All `.env` files are in `.gitignore`
- JWT tokens stored in HttpOnly cookies
- Password hashing with bcryptjs
- CORS configured for security

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors` - Get all doctors (with filters)
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors` - Create doctor profile
- `PATCH /api/doctors` - Update doctor profile

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule

### Reviews
- `GET /api/reviews/doctor/:id` - Get doctor reviews
- `POST /api/reviews` - Add review
- `POST /api/reviews/:reviewId/reply` - Reply to review

### Payments
- `POST /api/payments/upi/get-details` - Get UPI payment details
- `POST /api/payments/upi/confirm` - Confirm UPI payment
- `GET /api/payments/history` - Get payment history

## 🆘 Troubleshooting

### MongoDB Connection Error
- Check internet connection
- Verify MongoDB Atlas IP whitelist
- Check connection string in `server/.env`

### Port Already in Use
- Change `PORT` in `server/.env`
- Or kill process using port 5000/5173

### Email Not Sending
- Verify SendGrid API key
- Check SendGrid dashboard
- Verify sender email

## 📚 Documentation

- **`START_HERE.md`** - Detailed quick start guide
- **`SECURE_CREDENTIALS.txt`** - Backup of credentials (keep secure!)

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

For development with auto-reload:
```bash
# Backend
cd server
npm run dev  # Uses nodemon

# Frontend
cd client
npm run dev  # Vite dev server
```

---

**Happy coding! 🚀**
