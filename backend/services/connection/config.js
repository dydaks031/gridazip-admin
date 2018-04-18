const Config = {
  default: {
    host: 'gridazip-site.cl6yvvzfiwjs.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: '6d40ceaefe41c92c503691da72ecfc9e',
    database: 'gridazip',
    secure: true
  },
  development: {
    host: 'gridaziptest.cl6yvvzfiwjs.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'gridaman',
    password: 'Rmflekaos!',
    database: 'gridazip'
  }
};

module.exports = Config;