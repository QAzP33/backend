const config = require('../../config/index');
const { create_mpg_aes_encrypt, create_mpg_sha_encrypt } = require('./neWebPayCrypto');

function generateNewebpayForm(order, productName, userEmail, cartCount) {
  // 建立 藍新金流 所需資料
  const ItemDesc = `${productName}...等，共${cartCount}項商品`;
  const TimeStamp = Math.floor(Date.now() / 1000);
  const neWedPayOrder = {
    Email: userEmail,
    Amt: order.total_price,
    ItemDesc,
    TimeStamp,
    MerchantOrderNo: order.display_id,
    ReturnURL: config.get('neWebPaySecret.returnUrl'),
    NotifyURL: config.get('neWebPaySecret.notifyUrl'),
  };

  const aesEncrypt = create_mpg_aes_encrypt(neWedPayOrder);
  const shaEncrypt = create_mpg_sha_encrypt(aesEncrypt);

  return {
    html: ` 
      <form id="newebpay-form" action="https://ccore.newebpay.com/MPG/mpg_gateway" method="post" style="display: none;">
        <input type="hidden" name="MerchantID" value="${config.get('neWebPaySecret.merchantId')}">
        <input type="hidden" name="TradeSha" value="${shaEncrypt}">
        <input type="hidden" name="TradeInfo" value="${aesEncrypt}">
        <input type="hidden" name="TimeStamp" value="${neWedPayOrder.TimeStamp}">
        <input type="hidden" name="Version" value="${config.get('neWebPaySecret.version')}">
        <input type="hidden" name="MerchantOrderNo" value="${neWedPayOrder.MerchantOrderNo}">
        <input type="hidden" name="Amt" value="${neWedPayOrder.Amt}">
        <input type="hidden" name="ItemDesc" value="${neWedPayOrder.ItemDesc}">
        <input type="hidden" name="Email" value="${neWedPayOrder.Email}">
        <input type="hidden" name="ReturnURL" value="${neWedPayOrder.ReturnURL}">
        <input type="hidden" name="NotifyURL" value="${neWedPayOrder.NotifyURL}">
        <button type="submit">送出</button>
      </form>
      <script>document.getElementById("newebpay-form").submit();</script>`,
    merchantOrderNo: neWedPayOrder.MerchantOrderNo,
  };
}

module.exports = { generateNewebpayForm };
