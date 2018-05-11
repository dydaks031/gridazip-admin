const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

/**
 * get portfolio List
 */
router.get('/', (req, res) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let point= req.query.point;
  let pageIndex = req.query.page;
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

  if (point !== 'null' && pageIndex !== 'null') {
    pageInst.setPoint(point)
    pageInst.setPage(pageIndex)
    pageData = pageInst.get()
  }

  knexBuilder.getConnection().then(cur => {
    let query = cur('portfolio_tbl');
    const filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      case 'price':
        query = query.orderBy('portfolio_tbl.pf_price', 'desc');
        break;
      default:
        query = query.orderBy('portfolio_tbl.pf_recency');
    }

    if (filterInst.getFilter('style') !== null) {
      query = query.where('portfolio_tbl.pf_style', filterInst.getFilter('style'));
    }

    if (filterInst.getFilter('size') !== null) {
      const filterSize = filterInst.getFilter('size');

      switch (filterSize) {
        case 'lt20':
          query = query.where('portfolio_tbl.pf_size', '<', 20);
          break;
        case 'eq20':
          query = query.where('portfolio_tbl.pf_size', '>=', 20).andWhere('portfolio_tbl.pf_size', '<', 30);
          break;
        case 'eq30':
          query = query.where('portfolio_tbl.pf_size', '>=', 30).andWhere('portfolio_tbl.pf_size', '<', 40);
          break;
        case 'eq40':
          query = query.where('portfolio_tbl.pf_size', '>=', 40).andWhere('portfolio_tbl.pf_size', '<', 50);
          break;
        case 'eq50':
          query = query.where('portfolio_tbl.pf_size', '>=', 50).andWhere('portfolio_tbl.pf_size', '<', 60);
          break;
        default:
          query = query.where('portfolio_tbl.pf_size', '>=', 60);
      }
    }

    if (filterInst.getFilter('price') !== null) {
      const filterPrice = filterInst.getFilter('price');

      switch (filterPrice) {
        case 'lt1500':
          query = query.where('portfolio_tbl.pf_price', '<', 1500);
          break;
        case 'lt2000':
          query = query.where('portfolio_tbl.pf_price', '<', 2000);
          break;
        case 'lt2500':
          query = query.where('portfolio_tbl.pf_price', '<', 2500);
          break;
        case 'lt3000':
          query = query.where('portfolio_tbl.pf_price', '<', 3000);
          break;
        case '1500~2000':
          query = query.where('portfolio_tbl.pf_price', '>=', 1500).andWhere('portfolio_tbl.pf_price', '<=', 2000);
          break;
        case '2000~2500':
          query = query.where('portfolio_tbl.pf_price', '>=', 2000).andWhere('portfolio_tbl.pf_price', '<=', 2500);
          break;
        case '2500~3000':
          query = query.where('portfolio_tbl.pf_price', '>=', 2500).andWhere('portfolio_tbl.pf_price', '<=', 3000);
          break;
        case '3000~3500':
          query = query.where('portfolio_tbl.pf_price', '>=', 3000).andWhere('portfolio_tbl.pf_price', '<=', 3500);
          break;
        case '3500~4000':
          query = query.where('portfolio_tbl.pf_price', '>=', 3500).andWhere('portfolio_tbl.pf_price', '<=', 4000);
          break;
        case '4000~4500':
          query = query.where('portfolio_tbl.pf_price', '>=', 4000).andWhere('portfolio_tbl.pf_price', '<=', 4500);
          break;
        case '4500~5000':
          query = query.where('portfolio_tbl.pf_price', '>=', 4500).andWhere('portfolio_tbl.pf_price', '<=', 5000);
          break;
        case '5000~5500':
          query = query.where('portfolio_tbl.pf_price', '>=', 5000).andWhere('portfolio_tbl.pf_price', '<=', 5500);
          break;
        case '5500~6000':
          query = query.where('portfolio_tbl.pf_price', '>=', 5500).andWhere('portfolio_tbl.pf_price', '<=', 6000);
          break;
        case 'gte2500':
          query = query.where('portfolio_tbl.pf_price', '>=', 2500);
          break;
        case 'gte3000':
          query = query.where('portfolio_tbl.pf_price', '>=', 3000);
          break;
        case 'gte4000':
          query = query.where('portfolio_tbl.pf_price', '>=', 4000);
          break;
        case 'gte5000':
          query = query.where('portfolio_tbl.pf_price', '>=', 5000);
          break;
        case 'gte6000':
          query = query.where('portfolio_tbl.pf_price', '>=', 6000);
          break;
      }
    }

    if (pageData.point !== null) {
      query = query.where('pf_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .clone()
      .count('* as count')
      .then(response => {
        pageInst.setCount(response[0].count);
        return query
          .select('*')
          .column(cur.raw(`
            (
              SELECT COUNT(*) AS count
              FROM portfolio_view_hst AS view
              WHERE view.pv_pfpk = portfolio_tbl.pf_pk
            ) AS view
          `)
          )
          .leftJoin('portfolio_image_hst', 'portfolio_tbl.pf_pk', 'portfolio_image_hst.pi_pfpk')
          .groupBy('portfolio_tbl.pf_pk')
          .orderBy('portfolio_image_hst.pi_is_primary')
          .limit(pageInst.limit)
          .offset(pageInst.page);
      })
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['pf_pk']);
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
      .catch(reason => {
        res.json(
          resHelper.getError('포트폴리오를 조회하는 중 문제가 발생하였습니다.')
        );
        throw reason;
      });
  });
});

