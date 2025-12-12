# 🗺️ Library Usage Map

This document maps the major libraries used in the project to their specific implementation locations. It is designed to help new developers quickly locate **where** and **why** a library is used.

## 🖥️ Client Side (Frontend)

### Core Frameworks
| Library | Purpose | Key Locations & Usage |
| :--- | :--- | :--- |
| **React** | Core library | Used everywhere (`.jsx` files) |
| **Vite** | Build tool | `vite.config.js` |
| **Tailwind CSS** | Styling | `tailwind.config.js`, `index.css`, Classes in `ClassName=""` |
| **React Router** | Routing | `App.jsx`, `main.jsx` |

### UI & Interaction
| Library | Purpose | Key Locations & Usage |
| :--- | :--- | :--- |
| **Shadcn UI** | Reusable Components | `client/src/components/ui/*.jsx` (Buttons, Dialogs, Toasts, etc.) |
| **Framer Motion** | Animations | `client/src/pages/*.jsx` (Route transitions), `AIChatWidget.jsx`, `Navbar.jsx` |
| **Lucide React** | Icons | Used in almost every component (e.g., `Heart`, `User`, `Calendar` icons) |
| **Qrcode.react** | QR Code Generation | `client/src/components/PaymentModal.jsx` |

### Data Data & State
| Library | Purpose | Key Locations & Usage |
| :--- | :--- | :--- |
| **Axios** | HTTP Client | `client/src/pages/*.jsx` (API calls to server) |
| **Chart.js** | Data Visualization | `client/src/pages/Dashboard.jsx` (Admin Analytics charts) |
| **React Hook Form** | Form Management | Not primarily used (Forms often use controlled inputs), but installed for future use. |
| **Zod** | Schema Validation | `client/src/lib/utils.js` (Helper validations) |

---

## ⚙️ Server Side (Backend)

### Core Runtime
| Library | Purpose | Key Locations & Usage |
| :--- | :--- | :--- |
| **Node.js & Express** | Web Server Framework | `server/index.js`, `server/routes/*.js` |
| **Mongoose** | MongoDB Object Modeling | `server/models/*.js` (Schemas), `server/controllers/*.js` (DB Queries) |
| **Dotenv** | Env Var Management | `server/config/db.js`, `server/index.js` |

### Utilities & Services
| Library | Purpose | Key Locations & Usage |
| :--- | :--- | :--- |
| **SendGrid** | Email Service | `server/utils/emailService.js` (Sending receipts, confirmations) |
| **Bcryptjs** | Password Hashing | `server/models/User.js` (Pre-save hook), `server/controllers/authController.js` |
| **JsonWebToken** | Authentication | `server/controllers/authController.js` (Generate token), `server/middleware/authMiddleware.js` (Verify) |
| **Multer** | File Uploads | `server/routes/doctorRoutes.js` (Profile image uploads) |
| **Cors** | Cross-Origin Policy | `server/index.js` |

---

## 🔍 How to Find More Usages

If you need to find every occurrence of a library:

1.  **VS Code Search**: `Ctrl + Shift + F`
2.  **Type**: `import ... from 'library-name'`
3.  **Example**: `import { motion } from 'framer-motion'` to see all animated components.
