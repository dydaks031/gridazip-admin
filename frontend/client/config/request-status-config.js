export default {
  statusList: [{
    text: '신규신청',
    value: 0
  }, {
    text: '재통화 필요',
    value: 1
  }, {
    text: '방문상담 예약',
    value: 2
  }, {
    text: '구두견적 제출',
    value: 3
  }, {
    text: '가견적서 작성중',
    value: 4
  }, {
    text: '가견적서 제출',
    value: 5
  }, {
    text: '상담 실패',
    value: -1
  }, {
    text: '견적 실패',
    value: -2
  }],
  contractStatusList: [{
    text: '계약완료',
    value: 6
  }, {
    text: '공사중',
    value: 7
  }, {
    text: '공사완료',
    value: 8
  }, {
    text: '공사마감',
    value: 99
  }],
  counselFailCodeList: [
    {
      text: '잘못된 번호',
      value: 100
    }, {
      text: '너무 먼 거리',
      value: 110
    }, {
      text: '부재중',
      value: 120
    }, {
      text: '피드백 없음',
      value: 130
    }, {
      text: '기타',
      value: 999
    }
  ],
  contractFailCodeList: [
    {
      text: '견적 비용 초과',
      value: 200
    }, {
      text: '고객 단순 변심',
      value: 210
    }, {
      text: '타업체와 계약',
      value: 220
    }, {
      text: '기타',
      value: 999
    }
  ],
  siteTypeList: [{
    text: '주거공간',
    value: '10'
  }, {
    text: '상업공간',
    value: '20'
  }],
  splitedContractStatusList: [
    {
      label: '채택 전',
      value: 'B',
      children: [
        {
          label: '가견적 작성 필요',
          value: '0'
        },
        {
          label: '가견적 작성중',
          value: '1'
        },
        {
          label: '가견적서 제출',
          value: '2'
        }
      ]
    },
    {
      label: '채택 후',
      value: 'A',
      children: [
        {
          label: '계약 완료',
          value: '3'
        },
        {
          label: '공사 중',
          value: '4'
        },
        {
          label: '공사 종료',
          value: '5'
        },
        {
          label: '공사 마감',
          value: '9'
        }
      ]
    },
    {
      label: '계약실패',
      value: 'F'
    }
  ],
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
