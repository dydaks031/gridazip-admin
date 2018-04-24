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
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const pdf2images = require('pdf2images');
const sharp = require('sharp');
const upload = multer({ dest: '/tmp/upload/'}).single('filedata');

const MAX_FILE_SIZE = 1024 * 1024 * 500;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1000;

router.post('/upload', upload, (req, res, next) => {
  const fileUploadPath = req.body.file_upload_path;
  if (!fileUploadPath || fileUploadPath === 'null') {
    return res.json(
      resHelper.getError('파일 경로를 설정해주시기 바랍니다.')
    )
  }
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
      const fileSplited = req.file.originalname.split();
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
            res.json(
              resHelper.getError(err)
            );
          });
      }
      else {
        new Promise((resolve, reject) => {
          if (mimeSplited[0] === 'image') {
        //     sharp(req.file.path)
        //       .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT)
        //       .max()
        //       .toBuffer()
        //       .then(data => {
        //         resolve(data);
        //       })
        //       .catch(error => {
        //         reject(error);
        //       });
        //   }
            resolve(fs.createReadStream(req.file.path));
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
            return s3Helper.save(`static/resources/${fileUploadPath}/${obj.hash}.${fileExt}`, obj.data);
          })
          .then(data => {
            res.json(
              resHelper.getJson({
                value: data,
                mimetype: req.file.mimetype
              })
            );
          })
          .catch(error => {
            console.log(error);
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