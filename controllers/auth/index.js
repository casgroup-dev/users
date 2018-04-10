const logger = require('winston-namespace')('auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {result} = require('../users')
const {User, Token} = require('../../models')

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
      new Token({token}).save()
        .then(() => {
          req.body = {token}
          return next()
        })
        .catch(err => {
          logger.error(err)
          err = new Error('Internal error while storing token.')
          err.status = 500
          return next(err)
        })
    },
    /**
     * Validates the token and return 200 or 403 status code. To validate it, it must be in DB and be a valid
     * token for the current secret.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    validate: (req, res, next) => {
      const catchError = err => {
        logger.error(err)
        err = new Error('Not a valid token.')
        err.status = 403
        res.status(403)
        return next(err)
      }
      const token = req.params.token
      jwt.verify(token, process.env.JWT_SECRET, err => {
        if (err) return catchError(err)
        Token.findOne({token})
          .then(() => {
            req.body = {message: 'Valid token.'}
            return next()
          })
          .catch(err => catchError(err))
      })
    }
  }
}

module.exports = {
  input,
  users,
  result
}
