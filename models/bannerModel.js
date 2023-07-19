const mongoose = require ('mongoose');

const bannerSchema = new mongoose.Schema({
    heading:{
        type :String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false,
    }
})
module.exports = mongoose.model ('banner',bannerSchema);