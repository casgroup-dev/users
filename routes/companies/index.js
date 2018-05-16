const router = require('express').Router()
const {input, companies} = require('../../controllers/companies')
const {result} = require('../../controllers/utils')
const {token} = require('../../controllers/auth')
const {roles} = require('../../models')

/* Creation of a company using POST method */
router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin, roles.platform.shadowUser]), // Admins and shadow users (authorized by the admin) can create companies
  input.validate.creation,
  companies.create,
  result.send
)

/* Get all the companies or those that match the given query */
router.get('/', [
  token.validate,
  token.validate.roles([roles.platform.admin]),
  companies.get.query,
  result.send
])

/* Get information of the company using GET method */
router.get('/:businessName',
  token.validate,
  token.validate.roles([roles.platform.admin, roles.platform.companyAdmin]),
  token.validate.company,
  companies.get,
  result.send
)

/* Edit company using PUT method */
router.put('/:businessName',
  token.validate,
  token.validate.roles([roles.platform.admin, roles.platform.companyAdmin]),
  token.validate.company,
  companies.update,
  result.send
)

/* Delete a company using DELETE method */
router.delete('/:businessName',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  companies.remove,
  result.send
)

module.exports = router
