const express = require('express');
const router = express.Router();

const fileUpload = require('../middleware/uploadFile');

const CompanyDetails = require('../models/company_details');
const LocationDetails = require('../models/location_master');
const TechDetails = require('../models/technology_master');
const ExpDetails = require('../models/experience_master');
const Trainings = require('../models/trainings');
const Settings = require('../models/settings');
const ServiceAreaDetails = require('../models/service_area_details');
const SalaryRangeDetails = require('../models/salary_range');
const sample_resume = require('../models/sample_resume');


router.post('/salary-range', async (req, res) => {

    const {
        salary_range,
        details
    } = req.body;

    SalaryRangeDetails.create({
        salary_range: salary_range,
        details: details
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/service', async (req, res) => {

    const {
        service_area,
        details
    } = req.body;

    ServiceAreaDetails.create({
        service_area: service_area,
        details: details
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/settings', async (req, res) => {

    const {
        job_post_auto_approve
    } = req.body;

    let SettingsData = await Settings.findOne();

    if (SettingsData) {
        Settings.findByIdAndUpdate(
            {
                _id: SettingsData.id
            },
            {
                job_post_auto_approve: job_post_auto_approve,
            }
        )
            .then(data => {
                return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: data.id });
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ status: 'error', mssg: err.message });
            })
    }
    else {
        Settings.create({
            job_post_auto_approve: job_post_auto_approve,
        })
            .then(data => {
                return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ status: 'error', mssg: err.message });
            })
    }

})

router.post('/company', async (req, res) => {

    const {
        company_name,
        ph_num,
        logo,
        banner
    } = req.body;

    CompanyDetails.create({
        company_name: company_name,
        ph_num: ph_num,
        logo: logo,
        banner: banner
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/location', async (req, res) => {

    const {
        state,
        city,
        area
    } = req.body;

    LocationDetails.create({
        state: state,
        city: city,
        area: area
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/tech', async (req, res) => {

    const {
        tech_name,
        details
    } = req.body;

    TechDetails.create({
        tech_name: tech_name,
        details: details
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/exp', async (req, res) => {

    const {
        experience,
        details
    } = req.body;

    ExpDetails.create({
        experience: experience,
        details: details
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/trainings', fileUpload.trainingPoster, async (req, res) => {

    // check file exist or not and get the flie name 
    if (!req.file) {
        return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid Training Poster File' });
    }

    const {
        destination,
        filename,
        path
    } = req.file;

    const {
        title,
        details
    } = req.body;

    Trainings.create({
        title: title,
        details: details,
        trainings_poster: 'training_psoter/' + filename,
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

router.post('/sample_resume', fileUpload.sampleResume, async (req, res) => {

    let resume_image = "sample_resume/"+req.files.resume_image[0].filename;
    let resume_file = "sample_resume/"+req.files.resume_file[0].filename;

    const {
        title,
        details
    } = req.body;

    sample_resume.create({
        title: title,
        details: details,
        resume_image: resume_image,
        resume_file: resume_file,
    })
        .then(data => {
            return res.status(200).json({ status: 'success', mssg: 'Data Saved Successfully', id: data.id });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ status: 'error', mssg: err.message });
        })

})

module.exports = router;