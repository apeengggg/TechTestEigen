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
        '       tb_r_borrow_books ' +
        '       WHERE borrow_end IS NULL ' +
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

    // console.log('query', query)
    // console.log('query params', queryParams)
    
    const result = await db.query(query, queryParams)

    let totalPages = Math.ceil(totalRows / param.per_page)

    return { page: param.page, 
        perPage: param.per_page,
        totalRows,        
        totalPages,
        result, 
    }    
}

const checkBorrowBookMember = async (param) => {
console.log("🚀 ~ checkBorrowBookMember ~ param:", param)

    let queryParams = []

    queryParams.push(param.book_id)

    let select_query = 
    ' SELECT ' + 
    ' m.member_id, m.penalized_end, b.book_title, ' +
    ' CAST(( ' + 
    '   SELECT COUNT(book_id) FROM ' + 
    '   tb_r_borrow_books bb ' +  
    '   LEFT JOIN tb_m_members m2 ON bb.member_id = m2.member_id WHERE ' +
    '   bb.borrow_end IS NULL AND m2.member_id = m.member_id ' +
    ' ) AS INT) as member_borrow, ' +
    ' CAST(( ' +
    '   SELECT COUNT(book_id) FROM ' +
    '   tb_r_borrow_books bb1' +
    '   LEFT JOIN tb_m_members m3 ON bb1.member_id = m3.member_id WHERE ' +
    `   bb1.borrow_end IS NULL AND m3.member_id IS NOT NULL `
    
    queryParams.push(param.member_id)
    select_query = select_query + ` AND (m3.member_id <> m.member_id OR m3.member_id = $${queryParams.length})`
    
    queryParams.push(param.book_id)
    select_query = select_query + ` AND bb1.book_id = $${queryParams.length} `
    
    select_query = select_query + ' ) AS INT) as other_member_borrow ' +
    ' FROM tb_m_members m ' +
    ' LEFT JOIN tb_r_borrow_books bb2  ' +
    ' ON m.member_id = bb2.member_id  ' +
    ' LEFT JOIN tb_m_books b  ' +
    ' ON bb2.book_id = b.book_id  ' +
    ' WHERE 1=1'

    queryParams.push(param.member_id)
    select_query = select_query + ` AND m.member_id = $${queryParams.length}`


    let query = select_query
    // dynamic condition and parameters

    console.log('query', query)
    // console.log('queryParams', queryParams)
    
    const result = await db.query(query, queryParams)
    return { 
        result
    }    
}

const checkBookAndMemberExists = async (param) => {

    let queryParams = []
    let query = 'SELECT '
    queryParams.push(param.member_id)
    query = query + `(SELECT member_id FROM tb_m_members WHERE member_id = $${queryParams.length}) as member_id`
    for(let i in param.books){
        queryParams.push(param.books[i].book_id)
        query = query + ` ,(SELECT book_id FROM tb_m_books WHERE book_id = $${queryParams.length}) as book_id_${i} `

    }
    // dynamic condition and parameters

    // console.log('query', query)
    // console.log('queryParams', queryParams)
    
    const result = await db.query(query, queryParams)
    return { 
        result
    }    
}

const borrowBook = async (param) => {
    
    let query =
    ' INSERT INTO tb_r_borrow_books (' 
    + '   member_id, book_id '
    + '   ) VALUES ' 
    + '('
    + '   ${member_id}, '
    + '   ${book_id} '
    + ')';
    
    // console.log("🚀 ~ borrowBook ~ query:", query)

    await db.none(query, param);
}

const returningBook = async (param) => {
    console.log("🚀 ~ returningBook ~ param:", param)
    
    let paramsQuery = []
    let query = 'UPDATE tb_r_borrow_books ' + 
    'SET borrow_end = ${return_date} ' +
    'WHERE member_id = ${member_id} ' +
    'AND book_id = ${book_id} ' +
    'AND borrow_end IS NULL '
    // console.log("🚀 ~ returningBook ~ paramsQuery:", paramsQuery)

    // console.log("🚀 ~ returningBook ~ query:", query)

    await db.none(query, param);
    
    if(param.penalized_end != null){
        query = 'UPDATE tb_m_members SET penalized_end = ${penalized_end} WHERE member_id = ${member_id}'
        await db.none(query, param);
    }
}

const checkBorrowedBook = async (param) => {
    let queryParams = []
    let query = 'SELECT bb.book_id, bb.borrow_start, b.book_title, bb.member_id ' +
    'FROM tb_r_borrow_books bb ' +
    'LEFT JOIN tb_m_members m on bb.member_id = m.member_id ' +
    'LEFT JOIN tb_m_books b on bb.book_id = b.book_id '

    queryParams.push(param.member_id)
    query = query + `WHERE m.member_id = $${queryParams.length} ` 

    queryParams.push(param.book_id)
    query = query + `AND bb.book_id = $${queryParams.length} and bb.borrow_end is null`
    
    const result = await db.query(query, queryParams)
    return { 
        result
    }    
}

module.exports = { getAllBooks, checkBorrowBookMember, checkBookAndMemberExists, borrowBook, checkBorrowedBook, returningBook }