const mongoose = require('mongoose');
const { Schema } = mongoose;

const techSchema = new Schema({
  tech_name: {
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
{ collection: 'technology' });

module.exports = mongoose.model('technology', techSchema);