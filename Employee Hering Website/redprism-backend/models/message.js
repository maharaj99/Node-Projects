const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageschema = new Schema({

  // Message Room Id
  message_room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message_room',
    required: true
  },

  // From Employee Details
  from_employee_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee_details',
    required: true
  },

  // To Employee Details
  to_employee_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee_details',
    required: true
  },

  // Message
  mssg: {
    type: String,
    default: '',
  },

  // Attachment
  attachment: {
    type: String,
    default: '',
  },

  // Message Datetime
  mssg_datetime: {
    type: Date,
    default: Date.now,
  },

  // Seen Status
  seen: {
    type: String,
    default: "No",
    enum: ["Yes", "No"]
  },

},
  { collection: 'message' });

module.exports = mongoose.model('message', messageschema);