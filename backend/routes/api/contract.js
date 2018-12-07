const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const FormatService = require('../../services/format/helper');
const cryptoHelper = require('../../services/crypto/helper');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const smsHelper = require('../../services/sms/helper');
const jwtHelper = require('../../services/jwt/helper');
const moment = require('moment');
const calc = require('calculator');
const knexnest = require('knexnest');



/* proceeding contract */


// get customer's pk :start

router.post('/pk', (req, res) => {
  const reqPhone = req.body.phone || '';
  const reqPassword = req.body.password || '';

  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first('pc_pk', 'pc_phone')
      .where('pc_phone', cryptoHelper.encrypt(cryptoHelper.decrypt(reqPhone)))
      .andWhere('pc_password', reqPassword)
      .andWhere('pc_deleted', false)
      .then(row => {
        if (!row) {
          res.json(resHelper.getError('일치하는 진행 계약이 없습니다.'));
        } else {

          res.json(
            resHelper.getJson({
              pc_pk: row.pc_pk,
              pc_phone: row.pc_phone
            })
          );
        }
      })
      .catch((err) => {
        console.error(err);
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
  let isNotUsingPage = req.query.isPage === false || req.query.isPage === 'false';
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
      .select(
        'pc_pk',
        'pc_supervisor',
        'user_name as pc_supervisor_name',
        'pc_name',
        'pc_nickname',
        'pc_phone',
        'pc_size',
        'pc_address_brief',
        'pc_address_detail',
        'pc_construction_start_date',
        'pc_move_date',
        'pc_budget',
        'pc_memo',
        'pc_etc_costs_ratio',
        'pc_design_costs_ratio',
        'pc_supervision_costs_ratio',
        'pc_discount_amount',
        'pc_status',
        'pc_fail_reason',
        'pc_password',
        'pc_completed',
        'pc_reg_dt',
        'pc_mod_dt'
      )
      .leftJoin('user_tbl', 'user_tbl.user_pk', 'proceeding_contract_tbl.pc_supervisor')
      .where('pc_deleted', false)
      .andWhere('pc_completed', completed)
      .orderBy('pc_recency');

    if (!isNotUsingPage) {
      query = query
        .limit(pageData.limit)
        .offset(pageData.page);

      if (pageData.point !== null) {
        query = query.where('pc_pk', '<=', pageData.point);
      }
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
        if (isNotUsingPage) {
          res.json(
            resHelper.getJson({
              contractList: list
            })
          );
          throw new Error('Ignore')
        } else {
          pageInst.setPage(pageData.page += list.length);
          pageInst.setLimit(pageData.limit);

          if (list.length < pageInst.limit) {
            pageInst.setEnd(true);
          }

          return cur('proceeding_contract_tbl').count('* as count');
        }
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
        if (err.message === 'Ignore') {
          return
        }
        console.error(err);
        res.json(
          resHelper.getError('진행계약 목록을 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
        )
      });
  });
});

