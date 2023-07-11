const Product = require('../models/productModel')
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Sharp=require('sharp');
const fs = require('fs');
const path = require('path')



let message;





//================load THE Product PAGE=================//
const loadProduct = async (req, res) => {
    try {
        let page = req.query.page || 1; 
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const catData = await Category.find({ is_delete: false });
        const productData = await Product.find({is_delete:false}).limit(10)
        .skip((page - 1) * 10)
        let count = await Product.find({is_delete: false}).countDocuments();   
        res.render('productList', { category: catData, admin: adminData, product: productData,totalPages: Math.ceil(count / 10) });
    } catch (error) {
        console.error(error.message); 
  
    }
};
//===============LOAD THE ADD PRODUCT PAGE===================//

     const loadAdd = async (req, res) => {
     try {
     const adminData = await User.findById({ _id: req.session.Auser_id });
    const catData = await Category.find({ is_delete: false });
                    
         res.render('addProduct', { category: catData, admin: adminData });
 } catch (error){
       console.log(error.message);
                          
     }
  };
                    


//==============Saving The Product PAGE================//

       const saveProduct = async (req, res) => {
        try {
          const images = [];
          if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
              images.push(req.files[i].filename);
               await Sharp('./public/adminAssets/adminImages/' +req.files[i].filename)  // added await to ensure image is resized before uploading
        .resize(800, 800)
        .toFile(
          "./public/adminAssets/adminImages/productImage/" + req.files[i].filename
        );
            }
          }
      
          const product = new Product({
            productName: req.body.productName.trim(),
            stock: req.body.stock.trim(),
            price: req.body.price.trim(),
            categoryName: req.body.categoryname,
            description: req.body.description,
            brand: req.body.brand,
            image: images, // Updated property name
          });
      
          const productData = await product.save();
          console.log(productData);
          if (productData) {
            return res.redirect("/admin/productList");
          } else {
            return res.redirect("/admin/productList");
          }
        } catch (error) {
          console.log(error.message);
          // Handle the error and send an appropriate response
          res.status(500).json({ error: "An error occurred while saving the product" });
        }
      }


//================DELETE THE PRODUCT===============//
  const deleteProduct = async(req,res) => {
        try {
            const id = req.query.id
           
            await Product.updateOne({_id:id},{$set:{is_delete:true}})
            res.redirect('/admin/productList')
        } catch (error) {
            console.log(error.message);
            
        }
    }

//===============LOAD EDIT PRODUCT PAGE==================//

    const loadEditProduct = async (req, res) => {
        try {
         
          const id = req.params.id; 
       
          const productData = await Product.findOne({_id:id}).populate('categoryName')
         

          const catData = await Category.find({is_delete:false});
          const adminData = await User.findById(req.session.Auser_id);
          res.render('editProduct', { category: catData, product: productData, admin: adminData });
        } catch (error) {
          console.log(error.message);
        
        
        }
      };

//====================== UPDATE EDIT PRODUCT ====================== //

const updateProduct = async (req,res) =>{
  const id = req.params.id
  


  
  if(Object.values(req.body).length>=5){
    
  if(req.body.productName.trim()=== "" || req.body.categoryname.trim() === "" || req.body.description.trim() === "" || req.body.stock.trim() === "" || req.body.price.trim() === "" ) {
      const id = req.X``.id
      const productData = await productmodel.findOne({_id:id}).populate('category')
      const categoryData =categorymodel.find()
      const adminData = await usermodal.findById({_id:req.session.Auser_id})
      res.render('editProduct',{admin:adminData,products: productData, message:"All fields required",categorydata:categoryData})
  }else{
      try {
        
              const id = req.params.id
              await Product.updateOne({_id:id},{$set:{
                  productName:req.body.productName,
                  categoryName:req.body.categoryname,
                  brand:req.body.brand,
                  stock:req.body.stock,
                  price:req.body.price,
                  description:req.body.description,
              }})
              res.redirect('/admin/productList')
        
      } catch (error) {
          console.log(error.message);
  }
}
 }else {
  const id = req.params.id
      const productData = await productmodel.findOne({_id:id}).populate('category')
      const categoryData =categorymodel.find()
      const adminData = await usermodal.findById({_id:req.session.Auser_id})
      res.render('editProduct',{admin:adminData,products: productData, message:"All fields required",categorydata:categoryData})
 }
}

//================DELETE IMAGE============//
const deleteimage = async(req,res,next)=>{
  try{
   
    const imgid = req.params.imgid;
    const prodid = req.params.prodid;
    fs.unlink(path.join(__dirname,"../public/adminAssets/adminImages",imgid),()=>{})
    const productimg  = await  Product.updateOne({_id:prodid},{$pull:{image:imgid}})
    res.redirect('/admin/editProduct/'+prodid)
  }catch(err){
    next(err);
  }
}

//============UPDATING PRODUCT IMAGE=========//
const updateimage = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const productData = await Product.findOne({ _id: id })
    productData.image.push(req.file.filename);
    await productData.save();
    res.redirect('/admin/editProduct/'+id)

  
    
     
  } catch (err) {
    next(err);
  }
};



 
 
       
      

module.exports = {
    loadProduct,
    loadAdd ,
    saveProduct,
    deleteProduct,
    loadEditProduct,
    updateProduct,
    deleteimage,
    updateimage,
}