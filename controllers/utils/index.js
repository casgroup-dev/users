const jwt = require('jsonwebtoken')
const auth = require('../auth')

const format = {
  /**
   * Format and the set default options.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  options: (req, res, next) => {
    req.options = req.query
    req.options.q = req.options.q || null
    req.options.page = req.options.page || 1
    req.options.token = req.options.token || null
    return next()
  }
}

const validateToken = {
  /**
   * Given a role, validates the token and give to the client the permissions to continue.
   * @param {Array<String>} roles
   * @returns {Array<Function>}
   */
  createMiddleware: roles => {
    return [
      auth.users.token.validate,
      (req, res, next) => {
        const tokenData = jwt.verify(req.options.token, process.env.JWT_SECRET)
        if (roles.indexOf(tokenData.role) === -1) {
          const err = new Error('Not authorized.')
          err.status = 403
          return next(err)
        }
        return next()
      }
    ]
  }
}

module.exports = {
  format,
  validateToken
}
