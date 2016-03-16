'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var useLog = require("./logger");
var sizeInfo = require("./size_info");

var ctx = {
	tmpPath: null,
	tmpName: null,
	
	cropX: 0,
	cropY: 0,
	cropW: 300,
	cropH: 400,
	tmpCropPath: null,

	tmpDensityPath: null,
	tmp1InchReadyPath: null,
	tmpDonePath: null,

	bgPath: null

}

// 剪切图片到合适的尺寸
function crop(ctx){
	return new Promise((resolve, reject) => {
		var tmpPath = ctx.tmpPath;
		var tmpDensityPath = ctx.tmpDensityPath;

		gm(tmpPath)
		.noProfile()
		.density(300,300)
		.write(ctx.tmpDensityPath, (err) => {
			gm(tmpDensityPath)
			.crop(ctx.cropX, ctx.cropY, ctx.cropW, ctx.cropH)
			.write(ctx.tmpCropPath, () => {
				console.log("-- crop file ", ctx.tmpCropPath);
				resolve(ctx);
			})
		})
	});
}

// 转换成1寸的照片适合的尺寸
function convertImg(ctx) {

	return new Promise(function(resolve, reject){
		var tmpCropPath = ctx.tmpCropPath;
		var tmp1InchReadyPath = ctx.tmp1InchReadyPath;
		var writeStream = fs.createWriteStream(tmp1InchReadyPath);

		writeStream.on("finish", () => {
			console.log("-- create one file", tmp1InchReadyPath);
			resolve(ctx);
		})

		gm(tmpCropPath)
		.resize(sizeInfo.inch1.w,sizeInfo.inch1.h, "!")
		.noProfile()
		.density(300,300)
		.borderColor("white")
		.border(sizeInfo.inch1.border, sizeInfo.inch1.border)
		.stream()
		.pipe(writeStream) ;
	})
}

// 把1寸照片组合到5寸的底板中
function composite(ctx){
	return new Promise((resolve, reject) => {

		var tmpDonePath = ctx.tmpDonePath;
		var tmp1InchReadyPath = ctx.tmp1InchReadyPath;

		let gmRun = 
		gm()
		.command("convert")
		.in("-page", "+0+0")
		.in(ctx.bgPath)

		let x = 0;
		let y = 0;
		for(let i =0;i< 2;i++){
			for(let j= 0;j<4;j++){ 
				y = i * sizeInfo.inch1.h;
				x = j * sizeInfo.inch1.w;
				gmRun = gmRun
					.in("-page", `+${x}+${y}`)
					.in(tmp1InchReadyPath)
			}
		}
		gmRun.mosaic().write(tmpDonePath, () => {
			console.log("-- finish compose", tmpDonePath);
			resolve(ctx);
		})
	});
	
}

// 准备临时目录
// 准备5寸的底板
function prepareBaseImage(ctx){
	return new Promise((resolve, reject) => {
		// one inch background image
		var inch5Promise = null;
		try {
			fs.statSync(ctx.bgPath);
		} catch (e) {
			inch5Promise = createInch5Bg(ctx.bgPath);
		}

		Promise.all([inch5Promise]).then(() => {
			resolve(ctx);
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
		function(){
			return new Promise((resolve, reject) => {
				resolve(ctx);
			});	
		},
		prepareBaseImage,
		crop,
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
}



var imgBasePath = path.join(__dirname, "img_base");
ctx = {
	tmpPath: path.join(imgBasePath, 'tmp.jpg'),
	tmpName: "tmp",
	
	cropX: 1000,
	cropY: 2000,
	cropW: 1000,
	cropH: 1500,
	tmpCropPath: path.join(imgBasePath, 'tmp_crop.jpg'),

	tmpDensityPath: path.join(imgBasePath, 'tmp_density.jpg'),
	tmp1InchReadyPath: path.join(imgBasePath, 'tmp_1inch_ready.jpg'),
	tmpDonePath: path.join(imgBasePath, 'tmp_done.jpg'),

	bgPath: path.join(imgBasePath, "inch5.jpg")

}
main(ctx);