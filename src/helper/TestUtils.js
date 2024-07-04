const {db} =require('./DBUtils')

async function dbBeforeAll(){

}

async function dbBeforeEach(){
    await db.query("BEGIN");
}

async function dbAfterEach(){
    await db.query("ROLLBACK");
}

module.exports = {dbBeforeAll, dbBeforeEach, dbAfterEach}