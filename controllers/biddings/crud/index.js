const logger = require('winston-namespace')('bidding:crud')
const {Bidding} = require('../../../models')

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
        company: bidding.company,
        users: bidding.users
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
 * Given a company of in the params, returns all bidding of that company.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function get (req, res, next) {
  Bidding.find({company: req.params.company})
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
  if (req.company) {
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

module.exports = {
  create,
  get,
  update,
  remove
}
