# 🏛️ GovScheme Intelligence Portal (Full-Stack MERN Application)

A modern, production-ready, full-stack **MERN (MongoDB, Express.js, React, Node.js)** platform designed for Indian citizens to discover government schemes, scholarships, eligibility-based recommendations, and government recruitment & competitive exam alerts.

---

## 🚀 Key Features

- **100% Pure MERN Stack**: Built completely with MongoDB, Express.js, React 19 (Vite), and Node.js.
- **Dual OTP Verification**: Secure 2-step onboarding requiring both Email OTP and SMS Phone OTP for citizen activation.
- **Returning User Instant Login**: Verified citizens log in instantly with Email/Phone + Password without repetitive OTP prompts.
- **AI-Powered Recommendation Engine**: Intelligently evaluates citizen demographic parameters (Age, Family Income, Occupation, Qualification, State, Category) to dynamically recommend eligible schemes.
- **Government Jobs & Competitive Exam Alerts**: Comprehensive portal for active recruitment (UPSC, SSC, PSU, Banking, Railways) and national entrance exams.
- **Bookmark & Saved Schemes Tracker**: Citizens can save and track government schemes with real-time database persistence.
- **SaaS Glassmorphic Aesthetics**: Modern dark-mode UI with smooth gradients, Lucide icons, and Framer Motion micro-animations.
- **Production Hardening**: Guarded with Helmet headers, Rate Limiting, Mongo Sanitization, XSS Protection, and JWT RBAC with background token refresh.

---

## 📁 Architecture Overview

```text
gov/
├── client/                     # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/         # SchemeCard, SchemeModal, Sidebar, Navbar
│   │   ├── context/            # AuthContext (State & Session management)
│   │   ├── pages/              # Dashboard, Recommended, Jobs/Exams, Saved, Profile, Auth
│   │   ├── services/           # Axios API instance with silent token refresh
│   │   ├── App.jsx             # React Router configuration
│   │   └── index.css           # Modern SaaS Design Tokens & Glassmorphism
├── server/                     # Node.js + Express Backend
│   ├── config/                 # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Scheme, Profile, and Portal controllers
│   ├── middlewares/            # Security (Helmet, Rate Limiter, XSS) & Auth JWT
│   ├── models/                 # User, UserProfile, Scheme, State, Category, Job, Exam
│   ├── routes/                 # Express API routes (/auth, /schemes, /profile, /portal)
│   ├── services/               # Recommendation Engine & OTP dispatch service
│   ├── seed.js                 # Realistic Database Seeder
│   └── server.js               # Express Server Entry Point
└── package.json                # Master scripts container
```

---

## 🛠️ Quick Start Guide

### 1. Seed the Database
Populate realistic Indian Government schemes, states, categories, jobs, exams, and demo verified accounts:
```bash
npm run seed
```

### 2. Start the Backend API (Port 5000)
```bash
npm run dev:server
```

### 3. Start the Frontend (Vite)
```bash
npm run dev:client
```

---

## 🔑 Demo Login Credentials

- **Email:** `citizen@gov.in`
- **Password:** `Password@123`
- **Verification Status:** Dual OTP Verified (Active)
