 const mongoose = require("mongoose");

const ProductOrderSchema = new mongoose.Schema({
  voucher_number: {
    type: String,
    required: true,
  },
  voucher_date: {
    type: Date,
    default: Date.now,
  },
  voucher_type: {
    type: String,
    default: "Order",
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  customer_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer_master',
    required: true,
  },
  sub_product_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sub_product_master',
    required: true,
  },
  product_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_master',
    required: true,
  },
  unit_type: {
    type: String,
    enum: ['Box', 'Pcs'],
    default: 'Pcs',
  },
  quantity: {
    type: Number,
    required: true,
  },
  total_pcs: {
    type: Number,
    default: 0,
  },
  buying_price: {
    type: Number,
    default: 0,
  },
  tax_type: {
    type: String,
    enum: ["Percentage", "Flat", "null"],
    required: true,
  },
  tax_amount: {
    type: Number,
    default: 0,
  },
  total_tax_amount: {
    type: Number,
    default: 0,
  },
  mrp: {
    type: Number,
    required: true,
  },
  discount_type: {
    type: String,
    enum: ["Percentage", "Flat", "Null"],
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  selling_price: {
    type: Number,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  delivery_charges: {
    type: Number,
    default: 0,
  },
  net_amount: {
    type: Number,
    required: true,
  },
  paid_amount: {
    type: Number,
    default: 0,
  },
  due_amount: {
    type: Number,
    default: 0,
  },
  order_type: {
    type: String,
    enum: ["Sample Order", "Order"],
    default: "Order",
  },
  delivery_option: {
    type: String,
    enum: ["Pick Up", "Delivery"],
    required: true,
  },
  order_status: {
    type: String,
    enum: ["Pending", "Under Review", "Accepted", "Dispatch", "Delivery", "Drop Off"],
    required: true,
    default: 'Pending',
  },
  note: {
    type: String,
    default: '',
  },
  accept_order: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No',
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
}, { collection: 'product_order' });

module.exports = mongoose.model('product_order', ProductOrderSchema);
