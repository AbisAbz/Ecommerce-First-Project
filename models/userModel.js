const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        reqired:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        default:0
        
    },
    is_block:{
        type:Boolean,
        default:false
        
    },
    referalcode:{
        type:Number,
        reqired:true
    },
    wallet :{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('User',userSchema)