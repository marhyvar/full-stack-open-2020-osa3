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
app.use(express.static('build'))

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

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
    //res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {   
    const newPerson = req.body
    console.log('body', req.body)
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
    /*else if (persons.find(p => p.name === newPerson.name)) {
        return res.status(403).json({
            error: 'name must be unique'
        })
    } else {
        let randomId
        do {
            randomId = Math.floor(Math.random()*1000000)
        } while (persons.find(p => p.id === randomId))
        newPerson.id = randomId
        persons = persons.concat(newPerson)
        res.json(newPerson)
    }*/
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has 
    info for ${persons.length} people</p>
    <p>${new Date()}</p>`)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})