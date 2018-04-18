const Helper = {
  getString: number => {
    return new Promise((resolve, reject) => {
      number = number || 32;
      require('crypto').randomBytes(number, (err, buffer) => {
        resolve(buffer.toString('hex'));
      });
    });
  }
};

module.exports = Helper;