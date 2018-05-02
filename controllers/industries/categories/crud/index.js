const {IndustryCategory} = require('../../../../models/index')
const logger = require('winston-namespace')('industriesCategories:crud')

function getIndustryCategory (req, res, next) {
  IndustryCategory.find({})
    .then(categories => {
      if (!categories) {
        const err = new Error('There are no industries.')
        err.status = 400
        throw err
      }
      else res.send(categories)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the industries data.')
      err.status = 500
      return next(err)
    })
}

getIndustryCategory.name = function (req, res, next) {
  console.log(req)
}

module.exports = {
  getIndustryCategory
}
