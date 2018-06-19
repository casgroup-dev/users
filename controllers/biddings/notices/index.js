const {Bidding} = require('../../../models')
const {token} = require('../../auth')

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

function update (req, res, next) {
  token.getUserId(req.params.token || req.options.token)
    .then(userId => {
      Bidding.findOne({_id: req.params.id})
        .then(bidding => {
          if (!bidding) {
            const err = new Error('No such bidding')
            err.status = 404
            throw err
          }
          return bidding
        })
        .then(bidding => {
          bidding.notices.push({
            user: userId,
            notice: req.body.notice,
            date: req.body.date
          })
          bidding.save()
        })
        .catch(() => {
          console.log('Error')
        })
    })
    .catch(err => {
      next(err)
    })
  next()
}

const get = {
  all: (req, res, next) => {
    token.getUserId(req.params.token || req.options.token)
      .then(() => {
        Bidding.findOne({_id: req.params.id})
          .then(bidding => {
            if (!bidding) {
              const err = new Error('No such bidding')
              err.status = 404
              throw err
            }
            return bidding
          })
          .then(bidding => {
            req.body = bidding.notices
            next()
          })
      })
      .catch(err => {
        next(err)
      })
  }
}

module.exports = {
  update,
  get
}
