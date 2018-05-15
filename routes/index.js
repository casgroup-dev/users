const router = require('express').Router()
const authRouter = require('./auth')
const companiesRouter = require('./companies')
const usersRouter = require('./users')
const shadowUsers = require('./shadow/users')
const industries = require('./industries')
const biddings = require('./biddings')

router.use('/auth', authRouter)
router.use('/companies', companiesRouter)
router.use('/users', usersRouter)
router.use('/shadow/users', shadowUsers)
router.use('/industries', industries)
router.use('/bidding', biddings)

module.exports = router
