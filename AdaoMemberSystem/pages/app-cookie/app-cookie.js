const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
var selectedList = [];
/**
 * 获取所有拥有的Cookie
 */





Page({
  data: {
    CookieList: [],
    returnJson: '',
    disableLaunch: true,
    disableCheckbox: false
  },
  onLoad: function (options) {
    selectedList = [];
    if(wx.startPullDownRefresh) {
      wx.startPullDownRefresh({});
    }
    else {
      wx.showNavigationBarLoading();
      this.getCookies();
      this.setData({ vCodeShow: false });
    }
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getCookies();
    this.setData({ vCodeShow: false });
  },
  onReturn: function () {
    if (selectedList.length == 0) {
      app.showError('请选择要导入的Cookie');
      return;
    }
    wx.navigateTo({
      url: '../index/index',
    })
  },
  onLaunchAppError: function(res) {
    app.showError("返回APP失败\r\n" + res.detail.errMsg);
    app.log(res);
  },
  checkboxChange: function(res) {
    selectedList = res.detail.value;
    if (this.data.disableCheckbox == true){
      this.setData({ disableLaunch: true });
      return;
    }
    if (selectedList.length > 0) {
      this.setData({ disableLaunch: false });
    }
    else {
      this.setData({ disableLaunch: true });
    }
  },
  onTapCheckbox: function(res) {
    var detail = this.data.CookieList[res.currentTarget.id].detail;
    if (detail == undefined || detail == null || detail == '') {
      this.setData({ disableCheckbox: true, disableLaunch: true});
      this.getDetail(res.currentTarget.id);
    }
    else {
      var tempString = this.detailToString();
      this.setData({ returnJson: tempString });
    }
  },
  getCookies: function () {
    var _this = this;
    cookie.getCookies(function (status, msg) {
      if (status == false) {
        app.showError(msg);
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        return;
      }
      _this.setData({ CookieList: msg });
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    });
  },
  detailToString: function () {
    var _this = this;
    var tempObj = [];
    for (let i = 0; i < selectedList.length; i++) {
      tempObj.push(_this.data.CookieList[selectedList[i]].detail);
    }
    return JSON.stringify(tempObj);
  },
  getDetail: function (id) {
    var _this = this;
    cookie.getCookieDetail(_this.data.CookieList[id].id, function (sta, res) {
      if (sta == false) {
        app.showError(res);
        _this.setData({ disableCheckbox: false });
        return;
      }
      _this.data.CookieList[id].detail = res;
      _this.setData({ disableCheckbox: false, CookieList: _this.data.CookieList });
      var tempString = _this.detailToString();
      _this.setData({ returnJson: tempString });
      if (selectedList.length > 0) {
        _this.setData({ disableLaunch: false });
      }
      else {
        _this.setData({ disableLaunch: true });
      }
    });
  }
})