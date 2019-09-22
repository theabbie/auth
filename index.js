var app = require("express")();
var session = require("express-session");
var axios = require("axios");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000}}))

app.get("/otp", function(req, res) {
req.session.otp = Math.floor(1000*Math.random()).toString();
axios("https://srvrr.tk/mail?to="+req.query.mail+"&sub=otp&body="+req.session.otp).then(function(x) {
res.end();
})
})

app.get('/*', function(req, res) {
  if (req.session.otp) {
    res.type("text/html").end(req.url.substring(1)==req.session.otp?"ok":"not ok")
  } else {
    res.type("text/html").end("OTP not set");
  }
})

app.listen(process.env.PORT);
