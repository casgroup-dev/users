const router = require('express').Router()
const authRouter = require('./auth')
const companiesRouter = require('./companies')
const usersRouter = require('./users')

router.use('/auth', authRouter)
router.use('/companies', companiesRouter)
router.use('/users', usersRouter)

module.exports = router
