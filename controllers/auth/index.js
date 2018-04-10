const logger = require('winston-namespace')('auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {result} = require('../users')
const {User} = require('../../models')

const input = {
  validate: {
    /**
     * Validates the JSON body and calls the next middleware.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    login: (req, res, next) => {
      let err
      if (!req.body.email) err = new Error('There is no \'email\' to login.')
      else if (!req.body.password) err = new Error('There is no \'password\' to login.')
      if (err) {
        err.status = 400
        logger.error(err)
        return next(err)
      }
      next()
    }
  }
}

const users = {
  /**
   * Validate the login of the user and calls the next middleware.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   * @param {Function} next - Next function, useful to call the next middleware.
   */
  login: (req, res, next) => {
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          const err = new Error(`There is no user with email '${req.body.email}'.`)
          err.status = 404
          return next(err)
        }
        req.body.user = user
        return bcrypt.compare(req.body.password, user.password)
      })
      .then(result => {
        if (!result) {
          const err = new Error('Incorrect password.')
          err.status = 403
          return next(err)
        }
        return next()
      })
  },
  token: {
    /**
     * Creates a JSON webtoken (https://www.npmjs.com/package/jsonwebtoken) with the data
     * relative to this user as username and role (to know his permissions) and calls the
     * next middleware.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    create: (req, res, next) => {
      const token = jwt.sign({
        email: req.body.user.email,
        role: req.body.user.role,
        company: req.body.user.company
      }, process.env.JWT_SECRET)
      req.body = {token}
      return next()
    },
    /**
     * Validates the json and set the data in the body of the request.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    validate: (req, res, next) => {
      // TODO
    }
  }
}

module.exports = {
  input,
  users,
  result
}
