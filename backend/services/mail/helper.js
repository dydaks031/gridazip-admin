const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const appConfig = require('../app/config');
const ses = new AWS.SES();
const path = require('path');
const emailTmpl = require('email-templates').EmailTemplate;

const from = 'no-reply@gridazip.com';

const Helper = {
  send: (mail, title, body) => {
    let to = [mail];
    return new Promise((resolve, reject) => {
      ses.sendEmail({
        Source: from,
        Destination: { ToAddresses: to },
        Message: {
          Subject: {
            Data: title
          },
          Body: {
            Html: {
              Data: body
            }
          }
        }
      }, (err, data) => {
        if (err) {
          reject(err);
        }
        else resolve(data);
      });
    });
  },
  getTemplate: (name, params) => {
    return new Promise((resolve, reject) => {
      let template = new emailTmpl(path.join(__dirname, '../../', 'local', 'templates', name));
      let templateData = Object.assign(appConfig, params);
      template.render(templateData, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }
};

module.exports = Helper;