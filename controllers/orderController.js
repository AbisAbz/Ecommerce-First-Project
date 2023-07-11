const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')

//====================Place Order=================//
const placeOrder = async (req, res, next) => {
    try {
      const id = req.session.user_id;
      const userName = await User.findOne({ _id: id });
      const address = req.body.address;
      const paymentMethod = req.body.payment;
      const cartData = await Cart.findOne({ userId: id });
      const products = cartData.products;
      console.log(products);
      const Total = parseInt(req.body.Total);
  
      if (isNaN(Total)) {
        res.status(400).json({ error: 'Invalid total amount' });
        return;
      }
  
      const status = paymentMethod === "COD" ? "placed" : "pending";
      const order = new Order({
        deliveryAddress: address,
        userId: id,
        userName: userName.name,
        paymentMethod: paymentMethod,
        products: products,
        totalAmount: Total,
        date: new Date(),
        status: status,
      });
      const orderData = await order.save();
      if (orderData) {
        for (let i = 0; i < products.length; i++) {
          const count = products[i].count;
          const pro = products[i].productId;
          await Product.findByIdAndUpdate(
            { _id: pro },
            { $inc: { stock: -count } }
          );
        }
        if (order.status === "placed") {
          await Cart.deleteOne({ userId: id });
          res.json({ codsuccess: true });
        } else {
          const orderId = orderData._id;
          const totalAmount = orderData.totalAmount;
          var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "" + orderId,
          };
  
          instance.orders.create(options, function (err, order) {
            res.json({ order });
          });
        }
      } else {
        res.redirect("/");
      }
    } catch (error) {
      next(error);
    }
  };

//====================Load Order Page=================//
const loaduserOrder = async(req,res) => {
  try {
   const session = req.session.user_id
   const userData = await User.findById(req.session.user_id)
   const orderData = await Order.find({userId: req.session.user_id})

   res.render("orders",{user:userData,orders:orderData,session}).populate("products.productId");
  } catch (error) {
    console.log(error.message);
    
  }
}


  module.exports = {
    placeOrder,
    loaduserOrder,
  }

