const mongoose = require('mongoose');
const { Schema } = mongoose;

const employee_buddieschema = new Schema({
  // Employee Details
  employee_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee_details',
    required: true,
  },
  // To Employee Details
  to_employee_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee_details',
    required: true,
  },
  // Mode
  mode: {
    type: String,
    required: true,
    enum: ["Request", "Friend"]
  },
  // Status
  status: {
    type: String,
    required: true,
    enum: ["Accept", "Pending", "Cancel"]
  },
  // Request Datetime
  request_datetime: {
    type: Date,
    default: Date.now,
  },
  // Accept Datetime
  accept_datetime: {
    type: Date,
    default: '',
  },
  // Cancel Datetime
  cancel_datetime: {
    type: Date,
    default: '',
  },

},
{ collection: 'employee_buddies' });

module.exports = mongoose.model('employee_buddies', employee_buddieschema);