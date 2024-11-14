const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  },
},
{ collection: 'location' });

module.exports = mongoose.model('location', locationSchema); // send the data to collection "location" in mongo 

