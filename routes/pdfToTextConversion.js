/**
 * Created by lakshmi on 9/4/15.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var uuid = require ('uuid');

var Resume = require('../modules/Resume');



var pathToPdf = path.join(__dirname, '../pathToPdf/');
console.log(pathToPdf);
var saveTo = path.join(__dirname, '../saveTo/');
console.log(saveTo);
var spawn = require('child_process').spawn;

var resumeInfo = [];


var phoneMatch = /\({0,1}\s*\d{3}?\s*\){0,1}\-*\s*\d{3}?\s*\-*(\-\?)*\s*\d{4}/;
var emailMatch =  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;


function getPdfToTextPromise(file) {

    return new Promise(function (resolve, reject) {
        var fileName = file.slice(0,-4);
        var pdftotext    = spawn('pdftotext', [pathToPdf + fileName +'.pdf', saveTo + fileName + '.txt'],  {cwd: 'C:/Program Files/Xpdf/bin64'});

        pdftotext.on('close', function (code) {
            console.log('Exit code' + code);
            //console.log(fileName);
            resolve(fileName);
        });
    });
}

function getParsedFilePromise(path,filename, uuid) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, "utf-8", function(err, data) {
            if (err) console.log(err);
            // var searchPhone;
            var phoneNumber;
            var email;
            phoneNumber = phoneMatch.exec(data.toString());
            console.log('nullCheck: ' + (phoneNumber == null));
            if (phoneNumber !== null){
                phoneNumber = phoneNumber[0];
            }
            else phoneNumber = 'NA';
            console.log('phone number is', phoneNumber);
            email = emailMatch.exec(data.toString())[0];
            var resumeObj = {name: filename, timestamp: Date.now(), email: email, phone: phoneNumber};
            //console.log('promise finished',filename);
            resolve(resumeObj);
        });
    });
}
router.get('/', function(req, res, next){
    setInterval(function(){
        fs.readdir(pathToPdf, function(err, files) {
            if (err) return;
            var promises = files.map(getPdfToTextPromise);
            Promise.all(promises).then(function (filesname) {
                console.log('files: ',filesname);
                var readArr = [];
                var resumeInfo =[];
                filesname.forEach(function(name){
                    var path = saveTo + name + '.txt';
                    readArr.push(getParsedFilePromise(path,name));
                    //getData(file);
                });
                Promise.all(readArr).then(function (data) {
                    console.log('Objects: ',data);
                    data.forEach(function(object){
                        //console.log('object en promises then: ',object)
                        (new Resume(object)).save(function (err, response) {
                            if (err) {
                                console.log('repeated');
                            } else {
                                console.log('Resume successfully inserted');
                            }
                        });

                    });
                });
            });
        });
    }, 10000);
    res.render('index',{title: "Resume Extractor"})
});

module.exports = router;