const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
const wxApis = require('../../utils/wxApis.js');
var SelectCookieID = 0;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number
    },
    hide: {
      type: Boolean
    },
    loadSport: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal == true) {
          SelectCookieID = 0;
          this.setData({
            loadSport: false,
          });
          this.GetStep();
          this.triggerEvent('startload', { from: 'sport', needRefresh: false });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    CookieList: [],
    StepList: [],
    getAuthFail: false,
    getLoading: false,
    showSelectCookie: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 点击了开始上传步数
     */
    onUploadStep: function (e) {
      if (this.data.getLoading) return;
      this.setData({ getLoading: true });

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
        this.setData({ getAuthFail: false });
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
        showSelectCookie: false,
        getLoading: false
      });
    },
    /**
     * 确认选择饼干
     */
    onSelectedCookie: function () {
      this.setData({ showSelectCookie: false });
      this.UpWeRunData();
    },

    /**
     * 上传微信运动步数
     */
    UpWeRunData: function () {
      wxApis.getWeRunData().then(res => {
        return http.request(app.globalData.ApiUrls.WeUploadRunURL,
          {
            session: wx.getStorageSync('LoginSession'),
            encryptedData: res.encryptedData,
            iv: res.iv,
            cookie: SelectCookieID
          });
      }).then(res => {
        try {
          if (res.data.status == 'ok') {
            app.showSuccess('上传成功');
            this.triggerEvent('endload', { from: 'sport', needRefresh: true });
          }
          else {
            app.showError(res.data.errmsg);
          }
        }
        catch (err) {
          app.showError("error");
        }
        this.setData({ getLoading: false });
      }).catch(error => {
        app.showError("获取运动失败");
        console.log(error);
        this.setData({ getLoading: false });
      });
    },
    /**
     * 获取步数排行
     */
    GetStep: function () {
      http.requestGet(app.globalData.ApiUrls.WeDownloadRunURL).then(res => {
        if (res.data.status == 'ok') {
          this.setData({ StepList: res.data.steps });
        }
        else {
          app.showError(res.data.errmsg);
        }
        this.triggerEvent('endload', { from: 'sport', needRefresh: false });
      }).catch(error => {
        app.showError("网络错误[Sport]");
        this.triggerEvent('endload', { from: 'sport', needRefresh: false });
      });
    },
    /**
     * 登录
     */
    WeLogin: function () {
      wxApis.login().then(res => {
        if (res.code) {
          return http.request(
            app.globalData.ApiUrls.WeLoginURL,
            {
              code: res.code,
              time: new Date().getTime()
            });
        }
        else {
          app.showError("登录失败2");
          app.log(res);
          this.setData({ getLoading: false });
        }
      })
        .then(res => {
          if (res.data.status == "ok") {
            wx.setStorageSync('LoginSession', res.data.session);
            //获取授权
            this.GetAuth();
          }
          else {
            app.showError("登录失败4");
            this.setData({ getLoading: false });
          }
        }).catch(error => {
          app.showError("登录失败3");
          console.log(error);
          this.setData({ getLoading: false });
        });
    },
    /**
     * 获取授权
     */
    GetAuth: function () {
      wxApis.authorize().then(res => {
        //获取授权成功，获取并上传步数数据
        this.getCookies(function (sta) {
          if (sta) {
            SelectCookieID = 0;
            this.setData({
              showSelectCookie: true,
              'CookieList[0].checked': true
            });
          }
          else {
            this.setData({ getLoading: false });
          }
        }.bind(this));
      }).catch(() => {
        app.showError("获取权限失败");
        this.setData({
          getLoading: false,
          getAuthFail: true
        });
      });
    },
    /**
     * 获取Cookie列表
     */
    getCookies: function (callback = null) {
      cookie.getCookies().then(res => {
        if (res.cookies.length == 0) {
          app.showError('没有饼干');
          callback(false);
        }
        else {
          this.setData({
            CookieList: res.cookies,
          });
          callback(true);
        }
      })
        .catch(error => {
          if (error.message == '本页面需要实名后才可访问_(:з」∠)_') {
            app.showError('请点击左上角菜单完成实名认证后再使用。');
          }
          else {
            app.showError(error.message);
          }
          callback(false);
        });
    }
  }
})
