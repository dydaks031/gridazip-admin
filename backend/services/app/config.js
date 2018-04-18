const Config = {
  sess_key: 'gridazip',
  sess_secure: 'gridazip@sess@key!',
  site: {
    name: '그리다집',
    title: '그리다집',
    description: '고객 맞춤 인테리어 자동화 서비스저렴한 비용으로 최적의 인테리어를 설계합니다.',
    keywords: '인테리어,시공,모던,화이트,우드,도배,장판,페인트,마루,데코타일,그리다집'
  },
  domain: {
    development: 'localhost:3001',
    stage: '',
    production: 'www.gridazip.com'
  },
  auth: {
    facebook: {
      development: {
        key: '754367624730360',
        secret: '834d76d4faebc1b16b48ccd322260dbc'
      },
      stage: {
        key: '754467754720347',
        secret: '04ae8d60d3f5dc59e571b1a0845a8c10'
      },
      production: {
        key: '754367064730416',
        secret: '57fadc4d2aff13efa33e7559fde8c99e'
      }
    },
    naver: {
      development: {
        key: 'KUX41ADQTXtY88mty7z8',
        secret: 'OMtIHy78G6'
      },
      stage: {
        key: '5cy8bIpiTDLT02dYxWEc',
        secret: 'QWZvVEEwf7'
      },
      production: {
        key: 'BAqw3nxjNu4lB3pmiJUH',
        secret: 'UOcHmlJJAN'
      }
    }
  },
  mail: {
      leader: 'leader@gridazip.com',
      info: 'info@gridazip.com',
      dev: 'dev@gridazip.com',
  }
};

module.exports = Config;
