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
      bidding.users = validateBiddingUsers(bidding.users)   
      req.body = bidding
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing the new bidding instance.')
      err.status = 500
      return next(err)
    })
}

const get = {

  /**
   * Given a provider in params, returns all biddings of that provider.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  all: (req, res, next) => {
    Bidding.findAll()
      .then(biddings => {
        if (!biddings) {
          const err = new Error(`There are no biddings yet`)
          err.status = 404
          return next(err)
        }
        req.body = biddings // TODO: getPopulated
        return next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the biddings list.')
        err.status = 500
        return next(err)
      })
  },

  /**
   * Given a bidding name in params, return all bidding info according user role requesting it.
   * @param req
   * @param res
   * @param next
   */
  byId: (req, res, next) => {
    Bidding.findOne({'id': req.params.id})
      .then(biddind => {
        if (!biddind) {
          const err = new Error('No bidding found')
          err.status = 404
          return next(err)
        }
        req.body = biddind // TODO: getPopulated
        return next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        return next(err)
      })
    return next()
  }
}

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  // TODO: Falta validar nueva data http://mongoosejs.com/docs/api.html#findoneandupdate_findOneAndUpdate
  Bidding.findOneAndUpdate(
    {id: req.params.id},
    req.body,
    function (err, doc) {
      if (err) {
        const err = new Error("Can't update. No such bidding")
        err.status = 500
        return next(err)
      }
      return next(doc)
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

/**
 */
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
