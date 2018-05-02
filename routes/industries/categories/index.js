const router = require('express').Router()
const {getIndustryCategory} = require('../../../controllers/industries/categories/crud/index')
const {result} = require('../../../controllers/utils/index')
const logger = require('winston-namespace')('industries:crud')

router.get('/',
  getIndustryCategory,
  result.send
)

module.exports = router
