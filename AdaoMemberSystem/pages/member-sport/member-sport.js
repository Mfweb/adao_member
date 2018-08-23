const app = getApp();
const cookie = require('../../utils/cookie.js');
const http = require('../../utils/http.js');
var SelectCookieID = 0;


function GetCookies(_this)
{
  cookie.getCookies(function (status, msg) {
    if (status == false) {
      app.showError(msg);
      return;
    }
    _this.setData({ cookie_items: msg, showSelectCookie: true });
  });
}

//获取并上传运动数据
function UpWeRunData(that)
{
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
          try{
            if (e.status == 0) {
              app.showSuccess(e.msg);
              wx.startPullDownRefresh({});
            }
            else
              app.showError(e.msg);
          }
          catch(err){
            app.showError("error");
          }

          that.setData({ getLoading: false });
        },
        function () {
          app.showError("上传失败");
          that.setData({ getLoading: false });
        }
      );
    },
    fail: function () {
      app.showError("获取数据失败");
      that.setData({ getLoading: false });
    }
  })
}

//获取授权
function GetAuth(that)
{
  wx.authorize({
    scope: 'scope.werun',
    success: function (e) {
      if (e.errMsg == "authorize:ok") {
        //获取授权成功，获取并上传步数数据
        GetCookies(that);
      }
      else {
        app.showError("获取权限失败");
        that.setData({ getAuthFail: true, getLoading: false });
      }
    },
    fail: function (e) {
      app.showError("获取权限失败");
      that.setData({ getAuthFail: true, getLoading: false });
    }
  });
}


function WeLogin(that)
{
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
              GetAuth(that);
            }
            else {
              app.showError("登录失败4");
              that.setData({ getLoading: false });
            }
          },
          fail: function () {
            app.showError("登录失败3");
            that.setData({ getLoading: false });
          }
        });
      }
      else {
        app.showError("登录失败2");
        app.log(e);
        that.setData({ getLoading: false });
      }
    },
    //登录失败
    fail: function (e) {
      app.showError("登录失败1");
      app.log(e);
      that.setData({ getLoading: false });
    }
  });
}


function GetStep(that)
{
  wx.request({
    url: app.globalData.ApiUrls.WeDownloadRunURL,
    success:function(res){
      app.log(res);
      if (res.data.status == 0)
        that.setData({StepList: res.data.steps});
      else
        app.showError(res.data.msg);
      wx.stopPullDownRefresh();
    },
    fail:function(){
      app.showError("网络错误");
      wx.stopPullDownRefresh();
    }
  });
}


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
  
  },
  onReady: function () {
    wx.startPullDownRefresh({});
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh () {
    var that = this;
    GetStep(that);
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
    var that = this;

    //检查登录是否有效
    /*var now_session = wx.getStorageSync('LoginSession');
    if (now_session == null || now_session.length != 128) {
      app.log('session fail');
      WeLogin(that);
      return;
    }*/
    //这里有个问题，经常已经成功登陆但是会跳失败，暂时每次都登陆一下，使用频率不高
    wx.showModal({
      title: '提示',
      content: '步数只保留24小时，每隔24小时可以上传一次。',
      showCancel: false,
      success: function () {
        WeLogin(that);
      }
    });
    /*
    wx.checkSession({
      //登录有效，直接获取授权
      success: function () {
        //WeLogin(that);
        GetAuth(that);
      },
      //登录失败，重新登录
      fail: function () {
        WeLogin(that);
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
    var that = this;
    UpWeRunData(that);
  }
})