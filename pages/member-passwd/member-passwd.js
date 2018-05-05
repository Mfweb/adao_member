const app = getApp();
const http = require('../../utils/http.js');
var np_run = false;

function logOut()
{
  http.set_cookie_key('memberUserspapapa','');
  wx.reLaunch({
    url: '../index/index',
  });
}

Page({
  data: {
    CPLoading:false,
    ExitTouch: false
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading();
    http.api_request(//检查登录是否有效
      app.globalData.ApiUrls.CheckSessionURL,
      null,
      function (res) {
        wx.hideNavigationBarLoading();
        if (res.status == 0)//登陆已经失效
        {
          logOut();
        }
        else if (res.toString().indexOf('饼干管理') > 0) {
          console.log("登陆有效");
          wx.startPullDownRefresh({});
        }
        else {
          logOut();
        }
      },
      function () {
        wx.hideNavigationBarLoading();
        logOut();
      }
    );
  },
  onPullDownRefresh: function ()
  {
    wx.stopPullDownRefresh();
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
        if (res.status == 1)
          logOut();
        else
          app.showError(res.info);
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
    console.log(e);
  },
  onUnload:function(){
    logOut();
  },
  onExitTS: function (e) {
    this.setData({ ExitTouch: true });
  },
  onExitTE: function (e) {
    this.setData({ ExitTouch: false });
    logOut();
  },
  onExitTC: function (e) {
    this.setData({ ExitTouch: false });
  }
})