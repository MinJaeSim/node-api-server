const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');

const PATHS = {
    raw: path.join(__dirname, '../data')
  };

async function run() {
  try {
    fs.statSync(`${PATHS.raw}/csv`);
  } catch (err) {
    console.log('Folder doesn\'t exist, so I made the folder');
    fs.mkdirSync(`${PATHS.raw}/csv`, (err, folder) => {
      if (err) 
          return fail;
    });
  }

  const dir = fs.readdirSync(`${PATHS.raw}`);

  console.log(dir.length);

  dir.forEach(path => {
    console.log("Path : " + path);
    if (path.includes(".html")) {
        console.log("Path2 : " + path);
        
        const file = fs.readFileSync(path, 'utf8', function(err, data){
            if (err) throw(err);
            console.log("TEST : " + data);
        });
    }
  });

//   while (index <= 20) {
//     console.log(`collect from: ${index} ...`);
//     const path = `https://guide.michelin.co.kr/ko/restaurant/page/${index}`;

//     const options = {
//       uri : `https://guide.michelin.co.kr/ko/restaurant/page/${index}`,
//       timeout : 30000
//     };

//     try {
//       const page = await rp(options);
    
//       // 파일 로컬에 저장
//       fs.writeFileSync(`${PATHS.raw}/${index}_page_ko.html`, page);
//       console.log("saving file");
//     } catch (e) {
//         console.log(e);
//         return false;
//     }

//     index++;
//     console.log('wait');
//     await wait(500);
//   }
  
//   return true;
}

// function wait(time) {
//     return new Promise((resolve, reject) => {
//       if (time === undefined) time = 0;
//       setTimeout(() => resolve(), time);
//     });
// }
router.get('/', async (req, res, next) => {
    try {
        const result = await run();
        res.status(200).json({
            "result" : "success",
        });
    } catch(e) {
        res.status(400).json({
            "result" : "fail",
        });
    }
    console.log("Bye Parser");
    return;
});

module.exports = router;
