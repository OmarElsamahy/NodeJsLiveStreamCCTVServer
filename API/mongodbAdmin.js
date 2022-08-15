const express = require('express');
const app = express();
const mongoose = require("mongoose");
const {event , zone } = require('./db.js')

app.use(express.json());

app.post('/api/addZone' , async (req,res) => {
    try {
        let z = '0';
    const zoneAdd = await zone.create({
        zoneName : req.body.zoneName ,
        zoneIP : req.body.zoneIP,
        numberOfCameras : z, 
    });
    console.log('ZoneAdded');
    } 
    catch(e){
        console.log(e.message);
    }
    res.end();
});


app.get('/api/getAllEvents',async (req,res)=>{
    try{
        let allEvents = await event.find({ eventDate : req.query.date});
        let arrOfEvents=[];
        for(i =0 ; i< allEvents.length;i++)
        {
            arrOfEvents.push(allEvents[i].eventName);
        }
        console.log(arrOfEvents);
        res.send(arrOfEvents);
    }
    catch(err){
        console.log(err);
    }
});


app.post('/api/addCamera' , async (req,res)=>{
    try{
        cameraLocation = req.body.camLocation;
        cameraIP = req.body.cameraIP;
        area = req.body.zoneName;
        let zn = await zone.findOne({ zoneName : area});
        let n = parseInt(zn.numberOfCameras);
        let camLoc = `Camera${n+1}Location`;
        let camIP =  `Camera${n+1}IP`;
        await zone.findOneAndUpdate(
        { zoneName : area},
        { [camLoc] : cameraLocation, [camIP] : cameraIP},
        {
          returnNewDocument: true,
          new: true,
          strict: false
        });
        n=n+1;
        await zone.findOneAndUpdate(
            { zoneName : area},
            { numberOfCameras : n},
            {
              returnNewDocument: true,
              new: true,
              strict: false
            });
        res.send('Succefully added Cam! IP : '+cameraIP + 'camera Location : '+cameraLocation);
    }
    catch(err){
        res.send('Could not Add Cam');
        console.log(err);
    }
});

app.post('/api/addEvent' , async (req,res) => {
    try {
    const eventAdd = await event.create({
        eventName : req.body.eventName ,
        eventCamID : req.body.eventCamID , 
        eventZoneID : req.body.eventZoneID,
        eventDate : req.body.eventDate,
    })

    res.status(201).json({ eventAdd });
    } 
    catch(e){
        console.log(e.message);
    }
    res.end();
});


app.get('/api/getEvent/:eventName' , async (req,res) => {
    try {
    const evnt = await event.findOne({ eventName : req.params.eventName});
    res.send(evnt._id);
    console.log(evnt._id);
    }
    catch(e){
        console.log(e.message);
    }
});

app.get('/api/getZone/:zoneName' , async (req,res) => {
    try {
    const zn = await zone.findOne({ zoneName : req.params.zoneName});
    res.send(zn.zoneIP);
    console.log(zn.zoneIP);
    }
    catch(e){
        console.log(e.message);
    }
});

app.get('/api/allEvents' , async (req,res) => {
    const events = await event.find({})
    res.status(200).json({ events })
})





app.get('/getStream' , async (req,res)=>{
    const coOrdinates = req.query.camCoordinates;
    const area = req.query.area;
    try{
        const zn = await zone.findOne({ zoneName : area});
        const ip = zn.zoneIP;
        let camIP='';
        let n = parseInt(zn.numberOfCameras);
        for (i = 1;i <=n ;i++){
            let camLoc = `zn.Camera${i}Location`;
            console.log(eval(camLoc));
            if(coOrdinates == eval(camLoc)){
                let cIP = `zn.Camera${i}IP`;
                camIP = eval(cIP);
            }
        }
        res.send(camIP);
        // const query = new URLSearchParams({"camID": camID});
        // res.redirect('https://'+ip+':3000/getStream/'+'?'+ query);
    }
    catch(err){
        console.log(err);
    }
});


app.listen(3100,()=>{
    console.log('Server listening on port 3100');
});