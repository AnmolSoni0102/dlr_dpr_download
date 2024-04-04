const User = require("../models/User");
const excelJS = require("exceljs");
const db = require('../db/db');


const downloadDPR = async (req, res) => {
    //console.log(db.getConnection());
    const { id } = req.params;
    console.log(id)
    const con = db.getConnection();
    try {
        const dprGeneral = await con.execute(`select us.f_name as customer_name, dp.service_contract, dp.reporting_date, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id, ccr.booking_id
        from dpr as dp 
        INNER JOIN 
        users as us ON us.id=dp.user_id 
        INNER JOIN 
        labour_contractor as lbc on dp.contractor_id=lbc.id 
        INNER JOIN 
        crm_company_request as ccr on ccr.id=dp.order_id 
        where dp.id= ?`, [id]);

        console.log(dprGeneral[0][0])
        const generalDetails = dprGeneral[0][0];

        const dpr_table_details = await con.execute(`select dpd.dpr_item, dpd.work, dpd.unit, dpd.qty, dpd.total_deduction, dpd.total_qty
        from dpr as dp 
        INNER JOIN 
        dpr_details as dpd on dp.id=dpd.dpr_id 
        where dp.id=?`, [id]);

        console.log(dpr_table_details[0])


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

        dpr_table_details[0].forEach(function (item, index) {
            sheet.addRow([generalDetails["reporting_date"], item.dpr_item, item.work, item.unit, item.qty, item.total_deduction, item.total_qty])
        });

        sheet.addRow([]);
        const headerRow2 = sheet.addRow([, , , , , "Total Qty.", "Total Deduction", "Grand Total Qty."], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 12, bold: true, width: 32 };

        const total_qty = dpr_table_details[0].reduce((acc, el) => {
            acc += (!isNaN(el.qty) && el.qty) ? el.qty : 0
            return acc;
        }, 0);
        const total_deduction = dpr_table_details[0].reduce((acc, el) => {
            acc += (!isNaN(el.total_deduction) && el.total_deduction) ? el.total_deduction : 0
            return acc;
        }, 0)
        const grand_total_qty = dpr_table_details[0].reduce((acc, el) => {
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
module.exports = downloadDPR;