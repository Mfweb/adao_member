const Promise = require('./es6-promise.js');
import drawQrcode from './weapp.qrcode.min.js'
/**
 * 保存文件
 */
export const saveFile = (filePath) => {
    return new Promise((resolve, reject) => {
        wx.saveFile({
            tempFilePath: filePath,
            success: function (res) {
                resolve(res);
            },
            fail: function () {
                reject();
            }
        });
    });
}


/**
 * 之所以不直接用同步保存是因为同步保存不一定100%能成功
 */
export const setStorage = (key, data) => {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key: key,
            data: data,
            success: function () {
                resolve();
            },
            fail: function () {
                reject();
            }
        });
    });
}

/**
 * 获取保存文件列表
 */
export const getSavedFileList = () => {
    return new Promise((resolve, reject) => {
        wx.getSavedFileList({
            success: function (res) {
                resolve(res);
            },
            fail: function () {
                reject();
            }
        });
    });
}

/**
 * 延时
 */
export const setTimeoutX = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
}

/**
 * 绘制二维码
 */
export const drawQrcodeX = (id, content, _this) => {
    return new Promise(function (resolve, reject) {
        drawQrcode({
            width: 200,
            height: 200,
            canvasId: id,
            text: content,
            _this: _this,
            callback: function () {
                resolve();
            }
        });
    });
}

/**
 * 获取canvas数据
 */
export const canvasGetImageData = (id, _this) => {
    return new Promise(function (resolve, reject) {
        wx.canvasGetImageData({
            canvasId: id,
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            success: function (res) {
                resolve(res);
            },
            fail: function () {
                reject();
            }
        }, _this);
    });
}

/**
 * 写入canvas数据
 */
export const canvasPutImageData = (id, data, _this) => {
    return new Promise(function (resolve, reject) {
        wx.canvasPutImageData({
            canvasId: id,
            data: data,
            x: 10,
            y: 10,
            width: 200,
            success: function () {
                resolve();
            },
            fail: function () {
                reject();
            }
        }, _this);
    });
}

/**
 * 保存canvas内容
 */
export const canvasToTempFilePath = (id, _this) => {
    return new Promise(function (resolve, reject) {
        wx.canvasToTempFilePath({
            canvasId: id,
            success: function (res) {
                resolve(res);
            },
            fail: function () {
                reject();
            }
        }, _this);
    });
}

/**
 * 获取微信运动步数
 */
export const getWeRunData = () => {
    return new Promise(function (resolve, reject) {
        wx.getWeRunData({
            success: function (e) {
                resolve(e);
            },
            fail: function () {
                reject();
            }
        });
    });
}


/**
 * 微信登录
 */
export const login = () => {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (e) {
                resolve(e);
            },
            fail: function () {
                reject();
            }
        });
    });
}

/**
 * 微信登录
 */
export const authorize = () => {
    return new Promise(function (resolve, reject) {
        wx.authorize({
            scope: 'scope.werun',
            success: function (e) {
                if (e.errMsg == "authorize:ok") {
                    resolve(e);
                }
                else {
                    reject();
                }
            },
            fail: function () {
                reject();
            }
        });
    });
}
