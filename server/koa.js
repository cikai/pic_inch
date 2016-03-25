var app = require("koa")();
var koaStatic = require("koa-static");
var parse = require("co-body");
var mparse = require("co-busboy");
var fs = require("fs");
var path = require("path");

var createFile = require("./pic_service");

var fileUploadPath = path.join(__dirname, "img_base");

// log
app.use(function* (next){
	var start = new Date().getTime();
	console.log(`-- begin ${this.method.toUpperCase()} ${this.path}`);
	yield next;
	var end = new Date().getTime();
	console.log(`end cost [${end-start}]ms`);

});

// static
var staticSubPath = process.env.NODE_ENV == 'product' ? '../build/' : '../'
var staticPath = path.join(__dirname, staticSubPath);
app.use(koaStatic(staticPath));

// 文件上传
app.use(function* (next){
	if(this.path !== '/upload'){
		return yield next;
	}

	// create base folder for image
	yield createBaseFolder();

	// multipart upload
	var parts = mparse(this);
	var part;

	while (part = yield parts) {
		var ext = path.extname(part.filename);
		var tmpFileName = getRandomName() + ext;
		var tmpFilePath = path.join(fileUploadPath, tmpFileName);

		var stream = fs.createWriteStream(tmpFilePath);
		part.pipe(stream);
		console.log('uploading %s -> %s', part.filename, stream.path);

		this.body = {
			code: 'ok',
			result: tmpFileName
		}
	}
	yield next;

});

// 文件做成
app.use(function *(next){
	if(this.path !== '/create'){
		return yield next;
	}

	var picInfo = yield parse(this);
	console.log(picInfo);

	picInfo.tmpFileName = path.basename(picInfo.tmpFileName);
	var doneFilePath = yield createFile(picInfo);
	this.body = {
		code: "ok",
		result: doneFilePath
	}
	yield next;
});

// 文件下载
app.use(function* (next) {
	if(this.path !== '/download'){
		return yield next;
	}
	
	var fileName = this.query.filename;
	var downloadFileName = path.join(fileUploadPath, path.basename(fileName));
	var fstat = fs.statSync(downloadFileName);
	if(fstat.isFile()){
		this.set("Content-Disposition", `attachment; filename=${fileName}`);
		this.type = path.extname(fileName);
		this.body = fs.createReadStream(downloadFileName);
	}
});

function getRandomName(){
	var t = new Date().getTime();
	var r = parseInt(Math.random() * 1000, 10);
	return t + "_" + r;
}

function createBaseFolder(){
	return new Promise((r) => {
		fs.mkdir(fileUploadPath, () => {
			r();
		})
	})
}

var port = 3000;
app.listen(port);
console.log(`server stared on port ${port}`);
