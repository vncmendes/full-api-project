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
