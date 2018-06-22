const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const FormatService = require('../../services/format/helper');

/* 기술자 */

router.get('/', (req, res) => {
  const reqCtPk = req.query.ct_pk || '';
  const reqName = req.query.cr_name || '';

  knexBuilder.getConnection().then(cur => {
    let query = cur({cr: 'constructor_tbl'})
      .select(
        'cr_pk',
        'ct_pk',
        'ct_name',
        'cr_name',
        'cr_contact',
        'cr_communication_score',
        'cs_skill_score',
        'cs_memo'
        )
      .leftJoin({cs: 'constructor_skill_tbl'}, 'cr.cr_pk', 'cs.cs_crpk')
      .leftJoin({ct: 'construction_tbl'}, 'cs.cs_ctpk', 'ct.ct_pk')
      .where('cr_deleted', false)
      .orderBy('ct.ct_pk', 'cr.cr_name');

    if (reqCtPk.trim()) query = query.whereIn('ct_pk', reqCtPk.split(','));
    if (reqName.trim()) query = query.where('cr_name', 'like', `%${reqName}%`);

    query
      .map(item => {
        item.cr_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(item.cr_contact));
        return item
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
          resHelper.getError('기술자 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {
    let constructor;

    cur('constructor_tbl')
      .first(
        'cr_name',
        'cr_contact',
        'cr_communication_score'
      )
      .where('cr_pk', reqPk)
      .andWhere('cr_deleted', false)
      .then(row => {
        if (!row) {
          res.json(
            resHelper.getError('해당하는 기술자가 없습니다.')
          );
        }
        else {
          row.cr_contact = FormatService.toDashedPhone(cryptoHelper.decrypt(row.cr_contact));
          constructor = row;
          cur({cs: 'constructor_skill_tbl'})
            .select(
              'cs_pk',
              'ct_pk',
              'ct_name',
              'cs_skill_score',
              'cs_memo'
            )
            .leftJoin({ct: 'construction_tbl'}, 'cs.cs_ctpk', 'ct.ct_pk')
            .where('cs.cs_crpk', reqPk)
            .orderBy('cs.cs_pk')
            .then(response => {
              res.json(
                resHelper.getJson({
                  constructor: constructor,
                  constructorSkillList: response
                })
              );
            })
        }
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('기술자 상세를 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/', (req, res) => {
  const reqName = req.body.cr_name || '';
  const reqContact = req.body.cr_contact || '';
  const reqCommunicationScore = req.body.cr_communication_score || '';
  const reqSkillList = req.body.constructorSkillList || [];

  if (reqName.trim() === '' || reqContact.trim() === '' || reqSkillList.length === 0) {
    return res.json(resHelper.getError('[0001] 파라메터가 올바르지 않습니다.'));
  }
  else {
    let crPk;

    reqSkillList.forEach(skill => {
      if (skill.cs_ctpk === undefined || skill.cs_ctpk === '') {
        console.error(skill);
        return res.json(resHelper.getError('[0002] 파라메터가 올바르지 않습니다.'));
      }
      else if (skill.cs_skill_score === undefined || skill.cs_skill_score === '') {
        console.error(skill);
        return res.json(resHelper.getError('[0003] 파라메터가 올바르지 않습니다.'));
      }
    });

    knexBuilder.getConnection().then(cur => {
      cur('constructor_tbl')
        .insert({
          cr_name: reqName,
          cr_contact: cryptoHelper.encrypt(reqContact.split('-').join('')),
          cr_communication_score: reqCommunicationScore
        })
        .returning('cr_pk')
        .then(response => {
          crPk = response[0];
          cur.transaction(function(trx) {
            const queries = [];
            reqSkillList.forEach(obj => {
              const query = cur.table('constructor_skill_tbl')
                .insert({
                  cs_crpk: crPk,
                  cs_ctpk: obj.cs_ctpk,
                  cs_skill_score: obj.cs_skill_score,
                  cs_memo: obj.cs_memo
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
            res.json(resHelper.getError('[0004] 기술자를 추가하는 중 오류가 발생하였습니다.'));
          })

        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0005] 기술자를 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqName = req.body.cr_name || '';
  const reqContact = req.body.cr_contact || '';
  const reqCommunicationScore = req.body.cr_communication_score || '';

  if (reqName === '' || reqContact === '' || reqCommunicationScore === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('constructor_tbl')
        .update({
          cr_contact: reqContact,
          cr_communication_score: reqCommunicationScore
        })
        .where('cr_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '기술자가 정상적으로 변경되었습니다.',
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자를 변경하는 중 오류가 발생하였습니다.'));
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
      cur('constructor_tbl')
        .update({
          cr_deleted: true
        })
        .where('cr_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '기술자가 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자를 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});



/* 기술자 보유 기술 */

router.get('/:crpk([0-9]+)/skill', (req, res) => {
  const reqCrPk = req.params.crpk || '';

  knexBuilder.getConnection().then(cur => {
    cur({cs: 'constructor_skill_tbl'})
      .select(
        'cs_pk',
        'ct_pk',
        'ct_name',
        'cs_skill_score',
        'cs_memo'
      )
      .leftJoin({ct: 'construction_tbl'}, 'cs.cs_ctpk', 'ct.ct_pk')
      .where('cs_crpk', reqCrPk)
      .orderBy('ct.ct_pk', 'cr.cr_name')
      .then(response => {
        res.json(
          resHelper.getJson({
            constructorSkillList: response
          })
        );
      })
      .catch(err => {
        console.log(err);
        res.json(
          resHelper.getError('기술자 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:crpk([0-9]+)/skill', (req, res) => {
  const reqCrPk = req.params.crpk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqSkillScore = req.body.cs_skill_score || '';
  const reqMemo = req.body.cs_memo || '';

  if (reqCrPk === '' || reqCtPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    const obj = {};
    obj.cs_crpk = reqCrPk;
    obj.cs_ctpk = reqCtPk;
    obj.cs_skill_score = reqSkillScore;
    obj.cs_memo = reqMemo;

    knexBuilder.getConnection().then(cur => {
      cur('constructor_skill_tbl')
        .insert(obj)
        .then((response) => {
          console.log(response)
          res.json(resHelper.getJson({
            msg: '기술자 보유 기술이 정상적으로 추가되었습니다.',
            data: {
              ...obj,
              cs_pk: response[0]
            }
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자 보유 기술을 추가하는 중 오류가 발생하였습니다.'));
        })
    })
  }
});

router.put('/:crpk([0-9]+)/skill/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  const reqCtPk = req.body.ct_pk || '';
  const reqSkillScore = req.body.cs_skill_score || '';
  const reqMemo = req.body.cs_memo || '';

  if (reqCtPk === '') {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    const obj = {};
    obj.cs_ctpk = reqCtPk;
    obj.cs_skill_score = reqSkillScore;
    obj.cs_memo = reqMemo;
    knexBuilder.getConnection().then(cur => {
      cur('constructor_skill_tbl')
        .update(obj)
        .where('cs_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '기술자 보유 기술이 정상적으로 변경되었습니다.',
            data: obj
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자 보유 기술을 변경하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});

router.delete('/:crpk([0-9]+)/skill/:pk([0-9]+)', (req, res) => {
  const reqPk = req.params.pk || '';
  if (reqPk === '') {
    res.json(resHelper.getError('전송 받은 파라메터가 올바르지 않습니다.'));
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('constructor_skill_tbl')
        .del()
        .where('cs_pk', reqPk)
        .then(() => {
          res.json(resHelper.getJson({
            msg: '기술자 보유 기술이 정상적으로 삭제되었습니다.'
          }));
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자 보유 기술을 삭제하는 중 오류가 발생하였습니다.'));
        })
    });
  }
});
module.exports = router;