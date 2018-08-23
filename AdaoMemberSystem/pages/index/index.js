//index.js
//获取应用实例
const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var rememberPW = false;
const PageTitles = ['登录', '注册','找回密码'];
var memberMode = 0;
/**
 * @brief 获得新的验证码
 */
function getNewVcode(_this)
{
  _this.setData({ vCodeLoading: true, verifyCodeURL: "" });
  http.get_verifycode(function (sta, img, msg) {
    if(sta == false) {
      app.showError(msg);
    }
    _this.setData({ vCodeLoading: false, verifyCodeURL: img });
  });
}


function switchPage(that,new_page)
{
  var now_page = that.data.Mode;
  var now_anime = that.data.animations;

  var animeOut = wx.createAnimation({
    duration:200,
    timingFunction:'ease'
  });
  animeOut.opacity(0).step();

  getNewVcode(that);

  now_anime[now_page] = animeOut.export();
  that.setData({ vCodeLoading:true, animations: now_anime});

  setTimeout((function callback() {
    that.setData({ Mode: new_page});
    var now_anime = that.data.animations;
    var animeIn = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease'
    });
    animeIn.opacity(1).step();
    now_anime[new_page] = animeIn.export();
    that.setData({ animations: now_anime, TitleText: PageTitles[new_page]});
    if (new_page == 1) {
      wx.showModal({
        title: '提示',
        content: '目前微软旗下的所有邮箱（包括Hotmail、Outlook、Live等）和新浪邮箱全都屏蔽了A岛的注册邮件，请使用其他邮箱注册。',
        showCancel: false
      });
    }
  }).bind(that), 200);
}

/**
 * 获取并显示公告
 */
function showNotice(callback) {
  wx.request({
    url: app.globalData.ApiUrls.GetNoticeURL,
    success: function (res) {
      if (typeof res.data == 'object') {
        if (res.data.errno == '0' && res.data.notice.length > 0) {
          var noticeMark = wx.getStorageSync('NoticeMark');
          if (noticeMark == undefined || noticeMark == null || noticeMark == '')
            noticeMark = 0;
          if (noticeMark < res.data.id) {
            wx.showModal({
              title: '提示',
              content: res.data.notice,
              confirmText: '不再显示',
              success: function (e) {
                if (e.confirm == true) {
                  wx.setStorageSync('NoticeMark', res.data.id);
                }
                callback();
              }
            });
            return;
          }
        }
      }
      callback();
    },
    fail: function () {
      callback();
    },
  });
}

