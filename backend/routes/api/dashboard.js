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
        estimate_tbl es
      WHERE
        (
          es.construction_start_date IS NOT NULL AND
          UNIX_TIMESTAMP(es.construction_start_date) <> 0
        ) AND
        (
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(es.construction_start_date, '%Y%m') AND
          DATE_FORMAT(?, '%Y%m') <= DATE_FORMAT(es.moving_date, '%Y%m')
        ) AND
        (
          es.status = 8 or es.status = 99
        )
      ORDER BY es.reg_dt desc;
    `, [reqDate, reqDate])
      .then(response => {
        proceedingContractList = response[0]
        const pcPkList = _.pluck(proceedingContractList, 'estimate_no')
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
            return check.cl_pcpk === item.estimate_no
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
        SUM(budget) as sales
      FROM
        estimate_tbl as es
      WHERE
          (
          es.construction_start_date IS NOT NULL AND
          UNIX_TIMESTAMP(es.construction_start_date) <> 0
        ) AND
        (
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(es.construction_start_date, '%Y%m') AND
          DATE_FORMAT(?, '%Y%m') >= DATE_FORMAT(es.moving_date, '%Y%m')
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
});

router.get('/construction/interested', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('estimate_tbl')
      .select(
        'estimate_no',
        'site_type',
        'supervisor',
        'counselor',
        's.user_name as supervisor_name',
        'c.user_name as counselor_name',
        'customer_name',
        'customer_nickname',
        'customer_phone_no',
        'space_size',
        'address',
        'address_detail',
        'construction_start_date',
        'moving_date',
        'budget',
        'memo',
        'etc_costs_ratio',
        'design_costs_ratio',
        'supervision_costs_ratio',
        'discount_amount',
        'status',
        'fail_reason',
        'password',
        'interested',
        'reg_dt')
        .leftJoin('user_tbl as s', 's.user_pk', 'estimate_tbl.supervisor')
        .leftJoin('user_tbl as c', 'c.user_pk', 'estimate_tbl.counselor')
        .where('deleted', false)
        .andWhere('interested', true)
        .then(async response => {
          let returnData = {};
          returnData = await Promise.all(response.map(async o => {
            const totalCosts = await cur('estimate_tbl')
                .first('etc_costs_ratio', 'design_costs_ratio', 'supervision_costs_ratio', 'discount_amount')
                .where('estimate_no', o.estimate_no)
                .then(row => {
                  return cur.raw(`
                    SELECT ifnull(resource_costs,0) as resource_costs,
                           ifnull(labor_costs,0) as labor_costs,
                           ceil(ifnull((resource_costs + labor_costs) * ${row.etc_costs_ratio},0)) as etc_costs,
                           ceil(ifnull((resource_costs + labor_costs) * ${row.design_costs_ratio},0)) as design_costs,
                           ceil(ifnull((resource_costs + labor_costs) * ${row.supervision_costs_ratio},0)) as supervision_costs,
                           ifnull(${row.discount_amount},0) as discount_amount
                      FROM (
                        SELECT sum(resource_costs) resource_costs
                          FROM (
                            SELECT rs.rs_price * ceil(sum(ed.ed_resource_amount)) AS resource_costs
                              FROM estimate_detail_hst ed
                             INNER JOIN estimate_sheet_tbl es on ed.ed_espk = es.es_pk
                              LEFT JOIN resource_tbl rs ON ed.ed_rspk = rs.rs_pk
                            WHERE es.es_pcpk = ?
                              AND es.es_is_pre = ?
                            GROUP BY ed.ed_rspk
                            ORDER BY rs.rs_name
                          ) resource
                      ) r,
                    (
                    SELECT sum(labor_costs) labor_costs
                      FROM (
                        SELECT CASE WHEN (sum(ed.ed_input_value) % cpd.cpd_min_amount = 0)
                                    THEN sum(ed.ed_input_value) * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)
                                    ELSE ( rt.rt_extra_labor_costs + cpd.cpd_labor_costs ) * ifnull( (sum(ed.ed_input_value) + cpd.cpd_min_amount - sum(ed.ed_input_value) % cpd.cpd_min_amount), 0)
                               END AS labor_costs
                        FROM estimate_detail_hst ed
                       INNER JOIN estimate_sheet_tbl es on ed.ed_espk = es.es_pk
                        LEFT JOIN construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
                        LEFT JOIN resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
                       WHERE es.es_pcpk = ?
                         AND es.es_is_pre = ?
                       GROUP BY ed.ed_cpdpk, ed.ed_rtpk
                      ) labor
                    ) l`, [o.estimate_no, 0 === 'true', o.estimate_no, 0 === 'true'])
                });
            let result = totalCosts[0][0];
            o.contractTotalCosts = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
            // console.log(receiptTotalQuery.toSQL().toNative());
            const receiptTotalCosts = await cur('receipt_tbl')
                .select(cur.raw('ifnull(sum(rc_price),0) as rc_price'))
                .where('rc_pcpk', o.estimate_no)
                .andWhere('rc_status', 3)
                .catch(e => e.name = 'dbError');

            if (!(receiptTotalCosts instanceof Error)) {
              o.receiptTotalCosts = receiptTotalCosts[0].rc_price;
            } else {
              o.receiptTotalCosts = 0;
            }

            const collectBills = await cur('collect_bills_tbl')
                .sum('cb_amount as amount')
                .where('cb_pcpk', o.estimate_no)
                .andWhere('cb_is_schedule', false)
                .groupBy('cb_pcpk');

            if (!(collectBills instanceof Error)) {
              console.log(collectBills)
              if (collectBills.length === 0) {
                o.collectBills = 0;
              } else {
                o.collectBills = collectBills[0].amount;
              }
            } else {
              o.collectBills = 0;
            }

            const collectSchedule = await cur('collect_bills_tbl')
                .sum('cb_amount as amount')
                .where('cb_pcpk', o.estimate_no)
                .andWhere('cb_is_schedule', true)
                .groupBy('cb_pcpk');

            if (!(collectSchedule instanceof Error)) {
              if (collectSchedule.length === 0) {
                o.collectSchedule = 0;
              } else {
                o.collectSchedule = collectSchedule[0].amount;
              }
            } else {
              o.collectSchedule = 0;
            }
            if (o.construction_start_date === '0000-00-00') o.construction_start_date = null;
            if (o.moving_date === '0000-00-00') o.moving_date = null;
            return o;

          }));

          console.log('returnDatareturnDatareturnDatareturnData')
          console.log(returnData)
          res.json(
              resHelper.getJson(returnData)
          );
        })
  })
});

module.exports = router;