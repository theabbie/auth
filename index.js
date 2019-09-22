var app = require("express")();
var session = require("express-session");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1000}}))

app.get('/', function(req, res, next) {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})

app.listen(process.env.PORT);
