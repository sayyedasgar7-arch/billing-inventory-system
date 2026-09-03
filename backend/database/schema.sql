-- Creates a new, empty database container to hold all our tables
CREATE DATABASE IF NOT EXISTS billing_inventory_db;
USE billing_inventory_db; -- tells MySQL "all commands below apply inside this database"

-- Staff login accounts (bonus JWT auth feature)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,        -- unique auto-incrementing ID for each user
  name VARCHAR(100) NOT NULL,               -- staff member's name, required
  email VARCHAR(100) NOT NULL UNIQUE,       -- UNIQUE stops two accounts sharing one email
  password VARCHAR(255) NOT NULL,           -- stores a HASHED password, never plain text
  role ENUM('admin','staff') DEFAULT 'staff', -- ENUM restricts the value to only these two options
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- auto-fills with "now" when a row is inserted
);

-- Customer directory
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- The inventory itself
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,          -- SKU = Stock Keeping Unit, a unique product code
  category VARCHAR(100),
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,   -- DECIMAL(10,2) = up to 10 digits, 2 after the decimal — correct type for money (never use FLOAT for money)
  quantity INT NOT NULL DEFAULT 0,               -- current stock count
  low_stock_threshold INT NOT NULL DEFAULT 5,    -- below this number, the product is flagged "low stock"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- auto-updates every time the row changes
);

-- One row = one bill/invoice header
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,  -- human-readable bill number, e.g. INV-1234567890
  customer_id INT,                              -- who the bill is for (can be NULL for walk-in customers)
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,     -- sum of all line items before tax/discount
  tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,  -- subtotal + tax - discount = final amount
  status ENUM('active','cancelled') NOT NULL DEFAULT 'active', -- tells us if stock was restored
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
  -- FOREIGN KEY: links this table to `customers`; ON DELETE SET NULL means if a customer is deleted, their old invoices stay, just unlinked
);

-- One row per product on a specific bill (the line items)
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,   -- we COPY the name here so the bill still reads correctly even if the product is later renamed/deleted
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,    -- we COPY the price at time of sale, so future price changes don't alter old bills
  line_total DECIMAL(10,2) NOT NULL,    -- quantity * unit_price for this one line
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  -- ON DELETE CASCADE: if the parent invoice is deleted, its line items are auto-deleted too — no orphan rows left behind
  FOREIGN KEY (product_id) REFERENCES products(id)
);