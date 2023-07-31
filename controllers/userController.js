const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const products = require('../models/productModel');
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const Banner = require('../models/bannerModel')
const env = require('dotenv').config()
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountsid,authToken);



//===========Load The Home=================//
const loadHome = async(req,res,next) => {
    try{  
      const session = req.session.user_id;
      const banners = await Banner.find({is_delete:false})
     
      const userData = await User.findById(req.session.user_id);
      const productData = await products.find({is_delete:false}).sort({ _id: -1}).limit(4)
      console.log(productData);
      
  
      if (userData) {
        return res.render("home", {products: productData ,user: userData, session,banners });
      } else {
        const session = null;
        return res.render("home", {products: productData,banners,session });
      }
    } catch (error) {
      next(error)
    }
}


 //=========== Load Login Page===========//
const loginLoad= async(req,res,next) => {
    try {
        res.render('login')
    } catch (error) {
      next(error)
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
const loadRegister = async(req,res,next) => {
    try{
        res.render('registration')
    }catch(err){
      next(error)
    }
}
 
//=============Registering User================//
const insertUser=async(req,res,next) => {
const mobile = req.body.mno;

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
req.session.phone = mobile
res.redirect('/otp')
} catch (error) {
  next(error)
}
};

//============Load OTP Page================//
const loadotp = async(req,res,next)=>{
  try {
    res.render('otp')
  } catch (error) {
    next(error)
  }
}


//============OTP Verify================//

const otpVerify = async (req, res, next) => {
    const otp = req.body.otp;
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
          res.render("otp", { message: "Entered Otp is Incorrect" });
        }
      }
    } catch (error) {
      next(error.message);
    }
  };


//============OTP Resend================//
const resendOTP = async (req, res,next) => {
  const { phone } = req.session;

  try {
    const verification = await client.verify.v2
      .services("VA5ecbf85175830771cab6424b7ea764ae") // Replace with your Twilio service SID
      .verifications.create({ to: `+91${phone}`, channel: "sms" });
    res.sendStatus(200);
  } catch (err) {
    next(error)
    res.sendStatus(500);
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
              req.session.user_id = userCheck._id;
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
const loadShop = async (req, res, next) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 4;

    const session = req.session.user_id;
    const productData = await products
      .find({
        is_delete: false,
        $or: [
          { productName: { $regex: ".*" + search + ".*", $options: "i" } },
          { categoryName: { $regex: ".*" + search + ".*", $options: "i" } },
        ],
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await products
      .find({
        is_delete: false,
        $or: [
          { productName: { $regex: ".*" + search + ".*", $options: "i" } },
          { categoryName: { $regex: ".*" + search + ".*", $options: "i" } },
        ]
      })
      .countDocuments();

    const categoryData = await Category.find({ is_delete: false });

    if (!session) {
      return res.render("shop", {
        session: session,
        category: categoryData,
        product: productData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }

    const userData = await User.findById(session); // Use session directly as the argument
    if (userData) {
      return res.render("shop", {
        user: userData,
        session,
        category: categoryData,
        product: productData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } else {
      const session = null;
      return res.render("shop", {
        session,
        category: categoryData,
        product: productData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
  } catch (error) {
    next(error);
  }
};


//=======================Logout===================//
  const userLogout = async(req,res,next) => {
    try {
        req.session.destroy()
  
        res.redirect('/')
    } catch (error) {
      next()  }
  }

  //================Load single Product Page========//
  const loadSingleProduct = async(req,res,next) => {
    try{
      const session = req.session.user_id;
      const id = req.params.id
      const product = await products.findOne({_id:id});
      console.log(product);
      const userData = await User.findById(req.session.user_id)
      res.render("singleProduct",{product,user:userData,session});
    } catch (error) {
      next(error)
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


//====================Sorting Using Price=================//
const priceSort = async (req, res,next) => {
  try {
    const id = parseInt(req.params.id);
    const categoryData = await Category.find({ is_delete: false });
    const session = req.session.user_id;
    const productData = await products.find({ is_delete: false });
    const userData = await User.findById(session);
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let sortedData;
    if (id == 1) {
      sortedData = productData.sort((a, b) => a.price - b.price);
    } else {
      sortedData = productData.sort((a, b) => b.price - a.price);
    }

    if (sortedData) {
      const productCount = sortedData.length;
      const totalPages = Math.ceil(productCount / limit);
      const paginatedProducts = sortedData.slice(startIndex, endIndex);

      res.render("shop", {
        session,
        category: categoryData,
        product: paginatedProducts,
        currentPage: page,
        totalPages: totalPages,
        user: userData,
      });
    } else {
      res.render("shop", { product: [], session, category: categoryData, user: userData });
    }
  } catch (error) {
    next(error)
  }
};

//====================Sorting Using Category=================//
const filterCategory = async (req, res, next) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const id = req.params.id;
    const limit = 6;
    const count = await products.find({
      is_delete: false,
      $or: [
        { productName: { $regex: ".*" + search + ".*", $options: "i" } },
        { categoryName: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();
    const session = req.session.user_id;
    const categoryData = await Category.find({ is_delete: false });

    const userData = await User.find({});

    const productData = await products.find({
      categoryName: id,
      is_delete: false,
    });

    const currentPage = parseInt(req.query.page) || 1; // Add this line to get the current page value

    if (categoryData.length > 0) {
      res.render("shop", {
        totalPages: Math.ceil(count / limit),
        product: productData,
        session,
        category: categoryData,
        user: userData,
        currentPage, // Add the currentPage variable to the rendering context
      });
    } else {
      res.render("shop", {
        totalPages: Math.ceil(count / limit),
        product: [],
        session,
        category: categoryData,
        user: userData,
        currentPage, // Add the currentPage variable to the rendering context
      });
    }
  } catch (error) {
    next(error);
  }
};


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
    priceSort,
    resendOTP,
    filterCategory,
}