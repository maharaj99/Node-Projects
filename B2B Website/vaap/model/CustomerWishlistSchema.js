const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerWishListSchema = new Schema(
  {
    customer_code: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"customer_master",
      },
      sub_product_code: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"sub_product_master",
      },
      product_code: {
        type: mongoose.Schema.Types.ObjectId,
        rel:"product_master",
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
  { collection: "customer_wishlist" }
);

module.exports = mongoose.model("customer_wishlist", customerWishListSchema);
