//function to generate a string of 6 random characters

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomString() {
  var gstring = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result = '';
  for (let i = 1; i < 7; i++) {
    result += gstring[getRandomInt(1,62)];
  }
  return result;
}

//Creating user object
const users = {
  "userRandomID": {
    id: "SamHarris",
    email: "sam@Harris.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "a@a.com",
    password: "$2a$10$5FE4hArGWtUUki1DLPpl7.ckp79Ecv/zMSKlGb90Uzy3ulvgOqisK"///password is 123
  },
  "chandlerBing":{
    id: "ChB",
    email: "chandler@yahoo.com",
    password: "$2a$10$jd7c/NwypO8.njbmzfTqUuc3tuNsuE81G26UK4CI3cXaIjK72HstC"///password is underwear
  }
}



var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["helloWorld"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");
var urlDatabase = {
  "b2xVn2": {address:"http://www.lighthouselabs.ca",userID:'ChB'},
  "9sm5xK": {address:"http://www.google.com", userID: 'user2RandomID'}
};


app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//response contains html code
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  UR ={};
  if(req.session.user_id){
    var UR = urlsForUser(req.session.user_id);
  }
  let templateVars = { "urls": UR, userobject:{user_id:req.session.user_id} };
  res.render("urls_index", templateVars);
});

// request routing
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = { "urls": urlDatabase, userobject:{user_id: userId} };
  if(req.session.user_id){
    res.render("urls_new", templateVars);
  }else{
    res.redirect("htt://localhost:808/login");
  }
});

// redirecting to the corresponding url from database
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let su = req.params.shortURL;
  let dbase = Object.keys(urlDatabase);
  dbase.forEach(function(key){
    if(key === su && urlDatabase[key]){
      res.redirect(urlDatabase[key].address);
    }
  });
});
//delete botton function
app.post("/urls/:id/delete",(req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id];
  }
  res.redirect("http://localhost:8080/urls/")
});

//updating the url

app.post("/test/update", (req, res) => {
  var shortURL=req.body.shortURL;
  var regexp = /^https?:\/\//;
  // regex

  urlDatabase[shortURL].address = (req.body.NewURL.match(regexp)) ? req.body.NewURL : "https://" + req.body.NewURL;
  // ternary operator javascript
  res.redirect("http://localhost:8080/urls/");
});

app.get("/urls/:id", (req, res) => {
  var UR ={};
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    UR = urlsForUser(req.session.user_id);
  }
  let templateVars = { shortURL: req.params.id, "urls": urlDatabase, userobject:{user_id:req.session.user_id} };
  res.render("urls_show", templateVars);

});
//generating short URL and redirecting to the long url
app.post("/urls", (req, res) => {
  let temp = generateRandomString();
  urlDatabase[temp] = {address: '', userID: req.session.user_id};
  res.redirect("http://localhost:8080/urls/" + temp);
});



app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("http://localhost:8080/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.id, "urls": urlDatabase, userobject:{user_id:req.session.user_id}  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res)=>{
  if(req.body.email && req.body.password){
    let randomid = generateRandomString();
    let password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    users[randomid] = {id: randomid, email: req.body.email, password: hashed_password};

    req.session.user_id = randomid;
    res.redirect("http://localhost:8080/urls");
  }else{
    res.status(404);
  }

});

app.get("/login", (req, res) => {
  res.render("login");
});

//handling /login to set the cookie
app.post("/login", (req, res) => {

  for (var i = 0 in users) {
    if((users[i].email === req.body.email)&&(bcrypt.compareSync(req.body.password, users[i].password))){
      req.session.user_id = users[i].id;

      res.redirect("http://localhost:8080/urls");
    }else{
      res.status(403);
    }
  }
});

function urlsForUser(id) {
  let result = {};
  for (var prop in urlDatabase) {
    if(urlDatabase[prop].userID === id) {
      result[prop] = urlDatabase[prop];
    }
  }
  return(result);
}

