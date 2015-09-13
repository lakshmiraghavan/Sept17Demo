/**
 * Created by lakshmi on 9/4/15.
 */
var fs = require('fs');
var Promise = require('promise');


var pathToPdf = "/home/lakshmi/Downloads/widget-resume-data-extraction-master/resumes/";
var saveTo = "/home/lakshmi/Downloads/txt/";
var spawn = require('child_process').spawn;

var resumeInfo = [];

var phoneMatch = /\({0,1}\s*\d{3}?\s*\){0,1}\-*\s*\d{3}?\s*\-*(\­\‐)*\s*\d{4}/gmi;
var emailMatch = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

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
    return filename;
}

function getData(filename){

    var path = saveTo + filename + '.txt';
    var resumeObj = {}
    // console.log(path);
    fs.readFile(path, "utf-8", function(err, data){
        if(err) throw err;
        //   console.log("reading", filename, data);

        var email = '';
        email = emailMatch.exec(data.toString())[0];
     //   var email = "test";
          var    phoneNumber = '0';
        phoneNumber = phoneMatch.exec(data.toString())[0];


        //  console.log("==> phone",phoneNumber);

        //     console.log('==> email', email);
        //      console.log('==> name', filename);
         resumeObj ={name: filename, timestamp: Date.now(), email: email, phone: phoneNumber };
           console.log(resumeObj);

       // resumeInfo.push(resumeObj);
       // console.log(resumeInfo);

    })
   // return resumeObj;
}

fs.readdir(pathToPdf, function(err, files) {
    if (err) return;
   files.forEach(function(f) {
       var fileName = f.slice(0, -4);
       console.log(fileName);

       var p1 = new Promise(function (resolve, reject) {
           //pdfToTxt(fileName);
           var path = saveTo + fileName + '.txt';
           fs.readFile(path, "utf-8", function (err, data) {
               if (err) throw err;
               var email = data.match(emailMatch)[0];
               var phone = data.match(phoneMatch)[0];
               console.log('emails', email);
               console.log('phones', phone);
               var resumeObj = {name: fileName, timestamp: Date.now(), email: email, phone: phone};
               console.log(resumeObj);

           })
           resumeInfo.push(p1);

       });
     //  console.log("===>", resumeInfo);

   })
});

