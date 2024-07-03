const logger = require('../helper/LoggerUtils')

const InfoFilter = (req, res, next) => {
    logger.info(`hostname: ${req.hostname}, ip: ${req.ip}`)
    logger.info(`${req.method} ${req.url}`)
    if(JSON.stringify(req.query) != "{}") {
        logger.info(`query param: ${JSON.stringify(req.query)}`)
    }
    next()
}

module.exports = { InfoFilter}