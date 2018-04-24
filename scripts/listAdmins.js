process.env.LOG_LEVEL = 'error'
const {User, roles} = require('../models')

User.find({role: roles.admin}).populate('company', 'businessName')
  .then(users => {
    users = users.map(u => ({name: u.name, email: u.email, company: u.company}))
    console.log(JSON.stringify(users, null, 2))
    process.exit()
  })
