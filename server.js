const express = require('express');
require('dotenv').config();
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/error');
const adminRouter = require('./adminRoutes/admins/adminRoute');
const modalidadeRouter = require('./adminRoutes/modalidadeRoutes.js/modalidadeRoute');
const alunoRouter = require('./alunoRoutes/alunos/alunoRoutes');
const app = express();
const passport = require('passport');
const passportSetup = require('./passport');
const cookieSession = require('cookie-session');

//DB
dbConnect();

//Middleware
app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:3000",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);
app.use(
    cookieSession({
        name: "session",
        keys: ["thlanza"],
        maxAge: 24 * 60 * 60 * 100
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/admin', adminRouter);
app.use('/api/modalidades', modalidadeRouter);
app.use('/api/alunos', alunoRouter);



//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));