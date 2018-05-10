const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.get('/', (req, res) => {
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
        console.error(reason);
        res.json(
          resHelper.getError('협력업체를 조회하는 중 오류가 발생하였습니다.')
        );
      });
  });
});

router.get('/:pnpk([0-9]+)', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    let pn_pk = req.params.pnpk;

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
          res.json(
            resHelper.getJson({
              data: response[0]
            })
          )
        }
      })
      .catch(reason => {
        console.error(reason);
        res.json(
          resHelper.getError('협력업체를 조회하는 중 오류가 발생하였습니다.')
        );
      });
  });
});

router.delete('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('partner_tbl')
        .where({
          pn_pk: reqPk
        })
        .del()
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
        .catch(reason => {
          console.error(reason);
          res.json(
            resHelper.getError('상담내역을 삭제하는 중 오류가 발생하였습니다.')
          );
        });
    });
  }
});

module.exports = router;