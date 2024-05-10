//const User = require("../models/User");
const excelJS = require("exceljs");
//const db = require('../db/db');
const {getProductivityData, getFormattedDataHelper} = require('../helpers/productivityHelper')



const getProductivityByCategory = async (req, res) => {
    console.log(req.body)
    const { type, category_id= "", filterBy = "daily", bookingId, date, month } = req.body;
    
    try {
        const {productivityDlrData, productivityDprData} = await getProductivityData(type, bookingId, category_id, month);
        const formatData = await getFormattedDataHelper({productivityDlrData, productivityDprData}, filterBy, date);
        res.json(formatData);
    } catch (ex) {
        console.log(ex)
    }
};

module.exports = {getProductivityByCategory};
