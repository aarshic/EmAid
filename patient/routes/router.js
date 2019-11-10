var express = require('express');
var User = require('../models/user');

var router = express.Router();

//for reading data
router.get('/', function (req, res, next) {
  console.log("router");
  return res.sendFile(path.join(__dirname + '/template'));
});

//for updating data
router.post('/signup', function (req, res, next){
  console.log(req.body);
  if (req.body.password!==req.body.passwordConf) {
    console.log("inside");
    var err=new Error('Passwords do not match.');
    err.status=400;
    res.send("passwords don't match");
    return next(err);
  }
  if (req.body.email && req.body.username && req.body.password && req.body.passwordConf){
    console.log("inside1");
    var userData={
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }
    User.create(userData, function(err, user){
      console.log("in");
      if(err){
        console.log(err);
        res.status(422).redirect('/signup.html')
      }
      else {
        console.log("Created");
        req.session.userId = user._id;
        res.redirect('/login.html');
      }
    });
    // let user=new User({
    //   email: req.body.email,
    //   username: req.body.username,
    //   password: req.body.password
    // });
    // user.save(function(err){
    //   if(err){
    //     console.log(err);
    //     return next(err);
    //   }
    //   res.send("User Created");
    // })
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
        return res.redirect('/login.html');
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
        console.log(err);
        res.status(422).redirect('/login.html')
      } 
      else{
        console.log(res, req);
        if(user===null){
          var err=new Error('Not authorized! Go back!');
          // err.status=401;
          res.status(422).redirect('/login.html')
        }
        else{
          return res.redirect('/index.html');
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
        return res.redirect('/login.html');
      }
    });
  }
});


var http = require('http');
var static = require('node-static');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);

var files = new static.Server('./public');

// serve files on request
function handler(request, response) {
	request.addListener('end', function() {
		files.serve(request, response);
	});
}

// listen for incoming connections from client
io.sockets.on('connection', function (socket){
  // start listening for coords
  socket.on('send:coords', function (data){
  	// broadcast your coordinates to everyone except you
  	socket.broadcast.emit('load:coords', data);
  });
});

module.exports=router;