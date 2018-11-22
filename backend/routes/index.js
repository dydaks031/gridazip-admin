var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function (req, res, next) {
  let indexFile = 'index.html';
  if (req.headers.host.indexOf('irudasolution') > 0) indexFile = 'index_iruda.html';
  res.sendFile(path.join(__dirname, '../public', indexFile))
});


module.exports = router;
