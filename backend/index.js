// index.js
import http, { ServerResponse } from "http";
import express from "express";
import session from "express-session";
import './auth.js'
import { appendFile } from "fs";
import passport from "passport";

const hostname = "127.0.0.1"; // or 'localhost'
const port = 3000;
const server = express();

server.use(session({secret: process.env.SECRET})); 
server.use(passport.initialize());
server.use(passport.session());

function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401);
}
server.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

server.get('/auth/google',
  passport.authenticate('google', { scope: ['email','profile']})
)

server.get('/google/callback',
  passport.authenticate('google',{
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
  })
)

server.get('/auth/google', (req, res) => {
  res.statusCode = 200; // HTTP status OK
  res.setHeader("Content-Type", "text/plain");
  res.send('You clicked the Google Auth link!');
});

server.get('/protected', isLoggedIn, (req,res) => { // route once logged in
  res.send("Success");
})

server.get('/auth/failure', (req,res) => { // route once logged in
  res.send("Something Went Wrong");
})

server.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

