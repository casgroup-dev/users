const populate = require('./populate')

populate().then(() => {
  console.log('Ready, database populated.')
  process.exit()
})
