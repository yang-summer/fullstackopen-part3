const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

morgan.token('data-post', (request) => {
  return JSON.stringify(request.body);
});

const app = express();

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(cors());
app.use(express.json());
app.use((request, response, next) => {
  if (request.method === 'POST') {
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :data-post'
    )(request, response, next);
  } else {
    morgan('tiny')(request, response, next);
  }
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
})

app.get("/info", (request, response) => {
  const stringShowEntries = `<p>Phonebook has info for ${persons.length} people</p>`;
  const stringShowTime = `<p>${new Date()}</p>`;
  response.send(stringShowEntries + stringShowTime);
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
})

const generateId = () => {
  const idRange = Math.pow(2, 32);
  let newId;
  do {
    newId = Math.floor(Math.random() * idRange);
  } while (persons.some(person => person.id === String(newId)));

  return String(newId);
}

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if ((!body.name) || (!body.number)) {
    return response.status(400).json({
      error: 'name and number can not be empty'
    })
  }

  if (persons.some(person => person.name === String(body.name))) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: String(body.name),
    number: String(body.number),
  }

  persons = persons.concat(person)

  response.json(person);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})