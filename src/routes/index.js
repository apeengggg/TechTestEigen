const { Router } = require('express');

const routes = Router();
routes.use('/members', require('./members'));
routes.use('/books', require('./books'));

module.exports = routes;
