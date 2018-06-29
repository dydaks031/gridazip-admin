const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const FormatService = require('../../services/format/helper');
/* 거래처 */

router.get('/', (req, res) => {
  const reqCtPk = req.query.ct_pk || '';
  const reqName = req.query.co_name || '';
  const reqManagerName = req.query.co_maneger_name || '';
  const reqPcPk = req.query.pc_pk || '';

  knexBuilder.getConnection().then(cur => {

    let query = cur({co: 'correspondent_tbl'})
      .select(
        'co_pk',
        'ct_pk',
        'ct_name',
        'co_name',
        'co_manager_name',
        'co_contact',
        'co_location',
        'ci_brand',
        'co_memo'
        )
      .leftJoin({ci: 'correspondent_item_tbl'}, 'co.co_pk', 'ci.ci_copk')
      .leftJoin({ct: 'construction_tbl'}, 'ci.ci_ctpk', 'ct.ct_pk')
      .where('co_deleted', false)
      .orderBy('ct.ct_pk', 'co.co_name');

    if (reqCtPk.trim()) query = query.whereIn('ct_pk', reqCtPk.split(','));
    if (reqName.trim()) query = query.where('co_name', 'like', `%${reqName}%`);
    if (reqManagerName.trim()) query = query.where('co_manager_name', 'like', `%${reqManagerName}%`);
    if (reqPcPk) {
      query = query.whereNotIn('ci_pk',
        cur({cco:'contract_correspondent_tbl'})
          .select('ci_pk')
          .innerJoin({ci:'correspondent_item_tbl'}, function(){
            this.on('cco.cco_copk', '=', 'ci.ci_copk')
              .andOn('cco.cco_ctpk', '=', 'ci.ci_ctpk')
          })
          .where('cco_pcpk', reqPcPk)
      );
    }

    query
      .map(item => {
        item.co_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(item.co_contact));
        return item;
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
          resHelper.getError('거래처 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {
    let correspondent;

    cur('correspondent_tbl')
      .first(
        'co_name',
        'co_manager_name',
        'co_contact',
        'co_location',
        'co_memo'
      )
      .where('co_pk', reqPk)
      .andWhere('co_deleted', false)
      .then(row => {
        if (!row) {
          res.json(
            resHelper.getError('해당하는 거래처가 없습니다.')
          );
        }
        else {
          row.co_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(row.co_contact));
          correspondent = row;
          cur({ci: 'correspondent_item_tbl'})
            .select(
              'ci_pk',
              'ct_pk',
              'ct_name',
              'ci_brand'
            )
            .leftJoin({ct: 'construction_tbl'}, 'ci.ci_ctpk', 'ct.ct_pk')
            .where('ci_copk', reqPk)
            .orderBy('ci.ci_pk')
            .then(response => {
              res.json(
                resHelper.getJson({
                  correspondent: correspondent,
                  correspondentItemList: response
                })
              );
            })
        }
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('거래처 상세를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/', (req, res) => {
  const reqName = req.body.co_name || '';
  const reqContact = req.body.co_contact || '';
  const reqManagerName = req.body.co_manager_name || '';
  const reqLocation = req.body.co_location || '';
  const reqMemo = req.body.co_memo || '';
  const reqItemList = req.body.correspondentItemList || [];

  if (reqName.trim() === '' || reqContact.trim() === '' || reqManagerName.trim() === '' || reqItemList.length === 0) {
    res.json(resHelper.getError('[0001] 필수 파라메터가 누락되었습니다.'));
  }
  else {
    let coPk;

    reqItemList.forEach(item => {
      if (item.ci_ctpk === undefined || item.ci_ctpk === '') {
        res.json(resHelper.getError('[0002] 필수 파라메터가 누락되었습니다.'));
      }
    });

    knexBuilder.getConnection().then(cur => {
      cur('correspondent_tbl')
        .insert({
          co_name: reqName,
          co_contact: cryptoHelper.encrypt(reqContact.split('-').join('')),
          co_manager_name: reqManagerName,
          co_location: reqLocation || '',
          co_memo: reqMemo || ''
        })
        .returning('co_pk')
        .then(response => {
          coPk = response[0];
          cur.transaction(function(trx) {
            const queries = [];
            reqItemList.forEach(obj => {
              const query = cur.table('correspondent_item_tbl')
                .insert({
                  ci_copk: coPk,
                  ci_ctpk: obj.ci_ctpk,
                  ci_brand: obj.ci_brand
                })
                .transacting(trx);
              queries.push(query);
            });
            Promise.all(queries)
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
            res.json(resHelper.getError('[0004] 거래처를 추가하는 중 오류가 발생하였습니다.'));
          })

        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0005] 거래처를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.co_name || '';
  const reqContact = req.body.co_contact || '';
  const reqManagerName = req.body.co_manager_name || '';
  const reqLocation = req.body.co_location || '';
  const reqMemo = req.body.co_memo || '';

  if (reqName === '' || reqContact === '' || reqManagerName === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('correspondent_tbl')
        .update({
          co_name: reqName,
          co_contact: cryptoHelper.encrypt(reqContact.split('-').join('')),
          co_manager_name: reqManagerName,
          co_location: reqLocation,
          co_memo: reqMemo
        })
        .where('co_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '거래처가 정상적으로 변경되었습니다.',
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 거래처를 변경하는 중 오류가 발생하였습니다.'));
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
      cur('correspondent_tbl')
        .update({
          co_deleted: true
        })
        .where('co_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '거래처가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 거래처를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});



/* 거래처 취급 항목 */

router.get('/:copk([0-9]+)/item', (req, res) => {
  const reqCoPk = req.params.copk || '';

  knexBuilder.getConnection().then(cur => {
    cur({ci: 'correspondent_item_tbl'})
      .select(
        'ci_pk',
        'ct_pk',
        'ct_name',
        'ci_brand'
      )
      .leftJoin({ct: 'construction_tbl'}, 'ci.ci_ctpk', 'ct.ct_pk')
      .orderBy('ct.ct_pk', 'cr.cr_name')
      .where('ci_copk', reqCoPk)
      .then(response => {
        res.json(
          resHelper.getJson({
            correspondentItemList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('거래처 취급 항목 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:copk([0-9]+)/item', (req, res) => {
  const reqCoPk = req.params.copk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqBrand = req.body.ci_brand || '';

  if (reqCoPk === '' || reqCtPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    const obj = {};
    obj.ci_copk = reqCoPk;
    obj.ci_ctpk = reqCtPk;
    obj.ci_brand = reqBrand;

    knexBuilder.getConnection().then(cur => {
      cur('correspondent_item_tbl')
        .insert(obj)
        .then((response) => {
          res.json(resHelper.getJson({
            msg: '거래처 취급 항목이 정상적으로 추가되었습니다.',
            data: {
              ...obj,
              ci_pk: response[0]
            }
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 거래처 취급 항목을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:copk([0-9]+)/item/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqBrand = req.body.ci_brand || '';

  if (reqCtPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    const obj = {};
    obj.ci_ctpk = reqCtPk;
    obj.ci_brand = reqBrand;
    knexBuilder.getConnection().then(cur => {
      cur('correspondent_item_tbl')
        .update(obj)
        .where('ci_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '거래처 취급 항목이 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 거래처 취급 항목을 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/:copk([0-9]+)/item/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('correspondent_item_tbl')
        .del()
        .where('ci_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '거래처 취급 항목이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 거래처 취급 항목을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});
module.exports = router;