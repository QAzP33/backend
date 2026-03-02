const crypto = require('crypto');
const config = require('../../config/index');
const logger = require('../logger')('neWebPayCrypto');
const { dataSource } = require('../../db/data-source');
const RespondType = 'JSON';

function genDataChain(neWedPayOrder) {
  return (
    `MerchantID=${config.get('neWebPaySecret.merchantId')}` +
    `&RespondType=${RespondType}` +
    `&TimeStamp=${neWedPayOrder.TimeStamp}` +
    `&Version=${config.get('neWebPaySecret.version')}` +
    `&MerchantOrderNo=${neWedPayOrder.MerchantOrderNo}` +
    `&Amt=${neWedPayOrder.Amt}` +
    `&ItemDesc=${encodeURIComponent(neWedPayOrder.ItemDesc)}` +
    `&Email=${encodeURIComponent(neWedPayOrder.Email)}`
  );
}

function create_mpg_aes_encrypt(TradeInfo) {
  const encrypt = crypto.createCipheriv(
    'aes-256-cbc',
    config.get('neWebPaySecret.hashKey'),
    config.get('neWebPaySecret.hashIv')
  );
  let enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
  enc += encrypt.final('hex');
  return enc;
}

function create_mpg_sha_encrypt(aesEncrypt) {
  const sha = crypto.createHash('sha256');
  const plaintext = `HashKey=${config.get('neWebPaySecret.hashKey')}&${aesEncrypt}&HashIV=${config.get('neWebPaySecret.hashIv')}`;
  return sha.update(plaintext).digest('hex').toUpperCase();
}

// 解密藍新金流回調的 TradeInfo
function decryptTradeInfo(TradeInfo) {
  try {
    const decrypt = crypto.createDecipheriv(
      'aes256',
      config.get('neWebPaySecret.hashKey'),
      config.get('neWebPaySecret.hashIv')
    );
    decrypt.setAutoPadding(false);
    let dec = decrypt.update(TradeInfo, 'hex', 'utf8');
    dec += decrypt.final('utf8');

    // 移除填充字符
    const result = dec
      .split('')
      .filter(char => char.charCodeAt(0) > 32)
      .join('');

    return JSON.parse(result);
  } catch (error) {
    throw new Error('解密 TradeInfo 失敗: ' + error.message);
  }
}

// 驗證藍新金流回調簽章
function verifyNewebpaySignature(TradeInfo, TradeSha) {
  try {
    const expectedSha = create_mpg_sha_encrypt(TradeInfo);
    return expectedSha === TradeSha;
  } catch (error) {
    return false;
  }
}

async function updateOrderPaymentStatus(merchantOrderNo, isPaid) {
  try {
    const orderRepo = dataSource.getRepository('Order');
    const order = await orderRepo.findOne({
      where: { display_id: merchantOrderNo },
    });

    if (!order) {
      throw new Error('找不到訂單');
    }

    order.is_paid = isPaid;
    order.payment_method_id = 2; // 假設 2 是信用卡付款的 ID
    if (isPaid) {
      order.paid_at = new Date();
    }

    await orderRepo.save(order);

    logger.info(`訂單 ${merchantOrderNo} 付款狀態已更新為: ${isPaid}`);
  } catch (error) {
    logger.error('更新訂單付款狀態失敗', error);
    throw error;
  }
}

module.exports = {
  create_mpg_aes_encrypt,
  create_mpg_sha_encrypt,
  decryptTradeInfo,
  verifyNewebpaySignature,
  updateOrderPaymentStatus,
};
