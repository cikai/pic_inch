'use strict';

function hello1(val){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			val++;
			resolve(val);
		}, 1);
	});
}

function hello2(val){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			val++;
			resolve(val);
		}, 500);
	})
}

function hello3(val){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			val++;
			resolve(val);
		}, 1500);
	})
}

function* main(val){
	val = yield hello1(val);
	val = yield hello2(val);
	val = yield hello3(val);
	return val;
}

// var go = main(1);
// go.next().value.then((result) => {
// 	console.log(result);

// 	go.next(result).value.then((result) => {
// 		console.log(result);

// 		go.next(result).value.then((result) => {
// 			console.log(result);
// 		});
// 	})
// });

var go = main(1);
var result = go.next();
call(result);

function call(result){
	if(result.done === true){
		return;
	} else {
		result.value.then((resultValue) => {
			console.log(resultValue);

			var thisResult = go.next(resultValue);
			call(thisResult);
		})
	}
}

