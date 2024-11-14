const mongoose = require("mongoose");

const OrderShipmentDetailsSchema = new mongoose.Schema({
  order_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_order',
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Accepted", "Dispatch", "Delivery", "Drop Off"],
    required: true,
  },
  mssg: {
    type: String,
    default: '',
  },
  status_date: {
    type: Date,
    default: Date.now,
  },
  entry_user_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_master',
    default: null,
  },
  entry_timestamp: {
    type: Date,
    default: Date.now,
  }
}, { collection: 'order_shipment_details' });

module.exports = mongoose.model('order_shipment_details', OrderShipmentDetailsSchema);
