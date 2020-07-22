require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('person', function(req, res) {
    if (req.method === 'POST') {
        const person = {
            name: req.body.name,
            number: req.body.number
        }
        return JSON.stringify(person)
    }
    return ""
})

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
// app.use(morgan('tiny'))
// https://github.com/expressjs/morgan
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.person(req, res)
    ].join(' ')
}))

let persons = [
    { 
        name: "Arto Hellas", 
        number: "040-123456",
        id: 1
      },
      { 
        name: "Ada Lovelace", 
        number: "39-44-5323523",
        id: 2
      },
      { 
        name: "Dan Abramov", 
        number: "12-43-234345",
        id: 3
      },
      { 
        name: "Mary Poppendieck", 
        number: "39-23-6423122",
        id: 4
      }
]

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(people => {
        res.json(people)
    })
    .catch(error => { next(error)})
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else {
                res.status(404).end()
            }
        })
        .catch(error => { next(error)})
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {   
    const newPerson = req.body
    if (!newPerson.name || !newPerson.number) {
        return res.status(400).json({
            error: 'missing name or number'
        })
    } 
    
    const person = new Person({
        name: newPerson.name,
        number: newPerson.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true})
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    Person.find({}).then(result => {
        res.send(`<p>Phonebook has 
        info for ${result.length} people</p>
        <p>${new Date()}</p>`)
    }) 
    .catch(error => { next(error)})  
})

const errorEndpoint = (req, res) => {
    res.status(404).send({ error: 'this endpoint does not exist'})
}

app.use(errorEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    console.error(error.errors)
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id'})
    } else if (error.name = 'ValidationError') {
        if (error.kind === 'unique') {
            return res.status(403).json({ error: error.message })
        } else {
            return res.status(400).json({ error: error.message })
        }
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})