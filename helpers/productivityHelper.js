const db = require('../db/db');
const moment = require('moment');
const { convertToObjectWithDateKey, weekOfTheMonthYear, monthOfYear } = require('../util/util');

const getProductivityData = async (type, bookingId, category_id) => {
    const con = db.getConnection();
    try {
        let productivityDlrData = null, productivityDprData = null;
        if (type == "byCategory") {
            productivityDlrData = await con.execute(`select DATE(laa.created_at) as dt, SUM(laa.no_of_labour) * ccap.price as total_price 
            FROM crm_customer_agreement_price ccap
            INNER JOIN crm_company_request ccr ON ccap.service_contract_number=ccr.service_contract
            INNER JOIN crm_company_request_details ccrd ON ccrd.company_request_id=ccr.id
            AND ccrd.category_id=ccap.category_id
            INNER JOIN labour_attendance la ON ccr.id=la.order_id
            INNER JOIN labour_attendance_approval laa ON laa.attendance_id=la.id AND ccrd.category_id=laa.category_id
            where ccr.id=? 
            AND laa.category_id=?
            AND la.customer_approval_status=2
            GROUP BY DATE(laa.created_at), laa.category_id
            ORDER BY dt ASC`, [bookingId, category_id]);

            productivityDprData = await con.execute(`select DATE(dd.created_at) as dt, SUM(qty)*ccdip.item_price as expected_outcome,
            SUM(total_qty)*ccdip.item_price as actual_outcome  
            FROM crm_customer_drp_item_price ccdip
            INNER JOIN crm_company_request ccr ON ccdip.service_contract_number=ccr.service_contract
            INNER JOIN dpr dp ON dp.order_id=ccr.id
            INNER JOIN dpr_details dd ON dd.dpr_id = dp.id AND SUBSTRING(dd.dpr_item, 1, 5) = ccdip.item_code
            WHERE ccr.id=?
            AND dp.pm_status=2
            AND dd.category_id=?
            GROUP BY DATE(dd.created_at), dd.category_id ORDER BY DATE(dd.created_at) ASC`, [bookingId, category_id]);
        } else if (type == "consolidated") {
            productivityDlrData = await con.execute(`select dat.dt, SUM(dat.total_price) as total_price from (select DATE(laa.created_at) as dt, laa.category_id, SUM(laa.no_of_labour), SUM(laa.no_of_labour) * ccap.price as total_price 
            FROM crm_customer_agreement_price ccap
            INNER JOIN crm_company_request ccr ON ccap.service_contract_number=ccr.service_contract
            INNER JOIN crm_company_request_details ccrd ON ccrd.company_request_id=ccr.id
            AND ccrd.category_id=ccap.category_id
            INNER JOIN labour_attendance la ON ccr.id=la.order_id
            INNER JOIN labour_attendance_approval laa ON laa.attendance_id=la.id AND ccrd.category_id=laa.category_id
            where ccr.id=? 
            AND la.customer_approval_status=2
            GROUP BY DATE(laa.created_at) 
            ,laa.category_id) as dat 
            GROUP BY dat.dt ORDER BY dat.dt ASC`, [bookingId]);

            productivityDprData = await con.execute(`select dat.dt, SUM(dat.expected_outcome) as expected_outcome, SUM(dat.actual_outcome) as actual_outcome from (select DATE(dp.created_at) as dt, SUBSTRING(dd.dpr_item, 1, 5) as item_code, 
            dd.dpr_item, SUM(qty)*ccdip.item_price as expected_outcome,
            SUM(total_qty)*ccdip.item_price as actual_outcome  
            FROM crm_customer_drp_item_price ccdip
            INNER JOIN crm_company_request ccr ON ccdip.service_contract_number=ccr.service_contract
            INNER JOIN dpr dp ON dp.order_id=ccr.id
            INNER JOIN dpr_details dd ON dd.dpr_id = dp.id AND SUBSTRING(dd.dpr_item, 1, 5) = ccdip.item_code
            WHERE ccr.id=?
            AND dp.pm_status=2
            GROUP BY DATE(dp.created_at), SUBSTRING(dd.dpr_item, 1, 5)) as dat
            GROUP BY dat.dt ORDER BY dat.dt ASC`, [bookingId]);
        }

        console.log("productivityData  ", productivityDlrData[0], productivityDprData[0])
        return { productivityDlrData: productivityDlrData[0], productivityDprData: productivityDprData[0] }
    } catch (ex) {
        console.log(ex)
    }
};


