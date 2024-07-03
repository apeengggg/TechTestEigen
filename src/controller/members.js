const { Ok, BadRequest} = require('../helper/ResponseUtils')
const logger = require('../helper/LoggerUtils')

const {getAllMemberBookedBooks} = require('../models/members')

class MembersControllser {
    async getMemberBorrowedBooks(req, res) {
        const param = req.query
        try {
            const result = await getAllMemberBookedBooks(param)
            console.log("🚀 ~ MembersControllser ~ getMemberBorrowedBooks ~ result:", result)
            let msg = 'Data found'
            if(result.length == 0) {
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