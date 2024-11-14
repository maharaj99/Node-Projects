const mongoose = require('mongoose');

const mongoURL = "mongodb+srv://bhuniasourav11:w8CoG7aFl7ULL98j@cluster0.00ezbfk.mongodb.net/";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
