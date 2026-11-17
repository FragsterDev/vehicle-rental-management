# DriveEase — Vehicle Rental Management System

A production-ready, full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application designed for comprehensive vehicle fleet management, role-based customer and administrative workflows, automated rental duration and pricing calculations in **Indian Rupees (INR - ₹)**, date-based overdue tracking, a simulated Indian payment gateway (UPI, Cards, Net Banking), and automated corporate PDF tax invoice generation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Libraries & Dependencies](#libraries--dependencies)
5. [Folder Structure](#folder-structure)
6. [Architecture & Workflow](#architecture--workflow)
7. [Database Schemas & Models](#database-schemas--models)
8. [REST API Documentation](#rest-api-documentation)
9. [Pre-Configured Demo Credentials](#pre-configured-demo-credentials)
10. [Installation & Setup](#installation--setup)
11. [Safe Database Seeder](#safe-database-seeder)
12. [Security & Best Practices](#security--best-practices)
13. [Future Roadmap](#future-roadmap)

---

## Project Overview

**DriveEase** bridges the gap between vehicle rental providers and end customers. It provides a clean, distraction-free, minimalist user experience without emojis or cluttered UI elements.

- **For Customers**: Browse a live fleet of verified vehicles (Cars, SUVs, Bikes, Trucks, Vans), filter by category and availability, choose rental dates with live price calculation, complete transactions via a simulated payment gateway (UPI / Cards / Net Banking), monitor active rentals, return vehicles, and download print-ready PDF tax invoices.
- **For Fleet Administrators**: Maintain full inventory control (add new vehicles with live image preview and URL resolution, delete vehicles, inspect registration numbers), monitor all customer bookings across the business, identify overdue rentals, and issue administrative returns.

---

## Key Features

### 1. Role-Based Access Control (RBAC) & Authentication
- Secure user registration and login with **JSON Web Tokens (JWT)** and **bcryptjs** (10 salt rounds).
- Distinct roles: `user` (Customer) and `admin` (Fleet Manager).
- Protected API routes and role-guarded UI views.
- Automatic login upon registration and persistent session management via browser `localStorage`.
- One-click demo login buttons for evaluation.

### 2. Fleet Inventory Management (Admin)
- Add new vehicles with comprehensive metadata: Make (Brand), Model Name, unique Registration Number (e.g. `WB74BG8329`), Vehicle Category (`Car`, `Bike`, `SUV`, `Truck`, `Van`), Daily Rental Rate in `₹`, Fuel Type (`Petrol`, `Diesel`, `Electric`, `Hybrid`), Seating Capacity, Image URL, and Description.
- **Live Image Preview**: Visual thumbnail validation before saving.
- **Smart Image Link Resolver**: Automatically converts webpage/sharing links (Kommodo, Google Drive, Imgur) into direct image URLs before saving.
- Category-specific image fallbacks and hotlink protection (`referrerPolicy="no-referrer"`).
- Delete vehicle capability with confirmation guards.

### 3. Date-Based Rental & Automated Calculation
- Dynamic date picker for **Booking Date (Start)** and **Return Date (Deadline)**.
- Automated rental day calculation:
  $$\text{Duration (Days)} = \max\left(1, \left\lceil \frac{\text{Return Date} - \text{Booking Date}}{24 \times 60 \times 60 \times 1000} \right\rceil\right)$$
- Live pricing in Indian Rupees:
  $$\text{Total Amount} = \text{Duration (Days)} \times \text{Daily Rate (₹)}$$

### 4. Simulated Indian Payment Gateway
- Supports primary payment rails used in India:
  - **UPI**: Virtual Payment Address (`@okhdfcbank`, `@okaxis`, etc.) with one-click test fill.
  - **Debit / Credit Cards**: Card number, expiry, CVV with pre-filled test cards.
  - **Net Banking**: Major Indian banks (HDFC, SBI, ICICI, Axis, Kotak).
- Multi-phase simulated banking communication (*"Connecting to gateway..."* &rarr; *"Verifying with bank..."* &rarr; *"Payment authorized"*).
- Generates realistic production-style identifiers:
  - `paymentId`: e.g. `pay_sim_1731564938210_4912`
  - `orderId`: e.g. `order_sim_1731564938210`
- Instant post-payment digital receipt with all transaction metadata.

### 5. Automated Overdue Detection Engine
- Runs automatically whenever bookings are retrieved:
  $$\text{If } \text{status} = \text{'active'} \land \text{returnDate} < \text{Current Date} \implies \text{status} \leftarrow \text{'overdue'}$$
- Visual indicators in UI:
  - Prominent red **`OVERDUE`** status tag.
  - Late duration counter (e.g. `2 day(s) late`).
  - Row highlighting with high-visibility alert accents.
- Both active and overdue vehicles can be returned at any time, restoring fleet availability.

### 6. Corporate PDF Tax Invoice Generation
- Built with **`jspdf`** and **`jspdf-autotable`**.
- Official, print-ready corporate layout:
  - **Tax Invoice Header**: Company name, GSTIN (`29AABCU9603R1ZM`), CIN, registered address.
  - **Invoice Identifiers**: Invoice Number (`INV-...`), Payment ID, Order ID, Date of Issue.
  - **Billed To (Customer Details)**: Customer Name, Email ID, Phone Number.
  - **Vehicle Summary**: Make, Model, Category, Registration Number, Duration.
  - **Itemized Tax Breakdown**: Base Rental Value, Central GST (CGST @ 9%), State GST (SGST @ 9%), Total Paid in Full (in `Rs. / INR`).
  - **Acknowledgement**: Transaction reference, terms & conditions, system-generated authorized signatory notice.
- Downloadable with 1 click from:
  1. The checkout success modal.
  2. Customer **My Rentals** table.
  3. Administrator **All Bookings** table.

### 7. Minimalist User Experience
- Strict aesthetic: monochrome / neutral slate palette (`#0f172a`, `#64748b`, `#f8fafc`).
- **Zero emojis**: Uses clean typography, monospace registration badges, and structured layouts.
- Interactive brand logo: Clicking the logo resets filters and navigates to the home fleet catalog.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19** | Component-driven UI with modern hooks (`useState`, `useEffect`) |
| **Frontend Build Tool** | **Vite 8** | Lightning-fast HMR and production bundling |
| **Backend Runtime** | **Node.js (v18+)** | Asynchronous JavaScript runtime |
| **Backend Framework** | **Express.js (v5)** | REST API routing and middleware architecture |
| **Database** | **MongoDB Atlas** | Cloud NoSQL document database |
| **ODM** | **Mongoose (v9)** | Object Data Modeling schema validation and relationship mapping |
| **Authentication** | **JWT & bcryptjs** | Stateless JSON Web Tokens and salted password hashing |
| **Styling** | **Custom CSS3** | Responsive grid, flexbox layout, CSS variables (No bulky UI framework bloat) |

---

## Libraries & Dependencies

### Backend Dependencies (`server/vehicle-rental-management-backend`)

| Package | Version | Purpose |
|---|---|---|
| `express` | `^5.3.0` | Core web server framework for routing, requests, and middleware |
| `mongoose` | `^9.12.1` | MongoDB modeling, schema enforcement, validation, and population |
| `bcryptjs` | `^3.0.3` | Pure JavaScript implementation of bcrypt for secure password hashing |
| `jsonwebtoken` | `^9.0.3` | Generates and verifies signed JSON Web Tokens for authentication |
| `dotenv` | `^18.0.10` | Loads environment variables from `.env` into `process.env` |
| `cors` | `^2.8.6` | Configures Cross-Origin Resource Sharing for React frontend access |
| `nodemon` *(dev)* | `^3.1.14` | Monitors source code and automatically restarts the Node server |

### Frontend Dependencies (`client/vehicle-rental-management-frontend`)

| Package | Version | Purpose |
|---|---|---|
| `react` | `^19.3.1` | UI component library |
| `react-dom` | `^19.3.1` | React package for DOM rendering |
| `axios` | `^1.21.1` | Promise-based HTTP client with request interceptors for JWT bearer tokens |
| `jspdf` | `^4.2.1` | Client-side vector PDF generation library |
| `jspdf-autotable`| `^5.0.9` | Table plugin for jsPDF to render itemized financial tax invoices |
| `vite` *(dev)* | `^8.3.6` | Development server and production build bundler |
| `oxlint` *(dev)* | `^1.90.0` | High-performance JavaScript/JSX linter |

---

## Folder Structure

```
vehicle-rental-management-live/
├── .gitignore                                 # Root Git ignore rules (node_modules, .env, dist)
├── README.md                                  # Complete project documentation
│
├── server/
│   └── vehicle-rental-management-backend/
│       ├── middleware/
│       │   └── auth.js                        # JWT verification and Admin role-checking middleware
│       ├── models/
│       │   ├── User.js                        # Mongoose User schema (name, email, phone, password, role)
│       │   ├── Vehicle.js                     # Mongoose Vehicle schema (make, name, regNumber, price, etc.)
│       │   └── Booking.js                     # Mongoose Booking schema (dates, payment, IDs, status)
│       ├── routes/
│       │   ├── authRoutes.js                  # Authentication routes (/register, /login, /me)
│       │   ├── vehicleRoutes.js               # Vehicle fleet CRUD & smart image link resolver
│       │   └── bookingRoutes.js               # Rental bookings, returns, and overdue checking
│       ├── .env                               # Local secrets (MongoDB URI, JWT secret, Port) [Ignored]
│       ├── .env.example                       # Safe environment template with placeholder keys
│       ├── .gitignore                         # Server-specific Git ignore
│       ├── package.json                       # Backend scripts and dependencies
│       ├── seeder.js                          # Safe database seeder (seeds Admin, Users, and Fleet)
│       └── server.js                          # Express application entry point & MongoDB Atlas connection
│
└── client/
    └── vehicle-rental-management-frontend/
        ├── public/
        │   ├── favicon.svg                    # Application favicon
        │   └── icons.svg                      # Static vector assets
        ├── src/
        │   ├── assets/
        │   │   └── hero.png                   # Vehicle hero artwork
        │   ├── components/
        │   │   ├── AllBookings.jsx            # Admin view: all system rentals, IDs, & invoice downloads
        │   │   ├── AuthModal.jsx              # Sign In / Registration modal with demo quick-fill
        │   │   ├── FilterBar.jsx              # Search and category/status filter controls
        │   │   ├── MyRentals.jsx              # Customer view: active/overdue rentals & PDF invoices
        │   │   ├── Navbar.jsx                 # Top header with interactive brand logo & role badge
        │   │   ├── RentModal.jsx              # 3-step rental modal: dates, simulated gateway, receipt
        │   │   ├── VehicleCard.jsx            # Fleet card with registration tag, pricing, & actions
        │   │   └── VehicleForm.jsx            # Admin modal: add vehicle with live image preview
        │   ├── services/
        │   │   └── api.js                     # Centralized Axios instance with auto JWT header injection
        │   ├── utils/
        │   │   └── generateInvoice.js         # jsPDF corporate tax invoice generator
        │   ├── App.css                        # Complete minimalist styling (zero emojis, monochrome theme)
        │   ├── App.jsx                        # Root React component, state manager, & tab coordinator
        │   ├── index.css                      # Global CSS reset
        │   └── main.jsx                       # React DOM mounting entry point
        ├── .gitignore                         # Frontend-specific Git ignore
        ├── .oxlintrc.json                     # Linter configuration
        ├── index.html                         # Single page application HTML shell
        ├── package.json                       # Frontend scripts and dependencies
        └── vite.config.js                     # Vite build configuration
```

---

## Architecture & Workflow

### 1. Authentication Flow
```
User registers/logs in
       │
       ▼
Backend hashes password with bcrypt (on register) or verifies hash (on login)
       │
       ▼
Backend signs JWT: { id, name, email, role } (7-day validity)
       │
       ▼
Frontend stores JWT and user profile in browser localStorage
       │
       ▼
Axios Request Interceptor automatically attaches:
Header -> Authorization: Bearer <token> on every subsequent request
```

### 2. Rental Checkout & Payment Flow
```
1. Customer clicks "Rent Vehicle" on an available card
2. Selects Start Date & Return Date -> System computes days and Total Price (₹)
3. Clicks "Proceed to Payment" -> Opens Simulated Gateway (UPI / Card / Net Banking)
4. Clicks "Pay ₹X" -> Simulates banking authorization delay (1.3s)
5. Generates unique paymentId (pay_sim_...) and orderId (order_sim_...)
6. Sends POST /api/bookings to backend
7. Backend creates Booking record with paymentStatus: "paid" and marks Vehicle unavailable
8. Frontend renders Digital Receipt with instant "Download Invoice (PDF)" action
```

### 3. Automated Overdue Flow
```
Request to /api/bookings or /api/bookings/my-rentals
       │
       ▼
updateOverdueBookings() checks MongoDB:
status == "active" AND returnDate < now
       │
       ▼
Automatically updates matching records to status: "overdue"
       │
       ▼
Frontend displays red OVERDUE badge and "X day(s) late" tag
```

---

## Database Schemas & Models

### 1. User Model (`models/User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim | Full name of the user |
| `email` | String | Required, Unique, Lowercase, Trim | Account email address |
| `phone` | String | Required, Trim | Contact phone number |
| `password` | String | Required, Min length 6 | Salted bcrypt hash |
| `role` | String | Enum: `['user', 'admin']`, Default: `'user'` | Access level |
| `timestamps` | Date | Auto (`createdAt`, `updatedAt`) | Audit trail |

### 2. Vehicle Model (`models/Vehicle.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `make` | String | Required, Trim | Brand manufacturer (e.g. Maruti Suzuki, Tesla) |
| `name` | String | Required, Trim | Model name (e.g. WagonR, Model 3) |
| `regNumber` | String | Required, Unique, Uppercase, Trim | Vehicle registration plate (e.g. `WB74BG8329`) |
| `type` | String | Enum: `['Car', 'Bike', 'SUV', 'Truck', 'Van']` | Category |
| `pricePerDay` | Number | Required, Min: 0 | Daily rental rate in Indian Rupees (`₹`) |
| `fuelType` | String | Enum: `['Petrol', 'Diesel', 'Electric', 'Hybrid']` | Engine fuel type |
| `seatingCapacity`| Number | Default: `4` | Number of passenger seats |
| `isAvailable` | Boolean | Default: `true` | Fleet availability status |
| `image` | String | Default: fallback URL | Direct URL to vehicle image |
| `description` | String | Trim | Condition notes and vehicle specs |
| `timestamps` | Date | Auto (`createdAt`, `updatedAt`) | Audit trail |

### 3. Booking Model (`models/Booking.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `user` | ObjectId | Ref: `'User'`, Required | Reference to customer who booked |
| `vehicle` | ObjectId | Ref: `'Vehicle'`, Required | Reference to rented vehicle |
| `bookingDate` | Date | Required, Default: `Date.now` | Rental start date |
| `returnDate` | Date | Required | Scheduled return deadline |
| `actualReturnDate`| Date | Optional | Actual date vehicle was returned |
| `days` | Number | Required, Min: 1 | Duration of rental |
| `totalPrice` | Number | Required | Total amount billed in `₹` |
| `status` | String | Enum: `['active', 'returned', 'overdue']` | Current rental lifecycle status |
| `paymentStatus`| String | Enum: `['paid', 'pending', 'refunded']`, Default: `'paid'` | Transaction payment state |
| `paymentMethod`| String | Default: `'UPI'` | Method used (UPI, Card, Net Banking) |
| `paymentId` | String | Indexed | Unique payment identifier (`pay_sim_...`) |
| `orderId` | String | Indexed | Unique order identifier (`order_sim_...`) |
| `timestamps` | Date | Auto (`createdAt`, `updatedAt`) | Audit trail |

---

## REST API Documentation

### Base URL: `http://localhost:3000/api`

### 1. Authentication Endpoints (`/auth`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ name, email, phone, password, role? }` | Registers a new user with bcrypt-hashed password |
| `POST` | `/auth/login` | Public | `{ email, password }` | Authenticates credentials and returns JWT token |
| `GET` | `/auth/me` | Authenticated | Bearer Token in Header | Retrieves the current user's profile |

### 2. Vehicle Fleet Endpoints (`/vehicles`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/vehicles` | Public | Query: `?type=Car&available=true&search=wagon` | Lists all vehicles with optional filters |
| `GET` | `/vehicles/:id` | Public | Path: `:id` | Fetches details for a single vehicle |
| `POST` | `/vehicles` | **Admin Only** | `{ make, name, regNumber, type, pricePerDay, image, fuelType, seatingCapacity, description }` | Adds a new vehicle (resolves image URL) |
| `PUT` | `/vehicles/:id` | **Admin Only** | Updated fields in Body | Updates vehicle specifications |
| `DELETE` | `/vehicles/:id` | **Admin Only** | Path: `:id` | Removes vehicle from inventory |

### 3. Booking & Rental Endpoints (`/bookings`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/bookings` | Authenticated | `{ vehicleId, bookingDate, returnDate, days, paymentMethod, paymentId, orderId }` | Books a vehicle and sets `isAvailable: false` |
| `GET` | `/bookings/my-rentals` | Authenticated | Bearer Token | Returns logged-in user's rental history with user details |
| `GET` | `/bookings` | **Admin Only** | Bearer Token | Returns all customer bookings across the business |
| `PATCH`| `/bookings/:id/return`| Authenticated | Path: `:id` | Marks vehicle as returned, sets `actualReturnDate`, and restores vehicle availability |

---

## Pre-Configured Demo Credentials

The database seeder pre-populates two accounts with hashed passwords:

| Role | Name | Email | Password | Phone | Permissions |
|---|---|---|---|---|---|
| **Admin** | System Admin | `admin@rental.com` | `admin123` | `9876543210` | Full fleet control, add/delete cars, view all customer bookings, return any vehicle |
| **User** | John Doe | `john@example.com` | `user123` | `9123456780` | Browse vehicles, rent cars, simulated payment checkout, view personal rentals, download invoices |

> **Convenience**: In the Sign In modal, click **Fill Admin** or **Fill User** to instantly test each role.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd vehicle-rental-management-live
```

---

### Step 2: Configure Environment Variables

Navigate to the backend directory:
```bash
cd server/vehicle-rental-management-backend
```

Create a `.env` file based on `.env.example`:
```env
# Database connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/

# Backend Port
PORT=3000

# JSON Web Token Secret
JWT_SECRET=your_jwt_secret_key_here
```

---

### Step 3: Install Dependencies

#### Install Backend Packages:
```bash
cd server/vehicle-rental-management-backend
npm install
```

#### Install Frontend Packages:
```bash
cd ../../client/vehicle-rental-management-frontend
npm install
```

---

### Step 4: Seed Initial Data (Safe Mode)
Populate the initial demo accounts, fleet, and test bookings without deleting custom data:
```bash
cd server/vehicle-rental-management-backend
npm run seed
```

---

### Step 5: Start Development Servers

#### Terminal 1 — Start Node/Express Backend:
```bash
cd server/vehicle-rental-management-backend
npm run dev
```
*Server starts on: `http://localhost:3000`*

#### Terminal 2 — Start React/Vite Frontend:
```bash
cd client/vehicle-rental-management-frontend
npm run dev
```
*Client starts on: `http://localhost:5173`*

Open **`http://localhost:5173`** in your browser.

---

## Safe Database Seeder

The seeder ([seeder.js](file:///c:/Users/om190/OneDrive/Documents/Programming%20Workspace/Working/vehicle-rental-management-live/server/vehicle-rental-management-backend/seeder.js)) operates in **Safe Mode** by default:
- It checks if users or vehicles already exist (`findOne({ email })`, `findOne({ regNumber })`).
- If an item already exists, it **preserves** it. It **never** touches your custom bookings or newly registered vehicles.
- To perform a complete, clean wipe and reset of the database, supply the explicit `--reset` flag:
  ```bash
  node seeder.js --reset
  ```

---

## Security & Best Practices

1. **Zero Credential Leaks**:
   - Both root and subfolder `.gitignore` files guard `.env`, preventing connection strings or private keys from being staged in Git.
   - A sanitized `.env.example` is provided for configuration.
2. **Password Cryptography**:
   - Raw passwords are never stored in plaintext. Passwords are salted and hashed with `bcryptjs`.
3. **Stateless JWT Authorization**:
   - Requests to protected routes require a `Bearer <token>` Authorization header verified by `verifyToken` middleware.
4. **Data Isolation**:
   - Customers can only view and return their own bookings.
   - Administrative actions (adding cars, deleting cars, auditing all customer bookings) require `verifyAdmin` validation.
5. **Hotlink Defense**:
   - `referrerPolicy="no-referrer"` is enforced on all external images to prevent third-party hosts from blocking local dev requests.

---

## Future Roadmap

- [ ] **Live Razorpay Webhook Listener**: Transition from simulated mode to production Razorpay keys with automated webhook verification (`payment.captured`).
- [ ] **Cloudinary / AWS S3 Integration**: Direct image file upload support in the Add Vehicle form.
- [ ] **Automated Email / SMS Receipts**: Integration with Twilio / SendGrid to dispatch invoices directly to customer phones and inboxes.
- [ ] **GPS & Odometer Tracking**: Track vehicle mileage and fuel percentage at the time of pickup and return.

---

## License

This project is licensed under the [ISC License](LICENSE).
