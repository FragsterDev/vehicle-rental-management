# Vehicle Rental Management System (MERN Stack)

A clean, minimalistic Full-Stack MERN application with role-based access control (User and Admin), secure password hashing via `bcryptjs`, JWT token authentication, vehicle inventory management, date-based booking duration calculation, automated overdue tracking, simulated Indian payment gateway (UPI, Cards, Net Banking), and automated PDF tax invoice generation.

---

## 1. Demo Credentials (Seeded)

The database includes pre-configured demo accounts created via `seeder.js`:

| Role | Name | Email | Password | Phone |
|---|---|---|---|---|
| **Admin** | System Admin | `admin@rental.com` | `admin123` | 9876543210 |
| **User** | John Doe | `john@example.com` | `user123` | 9123456780 |

*(Tip: In the Sign In modal, you can click the **Fill Admin** or **Fill User** one-click buttons for quick demonstration).*

---

## 2. Key Features

### 📄 PDF Tax Invoice Generation
- **Official Corporate Template**: Generated dynamically using `jspdf` and `jspdf-autotable`.
- **Complete Identifier Tracking**:
  - **Invoice Number**: e.g., `INV-8812301`
  - **Payment ID**: e.g., `pay_sim_981247012`
  - **Order ID**: e.g., `order_sim_8812301`
  - **Date of Issue** & **Rental Period**
- **Detailed Itemization**:
  - Customer Information (Billed to Name, Email, Phone)
  - Vehicle Information (Make, Model, Category, Registration Number)
  - Daily Rental Rate, Duration (Days), and Base Amount
  - Central GST (CGST @ 9%) & State GST (SGST @ 9%)
  - Total Paid (in INR / Rs.)
  - Payment Method acknowledgement & Authorized Signatory stamp
- **One-Click Instant Download**:
  - From the checkout confirmation modal immediately after booking.
  - From **My Rentals** for every past and active rental.
  - From **All Bookings** for Admin audit records.

### 💳 Simulated Indian Payment Gateway
- **Multi-Method Support**:
  - **UPI**: Google Pay, PhonePe, Paytm with virtual payment addresses (`@okhdfcbank`, `@okaxis`).
  - **Debit / Credit Card**: Visa, Mastercard, RuPay with test card details.
  - **Net Banking**: HDFC, State Bank of India (SBI), ICICI Bank, Axis Bank, Kotak.
- **Persistent Database Storage**:
  - Every booking saves `paymentStatus: 'paid'`, `paymentMethod`, `paymentId`, and `orderId` directly into MongoDB Atlas.

### 📅 Date-Based Booking & Overdue Detection
- Automated day calculation, overdue flags, and late day counters.

---

## 3. Running the Application

### Backend:
```bash
cd server/vehicle-rental-management-backend
npm install
npm run seed      # (Safe mode: preserves existing user records & custom vehicles)
npm run dev       # Starts server on http://localhost:3000
```

### Frontend:
```bash
cd client/vehicle-rental-management-frontend
npm install
npm run dev       # Starts client on http://localhost:5173
```
