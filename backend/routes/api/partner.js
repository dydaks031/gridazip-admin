const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/list', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('partner_tbl')
      .orderBy('pn_recency')
      .then(response => {
        res.json(
          resHelper.getJson({
            data: response
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError(reason)
        );
      });
  });
});

router.post('/:pnpk([0-9]+)', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    let pn_pk = req.params.pnpk;
    let partner

    cur('partner_tbl')
      .where({
        pn_pk: pn_pk
      })
      .then(response => {
        if (response.length < 1) {
          res.json(
            resHelper.getError('해당 협력업체가 존재하지 않습니다.')
          );
        } else {
          console.log(response)
          partner = response[0]
        }
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            data: partner
          })
        )
      })
      .catch(reason => {
        console.error(reason)
        res.json(
          resHelper.getError(reason)
        );
      });
  });
});

module.exports = router;