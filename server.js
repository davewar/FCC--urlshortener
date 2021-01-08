'use strict';

var express = require('express');
var mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require ('dns');


var cors = require('cors');

var app = express();
//body parser needs to be added before any app.use("/") items
app.use(bodyParser.urlencoded({entended: false}));


// Basic Configuration 
var port = process.env.PORT || 3000;

/////////////////////////////////////////////
// https://www.mongodb.com/cloud/atlas


//connection string
 mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true});

//define scheme structure  ie table
const websiteSchema = new mongoose.Schema(
  {
      originalName: {type:String},
      newName: {type:String},
      number: {type:Number}

  }
     
)

// creates a Model.   compile schema to model
const Website = mongoose.model('Website', websiteSchema);

/// /add data to db function
var createManyPeople = function(arrayOfPeople, done) {
 
    Website.create(arrayOfPeople,(err,data) => {
              // console.log(data)
              if(err){
                done(err);
              }
              done(null,data);
              return data;
    })
};

// function to retrieve a record based on the dwid
// var fetchRecord = function(uniqueId, done){

//     Website.find({number: uniqueId}, (err, data)=>{
//         if(err){ console.log("err dw")}; 
//                 // console.log("this is fteched record",data);
//                 console.log()
//                done(null,data);

               
//     })


// };

// fetchRecord(98869,function(){})



//const addRecords = [ {originalName: "xz",newName: "yz1111111", number: dwid } ];
//console.log(addRecords)
//createManyPeople(addRecords,function(){});
// createManyPeople(addRecords,function(){});


//testing  - delete all records and start again
//  Website.deleteMany({}, (err) =>{
//           if(err) return console.log(err)

//           console.log("done")
//  });

////////////////////////////////////////////

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  


// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  console.log(req.body);
  
  const url = req.body.url;     // store original domain address
  const changedUrl = url.replace(/^https?:\/\//, '');    // http or 
  //check if domain address is valid
  dns.lookup(changedUrl, (err) => {
    
            if (err) {
              return res.json(
                                { error: "Invalid URL" }    // not valid domain adddress . send err message
                            );

            } else {
               
               // create id
               const dwid = Math.floor(Math.random() * 100000);
              
              // original url, url without http and id
              const addRecords = [ {originalName: url ,newName: changedUrl, number: dwid } ];
              // console.log(addRecords)
              // add to database
              createManyPeople(addRecords,function(){});            
                           
              // display 
              return res.json(
                //  {"original_url":"https://www.freecodecamp.org","short_url":2}
                { "original_url": url, "short_url": dwid });

              //  res.send("all gd")
            }


  });    //<<<<<dns


  
});   // <<  post end


/// redirect 
app.get("/api/shorturl/new/:id", (req,res)=>{
         
        const val = req.params.id    // <returns string

       const value =  Website.find({number: parseInt(val)})
        .then((result)=>{
            
            
            //  console.log(typeof result);
            //  console.log(result);             
            //  console.log(result[0].number);
            //  console.log(result[0].originalName)
             res.redirect(result[0].originalName)

        })
        .catch((err)=>{console.log("errorrr")})
        


})    /// <<< end of get redirect





app.listen(port, function () {
  console.log('Node.js listening ...');
});