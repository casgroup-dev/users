const logger = require('winston-namespace')('bidding:crud')
const {Bidding, User, roles} = require('../../../models')

/**
 * Creates a bidding given the data of the body.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function create (req, res, next) {
  req.body.bidding.save()
    .then(bidding => {
      req.body = {
        name: bidding.name,
        bidderCompany: bidding.bidderCompany,
        users: validateBiddingUsers(bidding.users)
      }
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing the new bidding instance.')
      err.status = 500
      return next(err)
    })
}

/**
 * Given a bidderCompany of in the params, returns all bidding of that bidderCompany.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function get (req, res, next) {
  Bidding.find({bidderCompany: req.params.bidderCompany})
    .then(biddings => {
      if (!biddings) {
        const err = new Error(`There is no biddings associated to '${req.params.businessName}'.`)
        err.status = 400
        return next(err)
      }
      req.body = biddings
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the biddings list.')
      err.status = 500
      return next(err)
    })
}

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  if (req.bidderCompany) {
    const err = new Error('Company can not be changed in midbidding.')
    err.status = 400
    return next(err)
  }
  Bidding.findOne({name: req.params.name})
    .then(bidding => {
      bidding.set(req.body)
      bidding.save()
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error(`Could not update bidding.`)
      err.status = 500
      return next(err)
    })
}

/**
 * Removes a bidding by its name.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function remove (req, res, next) {
  Bidding.remove({name: req.params.name})
    .then(() => {
      req.body = {message: 'Success.'}
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while removing the bidding instance.')
      err.status = 500
      return next(err)
    })
}

function validateBiddingUsers (users) {
  // Reference: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
  users.map(function (currentUser, index, users) {
    User.findOne({'email': currentUser.id}) // Receives email from front
      .then(user => {
        if (!user) {
          const err = new Error(`No user with email '${currentUser.id}'.`)
          err.status = 404
          throw err
        } else {
          if (!(currentUser.role in roles.bidding)) {
            const err = new Error(`Invalid role '${currentUser.role}'.`)
            err.status = 400 // Bad request
            throw err
          }
          users[index].id = user.id
          // TODO: Falta la creación de usuario
        }
      })
  })
    .then(() => {
      return users
    })
}

module.exports = {
  create,
  get,
  update,
  remove
}
