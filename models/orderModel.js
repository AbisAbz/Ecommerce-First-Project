const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  deliveryAddress: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  products: [{ 
    productId: {
      type: String,
      required: true,
      ref: 'product'
    },
    count: {
      type: Number,
      default: 1
    },
    productPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status:{
      type:String,
      default:'placed'
    },
    cancelReason:{
        type:String,
        
    },
    returnReason:{
        type:String,
        
    },


  }],
  totalAmount: {
    type: Number,
    required: true
  },  
  date: {
    type: Date
  },
  status: {
    type: String
  },
  paymentMethod: {
    type:String
  },
  paymentId:{
    type:String
  },
  orderId:{
    type:String,
  },
});

    module.exports = mongoose.model('Order', orderSchema);
