const Router = require('express').Router;
const routes = new Router();

// Controllers
const uploadController = require('../controllers/upload.controller');


routes.post('/urltrack', uploadController.urltrack);

module.exports = routes;