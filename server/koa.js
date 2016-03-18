var app = require("koa")();
var koaStatic = require("koa-static");


var path = require("path");


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



// app.use(function())

var port = 3000;
app.listen(port);
console.log(`server stared on port ${port}`);