/**
 * get current portfolio
 */
router.get('/:pid([0-9]+)', (req, res) => {
  let pid = req.params.pid;
  let portfolio;
  let images;
  let positions;
  let documents;
  let designer_images;
  let ipLong = ip.toLong(req.ip);

  knexBuilder.getConnection().then(cur => {
    cur('portfolio_tbl')
      .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
      .innerJoin('designer_tbl', 'work_tbl.wk_dspk', 'designer_tbl.ds_pk')
      .where('portfolio_tbl.pf_pk', pid)
      .limit(1)
      .then(response => {
        portfolio = response ? response[0] : null;

        if (portfolio !== null) {
          cur('portfolio_view_hst')
            .count('* as count')
            .where({
              pv_pfpk: pid,
              pv_ip: ipLong
            })
            .limit(1)
            .then(response => {
              const count = response[0].count;

              if (count < 1) {
                cur('portfolio_view_hst').insert({
                  pv_pfpk: pid,
                  pv_ip: ipLong,
                  pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                })
                  .then(response => {
                  })
                  .catch(() => {
                    ;
                  });
              }
            })
            .catch(() => {
              ;
            });
        }

        return cur('portfolio_image_hst')
          .orderBy('portfolio_image_hst.pi_is_primary', 'asc')
          .orderBy('portfolio_image_hst.pi_pk')
          .where('pi_pfpk', pid);
      })
      .then(response => {
        images = response;

        return cur('portfolio_tbl')
          .select([
            'rd_url'
          ])
          .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
          .innerJoin('resource_document_hst', 'work_tbl.wk_pk', 'resource_document_hst.rd_wkpk')
          .orderBy('resource_document_hst.rd_order')
          .where('pf_pk', pid);
      })
      .then(response => {
        documents = response.map(data => {
          return data.rd_url;
        });

        return cur('portfolio_image_hst')
          .where('portfolio_image_hst.pi_dspk', portfolio.ds_pk)
          .orderBy('portfolio_image_hst.pi_recency')
          .limit(10);
      })
      .then(response => {
        designer_images = response;
        res.json(
          resHelper.getJson({
            data: portfolio,
            images: images,
            positions: positions,
            documents: documents,
            designer_images,
            receipt: {
              employee: [],
              resource: []
            }
          })
        );
      })
      .catch(reason => {
        console.error(reason);
        res.json(
          resHelper.getError('포트폴리오 상세 정보를 가지고 오는 중에 문제가 발생했습니다.')
        );
      });
  });
});

/**
 * register portfolio
 */
