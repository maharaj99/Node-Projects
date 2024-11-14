const mongoose = require('mongoose');
const { Schema } = mongoose;

const experienceSchema = new Schema({
  experience: {
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
  }
},
{ collection: 'experience_master' });

module.exports = mongoose.model('experience_master', experienceSchema);