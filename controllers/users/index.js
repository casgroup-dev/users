const logger = require('winston-namespace')('users')

/* You can move each controller to its own file if you prefer */

const input = {
  validate: {
    /**
     * Validate the JSON body and pass the request to the next middleware or provide
     * a readable message that explains the error and pass the error to the error middleware.
     * @param {Object} req - Request object.
     * @param {Object} res - Response object.
     * @param {Function} next - Next function, useful to call the next middleware.
     */
    creation: (req, res, next) => {
      let err
      // TODO: Create conditions for the body and errors. Example:
      if (!req.body.username) err = new Error('To create an user you need to provide a username.')
      if (err) {
        err.status = 400
        logger.error(err)
        next(err)
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

const users = {
  create: (req, res, next) => {
    // TODO
  },
  edit: (req, res, next) => {
    // TODO
  },
  get: (req, res, next) => {
    // TODO
  },
  delete: (req, res, next) => {
    // TODO
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
    res.send(req.body)
  }
}

module.exports = {
  input,
  users,
  result
}
