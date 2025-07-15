const jwt = require('jsonwebtoken');

const PERMISSION_DENIED_STATUS_CODE = 401;
const FailedMessageMap = {
  expired: 'Token 錯誤或已過期',
  missing: '請先註冊登入'
};

function generateError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function formatVerifyError(jwtError) {
  let result;
  switch (jwtError.name) {
  case 'TokenExpiredError':
    result = generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.expired);
    break;
  default:
    result = generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.expired);
    break;
  }
  return result;
}

function verifyJWT(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(formatVerifyError(error));
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = ({
  secret,
  userRepository,
  logger = console
}) => {
  if (!secret || typeof secret !== 'string') {
    logger.error('[AuthV2] secret is required and must be a string.');
    throw new Error('[AuthV2] secret is required and must be a string.');
  }
  if (!userRepository || typeof userRepository !== 'object' || typeof userRepository.findOneBy !== 'function') {
    logger.error('[AuthV2] userRepository is required and must be a function.');
    throw new Error('[AuthV2] userRepository is required and must be a function.');
  }
  return async (req, res, next) => {
    if (
      !req.headers ||
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer')
    ) {
      logger.warn('[AuthV2] Missing authorization header.');
      next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.missing));
      return;
    }
    const [, token] = req.headers.authorization.split(' ');
    if (!token) {
      logger.warn('[AuthV2] Missing token.');
      next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.missing));
      return;
    }
    try {
      const verifyResult = await verifyJWT(token, secret);
      const user = await userRepository.findOneBy({ id: verifyResult.id });
      if (!user) {
        next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.expired));
        return;
      }
      req.user = user;
      next();
    } catch (error) {
      logger.error(`[AuthV2] ${error.message}`);
      next(error);
    }
  };
};
