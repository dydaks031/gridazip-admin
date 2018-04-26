const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/designer', (req, res) => {
  const page = req.body['page'];
  const filter = req.body['filter'];
  const pageInst = new paginationService(page);
  const filterInst = new filterService(filter);
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

  knexBuilder.getConnection().then(cur => {
    let query = cur('designer_tbl')
      .select('*')
      .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = designer_tbl.ds_pk AND view.pv_type = ?
      ) AS view
      `, 'D'));

    const filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      default:
        query = query.orderBy('designer_tbl.ds_recency');
    }

    // 임시
    // query = query.where('ds_is_dev', false);

    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('ds_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['ds_pk']);
          }
        }

        list = response;
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('designer_tbl').count('* as count');
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
      .catch(() => {
        res.json(
          resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        )
      });
  });
});

router.post('/designer/:did([0-9]+)', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    let ipLong = ip.toLong(req.ip);
    let designerID = req.params.did;
    let designer;
    let portfolio;

    cur('designer_tbl')
      .where({
        ds_pk: designerID
      })
      .limit(1)
      .then(response => {
        if (response.length < 1) {
          return res.json(
            resHelper.getError('해당 디자이너가 존재하지 않습니다.')
          );
        }

        cur('profile_view_hst')
          .count('* as count')
          .where({
            pv_target: designerID,
            pv_type: 'D',
            pv_ip: ipLong
          })
          .limit(1)
          .then(response => {
            const count = response[0].count;

            if (count < 1) {
              cur('profile_view_hst')
                .insert({
                  pv_target: designerID,
                  pv_type: 'D',
                  pv_ip: ipLong,
                  pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                })
                .then(() => {
                })
                .catch(() => {
                });
            }
          })
          .catch(() => {
          });

        designer = response[0];

        return cur('portfolio_tbl')
          .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
          .innerJoin('portfolio_image_hst', 'portfolio_tbl.pf_pk', 'portfolio_image_hst.pi_pfpk')
          .where({
            wk_dspk: designerID
          })
          .orderBy('portfolio_tbl.pf_recency')
          .orderBy('portfolio_image_hst.pi_is_primary')
          .groupBy('portfolio_tbl.pf_pk')
          .limit(4);
      })
      .then(response => {
        portfolio = response;

        res.json(
          resHelper.getJson({
            data: designer,
            portfolio: portfolio
          })
        );
      })
      .catch(() => {
        res.json(
          resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        );
      });
  });
});

router.post('/designer/delete/:did', (req, res) => {
  let designerID = req.params.did;

  knexBuilder.getConnection().then(cur => {

    cur('designer_tbl')
      .where({
        ds_pk: designerID
      })
      .limit(1)
      .then(response => {
        let promises = [];

        if (response.length > 0) {
          promises.push(
            cur('designer_tbl')
              .where({
                ds_pk: designerID
              })
              .del()
          );
        }

        return Promise.all(promises);
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: 'ok'
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError(reason)
        );
      });
  });
});

router.post('/designer/save/:did*?', (req, res) => {
  let did = req.params.did;

  let designer_name = req.body.designer_name || '';
  let designer_score_communication = req.body.designer_score_communication || '';
  let designer_score_timestrict = req.body.designer_score_timestrict || '';
  let designer_score_quality = req.body.designer_score_quality || '';
  let designer_style = req.body.designer_style || '';
  let designer_address = req.body.designer_address || '';
  let designer_introduce = req.body.designer_introduce || '';
  let designer_price_min = req.body.designer_price_min || '';
  let designer_price_max = req.body.designer_price_max || '';
  let designer_image = req.body.designer_image_data || '';
  let designer_is_dev = req.body.designer_is_dev || false;


  let errorMsg = null;

  if (designer_name === '') {
    errorMsg = '이름은 반드시 입력해야 합니다.';
  }
  else if(designer_score_communication === '') {
    errorMsg = '커뮤니케이션 점수는 반드시 선택해야 합니다.';
  }
  else if(designer_score_timestrict === '') {
    errorMsg = '시간엄수 점수는 반드시 입력해야 합니다.';
  }
  else if(designer_score_quality === '') {
    errorMsg = '디자인 완성도 점수는 반드시 입력해야 합니다.';
  }
  else if(designer_price_min === '') {
    errorMsg = '디자인 최소 비용은 반드시 입력해야 합니다.';
  }
  else if(designer_price_max === '') {
    errorMsg = '디자인 최대 비용은 반드시 입력해야 합니다.';
  }
  else if(designer_image === '') {
    errorMsg = '프로필 사진은 반드시 업로드해야 합니다.';
  }
  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      if (did) {
        cur('designer_tbl')
          .select('*')
          .where({
            ds_pk: did
          })
          .limit(1)
          .then(response => {
            if (response.length < 1) {
              res.json(
                resHelper.getError('수정할 디자이너 프로필이 존재하지 않습니다.')
              );
            }
            else {
              did = response[0].ds_pk;
              return cur('designer_tbl')
                .where({
                  ds_pk: did
                })
                .update({
                  ds_name: designer_name,
                  ds_score_communication: designer_score_communication,
                  ds_score_timestrict: designer_score_timestrict,
                  ds_score_quality: designer_score_quality,
                  ds_style: designer_style,
                  ds_address: designer_address,
                  ds_introduce: designer_introduce,
                  ds_price_min: designer_price_min,
                  ds_price_max: designer_price_max,
                  ds_image: designer_image,
                  ds_is_dev: designer_is_dev,
                });
            }
          })
          .finally(() => {
            res.json(
              resHelper.getJson({
                msg: 'ok'
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
      else {
        cur('designer_tbl')
          .returning('ds_pk')
          .insert({
            ds_name: designer_name,
            ds_score_communication: designer_score_communication,
            ds_score_timestrict: designer_score_timestrict,
            ds_score_quality: designer_score_quality,
            ds_style: designer_style,
            ds_address: designer_address,
            ds_introduce: designer_introduce,
            ds_price_min: designer_price_min,
            ds_price_max: designer_price_max,
            ds_image: designer_image,
            ds_is_dev: designer_is_dev,
            ds_recency: cur.raw('UNIX_TIMESTAMP() * -1')
          })
          .then(responses => {
            did = responses[0];
            res.json(
              resHelper.getJson({
                value: did
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
    });
  }
});


router.post('/constructor', (req, res) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let pageInst = new paginationService(page);
  let filterInst = new filterService(filter);
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

  knexBuilder.getConnection().then(cur => {
    let query = cur('constructor_tbl')
      .select('*')
      .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = constructor_tbl.cr_pk AND view.pv_type = ?
      ) AS view
      `, 'C'));

    const filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      default:
        query = query.orderBy('constructor_tbl.cr_recency');
    }

    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('cr_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['cr_pk']);
          }
        }

        list = response;
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('constructor_tbl').count('* as count');
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
      .catch(() => {
        res.json(
          resHelper.getError('시공자 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
        )
      });
  });
});

