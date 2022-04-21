require('dotenv').config();
const fs = require('fs');
const rdsCa = fs.readFileSync('/tmp/webservice/config/global-bundle.pem');

module.exports = {
development:{
        "username": "postgres",
        "password": "Vcadd",
        "database": "csye6225",
        "host": "localhost",
        "dialect": "postgres"
        },
demo: {
        host: process.env.DB_HOSTNAME,
        username: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'postgres',
        dialectOptions: {
                ssl:{
                        rejectUnauthorized: true,
                        ca: [rdsCa]
                }
        }

        }        
};
