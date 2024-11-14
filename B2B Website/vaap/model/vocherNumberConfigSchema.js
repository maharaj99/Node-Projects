const mongoose = require("mongoose");

const VoucherNumberConfig = new mongoose.Schema(
  {
    voucher_type: {
      type: String,
      enum: ["Order Number", "Shipping Number"],
      unique: true,
    },
    prefix_text: {
      type: String,
      required: true,
    },
    mid_character_length: {
      type: Number,
      required: true,
    },
    suffix_text: {
      type: String,
      required: true,
    },
    starting_number: {
      type: Number,
      required: true,
    },
    current_number: {
      type: Number,
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
  { collection: "voucherNumberConfig" }
);

module.exports = mongoose.model("voucherNumberConfig", VoucherNumberConfig);
