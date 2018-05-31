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
        connection.query("SELECT * FROM Michelin_Kor", function(err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
                
		        res.status(200).json(rows,"");
	        }else
                console.log('Error while performing Query.', err);
        });
    } catch (err) {
        message: err.message;
    }

    connection.end();
});

router.get('/simple', async (req, res, next) => {
    try {
        if(req.query['loc'] != null) {
            console.log(req.query['loc']);
        } else if (req.query['cat'] != null) {
            console.log(req.query['cat']);
        } else if (req.query['moneygt'] != null) {
            console.log(req.query['moneygt']);
            console.log(req.query['moneylt']);
        } else if (req.query['grade'] != null) {
            console.log(req.query['grade']);
        }

        // connection.query("SELECT * FROM Michelin_Kor", function(err, rows, fields) {
        //     if (!err) {
        //         console.log('The solution is: ', rows);
		//         res.status(200).json(rows);
	    //     }else
        //         console.log('Error while performing Query.', err);
        // });
        res.status(200);
        res.status(200).json({"m" : "test"});
    } catch (err) {
        message: err.message;
    }

    // connection.end();
});

router.get('/test', async (req, res, next) => {
    // 이름으로 검색
    // 가격, 등급, 지역, 요리종류
    //  /a/restaurant/test?a=1&b=2
    console.log(req.query);
    const keys = Object.keys(req.query)
    console.log(keys);
    console.log(req.query['c']);
    if(req.query['c'] == null){
        console.log("TEST");
    }

    res.status(200).json({"m" : "test"});
    return;
    try {
        connection.query("SELECT * FROM Michelin_Kor", function(err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
		        res.status(200).json(rows);
	        }else
                console.log('Error while performing Query.', err);
        });
    } catch (err) {
        message: err.message;
    }

    connection.end();
});

router.get('/test2', async (req, res, next) => {
    let result1;
    let result2;
    try {
        connection.query("SELECT * FROM DEPARTMENT", function(err, rows, fields) {
            if (!err) {
                console.log('The solution1 is: ', rows);
                result1 = rows; 
            
                connection.query("SELECT * FROM PROJECT", function(err, rows, fields) {
                    if (!err) {
                        console.log('The solution is: ', rows);
                        result2 = rows; 
                        
                        for(let i = 0; i < result1.length; i++) {
                            result1[i]['url'] = result2[i]['DNUMBER']
                        }
        
                        res.status(200).json(result1);
                    }else
                        console.log('Error while performing Query.', err);
                });
            }
        }); 
    } catch (err) {
        message: err.message;
    }

    connection.end();
});

module.exports = router;


