/* global describe it after */
require('dotenv').config()
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const {roles, Company} = require('../../../models')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

after(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

const validCompany = {name: 'Microsoft Corporates INC', industry: 'TI'}
const userData = {email: 'example@email.com', name: 'Fabián Souto', role: 'proveedor', password: 'myPassword'}

describe('COMPANIES', () => {
  it('Should get an error if the input for creation is bad', done => {
    createUserAndGetToken(roles.admin)
      .then(token => chai.request(app).post(`/companies?token=${token}`).send({name: 'Microsoft'}))
      .then(res => {
        res.body.should.have.property('error')
        res.body.error.status.should.be.equal(400)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should create a company and get it', done => {
    const company = {name: 'Facebook', industry: 'TI'}
    const validateCompany = body => {
      body.should.have.property('name')
      body.should.have.property('industry')
      body.should.have.property('users')
      body.name.should.be.equal(company.name)
      body.industry.should.be.equal(company.industry)
    }
    let token
    createUserAndGetToken(roles.admin)
      .then(t => {
        token = t
        return chai.request(app).post(`/companies?token=${token}`).send(company)
      })
      .then(res => {
        validateCompany(res.body)
        return chai.request(app)
          .get(`/companies/${res.body.name}?token=${token}`)
      })
      .then(res => {
        validateCompany(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should remove a company', done => {
    createUserAndGetToken()
      .then(token => {
        chai.request(app)
          .delete(`/companies/${validCompany.name}?token=${token}`)
          .then(res => {
            res.status.should.be.equal(200)
            console.log(res.body)
            done()
          })
          .catch(err => console.log(err))
      })
  })
  it('Should update a company', done => {
    createUserAndGetToken(roles.admin)
      .then(token => {
        return chai.request(app)
          .put(`/companies/${validCompany.name}?token=${token}`)
          .send({name: 'Apple'})
      })
      .then(res => {
        res.body.name.should.be.equal('Apple')
        res.body.users[0].email.should.be.equal(userData.email)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should get the companies that match with the query', done => {
    createUserAndGetToken(roles.admin)
      .then(token => {
        return chai.request(app)
          .get(`/companies?q=microsoft&token=${token}`)
      })
      .then(res => {
        res.body.should.have.lengthOf(1)
        console.log(JSON.stringify(res.body, null, 2))
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should get all the companies', done => {
    createUserAndGetToken(roles.admin)
      .then(token => chai.request(app).get(`/companies?token=${token}`))
      .then(res => {
        res.body.length.should.be.greaterThan(0)
        console.log(JSON.stringify(res.body, null, 2))
        done()
      })
      .catch(err => console.log(err))
  })
})

function createCompany () {
  return Company.findOne(validCompany)
    .then(company => {
      if (company) return company
      return new Company(validCompany).save()
    })
}

function addUser (role) {
  return function (company) {
    /* Format data of user */
    const user = {...userData}
    user.company = company._id
    if (role) user.role = role
    /* Get user if exists */
    return chai.request(app).get(`/users/${user.email}`)
      .then(res => {
        if (!res.body.error) {
          /* Set the company if it was removed */
          return chai.request(app).put(`/users/${user.email}`).send({company: company._id})
        }
        /* If does not exists, create */
        return chai.request(app)
          .post('/users')
          .send(user)
      })
      .then(() => {
        /* Login after a timeout */
        return new Promise(resolve => {
          setTimeout(() => chai.request(app).post('/auth/login').send({
            email: user.email,
            password: user.password
          }).then(res => resolve(res)), 100)
        })
      })
      .then(res => res.body.token)
  }
}

function createUserAndGetToken (role) {
  return createCompany().then(addUser(role))
}