router.get('/:pcpk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const contractFailReasonList = require('../../services/app/global').contractFailReasonList;
  knexBuilder.getConnection().then(cur => {
    cur('proceeding_contract_tbl')
      .first(
        'pc_pk',
        'pc_supervisor',
        'pc_name',
        'pc_nickname',
        'pc_phone',
        'pc_size',
        'pc_address_brief',
        'pc_address_detail',
        'pc_construction_start_date',
        'pc_move_date',
        'pc_budget',
        'pc_memo',
        'pc_etc_costs_ratio',
        'pc_design_costs_ratio',
        'pc_supervision_costs_ratio',
        'pc_discount_amount',
        'pc_status',
        'pc_fail_reason',
        'pc_password',
        'pc_completed',
        'pc_reg_dt',
        'pc_mod_dt'
      )
      .where({
        pc_pk: reqPcPk
      })
      .andWhere({
        pc_deleted: false
      })
      .then(response => {
        if (!response) {
          res.json(resHelper.getError('[0001] 존재하지 않는 고객입니다.'));
        }
        else {
          const item = response;
          item.pc_phone = FormatService.toDashedPhone(cryptoHelper.decrypt(item.pc_phone));
          item.pc_etc_costs_ratio = item.pc_etc_costs_ratio * 100 || 0.05 * 100;
          item.pc_design_costs_ratio = item.pc_design_costs_ratio * 100 || 0.10 * 100;
          item.pc_supervision_costs_ratio = item.pc_supervision_costs_ratio * 100 || 0.10 * 100;
          if (contractFailReasonList.indexOf(item.pc_fail_reason) < 0 && item.pc_fail_reason !== '' && item.pc_fail_reason !== null) {
            item.pc_fail_reason_text = item.pc_fail_reason;
            item.pc_fail_reason = '기타'
          }
          res.json(resHelper.getJson({
            contract: item
          }));
        }
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
    insertObj.pc_supervisor = req.body.pc_supervisor;
    insertObj.pc_size = req.body.pc_size || '';
    insertObj.pc_address_brief = req.body.pc_address_brief || '';
    insertObj.pc_address_detail = req.body.pc_address_detail || '';
    insertObj.pc_construction_start_date = req.body.pc_construction_start_date || '';
    insertObj.pc_move_date = req.body.pc_move_date || '';
    insertObj.pc_budget = req.body.pc_budget || '';
    insertObj.pc_memo = req.body.pc_memo || '';
    insertObj.pc_nickname = req.body.pc_nickname || '';
    insertObj.pc_password = makeRandomNumber(4);

    knexBuilder.getConnection().then(cur => {
      insertObj.pc_recency = cur.raw('UNIX_TIMESTAMP() * -1');
      cur('proceeding_contract_tbl')
        .insert({
          ...insertObj,
          pc_recency: cur.raw('UNIX_TIMESTAMP() * -1')
        })
        .then((response) => {
          insertObj.pc_phone = cryptoHelper.decrypt(insertObj.pc_phone);
          insertObj.pc_pk = response[0];
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

router.put('/:pcpk([0-9]+)', (req, res) => {
  const contractFailReasonList = require('../../services/app/global').contractFailReasonList;
  const reqPcPk = req.params.pcpk || '';
  const reqName = req.body.pc_name || '';
  const reqPhone = req.body.pc_phone || '';

  if (reqPcPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else if (reqName.trim() === '') {
    res.json(resHelper.getError('고객명은 반드시 입력해야 합니다.'));
  }
  else if (reqPhone.trim() === '') {
    res.json(resHelper.getError('핸드폰번호는 반드시 입력해야 합니다.'));
  }
  else {
    let beforeDC, afterDC;
    let updateObj = {};
    updateObj.pc_name = reqName;
    updateObj.pc_phone = cryptoHelper.encrypt(reqPhone.split('-').join(''));
    updateObj.pc_supervisor = req.body.pc_supervisor;
    updateObj.pc_size = req.body.pc_size || '';
    updateObj.pc_address_brief = req.body.pc_address_brief || '';
    updateObj.pc_address_detail = req.body.pc_address_detail || '';
    updateObj.pc_construction_start_date = req.body.pc_construction_start_date || '';
    updateObj.pc_move_date = req.body.pc_move_date || '';
    updateObj.pc_budget = req.body.pc_budget || '';
    updateObj.pc_memo = req.body.pc_memo || '';
    updateObj.pc_etc_costs_ratio = req.body.pc_etc_costs_ratio / 100 || 0.05;
    updateObj.pc_design_costs_ratio = req.body.pc_design_costs_ratio / 100 || 0.10;
    updateObj.pc_supervision_costs_ratio = req.body.pc_supervision_costs_ratio / 100 || 0.10;
    updateObj.pc_discount_amount = req.body.pc_discount_amount || null;
    updateObj.pc_status = req.body.pc_status || 0;
    updateObj.pc_fail_reason = (contractFailReasonList.indexOf(req.body.pc_fail_reason) < 0 ? req.body.pc_fail_reason_text : req.body.pc_fail_reason) || '';
    updateObj.pc_nickname = req.body.pc_nickname || '';
    updateObj.pc_status = getContractStatus(updateObj.pc_construction_start_date, updateObj.pc_move_date, updateObj.pc_status);

    knexBuilder.getConnection().then(cur => {
      cur('proceeding_contract_tbl')
        .first('pc_discount_amount')
        .where('pc_pk', reqPcPk)
        .then(row => {
          console.log(row)
          beforeDC = parseInt(row.pc_discount_amount || 0);
          afterDC = parseInt(updateObj.pc_discount_amount);
          return cur('proceeding_contract_tbl')
            .update(updateObj)
            .where('pc_pk', reqPcPk);
        })
        .then(() => {
          let query = null;
          if (afterDC !== beforeDC) {
            query = cur('collect_bills_tbl')
              .update({
                cb_amount: cur.raw('cb_amount + (??)', [beforeDC - afterDC])
              })
              .where('cb_pcpk', reqPcPk)
              .andWhere('cb_type', '조정')
          }
          updateObj.pc_phone = cryptoHelper.decrypt(updateObj.pc_phone);
          updateObj.pc_etc_costs_ratio  = updateObj.pc_etc_costs_ratio * 100;
          updateObj.pc_design_costs_ratio  = updateObj.pc_design_costs_ratio * 100;
          updateObj.pc_supervision_costs_ratio  = updateObj.pc_supervision_costs_ratio * 100;
          return query;
        })
        .then(() => {
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

router.delete('/:pcpk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  if (reqPcPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('proceeding_contract_tbl')
        .update({
          pc_deleted: true
        })
        .where('pc_pk', reqPcPk)
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
    cur('estimate_tbl')
      .count({count: 'es_pk'})
      .where('es_pcpk', reqPcPk)
      .then(response => {
        return response[0].count;
      })
      .then(count => {
        let smsMsg = '';
        cur('proceeding_contract_tbl')
          .first('pc_name', 'pc_phone', 'pc_password')
          .where('pc_pk', reqPcPk)
          .then(row => {
            if (count > 1) smsMsg = '견적서가 수정되었습니다. goo.gl/DU4v61 에서 변경사항을 확인해보세요.';
            else smsMsg = `고객님의 비밀번호는 [${row.pc_password}]입니다. goo.gl/DU4v61 에서 상세견적을 확인해보세요.`;
            smsHelper.send(cryptoHelper.decrypt(row.pc_phone), smsMsg)
              .then(() => {
                return cur('proceeding_contract_tbl')
                  .update('pc_status', 2)
                  .where('pc_pk', reqPcPk)
              })
              .then(() => {
                res.json(
                  resHelper.getJson({
                    msg: 'ok'
                  })
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
      })

  });
});


/* images */
router.get('/:pcpk([0-9]+)/image', (req, res) => {
  const reqPcPk = req.params.pcpk ;
  knexBuilder.getConnection().then(cur => {
    cur('site_image_tbl')
      .select('si_pk', 'si_pcpk', 'si_description', 'si_url', 'si_reg_dt')
      .where('si_pcpk', reqPcPk)
      .orderBy('si_recency')
      .then(response => {
        res.json(
          resHelper.getJson({
            siteImageList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('진행중인 계약의 현장사진을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.post('/:pcpk([0-9]+)/image', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const siImageList = req.body.si_image_list;

  let promises = [];

  knexBuilder.getConnection().then(cur => {
    siImageList.map((element, idx) => {
      // let target = portfolio_after.filter(target => {
      //     return target.index === element.index;
      // });
      // target = target.length > 0? target[0]:null;
      // if (target !== null) {
      promises.push(cur('site_image_tbl')
        .insert({
          ...element,
          si_pcpk: reqPcPk,
          si_recency: cur.raw('UNIX_TIMESTAMP() * -1')
        })
      );
      // }
    });

    Promise.all(promises)
      .then(response => {
        // console.log(response)
        res.json(
          resHelper.getJson({
            msg: '정상적으로 등록되었습니다.'
          })
        )
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('진행중인 계약의 현장사진을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.delete('/:pcpk([0-9]+)/image/:sipk([0-9]+)', (req, res) => {
  const reqSiPk = req.params.sipk;

  knexBuilder.getConnection().then(cur => {
    cur('site_image_tbl')
      .del()
      .where('si_pk', reqSiPk)
      .then(() => {
        res.json(resHelper.getJson({
          msg: '이미지가 정상적으로 삭제되었습니다.'
        }));
      })
      .catch(err => {
        console.error(err);
        res.json(resHelper.getError('[0001] 이미지를 삭제하는 중 오류가 발생하였습니다.'));
      })
  })
});


/* estimate */



// tabs :start

router.get('/:pcpk([0-9]+)/customer/estimate/tabs', (req, res) => {
  const reqPcPk = req.params.pcpk || '';

  knexBuilder.getConnection().then(cur => {
    let selectionFlag = true;
    cur('estimate_tbl')
      .count({count: 'es_pk'})
      .where('es_pcpk', reqPcPk)
      .andWhere('es_is_pre', false)
      .then(response => {
        if (response[0].count > 0) selectionFlag = false;
        return cur('estimate_tbl')
          .select('es_pk', 'es_version', 'es_is_pre', 'es_reg_dt')
          .where('es_pcpk', reqPcPk)
          .andWhere('es_is_pre', selectionFlag)
          .orderBy('es_version', 'desc')
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            tabs: response,
            selectionFlag
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/tabs', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsIsPre = req.query.es_is_pre || '';
  knexBuilder.getConnection().then(cur => {
    let selectionFlag = true;
    cur('estimate_tbl')
      .count({count: 'es_pk'})
      .where('es_pcpk', reqPcPk)
      .andWhere('es_is_pre', false)
      .then(response => {
        if (response[0].count > 0) selectionFlag = false;

        return cur('estimate_tbl')
          .select('es_pk', 'es_version', 'es_is_pre')
          .where('es_pcpk', reqPcPk)
          .andWhere('es_is_pre', reqEsIsPre === 'true')
          .orderBy('es_version')
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            tabs: response,
            selectionFlag
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:pcpk([0-9]+)/estimate/tabs', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsPk = req.body.es_pk || '';
  const reqEsIsPre = req.body.es_is_pre !== undefined ? req.body.es_is_pre : '';

  if (reqPcPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else if (reqEsIsPre === '') {
    res.json(resHelper.getError('가견적 여부는 필수입니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      const obj = {};
      cur('estimate_tbl')
        .max('es_version as version')
        .where('es_pcpk', reqPcPk)
        .andWhere('es_is_pre', reqEsIsPre)
        .then(response => {
          if (response[0].version) obj.es_version = response[0].version + 1;
          else obj.es_version = 1;

          obj.es_pcpk = reqPcPk;
          obj.es_is_pre = reqEsIsPre;

          cur.transaction(function(trx) {
            cur('estimate_tbl')
              .insert(obj)
              .transacting(trx)
              .then(response => {
                obj.es_pk = response[0];
                if (reqEsPk !== '') {
                  return cur(cur.raw('?? (??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??)',
                    ['estimate_detail_hst', 'ed_espk', 'ed_place_pk', 'ed_detail_place', 'ed_ctpk', 'ed_cppk', 'ed_cpdpk', 'ed_rtpk', 'ed_rspk', 'ed_input_value', 'ed_resource_amount', 'ed_calculated_amount', 'ed_alias', 'ed_recency']))
                    .insert(function () {
                      this.from('estimate_detail_hst as ed')
                        .where('ed.ed_espk', reqEsPk)
                        .select(obj.es_pk, 'ed_place_pk', 'ed_detail_place', 'ed_ctpk', 'ed_cppk', 'ed_cpdpk', 'ed_rtpk', 'ed_rspk', 'ed_input_value', 'ed_resource_amount', 'ed_calculated_amount', 'ed_alias', cur.raw('UNIX_TIMESTAMP() * -1'))
                    })
                    .transacting(trx)
                }
              })
              .then(() => {
                if (!reqEsIsPre) {
                  return cur('proceeding_contract_tbl')
                    .first('pc_construction_start_date', 'pc_move_date')
                    .where('pc_pk', obj.es_pcpk)
                    .then(row => {
                      return cur('proceeding_contract_tbl')
                        .update('pc_status', getContractStatus(row.pc_construction_start_date, row.pc_move_date, 3))
                        .where('pc_pk', obj.es_pcpk);
                    })
                } else {
                  changeContractStatusWhenPre(reqEsPk);
                  return null;
                }
              })
              .then(trx.commit)
              .catch(trx.rollback);
          })
            .then(() => {
              res.json(
                resHelper.getJson({
                  tab: obj
                })
              );
            })
            .catch(err => {
              console.error(err);
              res.json(
                resHelper.getError('[0001]고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
              );
            });

          return null;
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('[0002]고객의 탭 정보를 조회하는 중 오류가 발생하였습니다.')
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
      .orderBy(['ed.ed_place_pk', 'ed_pk'])
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('상세견적 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:pcpk([0-9]+)/estimate/master', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEstimateList = req.body.estimateList;

  knexBuilder.getConnection().then(cur => {
    let es_pk;
    let es_version;

    cur('estimate_tbl')
      .max('es_version as version')
      .where('es_pcpk', reqPcPk)
      .andWhere('es_is_pre', false)
      .then(response => {
        es_version = response[0].version + 1;
        cur.transaction(function(trx) {

          cur('estimate_tbl')
            .insert({
              es_pcpk: reqPcPk,
              es_version
            })
            .transacting(trx)
            .then(response => {
              const queries = [];
              es_pk = response[0];

              reqEstimateList.map(obj => {
                let o = {};
                o.ed_espk = es_pk;
                o.ed_place_pk = obj.ed_place_pk;
                o.ed_detail_place = obj.ed_detail_place;
                o.ed_ctpk = obj.ed_ctpk;
                o.ed_cppk = obj.ed_cppk;
                o.ed_cpdpk = obj.ed_cpdpk;
                o.ed_rtpk = obj.ed_rtpk;
                o.ed_rspk = obj.ed_rspk;
                o.ed_input_value = obj.ed_input_value;
                o.ed_alias = obj.ed_alias;
                o.ed_recency = cur.raw('UNIX_TIMESTAMP() * -1');
                queries.push(
                  cur('resource_tbl')
                    .first('rs_rupk', 'rs_price')
                    .where({
                      rs_pk: obj.ed_rspk
                    })
                    .then(row => {

                      return cur('resource_unit_tbl')
                        .first('ru_name', 'ru_calc_expression')
                        .where({
                          ru_pk: row.rs_rupk
                        })
                    })
                    .then(row => {
                      let fn = calc.func(`f(x) = ${row.ru_calc_expression}`);
                      let resourceAmount = fn(obj.ed_input_value);
                      if (parseFloat(resourceAmount).toFixed(2) !== obj.ed_calculated_amount.toString()) {
                        throw Error('[1001]부적절한 데이터입니다. 다시 시도해주세요.')
                      } else {
                        o.ed_calculated_amount = obj.ed_calculated_amount;
                        o.ed_resource_amount = obj.ed_resource_amount;
                      }
                      return o;
                    })
                    .then(obj => {
                      return cur('estimate_detail_hst')
                        .insert(obj)
                        .transacting(trx)
                    })
                );
              });

              return Promise.all(queries)
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .catch(trx.rollback)
        })
          .then(async () => {
            let bills;
            let total;
            let result;
            let currentBillsSum = 0;
            let currentEstimateSum = 0;
            let query = null;

            bills = await cur('collect_bills_tbl').sum('cb_amount as currentBillsSum').where('cb_pcpk', reqPcPk)
            total = await getContractTotalCosts(cur, reqPcPk, 0);
            result = total[0][0];
            currentEstimateSum = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
            currentBillsSum = bills[0].currentBillsSum;
            query = cur('collect_bills_tbl')
              .update({
                cb_amount: cur.raw('cb_amount + (??)', [currentEstimateSum - currentBillsSum ])
              })
              .where('cb_pcpk', reqPcPk)
              .andWhere('cb_type', '조정')

            return query;
          })
          .then(() => {
            res.json(resHelper.getJson({
              es_pk
            }));
          })
          .catch(err => {
            console.error(err);
            res.json(resHelper.getError('[0001] 상세견적서 신규 탭을 추가하는 중 오류가 발생하였습니다.'));
          });

        return null;
      })
      .catch(err => {
        console.error(err);
        res.json(resHelper.getError('[0002] 상세견적서 신규 탭을 추가하는 중 오류가 발생하였습니다.'));
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
          changeContractStatusWhenPre(reqEsPk);
          return cur('resource_type_tbl')
            .first('rt_extra_labor_costs')
            .where({
              rt_pk: reqRtPk
            })
        })
        .then(async row => {
          let bills;
          let total;
          let result;
          let currentBillsSum = 0;
          let currentEstimateSum = 0;
          let query = null;

          labor_costs += row.rt_extra_labor_costs;
          insertObj.rc_pk = reqRcPk;
          insertObj.labor_costs = labor_costs * (reqInputValue * cf) / cf;
          insertObj.resource_costs = resource_price * (insertObj.ed_resource_amount * cf) / cf;

          const estimate = await cur('estimate_tbl').first('es_is_pre').where('es_pk', reqEsPk);
          if (parseInt(estimate.es_is_pre) === 0) {
            bills = await cur('collect_bills_tbl').sum('cb_amount as currentBillsSum').where('cb_pcpk', reqPcPk)
            total = await getContractTotalCosts(cur, reqPcPk, 0);
            result = total[0][0];
            currentEstimateSum = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
            currentBillsSum = bills[0].currentBillsSum;
            query = cur('collect_bills_tbl')
              .update({
                cb_amount: cur.raw('cb_amount + (??)', [currentEstimateSum - currentBillsSum ])
              })
              .where('cb_pcpk', reqPcPk)
              .andWhere('cb_type', '조정')
          }
          return query;
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok',
              data: insertObj
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('상세 견적을 추가하는 중 문제가 발생했습니다.')
          );
        })
    })
  }
});

router.put('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/:edpk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEdPk = req.params.edpk || '';
  const reqEsPk = req.params.espk || '';
  const reqPlacePk = req.body.ed_place_pk || '';
  const reqCtPk = req.body.ed_ctpk || '';
  const reqCpPk = req.body.ed_cppk || '';
  const reqCpdPk = req.body.ed_cpdpk || '';
  const reqRtPk = req.body.ed_rtpk || '';
  const reqRsPk = req.body.ed_rspk || '';
  const reqInputValue = req.body.ed_input_value || 0;
  const reqDetailPlace = req.body.ed_detail_place || '';
  const reqResourceAmount = req.body.ed_resource_amount || 0;
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
    knexBuilder.getConnection().then(async cur => {
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
          if (parseFloat(reqInputValue) === 0) {
            updateObj.ed_calculated_amount = 0;
            updateObj.ed_resource_amount = parseFloat(reqResourceAmount).toFixed(2);
          } else {
            let calcExpression = row.ru_calc_expression;
            const fn = calc.func(`f(x) = ${calcExpression}`);
            let resourceAmount = fn(reqInputValue);

            updateObj.ed_resource_amount = parseFloat(resourceAmount).toFixed(2);
            updateObj.ed_calculated_amount = parseFloat(resourceAmount).toFixed(2);
          }

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
          changeContractStatusWhenPre(reqEsPk);
          return cur('resource_type_tbl')
            .first('rt_extra_labor_costs')
            .where({
              rt_pk: reqRtPk
            })
        })
        .then(async row => {
          let bills;
          let total;
          let result;
          let currentBillsSum = 0;
          let currentEstimateSum = 0;
          let query = null;
          labor_costs += row.rt_extra_labor_costs;
          updateObj.labor_costs = (labor_costs * (reqInputValue * cf) / cf).toFixed(0);
          updateObj.resource_costs = (resource_price * (updateObj.ed_resource_amount * cf) / cf).toFixed(0);

          const estimate = await cur('estimate_tbl').first('es_is_pre').where('es_pk', reqEsPk);
          if (parseInt(estimate.es_is_pre) === 0) {
            bills = await cur('collect_bills_tbl').sum('cb_amount as currentBillsSum').where('cb_pcpk', reqPcPk)
            total = await getContractTotalCosts(cur, reqPcPk, 0);
            result = total[0][0];
            currentEstimateSum = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
            currentBillsSum = bills[0].currentBillsSum;
            query = cur('collect_bills_tbl')
              .update({
                cb_amount: cur.raw('cb_amount + (??)', [currentEstimateSum - currentBillsSum ])
              })
              .where('cb_pcpk', reqPcPk)
              .andWhere('cb_type', '조정')
          }
          return query;
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok',
              data: updateObj
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('상세 견적을 변경하는 중 문제가 발생했습니다.')
          );
        })
    })
  }
});

router.delete('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/:edpk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEdPk = req.params.edpk || '';
  const reqEsPk = req.params.espk || '';
  if (reqEdPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('estimate_detail_hst')
        .del()
        .where('ed_pk', reqEdPk)
        .then(async () => {
          let bills;
          let total;
          let result;
          let currentBillsSum = 0;
          let currentEstimateSum = 0;
          let query = null;
          changeContractStatusWhenPre(reqEsPk);
          const estimate = await cur('estimate_tbl').first('es_is_pre').where('es_pk', reqEsPk);
          if (parseInt(estimate.es_is_pre) === 0) {
            bills = await cur('collect_bills_tbl').sum('cb_amount as currentBillsSum').where('cb_pcpk', reqPcPk)
            total = await getContractTotalCosts(cur, reqPcPk, 0);
            result = total[0][0];
            currentEstimateSum = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
            currentBillsSum = bills[0].currentBillsSum;
            query = cur('collect_bills_tbl')
              .update({
                cb_amount: cur.raw('cb_amount + (??)', [currentEstimateSum - currentBillsSum ])
              })
              .where('cb_pcpk', reqPcPk)
              .andWhere('cb_type', '조정')
          }
          return query;
        })
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상세견적 건이 정상적으로 삭제되었습니다.'
          }))
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상세견적 건을 삭제하는 중 오류가 발생하였습니다.'));
        })
    })
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

router.get('/:pcpk([0-9]+)/estimate/master/row', (req, res) => {
  const reqEdPk = req.params.edpk || '';

  let constructionPk = req.query.ct_pk;
  let constructionProcessPk = req.query.cp_pk;
  let resourceCategoryPk = req.query.rc_pk;
  let resourceTypePk = req.query.rt_pk;

  let constructionPlaceList;
  let constructionList;
  let constructionProcessList;
  let constructionProcessDetailList;
  let resourceCategoryList;
  let resourceTypeList;
  let resourceList;

  knexBuilder.getConnection().then(cur => {
    cur('construction_place_tbl')
      .select('cp_pk', 'cp_name', 'cp_order')
      .where('cp_deleted', false)
      .orderBy('cp_order')
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
  const reqEsIsPre = req.query.es_is_pre || '';

  if (reqEsIsPre === '') {
    res.json(resHelper.getError('가견적 여부는 필수입니다.'));
  }
  else {
    let resourceList;
    let laborList;
    const cf = 1000;

    knexBuilder.getConnection().then(cur => {

      cur.raw(`
        select rs_pk,
               ed_alias,
               ed_detail_place,
               count(rs_pk) as count,
               rs_price,
               sum(ed_resource_amount) as resource_amount,
               ceil(sum(ed_resource_amount)) ceil_resource_amount
          from (select rs_pk,
                       ed_alias,
                       ed_detail_place,
                       rs_price,
                       sum(ed_resource_amount) as ed_resource_amount
                  from estimate_detail_hst ed
                 inner join estimate_tbl es on ed.ed_espk = es.es_pk
                  left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
                 where es_pcpk = ?
                   and es_is_pre = ?
                 group by ed_rspk, ed_place_pk, ed_detail_place, ed_alias) sub
         group by rs_pk
         `, [reqPcPk, reqEsIsPre === 'true'])
        .then(response => {
          resourceList = response[0].filter(resource => {
            if (resource.ceil_resource_amount !== resource.resource_amount) return true;
          }).map(resource => {
            resource.plus_value = Math.ceil((resource.ceil_resource_amount * cf - resource.resource_amount * cf) * resource.rs_price / resource.count / cf);
            // console.log(`${resource.ceil_resource_amount} - ${resource.resource_amount} = ${(resource.ceil_resource_amount*100 - resource.resource_amount*100) / 100}  /  ${resource.count}  =  ${resource.plus_value}`);
            return resource;
          });

          return cur.raw(`
            select cpd_pk,
                   rt_pk,
                   ed_alias,
                   ed_detail_place,
                   count(*) as count,
                   sum(labor_costs) labor_costs,
                   case when (sum(ed_input_value) % cpd_min_amount = 0)
                        then sum(ed_input_value) * labor_price
                        else labor_price * ifnull( (sum(ed_input_value) + cpd_min_amount - sum(ed_input_value) % cpd_min_amount), 0)
                    end as ceil_labor_costs
              from (select cpd_pk,
                           rt_pk,
                           ed_alias,
                           ed_detail_place,
                           cpd_min_amount,
                           cpd_labor_costs + rt_extra_labor_costs as labor_price,
                           sum(ed_input_value) as ed_input_value,
                           sum(ed_input_value) * (cpd_labor_costs + rt_extra_labor_costs) as labor_costs
                      from estimate_detail_hst ed
                     inner join estimate_tbl es on ed.ed_espk = es.es_pk
                      left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
                      left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
                     where es_pcpk = ?
                       and es_is_pre = ?
                     group by ed_cpdpk, ed_rtpk, ed_place_pk, ed_detail_place, ed_alias) sub
             group by cpd_pk, rt_pk
            `, [reqPcPk, reqEsIsPre === 'true']);
        })
        .then(response => {
          laborList = response[0].filter(labor => {
            if (labor.ceil_labor_costs !== labor.labor_costs) return true;
          }).map(labor => {
            labor.plus_value = Math.ceil((labor.ceil_labor_costs - labor.labor_costs) / labor.count);
            // console.log(`${labor.ceil_labor_costs} - ${labor.labor_costs} = ${labor.ceil_labor_costs - labor.labor_costs}  /  ${labor.count}  =  ${labor.plus_value}`);
            return labor;
          });

          return cur.raw(`
          select pl.cp_name as place_name,
                 pl.cp_pk as place_pk,
                 ed.ed_detail_place as detail_place,
                 count(rt.rt_pk) rt_count,
                 count(cpd.cpd_pk) cpd_count,
                 ct.ct_pk,
                 ct.ct_name,
                 cp.cp_name,
                 cp.cp_pk,
                 cpd.cpd_pk,
                 cpd.cpd_name,
                 rt.rt_pk,
                 rt.rt_name,
                 rt.rt_sub,
                 rs.rs_name,
                 rs.rs_pk,
                 rs.rs_code,
                 ed.ed_alias,
                 sum(ed.ed_resource_amount) resource_amount,
                 ru.ru_name,
                 ru.ru_calc_expression,
                 rs.rs_price,
                 sum(ed.ed_resource_amount * rs.rs_price) resource_costs,
                 sum(ed.ed_input_value) ed_input_value,
                 ed.ed_alias,
                 cpd.cpd_min_amount,
                 sum(ed.ed_input_value * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)) labor_costs
          
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
             and es.es_is_pre = ?
           group by ed.ed_place_pk, ed.ed_detail_place, ed.ed_cpdpk, ed.ed_rtpk, ed.ed_rspk, ed_alias
           order by pl.cp_pk, ct.ct_pk, cp.cp_pk, cpd.cpd_name, rt.rt_sub desc, rt.rt_name, rs.rs_name  
          `, [reqPcPk, reqEsIsPre === 'true'])

        })
        .then(response => {
          return response[0];
        })
        .map(row => {
          resourceList.forEach(resource => {

            if (resource.rs_pk === row.rs_pk) {
              // console.log(`cpd_count : ${row.cpd_count}  rt_count : ${row.rt_count}`);
              // console.log(`${resource.rs_pk} ${row.rs_pk}  |  ${resource.ed_alias} ${row.ed_alias}  |  ${resource.ed_detail_place} ${row.detail_place}`);
              // console.log(`plus_value : ${resource.plus_value}  resource_count : ${resource.count}`);
              // console.log('________________________________________________________');
              row.resource_costs += resource.plus_value;
            }
          });
          laborList.forEach(labor => {
            // console.log(`cpd_pk : (${typeof labor.cpd_pk})[${labor.cpd_pk}] (${typeof row.cpd_pk})[${row.cpd_pk}]  /  rt_pk : (${typeof labor.rt_pk})[${labor.rt_pk}] (${typeof row.rt_pk})[${row.rt_pk}]  /  ed_alias : (${typeof labor.ed_alias})[${labor.ed_alias}] (${typeof row.ed_alias})[${row.ed_alias}]  /  ed_detail_place : (${typeof labor.ed_detail_place})[${labor.ed_detail_place}] (${typeof row.detail_place})[${row.detail_place}]`);
            if (labor.cpd_pk === row.cpd_pk && labor.rt_pk === row.rt_pk) {
              // console.log(`cpd_pk : (${typeof labor.cpd_pk})[${labor.cpd_pk}] (${typeof row.cpd_pk})[${row.cpd_pk}]  /  rt_pk : (${typeof labor.rt_pk})[${labor.rt_pk}] (${typeof row.rt_pk})[${row.rt_pk}]  /  ed_alias : (${typeof labor.ed_alias})[${labor.ed_alias}] (${typeof row.ed_alias})[${row.ed_alias}]  /  ed_detail_place : (${typeof labor.ed_detail_place})[${labor.ed_detail_place}] (${typeof row.detail_place})[${row.detail_place}]`);
              row.labor_costs += labor.plus_value;
            }
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
          console.error(err);
          res.json(
            resHelper.getError('상세견적서(공간별)를 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});

router.get('/:pcpk([0-9]+)/estimate/labor', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsIsPre = req.query.es_is_pre || '';

  if (reqEsIsPre === '') {
    res.json(resHelper.getError('가견적 여부는 필수입니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur.raw(`
      select ct.ct_name,
             ct.ct_pk,
             cp.cp_name,
             cp.cp_pk,
             cpd.cpd_name,
             cpd.cpd_pk,
             cpd.cpd_unit,
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
         and es.es_is_pre = ?
       group by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk
       order by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk`, [reqPcPk, reqEsIsPre === 'true'])
        .then(response => {
          res.json(
            resHelper.getJson({
              estimateList: response[0]
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('상세견적서(인건비)를 조회하는 중 오류가 발생하였습니다.')
          );
        })
    })
  }
});

router.get('/:pcpk([0-9]+)/estimate/resource', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsIsPre = req.query.es_is_pre || '';

  if (reqEsIsPre === '') {
    res.json(resHelper.getError('가견적 여부는 필수입니다.'));
  }
  else {
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
         and es.es_is_pre = ?
       group by ed.ed_rspk, ed.ed_alias
       order by rc.rc_pk, rs.rs_name
    `, [reqPcPk, reqEsIsPre === 'true'])
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('상세견적서(자재)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
    })
  }
});

router.get('/:pcpk([0-9]+)/estimate/total', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsIsPre = req.query.es_is_pre || '';

  if (reqEsIsPre === '') {
    res.json(resHelper.getError('가견적 여부는 필수입니다.'));
  }
  else {
    knexBuilder.getConnection().then(async cur => {
      const response = await getContractTotalCosts(cur, reqPcPk, reqEsIsPre);
      if (response instanceof Error && response.name === 'functionError') {
        console.error(response);
        res.json(
          resHelper.getError(response.message)
        );
      }
      else {
        let totalCosts = response[0][0];
        totalCosts.total_costs = Math.floor((totalCosts.resource_costs + totalCosts.labor_costs + totalCosts.etc_costs + totalCosts.design_costs + totalCosts.supervision_costs) * 0.001) * 1000;
        totalCosts.vat_costs = Math.ceil(totalCosts.total_costs * 10 / 100);
        totalCosts.total_costs_including_vat = totalCosts.total_costs + totalCosts.vat_costs;
        res.json(
          resHelper.getJson({
            totalCosts
          })
        )
      }
    })
  }
});

// total tab view query  :end



// view query per tabs :start
router.get('/:pcpk([0-9]+)/estimate/master', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  knexBuilder.getConnection().then(cur => {
    const query = cur.raw(`
      select pl.cp_name as place_name,
             ed.ed_detail_place,
             pl.cp_pk as ed_place_pk,
             ct.ct_pk as ed_ctpk,
             ct.ct_name,
             cp.cp_name,
             cp.cp_pk as ed_cppk,
             cpd.cpd_pk as ed_cpdpk,
             cpd.cpd_name,
             cpd.cpd_labor_costs,
             rc.rc_pk,
             rc.rc_name,
             rt.rt_pk as ed_rtpk,
             rt.rt_name,
             rt.rt_extra_labor_costs,
             rt.rt_sub,
             rs.rs_name,
             rs.rs_pk as ed_rspk,
             rs.rs_code,
             ed.ed_alias,
             sum(ed.ed_resource_amount) resource_amount,
             ru.ru_name,
             ru.ru_calc_expression,
             rs.rs_price,
             sum(ed.ed_resource_amount * rs.rs_price) resource_costs,
             sum(ed.ed_input_value) ed_input_value,
             ed.ed_alias,
             cpd.cpd_min_amount,
             sum(ed.ed_input_value * (rt.rt_extra_labor_costs + cpd.cpd_labor_costs)) labor_costs
      
        from estimate_detail_hst ed
       inner join estimate_tbl es on ed.ed_espk = es.es_pk
        left join construction_place_tbl pl on ed.ed_place_pk = pl.cp_pk
        left join construction_tbl ct on ed.ed_ctpk = ct.ct_pk
        left join construction_process_tbl cp on ed.ed_cppk = cp.cp_pk
        left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
        left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
        left join resource_category_tbl rc on rt.rt_rcpk = rc.rc_pk
        left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
        left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
       where es.es_pcpk = ?
         and es.es_is_pre = false
       group by ed.ed_place_pk, ed_detail_place, ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk, ed.ed_rspk, ed_alias
       order by pl.cp_name, ct.ct_pk, cp.cp_pk, cpd.cpd_name, rt.rt_name, rs.rs_name, ed.ed_alias
      `, reqPcPk);
    // console.log(query.toString());

    query
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('상세견적서(master)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/general', (req, res) => {
  const reqEsPk = req.params.espk || '';
  const reqFullMode = req.query.fullMode || '0';

  let resourceList;
  let laborList;
  const cf = 1000;

  knexBuilder.getConnection().then(cur => {
    const subQuery = cur('estimate_tbl').select('es_pcpk').where('es_pk', reqEsPk);
    let arrEsPk = [];

    cur('estimate_tbl')
      .select('es_pk', 'es_version')
      .where('es_pcpk', subQuery)
      .andWhere('es_is_pre', false)
      .orderBy(['es_is_pre', 'es_pk'])
      .then(response => {
        if (response.length < 2) {
          arrEsPk.push(reqEsPk);
        } else {
          arrEsPk = response.filter(obj => obj.es_pk <= reqEsPk).map(obj => `'${obj.es_pk}'`);
        }
        return arrEsPk;
      })
      .then(arrEsPk => {

        return cur.raw(`
          select rs_pk,
                 ed_alias,
                 ed_detail_place,
                 count(rs_pk) as count,
                 rs_price,
                 sum(ed_resource_amount) as resource_amount,
                 ceil(sum(ed_resource_amount)) ceil_resource_amount
            from (select rs_pk,
                         ed_alias,
                         ed_detail_place,
                         rs_price,
                         sum(ed_resource_amount) as ed_resource_amount
                    from estimate_detail_hst ed
                   inner join estimate_tbl es on ed.ed_espk = es.es_pk
                    left join resource_tbl rs on ed.ed_rspk = rs.rs_pk\n` +
                  (reqFullMode === '0' ? `where ed_espk = ${reqEsPk}\n` : `where ed_espk in (${arrEsPk.join(',')})\n`) +
                  `group by ed_rspk, ed_place_pk, ed_detail_place, ed_alias) sub
           group by rs_pk
        `);
      })
      .then(response => {
        resourceList = response[0].filter(resource => {
          if (resource.ceil_resource_amount !== resource.resource_amount) return true;
        }).map(resource => {
          resource.plus_value = Math.ceil((resource.ceil_resource_amount * cf - resource.resource_amount * cf) * resource.rs_price / resource.count / cf);
          return resource;
        });

        return cur.raw(`
            select cpd_pk,
                   rt_pk,
                   ed_alias,
                   ed_detail_place,
                   count(*) as count,
                   sum(labor_costs) labor_costs,
                   case when (sum(ed_input_value) % cpd_min_amount = 0)
                        then sum(ed_input_value) * labor_price
                        else labor_price * ifnull( (sum(ed_input_value) + cpd_min_amount - sum(ed_input_value) % cpd_min_amount), 0)
                    end as ceil_labor_costs
              from (select cpd_pk,
                           rt_pk,
                           ed_alias,
                           ed_detail_place,
                           cpd_min_amount,
                           cpd_labor_costs + rt_extra_labor_costs as labor_price,
                           sum(ed_input_value) as ed_input_value,
                           sum(ed_input_value) * (cpd_labor_costs + rt_extra_labor_costs) as labor_costs
                      from estimate_detail_hst ed
                     inner join estimate_tbl es on ed.ed_espk = es.es_pk
                      left join construction_process_detail_tbl cpd on ed.ed_cpdpk = cpd.cpd_pk
                      left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk\n` +
                    (reqFullMode === '0' ? `where ed_espk = ${reqEsPk}\n` : `where ed_espk in (${arrEsPk.join(',')})\n`) +
                    `group by ed_cpdpk, ed_rtpk, ed_place_pk, ed_detail_place, ed_alias) sub
             group by cpd_pk, rt_pk
            `);
      })
      .then(response => {
        laborList = response[0].filter(labor => {
          if (labor.ceil_labor_costs !== labor.labor_costs) return true;
        }).map(labor => {
          labor.plus_value = Math.ceil((labor.ceil_labor_costs - labor.labor_costs) / labor.count);
          // console.log(`${labor.ceil_labor_costs} - ${labor.labor_costs} = ${labor.ceil_labor_costs - labor.labor_costs}  /  ${labor.count}  =  ${labor.plus_value}`);
          return labor;
        });

        return cur.raw(`
          select pl.cp_name as place_name,
                 pl.cp_pk as place_pk,
                 ed.ed_detail_place as detail_place,
                 ct.ct_pk,
                 ct.ct_name,
                 cp.cp_name,
                 cp.cp_pk,
                 cpd.cpd_pk,
                 cpd.cpd_name,
                 rt.rt_pk,
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
            left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk\n` +
          (reqFullMode === '0' ? `where ed.ed_espk = ${reqEsPk}\n` : `where ed.ed_espk in (${arrEsPk.join(',')})\n`) +
          `group by ed.ed_place_pk, ed.ed_detail_place, ed.ed_cpdpk, ed.ed_rtpk, ed.ed_rspk, ed_alias
           order by pl.cp_pk, ct.ct_pk, cp.cp_pk, cpd.cpd_name, rt.rt_sub desc, rt.rt_name, rs.rs_name
          `);
      })
      .then(response => {
        return response[0];
      })
      .map(row => {
        resourceList.forEach(resource => {
          if (resource.rs_pk === row.rs_pk) row.resource_costs += resource.plus_value;
        });
        laborList.forEach(labor => {
          // console.log(`cpd_pk : (${typeof labor.cpd_pk})[${labor.cpd_pk}] (${typeof row.cpd_pk})[${row.cpd_pk}]  /  rt_pk : (${typeof labor.rt_pk})[${labor.rt_pk}] (${typeof row.rt_pk})[${row.rt_pk}]  /  ed_alias : (${typeof labor.ed_alias})[${labor.ed_alias}] (${typeof row.ed_alias})[${row.ed_alias}]  /  ed_detail_place : (${typeof labor.ed_detail_place})[${labor.ed_detail_place}] (${typeof row.detail_place})[${row.detail_place}]`);
          if (labor.cpd_pk === row.cpd_pk && labor.rt_pk === row.rt_pk) {
            row.labor_costs += labor.plus_value;
          }
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
        console.error(err);
        res.json(
          resHelper.getError('상세견적서(공간별)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/labor', (req, res) => {
  const reqEsPk = req.params.espk || '';
  const reqFullMode = req.query.fullMode || '0';

  knexBuilder.getConnection().then(cur => {
    const subQuery = cur('estimate_tbl').select('es_pcpk').where('es_pk', reqEsPk);
    let arrEsPk = [];

    cur('estimate_tbl')
      .select('es_pk', 'es_version')
      .where('es_pcpk', subQuery)
      .andWhere('es_is_pre', false)
      .orderBy(['es_is_pre', 'es_pk'])
      .then(response => {
        if (response.length < 2) {
          arrEsPk.push(reqEsPk);
        } else {
          arrEsPk = response.filter(obj => obj.es_pk <= reqEsPk).map(obj => `'${obj.es_pk}'`);
        }
        return arrEsPk;
      })
      .then(arrEsPk => {
        return cur.raw(`
          select ct.ct_name,
                 ct.ct_pk,
                 cp.cp_name,
                 cp.cp_pk,
                 cpd.cpd_name,
                 cpd.cpd_pk,
                 cpd.cpd_unit,
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
            left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk\n` +
          (reqFullMode === '0' ? `where ed.ed_espk = ${reqEsPk}\n` : `where ed.ed_espk in (${arrEsPk.join(',')})\n`) +
          `group by ed.ed_ctpk, ed.ed_cppk, ed.ed_cpdpk, ed.ed_rtpk
           order by ed.ed_ctpk,ed.ed_cppk,ed.ed_cpdpk,ed.ed_rtpk`)
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('상세견적서(인건비)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/resource', (req, res) => {
  const reqEsPk = req.params.espk || '';
  const reqFullMode = req.query.fullMode || '0';

  knexBuilder.getConnection().then(cur => {
    const subQuery = cur('estimate_tbl').select('es_pcpk').where('es_pk', reqEsPk);
    let arrEsPk = [];

    cur('estimate_tbl')
      .select('es_pk', 'es_version')
      .where('es_pcpk', subQuery)
      .andWhere('es_is_pre', false)
      .orderBy(['es_is_pre', 'es_pk'])
      .then(response => {
        if (response.length < 2) {
          arrEsPk.push(reqEsPk);
        } else {
          arrEsPk = response.filter(obj => obj.es_pk <= reqEsPk).map(obj => `'${obj.es_pk}'`);
        }
        return arrEsPk;
      })
      .then(arrEsPk => {
        return cur.raw(`
          select rs.rs_name,
                 rs.rs_code,
                 rs.rs_price,
                 rc.rc_pk,
                 rc.rc_name,
                 ceil(sum(ed.ed_resource_amount)) as resource_amount,
                 ru.ru_name,
                 ed.ed_alias,
                 rs.rs_price * ceil(sum(ed.ed_resource_amount)) as resource_costs
            from estimate_detail_hst ed
            left join resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk
            left join resource_tbl rs on ed.ed_rspk = rs.rs_pk
            left join resource_unit_tbl ru on rs.rs_rupk = ru.ru_pk
            left join resource_category_tbl rc on rt.rt_rcpk = rc.rc_pk \n` +
          (reqFullMode === '0' ? `where ed.ed_espk = ${reqEsPk}\n` : `where ed.ed_espk in (${arrEsPk.join(',')})\n`) +
          `group by ed.ed_rspk, ed.ed_alias
           order by rc.rc_pk, rs.rs_name`)
      })
      .then(response => {
        res.json(
          resHelper.getJson({
            estimateList: response[0]
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('상세견적서(자재)를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pcpk([0-9]+)/estimate/:espk([0-9]+)/total', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
  const reqEsPk = req.params.espk || '';
  const reqFullMode = req.query.fullMode || '0';
  const reqEsIsPre = req.query.es_is_pre === 'true';

  knexBuilder.getConnection().then(cur => {
    const subQuery = cur('estimate_tbl').select('es_pcpk').where('es_pk', reqEsPk);
    let arrEsPk = [];

    cur('estimate_tbl')
      .select('es_pk', 'es_version')
      .where('es_pcpk', subQuery)
      .andWhere('es_is_pre', reqEsIsPre)
      .orderBy(['es_is_pre', 'es_pk'])
      .then(response => {
        if (response.length < 2) {
          arrEsPk.push(reqEsPk);
        } else {
          arrEsPk = response.filter(obj => obj.es_pk <= reqEsPk).map(obj => `'${obj.es_pk}'`);
        }
        return arrEsPk;
      })
      .then(() => {
        return cur('proceeding_contract_tbl')
          .first('pc_etc_costs_ratio', 'pc_design_costs_ratio', 'pc_supervision_costs_ratio', 'pc_discount_amount')
          .where('pc_pk', reqPcPk);
      })
      .then(row => {
        return cur.raw(`
          SELECT resource_costs,
                 labor_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_etc_costs_ratio},0)) as etc_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_design_costs_ratio},0)) as design_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_supervision_costs_ratio},0)) as supervision_costs` +
                 (reqEsIsPre === true ? `,\n ${row.pc_discount_amount} as discount_amount\n` : '\n') +
            `FROM (
              SELECT sum(resource_costs) resource_costs
                FROM (
                  SELECT rs.rs_price * ceil(sum(ed.ed_resource_amount)) AS resource_costs
                  FROM estimate_detail_hst ed
                    LEFT JOIN resource_tbl rs ON ed.ed_rspk = rs.rs_pk \n` +
                  (reqFullMode === '0' ? `WHERE ed.ed_espk = ${reqEsPk}\n` : `WHERE ed.ed_espk in (${arrEsPk.join(',')})\n`) +
                 `GROUP BY ed.ed_rspk
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
              LEFT JOIN resource_type_tbl rt on ed.ed_rtpk = rt.rt_pk \n` +
            (reqFullMode === '0' ? `WHERE ed.ed_espk = ${reqEsPk}\n` : `WHERE ed.ed_espk in (${arrEsPk.join(',')})\n`) +
            `GROUP BY ed.ed_cpdpk, ed.ed_rtpk
            ) labor
          ) l`)
      })
      .then(response => {
        let totalCosts = response[0][0];
        totalCosts.total_costs = Math.floor((totalCosts.resource_costs + totalCosts.labor_costs + totalCosts.etc_costs + totalCosts.design_costs + totalCosts.supervision_costs) * 0.001) * 1000;
        totalCosts.vat_costs = Math.ceil(totalCosts.total_costs * 10 / 100);
        totalCosts.total_costs_including_vat = totalCosts.total_costs + totalCosts.vat_costs;
        res.json(
          resHelper.getJson({
            totalCosts
          })
        );
      })
      .catch(err => {
        console.error(err);
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
  const reqPcPk = req.params.pcpk || '';
  knexBuilder.getConnection().then(cur => {
    cur({cr: 'constructor_tbl'})
      .select(
        'cc_pk',
        'cr_pk',
        'ct_pk',
        'ct_name',
        'cp_name',
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
      .innerJoin({cp: 'construction_process_tbl'}, 'cs.cs_cppk', 'cp.cp_pk')
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
        console.error(err);
        res.json(
          resHelper.getError('해당 진행계약의 기술자 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.post('/:pcpk([0-9]+)/constructor', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
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
  const reqPcPk = req.params.pcpk || '';
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
        console.error(err);
        res.json(
          resHelper.getError('해당 진행계약의 거래처 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  });
});

router.post('/:pcpk([0-9]+)/correspondent', (req, res) => {
  const reqPcPk = req.params.pcpk || '';
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


router.get('/:pcpk([0-9]+)/checklist', (req, res) => {
  const reqPcPk = req.params.pcpk;
  knexBuilder.getConnection().then(cur => {

    cur({cl:'checklist_tbl'})
      .select('cl.cl_pk', 'cl.cl_date', 'cl.cl_ctpk', 'ct.ct_name', 'cl.cl_constructor', 'cl.cl_resource', 'cl.cl_memo')
      .innerJoin({ct: 'construction_tbl'}, 'cl.cl_ctpk', 'ct.ct_pk')
      .where('cl_pcpk', reqPcPk)
      .andWhere('cl_deleted', 0)
      .orderBy(['cl.cl_date', 'cl.cl_ctpk'])
      .then(response => {
        res.json(
          resHelper.getJson({
            checklist: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('진행 계약의 확인 목록을 조회하는 중 오류가 발생했습니다.')
        );
      })
  })
});

router.post('/:pcpk([0-9]+)/checklist', (req, res) => {
  const reqPcPk = req.params.pcpk;
  const reqCtPk = req.body.ct_pk || '';
  const reqClDate = req.body.cl_date || 0;
  const reqClConstructor = req.body.cl_constructor || 0;
  const reqClResource = req.body.cl_resource || 0;
  const reqClMemo = req.body.cl_memo || '';

  // console.log(`reqPcPk : [${reqPcPk}]  /  reqCtPk  :  [${reqCtPk}]  reqClDate  :  [${reqClDate}]  reqClConstructor  :  [${reqClConstructor}]  reqClResource  :  [${reqClResource}]`)

  if (reqClDate === 0 || reqCtPk === '') {
    res.json(
      resHelper.getError('필수 파라메터가 누락되었습니다.')
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      let o = {};
      o.cl_pcpk = reqPcPk;
      o.cl_date = reqClDate;
      o.cl_ctpk = reqCtPk;
      o.cl_constructor = reqClConstructor;
      o.cl_resource = reqClResource;
      o.cl_memo = reqClMemo;

      cur('checklist_tbl')
        .insert(o)
        .then(() => {
          res.json(
            resHelper.getJson({
              check: o
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('진행 계약의 확인 목록을 추가하는 중 오류가 발생했습니다.')
          );
        })
    })
  }
});

router.put('/:pcpk([0-9]+)/checklist/:clpk([0-9]+)', (req, res) => {
  const reqClPk = req.params.clpk;
  const reqCtPk = req.body.ct_pk;
  const reqClDate = req.body.cl_date;
  const reqClConstructor = req.body.cl_constructor;
  const reqClResource = req.body.cl_resource;
  const reqClMemo = req.body.cl_memo;

  // console.log(`reqClPk : [${reqClPk}]  /  reqCtPk  :  [${reqCtPk}]  reqClDate  :  [${reqClDate}]  reqClConstructor  :  [${reqClConstructor}]  reqClResource  :  [${reqClResource}]`)
  knexBuilder.getConnection().then(cur => {
    let o = {};
    o.cl_ctpk = reqCtPk;
    o.cl_date = reqClDate;
    o.cl_constructor = reqClConstructor;
    o.cl_resource = reqClResource;
    o.cl_memo = reqClMemo;

    const query = cur('checklist_tbl')
      .update(o)
      .where('cl_pk', reqClPk);
    // console.log(query.toString());

    query
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: 'ok'
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('진행 계약의 확인 목록을 추가하는 중 오류가 발생했습니다.')
        );
      })
  })
});

router.delete('/:pcpk([0-9]+)/checklist/:clpk([0-9]+)', (req, res) => {
  const reqClPk = req.params.clpk;

  knexBuilder.getConnection().then(cur => {
    let o = {};
    o.cl_deleted = 1;

    cur('checklist_tbl')
      .update(o)
      .where('cl_pk', reqClPk)
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: 'ok'
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('진행 계약의 확인 목록을 삭제하는 중 오류가 발생했습니다.')
        );
      })
  })
});

router.put('/:pcpk([0-9]+)/checklist', (req, res) => {
  const reqClDate = req.body.cl_date || 0;
  const reqChecklist = req.body.checklist || [];

  if (reqClDate === 0 || reqChecklist.length === 0) {
    res.json(
      resHelper.getError('필수 파라메터가 누락되었습니다.')
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      let o = {};
      o.cl_date = reqClDate;

      cur('checklist_tbl')
        .update(o)
        .whereIn('cl_pk', reqChecklist)
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.json(
            resHelper.getError('진행 계약의 확인 목록을 이동하는 중 오류가 발생했습니다.')
          );
        })
    })
  }
});


router.get('/receipt', (req, res) => {
  const jwtToken = req.token;
  const reqStatus = parseInt(req.query.status);
  let userInfo;
  let availableStatus;
  let connector;

  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      if (userInfo.user_permit === 'A') availableStatus = [0,1,2];
      else if (userInfo.user_permit === 'B') availableStatus = [1,2];
      else if (userInfo.user_permit === 'C') availableStatus = [2];
      return knexBuilder.getConnection()
    })
    .then(cur => {
      connector = cur;
      const query = cur('receipt_tbl as rc')
        .select(
          'pc_pk as _pk',
          'pc_name as _name',
          'pc_nickname as _nickname',
          'rc.rc_pk as _receipt__pk',
          'ct.ct_name as _receipt__ctName',
          'user.user_name as _receipt__drafter',
          'ct.ct_name as receipt__ctName',
          'rc.rc_date as _receipt__date',
          'rc.rc_type as _receipt__type',
          'rc.rc_contents as _receipt__contents',
          'rc.rc_price as _receipt__price',
          'rc.rc_account_bank as _receipt__accountBank',
          'rc.rc_account_holder as _receipt__accountHolder',
          'rc.rc_account_number as _receipt__accountNumber',
          'rc.rc_is_emergency as _receipt__isEmergency',
          'rc.rc_status as _receipt__status',
          'rc.rc_is_vat_included as _receipt__isVatIncluded',
          'rc.rc_memo as _receipt__memo',
          'rc.rc_reject_reason as _receipt__rejectReason',
          'ra.ra_pk as _receipt__attachment__pk',
          'ra.ra_url as _receipt__attachment__url',
          'ra.ra_memo as _receipt__attachment__memo',
          'rc.rc_ctpk as _price__ctPk',
          'ct.ct_name as _price__ctName')
        .select(cur.raw('ifnull(sum(labor.rc_price),0) as _price__laborPrice'))
        .select(cur.raw('ifnull(sum(resource.rc_price),0) as _price__resourcePrice'))
        .select(cur.raw('ifnull(sum(etc.rc_price),0) as _price__etcPrice'))
        .select(cur.raw('ifnull(sum(labor.rc_price),0) + ifnull(sum(resource.rc_price),0)+ ifnull(sum(etc.rc_price),0) as _price__totalPrice'))
        .innerJoin('construction_tbl as ct', 'rc_ctpk', 'ct_pk')
        .innerJoin('user_tbl as user', 'rc_user_pk', 'user_pk')
        .innerJoin('proceeding_contract_tbl as pc', 'rc.rc_pcpk', 'pc.pc_pk')
        .leftJoin('receipt_attachment_tbl as ra', 'rc_pk', 'ra_rcpk')
        .joinRaw(`left join (select rc_pcpk, rc_ctpk, rc_price from receipt_tbl where rc_type = 0 and rc_status = 3 group by rc_pcpk, rc_ctpk) labor on rc.rc_pcpk = labor.rc_pcpk and rc.rc_ctpk = labor.rc_ctpk`)
        .joinRaw(`left join (select rc_pcpk, rc_ctpk, rc_price from receipt_tbl where rc_type = 1 and rc_status = 3 group by rc_pcpk, rc_ctpk) resource on rc.rc_pcpk = resource.rc_pcpk and rc.rc_ctpk = resource.rc_ctpk`)
        .joinRaw(`left join (select rc_pcpk, rc_ctpk, rc_price from receipt_tbl where rc_type = 2 and rc_status = 3 group by rc_pcpk, rc_ctpk) etc on rc.rc_pcpk = etc.rc_pcpk and rc.rc_ctpk = etc.rc_ctpk`)
        .groupBy(['pc_pk', 'rc.rc_ctpk', 'ra.ra_pk'])
        .orderBy(['pc_pk', 'rc_status', 'rc_date']);
      if (!req.query.status) {
        query.whereIn('rc_status', availableStatus);
      } else {
        if (availableStatus.indexOf(reqStatus) > -1 || reqStatus === 3) query.where('rc_status', reqStatus);
        else  throw new Error('NO_AUTHORITY');
      }
      // console.log(query.toSQL().toNative());

      return knexnest(query)
    })
    .then(async response => {
      if (!response) {
        response = []
      }

      const returnData = {};

      returnData.contract = await Promise.all(response.map(async o => {
        const totalCosts = await getContractTotalCosts(connector, o.pk, 0);
        let result = totalCosts[0][0];
        o.contractTotalCosts = Math.floor((result.resource_costs + result.labor_costs + result.etc_costs + result.design_costs + result.supervision_costs - result.discount_amount) * 0.001) * 1000;
        // console.log(receiptTotalQuery.toSQL().toNative());
        const receiptTotalCosts = await connector('receipt_tbl')
          .select(connector.raw('ifnull(sum(rc_price),0) as rc_price'))
          .where('rc_pcpk', o.pk)
          .andWhere('rc_status', 3)
          .catch(e => e.name = 'dbError');

        if (!(receiptTotalCosts instanceof Error)) {
          o.receiptTotalCosts = receiptTotalCosts[0].rc_price;
        } else {
          o.receiptTotalCosts = 0;
        }

        return o;
      }));

      if (userInfo.user_permit === 'C') {
        const receiptAccount = await connector('receipt_tbl')
          .select('rc_account_bank as accountBank', 'rc_account_number as accountNumber', 'rc_account_holder as accountHolder')
          .sum('rc_price as price')
          .where('rc_status', 2)
          .groupBy(['rc_account_bank', 'rc_account_number', 'rc_account_holder'])
          .catch(e => e.name = 'dbError');
        if (!(receiptAccount instanceof Error)) {
          returnData.receiptAccount = receiptAccount;
        } else {
          returnData.receiptAccount = [];
        }
      }
      res.json(
        resHelper.getJson(returnData)
      );
    })
    .catch(err => {
      console.error(err.message);
      switch (err.message) {
        case 'NO_AUTHORITY': err.message = '올바르지 않은 조회 조건입니다.';
          break;
        default: err.message = '진행 계약의 구매 품의 목록을 조회하는 중 오류가 발생했습니다.';
        break;
      }
      res.json(resHelper.getError(err.message));
    })
});

router.get('/:pcpk([0-9]+)/receipt', (req, res) => {
  const reqPcPk = req.params.pcpk;
  const jwtToken = req.token;
  let userInfo;
  let availableStatus;
  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      if (userInfo.user_permit === 'A') availableStatus = [0,1,2];
      else if (userInfo.user_permit === 'B') availableStatus = [1,2];
      else if (userInfo.user_permit === 'C') availableStatus = [2];
      return knexBuilder.getConnection()
    })
    .then(cur => {
      const query = cur('receipt_tbl as rc')
        .select(
          'rc_pk as _pk',
          'rc_pcpk as _pcPk',
          'rc_ctpk as _ctPk',
          'ct_name as _ctName',
          'rc_date as _date',
          'rc_type as _type',
          'rc_contents as _contents',
          'rc_price as _price',
          'rc_account_bank as _accountBank',
          'rc_account_holder as _accountHolder',
          'rc_account_number as _accountNumber',
          'rc_is_emergency as _isEmergency',
          'rc_status as _status',
          'rc_is_vat_included as _isVatIncluded',
          'rc_memo as _memo',
          'ra_pk as _attachment__pk',
          'ra_url as _attachment__url',
          'ra_memo as _attachment__memo')
        // .select(cur.raw('(select count(*) from receipt_attachment_tbl where ra_rcpk = rc.rc_pk) as rc_attachment'))
        .where('rc_pcpk', reqPcPk)
        .whereIn('rc_status', availableStatus)
        .leftJoin('construction_tbl as ct', 'rc_ctpk', 'ct_pk')
        .leftJoin('receipt_attachment_tbl as ra', 'rc_pk', 'ra_rcpk')
        .orderBy(['rc_status', 'rc_date']);
      return knexnest(query);
    })
    .then(response => {
      if (!response) {
        response = []
      }
      res.json(
        resHelper.getJson({
          receipts: response
        })
      );
    })
    .catch(err => {
      let errorStatusCode = 500;
      console.error(err);
      console.error(err.name);
      if (err.name === 'TokenExpiredError') errorStatusCode = 401;
      res.json(
        resHelper.getError('진행 계약의 구매 품의 목록을 조회하는 중 오류가 발생했습니다.', errorStatusCode)
      );
    })
});


router.get('/:pcpk([0-9]+)/receipt/isExist', (req, res) => {
  let userPk;
  const reqPcpk = req.params.pcpk;
  const reqPrice = req.query.price;
  const reqAccountNumber = req.query.accountNumber;

  if (!reqPcpk || !reqPrice || !reqAccountNumber) {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  } else {
    jwtHelper.verify(req.token)
      .then(userInfo => {
        userPk = userInfo.user_pk;
        return knexBuilder.getConnection();
      })
      .then(cur => {
        cur('receipt_tbl')
          .select('*')
          .where('rc_pcpk', reqPcpk)
          .andWhere('rc_account_number', reqAccountNumber)
          .andWhere('rc_price', reqPrice)
          .then(response => {
            if (response.length > 0) {
              res.json(resHelper.getJson({
                isExist: true
              }));
            } else {
              res.json(resHelper.getJson({
                isExist: false
              }));
            }
          })
          .catch(err => {
            console.error(err)
          })
      })
  }
});


router.post('/:pcpk([0-9]+)/receipt', (req, res) => {
  let userPk;
  if ( (req.body.type === undefined || !req.body.type.toString().trim() )
    || !req.body.ctPk
    || !req.body.price
    || !req.body.accountBank
    || !req.body.accountHolder
    || !req.body.accountNumber
    || ( req.body.isVatIncluded === undefined || !req.body.isVatIncluded.toString().trim() )
  ) {
    res.json(
      resHelper.getError('파라메터가 올바르지 않습니다.')
    );
  }
  else {
    const attachedList = req.body.attachedList || [];
    jwtHelper.verify(req.token)
      .then(userInfo => {
      userPk = userInfo.user_pk;
      return knexBuilder.getConnection();
    })
      .then(cur => {
        let obj = {};
        obj.rc_user_pk = userPk;
        obj.rc_pcpk = req.params.pcpk;
        obj.rc_ctpk = req.body.ctPk;
        obj.rc_date = moment().format('YYYY-MM-DD');
        obj.rc_type = req.body.type;
        obj.rc_contents = req.body.contents;
        obj.rc_price = req.body.price;
        obj.rc_account_bank = req.body.accountBank;
        obj.rc_account_holder = req.body.accountHolder;
        obj.rc_account_number = req.body.accountNumber.toString().replace(/-/gi, '');
        obj.rc_is_emergency = req.body.isEmergency;
        obj.rc_status = req.body.status;
        obj.rc_is_vat_included = req.body.isVatIncluded;
        obj.rc_memo = req.body.memo;

        cur.transaction(trx => {
          cur('receipt_tbl')
            .insert(obj)
            .returning('rc_pk')
            .transacting(trx)
            .then(response => {
              const rcPk = response[0];
              const query = [];
              attachedList.forEach(obj => {
                let attachment = {};
                attachment.ra_url = obj.url;
                attachment.ra_memo = obj.memo;
                attachment.ra_rcpk = rcPk;
                query.push(
                  cur.table('receipt_attachment_tbl')
                    .insert(attachment)
                    .transacting(trx));
              });

              Promise.all(query)
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .catch(trx.rollback);
        })
          .then(() => {
            res.json(resHelper.getJson({
              msg: 'ok'
            }));
          })
          .catch(err => {
            console.error(err);
            res.json(resHelper.getError('구매품의를 등록하는 중 오류가 발생하였습니다.'));
          })
      })
  }
});

router.put('/:pcpk([0-9]+)/receipt/:rcpk([0-9]+)', (req, res) => {
  const reqRcPk = req.params.rcpk;
  const jwtToken = req.token;
  const reqRcStatus = parseInt(req.body.status);
  const reqRcRejectReason = req.body.rejectReason;

  let errorMsg = null;
  jwtHelper.verify(jwtToken).then(userInfo => {
    if ([-1,0,1,2,3].indexOf(reqRcStatus) < 0) {
      errorMsg = '파라메터가 올바르지 않습니다.'
    }
    else {
      if (userInfo.user_permit === 'A') {
        if ([-1].indexOf(reqRcStatus) < 0) {
          errorMsg = '권한이 없습니다.'
        }
      }
      else if (userInfo.user_permit === 'B') {
        if ([0,2].indexOf(reqRcStatus) < 0) {
          errorMsg = '권한이 없습니다.'
        }
      }
      else if (userInfo.user_permit === 'C') {
        if ([0,3].indexOf(reqRcStatus) < 0) {
          errorMsg = '권한이 없습니다.'
        }
      }
    }

    if (errorMsg !== null) {
      throw new Error(errorMsg);
    }
    else {
      return knexBuilder.getConnection();
    }
  })
    .then(cur => {
      // console.log(reqRcStatus);
      // console.log(reqRcPk);
      let obj = {};
      obj.rc_status = reqRcStatus;
      if (reqRcStatus === 0) {
        obj.rc_reject_reason = reqRcRejectReason;
      }

      return cur('receipt_tbl')
        .update(obj)
        .where('rc_pk', reqRcPk)
    })
    .then(() => {
      res.json(resHelper.getJson({
        msg: 'ok'
      }));
    })
    .catch(err => {
      res.json(resHelper.getError(err.message));
    })
});

router.get('/:pcpk([0-9]+)/schedule', (req, res) => {
  const reqPcPk = req.params.pcpk;
  const reqIsSchedule = parseInt(req.query.isSchedule) || 1;
  knexBuilder.getConnection()
    .then(cur => {
      cur('collect_bills_tbl')
        .select(
          'cb_pk',
          'cb_type',
          'cb_date',
          'cb_sender',
          'cb_amount'
        )
        .where('cb_pcpk', reqPcPk)
        .andWhere('cb_is_schedule', reqIsSchedule)
        .then(response => {
          res.json(resHelper.getJson({
            list: response
          }));
        })
        .catch(err => {
          res.json(resHelper.getError(err.message));
        })
    })
})

router.post('/:pcpk([0-9]+)/schedule', (req, res) => {
  const reqPcPk = req.params.pcpk;
  const billsScheduleList = req.body.billsScheduleList || [];
  let userPk;
  jwtHelper.verify(req.token)
    .then(userInfo => {
      userPk = userInfo.user_pk;
      return knexBuilder.getConnection();
    })
    .then(cur => {
      cur.transaction(trx => {
        const query = [];
        billsScheduleList.forEach(obj => {
          let schedule = {};
          schedule.cb_is_schedule = obj.cb_is_schedule;
          schedule.cb_type = obj.cb_type;
          schedule.cb_date = obj.cb_date;
          schedule.cb_amount = obj.cb_amount;
          schedule.cb_reg_user = userPk;
          schedule.cb_pcpk = reqPcPk;
          query.push(
            cur.table('collect_bills_tbl')
              .insert(schedule)
              .transacting(trx)
          );
        });
        query.push(
          cur.table('collect_bills_tbl')
            .insert({cb_is_schedule: 1, cb_type: '조정', cb_amount: 0, cb_reg_user: userPk, cb_pcpk: reqPcPk})
            .transacting(trx)
        );

        Promise.all(query)
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .then(() => {
        res.json(resHelper.getJson({
          msg: 'ok'
        }));
      })
      .catch(err => {
        console.error(err);
        res.json(resHelper.getError('수금 예정표를 등록하는 중 오류가 발생하였습니다.'));
      })
    })
});



/* functions */

function getContractStatus(constructionStartDate, moveDate, contractStatus) {
  let rtnStatus = contractStatus;
  if (constructionStartDate === '0000-00-00') constructionStartDate = null;
  if (moveDate === '0000-00-00') constructionStartDate = null;

  if (constructionStartDate) {
    // 공사시작일자가 현재시간 이전이면(오늘자가 공사시작일자를 지났을 때)
    if (moment(constructionStartDate, 'YYYY-MM-DD').diff(moment()) < 0) {
      if (contractStatus === 3) rtnStatus = 4;
      if (moveDate) {
        // 이사일자가 현재시간 이전이면
        if (moment(moveDate, 'YYYY-MM-DD').diff(moment()) < 0) {
          if (contractStatus === 3 || contractStatus === 4) rtnStatus = 5;
        }
        // 이사일자가 현재시간 이후이면
        else {
          if (contractStatus === 5) rtnStatus = 4;
        }
      }
    }
    // 공사시작일자가 현재시간 이후이면
    else {
      if (contractStatus === 4 || contractStatus === 5) rtnStatus = 3;
    }
  }
  return rtnStatus;
}

function changeContractStatusWhenPre (esPk) {
  if (!esPk) return null;
  knexBuilder.getConnection().then(cur => {
    return cur('estimate_tbl')
      .first('es_is_pre', 'es_pcpk')
      .where('es_pk', esPk)
      .then(row => {
        if (row.es_is_pre === 1) {
          return cur('proceeding_contract_tbl')
            .update('pc_status', 1)
            .where('pc_pk', row.es_pcpk)
        }
        else return null;
      })
  })
}

function getContractTotalCosts (cur, pcPk, esIsPre) {
  return cur('proceeding_contract_tbl')
    .first('pc_etc_costs_ratio', 'pc_design_costs_ratio', 'pc_supervision_costs_ratio', 'pc_discount_amount')
    .where('pc_pk', pcPk)
    .then(row => {
      return cur.raw(`
          SELECT ifnull(resource_costs,0) as resource_costs,
                 ifnull(labor_costs,0) as labor_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_etc_costs_ratio},0)) as etc_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_design_costs_ratio},0)) as design_costs,
                 ceil(ifnull((resource_costs + labor_costs) * ${row.pc_supervision_costs_ratio},0)) as supervision_costs,
                 ifnull(${row.pc_discount_amount},0) as discount_amount
            FROM (
              SELECT sum(resource_costs) resource_costs
                FROM (
                  SELECT rs.rs_price * ceil(sum(ed.ed_resource_amount)) AS resource_costs
                    FROM estimate_detail_hst ed
                   INNER JOIN estimate_tbl es on ed.ed_espk = es.es_pk
                    LEFT JOIN resource_tbl rs ON ed.ed_rspk = rs.rs_pk
                  WHERE es.es_pcpk = ?
                    AND es.es_is_pre = ?
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
               AND es.es_is_pre = ?
             GROUP BY ed.ed_cpdpk, ed.ed_rtpk
            ) labor
          ) l`, [pcPk, esIsPre === 'true', pcPk, esIsPre === 'true'])
    })
    .catch(e => {
      e.message = 'error ocurred in getContractTotalCosts';
      e.name = 'functionError';
      return e;
    })
}
module.exports = router;