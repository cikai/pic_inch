
// 用这个可以支持 ECMA2015 的 generator
require("babel-polyfill");

// 加载css
require("./css/all.less");

// 加载js
require("expose?$!expose?jQuery!jquery");
require("jquery-ui");
require("./ui-touch.js");
require('bootstrap');

// template
var templateHtml = require("./template.html");
$(templateHtml).appendTo($(document.body));
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
			<form action="javascript:void(0)" class="form-group">
				<div class="form-group">
					<label for="fileUploader">照片选择</label>
					<span class='help'>支持jpg, gif, png格式的图片</span>
					<div class="upload">
						<input type="file" id="fileUploader" name="selectFile"/>
						<div id="imgPreview" class="offScreen"></div>
						<input type="hidden" id="tmpFileName" name="tmpFileName" />
					</div>
					<div class="progress" v-show="progress != 0">
					  <div class="progress-bar" role="progressbar" aria-valuenow="{{progress}}" aria-valuemin="0" aria-valuemax="100" :style="{width: progress + '%'}">
					    {{progress}}%
					  </div>
					</div>
				</div>
				<div class="type_sel form-group">
					<label for="inlineRadio1">尺寸选择</label>
					<div>
						<label class="radio-inline">
						  <input type="radio" id="inlineRadio1" value="inch1" v-model="type">
						  <label for="inlineRadio1" class="inchRadio">1寸照片</label>
						</label>
						<label class="radio-inline">
						  <input type="radio" name="inlineRadioOptions" id="inlineRadio2" value="inch2" v-model="type">
						  <label for="inlineRadio2" class="inchRadio">2寸照片</label>
						</label>
					</div>
				</div>
				<div class="form-group vertical-align-m" v-show="tmpFileName != ''">
					<div class='inline-block vertical-align-m' style='margin-right:20px;margin-bottom: 20px'>
						<label for="">图片裁剪</label>
						<div :style="previewAllStyle" class='preview_all'>
							<img :style="previewAllStyle" :src="src" alt="" />
							<div :style="calcWhStyle(selector.w)" class='selector' id="moveable">
							</div>
						</div>
					</div>
					<div class='inline-block vertical-align-m'>
						<label for="">输出预览</label>
						<div :style="previewPartDivStyle" class='preview_part'>
							<img :style="previewPartImgStyle" :src="src" alt="" />
						</div>
					</div>
				</div>
				<div class="form-group">
					<button type="button" 
						class='btn btn-primary' 
						@click.prevent='createClickHandler'
						:disabled="tmpFileName == ''">
						生成相片（可打印/冲印）
					</button>
				</div>
			</form>
			<p class="bg-info">做成的照片请使用标准5寸相纸打印/冲印</p>
		</div>
	`,
	data: {
		type: "inch1", 
		src: "",
		tmpFileName: "",
		progress: 0,

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
			w: 100,
			h: 140,
			l: 0,
			t: 0
		},

		previewPartWidth: 250,
		previewPartPic: { // 部分preview图片的信息
			w: 1,
			h: 1,
			marginLeft: 0,
			marginTop: 0
		}

	},
	ready: function(){
		this.initDragAndResize();
		this.initFileUploader();
	},

	computed: {
		previewAllStyle: function(){
			return {
				width: this.previewAllPic.w + 'px',
				height: this.previewAllPic.h + 'px'
			}
		},

		previewPartDivStyle: function(){
			var whInfo = this.calcWhStyle(this.previewPartWidth);
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
		initDragAndResize: function(){
			$("#moveable").draggable({
				containment: "parent",
				drag: ((event, ui ) => {
					let $el = $(ui.helper);
					this.syncSelector($el);
				})
			}).resizable({
				aspectRatio: true,
				autoHide: false,
				containment: "parent",
				handles: "s,e,se",
				minWidth: 15,
				minHeight: 15,
				resize: ((event, ui) => {
					let $el = $(ui.element);
					this.syncSelector($el);
				})
			});
		},

		initFileUploader: function(){
			$("#fileUploader").fileUploader({
				url: "/upload",
				debug: false,
				clientCheck: true,
				type: "image", 
				allowType: ["jpg", "jpeg","png", "gif"],
				maxSize: 1024 * 1024 * 20, // 20M
				previewId: "imgPreview",
				uploadStartCallback: (() => {
					this.tmpFileName = "";
					this.progress = 0;
				}),
				frontCheckNgCallback: ((code) => {
					if(code == "size"){
						alert("图片大小不能超过20M");
					}
					if(code == "type"){
						alert("请选择jpg,png,gif格式的图片");
					}
				}),
				progressCallback: ((percentage) => {
					var intPercentage = parseInt(percentage * 100,10);
					if(intPercentage === 100){
						setTimeout(() => {
							this.progress = intPercentage;		
						},200);
					}else {
						this.progress = intPercentage;
					}
				}),
				doneCallback: ((tmpFileName) => {

					let wh = $("#fileUploader").fileUploader("getImgSizeInfo");
					this.originPic.w = wh.w;
					this.originPic.h = wh.h;

					// file uploader组件提供的preview功能中，图片是按照宽高比例缩放的，
					// 所以这里直接取得图片的宽高作为全图预览的宽高
					let previewImg = $("#imgPreview img").eq(0);
					this.previewAllPic.w = getWidth(previewImg);
					this.previewAllPic.h = getHeight(previewImg);
					this.src = previewImg.attr("src");

					this.calcPartPreviewPicWh();

					this.tmpFileName = tmpFileName;
				})
			});
		},

		createClickHandler: function(){
			common.sendAjax({
				url: '/create',
				method: 'POST',
				data: {
					tmpFileName: this.tmpFileName,
					type: this.type,
					selector: this.calcRealSelector(this.selector)
				}
			}, (doneFileName) => {
				console.log("created file [%s]", doneFileName);
				window.location.href='/download?filename=' + doneFileName;
			});
		},

		syncSelector: function($el){
			let $position = $el.position();
			this.selector.w = getWidth($el)
			this.selector.h = getHeight($el);
			this.selector.l = $position.left;
			this.selector.t = $position.top;

			this.calcPartPreviewPicWh();

			var zoomInRate = this.previewPartWidth / this.selector.w;
			let ml = this.selector.l;
			let mt = this.selector.t;
			this.previewPartPic.marginLeft = ml * zoomInRate * -1;
			this.previewPartPic.marginTop = mt * zoomInRate * -1;

		},

		calcPartPreviewPicWh: function() {
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
			
			var returnInfo = {
				width: w + 'px',
				height: h + 'px'
			};				

			return returnInfo;
		},

		calcRealSelector: function(selector){
			var rateW = this.originPic.w / this.previewAllPic.w;
			var rateH = this.originPic.h / this.previewAllPic.h;
			var rate = Math.max(rateW, rateH);
			return {
				w: parseInt(selector.w * rate, 10),
				h: parseInt(selector.h * rate, 10),
				l: parseInt(selector.l * rate, 10),
				t: parseInt(selector.t * rate, 10)
			}
		}
	},

});


function getWidth($el){
	return parseInt($el.css('width'), 10);
}

function getHeight($el){
	return parseInt($el.css('height'), 10);
}