require('dotenv').config();

const express = require('express');
const BodyParser = require('body-parser');
const cors = require('cors');
const { errors } = require('celebrate');

const routes = require('./src/routes');
const { InfoFilter } = require('./src/middleware/RequestFilter');

const app = express();

app.use(cors());
app.use(BodyParser.json({ limit: '50mb' }));
app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));

// register route filter
app.all('/*', InfoFilter);

// register base path '/'
app.get('/', (req, res) =>
    res.send(`${process.env.APP_NAME}-${process.env.APP_VERSION}`)
);

// register all route under '/api/v1'
app.use('/api/v1', routes);

// register error handler from Joi->Celebrate
app.use(errors());

module.exports = app
