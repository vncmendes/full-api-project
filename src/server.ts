import fastify from 'fastify'
import { knex } from './database'

const server = fastify()

server.get('/hello', async () => {
  const tables = await knex('sqlite_schema').select('*')

  return tables
})

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running.')
  })
