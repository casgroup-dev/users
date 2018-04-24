const inquirer = require('inquirer')
process.env.LOG_LEVEL = 'error'
const {ShadowUser} = require('../models')

inquirer.prompt([{type: 'input', name: 'email', message: 'Email:'}])
  .then(async answers => {
    const shadowUser = await new ShadowUser({email: answers.email}).save()
    if (shadowUser) return console.log(`Success, email: ${shadowUser.email}`)
    else return console.error('Could not create a shadow user.')
  }).then(() => process.exit())