router.post('/', (req, res) => {
  let pid = req.params.pid;
  let wkid = null;

  let portfolio_title = req.body.pf_title || '';
  let portfolio_description = req.body.pf_description || '';
  let portfolio_address = req.body.pf_address || '';
  let portfolio_style = req.body.pf_style || '';
  let portfolio_size = req.body.pf_size || 0;
  let portfolio_designer = 1
  let portfolio_price = req.body.pf_price || 0;
  let portfolio_document = req.body.pf_document_data || '';
  let portfolio_is_dev = req.body.pf_is_dev || false;
  let portfolio_image_list = req.body.portfolio_image_list || []

  let errorMsg = null;

  if (portfolio_title === '') {
    errorMsg = '제목은 반드시 입력해야 합니다.';
  }
  else if(portfolio_address === '') {
    errorMsg = '주소는 반드시 입력해야 합니다.';
  }
  else if(portfolio_style === '') {
    errorMsg = '스타일은 반드시 입력해야 합니다.';
  }
  else if(portfolio_size === '') {
    errorMsg = '평수는 반드시 입력해야 합니다.';
  }
  else if(portfolio_price === '') {
    errorMsg = '비용은 반드시 입력해야 합니다.';
  }
  else if(req.body['portfolio_image_list[0]'] === '') {
    errorMsg = '적어도 1개의 이미지를 업로드 하셔야 합니다.';
  }

  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('work_tbl')
        .returning('wk_pk')
        .insert({
          wk_user: req.session.user.user_pk,
          wk_dspk: portfolio_designer,
          wk_recency: cur.raw('UNIX_TIMESTAMP() * -1')
        })
        .then(response => {
          wkid = response[0];
          return cur('portfolio_tbl')
            .returning('pf_pk')
            .insert({
              pf_wkpk: wkid,
              pf_style: portfolio_style,
              pf_price: portfolio_price,
              pf_size: portfolio_size,
              pf_address: portfolio_address,
              pf_title: portfolio_title,
              pf_description: portfolio_description,
              pf_is_dev: portfolio_is_dev,
              pf_recency: cur.raw('UNIX_TIMESTAMP() * -1')
            })
        })
        .then(response => {
          let promises = [];

          pid = response[0];
          portfolio_image_list.map((element, idx) => {
            // let target = portfolio_after.filter(target => {
            //     return target.index === element.index;
            // });
            // target = target.length > 0? target[0]:null;
            // if (target !== null) {
            promises.push(cur('portfolio_image_hst')
              .insert({
                pi_pfpk: pid,
                pi_dspk: portfolio_designer,
                pi_before: '',
                pi_after: element,
                pi_is_primary: idx === 0? 'Y':'N',
                pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
              }));
            // }
          });

          return Promise.all(promises);
        })
        .then(() => {
          if (portfolio_document !== '') {
            let portfolio_documents = portfolio_document.split(',');
            let promises = [];
            portfolio_documents.map((element, index) => {
              promises.push(cur('resource_document_hst')
                .insert({
                  rd_wkpk: wkid,
                  rd_url: element,
                  rd_order: index,
                  rd_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                }));
            });
            return Promise.all(promises);
          }
          else {
            res.json(
              resHelper.getJson({
                value: pid
              })
            );
          }
        })
        .then(() => {
          res.json(
            resHelper.getJson({
              value: pid
            })
          );
        })
        .catch(reason => {
          console.log(reason)
          res.json(
            resHelper.getError(reason)
          );
        });
    });
  }
});

/**
 * delete portfolio
 */
