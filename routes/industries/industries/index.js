const router = require('express').Router()
// const {IndustryCategory, Industry} = require('../../models')
const {getIndustry, getIndustryCategory} = require('../../../controllers/industries/industries/crud/index')
const {result} = require('../../../controllers/utils/index')

router.get('/',
  getIndustry,
  result.send
)

/*router.get('/',
  getIndustryCategory.name,
  result.send
)*/

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
