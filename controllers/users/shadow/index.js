const {ShadowUser} = require('../../../models')
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
    req.body = clean(shadowUser)
    return next()
  }).catch(err => {
    logger.error(err)
    err = new Error('Internal server error while creating the shadow user.')
    err.status = 500
    return next(err)
  })
}

function get (req, res, next) {
  ShadowUser.findOne({email: req.params.email})
    .then(shadowUser => {
      if (shadowUser) {
        req.body = clean(shadowUser)
        return next()
      }
      const err = new Error(`There is no user with email ${req.params.email}`)
      err.status = 404
      return next(err)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal server error while getting the shadow user.')
      err.status = 500
      return next(err)
    })
}

function clean (shadowUser) {
  return {
    email: shadowUser.email,
    businessName: shadowUser.businessName,
    phone: shadowUser.phone,
    name: shadowUser.name
  }
}

module.exports = {
  create,
  get,
  input: {validate: validateInput}
}
