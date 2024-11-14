const mongoose = require("mongoose");
const CustomerMaster = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    country_code: {
      type: String,
      require: true,
    },
    ph_num: {
      type: Number,
      unique: true,
      require: true,
    },
    customer_image: {
      type: String,
      default: "customer_images/default.png",
    },
    crredit_limit: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      require: true,
    },
    user_name: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    company_name: {
      type: String,
    },
    contact_person: {
      type: String,
    },
    full_name: {
      type: String,
    },
    dba_name: {
      type: String,
    },
    zip_code: {
      type: String,
      required: true,
    },
    street_address_1: {
      type: String,
      require: true,
    },
    street_address_2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    authority_number: {
      type: String,
      required: true,
    },
    upload_file_1: {
      type: String,
      required: true,
    },
    ein: {
      type: String,
      required: true,
    },
    upload_file_2: {
      type: String,
      required: true,
    },
    active: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    // customer_activation:{
    //   type: String,
    //   enum: ["Yes", "No"],
    //   default: "No",
    // },
    entry_user_code: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entry_timestamp: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "customer_master" }
);
module.exports = mongoose.model("customer_master", CustomerMaster);
