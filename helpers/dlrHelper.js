const db = require('../db/db');

const getbycontractorDetailsHelper = async (id) => {
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

        //console.log(dprGeneral[0][0])
        const generalDetails = dprGeneral[0][0];
        
        const dlr_table_details = await con.execute(`SELECT labour.name, labour.contact_no, IF(lad.attend=1, "PRESENT", "ABSENT") AS attend, lad.date_of_attendance, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?`, [id]);

       // console.log(dlr_table_details[0])


        const dlr_table_attendance_details = await con.execute(`SELECT COUNT(lad.attend) AS total, lad.attend 
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY lad.attend`, [id]);

       // console.log(dlr_table_attendance_details[0])

        const attendance_details = dlr_table_attendance_details[0].reduce((acc, el) => {
            acc = el["attend"] === 1 ? acc["present"] ? { ...acc, present: acc.present + el["total"] } : { ...acc, present: el["total"] } : acc["absent"] ? { ...acc, absent: acc.absent + el["total"] } : { ...acc, absent: el["total"] }
            return acc;
        }, {});

      //  console.log(attendance_details);

        const category_count = await con.execute(`SELECT COUNT(mc.id) as total, mc.category_name
        FROM labour_attendance_details AS lad
        JOIN 
        labour ON labour.id = lad.labour_id
        JOIN 
        master_category as mc ON labour.categories = mc.id
        WHERE lad.labour_attendance_id = ?
        GROUP BY mc.id`, [id]);

        console.log(category_count[0])

        return {generalDetails, dlr_table_details: dlr_table_details[0], attendance_details, category_count: category_count[0]}
    } catch(ex) {
        console.log(ex)
    }
};

const getbyCustomerDetailsHelper = async (id) => {
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

        const dlr_table_details = await con.execute(`SELECT mc.category_name, lap.no_of_labour, lap.created_at
        FROM labour_attendance_approval lap
        JOIN master_category mc ON mc.id = lap.category_id
        WHERE lap.attendance_id = ?`, [id]);

        console.log(dlr_table_details[0])

        return {generalDetails, dlr_table_details: dlr_table_details[0]}
    } catch(ex) {
        console.log(ex)
    }
};

module.exports={getbycontractorDetailsHelper, getbyCustomerDetailsHelper}