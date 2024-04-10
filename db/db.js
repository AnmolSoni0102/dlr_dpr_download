const mysql = require('mysql2/promise')
const nodemailer = require("nodemailer");

const connection = null;
const createConnection = {
    connection: null,
    transporter: null,
    connect: async () => {
        try {
            const dbConnectionInfo = {
                host: process.env.DB_HOST,
                //port: process.env.DB_PORT,
                user: process.env.USER,
                password: process.env.PASSWORD,
                database: process.env.DATABASE,
                connectionLimit: process.env.DB_CONNECTION_LIMIT,
            };

            var dbconnection = mysql.createPool(
                dbConnectionInfo
            );

            dbconnection.on('connection', function (connection) {
                console.log('DB Connection established');

                connection.on('error', function (err) {
                    console.error(new Date(), 'MySQL error', err.code);
                });
                connection.on('close', function (err) {
                    console.error(new Date(), 'MySQL close', err);
                });

            });
            this.connection = dbconnection;
            console.log("sql connection established!!")
        } catch (ex) {
            console.log("SQL connection couldn't be established!! ", ex);
        }
    },
    getConnection: () => {
        //console.log('got connection ', this.connection)
        return this.connection;
    },
    createSMPTMailTransporter: async () => {
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