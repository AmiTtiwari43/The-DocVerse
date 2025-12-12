# 📂 Project Structure Guide

This document provides a detailed map of the codebase to help new developers understand how the Doctor Review Management System is organized.

## 🏗️ Root Directory

- **`client/`**: React Frontend application
- **`server/`**: Node.js/Express Backend API
- **`README.md`**: Project overview and setup instructions
- **`PAYMENT_APPROVAL_GUIDE.md`**: Guide for the 2-step payment/appointment approval flow
- **`PROJECT_STRUCTURE.md`**: This file

---

## 🖥️ Client (Frontend)

Located in `client/src/`

### 📁 `pages/` (Main Views)
- **`Dashboard.jsx`**: The core hub for all users.
    - **Admin**: View/Approve payments (`adminApprovePayment`), manage users.
    - **Doctor**: View appointments, Approve/Reject requests (`confirmAppointment`, `cancelAppointment`).
    - **Patient**: View appointments, payment history.
- **`Home.jsx`**: Landing page with simple search.
- **`Login.jsx` / `Signup.jsx`**: Authentication pages.
- **`DoctorProfile.jsx`**: Detailed view of a doctor, including reviews and booking slot selection.
- **`VerifiedDoctors.jsx`**: Search results and list of verified doctors.

### 📁 `components/` (Reusable UI)
- **`Navbar.jsx`**: Main navigation.
- **`AppointmentCard.jsx`**: Displays individual appointment details.
- **`AIChatWidget.jsx`**: Floating AI assistant for health queries.
- **`ClinicSlideshow.jsx`**: Visual component for doctor profiles.

### 📁 `context/` (State Management)
- **`AppContext.jsx`**: Manages global state like User Authentication (`user`, `token`).

---

## ⚙️ Server (Backend)

Located in `server/`

### 📁 `controllers/` (Business Logic)
- **`appointmentController.js`**:
    - `createAppointment`: Books a slot (Status: Pending Payment).
    - `updateAppointmentStatus`: Handles Doctor confirmation (requires Admin Payment Approval).
    - `rescheduleAppointment`: logic for changing slots and sending "Booking Update" emails.
- **`paymentController.js`**:
    - `getUPIPaymentDetails`: Generates QR code.
    - `confirmUPIPayment`: Marks payment as 'Completed' (Gateway status).
    - `adminApprovePayment`: **Critical**: Admin verifies payment -> Email sent -> Allows Doctor to confirm.
- **`authController.js`**: Registration, Login, JWT generation.
- **`doctorController.js`**: Doctor profile management, search logic.

### 📁 `models/` (Database Schemas)
- **`Appointment.js`**: Links Doctor, Patient, and Payment. Tracks status.
- **`Payment.js`**: Tracks `amount`, `transactionId`, `status` (Gateway), and `adminStatus` (Approval).
- **`User.js`**: Base user account (Admin/Doctor/Patient).
- **`Doctor.js`**: Extended profile for doctors (specialization, fees, slots).

### 📁 `routes/` (API Endpoints)
- **`adminRoutes.js`**: Protected routes for Admin actions (Approvals).
- **`appointmentRoutes.js`**: Booking and status management.
- **`paymentRoutes.js`**: UPI flow and history.

### 📁 `utils/` (Helpers)
- **`emailService.js`**: Handles all email notifications.
    - `paymentVerifiedPatient`: Sends "Payment Receipt".
    - `appointmentRescheduled`: Sends "Booking Update".
    - `paymentVerifiedDoctor`: Notifies doctor to take action.

### 📄 Key Files
- **`index.js`**: Server entry point. Configures Middleware, Database, and Routes.
- **`.env`**: Configuration (DB URI, API Keys).

---

## 🔄 Key Workflows

### 1. Booking & Payment Flow
1. **Patient** books appointment -> `Appointment` created (Status: pending).
2. **Patient** pays via UPI -> `Payment` created (Status: completed, AdminStatus: pending).
3. **Admin** clicks "Approve" in Dashboard -> `Payment` updated (AdminStatus: approved).
    - Email: Payment Receipt sent to Patient.
4. **Doctor** sees "Approve" button (enabled by AdminStatus) -> Clicks Approve.
5. **Appointment** status -> confirmed.

### 2. Rescheduling
1. **Doctor/Patient** selects new slot.
2. `appointmentController.rescheduleAppointment` updates DB.
3. Email: "Booking Update" sent with new details.

---

## 🛠️ Developer Tips

- **Adding a new email?**: Add template to `utils/emailService.js` call it in the controller.
- **Modifying Dashboard?**: `Dashboard.jsx` is large; search for "ROLE_ADMIN" or "ROLE_DOCTOR" to find specific sections.
- **Testing Payments?**: Use the seeded Admin account (`admin@demo.com`) to approve payments.
