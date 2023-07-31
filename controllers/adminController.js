const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const products = require('../models/productModel')
const Order = require('../models/orderModel')

let message;


//==============Admin  Controll=============//

const securePassword = async (password) => {
    try {
      const passwordMatch = await bcrypt.hash(password, 10);
      return passwordMatch;
    } catch (error) {
      console.log(error.message);
    }
  };

//================LOAD LOGIN PAGE===========//
  const loadLogin = async (req,res,next) =>{
    try {
         res.render('loginPage',{message})
         message = null;
        
    } catch (error) {
       next(error)
        
    }
  } 

//================VERIFY LOGIN PAGE========//
const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("loginPage", { message: "Email and password incorrect" });
        } else {
          req.session.Auser_id = userData._id;
          res.redirect("/admin/dashboard"); // Redirect to the dashboard
        }
      } else {
        res.render("loginPage", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("loginPage", { message: "Email or password is incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

//=========== Log Out===========//
const adminLogout = async(req,res,next)=>{
  try {
      req.session.destroy()

      res.redirect('/admin')
  } catch (error) {
    next(error)
}
}

//================= LOAD DASHBOARD ==================//
const loadDashboard = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const productData = await products.find({ is_delete: false });
    const userData = await User.find({});
    const orderData = await Order.find({});

    const totalSales = await Order.aggregate([
      {
        $match: { "products.status": "Delivered" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    let totalAmount = 0;

    if (totalSales.length > 0) {
      totalAmount += totalSales[0].totalAmount;
      console.log("Total amount of delivered orders:", totalAmount);
    } else {
      console.log("No delivered orders found.");
    }

    const totalCodResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: { "products.status": "Delivered", paymentMethod: "COD" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalCod = 0;
    if (totalCodResult.length > 0) {
      totalCod = totalCodResult[0].totalCodAmount;
    } else {
      console.log("No COD orders found.");
    }

    const totalOnlinePaymentResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "onlinPayment",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalOnline = 0;
    if (totalOnlinePaymentResult.length > 0) {
      totalOnline = totalOnlinePaymentResult[0].totalCodAmount;
    } else {
      console.log("No online orders found.");
    }

    const totalWalletResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "walletpayment",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalWallet = 0;
    if (totalWalletResult.length > 0) {
      totalWallet = totalWalletResult[0].totalCodAmount;
    } else {
      console.log("No wallet orders found.");
    }

    res.render("dashboard", {
      admin: adminData,
      product: productData,
      user: userData,
      order: orderData,
      total: totalAmount,
      totalCod,
      totalWallet,
      totalOnline,
    });
  } catch (error) {
    next(error);
  }
};

//====================User List=================//

const loadUsers = async (req, res,next) => {
  try {
    let page = req.query.page || 1; 
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const userData = await User.find({is_admin:0}).limit(10)
    .skip((page - 1) * 10)
  let count = await User.find({is_admin:0}).countDocuments();
    res.render("userList", { user: userData ,admin:adminData,totalPages: Math.ceil(count / 10) });
  

  } catch (error) {
    next(error)
  }
};


//=================Block & UnBlock=================//

const block = async(req,res,next) => {
   try {
    
       const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
       req.session.user_id = null;
       res.redirect("/admin/userList")
    
   } catch (error) {
    console.log(error.message);
   }
}

const unblock = async(req,res) => {
  try {
     const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
     res.redirect("/admin/userList")
  } catch (error) {
    next(error)
  }
}

//=================Load-Sales Report=================//
const loadSalesReport = async (req, res, next) => {
  try {
    console.log(req.query.id);
    const adminData = await User.findById(req.session.auser_id);
    const order = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": 'Delivered', // Filter based on the product status
        },
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);

    res.render("salesReport", { admin: adminData, order });
  } catch (error) {
    next(error);
  }
};


//=================Sales Report Sorting=================//
const sortReport = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const from = req.body.fromDate;
    const to = req.body.toDate;

    const order = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": { $ne: "Product Returned" },
          $and: [
            { date: { $gt: new Date(from) } },
            { date: { $lt: new Date(to) } },
          ],
        },
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
    console.log(order);

    res.render("salesReport", { order, admin: adminData });
  } catch (error) {
    next(error);
  }
};



  module.exports = {
    securePassword,
    loadLogin,
    verifyLogin,
    adminLogout,
    loadDashboard,
    loadUsers,
    block,
    unblock,
    loadSalesReport,
    sortReport,
   
  }