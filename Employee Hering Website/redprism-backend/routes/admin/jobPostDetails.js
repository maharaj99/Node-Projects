const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../../middleware/adminVerifyUser');

const JobPostDetails = require('../../models/job_post_details');
const Employee = require('../../models/EmployeeDetails');
const SalaryRange = require('../../models/salary_range');
const ServiceArea = require('../../models/service_area_details');


const { body, validationResult } = require('express-validator');



//get location list
const location = require("../../models/location_master");

router.get('/location/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const Alllocation = await location.find({active:"Yes"}, { _id: 1,state:1,city:1,area:1});
      res.status(200).json({ status: 'sucess', mssg: 'All location fetch', data: Alllocation });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


//get technology list
const technology = require("../../models/technology_master");

router.get('/technology/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const technologys = await technology.find({active:"Yes"}, { _id:1,tech_name:1});
      res.status(200).json({ status: 'sucess', mssg: 'All Technology fetch', data: technologys });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});



//get company list
const CompanyDetails = require('../../models/company_details');

router.get('/CompanyDetails/list', verifyUser, async (req, res) => {
  try {

    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
    const companyDetails = await CompanyDetails.find({active:"Yes"},{_id:1,company_name:1});
    res.status(200).json({ status: 'success', data: companyDetails, mssg: 'Company details fatched' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});


//get salary Range
router.get('/SalaryRange/list', verifyUser, async (req, res) => {
    try {
  
      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
      const SalaryRangeDetails = await SalaryRange.find({active:"Yes"},{_id:1,salary_range:1});
      res.status(200).json({ status: 'success', data: SalaryRangeDetails, mssg: 'Salary Range fatched' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });


  //get experiences list
const experiences = require("../../models/experience_master");

router.get('/experiences/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const Allexperience = await experiences.find({active:"Yes"}, {_id:1,experience:1});
      res.status(200).json({ status: 'sucess', mssg: 'All Experience fetch', data: Allexperience });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


//service_area_details
router.get('/serviceArea/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const AllServiceAreaDetails = await ServiceArea.find({active:"Yes"}, { _id:1,service_area:1});
        res.status(200).json({ status: 'sucess', mssg: 'All Service Area Details fetch', data: AllServiceAreaDetails });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });


//employee Details
router.get('/employee/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const AllEmployeeDetails = await Employee.find({active:"Yes"}, { _id:1,first_name:1,last_name:1,user_name:1,ph_num:1,email_id:1});
        res.status(200).json({ status: 'sucess', mssg: 'All Employee Details fetch', data: AllEmployeeDetails });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });



// ===================================================
//  Save Job Post 
// ===================================================

router.post('/saveJobPost', verifyUser, [

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Technology Value Is Invalid !'),

    body('locations.*.location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('company_code')
        .notEmpty().withMessage('Company Empty !')
        .isMongoId().withMessage('Company Value Is Invalid !'),

    body('salary_range_code')
        .notEmpty().withMessage('Salary Range Empty !')
        .isMongoId().withMessage('Salary Range Value Is Invalid !'),

    body('exp_code')
        .notEmpty().withMessage('Experience Empty !')
        .isMongoId().withMessage('Experience Value Is Invalid !'),

    body('service_area_code')
        .notEmpty().withMessage('Service Area Empty !')
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('targeted_employee')
        .notEmpty().withMessage('Targeted Employee Empty !')
        .isIn(['Fresher', 'All']).withMessage('Targeted Employee does contain invalid value'),

    body('job_title')
        .notEmpty().withMessage('Job Title Empty !'),

    body('designation')
        .notEmpty().withMessage('Designation Empty !'),

    body('description')
        .notEmpty().withMessage('Description Empty !'),

    body('email')
        .notEmpty().withMessage('Email Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body('status')
        .notEmpty().withMessage('status Empty !')
        .isIn(["Pending" , "Approved" , "Reject" , "Closed"]).withMessage('status contain invalid value'),

    
    body('post_employee_code')
        .notEmpty().withMessage('Employee code Empty !')
        .isMongoId().withMessage('Employee code Is Invalid !'),


], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                tech_code,
                locations,
                company_code,
                salary_range_code,
                exp_code,
                service_area_code,
                targeted_employee,
                job_title,
                designation,
                description,
                email,
                ph_num,
                status,
                post_employee_code

            } = req.body;


            let getUserDetails = await Employee.findById({_id:post_employee_code});

            let post_employee_type = getUserDetails.employee_type;

            JobPostDetails.create({
                tech_code: tech_code,
                locations: locations,
                company_code: company_code,
                salary_range_code: salary_range_code,
                exp_code: exp_code,
                service_area_code: service_area_code,
                targeted_employee: targeted_employee,
                job_title: job_title,
                designation: designation,
                description: description,
                email: email,
                ph_num: ph_num,
                status: status,
                post_employee_code: post_employee_code,
                post_employee_type: post_employee_type,
            })
                .then(job_post => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Job Post Save Successfully',
                        Job_post_id: job_post.id
                    });
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({ status: 'error', mssg: err.message });
                })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})




  //delete
  router.post('/delete', verifyUser,
  [
    body('jobPost_code').notEmpty().withMessage('Job Post code ID is Empty !')
      .isMongoId().withMessage('Job Post code ID Value Is Invalid !'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const jobPost_code = req.body.jobPost_code;

        const loginDeletePermision = req.body.loginDeletePermision;
        // Check if the login user has Delete permission
        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }

        const jobPostToDelete = await JobPostDetails.findById(jobPost_code);
        if (!jobPostToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Job post not found' });
        }

        const result = await JobPostDetails.findByIdAndDelete(jobPost_code);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Job post deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Job post' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



  //get job post
  router.get('/jobPost/list', verifyUser, async (req, res) => {
    try {
        let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      const JobPostDetail = await JobPostDetails.aggregate([
        {
            $lookup:
            {
                from: "technology",
                localField: "tech_code",
                foreignField: "_id",
                as: 'technology'
            }
        },
        {
            $lookup:
            {
                from: "location",
                localField: "locations.location_code",
                foreignField: "_id",
                as: 'location'
            }
        },
        {
            $lookup:
            {
                from: "company_details",
                localField: "company_code",
                foreignField: "_id",
                as: 'company_details'
            }
        },
        {
            $lookup:
            {
                from: "salary_range",
                localField: "salary_range_code",
                foreignField: "_id",
                as: 'salary_range'
            }
        },
        {
            $lookup:
            {
                from: "experience_master",
                localField: "exp_code",
                foreignField: "_id",
                as: 'experience_master'
            }
        },
        {
            $lookup:
            {
                from: "service_area_details",
                localField: "service_area_code",
                foreignField: "_id",
                as: 'service_area_details'
            }
        },
        {
            $lookup:
            {
                from: "employee_details",
                localField: "post_employee_code",
                foreignField: "_id",
                as: 'employee_details'
            }
        },
        { $sort: { post_datetime: -1 } },
        {
            $project: {
                "_id": 1,
                "technology._id": 1,
                "technology.tech_name": 1,
                "location._id": 1,
                "location.state": 1,
                "location.city": 1,
                "location.area": 1,
                "company_details._id": 1,
                "company_details.company_name": 1,
                "salary_range._id": 1,
                "salary_range.salary_range": 1,
                "experience_master._id": 1,
                "experience_master.experience": 1,
                "service_area_details._id": 1,
                "service_area_details.service_area": 1,
                "employee_details._id":1,
                "employee_details.employee_type":1,
                "employee_details.user_name":1,
                "employee_details.first_name":1,
                "employee_details.last_name":1,
                "employee_details.ph_num":1,
                "employee_details.email_id":1,
                "targeted_employee": 1,
                "job_title": 1,
                "designation": 1,
                "description": 1,
                "email": 1,
                "ph_num": 1,
                "status": 1,
                "post_datetime": 1,
            }
        },

    ]);
      if (JobPostDetail.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Job Post details not found' });
      }
  
      return res.status(200).json({ status: 'success', mssg: 'Job Post detailsfetched successfully', data: JobPostDetail });
  
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



  router.post('/update', verifyUser,[
    body('jobPost_code').notEmpty().withMessage('jobPost code is required!')
    .isMongoId().withMessage('jobPost code ID Value Is Invalid !'),
    
    body('tech_code')
    .notEmpty().withMessage('Technology Empty !')
    .isMongoId().withMessage('Technology Value Is Invalid !'),

body('locations.*.location_code')
    .notEmpty().withMessage('Location Empty !')
    .isMongoId().withMessage('Location Value Is Invalid !'),

body('company_code')
    .notEmpty().withMessage('Company Empty !')
    .isMongoId().withMessage('Company Value Is Invalid !'),

body('salary_range_code')
    .notEmpty().withMessage('Salary Range Empty !')
    .isMongoId().withMessage('Salary Range Value Is Invalid !'),

body('exp_code')
    .notEmpty().withMessage('Experience Empty !')
    .isMongoId().withMessage('Experience Value Is Invalid !'),

body('service_area_code')
    .notEmpty().withMessage('Service Area Empty !')
    .isMongoId().withMessage('Service Area Value Is Invalid !'),

body('targeted_employee')
    .notEmpty().withMessage('Targeted Employee Empty !')
    .isIn(['Fresher', 'All']).withMessage('Targeted Employee does contain invalid value'),

body('job_title')
    .notEmpty().withMessage('Job Title Empty !'),

body('designation')
    .notEmpty().withMessage('Designation Empty !'),

body('description')
    .notEmpty().withMessage('Description Empty !'),

body('email')
    .notEmpty().withMessage('Email Empty !')
    .isEmail().withMessage('Enter A Valid Email !'),

body('ph_num')
    .notEmpty().withMessage('Phone Number Empty !')
    .isMobilePhone().withMessage('Enter A Valid Phone Number !')
    .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

body('status')
    .notEmpty().withMessage('status Empty !')
    .isIn(["Pending" , "Approved" , "Reject" , "Closed"]).withMessage('status contain invalid value'),


body('post_employee_code')
    .notEmpty().withMessage('Employee code Empty !')
    .isMongoId().withMessage('Employee code Is Invalid !'),

  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
  try {
  
        const {
                jobPost_code,
                tech_code,
                locations,
                company_code,
                salary_range_code,
                exp_code,
                service_area_code,
                targeted_employee,
                job_title,
                designation,
                description,
                email,
                ph_num,
                status,
                post_employee_code,
                loginEditPermision
        } = req.body;
  
        //check the login user have View permission
        if (loginEditPermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
       }
  
       let getUserDetails = await Employee.findById({_id:post_employee_code});

       let post_employee_type = getUserDetails.employee_type;

        const updatedJobPostDetails = await JobPostDetails.findByIdAndUpdate(jobPost_code, {
            tech_code: tech_code,
                locations: locations,
                company_code: company_code,
                salary_range_code: salary_range_code,
                exp_code: exp_code,
                service_area_code: service_area_code,
                targeted_employee: targeted_employee,
                job_title: job_title,
                designation: designation,
                description: description,
                email: email,
                ph_num: ph_num,
                status: status,
                post_employee_code: post_employee_code,
                post_employee_type: post_employee_type,
        }, { new: true });
  
        if (updatedJobPostDetails) {
          res.status(200).json({ status: 'success', mssg: 'JobPost Details updated successfully', data: updatedJobPostDetails });
        } else {
          res.status(200).send({ status: 'error', mssg:'JobPost Detail id not found'});
        }
  
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



module.exports=router;