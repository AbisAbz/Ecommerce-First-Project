const User = require('../models/userModel')
const bcrypt = require('bcrypt')
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
  const loadLogin = async (req,res) =>{
    try {
         res.render('loginPage',{message})
         message = null;
        
    } catch (error) {
        console.log(error.message);
        
    }
  } 

//================VERIFY LOGIN PAGE========//
  const verifyLogin = async(req,res) => {
    try{
        const email=req.body.email
        const password=req.body.password

        const userData=await User.findOne({email:email})

         if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            console.log(passwordMatch);
            if(passwordMatch){
                console.log('correct');
                console.log(userData.is_admin);
                if(userData.is_admin===0){
                    res.render('login',{message:'Email and password incorrect'})
                }else{
                    req.session.Auser_id=userData._id
                    res.redirect('/admin/dashboard')
                }
            }else{
                res.render('login',{message:'Email or password is incorrect'})
                console.log('incorrect');
            }
        }else{
            res.render('login',{message:'Email and password incorrect'})
        }


    }catch(err){
        console.log(err.message);
    }
}

//=========== Log Out===========//
const adminLogout = async(req,res)=>{
  try {
      req.session.destroy()

      res.redirect('/admin')
  } catch (error) {
      console.log(error.message);
}
}

//=================LOAD DASGBOARD==================//
const loadDashboard = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.Auser_id });
      res.render('dashboard', { admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };

//====================User List=================//

const loadUsers = async (req, res) => {
  try {
    let page = req.query.page || 1; 
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const userData = await User.find({is_admin:0}).limit(10)
    .skip((page - 1) * 10)
  let count = await User.find({is_admin:0}).countDocuments();
    res.render("userList", { user: userData ,admin:adminData,totalPages: Math.ceil(count / 10) });
  

  } catch (error) {
    console.log(error.message);
  }
};


//=================Block & UnBlock=================//

const block = async(req,res) => {
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
     console.log(error.message);
  }
}



  module.exports = {
    securePassword,
    loadLogin,
    verifyLogin,
    adminLogout,
    loadDashboard,
    loadUsers,
    block,
    unblock,
  }