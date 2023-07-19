const User = require("../models/userModel")
let message;

const isLogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, continue to next middleware or route handler
        next();
      } else {
        // User is not logged in, redirect to login page
        res.redirect("/");
      }
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  };
  const is_block = async (req, res, next) => {
    try {
      const userData = await User.findOne({ _id: req.session.user_id });
      if (userData) {
        if (userData.is_block == false) {
          next();
        } else {
          req.session.destroy();
          res.redirect(200, '/', "Your account has been blocked");
        }
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
  
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // User is logged in, redirect to home page
        res.redirect("/home");
      } else {
        // User is not logged in, continue to next middleware or route handler
        next();
      }
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  };
  
  module.exports = {
    isLogin,
    isLogout,
    is_block,
  };
  