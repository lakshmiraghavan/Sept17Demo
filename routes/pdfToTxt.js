/**
 * Created by lakshmi on 9/3/15.
 */

//var pdfText = require('pdf-text');
var fs = require('fs');


var pathToPdf = "/home/lakshmi/Downloads/widget-resume-data-extraction-master/resumes/";
var saveTo = "/home/lakshmi/Downloads/txt/";
var spawn = require('child_process').spawn;

var resumeInfo = [];

var phoneMatch = /\({0,1}\s*\d{3}?\s*\){0,1}\-*\s*\d{3}?\s*\-*(\­\‐)*\s*\d{4}/gmi;
var emailMatch = /[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/i;


/*
pdfText(pathToPdf, function(err, chunks) {
    console.log(pathToPdf);
    console.log(chunks);
})*/

function pdfToTxt(filename){

   var pdftotext    = spawn('pdftotext', [pathToPdf + filename +'.pdf', saveTo + filename + '.txt'],  {cwd: '/usr/local/bin/xpdfbin-linux-3.04/bin32'});

    //console.log(pathToPdf + filename +'.pdf');
   // console.log(saveTo + filename +'.txt');
    pdftotext.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    pdftotext.stdout.on('data', function(data){
       console.log('stdout:' + data);
    });
    pdftotext.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}


fs.realpath(pathToPdf, function(err, path) {
    if (err) {
        console.log(err);
        return;
    }
 //   console.log('Path is : ' + path);
});
fs.readdir(pathToPdf, function(err, files) {
    if (err) return;
    files.forEach(function(f) {
       var fileName = f.slice(0,-4)
     //   pdfToTxt(fileName);
      //  getData(fileName);
    });
});

function getData(filename){
    var path = saveTo + filename + '.txt';
   // console.log(path);
    fs.readFile(path, "utf-8", function(err, data){
        if(err) throw err;
     //   console.log("reading", filename, data);
        var phoneNumber = 0;
        var email = '';

            phoneNumber = phoneMatch.exec(data.toString())[0];

      //  console.log("==> phone",phoneNumber);
         email = emailMatch.exec(data.toString())[0];
   //     console.log('==> email', email);
  //      console.log('==> name', filename);
        var resumeObj ={name: filename, timestamp: Date.now(), email: email, phone: phoneNumber };
     //   console.log(resumeObj);
        resumeInfo.push(resumeObj);
        console.log(resumeInfo);
    })
}

getData("Merna_Girgis");