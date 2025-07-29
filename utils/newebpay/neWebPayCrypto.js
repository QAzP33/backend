const crypto = require('crypto');
const config = require('../config/index');
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
    `${config.get('neWebPaySecret.hashKey')}`,
    `${config.get('neWebPaySecret.hashIv')}`
  );
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
  return enc + encrypt.final('hex');
}

function create_mpg_sha_encrypt(aesEncrypt) {
  const sha = crypto.createHash('sha256');
  const plainText = `HashKey=${config.get(
    'neWebPaySecret.hashKey'
  )}&${aesEncrypt}&HashIV=${config.get('neWebPaySecret.hashIv')}`;

  return sha.update(plainText).digest('hex').toUpperCase();
}

function create_mpg_aes_decrypt(TradeInfo) {
  const decrypt = crypto.createDecipheriv(
    'aes256',
    config.get('neWebPaySecret.hashKey'),
    config.get('neWebPaySecret.hashIv')
  );
  decrypt.setAutoPadding(false);
  const text = decrypt.update(TradeInfo, 'hex', 'utf8');
  const plainText = text + decrypt.final('utf8');
  const result = plainText
    .split('')
    .filter(char => char.charCodeAt(0) > 32)
    .join('');
  return JSON.parse(result);
}

module.exports = {
  genDataChain,
  create_mpg_aes_encrypt,
  create_mpg_sha_encrypt,
  create_mpg_aes_decrypt,
};
