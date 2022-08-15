const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds=10;
require('dotenv').config();

const url = process.env.url;


const zoneSchema = new mongoose.Schema({
    zoneName: {
    type : String,
    required: true,
    trim: true,
    lowercase: true,
    sparse:true
    },
    zoneIP : {type : String,unique : false},
    numberOfCameras : {type : String ,unique : false},
}, { strict: false });
    
const eventSchema = new mongoose.Schema({
    eventName: {
    type : String,
    lowercase: true,
    unique : true,
    sparse:true,
    required: true
    },
    eventCamID: {type : String,unique : false},
    eventZoneID: {type : String , unique : false},
    eventDate : {type : String , unique : false}
});


const userSchema = new mongoose.Schema({
    userName: {
    type : String,
    lowercase: true,
    sparse:true,
    required: true
    },
    userEmail: {type : String,unique : true,required:true},
    userPassword: {type : String , unique : false,required:true},
});

userSchema.pre('save',function(next){
    this.userPassword = bcrypt.hashSync(this.userPassword,saltRounds);next();
});
     
// Creating model objects
const event = mongoose.model('events', eventSchema);
const zone = mongoose.model('zones', zoneSchema);
const users = mongoose.model('users',userSchema);    



const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })


// Exporting our model objects
module.exports = {
    event , zone , users
}