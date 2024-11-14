const mongoose = require('mongoose');

const CommentsTagDetailsSchema = mongoose.Schema({

    // Comments Code
    comments_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds_post_comments',
        required: true,
    },

    // Tag Employee Code
    tag_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Post Employee Code
    post_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Tag Datetime
    tag_datetime: {
        type: Date,
        default: Date.now,
    },

},
{ collection: 'comments_tag_details' });

module.exports = mongoose.model('comments_tag_details', CommentsTagDetailsSchema);