const mongoose = require('mongoose')

const coupenSchema = mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number
    },
    user:{
        type:Array,
        ref:"user",
    },
    status:{
        type:Boolean,
        default:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    }
})

module.exports = mongoose.model('coupen',coupenSchema)