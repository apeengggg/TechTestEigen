const { Ok, BadRequest} = require('../helper/ResponseUtils')
const logger = require('../helper/LoggerUtils')

const {getAllMemberBorrowBooks} = require('../models/members')

class MembersControllser {
    async getMemberBorrowedBooks(req, res) {
        const param = req.query
        try {
            const result = await getAllMemberBorrowBooks(param)
            let msg = 'Data found'
            if(result.result.length == 0) {
                msg = 'Data not found'
            }
            Ok(res, msg, result)
        } catch(err) {
            logger.error('MembersController.getMemberBorrowedBook', err)
            BadRequest(res, "Bad Request")
        }
    }
}

module.exports = new MembersControllser()