const mongoose = require("mongoose");

const User_modeSchema = new mongoose.Schema(
  {
    user_mode: {
      type: String,
      require: true,
      unique:true,
    },
    active: {
      type: String,
      require: true,
      enum: ["Yes", "No"],
      default:"Yes",
    },
    entry_user_code:{
      type: mongoose.Schema.Types.ObjectId,
      default:null,
    },
    entry_timestamp:{
      type:Date,
      default: Date.now(),
    },
  },
  { collection: "user_mode" }
);

module.exports = mongoose.model("user_mode", User_modeSchema);
