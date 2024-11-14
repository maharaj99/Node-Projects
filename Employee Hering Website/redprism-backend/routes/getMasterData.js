const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const TechDetails = require('../models/technology_master');
const LocationDetails = require('../models/location_master');
const CompanyDetails = require('../models/company_details');
const SalaryRange = require('../models/salary_range');
const ExpDetails = require('../models/experience_master');
const ServiceArea = require('../models/service_area_details');


const { body, validationResult } = require('express-validator');

// ===================================================
// ROUTER : 1 Get Tech List ( GET method api : /api/getMasterData/getTechList )
// ===================================================
router.get('/getTechList', async (req, res) => {

    try {
        // Fetch Tech List
        let techList = await TechDetails.find({ active: "Yes" })
            .select('tech_name').lean();

        if (techList) {
            return res.status(200).json({ status: 'success', mssg: 'Tech List Fetched Successfully', techList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})


// ===================================================
// ROUTER : 2 Get Company List ( GET method api : /api/getMasterData/getCompanyList )
// ===================================================
router.get('/getCompanyList', verifyUser, async (req, res) => {

    try {
        // Fetch Company List
        let companyList = await CompanyDetails.find({ active: "Yes" })
            .select('company_name').lean();

        if (companyList) {
            return res.status(200).json({ status: 'success', mssg: 'Company List Fetched Successfully', companyList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})


// ===================================================
// ROUTER : 3 Get Location List ( GET method api : /api/getMasterData/getLocationList )
// ===================================================
router.get('/getLocationList', verifyUser, async (req, res) => {

    try {
        // Fetch Location List
        let locationList = await LocationDetails.find({ active: "Yes" })
            .select('state').select('city').select('area').lean();

        if (locationList) {
            return res.status(200).json({ status: 'success', mssg: 'Location List Fetched Successfully', locationList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

// ===================================================
// ROUTER : 4 Get Salary Range List ( GET method api : /api/getMasterData/getSalaryRange )
// ===================================================
router.get('/getSalaryRange', verifyUser, async (req, res) => {

    try {
        // Fetch Location List
        let salaryRangeList = await SalaryRange.find({ active: "Yes" })
            .select('salary_range').lean();

        if (salaryRangeList) {
            return res.status(200).json({ status: 'success', mssg: 'Salary Range List Fetched Successfully', salaryRangeList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

// ===================================================
// ROUTER : 5 Get Experince List ( GET method api : /api/getMasterData/getExpList )
// ===================================================
router.get('/getExpList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let expList = await ExpDetails.find({ active: "Yes" })
            .select('experience').lean();

        if (expList) {
            return res.status(200).json({ status: 'success', mssg: 'Exp List Fetched Successfully', expList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

// ===================================================
// ROUTER : 6 Get Service Area List ( GET method api : /api/getMasterData/getServiceAreaList )
// ===================================================
router.get('/getServiceAreaList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let serviceAreaList = await ServiceArea.find({ active: "Yes" })
            .select('service_area').lean();

        if (serviceAreaList) {
            return res.status(200).json({ status: 'success', mssg: 'Service Area List Fetched Successfully', serviceAreaList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

module.exports = router;