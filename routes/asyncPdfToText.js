/**
 * Created by lakshmi on 9/4/15.
 */

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var uuid = require ('uuid');
var async = require('async');
var mv = require('mv');
var Resume = require('../modules/Resume');

var asyncTasks = [];

var pathToPdf = path.join(__dirname, '../pathToPdf/');
var intermediate = path.join(__dirname, '../intermediate/');
var saveTo = path.join(__dirname, '../saveTo/');
var spawn = require('child_process').spawn;

var batch;
var uniqueId;
var arrId = {};
var phoneMatch = /\({0,1}\s*\d{3}?\s*\){0,1}\-*\s*\d{3}?\s*\-*(\-\?)*\s*\d{4}/;
var emailMatch =  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;



function getPdfToText(file, uniqueId, callback) {

    var fileName = file.slice(0,-4);


    var pdftotext = spawn('pdftotext', [pathToPdf + fileName +'.pdf', saveTo + fileName + '.txt'],  {cwd: '/usr/local/bin/xpdfbin-linux-3.04/bin32'});
    pdftotext.on('close', function (code) {
        //if(code!=0) callback(code)
        updateStatus(uniqueId,{status:'1'});
        callback();

    });

}

function updateStatus(id,obj){
    Resume.findByIdAndUpdate(id, obj, function (err, response) {

        if (err) {
            console.log("Something broke while updating status", + " " + err);
        } else {

            console.log("Successfully updated status");
        }
    });
    console.log(obj)
  // return obj;
}

function extractDataAndSave(path, id) {
     console.log('arrID', id);

      updateStatus(id,{status:'2'});


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

          updateStatus(id, {status:'3', processDate: Date.now(), email: email, phone: phoneNumber });

    });

}

function saveMongo(obj){

    (new Resume(obj)).save(function (err, response) {
        if (err) {
            console.log('Error while inserting: ' + obj.name + " " +err);
        } else {
            console.log('Resume successfully inserted');
        }
    });
  return Resume(obj);
}

function moveFiles(source, destination) {
    fs.readdir(pathToPdf, function (err, files) {
        if (err) return;
        //Converting pdf to text
        //Create batch id
        //var batchid = uuid.v4();
        var count = 0;
        files.forEach(function (file) {
            mv(source + file, destination + file, function (err) {
                if (err) {
                    console.log("oops!")
                }
            })

        });

    })
}

router.get('/', function(req, res, next){

    //moveFiles(pathToPdf, intermediate);
    fs.readdir(pathToPdf, function(err, files) {
        if (err) return;

        var count = 0;
        files.forEach(function(file){
          //  console.log('hi');
         if( count % 5 === 0){

             batch = uuid.v4();
             console.log('batch=====>',batch)
         }
            count++;
          console.log('batch===>',batch);

            var filename = file.slice(0,-4);
            var newResumeObj= {name: filename, status: '0', creationDate:Date.now().toLocaleString(), uuid:batch };

            newResumeObj = saveMongo(new Resume(newResumeObj));
          //   console.log(newResumeObj);
          //   console.log("ID",newResumeObj._id);
             uniqueId = newResumeObj._id;
            arrId[filename] = uniqueId ;
            console.log("ID",uniqueId);
            asyncTasks.push(function(callback){
                // Call an async function, often a save() to DB
                getPdfToText(file,uniqueId,function(){
                    //console.log('converted to text',name);
                    //log in mongo status
                    callback();
                });
                //console.log('txtfile',txtFile);
                //callback(txtFile);

            });
        });

        //console.log('***Asyn tasks',asyncTasks);
        async.parallelLimit(asyncTasks,5, function(){
            console.log("batch1===>",batch)
            console.log('5 files have been converted to text');


            files.forEach(function(fileName){
                var fileName = fileName.slice(0,-4);
                var path = saveTo + fileName +'.txt';
                var id = arrId[fileName];
                extractDataAndSave(path, id);
            })

        });

    });

    res.render('index',{title: "Resume Extractor"});
});

module.exports = router;