var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('passportapp',['users']);
var bcryptPwd = require('bcryptjs');
var passport = require('passport');
var strategy = require('passport-local').Strategy;

router.get('/', function(req, res){
    res.render('landing');
});

router.get('/stories', function(req, res){
    res.render('stories');
});

router.get('/register', function(req, res){
    res.render('register');
});

router.get('/login', function(req, res){
    res.render('login');
});

router.get('/profile', ensureAuthenticated,function(req, res){
    res.render('profile');
});

function ensureAuthenticated(req, res, next){
    console.log(req.isAuthenticated());
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

router.post('/register', function(req, res){
    var username     	= req.body.username;
	var email    		= req.body.email;
	var password 		= req.body.password;
	var password2 		= req.body.confPassword;
    console.log(username);
    console.log(email);
    console.log(password);
    console.log(password2);
    
    req.checkBody('username', 'Name field cannot be blank').notEmpty();
    req.checkBody('email', 'Email cannot be blank').notEmpty();
    req.checkBody('email', 'Email format incorrect').isEmail();
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password2', 'Passwords Donot Match').equals(password);
    
    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('register',{
            errors: errors,
            username: username,
            email: email,
            password: password,
            password2: password2
        });
    }
    else{
        var newUser = {
            email: email,
            name: username,
            password: password
        }
            bcryptPwd.genSalt(15, function(err, salt){
                bcryptPwd.hash(newUser.password, salt, function(err, hash){
                    newUser.password = hash;
                    db.users.insert(newUser, function(err, doc){
                        if(err){
                                res.send(err);
                        }
                        else{
                            console.log('Added User');
                            req.flash('success','Please Login Through Login Page');
                            res.location('/profile');
                            res.redirect('/login');
                        }
                    });
                });
            });
        }
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


passport.use('local', new strategy({
    usernameField: 'email',
    passReqToCallback: false
},
    function(email, password, done){
        db.users.findOne({'email': email}, function(err, user){
                if(err) {
                    return done(err);
                }
                if(!email){
                    return done(null, false, {message: 'Incorrect email'});
                }

                bcryptPwd.compare(password, user.password, function(err, isMatch){
                    if(err) {
                        return done(err);
                    }
                    if(isMatch){
                        return done(null, email);
                    } else {
                        return done(null, false, {message: 'Incorrect password'});
                    }
                });
            });
	}
	));

router.post('/login',
  passport.authenticate('local', { successRedirect: '/profile',
                                  failureRedirect: '/login',
                                  failureFlash: 'Invalid Username Or Password' }), 
  function(req, res){
  	console.log('Auth Successfull');
  	res.redirect('/profile');
  });

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success','logged out');
    res.redirect('/login');
});

module.exports = router;