const app = require('./app')
const port = process.env.SERVER_PORT || 3000;
const logger = require('./src/helper/LoggerUtils');

app.listen(port, () => {
    logger.info(`Server started, listening on port ${port}!`);
});
