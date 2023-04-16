const express = require('express');
const passport = require('passport');

const authRouter = express.Router();

//google login
authRouter.get("/login/success", (req, res) => {
    console.log(req);
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


authRouter.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login failure"
    })
});


authRouter.get(
    "/google/callback",
    passport.authenticate("google", { 
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed" 
    }),
);

authRouter.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]}
));

authRouter.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

module.exports = authRouter;