/**
 * Created by lakshmi on 9/9/15.
 */

var express = require('express'),
    router = express.Router(),
    Resume = require('../modules/Resume');

/* GET home page.*/
router.get('/', function (req, res) {
    Resume.find(function(err, results){
        if (err) {
            res.status(500).json({ message: 'Something Broke!' });
        } else {
            res.status(201).json(results);
        }

    })
});

module.exports = router;
