'use strict';

/**
 * jsp:
 * <input type="file" name="uploadFile" id="uploadFile"/>
 *
 * template:
 * <script type="text/template" id="fileUploaderTemplate">
 * <div class="fileUploaderContainer">
 * <div class="uploadArea"></div>
 * <div class="debugArea"></div>
 * </div>
 * </script>
 *
 * backend:
 *    @RequestMapping(value = "/upload")
 *    @ResponseBody
 *    public Map<String, Object> uploadFile(MultipartFile uploadFile) {
 *    }
 *
 * usage:
 * $("#xxx").fileUploader({
 *  debug: true/false,
 *  clientCheck: true/false,
 *  validationDomId: "p000Fileupload", // hidden field for validation
 *  type: "image", // image, video, file
 *  allowType: ["jpg", "png", "mp4", "ogg"],
 *  maxSize: 1024 * 1024, // 1M
 *  maxWidth: 400, // used when type is image
 *  maxHeight: 300, // used when type is image
 *  previewId: "id of element", // do not set this when type is "file"
 *  url: "/" + common.getContextPath() + "/upload",
 *  data: {
 *      contentId: 123
 *  }
 *  frontCheckNgCallback: function(checkCode){
 *      // checkCode is ['size', 'type', 'widthHeight']
 *  },
 *  bkCheckNgCallback: function(){
 *  },
 *  fileSelectCancelCallback: function(){
 *  }
 *  doneCallback: function(){
 *  },
 *  failCallback: function(){
 *  },
 *  completeCallback: function(){
 *  }
 *  progressCallback: function(percentComplete){
 *  }
 * });
 *
 * api:
 * $("#xxxx").fileUploader("destroy");
 * $("#xxxx").fileUploader("set", {
 *  maxSize: 10 * 1024
 * });
 *
 * global api:
 * $.fn.fileUploader.previewImage(previewId, srcUrl);
 *
 * attention:
 * $("#xxx")  // xxx is the "input[type='file']" element
 *
 */

var common = require("./common.js");

var template = `
<div class="fileUploaderContainer">
  <div class="uploadArea"></div>
  <div class='offScreen'></div>
  <div class="debugArea wrapByCharacter"></div>
</div>
`

var FileUploader = function($dom, options) {
    this.baseDom = $dom,
    this.options = options;

    this.parseTemplate();
    this.startup();
};

