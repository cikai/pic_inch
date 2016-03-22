'use strict';

var useLog = require("./logger");

function f1(){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log("1111111");
			resolve("hello");
		}, 1000)
	})
}

function f2(result){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log("2222222", result);
			resolve();
		}, 1000)
	})
}


function f3(){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log("333333");
			resolve();
		}, 1000)
	})
}

f1 = useLog(f1, true);
f2 = useLog(f2, true)
f3 = useLog(f3, true);

f1().then(f2).then(f3);