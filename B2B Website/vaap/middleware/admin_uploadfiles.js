const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Allowed Document Extension
var allowedMimesDocument = [
  "application/pdf",
  // "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // "text/plain",
];
const allowedimages = ["image/jpeg", "image/png",'image/gif']; // Add allowed mime types for files








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



// ===================================================
// profile_images Upload:customer
// ===================================================
exports.customerFileAndImage = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      if (file.fieldname === 'customer_image') {
        callback(null, './uploads/customer_images');
      } else {
        callback(null, './uploads/file_upload');
      }
    },
    filename: (req, file, callback) => {
      callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
  });

  const fileFilter = function (req, file, cb) {
    if (file.fieldname === 'customer_image') {
      if (allowedimages.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb({ success: false, message: 'Invalid image format' }, false);
      }
    } else {
      if (allowedMimesDocument.includes(file.mimetype)) {
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
  }).fields([{ name: 'upload_file_1' }, { name: 'upload_file_2' }, { name: 'customer_image' }]);


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




// ===================================================
// product images Upload
// ===================================================
exports.product_images = (req, res, next) => 
{

    // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/product_images');
    },
    filename: (req, file, callback) => {
        callback(null, "product_img_"+Date.now() + path.extname(file.originalname));
    }
});

// Check the file mime type (Extension)
let fileFilter = function (req, file, cb) {

    if (file.fieldname === 'product_images_1') {
        if (allowedimages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file1 .'
            }, false);
        }

    }
    if (file.fieldname === 'product_images_2') {

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
}).fields([{ name: 'product_images_1' }, { name: 'product_images_2' }])

const{userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body


// If any error occured then return the error otherwise go to the next 
upload(req, res, function (error) {

  req.body.userCode = userCode;
  req.body.loginEntryPermision = loginEntryPermision;
  req.body.loginEditPermision = loginEditPermision;



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




// Upload Sub Product Image admin
exports.subproductimage = (req, res, next) => {
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./uploads/subProduct_images");
    },
    filename: (req, file, callback) => {
      let filename = "image" + Date.now() + path.extname(file.originalname);
      callback(null, `${filename}`);
    },
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {
    if (file.fieldname === "sub_product_image") {
      if (allowedimages.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          {
            success: false,
            message: "Invalid file .",
          },
          false
        );
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
  }).single("sub_product_image");

  const{userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body


  // If any error occured then return the error otherwise go to the next
  upload(req, res, function (error) {

    req.body.userCode = userCode;
    req.body.loginEntryPermision = loginEntryPermision; 
    req.body.loginEditPermision = loginEditPermision;

    if (error) {
      //instanceof multer.MulterError
      // console.log(error);
      if (error.code == "LIMIT_FILE_SIZE") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "File Size is too large. Allowed file size is 5 Mb",
          });
      } else {
        return res.status(200).json({ status: "error", mssg: error.message });
      }
    }
    next();
  });
};




// Upload Slider Image
exports.SliderImage = (req, res, next) => {
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./uploads/slider_image");
    },
    filename: (req, file, callback) => {
      let filename = "image" + Date.now() + path.extname(file.originalname);
      callback(null, `${filename}`);
    },
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {
    if (file.fieldname === "slider_image") {
      if (allowedimages.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          {
            success: false,
            message: "Invalid file .",
          },
          false
        );
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
  }).single("slider_image");

  const{userCode,loginEntryPermision,loginEditPermision}  = req.body; // For re add login user code in re.body


  // If any error occured then return the error otherwise go to the next
  upload(req, res, function (error) {

    req.body.userCode = userCode;
    req.body.loginEntryPermision = loginEntryPermision; 
    req.body.loginEditPermision = loginEditPermision;

    if (error) {
      //instanceof multer.MulterError
      // console.log(error);
      if (error.code == "LIMIT_FILE_SIZE") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "File Size is too large. Allowed file size is 5 Mb",
          });
      } else {
        return res.status(200).json({ status: "error", mssg: error.message });
      }
    }
    next();
  });
};




//.....................
//Systeminfo,Home_page
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
// user pactAct document file Upload
// ===================================================
const allowedfile=
['application/pdf',
'application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'text/plain','image/jpeg', 'image/jpg', 'image/png','image/gif']

exports.userPactfiles = (req, res, next) => {
    
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
      destination: (req, file, callback) => {
          callback(null, './uploads/pact_Act_files');
      },
      filename: (req, file, callback) => {
          callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      }
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {

      if (file.fieldname === 'upload_file_1'|| file.fieldname === 'upload_file_2' || file.fieldname === 'upload_file_3') {
          if (allowedfile.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid file .'
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
  }).fields([{ name: 'upload_file_1' }, { name: 'upload_file_2' },{ name: 'upload_file_3' }])
  
  const{userCode,loginEntryPermision,loginEditPermision}  = req.body; 

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