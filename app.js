var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var country = require('./model/countrySchema');
var boxObj = require("./countryBoundingBoxes.json");
var centroidObj = require("./centroids.json");
var app = express(),
geolib = require('geolib'),
async = require('async'),
jsonfile = require('jsonfile'),
fs = require('fs');

// var configDB = require('./config/database.js');

// configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database

app.get('/read', function(req, res){
  var Converter = require("csvtojson").Converter;
  var converter = new Converter({});
   
  //end_parsed will be emitted once parsing finished 
  converter.on("end_parsed", function (jsonArray) { 
     var json = JSON.stringify(jsonArray)
     console.log('json = '+json)
     fs.writeFile('./countryCentroids.jsoxn', json, 'utf8')
  });
   
  //read from file 
  require("fs").createReadStream("./centroids.csv").pipe(converter);
   
})

app.get('/calculate', function(req, res){
  // console.log('country name = ' + obj[0].country);
  var arr=[];
  
  // function func1(i){
    return new Promise(function(resolve, reject){

      for(var i=0; i<252; i++){
        for(var j=0; j<252; j++){
          func1(j);          
        }
        function func1(j){
          return new Promise(function(resolve, reject){
             if(centroidObj[i].country == boxObj[j].country){
            // console.log(i,j);
              console.log('i,j = '+i,j)
              var maxLat  = boxObj[j].latmax;
              var maxLong = boxObj[j].longmax;
              var minLat  = boxObj[j].latmin;
              var minLong = boxObj[j].longmin;       
              var centLat = centroidObj[i].lat;
              var centLong = centroidObj[i].lng;
              var distanceFromTopRight = getRadius({latitude:maxLat, longitude:maxLong}, {latitude:centLat, longitude:centLong});
              var distanceFromBottomLeft = getRadius({latitude:minLat, longitude:minLong}, {latitude:centLat, longitude:centLong});
              radius = Math.ceil((distanceFromBottomLeft+distanceFromTopRight)/2);
              var obj = {country : centroidObj[i].country, radius : radius, centroid : [centroidObj[i].lat, centroidObj[i].lng]}
              arr.push(obj) 
        
              resolve();
            //   // console.log(arr)
            }

          })
        }
      }
      if(i == 252)
        res.json(arr)        

    })

})
var getRadius=function(obj1, obj2){
     return Math.ceil((geolib.getDistance(obj1, obj2))/1000);
}
var greatCircleDistance = function(lat1, lat2, lon1, lon2){
    var R = 6371; // Km
    var φ1 = lat1*Math.PI/180;
    var φ2 = lat2*Math.PI/180;
    var Δφ = (lat2-lat1)*Math.PI/180;
    var Δλ = (lon2-lon1)*Math.PI/180;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = (R * c);
   // debugger;
    return Math.ceil(d);
    
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})

