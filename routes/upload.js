const express = require('express');
const router = express.Router();
const handleErrorAsync = require('../utils/handleErrorAsync');
const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Users');
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger,
});

const imageController = require('../controllers/image');
const { uploadMulter } = require('../utils/uploadMulter');

router.post(
  '/profile',
  auth,
  uploadMulter.single('image'),
  handleErrorAsync(imageController.uploadProfileImage)
);

module.exports = router;