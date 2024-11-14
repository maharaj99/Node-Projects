const mongoose = require("mongoose");

const HomeSliderSchema = new mongoose.Schema(
  {
    slider_image: {
      type: String,
      require: true,
    },
    text: {
      type: String,
      require: true,
    },
    link: {
      type: String,
      default: "",
    },
    active: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    order_num: {
      type: Number,
      require: true,
    },
    entry_user_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_master",
      default: null,
    },
    entry_timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "home_slider" }
);

module.exports = mongoose.model("home_slider", HomeSliderSchema);
