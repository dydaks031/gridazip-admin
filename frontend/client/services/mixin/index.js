const mixin = {
  methods: {
    addCommas (data) {
      if (!data) {
        return 0
      }
      return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  mounted () {
    console.log('a')
  }
}

export default mixin
