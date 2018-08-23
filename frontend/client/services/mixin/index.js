import moment from 'moment'

const mixin = {
  methods: {
    addCommas (data) {
      if (!data) {
        return 0
      }
      return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getComputedDate (date, wantFormat) {
      const formattedDate = moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSz')
      if (formattedDate.isValid()) {
        return formattedDate.format(wantFormat || 'YYYY-MM-DD')
      } else {
        return '-'
      }
    },
    isMobile () {
      let isMobile = false
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        isMobile = true
      }
      return isMobile
    }
  },
  mounted () {}
}

export default mixin
