'use strict';


// 1厘米(cm)=0.3937008英寸(in)

// 1寸照片 2.5cm * 3.5cm / 300dpi
// 宽： 2.5 * 0.3937008 * 300 = 295px
// 高： 3.5 * 0.3937008 * 300 = 413px
// 余白： 上下0.2，左右0.2 
// 0.2 * 0.3937008 * 300 = 24px;


// 5寸的底板 11.6cm * 7.8cm
// 宽： 11.6 * 0.3937008 * 300 = 1370px
// 高： 7.8 * 0.3937008 * 300 = 912px

var info = {
	inch1: {
		w: 295,
		h: 413,
		border: 24
	}
	inch5: {	
		w: 1370,
		h: 912
	}
}

module.exports = info;