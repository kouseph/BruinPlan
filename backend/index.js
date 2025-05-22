import http, { ServerResponse } from "http";
import express from "express";
import session from "express-session";
import connectDB from './config/db.js';
import './config/auth.js'; // sets up Google Oauth
import passport from 'passport';
import course from './models/course.js';

const hostname = "127.0.0.1"; // or 'localhost'
const port = 3000;
const server = express();

//connects to db then populates the db with courses
connectDB().then(async () => {
  const testCourse = new course({
    name: 'Test Course',
    time: '12:00 PM - 1:15 PM',
  });

  await testCourse.save();
  console.log('✅ Test course inserted into DB');
});


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

server.get('/google/callback',
  passport.authenticate('google',{
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
  })
)

server.get('/protected', isLoggedIn, (req,res) => { // route once logged in
  res.send('<a href="/logout">LogOut</a>');
})

server.get('/auth/failure', (req,res) => { // route once logged in
  res.send("Something Went Wrong");
})

server.get('/logout', (req, res, next) => {
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

