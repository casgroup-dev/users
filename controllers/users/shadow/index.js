const {ShadowUser, roles} = require('../../../models')
const logger = require('winston-namespace')('users:shadow')

function validateInput (req, res, next) {
  const shadowUser = new ShadowUser(req.body)
  shadowUser.validate().then(() => {
    req.body = {shadowUser}
    return next()
  }).catch(err => {
    logger.error(err)
    err.status = 400
    return next(err)
  })
}

function create (req, res, next) {
  req.body.shadowUser.save().then(shadowUser => {
    req.body = {
      email: shadowUser.email,
      businessName: shadowUser.businessName,
      phone: shadowUser.phone,
      name: shadowUser.name
    }
    return next()
  }).catch(err => {
    logger.error(err)
    err = new Error('Internal server error while creating the shadow user.')
    err.status = 500
    return next(err)
  })
}

/**
 * Get the shadow user by an email in the params (path) and set the body to his email and the shadowUser role.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function get (req, res, next) {
  ShadowUser.findOne({email: req.params.email})
    .then(shadowUser => {
      if (shadowUser) {
        /* Set to user to use the token.create middleware that uses this property of the body to create the token, see routes/shadow */
        req.body.user = {email: shadowUser.email, role: roles.shadowUser}
        return next()
      }
      const err = new Error(`There is no shadow user with email ${req.params.email}`)
      err.status = 404
      logger.warn(err)
      return next(err)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal server error while getting the shadow user.')
      err.status = 500
      logger.warn(err)
      return next(err)
    })
}

module.exports = {
  create,
  get,
  input: {validate: validateInput}
}
