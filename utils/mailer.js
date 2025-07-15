require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FRONT_URL = process.env.FRONT_URL;

async function sendResetEmail(to, token) {
  const resetLink = `${FRONT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"築豆咖啡" <${process.env.SMTP_USER}>`,
    to,
    subject: '築豆咖啡重設密碼通知',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <!-- Banner -->
      <a href="https://south3group.github.io/south3coffee/" target="_blank" style="display: block;">
        <img src="cid:banner" alt="" style="width: 100%; height: auto; display: block;">
      </a>

      <div style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <img src="cid:logo" alt="築豆咖啡 Logo" style="height: 40px;" />
            <h2 style="color: #68482D; margin-top: 5px;">築豆咖啡 Bean Atelier</h2>
          </div>
        </div>
        <p style="font-size: 16px; color: #333;">親愛的築豆咖啡會員您好：</p>
        <p style="font-size: 16px; color: #333;">請點擊以下按鈕以重設您的密碼，該連結在 <strong>30 分鐘內有效</strong>：</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #68482D; color: #fff; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-size: 16px;">
            重設密碼
          </a>
        </div>

        <p style="font-size: 14px; color: #888;">若非本人操作，請忽略此封信。</p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          此為系統自動發送的郵件，請勿直接回覆。
        </p>
      </div>
    </div>
  `,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, 'assets/logo.png'),
        cid: 'logo' // cid 對應上方 HTML 的 src="cid:logo"
      },
      {
        filename: 'banner.png',
        path: path.join(__dirname, 'assets/banner.png'),
        cid: 'banner'
      }
    ]
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
