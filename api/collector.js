const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');

const PATHS = {
    raw: path.join(__dirname, '../data/raw')
  };

async function run() {
  let count404 = 0;

  // 게시글 인덱스 21 부터 수집함
  let index = 1;
  

  // 파일을 저장할 폴더가 없으면 생성
  try {
    fs.statSync(`${PATHS.raw}`);
  } catch (err) {
    console.log('Folder doesn\'t exist, so I made the folder');
    fs.mkdirSync(`${PATHS.raw}`, (err, folder) => {
      if (err) throw err;
      console.log(folder);
    });
  }

  return;

  console.log(`init from: ${index} ...`);
  while (index <= 20) {
    console.log(`collect from: ${index} ...`);
    const path = `https://guide.michelin.co.kr/ko/restaurant/page/${index}`;

    const options = {
      uri : `https://guide.michelin.co.kr/ko/restaurant/page/${index}`,
      timeout : 30000
    };

    try {
      const page = await rp(options);
    
      // 파일 로컬에 저장
      fs.writeFileSync(`${PATHS.raw}/${point}/${index}.html`, page);
      console.log("saving file");

    } catch (e) {
      if (e.statusCode === 404 || e.message) {
          console.log("test")
      }
    }

    console.log('wait');
    await wait(3000);
    try {
      if (count404 > 20 ) {
        console.log("BYE BYE");
        return;
      }
    } catch (err) {
      console.log(err);
      process.exit();
    }
  }
}

function wait(time) {
    return new Promise((resolve, reject) => {
      if (time === undefined) time = 0;
      setTimeout(() => resolve(), time);
    });
}

module.exports = router;
