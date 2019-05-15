const config = require('./config');
const cryptoHelper = require('../crypto/helper');

const Helper = {
  getInfo: (key) => {
    if (typeof config[key] === 'undefined') {
      throw new Error(`The connection configuration has no ${key} index.`);
    }
    else {
      let configItem = Object.assign({}, config[key]);

      if (typeof configItem.secure !== 'undefined' && configItem.secure === true) {
        configItem.password = cryptoHelper.decrypt(configItem.password);
      }

      return configItem;
    }
  }
};

module.exports = Helper;