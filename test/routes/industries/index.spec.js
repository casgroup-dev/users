/* global describe it afterEach beforeEach */
/**
 *  INDUSTRIES TESTS: The database must be populated, run 'npm run populateIndustries'
 */
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const {roles} = require('../../../models')
const {createUserAndGetToken} = require('../companies/index.spec')
const populateIndustries = require('../../../scripts/industries/populate')
const fs = require('fs')
const rawIndustriesCategories = JSON.parse(fs.readFileSync('./scripts/industries/industries.json'))

chai.use(chaiHttp)
chai.should()

const databaseCleaner = new DatabaseCleaner('mongodb')
const endpoint = '/api/industries'

describe('INDUSTRIES', () => {
  beforeEach(done => { populateIndustries().then(done) })
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should not get the industries without a token', done => {
    chai.request(app).get(endpoint).then(res => {
      res.body.should.have.property('error')
      res.body.error.status.should.be.equal(403)
      done()
    })
  })
  // TODO refactor test
  /* it('Should get a json with the categories that each on has an array with the industries', done => {
    createUserAndGetToken(roles.shadowUser)
      .then(token => chai.request(app).get(endpoint + `?token=${token}`))
      .then(res => {
        const capitalize = string => string.charAt(0) + string.slice(1).toLowerCase()
        let category
        let name
        rawIndustriesCategories.map(industry => {
          category = capitalize(industry.category)
          res.body.should.have.property(category)
          industry.industries.map(industry => {
            name = capitalize(industry.name)
            res.body[category].should.have.property(name)
            res.body[category][capitalize(name)].should.be.equal(Number(industry.code))
          })
        })
        done()
      })
  }) */
})
