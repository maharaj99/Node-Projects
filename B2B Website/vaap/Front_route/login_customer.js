//imports
const express = require('express');
const router = express.Router();
const login = require('../model/customerMasterSchema');
const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');




//............................................................................
// ROUTER : Login via username,password ( POST method api : /customer/login/UserName )
//........................................................................

router.post('/userName', [

    body('user_name')
        .notEmpty().withMessage('User Name Empty !')
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
                    user_name,
                    password
                } = req.body;

                // Check User Name valid or not
                const isEmail = /\S+@\S+\.\S+/.test(user_name);

                let UserDetails;
                if (isEmail) {
                    // If the provided user_name is an email, find the user by email
                    UserDetails = await login.findOne({ email: user_name });
                } else {
                    // If the provided user_name is not an email, find the user by username
                    UserDetails = await login.findOne({ user_name: user_name });
                }

  
                if (!UserDetails) {
                    return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
                }
                
                // Paswword check
                const passwordCompare = await bcrypt.compare(password, UserDetails.password);
                if (!passwordCompare) {
                    return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
                }


                // If username and password match
                const data = {
                    id: UserDetails.id
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