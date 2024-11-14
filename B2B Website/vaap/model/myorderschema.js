const mongoose = require('mongoose');

const MyordersSchema= new mongoose.Schema({
        order_name:{
            type:String,
            require:true
        },
        quantity:{
            type:String,
            require:true,
        },
        date:{
            type:Date,
            require:true,
        },
        
},{ collection: 'myordersSchema' })

module.exports = mongoose.model('myordersSchema',MyordersSchema);

