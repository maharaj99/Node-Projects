const nodemailer = require("nodemailer");
const otpdetails = require('../model/otp_details');
const customer = require('../model/customerMasterSchema')
const Mailgen = require('mailgen');

const productOrder = require('../new_model/product_order');

const product_master = require('../model/product_master');
const sub_product_master = require('../model/subProduct_Master');
const system_info = require('../model/systemConfigSchema');
const email_master = require('../model/EmailMasterSchema');


//Send otp for registration
exports.otpSendMail = async (req, res) => {

    const { email } = req.body;

    // Get OTP Details from the database
    let otpDetailsArray = await otpdetails.find({ email: email }).select('otp').select('email');

    if (otpDetailsArray.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'OTP details not found' });
    }

    const otpDetails = otpDetailsArray[0];
    const otp = otpDetails.otp;

    // fetch system information
    const systemDataget = await system_info.find({}).select('system_name').select('logo');
    let system_name = '';
    let logo = '';
    if (systemDataget.length > 0) {
        system_name = systemDataget[0].system_name;
        logo = systemDataget[0].logo;
    }
    else {
        return false;
    }

    // fetch email verification mail content
    const mailDataget = await email_master.find({ email_type: "Email Verification" }).select('email_text');
    let email_text = '';
    if (mailDataget.length > 0) {
        email_text = mailDataget[0].email_text;
    }
    else {
        return false;
    }

    // Change mail dynamic content
    email_text = email_text.replace("{email_id}", email);
    email_text = email_text.replace("{otp}", otp);

    try {
        var mailConfig;
        if (process.env.PROJECT_ENV === 'production') {
            // Production email configuration
            mailConfig = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            const testAccount = await nodemailer.createTestAccount();

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

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in the header & footer of emails
                name: system_name,
                link: process.env.PROJECT_URL,
                // Optional logo
                logo: process.env.PROJECT_SERVER_URL + logo,
            }
        });

        // Prepare the email content using mailgen
        var emailContent = {
            body: {
                name: 'User',
                intro: email_text,
                // action: {
                //     instructions:'Your OTP for verification is:', 
                //     button: {
                //         color: '#33b5e5',
                //         text: otp,
                //     },
                // },
                outro: 'If you did not request this OTP, please confirm us. This mean someone use your email in our platform.',
            },
        };

        var emailHtmlBody = mailGenerator.generate(emailContent);

        var emailBody = {
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: 'Email Verification', // Subject line
            html: emailHtmlBody, // html body
        };

        await transporter.sendMail(emailBody).then((info) => {
            // console.log("Mail Sent:", info.response);
        })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
}

//send otp for forhet password
exports.forgetPasswordSendMail = async (req, res) => {

    const { email } = req.body;

    // Get OTP Details from the database
    let otpDetailsArray = await otpdetails.find({ email: email }).select('otp').select('email');
    let customerDetails = await customer.find({ email: email });


    if (otpDetailsArray.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'OTP details not found' });
    }

    const otpDetails = otpDetailsArray[0];
    const otp = otpDetails.otp;
    const User = customerDetails[0].customer_name;


    // fetch system information
    const systemDataget = await system_info.find({}).select('system_name').select('logo');
    let system_name = '';
    let logo = '';
    if (systemDataget.length > 0) {
        system_name = systemDataget[0].system_name;
        logo = systemDataget[0].logo;
    }
    else {
        return false;
    }


    try {
        var mailConfig;
        if (process.env.PROJECT_ENV === 'production') {
            // Production email configuration
            mailConfig = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            const testAccount = await nodemailer.createTestAccount();

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

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in the header & footer of emails
                name: system_name,
                link: process.env.PROJECT_URL,
                // Optional logo
                logo: process.env.PROJECT_SERVER_URL + logo,
            }
        });

        // Prepare the email content using mailgen
        var emailContent = {
            body: {
                name: User,
                intro: 'You have received this email because a password reset request for your account was received.',
                action: {
                    instructions: `Your Password Reset OTP is: ${otp}`,
                },
                outro: 'If you did not request a password reset, no further action is required on your part.',

            },
        };

        var emailHtmlBody = mailGenerator.generate(emailContent);

        var emailBody = {
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: 'Reset Password', // Subject line
            html: emailHtmlBody, // html body
        };

        await transporter.sendMail(emailBody).then((info) => {
            // console.log("Mail Sent:", info.response);
        })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
}

