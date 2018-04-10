const {Company, User} = require('../../../models/index')
const logger = require('winston-namespace')('users:crud')

/**
 * Saves the user in the mongodb.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function create (req, res, next) {
  req.body.user.save()
    .then(user => Company.findOne({_id: user.company}).then(company => company.users.push(user)))
    .then(() => getCleanAndPopulatedUser(req.body.user.email))
    .then(user => {
      req.body = user
      next()
    })
    .catch(err => {
      logger.error(err)
      next(err)
    })
}

function update (req, res, next) {
  // TODO
}

function get (req, res, next) {
  getCleanAndPopulatedUser(req.params.email)
    .then(user => {
      req.body = user
      next()
    })
    .catch(err => {
      logger.error(err)
      return next(err)
    })
}

function remove (req, res, next) {
  // TODO
}

/**
 * Clean the data sent by mongoose to not send to the client all the private information.
 * @param {String} email - Email of the user to retrieve.
 * @private
 */
function getCleanAndPopulatedUser (email) {
  return User.findOne({email}).populate('company', 'name industry').exec()
    .then(user => {
      if (!user) {
        const err = new Error(`No user with email '${email}'.`)
        err.status = 400
        throw err
      }
      return {
        email: user.email,
        company: {
          name: user.company.name,
          industry: user.company.industry
        },
        role: user.role,
        name: user.name
      }
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the user from the DB.')
      err.status = 500
      throw err
    })
}

module.exports = {
  create,
  get,
  remove,
  update
}
