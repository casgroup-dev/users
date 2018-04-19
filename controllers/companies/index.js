const companies = require('./crud')
const {Company} = require('../../models')
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
  }
}

module.exports = {
  input,
  companies
}
