/* global describe it afterEach */
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
  businessName: 'Microsoft Corporates INC',
  fantasyName: 'Microsoft',
  rut: '111111111',
  industries: ['TI', 'World Domain'],
  legalRepresentative: 'Bill Gates',
  legalRepEmail: 'billy@outlook.com'
}
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
      .then(token => chai.request(app).post(`/companies?token=${token}`).send({businessName: 'Microsoft'}))
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
      businessName: 'Facebook Social Media',
      fantasyName: 'Facebook',
      rut: '666666666',
      industries: ['TI', 'Mind Control'],
      legalRepresentative: 'Bill Gates',
      legalRepEmail: 'billy@outlook.com'
    }
    const validateCompany = body => {
      body.should.have.property('businessName')
      body.should.have.property('fantasyName')
      body.should.have.property('rut')
      body.should.have.property('industries')
      body.should.have.property('legalRepresentative')
      body.should.have.property('legalRepEmail')
      body.should.have.property('users')
      body.businessName.should.be.equal(company.businessName)
      body.industries.should.be.deep.equal(company.industries)
    }
    createUserAndGetToken(roles.admin)
      .then(token => chai.request(app).post(`/companies?token=${token}`).send(company).then(res => {
        validateCompany(res.body)
        return chai.request(app).get(`/companies/${res.body.businessName}?token=${token}`)
      }))
      .then(res => {
        console.log(res.body)
        validateCompany(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Admin should remove a company', done => {
    createUserAndGetToken()
      .then(token => {
        chai.request(app)
          .delete(`/companies/${validCompany.businessName}?token=${token}`)
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
      .then(token => chai.request(app)
        .put(`/companies/${validCompany.businessName}?token=${token}`)
        .send({businessName: 'Apple'}))
      .then(res => {
        res.body.businessName.should.be.equal('Apple')
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
      .then(token => chai.request(app).get(`/companies/${validCompany.businessName}?token=${token}`))
      .then(res => {
        res.body.businessName.should.be.equal(validCompany.businessName)
        res.body.industries.should.be.deep.equal(validCompany.industries)
        done()
      })
  })
  it('Should not get another company', done => {
    new Company({
      businessName: 'Facebook INC',
      fantasyName: 'Facebook',
      rut: '1289763219',
      industries: ['TI', 'Private Data'],
      legalRepresentative: 'Mark Zuckerberg',
      legalRepEmail: 'mark@fb.com'
    }).save()
      .then(company => createUserAndGetToken().then(token => chai.request(app).get(`/companies/${company.businessName}?token=${token}`)))
      .then(res => {
        res.body.error.status.should.be.equal(403)
        done()
      })
  })
})

function createUserAndGetToken (role) {
  return new Company(validCompany).save().then(company => {
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

module.exports = {
  validCompany,
  createUserAndGetToken
}
