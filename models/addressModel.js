const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },
    addresses:[{
        userName:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        altrenativeMob:{
            type:Number,
            required:true
        },
        houseName:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        landmark:{
            type:String,
            required:true
        }
    }]
})

const addressModel = mongoose.model("address",addressSchema);
module.exports = addressModel;
