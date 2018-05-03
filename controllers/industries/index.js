const {Industry} = require('../../models')
const logger = require('winston-namespace')('industries:crud')

function get (req, res, next) {
  Industry.find({}).populate('category').then(industries => {
    if (!industries) {
      const err = new Error('There are no industries.')
      err.status = 400
      return next(err)
    }
    /* Format JSON: Each property is a category and and each category is another JSON as {industry: code} */
    req.body = {}
    const capitalize = string => string.charAt(0) + string.slice(1).toLowerCase()
    let category
    industries.forEach(industry => {
      category = capitalize(industry.category.name)
      if (!req.body[category]) req.body[category] = {}
      req.body[category][capitalize(industry.name)] = industry.code
    })
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
