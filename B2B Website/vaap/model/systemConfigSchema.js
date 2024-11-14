const mongoose = require("mongoose");

const SystemConfigSchema = new mongoose.Schema(
  {
    system_name:{
      type: String,
      require: true,
    },
    logo: {
      type: String,
      require: true,
      default:"systemInfo_images/default.png"
    },
    favicon: {
      type: String,
      require: true,
      default:"systemInfo_images/default.png"
    },
    email: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    ph_num:{
      type: Number,
      require: true,
    },
    facebook: {
      type: String,
      default:""
    },
    instagram: {
      type: String,
      default:""
    },
    youtube:{
      type: String,
      default:""
    },
    entry_user_code:{
      type: mongoose.Schema.Types.ObjectId,
      default:null
  },
  entry_timestamp: {
    type: Date,
    default:Date.now
  },
  },
  { collection: "system_info" }
);

module.exports = mongoose.model("system_info", SystemConfigSchema);
