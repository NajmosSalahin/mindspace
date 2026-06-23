# EventSphere — MERN Event Management Platform

A production-grade event management platform built with the MERN stack. Features ticketing, payments, QR check-in, real-time notifications, and role-based dashboards for users, organizers, and admins.

## Tech Stack

**Frontend:** React 18 + Vite, TailwindCSS, Framer Motion, Redux Toolkit + RTK Query, React Hook Form + Zod, React Router v6, Stripe Elements, Socket.io-client, Recharts, react-qr-code

**Backend:** Node.js + Express.js, MongoDB + Mongoose, JWT auth, Brevo (email), Cloudinary + Multer, Socket.io, Stripe, PDFKit

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account (test mode)
- SMTP email account (Ethereal for dev)

### 1. Clone & Install

```bash
# Server
cd server
cp .env.example .env
npm install

# Client
cd ../client
cp .env.example .env
npm install
```

### 2. Environment Variables

**Server `server/.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventsphere
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
CLIENT_URL=http://localhost:5173
```

**Client `client/.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Run

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Default Accounts (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@eventsphere.com | password123 |
| Organizer | organizer@eventsphere.com | password123 |
| User | user@eventsphere.com | password123 |

## Project Structure

```
├── client/              # React frontend
│   └── src/
│       ├── pages/       # All page components
│       ├── layouts/     # MainLayout, AuthLayout, DashboardLayout
│       ├── redux/       # Store, slices, RTK Query services
│       ├── services/    # Axios instance with interceptors
│       ├── routes/      # ProtectedRoute, role guards
│       ├── hooks/       # useSocket
│       ├── utils/       # formatters
│       └── constants/   # categories, roles, enums
└── server/              # Express backend
    ├── controllers/     # Route handlers
    ├── models/          # Mongoose schemas (14 models)
    ├── routes/          # Express routers (13 route groups)
    ├── middleware/      # auth, authorize, upload, validate, error handler
    ├── services/        # email, socket, cloudinary
    ├── config/          # db, cloudinary, stripe
    ├── utils/           # JWT tokens
    ├── validators/      # express-validator schemas
    └── scripts/         # seed.js (50 events, 20 users, 10 organizers)
```

## Features

- JWT auth with auto-refresh via Axios interceptors
- Email verification, password reset (Nodemailer)
- Stripe payment with webhooks
- QR code ticket generation and scanner check-in
- Real-time notifications (Socket.io)
- PDF certificate generation (PDFKit)
- Role-based dashboards (User / Organizer / Admin)
- Glassmorphism dark theme with Framer Motion animations
- Full-text search, filtering, pagination, sort
- Event creation wizard with multi-step form
- Coupon/discount system
- Waitlist management
- Review & rating system
- Survey creation with response analytics
- 90+ REST API endpoints
