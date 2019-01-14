// components/cookieManager/cookieManager.js
const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
const wxApis = require('../../utils/wxApis.js');

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
    loadCookie: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if(newVal == true) {
          this.setData({ 
            loadCookie:false,
            vCodeShow: false
          });
          this.getCookies();
          this.triggerEvent('startload', { from: 'cookie', needRefresh: false });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    verifyCodeURL: '',
    vCodeLoading: false,
    CookieList: [],//饼干列表
    vCodeShow: false,//验证码是否已显示
    needDeleteID: "",//需要删除的饼干index
    FormID: "",//表单提交ID
    EnterButLoading: false,//确认按钮loading
    CookieNum: '[0/0]',
    CookieWarning: null,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 删除饼干
     */
    onDeleteCookie: function (e) {
      this.getNewVcode();
      this.setData({
        vCodeShow: true,
        needDeleteID: e.target.id,
        FormID: 'delete'
      });
    },

    /**
     * 获取饼干
     */
    onGetCookie: function (event) {
      let selId = event.target.id;
      wx.showActionSheet({
        itemList: ['获取二维码', '复制内容'],
        itemColor: '#334054',
        success: function (e) {
          if (e.cancel != true) {
            if (e.tapIndex == 0) {
              this.getCookieQR(selId);
            }
            else {
              this.getCookieToClipboard(selId);
            }
          }
        }.bind(this)
      })
    },
    /**
     * 获取新Cookie
     */
    onGetNewCookie: function () {
      this.setData({
        vCodeShow: true,
        FormID: 'new'
      });
      this.getNewVcode();
    },
    /**
     * 刷新验证码
     */
    onTapVerifyCode: function (e) {
      this.getNewVcode();
    },

    /**
     * 点击了关闭验证码输入框按钮
     */
    onUClose: function (e) {
      this.setData({ vCodeShow: false });
    },

    /**
     * 确认操作删除或获取饼干
     */
    onEnterCookie: function (e) {
      var u_vcode = e.detail.value.verifycode;
      var u_index = e.detail.value.needDeleteID;
      if (u_vcode.length != 5) {
        app.showError('验证码错误');
        return;
      }
      if (this.data.EnterButLoading == true) return;
      this.setData({ EnterButLoading: true });
      if (e.target.id == 'delete') {//删除Cookie
        if (this.data.CookieList[u_index].delLoading == true) return;
        var selectData = 'CookieList[' + u_index + '].delLoading';
        this.setData({ [selectData]: true });//对应的删除按钮显示loading

        cookie.deleteCookie(this.data.CookieList[u_index].id, u_vcode).then(res => {
          this.triggerEvent('endload', { from: 'cookie', needRefresh: true });
          this.setData({
            vCodeShow: false,
            EnterButLoading: false
          });
          app.showSuccess('删除完成');
        }).catch(error => {
          app.log(error);
          app.showError(error);
          this.getNewVcode();
          this.setData({
            [selectData]: false,
            EnterButLoading: false
          });
        });
      }
      else if (e.target.id == 'new') {//获取新Cookie
        cookie.getNewCookie(u_vcode).then(() => {
          this.triggerEvent('endload', { from: 'cookie', needRefresh: true });
          this.setData({
            vCodeShow: false,
            EnterButLoading: false
          });
          app.showSuccess('大成功');
          app.log('get new cookie success');
        }).catch(error => {
          app.log(error);
          app.showError(error);
          this.getNewVcode();
          this.setData({
            EnterButLoading: false
          });
        });
      }
    },

    /**
      * 获取新验证码
      */
    getNewVcode: function () {
      this.setData({
        vCodeLoading: true,
        verifyCodeURL: '../../imgs/loading.gif'
      });
      http.get_verifycode().then(res => {
        this.setData({
          vCodeLoading: false,
          verifyCodeURL: res
        });
      }).catch(error => {
        app.showError('获取验证码失败');
        this.setData({
          vCodeLoading: false,
          verifyCodeURL: res
        });
      });
    },
    /**
     * 获取Cookie列表
     */
    getCookies: function () {
      cookie.getCookies().then(res => {
        if (res.cookies.length == 0) {
          app.showError('没有饼干');
        }
        this.setData({
          CookieNum: res.info.capacity,
          CookieWarning: res.info.warning,
          CookieList: res.cookies
        });
        this.triggerEvent('endload', { from: 'cookie', needRefresh: false, userInfo: res.info });
      })
      .catch(error => {
        if (error.message == '本页面需要实名后才可访问_(:з」∠)_') {
          app.showError('请点击左上角菜单完成实名认证后再使用。');
        }
        else {
          app.showError(error.message);
        }
        this.triggerEvent('endload', { from: 'cookie', needRefresh: false });
      });
    },
    /**
      * 获取Cookie详细并显示二维码
      */
    getCookieQR: function (index) {
      if (this.data.CookieList[index].getLoading == true) return;
      var selectData = 'CookieList[' + index + '].getLoading';
      this.setData({ [selectData]: true });

      cookie.getCookieDetail(this.data.CookieList[index].id).then(res => {
        return wxApis.drawQrcodeX('myQrcode', JSON.stringify({ cookie: res }), this);
      })
        .then(() => {
          return wxApis.setTimeoutX(300);
        })
        .then(() => {
          return wxApis.canvasGetImageData('myQrcode', this);
        })
        .then(res => {
          const ctx = wx.createCanvasContext('myQrcode', this);
          ctx.setFillStyle('white');
          ctx.fillRect(0, 0, 220, 220);
          ctx.draw();
          return wxApis.canvasPutImageData('myQrcode', res.data, this);
        })
        .then(() => {
          return wxApis.canvasToTempFilePath('myQrcode', this);
        })
        .then(res => {
          wx.previewImage({
            urls: [res.tempFilePath],
          });
          this.setData({ [selectData]: false });
        })
        .catch(err => {
          app.log(err);
          app.showError(error);
          this.setData({ [selectData]: false });
        });
    },
    /**
      * 获取Cookie详细并复制到剪切板
      */
    getCookieToClipboard: function (index) {
      if (this.data.CookieList[index].getLoading == true) return;
      var selectData = 'CookieList[' + index + '].getLoading';
      this.setData({ [selectData]: true });

      cookie.getCookieDetail(this.data.CookieList[index].id).then(res => {
        this.setData({ [selectData]: false });
        wx.setClipboardData({
          data: res,
          success: function () {
            app.showSuccess('饼干已复制');
          },
          fail: function () {
            app.showError('复制失败');
          }
        });
      }).catch(error => {
        app.log(error);
        app.showError(error);
        this.setData({ [selectData]: false });
      });
    }
  }
})
