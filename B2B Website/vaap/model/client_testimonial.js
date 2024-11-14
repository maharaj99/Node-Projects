const mongoose = require('mongoose');

const ClientTestimonialSchema = new mongoose.Schema({
    client_name: {
        type: String,
        require: true,
    },
    client_mssg: {
        type: String,
        require: true,
    },
    active: {
        type: String,
        enum: ["Yes", "No"],
        default: "Yes",
    },
    order_no: {
        type: Number,
        require: true,
    },
    entry_user_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_master',
        default: null
    },
    entry_timestamp: {
        type: Date,
        default: Date.now
    }
}, { collection: 'client_testimonial' });

module.exports = mongoose.model('client_testimonial', ClientTestimonialSchema);
