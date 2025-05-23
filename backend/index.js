import http, { ServerResponse } from "http";
import express from "express";
import session from "express-session";
import connectDB from './config/db.js';
import './config/auth.js'; 
import passport from 'passport';
import course from './models/course.js';

const hostname = "127.0.0.1"; // or 'localhost'
const port = 3000;
const server = express();

//connects to db then populates the db with courses
connectDB();


//intializes session for server 
server.use(session({secret: process.env.SECRET})); 
server.use(passport.initialize());
server.use(passport.session());

//logic for routes loggin in and loggin out
function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401);
}
server.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

server.get('/auth/google',
  passport.authenticate('google', { scope: ['email','profile']})
)

server.get('/google/callback', // starting route to authenticate
  passport.authenticate('google',{
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
  })
)

server.get('/protected', isLoggedIn, (req,res) => { // route once logged in
  res.send('<a href="/logout">LogOut</a>');
})

server.get('/auth/failure', (req,res) => { // route failure
  res.send("Something Went Wrong");
})

server.get('/logout', (req, res, next) => { //route to log out
  req.logout(function(err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }

      res.clearCookie('connect.sid'); // clears the session cookie
      res.redirect('/');
    });
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

