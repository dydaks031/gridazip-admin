const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const protocol = 'https';
const endpoint = 's3.ap-northeast-2.amazonaws.com';
const cloudFront = 'static.gridazip.com';
const bucket = 'gridazip-site';

const Helper = {
  save: (path, raw) => {
    return new Promise((resolve, reject) => {
      let params = {
        Bucket: bucket,
        Key: path,
        Body: raw,
        ACL: 'public-read'
      };

      s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          let pathArray = path.split('/');

          if (pathArray[0] === 'static') {
            resolve(protocol + '://' + cloudFront + '/' + Array.prototype.slice.call(pathArray, 1).join('/'));
          }
          else {
            resolve(protocol + '://' + endpoint + '/' + bucket + '/' + path);
          }
        }
      });
    });
  }
};

module.exports = Helper;