const express = require('express')
const app = express()
const morgan = require('morgan')

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

const PORT = 3001
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

app.get('/', (req, res) => {
    res.send('<h1>Phonebook server</h2>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
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
    } else if (persons.find(p => p.name === newPerson.name)) {
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
    }
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has 
    info for ${persons.length} people</p>
    <p>${new Date()}</p>`)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})