const jwt = require('jsonwebtoken')
const config = require('./config')

const Helper = {
  sign (data) {
    const p = new Promise((resolve, reject) => {
      jwt.sign(data, config.key, {
        expiresIn: config.expiresIn,
        issuer: config.issuer,
        subject: config.subject,
      }, (err, token) => {
        if (err) {
          reject(err)
        }
        resolve(token)
      })
    })

    return p
  },

  verify (token) {
    const p = new Promise((resolve, reject) => {
      jwt.verify(token, config.key, (err, plain) => {
        if (err) {
          reject(err)
        }
        resolve(plain)
      })
    })

    return p
  }
}

module.exports = Helper