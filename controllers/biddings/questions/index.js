const {Bidding} = require('../../../models')
const {token} = require('../../auth')
const {indexOfObject} = require('../../utils')

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

function update (req, res, next) {
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
          bidding.questions.push({
            user: userId,
            question: req.body.question,
            answer: req.body.answer
          })
          bidding.save()
          next()
        })
        .catch(() => {
          console.log('Error')
        })
    })
    .catch(err => {
      next(err)
    })
}

function answer (req, res, next) {
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
          // Get question index
          let questionIndex = indexOfObject(bidding.questions, '_id', req.params.questionId)
          // Edit answer
          bidding.questions[questionIndex].answer = req.body.answer
          bidding.save()
          next()
        })
        .catch(() => {
          console.log('Error')
        })
    })
    .catch(err => {
      next(err)
    })
}

const get = {
  question: (req, res, next) => {
    token.getUserName(req.params.token || req.options.token)
      .then(userName => {
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
            // Get question index
            let questionIndex = indexOfObject(bidding.questions, '_id', req.params.questionId)
            // Edit answer
            req.body = {name: userName, question: bidding.questions[questionIndex].question, answer: bidding.questions[questionIndex].answer}
            next()
          })
      })
      .catch(err => {
        next(err)
      })
  },

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
            req.body = bidding.questions
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
  answer,
  get
}
