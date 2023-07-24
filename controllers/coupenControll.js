const Coupen = require('../models/coupenModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')


//================Load Coupen Page===============//
const loadCoupenPage = async(req,res)=>{
    try {
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()
        res.render('coupenList',{admin:adminData,coupen:coupenData})
    } catch (error) {
        console.log(error.message);
    }
}

//================Insert Coupen===============//
const insertCoupen = async(req,res) =>{
    try {
        
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()

        //exist code in coupon checking

        const existCode = await Coupen.findOne({code:req.body.code})
        if(existCode){
           return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'coupon code already used'})
        }

        //discount pecentage validation

        if(req.body.percentage < 0){
            return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'negative not allowed'})
        }else if(req.body.percentage > 80){
            return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'maximum discount is 80 !!!'})

        }

        // date validation 

        const startDate = new Date(req.body.startdate);
        const endDate = new Date(req.body.expirydate);

        if (isNaN(startDate) || startDate < new Date() || isNaN(endDate) || endDate <  new Date() ) {
          return res.render('coupenList', { admin: adminData, coupen: coupenData, message: 'Invalid date' });
        }

        //white space checking
        
        if(req.body.code.trim() == '' || req.body.discount.trim() == "" ){
            return res.render('coupenList', { admin: adminData, coupen: coupenData, message: 'Invalid input' });
        }
        
        const coupen = new Coupen({
            code:req.body.code,
            discountType:req.body.discount,
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            discountPercentage:req.body.percentage
        })

        const coupenDatas = await coupen.save()
        if(coupenDatas){
            res.redirect('/admin/coupen-list')
        }else{
            res.redirect('/admin/coupen-list')
        }    
    } catch (error) {
        console.log(error.message);
    }
}

//================Update Coupen===============//
const updateCoupen = async(req,res,next)=>{
    try {
        const id = req.params.id
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const coupenData = await Coupen.find()

 
         //discount pecentage validation
 
         if(req.body.percentage < 0){
             return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'negative not allowed'})
         }else if(req.body.percentage > 80){
             return res.render('coupenList',{ admin:adminData , coupen:coupenData , message:'maximum discount is 80 !!!'})
 
         }
 
         // date validation 
 
         const startDate = new Date(req.body.startdate);
         const endDate = new Date(req.body.expirydate);
 
         if (isNaN(startDate) || startDate < new Date() || isNaN(endDate) || endDate <  new Date() ) {
           return res.render('coupenList', { admin: adminData, coupen: coupenData, message: 'Invalid date' });
         }


        const updateCoupen = await Coupen.findOneAndUpdate({_id:id},{
            $set:{
                code:req.body.code.trim(),
                discountType:req.body.discount.trim(),
                startDate:req.body.startdate,
                expiryDate:req.body.expirydate,
                discountPercentage:req.body.percentage.trim(),
            }
        })
        if(updateCoupen){
            res.redirect('/admin/coupen-list')
        }else{
            message='something error'
            res.redirect('/admin/coupen-list')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//================Delete Coupen===============//
const deleteCoupen = async(req,res,next) =>{
    try {
        const id = req.body.id
        const deleteCoupen = await Coupen.deleteOne({_id:id})
        if(deleteCoupen){
            res.json({success:true}) 
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const applyCoupen = async(req,res,next)=>{
    try {
      const code = req.body.code;
      const amount = Number(req.body.amount)
      const userExist = await Coupen.findOne({code:code,user:{$in:[req.session.user_id]}})
      if(userExist){
        res.json({user:true})
      }else{
        const coupendata = await Coupen.findOne({code:code})
        if(coupendata){
            if(coupendata.expiryDate <= new Date()){
                res.json({date:true})
            }else{
                await Coupen.findOneAndUpdate({_id:coupendata._id},{$push:{user:req.session.user_id}}) 
                const perAmount = Math.round((amount * coupendata.discountPercentage)/100 )
                const disTotal =Math.round(amount - perAmount)
                return res.json({amountOkey:true,disAmount:perAmount,disTotal})
            }
        }
      }
      res.json({invalid:true})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
loadCoupenPage,  
insertCoupen,
updateCoupen,
deleteCoupen,
applyCoupen,
}