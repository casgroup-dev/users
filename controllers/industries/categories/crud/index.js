const {Industry, IndustryCategory} = require('../../../../models/index')
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

/**
 * Given the name of the category in the params, returns all its industries.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function getIndustriesByCategory (req, res, next) {
  // console.log(req.params)
  Industry.find({category: req.params.objectId})
    .then(industries => {
      if (!industries) {
        const err = new Error(`There is no category '${req.params.objectId}'.`)
        err.status = 400
        throw err
      } else res.send(industries)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the corresponding industries.')
      err.status = 500
      return next(err)
    })
}

getIndustryCategory.name = function (req, res, next) {
  console.log(req)
}

module.exports = {
  getIndustryCategory,
  getIndustriesByCategory
}
