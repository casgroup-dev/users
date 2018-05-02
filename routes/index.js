const router = require('express').Router()
const authRouter = require('./auth')
const companiesRouter = require('./companies')
const usersRouter = require('./users')
const shadowUsers = require('./shadow/users')
const industries = require('./industries/industries/index')
const industryCategories = require('./industries/industries/index')

router.use('/auth', authRouter)
router.use('/companies', companiesRouter)
router.use('/users', usersRouter)
router.use('/shadow/users', shadowUsers)
router.use('/industries', industries)
router.use('/industryCategories', industryCategories)

module.exports = router
