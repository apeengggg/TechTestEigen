const { Ok, BadRequest} = require('../helper/ResponseUtils')
const logger = require('../helper/LoggerUtils')

const {getAllBooks} = require('../models/books')

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
}

module.exports = new BooksController()