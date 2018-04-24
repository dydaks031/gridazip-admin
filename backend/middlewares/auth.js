const jwtHelper = require('../services/jwt/helper')

const authMiddleware = ((req, res, next) => {
  const token = req.token
  if (!token) {
    return res.status(403).json({
      success: false,
      message: '로그인 되지 않았습니다.'
    })
  }

  jwtHelper.verify(token)
    .then((plain) => {
      console.log(plain)
      req.plain = plain
      next()
    })
    .catch((err) => {
      console.log(err)
      next()
    })
})

module.exports = authMiddleware