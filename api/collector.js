const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');
const cheerio = require('cheerio');
const json2csv = require('json2csv').Parser;

const PATHS = {
  raw: path.join(__dirname, '../data')
};

let index = 1;
let RNumber = 0;

let ko_restaurants = [];
let en_restaurants = [];
let locations = [];
let grades = [];
let dishes = [];
let images = [];

async function crawling() {
  try {
    fs.statSync(`${PATHS.raw}`);
  } catch (err) {
    console.log('Folder doesn\'t exist, so I made the folder');
    fs.mkdirSync(`${PATHS.raw}`, (err, folder) => {
      if (err) 
          return fail;
      console.log(folder);
    });
  }

  let avg_price1 = 0;
  let avg_price_count1 = 0;
  let g1 = {"GNum" : 1};

  let avg_price2 = 0;
  let avg_price_count2 = 0;
  let g2 = {"GNum" : 2};

  let avg_price3 = 0;
  let avg_price_count3 = 0;
  let g3 = {"GNum" : 3};

  let avg_price4 = 0;
  let avg_price_count4 = 0;
  let g4 = {"GNum" : 4};

  let avg_price5 = 0;
  let avg_price_count5 = 0;
  let g5 = {"GNum" : 5};

  while (index <= 20) {
    console.log(`collect from: ${index} ...`);
    const path = `https://guide.michelin.co.kr/ko/restaurant/page/${index}`;

    let options = {
      uri : `https://guide.michelin.co.kr/ko/restaurant/page/${index}`,
      method : "GET",
      encoding : "utf8",
      timeout : 30000
    };

    try {
      let page = await rp(options);
      let $ = cheerio.load(page);
      
      let childNumber = 1;
      while(childNumber <= 9) {
        let uri = $(`#main > div.container_wrap.container_wrap_first.main_color.fullsize > div > main > div.restaurant-list > div:nth-child(${childNumber}) > article > div > div > div.restaurant-list-header > h3 > a`).attr('href');
        options.uri = uri;
        page = await rp(options);
        const _$ = cheerio.load(page);

        let ko_res = {
          "RNumber" : RNumber,
          "KName" : _$("#av_section_1 > div > main > div > div > section > div > div > h2").text(),
          "Grade" : 0,
          "Phone_Num" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(2) > p").text().trim().split(" ")[0],
          "Homepage" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(3) > p > a").text(),
          "Price" : 0,
        }
        
        let p = _$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-15.el_after_av_heading.el_before_av_two_third.restaurant-details > section > div > ul:nth-child(4) > li").text();
    
        p = p.replace(/[^0-9^~)]/g,"");
        p = p.replace(/\)/g,"~");
        
        const arr = p.split("~");
        let price = 0;
        arr.forEach(v => {
          v = v.replace(/[^0-9]/g,"");
          price += v*1;
        });

        price /= 1000;
        price = Math.round(price / arr.length);
        price *= 1000;

        ko_res.Price = price;

        let grade = _$("#av_section_2 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-11.el_after_av_two_third.avia-builder-el-last.restaurant-services > section > div > table > tbody > tr:nth-child(1) > td").text();

        switch(grade.length) {
          case 26 :
            ko_res.Grade = 1; // 3스타
            avg_price1 += price;
            avg_price_count1++;
            g1["Grade"] = grade;
            break;
          case 25 : 
            ko_res.Grade = 2;
            avg_price2 += price;
            avg_price_count2++;
            g2["Grade"] = grade;
            break;
          case 7 :
            ko_res.Grade = 3;
            avg_price3 += price;
            avg_price_count3++;
            g3["Grade"] = grade;
            break;
          case 38 :
            ko_res.Grade = 4;
            avg_price4 += price;
            avg_price_count4++;
            g4["Grade"] = grade;
            break;
          case 19 :
            ko_res.Grade = 5;
            avg_price5 += price;
            avg_price_count5++;
            g5["Grade"] = grade;
            break;
          default : 
            ko_res.Grade = 0;
            break;
        }

        options.uri = uri.replace("ko","en");
        page = await rp(options);
        const __$ = cheerio.load(page);

        const en_res = {
          "RNumber" : ko_res.RNumber,
          "EName" : __$("#av_section_1 > div > main > div > div > section > div > div > h2").text(),
          "Grade" : ko_res.Grade,
          "Phone_Num" : ko_res.Phone_Num,
          "Homepage" : ko_res.Homepage,
          "Price" : ko_res.Price,
        }

        const location = __$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-17.el_after_av_one_third.avia-builder-el-last.restaurant-map > section > div > ul > li > span").text().split(" ")
        
        const loca = {
          "RNumber" : ko_res.RNumber,
          "Location_Kor" : _$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-17.el_after_av_one_third.avia-builder-el-last.restaurant-map > section > div > ul > li > span").text().split(" ")[0],
          "Location_Eng" :location[location.length - 2]
        }

        const dish = {
          "RNumber" : RNumber,
          "Cat_Kor" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(1) > p").text(),
          "Cat_Eng" : __$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(1) > p").text()
        }

        const image2 = _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-2.el_after_av_textblock.el_before_av_one_third.restaurant-gallery.column-top-margin > section > div > div > ul > li.slide-2 > a").attr();
        let img;

        if(image2 != null) {
          img = {
            "RNumber" : RNumber,
            "image1" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-2.el_after_av_textblock.el_before_av_one_third.restaurant-gallery.column-top-margin > section > div > div > ul > li.slide-1 > a").attr()["href"],
            "image2" : image2["href"],
            "image3" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-2.el_after_av_textblock.el_before_av_one_third.restaurant-gallery.column-top-margin > section > div > div > ul > li.slide-3 > a").attr()["href"]
          }
        } else {
          img = {
            "RNumber" : RNumber,
            "image1" : _$("#av_section_1 > div > main > div > div > div > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-2.el_after_av_textblock.el_before_av_one_third.restaurant-gallery.column-top-margin > section > div > div > ul > li.slide-1 > a").attr()["href"]
          }
        }

        ko_restaurants.push(ko_res);
        en_restaurants.push(en_res);
        locations.push(loca);
        dishes.push(dish);
        images.push(img);

        RNumber++;
        childNumber++;
        await wait(200);
      }

    } catch (e) {
      if (index == 20) {
        break;
      }
      console.log(RNumber + " / " + e);
      return false;
    }
    index++;
    console.log('wait');
    await wait(500);
  }
  avg_price1 /= 1000;
  avg_price1 = Math.round(avg_price1 / avg_price_count1);
  avg_price1 *= 1000;
  g1["Avg_Price"] = avg_price1;
  
  avg_price2 /= 1000;
  avg_price2 = Math.round(avg_price2 / avg_price_count2);
  avg_price2 *= 1000;
  g2["Avg_Price"] = avg_price2;

  avg_price3 /= 1000;
  avg_price3 = Math.round(avg_price3 / avg_price_count3);
  avg_price3 *= 1000;
  g3["Avg_Price"] = avg_price3;

  avg_price4 /= 1000;
  avg_price4 = Math.round(avg_price4 / avg_price_count4);
  avg_price4 *= 1000;
  g4["Avg_Price"] = avg_price4;

  avg_price5 /= 1000;
  avg_price5 = Math.round(avg_price5 / avg_price_count5);
  avg_price5 *= 1000;
  g5["Avg_Price"] = avg_price5;

  grades.push(g1);
  grades.push(g2);
  grades.push(g3);
  grades.push(g4);
  grades.push(g5);

  const ko_fields = ['RNumber', 'KName','Grade', 'Phone_Num', 'Homepage', 'Price'];
  const en_fields = ['RNumber', 'EName','Grade', 'Phone_Num', 'Homepage', 'Price'];
  const loc_fields = ['RNumber', "Location_Kor", "Location_Eng"];
  const grade_fields = ['Grade', 'Avg_Price', 'GNum'];
  const dish_fields = ['RNumber', 'Cat_Kor', 'Cat_Eng'];
  const img_fields = ['RNumber', 'Image1', 'Image2', 'Image3', 'Image4'];

  let json2csvParser = new json2csv(ko_fields);
  let csv = json2csvParser.parse(ko_restaurants);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/ko_res.csv`, csv);

  json2csvParser = new json2csv(en_fields);
  csv = json2csvParser.parse(en_restaurants);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/en_res.csv`, csv);

  json2csvParser = new json2csv(loc_fields);
  csv = json2csvParser.parse(locations);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/loc.csv`, csv);

  json2csvParser = new json2csv(grade_fields);
  csv = json2csvParser.parse(grades);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/grade.csv`, csv);

  json2csvParser = new json2csv(dish_fields);
  csv = json2csvParser.parse(dishes);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/dish.csv`, csv);

  json2csvParser = new json2csv(img_fields);
  csv = json2csvParser.parse(images);
  csv = csv.replace(/\"/g,"");
  fs.writeFileSync(`${PATHS.raw}/img.csv`, csv);

  return true;
}

function wait(time) {
    return new Promise((resolve, reject) => {
      if (time === undefined) time = 0;
      setTimeout(() => resolve(), time);
    });
}
router.get('/', async (req, res, next) => {
    try {
        const result = await crawling();
        res.status(200).json({
            "result" : "success",
            "last" : index
        });
    } catch(e) {
        res.status(400).json({
            "result" : "fail",
            "last" : index
        });
    }
    console.log("Bye Crawler");
    return;
});

module.exports = router;
