'use strict';

/*
generator function 的形象比喻
方法A要做几件事情，
每做一件事情，要把结果报告老板，老板对结果认可（或者修改）后，
把认可的结果作为这件事情的结果。

方法A就是generator function
几件事情是几个普通的方法, 放在yield关键字的后面
每次调用next函数，就做一件事情，返回给老板的结果{value: xxx, done: false/true}
老板可以对结果修正， 然后通过next方法的参数传递回事件流程中。

generator function并不是为了解决异步问题而生的，
但是结合promise却能实现很好的异步解决方法

注意：首次调用next不传递参数
*/

function* main(val){
	let result1 = yield (val + 1);
	console.log("r1", result1);


	let result2 = yield (result1 + 1);
	console.log("r2", result2);

	return result2;
}

var go = main(10);

// 做第一件事儿，向老板报告结果 {value: 11, done: false}
let result1 = go.next();
// 老板可以修改结果
let param2 = result1.value + 1;

// 做第二件事儿。。。
let result2 = go.next(param2);
console.log(result2);

// 第三件。。。
let result3 = go.next(result2.value);
console.log(result3);
