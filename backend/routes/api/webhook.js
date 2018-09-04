const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/* 자재 분류*/

router.post('/listener', (req, res) => {
  console.log(req.body)
  const userInfo = req.body.refers.veil;
  const mobileNumber = userInfo.mobileNumber;

  if (!mobileNumber) {
    res.json(resHelper.getJson({
      msg: 'NOT INSERTED'
    }));
    return
  }

  const insertData = {
    ch_id: userInfo.id,
    ch_name: userInfo.name,
    ch_phone: userInfo.mobileNumber,
    ch_latitude: userInfo.latitude,
    ch_longitude: userInfo.longitude,
    ch_segment: userInfo.segment,
    ch_locale: userInfo.locale,
    ch_country: userInfo.country
  }
  console.log(JSON.stringify(insertData))

  knexBuilder.getConnection().then(cur => {
    cur('channel_access_log_tbl')
      .select('*')
      .where('ch_phone', userInfo.mobileNumber)
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
        console.log(response)

        res.json(resHelper.getJson({
          msg: 'OK'
        }));
      })
      .catch((e) => {
        console.log(e)
      })
  })
});

module.exports = router;