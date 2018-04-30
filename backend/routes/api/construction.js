const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const FormatService = require('../../services/format/helper');
const cryptoHelper = require('../../services/crypto/helper');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/* 공사 */

router.post('/list', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('construction_tbl')
      .select('ct_pk', 'ct_name', 'ct_order')
      .orderBy('ct_order')
      .then(response => {
        res.json(
          resHelper.getJson({
            constructionList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('공사를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/order/update', (req, res) => {
  const reqConstructionList = req.body.constructionList || '';
  if (reqConstructionList === '') {
    res.json(resHelper.getError('공사 목록은 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
        const queries = [];
        reqConstructionList.forEach((obj, i) => {
          const query = cur.table('construction_tbl')
            .where('ct_pk', obj.ct_pk)
            .update({
              ct_order: i + 1,
            })
            .transacting(trx);
          queries.push(query);
        });
        Promise.all(queries)
          .then(trx.commit)
          .catch(trx.rollback);
      })
        .then(function(updates) {
          console.log(updates.length + 'lines updated.');
        })
        .catch(function(err) {
          res.json(
            resHelper.getError('공사 순서를 변경하는 중 오류가 발생하였습니다.')
          );
          console.error(err);
        });
    })
  }
});

/* 공사 위치 */

router.post('/place/list', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('construction_place_tbl')
      .select('cp_pk', 'cp_name', 'cp_order')
      .orderBy('cp_order')
      .then(response => {
        res.json(
          resHelper.getJson({
            placeList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('공사 장소를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/place/order/update', (req, res) => {
  const reqPlaceList = req.body.placeList || '';
  if (reqPlaceList === '') {
    res.json(resHelper.getError('장소 목록은 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
          console.log(123123);
          const queries = [];
          reqPlaceList.forEach((obj, i) => {
            const query = cur.table('construction_place_tbl')
              .where('cp_pk', obj.cp_pk)
              .update({
                cp_order: i + 1,
              })
              .transacting(trx);
            queries.push(query);
          });
          Promise.all(queries)
            .then(trx.commit)
            .catch(trx.rollback);
        })
          .then(function(updates) {
            console.log(updates.length + 'lines updated.');
          })
          .catch(function(err) {
            res.json(
              resHelper.getError('공사 장소 순서를 변경하는 중 오류가 발생하였습니다.')
            );
            console.error(err);
          });
    })
  }
});


/* 공정 */

router.post('/process/list', (req, res) => {
  const reqCtPk = req.body.ctPk || '';
  if (reqCtPk === '') {
    res.json(resHelper.getError('공사 키는 반드시 전송해야 합니다.'));
  }
  knexBuilder.getConnection().then(cur => {
    cur('construction_process_tbl')
      .select('cp_pk', 'cp_name')
      .where({'cp_ctpk':reqCtPk})
      .orderBy('cp_name')
      .then(response => {
        res.json(
          resHelper.getJson({
            processList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('공사를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});



/* 공정상세 */

router.post('/process/detail/list', (req, res) => {
  const reqCpPk = req.body.cpPk || '';
  if (reqCpPk === '') {
    res.json(resHelper.getError('공정 키는 반드시 전송해야 합니다.'));
  }
  knexBuilder.getConnection().then(cur => {
    cur('construction_process_tbl')
      .select('cpd_pk', 'cpd_name')
      .where({'cpd_cppk':reqCpPk})
      .orderBy('cpd_name')
      .then(response => {
        res.json(
          resHelper.getJson({
            processDetailList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('공사를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});
module.exports = router;