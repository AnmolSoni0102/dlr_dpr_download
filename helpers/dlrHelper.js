const db = require('../db/db');

const getbycontractorDetailsHelper = async (id) => {
    console.log(id)
    const con = db.getConnection();
    try {
        const dprGeneral = await con(`select ccr.booking_id, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id
        from labour_attendance lba
        INNER JOIN
        crm_company_request as ccr on ccr.id=lba.order_id 
        INNER JOIN
        labour_contractor as lbc on lba.contractor_id=lbc.id 
        where lba.id = ?`, [id]);

        console.log(dprGeneral)
        const generalDetails = JSON.parse(JSON.stringify(dprGeneral))[0];
        
        const dlr_table_details = await con(`SELECT labour.name, labour.contact_no, IF(lad.attend=1, "PRESENT", "ABSENT") AS attend, lad.date_of_attendance, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?`, [id]);

        console.log(dlr_table_details)


        const dlr_table_attendance_details = await con(`SELECT COUNT(lad.attend) AS total, lad.attend 
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY lad.attend`, [id]);

        console.log(dlr_table_attendance_details)

        const attendance_details = JSON.parse(JSON.stringify(dlr_table_attendance_details)).reduce((acc, el) => {
            acc = el["attend"] === 1 ? acc["present"] ? { ...acc, present: acc.present + 1 } : { ...acc, present: 1 } : acc["absent"] ? { ...acc, absent: acc.absent + 1 } : { ...acc, absent: 1 }
            return acc;
        }, {});

        console.log(attendance_details);

        const category_count = await con(`SELECT COUNT(mc.id) as total, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY mc.id`, [id]);

        console.log(category_count)

        return {generalDetails, dlr_table_details: JSON.parse(JSON.stringify(dlr_table_details)), attendance_details, category_count: JSON.parse(JSON.stringify(category_count))}
    } catch(ex) {
        console.log(ex)
    }
};

const getbyCustomerDetailsHelper = async (id) => {
    console.log(id)
    const con = db.getConnection();
    try {
        const dprGeneral = await con(`select ccr.booking_id, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id, lba.service_contract_number
        from labour_attendance lba
        INNER JOIN
        crm_company_request as ccr on ccr.id=lba.order_id 
        INNER JOIN
        labour_contractor as lbc on lba.contractor_id=lbc.id 
        where lba.id = ?`, [id]);

        console.log(dprGeneral)
        const generalDetails = JSON.parse(JSON.stringify(dprGeneral))[0]

        const dlr_table_details = await con(`SELECT mc.category_name, lap.no_of_labour, lap.created_at
        FROM labour_attendance_approval lap
        JOIN master_category mc ON mc.id = lap.category_id
        WHERE lap.attendance_id = ?`, [id]);

        console.log(dlr_table_details)

        return {generalDetails, dlr_table_details:  JSON.parse(JSON.stringify(dlr_table_details))}
    } catch(ex) {
        console.log(ex)
    }
};

module.exports={getbycontractorDetailsHelper, getbyCustomerDetailsHelper}