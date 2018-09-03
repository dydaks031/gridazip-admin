const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/* 자재 분류*/

router.post('/listener', (req, res) => {
  console.log(res.body)
});

module.exports = router;