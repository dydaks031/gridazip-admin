const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const FormatService = require('../../services/format/helper');
const cryptoHelper = require('../../services/crypto/helper');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const smsHelper = require('../../services/sms/helper');
const calc = require('calculator');



/* proceeding contract */


// get customer's pk :start

router.post('/pk', (req, res) => {
  const reqPhone = req.body.phone || '';
  const reqPassword = req.body.password || '';

  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first('pc_pk')
      .where('pc_phone', cryptoHelper.encrypt(reqPhone))
      .andWhere('pc_password', reqPassword)
      .then(row => {
        if (!row) {
          res.json(resHelper.getError('일치하는 진행 계약이 없습니다.'));
        } else {
          res.json(
            resHelper.getJson({
              pc_pk: row.pc_pk
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
        res.json(resHelper.getError('오류가 발생하였습니다.'));
      })
  });
});

// get customer's pk :end


// proceeding contract CRUD :start

router.get('/', (req, res) => {
  const completed = req.query.completed || '0';
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
      .where('pc_deleted', false)
      .andWhere('pc_completed', completed);

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
        const item = response;
        item.pc_phone = FormatService.toDashedPhone(cryptoHelper.decrypt(item.pc_phone));
        item.pc_etc_costs_ratio = item.pc_etc_costs_ratio * 100 || 0.05 * 100;
        item.pc_design_costs_ratio = item.pc_design_costs_ratio * 100 || 0.10 * 100;
        item.pc_supervision_costs_ratio = item.pc_supervision_costs_ratio * 100 || 0.10 * 100;
        res.json(resHelper.getJson({
          contract: item
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

  const makeRandomNumber = digit => {
    let result = '';
    let cnt = 0;
    while (cnt < digit) {
      result += Math.floor(Math.random() * 10);
      cnt++;
    }
    return result;
  };

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
    insertObj.pc_password = makeRandomNumber(4);

    knexBuilder.getConnection().then(cur => {
      insertObj.pc_recency = cur.raw('UNIX_TIMESTAMP() * -1');
      cur('proceeding_contract_tbl')
        .insert({
          ...insertObj,
          pc_recency: cur.raw('UNIX_TIMESTAMP() * -1')
        })
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
    updateObj.pc_etc_costs_ratio = req.body.pc_etc_costs_ratio / 100 || 0.05;
    updateObj.pc_design_costs_ratio = req.body.pc_design_costs_ratio / 100 || 0.10;
    updateObj.pc_supervision_costs_ratio = req.body.pc_supervision_costs_ratio / 100 || 0.10;
    knexBuilder.getConnection().then(cur => {
      cur('proceeding_contract_tbl')
        .update(updateObj)
        .where('pc_pk', reqPk)
        .then(() => {
          updateObj.pc_phone = cryptoHelper.decrypt(updateObj.pc_phone);
          updateObj.pc_etc_costs_ratio  = updateObj.pc_etc_costs_ratio * 100;
          updateObj.pc_design_costs_ratio  = updateObj.pc_design_costs_ratio * 100;
          updateObj.pc_supervision_costs_ratio  = updateObj.pc_supervision_costs_ratio * 100;
          res.json(resHelper.getJson({
            msg: '진행 계약건이 정상적으로 변경되었습니다.',
            data: updateObj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 진행 계약건을 변경하는 중 오류가 발생하였습니다.'));
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

// proceeding contract CRUD :end


router.post('/:pcpk([0-9]+)/sms', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first('pc_name', 'pc_phone', 'pc_password')
      .where('pc_pk', reqPcPk)
      .then(row => {
        const smsMsg = `고객님의 비밀번호는 [${row.pc_password}]입니다. estimate.gridazip.com 에서 상세견적을 확인해보세요.`;
        console.log(smsMsg);
        console.log(cryptoHelper.decrypt(row.pc_phone));
        smsHelper.send(cryptoHelper.decrypt(row.pc_phone), smsMsg)
          .then(response => {
            console.log(response);
            res.json(
              resHelper.getJson(response)
            );
          })
          .catch(error => {
            console.error(error);
            res.json(
              resHelper.getError(error)
            );
          });
      })
      .catch(error => {
        console.error(error);
        res.json(
          resHelper.getError(error)
        );
      });
  });
});


/* estimate */



// tabs :start

router.get('/:pcpk([0-9]+)/estimate/tabs', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  knexBuilder.getConnection().then(cur => {
    cur('estimate_tbl')
      .select('es_pk', 'es_version')
      .where('es_pcpk', reqPcPk)
      .orderBy('es_version')
      .then(response => {
        res.json(
          resHelper.getJson({
            tabs: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:pcpk([0-9]+)/estimate/tabs', (req, res) => {
  const reqPcPk = req.params.pcpk || '';

  if (reqPcPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      const obj = {};
      cur('estimate_tbl')
        .max('es_version as version')
        .where('es_pcpk', reqPcPk)
        .then(response => {
          if (response[0].version) obj.es_version = response[0].version + 1;
          else obj.es_version = 1;

          obj.es_pcpk = reqPcPk;
          cur('estimate_tbl')
            .insert(obj)
            .then(response => {
              obj.es_pk = response[0];
              res.json(
                resHelper.getJson({
                  tab: obj
                })
              );
            });
        })
        .catch(err => {
          console.log(err);
          res.json(
            resHelper.getError('고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});

// tabs :end


// estimate CRUD :start

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)', (req, res) => {
  const reqEsPk = req.params.espk || '';

  knexBuilder.getConnection().then(cur => {
    cur({'ed': 'estimate_detail_hst'})
      .select([
        'ed_pk',
        {place_name: 'pl.cp_name'},
        'ed.ed_place_pk',
        'ed.ed_detail_place',
        'ed.ed_ctpk',
        'ct.ct_name',
        'ed.ed_cppk',
        'cp.cp_name',
        'ed.ed_cpdpk',
        'cpd.cpd_name',
        'rc.rc_pk',
        'rc.rc_name',
        'ed.ed_rtpk',
        'rt.rt_name',
        'rt.rt_sub',
        'ed.ed_rspk',
        'rs.rs_name',
        'rs.rs_code',
        'ed.ed_alias',
        'ru.ru_name',
        'ed.ed_input_value',
        'ed.ed_resource_amount',
        'cpd.cpd_unit',
        cur.raw(`ed.ed_input_value * (cpd.cpd_labor_costs + rt.rt_extra_labor_costs) as labor_costs`),
        cur.raw(`ed.ed_resource_amount * rs.rs_price as resource_costs`)
      ])
      .where('ed_espk', reqEsPk)
      .leftJoin({pl: 'construction_place_tbl'}, 'ed.ed_place_pk', 'pl.cp_pk')
      .leftJoin({ct: 'construction_tbl'}, 'ed.ed_ctpk', 'ct.ct_pk')
      .leftJoin({cp: 'construction_process_tbl'}, 'ed.ed_cppk', 'cp.cp_pk')
      .leftJoin({cpd: 'construction_process_detail_tbl'}, 'ed.ed_cpdpk', 'cpd.cpd_pk')
      .leftJoin({rt: 'resource_type_tbl'}, 'ed.ed_rtpk', 'rt.rt_pk')
      .leftJoin({rc: 'resource_category_tbl'}, 'rt.rt_rcpk', 'rc.rc_pk')
      .leftJoin({rs: 'resource_tbl'}, 'ed.ed_rspk', 'rs.rs_pk')
      .leftJoin({ru: 'resource_unit_tbl'}, 'rs.rs_rupk', 'ru.ru_pk')
      .orderBy('ed.ed_place_pk', 'ed_pk')
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

router.post('/:pcpk([0-9]+)/estimate/:espk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsPk = req.params.espk || '';
  const reqPlacePk = req.body.ed_place_pk || '';
  const reqCtPk = req.body.ed_ctpk || '';
  const reqCpPk = req.body.ed_cppk || '';
  const reqCpdPk = req.body.ed_cpdpk || '';
  const reqRcPk = req.body.rc_pk || '';
  const reqRtPk = req.body.ed_rtpk || '';
  const reqRsPk = req.body.ed_rspk || '';
  const reqInputValue = req.body.ed_input_value || '';
  const reqDetailPlace = req.body.ed_detail_place || '';
  const reqAlias = req.body.ed_alias || '';

  const cf = 1000;

  if (reqEsPk === '' || reqPlacePk === '' || reqCtPk === '' || reqCpPk === '' || reqCpdPk === '' || reqRtPk === '' || reqRsPk === '') {
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

    insertObj.ed_espk = reqEsPk;
    insertObj.ed_place_pk = reqPlacePk;
    insertObj.ed_ctpk = reqCtPk;
    insertObj.ed_cppk = reqCpPk;
    insertObj.ed_cpdpk = reqCpdPk;
    insertObj.ed_rtpk = reqRtPk;
    insertObj.ed_rspk = reqRsPk;
    insertObj.ed_input_value = reqInputValue;
    insertObj.ed_detail_place = reqDetailPlace;
    insertObj.ed_alias = reqAlias;

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
          insertObj.ed_resource_amount = parseFloat(resourceAmount).toFixed(2);
          insertObj.ed_calculated_amount = parseFloat(resourceAmount).toFixed(2);
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
          insertObj.rc_pk = reqRcPk;
          insertObj.labor_costs = labor_costs * (reqInputValue * cf) / cf;
          insertObj.resource_costs = resource_price * (insertObj.ed_resource_amount * cf) / cf;

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

router.put('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/:edpk([0-9]+)', (req, res) => {
  const reqEdPk = req.params.edpk || '';
  const reqPlacePk = req.body.ed_place_pk || '';
  const reqCtPk = req.body.ed_ctpk || '';
  const reqCpPk = req.body.ed_cppk || '';
  const reqCpdPk = req.body.ed_cpdpk || '';
  const reqRtPk = req.body.ed_rtpk || '';
  const reqRsPk = req.body.ed_rspk || '';
  const reqInputValue = req.body.ed_input_value || '';
  const reqDetailPlace = req.body.ed_detail_place || '';

  const cf = 1000;

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
    let resource_price;
    let labor_costs;

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

          updateObj.ed_resource_amount = parseFloat(resourceAmount).toFixed(2);
          updateObj.ed_calculated_amount = parseFloat(resourceAmount).toFixed(2);

          return cur('estimate_detail_hst')
            .update(updateObj)
            .where('ed_pk', reqEdPk)
        })
        .then(() => {

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
          updateObj.labor_costs = (labor_costs * (reqInputValue * cf) / cf).toFixed(0);
          updateObj.resource_costs = (resource_price * (updateObj.ed_resource_amount * cf) / cf).toFixed(0);

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

router.delete('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/:edpk([0-9]+)', (req, res) => {
  const reqEdPk = req.params.edpk || '';
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

// estimate CRUD :end


// estimate detail row's selectbox info :start

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/:edpk([0-9]+)', (req, res) => {
  const reqEdPk = req.params.edpk || '';

  let constructionPk;
  let constructionProcessPk;
  let constructionProcessDetailPk;
  let resourceCategoryPk;
  let resourceTypePk;
  let resourcePk;

  let constructionPlaceList;
  let constructionList;
  let constructionProcessList;
  let constructionProcessDetailList;
  let resourceCategoryList;
  let resourceTypeList;
  let resourceList;

  knexBuilder.getConnection().then(cur => {
    cur('estimate_detail_hst')
      .first('ed_ctpk', 'ed_cppk', 'ed_cpdpk', 'ed_rtpk', 'ed_rspk')
      .where('ed_pk', reqEdPk)
      .then(row => {
        constructionPk = row.ed_ctpk;
        constructionProcessPk = row.ed_cppk;
        constructionProcessDetailPk = row.ed_cpdpk;
        resourceTypePk = row.ed_rtpk;
        resourcePk = row.ed_rspk;

        return cur('construction_place_tbl')
          .select('cp_pk', 'cp_name', 'cp_order')
          .where('cp_deleted', false)
          .orderBy('cp_order')
      })
      .then(response => {
        constructionPlaceList = response;

        return cur('construction_tbl')
          .select('ct_pk', 'ct_name', 'ct_order')
          .where('ct_deleted', false)
          .orderBy('ct_order')
      })
      .then(response => {
        constructionList = response;

        return cur('construction_process_tbl')
          .select('cp_pk', 'cp_name')
          .where('cp_ctpk',constructionPk)
          .andWhere('cp_deleted', false)
          .orderBy('cp_name')
      })
      .then(response => {
        constructionProcessList = response;

        return cur('construction_process_detail_tbl')
          .select('cpd_pk', 'cpd_name', 'cpd_labor_costs', 'cpd_min_amount', 'cpd_unit')
          .where('cpd_cppk',constructionProcessPk)
          .andWhere('cpd_deleted', false)
          .orderBy('cpd_name')
      })
      .then(response => {
        constructionProcessDetailList = response;

        return cur('resource_type_tbl')
          .first('rt_rcpk')
          .where('rt_pk',resourceTypePk)
      })
      .then(row => {
        resourceCategoryPk = row.rt_rcpk;

        return cur('resource_category_tbl')
          .select('rc_pk', 'rc_name', 'rc_order')
          .where('rc_deleted', false)
          .orderBy('rc_order')
      })
      .then(response => {
        resourceCategoryList = response;

        return cur('resource_type_tbl')
          .select('rt_pk', 'rt_name', 'rt_extra_labor_costs')
          .where('rt_rcpk',resourceCategoryPk)
          .andWhere('rt_deleted', false)
          .orderBy('rt_order')
      })
      .then(response => {
        resourceTypeList = response;

        return cur('resource_tbl')
          .select('rs_pk', 'rs_name', 'rs_code', 'rs_price', 'rs_rupk')
          .where('rs_rtpk',resourceTypePk)
          .andWhere('rs_deleted', false)
          .orderBy('rs_name')
      })
      .then(response => {
        resourceList = response;

        res.json(
          resHelper.getJson({
            constructionPlaceList,
            constructionList,
            constructionProcessList,
            constructionProcessDetailList,
            resourceCategoryList,
            resourceTypeList,
            resourceList,
          })
        );
      })
  });
});

// estimate detail row's selectbox info :end


// total tab view query  :start

router.get('/:pcpk([0-9]+)/estimate/general', (req, res) => {
    const reqPcPk = req.params.pcpk || '';

    let resourceList;
    const cf = 1000;

    knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select rs.rs_pk,
             count(rs.rs_pk) as count,
             rs.rs_price,
             ceil(sum(ed.ed_resource_amount)) as ceil_resource_amount,
             sum(ed.ed_resource_amount) as resource_amount
        from estimate_detail_hst ed
       inner join estimate_tbl es on ed.ed_espk = es.es_pk
        left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
       where es.es_pcpk = ?
       group by ed.ed_rspk, ed.ed_alias
       order by rs.rs_name
    `, reqPcPk)
      .then(response => {
        resourceList = response[0].filter(resource => {
          if (resource.ceil_resource_amount !== resource.resource_amount) return true;
        });

        resourceList.map(resource => {
          resource.plus_value = Math.ceil((resource.ceil_resource_amount * cf - resource.resource_amount * cf) * resource.rs_price / resource.count / cf);
          return resource;
        });

        return cur.raw(`
          select pl.cp_name as place_name,
                 pl.cp_pk as place_pk,
                 ed.ed_detail_place as detail_place,
                 ct.ct_pk,
                 ct.ct_name,
                 cp.cp_name,
                 cp.cp_pk,
                 cpd.cpd_name,
                 rt.rt_name,
                 rt.rt_sub,
                 rs.rs_name,
                 rs.rs_pk,
                 rs.rs_code,
                 ed.ed_alias,
                 ed.ed_resource_amount resource_amount,
                 ru.ru_name,
                 rs.rs_price,
                 ed.ed_resource_amount * rs.rs_price resource_costs,
                 ed.ed_input_value,
                 cpd.cpd_min_amount,
                 ed.ed_input_value * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs) labor_costs
          
            from estimate_detail_hst ed
           inner join estimate_tbl es on ed.ed_espk = es.es_pk
            left join construction_place_tbl pl on ed.ed_place_pk = pl.cp_pk
            left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
            left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
            left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
            left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
            left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
            left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
           where es.es_pcpk = ?
           group by ed.ed_place_pk, ed.ed_cpdpk, ed.ed_rtpk, ed.ed_rspk
           order by pl.cp_pk, ct.ct_pk, cp.cp_pk, cpd.cpd_name, rt.rt_sub desc, rt.rt_name, rs.rs_name
          `, reqPcPk)

        })
        .then(response => {
          return response[0];
        })
        .map(row => {
          resourceList.forEach(resource => {
            if (resource.rs_pk === row.rs_pk) row.resource_costs += resource.plus_value;
          });
          return row;
        })
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
            resHelper.getError('상세견적서(공간별)를 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  });

router.get('/:pcpk([0-9]+)/estimate/labor', (req, res) => {
    const reqPcPk = req.params.pcpk || '';

    knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select ct.ct_name,
             ct.ct_pk,
             cp.cp_name,
             cp.cp_pk,
             cpd.cpd_name,
             cpd.cpd_pk,
             rt.rt_name,
             rt.rt_sub,
             rt.rt_extra_labor_costs + cpd.cpd_labor_costs labor_price,
             sum(ed.ed_input_value) input_value,
             cpd.cpd_min_amount,
             case when (sum(ed.ed_input_value) % cpd.cpd_min_amount = 0)
               then sum(ed.ed_input_value) * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)
               else ( rt.rt_extra_labor_costs + cpd.cpd_labor_costs ) * ifnull( (sum(ed.ed_input_value) + cpd.cpd_min_amount - sum(ed.ed_input_value) % cpd.cpd_min_amount), 0)
             end as labor_costs
        from estimate_detail_hst ed
       inner join estimate_tbl es on ed.ed_espk = es.es_pk
        left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
        left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
        left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
        left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
       where es.es_pcpk = ?
       group by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk
       order by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk
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

router.get('/:pcpk([0-9]+)/estimate/resource', (req, res) => {
    const reqPcPk = req.params.pcpk || '';

    knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select rs.rs_name,
             rs.rs_code,
             rs.rs_price,
             rc.rc_name,
             rc.rc_pk,
             ceil(sum(ed.ed_resource_amount)) as resource_amount,
             ru.ru_name,
             ed.ed_alias,
             rs.rs_price * ceil(sum(ed.ed_resource_amount)) as resource_costs
        from estimate_detail_hst ed
       inner join estimate_tbl es on ed.ed_espk = es.es_pk
        left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
        left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
        left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
        left join resource_category_tbl rc on rt.rt_rcpk = rc.rc_pk 
       where es.es_pcpk = ?
       group by ed.ed_rspk, ed.ed_alias
       order by rc.rc_pk, rs.rs_name
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

router.get('/:pcpk([0-9]+)/estimate/total', (req, res) => {
    const reqPcPk = req.params.pcpk || '';

    knexBuilder.getConnection().then(cur => {
      cur('proceeding_contract_tbl')
        .first('pc_etc_costs_ratio', 'pc_design_costs_ratio', 'pc_supervision_costs_ratio')
        .where('pc_pk', reqPcPk)
        .then(row => {
          cur.raw(`
          SELECT resource_costs,
                 labor_costs,
                 (resource_costs + labor_costs) * ${row.pc_etc_costs_ratio} as etc_costs,
                 (resource_costs + labor_costs) * ${row.pc_design_costs_ratio} as design_costs,
                 (resource_costs + labor_costs) * ${row.pc_supervision_costs_ratio} as supervision_costs
            FROM (
              SELECT sum(resource_costs) resource_costs
                FROM (
                  SELECT rs.rs_price * ceil(sum(ed.ed_resource_amount)) AS resource_costs
                    FROM estimate_detail_hst ed
                   INNER JOIN estimate_tbl es on ed.ed_espk = es.es_pk
                    LEFT JOIN resource_tbl rs ON ed.ed_rspk = rs.rs_pk
                  WHERE es.es_pcpk = ?
                  GROUP BY ed.ed_rspk
                  ORDER BY rs.rs_name
                ) resource
            ) r,
          (
          SELECT sum(labor_costs) labor_costs
            FROM (
              SELECT CASE WHEN (sum(ed.ed_input_value) % cpd.cpd_min_amount = 0)
                          THEN sum(ed.ed_input_value) * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)
                          ELSE ( rt.rt_extra_labor_costs + cpd.cpd_labor_costs ) * ifnull( (sum(ed.ed_input_value) + cpd.cpd_min_amount - sum(ed.ed_input_value) % cpd.cpd_min_amount), 0)
                     END AS labor_costs
              FROM estimate_detail_hst ed
             INNER JOIN estimate_tbl es on ed.ed_espk = es.es_pk
              LEFT JOIN construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
              LEFT JOIN resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
             WHERE es.es_pcpk = ?
             GROUP BY ed.ed_cpdpk, ed.ed_rtpk
            ) labor
          ) l
        `, [reqPcPk, reqPcPk])
          .then(response => {
            let totalCosts = response[0][0];
            totalCosts.total_costs = totalCosts.resource_costs + totalCosts.labor_costs + totalCosts.etc_costs + totalCosts.design_costs + totalCosts.supervision_costs;
            totalCosts.vat_costs = Math.ceil(totalCosts.total_costs * 10 / 100);
            totalCosts.total_costs_including_vat = Math.floor((totalCosts.total_costs + totalCosts.vat_costs) * 0.001) * 1000;
            res.json(
              resHelper.getJson({
                totalCosts
              })
            );
          })
          .catch(err => {
            console.log(err);
            res.json(
              resHelper.getError('[0002]총합금액을 조회하는 중 오류가 발생하였습니다.')
            );
          })
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('[0001]총합금액을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

// total tab view query  :end



// view query per tabs :start

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/general', (req, res) => {
  const reqEsPk = req.params.espk || '';

  let resourceList;
  const cf = 1000;

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select rs.rs_pk,
             count(rs.rs_pk) as count,
             rs.rs_price,
             ceil(sum(ed.ed_resource_amount)) as ceil_resource_amount,
             sum(ed.ed_resource_amount) as resource_amount
        from estimate_detail_hst ed
        left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
       where ed.ed_espk = ?
       group by ed.ed_rspk, ed.ed_alias
       order by rs.rs_name
    `, reqEsPk)
      .then(response => {
        resourceList = response[0].filter(resource => {
          if (resource.ceil_resource_amount !== resource.resource_amount) return true;
        });

        resourceList.map(resource => {
          resource.plus_value = Math.ceil((resource.ceil_resource_amount * cf - resource.resource_amount * cf) * resource.rs_price / resource.count / cf);
          return resource;
        });

        return cur.raw(`
          select pl.cp_name as place_name,
                 pl.cp_pk as place_pk,
                 ct.ct_pk,
                 ct.ct_name,
                 cp.cp_name,
                 cp.cp_pk,
                 cpd.cpd_name,
                 rt.rt_name,
                 rt.rt_sub,
                 rs.rs_name,
                 rs.rs_pk,
                 rs.rs_code,
                 ed.ed_alias,
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
           where ed.ed_espk = ?
           group by ed.ed_place_pk, ed.ed_cpdpk, ed.ed_rtpk, ed.ed_rspk
           order by 1,2,3,4,5,6
          `, reqEsPk)

      })
      .then(response => {
        return response[0];
      })
      .map(row => {
        resourceList.forEach(resource => {
          if (resource.rs_pk === row.rs_pk) row.resource_costs += resource.plus_value;
        });
        return row;
      })
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
          resHelper.getError('상세견적서(인건비)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/labor', (req, res) => {
  const reqEsPk = req.params.espk || '';

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select ct.ct_name,
             cp.cp_name,
             cpd.cpd_name,
             rt.rt_name,
             rt.rt_sub,
             rt.rt_extra_labor_costs + cpd.cpd_labor_costs labor_price,
             sum(ed.ed_input_value) input_value,
             cpd.cpd_min_amount,
             case when (sum(ed.ed_input_value) % cpd.cpd_min_amount = 0)
               then sum(ed.ed_input_value) * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)
               else ( rt.rt_extra_labor_costs + cpd.cpd_labor_costs ) * ifnull( (sum(ed.ed_input_value) + cpd.cpd_min_amount - sum(ed.ed_input_value) % cpd.cpd_min_amount), 0)
             end as labor_costs
        from estimate_detail_hst ed
        left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
        left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
        left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
        left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
       where ed.ed_espk = ?
       group by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk
       order by ed.ed_ctpk,ed.ed_cppk,ed.ed_cpdpk,ed.ed_rtpk
    `, reqEsPk)
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

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/resource', (req, res) => {
  const reqEsPk = req.params.espk || '';

  knexBuilder.getConnection().then(cur => {

    cur.raw(`
      select rs.rs_name,
             rs.rs_code,
             rs.rs_price,
             rc.rc_name,
             ceil(sum(ed.ed_resource_amount)) as resource_amount,
             ru.ru_name,
             ed.ed_alias,
             rs.rs_price * ceil(sum(ed.ed_resource_amount)) as resource_costs
        from estimate_detail_hst ed
        left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
        left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
        left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
        left join resource_category_tbl rc on rt.rt_rcpk = rc.rc_pk 
       where ed.ed_espk = ?
       group by ed.ed_rspk, ed.ed_alias
       order by rc.rc_pk, rs.rs_name
    `, reqEsPk)
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

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/total', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsPk = req.params.espk || '';

  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first('pc_etc_costs_ratio', 'pc_design_costs_ratio', 'pc_supervision_costs_ratio')
      .where('pc_pk', reqPcPk)
      .then(row => {
        cur.raw(`
          SELECT resource_costs,
                 labor_costs,
                 (resource_costs + labor_costs) * ${row.pc_etc_costs_ratio} as etc_costs,
                 (resource_costs + labor_costs) * ${row.pc_design_costs_ratio} as design_costs,
                 (resource_costs + labor_costs) * ${row.pc_supervision_costs_ratio} as supervision_costs
            FROM (
              SELECT sum(resource_costs) resource_costs
                FROM (
                  SELECT rs.rs_price * ceil(sum(ed.ed_resource_amount)) AS resource_costs
                  FROM estimate_detail_hst ed
                    LEFT JOIN resource_tbl rs ON ed.ed_rspk = rs.rs_pk
                  WHERE ed.ed_espk = ?
                  GROUP BY ed.ed_rspk
                  ORDER BY rs.rs_name
                ) resource
            ) r,
          (
          SELECT sum(labor_costs) labor_costs
            FROM (
              SELECT CASE WHEN (sum(ed.ed_input_value) % cpd.cpd_min_amount = 0)
                          THEN sum(ed.ed_input_value) * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)
                          ELSE ( rt.rt_extra_labor_costs + cpd.cpd_labor_costs ) * ifnull( (sum(ed.ed_input_value) + cpd.cpd_min_amount - sum(ed.ed_input_value) % cpd.cpd_min_amount), 0)
                     END AS labor_costs
              FROM estimate_detail_hst ed
              LEFT JOIN construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
              LEFT JOIN resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
             WHERE ed.ed_espk = ?
             GROUP BY ed.ed_cpdpk, ed.ed_rtpk
            ) labor
          ) l
        `, [reqEsPk, reqEsPk])
          .then(response => {
            let totalCosts = response[0][0];
            totalCosts.total_costs = totalCosts.etc_costs + totalCosts.design_costs + totalCosts.supervision_costs;
            totalCosts.vat_costs = Math.ceil(totalCosts.total_costs * 10 / 100);
            totalCosts.total_costs_including_vat = totalCosts.total_costs + totalCosts.vat_costs;
            res.json(
              resHelper.getJson({
                totalCosts
              })
            );
          })
          .catch(err => {
            console.log(err);
            res.json(
              resHelper.getError('[0002]총합금액을 조회하는 중 오류가 발생하였습니다.')
            );
          })
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('[0001]총합금액을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

// view query per tabs :end





/* constructor & correspondent  */


// constructor CRUD :start

router.get('/:pcpk([0-9]+)/constructor', (req, res) => {
  const reqPcPk = req.params.pk || '';
  knexBuilder.getConnection().then(cur => {
    cur({cr: 'constructor_tbl'})
      .select(
        'cc_pk',
        'cr_pk',
        'ct_pk',
        'ct_name',
        'cr_name',
        'cr_contact',
        'cr_communication_score',
        'cs_skill_score',
        'cs_memo')
      .innerJoin({cs: 'constructor_skill_tbl'}, 'cr.cr_pk', 'cs.cs_crpk')
      .innerJoin({cc: 'contract_constructor_tbl'}, function() {
        this.on('cc.cc_crpk','=','cs.cs_crpk').andOn('cc.cc_ctpk','=','cs.cs_ctpk')
      })
      .innerJoin({ct: 'construction_tbl'}, 'cs.cs_ctpk', 'ct.ct_pk')
      .where('cc.cc_pcpk', reqPcPk)
      .map(obj => {
        obj.cr_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(obj.cr_contact));
        return obj;
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            constructorList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('해당 진행계약의 기술자 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.post('/:pcpk([0-9]+)/constructor', (req, res) => {
  const reqPcPk = req.params.pk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqCrPk = req.body.cr_pk || '';

  if (reqCrPk === '' ||reqCtPk === '' ||reqCrPk === '') {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  } else {
    knexBuilder.getConnection().then(cur => {
      cur('contract_constructor_tbl')
        .insert({
          cc_pcpk: reqPcPk,
          cc_ctpk: reqCtPk,
          cc_crpk: reqCrPk
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
    });
  }
});

router.delete('/:pcpk([0-9]+)/constructor/:cspk([0-9]+)', (req, res) => {
  const reqCsPk = req.params.cspk || '';

  if (reqCsPk === '') {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  } else {
    knexBuilder.getConnection().then(cur => {
      cur('contract_constructor_tbl')
        .del()
        .where('cc_pk', reqCsPk)
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
        .catch(() => {
          res.json(
            resHelper.getError('매치한 기술자를 삭제하는 중 오류가 발생했습니다.')
          );
        })
    });
  }
});

// constructor CRUD :end


// correspondent CRUD :start

router.get('/:pcpk([0-9]+)/correspondent', (req, res) => {
  const reqPcPk = req.params.pk || '';
  knexBuilder.getConnection().then(cur => {
    cur({co: 'correspondent_tbl'})
      .select(
        'cco_pk',
        'co_pk',
        'rc_pk',
        'rc_name',
        'co_name',
        'co_contact',
        'co_manager_name',
        'co_location',
        'co_memo',
        'ci_brand')
      .innerJoin({ci: 'correspondent_item_tbl'}, 'co.co_pk', 'ci.ci_copk')
      .innerJoin({cco: 'contract_correspondent_tbl'}, function() {
        this.on('cco.cco_copk','=','ci.ci_copk').andOn('cco.cco_rcpk','=','ci.ci_rcpk')
      })
      .innerJoin({rc: 'resource_category_tbl'}, 'ci.ci_rcpk', 'rc.rc_pk')
      .where('cco.cco_pcpk', reqPcPk)
      .map(obj => {
        obj.cr_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(obj.co_contact));
        return obj;
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            correspondentList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('해당 진행계약의 거래처 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.post('/:pcpk([0-9]+)/correspondent', (req, res) => {
  const reqPcPk = req.params.pk || '';
  const reqRcPk = req.body.rc_pk || '';
  const reqCoPk = req.body.co_pk || '';

  if (reqPcPk === '' ||reqRcPk === '' ||reqCoPk === '') {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  } else {
    knexBuilder.getConnection().then(cur => {
      cur('contract_correspondent_tbl')
        .insert({
          cco_pcpk: reqPcPk,
          cco_rcpk: reqRcPk,
          cco_copk: reqCoPk
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        }).catch(() => {
          res.json(
            resHelper.getError('거래처를 매치하는 중 오류가 발생했습니다.')
          );
      })
    });
  }
});

router.delete('/:pcpk([0-9]+)/correspondent/:cipk([0-9]+)', (req, res) => {
  const reqCiPk = req.params.cipk || '';

  if (reqCiPk === '') {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  } else {
    knexBuilder.getConnection().then(cur => {
      cur('contract_correspondent_tbl')
        .del()
        .where('cco_pk', reqCiPk)
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
        .catch(() => {
          res.json(
            resHelper.getError('매치한 거래처를 삭제하는 중 오류가 발생했습니다.')
          );
        })
    });
  }
});

// correspondent CRUD :end


// construction & resource category per contract :start

router.get('/:pcpk([0-9]+)/construction', (req, res) => {
  const reqPcPk = req.params.pcpk;
  knexBuilder.getConnection().then(cur => {
    const subQuery = cur({ed:'estimate_detail_hst'}).select({'ct_pk': 'ed_ctpk'}).innerJoin({es:'estimate_tbl'}, 'ed.ed_espk', 'es.es_pk').where('es.es_pcpk', reqPcPk).groupBy('ct_pk');
    cur({ct:'construction_tbl'})
      .select('ed.ct_pk', 'ct.ct_name')
      .innerJoin({ed: subQuery}, 'ct.ct_pk', 'ed.ct_pk')
      .then(response => {
        res.json(
          resHelper.getJson({
            constructionList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('해당 진행계약의 공사 목록을 조회하는 중 오류가 발생했습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/resource', (req, res) => {
  const reqPcPk = req.params.pcpk;
  knexBuilder.getConnection().then(cur => {
    const edQuery = cur({ed:'estimate_detail_hst'}).select('ed_rtpk').innerJoin({es:'estimate_tbl'}, 'ed.ed_espk', 'es.es_pk').where('es.es_pcpk', reqPcPk).groupBy('ed_rtpk');
    const rtQuery = cur({rt: 'resource_type_tbl'}).select('rt_rcpk').innerJoin({ed: edQuery}, 'rt.rt_pk', 'ed.ed_rtpk').groupBy('rt_rcpk');
    const query = cur({rc:'resource_category_tbl'}).select('rc.rc_pk', 'rc.rc_name').innerJoin({a: rtQuery}, 'a.rt_rcpk', 'rc.rc_pk');

    query
      .then(response => {
        res.json(
          resHelper.getJson({
            correspondentList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('해당 진행계약의 거래처 목록을 조회하는 중 오류가 발생했습니다.')
        );
      })
  })
});

// construction & resource category per contract :end


module.exports = router;