const db = require('../db/db');

const getDPRDetailsHelper = async (id) => {
    console.log(id)
    const con = await db.getConnection();
    try {
        const dprGeneral2 = await con.execute(`select us.f_name as customer_name, dp.service_contract, dp.reporting_date, lbc.name as contractor_name, 
        CONCAT(lbc.prefix_u_id, '-', lbc.id) AS contactor_id, ccr.booking_id
        from dpr as dp 
        INNER JOIN 
        users as us ON us.id=dp.user_id 
        INNER JOIN 
        labour_contractor as lbc on dp.contractor_id=lbc.id 
        INNER JOIN 
        crm_company_request as ccr on ccr.id=dp.order_id 
        where dp.id= ?`, [id]);

        console.log("dprGeneral2 ", dprGeneral2[0])
        const generalDetails = dprGeneral2[0][0];

        const dpr_table_details = await con.execute(`select dpd.dpr_item, dpd.work, dpd.unit, dpd.qty, dpd.total_deduction, dpd.total_qty
        from dpr as dp 
        INNER JOIN 
        dpr_details as dpd on dp.id=dpd.dpr_id 
        where dp.id=?`, [id]);

        //console.log(dpr_table_details[0]);

        return {dprGeneral: dprGeneral2[0][0], dpr_table_details: dpr_table_details[0]}
    } catch(ex) {
        console.log(ex)
    }
};

module.exports=getDPRDetailsHelper