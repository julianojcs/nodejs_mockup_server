// require('dotenv').config()
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'

const port = parseInt(process.env.PORT)

if (!process.env.port) {
  throw new Error(
    'The PORT environment variable is required but was not specified.'
  )
}

const persons = []
if (!process.env.NAMES || !process.env.AGES) {
  throw new Error(
    'The NAMES and AGES environment variable is required but was not specified.'
  )
} else {
  process.env.NAMES.split(' ').forEach((name) => persons.push({ name }))
  process.env.AGES.split(' ').forEach(
    (age, index) => (persons[index].age = parseInt(age))
  )
}

console.log(persons)

const app = express()
app.set('view engine', 'ejs')
app.set('views', './views')

const whitelist =
  process.env.CORS_WHITELIST.split(' ')[0] !== ''
    ? process.env.CORS_WHITELIST.split(' ')
    : []
console.log(whitelist)

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
const CORS_ALLOW_ALL = !!process.env.CORS_ALLOW_ALL

app.get('/home', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  res.render('home', { persons: persons })
})

app.get('/hello', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  return res.json({ message: 'Hello World!' })
})

app.get('/test', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  return res.send('<p>Test page.</p>')
})

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.listen({ port }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}/home (${new Date().toLocaleString()})`
  )
})
