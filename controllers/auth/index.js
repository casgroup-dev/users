const logger = require('winston-namespace')('auth')
const jwt = require('jsonwebtoken')
const {result} = require('../users')

const input = {
  validate: {
    /**
     * Validates the JSON body and calls the next middleware.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    login: (req, res, next) => {
      // TODO
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
    // TODO
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
      // TODO
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
