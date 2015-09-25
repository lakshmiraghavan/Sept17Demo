/**
 * Created by lakshmi on 9/18/15.
 */
/**
 * Created by lakshmi on 9/9/15.
 */

var express = require('express'),
    router = express.Router(),
    Resume = require('../modules/Resume');

/* GET home page.*/
/*router.get('/status/:id', function(req, res){
    console.log('hi')
    console.log(req.params.id);
    Resume.find({uuid:req.params.id},function(err, results){
        if (err) res.status(500).json(err);
        else {
            res.status(200).json(results);
        }
    });
});*/

module.exports = router;
