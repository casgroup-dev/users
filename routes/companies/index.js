const router = require('express').Router()
const {input, companies, result} = require('../../controllers/companies')
const {validateToken} = require('../../controllers/utils')
const {roles} = require('../../models')

/* Creation of a company using POST method */
router.post('/',
  ...validateToken.createMiddleware([roles.admin]),
  input.validate.creation,
  companies.create,
  result.send
)

/* Get all the companies or those that match the given query */
router.get('/', [
  ...validateToken.createMiddleware([roles.admin]),
  companies.get.query,
  result.send
])

/* Get information of the company using GET method */
router.get('/:name',
  ...validateToken.createMiddleware([roles.admin]),
  companies.get,
  result.send
)

/* Edit company using PUT method */
router.put('/:name',
  ...validateToken.createMiddleware([roles.admin]),
  companies.update,
  result.send
)

/* Delete a company using DELETE method */
router.delete('/:name',
  ...validateToken.createMiddleware([roles.admin]),
  companies.remove,
  result.send
)

module.exports = router
