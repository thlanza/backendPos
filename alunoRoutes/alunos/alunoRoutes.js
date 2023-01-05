const express = require('express');
const { matricular, seedAlunos, getAlunos, deletarColecaoAlunos } = require('../../alunoControllers/alunos/alunoController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');
const passport = require("passport");

const alunoRouter = express.Router();


alunoRouter.get('/', getAlunos);
alunoRouter.post('/matricular', 
    photoUpload.single('image'), 
    redimensionar('public/imagens/perfilAluno'), 
    matricular);

alunoRouter.post('/seedAlunos', seedAlunos);
alunoRouter.delete('/deletarColecaoAlunos', deletarColecaoAlunos);

//google login
alunoRouter.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Successfully logged in",
            user: req.user
        })
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" })
    }
});


alunoRouter.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login failure"
    })
});


alunoRouter.get(
    "/google/callback",
    passport.authenticate("google", { 
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed" 
    }),
);

alunoRouter.get("/google", passport.authenticate("google", ["profile", "email"]));

alunoRouter.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

module.exports = alunoRouter;