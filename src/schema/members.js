const { Joi } = require('celebrate')

const getAllMembers = Joi.object().keys({
    member_code: Joi.string().allow("").max(60).optional(),
    member_name: Joi.string().allow("").max(60).optional(),
    order_by: Joi.string().allow("").max(20).optional(),
    order_dir: Joi.string().allow("").max(3).optional(),
    per_page: Joi.number().allow("", null).optional(),
    page: Joi.number().allow("", null).optional()
}).unknown(true)

module.exports = { 
    getAllMembers
}