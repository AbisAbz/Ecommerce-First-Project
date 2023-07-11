const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true,
    },
    image:{
        type:Array,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    categoryName: {
        type:String,
        required:true,  
      },
    description:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    is_delete:{
        type:Boolean,
        default:false,
    },

})


module.exports = mongoose.model('product',productSchema)