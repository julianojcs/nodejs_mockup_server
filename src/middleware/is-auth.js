import jwt from 'jsonwebtoken'

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization') // The header: Authorization: Bearer e34gb98ufD#$F2fsd34ef
  if (!authHeader) {
    req.isAuth = false
    return next()
  }

  const token = authHeader.split(' ')[1] // Bearer e34gb98ufD#$F2fsd34ef
  if (!token || token === '') {
    req.isAuth = false
    return next()
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY)
  } catch (err) {
    req.isAuth = false
    return next()
  }
  if (!decodedToken) {
    req.isAuth = false
    return next()
  }
  req.isAuth = true
  req.userId = decodedToken.userId
  req.companyId = decodedToken.companyId
  next()
}
