var gm = require("gm");
var path = require("path");
var fs = require("fs");

var imgBasePath = path.join(__dirname, "img_base");
var imgTmpPath = path.join(__dirname, "img_tmp");

var writeStream = fs.createWriteStream(path.join(__dirname, "a_p.jpg"));
gm("a.jpg").resize(200,200).write(writeStream, function(err){
	if(err){
		console.log(err);
	}
	console.log("done ...");
})

