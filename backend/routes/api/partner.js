const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');


router.get('/', (req, res) => {
  let point= req.query.point;
  let pageIndex = req.query.page;
  let pageInst = new paginationService();
  let filterInst = new filterService();
  let pageData = pageInst.get();

  if (pageInst.isEnd() === true) {
    res.json(
      resHelper.getJson({
        data: [],
        page: pageData.get()
      })
    );
    return;
  }

  if (point !== 'null' && pageIndex !== 'null') {
    pageInst.setPoint(point)
    pageInst.setPage(pageIndex)
    pageData = pageInst.get()
  }

  knexBuilder.getConnection().then(cur => {
    let query = cur('partner_tbl')
      .select('*')
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('rq_pk', '<=', pageData.point);
    }

    query = query.orderBy('pn_recency')


    query.then(response => {
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
            resHelper.getError('협력업체를 삭제하는 중 오류가 발생하였습니다.')
          );
        });
    });
  }
});

module.exports = router;