Page({
  data: {
    verifyCodeURL: "",
    Mode: 0,
    animations: [],
    TitleText: PageTitles[0],
    vCodeLoading: true,
    BLoading: false,
    RememberPW: false,
    UserName: '',
    PassWord: '',
    showTermsWindow: false,
    termsNodes: null
  },
  onLoad: function (e) {
    var that = this;
    var sUN = wx.getStorageSync('UserName');
    var sPW = wx.getStorageSync('PassWord');

    if(sUN != '' && sPW != ''){
      rememberPW = true;
      this.setData({ RememberPW: true, UserName: sUN, PassWord: sPW });
    }

    this.setData({ BLoading:true});
    app.getTerms();
    showNotice(function(){
      /*
          wx.navigateTo({
            url: '../list/list?tid=1529161587tnZJN',
          });
          return;//不继续登录了
      */
      memberMode = 0;
      if (app.globalData.SystemInfo.Scene == 1069) {//通过APP拉起
        if (e.mode != undefined && e.mode == 'reg') {
          that.setData({ BLoading: false });
          switchPage(that, 1);
          return;
        }
        else if (e.mode != undefined && e.mode == 'cookie') {
          memberMode = 1;
        }
      }
      if (e.tid != undefined) {//通过公众号分享串二维码扫描过来
        wx.navigateTo({
          url: '../list/list?tid=' + e.tid,
        });
        return;//不继续登录了
      }
      http.api_request(
        app.globalData.ApiUrls.CheckSessionURL,
        null,
        function (res) {
          if (typeof res == 'string' && res.indexOf('饼干管理') > 0) {
            if (memberMode == 0) {
              wx.switchTab({
                url: '../member-cookie/member-cookie',
              });
            }
            else if (memberMode == 1) {
              wx.navigateTo({
                url: '../app-cookie/app-cookie',
              });
            }
          }
          else if (typeof res == 'object' && res.hasOwnProperty('info')) {
            if (res.info != "并没有权限访问_(:з」∠)_") {
              app.showError(res.info);
            }
          }
          else {
            app.showError('未知错误');
          }
          that.setData({ BLoading: false });
          getNewVcode(that);
        },
        function () {
          app.showError('连接服务器失败');
          that.setData({ BLoading: false });
        }
      );
      switchPage(that, 0);
    });
  },
  onShow: function(e) {
    
  },
  onTapVerifyCode: function(e) {
    var that = this;
    getNewVcode(that);
  },
  onTapIlogin:function(){
    var that = this;
    switchPage(that, 0);
  },
  onTapIsignup: function () {
    var that = this;
    switchPage(that,1);
  },
  onTapIforgot: function () {
    var that = this;
    switchPage(that, 2);
  },
  onLoginSubmit:function(e)//登陆
  {
    if (this.data.BLoading == true) {
      return;
    }
    var that = this;
    var u_email = e.detail.value.email;
    var u_pass  = e.detail.value.passwd;
    var u_vcode = e.detail.value.verifycode;
    if(u_email.indexOf('@') < 1)
    {
      app.showError('邮箱格式错误');
      return;
    }
    if (u_pass.length < 5)
    {
      app.showError('密码长度太短');
      return;
    }
    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    this.setData({ BLoading: true });
    http.api_request(app.globalData.ApiUrls.LoginURL,
    {
      email:u_email,
      password:u_pass,
      verify:u_vcode
    },
    function(res){
      if(typeof res == 'object') {
        if (res.hasOwnProperty('status') && res.status == 1) {
          if (rememberPW) {
            wx.setStorageSync('UserName', u_email);
            wx.setStorageSync('PassWord', u_pass)
          }
          if (memberMode == 0) {
            wx.switchTab({
              url: '../member-cookie/member-cookie',
            });
          }
          else if (memberMode == 1) {
            wx.navigateTo({
              url: '../app-cookie/app-cookie',
            });
          }
        }
        else {
          app.showError(res.info);
          getNewVcode(that);
        }
      }
      else {
        app.showError('发生错误');
        app.log(res);
      }
      that.setData({ BLoading: false });
    },
    function(){
      app.showError('连接服务器失败');
      that.setData({ BLoading: false });
    });
  },
  onSignupSubmit: function(e)//注册
  {
    if (this.data.BLoading == true) {
      return;
    }
    var that = this;
    var u_email = e.detail.value.email;
    var u_vcode = e.detail.value.verifycode;
    var u_agree = e.detail.value.agree.length;
    if(!u_agree) {
      app.showError('请阅读并同意服务条款和隐私政策');
      return;    
    }
    if (u_email.indexOf('@') < 1) {
      app.showError('邮箱格式错误');
      return;
    }

    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    this.setData({ BLoading: true });
    http.api_request(app.globalData.ApiUrls.SignupURL,
      {
        email: u_email,
        verify: u_vcode,
        agree: ['']
      },
      function (res) {
        if (typeof res == 'object') {
          if (res.status == 1) {
            app.showSuccess(res.info);
            switchPage(that, 0);
          }
          else {
            app.showError(res.info);
            getNewVcode(that);
          }
        }
        else {
          app.showError('发生错误');
          app.log(res);
        }
        that.setData({ BLoading: false });
      },
      function () {
        app.showError('连接服务器失败');
        that.setData({ BLoading: false });
      });
  },
  onForgotPassSubmit: function (e)//忘记密码
  {
    if (this.data.BLoading == true) {
      return;
    }
    var that = this;
    var u_email = e.detail.value.email;
    var u_vcode = e.detail.value.verifycode;

    if (u_email.indexOf('@') < 1) {
      app.showError('邮箱格式错误');
      return;
    }

    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    this.setData({ BLoading: true });
    http.api_request(app.globalData.ApiUrls.ForgotURL,
      {
        email: u_email,
        verify: u_vcode
      },
      function (res) {
        if (typeof res == 'object') {
          if (res.status == 1) {
            app.showSuccess(res.info);
          }
          else {
            app.showError(res.info);
            getNewVcode(that);
          }
        }
        else {
          app.showError('发生错误');
          app.log(res);
        }
        that.setData({ BLoading: false });
      },
      function () {
        app.showError('连接服务器失败');
        that.setData({ BLoading: false });
      });
  },
  onEat: function(e){
    app.playEat();
  },
  onRPW:function(e){
    rememberPW = e.detail.value;
  },
  onAppDw:function(){
    wx.showActionSheet({
      itemList: ['APP下载', '关于'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          if (e.tapIndex == 0) {//App下载
            app.showDownloadAPP();
          }
          else if (e.tapIndex == 1) {//关于
            wx.navigateTo({
              url: '../about/about',
            });
          }
        }
      },
      fail: function () { }
    });
  },
  onReadPrivacy:function(){
    wx.navigateTo({ url: '../thread/thread?id=11689471&is_bt=false'});
  },
  onReadTerms: function(){
    var _this = this;
    app.getTerms(function (res) {
      if(res === false) {
        app.showError('网络错误');
      }
      else if (res.status != 'ok') {
        app.showError(res.errmsg);
      }
      else {
        _this.setData({ termsNodes: WxParse.wxParse('item', 'html', res.data, _this, null).nodes, showTermsWindow: true});
      }
    });
  },
  onReadTermsFinish: function(){
    this.setData({ showTermsWindow: false });
  },
  f_touch:function(){}
})
