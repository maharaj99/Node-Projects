const mongoose = require("mongoose");

const CustomerOrderAmountTransSchema = new mongoose.Schema({
  order_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_order',
    required: true,
  },
  customer_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer_master',
    required: true,
  },
  paid_amount: {
    type: Number,
    required: true,
  },
  payment_type: {
    type: String,
    required: true,
  },
  payment_details: {
    type: String,
    default: '',
  },
  pay_date: {
    type: Date,
    default: Date.now,
  },
  entry_user_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_master',
    default: null,
  },
  entry_timestamp: {
    type: Date,
    default: Date.now,
  }
}, { collection: 'customer_order_amount_trans' });

module.exports = mongoose.model('customer_order_amount_trans', CustomerOrderAmountTransSchema);
