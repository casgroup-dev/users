const {Bidding, User} = require('../../../models')
const {token} = require('../../auth')

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

// TODO: remove this function (duplicated). It should be imported from wherever the original function is.
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

module.exports = {
  update
}
