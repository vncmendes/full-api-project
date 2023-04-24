import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import { fastifyCookie } from '@fastify/cookie'

const server = fastify()

server.register(fastifyCookie)
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
