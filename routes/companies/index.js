const router = require('express').Router()
const {input, companies, result} = require('../../controllers/companies')

/* Creation of a company using POST method */
router.post('/',
  input.validate.creation,
  companies.create,
  result.send
)

/* Get information of the company using GET method */
router.get('/:name',
  companies.get,
  result.send
)

/* Edit company using PUT method */
router.put('/:name',
  input.validate.edition,
  companies.update,
  result.send
)

/* Delete a company using DELETE method */
router.delete('/:name',
  companies.remove,
  result.send
)

module.exports = router
