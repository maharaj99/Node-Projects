const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://amaity535:zJ14fDfHyFXcpgbn@cluster0.pxipjqh.mongodb.net/redprism?retryWrites=true&w=majority';
// const mongoURI = 'mongodb://localhost:27017/redprism';

const connectToMongo = () => {
    const options = {
        autoIndex: true, // Don't build indexes
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
    };
    mongoose.connect(mongoURI, options).then(
        () => { console.log("Connect To Mongo Db"); },
        err => { console.log(err); }
    )
}

module.exports = connectToMongo;