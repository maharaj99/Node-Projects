const express = require('express');
const { body, validationResult } = require('express-validator'); 
// Import 'body' and 'validationResult' from express-validator
const user = require('../model/admin_user_master');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';




// .....................................................
// ROUTER :Login via userid password ( POST method api :/admin/login/user
// ......................................................
router.post('/user', [
                                      
    body('user_id')
        .notEmpty().withMessage('user_id  Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

    body('password').notEmpty().withMessage('Password Empty !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                user_id,
                password
            } = req.body;

            // Check User Name valid or not
            let User = await user.findOne({ user_id: user_id,active:"Yes"});
            if (!User) {
                return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
            }

            // Paswword check
            const passwordCompare = await bcrypt.compare(password, User.password);
            if (!passwordCompare) {
                return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
            }


            // If username and password match
            const data = {
                id: User.id
            }
            const authToken = jwt.sign(data, jwtSign);
            res.status(200).json({ status: 'success', mssg: 'Login Successfully', authToken });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


module.exports = router;