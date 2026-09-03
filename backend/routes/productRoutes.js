// routes/productRoutes.js
const express = require('express');
const router = express.Router(); // Router groups related URLs so we can mount them under one prefix (/api/products) in server.js
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { productRules } = require('../validators/productValidator');

router.get('/', getProducts);
router.post('/', productRules, addProduct);       // productRules runs FIRST as a checkpoint, then addProduct runs
router.put('/:id', productRules, updateProduct);  // :id is a URL parameter, e.g. /api/products/7 -> req.params.id = "7"
router.delete('/:id', deleteProduct);

module.exports = router;