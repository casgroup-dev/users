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
  // Get user email from token
  const email = token.getData(req.params.token).email

  User.find({email: email})
    .then(user => {
      if (!user) {
        const err = new Error(`Unexpected: User with email '${email}' not found`)
        err.status = 404
      }
      Bidding.find({_id: req.params.id, 'users.user': user._id})
        .then(bidding => {
          if (!bidding) {
            const err = new Error('No such bidding')
            err.status = 404
            next(err)
          }
          const participantIndex = bidding.users.filter((biddingParticipant, index) => {
            if (biddingParticipant.user.equals(user._id)) { // ObjectID comparision
              return index
            }
          })[0]

          bidding.users[participantIndex].documents.economical = req.body // Notice this replaces previous file
          bidding.save()
        })
    })
}

module.exports = {
  putTechnicalOfferUrl: postTechnicalOffer
}
