const logger = require('winston-namespace')('bidding:approvement')
const {Bidding} = require('../../../models')

/**
 * Finds a bidding by its id.
 * @param {Object} req - Request object.
 * @returns {Promise<Bidding>}
 */
function findBidding (req) {
  let biddingId = req.params.id
  return Bidding.findOne({_id: biddingId})
    .populate({path: 'users.user', populate: {path: 'company'}}) // Populate users and the users' companies
    .then(bidding => {
      if (!bidding) {
        const err = new Error(`No bidding with id :${biddingId}`)
        err.status = 404
        throw err
      }
      return bidding
    })
}

/**
 * Approve technically (set approve.technically flag to true) for each one of the user that has its company's
 * business name in the array coming in the request's body. If the participant's company is not in the array set
 * flag to false.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Callback function to pass to the next middleware.
 */
function approveTechnically (req, res, next) {
  // Check if there is the array with business names (possibly empty)
  let businessNames = req.body
  if (!businessNames) {
    const err = new Error('There are no businessNames in the request.')
    err.status = 400
    throw err
  }
  // Find bidding and process approvement
  findBidding(req).then(bidding => {
    bidding.users.forEach(participant => {
      // If the participant's business name is in the array of the request set flag to true, otherwise, se to false
      participant.approved.technically = businessNames.indexOf(participant.user.company.businessName) !== -1
    })
    // Save changes
    bidding.save()
    req.body = {} // Set to empty json to not send anything to the front
    next()
  }).catch(err => {
    logger.error(err)
    err = new Error('Error while retrieving the bidding from DB.')
    err.status = 500
    next(err)
  })
}

/**
 * Receive an object as:
 * {itemName: String, adjudications: [{comment: String, provider: String}, ...]}
 * The provider string is the businessName of the company approved.
 * If there is the case that the user has an item for which was approved but in this request it does not appear,
 * this middleware will delete the old adjudicated item.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Callback function to pass to the next middleware.
 */
function approveEconomically (req, res, next) {
  const throwError = (msg, status) => {
    const err = new Error(msg)
    err.status = status || 400
    next(err)
  }
  let itemName = req.body.itemName
  let adjudications = req.body.adjudications
  if (!itemName) return throwError(`There is no 'itemName' property in the request.`)
  if (!adjudications) return throwError(`There is no 'adjudications' property in the request.`)
  findBidding(req).then(bidding => {
    bidding.users.forEach(participant => {
      let adjudicatedItems = participant.approved.economically
      // Check if the participant has already adjudicated this item
      let indexOfItem = adjudicatedItems.findIndex(itemWithComment => itemWithComment.itemName === itemName)
      // Check if the user's company is in the incoming request's providers
      let adjudication = adjudications.find(adjudication => adjudication.provider === participant.user.company.businessName)
      if (adjudication) {
        if (indexOfItem !== -1) {
          // If the user already has adjudicated the item change the comment
          adjudicatedItems[indexOfItem].comment = adjudication.comment
        } else {
          // If not, push the new item
          adjudicatedItems.push({itemName, comment: adjudication.comment})
        }
      } else if (indexOfItem !== -1) {
        // If there is no adjudication for this user and there is an old adjudicated item, remove it
        adjudicatedItems.splice(indexOfItem, 1)
      }
      // If the user does not adjudicated anything and it does not have the item adjudicated in an old request, do nothing
    })
    bidding.save()
    req.body = {} // Set empty json to not send anything to the front
    next()
  }).catch(err => {
    logger.error(err)
    throwError(`Internal error while retrieving the bidding from the DB.`, 500)
  })
}

module.exports = {
  economically: approveEconomically,
  technically: approveTechnically
}
