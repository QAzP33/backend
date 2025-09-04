const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 設定 multer - 用 memoryStorage 存 buffer
const storage = multer.memoryStorage();

// 圖片格式驗證
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png'];

  if (!allowedExts.includes(ext)) {
    const error = new Error('圖片格式錯誤，請上傳 jpg、jpeg、png 圖片格式');
    error.statusCode = 400;
    return cb(error);
  }

  // 自訂檔案大小驗證
  if (file.size > 3 * 1024 * 1024) {
    // 2MB
    const error = new Error(`檔案 "${file.originalname}" 超過 3MB 限制`);
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
}

// 建立 multer middleware，上傳規則
const uploadMulter = multer({
  storage,
  fileFilter,
});

// 錯誤處理
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const fileName = req.file?.originalname || req.files?.[0]?.originalname || '未知檔案';
      return res.status(400).json({
        message: `檔案 "${fileName}" 超過 2MB 限制`,
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// 整合 buffer 上傳 cloudinary
// 單張圖片上傳
function uploadSingleBufferToCloudinary(file, folder = 'text_uploads') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

// 多張上傳
async function uploadMultipleBuffersToCloudinary(files, folder = 'product_uploads') {
  const uploadPromises = files.map(file => uploadSingleBufferToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

module.exports = {
  uploadMulter,
  uploadSingleBufferToCloudinary,
  uploadMultipleBuffersToCloudinary,
  handleMulterError,
};