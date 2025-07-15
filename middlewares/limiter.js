const rateLimit = require('express-rate-limit');

const forgotPwdLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分鐘
  max: 5, // 超過5次
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '伺服器忙碌中，請稍後再測試' } // 就把你鎖起來！
});

module.exports = forgotPwdLimit;