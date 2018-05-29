const {Industry} = require('../../models')
const logger = require('winston-namespace')('industries:crud')

function get (req, res, next) {
  Industry.find({}).then(industries => {
    if (!industries) {
      const err = new Error('There are no industries.')
      err.status = 400
      return next(err)
    }
    req.body = industries
    return next()
  })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the industries data.')
      err.status = 500
      return next(err)
    })
}

module.exports = {
  get
}
