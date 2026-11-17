# DriveEase — Vehicle Rental Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for vehicle rental and fleet management. It features doorstep vehicle delivery to the customer's address, role-based access for customers and admins, rental duration and pricing calculation in INR (₹), a simulated payment flow (UPI, Card, Net Banking), a 24-hour return grace period policy with automated overdue charges, an admin notification center, and itemized PDF tax invoices.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Libraries & Dependencies](#libraries--dependencies)
4. [Folder Structure](#folder-structure)
5. [Architecture & Workflow](#architecture--workflow)
6. [Database Schemas & Models](#database-schemas--models)
7. [REST API Documentation](#rest-api-documentation)
8. [Demo Credentials](#demo-credentials)
9. [Installation & Setup](#installation--setup)
10. [Database Seeder](#safe-database-seeder)

---

## Features

- **Authentication & Roles**: JWT-based authentication with bcrypt password hashing. Separate permissions and views for customers (`user`) and fleet managers (`admin`).
- **Doorstep Vehicle Delivery**: Customers specify or confirm their delivery address during booking so the admin can deliver and dispatch the vehicle directly to their location.
- **Fleet Inventory Management**: Admins can add new vehicles, edit existing vehicle specifications (specs, rates, image, and availability), toggle rental availability (Available / Unavailable) with 1 click, and delete vehicles from the fleet.
- **Rental Booking & Pricing**: Select start and return dates with automatic calculation of rental duration and total price in Indian Rupees (`₹`).
- **Simulated Payment Gateway**: Checkout flow supporting UPI, Debit/Credit Card, and Net Banking options, generating simulated order and payment IDs.
- **24-Hour Grace Period & Overdue Charges**: Vehicles returned within 24 hours of the due date incur no penalty. If not returned within 24 hours, daily rental charges apply for every overdue day.
- **Admin In-App Notifications**: Notification bell in the navigation bar with an unread badge counter, alerting the admin when new bookings are placed or vehicles are returned.
- **Itemized PDF Invoices**: Downloadable PDF tax invoice with customer delivery address, vehicle specs, GST breakdown, and itemized overdue charges.
- **Minimalist UI**: Clean, responsive layout without emojis or clutter, including category filters and search.

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
│       │   ├── User.js                        # User schema (name, email, phone, address, password, role)
│       │   ├── Vehicle.js                     # Vehicle schema (make, name, regNumber, price, etc.)
│       │   ├── Booking.js                     # Booking schema (dates, delivery address, overdue fee, IDs)
│       │   └── Notification.js                # In-app notifications for Admin (new bookings, returns)
│       ├── routes/
│       │   ├── authRoutes.js                  # Authentication routes (/register, /login, /me)
│       │   ├── vehicleRoutes.js               # Vehicle fleet CRUD & smart image link resolver
│       │   ├── bookingRoutes.js               # Rental bookings, returns, and overdue tracking
│       │   └── notificationRoutes.js          # Admin notification center endpoints
│       ├── .env                               # Local secrets (MongoDB URI, JWT secret, Port) [Ignored]
│       ├── .env.example                       # Safe environment template with placeholder keys
│       ├── .gitignore                         # Server-specific Git ignore
│       ├── package.json                       # Backend scripts and dependencies
│       ├── seeder.js                          # Safe database seeder (seeds Admin, Users, Fleet, and Bookings)
│       └── server.js                          # Express entry point & MongoDB Atlas connection
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
        │   │   ├── AllBookings.jsx            # Admin view: all bookings, delivery addresses & overdue fees
        │   │   ├── AuthModal.jsx              # Sign In / Registration modal with address input & demo fill
        │   │   ├── FilterBar.jsx              # Search and category/status filter controls
        │   │   ├── MyRentals.jsx              # Customer view: active/overdue rentals, delivery info & invoices
        │   │   ├── Navbar.jsx                 # Top header with brand logo, role badge & notification bell
        │   │   ├── NotificationDropdown.jsx   # Admin notification drawer with unread counter
        │   │   ├── RentModal.jsx              # 3-step rental modal: dates & delivery address, payment, receipt
        │   │   ├── VehicleCard.jsx            # Fleet card with registration tag, pricing, & actions
        │   │   └── VehicleForm.jsx            # Admin modal: add vehicle with live image preview
        │   ├── services/
        │   │   └── api.js                     # Centralized Axios instance with auto JWT header injection
        │   ├── utils/
        │   │   ├── generateInvoice.js         # jsPDF tax invoice generator with delivery & overdue details
        │   │   └── overdueUtils.js            # 24-hour return grace period & overdue fee calculation logic
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

### 2. Rental Checkout & Doorstep Delivery Flow
```
1. Customer clicks "Rent Vehicle" on an available fleet card
2. Selects Start Date & Return Date -> System computes rental days and Total Price (₹)
3. Enters or confirms Doorstep Delivery Address for vehicle drop-off
4. Clicks "Proceed to Payment" -> Opens Simulated Gateway (UPI / Card / Net Banking)
5. Clicks "Pay ₹X" -> Simulates banking authorization delay (1.3s)
6. Generates unique paymentId (pay_sim_...) and orderId (order_sim_...)
7. Sends POST /api/bookings with dates, payment IDs, and deliveryAddress
8. Backend saves booking, sets vehicle unavailable, and creates an Admin Notification
9. Frontend renders Digital Receipt with instant "Download Invoice (PDF)" action
```

### 3. Overdue & 24-Hour Return Policy Flow
```
Request to /api/bookings or /api/bookings/my-rentals
       │
       ▼
updateOverdueBookings() marks overdue:
status == "active" AND returnDate < now -> status: "overdue"
       │
       ▼
Evaluates 24-Hour Grace Period:
• Returned within 24h of due date: Grace period active, ₹0 overdue penalty
• Not returned within 24h: Overdue Fee = Overdue Days × Daily Rental Rate
       │
       ▼
UI displays red OVERDUE badge and days late; PDF invoices itemize exact penalty
```

### 4. Admin Notification Flow
```
Customer books vehicle or returns rental
       │
       ▼
Backend creates Notification record with customer name and delivery address
       │
       ▼
Admin Navbar bell icon updates unread badge counter (auto-polled every 15s)
       │
       ▼
Admin clicks notification to view delivery drop-off details and jump to All Bookings
```

---

## Database Schemas & Models

### 1. User Model (`models/User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim | Full name of the user |
| `email` | String | Required, Unique, Lowercase, Trim | Account email address |
| `phone` | String | Required, Trim | Contact phone number |
| `address` | String | Trim, Optional | Default delivery address for vehicle drop-off |
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
| `deliveryAddress` | String | Trim | Address where admin delivers vehicle |
| `overdueFee` | Number | Default: `0` | Overdue penalty charged if > 24h late |
| `status` | String | Enum: `['active', 'returned', 'overdue']` | Current rental lifecycle status |
| `paymentStatus`| String | Enum: `['paid', 'pending', 'refunded']`, Default: `'paid'` | Transaction payment state |
| `paymentMethod`| String | Default: `'UPI'` | Method used (UPI, Card, Net Banking) |
| `paymentId` | String | Indexed | Unique payment identifier (`pay_sim_...`) |
| `orderId` | String | Indexed | Unique order identifier (`order_sim_...`) |
| `timestamps` | Date | Auto (`createdAt`, `updatedAt`) | Audit trail |

### 4. Notification Model (`models/Notification.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `type` | String | Enum: `['new_booking', 'booking_returned', 'booking_overdue']` | Event category |
| `title` | String | Required, Trim | Short notification headline |
| `message` | String | Required, Trim | Detailed event text with vehicle & customer |
| `booking` | ObjectId | Ref: `'Booking'` | Reference to associated rental |
| `customerName` | String | Trim | Name of the customer |
| `vehicleName` | String | Trim | Vehicle make and model |
| `deliveryAddress` | String | Trim | Delivery drop-off location |
| `isRead` | Boolean | Default: `false` | Read/unread status for Admin |
| `timestamps` | Date | Auto (`createdAt`, `updatedAt`) | Audit trail |

---

## REST API Documentation

### Base URL: `http://localhost:3000/api`

### 1. Authentication Endpoints (`/auth`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ name, email, phone, address?, password, role? }` | Registers a new user with address & bcrypt-hashed password |
| `POST` | `/auth/login` | Public | `{ email, password }` | Authenticates credentials and returns JWT token |
| `GET` | `/auth/me` | Authenticated | Bearer Token in Header | Retrieves the current user's profile |

### 2. Vehicle Fleet Endpoints (`/vehicles`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/vehicles` | Public | Query: `?type=Car&available=true&search=wagon` | Lists all vehicles with optional filters |
| `GET` | `/vehicles/:id` | Public | Path: `:id` | Fetches details for a single vehicle |
| `POST` | `/vehicles` | **Admin Only** | `{ make, name, regNumber, type, pricePerDay, image, fuelType, seatingCapacity, description }` | Adds a new vehicle (resolves image URL) |
| `PUT` | `/vehicles/:id` | **Admin Only** | Updated fields in Body | Updates vehicle specifications and availability |
| `PATCH`| `/vehicles/:id/toggle-availability` | **Admin Only** | Path: `:id` | Toggles vehicle availability (`isAvailable = !isAvailable`) |
| `DELETE` | `/vehicles/:id` | **Admin Only** | Path: `:id` | Removes vehicle from inventory |

### 3. Booking & Rental Endpoints (`/bookings`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/bookings` | Authenticated | `{ vehicleId, bookingDate, returnDate, days, deliveryAddress, paymentMethod, paymentId, orderId }` | Books vehicle, sets delivery address, and notifies admin |
| `GET` | `/bookings/my-rentals` | Authenticated | Bearer Token | Returns logged-in user's rentals, delivery info & overdue fees |
| `GET` | `/bookings` | **Admin Only** | Bearer Token | Returns all system bookings with delivery dispatch addresses |
| `PATCH`| `/bookings/:id/return`| Authenticated | Path: `:id` | Returns vehicle, assesses overdue fee if > 24h late, restores fleet |

### 4. Notification Endpoints (`/notifications`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/notifications` | **Admin Only** | Bearer Token | Fetches recent booking and return notifications with unread count |
| `PATCH`| `/notifications/:id/read` | **Admin Only** | Path: `:id` | Marks a specific notification as read |
| `PATCH`| `/notifications/read-all` | **Admin Only** | Bearer Token | Marks all admin notifications as read |

---

## Demo Credentials

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
