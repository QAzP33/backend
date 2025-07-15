const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');
const handleErrorAsync = require('../utils/handleErrorAsync');

router.get('/bestSeller', handleErrorAsync(productsController.getBestSeller));
router.get('/extras', handleErrorAsync(productsController.getExtras));
router.get('/:product_id', handleErrorAsync(productsController.getProductId));
router.get('/', handleErrorAsync(productsController.getProducts));


module.exports = router;