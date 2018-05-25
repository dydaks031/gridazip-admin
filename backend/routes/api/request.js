const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const FormatService = require('../../services/format/helper');
const cryptoHelper = require('../../services/crypto/helper');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

const request_size_map = {
  '': '평수 없음',
  'lt20': '20평대 미만',
  'eq20': '20평대',
  'eq30': '30평대',
  'eq40': '40평대',
  'eq50': '50평대',
  'eq60': '60평대',
  'gte70': '70평대 이상'
};
const request_budget_map = {
  '': '예산 선택안함',
  '1500~2000': '1500~2000만원',
  '2000~2500': '2000~2500만원',
  '2500~3000': '2500~3000만원',
  '3000~3500': '3000~3500만원',
  '3500~4000': '3500~4000만원',
  '4000~4500': '4000~4500만원',
  '4500~5000': '4500~5000만원',
  '5000~5500': '5000~5500만원',
  '5500~6000': '5500~6000만원',
  '6000~6500': '6000~6500만원',
  '6500~7000': '6500~7000만원',
  'lt1500': '1500만원 미만',
  'lt2000': '2000만원 미만',
  'lt2500': '2500만원 미만',
  'lt3000': '3000만원 미만',
  'lt3500': '3500만원 미만',
  'lt4000': '4000만원 미만',
  'lt4500': '4500만원 미만',
  'lt5000': '5000만원 미만',
  'gte2500': '2500만원 이상',
  'gte3000': '3000만원 이상',
  'gte3500': '3500만원 이상',
  'gte4000': '4000만원 이상',
  'gte4500': '4500만원 이상',
  'gte5000': '5000만원 이상',
  'gte6000': '6000만원 이상',
  'gte7000': '7000만원 이상',
  'contact': '협의로 결정'
};

router.get('/', (req, res) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let point= req.query.point;
  let pageIndex = req.query.page;
  let pageInst = new paginationService(page);
  let filterInst = new filterService(filter);
  let pageData = pageInst.get();
  let filterIsValuableValue = filterInst.getFilter('isValuable');
  let filterIsContractedValue = filterInst.getFilter('isContracted');
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
    let query = cur('request_tbl')
      .select('*');

    if (filterIsValuableValue !== null) {
      query = query.where('rq_is_valuable', filterIsValuableValue);
    }
    if (filterIsContractedValue !== null) {
      query = query.where('rq_is_contracted', filterIsContractedValue);
    }

    query = query.orderBy('request_tbl.rq_recency');

    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('rq_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['rq_pk']);
          }
        }

        list = response;
        list.map(item => {
          item.rq_size_str = request_size_map[item.rq_size];
          item.rq_budget_str = request_budget_map[item.rq_budget];
          item.rq_phone = FormatService.toDashedPhone(cryptoHelper.decrypt(item.rq_phone));
          return item;
        });
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        let countQuery = cur('request_tbl').count('* as count');
        if (filterIsValuableValue !== null) {
          countQuery = countQuery.where('rq_is_valuable', filterIsValuableValue);
        }
        if (filterIsContractedValue !== null) {
          countQuery = countQuery.where('rq_is_contracted', filterIsContractedValue);
        }
        return countQuery
      })
      .then(response => {
        pageInst.setCount(response[0].count);

        res.json(
          resHelper.getJson({
            data: list,
            page: pageInst.get()
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('상담요청 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
        )
      });
  });
});


router.post('/', (req, res) => {
  const reqName = req.body.rq_name || '';
  const reqPhone = req.body.rq_phone || '';
  if (reqName.trim() === '') {
    res.json(resHelper.getError('고객명은 반드시 입력해야 합니다.'));
  }
  else if (reqPhone.trim() === '') {
    res.json(resHelper.getError('핸드폰번호는 반드시 입력해야 합니다.'));
  }
  else {
    let insertObj = {};
    insertObj.rq_name = reqName;
    insertObj.rq_phone = cryptoHelper.encrypt(reqPhone);
    insertObj.rq_family = req.body.rq_family || '';
    insertObj.rq_size = req.body.rq_size || '';
    insertObj.rq_address_brief = req.body.rq_address_brief || '';
    insertObj.rq_address_detail = req.body.rq_address_detail || '';
    insertObj.rq_move_date = req.body.rq_move_date || '';
    insertObj.rq_budget = req.body.rq_budget || '';
    insertObj.rq_place = req.body.rq_place || '';
    insertObj.rq_date = req.body.rq_date || '';
    insertObj.rq_time = req.body.rq_time || '';
    insertObj.rq_request = req.body.rq_request || '';
    insertObj.rq_memo = req.body.rq_memo || '';
    insertObj.rq_construction_type = req.body.rq_construction_type || '';
    insertObj.rq_consulting_result = req.body.rq_consulting_result || '';
    insertObj.rq_is_valuable = req.body.rq_is_valuable || 0;
    insertObj.rq_is_contracted = req.body.rq_is_contracted || 0;

    knexBuilder.getConnection().then(cur => {
      insertObj.rq_recency = cur.raw('UNIX_TIMESTAMP() * -1');
      cur('request_tbl')
        .insert(insertObj)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '상담내역이 정상적으로 추가되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 상담내역을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.delete('/:rqpk([0-9]+)', (req, res) => {
  const reqPk = req.params.rqpk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전달받은 파라메터가 옳바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('request_tbl')
        .where({
          rq_pk: reqPk
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
            resHelper.getError('상담내역을 삭제하는 중 오류가 발생하였습니다.')
          );
        });
    });
  }
});

