export default {

  api: {

  },
  order: {
    construction: [
      {
        'label': '공사',
        'id': 'construction',
        'parentId': null,
        'api': '/api/construction',
        'keyList': {
          list: 'constructionList',
          id: 'ct_pk',
          name: 'ct_name',
          order: 'ct_order'
        },
        isDetailEdit: false
      },
      {
        'label': '공정',
        'id': 'constructionProcess',
        'parentId': 'construction',
        'api': '/api/construction/process',
        'keyList': {
          list: 'processList',
          id: 'cp_pk',
          name: 'cp_name',
          order: 'cp_order'
        },
        isDetailEdit: false
      },
      {
        'label': '상세공정',
        'id': 'constructionProcessDetail',
        'parentId': 'constructionProcess',
        'api': '/api/construction/process/detail',
        'keyList': {
          list: 'processDetailList',
          id: 'cpd_pk',
          name: 'cpd_name',
          order: 'cpd_order'
        },
        isDetailEdit: true
      },
      {
        'label': '공사 위치',
        'id': 'constructionPosition',
        'api': '/api/construction/place',
        'parentId': null,
        'keyList': {
          list: 'placeList',
          id: 'cp_pk',
          name: 'cp_name',
          order: 'cp_order'
        },
        isDetailEdit: false
      }
    ],
    resource: [
      {
        'label': '자재분류',
        'id': 'resourceCategory',
        'parentId': null,
        'data': [{
          _id: 1,
          name: '목자재'
        }, {
          _id: 2,
          name: '타일자재'
        }],
        isDetailEdit: false
      },
      {
        'label': '자재군',
        'id': 'resourceType',
        'parentId': 'resourceCategory',
        'data': [{
          _id: 1,
          name: '사각타일'
        }, {
          _id: 2,
          name: '육각타일'
        }, {
          _id: 3,
          name: '12각타일'
        }],
        isDetailEdit: true
      },
      {
        'label': '자재단위',
        'id': 'resourceUnit',
        'parentId': 'resourceCategory',
        'data': [{
          _id: 1,
          name: 'Box(1.14m^2)'
        }, {
          _id: 2,
          name: 'Box(0.9m^2)'
        }],
        isDetailEdit: true
      },
      {
        'label': '자재',
        'id': 'resource',
        'parentId': 'resourceType',
        'data': [{
          _id: 1,
          name: '핑크타일'
        }, {
          _id: 2,
          name: '블랙타일'
        }],
        isDetailEdit: true
      }
    ]
  },
  keyList: [

  ]
}
