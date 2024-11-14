const mongoose = require('mongoose');
const { Schema } = mongoose;

const salarySchema = new Schema({
  salary_range: {
    type: String,
    required: true,
    unique: true,
  },
  details: {
    type: String
  },
  active: {
    type: String,
    default: 'Yes',
    enum: ["Yes", "No"],
  },
},
  { collection: 'salary_range' });

module.exports = mongoose.model('salary_range', salarySchema);
