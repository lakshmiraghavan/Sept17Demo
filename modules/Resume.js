/**
 * Created by lakshmi on 9/9/15.
 */
var mongoose = require('mongoose');
var Resume = mongoose.model('resume', {
    name: String,
    timestamp:Date,
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: String
});
module.exports = Resume;