router.put('/:rqpk([0-9]+)', (req, res) => {
  const rq_pk = req.params.rqpk;
  const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
  let errorMsg = null;
  let updateObj = {};

  const rq_is_valuable = req.body.rq_is_valuable || '0';
  const rq_is_contracted = req.body.rq_is_contracted || '0';

  const isExistValuable = req.body.hasOwnProperty('rq_is_valuable');
  const isExistContracted = req.body.hasOwnProperty('rq_is_contracted');
  if (isExistValuable && isExistContracted) {
    if (req.body.rq_name === '') {
      errorMsg = '이름은 반드시 입력해야 합니다.';
    }
    else if (req.body.rq_phone === '') {
      errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
    }
    else if (regexPhone.test(req.body.rq_phone) === false) {
      errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
    }
  }
  if (isExistValuable) {
    if (['0','1','2','3'].indexOf(rq_is_valuable) < 0) {
      errorMsg = '[rq_is_valuable] 값이 올바르지 않습니다.'
    }
  }
  if (isExistContracted) {
    if (['0','1','2'].indexOf(rq_is_contracted) < 0) {
      errorMsg = '[rq_is_contracted] 값이 올바르지 않습니다.'
    }
  }

  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    if (isExistValuable && isExistContracted) {
      updateObj.rq_name = req.body.rq_name || '';
      updateObj.rq_family = req.body.rq_family || '';
      updateObj.rq_phone = cryptoHelper.encrypt(req.body.rq_phone) || '';
      updateObj.rq_size = req.body.rq_size || '';
      updateObj.rq_address_brief = req.body.rq_address_brief || '';
      updateObj.rq_address_detail = req.body.rq_address_detail || '';
      updateObj.rq_move_date = req.body.rq_move_date || '';
      updateObj.rq_style_likes = req.body.rq_style_likes || '';
      updateObj.rq_style_dislikes = req.body.rq_style_dislikes || '';
      updateObj.rq_color_likes = req.body.rq_color_likes || '';
      updateObj.rq_color_dislikes = req.body.rq_color_dislikes || '';
      updateObj.rq_budget = req.body.rq_budget || '';
      updateObj.rq_place = req.body.rq_place || '';
      updateObj.rq_date = req.body.rq_date || '';
      updateObj.rq_time = req.body.rq_time || '';
      updateObj.rq_request = req.body.rq_request || '';
      updateObj.rq_memo = req.body.rq_memo || '';
      updateObj.rq_construction_type = req.body.rq_construction_type || '';
      updateObj.rq_consulting_result = req.body.rq_consulting_result || '';
      updateObj.rq_is_valuable = rq_is_valuable;
      updateObj.rq_is_contracted = rq_is_contracted;
    }
    else {
      if (isExistValuable) {
        updateObj.rq_is_valuable = rq_is_valuable;
      }
      if (isExistContracted) {
        updateObj.rq_is_contracted = rq_is_contracted;
      }
    }
    knexBuilder.getConnection().then(cur => {
      cur('request_tbl')
        .where({
          rq_pk: rq_pk
        })
        .update(updateObj)
        .finally(() => {
          res.json(
            resHelper.getJson({
              msg: 'ok'
            })
          );
        })
        .catch(reason => {
          console.error(reason);
          res.json(
            resHelper.getError(reason)
          );
        });
    });
  }
});

router.get('/:rqpk([0-9]+)', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    let rq_pk = req.params.rqpk;
    let request;

    cur('request_tbl')
      .where({
        rq_pk: rq_pk
      })
      .then(response => {
        if (response.length < 1) {
          return res.json(
            resHelper.getError('해당 상담 요청이 존재하지 않습니다.')
          );
        }
        request = response[0];
        request.rq_size_str = request_size_map[request.rq_size];
        request.rq_budget_str = request_budget_map[request.rq_budget];
        request.rq_phone = cryptoHelper.decrypt(request.rq_phone);

        // request.rq_phone = FormatService.toDashedPhone(cryptoHelper.decrypt(request.rq_phone));
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            data: request
          })
        );
      })
      .catch(() => {
        res.json(
          resHelper.getError('상담 요청 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        );
      });
  });
});
//
// router.get('/request/cryptAll', (req, res) => {
//     knexBuilder.getConnection().then(cur => {
//             cur('request_tbl')
//                 .select('rq_pk', 'rq_phone')
//                 .then(response => {
//                     response.forEach((item) => {
//                         cur('request_tbl')
//                             .where('rq_pk', item.rq_pk)
//                             .update({rq_phone: cryptoHelper.encrypt(item.rq_phone)})
//                             .then(result => {
//                                 console.log(result);
//                             });
//                     })
//                 })
//         }
//     )
// });
// router.get('/request/cryptTest', (req, res) => {
//     knexBuilder.getConnection().then(cur => {
//         cur('request_tbl')
//             .where('rq_pk', 369)
//             .update({rq_phone: cryptoHelper.encrypt('01012345678')})
//             .then(result => {
//                 console.log(result);
//             });
//         }
//     )
// });

module.exports = router;