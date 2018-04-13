const logger = require('winston-namespace')('companies:crud')
const {Company} = require('../../../models')

const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10
const usersPopulateFields = 'name email phone role -_id' // Explicitly exclude id

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
  Company.findOne({name: req.params.name}).populate('users', usersPopulateFields)
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

/**
 * Get function but by a given query or if there is no query match all with pagination.
 * @param req
 * @param res
 * @param next
 */
get.query = function (req, res, next) {
  let options = {}
  if (req.options.q) options = {$text: {$search: req.options.q}}
  Company.find(options)
    .populate('users', usersPopulateFields)
    .skip(PAGE_SIZE * (req.options.page - 1))
    .limit(PAGE_SIZE)
    .sort('name')
    .then(companies => {
      req.body = companies.map(getCleanCompanyData)
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while performing search request.')
      err.status = 500
      return next(err)
    })
}

/**
 * Updates a company with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  Company.findOne({name: req.params.name})
    .then(company => {
      company.set(req.body)
      return company.save()
    })
    .then(company => Company.findOne({name: company.name}).populate('users', usersPopulateFields))
    .then(company => {
      req.body = getCleanCompanyData(company)
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error(`Could not update company named '${req.params.name}'.`)
      err.status = 500
      return next(err)
    })
}

/**
 * Removes a company by its name.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
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
  return {
    id: company._id,
    name: company.name,
    industry: company.industry,
    users: company.users
  }
}

module.exports = {
  create,
  get,
  update,
  remove
}
