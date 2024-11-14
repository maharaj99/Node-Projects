const mongoose = require("mongoose");

const WishListSchema = new mongoose.Schema(
  {
    flavor_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flavor',
      required: true,
    },
    user_code: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'Flavor',
      required: true,
    },
  },
  { collection: "wishlistchema" }
);

module.exports = mongoose.model("wishlistchema", WishListSchema);
