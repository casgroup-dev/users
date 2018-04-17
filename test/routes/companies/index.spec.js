/* global describe it after */
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

const validCompany = {
  business_name: 'Microsoft Corporates INC',
  fantasy_name: 'Microsoft',
  rut: '111111111',
  industries: ['TI', 'World Domain'],
  legal_representative: 'Bill Gates',
  legal_rep_email: 'billy@outlook.com'
}

const userData = {
  email: 'example@email.com',
  name: 'Fabián Souto',
  role: 'proveedor',
  password: 'mypassword'
}

describe('COMPANIES', () => {
  after(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should get an error if the input for creation is bad', done => {
    createUserAndGetToken(roles.admin)
      .then(token => chai.request(app).post(`/companies?token=${token}`).send({business_name: 'Microsoft'}))
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
  it('Should create a company and get it', done => {
    const company = {
      business_name: 'Facebook Social Media',
      fantasy_name: 'Facebook',
      rut: '666666666',
      industries: ['TI', 'Mind Control'],
      legal_representative: 'Bill Gates',
      legal_rep_email: 'billy@outlook.com'
    }

    const validateCompany = body => {
      body.should.have.property('business_name')
      body.should.have.property('fantasy_name')
      body.should.have.property('rut')
      body.should.have.property('industries')
      body.should.have.property('legal_representative')
      body.should.have.property('legal_rep_email')
      body.should.have.property('users')
      body.business_name.should.be.equal(company.business_name)
      body.industries.should.be.equal(company.industries)
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
          .get(`/companies/${res.body.business_name}?token=${token}`)
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
          .delete(`/companies/${validCompany.business_name}?token=${token}`)
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
          .put(`/companies/${validCompany.business_name}?token=${token}`)
          .send({business_name: 'Apple'})
      })
      .then(res => {
        res.body.business_name.should.be.equal('Apple')
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

function createUserAndGetToken (role) {
  return Company.findOne(validCompany)
    .then(company => {
      if (company) return company
      return new Company(validCompany).save()
    })
    .then(company => {
      /* Format data of user */
      const user = {...userData}
      user.company = company._id
      user.rawPassword = user.password
      user.password = hashPassword(user.password)
      if (role) user.role = role
      /* Get user if exists */
      return User.findOne({email: user.email})
        .then(user => user ? user.remove() : null)
        .then(() => new User(user).save())
        /* Check if the company has the user */
        .then(user => {
          if (company.users.indexOf(user._id) === -1) {
            company.users.push(user._id)
            return company.save()
          }
        })
        .then(() => chai.request(app).post('/auth/login').send({
          email: user.email,
          password: user.rawPassword
        }))
        .then(res => res.body.token)
    })
}
