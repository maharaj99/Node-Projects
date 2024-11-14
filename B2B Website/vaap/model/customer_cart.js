const mongoose=require('mongoose');

const customercart_Schema=new mongoose.Schema
({
    customer_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customermaster',
        required: true
    },
    product_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product_master',
        required: true
    },
    quantity:{
        type: Number,
        required:true
    }
})
module.exports = mongoose.model('customercart', customercart_Schema);
