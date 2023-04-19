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
const session = require('express-session');
const authRouter = require('./authRoutes/authRoutes');
const fs = require('fs');
let dirPublic = './public';
let dirImagens = './public/imagens'
let dirPerfilAluno = './public/imagens/perfilAluno';

//DB
dbConnect();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: ['https://academia-lanza-aluno.onrender.com', 'https://academia-lanza-admin.onrender.com'],
        // origin: ['http://localhost:3000', 'http://localhost:3001'],
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

// app.use(
//     cookieSession({
//         name: "session",
//         keys: ["thlanza"],
//         maxAge: 24 * 60 * 60 * 100
//     })
// );

// app.use(session({
//     secret: "secret",
//     resave: false ,
//     saveUninitialized: true ,
//     cookie: { secure: true }
// }))


// app.use(passport.initialize());
// app.use(passport.session());

if (!fs.existsSync){
    fs.mkdirSync(dir, { recursive: true });
}



// function makeDir(dir, recursive=false) {
//     if (recursive === false) {
//         if (!fs.existsSync){
//             fs.mkdirSync(dir);
//         }
//     } else {
//         if (!fs.existsSync){
//             fs.mkdirSync(dir, { recursive: true });
//         }
//     }
// }

// makeDir(dirPublic);
// makeDir(dirImagens);
// makeDir(dirPerfilAluno);

app.use('/api/admin', adminRouter);
app.use('/api/modalidades', modalidadeRouter);
app.use('/api/alunos', alunoRouter);
app.use('/auth', authRouter);

//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));