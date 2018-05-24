const logger = require('winston-namespace')('bidding:crud')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

/**
 * Creates a bidding given the data of the body.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function create (req, res, next) {
  req.body.bidding.save()
    .then(bidding => {
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
    Bidding.find()
      .then(biddings => {
        if (!biddings) {
          const err = new Error(`There are no biddings yet`)
          err.status = 404
          return next(err)
        }
        const tokenData = token.getData(req.options.token)
        const filterData = (bidding) => filterDataByRole(bidding, tokenData.role, tokenData.email)
        biddings.map(filterData)
        biddings.map(getCleanAndPopulatedBidding)
        req.body = biddings
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
    Bidding.findOne({_id: req.params.id})
      .then(bidding => {
        if (!bidding) {
          const err = new Error('No bidding found')
          err.status = 404
          return next(err)
        }
        const tokenData = token.getData(req.options.token)
        filterDataByRole(bidding, tokenData.role, tokenData.email)
        getCleanAndPopulatedBidding(bidding)
        req.body = bidding
        return next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        return next(err)
      })
  }
}

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  Bidding.findOne({_id: req.params.id})
    .then(bidding => {
      if (!bidding) {
        const err = new Error("Can't update. No such bidding")
        err.status = 404
        return next(err)
      }
      bidding.set(req.body)
      getCleanAndPopulatedBidding(bidding)
      req.body = bidding
      next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the bidding data.')
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
  Bidding.remove({_id: req.params.id})
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

function getCleanAndPopulatedBidding (bidding) {
  Promise.all(bidding.users.map(async (current, index, users) => {
    await User.findOne({_id: current.id})
      .then(user => {
        users[index] = {
          role: current.role,
          email: user.email
        }
      })
  }))
    .then(() => {
      // logger.info(bidding)
      return bidding
    })
}

/**
 * Filter data by user role. IMPORTANT: This modifies the bidding object
 * if role is admin receives all data
 * if role is user or companyAdmin receives all data except data from other users in users array.
 * if users is not in users array receives anything
 * if role is shadowUser receives anything
 *
 * @param bidding
 * @param role
 * @param email
 */
async function filterDataByRole (bidding, role, email) {
  if (role === roles.platform.user || role === roles.platform.companyAdmin) {
    await User.findOne({email: email})
      .then(user => {
        if (!user) {
          return {}
        }
        bidding.users = bidding.users.filter((current) => {
          return current.id.equals(user._id)
        })
      })
  } else if (role === roles.platform.shadowUser) {
    for (let field in bidding) delete bidding[field]
  }
  return bidding // role === admin sends all info without modification
}

module.exports = {
  create,
  get,
  update,
  remove
}
