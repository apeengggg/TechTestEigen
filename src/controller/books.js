const { Ok, BadRequest, NotFound} = require('../helper/ResponseUtils')
const logger = require('../helper/LoggerUtils')
const moment = require('moment');

const {getAllBooks, checkBorrowBookMember, checkBookAndMemberExists, borrowBook} = require('../models/books');
const { add } = require('winston');

class BooksController {
    async getAllBooks(req, res) {
        const param = req.query
        try {
            const result = await getAllBooks(param)
            console.log("🚀 ~ BooksController ~ getAllBooks ~ result:", result)
            let msg = 'Data found'
            if(result.length == 0) {
                msg = 'Data not found'
            }
            Ok(res, msg, result)
        } catch(err) {
            logger.error('BooksController.getAllBooks', err)
            BadRequest(res, "Bad Request")
        }
    }

    async bookingBook(req, res) {
        const param = req.body
        console.log("🚀 ~ BooksController ~ bookingBook ~ param:", param)
        try {
            if(param.books.length > 2){
                return BadRequest(res, "Member may not borrow more than 2 books")
            }

            const check_member_book = await checkBookAndMemberExists(param)
            if(check_member_book.result.length > 0){
                const data = check_member_book.result[0]
                if(data.member_id == null){
                    return NotFound(res, "Member Not Found")
                }
                for (const obj of check_member_book.result) {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key) && key.startsWith('book_id_')) {
                            if (obj[key] === null) {
                                // any book not found
                                return NotFound(res, "Book Not Found");
                            }
                        }
                    }
                }
            }

            for(let i in param.books){
                const param_check_book = {
                    member_id: param.member_id,
                    book_id: param.books[i].book_id
                }

                const check = await checkBorrowBookMember(param_check_book)
                console.log("🚀 ~ BooksController ~ bookingBook ~ check:", check)
                if(check.result.length > 0){
                    const data = check.result[0]
                    console.log("🚀 ~ BooksController ~ bookingBook ~ data:", data)
                    if(data.member_borrow >= 2){
                        return BadRequest(res, "Member currently already borrow 2 books, member may not borrow more than 2 books")
                    }else{
                        if((param.books.length + data.member_borrow) > 2){
                            return BadRequest(res, `Member currently already borrow ${data.member_borrow}  book, member can only borrow ${2-data.member_borrow} more book `)
                        }
                    }

                    if(data.other_member_borrow > 0){
                        return BadRequest(res, `Book already borrowed`)
                    }

                    if(data.penalized_end != null){
                        const penalized_end = moment(data.penalized_end).format('YYYY-MM-DD')
                        const today = moment().format('YYYY-MM-DD')
                        if (moment(today).isSameOrBefore(penalized_end)) {
                            return BadRequest(res, "Member is currently being penalized until "+ moment(penalized_end).format('DD MMMM YYYY'))
                        }
                    }
                }
            }

            for(let i in param.books){
                await borrowBook({member_id: param.member_id, book_id: param.books[i].book_id, borrow_end: param.books[i].borrow_end})
            }
            let msg = 'Member Succes Borrow Book'
            Ok(res, msg, [])
        } catch(err) {
            logger.error('BooksController.bookingBook', err)
            BadRequest(res, "Bad Request")
        }
    }
}

module.exports = new BooksController()