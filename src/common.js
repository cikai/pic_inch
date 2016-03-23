var common = {}

/**
 * send ajax request put token in request header if "method=POST"
 */
common.sendAjax = function() {
    var params = arguments[0];
    var okCallback = arguments[1];
    var ngCallback = arguments[2];
    var completeCallback = arguments[3];
    var validateCallback = arguments[4];

    params.cache = false;
    if (/post/i.test(params.method)) {
        params.headers = {
            "token": $("#token").val()
        };
    }
    params.success = function(data) {
        if (data.code == "error_validate") {
            showMsg(data.result);
            if(validateCallback) {
                validateCallback();
            }
            return;
        } else if (data.code == "error_csrf") {
            showErrorMsg(data.result, toLogout);
            return;
        } else if (data.code == "error_exclusive") {
            showMsg(data.result);
            return;
        } else if (data.code == "error_system") {
            showErrorMsg(data.result);
            return;
        } else if (data.code == "error_timeout") {
            showErrorMsg(data.result);
            return;
        } else if(data.code == "error_filesize_exceeded") {
            showErrorMsg(data.result);
        } else if (data.code == "ok") {
            if (okCallback) {
                okCallback(data.result, data.code);
            }
        } else {
            showErrorMsg("エラー発生しました。");
        }
    };
    params.error = function(xhr) {
        if (xhr.status == "911") {
            showErrorMsg("セッションタイムアウトしました。", toLogout);
        } else if (xhr.status == "413" && xhr.getResponseHeader("fileupload") == "fileupload") {
            showErrorMsg(messages.values["error.filesize.exceeded"]);
        } else {
            showErrorMsg("エラー発生しました。");
            if (ngCallback) {
                ngCallback();
            }
        }
    };
    params.complete = function() {
        if (completeCallback) {
            completeCallback();
        }
    };

    $.ajax(params);
}

function showMsg(msg){
    alert(msg);
}

function showErrorMsg(msg){
    alert(msg);
}

/**
 * get the contextpath of the current project ex: location.href =
 * "http://localhost:8080/cloud_admin/user/add" will return
 * "cloud_admin"
 */
common.getContextPath = function() {
    var fullPath = window.location.pathname;
    var contextPath = fullPath.split("/")[1];
    return contextPath;
}

/**
 * get the base url of current project ex: location.href =
 * "http://localhost:8080/cloud_admin/user/add" will return
 * "http://localhost:8080/cloud_admin"
 */
common.getBaseURL = function() {
    var protocol = window.location.protocol;
    var hostname = window.location.hostname;
    var port = (window.location.port && ":") + location.port;
    var contextPath = window.location.pathname.split('/')[1];
    return protocol + "//" + hostname + port + "/" + contextPath;
}

/**
 * add template support for components
 */
common.jsExtension = function() {
    // String.format
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
    // array.max
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
    // array.min
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    window.alert = function(msg){
        var alertModal = $(".modal-alert");
        alertModal.find(".modal-body").text(msg);
        alertModal.modal("show");
    }
}

module.exports = common;