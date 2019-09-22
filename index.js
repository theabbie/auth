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
    
  } else {
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

    <!-- Bootstrap core CSS -->
    <link href="https://getbootstrap.com/docs/4.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="https://getbootstrap.com/docs/4.0/examples/sign-in/signin.css" rel="stylesheet">
  </head>

  <body class="text-center">
    <form class="form-signin" method="GET" action="/otp">
      <img class="mb-4" src="https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/circle-cropped.png" alt="" width="72" height="72">
      <h1 class="h3 mb-3 font-weight-normal">Please Register</h1>
      <label for="inputEmail" class="sr-only">Email address</label>
      <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
      <label for="inputPassword" class="sr-only">Password</label>
      <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>
  </body>
</html>
`);
  }
})

app.listen(process.env.PORT);
