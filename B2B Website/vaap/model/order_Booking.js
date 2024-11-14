const mongoose=require('mongoose');
const orderBooking_Schema=new mongoose.Schema
({
    
    orderNum:{
        type: String,
        required:true
    },
    Customer_code:{
        type: String,
        required: true,
    },
    product_code:{
        type: String,
        required: true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    shipping:{
        type:Number,
        required:true,
    },
    charges:{
        type:Number,
        required:true,
    },
    Status:{
        type:Number,
        required:true,
    }
})
module.exports=mongoose.model('orderBooking',orderBooking_Schema);