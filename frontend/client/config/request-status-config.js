export default {
  statusList: [{
    label: '신규신청'
  }, {
    label: '통화완료'
  }, {
    label: '1차통화부재중'
  }, {
    label: '2차통화부재중'
  }, {
    label: '상담실패',
    children: [{
      label: '잘못된번호'
    }, {
      label: '거리문제'
    }, {
      label: '실수'
    }, {
      label: '부분인테리어'
    }, {
      label: '3차통화부재중'
    }]
  }, {
    label: '상담예약완료'
  }, {
    label: '1차제안서완료'
  }, {
    label: '1차제안서수정'
  }, {
    label: '1차제안부재중'
  }, {
    label: '2차제안부재중'
  }, {
    label: '계약실패',
    children: [{
      label: '견적초과'
    }, {
      label: '고객변심'
    }, {
      label: '3차제안부재중'
    }]
  }, {
    label: '계약완료'
  }],
  siteTypeList: [{
    label: '주거'
  }, {
    label: '상업'
  }]
}
