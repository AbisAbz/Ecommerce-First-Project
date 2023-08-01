//=======================Admin-Requiring===========================================//
const express = require('express')
const adminRoute = express();
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productControll')
const orderController = require('../controllers/orderController')
const coupenController = require('../controllers/coupenControll')
const bannerController = require('../controllers/bannerController')
const path = require('path')
const auth = require('../middleware/adminAuth')
const multer = require('multer')
const  upload = require('../config/multer')

//============================admin-set===============================================//
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

//=============================LOGIN-PAGE=============================================//
adminRoute.get('/',auth.isLogout,adminController.loadLogin)
adminRoute.post('/',adminController.verifyLogin)


//==============================DASHBOARD===============================================//
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard)
adminRoute.get('/logout',adminController.adminLogout)
adminRoute.get('/logout',adminController.adminLogout)

//================================USER-LIST=============================================//
adminRoute.get('/userList',auth.isLogin,adminController.loadUsers)
adminRoute.get('/blockUser',auth.isLogin,adminController.block)
adminRoute.get('/unblockUser',auth.isLogin,adminController.unblock)

//===============================CATEGORY-LSIT==========================================//
adminRoute.get('/categoryList',auth.isLogin,categoryController.loadCategoryList )
adminRoute.post('/insert-category',auth.isLogin,categoryController.insertCategory);
adminRoute.get('/delete-category',auth.isLogin,categoryController.deletecategory)
adminRoute.get('/editCategory',auth.isLogin,categoryController.editCategory);
adminRoute.post('/editCategory',categoryController.editSaveCategory);

//============================PRODUCT LIST And Offer====================================//
adminRoute.get('/productList', auth.isLogin, productController.loadProduct);
adminRoute.get('/addProduct', auth.isLogin, productController.loadAdd);
adminRoute.post('/productList', upload.upload.array('images', 10), productController.saveProduct);
adminRoute.get('/delete-product',auth.isLogin,productController.deleteProduct)
adminRoute.get('/editProduct/:id', auth.isLogin, productController.loadEditProduct);
adminRoute.post('/productList/:id',upload.upload.array("images", 10),productController.updateProduct);
adminRoute.get('/deleteimg/:imgid/:prodid',auth.isLogin,productController.deleteimage);
adminRoute.post('/editimage/:id',upload.upload.array('file',10),productController.updateimage)
adminRoute.post('/addOffer',productController.addOffer);

//====================================ORDER-DETAILS=====================================//
adminRoute.get('/order-management', auth.isLogin, orderController.loadOrderManagement); 
adminRoute.get('/single-order/:id', auth.isLogin, orderController.loadSingleDetails);
adminRoute.post("/updateStatus", auth.isLogin, orderController.changeStatus);

//====================================Coupen-List=======================================//
adminRoute.get('/coupen-list',auth.isLogin,coupenController.loadCoupenPage)
adminRoute.post('/insert-coupen',auth.isLogin,coupenController.insertCoupen)
adminRoute.post('/update-coupen/:id',auth.isLogin,coupenController.updateCoupen)
adminRoute.post('/delete-coupen',auth.isLogin,coupenController.deleteCoupen)

//====================================BANNER-List========================================//
adminRoute.get("/bannerList",auth.isLogin,bannerController.loadBannerManagement)
adminRoute.post("/addbanner",upload.upload.single('image'),bannerController.addBanner)
adminRoute.post("/editBanner",upload.upload.single("image"),bannerController.editBanner);
adminRoute.get('/deleteBanner/:id',auth.isLogin,bannerController.deleteBanner)

//=========================== SALES REPORT ROUTE SECTION START ===========================//
adminRoute.get("/salesReport", auth.isLogin, adminController.loadSalesReport);
adminRoute.post("/salesReportSort", auth.isLogin, adminController.sortReport);


adminRoute.get('*',(req,res)=>{
    res.redirect('/admin')
  });


module.exports = adminRoute;