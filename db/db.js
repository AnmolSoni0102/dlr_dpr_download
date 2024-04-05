const mysql = require('mysql2/promise')

const connection = null;
const createConnection = {
    connection: null,
    connect: async () => {
        try {
            const connection2 = await mysql.createConnection({
                host: '139.59.44.70',
                user: 'admin',
                password: 'force5$Dev',
                database: 'lh_all_dev'
            });
    
            this.connection = connection2;
            console.log("sql connection established!!")
        } catch(ex) {
            console.log("SQL connection couldn't be established!! ", ex);
        }
    },
    getConnection: () => {
        //console.log('got connection ', this.connection)
        return this.connection;
    }
}


module.exports = createConnection;