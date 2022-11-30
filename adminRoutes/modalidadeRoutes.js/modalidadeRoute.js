const express = require('express');
const { criarModalidade } = require('../../adminControllers/modalidadeControllers.js/modalidadeController');

const modalidadeRouter = express.Router();

modalidadeRouter.post('/', criarModalidade);

module.exports = modalidadeRouter;