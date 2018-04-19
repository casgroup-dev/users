const bcrypt = require('bcrypt')
const users = require('./crud')
const logger = require('winston-namespace')('users')
const {User} = require('../../models')

const saltRounds = 10
const hashPassword = password => bcrypt.hashSync(password, saltRounds)

const input = {
  validate: {
    /**
     * Validate the JSON body and pass the user instance validated in the body. Also provides
     * a readable message that explains the error and pass the error to the error middleware.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    creation: (req, res, next) => {
      if (!req.body.password) {
        const err = new Error('No password provided.')
        err.status = 400
        return next(err)
      } else {
        req.body.password = hashPassword(req.body.password)
        const user = new User(req.body)
        user.validate()
          .then(() => {
            req.body = {user}
            next()
          })
          .catch(err => {
            err.status = 400
            logger.error(err)
            return next(err)
          })
      }
    },
    /**
     * Validate the JSON body for edition and creates readable messages if there are errors.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    edition: (req, res, next) => {
      // TODO
      next()
    }
  }
}

module.exports = {
  input,
  users,
  hashPassword
}
