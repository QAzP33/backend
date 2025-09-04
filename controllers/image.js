const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('ImageController');

const { uploadSingleBufferToCloudinary } = require('../utils/uploadMulter');

const imageController = {
  async uploadProfileImage(req, res, next) {
    function extractCloudinaryPublicId(url) {
      const parts = url.split('/');
      const fileWithExt = parts.pop(); // xxx.jpg
      const publicId = fileWithExt.split('.')[0]; // 去掉副檔名
      return `profile_uploads/${publicId}`;
    }

    async function deleteFromCloudinary(publicId) {
      const cloudinary = require('cloudinary').v2;
      await cloudinary.uploader.destroy(publicId);
    }

    try {
      if (!req.file) {
        logger.warn('請上傳圖片');
        res.status(400).json({
          message: '請上傳圖片',
        });
        return;
      }

      // 上傳的資料夾名稱 'profile_uploads'
      const image = await uploadSingleBufferToCloudinary(req.file, 'profile_uploads');

      const { id } = req.user;
      const userRepository = dataSource.getRepository('User');
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        logger.warn('找不到使用者');
        res.status(400).json({
          message: '找不到使用者',
        });
        return;
      }

      if (user.profile_img) {
        const publicId = extractCloudinaryPublicId(user.profile_img);
        await deleteFromCloudinary(publicId);
      }

      user.profile_img = image.secure_url;
      await userRepository.save(user);

      res.status(200).json({
        status: 'Success',
        message: '大頭貼上傳成功',
        data: {
          profile_img: user.profile_img,
        },
      });
    } catch (error) {
      logger.error('上傳大頭貼失敗', error);
      next(error);
    }
  },
};

module.exports = imageController;