const mongoose = require('mongoose');
const { Schema } = mongoose;

const employee_job_detailsSchema = new Schema
  ({
    // Job Post Details
    job_post_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'job_post_details',
      required: true,
    },
    // Employee Details
    employee_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employee_details',
      required: true,
    },
    // Resume 
    resume: {
      type: String,
      required: true
    },
    // Apply Datetime 
    apply_datetime: {
      type: Date,
      default: Date.now
    },
    // Message 
    message: {
      type: String,
      default: ''
    },
  },
  { collection: 'employee_job_apply' });

module.exports = mongoose.model('employee_job_apply', employee_job_detailsSchema);