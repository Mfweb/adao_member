const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
var WxParse = require('../../wxParse/wxParse.js');
import drawQrcode from '../../utils/weapp.qrcode.min.js'


var SelectCookieID = 0;

Page({
  data: {
    pageIndex: 0,
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
    verifyCodeURL: "",//验证码链接
    vCodeLoading: false,//验证码是否在载入
    startLoadCookies: false,
    startLoadAuth: false,

    cookieManagerOpenData: {},
    authOpenData: {},
    changePasswdOpenData: {},
    sportOpenData: {},
    popupMenuOpenData: {}
  },
  /**
   * 初始化变量
   * 有的手机退出登录的时候页面数据不会重新初始化
   */
  resetData: function () {
    this.setData({
      pageIndex: 0,
      statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
      verifyCodeURL: '',
      vCodeLoading: false,

      startLoadCookies: false,
      startLoadAuth: false,

      cookieManagerOpenData: {
        top: app.globalData.SystemInfo.Windows.statusBarHeight,
      },
      authOpenData: {
        top: app.globalData.SystemInfo.Windows.statusBarHeight,
      },
      changePasswdOpenData: {
        CPLoading: false
      },
      sportOpenData: {
        StepList: [],
        getAuthFail: false,
        getLoading: false,
        showSelectCookie: false,
        pullDownRefing: false
      },
      popupMenuOpenData: {
        show: false,
        statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
        selectedIndex: 0,
        picURL: '',
        userName: '匿名肥宅',
        appList: app.globalData.AppList,
        menuList: [{
            name: '饼干管理',
            icon: 'cookie',
            canSwitch: true
          },{
            name: '实名认证',
            icon: 'certified',
            canSwitch: true
          },{
            name: '密码修改',
            icon: 'passwd',
            canSwitch: true
          },{
            name: '肥宅排行',
            icon: 'sport',
            canSwitch: true
          },{
            name: '关于',
            icon: 'about',
            canSwitch: false
          },{
            name: '退出',
            icon: 'exit',
            canSwitch: false
          },
        ]
      }
    });
  },
  /**
   * 页面渲染完成
   */
  onReady: function () {
    this.resetData();
    SelectCookieID = 0;
    app.checkVersion();
    this.pullDownRefreshAll();
    let tempUserName = wx.getStorageSync('UserName');
    if (tempUserName == undefined || tempUserName == '') {
      tempUserName = '匿名肥宅';
    }
    this.setData({ 'popupMenuOpenData.userName': tempUserName });
  },
  /**
   * 页面关闭
   */
  onHide: function () {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  },
  /**
   * 开始下拉刷新
   */
  onPullDownRefresh: function () {
    if (this.data.pageIndex == 0) {
      //处理饼干数据
      this.setData({
        startLoadCookies: true
      });
    }
    else if (this.data.pageIndex == 1) {
      //处理实名认证相关数据
      this.setData({
        startLoadAuth: true
      });
    }
    else if (this.data.pageIndex == 2){
      wx.stopPullDownRefresh();
    }
    else if (this.data.pageIndex == 3){
      this.setData({ 'sportOpenData.pullDownRefing': true });
      this.GetStep();
    }
  },
  /**
   * 页面改变
   */
  onChangePage: function(id) {
    if (id.detail == 4) {
      wx.navigateTo({
        url: '../about/about',
      });
    }
    else if (id.detail == 5) {
      app.logOut();
    }
    else {
      this.setData({ pageIndex: id.detail });
    }
  },
  /**
   * 下拉刷新所有
   * 不会有下拉动画
   */
  pullDownRefreshAll: function () {
    this.setData({
      startLoadCookies: true,
      startLoadAuth: true
    });

    //肥宅排行
    this.setData({
      'sportOpenData.pullDownRefing': true
    });
    this.GetStep();
  },

  /**
   * 点击了开始上传步数
   */
  onUploadStep: function (e) {
    if (this.data.sportOpenData.getLoading) return;
    this.setData({ 'sportOpenData.getLoading': true });

    //检查登录是否有效
    /*var now_session = wx.getStorageSync('LoginSession');
    if (now_session == null || now_session.length != 128) {
      app.log('session fail');
      this.WeLogin();
      return;
    }*/
    //这里有个问题，经常已经成功登陆但是会跳失败，暂时每次都登陆一下，使用频率不高
    wx.showModal({
      title: '提示',
      content: '步数只保留24小时，每隔24小时可以上传一次。',
      showCancel: false,
      success: function () {
        this.WeLogin();
      }.bind(this)
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
  /**
   * 点击了获取授权
   */
  onGetAuth: function (e) {
    if (e.detail.authSetting['scope.werun']) {
      this.setData({ 'sportOpenData.getAuthFail': false });
      app.showSuccess('授权成功');
    }
    else {
      app.showError('授权失败');
    }
  },
  /**
   * 选择饼干Radio发生改变
   */
  onSelectCookieRadioChange: function (e) {
    SelectCookieID = e.detail.value;
  },
  /**
   * 取消选择饼干
   */
  onSelectedCancel: function () {
    this.setData({
      'sportOpenData.showSelectCookie': false,
      'sportOpenData.getLoading': false
    });
  },
  /**
   * 确认选择饼干
   */
  onSelectedCookie: function () {
    this.setData({ 'sportOpenData.showSelectCookie': false });
    this.UpWeRunData();
  },

  /**
   * 上传微信运动步数
   */
  UpWeRunData: function () {
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
            console.log(e);
            try {
              if (e.status == 0) {
                app.showSuccess(e.msg);
                wx.startPullDownRefresh({});
                this.setData({ 'sportOpenData.pullDownRefing': true });
              }
              else
                app.showError(e.msg);
            }
            catch (err) {
              app.showError("error");
            }
            this.setData({ 'sportOpenData.getLoading': false });
          }.bind(this),
          function () {
            app.showError("上传失败");
            this.setData({ 'sportOpenData.getLoading': false });
          }.bind(this)
        );
      }.bind(this),
      fail: function () {
        app.showError("获取数据失败");
        this.setData({ 'sportOpenData.getLoading': false });
      }.bind(this)
    })
  },
  /**
   * 获取步数排行
   */
  GetStep: function () {
    wx.request({
      url: app.globalData.ApiUrls.WeDownloadRunURL,
      success: function (res) {
        app.log(res);
        if (res.data.status == 0){
          this.setData({ 'sportOpenData.StepList': res.data.steps });
        }
        else {
          app.showError(res.data.msg);
        }
        wx.stopPullDownRefresh();
        this.setData({ 'sportOpenData.pullDownRefing': false });
      }.bind(this),
      fail: function () {
        app.showError("网络错误");
        wx.stopPullDownRefresh();
        this.setData({ 'sportOpenData.pullDownRefing': false });
      }.bind(this)
    });
  },
  /**
   * 登录
   */
  WeLogin: function () {
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
                this.GetAuth();
              }
              else {
                app.showError("登录失败4");
                this.setData({ 'sportOpenData.getLoading': false });
              }
            }.bind(this),
            fail: function () {
              app.showError("登录失败3");
              this.setData({ 'sportOpenData.getLoading': false });
            }.bind(this)
          });
        }
        else {
          app.showError("登录失败2");
          app.log(e);
          this.setData({ 'sportOpenData.getLoading': false });
        }
      }.bind(this),
      //登录失败
      fail: function (e) {
        app.showError("登录失败1");
        app.log(e);
        this.setData({ 'sportOpenData.getLoading': false });
      }.bind(this)
    });
  },
  /**
   * 获取授权
   */
  GetAuth: function () {
    wx.authorize({
      scope: 'scope.werun',
      success: function (e) {
        if (e.errMsg == "authorize:ok") {
          //获取授权成功，获取并上传步数数据
          this.getCookies(function(sta) {
            if(sta) {
              SelectCookieID = 0;
              this.setData({
                'sportOpenData.showSelectCookie': true,
                'cookieManagerOpenData.CookieList[0].checked': true
              });
            }
            else {
              this.setData({ 'sportOpenData.getLoading': false });
            }
          }.bind(this));
        }
        else {
          app.showError("获取权限失败");
          this.setData({
            'sportOpenData.getLoading': false,
            'sportOpenData.getAuthFail': true
          });
        }
      }.bind(this),
      fail: function (e) {
        app.showError("获取权限失败");
        this.setData({
          'sportOpenData.getLoading': false,
          'sportOpenData.getAuthFail': true
        });
      }.bind(this)
    });
  },
  
  /**
   * 确认修改密码
   */
  onChangePasswdSubmit(e) {
    var old_passwd = e.detail.value.opass;
    var new_passwd = e.detail.value.npass;
    var new_passwd2 = e.detail.value.npass2;
    if (old_passwd < 5 || new_passwd < 5 || new_passwd2 < 5) {
      app.showError('密码至少5位');
      return;
    }
    if (new_passwd != new_passwd2) {
      app.showError('两次输入不一致');
      return;
    }
    if (this.data.changePasswdOpenData.CPLoading == true) return;
    this.setData({ 'changePasswdOpenData.CPLoading': true });

    http.api_request(
      app.globalData.ApiUrls.ChangePasswordURL,
      {
        oldpwd: old_passwd,
        pwd: new_passwd,
        repwd: new_passwd2
      },
      function (res) {
        if (typeof res == 'object') {
          if (res.status == 1)
            app.logOut();
          else
            app.showError(res.info);
        }
        else {
          app.showError("发生了错误");
        }
        this.setData({ 'changePasswdOpenData.CPLoading': false });
      }.bind(this),
      function () {
        app.showError('发生了错误');
        this.setData({ 'changePasswdOpenData.CPLoading': false });
      }.bind(this)
    );
  },
  
})