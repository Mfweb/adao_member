const app = getApp();
const http = require('../../utils/http.js');
var np_run = false;

Page({
  data: {
    CPLoading:false,
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading();
    http.api_request(//检查登录是否有效
      app.globalData.ApiUrls.CheckSessionURL,
      null,
      function (res) {
        wx.hideNavigationBarLoading();
        if (typeof res == 'string' && res.indexOf('饼干管理') > 0) {
        }
        else {
          app.logOut();
        }
      },
      function () {
        wx.hideNavigationBarLoading();
        app.logOut();
      }
    );
  },
  onChangePasswdSubmit(e)
  {
    var that = this;
    var old_passwd = e.detail.value.opass;
    var new_passwd = e.detail.value.npass;
    var new_passwd2 = e.detail.value.npass2;
    if (old_passwd < 5 || new_passwd < 5 || new_passwd2 < 5)
    {
      app.showError('密码至少5位');
      return;
    }
    if (new_passwd != new_passwd2)
    {
      app.showError('两次输入不一致');
      return;
    }
    if (np_run) return;
    np_run = true;
    that.setData({ CPLoading:true});
    http.api_request(
      app.globalData.ApiUrls.ChangePasswordURL,
      {
        oldpwd: old_passwd,
        pwd: new_passwd,
        repwd: new_passwd2
      },
      function(res){
        if (typeof res == 'object') {
          if (res.status == 1)
            app.logOut();
          else
            app.showError(res.info);
        }
        else {
          app.showError("发生了错误");
        }
        np_run = false;
        that.setData({ CPLoading: false });
      },
      function()
      {
        app.showError('发生了错误');
        np_run = false;
        that.setData({ CPLoading: false });
      }
    );
  },
  onExit: function (e) {
    app.ExitMenu();
  },
  onEat: function (e) {
    app.playEat();
  }
})