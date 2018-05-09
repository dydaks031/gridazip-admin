const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/* 자재 분류*/

router.get('/category', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('resource_category_tbl')
      .select('rc_pk', 'rc_name', 'rc_order')
      .where('rc_deleted', false)
      .orderBy('rc_order')
      .then(response => {
        res.json(
          resHelper.getJson({
            categoryList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('자재 분류를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/category', (req, res) => {
  const reqName = req.body.name || '';
  if (reqName.trim() === '') {
    res.json(resHelper.getError('자재 분류명은 반드시 입력해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .max('rc_order as order')
        .then(res => {
          const order = res[0].order + 1;
          cur('resource_category_tbl')
            .insert({
              rc_name: reqName,
              rc_order: order
            })
            .then(() => {
              res.json(resHelper.getJson({
                msg: '자재 분류가 정상적으로 추가되었습니다.'
              }));
            })
            .catch(err => {
              console.error(err);
              res.json(resHelper.getError('[0001] 자재 분류를 추가하는 중 오류가 발생하였습니다.'));
            })
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0002] 자재 분류를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/category/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.name || '';
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .update({
          rc_name: reqName
        })
        .where('rc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사가 정상적으로 변경되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재 분류를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});
router.delete('/category/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .update({
          ct_deleted: true,
          ct_order: 0
        })
        .where('rc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재 분가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재 분류를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.put('/category/order', (req, res) => {
  const reqCategoryList = req.body.categoryList || '';
  if (reqCategoryList === '') {
    res.json(resHelper.getError('자재 분류 목록은 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
        const queries = [];
        reqCategoryList.forEach((obj, i) => {
          const query = cur.table('resource_category_tbl')
            .where('rc_pk', obj.rc_pk)
            .update({
              rc_order: i + 1,
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
            resHelper.getError('자재 분류 순서를 변경하는 중 오류가 발생하였습니다.')
          );
          console.error(err);
        });
    })
  }
});


/* 자재군 */

router.get('/type', (req, res) => {
  const reqPk = req.query.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .select('rt_pk', 'rt_name', 'rt_extra_labor_costs')
        .where('rt_rcpk',reqPk)
        .andWhere('rt_deleted', false)
        .orderBy('rt_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              typeList: response
            })
          );
        })
        .catch(err => {
          console.log(err);
          res.json(
            resHelper.getError('자재군 목록을 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});

router.post('/type', (req, res) => {
  const reqName = req.body.name || '';
  const reqRcPk = req.body.rcPk || '';
  const reqExtraLaborCosts = req.body.extraLaborCosts || '';
  if (reqName.trim() === '' || reqRcPk === '' || reqExtraLaborCosts === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .max('rc_order as order')
        .then(res => {
          const order = res[0].order + 1;
          cur('resource_category_tbl')
            .insert({
              rc_name: reqName,
              rc_order: order
            })
            .then(() => {
              res.json(resHelper.getJson({
                msg: '자재 분류가 정상적으로 추가되었습니다.'
              }));
            })
            .catch(err => {
              console.error(err);
              res.json(resHelper.getError('[0001] 자재 분류를 추가하는 중 오류가 발생하였습니다.'));
            })
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0002] 자재 분류를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/type/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.name || '';
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .update({
          rc_name: reqName
        })
        .where('rc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사가 정상적으로 변경되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재 분류를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});
router.delete('/type/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .update({
          ct_deleted: true,
          ct_order: 0
        })
        .where('rc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재 분가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재 분류를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});


/* 자재 */

router.get('/', (req, res) => {
  const reqPk = req.body.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('자재군 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .select('rs_pk', 'rs_name', 'rs_code', 'rs_price', 'rs_rupk')
        .where('rs_rtpk',reqPk)
        .andWhere('rs_deleted', false)
        .orderBy('rs_name')
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
            resHelper.getError('자재 목록을 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});



/* 자재단위 */

router.get('/unit', (req, res) => {
  const reqPk = req.body.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('자재분류 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .select('ru_pk', 'ru_name')
        .where('ru_rcpk',reqPk)
        .andWhere('ru_deleted', false)
        .orderBy('ru_name')
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
            resHelper.getError('자재단위를 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }

});
module.exports = router;