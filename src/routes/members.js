const express = require('express')
const { celebrate } = require('celebrate')

const Controller = require('../controller/members')
const { getAllMembers } = require('../schema/members')

const router = express.Router()

// base route /members
router.get('/all', celebrate({ query: getAllMembers }), Controller.getMemberBorrowedBooks)

module.exports = router