const mysql = require('mysql2/promise')
const nodemailer = require("nodemailer");

const connection = null;
const createConnection = {
    connection: null,
    transporter: null,
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
    },
    createSMPTMailTransporter: async() => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: "support@labourhomeindia.com",
              pass: "gqeanqoegonfvaud",
            },
          });
          this.transporter = transporter;
          console.log("mail Transported established!!")
    },
    getMailTransported: () => {
        console.log('got connection ', this.connection)
        return this.transporter;
    }
}


module.exports = createConnection;