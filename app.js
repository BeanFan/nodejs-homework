const express = require("express");
const app = express();
const path  = require("path");
const loginMiddleWare = require("./middleware/loginMiddleWare")
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require("fs");
const bodyParser = require("body-parser");
var markdown = require('markdown-js');
app.use(cookieParser("Bean"));
app.use(session({  resave:false,
    saveUninitialized: true,
    secret: 'Bean'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
app.set("views", __dirname + "/views");


var hbs = require("hbs");
var helpers = require('handlebars-helpers')(
    {handlebars: hbs}
);


app.engine('md', function(path, options, fn){
    fs.readFile(path, 'utf8', function(err, str){
        if (err) return fn(err);
        str = markdown.parse(str).toString();
        fn(null, str);
    });
});



app.post('/login', function (req, res) {

    const username = req.body.username;
    const password = req.body.password;
    fs.readFile("./database/users.json" , "utf-8" , function (err,data) {

        var arr = JSON.parse(data);
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            if (obj.username == username){
                if (obj.password == password) {
                    req.session.loginUser = username;
                    res.redirect('/markdown');
                    return;
                } else {
                    res.render('login', { title: 'Login Page!',message:"invaild password"});
                    return;
                }

            }else{
                res.render('login', { title: 'Login Page!',message:"invaild password or username"});
                return;
            }
        }

    })
});


app.get('/logOut', function (req, res) {
    req.session.loginUser = null;
    res.redirect('/');

});



app.get('/', function (req, res) {
        res.render('login', { title: 'Login Page!'}
    );
});





app.use(loginMiddleWare);
app.get('/markdown', function(req, res, next) {
        fs.readFile('./markdown/readMe.md', function(err, data) {
        var html =  markdown.makeHtml(data.toString());

        res.render('readMe', {body: html,showbutton:true});
    });
});





var pdf = require('html-pdf');

app.get('/exportPdf2',function(req,res1) {

    fs.readFile('./markdown/readMe.md', function (err, data) {
        var html =  markdown.makeHtml(data.toString());
        var options = {format: 'Letter'};
        pdf.create(html, options).toFile('./pdf/output.pdf', function (err, res) {
            if (err) return console.log(err);
            console.log(res); // { filename: '/app/businesscard.pdf' }
            res1.download("./pdf/output.pdf");

        });
    });
});

var markdownpdf = require("markdown-pdf");

app.get('/exportPdf',function(req,res1) {
    markdownpdf().from("./markdown/readMe.md").to("./pdf/output1.pdf", function () {
        res1.download("./pdf/output1.pdf");

    });
});


app.listen(3000);