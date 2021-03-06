/* global describe it afterEach */
require('dotenv').config()

const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../app')
const {Company, User, roles} = require('../../../models')
const mongoose = require('../../../services/mongo')
const {hashPassword} = require('../../../controllers/users')
const {validCompany} = require('../companies/index.spec')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

const userPassword = 'myPassword'

describe('USERS', () => {
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should create a new user', done => {
    createUser()
      .then(({res}) => {
        validateUser(res)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should create a user and then get his info', done => {
    createUser()
      .then(({res, adminToken}) => {
        console.log(res.body)
        return chai.request(app)
          .get(`/api/users/${res.body.email}?token=${adminToken}`)
      })
      .then(validateUser)
      .then(done)
      .catch(err => console.log(err))
  })
  it('Should create and remove a user', done => {
    createUser()
      .then(({res, adminToken}) => {
        return chai.request(app)
          .delete(`/api/users/${res.body.email}?token=${adminToken}`)
      })
      .then(res => {
        res.body.should.have.property('message')
        res.status.should.be.equal(200)
        console.log(res.body)
        done()
      })
  })
  it('Should create a user and edit him', done => {
    const secondEmail = 'second@email.com'
    createUser()
      .then(({res, adminToken}) => {
        console.log(res.body)
        return chai.request(app)
          .put(`/api/users/${res.body.email}?token=${adminToken}`)
          .send({email: secondEmail})
      })
      .then(res => {
        res.body.email.should.be.equal(secondEmail)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should not perform anything without a token', done => {
    const validateError = res => {
      res.should.have.property('error')
      res.error.status.should.be.equal(403)
    }
    chai.request(app)
      .post('/api/users')
      .then(validateError)
      .then(() => chai.request(app).put('/api/users/aUserEmail'))
      .then(validateError)
      .then(() => chai.request(app).delete('/api/users/aUserEmail'))
      .then(validateError)
      .then(() => chai.request(app).get('/api/users/aUserEmail'))
      .then(validateError)
      .then(done)
  })
  it('Should return an error when the email does not exist in the DB', done => {
    chai.request(app)
      .get('/api/users/notanemail@email.com')
      .then(res => {
        console.log(res.body)
        done()
      })
  })
})

/**
 * Function that creates an user calling the /users endpoint with a post with data.
 * @returns {PromiseLike}
 */
function createUser () {
  const adminPassword = 'mypassword'
  const adminData = {
    name: 'Admin Name',
    email: 'email@example.com',
    role: 'admin',
    password: hashPassword(adminPassword) // Need to be hashed for the DB
  }
  /* Create company to test adding a user */
  let company
  return new Company(validCompany).save()
  /* Add admin to get a token */
    .then(newCompany => {
      company = newCompany
      adminData.company = company._id
      return new User(adminData).save()
    })
    /* Login to get a token */
    .then(admin => {
      return chai.request(app).post('/api/auth/login').send({
        email: admin.email,
        password: adminPassword
      }).then(res => res.body.token)
    })
    /* Create the user using the endpoint */
    .then(token => {
      return chai.request(app)
        .post(`/api/users?token=${token}`)
        .send({
          email: 'example@microsoft.com',
          company: company._id,
          role: roles.platform.user,
          password: userPassword,
          name: 'Felipe Gonzales'
        })
        .then(res => ({res, adminToken: token}))
    })
}

function validateUser (res) {
  console.log(res.body)
  res.body.should.have.property('name')
  res.body.should.have.property('email')
  res.body.should.have.property('role')
  res.body.should.have.property('company')
  res.body.company.should.have.property('businessName')
  res.body.company.should.have.property('industries')
}

module.exports = {
  createUser,
  userPassword
}
