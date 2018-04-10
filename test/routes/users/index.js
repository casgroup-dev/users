/* global describe it afterEach */
require('dotenv').config()

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../app')
const {Company} = require('../../../models')
const mongoose = require('../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

const userPassword = 'myPassword'

afterEach(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

describe('USERS', () => {
  it('Should create a new user', done => {
    createUser()
      .then(res => {
        console.log(res.body)
        res.body.should.have.property('name')
        res.body.should.have.property('email')
        res.body.should.have.property('role')
        res.body.should.have.property('company')
        res.body.company.should.have.property('name')
        res.body.company.should.have.property('industry')
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should create a user and then get his info', done => {
    createUser()
      .then(res => {
        const email = res.body.email
        return chai.request(app)
          .get(`/users/${email}`)
      })
      .then(res => {
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should create and remove a user', done => {
    createUser()
      .then(res => {
        return chai.request(app)
          .delete(`/users/${res.body.email}`)
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
      .then(res => {
        return chai.request(app)
          .put(`/users/${res.body.email}`)
          .send({email: secondEmail})
      })
      .then(res => {
        res.body.email.should.be.equal(secondEmail)
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
})

/**
 * Function that creates an user calling the /users endpoint with a post with data.
 * @returns {Promise<Request>}
 */
function createUser () {
  /* Create company to test adding a user */
  return new Company({name: 'Microsoft', industry: 'TI'}).save()
    .then(company => {
      return chai.request(app)
        .post('/users')
        .send({
          email: 'example@microsoft.com',
          company: company._id,
          role: 'proveedor',
          password: userPassword,
          name: 'Felipe Gonzales'
        })
    })
}

module.exports = {
  createUser,
  userPassword
}
