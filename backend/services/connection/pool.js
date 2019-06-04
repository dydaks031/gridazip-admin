const mysql = require('mysql');
const helper = require('./helper');

const defaultConnectionInfo = helper.getInfo('default');
const developmentConnectionInfo = helper.getInfo('development');
const localConnectionInfo = helper.getInfo('local');
let innerPool = null;
if (process.env.NODE_ENV === 'development') {
  innerPool = mysql.createPool(developmentConnectionInfo);
}
else if (process.env.NODE_ENV === 'local') {
  innerPool = mysql.createPool(localConnectionInfo);
}
else {
  innerPool = mysql.createPool(defaultConnectionInfo);
}

const Pool = {
  getConnection: () => {
    return new Promise((resolve, reject) => {
      innerPool.getConnection((err, conn) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(conn);
      });
    });
  }
};

module.exports = Pool;