const mongoose = require("mongoose");

const ProductTransSchema = new mongoose.Schema({
  voucher_code: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  voucher_num: {
    type: String,
    default: null,
  },
  voucher_type: {
    type: String,
    required: true,
  },
  voucher_date: {
    type: Date,
    required: true,
  },
  sub_product_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sub_product_master',
    required: true,
  },
  in_quantity: {
    type: Number,
    default: 0,
  },
  out_quantity: {
    type: Number,
    default: 0,
  },
  rate: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    default: 0,
  },
  stock_type: {
    type: String,
    enum: ["In", "Out"],
    required: true,
  },
  entry_user_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_master',
    default: null,
  },
  entry_timestamp: {
    type: Date,
    default: Date.now,
  },
},{ collection: 'product_trans' });

module.exports = mongoose.model('product_trans', ProductTransSchema);
