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
function putDocumentUrl (req, res, next) {
  // Get user email from token

  getUserIdByToken(req.params.token || req.options.token)
    .then(userId => {
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
          let participant = bidding.users.find((biddingParticipant) => {
            if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
              return true
            }
          })

          // previous find function returns a reference of the desired object
          // logger.info(`Participant index '${participant}'`)

          switch (req.params.type) {
            case 'economical':
              participant.documents.economicals.push(req.body)
              break
            case 'technical':
              participant.documents.technicals.push(req.body)
              break
            default:
              const err = new Error(`Invalid type: '${req.params.type}'. Allowed types are 'economical' and 'technical'`)
              err.code = 400
              throw err
          }
          bidding.save()
          req.body = {}
          next()
        })
        .catch(err => {
          next(err)
        })
    })
}

const get = {
  myFiles: (req, res, next) => {
    getUserIdByToken(req.params.token || req.options.token)
      .then(userId => {
        Bidding.findOne({_id: req.params.id, 'users.user': userId})
          .then(bidding => {
            if (!bidding) {
              const err = new Error('No such bidding')
              err.status = 404
              throw err
            }
            return bidding
          })
          .then(bidding => {
            let participant = bidding.users.find((biddingParticipant) => {
              if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
                return true
              }
            })
            req.body = removeIdFromDocuments(participant.documents)
            next()
          })
      })
      .catch(err => {
        next(err)
      })
  },

  all: (req, res, next) => {
    Bidding.findOne({_id: req.params.id})
    /* TODO: popular compañias usuarios. Debería funcionar con algo como
     * .populate({path: 'users', populate: {path: 'user', model: 'User'}})
     * Aunque esto trae todos los field de User. Pero por alguna razón no funciona
     */
      .populate()
      .then(bidding => {
        if (!bidding) {
          const err = new Error('No such bidding')
          err.status = 404
          throw err
        }
        return bidding
      })
      .then(bidding => {
        req.body = bidding.users.map(participant => {
          if (participant.role === roles.bidding.provider) {
            const company = User.findOne({_id: participant.user})
            return {
              provider: participant.user,
              documents: removeIdFromDocuments(participant.documents)
            }
          }
        })
        next()
      })
      .catch(err => {
        next(err)
      })
  }
}

function getUserIdByToken (tkn) {
  return token.getData(tkn)
    .then(tokenData => {
      return tokenData.email
    }).then(email => {
      return User.findOne({email: email})
        .then(user => {
          if (!user) {
            const err = new Error(`Unexpected: User with email '${email}' not found`)
            err.status = 404
            throw err
          }
          return user._id
        })
    })
    .catch(err => {
      throw err
    })
}

function removeIdFromDocuments (documents) {
  return {
    economical: documents.economicals.map(c => { return {name: c.name, url: c.url, date: c.date} }),
    technical: documents.technicals.map(c => { return {name: c.name, url: c.url, date: c.date} })
  }
}

module.exports = {
  putDocumentUrl,
  get,
  getUserIdByToken
}