router.delete('/:pid([0-9]+)', (req, res) => {
  let pid = req.params.pid;

  knexBuilder.getConnection().then(cur => {

    cur('portfolio_tbl')
      .where({
        pf_pk: pid
      })
      .limit(1)
      .then(response => {
        let promises = [];

        if (response.length > 0) {
          let wkid = response[0].pf_wkpk;

          promises.push(
            cur('portfolio_tbl')
              .where({
                pf_pk: pid
              })
              .del()
          );

          promises.push(
            cur('portfolio_image_hst')
              .where({
                pi_pfpk: pid
              })
              .del()
          );

          promises.push(
            cur('resource_document_hst')
              .where({
                rd_wkpk: wkid
              })
              .del()
          );

          promises.push(
            cur('work_tbl')
              .where({
                wk_pk: wkid
              })
              .del()
          );
        }

        return Promise.all(promises);
      })
      .then(response => {
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

/**
 * modify portfolio
 */
router.put('/:pid([0-9]+)', (req, res) => {
  let pid = req.params.pid;
  let wkid = null;

  let portfolio_title = req.body.pf_title || '';
  let portfolio_designer = req.body.ds_pk || '';
  let portfolio_description = req.body.pf_description || '';
  let portfolio_address = req.body.pf_address || '';
  let portfolio_style = req.body.pf_style || '';
  let portfolio_size = req.body.pf_size || 0;
  let portfolio_price = req.body.pf_price || 0;
  let portfolio_document = req.body.pf_document_data || '';
  let portfolio_is_dev = req.body.pf_is_dev || false;
  let portfolio_image_list = req.body.portfolio_image_list || []

  let errorMsg = null;

  if (portfolio_title === '') {
    errorMsg = '제목은 반드시 입력해야 합니다.';
  }
  else if(portfolio_designer === '') {
    errorMsg = '디자이너는 반드시 선택해야 합니다.';
  }
  else if(portfolio_address === '') {
    errorMsg = '주소는 반드시 입력해야 합니다.';
  }
  else if(portfolio_style === '') {
    errorMsg = '스타일은 반드시 입력해야 합니다.';
  }
  else if(portfolio_size === '') {
    errorMsg = '평수는 반드시 입력해야 합니다.';
  }
  else if(portfolio_price === '') {
    errorMsg = '비용은 반드시 입력해야 합니다.';
  }
  else if(req.body['portfolio_before_data[0]'] === '') {
    errorMsg = '적어도 1개의 BEFORE 이미지를 업로드 하셔야 합니다.';
  }
  else if(req.body['portfolio_after_data[0]'] === '') {
    errorMsg = '적어도 1개의 AFTER 이미지를 업로드 하셔야 합니다.';
  }

  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('portfolio_tbl')
        .select('*')
        .leftJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
        .where({
          pf_pk: pid
        })
        .limit(1)
        .then(response => {
          if (response.length < 1) {
            res.json(
              resHelper.getError('수정할 포트폴리오가 존재하지 않습니다.')
            );
          }
          else {
            wkid = response[0].wk_pk;
            return cur('portfolio_tbl')
              .where({
                pf_pk: pid
              })
              .update({
                pf_style: portfolio_style,
                pf_price: portfolio_price,
                pf_size: portfolio_size,
                pf_address: portfolio_address,
                pf_title: portfolio_title,
                pf_description: portfolio_description,
                pf_is_dev: portfolio_is_dev
              });
          }
        })
        .then(() => {
          return cur('work_tbl')
            .update({
              wk_dspk: portfolio_designer
            })
            .where({
              wk_pk: wkid
            });
        })
        .then(() => {
          return cur('portfolio_image_hst')
            .where({
              pi_pfpk: pid
            })
            .del()
        })
        .then(() => {
          let promises = [];
          portfolio_image_list.map((element, idx) => {
            // let target = portfolio_after.filter(target => {
            //     return target.index === element.index;
            // });
            // target = target.length > 0? target[0]:null;

            // if (target !== null) {
            promises.push(cur('portfolio_image_hst')
              .insert({
                pi_pfpk: pid,
                pi_dspk: portfolio_designer,
                pi_before: '',
                pi_after: element,
                pi_is_primary: idx === 0? 'Y':'N',
                pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
              }));
            // }
          });
          return Promise.all(promises);
        })
        .then(() => {
          if (portfolio_document !== '') {
            return cur('resource_document_hst')
              .where({
                rd_wkpk: wkid
              })
              .del();
          }
        })
        .then(() => {
          if (portfolio_document !== '') {
            let portfolio_documents = portfolio_document.split(',');
            let promises = [];
            portfolio_documents.map((element, index) => {
              promises.push(cur('resource_document_hst')
                .insert({
                  rd_wkpk: wkid,
                  rd_url: element,
                  rd_order: index,
                  rd_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                }));
            });
            return Promise.all(promises);
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
      });
  }
});


/**
 * Not Used
 */
router.post('/designer', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    cur('designer_tbl')
      .orderBy('ds_recency')
      .then(response => {
        res.json(
          resHelper.getJson({
            data: response
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

module.exports = router;