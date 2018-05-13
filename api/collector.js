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

        let _$ = cheerio.load(page);
        
        let data = {
          "RNumber" : `${RNumber}`,
          "KName" : `${_$("#av_section_1 > div > main > div > div > section > div > div > h2").text()}`,
          "Grade" : "0",
          "Phone_Num" : `${_$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(2) > p").text().trim().split(" ")[0]}`,
          "Homepage" : `${_$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(3) > p > a").text()}`,
          "Price" : `${_$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-15.el_after_av_heading.el_before_av_two_third.restaurant-details > section > div > ul:nth-child(4) > li").text()}`,
          "Locatin" : `${_$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-17.el_after_av_one_third.avia-builder-el-last.restaurant-map > section > div > ul > li > span").text().split(" ")[0]}`,
          "Category" : `${_$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(1) > p").text()}`
        }
        let grade = _$("#av_section_2 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-11.el_after_av_two_third.avia-builder-el-last.restaurant-services > section > div > table > tbody > tr:nth-child(1) > td").text().length;

        switch(grade) {
          case 26 :
            data.Grade = 1; // 3스타
            break;
          case 25 : 
            data.Grade = 2;
            break;
          case 6 :
            data.Grade = 3;
          case 38 :
            data.Grade = 4;
            break;
          case 19 :
            data.Grade = 5;
            break;
          default : 
            data.Grade = 0;
            break;
        }

        ko_restaurants.push(data);

        options.uri = uri.replace("ko","en");
        page = await rp(options);
        _$ = cheerio.load(page);

        const location = _$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_two_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-17.el_after_av_one_third.avia-builder-el-last.restaurant-map > section > div > ul > li > span").text().split(" ")
        const en_data = {
          "RNumber" : `${data.RNumber}`,
          "EName" : `${_$("#av_section_1 > div > main > div > div > section > div > div > h2").text()}`,
          "Grade" : `${data.Grade}`,
          "Phone_Num" : `${data.Phone_Num}`,
          "Homepage" : `${data.Homepage}`,
          "Price" : `${_$("#av_section_3 > div > div > div > div > div.flex_column_table.av-equal-height-column-flextable > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.first.avia-builder-el-15.el_after_av_heading.el_before_av_two_third.restaurant-details > section > div > ul:nth-child(4) > li").text()}`,
          "Locatin" : `${location[location.length - 2]}`,
          "Category" : `${_$("#av_section_1 > div > main > div > div > div > div.flex_column.av_one_third.flex_column_table_cell.av-equal-height-column.av-align-top.av-zero-column-padding.avia-builder-el-4.el_after_av_two_third.avia-builder-el-last.restaurant-info.column-top-margin > section > div > ul > li:nth-child(1) > p").text()}`
        }

        en_restaurants.push(en_data);

        RNumber++;
        childNumber++;
        await wait(200);
      }

    } catch (e) {
      if (index == 20) {
        break;
      }
      console.log(e);
      return false;
    }

    index++;
    console.log('wait');
    await wait(500);
  }

  const ko_fields = ['RNmber', 'KName','Grade', 'Phone_Num', 'Homepage', 'Price', 'Location', 'Category'];
  const en_fields = ['RNmber', 'EName','Grade', 'Phone_Num', 'Homepage', 'Price', 'Location', 'Category'];
  
  let json2csvParser = new json2csv(ko_fields);
  let csv = json2csvParser.parse(ko_restaurants);
  fs.writeFileSync(`${PATHS.raw}/ko.csv`, csv);

  json2csvParser = new json2csv(en_fields);
  csv = json2csvParser.parse(en_restaurants);
  fs.writeFileSync(`${PATHS.raw}/en.csv`, csv);

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
