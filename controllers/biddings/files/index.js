const logger = require('winston-namespace')('bidding:files')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')
const {s3} = require('../../../services/aws')
const {indexOfObject} = require('../../utils')

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

  token.getUserId(req.params.token || req.options.token)
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
    token.getUserId(req.params.token || req.options.token)
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
              if (biddingParticipant.user.equals(userId)) { // ObjectID comparison
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
      .then(bidding => {
        if (!bidding) {
          const err = new Error('No such bidding')
          err.status = 404
          throw err
        }
        return bidding
      })
      .then(bidding => {
        const promises = Promise.all(bidding.users.map(async participant => {
          if (participant.role === roles.bidding.provider) {
            const company = await User.findOne({_id: participant.user})
              .populate({path: 'company', select: 'businessName'})
              .then(u => {
                return u.company.businessName
              })
            const retValue = {
              provider: company,
              documents: removeIdFromDocuments(participant.documents)
            }
            return retValue
          }
        }))
        promises.then(ret => {
          req.body = ret
          next()
        })
      })
      .catch(err => {
        next(err)
      })
  }
}

function remove (req, res, next) {
  if (!req.query.name) {
    const err = new Error(`No file name provided. Query param should be 'name'`)
    err.code = 400
    next(err)
  }

  token.getUserId(req.params.token || req.options.token)
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

          let index
          let documentsArray

          switch (req.params.type) {
            case 'technical':
              documentsArray = participant.documents.technicals
              break
            case 'economical':
              documentsArray = participant.documents.economicals
              break
            default:
              const err = new Error(`Invalid type: '${req.params.type}'. Allowed types are 'economical' and 'technical'`)
              err.code = 400
              throw err
          }

          index = indexOfObject(documentsArray, 'name', req.query.name)
          try {
            deleteFromS3(documentsArray[index].url) // If this throws an error it would be caught below
            documentsArray.splice(index, 1)
          } catch (err) {
            logger.error(err)
            err.message = `There was a problem when deleting file '${documentsArray[index].name}'. Please read backend logs`
            throw err
          }

          bidding.save()
          next()
        })
    })
    .catch(err => {
      next(err)
    })
}

function removeIdFromDocuments (documents) {
  return {
    economical: documents.economicals.map(c => { return {name: c.name, url: c.url, date: c.date} }),
    technical: documents.technicals.map(c => { return {name: c.name, url: c.url, date: c.date} })
  }
}

function deleteFromS3 (url) {
  // Parse url to get the key
  const urlPrefix = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`
  const key = url.slice(urlPrefix.length)
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  }
  // logger.info(key)
  s3.deleteObject(params, (err, data) => {
    if (err) throw err
    else { logger.info(`Successfully deleted '${key}'`) }
  })
}

module.exports = {
  putDocumentUrl,
  get,
  remove
}
