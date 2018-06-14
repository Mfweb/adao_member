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
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading();
    http.api_request(//检查登录是否有效
      app.globalData.ApiUrls.CheckSessionURL,
      null,
      function (res) {
        wx.hideNavigationBarLoading();
        if (res.status == 0) {//登陆已经失效
          logOut();
        }
        else if (res.toString().indexOf('饼干管理') > 0) {
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
  },
  onExit: function (e) {
    wx.showActionSheet({
      itemList: ['APP下载', '关于', '退出登录'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          if (e.tapIndex == 0) {//App下载
            wx.showActionSheet({
              itemList: ['iOS-芦苇娘', 'iOS-橙岛', '安卓-芦苇娘', '安卓-基佬紫', '人权机'],
              itemColor: '#334054',
              success: function (e) {
                if (e.cancel != true) {
                  wx.setClipboardData({
                    data: app.globalData.AppList[e.tapIndex],
                    success: function () {
                      app.showSuccess('链接已复制');
                    },
                    fail: function () {
                      app.showError('复制失败');
                    }
                  });
                }
              }
            });
          }
          else if (e.tapIndex == 1) {//关于
            wx.navigateTo({
              url: '../about/about',
            });
          }
          else if (e.tapIndex == 2) {//退出登录
            logOut();
          }
        }
      },
      fail: function () { }
    });
  },
  onEat: function (e) {
    wx.playBackgroundAudio({
      dataUrl: 'http://cdn.aixifan.com/h/mp3/tnnaii-h-island-c.mp3',
    });
    app.log('play eat');
  }
})