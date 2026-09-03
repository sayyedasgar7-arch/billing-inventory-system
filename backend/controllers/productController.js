// controllers/productController.js
const pool = require('../config/db');
const { validationResult } = require('express-validator'); // collects the errors productRules found, if any

// GET /api/products?search=&category=&page=1&limit=10
exports.getProducts = async (req, res, next) => {
  try {
    const { search = '', category = '', page = 1, limit = 10 } = req.query; // req.query holds ?key=value pairs from the URL
    const offset = (page - 1) * limit; // e.g. page 2, limit 10 -> skip the first 10 rows

    let query = 'SELECT * FROM products WHERE 1=1'; // "1=1" is always true, so we can safely keep appending "AND ..." below
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ?)';
      // "?" is a placeholder — mysql2 inserts the value safely, which stops SQL Injection attacks
      params.push(`%${search}%`, `%${search}%`); // % means "any characters before/after" — enables partial-text search
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'; // newest first, then apply pagination
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params); // pool.query returns [rows, metadata]; we only need rows
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM products'); // total row count, used by frontend for pagination

    res.json({
      data: rows,
      total,
      page: Number(page),
      lowStock: rows.filter(p => p.quantity <= p.low_stock_threshold) // products needing a restock flag
    });
  } catch (err) {
    next(err); // hands the error off to errorMiddleware.js instead of crashing the server
  }
};

// POST /api/products
exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req); // reads results from productRules that ran before this function
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // 400 = "Bad Request" from the client

  try {
    const { name, sku, category, unit_price, quantity, low_stock_threshold } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, unit_price, quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?)',
      [name, sku, category, unit_price, quantity, low_stock_threshold || 5]
    );
    res.status(201).json({ id: result.insertId, message: 'Product added' }); // 201 = "Created"
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params; // req.params reads the :id part of the URL
    const { name, sku, category, unit_price, quantity, low_stock_threshold } = req.body;
    await pool.query(
      'UPDATE products SET name=?, sku=?, category=?, unit_price=?, quantity=?, low_stock_threshold=? WHERE id=?',
      [name, sku, category, unit_price, quantity, low_stock_threshold, id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};