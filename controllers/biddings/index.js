const bidding = require('./crud')
const {Bidding} = require('../../models')
const logger = require('winston-namespace')('bidding')

const input = {
  validate: {
    /**
     * Validates and create (without saving) a company.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    creation: (req, res, next) => {
      const bidding = new Bidding(req.body)
      bidding.validate()
        .then(() => {
          req.body = {bidding: bidding}
          return next()
        })
        .catch(err => {
          err.status = 400
          logger.error(err)
          return next(err)
        })
    }
  }
}

module.exports = {
  input,
  bidding
}
