const app = getApp();
const http = require('../../utils/http.js');

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
          iv: e.iv
        },
        function (e) {
          app.showSuccess(e['stepInfoList'][30]['step'].toString());
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
        UpWeRunData(that);
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
      console.log(e);
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
            console.log(e);
            if (e.data.status == 0) {
              wx.setStorageSync('LoginSession', e.data.session);
              //获取授权
              GetAuth(that);
            }
            else {
              app.showError("登录失败");
              that.setData({ getLoading: false });
            }
          },
          fail: function () {
            app.showError("登录失败");
            that.setData({ getLoading: false });
          }
        });
      }
      else {
        app.showError("登录失败");
        app.log(e);
        that.setData({ getLoading: false });
      }
    },
    //登录失败
    fail: function (e) {
      app.showError("登录失败");
      app.log(e);
      that.setData({ getLoading: false });
    }
  });
}


Page({
  data: {
    getAuthFail: false,
    getLoading:false
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
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
    var now_session = wx.getStorageSync('LoginSession');
    if (now_session == null || now_session.length != 128) {
      app.log('session fail');
      WeLogin(that);
      return;
    }

    wx.checkSession({
      //登录有效，直接获取授权
      success: function () {
        GetAuth(that);
      },
      //登录失败，重新登录
      fail: function () {
        
      }
    });
 
  },
  onGetAuth: function (e) {
    if (e.detail.authSetting['scope.werun']) {
      this.setData({ getAuthFail: false });
      app.showSuccess('授权成功');
    }
    else {
      app.showError('授权失败');
    }
  }
})