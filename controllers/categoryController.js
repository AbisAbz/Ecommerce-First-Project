const category = require('../models/categoryModel')
const User = require('../models/userModel')

const uc = require('upper-case')



//===============LOAD THE CATEGORY PAGE==================//

const loadCategoryList = async (req, res) => {
    try {
      
      const adminData = await User.findById({ _id: req.session.Auser_id });
      const catData = await category.find({is_delete:false})
      res.render("categoryList",{ category:catData,admin:adminData});
    } catch (error) {
      console.log(error.message);
    }
  };

//=================category Inserting===============//

// categoryController.js

const insertCategory = async (req,res)=>{
    try
     {
        if(req.session.Auser_id){
          
            const catName = uc.upperCase(req.body.categoryname);
             const Category = new category({
                categoryname:catName
            })
            if(catName.trim().length==0){
                const catagoryDatas = await category.find({is_delete:false})
                const adminData = await User.findById({ _id: req.session.Auser_id });
                res.render('categoryList',{message:"Invalid typing",admin:adminData, category:catagoryDatas});
            }else{
                const catData = await category.findOne({categoryname:catName});
                await category.updateOne({categoryname:catName},{$set:{is_delete:false}});
            
                if(catData){
                    const adminData = await User.findById({ _id: req.session.Auser_id });
                     const catagoryDatas = await category.find({is_delete:false})
                    res.render('categoryList',{message:"This category is already exist",admin:adminData,category:catagoryDatas});
                }else{
                    const categoryData = await Category.save();
                    if(categoryData){
                        const catagoryDatas = await category.find({is_delete:false})
                        const adminData = await User.findById({ _id: req.session.Auser_id });
                        res.render('categoryList',{admin:adminData, category:catagoryDatas});
                    }else{
                        res.redirect('/admin/dashboard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

  //==============LOAD Edit Category=====================//

  const editCategory = async(req,res) => {
    try {
        const id = req.query.id;
        const catDATA = await category.findById({_id:id});
        const adminData = await User.findById({ _id: req.session.Auser_id });
        res.render('editCategory',{category:catDATA , admin:adminData})
    } catch (error) {
        console.log(error.message);
        
    }
  }

//================save the category of the edit page===============//
const editSaveCategory = async (req, res,next) => {
    try {
      const id = req.body.id;
    console.log(req.body.categoryname);
      const name = uc.upperCase(req.body.categoryname).trim();
      const existingCategory = await category.findOne({
        categoryname: name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        message = "category already exists";
        res.redirect("/admin/categoryList");
        return;
      }
      const categorydata = await category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { categoryname: name } }
      );
  
      res.redirect("/admin/categoryList");
    } catch (error) {
      next(error)
    }
  };

//===============DELETE THE CATEGORY================//
const deletecategory = async (req,res)=>{
    try {
       const id = req.query.id   
      
       await category.updateOne({_id:id},{$set:{is_delete:true}})
       res.redirect('/admin/categoryList')
    }
     catch (error) {
        console.log(error.message);
    }
}




  module.exports = {
    loadCategoryList,
    insertCategory ,
    editCategory,
    editSaveCategory,
    deletecategory,
  }
  