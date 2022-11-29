const express = require('express');
require('dotenv').config();
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/error');
const adminRouter = require('./adminRoutes/admins/adminRoute');
const app = express();

//DB
dbConnect();

//Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Admin routes
app.use('/api/admin', adminRouter);

//Aluno routes

//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));