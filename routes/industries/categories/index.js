const router = require('express').Router()
const {getIndustryCategory} = require('../../../controllers/industries/categories/crud/index')
const {result} = require('../../../controllers/utils/index')

router.get('/',
  getIndustryCategory.name,
  result.send
)

module.exports = router
