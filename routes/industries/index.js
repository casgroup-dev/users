const router = require('express').Router()
// const {IndustryCategory, Industry} = require('../../models')
const {get} = require('../../controllers/industries/crud')
const {result} = require('../../controllers/utils')

router.get('/',
  get,
  result.send
)

/* Get information of the industry by code using GET method */
router.get('/:code',
  get.code,
  result.send
)

/* Get information of the industry by name using GET method */
router.get('/:name',
  get.name,
  result.send
)

module.exports = router
