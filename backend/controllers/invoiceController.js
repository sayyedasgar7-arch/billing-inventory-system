// controllers/invoiceController.js
const pool = require('../config/db');

// POST /api/invoices  -> creates a bill AND deducts stock, safely
exports.createInvoice = async (req, res, next) => {
  const { customer_id, items, tax_percent = 0, discount_percent = 0 } = req.body;
  // items is expected as: [{ product_id: 1, quantity: 2 }, { product_id: 3, quantity: 1 }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'At least one product item is required' });
  }

  const connection = await pool.getConnection();
  // we grab ONE dedicated connection (instead of the shared pool) so all our queries below belong to a single transaction

  try {
    await connection.beginTransaction();
    // starts a transaction: nothing is permanently saved until we explicitly commit() — this is what lets us "undo" everything if something fails midway

    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const [[product]] = await connection.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        // FOR UPDATE locks this specific product row until our transaction finishes,
        // so two bills being created at the same second can never both oversell the same last unit
        [item.product_id]
      );

      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
      }

      const lineTotal = product.unit_price * item.quantity;
      subtotal += lineTotal;

      lineItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.unit_price,
        line_total: lineTotal
      });

      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        // deducts the sold quantity from stock right away, inside the same transaction
        [item.quantity, product.id]
      );
    }

    const tax_amount = (subtotal * tax_percent) / 100;
    const discount_amount = (subtotal * discount_percent) / 100;
    const grand_total = subtotal + tax_amount - discount_amount;
    const invoice_number = 'INV-' + Date.now(); // Date.now() gives a millisecond timestamp — simple way to make a unique bill number

    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices (invoice_number, customer_id, subtotal, tax_percent, tax_amount, discount_percent, discount_amount, grand_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [invoice_number, customer_id || null, subtotal, tax_percent, tax_amount, discount_percent, discount_amount, grand_total]
    );

    const invoiceId = invoiceResult.insertId; // insertId = the auto-generated ID MySQL just assigned to this new invoice row

    for (const li of lineItems) {
      await connection.query(
        `INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, li.product_id, li.product_name, li.quantity, li.unit_price, li.line_total]
      );
    }

    await connection.commit(); // everything above succeeded -> permanently save ALL the changes together
    res.status(201).json({ id: invoiceId, invoice_number, grand_total, message: 'Invoice created' });
  } catch (err) {
    await connection.rollback(); // ANY failure above -> undo every single query since beginTransaction (stock is never wrongly deducted)
    next(err);
  } finally {
    connection.release(); // always give the connection back to the pool, whether we succeeded or failed
  }
};

// GET /api/invoices -> list all bills
exports.getInvoices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.name as customer_name FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id ORDER BY i.id DESC`
      // LEFT JOIN pulls in the customer's name alongside the invoice, and still returns the invoice even if customer_id is NULL
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/invoices/:id -> one bill + its line items
exports.getInvoiceById = async (req, res, next) => {
  try {
    const [[invoice]] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' }); // 404 = "Not Found"
    const [items] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
    res.json({ ...invoice, items }); // ...invoice "spreads" all invoice fields, then we attach the items array alongside them
  } catch (err) { next(err); }
};

// PUT /api/invoices/:id -> used to CANCEL a bill (and restore stock)
exports.updateInvoice = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // expects { "status": "cancelled" }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[invoice]] = await connection.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'cancelled') throw new Error('Invoice is already cancelled');

    if (status === 'cancelled') {
      const [items] = await connection.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
      for (const item of items) {
        await connection.query(
          'UPDATE products SET quantity = quantity + ? WHERE id = ?',
          // gives the stock BACK to inventory — the exact reverse of what createInvoice did
          [item.quantity, item.product_id]
        );
      }
      await connection.query('UPDATE invoices SET status = ? WHERE id = ?', ['cancelled', id]);
    }

    await connection.commit();
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

// DELETE /api/invoices/:id -> permanently remove a bill record
exports.deleteInvoice = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    // ON DELETE CASCADE (set in schema.sql) automatically removes this invoice's invoice_items rows too
    res.json({ message: 'Invoice deleted' });
  } catch (err) { next(err); }
};