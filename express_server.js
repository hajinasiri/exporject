//function to generate a string of 6 random characters
function generateRandomString() {
  var gstring = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
  result = '';
  for(let i = 1; i < 7; i++){
    result += gstring[getRandomInt(1,62)];
  }
  return result;
}

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { "urls": urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// request routing
//This code should output any request parameters to your terminal.
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// redirecting to the corresponding url from database
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let su = req.params.shortURL;
  let dbase = Object.keys(urlDatabase);
  dbase.forEach(function(key){
    if(urlDatabase[key]){
      res.redirect(urlDatabase[key]);
    }
  });


});
//delete botton function
app.post("/urls/:id/delete",(req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls/")
});

//updating the url
app.post("/urls/:id/update",(req, res) => {
  urlDatabase[req.params.id] = req.body.NewURL;
  res.redirect("http://localhost:8080/urls/");
});



app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, "urls": urlDatabase, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//generating short URL and redirecting to the long url
app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let temp = generateRandomString();
  urlDatabase[temp] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/" + temp);
});

//handling /login to set the cookie
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("http://localhost:8080/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("http://localhost:8080/urls");

});





