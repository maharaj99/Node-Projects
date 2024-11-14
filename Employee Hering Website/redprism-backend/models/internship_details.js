const mongoose = require('mongoose');
const { Schema } = mongoose;

const internshipDetailsSchema = new Schema
  ({
    // Location
    locations: [{
      location_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location',
        required: true,
      }
    }],
    
    // Service Area
    service_area_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'service_area_details',
      required: true,
    },

    // Description
    description: {
      type: String,
      required: true
    },

    // Post Date Time
    post_datetime: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Post Employee Code
    post_employee_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employee_details',
      required: true,
    }
  },
    { collection: 'internship_details' });

module.exports = mongoose.model('internship_details', internshipDetailsSchema);