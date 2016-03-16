'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var useLog = require("./logger");
var sizeInfo = require("./size_info");

var imgBasePath = path.join(__dirname, "img_base");
var imgTmpPath = path.join(__dirname, "img_tmp");

var inch5Path = path.join(imgBasePath, "inch5.jpg");

var ctx = {
	tmpPath: null,
	
	cropX: 0,
	cropY: 0,
	cropW: 300,
	cropH: 400,
	cropPath: null,

	ready1InchPath: null,
	bgPath: null

}

// 剪切图片到合适的尺寸
function crop(ctx){
	return new Promise((resolve, reject) => {
		
	});
}

// 转换成1寸的照片适合的尺寸
function convertImg() {

	return new Promise(function(resolve, reject){
		// TODO
		var sourceImg = path.join(imgTmpPath, "a.jpg");
		var img1 = path.join(imgTmpPath, "a_1.jpg");
		var writeStream = fs.createWriteStream(img1);

		writeStream.on("finish", () => {
			console.log("-- create one file", img1);
			resolve();
		})

		gm(sourceImg)
		.resize(80,80, "!")
		.noProfile()
		.density(300,300)
		.borderColor("white")
		.border(10, 10)
		.stream()
		.pipe(writeStream) ;
	})
}

// 把1寸照片组合到5寸的底板中
function composite(){
	return new Promise((resolve, reject) => {

		var destPath = path.join(imgTmpPath, "a_c.jpg");
		var img1 = path.join(imgTmpPath, "a_1.jpg");

		var writeStream = fs.createWriteStream(destPath);
		writeStream.on("finish", () => {
			
			resolve();
		});


		let gmRun = 
		gm()
		.command("convert")
		.in("-page", "+0+0")
		.in(inch5Path);

		let x = 0;
		let y = 0;
		for(let i =0;i< 2;i++){
			for(let j= 0;j<6;j++){ 
				y = i * 100;
				x = j * 100;
				gmRun = gmRun
					.in("-page", `+${x}+${y}`)
					.in(img1)
			}
		}
		gmRun.mosaic().write(destPath, () => {
			console.log("-- finish compose", destPath);
			resolve();
		})
	});
	
}

// 准备临时目录
// 准备5寸的底板
function prepareBaseImage(ctx){
	return new Promise((resolve, reject) => {

		// tmp directory
		try {
			fs.statSync(imgTmpPath);
		} catch (e) {
			fs.mkdirSync(imgTmpPath);
		}

		// one inch background image
		var inch5Promise = null;
		try {
			fs.statSync(ctx.bgPath);
		} catch (e) {
			inch5Promise = createInch5Bg(ctx.bgPath);
		}

		Promise.all([inch5Promise]).then(() => {
			resolve();
		})
	})
}

function createInch5Bg(path) {
	return new Promise((resolve, reject) => {
		let w = sizeInfo.inch5.w;
		let h = sizeInfo.inch5.h;
		gm(w, h, "white")
		.density(300,300)
		.write(path, (err) => { 
			console.log("-- create background file inch 5 --");
			resolve();
		});
	})
}

function main(ctx){
	var tasks = [
		new Promise((resolve, reject) => {
			resolve(ctx);
		});
		prepareBaseImage,
		convertImg,
		composite
	];

	tasks = tasks.map((fn) => {
		return useLog(fn, true);
	})

	var chain = null;
	for(let fn of tasks){
		if(!chain) {
			chain = fn();
		}else {
			chain = chain.then(fn);
		}
	}

	// var fn1 = useLog(prepareBaseImage, true);
	// var fn2 = useLog(convertImg, true);
	// var fn3 = useLog(composite, true);
	// fn1().then(fn2).then(fn3);
}



ctx = {
	tmpPath: null,
	
	cropX: 0,
	cropY: 0,
	cropW: 300,
	cropH: 400,
	cropPath: null,

	ready1InchPath: null,
	bgPath: inch5Path

}
main(ctx);