
// 用这个可以支持 ECMA2015 的 generator
require("babel-polyfill");

// 加载css
require("./css/all.less");

// 加载js
require("expose?$!expose?jQuery!jquery");
require("jquery-ui");
require('bootstrap');

// components
require("./fileUploader")();

var common = require("./common");
common.jsExtension();

import Vue from 'vue';
import sizeInfo from '../server/size_info.js';

Vue.config.debug = true; // debug模式

new Vue({
	el: "#main",
	template: `
		<div>
			<div class="upload">
				<input type="file" id="fileUploader"/>
			</div>
			<div :style="{width: previewAllWidth + 'px', height: previewAllHeight + 'px'}" class='preview_all'>
				{{selector.w}},{{selector.h}},{{selector.t}},{{selector.l}}

				<div :style="calcWhStyle(selectorWidth)" class='selector' id="moveable">
				</div>
			</div>
			<div class='preview_part'>
				<div :style="calcWhStyle(partPreviewWidth)">
					<img src="https://www.baidu.com/img/bd_logo1.png" style='' alt=""/>
				</div>
			</div>
			<div class='preview_done'></div>
		</div>
	`,
	data: {
		type: "inch1", 
		fileData: null, // 上传文件数据

		originPic: { // 原始图片宽高
			w: 0,
			h: 0
		},

		previewAllWidth: 500,
		previewAllHeight: 500,
		previewPic: { // 预览图片宽高
			w: 0,
			h: 0,
		},

		selectorWidth: 50, // 图片选择框的宽度
		selector: { // 选择框的位置和宽高信息
			w: 50,
			h: 70,
			l: 0,
			t: 0
		},

		partPreviewWidth: 250, // 选择框中图片的preview宽度
		partPreviewPic: { // 部分preview图片的信息
			w: 0,
			h: 0,
			marginLeft: 0,
			marginTop: 0
		}

	},
	ready: function(){
		this.initDrapAndResize();
		this.initFileUploader();
	},

	methods: {
		initDrapAndResize: function(){
			$("#moveable").draggable({
				containment: "parent",
				drag: ((event, ui ) => {
					let $el = $(ui.helper);
					this.syncPosition($el);
				})
			}).resizable({
				aspectRatio: true,
				autoHide: true,
				containment: "parent",
				handles: "s,e,se",
				minWidth: 15,
				minHeight: 15,
				resize: ((event, ui) => {
					let $el = $(ui.element);
					this.syncPosition($el);
				})
			});
		},

		initFileUploader: function(){
			$("#fileUploader").fileUploader({
				 debug: true,
				 clientCheck: true,
				 type: "image", 
				 allowType: ["jpg", "png", "gif"],
				 maxSize: 1024 * 1024 * 20, // 20M
				 frontCheckNgCallback: ((code) => {
				 	if(code == "size"){
				 		alert("不能超过20M");
				 	}
				 	if(code == "type"){
				 		alert("支持格式jpg,png,gif");
				 	}
				 }),
				 doneCallback: (() => {
				 	let wh = $("#fileUploader").fileUploader("getImgSizeInfo");
				 	console.log(wh);
				 })
			});
		},

		syncPosition: function($el){
			let $position = $el.position();
			this.selector.w = $el.width();
			this.selector.h = $el.height();
			this.selector.l = $position.left;
			this.selector.t = $position.top;
		},
		calcWhStyle: function(baseWidth){
			let w = baseWidth;
			let h = 0;
			if(this.type === 'inch1'){
				h = parseInt(w / sizeInfo.inch1.w * sizeInfo.inch1.h, 10);
			}else {
				h = parseInt(w / sizeInfo.inch2.w * sizeInfo.inch2.h, 10); 
			}
				
			return {
				width: w + 'px',
				height: h + 'px'
			}
		}
	},
	computed: {

	}
})



