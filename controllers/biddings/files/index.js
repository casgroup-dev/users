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
        let participantIndex = null

        /*
                await Promise.all(bidding.users.filter((biddingParticipant, index) => {
                  if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
                    logger.info(index)
                    return Promise.resolve(index)
                  }
                })).then(values => { participantIndex = values[0] })
        */

        await bidding.users.filter((biddingParticipant, index) => {
          if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
            logger.info(index)
            participantIndex = index // Since there is just one this should work
          }
        })

        logger.info(`Participant index '${participantIndex}'`)

        if (!bidding.users[participantIndex].hasOwnProperty('documents')) {
          bidding.users[participantIndex].documents = {economical: req.body}
        } else {
          bidding.users[participantIndex].documents.economical = req.body
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
