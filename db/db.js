const mysql = require('mysql2/promise')
const nodemailer = require("nodemailer");

const connection = null;
const createConnection = {
    connection: null,
    transporter: null,
    connect: async () => {
        try {
            const connection2 = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            });
    
            this.connection = connection2;
            console.log("sql connection established!!")
        } catch(ex) {
            console.log("SQL connection couldn't be established!! ", ex);
        }
    },
    getConnection: async () => {
        //console.log('got connection ', this.connection)
        if(!this.connection) {
            await this.connect();
        }
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