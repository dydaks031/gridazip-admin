const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const randomHelper = require('../../services/random/helper');
const s3Helper = require('../../services/s3/helper');
const jwtHelper = require('../../services/jwt/helper');
const paginationService = require('../../services/pagination/main');
const fs = require('fs');
const multer  = require('multer');
const sharp = require('sharp');
const upload = multer({ dest: '/tmp/upload/'}).single('upload');


router.get('/', (req,res) => {
  let page = req.body['page'];
  let point= req.query.point;
  let pageIndex = req.query.page;
  const pageInst = new paginationService(page);
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
    let query = cur('magazine_tbl')
      .select(
        'mg_pk',
        'mg_subject',
        'mg_reg_dt',
        'mg_mod_dt',
        'mg_content',
        'mg_thumbnail'
      )
      .where('mg_delete_yn', false)
      .orderBy('mg_recency')
      .limit(pageInst.limit)
      .offset(pageInst.page);

    if (pageData.point !== null) {
      query = query.where('mg_pk', '<=', pageData.point);
    }

    let list = [];

    query.then(response => {
      // response.map(magazine => {
      //   let firstImage = /https.*\.[a-zA-Z]*/.exec(magazine.mg_content);
      //   if (firstImage) {
      //     firstImage = firstImage[0];
      //   } else {
      //     firstImage = '';
      //   }
      //   magazine.mg_main_image = firstImage;
      //   console.log(magazine.mg_content);
      //   console.log(firstImage);
      //   return magazine;
      // })

      if (response.length > 0) {
        if (pageData.point === null) {
          pageInst.setPoint(response[0]['mg_pk']);
        }
      }

      list = response;

      pageInst.setPage(pageData.page += list.length);
      pageInst.setLimit(pageData.limit);

      if (list.length < pageInst.limit) {
        pageInst.setEnd(true);
      }

      res.json(
        resHelper.getJson({
          data: list,
          page: pageInst.get()
        })
      );
    })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('매거진 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.get('/:mgpk([0-9]+)', (req, res) => {
  let reqMgPk = req.params.mgpk;

  knexBuilder.getConnection().then(cur => {
    cur('magazine_tbl')
      .first('mg_pk', 'mg_subject', 'mg_content', 'mg_thumbnail', 'mg_reg_dt', 'mg_reg_user', 'mg_mod_dt', 'mg_mod_user')
      .where('mg_pk', reqMgPk)
      .then(response => {
        res.json(
          resHelper.getJson({
            magazine: response
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('매거진을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/', (req,res) => {
  const reqSubject = req.body.mg_subject || '';
  const reqContent = req.body.mg_content;
  const reqThumbnail = req.body.mg_thumbnail;
  const jwtToken = req.token;
  let userInfo;
  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      return knexBuilder.getConnection();
    }).then(cur => {
    cur('magazine_tbl')
      .insert({
        mg_subject: reqSubject,
        mg_content: reqContent,
        mg_thumbnail: reqThumbnail,
        mg_reg_user: userInfo.user_pk,
        mg_mod_user: userInfo.user_pk,
        mg_recency: cur.raw('UNIX_TIMESTAMP() * -1')
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: '매거진이 성공적으로 등록되었습니다.'
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('매거진을 등록하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.put('/:mgpk([0-9]+)', (req,res) => {
  const reqMgPk = req.params.mgpk;
  const reqSubject = req.body.mg_subject || '';
  const reqContent = req.body.mg_content;
  const reqThumbnail = req.body.mg_thumbnail;
  const jwtToken = req.token;
  let userInfo;
  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      return knexBuilder.getConnection();
    }).then(cur => {
    cur('magazine_tbl')
      .update({
        mg_subject: reqSubject,
        mg_content: reqContent,
        mg_thumbnail: reqThumbnail,
        mg_mod_user: userInfo.user_pk
      })
      .where('mg_pk', reqMgPk)
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: '매거진이 성공적으로 수정되었습니다.'
          })
        );
      })
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('매거진을 등록하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.delete('/:mgpk([0-9]+)', (req, res) => {
  const reqMgPk = req.params.mgpk;
  const jwtToken = req.token;
  let userInfo;
  console.log('delete ~~~' + reqMgPk);
  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      return knexBuilder.getConnection();
    })
    .then(cur => {
      cur('magazine_tbl')
        .update({
          'mg_delete_yn': 1,
          'mg_mod_user': userInfo.user_pk
        })
        .where('mg_pk', reqMgPk)
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
            resHelper.getError('매거진을 삭제하는 중 오류가 발생하였습니다.')
          );
        })
    })
});

router.put('/:mgpk([0-9]+)', (req, res) => {
  const reqMgPk = req.param.mgpk;
  const reqMgSubject = req.body.mg_subject;
  const reqMgContent = req.body.mg_content;
  const jwtToken = req.token;
  let userInfo;
  jwtHelper.verify(jwtToken)
    .then(plain => {
      userInfo = plain;
      return knexBuilder.getConnection();
    })
    .then(cur => {
      cur('magazine_tbl')
        .update({
          'mg_subject': reqMgSubject,
          'mg_content': reqMgContent,
          'mg_mod_user': userInfo.user_pk
        })
        .where('mg_pk', reqMgPk)
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
            resHelper.getError('매거진을 삭제하는 중 오류가 발생하였습니다.')
          );
        })
    })
});

router.post('/upload', upload, (req, res) => {
  const MAX_FILE_SIZE = 1024 * 1024 * 500;
  const MAX_IMAGE_WIDTH = 1600;
  const MAX_IMAGE_HEIGHT = 1000;
  const resObj = {};
  if (typeof req.file === 'undefined' || typeof req.file.path === 'undefined') {
    return res.json(
      resHelper.getError('파일을 업로드해주시기 바랍니다.')
    )
  }
  else {
    const convert_options = {
      '-trim': '',
      '-density': 150,
      '-quality': 100,
      '-sharpen': '0x1.0'
    };

    if (req.file.size > MAX_FILE_SIZE) {
      return res.json(
        resHelper.getError('500MB 이하의 파일만 업로드가 가능합니다.')
      );
    }
    else {
      const fileSplited = req.file.originalname.split('.');
      const fileExt = fileSplited[fileSplited.length - 1];
      const mimeSplited = req.file.mimetype.split('/');

      if (req.file.mimetype === 'application/pdf') {
        pdf2images.convert(req.file.path, {
          convert_options: convert_options
        })
          .then(
            convertResponse => {
              var imageCount = 1;
              const promises = [];
              convertResponse.images.map(data => {
                promises.push(
                  new Promise((rootResolve, rootReject) => {
                    const fixedIndex = imageCount;
                    randomHelper.getString().then(hash => {
                      s3Helper.save(`static/resources/pdf/${hash}.png`, data)
                        .then(data => {
                          rootResolve(data);
                        })
                        .catch(err => {
                          res.json(
                            resHelper.getError(err)
                          )
                          rootReject(err)
                        });
                    });
                  })
                );
                imageCount++;
              });
              Promise.all(promises).then(values => {
                res.json(
                  resHelper.getJson({
                    values: values,
                    mimetype: req.file.mimetype
                  })
                );
              });
            },
            err => {
              res.json(
                resHelper.getError(err)
              );
            }
          )
          .catch(err => {
            console.error(err);
            res.json(
              resHelper.getError(err)
            );
          });
      }
      else {
        new Promise((resolve, reject) => {
          if (mimeSplited[0] === 'image') {
            sharp(req.file.path)
              .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT)
              .max()
              .toBuffer()
              .then(data => {
                resolve(data);
              })
              .catch(error => {
                reject(error);
              });
          }
          else {
            resolve(fs.createReadStream(req.file.path));
          }
        })
          .then(data => {
            return new Promise((resolve, reject) => {
              randomHelper.getString()
                .then(hash => {
                  resolve({
                    hash: hash,
                    data: data
                  });
                })
                .catch(error => {
                  reject(error);
                });
            });
          })
          .then(obj => {

            resObj.fileName = `${obj.hash}.${fileExt}`;
            resObj.uploaded = 1;
            resObj.url = `https://static.gridazip.co.kr/resources/magazine/${obj.hash}.${fileExt}`;
            console.log(fileExt);
            console.log(resObj.fileName);
            return s3Helper.save(`static/resources/magazine/${obj.hash}.${fileExt}`, obj.data);
          })
          .then(data => {
            res.json(
              resObj
            );
          })
          .catch(error => {
            console.error(error);
            if (typeof error === 'object') {
              error = '파일 업로드 중 알 수 없는 오류가 발생하였습니다';
            }

            res.json(
              resHelper.getError(error)
            );
          });
      }
    }
  }
});

module.exports = router;