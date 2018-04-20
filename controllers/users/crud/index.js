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
    .then(user => Company.findOne({_id: user.company}).then(company => {
      company.users.push(user)
      return company.save()
    }))
    .then(() => getCleanAndPopulatedUser(req.body.user.email))
    .then(user => {
      req.body = user
      next()
    })
    .catch(err => next(err))
}

/**
 * Update the data of the user by its name.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  User.findOne({email: req.params.email})
    .then(user => {
      user.set(req.body)
      return user.save()
    })
    .then(user => {
      /* If set the company, update company's users */
      if (req.body.company) {
        Company.findOne({_id: user.company}).then(company => {
          company.users.push(user)
          company.save()
        })
      }
      return user
    })
    .then(user => getCleanAndPopulatedUser(user.email))
    .then(user => {
      req.body = user
      return next()
    })
    .catch(err => next(err))
}

function get (req, res, next) {
  getCleanAndPopulatedUser(req.params.email)
    .then(user => {
      req.body = user
      next()
    })
    .catch(err => next(err))
}

/**
 * Remove an user by its email.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function remove (req, res, next) {
  User.remove({email: req.params.email})
    .then(() => {
      req.body = {message: 'Success.'}
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while removing the company instance.')
      err.status = 500
      return next(err)
    })
}

/**
 * Clean the data sent by mongoose to not send to the client all the private information.
 * @param {String} email - Email of the user to retrieve.
 * @private
 */
function getCleanAndPopulatedUser (email) {
  return User.findOne({email}).populate('company', 'businessName industries -_id').exec()
    .then(user => {
      if (!user) {
        const err = new Error(`No user with email '${email}'.`)
        err.status = 404
        throw err
      }
      return {
        email: user.email,
        company: user.company,
        role: user.role,
        name: user.name
      }
    })
    .catch(err => {
      logger.error(err)
      if (err.status !== 404) {
        err = new Error('Internal error while retrieving the user from the DB.')
        err.status = 500
      }
      throw err
    })
}

module.exports = {
  create,
  get,
  remove,
  update
}