FileUploader.prototype = {
    constructor: FileUploader,

    parseTemplate: function() {

        var baseDom = this.baseDom;
        var options = this.options;

        // create dom construction
        template = template.format();
        var $template = $(template).insertBefore(baseDom);
        baseDom.detach().appendTo($template.find(".uploadArea"));
        this.containerDom = $template;

        var $debugArea = $template.find(".debugArea");
        if (options.debug === true) {
            $debugArea.show();
            $debugArea.empty();
        } else {
            $debugArea.hide();
        }
    },

    startup: function() {
        var baseDom = this.baseDom;
        var options = this.options;

        // bind event
        baseDom.on("change", this.fileChangeHandler.bind(this));

        // save preview html
        var $preview = $("#" + options.previewId);
        this.previewHtml = $preview.html();
    },

    fileChangeHandler: function() {
        var baseDom = this.baseDom;
        var options = this.options;
        var containerDom = this.containerDom;

        // clear offscreen image
        containerDom.find(".offScreen").empty();
        // clear debug info
        containerDom.find(".debugArea").empty();
        // clear preview area
        var preivewId = options.previewId;
        var $preview = $("#" + preivewId);
        $preview.html(this.previewHtml);

        if (baseDom.get(0).files.length === 0) {
            this.updateValidStatus();
            if(options.fileSelectCancelCallback){
                options.fileSelectCancelCallback();
            }
            return;
        }

        if (options.clientCheck === true) {
            this.doCheck().done((function(){
                this.doUpload();
            }).bind(this));
        } else {
            this.outputFileInfo();
            this.doUpload();
        }
    },

    doCheck: function() {
        var deferred = new $.Deferred();

        var containerDom = this.containerDom;
        var baseDom = this.baseDom;
        var options = this.options;

        var _this = this;
        if(options.type === 'image' && options.clientCheck === true){
            prepareOffScreenImage(containerDom).done(function(){
                _this.outputFileInfo();
                callCheck.call(_this, deferred);
            });
        } else {
            callCheck.call(this, deferred);
        }

        function callCheck(deferred){
            var checkCode = this.check();
            if (checkCode) {
                this.frontCheckNgCallback(checkCode);
                deferred.reject();
            } else {
                deferred.resolve();
            }
        }

        return deferred;

    },

    doUpload: function() {
        var baseDom = this.baseDom;
        var options = this.options;

        var fileObj = baseDom.get(0).files[0];
        var fd = new FormData();
        var inputName = baseDom.attr("name");
        fd.append(inputName, fileObj);
        var data = options.data;
        for(key in data){
            fd.append(key,data[key]);
        }

        var url = options.url;
        var fnProgress = this.progress.bind(this);
        var ajaxParams = {
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        // Do something with upload progress here
                        fnProgress(percentComplete);
                    }
                }, false);
                return xhr;
            },
            url: url,
            method: "post",
            processData: false,
            contentType: false,
            data: fd
        };
        var paramArr = [
            ajaxParams,
            this.doneCallback.bind(this),
            this.failCallback.bind(this),
            this.completeCallback.bind(this),
            this.bkCheckNgCallback.bind(this)
        ];
        common.sendAjax.apply(null, paramArr);
        // this.doneCallback.call(this);
    },

    check: function() {
        var baseDom = this.baseDom;
        var options = this.options;
        var maxSize = parseInt(options.maxSize, 10);
        var allowType = options.allowType;
        var type = options.type;
        var fileObj = baseDom.get(0).files[0];
        if (!fileObj) {
            return null;
        }
        if (this.checkSize(fileObj.size, maxSize) === false) {
            return "size";
        }
        if (this.checkType(fileObj.type, allowType) === false) {
            return "type";
        }
        if (this.checkWidthHeight(fileObj, options.baseDom) === false) {
            return "widthHeight";
        }

        return null;
    },

    checkType: function(pageType, paramTypes) {
        if(!paramTypes || paramTypes.length === 0){
            return true;
        }
        pageType = pageType.toLowerCase();
        for (var i = 0; i < paramTypes.length; i++) {
            if (pageType.indexOf(paramTypes[i]) != -1) {
                return true;
            }
        }
        return false;
    },

    checkWidthHeight: function() {
        var containerDom = this.containerDom;
        var options = this.options;
        if (options.type !== 'image') {
            return true;
        }

        var maxWidth = options.maxWidth;
        var maxHeight = options.maxHeight;
        var sizeArr = getImageWidthHeight(containerDom);
        var width = sizeArr[0];
        var height = sizeArr[1];
        if (!maxWidth || !maxHeight) {
            return true;
        } else if (!maxWidth && height <= maxHeight) {
            return true;
        } else if (!maxHeight && width <= maxWidth) {
            return true;
        } else if (height <= maxHeight && width <= maxWidth) {
            return true;
        } else {
            return false;
        }
    },

    checkSize: function(fileSize, paramSize){
        if(!paramSize || paramSize == 0){
            return true;
        }else {
            return fileSize <= paramSize;
        }
    },

    doneCallback: function(result) {
        this.debugOutput("upload done ... result is : ");
        this.debugOutput(JSON.stringify(result));
        this.updateValidStatus();

        var baseDom = this.baseDom;
        var options = this.options;
        var type = options.type;
        var fileType = baseDom.get(0).files[0].type;

        var previewId = options.previewId;
        if (previewId) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var srcUrl = reader.result;
                var $preview = $("#" + previewId);
                $preview.empty();
                if (type === "image") {
                    previewImage(previewId, srcUrl);
                } else if (type === "video") {
                    previewVideo(previewId, srcUrl, fileType);
                }
                
                var fnDoneCallback = options.doneCallback;
                if (fnDoneCallback) {
                    fnDoneCallback.call(baseDom, result);
                }
            };
            reader.readAsDataURL(baseDom.get(0).files[0]);
        }
    },

    failCallback: function() {
        this.debugOutput("upload fail ...");

        var baseDom = this.baseDom;
        var options = this.options;
        var fnFailCallback = options.failCallback;
        this.API.reset.call(this);
        if (fnFailCallback) {
            fnFailCallback.call(baseDom);
        }
    },

    frontCheckNgCallback: function(checkCode) {
        this.debugOutput("front-end check fail - " + checkCode);

        var baseDom = this.baseDom;
        var options = this.options;
        this.API.reset.call(this);
        this.updateValidStatus();
        var fnFrontCheckNgCallback = options.frontCheckNgCallback;
        if (fnFrontCheckNgCallback) {
            fnFrontCheckNgCallback.call(baseDom, checkCode);
        }
    },

    bkCheckNgCallback: function() {
        this.debugOutput("backend check fail ");

        var baseDom = this.baseDom;
        var options = this.options;
        var fnBkCheckNgCallback = options.bkCheckNgCallback;
        this.API.reset.call(this);
        this.updateValidStatus();
        if (fnBkCheckNgCallback) {
            fnBkCheckNgCallback.call(baseDom);
        }
    },

    completeCallback: function() {
        this.debugOutput("upload completed .");

        var baseDom = this.baseDom;
        var options = this.options;
        var fnCompleteCallback = options.completeCallback;
        if (fnCompleteCallback) {
            fnCompleteCallback.call(baseDom);
        }
    },

    progress: function(percentComplete) {
        this.debugOutput("process - " + percentComplete);

        var options = this.options;
        var baseDom = this.baseDom;
        var progressCallback = options.progressCallback;
        if (progressCallback) {
            progressCallback.call(baseDom, percentComplete);
        }
    },

    /**
     * integration with jquery-validation
     */
    updateValidStatus: function(){
        var baseDom = this.baseDom;
        var options = this.options;
        var validationDomId = options.validationDomId;
        var validationDom = $("#" + validationDomId);
        if(!validationDomId || !validationDom.valid){
            return;
        }
        if(baseDom[0].files.length === 0){
            validationDom.val("");
        }else {
            validationDom.val(baseDom[0].files[0].name);
        }
        validationDom.valid();
    },

    outputFileInfo: function() {
        var containerDom = this.containerDom;
        var baseDom = this.baseDom;
        var options = this.options;
        var fileObj = baseDom.get(0).files[0];

        containerDom.find(".debugArea").empty();
        this.debugOutput("size - " + fileObj.size);
        if (options.type === 'image') {
            this.debugOutput("w * h - " + getImageWidthHeight(containerDom));
        }
        this.debugOutput("type - " + fileObj.type);
        this.debugOutput("name - " + fileObj.name);
        this.debugOutput(" --- ");
    },

    debugOutput: function(message) {
        var options = this.options;
        var containerDom = this.containerDom;
        if (options.debug) {
            var $debugArea = containerDom.find(".debugArea");
            $("<div></div>").text(message).appendTo($debugArea);
        }
    },

    API: {
        "destroy": function() {
            var baseDom = this.baseDom;
            var options = this.options;
            var containerDom = this.containerDom;
            if (!options) {
                // not init yet
                return;
            }
            baseDom.detach().insertBefore(containerDom);
            baseDom.removeData("fileUploader");
            containerDom.remove();
        },
        "set": function(options) {
            var baseDom = this.baseDom;
            var oldOptions = this.options || {};
            var defaultOptions = $.fn.fileUploader.defaults;
            options = $.extend({}, defaultOptions, oldOptions, options);
            this.options = options;
        },
        "reset": function() {
            var baseDom = this.baseDom;
            var options = this.options;
            var containerDom = this.containerDom;

            // reset validation dom value
            var validationDomId = options.validationDomId;
            var $validationDom = $("#" + validationDomId);
            if($validationDom && $validationDom.length > 0){
                $validationDom.val("");
            }

            // clear debug info
            containerDom.find(".offScreen").empty();

            // clear preview area
            var preivewId = options.previewId;
            var $preview = $("#" + preivewId);
            $preview.html(this.previewHtml);

            // reset file element
            baseDom.wrap("<form></form>");
            var $form = baseDom.closest("form");
            $form.get(0).reset();
            baseDom.detach().insertBefore($form);
            $form.remove();
        },
        "getImgSizeInfo": function(){
            var whArr = getImageWidthHeight(this.containerDom);
            return {
                w: whArr[0],
                h: whArr[1]
            }
        }
    }
};

