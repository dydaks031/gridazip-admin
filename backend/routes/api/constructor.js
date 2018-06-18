const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');

/* 자재 분류*/

router.get('/', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur({cr: 'constructor_tbl'})
      .select(
        'ct_name',
        'cr_name',
        'cr_contact',
        'cr_communication_score',
        'cs_skill_score',
        'cs_memo'
        )
      .leftJoin({cs: 'constructor_skill_tbl'}, 'cr.cr_pk', 'cs.cs_crpk')
      .leftJoin({ct: 'construction_tbl'}, 'cs.cs_ctpk', 'ct.ct_pk')
      .orderBy('ct.ct_pk', 'cr.cr_name')
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

router.post('/', (req, res) => {
  const reqName = req.body.cr_name || '';
  const reqContact = req.body.cr_contact || '';
  const reqCommunicationScore = req.body.cr_communication_score || '';
  const reqSkillList = req.body.skillList || [];

  if (reqName.trim() === '' || reqContact.trim() === '' || reqSkillList.length === 0) {
    res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
  }
  else {
    let crPk;

    reqSkillList.forEach(skill => {
      if (skill.cs_ctpk === undefined || skill.cs_ctpk.trim() === '') {
        res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
      }
      else if (skill.cs_skill_score === undefined || skill.cs_skill_score.trim() === '') {
        res.json(resHelper.getError('파라메터가 올바르지 않습니다.'));
      }
    });

    knexBuilder.getConnection().then(cur => {
      cur('constructor_tbl')
        .insert({
          cr_name: reqName,
          cr_contact: cryptoHelper.encrypt(reqContact),
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
              .then(() => {
                res.json(resHelper.getJson({
                  msg: '기술자가 정상적으로 추가되었습니다.',
                  data: {
                    msg: 'ok'
                  }
                }));
                return trx.commit;
              })
              .catch(() => {
                cur('constructor_tbl')
                  .del()
                  .where('cr_pk',crPk);
                return trx.rollback;
              });
          });
        })
        .catch(err => {
          console.error(err);
          res.json(resHelper.getError('[0001] 기술자를 추가하는 중 오류가 발생하였습니다.'));
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
            msg: '자재 분류가 정상적으로 변경되었습니다.',
            data: {
              msg: 'ok'
            }
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

module.exports = router;