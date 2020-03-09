var express = require('express');
var router = express.Router();

// Render Home Page
router.get('/', (req, res, next) => {
  return res.render('main/home');
});

router.get('/logout', (req, res) => {
  req.logout();
  return res.redirect('/');
})

module.exports = router;
