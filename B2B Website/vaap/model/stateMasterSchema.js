const mongoose = require("mongoose");
const StateMaster = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
    },
    tax_percentage: {
      type: Number,
      default: 0,
    },
    flat_tax: {
      type: Number,
      default: 0,
    },
    delivery_charges: {
      type: Number,
      default: 0,
    },
    active: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
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
  { collection: "state_master" }
);
module.exports = mongoose.model("state_master", StateMaster);
