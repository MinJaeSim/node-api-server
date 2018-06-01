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

async function getDataFromDB(query){

    return new Promise((resolve, reject) => {
        try {
            connection.query(query, function(err, rows, fields) {
                resolve(rows); 
            });
        } catch (err) {
            reject(err);
        } 
    });
    connection.end();
}

router.get('/', async (req, res, next) => {
    try {
        const restaurant = await getDataFromDB("SELECT * FROM Michelin_Kor");
        const url = await getDataFromDB("SELECT * FROM Url");
        const category = await getDataFromDB("SELECT * FROM Dish_Category");

        for(let i = 0; i < restaurant.length; i++) {
            restaurant[i]['Image1'] = url[i]['Image1'];
            restaurant[i]['Image2'] = url[i]['Image2'];
            restaurant[i]['Image3'] = url[i]['Image3'];
            restaurant[i]['Category'] = category[i]['Cat_Kor'];
        }
        res.status(200).json(restaurant);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/simple', async (req, res, next) => {
    try {
        if(req.query['loc'] != null) {
            console.log("loc " + req.query['loc']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Location_Kor LIKE "%${req.query['loc']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (req.query['cat'] != null) {
            console.log("cat " + req.query['cat']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber AND Cat_Kor LIKE "%${req.query['cat']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (req.query['name'] != null) {
            console.log("name " + req.query['name']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND KName LIKE "%${req.query['name']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }

        // if (req.query['moneygt'] != null) {
        //     console.log(req.query['moneygt']);
        //     console.log(req.query['moneylt']);
        // } 
        // if (req.query['grade'] != null) {
        //     console.log(req.query['grade']);
        // }
        
        
    }  catch(err) {
        res.status(400).json({message: err.message});
    }
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
    try {
        const result1 = await getDataFromDB("SELECT * FROM DEPARTMENT");
        const result2 = await getDataFromDB("SELECT * FROM PROJECT");
        res.status(200).json(result1);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;


