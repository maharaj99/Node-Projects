const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';
const Customer = require('../model/customerMasterSchema');

const customerverifyUser = async (req, res, next) => {
  
  // Get the user from api header authtoken 
  const token = req.header('auth-token');

  if (!token) {
    req.body.userCode = "";
  }

  try {
    const data = jwt.verify(token, jwtSign);

    const customerDetails = await Customer.findOne({ _id: data.id });

    if (customerDetails) {
      req.body.userCode = data.id;
    } else {
      req.body.userCode = "";
    }

  } catch (error) {
    req.body.userCode = "";
  }

  next();
};

module.exports = customerverifyUser;
