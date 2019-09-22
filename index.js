var app = require("express")();
var session = require("express-session");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000}}))

app.get('/*', function(req, res, next) {
  if (req.session.nonce) {
    res.type("text/html").end(req.url.substring(1)==req.session.nonce?"ok":"not ok")
  } else {
    req.session.nonce = Math.floor(1000*Math.random()).toString();
    res.type("text/html").end("<a href='"+req.session.nonce+"'>go</a>")
  }
})

app.listen(process.env.PORT);
