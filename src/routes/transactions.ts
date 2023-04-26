import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkIfSessionIdExists } from '../middlewares/check-if-session-id-exists'

// Cookies <-> são formas da gente manter contexto entre requisições.

export async function transactionsRoutes(server: FastifyInstance) {
  server.addHook('preHandler', async (request, reply) => {
    console.log(`${request.method} ${request.url}`)
  })

  server.get(
    '/',
    {
      preHandler: [checkIfSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    },
  )

  server.get(
    '/:id',
    {
      preHandler: [checkIfSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id, // short sintax -> id: id
        })
        .first()

      return { transaction }
    },
  )

  server.get(
    '/summary',
    {
      preHandler: [checkIfSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' }) // segundo parametro nomeia a coluna do banco.
        .first()

      return { summary }
    },
  )

  server.post(
    '/',
    {
      preHandler: [checkIfSessionIdExists],
    },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })

      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      let sessionId = request.cookies.sessionId
      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      }

      // em rotas de criação geralmente não se faz retornos, usasse os HTTP Codes. (201) etc.
      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      return reply.status(201).send()
    },
  )
}
