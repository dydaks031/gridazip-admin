const knex = require('knex');
const helper = require('./helper');


let env = process.env.NODE_ENV;
if(!env) env = 'default';
const connectionInfo = helper.getInfo(env);

const Knex = {
  getConnection: () => {
    let cursor = knex({
      client: 'mysql',
      connection: connectionInfo,
      pool: { min: 0, max: 10000 }
    });
    return new Promise((resolve) => {
      resolve(cursor);
    }).catch(() => {
      throw new Error('knex connection error.');
    });
  }
};

module.exports = Knex;