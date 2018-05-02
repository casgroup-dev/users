const {Industry} = require('../../../../models/index')
const logger = require('winston-namespace')('industries:crud')

function getIndustry (req, res, next) {
  Industry.find({})
    .then(industries => {
      if (!industries) {
        const err = new Error('There are no industries.')
        err.status = 400
        throw err
      }
      else res.send(industries)
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the industries data.')
      err.status = 500
      return next(err)
    })
}

getIndustry.name = function (req, res, next) {
  console.log(req)
}

module.exports = {
  getIndustry
}
