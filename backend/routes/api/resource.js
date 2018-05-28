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
            resourceCategoryList: response
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
  const reqName = req.body.rc_name || '';
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
  const reqName = req.body.rc_name || '';
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
            msg: '자재 분류가 정상적으로 변경되었습니다.'
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
          rc_deleted: true,
          rc_order: 0
        })
        .where('rc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재 분류가 정상적으로 삭제되었습니다.'
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
  const reqResourceCategoryList = req.body.resourceCategoryList || '';
  if (reqResourceCategoryList === '') {
    res.json(resHelper.getError('자재 분류 목록은 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
        const queries = [];
        reqResourceCategoryList.forEach((obj, i) => {
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
          res.json(resHelper.getJson({
            msg: 'ok'
          }));
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
  const reqPk = req.query.rc_pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .select('rt_pk', 'rt_name', 'rt_extra_labor_costs')
        .where('rt_rcpk',reqPk)
        .andWhere('rt_deleted', false)
        .orderBy('rt_order')
        .then(response => {
          res.json(
            resHelper.getJson({
              resourceTypeList: response
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
  const reqName = req.body.rt_name || '';
  const reqRcPk = req.body.rc_pk || '';
  const reqExtraLaborCosts = req.body.rt_extra_labor_costs || '';
  if (reqName.trim() === '' || reqRcPk === '' || reqExtraLaborCosts === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .max('rt_order as order')
        .then(response => {
          const order = response[0].order + 1;
          cur('resource_type_tbl')
            .insert({
              rt_rcpk: reqRcPk,
              rt_name: reqName,
              rt_order: order,
              rt_extra_labor_costs: reqExtraLaborCosts
            })
            .then(() => {
              res.json(resHelper.getJson({
                msg: '자재군이 정상적으로 추가되었습니다.'
              }));
            })
            .catch(err => {
              console.error(err);
              res.json(resHelper.getError('[0001] 자재군을 추가하는 중 오류가 발생하였습니다.'));
            })
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0002] 자재군을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/type/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.rt_name || '';
  const reqExtraLaborCosts = req.body.rt_extra_labor_costs || '';
  if (reqPk === '' || reqName === '' || reqExtraLaborCosts === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .update({
          rt_name: reqName,
          rt_extra_labor_costs: reqExtraLaborCosts
        })
        .where('rt_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재군이 정상적으로 변경되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재군을 변경하는 중 오류가 발생하였습니다.'));
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
      cur('resource_type_tbl')
        .update({
          rt_deleted: true
        })
        .where('rt_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재군이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재군을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.put('/type/order', (req, res) => {
  const reqResourceTypeList = req.body.resourceTypeList || '';
  if (reqResourceTypeList === '') {
    res.json(resHelper.getError('자재군 목록은 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
        const queries = [];
        reqResourceTypeList.forEach((obj, i) => {
          const query = cur.table('resource_type_tbl')
            .where('rt_pk', obj.rt_pk)
            .update({
              rt_order: i + 1,
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
          res.json(resHelper.getJson({
            msg: 'ok'
          }));
        })
        .catch(function(err) {
          console.error(err);
          res.json(
            resHelper.getError('자재군 순서를 변경하는 중 오류가 발생하였습니다.')
          );
        });
    })
  }
});


/* 자재 */

router.get('/', (req, res) => {
  const reqRtPk = req.query.rt_pk || '';
  if (reqRtPk === '') {
    res.json(resHelper.getError('자재군 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .select('rs_pk', 'rs_name', 'rs_code', 'rs_price', 'rs_rupk')
        .where('rs_rtpk',reqRtPk)
        .andWhere('rs_deleted', false)
        .orderBy('rs_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              resourceList: response
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

router.post('/', (req, res) => {
  const reqRtPk = req.body.rt_pk || '';
  const reqName = req.body.rs_name || '';
  const reqRuPk = req.body.ru_pk || '';
  const reqCode = req.body.rs_code || '';
  const reqPrice = req.body.rs_price || '';
  if(reqRtPk === '' || reqName === '' || reqRuPk === '' || reqCode === '' || reqPrice === '' ) {
    res.json(resHelper.getError('필수 파라메터는 반드시 입력해야 합니다.'))
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .insert({
          rs_rtpk: reqRtPk,
          rs_rupk: reqRuPk,
          rs_name: reqName,
          rs_code: reqCode,
          rs_price: reqPrice
        })
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재가 정상적으로 추가되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.rs_name || '';
  const reqRuPk = req.body.rs_rupk || '';
  const reqCode = req.body.rs_code || '';
  const reqPrice = req.body.rs_price || '';

  if(reqName === '' || reqRuPk === '' || reqCode === '' || reqPrice === '' ) {
    res.json(resHelper.getError('필수 파라메터는 반드시 입력해야 합니다.'))
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .update({
          rs_rupk: reqRuPk,
          rs_name: reqName,
          rs_code: reqCode,
          rs_price: reqPrice
        })
        .where('rs_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재가 정상적으로 변경되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .update({
          rs_deleted: true
        })
        .where('rs_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});



/* 자재단위 */

router.get('/unit', (req, res) => {
  const reqRcPk = req.query.rc_pk || '';
  if (reqRcPk === '') {
    res.json(resHelper.getError('자재분류 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .select('ru_pk', 'ru_name', 'ru_calc_expression', 'ru_ceil_flag')
        .where('ru_rcpk',reqRcPk)
        .andWhere('ru_deleted', false)
        .orderBy('ru_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              resourceUnitList: response
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

router.post('/unit', (req, res) => {
  const reqName = req.body.ru_name || '';
  const reqRcPk = req.body.rc_pk || '';
  const reqCalcExpression = req.body.ru_calc_expression || '';
  const reqCeilFlag = req.body.ru_ceil_flag || '';
  if(reqName === '') {
    res.json(resHelper.getError('자재단위 명은 반드시 입력해야 합니다.'))
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .insert({
          ru_name: reqName,
          ru_rcpk: reqRcPk,
          ru_calc_expression: reqCalcExpression,
          ru_ceil_flag: reqCeilFlag
        })
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재단위가 정상적으로 추가되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재단위를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/unit/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.ru_name || '';
  const reqCalcExpression = req.body.ru_calc_expression || '';
  const reqCeilFlag = req.body.ru_ceil_flag || '';
  if (reqPk === '' || reqName === '' || reqCalcExpression === '' || reqCeilFlag === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .update({
          ru_name: reqName,
          ru_calc_expression: reqCalcExpression,
          ru_ceil_flag: reqCeilFlag
        })
        .where('ru_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재단위가 정상적으로 변경되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재단위를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/unit/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .update({
          ru_deleted: true
        })
        .where('ru_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재단위가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 자재단위를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

module.exports = router;