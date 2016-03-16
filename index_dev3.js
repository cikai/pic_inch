'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var useLog = require("./logger");
var sizeInfo = require("./size_info");

var p = path.join(__dirname, "img_base");
var f = path.join(p, "tmp.jpg");
gm(f)
.noProfile()
.density(300, 300)
.write(path.join(p, "done.jpg"), function(err){
	console.log("done ...");
})