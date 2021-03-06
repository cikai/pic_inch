'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var useLog = require("./logger");
var sizeInfo = require("./size_info");

// 准备文件目录
// 准备5寸的底板
function prepareBaseImage(ctx){
	return new Promise((resolve, reject) => {
		// 5 inch background image
		var promiseArr = [
			createInch5Bg(ctx.bgPath)
		]
		Promise.all(promiseArr).then(() => {
			resolve(ctx);
		})
	})
}

function createInch5Bg(bgPath) {
	return new Promise((resolve, reject) => {

		fs.stat(bgPath, (err) => {
			if(err){
				// file not exists, create one
				let w = sizeInfo.inch5.w;
				let h = sizeInfo.inch5.h;
				gm(w, h, "white")
				.density(300,300)
				.write(bgPath, (err) => { 
					console.log("** create background file inch 5", bgPath);
					resolve();
				});
			}else {
				// nothing todo
				resolve();
			}
		})
	})
}


// 剪切图片被选中的部分
function crop(ctx){
	return new Promise((resolve, reject) => {
		var tmpPath = ctx.tmpPath;
		var tmpDensityPath = ctx.tmpDensityPath;

		gm(tmpPath)
		.noProfile()
		.density(300,300)
		.write(ctx.tmpDensityPath, (err) => {
			gm(tmpDensityPath)
			.crop(ctx.cropW, ctx.cropH, ctx.cropX, ctx.cropY)
			.write(ctx.tmpCropPath, () => {
				console.log("** crop file ", ctx.tmpCropPath);
				resolve(ctx);
			})
		})
	});
}

// 转换成1寸/2寸的照片适合的尺寸
// 2寸的照片放到5寸的底板上，需要-90度旋转
function convertImg(ctx) {

	return new Promise(function(resolve, reject){
		var tmpCropPath = ctx.tmpCropPath;
		var tmpInchReadyPath = ctx.tmpInchReadyPath;
		var writeStream = fs.createWriteStream(tmpInchReadyPath);

		var w = ctx.type == "inch1" ? sizeInfo.inch1.w : sizeInfo.inch2.w;
		var h = ctx.type == "inch1" ? sizeInfo.inch1.h : sizeInfo.inch2.h;

		writeStream.on("finish", () => {
			console.log("** create one file", tmpInchReadyPath);
			resolve(ctx);
		})

		var stream = gm(tmpCropPath)
		.resize(w,h, "!")
		.noProfile()
		.density(300,300)
		.borderColor("white")
		.border(sizeInfo.inch1.border, sizeInfo.inch1.border)
		.stream();
		
		if(ctx.type === 'inch2'){
			stream = gm(stream)
			.rotate("white", -90)
			.stream();
		}

		stream.pipe(writeStream);
	})
}

// 把1寸/2寸照片组合到5寸的底板中
function composite(ctx) {
	return new Promise((resolve, reject) => {

		var bgPath = ctx.bgPath;
		var tmpInchReadyPath = ctx.tmpInchReadyPath;
		var tmpDonePath = ctx.tmpDonePath;

		let coorArr = getCoorArr(ctx.type);

		// 拷贝底板文件，作为composite的起始文件
		fs.writeFileSync(tmpDonePath, fs.readFileSync(bgPath));

		// 递归调用composite
		// the rescure call is ugly , but ...
		//
		// composite这个方法似乎不支持连续调用
		// 还可以用 gm().command("convert").in(path/to/pic).in("-page", '+xx+xx')
		// 这个方法可以连续调用，但是dpi就被改变回了72(不知道如何设定为300。。。)
		// 最后只能采用递归调用composite, 每次写文件。
		function doComposite(){
			if(coorArr.length === 0){
				resolve(ctx);
				console.log("** composite done ...", tmpDonePath);
			}else {
				let xy = coorArr.shift();
				gm(tmpDonePath)
				.composite(tmpInchReadyPath)
				.geometry(`+${xy[0]}+${xy[1]}`)
				.write(tmpDonePath, () => {
					doComposite();
				});
			}
		}

		doComposite();

	});
}

function getCoorArr(type){
	var coorArr = [];
	if(type === "inch1"){
		let x = 0;
		let y = 0;
		for(let i = 0; i< 2; i++){
			for(let j= 0; j< 4; j++){ 
				y = i * sizeInfo.inch1.hBorder;
				x = j * sizeInfo.inch1.wBorder;
				coorArr.push([x, y]);
			}
		}
	}else {
		let x = 0;
		let y = 0;
		for(let i = 0; i< 2; i++){
			for(let j= 0; j< 2; j++){
				y = i * sizeInfo.inch2.wBorder;
				x = j * sizeInfo.inch2.hBorder;
				coorArr.push([x, y]);
			}
		}
	}
	return coorArr;
}

function* main(ctx){

	var fns = [
		prepareBaseImage,
		crop,
		convertImg,
		composite,
		]

	fns = fns.map((fn) => {
		return useLog(fn, true);
	})

	for(let fn of fns){
		yield fn.call(this, ctx);
	}

	// yield prepareBaseImage(ctx);
	// yield crop(ctx);
	// yield convertImg(ctx);
	// yield composite(ctx);
	return path.basename(ctx.tmpDonePath);
}



module.exports = function* (picInfo){
	var imgBasePath = path.join(__dirname, "img_base");
	var tmpFileName = picInfo.tmpFileName;
	var fileBaseName = tmpFileName.substring(0, tmpFileName.indexOf("."));
	var ctx = {
		type: picInfo.type,
		
		// 剪切用的坐标
		cropX: picInfo.selector.l,
		cropY: picInfo.selector.t,
		cropW: picInfo.selector.w,
		cropH: picInfo.selector.h,

		// 各种路径
		tmpPath: path.join(imgBasePath, tmpFileName),
		tmpCropPath: path.join(imgBasePath, `${fileBaseName}_crop.jpg`),
		tmpDensityPath: path.join(imgBasePath, `${fileBaseName}_density.jpg`),
		tmpInchReadyPath: path.join(imgBasePath, `${fileBaseName}_inch_sized.jpg`),
		tmpDonePath: path.join(imgBasePath, `${fileBaseName}_done.jpg`),
		bgPath: path.join(imgBasePath, "inch5.jpg")

	}
	let doneFilePath = yield main(ctx);
	return doneFilePath;
}