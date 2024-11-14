const mongoose = require('mongoose');
const { Schema } = mongoose;

const sample_resumeSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  
  type: {
    type: String,
    required: true
  },

  details: {
    type: String,
    required: true
  },
  resume_image: {
    type: String,
    required: true
  },
  resume_file: {
    type: String,
    required: true
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  }
},
  { collection: 'sample_resume' });

module.exports = mongoose.model('sample_resume', sample_resumeSchema);