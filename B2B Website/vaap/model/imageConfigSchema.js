const mongoose = require('mongoose');

const ImageConfigSchema = new mongoose.Schema({
        imageone:{
            type:String,
            require:true
        },
        imagetwo:{
            type:String,
            require:true,
        },
        imagethree:{
            type:String,
            require:true,
        },
        socials:{
            type:String,
            require:true,
        },
},{ collection: 'imageconfigschema' })

module.exports = mongoose.model('imageconfigschema',ImageConfigSchema);

