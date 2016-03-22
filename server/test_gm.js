'use strict';

var gm = require("gm");
var path = require("path");
var fs = require("fs");

var imgBasePath = path.join(__dirname, "img_base");
var imgTmpPath = path.join(__dirname, "img_tmp");


function resize(){
	var destPath = path.join(__dirname, "a_p.jpg");
	var writeStream = fs.createWriteStream(destPath);

	gm("a.jpg")
	.resize(150,150)
	.noProfile()
	.density(300,300)
	.stream()
	.pipe(writeStream, function(err){
		console.log("done ...");
	});
}

function createFile(){
	var destPath = path.join(__dirname, "new.jpg");
	var writeStream = fs.createWriteStream(destPath);

	gm(800,400, "#ddff99f3")
	.drawText("hello world ~", 10,10)
	// .density(300,300)
	.stream()
	.pipe(writeStream, function(err){
		console.log("create done ...");
	})
}

function createFile2(){
	var destPath = path.join(__dirname, "new.jpg");
	var writeStream = fs.createWriteStream(destPath);

	gm(800,400, "#ddff99f3")
	.drawText("hello world ~", 10,10)
	.density(300,300)
	.write(destPath, function(err){
		console.log("create 222 done ...");
	});
}

function judgeFile() {
	// try {
	// 	fs.statSync("aa");
	// } catch (e) {
	// 	console.log("not exists");
	// }

	fs.stat("aa", function(err){
		if(err){
			console.log("file not exists");
		}else {

		}
	})
}

function test(){
	// console.log(Promise);
	// for(let key in new Promise(()=>{}).prototype){
	// 	console.log(key);
	// }

	// console.log(Promise.prototype);

	// var p = new Promise(function(resolve, reject){
	// 	setTimeout(function(){
	// 		resolve("1111111");
	// 	},1500)
	// });
	// p.then((result) => {
	// 	console.log(result);
	// })

	var p1 = function(){
		return new Promise(function(resolve, reject){
			setTimeout(() => {
				console.log("11111111")
				resolve("pppp 1111111");
			}, 1000);
		});
	}
	var p4 = function(result1){
		return new Promise(function(resolve, reject){
			setTimeout(() => {
				console.log("444")
				resolve(result1 + "pppp 4444444444");
			}, 1000);
		})
	}
	var p2 = function(result1){
		console.log("222");
		return result1;
	}
	var p3 = function(result1){
		console.log("333");
		return result1;
	}
	var p5 = function(result){
		console.log("55555" + result);
	}

	p1().then(p2).then(p3).then(p4).then(p5);

}

judgeFile();


// fs.mkdir("aa")
// console.log(fs.exists)
// fs.unlink("aa")
// createFile2();
// createFile();
// resize();