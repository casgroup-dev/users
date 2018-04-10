const bcrypt = require('bcrypt')
const logger = require('winston-namespace')('users')
const {Company, User} = require('../../models')

const saltRounds = 10

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
        bcrypt.hash(req.body.password, saltRounds)
          .then(hash => {
            req.body.password = hash
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

const users = {
  /**
   * Saves the user in the mongodb.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  create: (req, res, next) => {
    req.body.user.save()
      .then(user => Company.findOne({_id: user.company}).then(company => company.users.push(user)))
      .then(() => User.findOne({email: req.body.user.email}).populate('company', 'name industry').exec())
      .then(user => {
        /* Clean data to send */
        req.body = {
          email: user.email,
          company: {
            name: user.company.name,
            industry: user.company.industry
          },
          role: user.role,
          name: user.name
        }
        next()
      })
      .catch(err => {
        logger.error(err)
        err.status = 500
        err.message = 'Internal error while storing the new user instance.'
        next(err)
      })
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
    res.json(req.body)
  }
}

module.exports = {
  input,
  users,
  result
}
