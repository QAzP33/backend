const crypto = require('crypto');
const config = require('../../config/index');
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

module.exports = {
  create_mpg_aes_encrypt,
  create_mpg_sha_encrypt,
  decryptTradeInfo,
  verifyNewebpaySignature,
};
