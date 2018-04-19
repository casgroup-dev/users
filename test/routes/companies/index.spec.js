/* global describe it afterEach */
require('dotenv').config()
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const {roles, Company, User} = require('../../../models')
const {hashPassword} = require('../../../controllers/users')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

const validCompany = {name: 'Microsoft Corporates INC', industry: 'TI'}
let companyId // Populated on createUser
const userData = {
  email: 'example@email.com',
  name: 'Fabián Souto',
  role: roles.user,
  password: 'mypassword'
}

describe('COMPANIES', () => {
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
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
  it('Should get an error when there is no token', done => {
    const validateError = res => {
      res.body.should.have.property('error')
      res.body.error.status.should.be.equal(403)
    }
    chai.request(app).post('/companies')
      .then(validateError)
      .then(() => chai.request(app).delete('/companies/anyCompany'))
      .then(validateError)
      .then(() => chai.request(app).put('/companies/anyCompany'))
      .then(validateError)
      .then(() => chai.request(app).get('/companies'))
      .then(validateError)
      .then(done)
  })
  it('Admin should create a company and get it', done => {
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
          .get(`/companies/${res.body.id}?token=${token}`)
      })
      .then(res => {
        validateCompany(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Admin should remove a company', done => {
    createUserAndGetToken()
      .then(token => {
        chai.request(app)
          .delete(`/companies/${companyId}?token=${token}`)
          .then(res => {
            res.status.should.be.equal(200)
            console.log(res.body)
            done()
          })
          .catch(err => console.log(err))
      })
  })
  it('Admin should update a company', done => {
    createUserAndGetToken(roles.admin)
      .then(token => {
        return chai.request(app)
          .put(`/companies/${companyId}?token=${token}`)
          .send({name: 'Apple'})
      })
      .then(res => {
        res.body.name.should.be.equal('Apple')
        res.body.users[0].email.should.be.equal(userData.email)
        done()
      })
      .catch(err => console.log(err))
  })
  /* THIS TEST PASS ALONE, BUT NOT WITH THE OTHERS TOGETHER, UNCOMMENT TO TRY
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
  */
  it('Admin should get all the companies', done => {
    createUserAndGetToken(roles.admin)
      .then(token => chai.request(app).get(`/companies?token=${token}`))
      .then(res => {
        res.body.length.should.be.greaterThan(0)
        console.log(JSON.stringify(res.body, null, 2))
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should get its own company', done => {
    createUserAndGetToken(roles.companyAdmin)
      .then(token => {
        return chai.request(app).get(`/companies/${companyId}?token=${token}`)
      })
      .then(res => {
        res.body.name.should.be.equal(validCompany.name)
        res.body.industry.should.be.equal(validCompany.industry)
        done()
      })
  })
  it('Should not get another company', done => {
    new Company({name: 'New company', industry: 'TI'}).save()
      .then(company => createUserAndGetToken().then(token => chai.request(app).get(`/companies/${company.id}?token=${token}`)))
      .then(res => {
        res.body.error.status.should.be.equal(403)
        done()
      })
  })
})

function createUserAndGetToken (role) {
  return new Company(validCompany).save().then(company => {
    /* Populate company id */
    companyId = company._id
    /* Format data of user */
    const user = {...userData}
    user.company = company._id
    user.rawPassword = user.password
    user.password = hashPassword(user.password)
    if (role) user.role = role
    return new User(user).save()
    /* Check if the company has the user */
      .then(user => {
        company.users.push(user._id)
        return company.save()
      })
      .then(() => chai.request(app).post('/auth/login').send({
        email: user.email,
        password: user.rawPassword
      }))
      .then(res => res.body.token)
  })
}
