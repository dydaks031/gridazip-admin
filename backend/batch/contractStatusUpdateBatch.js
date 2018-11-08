const knexBuilder = require('../services/connection/knex');
const schedule = require('node-schedule');



const ContractStatusUpdateBatch = schedule.scheduleJob('0 0 0 * * *', today => {
  console.log(today);
  knexBuilder.getConnection().then(cur => {
    let moveDateExpiredPks = [];
    let moveDateExpiredPksTotalCount = 0;
    let constructionStartPks = [];
    let constructionStartPksTotalCount = 0;

    cur('proceeding_contract_tbl')
      .select('pc_pk')
      .where('pc_deleted', false)
      .andWhere('pc_status', 4)
      .andWhere('pc_move_date', '<=', today)
      .then(response => {
        moveDateExpiredPks = response.map(o => o.pc_pk);
        return cur('proceeding_contract_tbl')
          .update('pc_status', 5)
          .whereIn('pc_pk', moveDateExpiredPks);
      })
      .then(count => {
        moveDateExpiredPksTotalCount = count;
        const query = cur('proceeding_contract_tbl')
          .select('pc_pk')
          .where('pc_deleted', false)
          .andWhere('pc_status', 3)
          .andWhere('pc_construction_start_date', '<=', today);
        console.log(query.toSQL().toNative());
        return query;
      })
      .then(response => {
        constructionStartPks = response.map(o => o.pc_pk);
        return cur('proceeding_contract_tbl')
          .update('pc_status', 4)
          .whereIn('pc_pk', constructionStartPks);
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