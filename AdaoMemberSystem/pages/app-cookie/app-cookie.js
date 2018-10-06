const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
var selectedList = [];

Page({
  data: {
    CookieList: [],
    returnJson: '',
    disableLaunch: true,
    disableCheckbox: false,
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight
  },
  onReady: function () {
    selectedList = [];
    if (wx.startPullDownRefresh) {
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
  onTapReturn: function(res) {
    if (selectedList.length > 0) {
      wx.reLaunch({
        url: '../index/index',
      });
    }
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
    if (this.data.CookieList[res.currentTarget.id].checked == true) {
      this.data.CookieList[res.currentTarget.id].checked = false;
      this.setData({ CookieList: this.data.CookieList});
      console.log(this.data.returnJson);
      return;
    }
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
    cookie.getCookies(function (status, msg) {
      if (status == false) {
        app.showError(msg);
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        return;
      }
      this.setData({ CookieList: msg });
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    }.bind(this));
  },
  detailToString: function () {
    var tempObj = [];
    for (let i = 0; i < selectedList.length; i++) {
      tempObj.push(this.data.CookieList[selectedList[i]].detail);
    }
    return JSON.stringify(tempObj);
  },
  getDetail: function (id) {
    let tempList = this.data.CookieList;
    
    cookie.getCookieDetail(this.data.CookieList[id].id, function (sta, res) {
      if (sta == false) {
        app.showError(res);

        if(tempList != undefined && tempList != []) {
          tempList[id].checked = false;
        }
        this.setData({ disableCheckbox: false, CookieList: tempList});
        return;
      }

      if (tempList != undefined && tempList != []) {
        tempList[id].checked = true;
        tempList[id].detail = res;
        this.setData({ disableCheckbox: false, CookieList: tempList });
        var tempString = this.detailToString();
        this.setData({ returnJson: tempString });
        if (selectedList.length > 0) {
          this.setData({ disableLaunch: false });
        }
        else {
          this.setData({ disableLaunch: true });
        }
      }
      else {
        app.showError('数据错误');
      }
    }.bind(this));
  },
  onTapBack: function () {
    wx.navigateBack({

    });
  }
})