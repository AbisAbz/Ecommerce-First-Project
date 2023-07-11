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


userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')
         
//============REGISTER THE ACCOUNT=============//        
userRoute.get('/register',auth.isLogout,userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.post('/otpVerify',userController.otpVerify);

//============LOGIN PAGE================//
userRoute.get('/login',auth.isLogout,userController.loginLoad)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/logout',auth.isLogin,userController.userLogout)
userRoute.get('/otp',userController.loadotp)

//=============HOME PAGE AND ALL PRODUCTS================//
userRoute.get('/',userController.loadHome)
userRoute.get('/allProducts',userController.loadShop)
userRoute.get('/singleProduct',userController.loadSingleProduct)

//==============USER PROFILE===================//
userRoute.get('/profile',auth.isLogin,userController.loadProfile)
userRoute.get('/addAddress',auth.isLogin,addressController.LoadAddAddress)
userRoute.post('/addAddress',addressController.insertAddress)
userRoute.get('/address',auth.isLogin,addressController.loadAddress)
userRoute.post('/deleteAddress', auth.isLogin, addressController.deleteAddress);
userRoute.get('/editAddress',auth.isLogin,addressController.loadEditAddress);
userRoute.post('/updateAddress',auth.isLogin,addressController.updateAddress);
userRoute.get('/orders',auth.isLogin,orderController.loaduserOrder);
userRoute.get('/viewOrder/:id',auth.isLogin,orderController.loadOrderDetails)

//==============CART AND CHECHOUT MANAGEMENT================//
userRoute.get('/cart',auth.isLogin,cartController.loadCart)
userRoute.post('/addToCart',cartController.addToCart)
userRoute.get('/emptyCheckout',auth.isLogin,cartController.emptyCheckout)
userRoute.get('/checkout',auth.isLogin,cartController.loadCheckout)
userRoute.post('/changeQuantity',auth.isLogin,cartController.changeProductCount)
userRoute.post('/deletecart',cartController.deletecart)
userRoute.post('/checkout',orderController.placeOrder)





























module.exports = userRoute;