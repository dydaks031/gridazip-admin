const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const FormatService = require('../../services/format/helper');
const cryptoHelper = require('../../services/crypto/helper');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const calc = require('calculator');

router.get('/', (req, res) => {
  let point = req.query.point;
  let pageIndex = req.query.page;
  let pageInst = new paginationService();
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
    pageInst.setPoint(point);
    pageInst.setPage(pageIndex);
    pageData = pageInst.get();
  }

  knexBuilder.getConnection().then(cur => {
    let query = cur('proceeding_contract_tbl')
      .select('*')
      .where('pc_deleted', false);

    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('pc_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['pc_pk']);
          }
        }

        list = response;
        list.map(item => {
          item.pc_phone = FormatService.toDashedPhone(cryptoHelper.decrypt(item.pc_phone));
          return item;
        });
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('proceeding_contract_tbl').count('* as count');
      })
      .then(response => {
        pageInst.setCount(response[0].count);

        res.json(
          resHelper.getJson({
            contractList: list,
            page: pageInst.get()
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('진행계약 목록을 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
        )
      });
  });
});


router.get('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first('*')
      .where({
        pc_pk: reqPk
      })
      .andWhere({
        pc_deleted: false
      })
      .then(response => {
        res.json(resHelper.getJson({
          contract: response
        }));
      })
      .catch(err => {
        console.error(err);
        res.json(resHelper.getError('[0001] 진행 계약건을 조회하는 중 오류가 발생하였습니다.'));
      })
  })
});

