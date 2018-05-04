const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const db_config = require('./db-config.json')
const connection = mysql.createConnection({
    host : db_config.host,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database
});
connection.connect();

router.get('/', async (req, res, next) => {
    try {
        connection.query("SELECT * FROM Person", function(err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
		res.status(200).json(rows);
	    }
            else
                console.log('Error while performing Query.', err);
        });
    } catch (err) {
        message: err.message;
    }

    connection.end();
});

module.exports = router;


