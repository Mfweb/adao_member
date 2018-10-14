const Promise = require('./es6-promise.js');

/**
 * 网络请求
 */
export const request = (method = 'GET') => (url, data, cookie=null) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //      'User-Agent': 'HavfunClient-WeChatAPP',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookie
      },
      success: function (res) {
        resolve(res);
      },
      fail: function () {
        reject();
      }
    });
  });
}
export const requestGet = request('GET');
export const requestPost = request('POST');

/**
 * 下载文件
 */
export const downloadFile = (url, data, cookie = null) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      header: {
        'Cookie': cookie
      },
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
 * 将异步保存转同步
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