router.post('/', (req, res) => {
  const reqName = req.body.pc_name || '';
  const reqPhone = req.body.pc_phone || '';
  if (reqName.trim() === '') {
    res.json(resHelper.getError('고객명은 반드시 입력해야 합니다.'));
  }
  else if (reqPhone.trim() === '') {
    res.json(resHelper.getError('핸드폰번호는 반드시 입력해야 합니다.'));
  }
  else {
    let insertObj = {};
    insertObj.pc_name = reqName;
    insertObj.pc_phone = cryptoHelper.encrypt(reqPhone.split('-').join(''));
    insertObj.pc_size = req.body.pc_size || '';
    insertObj.pc_address_brief = req.body.pc_address_brief || '';
    insertObj.pc_address_detail = req.body.pc_address_detail || '';
    insertObj.pc_move_date = req.body.pc_move_date || '';
    insertObj.pc_budget = req.body.pc_budget || '';
    insertObj.pc_memo = req.body.pc_memo || '';

    knexBuilder.getConnection().then(cur => {
      insertObj.pc_recency = cur.raw('UNIX_TIMESTAMP() * -1');
      cur('proceeding_contract_tbl')
        .insert(insertObj)
        .then(() => {
          insertObj.pc_phone = cryptoHelper.decrypt(insertObj.pc_phone);
          delete insertObj.pc_recency;
          res.json(resHelper.getJson({
            msg: '진행 계약건이 정상적으로 추가되었습니다.',
            data: insertObj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 진행 계약건을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.pc_name || '';
  const reqPhone = req.body.pc_phone || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else if (reqName.trim() === '') {
    res.json(resHelper.getError('고객명은 반드시 입력해야 합니다.'));
  }
  else if (reqPhone.trim() === '') {
    res.json(resHelper.getError('핸드폰번호는 반드시 입력해야 합니다.'));
  }
  else {
    let updateObj = {};
    updateObj.pc_name = reqName;
    updateObj.pc_phone = cryptoHelper.encrypt(reqPhone.split('-').join(''));
    updateObj.pc_size = req.body.pc_size || '';
    updateObj.pc_address_brief = req.body.pc_address_brief || '';
    updateObj.pc_address_detail = req.body.pc_address_detail || '';
    updateObj.pc_move_date = req.body.pc_move_date || '';
    updateObj.pc_budget = req.body.pc_budget || '';
    updateObj.pc_memo = req.body.pc_memo || '';

    knexBuilder.getConnection().then(cur => {
      updateObj.pc_recency = cur.raw('UNIX_TIMESTAMP() * -1');
      cur('proceeding_contract_tbl')
        .update(updateObj)
        .where('pc_pk', reqPk)
        .then(() => {
          updateObj.pc_phone = cryptoHelper.decrypt(updateObj.pc_phone);
          res.json(resHelper.getJson({
            msg: '진행 계약건이 정상적으로 변경되었습니다.',
            data: updateObj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 진행 계약건을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.delete('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('proceeding_contract_tbl')
        .update({
          pc_deleted: true
        })
        .where('pc_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '진행 계약건이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 진행 계약건을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});



/* estimate */

router.get('/:pk([0-9]+)/estimate', (req, res) => {
  const reqPcPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {
    cur({'ed': 'estimate_detail_hst'})
      .select([
        'ed_pk',
        {place_name: 'pl.cp_name'},
        'ed_detail_place',
        'ct.ct_name',
        'cp.cp_name',
        'cpd.cpd_name',
        'rt.rt_name',
        'rs.rs_name',
        'ru.ru_name',
        'ed_input_value',
        'ed_resource_amount',
        'cpd.cpd_unit',
        cur.raw(`ed.ed_input_value * (cpd.cpd_labor_costs + rt.rt_extra_labor_costs) as labor_costs`),
        cur.raw(`ed.ed_resource_amount * rs.rs_price as resource_costs`)
      ])
      .where('ed_pcpk', reqPcPk)
      .leftJoin({pl: 'construction_place_tbl'}, 'ed.ed_place_pk', 'pl.cp_pk')
      .leftJoin({ct: 'construction_tbl'}, 'ed.ed_ctpk', 'ct.ct_pk')
      .leftJoin({cp: 'construction_process_tbl'}, 'ed.ed_cppk', 'cp.cp_pk')
      .leftJoin({cpd: 'construction_process_detail_tbl'}, 'ed.ed_cpdpk', 'cpd.cpd_pk')
      .leftJoin({rt: 'resource_type_tbl'}, 'ed.ed_rtpk', 'rt.rt_pk')
      .leftJoin({rs: 'resource_tbl'}, 'ed.ed_rspk', 'rs.rs_pk')
      .leftJoin({ru: 'resource_unit_tbl'}, 'rs.rs_rupk', 'ru.ru_pk')

      .orderBy('ed_pk')
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('상세견적 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:pk([0-9]+)/estimate', (req, res) => {
  const reqPcPk = req.params.pk || '';
  const reqPlacePk = req.body.ed_place_pk || '';
  const reqCtPk = req.body.ed_ctpk || '';
  const reqCpPk = req.body.ed_cppk || '';
  const reqCpdPk = req.body.ed_cpdpk || '';
  const reqRtPk = req.body.ed_rtpk || '';
  const reqRsPk = req.body.ed_rspk || '';
  const reqInputValue = req.body.ed_input_value || '';
  const reqDetailPlace = req.body.ed_detail_place || '';

  if (reqPcPk === '' || reqPlacePk === '' || reqCtPk === '' || reqCpPk === '' || reqCpdPk === '' || reqRtPk === '' || reqRsPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else if (reqInputValue.trim() === '') {
    res.json(resHelper.getError('입력 값은 반드시 입력해야 합니다.'));
  }
  else if (reqDetailPlace.trim() === '') {
    res.json(resHelper.getError('상세 공간은 반드시 입력해야 합니다.'));
  }
  else {
    let insertObj = {};
    let labor_costs;
    let resource_price;

    insertObj.ed_pcpk = reqPcPk;
    insertObj.ed_place_pk = reqPlacePk;
    insertObj.ed_ctpk = reqCtPk;
    insertObj.ed_cppk = reqCpPk;
    insertObj.ed_cpdpk = reqCpdPk;
    insertObj.ed_rtpk = reqRtPk;
    insertObj.ed_rspk = reqRsPk;
    insertObj.ed_input_value = reqInputValue;
    insertObj.ed_detail_place = reqDetailPlace;

    // 계약번호 공사위치 공사 공정 공정상세 자재군 자재 자재단위 인풋값
    // select cpd_labor_costs from construction_process_detail_tbl
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .first('rs_rupk', 'rs_price')
        .where({
          rs_pk: reqRsPk
        })
        .then(row => {
          resource_price = row.rs_price;

          return cur('resource_unit_tbl')
            .first('ru_name', 'ru_calc_expression')
            .where({
              ru_pk: row.rs_rupk
            })
        })
        .then(row => {
          let calcExpression = row.ru_calc_expression;

          const fn = calc.func(`f(x) = ${calcExpression}`);
          let resourceAmount = fn(reqInputValue);

          insertObj.ed_resource_amount = parseFloat(resourceAmount.toFixed(2));
          insertObj.ed_calculated_amount = parseFloat(resourceAmount.toFixed(2));
          insertObj.ed_recency = cur.raw('UNIX_TIMESTAMP() * -1');

          return cur('estimate_detail_hst')
            .insert(insertObj)
        })
        .then((response) => {
          delete insertObj.ed_recency;
          insertObj.ed_pk = response[0];

          return cur('construction_process_detail_tbl')
            .first('cpd_labor_costs')
            .where({
              cpd_pk: reqCpdPk
            })
        })
        .then(row => {
          labor_costs = row.cpd_labor_costs;

          return cur('resource_type_tbl')
            .first('rt_extra_labor_costs')
            .where({
              rt_pk: reqRtPk
            })
        })
        .then(row => {
          labor_costs += row.rt_extra_labor_costs;
          insertObj.labor_costs = labor_costs * reqInputValue;
          insertObj.resource_costs = resource_price * insertObj.ed_resource_amount;

          res.json(
            resHelper.getJson({
              msg: 'ok',
              data: insertObj
            })
          );
        })
        .catch(reason => {
          console.log(reason);
          res.json(
            resHelper.getError('상세 견적을 추가하는 중 문제가 발생했습니다.')
          );
        })
    })
  }
});

router.put('/:pcpk([0-9]+)/estimate/:pk([0-9]+)', (req, res) => {
  const reqEdPk = req.params.pk || '';
  const reqPlacePk = req.body.ed_place_pk || '';
  const reqCtPk = req.body.ed_ctpk || '';
  const reqCpPk = req.body.ed_cppk || '';
  const reqCpdPk = req.body.ed_cpdpk || '';
  const reqRtPk = req.body.ed_rtpk || '';
  const reqRsPk = req.body.ed_rspk || '';
  const reqInputValue = req.body.ed_input_value || '';
  const reqDetailPlace = req.body.ed_detail_place || '';

  if (reqPlacePk === '' || reqCtPk === '' || reqCpPk === '' || reqCpdPk === '' || reqRtPk === '' || reqRsPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  // else if (reqInputValue.trim() === '') {
  //   res.json(resHelper.getError('입력 값은 반드시 입력해야 합니다.'));
  // }
  // else if (reqDetailPlace.trim() === '') {
  //   res.json(resHelper.getError('상세 공간은 반드시 입력해야 합니다.'));
  // }
  else {

    let updateObj = {};

    updateObj.ed_place_pk = reqPlacePk;
    updateObj.ed_ctpk = reqCtPk;
    updateObj.ed_cppk = reqCpPk;
    updateObj.ed_cpdpk = reqCpdPk;
    updateObj.ed_rtpk = reqRtPk;
    updateObj.ed_rspk = reqRsPk;
    updateObj.ed_input_value = reqInputValue;
    updateObj.ed_detail_place = reqDetailPlace;

    // 계약번호 공사위치 공사 공정 공정상세 자재군 자재 자재단위 인풋값
    // select cpd_labor_costs from construction_process_detail_tbl
    knexBuilder.getConnection().then(cur => {
      cur('resource_tbl')
        .first('rs_rupk')
        .where({
          rs_pk: reqRsPk
        })
        .then(row => {
          return cur('resource_unit_tbl')
            .first('ru_name', 'ru_calc_expression')
            .where({
              ru_pk: row.rs_rupk
            })
        })
        .then(row => {
          let calcExpression = row.ru_calc_expression;

          const fn = calc.func(`f(x) = ${calcExpression}`);
          let resourceAmount = fn(reqInputValue);

          updateObj.ed_resource_amount = parseFloat(resourceAmount.toFixed(2));
          updateObj.ed_calculated_amount = parseFloat(resourceAmount.toFixed(2));

          return cur('estimate_detail_hst')
            .update(updateObj)
            .where('ed_pk', reqEdPk)
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok',
              data: updateObj
            })
          );
        })
        .catch(reason => {
          console.log(reason);
          res.json(
            resHelper.getError('상세 견적을 변경하는 중 문제가 발생했습니다.')
          );
        })
    })
  }
});

router.delete('/:pcpk([0-9]+)/estimate/:pk([0-9]+)', (req, res) => {
  const reqEdPk = req.params.pk || '';
  if (reqEdPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('estimate_detail_hst')
        .del()
        .where('ed_pk', reqEdPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상세견적 건이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상세견적 건을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});



router.get('/:pk([0-9]+)/estimate/general', (req, res) => {
  const reqPcPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
    select pl.cp_name as place_name,
           ct.ct_name,
           cp.cp_name,
           cpd.cpd_name,
           rt.rt_name,
           rs.rs_name,
           ed.ed_resource_amount resource_amount,
           ru.ru_name,
           rs.rs_price,
           ed.ed_resource_amount * rs.rs_price resource_costs,
           ed.ed_input_value,
           cpd.cpd_min_amount,
           ed.ed_input_value * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs) labor_costs
    
      from estimate_detail_hst ed
      left join construction_place_tbl pl on ed.ed_place_pk = pl.cp_pk
      left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
      left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
      left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
      left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
      left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
      left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
     where ed.ed_pcpk = ?
     group by ed.ed_pcpk, ed.ed_place_pk, ed.ed_cpdpk, ed.ed_rtpk
     order by 1,2,3,4,5,6
    `, reqPcPk)
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('상세견적서(인건비)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pk([0-9]+)/estimate/labor', (req, res) => {
  const reqPcPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
    select pl.cp_name as place_name,
           ct.ct_name,
           cp.cp_name,
           cpd.cpd_name,
           rt.rt_name,
           rs.rs_name,
           ed.ed_resource_amount resource_amount,
           ru.ru_name,
           rs.rs_price,
           ed.ed_resource_amount * rs.rs_price resource_costs,
           ed.ed_input_value,
           cpd.cpd_min_amount,
           ed.ed_input_value * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs) labor_costs
      from estimate_detail_hst ed
      left join construction_place_tbl pl on ed.ed_place_pk = pl.cp_pk
      left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
      left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
      left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
      left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
      left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
      left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
     where ed.ed_pcpk = ?
     group by ed.ed_pcpk, ed.ed_place_pk, ed.ed_cpdpk, ed.ed_rtpk
     order by 1,2,3,4,5,6
    `, reqPcPk)
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('상세견적서(인건비)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pk([0-9]+)/estimate/resource', (req, res) => {
  const reqPcPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
    select ed.ed_pcpk,
           pl.cp_name as place_name,
           rt.rt_name,
           rs.rs_name,
           rs.rs_price,
           sum(ed.ed_resource_amount) resource_amount,
           ru.ru_name,
           rs.rs_price * sum(ed.ed_resource_amount) total_price
      from estimate_detail_hst ed
      left join construction_place_tbl pl on ed.ed_place_pk = pl.cp_pk
      left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
      left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
      left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
      left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
      left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
      left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
     where ed.ed_pcpk = ?
     group by ed.ed_pcpk, ed.ed_place_pk, ed.ed_rtpk, ed.ed_rspk
     order by ed.ed_place_pk, ed.ed_rtpk, ed.ed_rspk
    `, reqPcPk)
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('상세견적서(자재)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

module.exports = router;