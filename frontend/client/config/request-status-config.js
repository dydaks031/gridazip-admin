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
    }, {
      label: '기타'
    }]
  }, {
    label: '상담예약완료'
  }, {
    label: '상담완료'
  }],
  siteTypeList: [{
    label: '주거'
  }, {
    label: '상업'
  }],
  contractStatusList: {
    '-1': '계약 실패',
    '0': '가견적 작성 필요',
    '1': '가견적 작성중',
    '2': '가견적서 제출',
    '3': '계약 완료',
    '4': '공사 중',
    '5': '공사 종료',
    '9': '공사 마감'
  },
  contractFailReasonList: [{
    label: '견적 비용 초과'
  }, {
    label: '고객 단순 변심'
  }, {
    label: '고객 일정 변경'
  }, {
    label: '타 업체와 계약'
  }, {
    label: '연락 두절'
  }, {
    label: '기타',
    textarea: true
  }]
}
