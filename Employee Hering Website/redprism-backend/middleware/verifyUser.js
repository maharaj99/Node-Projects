const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';
const Employee = require('../models/EmployeeDetails');

const verifyUser = async (req, res, next) => {

    // Get the user from api header authtoken 
    const token = req.header('auth-token');

    if (!token) {
        return res.status(200).json({ status: 'access denied', mssg: 'Authentication Token Not Valid', });
    }

    try {
        const data = jwt.verify(token, jwtSign);

        let employeeDetails = await Employee.findOne({ _id: data.id, active: "Yes" })

        if (!employeeDetails) {
            res.status(200).json({ status: 'access denied', mssg: 'Not A Valid User', });
        }
        else {
            req.body.userCode = data.id;
            next();
        }

    } catch (error) {
        res.status(200).json({ status: 'access denied', mssg: 'Authentication Token Not Valid', error });
    }
}

module.exports = verifyUser;