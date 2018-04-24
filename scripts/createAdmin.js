/* Script to create and admin, PLEASE ONLY USE IT ONCE AND WITH PRECAUTION */
process.env.LOG_LEVEL = 'error'
const inquirer = require('inquirer')
const users = require('../controllers/users')
const {Company, User, roles} = require('../models')

const companyData = {
  businessName: 'CAS compañía de asesorías y servicios SPA',
  fantasyName: 'CAS Group',
  rut: '766079849',
  industries: [], // TODO: Write the correct industries
  legalRepresentative: 'Cristian Saavedra Urbina',
  legalRepEmail: 'csaavedra@casgroup.cl'
}

inquirer.prompt([
  {type: 'input', name: 'name', message: 'Full name:'},
  {type: 'input', name: 'email', message: 'Email:'},
  {type: 'password', name: 'password', message: 'Password:'},
  {type: 'password', name: 'passwordConfirmation', message: 'Please confirm password:'}
])
  .then(async answers => {
    if (answers.password !== answers.passwordConfirmation) return console.error('ERROR: Passwords are not the same.')
    const userData = {
      name: answers.name,
      email: answers.email,
      password: users.hashPassword(answers.password),
      role: roles.admin
    }
    let company = await Company.findOne({rut: companyData.rut})
    if (!company) company = await new Company(companyData).save()
    userData.company = company._id
    const user = await new User(userData).save()
    if (user) console.log('Success, user created.')
    else console.error('Could not create the user.')
  })
  .then(() => process.exit())
