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
        console.error(err);
        res.json(
          resHelper.getError('자재 분류를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/category', (req, res) => {
  const reqName = req.body.rc_name || '';
  let order;
  if (reqName.trim() === '') {
    res.json(resHelper.getError('자재 분류명은 반드시 입력해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('resource_category_tbl')
        .max('rc_order as order')
        .then(response => {
          order = response[0].order + 1;
          cur('resource_category_tbl')
            .insert({
              rc_name: reqName,
              rc_order: order
            })
            .returning('rc_pk')
            .then((response) => {
              res.json(resHelper.getJson({
                msg: '자재 분류가 정상적으로 추가되었습니다.',
                data: {
                  rc_pk: response[0],
                  rc_name: reqName,
                  rc_order: order
                }
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
            msg: '자재 분류가 정상적으로 변경되었습니다.',
            data: {
              rc_pk: reqPk,
              rc_name: reqName
            }
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
        .select('rt_pk', 'rt_name', 'rt_extra_labor_costs', 'rt_sub')
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
          console.error(err);
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
  const reqExtraLaborCosts = req.body.rt_extra_labor_costs || '0';
  const reqSub = req.body.rt_sub || '0';

  let obj = {};
  if (reqName.trim() === '' || reqRcPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.rt_rcpk = reqRcPk;
    obj.rt_name = reqName.trim();
    obj.rt_extra_labor_costs = reqExtraLaborCosts;
    obj.rt_sub = reqSub;
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .max('rt_order as order')
        .where('rt_rcpk', reqRcPk)
        .then(response => {
          obj.rt_order = response[0].order + 1;
          cur('resource_type_tbl')
            .insert(obj)
            .then(() => {
              res.json(resHelper.getJson({
                msg: '자재군이 정상적으로 추가되었습니다.',
                data: obj
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
  const reqExtraLaborCosts = req.body.rt_extra_labor_costs || '0';
  let obj = {};
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.rt_name = reqName.trim();
    obj.rt_extra_labor_costs = reqExtraLaborCosts;
    knexBuilder.getConnection().then(cur => {
      cur('resource_type_tbl')
        .update(obj)
        .where('rt_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재군이 정상적으로 변경되었습니다.',
            data: obj
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
          rt_deleted: true,
          rt_order: 0
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
      cur({rs: 'resource_tbl'})
        .select('rs.rs_pk', 'rs.rs_name', 'rs.rs_code', 'rs.rs_price', 'rs.rs_rupk', 'ru.ru_calc_expression')
        .innerJoin({ru: 'resource_unit_tbl'}, 'rs.rs_rupk', 'ru.ru_pk')
        .where('rs.rs_rtpk',reqRtPk)
        .andWhere('rs.rs_deleted', false)
        .orderBy('rs.rs_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              resourceList: response
            })
          );
        })
        .catch(err => {
          console.error(err);
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
  const reqRuPk = req.body.rs_rupk || '';
  const reqCode = req.body.rs_code || '';
  const reqPrice = req.body.rs_price || 0;
  let obj = {};
  if(reqRtPk === '' || reqName === '' || reqRuPk === '' || reqPrice === 0) {
    res.json(resHelper.getError('필수 파라메터는 반드시 입력해야 합니다.'))
  }
  else {
    obj.rs_rtpk = reqRtPk;
    obj.rs_rupk = reqRuPk;
    obj.rs_name = reqName;
    obj.rs_code = reqCode;
    obj.rs_price = reqPrice;
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .insert(obj)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재가 정상적으로 추가되었습니다.',
            data: obj
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
  const reqPrice = req.body.rs_price || 0;
  let obj = {};

  if(reqName === '' || reqRuPk === '' || reqPrice === 0 ) {
    res.json(resHelper.getError('필수 파라메터는 반드시 입력해야 합니다.'))
  }
  else {
    obj.rs_rupk = reqRuPk;
    obj.rs_name = reqName;
    obj.rs_code = reqCode;
    obj.rs_price = reqPrice;
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .update(obj)
        .where('rs_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재가 정상적으로 변경되었습니다.',
            data: obj
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
          console.error(err);
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
  let obj = {};

  if(reqName === '' || reqRcPk === '' || reqCalcExpression === '' || reqCeilFlag === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'))
  }
  else {
    obj.ru_name = reqName;
    obj.ru_rcpk = reqRcPk;
    obj.ru_calc_expression = reqCalcExpression;
    obj.ru_ceil_flag = reqCeilFlag;
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .insert(obj)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재단위가 정상적으로 추가되었습니다.',
            data: obj
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
  const reqCeilFlag = req.body.ru_ceil_flag || '0';
  let obj = {};
  console.log(reqPk, reqName, reqCalcExpression, reqCeilFlag)
  if (reqPk === '' || reqName === '' || reqCalcExpression === '' || reqCeilFlag === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.ru_name = reqName;
    obj.ru_calc_expression = reqCalcExpression;
    obj.ru_ceil_flag = reqCeilFlag;
    knexBuilder.getConnection().then(cur => {
      cur('resource_unit_tbl')
        .update(obj)
        .where('ru_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '자재단위가 정상적으로 변경되었습니다.',
            data: obj
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