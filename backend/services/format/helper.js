const config = require('./config');

const Helper = {
  toDashedPhone: (phone) => {
    let value = String(phone).replace(/[^\d]/g, '');

    if (value.startsWith('02')) {
      if (value.length === 10)
        return value.replace(/(\d{2})(\d{4})(\d)/, '$1-$2-$3');
      else
        return value.replace(/(\d{2})(\d{3})(\d)/, '$1-$2-$3');
    }
    else if (value.length >= 11) {
      return value.replace(/(\d{3})(\d{4})(\d)/, '$1-$2-$3');
    }
    else if(value.length >= 7) {
      return value.replace(/(\d{3})(\d{3})(\d)/, '$1-$2-$3');
    }
    else if (value.length >= 4) {
      return value.replace(/(\d{3})(\d+)/, '$1-$2');
    }
  },

  lpad: (string, padLength, padString) => {
    string = string.toString();
    while(string.length < padLength)
      string = padString + string;
    return string;
  }
};

module.exports = Helper;