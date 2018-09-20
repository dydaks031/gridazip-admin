const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const _ = require('underscore')
const moment = require('moment')

router.get('/construction', (req, res) => {
  const reqDate = moment(req.query.date, 'YYYY-MM').format('YYYY-MM-DD')
  let proceedingContractList = []

  knexBuilder.getConnection().then(cur => {
    cur.raw(`
      SELECT
        *
      FROM
        proceeding_contract_tbl pc
      WHERE
        (
          pc.pc_construction_start_date IS NOT NULL AND
          UNIX_TIMESTAMP(pc.pc_construction_start_date) <> 0
        ) AND
        (
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(pc.pc_construction_start_date, '%Y%m') AND
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(pc.pc_move_date, '%Y%m')
        )
      ORDER BY pc.pc_reg_dt desc;
    `, [reqDate, reqDate])
      .then(response => {
        proceedingContractList = response[0]
        const pcPkList = _.pluck(proceedingContractList, 'pc_pk')
        return cur({cl: 'checklist_tbl'})
          .select('cl.cl_pk', 'cl.cl_pcpk', 'cl.cl_date', 'cl.cl_ctpk', 'ct.ct_name', 'cl.cl_constructor', 'cl.cl_resource', 'cl.cl_memo')
          .innerJoin({ct: 'construction_tbl'}, 'cl.cl_ctpk', 'ct.ct_pk')
          .whereIn('cl_pcpk', pcPkList)
          .andWhere('cl_deleted', 0)
          .orderBy('cl.cl_date', 'cl.cl_ctpk')
      })
      .then(checkList => {
        _.forEach(proceedingContractList, (item) => {
          item.checkList = _.filter(checkList, (check) => {
            return check.cl_pcpk === item.pc_pk
          })
          _.map(item.checkList, (checkData) => {
            checkData.cl_date = moment(checkData.cl_date, 'X').format('YYYY-MM-DD')
          })
          const resourceCompletedCount = _.filter(item.checkList, (checkData) => {
            return checkData.cl_resource === 1
          }).length

          const constructorCompletedCount = _.filter(item.checkList, (checkData) => {
            return checkData.cl_constructor === 1
          }).length

          item.completedPercentage = (resourceCompletedCount + constructorCompletedCount) / (checkList.length * 2) * 100
        })
        res.json(
          resHelper.getJson(proceedingContractList)
        )
      })
      .catch(e => {
        res.json(
          resHelper.getError('Error')
        )
      })
  })
})

router.get('/construction/budget', (req, res) => {
  const reqDate = moment(req.query.date, 'YYYY-MM').format('YYYY-MM-DD')

  knexBuilder.getConnection().then(cur => {
    cur.raw(`
      # 특정 월에 해당하는 매출
      SELECT
        SUM(pc_budget) as sales 
      FROM
        proceeding_contract_tbl pc
      WHERE
          (
          pc.pc_construction_start_date IS NOT NULL AND
          UNIX_TIMESTAMP(pc.pc_construction_start_date) <> 0
        ) AND
        (
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(pc.pc_construction_start_date, '%Y%m') AND
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(pc.pc_move_date, '%Y%m')
        );
      `, [reqDate, reqDate])
      .then((response) => {
        const responseData = response[0][0]
        res.json(
          resHelper.getJson(responseData)
        )
      })
      .catch(e => {
        res.json(
          resHelper.getError('Error')
        )
      })
  })
})

module.exports = router;