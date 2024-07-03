const { db, getTotalRows } = require('../helper/DBUtils')

const getAllMemberBorrowBooks = async (param) => {

    let queryParams = []

    let query = 
        ' SELECT ' + 
        '   m.member_id, m.member_code, m.member_name ' +
        '   ,count(bb.borrow_id) as "borrowed_books" ' +
        ' FROM ' + 
        '   tb_m_members m ' + 
        ' LEFT JOIN ' +  
        '   tb_r_borrow_books bb ON m.member_id = bb.member_id ' +
        ' WHERE 1=1 and bb.return_date is null '

    // dynamic condition and parameters
    if(param.member_code && param.member_code != "") {
        queryParams.push(param.member_code)
        query = query + ` AND m.member_code = $${queryParams.length} `        
    }

    if(param.member_name && param.member_name != "") {
        queryParams.push(param.member_name.toLowerCase())
        query = query + ` AND lower(m.member_name) = $${queryParams.length} `        
    }

    query = query + 'GROUP BY m.member_id, m.member_name '

    // dynamic order
    if(param.order_by && param.order_by != "") {
        let dir = 'asc'
        if(param.order_dir && (param.order_dir == "asc" || param.order_dir == 'desc')) {
            dir = param.order_dir
        }

        query = query + ` ORDER BY "${param.order_by}" ${dir} `
    } else {
        query = query + ` ORDER BY m.member_id ASC `
    }

    // get total rows
    let totalRows = await getTotalRows(query, queryParams)
    // console.log('total rows', totalRows)

    // limit and paging and such
    let limit = 10
    if(param.per_page && param.per_page != "") {
        limit = param.per_page
    }
    
    let offset = 0
    if(param.page && param.page != "") {
        offset = limit * (param.page - 1)
    }

    query = query + ` LIMIT ${limit} OFFSET ${offset} `    

    // console.log('query', query)
    // console.log('query params', queryParams)
    
    const result = await db.manyOrNone(query, queryParams)

    let totalPages = Math.ceil(totalRows / param.per_page)

    return { page: param.page, 
        perPage: param.per_page,
        totalRows,        
        totalPages,
        result, 
    }    
}

module.exports = { getAllMemberBorrowBooks }