const filterByDate = async (dbData, date) => {
    let { productivityDlrData, productivityDprData } = dbData;
    let dlr = null, dpr = null;
    dlr = productivityDlrData.find(el => {
        if (date === moment(el.dt).format("YYYY-MM-DD")) {
            return true;
        }
    })
    dpr = productivityDprData.find(el => {
        if (date === moment(el.dt).format("YYYY-MM-DD")) {
            return true;
        }
    })
    return { dlr, dpr }
}

const filterByWeekorMonth = async (dbData, filterBy) => {
    const data = [];
    let weekhash = "", dlr = {}, dpr = {};
    let { productivityDlrData, productivityDprData } = dbData, totalDlr = {}, totalDpr = {}, count = 0;
    const productivityDprDatainObj = convertToObjectWithDateKey(productivityDprData);
    console.log(`productivityDprDatainObj `, productivityDprDatainObj)
    for (let i = 0; i < productivityDlrData.length; i++) {
        const dlrData = productivityDlrData[i];
        let weekhash2 = filterBy=="weekly"? weekOfTheMonthYear(new Date(moment(dlr.dt).format("YYYY-MM-DD"))): monthOfYear(new Date(moment(dlr.dt).format("YYYY-MM-DD")));
        console.log(`dlr `, dlrData, weekhash2)
        if (weekhash === "") {
            weekhash == weekhash2;
            count = 1;
        } else if (weekhash !== weekhash2) {
            weekhash = weekhash2;
            data.push({ dlr, dpr });
            dlr = {}, dpr = {};
            count++;
        }
        //console.log(`dlr `, dlr, (dlr.dlr ? dlr.dlr : 0) + dlr.total_price)
        dlr = { dlr: (dlr.dlr ? dlr.dlr : 0) + dlrData.total_price };
        totalDlr = { dlr: dlr.dlr };

        const dprData = productivityDprDatainObj[new Date(moment(dlrData.dt).format("YYYY-MM-DD"))];
        console.log(`dprData `, dprData);

        if(dprData) {
            dpr = { expected_outcome: (dpr.expected_outcome ? dpr.expected_outcome : 0) + dprData.expected_outcome, actual_outcome: (dpr.actual_outcome ? dpr.actual_outcome : 0) + dprData.actual_outcome };
            totalDpr = { expected_outcome: dpr.expected_outcome, actual_outcome: dpr.actual_outcome };
        }
        if(i === productivityDlrData.length-1) {
            data.push({ dlr, dpr });
        }
    }

    return {data, total: {
        totalDlr: {...totalDlr}, totalDpr: {...totalDpr}, averageDlr: {dlr: totalDlr.dlr/count}, averageDpr: {
            expected_outcome:totalDpr.expected_outcome/count,
            actual_outcome:totalDpr.actual_outcome/count,
        } 
    }}
}



const getFormattedDataHelper = async (dbData, filterBy, date) => {
    console.log("filterBy ", filterBy)
    try {
        let data = null;
        if (filterBy == "daily") {
            data = await filterByDate(dbData, date);
        } else if (filterBy == "weekly" || filterBy == "monthly") {
            data = await filterByWeekorMonth(dbData, filterBy);
        }
        return  data ;
    } catch (ex) {
        console.log(ex)
    }
};

module.exports = { getProductivityData, getFormattedDataHelper };