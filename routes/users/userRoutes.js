const express = require('express');
const router = express.Router();
const passport = require('passport');
// const User = require('../users/models/User')
require('../../lib/passport');
const fetch = require('node-fetch')

const userController = require('./controllers/userController');
const userValidation = require('./utils/userValidation');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Register working before controller
// router.post('/register', (req, res, next) => {
//   User.findOne({ email: req.body.email }).then(user => {
//     if (user) return res.send('User Exists');
//     else {
//       const newUser = new User();

//       newUser.profile.name = req.body.name;
//       newUser.email = req.body.email;
//       newUser.password = req.body.password;

//       newUser
//         .save()
//         .then(user => {
//           if (user) {
//             res.status(200).json({ message: 'success', user });
//           }
//         })
//         .catch(err => {
//           return next(err);
//         });
//     }
//   });
// });
router.get('/register', (req, res) => {
  return res.render('auth/register', {errors: req.flash('errors')});
});

router.post('/register', userValidation, userController.register);

// router.put('/update-profile/:id', (req, res, next) => {
//   return new Promise((resolve, reject) => {
//     // User.findById({_id: req.user._id})
//     User.findById({_id: req.params.id})
//     .then((user) => {
//       if(req.body.name) user.profile.name = req.body.name
//       if(req.body.email) user.email = req.body.email
//       if(req.body.address) user.address = req.body.address
//       return user;
//     })
//     .then((user) => {
//       user.save().then((user) => {
//         return res.json({user});
//       })
//     })
//     .catch(err => reject(err));
//   }).catch(err => next(err));
// })

router.put('/update-profile', (req,res)=>{
  userController.updateProfile(req.body,req.user._id)
  .then((user)=> {
    return res.redirect('/api/users/profile')
  }).catch((err)=> {
    console.log(err)
    return res.redirect('/api/users/update-profile')
  })
  });

router.get('/update-profile', (req, res) => {
  if(req.isAuthenticated()) {
    return res.render('auth/update-profile');
  }
  return res.redirect('/');
});

// router.get('/login', (req, res) => {
//   if(req.isAuthenticated()) {
//     return res.direct('/');
//   }
//   return res.redirect('/api/users/login');
// })

router.get('/login', (req,res)=>{
  return res.render('auth/login', {errors: req.flash('errors')})
})

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/api/users/weather/london',
  failureRedirect: '/api/users/login',
  failureFlash: true
}));

router.get('/profile', (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.render('auth/profile')
  } else {
    return res.send('Unauthorised');
  }
});

router.put('/update-password',(req,res)=>{
  userController.updatePassword(req.body, req.user._id)
  .then((user)=>{
    return res.redirect('/api/users/profile');
  }).catch(err=>{
    return res.redirect('/api/users/update-profile')
  });
});
router.get('/choose', (req, res) => {
  
})
router.get('/weather/:city', (req, res) => {

  if (req.isAuthenticated()) {
    
    const city = req.params.city;
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${process.env.API_KEY}`;
    fetch(url)
    .then((res) => res.json())
    .then((weather) => {
      const cityUpperCased = city.charAt(0).toUpperCase() + city.substring(1)
      res.render('weather', {weather, cityUpperCased, title: 'weather'})
    })
  } else {
    return res.send('unauthorised here, please log in')
  }

})

module.exports = router;
