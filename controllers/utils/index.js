const logger = require('winston-namespace')('utils')
const {token} = require('../auth')
const {User} = require('../../models')

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

const result = {
  /**
   * The middleware change the request's body, transforming it until it has the json that we
   * need to send to the client.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   * @param {Function} next - Next function, useful to call the next middleware.
   */
  send: (req, res, next) => {
    if (!req.body) {
      const err = new Error('There is no body to send to the client.')
      err.status = 500
      logger.error(err)
      // Not send this message to the client, set to null and the error middleware will put default message.
      err.message = null
      return next(err)
    }
    res.json(req.body)
  }
}

function indexOfObject (array, field, value) {
  for (let idx in array) {
    if (value instanceof Object) {
      if (array[idx][field].equals(value)) {
        return idx
      }
    }
    else {
      if (array[idx][field] === value) {
        return idx
      }
    }
  }
  return -1
}

module.exports = {
  format,
  result,
  indexOfObject
}
