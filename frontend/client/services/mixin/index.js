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
    }
  },
  mounted () {}
}

export default mixin
