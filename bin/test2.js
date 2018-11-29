const cp = require('child_process');
const fs = require('fs');

let arg1 = 'E:\\WebStormProject\\ImageArea\\detection';
let arg2 = 'E:\\WebStormProject\\ImageArea\\object_detection\\result.json';

cp.exec('python E:\\WebStormProject\\ImageArea\\object_detection\\object_detection_image2json.py '+arg1+' '+arg2+' ', (err, stdout, stderr) => {
    if (err) console.log('stderr', err);
    if (stdout){
        console.log('stdout', stdout);
        // let results = stdout.substr(0, stdout.length-1).split("-");
        // let JSONResult = [];
        // results.forEach(function (r) {
        //     JSONResult.push(JSON.parse(r));
        // });
        let JSONResult = JSON.parse(fs.readFileSync(arg2));
        console.log(JSONResult);
        // return Object.keys(JSONResult[0]);
    }
});