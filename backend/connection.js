const mysql = require('mysql');
require('dotenv').config();

// Check if environment variables are loaded properly
if (!process.env.DB_USERNAME) {
    console.error('Error loading .env file');
    process.exit(1);
}

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: 'Lalitta@#&2003',
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if (!err) {
        console.log("Connected");
    } else {
        console.error('Error connecting to database:', err.message);
    }
});

module.exports = connection;