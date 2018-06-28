const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/* 공사 */
router.get('/', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('construction_tbl')
      .select('ct_pk', 'ct_name', 'ct_order')
      .where('ct_deleted', false)
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

router.post('/', (req, res) => {
  const reqName = req.body.ct_name || '';
  let obj = {};
  if (reqName.trim() === '') {
    res.json(resHelper.getError('공사명은 반드시 입력해야 합니다.'));
  }
  else {
    obj.ct_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_tbl')
        .max('ct_order as order')
        .then(response => {
          obj.ct_order = response[0].order + 1;
          cur('construction_tbl')
            .insert(obj)
            .then(() => {
              res.json(resHelper.getJson({
                msg: '공사가 정상적으로 추가되었습니다.',
                data: obj
              }));
            })
            .catch(err => {
              console.error(err);
              res.json(resHelper.getError('[0001] 공사를 추가하는 중 오류가 발생하였습니다.'));
            })
        })
        .catch(err => {
        console.error(err);
        res.json(resHelper.getError('[0002] 공사를 추가하는 중 오류가 발생하였습니다.'));
      })
    })
  }
});

router.put('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.ct_name || '';
  let obj = {};
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.ct_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_tbl')
        .update(obj)
        .where('ct_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사가 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공사를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});
router.delete('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_tbl')
        .update({
          ct_deleted: true,
          ct_order: 0
        })
        .where('ct_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공사를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.put('/order', (req, res) => {
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
          res.json(resHelper.getJson({
            msg: 'ok'
          }));
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

router.get('/place', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('construction_place_tbl')
      .select('cp_pk', 'cp_name', 'cp_order')
      .where('cp_deleted', false)
      .orderBy('cp_order')
      .then(response => {
        res.json(
          resHelper.getJson({
            constructionPlaceList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('공사 위치를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/place', (req, res) => {
  const reqName = req.body.cp_name || '';
  let obj = {};
  if (reqName.trim() === '') {
    res.json(resHelper.getError('공사위치는 반드시 입력해야 합니다.'));
  }
  else {
    obj.cp_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_place_tbl')
        .max('cp_order as order')
        .then(response => {
          obj.cp_order = response[0].order + 1;
          cur('construction_place_tbl')
            .insert(obj)
            .then(() => {
              res.json(resHelper.getJson({
                msg: '공사위치가 정상적으로 추가되었습니다.',
                data: obj
              }));
            })
            .catch(err => {
              console.error(err);
              res.json(resHelper.getError('[0001] 공사위치를 추가하는 중 오류가 발생하였습니다.'));
            })
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0002] 공사위치를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/place/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.cp_name || '';
  let obj = {};
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.cp_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_place_tbl')
        .update(obj)
        .where('cp_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사위치가 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공사위치를 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/place/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_place_tbl')
        .update({
          cp_deleted: true,
          cp_order: 0
        })
        .where('cp_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공사위치가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공사위치를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.put('/place/order', (req, res) => {
  const reqPlaceList = req.body.constructionPlaceList || '';
  if (reqPlaceList === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.transaction(function(trx) {
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
            res.json(resHelper.getJson({
              msg: 'ok'
            }));
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

router.get('/process', (req, res) => {
  const reqCtPk = req.query.ct_pk || '';
  if (reqCtPk === '') {
    res.json(resHelper.getError('공사 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_tbl')
        .select('cp_pk', 'cp_name')
        .where('cp_ctpk',reqCtPk)
        .andWhere('cp_deleted', false)
        .orderBy('cp_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              constructionProcessList: response
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
  }
});

router.post('/process', (req, res) => {
  const reqCtPk = req.body.ct_pk || '';
  const reqName = req.body.cp_name || '';
  let obj = {};

  if (reqName.trim() === '' || reqCtPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.cp_ctpk = reqCtPk;
    obj.cp_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_tbl')
        .insert(obj)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공정이 정상적으로 추가되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공정을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/process/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.cp_name || '';
  let obj = {};
  if (reqPk === '' || reqName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.cp_name = reqName.trim();
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_tbl')
        .update(obj)
        .where('cp_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공정이 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공정을 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/process/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_tbl')
        .update({
          cp_deleted: true
        })
        .where('cp_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '공정이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 공정을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

/* 공정상세 */

router.get('/process/detail', (req, res) => {
  const reqCpPk = req.query.cp_pk || '';
  if (reqCpPk === '') {
    res.json(resHelper.getError('공정 키는 반드시 전송해야 합니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_detail_tbl')
        .select('cpd_pk', 'cpd_name', 'cpd_labor_costs', 'cpd_min_amount', 'cpd_unit')
        .where('cpd_cppk',reqCpPk)
        .andWhere('cpd_deleted', false)
        .orderBy('cpd_name')
        .then(response => {
          res.json(
            resHelper.getJson({
              constructionProcessDetailList: response
            })
          );
        })
        .catch(err => {
          console.log(err);
          res.json(
            resHelper.getError('상세공정을 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});

router.post('/process/detail', (req, res) => {
  const reqName = req.body.cpd_name.trim() || '';
  const reqCpPk = req.body.cp_pk || '';
  const reqLaborCosts = req.body.cpd_labor_costs || '';
  const reqMinAmount = req.body.cpd_min_amount || 0;
  const reqUnit = req.body.cpd_unit || 0;
  let obj = {};

  if (reqName === '' || reqCpPk === '' || reqLaborCosts === '' || reqMinAmount ===  0) {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.cpd_name = reqName;
    obj.cpd_cppk = reqCpPk;
    obj.cpd_labor_costs = reqLaborCosts;
    obj.cpd_min_amount = reqMinAmount;
    obj.cpd_unit = reqUnit;

    knexBuilder.getConnection().then(cur => {
      cur('construction_process_detail_tbl')
        .insert(obj)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상세공정이 정상적으로 추가되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상세공정을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/process/detail/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.cpd_name || '';
  const reqLaborCosts = req.body.cpd_labor_costs || '';
  const reqMinAmount = req.body.cpd_min_amount || '';
  const reqUnit = req.body.cpd_unit || '';
  let obj = {};

  if (reqPk === '' || reqName === '' || reqLaborCosts === '' || reqMinAmount ===  '' || reqUnit === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    obj.cpd_name = reqName;
    obj.cpd_labor_costs = reqLaborCosts;
    obj.cpd_min_amount = reqMinAmount;
    obj.cpd_unit = reqUnit;

    knexBuilder.getConnection().then(cur => {
      cur('construction_process_detail_tbl')
        .update(obj)
        .where('cpd_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상세공정이 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상세공정을 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/process/detail/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('construction_process_detail_tbl')
        .update({
          cpd_deleted: true
        })
        .where('cpd_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상세공정이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상세공정을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

module.exports = router;