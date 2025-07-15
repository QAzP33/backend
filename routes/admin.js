const express = require('express');
const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const adminController = require('../controllers/admin');
const handleErrorAsync = require('../utils/handleErrorAsync');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger,
});
const isAdmin = require('../middlewares/isAdmin');
const limiter = require('../middlewares/limiter');

router.get('/classification', auth, isAdmin, handleErrorAsync(adminController.getClassification));
router.post('/classification', auth, isAdmin, handleErrorAsync(adminController.postClassification));
router.get('/product_detail', auth, isAdmin, handleErrorAsync(adminController.getProductDetail));
router.post('/product_detail', auth, isAdmin, handleErrorAsync(adminController.postProductDetail));
router.post('/products', auth, isAdmin, handleErrorAsync(adminController.postProduct));
router.get('/orders/is_ship', auth, isAdmin, handleErrorAsync(adminController.getIsShip));
router.get('/orders/revenue', auth, isAdmin, handleErrorAsync(adminController.getRevenue));
router.get('/orders/process', auth, isAdmin, handleErrorAsync(adminController.getProcessingOrders));
router.get('/orders/new', auth, isAdmin, handleErrorAsync(adminController.getNewOrders));
router.get('/orders/history', auth, isAdmin, handleErrorAsync(adminController.getOrderHistory));
router.post('/discount', auth, isAdmin, handleErrorAsync(adminController.postDiscount));
router.post('/payment-method', auth, isAdmin, handleErrorAsync(adminController.postPaymentMethod));
router.get('/orders', auth, isAdmin, handleErrorAsync(adminController.getAllOrders));
router.patch('/orders/:order_id', auth, isAdmin, handleErrorAsync(adminController.updateOrderStatus));
router.get('/:product_id', auth, isAdmin, handleErrorAsync(adminController.getProductId));
router.put('/:product_id', auth, isAdmin, handleErrorAsync(adminController.putProductId));

module.exports = router;
