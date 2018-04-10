/* global describe it afterEach */
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')
const {createUser, userPassword} = require('../users')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

afterEach(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

describe('AUTH', () => {
  it('Should return the error indicating that the email does not exists', done => {
    chai.request(app)
      .post('/auth/login')
      .send({email: 'email@example.com', password: 'sdjksdhsad'})
      .then(res => {
        res.body.should.have.property('error')
        console.log(res.body)
        done()
      })
  })
  it('Should perform a correct login', done => {
    createUser()
      .then(res => {
        return chai.request(app)
          .post('/auth/login')
          .send({email: res.body.email, password: userPassword})
      })
      .then(res => {
        res.body.should.have.property('token')
        console.log(res.body)
        done()
      })
  })
  it('Should return an error with an incorrect login', done => {
    createUser()
      .then(res => {
        return chai.request(app)
          .post('/auth/login')
          .send({email: res.body.email, password: 'this is not the password'})
      })
      .then(res => {
        res.body.should.have.property('error')
        console.log(res.body)
        done()
      })
  })
})
