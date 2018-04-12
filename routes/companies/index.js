const router = require('express').Router()
const {input, companies} = require('../../controllers/companies')
const {result} = require('../../controllers/utils')
const {token} = require('../../controllers/auth')
const {roles} = require('../../models')

/* Creation of a company using POST method */
router.post('/',
  token.validate,
  token.validate.roles([roles.admin]),
  input.validate.creation,
  companies.create,
  result.send
)

/* Get all the companies or those that match the given query */
router.get('/', [
  token.validate,
  token.validate.roles([roles.admin]),
  companies.get.query,
  result.send
])

/* Get information of the company using GET method */
router.get('/:name',
  token.validate,
  token.validate.roles([roles.admin]),
  companies.get,
  result.send
)

/* Edit company using PUT method */
router.put('/:name',
  token.validate,
  token.validate.roles([roles.admin]),
  companies.update,
  result.send
)

/* Delete a company using DELETE method */
router.delete('/:name',
  token.validate,
  token.validate.roles([roles.admin]),
  companies.remove,
  result.send
)

module.exports = router
