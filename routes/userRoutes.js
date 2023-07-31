const express = require('express')
const userRoute = express()
const session = require('express-session')
const config = require('../config/config')
const userController = require('../controllers/userController')
const path = require('path')
const auth = require('../middleware/userAuth')
const cartController = require('../controllers/userCartControll')
const addressController =require('../controllers/addressController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/coupenControll')


userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')
         
//============REGISTER THE ACCOUNT=============//        
userRoute.get('/register',auth.isLogout,userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.post('/otpVerify',userController.otpVerify);
userRoute.post("/resendOTp", userController.resendOTP);

//============LOGIN PAGE================//
userRoute.get('/login',auth.isLogout,userController.loginLoad)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/logout',auth.isLogin,userController.userLogout)
userRoute.get('/otp',userController.loadotp)

//=============HOME PAGE AND SHOP================//
userRoute.get('/',userController.loadHome)
userRoute.get('/home',userController.loadHome)
userRoute.get('/allProducts',userController.loadShop)
userRoute.get('/singleProduct/:id',userController.loadSingleProduct)
userRoute.get('/price-sort/:id', userController.priceSort);
userRoute.get('/filterCategory/:id',userController.filterCategory)


//==============USER PROFILE===================//
userRoute.get('/profile',auth.isLogin,auth.is_block,userController.loadProfile)
userRoute.get('/insertAddress',auth.isLogin,auth.is_block,addressController.LoadAddAddress)
userRoute.post('/addAddress',addressController.insertAddress)
userRoute.get('/address',auth.isLogin,auth.is_block,addressController.loadAddress)
userRoute.post('/deleteAddress',addressController.deleteAddress);
userRoute.get('/editAddress',auth.isLogin,auth.is_block,addressController.loadEditAddress);
userRoute.post('/updateAddress',addressController.updateAddress);
userRoute.get('/orders',auth.isLogin,auth.is_block,orderController.loaduserOrder);
userRoute.get("/viewOrder/:id", auth.isLogin,auth.is_block, orderController.loadOrderDetails);
userRoute.post("/cancelOrder",orderController.cancelOrder)
userRoute.get('/invoiceDownload/:id',orderController.loadInvoice);

//==============CART AND CHECHOUT MANAGEMENT================//
userRoute.get('/cart',auth.isLogin,auth.is_block,cartController.loadCart)
userRoute.post('/addToCart',cartController.addToCart)
userRoute.get('/checkout',auth.isLogin,auth.is_block,cartController.loadCheckout)
userRoute.post('/changeQuantity',cartController.changeProductCount)
userRoute.post('/deletecart',cartController.deletecart)
userRoute.post('/checkout',orderController.placeOrder)
userRoute.post('/verifyPayment',orderController.verifyPayment)
userRoute.post('/apply-coupon',couponController.applyCoupen)













module.exports = userRoute;