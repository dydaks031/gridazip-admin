const request = require('request');
const formatHelper = require('../format/helper');
const config = require('./config');
const appConfig = require('../app/config');

const Helper = {
  send: (phone, message) => {
    return new Promise((resolve, reject) => {
      const phoneDashed = formatHelper.toDashedPhone(phone);
      const parameter = {
        form: {
          user_id: config.id,
          secure: config.accessKey,
          sphone1: config.sphone1,
          sphone2: config.sphone2,
          sphone3: config.sphone3,
          rphone: phoneDashed,
          msg: message,
          description: appConfig.site.name
        }
      };

      request.post(config.endpoint, parameter, (error, response, body) => {
        if (error) reject(error);
        else resolve(body);
      });
    });
  }
};

module.exports = Helper;