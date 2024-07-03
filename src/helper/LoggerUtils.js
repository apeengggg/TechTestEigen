const winston = require('winston')
const moment = require('moment')

const logFormat = winston.format.combine(
    winston.format.label({ label: '[my-label]' }),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
)

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: logFormat,
    transports: []
})

var CURRENT_DATE = ''
const getCurrentDate = () => {
    return `${moment().format('YYYYMMDD')}`
}

const initTransport = (dateString) => {
    if(process.env.ENV != 'prod') {
        logger.add(new winston.transports.Console({ format: logFormat }))
    } else {    
        logger.add(new winston.transports.File({ filename: `./logs/${dateString}.error.log`, level: 'error' }))
        logger.add(new winston.transports.File({ filename: `./logs/${dateString}.log` }))
    }
}

initTransport(getCurrentDate())

const rotate = () => {
    if(process.env.ENV == 'prod') {
        let date = getCurrentDate()
        if(CURRENT_DATE != date) {
            logger.clear()
            initTransport(date)
            CURRENT_DATE = date
        }
    }
}

class LoggerUtil {
    info(message) {
        rotate()
        logger.info(message)
    }
    error(message, error) {
        rotate()
        logger.error(`${message} - ${error.stack}`)
    }
    test() {
        rotate()
    }
}

module.exports = new LoggerUtil()