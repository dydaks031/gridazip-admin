const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const cryptoHelper = require('../../services/crypto/helper');

/* 자재 분류*/

router.post('/listener', (req, res) => {
  console.log(req.body)
  const userInfo = req.body.refers.veil;
  const mobileNumber = userInfo.mobileNumber;
  let profile;
  let isUpdate = false
  let alreadyInserted = false

  if (userInfo.hasOwnProperty('profile')) {
    profile = userInfo.profile;
  }
  if (!mobileNumber) {
    res.json(resHelper.getJson({
      msg: 'NOT INSERTED'
    }));
    return
  }

  const insertData = {
    ch_id: userInfo.id,
    ch_name: userInfo.name,
    ch_phone: cryptoHelper.encrypt(userInfo.mobileNumber.split('-').join('').replace('+82', '0')),
    ch_latitude: userInfo.latitude,
    ch_longitude: userInfo.longitude,
    ch_segment: userInfo.segment,
    ch_locale: userInfo.locale,
    ch_country: userInfo.country,
  }

  knexBuilder.getConnection().then(cur => {
    cur('request_tbl')
      .select('*')
      .where('rq_phone', insertData.ch_phone)
      .then((response) => {
        console.log()
        if (response.length > 0) {
          alreadyInserted = true;
        }
      })

    cur('channel_access_log_tbl')
      .select('*')
      .where('ch_phone', insertData.ch_phone)
      .then((response) => {
        isUpdate = response.length > 0;
          if (isUpdate) {
          return cur('channel_access_log_tbl')
            .update(insertData)
            .where('ch_pk', response[0].ch_pk)
        } else {
          return cur('channel_access_log_tbl')
            .insert(insertData)
        }
      })
      .then((response) => {
        if (!isUpdate && insertData.ch_segment !== 'lost' && !alreadyInserted) {
          let size;

          if (profile.hasOwnProperty('size')) {
            size = '';
          } else if (profile.size < 20) {
            size = 'lt20';
          } else if (profile.size < 30) {
            size = 'eq20';
          } else if (profile.size < 40) {
            size = 'eq30';
          } else if (profile.size < 50) {
            size = 'eq40';
          } else if (profile.size < 60) {
            size = 'eq50';
          } else if (profile.size < 70) {
            size = 'eq60';
          } else if (profile.size >= 70) {
            size = 'gte70';
          }

          const requestInsertData = {
            rq_name: userInfo.name,
            rq_phone: cryptoHelper.encrypt(userInfo.mobileNumber.split('-').join('').replace('+82', '0')),
            rq_nickname: '',
            rq_family: '',
            rq_size: size,
            rq_address_brief: profile.address || '',
            rq_address_detail: '',
            rq_move_date: '',
            rq_budget: '',
            rq_place: '',
            rq_date: '',
            rq_time: '',
            rq_request: '',
            rq_memo: '',
            rq_construction_type: '',
            rq_consulting_result: '',
            rq_manager: '',
            rq_site_type: '',
          }
          requestInsertData.rq_recency = cur.raw('UNIX_TIMESTAMP() * -1');
          return cur('request_tbl')
            .insert(requestInsertData)
        } else {
          return response
        }
      })
      .then((response) => {
        res.json(resHelper.getJson({
          msg: 'OK'
        }));
      })
      .catch((e) => {
        console.log(e)
      })
  })
});

router.get('/channel/completed-list', (req, res) => {
  const reqStartDate = req.query.start_date
  const reqEndDate = req.query.end_date
  knexBuilder.getConnection().then(cur => {
    cur.raw(`
        SELECT
          DATE_FORMAT(ch_reg_dt, '%Y-%m-%d') as date,
          COUNT(*) as count
        FROM
          channel_access_log_tbl
        WHERE
          ch_reg_dt BETWEEN DATE_SUB(?, INTERVAL 1 DAY) AND DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY
          DATE_FORMAT(ch_reg_dt, '%Y-%m-%d')
        ORDER BY date DESC
      `, [reqStartDate, reqEndDate])
      .then((response) => {
        console.log(response)
        res.json(resHelper.getJson({
          channel_list: response[0]
        }));
      })
  });
})
module.exports = router;