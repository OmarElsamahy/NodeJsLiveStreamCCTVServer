const express = require('express');
const app = express();
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
var fs = require('fs');
const axios = require('axios').default;
const ipfsClient = require('ipfs-http-client');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');
const https = require('https');
helmet = require("helmet");
const rtspRelay = require('rtsp-relay');
const Recorder = require('./node-rtsp-recorder/src/index').Recorder;
const cors = require('cors');
const { query } = require('express');
app.use(cors());

let projID='2BS1dH0006sZ8rMFH0bL5SmkCeI';
let projSecret='65bd2c96dc266072a7dd816bad855e29';
const auth =
    'Basic ' + Buffer.from(projID + ':' + projSecret).toString('base64');

const ipfs = ipfsClient.create({host : 'ipfs.infura.io',port: '5001',protocol:'https'
,headers: {
authorization: auth,},
});

app.use(fileUpload());
app.use(express.json());
app.use(helmet({crossOriginResourcePolicy: false}));
app.use(bodyparser.urlencoded({extended: true}));


const options = {
    passphrase : "1234",
    key: fs.readFileSync(`domain.key`),
    cert: fs.readFileSync(`domain.crt`),
    rejectUnauthorized: false
};



let server = https.createServer(
    options,
    app
)
.listen(3000, ()=>{
    console.log('listening on 3000 :: storage server');
});
const { proxy, scriptUrl } = rtspRelay(app, server);




