### XXX

* 分辨率

	显示器/手机屏： 1024 * 768, 指横向能显示1024个像素点, 纵向能显示768个像素点

	图片： 200 * 300, 横向为200个像素点，总纵向为300个像素点

* 像素（pixel）

	照相机500万像素，是指照一张照片总共是500万个像素点， 分辨率可能为2592*1944, 或者2560 * 1920

* 画质

	画质与分辨率有关，但是还包含其他许多概念，例如色彩饱和度，还原度，锐利度。。。

* ppi

	pixel per inch， 每英寸像素个数

	数码相机或者手机，无论分辨率多高，通常照出的照片都是72ppi  
	每英寸72个像素，一个平方英寸为72 * 72个像素。

* dpi

	dots per inch， 每英寸的点个数  
	这个是打印或者数码冲印时候用到的概念  

	人眼最大能分辨300dpi的图像。（苹果的retina屏幕，就是超过了这个界限）

	* ppi与dpi是不同的概念，应用在不同的场景

		简单理解的话，可以认为等同。  

		拍摄的照片72ppi，需要转换到300ppi进行冲印比较好

### GraphicMagic

* 调整图像的dpi

	图像的像素保持不变，增大dpi会减小可打印尺寸  
	`+profile "*"`这个选项可以去掉photoshop增加的头信息。

	`gm convert a.jpg -density 300x300 +profile "*" a_density.jpg`

* 调整图像的dpi
	
	图像的打印尺寸保持不变，增大dpi会增加图片的长和宽的像素  
	增加的像素是根据算法算出的。  
	在电脑屏幕上看的话，会因为图片变大了而导致模糊。

	`gm convert a.jpg -resample 300x300 a_resample.jpg`

* 剪切图像
	
	`gm convert a.jpg -crop 200x200+1500+1500 a_crop.jpg`

* 设定边框，并且指定颜色

	`gm convert a.jpg  -bordercolor white -border 20x20 a_border.jpg`