router.post('/constructor/:cid([0-9]+)', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    const constructorID = req.params.cid;
    let constructor;

    cur('constructor_tbl')
      .where({
        cr_pk: constructorID
      })
      .limit(1)
      .then(response => {
        if (response.length < 1) {
          return res.json(
            resHelper.getError('해당 시공자가 존재하지 않습니다.')
          );
        }
        constructor = response[0];
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            data: constructor
          })
        );
      })
      .catch(() => {
        res.json(
          resHelper.getError('시공자 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        );
      });
  });
});

router.post('/constructor/delete/:cid', (req, res) => {
  let constructorID = req.params.cid;

  knexBuilder.getConnection().then(cur => {

    cur('constructor_tbl')
      .where({
        cr_pk: constructorID
      })
      .limit(1)
      .then(response => {
        let promises = [];

        if (response.length > 0) {
          promises.push(
            cur('constructor_tbl')
              .where({
                cr_pk: constructorID
              })
              .del()
          );
        }

        return Promise.all(promises);
      })
      .then(() => {
        res.json(
          resHelper.getJson({
            msg: 'ok'
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError(reason)
        );
      });
  });
});

router.post('/constructor/save/:cid*?', (req, res) => {
  let cid = req.params.cid;

  let constructor_cppk = req.body.constructor_cppk || '';
  let constructor_name = req.body.constructor_name || '';
  let constructor_score = req.body.constructor_score || '';
  let constructor_address = req.body.constructor_address || '';
  let constructor_image = req.body.constructor_image_data || '';
  let constructor_is_dev = req.body.constructor_is_dev || false;

  let errorMsg = null;

  if (constructor_cppk === '') {
    errorMsg = '소속 회사는 반드시 선택해야 합니다.';
  }
  else if(constructor_name === '') {
    errorMsg = '이름은 반드시 선택해야 합니다.';
  }
  else if(constructor_score === '') {
    errorMsg = '점수는 반드시 입력해야 합니다.';
  }
  else if(constructor_image === '') {
    errorMsg = '프로필 사진은 반드시 업로드해야 합니다.';
  }
  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      if (cid) {
        cur('constructor_tbl')
          .select('*')
          .where({
            cr_pk: cid
          })
          .limit(1)
          .then(response => {
            if (response.length < 1) {
              res.json(
                resHelper.getError('수정할 시공자 프로필이 존재하지 않습니다.')
              );
            }
            else {
              return cur('constructor_tbl')
                .where({
                  cr_pk: cid
                })
                .update({
                  cr_cppk: constructor_cppk,
                  cr_name: constructor_name,
                  cr_score: constructor_score,
                  cr_address: constructor_address,
                  cr_image: constructor_image,
                  cr_is_dev: constructor_is_dev,
                });
            }
          })
          .finally(() => {
            res.json(
              resHelper.getJson({
                msg: 'ok'
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
      else {
        cur('constructor_tbl')
          .returning('cr_pk')
          .insert({
            cr_cppk: constructor_cppk,
            cr_name: constructor_name,
            cr_score: constructor_score,
            cr_address: constructor_address,
            cr_image: constructor_image,
            cr_is_dev: constructor_is_dev,
            cr_recency: cur.raw('UNIX_TIMESTAMP() * -1')
          })
          .then(responses => {
            cid = responses[0];
            res.json(
              resHelper.getJson({
                value: cid
              })
            );
          })
          .catch(reason => {
            res.json(
              resHelper.getError(reason)
            );
          });
      }
    });
  }
});

module.exports = router;