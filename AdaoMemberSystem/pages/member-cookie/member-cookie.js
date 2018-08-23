const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
import drawQrcode from '../../utils/weapp.qrcode.min.js'
var de_run = false;
var nw_run = false;

/**
 * @brief 获得新的验证码
 */
function getNewVcode(that) {
  that.setData({ vCodeLoading: true, verifyCodeURL: "" });
  http.get_verifycode(function (res) {
    if (res.statusCode == 200) {
      that.setData({ vCodeLoading: false, verifyCodeURL: res.tempFilePath });
    }
    else {
      app.showError('http错误' + res.statusCode.toString());
    }
  },
  function () {
    app.showError('获取验证码错误');
  });
}

/**
 * 获取所有拥有的Cookie
 */
function getCookies(_this) {
  cookie.getCookies(function(status, msg) {
    if(status == false) {
      app.showError(msg);
      if (msg == "本页面需要实名后才可访问_(:з」∠)_" && wx.showTabBarRedDot) {
        wx.showTabBarRedDot({
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
}

/**
 * 将内容创建成二维码并预览
 */
function createQRCode(that, content, callback) {
  //在画布上创建二维码
  drawQrcode({
    width: 200,
    height: 200,
    canvasId: 'myQrcode',
    text: content,
    _this: that,
    callback: function() {
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
            const ctx = wx.createCanvasContext('myQrcode', that);
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
                }, that);
              },
              fail: function () {
                app.showError('生成QR码错误2');
              }
            }, that);
          },
          fail: function () {
            app.showError('生成QR码错误');
          }
        }, that);
        callback();
      }, 300);
    }
  });
}
/**
 * 获取指定Cookie的二维码
 */
function getCookieQR(_this, index) {
  var temp_data = _this.data.CookieList;
  if (temp_data[index].getLoading == true)return;
  temp_data[index].getLoading = true;
  _this.setData({ CookieList: temp_data });
  temp_data[index].getLoading = false;

  cookie.getCookieDetail(temp_data[index].id, function(sta, detail) {
    if (sta == true) {
      createQRCode(_this, JSON.stringify({ cookie: detail}), function () {
        _this.setData({ CookieList: temp_data });
        return;
      });
    }
    else {
      app.showError(detail);
      _this.setData({ CookieList: temp_data });
    }
  });
}

Page({
  data: {
    //饼干管理相关
    CookieList: [],//饼干列表
    vCodeLoading: false,//验证码是否在载入
    vCodeShow: false,//验证码是否已显示
    verifyCodeURL: "",//验证码链接
    needDeleteID: "",//需要删除的饼干index
    FormID: "",//表单提交ID
    EnterButLoading: false,//确认按钮loading
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
          wx.startPullDownRefresh({});
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
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    getCookies(this);
    this.setData({ vCodeShow: false });

  },
  //删除饼干(弹出验证码)
  onDeleteCookie: function (e) {
    getNewVcode(this);
    this.setData({ vCodeShow: true, needDeleteID: e.target.id, FormID: "delete" });
  },
  //获取饼干QR码
  onGetCookie: function (e) {
    getCookieQR(this, e.target.id)
  },
  //关闭验证码输入窗口
  onUClose: function (e) {
    this.setData({ vCodeShow: false });
  },
  /**
   * 确认执行操作，需要验证码请求的操作通过这里执行
   */
  onEnter: function (e) {
    var that = this;
    var u_vcode = e.detail.value.verifycode;
    var u_index = e.detail.value.needDeleteID;
    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    that.setData({ EnterButLoading: true });
    if (e.target.id == 'delete')//删除Cookie
    {
      if (de_run) return;
      de_run = true;
      var temp_data = that.data.CookieList;
      temp_data[u_index].delLoading = true;
      that.setData({ CookieList: temp_data });//对应的删除按钮显示loading
      temp_data[u_index].delLoading = false;

      http.api_request(
        app.globalData.ApiUrls.CookieDeleteURL + temp_data[u_index].id + ".html",
        {
          verify: u_vcode
        },
        function (res) {
          if (res.status == 1) {
            wx.startPullDownRefresh({});//删除请求成功，刷新页面
            that.setData({ vCodeShow: false });
            app.showError('删除完成');
            app.log('cookie delete success');
          }
          else {
            app.log('cookie delete error:' + res.info);
            getNewVcode(that);
            app.showError(res.info);
          }
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
        });
    }
    else if (e.target.id == 'new')//获取新Cookie
    {
      if (nw_run) return;
      nw_run = true;
      http.api_request(
        app.globalData.ApiUrls.CookieGetNewURL,
        {
          verify: u_vcode
        },
        function (res) {
          //app.log(res);
          if (res.status == 1) {
            that.setData({ vCodeShow: false });
            that.setData({ EnterButLoading: false });
            wx.startPullDownRefresh({});//获取新Cookie成功，刷新页面
            app.showError('大成功');
            app.log('get new cookie success');
            wx.startPullDownRefresh({});
          }
          else {
            app.log('get new cookie error:' + res.info);
            app.showError(res.info);
          }
          nw_run = false;
          that.setData({ vCodeShow: false });
          that.setData({ EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          nw_run = false;
          that.setData({ EnterButLoading: false });
        });
    }
  },
  //获取新Cookie
  onGetNewCookie: function () {
    var that = this;
    this.setData({ vCodeShow: true, FormID: "new" });
    getNewVcode(that);
  },
  //刷新验证码
  onTapVerifyCode: function (e) {
    var that = this;
    getNewVcode(that);
  },
  onExit: function(e){
    app.ExitMenu();
  },
  onEat: function(e){
    app.playEat();
  }
})