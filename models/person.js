const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connection url:', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('MongoDB connection success!')
  })
  .catch((error) => {
    console.log('error! MongoDB connection failed:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
