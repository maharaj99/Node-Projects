const mongoose = require('mongoose');
const { Schema } = mongoose;

const company_detailsSchema = new Schema({
  company_name: {
    type: String,
    unique: true,
    required: true
  },
  ph_num: {
    type: Number,
    unique: true,
    required: true,
    maxLength: 10,
  },
  logo: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  }
},
{ collection: 'company_details' });

module.exports = mongoose.model('company_details', company_detailsSchema);