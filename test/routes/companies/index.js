/* global describe it afterEach */
require('dotenv').config()
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

afterEach(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

const validCompany = {name: 'Microsoft Corporates INC', industry: 'TI'}

describe('COMPANIES', () => {
  it('Should get an error if the input for creation is bad', done => {
    chai.request(app)
      .post('/companies')
      .send({name: 'Microsoft'})
      .then(res => {
        res.body.should.have.property('error')
        res.body.error.status.should.be.equal(400)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should create a company and get it', done => {
    const validateCompany = body => {
      body.should.have.property('name')
      body.should.have.property('industry')
      body.should.have.property('users')
      body.name.should.be.equal(validCompany.name)
      body.industry.should.be.equal(validCompany.industry)
    }
    createCompany()
      .then(res => {
        validateCompany(res.body)
        chai.request(app)
          .get(`/companies/${res.body.name}`)
          .then(res => {
            validateCompany(res.body)
            done()
          })
      })
      .catch(err => console.log(err))
  })
  it('Should create and remove a company', done => {
    createCompany()
      .then(() => {
        chai.request(app)
          .delete(`/companies/${validCompany.name}`)
          .then(res => {
            res.status.should.be.equal(200)
            console.log(res.body)
            done()
          })
          .catch(err => console.log(err))
      })
  })
  it('Should create and update a company', done => {
    createCompany()
      .then(() => {
        return chai.request(app)
          .put(`/companies/${validCompany.name}`)
          .send({name: 'Apple'})
      })
      .then(res => {
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should get the companies that match with the query', done => {
    createCompany()
      .then(() => {
        return chai.request(app)
          .get('/companies?q=microsoft')
      })
      .then(res => {
        res.body.should.have.lengthOf(1)
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should get all the companies', done => {
    createCompany()
      .then(() => {
        return chai.request(app)
          .get('/companies')
      })
      .then(res => {
        res.body.should.have.lengthOf(1)
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
})

function createCompany () {
  return chai.request(app).post('/companies').send(validCompany)
}
