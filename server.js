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

//DB
dbConnect();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: ['https://academia-lanza-aluno.onrender.com', 'https://academia-lanza-admin.onrender.com'],
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

app.use(session({
    secret: "secret",
    resave: false ,
    saveUninitialized: true ,
    cookie: { secure: true }
}))


app.use(passport.initialize());
app.use(passport.session());

// authUser = (request, accessToken, refreshToken, profile, done) => {
//     return done(null, profile);
//   }


// passport.use(new GoogleStrategy({
//     clientID:     process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: `/api/alunos/google/callback`,
//     passReqToCallback   : true,
//     scope: ['profile', 'email']
//   }, authUser));


// passport.serializeUser( (user, done) => { 
//     console.log(`\n--------> Serialize User:`)
//     console.log(user)
 
//     done(null, user)
// } )


// passport.deserializeUser((user, done) => {
//         console.log("\n--------- Deserialized User:")
//         console.log(user)
  
//         done (null, user)
// }) 

app.use('/api/admin', adminRouter);
app.use('/api/modalidades', modalidadeRouter);
app.use('/api/alunos', alunoRouter);
app.use('/auth', authRouter);


//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));