const mongoose = require('mongoose');
const { Schema } = mongoose;

const employee_search_detailsSchema = new Schema
  ({
    // Employee Details
    employee_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employee_details',
      required: true,
    },

    // Technology
    tech_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'technology',
      default: null,
    },

    // Location
    location_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'location',
      default: null,
    },

    // Experience
    exp_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'experience_master',
      default: null,
    },

    // Search Datetime
    search_datetime: {
      type: Date,
      default: Date.now,
    }
  },
    { collection: 'employee_search_details' });

module.exports = mongoose.model('employee_search_details', employee_search_detailsSchema);