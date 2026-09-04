# Billing & Inventory Management System

![CI](https://github.com/sayyedasgar7-arch/billing-inventory-system/actions/workflows/ci.yml/badge.svg)

A shop owner can manage products, create customer invoices, and stock levels update automatically as bills are created or cancelled.

## Tech Stack
- Frontend: React (Hooks + Context), React Router, Axios
- Backend: Node.js, Express.js
- Database: MySQL
- Auth: JWT (bonus)
- Validation: express-validator (backend), controlled form inputs (frontend)

## Project Structure
billing-inventory-system/
├── backend/
├── frontend/
└── README.md

## Setup Instructions

### 1. Database
1. Install MySQL and open MySQL Workbench.
2. Run backend/database/schema.sql to create the database and tables.

### 2. Backend
cd backend
npm install
cp .env.example .env
npm run dev

Server runs at http://localhost:5000.

### 3. Frontend
cd frontend
npm install
cp .env.example .env
npm run dev

App runs at http://localhost:5173.

## API Documentation

| Method | Endpoint | Purpose | Body |
|---|---|---|---|
| GET | /api/products | List/search/paginate products | — |
| POST | /api/products | Add product | `{name, sku, category, unit_price, quantity, low_stock_threshold}` |
| PUT | /api/products/:id | Update product | same as above |
| DELETE | /api/products/:id | Delete product | — |
| GET | /api/customers | List customers | — |
| POST | /api/customers | Add customer | `{name, phone, email, address}` |
| PUT | /api/customers/:id | Update customer | same as above |
| DELETE | /api/customers/:id | Delete customer | — |
| GET | /api/invoices | List invoices | — |
| POST | /api/invoices | Create invoice (deducts stock) | `{customer_id, items:[{product_id, quantity}], tax_percent, discount_percent}` |
| GET | /api/invoices/:id | View invoice detail | — |
| PUT | /api/invoices/:id | Cancel invoice (restores stock) | `{status: "cancelled"}` |
| DELETE | /api/invoices/:id | Delete invoice record | — |
| POST | /api/auth/register | Create login account | `{name, email, password}` |
| POST | /api/auth/login | Log in, get JWT | `{email, password}` |

## Database Schema
See `backend/database/schema.sql`. Tables: `users`, `customers`, `products`, `invoices`, `invoice_items`.

## Assumptions & Future Improvements
See `WRITEUP.md`.

## Screenshots

### Products (with low-stock alert)
![Products Page](screenshots/products%20page.png)

### Customers
![Customers Page](screenshots/customers%20page.png)

### New Invoice
![New Invoice Page](screenshots/new%20invoice%20page.png)

### Invoices List
![Invoices Page](screenshots/invoices%20page.png)