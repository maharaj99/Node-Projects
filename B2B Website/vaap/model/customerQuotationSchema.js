const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerQuotationSchema = new Schema(
  {
    customer_code: {
      type: mongoose.Schema.Types.ObjectId,
      default:null,
      ref:"customer_master",
    },
    name: {
      type: String,
      required: true,
    },
    ph_num: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    message: {
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
  { collection: "customer_quotation" }
);

module.exports = mongoose.model("customer_quotation", customerQuotationSchema);
