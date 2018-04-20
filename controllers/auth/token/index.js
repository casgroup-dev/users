const jwt = require('jsonwebtoken')
const logger = require('winston-namespace')('auth:token')
const {Token, roles} = require('../../../models')

/**
 * Creates a JSON webtoken (https://www.npmjs.com/package/jsonwebtoken) with the data
 * relative to this user as username and role (to know his permissions) and calls the
 * next middleware.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function, useful to call the next middleware.
 */
function create (req, res, next) {
  /* Check if exists a token for the user */
  Token.findOne({email: req.body.user.email})
    .then(tokenInstance => {
      if (tokenInstance) return tokenInstance
      const token = jwt.sign({
        email: req.body.user.email,
        role: req.body.user.role,
        company: req.body.user.company
      }, process.env.JWT_SECRET)
      return new Token({token, email: req.body.user.email}).save()
    })
    .then(tokenInstance => {
      req.body = {token: tokenInstance.token}
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing token.')
      err.status = 500
      return next(err)
    })
}

/**
 * Validates the token and return 200 or 403 status code. To validate it, it must be in DB and be a valid
 * token for the current secret.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function, useful to call the next middleware.
 */
function validate (req, res, next) {
  const token = req.params.token || req.options.token
  jwt.verify(token, process.env.JWT_SECRET, err => {
    if (err) return handleError(err, res, next)
    Token.findOne({token})
      .then(() => next())
      .catch(err => handleError(err, res, next))
  })
}

/**
 * Creates a middleware that given roles, validates the token and give to the client the permissions to continue.
 * @param {Array<String>} roles
 * @returns {Function}
 */
validate.roles = roles => {
  return async (req, res, next) => {
    const tokenData = await getData(req.options.token).catch(err => handleError(err, res, next))
    if (roles.indexOf(tokenData.role) === -1) {
      const err = new Error('Not authorized.')
      err.status = 403
      return next(err)
    }
    return next()
  }
}

/**
 * Validates that the company of the token is the same that the user is requesting info for.
 * The business name of the company must comes in the path (as params of the request).
 * @returns {Function}
 */
validate.company = (req, res, next) => {
  getData(req.options.token).then(tokenData => {
    if (tokenData.role === roles.admin) return next()
    if (tokenData.company.businessName !== req.params.businessName) {
      return handleError(new Error('Requesting a company that is not of the user.'), res, next)
    }
    return next()
  })
}

/**
 * Returns a promise to get the data of the token. Rejects on error.
 * @param {String} token
 * @returns {Promise<Object>}
 */
function getData (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

/**
 * Handle a validation error.
 * @param {Object} err
 * @param {Object} res
 * @param {Function} next
 */
function handleError (err, res, next) {
  logger.error(err)
  err = new Error('Not a valid token.')
  err.status = 403
  res.status(403)
  next(err)
}

module.exports = {
  create,
  validate
}
