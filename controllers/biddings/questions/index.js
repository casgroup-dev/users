const {Bidding} = require('../../../models')
const {getUserIdByToken} = require('../../utils')

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

function update (req, res, next) {
  getUserIdByToken(req.params.token || req.options.token)
    .then(userId => {
      Bidding.findOne({_id: req.params.id, 'users.user': userId})
        .then(bidding => {
          if (!bidding) {
            console.log('no encuentra la bidding')
            const err = new Error('No such bidding')
            err.status = 404
            throw err
          }
          return bidding
        })
        .then(bidding => {
          console.log('encuentra la bidding')
          bidding.questions.push({
            user: userId,
            question: req.body.question
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

module.exports = {
  update
}