app.get('/getVideo', async (req,res) =>{
    try{
    console.log('Request recieved');
    var camIP = "";
    console.log(req.query.date);
    console.log(req.query.camID);
    console.log(req.query.date);
    try{
    fs.readdir('../../../../iVMS-4200/video/RecordFile/' + req.query.date + '/' , (err,files) =>{
        if (err)
            console.log(err);
        else {
            console.log('Reading Directory...');
            files.forEach(file => {
                fileName = file.slice(0, 12);
                if (fileName == req.query.camID)
                    camIP = file;
            });
        }

    fs.readdir('../../../../iVMS-4200/video/RecordFile/' + req.query.date + '/' + camIP, (err, files) => {
        let vidName;
        try {
            folderName = "outputVideo";
            if (!fs.existsSync(folderName)) {
              fs.mkdirSync(folderName);
            }
          } catch (err) {
            console.error(err);
        }
        if (err)
            console.log(err);
        else {
            console.log('Reading Directory...');
            files.forEach(file => {
                fileName = file.slice(0, 8);
                if (fileName == req.query.date)
                    vidName = file;
            });
        }
     ffmpeg('../../../../iVMS-4200/video/RecordFile/'+req.query.date+'/'+camIP+'/'+vidName)
    .setStartTime(req.query.time)
    .setDuration(req.query.timeEnd)
    .output('../../../../iVMS-4200/video/RecordFile/'+req.query.date+'/'+camIP+'/'+req.query.camID+'_cut.mp4')
    .on('end', function(err) {
        if(!err) { console.log('conversion Done') }
        const path = '../../../../iVMS-4200/video/RecordFile/'+req.query.date+'/'+camIP+'/'+req.query.camID+'_cut.mp4';
        const stat = fs.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;
        if(range){
        const parts = range.replace(/bytes=/,"").split("=");
        const start = parseInt(parts[0],10);
        const end = parts[1] ? parseInt(parts[1],10) : fileSize-1;
        const chunkSize = (end-start) + 1;
        const file = fs.createReadStream(path,{start,end});
        const head = {
        'Content-range' : `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges' : `bytes`,
        'Content-Length' :chunkSize,
        'Content-Type' :'video/mp4'
        }
        res.writeHead(206,head);
        file.pipe(res);
    }
    else{
        const head = {
            'Content-Length':fileSize,
            'Content-Type':'video/mp4'
        }
        res.writeHead(206,head);
        fs.createReadStream(path).pipe(res);

        fs.unlink(filePath,(err)=>{
            if(err) console.log(err);
        });
    }
    })
    .on('error', function(err){
    console.log('error: ', err)
    }).run()
    });
    });
    }
    catch(err){
        console.log(err.message);
    }
    }
    catch(err){
        console.log(err.message);
    }
        
});



// get previous recorded stream  //
//==============================================================================================//


app.ws('/api/stream/:camID', async (ws, req) =>{
      let cameraID = req.params.camID;
      proxy({
        url: `rtsp://admin:AdminPassword@${req.params.camID}:554`,
        transport: 'tcp'
      })(ws)
        let recorder = new Recorder({
            url: `rtsp://admin:AdminPassword@${req.params.camID}:554`,
            folder: './videos',
            name: 'cam'+cameraID
        })
        ws.onmessage = async function(event) {
            var msg = event.data;
            if(msg=='1'){
                console.log('starting recording');
                recorder.startRecording();
            }
            else if(msg == '0'){
                console.log('Stopping recording');
                recorder.stopRecording();
            }
            else{
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                dateString = yyyy + '-'+ mm + '-' + dd ;
                var filePath = './videos/cam'+cameraID+'/'+dateString+'/video/' ;
                let fileName = '';
                fs.readdir(filePath, async (err, files) => {
                    if (err)
                        console.log(err);
                    else {
                        files.forEach(file => {
                            fileName = file.slice(0, 10);
                            if (fileName == dateString)
                                vidName = file;
                        });
                filePath+=vidName;
                fileName=vidName;
                console.log('Adding to ipfs');
                const fileHash = await addIpfsFile (fileName,filePath);
                console.log('Archived '+cameraID);
                fs.unlink(filePath,(err)=>{
                    if(err) console.log(err);
                });
                let eventData = String(fileHash+'$$'+msg)
                try{
                await addToBlock (eventData , cameraID);
                }
                catch(err){
                    console.log(err);
                }
                }
                })
            }
        }      
    });

// websocket secure for rtsp transmission //
//=============================================================================================================//


// change ip of localhost in next function when having multiple computers

const addToBlock = async function (eventData , cameraID){
            let url = 'https://localhost:9443/archiveLiveStream?videoData='+eventData+'&cameraID='+cameraID;
            let options = {rejectUnauthorized : false }
            return new Promise((resolve, reject) =>  // return Promise
            { https
                .get(url, options, res => {
                console.log('Sent IPFS data after uploading')
                })
                .on("error", e => reject(e))         // failure, reject
            });
} 

app.get('/getStream/',async (req,res)=>{
    console.log('request received');
    res.send('wss://localhost:3000/api/stream/'+req.query.camID,)
});

app.get('/putVideo', async (req,res) => {
    try{
    console.log('req to put video Received , Date = '+req.query.videoDate);
    fs.readdir('../../../../iVMS-4200/video/RecordFile/' + req.query.videoDate , (err,files) =>{
        let camIP ="";
        if (err)
            console.log(err);
        else {
            console.log('Reading Directory...');
            files.forEach(file => {
                fileName = file.slice(0, 12);
                if (fileName == req.query.camID)
                    camIP = file;
            });
        }
    ffmpeg('../../../../iVMS-4200/video/RecordFile/'+req.query.videoDate+'/'+camIP+'/'+req.query.camID+'_cut.mp4')
    .setStartTime(req.query.startTime)
    .setDuration(req.query.endTime)
    .output('../../../../iVMS-4200/video/RecordFile/'+req.query.videoDate+'/'+camIP+'/'+req.query.camID+'_bc.mp4')
    .on('end', async function(err) {
        if(!err) { console.log('conversion Done') }
        const filePath = '../../../../iVMS-4200/video/RecordFile/'+req.query.videoDate+'/'+camIP+'/'+req.query.camID+'_bc.mp4' ;
        let fileName = req.query.camID+'bc.mp4';
        const fileHash = await addIpfsFile (fileName,filePath);
        fs.unlink(filePath,(err)=>{
            if(err) console.log(err);
        });
        res.send(String(fileHash));
    })
    .on('error', function(err){
    console.log('error: ', err)
    }).run()
    });
    fs.unlink(filePath,(err)=>{
        if(err) console.log(err);
    });
    }
    catch(e){
        console.log(e.message);
    }
});

const addIpfsFile = async (fileName,filePath)=>{
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName,content:file});
    const {cid} = fileAdded;
    return cid;
}