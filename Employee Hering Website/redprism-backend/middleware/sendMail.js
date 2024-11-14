const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');

const Employee = require('../models/EmployeeDetails');
const JobDetails = require('../models/job_post_details');
const employee_search_details = require('../models/employee_search_details');

// ===================================================
// Job Apply Send Mail
// ===================================================
exports.jobApplySendMail = async (req, res) => {

    const {
        userCode,
        job_post_code,
        message
    } = req.body;

    let employee_code = userCode;

    // Get Employee Details
    let EmployeeDetails = await Employee.findById(employee_code).select('full_name');

    // Get Job Post Employee Code
    let Job_Details = await JobDetails.findById(job_post_code)
        .select('post_employee_code')
        .select('job_title');

    // Get Email of job post employee
    let jobPostEmployeeDetails = await Employee.findById(Job_Details.post_employee_code)
        .select('full_name')
        .select('email_id');

    var mailConfig;

    if (process.env.PROJECT_ENV === 'production') {
        // all emails are delivered to destination
        mailConfig = {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        };
    } else {
        // all emails are catched by ethereal.email
        let testAccount = await nodemailer.createTestAccount();
        mailConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        };
    }

    let transporter = nodemailer.createTransport(mailConfig);

    // Configure mailgen by setting a theme and your product info
    var mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Redprism',
            link: process.env.PROJECT_URL,
            // Optional logo
        }
    });

    // Prepare email contents
    var email = {
        body: {
            name: `${jobPostEmployeeDetails.full_name} ,`,
            intro: `Your Have New Job Apply Request For ${Job_Details.job_title} From ${EmployeeDetails.full_name}`,
            action: {
                instructions: 'To See the details from here : ',
                button: {
                    color: '#22BC66',
                    text: 'Go to the link',
                    link: `${process.env.PROJECT_URL}/job-post-details/${job_post_code}`
                }
            },
            outro: `Employee Message : ${message}`
        }
    };

    var emailHtmlBody = mailGenerator.generate(email);

    let emailBody = {
        from: process.env.EMAIL_USERNAME, // sender address
        to: jobPostEmployeeDetails.email_id, // list of receivers
        subject: "New Job Apply", // Subject line
        html: emailHtmlBody, // html body
    }

    await transporter.sendMail(emailBody).then((info) => {
        // return res.status(200).json({
        //     status: 'success',
        //     mssg: 'Email Send',
        //     info: info.messageId,
        //     preview: nodemailer.getTestMessageUrl(info)
        // });
        console.log("Mail Send");
    })
        .catch(error => {
            console.log(error);
        })
}


// ===================================================
// Job Post and match any employee search details and send them mail you have new matching job
// ===================================================
exports.jobPostSendEmployeeMail = async (req, res) => {

    const {
        userCode,
        job_post_code,
        tech_code,
        locations,
        exp_code
    } = req.body;

    let employee_code = userCode;

    let jobDetails = await JobDetails.find({ _id: job_post_code, status: "Approved" }, {
        job_title: 1,
    });
    let job_title = jobDetails[0].job_title;

    var mailConfig;

    if (process.env.PROJECT_ENV === 'production') {
        // all emails are delivered to destination
        mailConfig = {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        };
    } else {
        // all emails are catched by ethereal.email
        let testAccount = await nodemailer.createTestAccount();
        mailConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        };
    }

    let transporter = nodemailer.createTransport(mailConfig);

    // Configure mailgen by setting a theme and your product info
    var mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Redprism',
            link: process.env.PROJECT_URL,
            // Optional logo
        }
    });



    for (let index = 0; index < locations.length; index++) {

        const location_code = locations[index].location_code;

        const getSearchDetails = await employee_search_details.find(
            { tech_code: tech_code, location_code: location_code, exp_code: exp_code },
            {
                employee_code: 1,
            }
        ).sort({ search_datetime: -1 });

        for (let index_i = 0; index_i < getSearchDetails.length; index_i++) {

            let employeeDetails = await Employee.find({ _id: getSearchDetails[index_i].employee_code }, { email_id: 1, full_name: 1, });
            let email_id = employeeDetails[0].email_id;
            let full_name = employeeDetails[0].full_name;

            // Prepare email contents
            var email = {
                body: {
                    name: `${full_name} ,`,
                    intro: `We found some similar job post in our platform. Please visit and apply on those jobs.`,
                    action: {
                        instructions: 'To See the details from here : ',
                        button: {
                            color: '#22BC66',
                            text: 'Go & Apply',
                            link: `${process.env.PROJECT_URL}/job-post-details/${job_post_code}`
                        }
                    }
                }
            };

            var emailHtmlBody = mailGenerator.generate(email);

            let emailBody = {
                from: process.env.EMAIL_USERNAME, // sender address
                to: email_id, // list of receivers
                subject: "New Job Found For You", // Subject line
                html: emailHtmlBody, // html body
            }

            await transporter.sendMail(emailBody).then((info) => {
                // return res.status(200).json({
                //     status: 'success',
                //     mssg: 'Email Send',
                //     info: info.messageId,
                //     preview: nodemailer.getTestMessageUrl(info)
                // });
            })
                .catch(error => {
                    console.log(error);
                })

        }

    }

}