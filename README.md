# Nexora CRM - Enterprise Monolith Suite

Welcome to **Nexora CRM**, a unified customer relationship management and enterprise resource planning portal. This system combines sales funnel pipelines, client invoice logs, team directory listings, HR attendance registries, payslips management, and stock/product logs into a single high-performance application.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (version 18.x or above)
* [MongoDB](https://www.mongodb.com/) (locally running or a MongoDB Atlas cloud cluster)

---

### 2. Backend Setup & Run

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables by creating a `.env` file (refer to `.env.example` for details):
   ```text
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crm_monolith
   JWT_ACCESS_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_ACCESS_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   SMTP_FROM=noreply@crm.com
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server runs locally at: http://localhost:5000*

---

### 3. Frontend Setup & Run

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Configure the frontend API endpoint. Make sure the API environment variable points to your backend server URL (e.g. `http://localhost:5000` or your live URL).
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
   *The development app runs at: http://localhost:5173*
5. Build and preview the production bundle locally:
   ```bash
   npm run build
   npm run preview
   ```
   *The preview server runs at: http://localhost:4173*

---

## 📂 Project Structure

```text
CMR/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── middleware/      # Auth & validation middlewares
│   │   ├── modules/         # App modules (auth, billing, crm, hr, inventory)
│   │   │   ├── auth/        # Users & token schemas/controllers
│   │   │   ├── hr/          # Employees, Attendance, Leaves, Payroll
│   │   │   ├── crm/         # Customers, Leads, Deals, Activities
│   │   │   └── billing/     # Invoices, Quotations, Payments
│   │   ├── utils/           # Error classes & helper functions
│   │   └── app.js           # Server application configuration
│   ├── .env                 # Local credentials (ignored by git)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common components (ProtectedRoute)
│   │   ├── modules/         # Client views (auth, hr, crm, billing, settings)
│   │   ├── store/           # Redux state slices (hrSlice, settingsSlice)
│   │   ├── services/        # API request configuration
│   │   ├── App.jsx          # Route mapping and core layout
│   │   └── main.jsx         # Render root mount
│   ├── dist/                # Production build directory (ignored by git)
│   └── package.json
└── .gitignore               # Root gitignore configuration file
```

---

## 🔑 Available Roles & Access Permissions

The platform uses Role-Based Access Control (RBAC) to ensure security and privacy. The primary roles are:

* **ADMIN**: Full control over all system modules, company settings, reports, and system preferences.
* **HR**: Manage employee profiles, departments, attendance, payroll logs, and review leave requests.
* **SALES**: Manage client customers, leads, deals, track invoices, register check-in attendance, request leaves, and view personal payslips.
* **MANAGER**: Full read/write access to CRM, inventory, departments, and payroll.
* **INVENTORY_MANAGER**: Monitor warehouse products, supplier logs, stock, and purchase orders.
* **ACCOUNTANT**: Manage invoices, payment transaction registries, and tax logs.
* **EMPLOYEE**: View personal profile, log check-in/out attendance, apply for leaves, view personal payslips, and upload documents.
