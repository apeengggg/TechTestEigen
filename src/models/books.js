const { db, getTotalRows } = require('../helper/DBUtils')

const getAllBooks = async (param) => {

    let queryParams = []

    let query = 
        ' SELECT ' + 
        '   b.book_id, b.book_code, b.book_title, b.book_author, b.book_stock - COALESCE (rb.borrowed_count, 0) AS "availabel_stock" ' +
        ' FROM ' + 
        '   tb_m_books b ' + 
        ' LEFT JOIN ' +  
        '   ( ' +
        '       SELECT book_id, COUnt(*) as "borrowed_count" ' +
        '       FROM ' +
        '       tb_r_booked_books ' +
        '       WHERE return_date IS NULL ' +
        '       GROUP BY book_id ' +
        '   ) rb ' +
        ' ON b.book_id = rb.book_id ' +
        ' WHERE 1=1 '

    // dynamic condition and parameters
    if(param.book_code && param.book_code != "") {
        queryParams.push(param.book_code.toLowerCase())
        query = query + ` AND lower(b.book_code) = $${queryParams.length} `        
    }

    if(param.book_title && param.book_title != "") {
        queryParams.push(param.book_title.toLowerCase())
        query = query + ` AND lower(b.book_title) = $${queryParams.length} `        
    }

    if(param.book_author && param.book_author != "") {
        queryParams.push(param.book_author.toLowerCase())
        query = query + ` AND lower(b.book_author) = $${queryParams.length} `        
    }

    console.log('query', query)


    // query = query + 'GROUP BY m.member_id, m.member_name '

    // dynamic order
    if(param.order_by && param.order_by != "") {
        let dir = 'asc'
        if(param.order_dir && (param.order_dir == "asc" || param.order_dir == 'desc')) {
            dir = param.order_dir
        }

        query = query + ` ORDER BY "${param.order_by}" ${dir} `
    } else {
        query = query + ` ORDER BY b.book_id ASC `
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

    console.log('query', query)
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

module.exports = { getAllBooks }