const wishlist = require('../models/wishlistModel')
const product =- require('../models/productModel')
const User = require('../models/userModel')



//------------- NEW WISHLIST SHOWING ---------------//
const loadWishlist = async(req,res)=>{
    try {
        const session = req.session.user_id;
        const wishlistData = await wishlist.find({userid: session}).populate('products.productid');
        const user = await User.findById(session)
        if(wishlistData.length > 0){
            const wishlist = wishlistData[0].products;
            console.log(wishlist);
            const product = wishlist.map( wish => wish.productid);
            res.render('wishlistPage',{session , wishlist , product,user});
        }else{
            res.render('wishlistPage', {session , wishlist:[] ,product:[],user})
        }
    } catch (error) {
        console.log(error.message);
    }
};

//------------- ADD TO WISHLIST ---------------//
const addToWishlist = async(req,res)=>{
    try {
        const id = req.body.id;
        console.log(id,'is working');
        const user = req.session.user_id;
        console.log(id,user);
        const userData = await User.findById(user);
        const wishlistData = await wishlist.findOne({userid:user});
        if(wishlistData){
            const checkWishlist = await wishlistData.products.findIndex((wish)=> wish.productid == id);

            if(checkWishlist != -1){
                res.json({ check: true });
            }else{
               await wishlist.updateOne({userid: req.session.user_id},{$push: { products: {productid: id}}});   
                res.json({success: true })
            }
        }else{
            const Wishlist = new wishlist({
            userid: req.session.user_id,
            userName: userData.name,
            products:[
                {
                    productid: id,
                },
            ],
        });
        console.log(Wishlist);
    
        const wish = await Wishlist.save();
        if(wish){
            res.json({success: true})
        }
    }

    } catch (error) {
        console.log(error.message);
    }
}

//------------- Delete WISHLIST ---------------//
const deleteSingleWishlist = async (req, res) => {
    try {
        console.log('hiiii');
      const id = req.params.id;
      console.log(id,'iiiiiiiiiiiiiiiiii');
      const userId = req.session.user_id;
      const a = await wishlist.findOneAndUpdate(
        { userid: userId },
        { $pull: { products: { productid: id } } }
      );
      res.redirect('/wishlist');
    } catch (error) {
      console.log(error.message);
    }
  };
  

module.exports ={
    loadWishlist,
    addToWishlist,
    deleteSingleWishlist,
}