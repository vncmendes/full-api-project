import { expect, test, beforeAll, afterAll } from 'vitest'
import requestest from 'supertest'
import { app } from '../src/app'

beforeAll(async () => {
  await app.ready() // the plugins are async function, so we need to 'await' the app finish all to do the tests.
})

afterAll(async () => {
  await app.close() // put out of memory the app after finish tests
})

test('Its possible to create a new transactions?', async () => {
  await requestest(app.server).post('/transactions').send({
    title: 'New Transaction',
    amount: 5000,
    type: 'credit',
  })
  expect(201)
})

test('should be able to list all transactions', async () => {
  const createTransactionsResponse = await requestest(app.server)
    .post('/transactions')
    .send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    })

  const cookies = createTransactionsResponse.get('Set-Cookie')

  const listTransactionsResponse = await requestest(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

  expect(listTransactionsResponse.body.transactions).toEqual([
    expect.objectContaining({
      title: 'New Transaction',
      amount: 5000,
    }),
  ])
})
