const companies = require('./crud')
const {Company} = require('../../models')
const {result} = require('../users')
const logger = require('winston-namespace')('companies')

const input = {
  validate: {
    /**
     * Validates and create (without saving) a company.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    creation: (req, res, next) => {
      const company = new Company(req.body)
      company.validate()
        .then(() => {
          req.body = {company}
          return next()
        })
        .catch(err => {
          err.status = 400
          logger.error(err)
          return next(err)
        })
    }
  },
  format: {
    /**
     * Format and the set default options.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    options: (req, res, next) => {
      req.options = req.query
      req.options.q = req.options.q || null
      req.options.page = req.options.page || 1
      return next()
    }
  }
}

module.exports = {
  input,
  companies,
  result
}
