const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const calc = require('calculator');

router.post('/:pk([0-9]+)', (req, res) => {
  const reqPcPk = req.params.pk || '';
  const reqPlacePk = req.body.place_pk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqCpPk = req.body.cp_pk || '';
  const reqCpdPk = req.body.cpd_pk || '';
  const reqRtPk = req.body.rt_pk || '';
  const reqRsPk = req.body.rs_pk || '';
  const reqInputValue = req.body.input_value || '';
  const reqDetailPlace = req.body.detail_place || '';

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
          console.log('resourceAmount : ' + resourceAmount);

          insertObj.ed_resource_amount = parseFloat(resourceAmount.toFixed(2));
          insertObj.ed_calculated_amount = parseFloat(resourceAmount.toFixed(2));
          insertObj.ed_recency = cur.raw('UNIX_TIMESTAMP() * -1');

          return cur('estimate_detail_hst')
            .insert(insertObj)
        })
        .then(() => {
          console.log('ok');
          res.json(
            resHelper.getJson({
              msg: 'ok'
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

module.exports = router;