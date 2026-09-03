// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice
} = require('../controllers/invoiceController');

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;