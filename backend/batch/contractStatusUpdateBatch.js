const knexBuilder = require('../services/connection/knex');
const schedule = require('node-schedule');



const ContractStatusUpdateBatch = schedule.scheduleJob('0 0 0 * * *', today => {
  console.log(today);
  knexBuilder.getConnection().then(cur => {
    let moveDateExpiredPks = [];
    let moveDateExpiredPksTotalCount = 0;
    let constructionStartPks = [];
    let constructionStartPksTotalCount = 0;

    cur('estimate_tbl')
      .select('estimate_no')
      .where('deleted', false)
      .andWhere('status', 7)
      .andWhere('moving_date', '<=', today)
      .then(response => {
        moveDateExpiredPks = response.map(o => o.estimate_no);
        return cur('estimate_tbl')
          .update('status', 8)
          .whereIn('estimate_no', moveDateExpiredPks);
      })
      .then(count => {
        moveDateExpiredPksTotalCount = count;
        const query = cur('estimate_tbl')
          .select('estimate_no')
          .where('deleted', false)
          .andWhere('status', 6)
          .andWhere('construction_start_date', '<=', today);
        console.log(query.toSQL().toNative());
        return query;
      })
      .then(response => {
        constructionStartPks = response.map(o => o.estimate_no);
        return cur('estimate_tbl')
          .update('status', 7)
          .whereIn('estimate_no', constructionStartPks);
      })
      .then(count => {
        constructionStartPksTotalCount = count;
        console.log('[ContractStatusUpdateBatch] The batch was successful.');
        console.log(`[constructon start] ${constructionStartPksTotalCount} / ${constructionStartPks.length}`);
        console.log(`[constructon end] ${moveDateExpiredPksTotalCount} / ${moveDateExpiredPks.length}`);
      })
      .catch(err => {
        console.error('[ContractStatusUpdateBatch] error is occurred.');
        console.error(err);
      })
  })

});

module.exports = ContractStatusUpdateBatch;