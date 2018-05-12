const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');
const cheerio = require('cheerio');

const PATHS = {
    raw: path.join(__dirname, '../data')
  };

// let index = 1;
let index = 1;

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

    const options = {
      uri : `https://guide.michelin.co.kr/ko/restaurant/page/${index}`,
      method : "GET",
      timeout : 30000
    };

    try {
      let page = await rp(options);
      let $ = cheerio.load(page);
      const uri = $("#main > div.container_wrap.container_wrap_first.main_color.fullsize > div > main > div.restaurant-list > div:nth-child(1) > article > div > div > div.restaurant-list-header > h3 > a").attr('href');
    
      options.uri = uri;
      page = await rp(options);
      fs.writeFileSync(`${PATHS.raw}/${index}_page_ko.html`, page);

      options.uri = uri.replace("ko","en"); 
      page = await rp(options);
      fs.writeFileSync(`${PATHS.raw}/${index}_page_en.html`, page);
      
      console.log("saving file");
    } catch (e) {
        console.log(e);
        return false;
    }

    index++;
    console.log('wait');
    await wait(500);
  }

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
