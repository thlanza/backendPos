const express = require('express');
require('dotenv').config();
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/error');
const adminRouter = require('./adminRoutes/admins/adminRoute');
const modalidadeRouter = require('./adminRoutes/modalidadeRoutes.js/modalidadeRoute');
const alunoRouter = require('./alunoRoutes/alunos/alunoRoutes');
const app = express();
const estatisticaRouter = require('./estatisticaRouter/estatisticaRouter');
const { limparDir } = require('./utils/limparDir');


//DB
require('./config/dbConnect');

limparDir();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: '*'
	})
);


app.use('/api/admin', adminRouter);
app.use('/api/modalidades', modalidadeRouter);
app.use('/api/alunos', alunoRouter);
app.use('/api/estatisticas', estatisticaRouter)

//error handlers
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;