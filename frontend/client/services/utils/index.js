import _ from 'underscore'

export default {
  getQueryString: (data) => {
    let queryString = []
    _.each(data, function (value, props) {
      queryString.push(`${props}=${value}`)
    })

    return queryString.join('&')
  }
}
