module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY,
  // firebase: {
  //   serviceAccount: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
  //   storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  // }
};
