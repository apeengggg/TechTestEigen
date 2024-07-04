const request = require('supertest')
const app = require('../app')
const {db} = require('../src/helper/DBUtils')

describe('/members', () => {
  test('/all with returning data members', async () => {
    const res = await request(app).get('/api/v1/members/all?page=1&per_page=5&order_by=member_id&order_dir=asc')
    const data = res._body
    expect(data.statusCode).toEqual(200)
    expect(data.message).toEqual('Data found')
    expect(data.data).toEqual({page: expect.any(Number), perPage: expect.any(Number), totalRows: expect.any(Number), totalPages: expect.any(Number), result: expect.any(Array)})
  })

  test('/all with returning not found members', async () => {
    const res = await request(app).get('/api/v1/members/all?page=1&per_page=5&order_by=member_id&order_dir=asc&member_name=notfound')
    const result = res._body
    expect(result.statusCode).toEqual(200)
    expect(result.message).toEqual('Data not found')
    expect(result.data.totalPages).toEqual(0)
    expect(result.data.totalRows).toEqual(0)
    expect(result.data.result.length).toEqual(0)
  })
})