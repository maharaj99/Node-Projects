const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema
  ({
    // Job Post Auto Approve
    job_post_auto_approve: {
      type: String,
      required: true,
      enum: ["Yes", "No"]
    },
  },
    { collection: 'settings' })
module.exports = mongoose.model('settings', settingsSchema);