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
  const isNamed = userInfo.named === true || userInfo.named === 'true'
  console.log(userInfo.profile)
  if (!mobileNumber || !isNamed) {
    res.json(resHelper.getJson({
      msg: 'NOT INSERTED'
    }));
    return
  }

  const insertData = {
    ch_id: userInfo.id,
    ch_name: userInfo.name,
    ch_phone: cryptoHelper.encrypt(userInfo.mobileNumber),
    ch_latitude: userInfo.latitude,
    ch_longitude: userInfo.longitude,
    ch_segment: userInfo.segment,
    ch_locale: userInfo.locale,
    ch_country: userInfo.country,
  }

  knexBuilder.getConnection().then(cur => {
    cur('channel_access_log_tbl')
      .select('*')
      .where('ch_phone', insertData.ch_phone)
      .then((response) => {
        if (response.length > 0) {
          return cur('channel_access_log_tbl')
            .update(insertData)
            .where('ch_pk', response[0].ch_pk)
        } else {
          return cur('channel_access_log_tbl')
            .insert(insertData)
        }
      })
      .then((response) => {

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