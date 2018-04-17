var express = require('express');
var router = express.Router();
var movies = require('../movies.json');

router.get('/', function (req, res, next) {
    res.send(movies)
});

router.get('/:id([0-9]*)', function (req, res, next) {
    console.log(req.params.id);
    var id = parseInt(req.params.id, 10)
    var movie = movies.filter(function (movie) {
        return movie.id === id
    });
    res.send(movie)
});

module.exports = router;