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