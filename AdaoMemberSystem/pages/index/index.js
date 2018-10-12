//index.js
const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
const pageTitles = ['登录', '注册', '找回密码'];
var rememberPW = false;
var memberMode = 0;
var pageEvent = null;

Page({
  data: {
    verifyCodeURL: "",
    Mode: 0,
    animations: [],
    TitleText: pageTitles[0],
    vCodeLoading: true,
    BLoading: false,
    RememberPW: false,
    UserName: '',
    PassWord: '',
    showTermsWindow: false,
    termsNodes: null,
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight
  },
  onLoad: function (e) {
    pageEvent = e;
  },
  onReady: function () {
    app.checkVersion();
    let sUN = wx.getStorageSync('UserName');
    let sPW = wx.getStorageSync('PassWord');

    if (sUN != '' && sPW != '') {
      rememberPW = true;
      this.setData({ RememberPW: true, UserName: sUN, PassWord: sPW });
    }

    this.setData({ BLoading: true });
    app.getTerms();
    this.switchPage(0);
    wx.showNavigationBarLoading();
    this.showNotice(function () {
      //1078用来测试的，因为小程序调试工具不支持1069
      if (app.globalData.SystemInfo.Scene == 1078) {
        app.globalData.SystemInfo.Scene = 1069;
        pageEvent.mode = 'cookie';
      }
      memberMode = 0;
      if (app.globalData.SystemInfo.Scene == 1069) {//通过APP拉起
        if (pageEvent.mode != undefined && pageEvent.mode == 'reg') {
          this.setData({ BLoading: false });
          this.switchPage(1);
          this.getNewVcode();
          wx.hideNavigationBarLoading();
          pageEvent.mode = '';
          this.hideLaunchScreen();
          return;
        }
        else if (pageEvent.mode != undefined && pageEvent.mode == 'cookie') {
          memberMode = 1;
        }
      }

      if (pageEvent.tid != undefined) {//通过公众号分享串二维码扫描过来
        this.hideLaunchScreen(function () {
          wx.navigateTo({
            url: '../list/list?tid=' + pageEvent.tid,
          });
          wx.hideNavigationBarLoading();
          pageEvent.tid = undefined;
        }.bind(this));
        return;//不继续登录了
      }

      http.api_request(
        app.globalData.ApiUrls.CheckSessionURL,
        null,
        function (res) {
          this.setData({ BLoading: false });
          this.getNewVcode();
          wx.hideNavigationBarLoading();
          this.hideLaunchScreen(function(){
            if (typeof res == 'string' && res.indexOf('饼干管理') > 0) {
              if (memberMode == 0) {
                wx.redirectTo({
                  url: '../userMember/userMember',
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
          }.bind(this));
        }.bind(this),
        function (httpCode) {
          this.hideLaunchScreen();
          app.showError(httpCode == null ? '连接服务器失败' : ('http' + httpCode));
          wx.hideNavigationBarLoading();
          this.setData({
            BLoading: false,
            vCodeLoading: false,
            verifyCodeURL: '../../imgs/loaderror.png'
          });
        }.bind(this)
      );
    }.bind(this));
  },
  onTapVerifyCode: function (e) {
    this.getNewVcode();
  },
  onTapIlogin: function () {
    this.switchPage(0);
    this.getNewVcode();
  },
  onTapIsignup: function () {
    this.switchPage(1);
    this.getNewVcode();
  },
  onTapIforgot: function () {
    this.switchPage(2);
    this.getNewVcode();
  },
  /**
   * 登录
   */
  onLoginSubmit: function (e)
  {
    if (this.data.BLoading == true) {
      return;
    }
    let u_email = e.detail.value.email;
    let u_pass = e.detail.value.passwd;
    let u_vcode = e.detail.value.verifycode;
    if (u_email.indexOf('@') < 1) {
      app.showError('邮箱格式错误');
      return;
    }
    if (u_pass.length < 5) {
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
        email: u_email,
        password: u_pass,
        verify: u_vcode
      },
      function (res) {
        if (typeof res == 'object') {
          if (res.hasOwnProperty('status') && res.status == 1) {
            if (rememberPW) {
              wx.setStorageSync('UserName', u_email);
              wx.setStorageSync('PassWord', u_pass)
            }
            if (memberMode == 0) {
              wx.redirectTo({
                url: '../userMember/userMember',
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
            this.getNewVcode();
          }
        }
        else {
          app.showError('发生错误');
          app.log(res);
        }
        this.setData({ BLoading: false });
      }.bind(this),
      function (httpCode) {
        app.showError(httpCode == null ? '连接服务器失败' : ('http' + httpCode));
        this.setData({ BLoading: false });
      }.bind(this));
  },
  /**
   * 注册
   */
  onSignupSubmit: function (e)
  {
    if (this.data.BLoading == true) {
      return;
    }
    let u_email = e.detail.value.email;
    let u_vcode = e.detail.value.verifycode;
    let u_agree = e.detail.value.agree.length;
    if (!u_agree) {
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
            this.switchPage(0);
          }
          else {
            app.showError(res.info);
            this.getNewVcode();
          }
        }
        else {
          app.showError('发生错误');
          app.log(res);
        }
        this.setData({ BLoading: false });
      }.bind(this),
      function (httpCode) {
        app.showError(httpCode == null ? '连接服务器失败' : ('http' + httpCode));
        this.setData({ BLoading: false });
      }.bind(this));
  },
  /**
   * 忘记密码
   */
  onForgotPassSubmit: function (e)
  {
    if (this.data.BLoading == true) {
      return;
    }
    let u_email = e.detail.value.email;
    let u_vcode = e.detail.value.verifycode;

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
            this.getNewVcode();
          }
        }
        else {
          app.showError('发生错误');
          app.log(res);
        }
        this.setData({ BLoading: false });
      }.bind(this),
      function (httpCode) {
        app.showError(httpCode == null ? '连接服务器失败' : ('http' + httpCode));
        this.setData({ BLoading: false });
      }.bind(this));
  },
  onEat: function (e) {
    app.playEat();
  },
  onRPW: function (e) {
    rememberPW = e.detail.value;
  },
  /**
   * APP下载
   */
  onAppDw: function () {
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
  onReadPrivacy: function () {
    wx.navigateTo({ url: '../thread/thread?id=11689471&is_bt=false' });
  },
  hideLaunchScreen: function (callback=null) {
    let com = this.selectComponent('#LaunchScreen');
    if(com != null) {
      com.hide(callback);
    }
  },
  /**
   * 载入服务条款
   */
  onReadTerms: function () {
    app.getTerms(function (res) {
      if (res === false) {
        app.showError('网络错误');
      }
      else if (res.status != 'ok') {
        app.showError(res.errmsg);
      }
      else {
        this.setData({ termsNodes: WxParse.wxParse('item', 'html', res.data, this, null).nodes, showTermsWindow: true });
      }
    }.bind(this));
  },
  onReadTermsFinish: function () {
    this.setData({ showTermsWindow: false });
  },
  f_touch: function () {
  },
  /**
   * 获取新验证码
   */
  getNewVcode: function () {
    this.setData({ vCodeLoading: true, verifyCodeURL: "../../imgs/loading.gif" });
    http.get_verifycode(function (sta, img, msg) {
      if (sta == false) {
        app.showError(msg);
      }
      this.setData({ vCodeLoading: false, verifyCodeURL: img });
    }.bind(this));
  },
  /**
   * 切换页面
   */
  switchPage: function (new_page) {
    var now_page = this.data.Mode;
    var now_anime = this.data.animations;

    var animeOut = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease'
    });
    animeOut.opacity(0).step();

    now_anime[now_page] = animeOut.export();
    this.setData({ animations: now_anime });

    setTimeout((function callback() {
      this.setData({ Mode: new_page });
      var now_anime = this.data.animations;
      var animeIn = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease'
      });
      animeIn.opacity(1).step();
      now_anime[new_page] = animeIn.export();
      this.setData({ animations: now_anime, TitleText: pageTitles[new_page] });
      if (new_page == 1) {
        wx.showModal({
          title: '提示',
          content: '目前微软旗下的所有邮箱（包括Hotmail、Outlook、Live等）和新浪邮箱全都屏蔽了A岛的注册邮件，请使用其他邮箱注册。',
          showCancel: false
        });
      }
    }).bind(this), 200);
  },
  /**
   * 获取并显示公告
   */
  showNotice: function (callback) {
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
})
