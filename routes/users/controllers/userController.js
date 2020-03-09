const User = require('../models/User');
const { validationResult } = require('express-validator');
const faker = require('faker');
const bcrypt = require('bcryptjs');

module.exports = {
  register: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    User.findOne({ email }).then(user => {
      if (user) {
        // return req.flash('User Exists');
        return req.flash('errors', 'User Already Exists')
        // return res.send('User Exists')
      }
      else {
        const newUser = new User();
        newUser.profile.name = name;
        newUser.profile.picture = faker.image.avatar();
        newUser.email = email;
        newUser.password = password;
        newUser
          .save()
          .then(user => {
            // if (user) {
            //   res.status(200).json({ message: 'success', user });
            // }
            req.login(user, err => {
              if(err) {
                return res
                  .status(400)
                  .json({confirmation: false, message: err});
              } else {
                res.redirect('/');
                next();
              }
            }) 
          })
          .catch(err => {
            return next(err);
          });
      }
    });
  },

  updateProfile: (params, id) => {
    const {name, email, address} = params;
    return new Promise((resolve, reject) => {
      User.findById(id)
        .then(user => {
          console.log('hello');
          // if (params.name) user.profile.name = params.name;
          // if (params.email) user.email = params.email;
          // if (params.address) user.address = params.address;
          if (name) user.profile.name = name;
          if (email) user.email = email;
          if (address) user.address = address;
          return user;
        })
        .then(user => {
          user.save().then(user => {
            resolve(user);
          });
        })
        .catch(err => reject(err));
    }).catch(err => reject(err));
  },

  updatePassword: (params, id) => {
    return new Promise((resolve, reject) => {
      User.findById(id)
      .then((user)=> {
        if(!params.oldPassword || !params.newPassword || !params.repeatNewPassword) {
          reject('All password inputs must be filled');
        } else if (params.newPassword !== params.repeatNewPassword) {
          reject('New passwords do not match')
        } else {
          bcrypt.compare(params.oldPassword, user.password)
          .then((result) => {
            if(result === false) {
              reject('Old Password Incorrect');
            } else {
              user.password = params.newPassword;
              user.save().then(user => {
                resolve(user);
              }).catch(err => {
                throw new Error(err);
              })
            }
          })
          .catch(err => {
            throw new Error(err);
          });
        }
      })
      .catch(err => {
        reject(err);
      });
    });
  }


  //   register: async (req, res, next) => {
  //     const errors = validationResult(req);
  //     const { name, email, password } = req.body;

  //     if (!errors.isEmpty()) {
  //       return res.status(422).json({ errors: errors.array() });
  //     }

  //     let user = await User.findOne({ email });

  //     try {
  //       if (user) {
  //         return res.status(500).json({ message: 'User already Exists' });
  //       }

  //       user = await User.create({
  //         ['profile.name']: name,
  //         email,
  //         password
  //       });

  //       return res.json({ message: 'Success', user });
  //     } catch (error) {
  //       return next(error);
  //     }
  //   }
};