//Password save confirmation
exports.passwordSaveSendMail = async (req, res) => {

    const { email } = req.body;

    // Get OTP Details from the database
    let customerDetails = await customer.find({ email: email });

    if (customerDetails.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'customer details not found' });
    }

    const User = customerDetails[0].customer_name;

    // fetch system information
    const systemDataget = await system_info.find({}).select('system_name').select('logo');
    let system_name = '';
    let logo = '';
    if (systemDataget.length > 0) {
        system_name = systemDataget[0].system_name;
        logo = systemDataget[0].logo;
    }
    else {
        return false;
    }

    try {
        var mailConfig;
        if (process.env.PROJECT_ENV === 'production') {
            // Production email configuration
            mailConfig = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            const testAccount = await nodemailer.createTestAccount();

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

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in the header & footer of emails
                name: system_name,
                link: process.env.PROJECT_URL,
                // Optional logo
                logo: process.env.PROJECT_SERVER_URL + logo,
            }
        });

        // Prepare the email content using mailgen
        var emailContent = {
            body: {
                name: User,
                intro: 'Your Password Save Sucessfully.',
                action: {
                    instructions: 'please click here to login with your new password:',
                    button: {
                        color: '#22BC66',
                        text: 'Login your account',
                        link: process.env.PROJECT_URL + 'login'
                    }
                },
                outro: 'It is a confirmation mail,You can ignore this email..'
            },
        };

        var emailHtmlBody = mailGenerator.generate(emailContent);

        var emailBody = {
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: 'Change Password Confirmation', // Subject line
            html: emailHtmlBody, // html body
        };

        await transporter.sendMail(emailBody).then((info) => {
            // console.log("Mail Sent:", info.response);
        })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
}

//Registration confirmation
exports.RagisterConfirmationSendMail = async (req, res) => {

    const { email } = req.body;

    // Get OTP Details from the database
    let customerDetails = await customer.find({ email: email });

    if (customerDetails.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'customer details not found' });
    }

    const User = customerDetails[0].customer_name;

    // fetch system information
    const systemDataget = await system_info.find({}).select('system_name').select('logo');
    let system_name = '';
    let logo = '';
    if (systemDataget.length > 0) {
        system_name = systemDataget[0].system_name;
        logo = systemDataget[0].logo;
    }
    else {
        return false;
    }

    // fetch registration confirmation mail content
    const mailDataget = await email_master.find({ email_type: "Registration Confirmation" }).select('email_text');
    let email_text = '';
    if (mailDataget.length > 0) {
        email_text = mailDataget[0].email_text;
    }
    else {
        return false;
    }

    // Change mail dynamic content
    email_text = email_text.replace("{email_id}", email);
    email_text = email_text.replace("{customer_name}", User);

    try {
        var mailConfig;
        if (process.env.PROJECT_ENV === 'production') {
            // Production email configuration
            mailConfig = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            const testAccount = await nodemailer.createTestAccount();

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

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in the header & footer of emails
                name: system_name,
                link: process.env.PROJECT_URL,
                // Optional logo
                logo: process.env.PROJECT_SERVER_URL + logo,
            }
        });

        // Prepare the email content using mailgen
        var emailContent = {
            body: {
                name: User,
                intro: 'Welcome to Vaap! We\'re very excited to have you on board.',
                action: {
                    instructions: 'To get started with Vaap, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Login your account',
                        link: process.env.PROJECT_URL + 'login'
                    }
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            },
        };

        var emailHtmlBody = mailGenerator.generate(emailContent);

        var emailBody = {
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: 'Registration Confirmation', // Subject line
            html: emailHtmlBody, // html body
        };

        await transporter.sendMail(emailBody).then((info) => {
            console.log("Mail Sent:", info.response);
        })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
}


