const app = getApp();
const cookie = require('../../utils/cookie.js');
const http = require('../../utils/http.js');
var SelectCookieID = 0;

Page({
  data: {
    StepList: [],
    getAuthFail: false,
    getLoading: false,
    showSelectCookie: false,
    cookie_items: [
      { name: '0', value: 'fasdcfe', checked: 'true' },
      { name: '1', value: 'gwqwetv' },
      { name: '2', value: 'fsdfegt' },
      { name: '3', value: 'fsdfegt' },
      { name: '4', value: 'fsdfegt' },
    ]
  },
  onLoad: function (options) {
    SelectCookieID = 0;
  },
  onReady: function () {
    wx.startPullDownRefresh({});
  },
  onPullDownRefresh () {
    this.GetStep();
  },
  onExit: function (e) {
    app.ExitMenu();
  },
  onEat: function (e) {
    app.playEat();
  },
  onUpload: function (e) {
    if (this.data.getLoading) return;
    this.setData({ getLoading: true });
    var _this = this;

    //检查登录是否有效
    /*var now_session = wx.getStorageSync('LoginSession');
    if (now_session == null || now_session.length != 128) {
      app.log('session fail');
      _this.WeLogin();
      return;
    }*/
    //这里有个问题，经常已经成功登陆但是会跳失败，暂时每次都登陆一下，使用频率不高
    wx.showModal({
      title: '提示',
      content: '步数只保留24小时，每隔24小时可以上传一次。',
      showCancel: false,
      success: function () {
        _this.WeLogin();
      }
    });
    /*
    wx.checkSession({
      //登录有效，直接获取授权
      success: function () {
        //_this.WeLogin();
        GetAuth(_this);
      },
      //登录失败，重新登录
      fail: function () {
        _this.WeLogin();
      }
    });*/
 
  },
  onGetAuth: function (e) {
    if (e.detail.authSetting['scope.werun']) {
      this.setData({ getAuthFail: false });
      app.showSuccess('授权成功');
    }
    else {
      app.showError('授权失败');
    }
  },
  radioChange: function(e) {
    SelectCookieID = e.detail.value;
  },
  onCancel: function(){
    this.setData({ showSelectCookie: false, getLoading: false });
  },
  onSelectedCookie: function(){
    this.setData({ showSelectCookie: false });
    this.UpWeRunData();
  },
  /**
   * 获取所有Cookie
   */
  GetCookies: function () {
    var _this = this;
    cookie.getCookies(function (status, msg) {
      if (status == false) {
        app.showError(msg);
        _this.setData({ getLoading: false });
        return;
      }
      msg[0].checked = 'true';
      SelectCookieID = 0;
      _this.setData({ cookie_items: msg, showSelectCookie: true });
    });
  },
  /**
   * 获取授权
   */
  GetAuth: function () {
    var _this = this;
    wx.authorize({
      scope: 'scope.werun',
      success: function (e) {
        if (e.errMsg == "authorize:ok") {
          //获取授权成功，获取并上传步数数据
          _this.GetCookies();
        }
        else {
          app.showError("获取权限失败");
          _this.setData({ getAuthFail: true, getLoading: false });
        }
      },
      fail: function (e) {
        app.showError("获取权限失败");
        _this.setData({ getAuthFail: true, getLoading: false });
      }
    });
  },
  /**
   * 上传
   */
  UpWeRunData: function () {
    var _this = this;
    wx.getWeRunData({
      success: function (e) {
        http.api_request(
          app.globalData.ApiUrls.WeUploadRunURL,
          {
            session: wx.getStorageSync('LoginSession'),
            encryptedData: e.encryptedData,
            iv: e.iv,
            cookie: SelectCookieID
          },
          function (e) {
            try {
              if (e.status == 0) {
                app.showSuccess(e.msg);
                wx.startPullDownRefresh({});
              }
              else
                app.showError(e.msg);
            }
            catch (err) {
              app.showError("error");
            }

            _this.setData({ getLoading: false });
          },
          function () {
            app.showError("上传失败");
            _this.setData({ getLoading: false });
          }
        );
      },
      fail: function () {
        app.showError("获取数据失败");
        _this.setData({ getLoading: false });
      }
    })
  },
  /**
   * 登录
   */
  WeLogin: function () {
    var _this = this;
    wx.login({
      //登录成功
      success: function (e) {
        app.log(e);
        if (e.code) {
          wx.request({
            url: app.globalData.ApiUrls.WeLoginURL,
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Requested-With': 'XMLHttpRequest',
            },
            data: {
              code: e.code,
              time: new Date().getTime()
            },
            success: function (e) {
              if (e.data.status == 0) {
                wx.setStorageSync('LoginSession', e.data.session);
                //获取授权
                _this.GetAuth();
              }
              else {
                app.showError("登录失败4");
                _this.setData({ getLoading: false });
              }
            },
            fail: function () {
              app.showError("登录失败3");
              _this.setData({ getLoading: false });
            }
          });
        }
        else {
          app.showError("登录失败2");
          app.log(e);
          _this.setData({ getLoading: false });
        }
      },
      //登录失败
      fail: function (e) {
        app.showError("登录失败1");
        app.log(e);
        _this.setData({ getLoading: false });
      }
    });
  },
  GetStep: function () {
    var _this = this;
    wx.request({
      url: app.globalData.ApiUrls.WeDownloadRunURL,
      success: function (res) {
        app.log(res);
        if (res.data.status == 0)
          _this.setData({ StepList: res.data.steps });
        else
          app.showError(res.data.msg);
        wx.stopPullDownRefresh();
      },
      fail: function () {
        app.showError("网络错误");
        wx.stopPullDownRefresh();
      }
    });
  }
})