/**
 * This file reads a json file generated with industries_parser.py and populates database
 */

require('dotenv').config({'path': '../.env'})
const {Industry, IndustryCategory} = require('../models')

const file = require('./industries')

file.map(function (industryCategory) {
  const industryCategoryEntry = new IndustryCategory({'name': industryCategory['category']})
  industryCategoryEntry.save()
  industryCategory['industries'].map(function (industry) {
    const industryEntry = new Industry({
      'code': industry['code'],
      'name': industry['name'],
      'category': industryCategoryEntry.id
    })
    industryEntry.save()
  })
})

// console.log('Done')
