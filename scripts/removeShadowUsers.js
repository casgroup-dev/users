process.env.LOG_LEVEL = 'error'
const {ShadowUser} = require('../models')

ShadowUser.find({}).then(users => {
  console.log('Users that are going to be deleted:\n')
  console.log(JSON.stringify(users, null, 2))
}).then(() => {
  ShadowUser.remove({}, err => {
    if (err) return console.error(err)
    console.log('Success')
    process.exit()
  })
})
