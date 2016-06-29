var express = require('express');
var router = express.Router();
global.dbHelper = require('../config/dbHelper');
Polls = global.dbHelper.getModel('poll');

router.use(function(req, res, next) {
  res.locals.user = req.isAuthenticated()? req.user : null;
  next();
});
router.use(function(req,res,next){
  var messages = req.flash();
  var error = messages.error;
  var info = messages.info;
  var success = messages.success;

  res.locals.message = '';

  if(error) {
    res.locals.message = '<div role="alert" class="alert alert-danger"><strong>警告</strong> '+error+'</div>';
  }
  if(info){
    res.locals.message = '<div role="alert" class="alert alert-info">'+info+'</div>';
  }
  if(success){
    res.locals.message = '<div role="alert" class="alert alert-success"><strong>恭喜</strong> '+success+'</div>';
  }

  next();
});

router.get('/', function(req, res, next) {
  Polls.find({}, function (error, doc) {
    res.render('index', {doc: doc});
  });
});
require('./auth')(router);
require('./poll')(router);

module.exports = router;
