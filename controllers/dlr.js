const User = require("../models/User");
const excelJS = require("exceljs");
const db = require('../db/db');


const exportDLRByContractor = async (req, res) => {
    //console.log(db.getConnection());
    const { id } = req.params;
    console.log(id)
    const con = db.getConnection();
    try {
        const dprGeneral = await con.execute(`select ccr.booking_id, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id
        from labour_attendance lba
        INNER JOIN
        crm_company_request as ccr on ccr.id=lba.order_id 
        INNER JOIN
        labour_contractor as lbc on lba.contractor_id=lbc.id 
        where lba.id = ?`, [id]);

        console.log(dprGeneral[0][0])
        const generalDetails = dprGeneral[0][0];
        const { booking_id, contractor_name, contactor_id } = generalDetails
        const dlr_table_details = await con.execute(`SELECT labour.name, labour.contact_no, IF(lad.attend=1, "PRESENT", "ABSENT") AS attend, lad.date_of_attendance, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?`, [id]);

        console.log(dlr_table_details[0])


        const dlr_table_attendance_details = await con.execute(`SELECT COUNT(lad.attend) AS total, lad.attend 
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY lad.attend`, [id]);

        console.log(dlr_table_attendance_details[0])

        const category_count = await con.execute(`SELECT COUNT(mc.id) as total, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY mc.id`, [id]);

        console.log(category_count[0])

        const attendance_details = dlr_table_attendance_details[0].reduce((acc, el) => {
            acc = el["attend"] === 1 ? acc["present"] ? { ...acc, present: acc.present + 1 } : { ...acc, present: 1 } : acc["absent"] ? { ...acc, absent: acc.absent + 1 } : { ...acc, absent: 1 }
            return acc;
        }, {});

        console.log(attendance_details);


        //excel preparation
        const workbook = new excelJS.Workbook();
        const sheet = workbook.addWorksheet("dlr");

        sheet.getCell('A1').value = "Attendance Details";
        sheet.getCell('A1').font = { bold: true };
        sheet.getCell('A3').value = `Booking ID: ${booking_id}`
        sheet.getCell('D3').value = `Contractor Name: ${contractor_name}`
        sheet.getCell('D4').value = `Contractor ID: ${contactor_id}`

        const headerRow = sheet.insertRow(6, ["Attendance Date", "Labour Name", "Category", "Labour Mobile", "Attendance"], { font: { bold: true } });

        headerRow.font = { family: 4, size: 10, bold: true, width: 32 };

        sheet.columns = [
            { key: 'Attendance Date', width: 20 },
            { key: 'Labour Name', width: 20 },
            { key: 'Category', width: 15 },
            { key: 'Labour Mobile', width: 20 },
            { key: 'Attendance', width: 15 },
        ]

        dlr_table_details[0].forEach(function (item, index) {
            sheet.addRow([item.date_of_attendance, item.name, item.category_name, item.contact_no, item.attend])
        });

        sheet.addRow([]);

        const headerRow2 = sheet.addRow([,,,,"Total Present", "Total Absent"], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 9, bold: true, width: 32 };

        sheet.addRow([,,,,attendance_details["present"] ?? 0, attendance_details["absent"] ?? 0]);


        category_count[0].forEach(function (item, index) {
            sheet.addRow([]);

            const headerRow2 = sheet.addRow([item.category_name], { font: { bold: true } });
            headerRow2.font = { family: 4, size: 9, bold: true, width: 32 };

            sheet.addRow([(!isNaN(item.total) && item.total) ? item.total : 0]);
        });

         res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + "dlrByContractor.xlsx");

        // // Write the workbook to the response object 
        workbook.xlsx.write(res).then(() => res.end());
    } catch (ex) {
        console.log(ex)
    }
};

const exportDLRByCustomer = async (req, res) => {
    //console.log(db.getConnection());
    const { id } = req.params;
    console.log(id)
    const con = db.getConnection();
    try {
        const dprGeneral = await con.execute(`select ccr.booking_id, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id, lba.service_contract_number
        from labour_attendance lba
        INNER JOIN
        crm_company_request as ccr on ccr.id=lba.order_id 
        INNER JOIN
        labour_contractor as lbc on lba.contractor_id=lbc.id 
        where lba.id = ?`, [id]);

        console.log(dprGeneral[0][0])
        const generalDetails = dprGeneral[0][0];
        const { booking_id, contractor_name, contactor_id, service_contract_number } = generalDetails

        const dlr_table_details = await con.execute(`SELECT mc.category_name, lap.no_of_labour, lap.created_at
        FROM labour_attendance_approval lap
        JOIN master_category mc ON mc.id = lap.category_id
        WHERE lap.attendance_id = ?`, [id]);

        console.log(dlr_table_details[0])


        const dlr_table_attendance_details = await con.execute(`SELECT COUNT(lad.attend) AS total, lad.attend 
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY lad.attend`, [id]);

        console.log(dlr_table_attendance_details[0])


        const attendance_details = dlr_table_attendance_details[0].reduce((acc, el) => {
            acc = el["attend"] === 1 ? acc["present"] ? { ...acc, present: acc.present + 1 } : { ...acc, present: 1 } : acc["absent"] ? { ...acc, absent: acc.absent + 1 } : { ...acc, absent: 1 }
            return acc;
        }, {});

        console.log(attendance_details);


        //excel preparation
        const workbook = new excelJS.Workbook();
        const sheet = workbook.addWorksheet("dlr");

        sheet.getCell('A1').value = "DLR Reports";
        sheet.getCell('A1').font = { bold: true };
        
        sheet.getCell('A3').value = `Booking ID: ${booking_id}`
        sheet.getCell('A4').value = `SAN: ${service_contract_number}`
        sheet.getCell('D3').value = `Contractor Name: ${contractor_name}`
        sheet.getCell('D4').value = `Contractor ID: ${contactor_id}`

        const headerRow = sheet.insertRow(6, ["Date", "Category", "Number of Labours"], { font: { bold: true } });

        headerRow.font = { family: 4, size: 10, bold: true, width: 32 };

        sheet.columns = [
            { key: 'Date', width: 20 },
            { key: 'Category', width: 15 },
            { key: 'Number of Labours', width: 10 },
        ]

        dlr_table_details[0].forEach(function (item, index) {
            sheet.addRow([item.created_at, item.category_name, item.no_of_labour])
        });

        sheet.addRow([]);

        const headerRow2 = sheet.addRow(["Total Labour", "Total Present", "Total Absent"], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 9, bold: true, width: 32 };

        const total_labours = dlr_table_details[0].reduce(function (acc, item) {
            acc += (!isNaN(item.no_of_labour) && item.no_of_labour)?item.no_of_labour:0;
            return acc;
        }, 0);

        sheet.addRow([total_labours, attendance_details["present"] ?? 0, attendance_details["absent"] ?? 0]);



         res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + "dlrByContractor.xlsx");

        // // Write the workbook to the response object 
        workbook.xlsx.write(res).then(() => res.end());
    } catch (ex) {
        console.log(ex)
    }
};

module.exports = { exportDLRByContractor, exportDLRByCustomer };