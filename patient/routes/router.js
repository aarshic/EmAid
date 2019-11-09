var express = require('express');
var User = require('../models/user');

var router = express.Router();

//for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/template/signup.html'));
});

//for updating data
router.post('/signup', function (req, res, next) {
  if (req.body.password!==req.body.passwordConf) {
    var err=new Error('Passwords do not match.');
    err.status=400;
    res.send("passwords don't match");
    return next(err);
  }
  if (req.body.email && req.body.username && req.body.password && req.body.passwordConf){
    var userData={
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    }
    User.create(userData, function (error, user){
      if (error){
        return next(error);
      } else{
        req.session.userId = user._id;
        console.log("Created");
        return res.redirect('/template/login.html');
      }
    });
  } 
  else if(req.body.logemail && req.body.logpassword){
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user){
      if(error || !user){
        var err=new Error('Wrong email or password.');
        err.status=401;
        return next(err);
      } 
      else{
        req.session.userId = user._id;
        return res.redirect('/template/login.html');
      }
    });
  } 
  else {
    var err=new Error('All fields required.');
    err.status=400;
    return next(err);
  }
})

//GET route after registering
router.get('/login', function(req, res, next){
  User.findById(req.session.userId)
    .exec(function (error, user){
      if(error){
        console.log(res, req);
        return next(error);
      } 
      else{
        console.log(res, req);
        if(user===null){
          var err=new Error('Not authorized! Go back!');
          err.status=400;
          return next(err);
        } 
        else{
          return res.redirect('/template/index.html');
        }
      }
    });
});

router.get('/logout', function (req, res, next) {
  if(req.session){
    req.session.destroy(function (err) {
      if(err){
        return next(err);
      } 
      else{
        return res.redirect('/template/login.html');
      }
    });
  }
});

module.exports=router;