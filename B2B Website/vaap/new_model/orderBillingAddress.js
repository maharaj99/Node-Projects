const mongoose = require("mongoose");

const OrderBillingAddressSchema = new mongoose.Schema({
  order_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_order',
    required: true,
  },
  ph_num: {
    type: Number,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip_code: {
    type: String,
    required: true,
  },
  country: {
    type: String,
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
  }
}, { collection: 'order_billing_address' });

module.exports = mongoose.model('order_billing_address', OrderBillingAddressSchema);
