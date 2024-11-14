const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Allowed Image Extension 
var allowedMimesImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];

// Allowed Image & PDF Extension 
var allowedMimesImagePDF = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'application/pdf'];

// Allowed Word & PDF Extension 
var allowedMimesWordPDF = [
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word.document.macroEnabled.12', 
    'application/pdf'
];

// Allowed Word & PDF & Image Extension 
var allowedMimesWordPdfImage = [
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word.document.macroEnabled.12', 
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'
];



// ===================================================
// Employee Profile Image Upload
// ===================================================
exports.employeeImage = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/employee_image');
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
                message: 'Invalid file type. Only image files are allowed.'
            }, false);
        }
    };

    // Declare upload filed name and multer check file mb and upload it 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 Mb Max File Size
        },
        fileFilter: fileFilter
    }).single('employee_image'); // upload.single('file')

    let userCode = req.body.userCode; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;

        // If file not blank then check error 
        if (error) { //instanceof multer.MulterError
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Invalid file type. Only image files are allowed.' });
            }
        }
        else {
            // If file not blank then check error 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
            }

            next();
        }
    })
}

// ===================================================
// Employee Resume Upload
// ===================================================
exports.resume = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/resume');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {
        if (allowedMimesWordPdfImage.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file type. Only image, word, pdf files are allowed.'
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
    }).single('resume'); // upload.single('file')

    let userCode = req.body.userCode; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;

        if (error) { //instanceof multer.MulterError
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Invalid file type. Only image, word, pdf files are allowed.' });
            }
        }
        else {
            // If file not blank then check error 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
            }
            next();
        }

    })
}

// ===================================================
// Employee Achievement
// ===================================================
exports.achievement = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/achievement');
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
    }).single('achievement'); // upload.single('file')

    let userCode = req.body.userCode; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;

        if (error) { //instanceof multer.MulterError
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Invalid file type. Only jpg, png image files are allowed.' });
            }
        }
        else {
            // If file not blank then check error 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
            }
            next();
        }

    })
}

// ===================================================
// Employee Apply Job Resume Upload
// ===================================================
exports.jobResume = (req, res, next) => {
    
    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/job_apply_resume');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {
        
        if (allowedMimesWordPdfImage.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb({
                success: false,
                message: 'Invalid file type. Only image, word and pdf files are allowed.'
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
    }).single('resume'); // upload.single('file')

    let userCode = req.body.userCode; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;

        if (error) { //instanceof multer.MulterError
            if (error.code == 'LIMIT_FILE_SIZE') {
                return res.status(200).json({ status: 'error', mssg: 'File Size is too large. Allowed file size is 5 Mb' });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Invalid file type. Only image, word and pdf files are allowed.' });
            }
        }
        else {
            // If file not blank then check error 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid Resume File' });
            }
            next();
        }

    })
}

// ===================================================
// Training Poster Upload
// ===================================================
exports.trainingPoster = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/training_psoter');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {
        if (allowedMimesImagePDF.includes(file.mimetype)) {
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
            // If file not blank then check error 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid Training Poster File' });
            }
            next();
        }

    })
}

// ===================================================
// Sample Resume Image File & Main File Upload
// ===================================================
exports.sampleResume = (req, res, next) => {
    
    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/sample_resume');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Check the file mime type (Extension)
    let fileFilter = function (req, file, cb) {

        if (file.fieldname === 'resume_image') {
            if (allowedMimesImage.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb({
                    success: false,
                    message: 'Invalid Sample Resume Image file .'
                }, false);
            }

        }
        if (file.fieldname === 'resume_file') {
            if (allowedMimesWordPDF.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb({
                    success: false,
                    message: 'Invalid Sample Resume file .'
                }, false);
            }
        }

    };

    // Declare upload filed name and multer check file mb and upload it 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: fileFilter
    }).fields([{ name: 'resume_image' }, { name: 'resume_file' }])

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
        else {
            // If file not blank then check error 
            
            let mssg = ''
            if (!req.files.resume_image) {
                mssg= 'Please Upload A Valid Resume Image';
            }
            if (!req.files.resume_file) {
                mssg= 'Please Upload A Valid Resume File';
            }

            if (mssg!=="") {
                if (req.files.resume_image) {
                    fs.remove('./uploads/sample_resume/' + req.files.resume_image[0].filename, err => {
                        if (err) return console.error(err)
                    })
                }
                if (req.files.resume_file) {
                    fs.remove('./uploads/sample_resume/' + req.files.resume_file[0].filename, err => {
                        if (err) return console.error(err)
                    })
                }
                return res.status(200).json({ status: 'error', mssg });
            }
            
            next();
        }

    })


}


// ===================================================
// Message Upload Attachment File
// ===================================================
exports.messageAttachment = (req, res, next) => {

    // Declare the upload path and image unique name
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './uploads/message_attachment');
        },
        filename: (req, file, callback) => {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    });

    // Declare upload filed name and multer check file mb and upload it 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 Mb Max File Size
        }
    }).single('attachment'); // upload.single('file')

    let userCode = req.body.userCode; // For re add login user code in re.body

    // If any error occured then return the error otherwise go to the next 
    upload(req, res, function (error) {

        req.body.userCode = userCode;

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





