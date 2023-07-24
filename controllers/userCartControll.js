const User = require('../models/userModel')
const products = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Coupen = require('../models/coupenModel')


//===================LOAD CART MANAGEMENT=============//
const loadCart = async (req, res) => {
  try {
    let id = req.session.user_id;
    const session = req.session.user_id;
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productId"
    );
    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$products.productPrice", "$products.count"],
                  },
                },
              },
            },
          ]);
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total + 80;
          const userId = userName._id;
          const userData = await User.find({});
          res.render("cart", {
            products: products,
            Total: Total,
            userId,
            session,
            totalAmount,
            user: userName,
          });
        } else {
          res.render("emptyCart", {
            user: userName,
            session,
            message: "No Products Added to cart",
          });
        }
      } else {
        res.render("emptyCart", {
          user: userName,
          session,
          message: "No Products Added to cart",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
   console.log(error.message);
  }
};
//====================== ADD TO CART ==================//


const addToCart = async (req, res,next) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const proId = req.body.id;
    
    const productData = await products.findOne({ _id: proId })

   
    const productQuantity = productData.quantity;
  
    const cartData = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          userName: userData.name,
          products: [],
        },
      },
      { upsert: true, new: true }
    );



    const updatedProduct = cartData.products.find((product) => product.productId === proId);
 
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;

    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }

    const cartProduct = cartData.products.find((products) => products.productId === proId);

    if (cartProduct) {
      await Cart.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": productData.price,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice: productData.price,
        totalPrice: productData.price,
      });
      await cartData.save();
    }
    res.json({ success: true });
  } catch (error) {
    next(error)
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//======================Load CheckOut Page ==================//
const loadCheckout = async (req, res) => {
  try {
    const subtotal=req.query.total
    const session = req.session.user_id;
    const couponData = await Coupen.find({});
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    const currentDate = new Date();

    const validCoupons = couponData.filter((item) => item.expiryDate > currentDate);
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
        },
      },
    ]);

    if (req.session.user_id) {
      if (addressData) {
        if (addressData.addresses.length > 0) {
          const address = addressData.addresses;
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total;
          res.render("checkout", { session, Total, address, totalAmount, user:userData,coupen : validCoupons, subtotal:subtotal });
        } else {
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total;
          res.render("checkout", { session, Total, address: [], totalAmount, user:userData, coupen: validCoupons, subtotal:subtotal });
        }
      } else {
        const Total = total.length > 0 ? total[0].total : 0;
        const totalAmount = Total;
        res.render("checkout", { session, address: [], Total, totalAmount, user:userData, coupen: validCoupons, subtotal:subtotal });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};


//=================== EMPTY CHECKOUT ==================== //
const emptyCheckout = async (req, res,next) => {
  try {
    const session = req.session.user_id;
      if (!session) {
        return res.render("home", { session: session });
      }
      const userData = await User.findById(req.session.user_id)
      const addressData = await Address.findOne({userId: req.session.user_id})
      res.render("emptyCheckout",{user:userData,address:addressData,session});
  } catch (error) {
    next(error)
  }
};
//================== INCREASE '+' AND DECREASING '-' THE COUNT OF THE PRODUCT =====================//
const changeProductCount = async (req, res, next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find((product) => product.productId === proId);
    const productData = await products.findOne({ _id: proId });

    const productQuantity = productData.stock;

    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find((product) => product.productId === proId);
    const updatedQuantity = updatedProduct?.count; // Use optional chaining here

    if (count > 0) {
      // Quantity is being increased
      if (updatedQuantity && updatedQuantity + count > productQuantity) {
        res.json({ success: false, outOfStock: true, message: 'Quantity limit reached!' });
        return;
      }
    } else if (count < 0) {
      // Quantity is being decreased
      if (!updatedQuantity || updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
        await Cart.updateOne(
          { userId: userData },
          { $pull: { products: { productId: proId } } }
        );
        res.json({ success: true });
        return;
      }

    }

    const cartdata = await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );

    const updateCartData = await Cart.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find((product) => product.productId === proId);
    const updateQuantity = updateProduct?.count; // Use optional chaining here
    const price = updateQuantity * productData.price;

    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": price } }
    );

    res.json({ success: true });

  } catch (error) {
    next(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//===================== DELETE CART ================= //

const deletecart = async (req, res,next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    const cartData = await Cart.findOne({ userId: userData });
    if (cartData.products.length === 1) {
      const c = await Cart.deleteOne({ userId: userData });
    } else {
      const v = await Cart.updateOne(
        { userId: userData },
        { $pull: { products: { productId: proId } } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    next(error)
    res.status(500).json({ success: false, error: error.message });
  }
};





  module.exports = {
    loadCart,
    addToCart,
    loadCheckout,
    emptyCheckout,
    changeProductCount,
    deletecart,
  }