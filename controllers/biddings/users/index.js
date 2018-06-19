const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

const post = {
  addUser: function (req, res, next) {
    Bidding.findOne({_id: req.params.id})
      .then(async bidding => {
        if (!bidding) {
          const err = new Error('No bidding found')
          err.status = 404
          return next(err)
        }
        token.getData(req.options.token)
          .then(async tokenData => {
            console.log(tokenData.email)
            var user = await User.findOne({_id: req.params.userid})
            bidding.users.push({
              'user': user._id,
              'role': roles.bidding.provider
            })
            bidding.save()
            req.body = {}
            return next()
          })
          .catch(err => {
            err = new Error('Could not add user')
            err.status = 500
            return next(err)
          })
      })
      .catch(err => {
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        return next(err)
      })
  },
  participate: function (req, res, next) {
    Bidding.findOne({_id: req.params.id})
      .then(async bidding => {
        if (!bidding) {
          const err = new Error('No bidding found')
          err.status = 404
          return next(err)
        }
        token.getData(req.options.token)
          .then(async tokenData => {
            var user = await User.findOne({email: tokenData.email})
            bidding.users.push({
              'user': user._id,
              'role': roles.bidding.provider
            })
            bidding.save()
            req.body = {}
            return next()
          })
          .catch(err => {
            err = new Error('Could not add user')
            err.status = 500
            return next(err)
          })
      })
      .catch(err => {
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        return next(err)
      })
  }
}

module.exports = {
  post
}
