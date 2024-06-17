var express = require('express');
var router = express.Router();
var {downloadDPR, getDPRDetails}  = require('../controllers/dpr');
var {exportDLRByContractor, getDLRByContractorDetails, exportDLRByCustomer, getDLRByCustomerDetails} = require('../controllers/dlr');
var sendEmail = require('../controllers/sendEmail');
var {getProductivityByCategory, getCategories} = require('../controllers/productivity')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/sendEmail", sendEmail);

router.get("/dpr/:id", downloadDPR);
router.get("/dprdetails/:id", getDPRDetails);

router.get("/dlr/bycontractor/:id", exportDLRByContractor);
router.get("/dlr/bycontractordetails/:id", getDLRByContractorDetails);

router.get("/dlr/bycustomer/:id", exportDLRByCustomer);
router.get("/dlr/bycustomerdetails/:id", getDLRByCustomerDetails);

router.post("/getProductivity", getProductivityByCategory)
router.get("/getCategories/:bookingId", getCategories);

module.exports = router;
