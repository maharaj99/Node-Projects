const mongoose = require('mongoose');
const { Schema } = mongoose;

const walking_job_detailsSchema = new Schema
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
    // Walking Date 
    walking_date: {
      type: Date,
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
    { collection: 'walking_job_details' });

module.exports = mongoose.model('walking_job_details', walking_job_detailsSchema);