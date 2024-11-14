const mongoose=require('mongoose');
const ShippingCost_Schema=new mongoose.Schema
({
    
    Country:{
        type: String,
        required:true
    },
    Zip:{
        type: Number,
        required: true,
    },
    cost:{
        type: Number,
        required: true,
    }

})
module.exports=mongoose.model('ShippingCost',ShippingCost_Schema);