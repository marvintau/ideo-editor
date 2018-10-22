var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var fs = require('fs');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/save', function(req, res){
    var filePath = path.join(__dirname, 'public/data/stroke-spec.json'),
        destPath = path.join(__dirname, 'public/data/stroke-spec-'+ Date() +'.json');

    var reader = fs.createReadStream(filePath);
    reader.pipe(fs.createWriteStream(destPath), {end : false});
    reader.on('end', function(){
        console.log("original stroke data copied.");
        fs.writeFile(filePath, JSON.stringify(req.body, null, 2), function(){
        
            console.log("written to local file.", Date());
            res.end("yeah.");
        })    
    })
    
})

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
