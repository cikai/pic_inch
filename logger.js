'use strict';

module.exports = function(fn, asyncFlg){

	let name = fn.name
	let args = Array.prototype.slice(arguments);

	if(!asyncFlg){
		return function(){
			console.log(`== [${name}] start == `)
			var result = fn.apply(this, args);
			console.log(`== [${name}] end == `);
			return result;			
		}
	} else {
		return function(){
			return new Promise((resolve, reject) => {
				console.log(`== [${name}] start == `);
				fn.apply(this,args).then((result) => {
					console.log(`== [${name}] end == `);
					resolve(result);
				});
			});
		}
	}
}