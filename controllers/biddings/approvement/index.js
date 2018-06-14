const logger = require('winston-namespace')('bidding:approvement')
const {Bidding} = require('../../../models')

const types = {economically: 'economically', technically: 'technically'}

/**
 * Given an array of the business names, approve all the users of that business in the bidding.
 * So, in simple words, if the user is in the approved company it has the flag 'approved[type] = true'.
 * If the user is not in the businessNames it is set to false.
 * @param {String} biddingId - Identifier of the bidding.
 * @param {String} type - Type of the approvement. Must be 'economically', 'technically'.
 * @param {String[]} businessNames - Array with strings of businessNames.
 * @param {String} [itemName] - Name of the item for which the provider is approved.
 * @returns {Promise<void>}
 */
async function approve (biddingId, type, businessNames, itemName) {
  if (type !== types.economically && type !== types.technically) {
    const err = new Error(`Incorrect type: ${type}. Must be 'economically' or 'technically'.`)
    err.status = 400
    throw err
  }
  if (!businessNames || !businessNames.length) {
    const err = new Error('The body of the request must have an array of strings with the business names of the approved companies.')
    err.status = 400
    throw err
  }
  Bidding.findOne({_id: biddingId})
    .populate({path: 'users.user', populate: {path: 'company'}}) // Populate users and the users' companies
    .then(bidding => {
      if (!bidding) {
        const err = new Error(`No bidding with id :${biddingId}`)
        err.status = 404
        throw err
      }
      for (let participant of bidding.users) {
        let participantBusinessName = participant.user.company.businessName
        // If the participant's business name is in the array of the request
        if (businessNames.indexOf(participantBusinessName) !== -1) {
          // Approve technically: set flag to true
          if (type === types.technically) participant.approved.technically = true
          // Approve economically: push the item for which the participant's company was approved
          else if (type === types.economically) participant.approved.economically.push(itemName)
        } else {
          // If the participant's business name is not in the request: set flag to false
          if (type === types.technically) participant.approved.technically = false
          // If the approvement is economically and the participant's business name is not in the request we
          // must check if the participant had the itemName and remove it
          else if (type === types.economically) {
            let indexOfItemName = participant.approved.economically.indexOf(itemName)
            if (indexOfItemName !== -1) {
              participant.approved.economically.splice(indexOfItemName, 1)
            }
          }
        }
      }
      bidding.save()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while retrieving the bidding from DB.')
      err.status = 500
      throw err
    })
}

module.exports = {
  economically: (req, res, next) => approve(req.params.id, types.economically, req.body.businessNames, req.body.itemName).then(next).catch(next),
  technically: (req, res, next) => approve(req.params.id, types.technically, req.body).then(next).catch(next)
}
