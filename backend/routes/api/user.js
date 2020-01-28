const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const jwtHelper = require('../../services/jwt/helper')
const appHelper= require('../../services/app/helper')

router.get('/', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('user_tbl')
      .select('user_pk', 'user_name')
      .whereNot('user_id', 'admin')
      .where('user_deleted', 0)
      .then(response => {
        res.json(
          resHelper.getJson({
            users: response
          })
        );
      })
  });
});


module.exports = router;
