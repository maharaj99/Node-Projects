const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerCartSchema = new Schema(
  {
    customer_code: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"customer_master",
    },
    sub_product_code: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"sub_product_master",
    },
    product_code: {
      type: mongoose.Schema.Types.ObjectId,
      rel:"product_master",
    },
    unit_type: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchase: {
      type: String,
      default: "No",
    },
    entry_user_code: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entry_timestamp: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "customer_cart" }
);

module.exports = mongoose.model("customer_cart", customerCartSchema);
