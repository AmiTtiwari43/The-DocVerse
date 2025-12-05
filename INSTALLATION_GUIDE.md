# 📦 Installation & Setup Guide
## Doctor Review Management System

This is a comprehensive, step-by-step guide to install, configure, and run the Doctor Review Management System from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installing Dependencies](#installing-dependencies)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Seeding Demo Data](#seeding-demo-data)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | How to Check | Download |
|----------|----------------|--------------|----------|
| **Node.js** | v14.0.0 or higher | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | v6.0.0 or higher | `npm --version` | (Comes with Node.js) |
| **MongoDB Atlas Account** | - | - | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) |
| **Git** (Optional) | Latest | `git --version` | [git-scm.com](https://git-scm.com/) |

### Required Accounts & Services

1. **MongoDB Atlas** (Free tier available)
   - Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string

2. **SendGrid** (For email notifications - Free tier available)
   - Create account at [sendgrid.com](https://sendgrid.com/)
   - Generate API key
   - Verify sender email

3. **UPI ID** (For payment QR codes)
   - Your UPI ID (e.g., `yourname@paytm`)

---

## 🚀 Initial Setup

### Step 1: Extract/Clone the Project

If you have the project as a ZIP file:
```bash
# Extract the ZIP file to your desired location
# Example: C:\Users\YourName\Projects\Doctor-Review-Management-System-main
```

If you have it from Git:
```bash
git clone <repository-url>
cd Doctor-Review-Management-System-main
```

### Step 2: Verify Project Structure

Ensure your project has the following structure:
```
Doctor-Review-Management-System-main/
├── client/              # Frontend React application
│   ├── src/
│   ├── package.json
│   └── ...
├── server/              # Backend Node.js application
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── ...
└── README.md
```

---

## ⚙️ Environment Configuration

### Step 1: Create Backend Environment File

Navigate to the `server` directory and create a `.env` file:

```bash
cd server
```

Create a new file named `.env` with the following content:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# JWT Secret (Generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_long

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Service Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Payment Configuration
UPI_ID=yourname@paytm
```

**Important Notes:**
- Replace `MONGO_URI` with your actual MongoDB Atlas connection string
- Replace `JWT_SECRET` with a strong random string (minimum 32 characters)
- Replace `SENDGRID_API_KEY` with your SendGrid API key
- Replace `UPI_ID` with your actual UPI ID

### Step 2: Create Frontend Environment File

Navigate to the `client` directory and create a `.env` file:

```bash
cd ../client
```

Create a new file named `.env` with the following content:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Note:** The `VITE_` prefix is required for Vite to expose the variable to the frontend.

### Step 3: Generate JWT Secret (If Needed)

If you need to generate a secure JWT secret, you can use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` in `server/.env`.

---

## 📥 Installing Dependencies

### Step 1: Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install all dependencies
npm install
```

**Expected Output:**
```
added 150 packages, and audited 151 packages in 30s
```

**What gets installed:**
- Express.js (Web framework)
- Mongoose (MongoDB ODM)
- JWT (Authentication)
- bcryptjs (Password hashing)
- SendGrid (Email service)
- And 20+ other dependencies

### Step 2: Install Frontend Dependencies

```bash
# Navigate to client directory
cd ../client

# Install all dependencies
npm install
```

**Expected Output:**
```
added 200 packages, and audited 201 packages in 45s
```

**What gets installed:**
- React & React DOM
- Vite (Build tool)
- Tailwind CSS
- Shadcn/UI components
- React Router
- Axios
- And 30+ other dependencies

**Installation Time:** 
- Backend: ~30-60 seconds
- Frontend: ~45-90 seconds
- **Total: ~2-3 minutes**

---

## 🗄️ Database Setup

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new project

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `doctorreview` (or your choice)
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (optional)

**Example Connection String:**
```
mongodb+srv://doctorreview:YourPassword123@cluster0.xxxxx.mongodb.net/doctorreview?retryWrites=true&w=majority
```

6. **Update server/.env**
   - Paste the connection string as `MONGO_URI` in `server/.env`

---

## 🏃 Running the Application

### Step 1: Start Backend Server

Open **Terminal 1** (or Command Prompt):

```bash
# Navigate to server directory
cd server

# Start the server
npm start
```

**Expected Output:**
```
MongoDB connected successfully
Server running on port 5000
```

**If you see errors:**
- Check MongoDB connection string in `.env`
- Verify internet connection
- Check if port 5000 is available

**For Development (with auto-reload):**
```bash
npm run dev
```
This uses `nodemon` to automatically restart the server on file changes.

### Step 2: Start Frontend Development Server

Open **Terminal 2** (new terminal window):

```bash
# Navigate to client directory
cd client

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3: Access the Application

Open your web browser and navigate to:

**Frontend Application:**
```
http://localhost:5173
```

**Backend API:**
```
http://localhost:5000/api
```

**Health Check:**
```
http://localhost:5000/api/health
```

You should see the homepage of the Doctor Review Management System!

---

## 🌱 Seeding Demo Data

To populate the database with sample data (doctors, patients, appointments, reviews):

### Step 1: Run Seed Script

```bash
# Make sure backend server is running first
# Then in a new terminal:

cd server
node seed.js
```

**Expected Output:**
```
Database seeded successfully!
- 1 Admin user created
- 11 Doctors created
- 11 Patients created
- Reviews and appointments created
```

### Step 2: Verify Seeded Data

After seeding, you can log in with these demo accounts:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `admin123`

**Doctor Account:**
- Email: `doctor@demo.com`
- Password: `doctor123`

**Patient Account:**
- Email: `patient@demo.com`
- Password: `patient123`

**What Gets Created:**
- ✅ 1 Admin user
- ✅ 11 Doctor profiles (various specializations, some verified, some pending)
- ✅ 11 Patient users
- ✅ Sample reviews with ratings
- ✅ Sample appointments (past and future)
- ✅ Sample payments linked to appointments

---

## ✅ Verification & Testing

### Test 1: Backend Health Check

```bash
# Using curl (if available)
curl http://localhost:5000/api/health

# Or open in browser
# http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test 2: MongoDB Connection

Check the terminal where the backend server is running. You should see:
```
MongoDB connected successfully
```

If you see an error, check:
- MongoDB connection string in `server/.env`
- Internet connection
- MongoDB Atlas IP whitelist

### Test 3: Frontend Loading

1. Open browser: `http://localhost:5173`
2. You should see the homepage
3. Check browser console (F12) for any errors

### Test 4: User Registration

1. Click "Sign Up" on the homepage
2. Fill in the registration form
3. Submit and verify you're redirected to dashboard

### Test 5: Database Connection

1. Log in with demo credentials
2. Navigate to "Search" page
3. You should see doctor profiles (if seeded)

---

## 🔧 Troubleshooting

### Problem 1: MongoDB Connection Error

**Error Message:**
```
MongoServerError: Authentication failed
```

**Solutions:**
1. ✅ Check username and password in connection string
2. ✅ Verify database user exists in MongoDB Atlas
3. ✅ Check IP whitelist in MongoDB Atlas
4. ✅ Ensure connection string format is correct
5. ✅ Try regenerating database user password

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
```

### Problem 2: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option A: Kill the process using the port**
```bash
# Windows (PowerShell)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Option B: Change the port**
1. Edit `server/.env`
2. Change `PORT=5000` to `PORT=5001`
3. Update `client/.env`: `VITE_API_URL=http://localhost:5001/api`
4. Restart both servers

### Problem 3: Module Not Found

**Error Message:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Navigate to the directory with package.json
cd server  # or cd client

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall dependencies
npm install
```

### Problem 4: Frontend Not Loading

**Error Message:**
```
Failed to fetch
```

**Solutions:**
1. ✅ Verify backend server is running on port 5000
2. ✅ Check `client/.env` has correct `VITE_API_URL`
3. ✅ Restart frontend dev server after changing `.env`
4. ✅ Check browser console for CORS errors
5. ✅ Verify `CLIENT_URL` in `server/.env` matches frontend URL

### Problem 5: SendGrid Email Not Working

**Error Message:**
```
Unauthorized
```

**Solutions:**
1. ✅ Verify API key in SendGrid dashboard
2. ✅ Check API key is correctly set in `server/.env`
3. ✅ Verify sender email is verified in SendGrid
4. ✅ Check SendGrid account status (not suspended)

**To Verify Sender Email:**
1. Go to SendGrid Dashboard
2. Navigate to "Settings" → "Sender Authentication"
3. Verify your sender email address

### Problem 6: QR Code Not Displaying

**Error Message:**
```
QR Code component not found
```

**Solutions:**
1. ✅ Verify `qrcode.react` is installed:
   ```bash
   cd client
   npm list qrcode.react
   ```
2. ✅ If not installed:
   ```bash
   npm install qrcode.react
   ```
3. ✅ Check browser console for errors
4. ✅ Clear browser cache and reload

### Problem 7: Dependencies Installation Fails

**Error Message:**
```
npm ERR! code ERESOLVE
```

**Solutions:**
1. ✅ Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. ✅ Delete `node_modules` and `package-lock.json`
3. ✅ Try installing with legacy peer deps:
   ```bash
   npm install --legacy-peer-deps
   ```
4. ✅ Update npm:
   ```bash
   npm install -g npm@latest
   ```

### Problem 8: Environment Variables Not Loading

**Symptoms:**
- `undefined` values in code
- Connection errors

**Solutions:**
1. ✅ Verify `.env` files are in correct directories:
   - `server/.env` (not `server/env` or `.env.server`)
   - `client/.env` (not `client/env` or `.env.client`)
2. ✅ Check for typos in variable names
3. ✅ Restart servers after changing `.env` files
4. ✅ For frontend: Ensure variables start with `VITE_`

---

## 🚀 Production Deployment

### Backend Deployment (Example: Heroku/Railway)

1. **Prepare for Production:**
   ```bash
   # Update server/.env
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Deploy:**
   - Push code to Git repository
   - Connect to hosting platform
   - Set environment variables in platform dashboard
   - Deploy

### Frontend Deployment (Example: Vercel/Netlify)

1. **Build for Production:**
   ```bash
   cd client
   npm run build
   ```

2. **Update Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend-api.com/api
   ```

3. **Deploy:**
   - Connect Git repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secure JWT secret (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB Atlas production cluster
- [ ] Configure SendGrid production sender
- [ ] Set up error logging/monitoring
- [ ] Enable rate limiting
- [ ] Set up automated backups
- [ ] Configure domain and SSL certificates

---

## 📊 Quick Reference

### Common Commands

| Task | Command |
|------|---------|
| **Install Backend Dependencies** | `cd server && npm install` |
| **Install Frontend Dependencies** | `cd client && npm install` |
| **Start Backend** | `cd server && npm start` |
| **Start Backend (Dev)** | `cd server && npm run dev` |
| **Start Frontend** | `cd client && npm run dev` |
| **Build Frontend** | `cd client && npm run build` |
| **Seed Database** | `cd server && node seed.js` |

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Frontend | 5173 | http://localhost:5173 |

### Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Doctor | doctor@demo.com | doctor123 |
| Patient | patient@demo.com | patient123 |

---

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. **Check Logs:**
   - Backend: Terminal where `npm start` is running
   - Frontend: Browser console (F12)

2. **Verify Configuration:**
   - All `.env` files are correctly set up
   - Dependencies are installed
   - Ports are available

3. **Review Documentation:**
   - `README.md` - Project overview
   - `START_HERE.md` - Quick start guide
   - `PROJECT_REPORT.md` - Technical details

---

## ✅ Installation Complete!

Once you've completed all steps and verified the application is running:

1. ✅ Backend server running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ MongoDB connected
4. ✅ Can access application in browser
5. ✅ Can log in with demo credentials

**You're ready to start using the Doctor Review Management System! 🎉**

---

**Last Updated:** $(date)
**Version:** 1.0.0

