const router = require('express').Router()
// const {IndustryCategory, Industry} = require('../../models')
const {getIndustry} = require('../../../controllers/industries/industries/crud/index')
const {getIndustriesByCategory} = require('../../../controllers/industries/categories/crud/index')

const {result} = require('../../../controllers/utils/index')

router.get('/',
  getIndustry,
  result.send
)

router.get('/:objectId',
  getIndustriesByCategory,
  result.send
)

/* router.get('/',
  getIndustryCategory.name,
  result.send
) */

// /* Get information of the industry by code using GET method */
// router.get('/:code',
//   get.code,
//   result.send
// )
//
// /* Get information of the industry by name using GET method */
// router.get('/:name',
//   get.name,
//   result.send
// )

module.exports = router
