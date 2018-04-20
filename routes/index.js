const router = require('express').Router()
const authRouter = require('./auth')
const companiesRouter = require('./companies')
const usersRouter = require('./users')
const shadowUsers = require('./shadow/users')

router.use('/auth', authRouter)
router.use('/companies', companiesRouter)
router.use('/users', usersRouter)
router.use('/shadow/users', shadowUsers)

module.exports = router