//Order Confirmation
exports.OrderConfirmationSendMail = async (req, res) => {

    const { order_code } = req.body;

    // fetch system information
    const systemDataget = await system_info.find({}).select('system_name').select('logo');
    let system_name = '';
    let logo = '';
    if (systemDataget.length > 0) {
        system_name = systemDataget[0].system_name;
        logo = systemDataget[0].logo;
    }
    else {
        return false;
    }

    // fetch order confirmation mail content
    const mailDataget = await email_master.find({ email_type: "Order Confirmation" }).select('email_text');
    let email_text = '';
    if (mailDataget.length > 0) {
        email_text = mailDataget[0].email_text;
    }
    else {
        return false;
    }


    // Get order details
    let orderDetailsDataget = await productOrder.find(
        { _id: order_code },
        {
            order_date: { $dateToString: { date: new Date(), format: "%Y-%m-%d" } },
            voucher_number: 1,
            customer_code: 1,
            sub_product_code: 1,
            unit_type: 1,
            quantity: 1,
            tax_type: 1,
            total_tax_amount: 1,
            mrp: 1,
            discount_type: 1,
            selling_price: 1,
            total_price: 1,
            delivery_charges: 1,
            net_amount: 1,
            order_type: 1,
            delivery_option: 1,
        });


    if (orderDetails.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'order details not found' });
    }

    const orderDetails = orderDetailsDataget[0];
    const order_date = orderDetails.order_date;
    const voucher_number = orderDetails.voucher_number;
    const customer_code = orderDetails.customer_code;
    const sub_product_code = orderDetails.sub_product_code;
    const unit_type = orderDetails.unit_type;
    const quantity = orderDetails.quantity;
    const tax_type = orderDetails.tax_type;
    const total_tax_amount = orderDetails.total_tax_amount;
    const mrp = orderDetails.mrp;
    const discount_type = orderDetails.discount_type;
    const selling_price = orderDetails.selling_price;
    const total_price = orderDetails.total_price;
    const delivery_charges = orderDetails.delivery_charges;
    const net_amount = orderDetails.net_amount;
    const order_type = orderDetails.order_type;
    const delivery_option = orderDetails.delivery_option;

    const subproductDetails = await sub_product_master.find({ _id: sub_product_code }, { sub_product_name: 1 });
    const sub_product_name = subproductDetails[0].sub_product_name;

    const customerDetails = await customer.find({ _id: customer_code }, { customer_name: 1, email: 1 });
    const customer_name = customerDetails[0].customer_name;
    const email = customerDetails[0].email;

    // Change mail dynamic content
    email_text = email_text.replace("{email_id}", email);
    email_text = email_text.replace("{customer_name}", customer_name);
    email_text = email_text.replace("{order_number}", voucher_number);
    email_text = email_text.replace("{product_name}", sub_product_name);
    email_text = email_text.replace("{payable_amount}", net_amount);

    try {
        var mailConfig;
        if (process.env.PROJECT_ENV === 'production') {
            // Production email configuration
            mailConfig = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            const testAccount = await nodemailer.createTestAccount();

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

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in the header & footer of emails
                name: system_name,
                link: process.env.PROJECT_URL,
                // Optional logo
                logo: process.env.PROJECT_SERVER_URL + logo,
            }
        });

        // Prepare the email content using mailgen
        var emailContent = {
            body: {
                name: customer_name,
                intro: email_text,
                table: {
                    data: [
                        {
                            item: 'Product Name',
                            description: sub_product_name,
                        },
                        {
                            item: 'Unit Type',
                            description: unit_type,
                        },
                        {
                            item: 'Quantity',
                            description: quantity,
                        },
                        {
                            item: 'Total Price',
                            description: total_price,
                        },
                        {
                            item: 'Delivery Charges',
                            description: delivery_charges,
                        },
                        {
                            item: 'Delivery Charges',
                            description: net_amount,
                        }

                    ],
                },
                action: {
                    instructions: 'To track your order status, please click the button below:',
                    button: {
                        color: '#33b5e5',
                        text: 'Track Your Order',
                        link: process.env.PROJECT_URL + 'checkout',
                    },
                },
                outro: 'If you have any questions or concerns, please contact our customer support.',

            },
        };

        var emailHtmlBody = mailGenerator.generate(emailContent);

        var emailBody = {
            from: process.env.EMAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: 'Order Confirmation', // Subject line
            html: emailHtmlBody, // html body
        };

        await transporter.sendMail(emailBody).then((info) => {
            console.log("Mail Sent:", info.response);
        })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
}


