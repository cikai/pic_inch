### 像素/宽高/dpi的概念

* 分辨率

	显示器/手机屏： 1024 * 768, 指横向能显示1024个像素点, 纵向能显示768个像素点

	图片： 200 * 300, 横向为200个像素点，纵向为300个像素点

* 摄像头/相机的像素（pixel）

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

* 换算关系

	一张图片 宽300px，高300px，dpi(ppi) 300的话，打印出来就是长 1 * 1 （英寸）的照片
	宽度px / dpi(ppi) = 打印宽度
	高度px / dpi(ppi) = 打印高度

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

* 组合图片

	`gm composite a.jpg -geometry +50+50 bk.jpg a_bk.jpg`


### 运行环境

	* nodejs 5.0+
	* GraphicsMagick
	* npm install webpack forever -g

### 启动

	* 编译
		npm run product

		阿里云主机无法执行成功，猜测是入门机器，内存cpu限制。
		在windows上做成后scp到服务器吧
		scp ./build/* root@115.28.19.15:/root/pic_inch/build/
		
	* 服务器启动
		cd server & NODE_ENV=product forever start koa.js

### 主机情报

* 阿里云ECS服务器

	115.28.19.15
	[主机管理](https://netcn.console.aliyun.com/core/domain/list?spm=5176.1814471.1002.1.8faFN7&source=netcn)

* 阿里云域名

	[http://picinch.xyz:3000/index.html](http://picinch.xyz:3000/index.html)

* CDN

	[百度云加速(免费CDN)](http://next.su.baidu.com/console/add-website/add-website-step3.html#ns/56f4c4555f3ec22c93204f0b/)
	dns9.hichina.com -> n3581.ns.yunjiasu.com
	dns10.hichina.com  -> n563.ns.yunjiasu.com
