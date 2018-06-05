const logger = require('winston-namespace')('bidding:files')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

/**
 * Put a technical offer. Body request should have the following format:
 *
 * {name: 'filename', url: 'url.where.it/is-stored'}
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function putTechnicalOfferUrl (req, res, next) {
  // Get user email from token
  token.getData(req.params.token).then(tokenData => {
    return tokenData.email
  }).then(async email => {
    let userId = await User.findOne({email: email})
      .then(user => {
        if (!user) {
          const err = new Error(`Unexpected: User with email '${email}' not found`)
          err.status = 404
          throw err
        }
        return user._id
      })

    logger.info(`User ID '${userId}'`)

    Bidding.findOne({_id: req.params.id, 'users.user': userId})
      .then(bidding => {
        if (!bidding) {
          const err = new Error('No such bidding')
          err.status = 404
          throw err
        }
        return bidding
      })
      .then(async bidding => {
        let participant = bidding.users.find((biddingParticipant, index) => {
          if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
            logger.info(index)
            return true
          }
        })

        // previous find function returns a reference of the desired object
        // logger.info(`Participant index '${participant}'`)

        if (!participant.hasOwnProperty('documents')) {
          participant.documents = { economicals: [req.body] }
        } else {
          participant.documents.economicals.push(req.body)
        }
        bidding.save()
        return bidding
      })
      .then(bidding => {
        req.body = bidding
        next()
      })
      .catch(err => {
        next(err)
      })
  })
}

module.exports = {
  putTechnicalOfferUrl
}
