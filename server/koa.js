var app = require("koa")();
var koaStatic = require("koa-static");
var bodyParse = require('koa-better-body');


var path = require("path");

var fileUploadPath = path.join(__dirname, "../img_base");

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

app.use(bodyParse({
	multipart: true,
	formidable: {
		uploadDir: fileUploadPath
	}
}));

app.use(function *(next){
	if(this.path === '/upload'){
		var tmpFilePath = this.request.body.files.selectFile.path;
		var tmpFileName = path.basename(tmpFilePath);
		console.log(`tmp file path [${tmpFilePath}], name [${tmpFileName}]`);
		this.body = {
			code: 'ok',
			result: tmpFileName
		};
	}else {
		this.body = "";
	}

	// yield next;
});

app.use(function *(next){
	if(this.path === '/create'){
		console.log("11111111111");
		var picInfo = yield bodyParse(this);
		console.log(picInfo || "null !");
		// var tmpFileName = this.params.tmpFileName;
		// var tmpFilePath = path.join(fileUploadPath, path.basename(tmpFileName));
		// console.log(`tmp file path [${tmpFilePath}]`);
		// this.body = {
		// 	code: 'ok',
		// 	result: tmpFileName
		// };
	}else {
		this.body = "";
	}
	yield next;
});

var port = 3000;
app.listen(port);
console.log(`server stared on port ${port}`);
