const mongoose = require('mongoose');

const ServiceAreaDetailsSchema = mongoose.Schema({
  service_area: {
    type: String,
    unique: true,
    required: true
  },
  details: {
    type: String,
    default: '',
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  },
},
{ collection: 'service_area_details' });

module.exports = mongoose.model('service_area_details', ServiceAreaDetailsSchema);