const mongoose = require("mongoose");

const SubProductMasterSchema = new mongoose.Schema({
  sub_product_name: {
    type: String,
    unique: true,
    required: true
  },
  product_code: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'product_master'
  },
  sub_product_image: {
    type: String,
    default: 'subProduct_images/default.png',
  },
  unit: {
    type: String,
    required: true
  },
  unit_quantity: {
    type: Number,
    required: true
  },
  unit_type: {
    type: String,
    enum: ['Box', 'Pcs'],
    required: true
  },
  per_box_pcs: {
    type: Number,
    default: 0
  },
  buying_price: {
    type: Number,
    required: true
  },
  per_pcs_buying_price: {
    type: Number,
    default: 0
  },
  mrp: {
    type: Number,
    required: true
  },
  discount_type: {
    type: String,
    enum: ['Percentage', 'Flat', 'Null'],
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  selling_price: {
    type: Number,
    required: true
  },
  per_pcs_selling_price: {
    type: Number,
    default: 0
  },
  active: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  entry_user_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_master',
    default: null
  },
  entry_timestamp: {
    type: Date,
    default: Date.now
  }
}, { collection: 'sub_product_master' });

module.exports = mongoose.model('sub_product_master', SubProductMasterSchema);
