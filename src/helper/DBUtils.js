
const logger = require('./LoggerUtils');
const pgp = require('pg-promise')({
    schema: ['public']
})

const opt = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
}
// console.log("DB connection String:", JSON.stringify(opt))

const db = pgp(opt)
db.connect()
    .then(obj => {
        obj.done(); // success
        logger.info('Database connected successfully');
    })
    .catch(error => {
        logger.error('Error connecting to database:', error.message);
    });

const getTotalRows = async (innerQuery, queryParams, dbParam) => {
    let countQuery = 
        ' SELECT count(1) ' +
        ' FROM ( ' + innerQuery + ' ) A '
    let totalRows = { count: 0 }
    if(dbParam) {
        totalRows = await dbParam.one(countQuery, queryParams)        
    } else {
        totalRows = await db.one(countQuery, queryParams)        
    }
    return totalRows.count
}

module.exports = { db, getTotalRows }