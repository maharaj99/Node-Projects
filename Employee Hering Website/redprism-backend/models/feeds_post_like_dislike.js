const mongoose = require('mongoose');

const FeedsPostLikeDislikeSchema = mongoose.Schema({

    feeds_post_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds_post',
        required: true,
    },
    employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["Like", "Dislike"],
    },
    datetime: {
        type: Date,
        default: Date.now,
    },

},
{ collection: 'feeds_post_like_dislike' });

module.exports = mongoose.model('feeds_post_like_dislike', FeedsPostLikeDislikeSchema);