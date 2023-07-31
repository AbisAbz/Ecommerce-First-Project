const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')
const razorpay = require('razorpay')
const { log } = require('console')


var instance = new razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Key_Secret,
});


//====================Place Order=================//
const placeOrder = async (req, res, next) => {
  try {
    const id = req.session.user_id;
    const userName = await User.findOne({ _id: id });
    const address = req.body.address;
    const paymentMethod = req.body.payment;
    const cartData = await Cart.findOne({ userId: id });
    const products = cartData.products;
    const Total = parseInt(req.body.Total);

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


//====================Verifying Payment=================//
const verifyPayment = async (req, res, next) => {
  try {
    const details = req.body;
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.Razorpay_Key_Secret);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === details.payment.razorpay_signature) {
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await Cart.deleteOne({ userId: req.session.user_id });
      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (err) {
    next(err);
  }
};
//====================Load Order Page=================//
const loaduserOrder = async(req,res) => {
  try {
    const id = req.session.user_id;
   const session = req.session.user_id
   const userData = await User.findById(req.session.user_id)
   const DeletePending = await Order.deleteMany({status:'pending'})
   const orderData = await Order.find({userId:id}).populate("products.productId");


   res.render("orders",{user:userData,orders:orderData,session})
  } catch (error) {
    console.log(error.message);
    
  }
}

//====================Load Order Details Page=================//
const loadOrderDetails = async (req, res,next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const session = req.session.user_id;
    const userData = await User.findById(session);
    const orderData = await Order.findOne({_id:id}).populate("products.productId")
   console.log(orderData);
    res.render("orderDetails", { user: userData, orders: orderData, session });
  } catch (error) {
    next(error)
    res.render("errorPage", { message: "Error loading order details" });
  }
};

//======================== CANCEL ORDER =====================//

const cancelOrder = async (req, res,next) => {
  try {
    const id = req.body.orderid;
    const reason = req.body.reason
    const ordersId = req.body.ordersid;
    const Id = req.session.user_id
    const userData = await User.findById(Id)
    const orderData = await Order.findOne({ userId: Id, 'products._id': id})
    const product = orderData.products.find((Product) => Product._id.toString() === id);
    const cancelledAmount = product.totalPrice
    const proCount = product.count
    const proId = product.productId   
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: Id,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': 'cancelled',
          'products.$.cancelReason': reason
        }
      },
      { new: true }
    );


    if (updatedOrder) {
         await Product.findByIdAndUpdate({_id:proId},{$inc:{quantity:proCount}})
      if(orderData.paymentMethod === 'onlinePayment' || orderData.paymentMethod === 'Wallet'){
         await User.findByIdAndUpdate({_id:Id},{$inc:{wallet:cancelledAmount}})
        //  await ordermodel.findByIdAndUpdate({_id:Id},{$inc:{totalAmount:-cancelledAmount}})

        await ordermodel.findByIdAndUpdate(Id, { $inc: { totalAmount: -cancelledAmount } });

         res.redirect("/vieworder/" + ordersId)
      }else{
        res.redirect("/vieworder/" + ordersId)
      }
    } else {
      res.redirect("/vieworder/" + ordersId)
    }
  } catch (error) {
    next(error)
  }
};

//======================== Invoice ORDER =====================//
const loadInvoice = async (req, res, next) => {
  try {
    const id = req.params.id;
    const session = req.session.user_id;
    const userData = await User.findById(session);
    const orderData = await Order.findOne({ _id: id }).populate('products.productId');

    if (!userData || !orderData) {
      // Handle the case when user or order is not found
      return res.status(404).send('User or order not found');
    }

    const date = new Date();

    res.render('invoice', { session, user: userData, order: orderData, date });

  } catch (error) {
    next(error);
  }
};


                 //===ADMIN SIDE===//                   

//=================Load-Order-Management================//
const loadOrderManagement = async (req, res,next) => {
  try {
    const adminData = await User.findById(req.session.Auser_id);
    const orderData = await Order.find().populate("products.productId").sort({ date: -1 });
    const DeletePending = await Order.deleteMany({status:'pending'})
    res.render('order-Management', { admin: adminData, orderData: orderData }); // Update variable name to 'orderData'
  } catch (error) {
    next(error)
  }
}

//=================Load-Order-Details================//
const loadSingleDetails = async (req, res,next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const adminData = await User.findById(req.session.Auser_id);
    const orderData = await Order.findOne({ _id: id }).populate(
      "products.productId" // Update path to 'productId'
    );
    const orderDate = orderData.date;
    const expectedDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    res.render('order-Details', { admin: adminData, orders: orderData, expectedDate });
  } catch (error) {
    next(error)
  }
}

//=================update-order-status================//
const changeStatus = async (req, res,next) => {
  try {
    const id = req.body.id;
    const userId = req.body.userId;
    const statusChange = req.body.status;

    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: userId,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': statusChange
        }
      },
      { new: true }
    );
    if (statusChange === "Delivered") {
      await Order.findOneAndUpdate(
        {
          userId: userId,
          "products._id": id,
        },
        {
          $set: {
            "products.$.deliveryDate": new Date(),
          },
        },
        { new: true }
      );
    }
    if (updatedOrder) {
      res.json({ success: true });
    }
  } catch (error) {
    next(error)
  }
};



  module.exports = {
    placeOrder,
    verifyPayment,
    loaduserOrder,
    loadOrderDetails,
    cancelOrder,
    loadInvoice,
    loadOrderManagement,
    loadSingleDetails,
    changeStatus,
  }

