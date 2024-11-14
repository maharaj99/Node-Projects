const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');


// Allowed Image Extension 
var allowedMimesImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];

// Allowed Word & PDF Extension 
var allowedMimesWordPDF = [
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word.document.macroEnabled.12', 
    'application/pdf'
];


// ===================================================
// Training Poster Upload
// ===================================================
exports.trainingPoster = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/trainings_poster');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {
        if (allowedMimesImage.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file type. Only jpg, png image files are allowed.'
            }, false);
        }
    };

    // Declare upload filed name and multer check file mb and upload it 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 Mb Max File Size
        },
        fileFilter: fileFilter
    }).single('trainings_poster'); // upload.single('file')

    const{userCode,loginEntryPermision,loginEditPermision}  = req.body;
     // For re add login user code in re.body
    

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;
        req.body.loginEntryPermision = loginEntryPermision;
        req.body.loginEditPermision=loginEditPermision;
  

        if (error) { //instanceof multer.MulterError
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Invalid file type. Only jpg, png image files are allowed.' });
            }
        }
        else {

            next();
        }

    })
}



// ===================================================
// sample resume Upload
// ===================================================
exports.sampleResumeFileImage = (req, res, next) => {

    const storage = multer.diskStorage({
      destination: (req, file, callback) => {
        if (file.fieldname === 'resume_image' || file.fieldname === 'resume_file' ) {
          callback(null, './uploads/sample_resume');
        }
      },
      filename: (req, file, callback) => {
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      }
    });
  
    const fileFilter = function (req, file, cb) {
      if (file.fieldname === 'resume_image') {
        if (allowedMimesImage.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb({ success: false, message: 'Invalid image format' }, false);
        }
      } else {
        if (allowedMimesWordPDF.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb({ success: false, message: 'Invalid file format' }, false);
        }
      }
    };
  
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max file size
      },
      fileFilter: fileFilter,
    }).fields([{ name: 'resume_image' },{ name: 'resume_file' }]);
  
  
    const{userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body
  
  
    upload(req, res, function (error) {
      req.body.userCode = userCode;
      req.body.loginEntryPermision = loginEntryPermision; 
      req.body.loginEditPermision = loginEditPermision;
  
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 MB' });
        } else {
          return res.status(200).json({ status: 'error', mssg: error.message });
        }
      }
  
      next();
    });
  };
  