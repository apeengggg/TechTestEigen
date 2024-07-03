const express = require('express')
const { celebrate } = require('celebrate')

const Controller = require('../controller/books')
const { getAllBooks, borrowBook, returnBook } = require('../schema/books')

const router = express.Router()

// base route /books
router.get('/all', celebrate({ query: getAllBooks }), Controller.getAllBooks)
router.post('/borrow', celebrate({ body: borrowBook }), Controller.borrowBook)
router.post('/return', celebrate({ body: returnBook }), Controller.returnBook)

module.exports = router