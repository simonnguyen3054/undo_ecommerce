const User = require("../models/user");
const jwt = require("jsonwebtoken"); //to genenerate a signed token
const expressJwt = require("express-jwt"); //for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = (req, res) => {
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }

    //hide salt and hashed_password from response
    user.salt = undefined;
    user.hashed_password = undefined;

    res.json({ user });
  });
};

exports.signin = (req, res) => {
  //find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please sign up.",
      });
    }

    //if user is found, make sure email and password match
    //use authenticate method in user model to check
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password don't match.",
      });
    }

    //generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    //persist the token as "t" in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    //return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Sign out success" });
};

//check that user is signed in with the help of expressJwt
//req.auth gives the profile of the user that's signed in
//The decoded JWT payload is available on the request via the user property. This can be configured using the requestProperty
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
});

//check if user is authorized
exports.isAuth = (req, res, next) => {
  //req.profile is the user that found from param userId
  //req.auth is the signed-in user profile
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

//check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin resourse! Access denied",
    });
  }
  next();
};
