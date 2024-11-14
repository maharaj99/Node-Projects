const mongoose = require("mongoose");

const Sub_Menu_masterSchema = new mongoose.Schema(
  {
    sub_menu_name: {
      type: String,
      require: true,
      unique:true,
    },
    menu_code: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    file_name: {
      type: String,
      require: true,
      unique:true,
    },
    order_no: {
      type: Number,
      require: true,
    },
    active: {
      type: String,
      require: true,
      enum: ["Yes", "No"],
      default:"Yes",
    },
    entry_user_code:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"user_master",
      default:null,
    },
    entry_timestamp:{
      type:Date,
      default: Date.now(),
    },
  },
  { collection: "sub_menu_master" }
);

module.exports = mongoose.model(
  "sub_menu_master",
  Sub_Menu_masterSchema
);

