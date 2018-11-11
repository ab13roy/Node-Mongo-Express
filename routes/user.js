var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('passportapp',['users']);
var bcryptPwd = require('bcryptjs');
var passport = require('passport');
var strategy = require('passport-local').Strategy;

router.get('/login', function(req, res){
	res.render('login');
});

router.get('/register', function(req, res){
	res.send('register');
});

router.post('/register', function(req, res){
   console.log('adding users');
});

router.get('/profile', ensureAuthenticated, function(req, res){
	res.render('profile');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

module.exports = router;