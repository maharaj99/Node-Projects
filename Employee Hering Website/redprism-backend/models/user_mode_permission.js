
const mongoose = require('mongoose');

const UserModePermissionSchema = new mongoose.Schema({
    user_mode_code: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "user_mode",
    },
    // Change menu_array to menu_list in schema definition
    menu_code: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "menu_master", // Use 'ref' instead of 'rel'
    },
    sub_menu_code: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "sub_menu_master", // Use 'ref' instead of 'rel'
    },
    type: {
        type: String,
        enum: ["Menu", "Sub Menu"],
    },
    entry_user_code: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    entry_timestamp: {
        type: Date,
        default: Date.now(),
    }
}, { collection: 'user_mode_permission' });

module.exports = mongoose.model('user_mode_permission', UserModePermissionSchema);

























