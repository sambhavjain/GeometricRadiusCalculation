var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;

var countrySchema = Schema({
	country : String,
	Radius	: Number,
	centroid : [Number] //lat, long
})

module.exports = mongoose.model('countryDb', countrySchema);