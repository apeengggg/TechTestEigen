const { Ok, BadRequest, NotFound} = require('../helper/ResponseUtils')
const logger = require('../helper/LoggerUtils')
const moment = require('moment');

const {getAllBooks, checkBorrowBookMember, checkBookAndMemberExists, borrowBook, checkBorrowedBook, returningBook} = require('../models/books');

class BooksController {
    async getAllBooks(req, res) {
        const param = req.query
        try {
            const result = await getAllBooks(param)
            let msg = 'Data found'
            if(result.result.length == 0) {
                msg = 'Data not found'
            }
            Ok(res, msg, result)
        } catch(err) {
            logger.error('BooksController.getAllBooks', err)
            BadRequest(res, "Bad Request")
        }
    }

    async borrowBook(req, res) {
        const param = req.body
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
                if(check.result.length > 0){
                    const data = check.result[0]
                    if(data.member_borrow >= 2){
                        return BadRequest(res, "Member currently already borrow 2 books, member may not borrow more than 2 books")
                    }else{
                        if((param.books.length + data.member_borrow) > 2){
                            return BadRequest(res, `Member currently already borrow ${data.member_borrow} book, member can only borrow ${2-data.member_borrow} more book`)
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
            logger.error('BooksController.borrowBook', err)
            BadRequest(res, "Bad Request")
        }
    }

    async returnBook(req, res) {
        const param = req.body
        try {
            let booked_book = []
            
            for(let i in param.books){
                const check_borrowed_book = await checkBorrowedBook({member_id: param.member_id, book_id: param.books[i].book_id})
                if(check_borrowed_book.result.length == 0){
                    return BadRequest(res, "There are books that are not borrowed by member")
                }else{
                    booked_book.push(check_borrowed_book.result[0])
                }
            }

            let is_being_penalized = false
            let penalized_end = moment().add(7, 'days').format('YYYY-MM-DD')
            
            for(let i in booked_book){
                let return_date = moment(new Date(), 'YYYY-MM-DD')
                let borrow_date = moment(booked_book[i].borrow_start, 'YYYY-MM-DD')

                let diffDays = return_date.diff(borrow_date, 'days');
                let is_penalized = diffDays > 7 ? true : false
                
                let penalized_end = is_penalized ? moment().add(7, 'days').format('YYYY-MM-DD') : null

                if(is_penalized){
                    is_being_penalized = true
                }

                await returningBook({member_id: booked_book[i].member_id, book_id: booked_book[i].book_id, penalized_end: penalized_end, return_date: moment(new Date()).format('YYYY-MM-DD')})
            }

            
            let msg = 'Member Succes Return Book'
            if(is_being_penalized){
                msg += ', Member is currently being penalized until '+ moment(penalized_end).format('DD MMMM YYYY')
            }
            Ok(res, msg, [])
        } catch(err) {
            logger.error('BooksController.returnBook', err)
            BadRequest(res, "Bad Request")
        }
    }
}

module.exports = new BooksController()