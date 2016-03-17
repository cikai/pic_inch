'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var useLog = require("./logger");
var sizeInfo = require("./size_info");

var base = path.join(__dirname, "img_base");
var tmp = path.join(base, "tmp.jpg");
var boy = path.join(base, "boy.jpg");
var tiger = path.join(base, "tiger.jpg");
var done = path.join(base, "done.jpg");



function changeDpi(p){

	gm(p)
	.noProfile()
	.density(300, 300)
	.write(p, function(err){
		console.log("done ...");
	})
}

function test2(){
	gm(tmp)
	.composite(boy)
	.geometry('+100+150')
	.composite(boy)
	.geometry('+150+250')
	.write(done, function(err) {
	    if(!err) console.log("Written composite image.");
	});
}

function test3(){
	gm()
	.command("composite")
	.in(boy)
	.in("-geometry", '+100+150')
	.in(tmp)
	.write(done, function(err) {
	    if(!err) console.log("Written composite image.");
	});
}

function test4(){
	gm()
		.command("convert")
		.in("-page", "+0+0")
		.in(tmp)

		.in("-page", "+30+30")
		.in(tiger)

		.in("-page", "+100+100")
		.in(boy)

		.in("density", "300x300")

		.mosaic()
		.write(done,function(){
			console.log("done ...");
		})

}

function rotate(){
	var stream = gm(tiger)
	.resize(100,100, "!")
	.stream();

	gm(stream)
	.rotate("white", -90)
	.write(done, (err) => {
		console.log("rotate done ...");
	});
}


rotate();