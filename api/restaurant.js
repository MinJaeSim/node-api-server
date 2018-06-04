const express = require('express');
const router = express.Router();

const _ = require("lodash");

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

router.get('/ko/', async (req, res, next) => {
    try {
        const restaurant = await getDataFromDB("SELECT DISTINCT Url.RNumber, KName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber GROUP BY Url.RNumber");
        res.status(200).json(restaurant);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/ko/simple', async (req, res, next) => {
    try {
        if(!_.isNil(req.query['loc'])) {
            console.log("loc " + req.query['loc']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber AND Location_Kor LIKE "%${req.query['loc']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (!_.isNil(req.query['cat'])) {
            console.log("cat " + req.query['cat']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber AND Cat_Kor LIKE "%${req.query['cat']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (!_.isNil(req.query['name'])) {
            console.log("name " + req.query['name']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber AND KName LIKE "%${req.query['name']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
    }  catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/ko/complex', async (req, res, next) => {
    try {
	console.log("loc " + req.query['loc']);
	console.log("cat " + req.query['cat']);
	console.log("min " + req.query['min']);
	console.log("max " + req.query['max']);
	console.log("grade " + req.query['grade']);
	const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, KName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Kor as Category FROM Michelin_Kor, Michelin_Location, Url, Dish_Category Where Michelin_Kor.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Kor.RNumber AND Url.RNumber = Dish_Category.RNumber AND Cat_Kor LIKE "%${req.query['cat']}%" AND Location_Kor LIKE "%${req.query['loc']}%" AND Price >= ${req.query['min']} AND Price <= ${req.query['max']} AND Grade = ${req.query['grade']} GROUP BY Url.RNumber`);
	res.status(200).json(restaurant);     
    }  catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/en/', async (req, res, next) => {
    try {
        const restaurant = await getDataFromDB("SELECT DISTINCT Url.RNumber, EName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Eng as Category FROM Michelin_Eng, Michelin_Location, Url, Dish_Category Where Michelin_Eng.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Eng.RNumber AND Url.RNumber = Dish_Category.RNumber GROUP BY Url.RNumber");
        res.status(200).json(restaurant);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/en/simple', async (req, res, next) => {
    try {
        if (!_.isNil(req.query['loc'])) {
            console.log("loc " + req.query['loc']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, EName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Eng as Category FROM Michelin_Eng, Michelin_Location, Url, Dish_Category Where Michelin_Eng.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Eng.RNumber AND Url.RNumber = Dish_Category.RNumber AND Location_Eng LIKE "%${req.query['loc']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (!_.isNil(req.query['cat'])) {
            console.log("cat " + req.query['cat']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, EName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Eng as Category FROM Michelin_Eng, Michelin_Location, Url, Dish_Category Where Michelin_Eng.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Eng.RNumber AND Url.RNumber = Dish_Category.RNumber AND Cat_Eng LIKE "%${req.query['cat']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
        if (!_.isNil(req.query['name'])) {
            console.log("name " + req.query['name']);
            const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, EName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Eng as Category FROM Michelin_Eng, Michelin_Location, Url, Dish_Category Where Michelin_Eng.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Eng.RNumber AND Url.RNumber = Dish_Category.RNumber AND EName LIKE "%${req.query['name']}%" GROUP BY Url.RNumber`);
            res.status(200).json(restaurant);
        }
    }  catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/en/complex', async (req, res, next) => {
    try {
	console.log("loc " + req.query['loc']);
	console.log("cat " + req.query['cat']);
	console.log("min " + req.query['min']);
	console.log("max " + req.query['max']);
	console.log("grade " + req.query['grade']);
	const restaurant = await getDataFromDB(`SELECT DISTINCT Url.RNumber, EName as Name, Grade, Phone_Num, Homepage, Price, Image1, Image2, Image3, Cat_Eng as Category FROM Michelin_Eng, Michelin_Location, Url, Dish_Category Where Michelin_Eng.RNumber = Michelin_Location.RNumber AND Url.RNumber = Michelin_Eng.RNumber AND Url.RNumber = Dish_Category.RNumber AND Cat_Eng LIKE "%${req.query['cat']}%" AND Location_Eng LIKE "%${req.query['loc']}%" AND Price >= ${req.query['min']} AND Price <= ${req.query['max']} AND Grade = ${req.query['grade']} GROUP BY Url.RNumber`);
	res.status(200).json(restaurant);     
    }  catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;


