const cp = require('child_process');

let arg1 = 'E:\\WebStormProject\\ImageArea\\detection';
let arg2 = 'C:\\Users\\DELL\\Desktop\\images.json';

cp.exec('python C:\\Users\\DELL\\Desktop\\object_detection\\object_detection_image2json.py '+arg1+' '+arg2+' ', (err, stdout, stderr) => {
    if (err) console.log('stderr', err);
    if (stdout){
        console.log('stdout', stdout);
        let results = stdout.substr(0, stdout.length-1).split("-");
        let JSONResult = [];
        results.forEach(function (r) {
            JSONResult.push(JSON.parse(r));
        });
        console.log(Object.keys(JSONResult[0]));
        // return Object.keys(JSONResult[0]);
    }
});