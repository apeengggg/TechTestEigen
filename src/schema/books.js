const { Joi } = require('celebrate')

const getAllBooks = Joi.object().keys({
    book_code: Joi.string().allow("").max(10).optional(),
    book_title: Joi.string().allow("").max(100).optional(),
    book_author: Joi.string().allow("").max(100).optional(),
    order_by: Joi.string().allow("").max(10).optional(),
    order_dir: Joi.string().allow("").max(3).optional(),
    per_page: Joi.number().allow("", null).optional(),
    page: Joi.number().allow("", null).optional()
}).unknown(true)

module.exports = { 
    getAllBooks
}