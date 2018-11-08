export default {
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
        list: 'constructionProcessList',
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
        list: 'constructionProcessDetailList',
        id: 'cpd_pk',
        name: 'cpd_name',
        order: 'cpd_order'
      },
      isDetailEdit: true
    },
    {
      'label': '공사 위치',
      'id': 'constructionPlace',
      'api': '/api/construction/place',
      'parentId': null,
      'keyList': {
        list: 'constructionPlaceList',
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
      'api': '/api/resource/category',
      'keyList': {
        list: 'resourceCategoryList',
        id: 'rc_pk',
        name: 'rc_name',
        order: 'rc_order'
      },
      isDetailEdit: false
    },
    {
      'label': '자재군',
      'id': 'resourceType',
      'parentId': 'resourceCategory',
      'api': '/api/resource/type',
      'keyList': {
        list: 'resourceTypeList',
        id: 'rt_pk',
        name: 'rt_name',
        order: 'rt_order'
      },
      isDetailEdit: true
    },
    {
      'label': '자재단위',
      'id': 'resourceUnit',
      'parentId': 'resourceCategory',
      'api': '/api/resource/unit',
      'keyList': {
        list: 'resourceUnitList',
        id: 'ru_pk',
        name: 'ru_name',
        expression: 'ru_calc_expression',
        order: 'ru_order'
      },
      isDetailEdit: true
    },
    {
      'label': '자재',
      'id': 'resource',
      'parentId': 'resourceType',
      'api': '/api/resource',
      'keyList': {
        list: 'resourceList',
        id: 'rs_pk',
        name: 'rs_name',
        order: 'rs_order',
        code: 'rs_code'
      },
      isDetailEdit: true
    }
  ]
}
