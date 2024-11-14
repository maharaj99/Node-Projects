const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Allowed Document Extension
var allowedMimesDocument = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const allowedimages = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]; // Add allowed mime types for files

//.....................
// Systeminfo
//.....................
exports.systemConfigImage = (req, res, next) => 
{

    // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/systemInfo_images');
    },
    filename: (req, file, callback) => {
        callback(null, "images"+Date.now() + path.extname(file.originalname));
    }
});

// Check the file mime type (Extension)
let fileFilter = function (req, file, cb) {

    if (file.fieldname === 'logo') {
        if (allowedimages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file1 .'
            }, false);
        }

    }
    if (file.fieldname === 'favicon') {

      if (allowedimages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file2'
            }, false);
        }
    }

};

// Declare upload filed name and multer check file mb and upload it 
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 Mb Max File Size
    },
    fileFilter: fileFilter
}).fields([{ name: 'logo' }, { name: 'favicon' }])

const {userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body


// If any error occured then return the error otherwise go to the next 
upload(req, res, function (error) {
  
  req.body.userCode = userCode;
  req.body.loginEntryPermision = loginEntryPermision;
  req.body.loginEditPermision=loginEditPermision;


    if (error) { //instanceof multer.MulterError
        // console.log(error);
        if (error.code == 'LIMIT_FILE_SIZE') {
            return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: error.message });
        }
    }
    next();

})

}


// ===================================================
// profile_images Upload:admin
// ===================================================
exports.user_profileimages = (req, res, next) => 
{
      // Declare the upload path and image unique name
      const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/profile_images');
        },
        filename: (req, file, callback) => {
            callback(null, "profileimg"+Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {

        if (file.fieldname === 'profile_images') {
            if (allowedimages.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb({
                    success: false,
                    message: 'Invalid file'
                }, false);
            }

        }

    };

    // Declare upload filed name and multer check file mb and upload it 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 Mb Max File Size
        },
        fileFilter: fileFilter,
    }).single('profile_images'); 

    const{userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {
      
      req.body.userCode = userCode;
      req.body.loginEntryPermision = loginEntryPermision;
      req.body.loginEditPermision=loginEditPermision;


        if (error) { //instanceof multer.MulterError
            // console.log(error);
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: error.message });
            }
        }
        next();

      })

}


