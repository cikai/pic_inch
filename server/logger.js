'use strict';

module.exports = function(fn, asyncFlg){

	let name = fn.name

	if(!asyncFlg){
		return function(){
			let args = Array.prototype.slice.call(arguments);

			console.log(`  == [${name}] start == `)
			var result = fn.apply(this, args);
			console.log(`  == [${name}] end == `);
			return result;			
		}
	} else {
		return function(){
			let args = Array.prototype.slice.call(arguments);

			return new Promise((resolve, reject) => {
				console.log(`  == [${name}] start == `);
				fn.apply(this,args).then((result) => {
					console.log(`  == [${name}] end == `);
					resolve(result);
				});
			});
		}
	}
}