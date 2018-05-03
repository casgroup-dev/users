const router = require('express').Router()
const industries = require('../../controllers/industries')
const {result} = require('../../controllers/utils')
const {token} = require('../../controllers/auth')
const {roles} = require('../../models')

/* Get the industries using GET method */
router.get('/',
  token.validate,
  token.validate.roles([roles.admin, roles.shadowUser]), // Admins and shadow users (authorized by the admin) can get industries
  industries.get,
  result.send
)

module.exports = router
