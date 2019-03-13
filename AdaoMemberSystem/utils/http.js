const Promise = require('./es6-promise.js');
const wxApis = require('./wxApis.js');
/**
 * @brief 保存所有Cookie
 * @param data:本次请求的setcookie内容
 * @retval None
 */
function save_cookie(data) {
  data = data.replace(" ", "");
  data = data.split(";");
  var saved_data = wx.getStorageSync('user_cookie') || {};
  //兼容之前登录过的用户
  if (typeof saved_data == 'string') {
    wx.setStorageSync('user_cookie', {});
    saved_data = {};
  }
  var save_array = Array();
  for (let i = 0; i < data.length; i++) {
    var temp_data = data[i].split("=");
    saved_data[temp_data[0]] = temp_data[1];
  }
  wx.setStorageSync('user_cookie', saved_data);
}
/**
 * @brief 获取所有Cookie
 * @retval cookie内容
 */
function get_cookie() {
  var cookies = wx.getStorageSync('user_cookie') || {};
  var out_str = '';
  for (let o in cookies) {
    if (o == 'path') continue;
    out_str += o;
    out_str += '=';
    out_str += cookies[o];
    out_str += ';';
  }
  return out_str;
}
/**
 * @brief 获取指定key的Cookie内容
 * @param key:指定key
 * @retval 指定Key的内容
 */
function get_cookie_key(key) {
  var cookies = wx.getStorageSync('user_cookie') || {};
  return cookies[key];
}
/**
 * @brief 设置指定key的cookie内容
 * @param key:指定key
 * @param value:内容
 * @retval None
 */
function set_cookie_key(key, value) {
  var cookies = wx.getStorageSync('user_cookie') || {};
  if (cookies.hasOwnProperty(key))
    cookies[key] = value;
  else
    cookies.push({ key: value });
  wx.setStorageSync('user_cookie', cookies);
}

/**
 * @brief 带Cookie请求一个地址，并更新Cookie
 * @param url:要请求的地址
 * @param pdata:POST数据
 * @retval None
 */
function request (url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //      'User-Agent': 'HavfunClient-WeChatAPP',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': get_cookie()
      },
      success: function (res) {
        if (res.statusCode >= 400) {
          reject(res);
          return;
        }
        if (res && res.header && res.header['Set-Cookie']) {
          save_cookie(res.header['Set-Cookie']);
        }
        resolve(res);
      },
      fail: function () {
        reject(false);
      }
    });
  });
}

/**
 * @brief Get请求一个地址，不带Cookie
 * @param url:要请求的地址
 * @param pdata:Get数据
 * @retval None
 */
function requestGet(url, data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method: 'GET',
      success: function (res) {
        if (res.statusCode >= 400) {
          reject(res);
          return;
        }
        resolve(res);
      },
      fail: function () {
        reject(false);
      }
    });
  });
}

/**
 * 下载文件
 */
function downloadFile(url, cookie = null) {
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
 * @brief 下载验证码
 */
function get_verifycode() {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: app.globalData.ApiUrls.VerifyCodeURL + "?code=" + Math.random(),
      header: {
        'Cookie': get_cookie()
      },
      success: function (res) {
        if (res.errMsg != 'downloadFile:ok') {
          reject('loaderror.png');
          return;
        }
        resolve(res.tempFilePath);
      },
      fail: function () {
        reject('loaderror.png');
      }
    });
  });
  
}

module.exports = {
  request: request,
  requestGet: requestGet,
  downloadFile: downloadFile,
  get_cookie_key: get_cookie_key,
  set_cookie_key: set_cookie_key,
  get_verifycode: get_verifycode
}
