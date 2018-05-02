const {IndustryCategory, Industry} = require('../../../models/index')
const logger = require('winston-namespace')('industries:crud')

function get (req, res, next) {
  Industry.find({})
    .then(industries => {
      console.log(industries)
      res.send(industries)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the industries data.')
      err.status = 500
      return next(err)
    })
}

get.name = function (req, res, next) {
  console.log(req)
}

module.exports = {
  get
}
