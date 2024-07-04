const request = require('supertest')
const app = require('../app')
const {db} = require('../src/helper/DBUtils')
const moment = require('moment')

beforeEach(async () => {
  await db.query('BEGIN')
  console.log('PING')
})

afterEach(async () => {
  await db.query('ROLLBACK')
  console.log('PONG')
})

describe('/books', () => {
  describe('/all', () => {
    test('returning data books', async () => {
      const res = await request(app).get('/api/v1/books/all?order_by=book_id&order_dir=asc&per_page=10&page=1')
      const data = res._body
      expect(data.statusCode).toEqual(200)
      expect(data.message).toEqual('Data found')
      expect(data.data).toEqual({page: expect.any(Number), perPage: expect.any(Number), totalRows: expect.any(Number), totalPages: expect.any(Number), result: expect.any(Array)})
    })
  
    test('returning not found book', async () => {
      const res = await request(app).get('/api/v1/books/all?order_by=book_id&order_dir=asc&per_page=10&page=1&book_title=notfound')
      const result = res._body
      expect(result.statusCode).toEqual(200)
      expect(result.message).toEqual('Data not found')
      expect(result.data.totalPages).toEqual(0)
      expect(result.data.totalRows).toEqual(0)
      expect(result.data.result.length).toEqual(0)
    })
  })
  
  describe('/borrow', () => {
    test('borrowing book but member not found', async () => {
      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 10,
        "books": [
          {
            "book_id": 4
          }
        ]
      })
      
      const result = res._body
      // console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(404)
      expect(result.message).toEqual('Member Not Found')
      expect(result.error).toEqual('Not Found')
    })

    test('borrowing book but book not found', async () => {
      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 10
          }
        ]
      })
      
      const result = res._body
      // console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(404)
      expect(result.message).toEqual('Book Not Found')
      expect(result.error).toEqual('Not Found')
    })

    test('borrowing more than 2 books', async () => {
      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          },
          {
            "book_id": 2,
          },
          {
            "book_id": 3,
          }
        ]
      })
      
      const result = res._body
      // console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('Member may not borrow more than 2 books')
      expect(result.error).toEqual('Bad Request')
    })

    test('member currently borrowing 2 books, member borrowing more book', async () => {
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (1,1, now()),
      (1,2, now())
      `
      await db.query(query)

      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 4,
          }
        ]
      })
      
      const result = res._body
      console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('Member currently already borrow 2 books, member may not borrow more than 2 books')
      expect(result.error).toEqual('Bad Request')
    })

    test('member currently borrowing 1 book, member borrowing 2 books more', async () => {
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (1,1, now())
      `
      await db.query(query)

      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 4,
          },
          {
            "book_id": 2,
          }
        ]
      })
      
      const result = res._body
      console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('Member currently already borrow 1 book, member can only borrow 1 more book')
      expect(result.error).toEqual('Bad Request')
    })

    test('other member currently borrow book with id 1, member borrowing book with id 1', async () => {
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (2,1, now())
      `
      await db.query(query)

      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          },
          {
            "book_id": 2,
          }
        ]
      })
      
      const result = res._body
      console.log("🚀 ~ test ~ result:", result)
      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('Book already borrowed')
      expect(result.error).toEqual('Bad Request')
    })

    test('member cannot borrow book beacuse member currently being penalized', async () => {
      let query = `
      UPDATE tb_m_members set penalized_end = now() where member_id = 1
      `
      await db.query(query)

      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          }
        ]
      })
      
      const result = res._body
      let today = moment().format('DD MMMM YYYY')

      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('Member is currently being penalized until '+today)
      expect(result.error).toEqual('Bad Request')
    })

    test('member success borrowing book', async () => {
      const res = await request(app).post('/api/v1/books/borrow').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          },
          {
            "book_id": 2,
          }
        ]
      })
      
      const result = res._body

      expect(result.statusCode).toEqual(200)
      expect(result.message).toEqual('Member Succes Borrow Book')
    })
  })

  describe('/return', () => {

    test('member success returning book', async () => {
      let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (1,1, '${yesterday}')
      `

      await db.query(query)

      const res = await request(app).post('/api/v1/books/return').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          }
        ]
      })
      
      const result = res._body

      expect(result.statusCode).toEqual(200)
      expect(result.message).toEqual('Member Succes Return Book')
    })

    test('member returns a book that he did not borrow', async () => {
      let yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (1,2, '${yesterday}')
      `

      await db.query(query)

      const res = await request(app).post('/api/v1/books/return').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 1,
          }
        ]
      })
      
      const result = res._body

      expect(result.statusCode).toEqual(400)
      expect(result.message).toEqual('There are books that are not borrowed by member')
      expect(result.error).toEqual('Bad Request')
    })

    test('members return book more than 7 days ', async () => {
      let borrowed_day = moment().subtract(8, 'days').format('YYYY-MM-DD')
      let query = `
      INSERT INTO tb_r_borrow_books (member_id, book_id, borrow_start) 
      VALUES
      (1,2, '${borrowed_day}')
      `

      await db.query(query)

      const res = await request(app).post('/api/v1/books/return').send({
        "member_id" : 1,
        "books": [
          {
            "book_id": 2,
          }
        ]
      })
      
      const result = res._body
      console.log("🚀 ~ test ~ result:", result)

      expect(result.statusCode).toEqual(200)
      expect(result.message).toEqual('Member Succes Return Book, Member is currently being penalized until '+ moment().add(7, 'days').format('DD MMMM YYYY'))
    })
  })
})