const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema({

        userid: {
            type:String,
            required:true,
            ref:'user'
        },

        userName: {
            type:String,
            required:true,
        },
        
        products:[{
            productid:{
                type: String,
                required:true,
                ref:'product'
            },
        }]
});

const wishlist = mongoose.model('wishlist',wishlistSchema);

module.exports = wishlist;