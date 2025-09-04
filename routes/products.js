const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');
const handleErrorAsync = require('../utils/handleErrorAsync');
const { uploadMulter, handleMulterError } = require('../utils/uploadMulter');

router.get('/bestSeller', handleErrorAsync(productsController.getBestSeller));
router.get('/extras', handleErrorAsync(productsController.getExtras));
router.get('/addInfo/:detail_id', handleErrorAsync(productsController.getCreateProductInfo));
router.get('/:product_id', handleErrorAsync(productsController.getProductId));
router.get('/', handleErrorAsync(productsController.getProducts));
router.post(
  '/add',
  uploadMulter.array('images', 10),
  handleMulterError,
  handleErrorAsync(productsController.createProduct)
);
router.patch(
  '/update/:product_id',
  uploadMulter.array('images', 10),
  handleMulterError,
  handleErrorAsync(productsController.updateProduct)
);

module.exports = router;
