const mixin = {
  methods: {
    addCommas (data) {
      return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  mounted () {
    console.log('a')
  }
}

export default mixin
