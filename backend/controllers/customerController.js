// controllers/customerController.js
const pool = require('../config/db');

exports.getCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
};

exports.addCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone, email, address]
    );
    res.status(201).json({ id: result.insertId, message: 'Customer added' });
  } catch (err) { next(err); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;
    await pool.query(
      'UPDATE customers SET name=?, phone=?, email=?, address=? WHERE id=?',
      [name, phone, email, address, req.params.id]
    );
    res.json({ message: 'Customer updated' });
  } catch (err) { next(err); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM customers WHERE id=?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) { next(err); }
};