const { Router } = require('express');

const routes = Router();
routes.use('/members', require('./members'));

module.exports = routes;
