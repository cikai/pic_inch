'use strict';


// 1厘米(cm)=0.3937008英寸(in)

// 1寸照片 2.7cm * 3.6cm / 300dpi
// 宽： 2.7 * 0.3937008 * 300 = 319px
// 高： 3.6 * 0.3937008 * 300 = 425px
// 余白： 上下0.2，左右0.2 
// 0.2 * 0.3937008 * 300 = 24px;


// 5寸的底板 12.7cm * 8.9cm
// 宽： 12.7 * 0.3937008 * 300 = 1500px
// 高： 8.9 * 0.3937008 * 300 = 1051px

let inch1w = 2.5
let inch1h = 3.4

let inch2w = 3.5
let inch2h = 5.3

let inch5w = 12.7
let inch5h = 8.9

let border = 0.2


var info = {
	inch1: {
		w: cmToPx(inch1w),
		h: cmToPx(inch1h),
		border: cmToPx(border),
		wBorder: cmToPx(inch1w + border * 2),
		hBorder: cmToPx(inch1h + border * 2),
	},
	inch2: {
		w: cmToPx(inch2w),
		h: cmToPx(inch2h),
		border: cmToPx(border),
		wBorder: cmToPx(inch2w + border * 2),
		hBorder: cmToPx(inch2h + border * 2),
	},
	inch5: {
		w: cmToPx(inch5w),
		h: cmToPx(inch5h)
	}
}

function cmToPx(cm){
	return parseInt(cm * 0.3937008 * 300, 10);
}

module.exports = info;