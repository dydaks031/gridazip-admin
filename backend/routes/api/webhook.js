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
  const userChat = req.body.refers.userChat;

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
        console.log(response.length)
        console.log(insertData.ch_phone)
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
            rq_nickname: `채팅 상담 건 - 채팅 기록: https://desk.channel.io/#/channels/4680/user_chats/${userChat.id}`,
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

router.get('/channel-list', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('channel_access_log_tbl')
      .select('*')
      .where('ch_segment', '<>', 'lost')
        .then((response) => {
        res.json(resHelper.getJson({
          channel_list: response
        }));
      })
  });
})
module.exports = router;