import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import isAuth from './middleware/is-auth'
import { ApolloServer } from 'apollo-server-express'
import { graphqlUploadExpress } from 'graphql-upload'
import path from 'path'
import { resolvers } from './graphql/resolvers'
import cors from 'cors'
import buildSchema from './graphql/schema'

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const port = parseInt(process.env.PORT) || 4000
console.log(port)
if (!port) {
  throw new Error(
    'The PORT environment variable is required but was not specified.'
  )
}
app.set('port', port) // app.get('port')
app.set('view engine', 'ejs')
app.set('views', './src/views')

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

app.set('view engine', 'ejs')
app.set('views', './src/views')

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
const CORS_ALLOW_ALL = Boolean(process.env.CORS_ALLOW_ALL)

console.log('CORS_ALLOW_ALL:', CORS_ALLOW_ALL)

app.get('/home', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  res.render('home', { persons: persons })
})

app.get('/hello', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  return res.json({ message: 'Hello World!' })
})

app.get('/test', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  return res.send('<p>Test page.</p>')
})

app.get('/libraries', cors(CORS_ALLOW_ALL ? null : corsOptions), (req, res) => {
  return res.json(resolvers.Query.libraries())
})

app.use(graphqlUploadExpress())

app.use('*', isAuth)

const server = new ApolloServer({
  typeDefs: buildSchema,
  resolvers,
  playground: true,
  debug: true,
  introspection: true,
  cors: {
    credentials: true,
    allowedHeaders: '',
    origin: '*'
  },
  context: ({ req, res }) => ({ req, res })
})

server
  .start()
  .then(() => {
    server.applyMiddleware({ app, path: '/graphql' })
  })
  .catch((err) => {
    console.log(err)
  })

if (!process.env.MONGO_DB_CONNECTION_STRING_PROD) {
  throw new Error(
    'The MONGO_DB_CONNECTION_STRING environment variable is required but was not specified.'
  )
}

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING_PROD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    app.listen({ port }, '0.0.0.0', () => {
      console.log(
        `🚀 Server ready at https://api-mockup-jcs.herokuapp.com/${
          server.graphqlPath
        } (${new Date().toLocaleString()})`
      )
    })
  })
  .catch((err) => {
    console.log(err)
  })
  