const mongoose=require('mongoose');
const customerDeliveryAddress_Schema=new mongoose.Schema
({
    
    Customer_code:{
        type: String,
        required:true
    },
    First_name:{
        type: String,
        required: true,
    },
    last_name:{
        type: String,
        required: true,
    },
    country:{
        type: String,
        required: true,
    },
    Address:{
        type: String,
        required: true,
    },
    State:{
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true,
    },
    Zip:{
        type:Number,
        required:true,
    },
    PhNum:{
        type:Number,
        required:true,
    },
    Email:{
        type: String,
        required: true,
    }

})
module.exports=mongoose.model('customerDeliveryAddress',customerDeliveryAddress_Schema);