const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('company_tbl')
      .orderBy('cp_recency')
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

router.post('/save/:cpid*?', (req, res) => {
  let cpid = req.params.cpid;

  let company_type = req.body.company_type || '';
  let company_name = req.body.company_name || '';

  let errorMsg = null;

  if (company_type === '') {
    errorMsg = '회사 타입은 반드시 선택해야 합니다.';
  }
  else if(company_name === '') {
    errorMsg = '회사 이름은 반드시 입력해야 합니다.';
  }
  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      if (cpid) {
        cur('company_tbl')
          .select('*')
          .where({
            cp_pk: cpid
          })
          .limit(1)
          .then(response => {
            if (response.length < 1) {
              res.json(
                resHelper.getError('수정할 회사가 존재하지 않습니다.')
              );
            }
            else {
              cpid = response[0].cp_pk;
              return cur('company_tbl')
                .where({
                  cp_pk: cpid
                })
                .update({
                  cp_type: company_type,
                  cp_name: company_name
                });
            }
          })
          .finally(() => {
            res.json(
              resHelper.getJson({
                msg: 'ok'
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
      else {
        cur('company_tbl')
          .returning('cp_pk')
          .insert({
            cp_type: company_type,
            cp_type: company_name,
            cp_recency: cur.raw('UNIX_TIMESTAMP() * -1')
          })
          .then(responses => {
            cpid = responses[0];
            res.json(
              resHelper.getJson({
                value: cpid
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
    });
  }
});

module.exports = router;