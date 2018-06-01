const logger = require('winston-namespace')('bidding:files')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

/**
 * Post a technical offer.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function postTechnicalOffer (req, res, next) {

}


module.exports = {
  postTechnicalOffer
}
