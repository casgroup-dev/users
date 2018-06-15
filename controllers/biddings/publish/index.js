const logger = require('winston-namespace')('bidding:publish')
const {Bidding} = require('../../../models')

function publishResults (req, res, next) {
  Bidding.findOne({_id: req.params.id}).then(bidding => {
    bidding.publishedResults = true
    bidding.save()
    req.body = {} // To send empty json to front
    next()
  }).catch(err => {
    logger.error(err)
    err = new Error('Internal error while retrieving the bidding from DB.')
    err.status = 500
    next(err)
  })
}

module.exports = {
  results: publishResults
}
