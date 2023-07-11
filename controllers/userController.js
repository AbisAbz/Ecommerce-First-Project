const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const products = require('../models/productModel');
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const env = require('dotenv').config()
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountsid,authToken);



//===========Load The Home=================//
const loadHome = async(req,res,next) => {
    try{
      const session = req.session.user_id;
      if (!session) {
        return res.render("home", { session: session });
      }
      const userData = await User.findById(req.session.user_id);
      const productData = await products.find({is_delete:false})
  
      if (userData) {
        return res.render("home", {products: productData ,user: userData, session });
      } else {
        const session = null;
        return res.render("home", { session });
      }
    } catch (error) {
      next(error)
    }
}


 //=========== Load Login Page===========//
const loginLoad= async(req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

//============Password Security Section=============//

const securePassword = async(password) => {
    try{
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    }catch(err){
        console.log(err.message);
    }
}

//=============Load Register Form================//
const loadRegister = async(req,res) => {
    try{
        res.render('registration')
    }catch(err){
        console.log(err.message);
    }
}
 
//=============Registering User================//
const insertUser=async(req,res) => {
const mobile = req.body.mno
try {
  // check if email, mobile, and username already exist
  const userWithEmail = await User.findOne({ email:req.body.email });
  const userWithMobile = await User.findOne({ mobile: req.body.mno });
  const userWithUsername = await User.findOne({ name: req.body.name });

  if (userWithEmail) {
    return res.render("registration", { message: "Email already exists." });
  }

  if (userWithMobile) {
    return res.render("registration", { message: "Mobile number already exists." });
  }

  if (userWithUsername) {
    return res.render("registration", { message: "Username already exists." });
  } 

//  if email, mobile, and username are all unique, proceed with OTP verification
 const verifiedResponse = await client.verify.v2
 .services("VA5ecbf85175830771cab6424b7ea764ae")
 .verifications.create({
   to: `+91${mobile}`,
   channel: `sms`,
 });

req.session.userData = req.body;
res.redirect('/otp')
} catch (error) {
console.log(error.message);
}
};

const loadotp = async(req,res)=>{
  try {
    res.render('otp')
  } catch (error) {
    console.log(error.message);
  }
}

//============OTP Verify================//

const otpVerify = async (req, res, next) => {
    const otp = req.body.otp;
    console.log(req.body.otp);
    try {
      const info = req.session.userData;
      const verifiedResponse = await client.verify.v2
        .services("VA5ecbf85175830771cab6424b7ea764ae")
        .verificationChecks.create({
          to: `+91${info.mno}`,
          code: otp,
        });
      if (verifiedResponse.status === "approved") {
        const passwordHash = await bcrypt.hash(info.password, 10); // hash the password with bcrypt
        const newUserData = new User({
          name: info.name,
          email: info.email,
          mobile: info.mno,
          password: passwordHash, // use the hashed password
        });
        const userData = await newUserData.save();
        const user = await User.findOne({ name: info.name });
        if (userData) {
          req.session.user_id = user;
          res.redirect("/");
        } else {
          console.log("bhjbhbh");
          res.render("otp", { message: "Entered Otp is Incorrect" });
        }
      }
    } catch (error) {
      next(error.message);
    }
  };




//===============Verifying The User===============//
const verifyLogin = async (req, res, next) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      
      if (req.body.email.trim() == "" || req.body.password.trim() == "") {
        res.render("login", { message: "field cant be empty" });
      } else {
        const userCheck = await User.findOne({ email: email });
        if (userCheck) {
          if (userCheck.status == false) {
            res.render("login", { message: "Your account is blocked. Please contact support." });
          } else {
            const passwordMatch = await bcrypt.compare(password, userCheck.password);
            if (passwordMatch) {
              req.session.user_id = userCheck;
              res.redirect("/");
            } else {
              res.render("login", { message: "Invalid email or password" });
            }
          }
        } else {
          res.render("login", { message: "Invalid email or password" });
        }
      }
    } catch (error) {
      next(error.message);
    }
  };


//==================Load Shop Page=============//
const loadShop = async(req,res) => {
    try{
      const session = req.session.user_id;
      let page = req.query.page || 1; 
      const category =  await Category.find({is_delete:false})
      const userData = await User.findById(req.session.user_id)
      const product = await products.find({is_delete:false}).limit(4)
      .skip((page - 1) * 4)
    let count = await products.find({is_admin:0}).countDocuments();
      res.render("shop",{product,category,user:userData,session,totalPages: Math.ceil(count / 4) });
    } catch (error) {
      console.log(error.message);
    }
  };

  //=======================Logout===================//
  const userLogout = async(req,res) => {
    try {
        req.session.destroy()
  
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
  }
  }

  //================Load single Product Page========//
  const loadSingleProduct = async(req,res) => {
    try{
      const session = req.session.user_id;
      const id = req.query.id
      const product = await products.findById(id);
      const userData = await User.findById(req.session.user_id)
      res.render("singleProduct",{product,user:userData,session});
    } catch (error) {
      console.log(error.message);
    }
  };
  

 //====================Load User profile=================//
 const loadProfile = async(req,res,next) => {
  try{
    const session = req.session.user_id;
    const userData = await User.findById(req.session.user_id)
    const addressData = await Address.findOne({userId: req.session.user_id})
    res.render('userProfile',{user:userData,address:addressData,session});
   
  } catch (error) {
    next(error)
  }
}







  


  

 



module.exports = {
    securePassword,
    loadRegister,
    insertUser,
    otpVerify,
    loginLoad,
    verifyLogin,
    loadHome,
    loadShop,
    loadSingleProduct,
    loadotp,
    loadProfile,
    userLogout,
}