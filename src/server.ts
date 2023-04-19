import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const server = fastify()

server.register(transactionsRoutes, {
  prefix: 'transactions',
}) // lembrar que precisa respeitar a ordem das rotas

server
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running.')
  })
