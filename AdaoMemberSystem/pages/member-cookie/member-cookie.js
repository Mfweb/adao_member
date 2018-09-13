const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
import drawQrcode from '../../utils/weapp.qrcode.min.js'

Page({
  data: {
    CookieList: [],//饼干列表
    vCodeLoading: false,//验证码是否在载入
    vCodeShow: false,//验证码是否已显示
    verifyCodeURL: "",//验证码链接
    needDeleteID: "",//需要删除的饼干index
    FormID: "",//表单提交ID
    EnterButLoading: false,//确认按钮loading
    CookieNum: '[0/0]',
    CookieWarning: null
  },
  onLoad: function (options) {

  },
  onReady: function () {
    app.checkVersion();
    var _this = this;
    wx.startPullDownRefresh({});
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getCookies();
    this.setData({ vCodeShow: false });
  },
  //删除饼干(弹出验证码)
  onDeleteCookie: function (e) {
    this.getNewVcode();
    this.setData({ vCodeShow: true, needDeleteID: e.target.id, FormID: "delete" });
  },
  //获取饼干QR码
  onGetCookie: function (event) {
    let selId = event.target.id;
    let _this = this;
    wx.showActionSheet({
      itemList: ['获取二维码', '复制内容'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          if (e.tapIndex == 0) {
            _this.getCookieQR(selId);
          }
          else {
            _this.getCookieToClipboard(selId);
          }
        }
      }
    })
  },
  //关闭验证码输入窗口
  onUClose: function (e) {
    this.setData({ vCodeShow: false });
  },
  /**
   * 确认执行操作，需要验证码请求的操作通过这里执行
   */
  onEnter: function (e) {
    var _this = this;
    var u_vcode = e.detail.value.verifycode;
    var u_index = e.detail.value.needDeleteID;
    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    if (this.data.EnterButLoading == true) return;
    this.setData({ EnterButLoading: true });
    if (e.target.id == 'delete')//删除Cookie
    {
      if (this.data.CookieList[u_index] == true) return;

      var temp_data = this.data.CookieList;
      temp_data[u_index].delLoading = true;
      this.setData({ CookieList: temp_data });//对应的删除按钮显示loading
      temp_data[u_index].delLoading = false;

      http.api_request(
        app.globalData.ApiUrls.CookieDeleteURL + temp_data[u_index].id + ".html",
        {
          verify: u_vcode
        },
        function (res) {
          if (res.status == 1) {
            wx.startPullDownRefresh({});//删除请求成功，刷新页面
            _this.setData({ vCodeShow: false });
            app.showSuccess('删除完成');
            app.log('cookie delete success');
          }
          else {
            app.log('cookie delete error:' + res.info);
            _this.getNewVcode();
            app.showError(res.info);
          }
          _this.setData({ CookieList: temp_data, EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          _this.setData({ CookieList: temp_data, EnterButLoading: false });
        });
    }
    else if (e.target.id == 'new')//获取新Cookie
    {
      http.api_request(
        app.globalData.ApiUrls.CookieGetNewURL,
        {
          verify: u_vcode
        },
        function (res) {
          //app.log(res);
          if (res.status == 1) {
            _this.setData({ vCodeShow: false });
            _this.setData({ EnterButLoading: false });
            wx.startPullDownRefresh({});//获取新Cookie成功，刷新页面
            app.showSuccess('大成功');
            app.log('get new cookie success');
            wx.startPullDownRefresh({});
          }
          else {
            app.log('get new cookie error:' + res.info);
            app.showError(res.info);
          }
          _this.setData({ vCodeShow: false });
          _this.setData({ EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          _this.setData({ EnterButLoading: false });
        });
    }
  },
  //获取新Cookie
  onGetNewCookie: function () {
    this.setData({ vCodeShow: true, FormID: "new" });
    this.getNewVcode();
  },
  //刷新验证码
  onTapVerifyCode: function (e) {
    this.getNewVcode();
  },
  onExit: function (e) {
    app.ExitMenu();
  },
  onEat: function (e) {
    app.playEat();
  },
  /**
   * 获取新验证码
   */
  getNewVcode: function () {
    this.setData({ vCodeLoading: true, verifyCodeURL: "" });
    var _this = this;
    http.get_verifycode(function (sta, img, msg) {
      if (sta == false) {
        app.showError(msg);
      }
      _this.setData({ vCodeLoading: false, verifyCodeURL: img });
    });
  },
  /**
   * 获取Cookie列表
   */
  getCookies: function () {
    var _this = this;
    cookie.getCookies(function (status, msg, info) {
      if (info != null) {
        _this.setData({ CookieNum: info.capacity, CookieWarning: info.warning });
      }

      if (status == false) {
        app.showError(msg);
        if (msg == "本页面需要实名后才可访问_(:з」∠)_" && wx.showTabBarRedDot) {
          wx.showTabBarRedDot({
            index: 1
          });
        }
        else {
          wx.hideTabBarRedDot({
            index: 1
          });
        }
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        return;
      }

      _this.setData({ CookieList: msg });
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    });
  },
  /**
   * 创建并显示二维码
   */
  createQRCode: function (content, callback) {
    var _this = this;
    //在画布上创建二维码
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      text: content,
      _this: _this,
      callback: function () {
        setTimeout(function () {
          //将二维码部分复制出来
          wx.canvasGetImageData({
            canvasId: 'myQrcode',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            success: function (res) {
              //填充整个画布
              const ctx = wx.createCanvasContext('myQrcode', _this);
              ctx.setFillStyle('white');
              ctx.fillRect(0, 0, 220, 220);
              ctx.draw();
              //将刚刚复制出来的二维码写到中心
              wx.canvasPutImageData({
                canvasId: 'myQrcode',
                data: res.data,
                x: 10,
                y: 10,
                width: 200,
                success: function () {
                  //画布内容创建临时文件
                  wx.canvasToTempFilePath({
                    canvasId: 'myQrcode',
                    success: function (res) {
                      console.log(res);
                      //预览
                      wx.previewImage({
                        urls: [res.tempFilePath],
                      });
                    },
                    fail: function () {
                      console.log('error');
                      app.showError("缓存二维码失败");
                    }
                  }, _this);
                },
                fail: function () {
                  app.showError('生成QR码错误2');
                }
              }, _this);
            },
            fail: function () {
              app.showError('生成QR码错误');
            }
          }, _this);
          callback();
        }, 300);
      }
    });
  },
  /**
   * 获取Cookie详细并显示二维码
   */
  getCookieQR: function (index) {
    var _this = this;
    var temp_data = _this.data.CookieList;
    if (temp_data[index].getLoading == true) return;
    temp_data[index].getLoading = true;
    this.setData({ CookieList: temp_data });
    temp_data[index].getLoading = false;

    cookie.getCookieDetail(temp_data[index].id, function (sta, detail) {
      if (sta == true) {
        _this.createQRCode(JSON.stringify({ cookie: detail }), function () {
          _this.setData({ CookieList: temp_data });
          return;
        });
      }
      else {
        app.showError(detail);
        _this.setData({ CookieList: temp_data });
      }
    });
  },
  /**
    * 获取Cookie详细并复制到剪切板
    */
  getCookieToClipboard: function (index) {
    var _this = this;
    var temp_data = _this.data.CookieList;
    if (temp_data[index].getLoading == true) return;
    temp_data[index].getLoading = true;
    this.setData({ CookieList: temp_data });
    temp_data[index].getLoading = false;

    cookie.getCookieDetail(temp_data[index].id, function (sta, detail) {
      if (sta == true) {
        wx.setClipboardData({
          data: detail,
          success: function () {
            app.showSuccess('饼干已复制');
          },
          fail: function () {
            app.showError('复制失败');
          }
        });
      }
      else {
        app.showError(detail);
      }
      _this.setData({ CookieList: temp_data });
    });
  }
})