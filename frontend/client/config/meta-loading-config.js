export default {

  api: {

  },
  order: {
    construction: [
      {
        'label': '공사',
        'id': 'construction',
        'parentId': null,
        'data': [{
          '_id': 1,
          'name': '타일'
        }, {
          '_id': 2,
          'name': '목공'
        }, {
          '_id': 3,
          'name': '전기'
        }, {
          '_id': 4,
          'name': '철거'
        }, {
          '_id': 5,
          'name': '도배'
        }]
      },
      {
        'label': '공정',
        'id': 'constructionProcess',
        'parentId': 'construction',
        'data': [{
          '_id': 1,
          'name': '벽, 본드'
        }, {
          '_id': 2,
          'name': '벽, 떠발이'
        }]
      },
      {
        'label': '상세공정',
        'id': 'constructionProcessDetail',
        'parentId': 'constructionProcess',
        'data': [{
          '_id': 1,
          'name': '가로일자'
        }, {
          '_id': 2,
          'name': '세로일자'
        }, {
          '_id': 3,
          'name': '가로지그재그'
        }]
      },
      {
        'label': '공사 위치',
        'id': 'constructionPosition',
        'parentId': null
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
        }]
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
        }]
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
        }]
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
        }]
      }
    ]
  },
  keyList: [

  ]
}
