const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');
const randomHelper = require('../../services/random/helper');
const s3Helper = require('../../services/s3/helper');
const jwtHelper = require('../../services/jwt/helper')

router.post('/login', (req, res) => {
  let user_id = req.body['user_id'] || '';
  let user_pw = req.body['user_pw'] || '';
  let userResult;

  if (user_id === '') {
    res.json(
      resHelper.getError('로그인 하실 계정의 아이디를 입력해주세요.')
    );
    return;
  }

  if (user_pw === '') {
    return res.json(
      resHelper.getError('로그인 하실 계정의 패스워드를 입력해주세요.')
    );
  }

  knexBuilder.getConnection()
  .then(cur => {
    cur('user_tbl')
      .where({
        user_id: user_id
      })
      .whereNull('user_oauth_type')
      .whereRaw('user_pw = PASSWORD(?)', [user_pw]).limit(1)
      .then(response => {
        if (response.length > 0) {
          userResult = response[0];
          if ( userResult.user_permit === 'A' ) {
            return jwtHelper.sign({
              user_permit: userResult.user_permit,
              user_name: userResult.user_name,
              user_id,
            })
          } else {
            return res.json(
              resHelper.getError('권한이 없습니다.')
            )
          }
        }
        else {
          return res.json(
            resHelper.getError('해당 아이디와 패스워드에 일치하는 사용자가 없습니다.')
          );
        }
      })
      .then((token) => {
        res.json({
          message: 'success',
          token
        })
      })
      .catch(reason => {
        res.json(
          resHelper.getError('로그인 도중 알 수 없는 문제가 발생했습니다.')
        );
        throw reason;
      });
  });
})

router.get('/user', (req, res) => {
  const token = req.token

  jwtHelper.verify(token)
    .then((plain) => {
      res.json({
        status: "success",
        data: plain
      })
    })
    .catch((error) => {
      res.json(
        resHelper.getError(`으앙시발 ${error}`)
      )
    })
})

router.get('/logout', (req, res) => {

})

module.exports = router;