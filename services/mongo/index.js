// Requerir el paquete
const mongoose = require('mongoose')
// conectarse a la db

mongoose.connect(`${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}`);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => console.log('MongoDB connected.'))


// exportar el cliente
module.exports = mongoose