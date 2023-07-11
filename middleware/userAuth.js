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
  };
  