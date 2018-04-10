const logger = require('winston-namespace')('companies:crud')
const {Company} = require('../../../models')

/**
 * Creates a company given the data of the body.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function create (req, res, next) {
  req.body.company.save()
    .then(company => {
      req.body = getCleanCompanyData(company)
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing the new company instance.')
      err.status = 500
      return next(err)
    })
}

/**
 * Given the name of the company in the params, returns all its data (not sensible like _id or __v).
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function get (req, res, next) {
  Company.findOne({name: req.params.name}).populate('users', 'name email phone role')
    .then(company => {
      if (!company) {
        const err = new Error(`There is no company with name '${req.params.name}'.`)
        err.status = 400
        throw err
      }
      req.body = getCleanCompanyData(company)
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the company instance.')
      err.status = 500
      return next(err)
    })
}

function update (req, res, next) {
  // TODO
}

function remove (req, res, next) {
  Company.remove({name: req.params.name})
    .then(() => {
      req.body = {message: 'Success.'}
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while removing the company instance.')
      err.status = 500
      return next(err)
    })
}

/**
 * Returns only the not sensible data to the client.
 * @param {Object} company
 * @returns {{name: String, industry: String, users: Array<Object>}}
 */
function getCleanCompanyData (company) {
  return {name: company.name, industry: company.industry, users: company.users}
}

module.exports = {
  create,
  get,
  update,
  remove
}
