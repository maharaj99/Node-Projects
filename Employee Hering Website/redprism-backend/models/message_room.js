const mongoose = require('mongoose');
const { Schema } = mongoose;

const message_roomSchema = new Schema({
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
  
  // Chat Create date
  create_date: {
    type: Date,
    deafult: Date.now
  },
},
{ collection: 'message_room' });

module.exports = mongoose.model('message_room', message_roomSchema);