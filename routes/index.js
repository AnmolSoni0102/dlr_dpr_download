var express = require('express');
var router = express.Router();
var downloaddpr = require('../controllers/dpr');
var {exportDLRByContractor, exportDLRByCustomer} = require('../controllers/dlr');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/dpr/:id", downloaddpr);

router.get("/dlr/bycontractor/:id", exportDLRByContractor);

router.get("/dlr/bycustomer/:id", exportDLRByCustomer);


module.exports = router;
