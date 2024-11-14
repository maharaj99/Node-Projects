const mongoose = require('mongoose');

const ClientReviewSchema= new mongoose.Schema({
        message:{
            type:String,
            require:true
        },
        user_name:{
            type:String,
            require:true,
        },
        designation:{
            type:String,
            require:true,
        },
        
},{ collection: 'clientreviewschema' })

module.exports = mongoose.model('clientreviewschema',ClientReviewSchema);