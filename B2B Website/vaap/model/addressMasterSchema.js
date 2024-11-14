const mongoose = require("mongoose");
const AddressMaster = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
    },
    zipcode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
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
  { collection: "address_master" }
);
module.exports = mongoose.model("address_master", AddressMaster);
