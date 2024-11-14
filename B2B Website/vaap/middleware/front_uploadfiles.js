const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');



// Allowed Document Extension
var allowedMimesDocument = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 'text/plain',
];
const allowedimages = ['image/jpeg', 'image/jpg', 'image/png','image/gif']; // Add allowed mime types for files

const allowedfile=
['application/pdf',
'application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'text/plain','image/jpeg', 'image/jpg', 'image/png' ,'image/gif']


// ===================================================
// user Document Upload
// ===================================================

exports.userDocument = (req, res, next) => {
    
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
      destination: (req, file, callback) => {
          callback(null, './uploads/file_upload');
      },
      filename: (req, file, callback) => {
          callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      }
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {

      if (file.fieldname === 'upload_file_1') {
          if (allowedMimesDocument.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid upload file1 .'
              }, false);
          }

      }
      if (file.fieldname === 'upload_file_2') {

        if (allowedMimesDocument.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid upload file2'
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
  }).fields([{ name: 'upload_file_1' }, { name: 'upload_file_2' }])
  
  const{userCode}  = req.body;

  // If any error occured then return the error otherwise go to the next 
  upload(req, res, function (error) {

    req.body.userCode = userCode;


      if (error) { //instanceof multer.MulterError
          // console.log(error);
          if (error.code == 'LIMIT_FILE_SIZE') {
              return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
          }
          else {
              return res.status(200).json({ status: 'error', mssg: error.message });
          }
      }
      else {
          // If file not blank then check error 
          
          let mssg = ''
          if (!req.files.upload_file_1) {
              mssg= 'Please Upload A Valid  upload file 1';
              return res.status(200).json({ status: 'error', mssg });

          }
          else if (!req.files.upload_file_2) {
              mssg= 'Please Upload A Valid upload file 2';
              return res.status(200).json({ status: 'error', mssg });

          }

          next();
      }

  })

}




// ===================================================
// customer profile_images Upload
// ===================================================
exports.customer_profileimages = (req, res, next) => 
{
      // Declare the upload path and image unique name
      const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/customer_images');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname+Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {

        if (file.fieldname === 'customer_image') {
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
    }).single('customer_image'); 

    const{userCode}  = req.body; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {
      
      req.body.userCode = userCode;
    

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
// Flovor images Upload
// ===================================================
exports.Flavor_images = (req, res, next) => 
{

    // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/product_images');
    },
    filename: (req, file, callback) => {
        callback(null, "img"+Date.now() + path.extname(file.originalname));
    }
});

// Check the file mime type (Extension)
let fileFilter = function (req, file, cb) {

    if (file.fieldname === 'flavor_images') {
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
}).single('flavor_images'); 

// If any error occured then return the error otherwise go to the next 
upload(req, res, function (error) {

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

};





//home page images
exports.imageapi = (req, res, next) => {
    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, "./uploads/imagelogoapi");
      },
      filename: (req, file, callback) => {
        callback(
          null,
          "image" + Date.now() + path.extname(file.originalname)
        );
      },
    });
  
    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {
      if (file.fieldname === "imageone") {
        if (allowedimages.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            {
              success: false,
              message: "Invalid file1 .",
            },
            false
          );
        }
      }
      if (file.fieldname === "imagetwo") {
        if (allowedimages.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            {
              success: false,
              message: "Invalid file2",
            },
            false
          );
        }
      }
      if (file.fieldname === "imagethree") {
          if (allowedimages.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              {
                success: false,
                message: "Invalid file3",
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
    }).fields([{ name: "imageone" }, { name: "imagetwo" },{name: "imagethree"}]);
  
    // If any error occured then return the error otherwise go to the next
    upload(req, res, function (error) {
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


  
// Brand Logo Image 
exports.brand = (req, res, next) => {
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./uploads/brandlogo");
    },
    filename: (req, file, callback) => {
      let filename = "image" + Date.now() + path.extname(file.originalname);
      callback(null, `${filename}`);
    },
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {
    if (file.fieldname === "brand_image") {
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
  }).single("brand_image");

  // If any error occured then return the error otherwise go to the next
  upload(req, res, function (error) {
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





// ===================================================
// user pactAct document file Upload
// ===================================================

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

      if (file.fieldname === 'upload_file_1') {
          if (allowedfile.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid file1 .'
              }, false);
          }

      }
      if (file.fieldname === 'upload_file_2') {

        if (allowedfile.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid file2'
              }, false);
          }
      }
      if (file.fieldname === 'upload_file_3') {

        if (allowedfile.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid file3'
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
  
  const{userCode}  = req.body;

  // If any error occured then return the error otherwise go to the next 
  upload(req, res, function (error) {

    req.body.userCode = userCode;


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


exports.updateDocument = (req, res, next) => {
    
  // Declare the upload path and image unique name
  const storage = multer.diskStorage({
      destination: (req, file, callback) => {
          callback(null, './uploads/file_upload');
      },
      filename: (req, file, callback) => {
          callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      }
  });

  // Check the file mime type (Extension)
  let fileFilter = function (req, file, cb) {

      if (file.fieldname === 'upload_file_1') {
          if (allowedMimesDocument.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid upload file1 .'
              }, false);
          }

      }
      if (file.fieldname === 'upload_file_2') {

        if (allowedMimesDocument.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb({
                  success: false,
                  message: 'Invalid upload file2'
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
  }).fields([{ name: 'upload_file_1' }, { name: 'upload_file_2' }])
  
  const{userCode}  = req.body;

  // If any error occured then return the error otherwise go to the next 
  upload(req, res, function (error) {

    req.body.userCode = userCode;


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

