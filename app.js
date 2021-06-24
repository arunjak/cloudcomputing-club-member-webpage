const morgan=require('morgan');
const config = require("./config.json");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var sql = require("mysql");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(morgan("dev"));
const multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'ASIAXHHKMLWBREDQTG4V',
    secretAccessKey: 'yhcxyzUTQL2E4eahEtpwxRBHRN9VgUZqGvaOWeBB',
    sessionToken: 'FwoGZXIvYXdzEOP//////////wEaDMe1fb95f38fD6fV0iLWAYqUzSYJlNqSaDJFS3VLUHUqv3+G3Rk5bWavf64UzHOTOs1zt7v9X6CiY++AShi0KbPHoNux1XgwfEpT7GdSiKDzcVkP1Sv723xILgUXzmzWu36/Hm+o/PLYQ3QROEqVvolOaR+T1aj2s6juK6mzzRrdr6P14Q7ivVAyFfzlll0tYT2TkQo2f/rvAf/1JNhC62H/NIJGVbYydN57Z2rGXS0TRCpLYl64vejsuMsANmKc8P9gDpOWSuLjyngiAHqhYe3FSAPIH1vuKFowV9KRN6s9zYa5evAoo6zV/QUyLaULnMnRhi5F+xrfOs5/5gUplpQIEqgReYlued+NC/u2SUFT9I+8G2L+i9kIzg==',
    region: 'us-east-1'
});
var s3bucket = new AWS.S3(); 


var sqlConnection = sql.createConnection({
    host: "database-1.cicicgdytfq9.us-east-1.rds.amazonaws.com",
    user: "admin",
    port: "3306",
    password: "arun1234",
    database: "cmm",
    multipleStatements: true
});

sqlConnection.connect(function(err) {
    if (!err) {
        console.log("Connected to SQL");
    } else {
        console.log("Connection Failed" + err);
    }
});
app.get("/", function(req,res){
    res.render("index-3")
})

app.get("/form", function(req,res){
    res.render("form")
})
app.get("/clubform", function(req,res){
    res.render("clubform")
})

app.post("/member",  async function(req, res) {
    var {memberid,fname,lname,age,email,moblie,address,clubid }=req.body
    console.log(req.body);
    
    await sqlConnection.query("INSERT into members set ?", { memberid,fname,lname,age,email,moblie,address,clubid } , async function(err, results) {
        if (err) {
            console.log(err);
        } else {
            try {
                sqlConnection.query('select * from members', function (error, results, fields) {
                    if (error) throw error;
                   
                  }) 
            } catch (error) {
                console.log(error);
            }

        }
        
        

    })

});

app.post("/club",upload.single('club_img'),  async function(req, res) {
    var {clubid,clubname,years,content}=req.body
    var club_img = req.file.buffer.toString('base64');
    club_img = Buffer.from(club_img.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    console.log(req.body);
    
    await sqlConnection.query("INSERT into club set ?", { clubid,clubname,years,content} , async function(err, results) {
        if (err) {
            console.log(err);
        } else {
            try {
                sqlConnection.query('select * from club', function (error, results, fields) {
                    if(results.length > 0){
                        res.send(" successful")
                    }
                    

                    
                    if (error) throw error;
                   
                  }) 
            } catch (error) {
               
                console.log(error);
            }

        }
        
        

    })

    var params = {
        Bucket: 'arunbucket2',
        Key: `${clubid}.jpg`,
        Body: club_img,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    };
    s3bucket.putObject(params, function(err, data) {
        if (err) {
            return res.end("Error storing picture");
        } else {
            return res.end("Successfully stored  details!");
        }
    });

});




app.get('/gall', function(req, res){
    try {

        sqlConnection.query('select * from club', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("gallery1.ejs",{members:results});
        })
    } catch (error) {
        console.log(error);
    }
  });



app.listen(3000, function() {
    console.log("Server Running at 3000");
})