//const User = require("../models/User");
const excelJS = require("exceljs");
//const db = require('../db/db');
const getDPRDetailsHelper = require('../helpers/dprHelper')

const downloadDPR = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const {dprGeneral: generalDetails, dpr_table_details} = await getDPRDetailsHelper(id);
        console.log("generalDetails", dpr_table_details);
        const workbook = new excelJS.Workbook();
        const sheet = workbook.addWorksheet("dpr");

        sheet.getCell('A1').value = "DPR Report";
        sheet.getCell('A1').font = {bold: true};
        sheet.getCell('A3').value = `Customer Name: ${generalDetails["customer_name"]}`
        sheet.getCell('A4').value = `SAN: ${generalDetails["service_contract"]}`
        sheet.getCell('C3').value = `Booking ID: ${generalDetails["booking_id"]}`
        sheet.getCell('F3').value = `Contractor Name: ${generalDetails["contractor_name"]}`
        sheet.getCell('F4').value = `Contractor ID: ${generalDetails["contactor_id"]}`

        const headerRow = sheet.insertRow(7, ["Date", "DPR Item", "Work", "Unit", "Qty.", "Total Deduction", "Total Qty."], { font: { bold: true } });

        headerRow.font = { family: 4, size: 15, bold: true, width: 32 };

        sheet.columns = [
            { key: 'Date', width: 15 },
            { key: 'DPR Item', width: 40 },
            { key: 'Work', width: 15 },
            { key: 'Unit', width: 15 },
            { key: 'Qty.', width: 15 },
            { key: 'Total Deduction', width: 20 },
            { key: 'Total Qty.', width: 15 }
        ]

        dpr_table_details.forEach(function (item, index) {
            sheet.addRow([generalDetails["reporting_date"], item.dpr_item, item.work, item.unit, item.qty, item.total_deduction, item.total_qty])
        });

        sheet.addRow([]);
        const headerRow2 = sheet.addRow([, , , , , "Total Qty.", "Total Deduction", "Grand Total Qty."], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 12, bold: true, width: 32 };

        const total_qty = dpr_table_details.reduce((acc, el) => {
            acc += (!isNaN(el.qty) && el.qty) ? el.qty : 0
            return acc;
        }, 0);
        const total_deduction = dpr_table_details.reduce((acc, el) => {
            acc += (!isNaN(el.total_deduction) && el.total_deduction) ? el.total_deduction : 0
            return acc;
        }, 0)
        const grand_total_qty = dpr_table_details.reduce((acc, el) => {
            acc += (!isNaN(el.total_qty) && el.total_qty) ? el.total_qty : 0
            return acc;
        }, 0)


        sheet.addRow([, , , , , total_qty, total_deduction, grand_total_qty]);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + "dpr.xlsx");

        // Write the workbook to the response object 
        workbook.xlsx.write(res).then(() => res.end());
    } catch (ex) {
        console.log(ex)
    }
};

const getDPRDetails = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const {dprGeneral: generalDetails, dpr_table_details} = await getDPRDetailsHelper(id);
        res.json({generalDetails, dpr_table_details})
    } catch(ex) {
        console.log(ex)
    }
}

module.exports = {downloadDPR, getDPRDetails};