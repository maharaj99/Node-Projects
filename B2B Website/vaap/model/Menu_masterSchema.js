const mongoose = require("mongoose");

const MenuMasterSchema = new mongoose.Schema(
  {
    menu_name: {
      type: String,
      require: true,
      unique: true,
    },
    menu_icon: {
      type: String,
      require: true,
    },
    sub_menu_status: {
      type: String,
      require: true,
      enum: ["Yes", "No"],
    },
    file_name: {
      type: String,
      default:"",
    },
    order_no: {
      type: Number,
      require: true,
    },
    active: {
      type: String,
      require: true,
      enum: ["Yes", "No"],
      default :"Yes",
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
  { collection: "menu_master" }
);

module.exports = mongoose.model("menu_master ", MenuMasterSchema);


