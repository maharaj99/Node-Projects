const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';
const User = require('../models/admin_user_master');

const adminverifyUser = async (req, res, next) => {

    // Get the user from api header authtoken 
    const token = req.header('auth-token');

    if (!token) {
        return res.status(200).json({ status: 'access denied', mssg: 'Authentication Token Not Valid', });
    }

    try {
        const data = jwt.verify(token, jwtSign);

        let UserDetails = await User.findOne({ _id: data.id, active: "Yes" })

        if (!UserDetails) {
            res.status(200).json({ status: 'access denied', mssg: 'Not A Valid User', });
        }
        else {

            req.body.userCode = data.id;

            req.body.loginEntryPermision = UserDetails.entry_permission;

            req.body.loginViewPermision = UserDetails.view_permission;

            req.body.loginEditPermision = UserDetails.edit_permission;

            req.body.loginDeletePermision = UserDetails.delete_permissioin;


            next();
        }

    } catch (error) {
        res.status(200).json({ status: 'access denied', mssg: 'Authentication Token Not Valid', error });
    }
}

module.exports = adminverifyUser;