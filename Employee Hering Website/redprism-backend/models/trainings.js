const mongoose = require('mongoose');
const { Schema } = mongoose;

const trainingSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  details: {
    type: String,
    required: true
  },
  trainings_poster: {
    type: String,
    required: true
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  }
},
  { collection: 'training' });

module.exports = mongoose.model('training', trainingSchema);