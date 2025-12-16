# 📂 Project Structure Guide

This document provides a detailed map of the codebase to help new developers understand how the Doctor Review Management System is organized.

## 📋 Complete Project File Structure

```
DocAPP/
├── .gitignore
├── DEVELOPMENT_CHALLENGES_AND_SOLUTIONS.md
├── FUTURE_SCOPE.md
├── INSTALLATION_GUIDE.md
├── LIBRARY_USAGE_MAP.md
├── PAYMENT_APPROVAL_GUIDE.md
├── PROJECT_REPORT.md
├── PROJECT_STRUCTURE.md
├── README.md
├── SECURE_CREDENTIALS.txt.example
├── START_HERE.md
├── TRANSACTION_ID_FIX.md
├── VERIFICATION_CHECKLIST.md
│
├── client/
│   ├── SHADCN_SETUP.md
│   ├── components.json
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   │
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       │
│       ├── components/
│       │   ├── AIChatWidget.jsx
│       │   ├── AppointmentCard.jsx
│       │   ├── CitySelector.jsx
│       │   ├── ClinicSlideshow.jsx
│       │   ├── DoctorCard.jsx
│       │   ├── FavoriteButton.jsx
│       │   ├── FilterSidebar.jsx
│       │   ├── Footer.jsx
│       │   ├── Navbar.jsx
│       │   ├── PaymentModal.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RatingDistribution.jsx
│       │   ├── RescheduleModal.jsx
│       │   ├── ReviewCard.jsx
│       │   │
│       │   └── ui/
│       │       ├── accordion.jsx
│       │       ├── alert-dialog.jsx
│       │       ├── alert.jsx
│       │       ├── avatar.jsx
│       │       ├── badge.jsx
│       │       ├── button.jsx
│       │       ├── calendar.jsx
│       │       ├── card.jsx
│       │       ├── checkbox.jsx
│       │       ├── dialog.jsx
│       │       ├── dropdown-menu.jsx
│       │       ├── hover-card.jsx
│       │       ├── input.jsx
│       │       ├── label.jsx
│       │       ├── popover.jsx
│       │       ├── progress.jsx
│       │       ├── select.jsx
│       │       ├── separator.jsx
│       │       ├── sheet.jsx
│       │       ├── skeleton.jsx
│       │       ├── switch.jsx
│       │       ├── tabs.jsx
│       │       ├── textarea.jsx
│       │       ├── toast.jsx
│       │       ├── toaster.jsx
│       │       ├── tooltip.jsx
│       │       └── use-toast.js
│       │
│       ├── context/
│       │   ├── AppContext.jsx
│       │   └── ThemeContext.jsx
│       │
│       ├── lib/
│       │   └── utils.js
│       │
│       ├── pages/
│       │   ├── AboutUs.jsx
│       │   ├── ContactUs.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DoctorProfile.jsx
│       │   ├── Favorites.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── NotFound.jsx
│       │   ├── Profile.jsx
│       │   ├── Search.jsx
│       │   └── Signup.jsx
│       │
│       └── utils/
│           └── api.js
│
└── server/
    ├── index.js
    ├── list_models.js
    ├── models_list.txt
    ├── package.json
    ├── package-lock.json
    ├── seed.js
    ├── simulate_booking.js
    ├── test_context_verification.js
    ├── test_fallback_logic.js
    ├── test_gemini.js
    ├── test_gemini_2.js
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── adminController.js
    │   ├── analyticsController.js
    │   ├── appointmentController.js
    │   ├── authController.js
    │   ├── chatController.js
    │   ├── doctorController.js
    │   ├── favoriteController.js
    │   ├── notificationController.js
    │   ├── paymentController.js
    │   ├── reviewController.js
    │   └── userController.js
    │
    ├── middleware/
    │   └── auth.js
    │
    ├── models/
    │   ├── Appointment.js
    │   ├── Chat.js
    │   ├── Doctor.js
    │   ├── Favorite.js
    │   ├── Notification.js
    │   ├── Payment.js
    │   ├── Review.js
    │   └── User.js
    │
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── analyticsRoutes.js
    │   ├── appointmentRoutes.js
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   ├── doctorRoutes.js
    │   ├── favoriteRoutes.js
    │   ├── notificationRoutes.js
    │   ├── paymentRoutes.js
    │   ├── reviewRoutes.js
    │   └── userRoutes.js
    │
    ├── scripts/
    │   └── backfill_timestamps.js
    │
    └── utils/
        ├── emailService.js
        └── reminderService.js
```

---

## � Directory & File Descriptions

## �🖥️ Client (Frontend)

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
