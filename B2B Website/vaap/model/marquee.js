// Require Mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;


// Define the schema
const marqueeSchema = new Schema({
    content: {
    type: String,
    required: true
  }
},
{ collection: 'Marquee' });

// Create and export the model
const Marquee = mongoose.model('Marquee', marqueeSchema);

module.exports = Marquee;
