var express = require("express");
var path = require('path');
var validator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var localPassport = require('passport-local').Stratergy;
var flash = require('connect-flash');
var sessionM = require('connect-mongo')(session);
var cookie = require('cookie-parser');
var registerR = require('./routes/register');
//var users = require('./routes/user');

var app = express();
var bodyParser = require("body-parser");
var port = 3030;


app.use(cookie());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({entended: true}));
app.use(express.static(__dirname+"/public"));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(validator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
    res.locals.show = req.user;
    //res.locals.show1 = req.user.name;
    next();
});


/*
app.get("/", function(req, res){
    res.render("landing");
});

app.get("/stories", function(req,res){
    res.render("stories");
});

app.get("/register", function(req,res){
    res.render("register");
});
app.get("/login", function(req,res){
    res.render("login");
});

app.post("/register", function(req,res){
    app.use('/register',users);
});
*/

app.use('/', registerR);
//app.use('/profile', users);

app.listen(port, process.env.IP, function(){
    console.log("Server Started! "+port);
});