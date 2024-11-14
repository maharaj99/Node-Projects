// const route = require('./route');
const connectToMongo = require('./db');
connectToMongo();

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// Node server configuration
const express = require('express')
const app = express()
const port = 5001

app.use(express.json({limit: '25mb'}))
app.use(express.static('uploads'));



// any cross-origin APIs and servers can access these resources
const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);



//..............
//Admin routes:
//...............

//manage_user api:
app.use('/admin/user', require('./admin_route/manage_user'));


//login_user
app.use('/admin/login', require('./admin_route/adminlogin'));


//common.js:
app.use('/admin/logged', require('./admin_route/common'));


// sysyemconfig router
app.use('/admin/systemConfig', require('./admin_route/SystemInfo'));


//category
app.use('/admin/category', require('./admin_route/category'));


//Sub_category
app.use('/admin/subcategory', require('./admin_route/sub_category'));


//unit:
app.use('/admin/unit', require('./admin_route/unit_process'));


//product_type
app.use('/admin/prodcutType', require('./admin_route/productType'));


//Brand
app.use('/admin/brand', require('./admin_route/brand'));


//Product_master
app.use('/admin/product', require('./admin_route/producMaster'));


//stockManager
app.use('/admin/stockManager', require('./admin_route/stockManageApi'));


// for Menu Master
app.use('/admin/manageMenuMaster',require('./admin_route/manageMenuMaster')) // to CRUD for the menu master for the admin

// for Sun Menu Master
app.use('/admin/subMenuMaster',require('./admin_route/subMenuMaster')) // to CRUD for the sub menu master for the admin

// User Mode 
app.use('/admin/usermode',require('./admin_route/usermodeapi'))  // to CRUD for the user mode for the the admin


// User Mode Permission
app.use('/admin/userpermission',require('./admin_route/userModePermissionApi'))  // to CRUD for the user permission mode for the admin


// Voucher Number Config
app.use('/admin/voucherNumberConfig',require('./admin_route/voucherNumberConfigApi'))  // for CRUD for the Voucher Number Config for the admin


// State Master managment
app.use('/admin/stateMaster',require('./admin_route/stateMasterApi')) // CRUD API for the State Master


// Address managment
app.use('/admin/addressMaster',require('./admin_route/addressmasterApi'));  // CRUD for the Address Master


// Customer Master 
app.use('/admin/customerMaster',require('./admin_route/customerMasterApi'));  // CRUD for the Address Master

// Customer Billing Address
app.use('/admin/customerBillingAddress',require('./admin_route/customeBillingAddressApi'))  // CRUD for the Customer Billing Address

// Customer Shipping Address
app.use('/admin/customershippingAddress',require('./admin_route/customerShippingAddressApi')) // CRUD for the Customer Shipping Address


// Customer Cart
app.use('/admin/customerCart',require('./admin_route/CustomerCartApi'))  // CRUD for the  Customer Cart


// Customer Wishlist
app.use('/admin/customerWishlist',require('./admin_route/CustomerWishListApi'))  // CRUD for the Customer Wishlist


// Customer Quotation
app.use('/admin/customerQuotation',require('./admin_route/customerQuotationApi')) // CRUD for the Customer Quotation


// Sub Product Master
app.use('/admin/subProductMaster',require('./admin_route/SubProductApi')) // CRUD for the Sub Product Master

// Manage User
app.use('/admin/manageProfile',require('./admin_route/ManageProfileApi')) // CRUD for the Manage Profile

// Settings
app.use('/admin/setting',require('./admin_route/SettingApi')) // CRUD for the Settings

// Email Master
app.use('/admin/emailMaster',require('./admin_route/EmailMasterApi')) // CRUD for the Email Master

// Home Slider
app.use('/admin/homeSlider',require('./admin_route/HomeSlideerApi')) // CRUD for the Home Slider

// Client Testimonial
app.use('/admin/manageClientTestimonial',require('./admin_route/manageClientTestimonial')) // CRUD for the Home Slider

// Product Order
app.use('/admin/productOrder',require('./admin_route/productOrder'))

// Order Status
app.use('/admin/orderStatus',require('./admin_route/orderStatus'))

// Customer Payment
app.use('/admin/customerPayment',require('./admin_route/customerPayment'))

//pact_Act
app.use('/admin/pact', require('./admin_route/pactAct'));



//....................
// Front user_routes:
//....................


//common api
app.use('/front/commonPage', require('./Front_route/common'));

//home api
app.use('/front/homePage', require('./Front_route/homepage'));

//cart_view
app.use('/front/cart', require('./Front_route/cartView'));

//wish_view
app.use('/front/wish', require('./Front_route/wishListView'));

//product
app.use('/front/product', require('./Front_route/product'));

//product details
app.use('/front/productDetails', require('./Front_route/product_details'));


//Registration page Route
app.use('/customer/registration', require('./Front_route/customer_Registration'));

//Login Page Route
app.use('/customer/login', require('./Front_route/login_customer'));

//Forgetpassword Route
app.use('/customer/forgetPassword', require('./Front_route/Forgetpassword'));

//Profile update
app.use('/customer/profile', require('./Front_route/customerProfile_update'));


//Adresss
app.use('/customer/adresss', require('./Front_route/customer_adress'));

//pact_Act
app.use('/customer/pact', require('./Front_route/pact_Act'));

//Product_order
app.use('/cutomer/productOrder', require('./Front_route/customer_orderList'));


//pending invoice
app.use('/cutomer/invoice', require('./Front_route/pending_invoice'));

//pact_Act
app.use('/customer/checkout', require('./Front_route/checkout'));

//customer_qutation
app.use('/customer/quotation', require('./Front_route/customerQuotation'));





//custome details Route
app.use('/customer', require('./Front_route/userdetails'));


//search..
app.use('/search', require('./Front_route/search_api'));

app.use('/subcategory', require('./Front_route/subcategory_product'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})