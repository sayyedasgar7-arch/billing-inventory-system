// validators/productValidator.js
const { body } = require('express-validator'); // `body` lets us write rules for fields inside req.body

exports.productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'), // trim removes accidental spaces, notEmpty rejects blank values
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive whole number'),
];