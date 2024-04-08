const excelJS = require("exceljs");
const db = require('../db/db');
const {getbycontractorDetailsHelper, getbyCustomerDetailsHelper} = require('../helpers/dlrHelper')

const exportDLRByContractor = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        
        const { generalDetails, dlr_table_details, attendance_details, category_count} = await getbycontractorDetailsHelper(id);

        const { booking_id, contractor_name, contactor_id } = generalDetails




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

        dlr_table_details.forEach(function (item, index) {
            sheet.addRow([item.date_of_attendance, item.name, item.category_name, item.contact_no, item.attend])
        });

        sheet.addRow([]);

        const headerRow2 = sheet.addRow([,,,,"Total Present", "Total Absent"], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 9, bold: true, width: 32 };

        sheet.addRow([,,,,attendance_details["present"] ?? 0, attendance_details["absent"] ?? 0]);


        category_count.forEach(function (item, index) {
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

const getDLRByContractorDetails = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const {dprGeneral: generalDetails, dlr_table_details, attendance_details, category_count} = await getbycontractorDetailsHelper(id);
        res.json({generalDetails, dlr_table_details, attendance_details, category_count})
    } catch(ex) {
        console.log(ex)
    }
}

const exportDLRByCustomer = async (req, res) => {
    //console.log(db.getConnection());
    const { id } = req.params;
    console.log(id)
    try {

        const { generalDetails, dlr_table_details } = await getbyCustomerDetailsHelper(id);

        const { booking_id, contractor_name, contactor_id, service_contract_number } = generalDetails

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

        dlr_table_details.forEach(function (item, index) {
            sheet.addRow([item.created_at, item.category_name, item.no_of_labour])
        });

        sheet.addRow([]);

        const headerRow2 = sheet.addRow(["Total Present"], { font: { bold: true } });
        headerRow2.font = { family: 4, size: 9, bold: true, width: 32 };

        const total_labours = dlr_table_details.reduce(function (acc, item) {
            acc += (!isNaN(item.no_of_labour) && item.no_of_labour)?item.no_of_labour:0;
            return acc;
        }, 0);

        sheet.addRow([total_labours]);



         res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + "dlrByCustomer.xlsx");

        // // Write the workbook to the response object 
        workbook.xlsx.write(res).then(() => res.end());
    } catch (ex) {
        console.log(ex)
    }
};

const getDLRByCustomerDetails = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const { generalDetails, dlr_table_details } = await getbyCustomerDetailsHelper(id);
        res.json({generalDetails, dlr_table_details })
    } catch(ex) {
        console.log(ex)
    }
}


module.exports = { exportDLRByContractor, getDLRByContractorDetails, exportDLRByCustomer, getDLRByCustomerDetails };