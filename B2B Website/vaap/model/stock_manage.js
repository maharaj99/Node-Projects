const mongoose = require("mongoose");

const StockManageSchema = new mongoose.Schema({
  voucher_type: {
    type: String,
    default: "Stock Manage",
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
  quantity: {
    type: Number,
    required: true,
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
},{ collection: 'stock_manage' });

module.exports = mongoose.model('stock_manage', StockManageSchema);
