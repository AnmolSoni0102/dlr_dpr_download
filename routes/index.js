var express = require('express');
var router = express.Router();
var downloaddpr = require('../controllers/dpr');
var {exportDLRByContractor, exportDLRByCustomer} = require('../controllers/dlr');
var sendEmail = require('../controllers/sendEmail');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/sendEmail", sendEmail);

router.get("/dpr/:id", downloaddpr);

router.get("/dlr/bycontractor/:id", exportDLRByContractor);

router.get("/dlr/bycustomer/:id", exportDLRByCustomer);


module.exports = router;
