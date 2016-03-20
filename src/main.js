
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
				<input type="hidden" id="tmpFileName" name="tmpFileName" />
			</div>
			<div id="imgPreview" class="offScreen" style="width: 500px;height:400px;">
			</div>
			<div :style="previewAllStyle" class='preview_all' v-show="tmpFileName">
				<img :style="previewAllStyle" :src="src" alt="" />
				<div :style="calcWhStyle(selectorWidth)" class='selector' id="moveable">
				</div>
			</div>
			<div class='preview_part' :style="previewPartStyle" v-show="tmpFileName">
				<img :style="previewPartImgStyle" :src="src" alt="" />
			</div>
			<div class='preview_done'></div>
		</div>
	`,
	data: {
		type: "inch1", 
		src: "",
		tmpFileName: "TODO",

		originPic: { // 原始图片宽高
			w: 1,
			h: 1
		},

		previewAllPic: { // 预览图片宽高
			w: 1,
			h: 1
		},

		selectorWidth: 50, // 图片选择框的宽度
		selector: { // 选择框的位置和宽高信息
			w: 50,
			h: 70,
			l: 0,
			t: 0
		},

		previewPartWidth: 250,
		previewPartPic: { // 部分preview图片的信息
			w: 1,
			h: 1,
			marginLeft: -1000,
			marginTop: -500
		}

	},
	ready: function(){
		this.initDrapAndResize();
		this.initFileUploader();
	},

	computed: {
		previewAllStyle: function(){
			return {
				width: this.previewAllPic.w + 'px',
				height: this.previewAllPic.h + 'px'
			}
		},

		previewPartStyle: function(){
			var whInfo = this.calcWhStyle(this.previewPartWidth);
			console.log(whInfo);
			return  whInfo;
		},
		previewPartImgStyle: function(){
			return {
				width: this.previewPartPic.w + 'px',
				height: this.previewPartPic.h + 'px',
				"margin-left":  this.previewPartPic.marginLeft + 'px',
				"margin-top":  this.previewPartPic.marginTop + 'px'
			}
		}
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
				 allowType: ["jpg", "jpeg","png", "gif"],
				 maxSize: 1024 * 1024 * 20, // 20M
				 previewId: "imgPreview",
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
				 	this.originPic.w = wh.w;
				 	this.originPic.h = wh.h;

				 	let previewImg = $("#imgPreview img").eq(0);
				 	this.previewAllPic.w = previewImg.width();
				 	this.previewAllPic.h = previewImg.height();
				 	this.src = previewImg.attr("src");

			 		this.calcPartPreviewPic();

				 })
			});
		},

		syncPosition: function($el){
			let $position = $el.position();
			this.selector.w = $el.width();
			this.selector.h = $el.height();
			this.selector.l = $position.left;
			this.selector.t = $position.top;

			this.calcPartPreviewPic();

			var zoomInRate = this.previewPartWidth / this.selector.w;
			let ml = this.selector.l;
			let mt = this.selector.t;
			this.previewPartPic.marginLeft = ml * zoomInRate * -1;
			this.previewPartPic.marginTop = mt * zoomInRate * -1;

		},

		calcPartPreviewPic: function(){
			var zoomInRate = this.previewPartWidth / this.selector.w;
			var partW = parseInt(this.previewAllPic.w * zoomInRate, 10);
			var partH = parseInt(this.previewAllPic.h * zoomInRate, 10);
			this.previewPartPic.w = partW;
			this.previewPartPic.h = partH;
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

})



