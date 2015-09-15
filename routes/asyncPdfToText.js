/**
 * Created by Alejandro on 9/14/2015.
 */
/**
 * Created by lakshmi on 9/4/15.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var uuid = require ('uuid');
var async = require('async');

var Resume = require('../modules/Resume');

var asyncTasks = [];

var pathToPdf = path.join(__dirname, '../pathToPdf/');
var saveTo = path.join(__dirname, '../saveTo/');
var spawn = require('child_process').spawn;

var resumeInfo = [];


var phoneMatch = /\({0,1}\s*\d{3}?\s*\){0,1}\-*\s*\d{3}?\s*\-*(\-\?)*\s*\d{4}/;
var emailMatch =  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;


function getPdfToText(file,callback) {

    var fileName = file.slice(0,-4);
    //console.log('filename: ', fileName);
    var pdftotext = spawn('pdftotext', [pathToPdf + fileName +'.pdf', saveTo + fileName + '.txt'],  {cwd: 'C:/Program Files/Xpdf/bin64'});

    pdftotext.on('close', function (code) {
        //console.log('Exit code' + code);
        //console.log('close:',fileName);
        callback(fileName);

    });

}

function extractDataAndSave(path,filename, callback) {
    console.log('**********entra extract*********');
    fs.readFile(path, "utf-8", function(err, data) {
        if (err) console.log(err);
        console.log('name from extract:', path);
        var phoneNumber;
        var email;
        phoneNumber = phoneMatch.exec(data.toString());
        console.log('nullCheck: ' + (phoneNumber == null));
        if (phoneNumber !== null){
            phoneNumber = phoneNumber[0];
        }
        else phoneNumber = 'NA';
        //console.log('phone number is', phoneNumber);
        email = emailMatch.exec(data.toString())[0];
        var resumeObj = {name: filename, timestamp: Date.now(), email: email, phone: phoneNumber};
        //console.log(resumeObj);
        //return resumeObj;
        //console.log('promise finished',filename);
        callback(resumeObj);
    });

}

function saveMongo(obj){

    (new Resume(obj)).save(function (err, response) {
        if (err) {
            console.log('Error while inserting: ' + obj.name);
        } else {
            console.log('Resume successfully inserted');
        }
    });

}

router.get('/', function(req, res, next){

        fs.readdir(pathToPdf, function(err, files) {
            if (err) return;

            files.forEach(function(file){
                // We don't actually execute the async action here
                // We add a function containing it to an array of "tasks"
                asyncTasks.push(function(callback){
                    // Call an async function, often a save() to DB
                    getPdfToText(file,function call(name){
                        var path = saveTo + name + '.txt';

                       extractDataAndSave(path,name, function(obj){
                           console.log('obj from callback',obj);
                            callback(obj);
                       });

                    });
                    //console.log('txtfile',txtFile);
                    //callback(txtFile);

                });
            });

            //console.log('***Asyn tasks',asyncTasks);
            async.parallelLimit(asyncTasks,5, function(obj){
                //var path = saveTo + name + '.txt';
                // All tasks are done now
                console.log('file from callback',obj);
                saveMongo(obj);
                //extractDataAndSave('path','filename');
            });

            /*var promises = files.map(getPdfToTextPromise);
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
            });*/
        });


    res.render('index',{title: "Resume Extractor"});
});

module.exports = router;