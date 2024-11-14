const mongoose = require("mongoose");

const ProductMasterSchema = new mongoose.Schema({
  product_name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  highlight: {
    type: String,
    required: true
  },
  meta_keywords: {
    type: String,
    required: true
  },
  meta_description: {
    type: String,
    required: true
  },
  product_link: {
    type: String,
    required: true,
    unique: true
  },
  product_image_1: {
    type: String,
  },
  product_image_2: {
    type: String,
  },
  product_type_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_type_master',
    default: null
  },
  category_code: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'category_master'
  },
  sub_category_code: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'sub_category_master'
  },
  brand_code:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'brand'
  },
  unit: {
    type: String,
    required: true
  },
  unit_type: {
    type: String,
    default: ''
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
}, { collection: 'product_master' });

module.exports = mongoose.model('product_master', ProductMasterSchema);
