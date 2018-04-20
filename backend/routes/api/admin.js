const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const FormatService = require('../../services/format/helper');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
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

router.get('/*', (req, res) => {
    if (req.user === null || req.user.user_permit !== 'A') {
        res.json(
            resHelper.getError('이 기능을 사용하기 위해서는 관리자 권한이 필요합니다.')
        );
    }
    else {
        next();
    }
});

router.post('/portfolio', (req, res) => {
    const page = req.body['page'];
    const filter = req.body['filter'];
    const pageInst = new paginationService(page);
    const filterInst = new filterService(filter);
    const pageData = pageInst.get();

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

router.post('/portfolio/designer', (req, res) => {
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

router.post('/portfolio/delete/:pid', (req, res) => {
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

router.post('/portfolio/save/:pid*?', (req, res) => {
    let pid = req.params.pid;
    let wkid = null;

    let portfolio_title = req.body.portfolio_title || '';
    let portfolio_designer = req.body.portfolio_designer || '';
    let portfolio_description = req.body.portfolio_description || '';
    let portfolio_address = req.body.portfolio_address || '';
    let portfolio_style = req.body.portfolio_style || '';
    let portfolio_size = req.body.portfolio_size || 0;
    let portfolio_price = req.body.portfolio_price || 0;
    let portfolio_document = req.body.portfolio_document_data || '';
    let portfolio_is_dev = req.body.portfolio_is_dev || false;

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
            let portfolio_before = [];
            let portfolio_after = [];
            const regex = /portfolio_(before|after)_data\[(\d*)\]/;

            for (let idx in req.body) {
                const value = req.body[idx];
                const match = idx.match(regex);
                if (match !== null && match.length > 0) {
                    if (match[1] === 'before') {
                        portfolio_before.push({
                            index: parseInt(match[2]),
                            value: value
                        });
                    }
                    else if(match[1] === 'after') {
                        portfolio_after.push({
                            index: parseInt(match[2]),
                            value: value
                        });
                    }
                }
            }

            portfolio_before.sort(function (a, b) {
                return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
            });

            portfolio_after.sort(function (a, b) {
                return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
            });

            if (pid) {
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
                    .then(responses => {
                        return cur('work_tbl')
                            .update({
                                wk_dspk: portfolio_designer
                            })
                            .where({
                                wk_pk: wkid
                            });
                    })
                    .then(response => {
                        return cur('portfolio_image_hst')
                            .where({
                                pi_pfpk: pid
                            })
                            .del()
                    })
                    .then(response => {
                        let promises = [];
                        portfolio_before.map((element, idx) => {
                            let target = portfolio_after.filter(target => {
                                return target.index === element.index;
                            });
                            target = target.length > 0? target[0]:null;

                            if (target !== null) {
                                promises.push(cur('portfolio_image_hst')
                                    .insert({
                                        pi_pfpk: pid,
                                        pi_dspk: portfolio_designer,
                                        pi_before: element.value,
                                        pi_after: target.value,
                                        pi_is_primary: element.index === 0? 'Y':'N',
                                        pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            }
                        });
                        return Promise.all(promises);
                    })
                    .then(response => {
                        if (portfolio_document !== '') {
                            return cur('resource_document_hst')
                                .where({
                                    rd_wkpk: wkid
                                })
                                .del();
                        }
                    })
                    .then(response => {
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
            }
            else {
                cur('work_tbl')
                    .returning('wk_pk')
                    .insert({
                        wk_user: req.user.user_pk,
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

                        portfolio_before.map((element, idx) => {
                            let target = portfolio_after.filter(target => {
                                return target.index === element.index;
                            });
                            target = target.length > 0? target[0]:null;

                            if (target !== null) {
                                promises.push(cur('portfolio_image_hst')
                                    .insert({
                                        pi_pfpk: pid,
                                        pi_dspk: portfolio_designer,
                                        pi_before: element.value,
                                        pi_after: target.value,
                                        pi_is_primary: element.index === 0? 'Y':'N',
                                        pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            }
                        });

                        return Promise.all(promises);
                    })
                    .then(responses => {
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
                    .then(responses => {
                        res.json(
                            resHelper.getJson({
                                value: pid
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

router.post('/portfolio/:pid', (req, res) => {
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

router.post('/company', (req, res) => {
    knexBuilder.getConnection().then(cur => {
        cur('company_tbl')
            .orderBy('cp_recency')
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

router.post('/company/save/:cpid*?', (req, res) => {
    let cpid = req.params.cpid;

    let company_type = req.body.company_type || '';
    let company_name = req.body.company_name || '';

    let errorMsg = null;

    if (company_type === '') {
        errorMsg = '회사 타입은 반드시 선택해야 합니다.';
    }
    else if(company_name === '') {
        errorMsg = '회사 이름은 반드시 입력해야 합니다.';
    }
    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
        knexBuilder.getConnection().then(cur => {
            if (cpid) {
                cur('company_tbl')
                    .select('*')
                    .where({
                        cp_pk: cpid
                    })
                    .limit(1)
                    .then(response => {
                        if (response.length < 1) {
                            res.json(
                                resHelper.getError('수정할 회사가 존재하지 않습니다.')
                            );
                        }
                        else {
                            cpid = response[0].cp_pk;
                            return cur('company_tbl')
                                .where({
                                    cp_pk: cpid
                                })
                                .update({
                                    cp_type: company_type,
                                    cp_name: company_name
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
                cur('company_tbl')
                    .returning('cp_pk')
                    .insert({
                        cp_type: company_type,
                        cp_type: company_name,
                        cp_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                    })
                    .then(responses => {
                        cpid = responses[0];
                        res.json(
                            resHelper.getJson({
                                value: cpid
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

router.post('/profile/designer', (req, res) => {
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
            .catch(reason => {
                res.json(
                    resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
                )
            });
    });
});

router.post('/style', (req, res) => {
    knexBuilder.getConnection().then(cur => {
        cur('style_tbl')
            .orderBy('style_recency')
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

router.post('/profile/designer/:did([0-9]+)', (req, res) => {
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
                                .then(response => {
                                    ;
                                })
                                .catch(reason => {
                                    ;
                                });
                        }
                    })
                    .catch(reason => {
                        ;
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
            .catch(reason => {
                res.json(
                    resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
                );
            });
    });
});

router.post('/profile/designer/delete/:did', (req, res) => {
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

router.post('/profile/designer/save/:did*?', (req, res) => {
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


router.post('/profile/constructor', (req, res) => {
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
            .catch(reason => {
                res.json(
                    resHelper.getError('시공자 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
                )
            });
    });
});

router.post('/profile/constructor/:cid([0-9]+)', (req, res) => {
    knexBuilder.getConnection().then(cur => {
        const ipLong = ip.toLong(req.ip);
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
            .catch(reason => {
                res.json(
                    resHelper.getError('시공자 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
                );
            });
    });
});

router.post('/profile/constructor/delete/:cid', (req, res) => {
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

router.post('/profile/constructor/save/:cid*?', (req, res) => {
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


router.post('/request/list', (req, res) => {
    let page = req.body['page'];
    let filter = req.body['filter'];
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
            .catch(() => {
                res.json(
                    resHelper.getError('상담요청 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
                )
            });
    });
});

router.post('/request/save/:rqpk([0-9]+)', (req, res) => {
    const rq_pk = req.params.rqpk;
    const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
    let errorMsg = null;
    let updateObj = {};

    const rq_is_valuable = req.body.rq_is_valuable || 0;
    const rq_is_contracted = req.body.rq_is_contracted || 0;

    if (!rq_is_valuable) {
        ['0','1','2','3'].forEach(i => {
            if(rq_is_valuable === i) errorMsg = '[rq_is_valuable] 값이 올바르지 않습니다.';
        });
    }
    if (!rq_is_contracted) {
        ['0','1','2'].forEach(i => {
            if(rq_is_contracted === i) errorMsg = '[rq_is_contracted] 값이 올바르지 않습니다.';
        });
    }

    if (rq_is_valuable && rq_is_contracted) {
        updateObj.rq_name = req.body.rq_name || '';
        updateObj.rq_family = req.body.rq_family || '';
        updateObj.rq_phone = req.body.rq_phone || '';
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
        updateObj.rq_is_valuable = rq_is_valuable;
        updateObj.rq_is_contracted = rq_is_contracted;

        if (updateObj.rq_name === '') {
            errorMsg = '이름은 반드시 입력해야 합니다.';
        }
        else if (updateObj.rq_phone === '') {
            errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
        }
        else if (regexPhone.test(updateObj .rq_phone) === false) {
            errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
        }

        updateObj.rq_phone = cryptoHelper.encrypt(updateObj.rq_phone);
    }
    else {
        if (rq_is_valuable) {
            updateObj.rq_is_valuable = rq_is_valuable;
        }
        if (rq_is_contracted) {
            updateObj.rq_is_contracted = rq_is_contracted;
        }
    }

    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
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
                    res.json(
                        resHelper.getError(reason)
                    );
                });
        });
    }
});

router.post('/request/:rqpk([0-9]+)', (req, res) => {
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
                console.log(request.rq_phone)
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