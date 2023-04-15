const express = require('express');
const { 
    matricular, 
    seedAlunos, 
    getAlunos, 
    deletarColecaoAlunos, 
    matricularGoogle, 
    logar, 
    deletarAluno,
    pdfDownload,
    cancelarInscricao
} = require('../../alunoControllers/alunos/alunoController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');
const passport = require("passport");
const validarMongoId = require('../../utils/validarMongoId');
const cors = require('cors');

const alunoRouter = express.Router();


alunoRouter.get('/', getAlunos);
alunoRouter.delete('/aluno/:id', validarMongoId, deletarAluno);
alunoRouter.post('/matricular', 
    photoUpload.single('image'), 
    redimensionar('public/imagens/perfilAluno'), 
    matricular);

alunoRouter.post('/logar', logar);

alunoRouter.post('/matricularGoogle', matricularGoogle)

alunoRouter.post('/seedAlunos', seedAlunos);
alunoRouter.delete('/deletarColecaoAlunos', deletarColecaoAlunos);
alunoRouter.delete('/cancelarInscricao', authMiddleware('usuario'), cancelarInscricao);

//google login
alunoRouter.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Logado com sucesso",
            user: req.user
        })
    } else {
        res.status(403).json({ error: true, message: "Não Autorizado" })
    }
});


alunoRouter.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login failure"
    })
});


alunoRouter.get(
    "auth/google/callback",
    passport.authenticate("google", { 
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed" 
    }),
);

alunoRouter.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]}
));

alunoRouter.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

alunoRouter.get('/download', 
cors({
    exposedHeaders: ['Content-Disposition']
}), pdfDownload);

module.exports = alunoRouter;