//=============Admin requiring==================//

const express = require('express')
const adminRoute = express();
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productControll')
const path = require('path')
const auth = require('../middleware/adminAuth')
const multer = require('multer')
const  upload = require('../config/multer')

//============= admin set =============//
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

//============LOGIN PAGE===============//
adminRoute.get('/',auth.isLogout,adminController.loadLogin)
adminRoute.post('/',auth.isLogout,adminController.verifyLogin)


//=============DASHBOARD===============//
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard)
adminRoute.get('/logout',adminController.adminLogout)
adminRoute.get('/logout',adminController.adminLogout)

//=============USER LIST===============//
adminRoute.get('/userList',auth.isLogin,adminController.loadUsers)
adminRoute.get('/blockUser',auth.isLogin,adminController.block)
adminRoute.get('/unblockUser',auth.isLogin,adminController.unblock)

//=============CATEGORY LSIT===========//
adminRoute.get('/categoryList',auth.isLogin,categoryController.loadCategoryList )
adminRoute.post('/insert-category',auth.isLogin,categoryController.insertCategory);
adminRoute.get('/delete-category',auth.isLogin,categoryController.deletecategory)
adminRoute.get('/editCategory',auth.isLogin,categoryController.editCategory);
adminRoute.post('/editCategory',categoryController.editSaveCategory);

//==============PRODUCT LIST==========//
adminRoute.get('/productList', auth.isLogin, productController.loadProduct);
adminRoute.get('/addProduct', auth.isLogin, productController.loadAdd);
adminRoute.post('/productList', upload.upload.array('images', 10), productController.saveProduct);
adminRoute.get('/delete-product',auth.isLogin,productController.deleteProduct)
adminRoute.get('/editProduct/:id', auth.isLogin, productController.loadEditProduct);
adminRoute.post('/productList/:id',upload.upload.array("images", 10),productController.updateProduct);
adminRoute.get('/deleteimg/:imgid/:prodid',auth.isLogin,productController.deleteimage);
adminRoute.post("/admin/productList/:id",upload.upload.array("images", 10),productController.updateimage);
adminRoute.post('/editImage/:id',upload.upload.single('file'),productController.updateimage)
  


 



module.exports = adminRoute;