function previewImage(previewId, srcUrl) {
    var $preview = $("#" + previewId);
    $("<img></img>").attr("src", srcUrl).css({
        "max-width": "100%",
        "max-height": "100%"
    }).addClass("verticalCenterDiv").appendTo($preview);
}

/**
 * FIXME, some small mp4 file can not preview in chrome ?
 */
function previewVideo(previewId, srcUrl, type) {
    var $preview = $("#" + previewId);
    var video = $("<video controls></video>");
    var source = $("<source>").attr({
        "src": srcUrl,
        "type": type
    });
    var $message = $("<p>サポートではありません。</p>");
    source.appendTo(video);
    $message.appendTo(video);
    video.css({
        "max-width": "100%",
        "max-height": "100%"
    }).addClass("verticalCenterDiv").appendTo($preview);
}

/**
 * imageの場合、width, heightを取得する
 */
function prepareOffScreenImage(containerDom) {
    var deferred = new $.Deferred();
    var $file = $("input[type='file']", containerDom);
    var file = $file.get(0).files[0];

    // prevent browser crash from large size of image
    // MAX 50M
    if(file.size > 1024 * 1024 * 50){
        deferred.resolve();
        return deferred;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var srcUrl = reader.result;
        var $img = $("<img></img>").appendTo(containerDom.find('.offScreen'));
        $img.attr("src", srcUrl);
        $img.on("load error", function() {
            deferred.resolve();
        });
    };
    reader.readAsDataURL(file);
    return deferred;
}

