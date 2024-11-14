const mongoose = require("mongoose");

const customerShippingAddressSchema = new mongoose.Schema(
  {
    customer_code: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "customer_master",
    },
    street: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    ph_num: {
      type: Number,
      required: true,
    },
    zip_Code: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
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
  { collection: "customer_shpping_address" }
);

module.exports = mongoose.model(
  "customer_shpping_address",
  customerShippingAddressSchema
);
