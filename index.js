var app = require("express")();
var session = require("express-session");
var axios = require("axios");
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000}}))

app.get("/otp", function(req, res) {
if(req.session.otp) {
res.type("text/html").end(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png">
    <title>OTP</title>
    <link rel="canonical" href="https://getbootstrap.com/docs/4.0/examples/sign-in/">
    <link href="https://getbootstrap.com/docs/4.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/4.0/examples/sign-in/signin.css" rel="stylesheet">
  </head>
  <body class="text-center">
    <form class="form-signin" method="GET" action="/verify">
      <img class="mb-4" src="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png" alt="" width="72" height="72">
      <h1 class="h3 mb-3 font-weight-normal">Please enter OTP for ${req.session.mail}</h1>
      <input name="otp" type="text" id="inputEmail" class="form-control" placeholder="OTP" required autofocus><br>
      <p style="color: red">${req.session.err || ""}</p><br>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Submit</button>
    </form>
  </body>
</html>
`);
}
else {
res.redirect(301, "https://awth.now.sh/register");
}
})

app.get('/register', function(req, res) {
if (!req.session.verified) {
res.type("text/html").end(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png">
    <title>Register</title>
    <link rel="canonical" href="https://getbootstrap.com/docs/4.0/examples/sign-in/">
    <link href="https://getbootstrap.com/docs/4.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/4.0/examples/sign-in/signin.css" rel="stylesheet">
  </head>
  <body class="text-center">
    <form class="form-signin" method="GET" action="/api">
      <img class="mb-4" src="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png" alt="" width="72" height="72">
      <h1 class="h3 mb-3 font-weight-normal">Please Register</h1>
      <label for="inputEmail" class="sr-only">Email address</label>
      <input name="mail" type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
      <label for="inputPassword" class="sr-only">Password</label>
      <input name="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required><br>
      <p style="color: red">${req.session.err || ""}</p><br>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>
  </body>
</html>
`);
}
else {
res.redirect(301, "https://awth.now.sh/dashboard");
}
})

app.get("/api", function(req, res) {
if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(req.query.mail))) {req.session.err="Invalid Email";res.redirect(301, "https://awth.now.sh/register")}
if (req.query.password.length<8) {req.session.err="Password too small";res.redirect(301, "https://awth.now.sh/register")}
req.session.mail = req.query.mail;
req.session.password = req.query.password;
req.session.otp = Math.floor(100000+900000*Math.random()).toString();
axios("https://srvrr.tk/mail?to="+req.session.mail+"&sub=otp&body="+req.session.mail+"\n"+req.session.password+"\n"+req.session.otp).then(function(x) {
res.redirect(301, "https://awth.now.sh/otp");
})
})

app.get("/verify", function(req, res) {
if (req.query.otp==req.session.otp) {req.session.verified=true;res.redirect(301, "https://awth.now.sh/dashboard");}
else {req.session.err="Incorrect OTP";res.redirect(301, "https://awth.now.sh/otp")}
})

app.get("/dashboard", function(req, res) {
if (req.session.verified) {
res.type("text/html").end(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png">
    <title>Register</title>
    <link rel="canonical" href="https://getbootstrap.com/docs/4.0/examples/sign-in/">
    <link href="https://getbootstrap.com/docs/4.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/4.0/examples/sign-in/signin.css" rel="stylesheet">
  </head>
  <body class="text-center">
      <img class="mb-4" src="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png" alt="" width="72" height="72"><br><br>
      <h1 class="h3 mb-3 font-weight-normal">Welcome ${req.session.mail}</h1>
      <a href="logout">Log Out</a>
  </body>
</html>
`);
}
else {
res.redirect(301, "https://awth.now.sh/register");
}
})

app.get("/logout", function(req, res) {
req.session.destroy(function() {
res.redirect(301, "https://awth.now.sh/register");
})
})

app.get("/*", function(req, res) {
res.redirect(301, "https://awth.now.sh/register");
})

app.listen(process.env.PORT);
