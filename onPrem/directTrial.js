const express = require('express');
const app = express();
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
// const ffmpeg = require('fluent-ffmpeg')
// ffmpeg.setFfmpegPath(ffmpegPath)
var fs = require('fs');



app.get('/api' , () =>{

    var vidName = "";
fs.readdir('../../../../iVMS-4200/video/RecordFile/20220609/192.168.1.69_8000_33_2_-1', (err, files) => {
    if (err)
        console.log(err);
    else {
        console.log('Reading Directory...');
        files.forEach(file => {
            fileName = file.slice(0, 8);
            if (fileName == '20220609')
                vidName = file;
             console.log(vidName);
        });
    }

    // try {
    //     folderName = "outputVideo";
    //     if (!fs.existsSync(folderName)) {
    //       fs.mkdirSync(folderName);
    //     }
    //   } catch (err) {
    //     console.error(err);
    // }

});

});

app.listen('3020',()=>{
    console.log('on 3020');
});