function getImageWidthHeight(containerDom) {
    var width = 0;
    var height = 0;
    var $imageDom = $(".offScreen > img", containerDom);
    width = $imageDom.width();
    height = $imageDom.height();
    return [width, height];
}

function main(options) {
    var _arguments = arguments;

    // get methods
    if (typeof options === 'string' && options.startsWith("get")) {
        var fileUploaderObj = this.data("fileUploader");
        if(!fileUploaderObj){
            return;
        }
        var args = Array.prototype.slice.call(_arguments);
        var methodName = options;
        var result = fileUploaderObj.API[methodName].apply(fileUploaderObj, args);
        return result;
    }

    // component init and set methods
    return this.each(function(_, dom) {
        var $dom = $(dom);
        var fileUploaderObj = $dom.data("fileUploader");

        if (fileUploaderObj) {
            return;
        } else {
            options = $.extend($.fn.fileUploader.defaults, options);
            fileUploaderObj = new FileUploader($dom, options);
            $dom.data("fileUploader", fileUploaderObj);
        }
    });
}

function extend() {
    $.fn.fileUploader = main;

    // static methods
    $.fn.fileUploader.previewImage = previewImage;

    // default configs
    $.fn.fileUploader.defaults = {
        debug: false,
        type: "image",
        clientCheck: true,
        allowType: ["png", "gif", "jpg", "jpeg"],
        maxSize: 1024 * 1024 // 1M
    };
};

module.exports = extend;