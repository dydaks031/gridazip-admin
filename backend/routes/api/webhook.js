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

  res.json(resHelper.getJson({
    msg: 'OK'
  }));
});

module.exports = router;