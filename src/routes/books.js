const express = require('express')
const { celebrate } = require('celebrate')

const Controller = require('../controller/books')
const { getAllBooks } = require('../schema/books')

const router = express.Router()

// base route /books
router.get('/all', celebrate({ query: getAllBooks }), Controller.getAllBooks)

module.exports = router