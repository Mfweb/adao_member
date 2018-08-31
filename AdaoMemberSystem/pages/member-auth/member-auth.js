const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var timer = null;
var authData = null;

Page({
  data: {
    vCodeLoading: false,//验证码是否在载入
    vCodeShow: false,//验证码是否已显示
    verifyCodeURL: "",//验证码链接
    EnterButLoading: false,//确认按钮loading
    CertStatus: "未知",//实名认证状态
    PhoneStatus: "未知",//手机实名认证状态
    CanCert: false,//是否可以手机实名认证（是否显示按钮）
    CertFormShow: false,//实名认证表单是否显示
    Cindex: 0,
    Carray: [
      '中国 - +86', '美国 - +1', '加拿大 - +1', '香港 - +852', '澳门 - +853', '台湾 - +886', '马来西亚 - +60', '印度尼西亚 - +62',
      '新加坡 - +65', '泰国 - +66', '日本 - +81', '韩国 - +82', '越南 - +84', '哈萨克斯坦 - +7', '塔吉克斯坦 - +7', '土耳其 - +90', '印度 - +91',
      '巴基斯坦 - +92', '阿富汗 - +93', '斯里兰卡 - +94', '缅甸 - +95', '伊朗 - +98', '文莱 - +673', '朝鲜 - +850', '柬埔寨 - +855', '老挝 - +865',
      '孟加拉国 - +880', '马尔代夫 - +960', '叙利亚 - +963', '伊拉克 - +964', '巴勒斯坦 - +970', '阿联酋 - +971', '以色列 - +972', '巴林 - +973',
      '不丹 - +975', '蒙古 - +976', '尼珀尔 - +977', '英国 - +44', '德国 - +49', '意大利 - +39', '法国 - +33', '俄罗斯 - +7', '希腊 - +30', '荷兰 - +31',
      '比利时 - +32', '西班牙 - +34', '匈牙利 - +36', '罗马尼亚 - +40', '瑞士 - +41', '奥地利 - +43', '丹麦 - +45', '瑞典 - +46', '挪威 - +47',
      '波兰 - +48', '圣马力诺 - +223', '匈牙利 - +336', '南斯拉夫 - +338', '直布罗陀 - +350', '葡萄牙 - +351', '卢森堡 - +352', '爱尔兰 - +353',
      '冰岛 - +354', '马耳他 - +356', '塞浦路斯 - +357', '芬兰 - +358', '保加利亚 - +359', '立陶宛 - +370', '乌克兰 - +380', '南斯拉夫 - +381',
      '捷克 - +420', '秘鲁 - +51', '墨西哥 - +52', '古巴 - +53', '阿根廷 - +54', '巴西 - +55', '智利 - +56', '哥伦比亚 - +57', '委内瑞拉 - +58',
      '澳大利亚 - +61', '新西兰 - +64', '关岛 - +671', '斐济 - +679', '圣诞岛 - +619164', '夏威夷 - +1808', '阿拉斯加 - +1907', '格陵兰岛 - +299',
      '牙买加 - +1876', '南极洲 - +64672'],
    CertMsg: null,//手机实名认证显示的消息
    ShowCertMsg: false,//是否显示实名认证消息
    CopyLoading: false//复制手机号loading
  },
  onLoad: function (options) {

  },
  onReady: function () {
    wx.showNavigationBarLoading();
    wx.startPullDownRefresh({});

    if (wx.hideTabBarRedDot) {
      wx.hideTabBarRedDot({
        index: 1
      });
    }
  },
  onHide: function () {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
    wx.showNavigationBarLoading();
    this.getCertifiedStatus();
    this.setData({ CertFormShow: false, ShowCertMsg: false });
  },
  //验证码输入窗口关闭
  onUClose: function (e) {
    this.setData({ vCodeShow: false, CertFormShow: false });
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
    var u_country = _this.data.Cindex + 1;
    var u_phone = e.detail.value.phonenumber;
    if (!(/^\d{5,}$/.test(u_phone))) {
      app.showError('手机号错误');
      return false;
    }

    http.api_request(
      app.globalData.ApiUrls.MobileCertURL,
      {
        verify: u_vcode,//验证码
        mobile_country_id: u_country,//国家序号
        mobile: u_phone//手机号
      },
      function (res) {
        try {
          if (res.status == 0) {
            app.showError(res.info);
          }
          else {
            authData = res;
            res = res.replace(/\r/g, "");
            res = res.replace(/\n/g, "");

            var body_match = res.match(/<form[\s\S]*?>[\s\S]*?<\/form>/ig);
            if (body_match != null) {
              body_match[0] = body_match[0].replace(/tpl-form-maintext">[\s\D]*<b>/ig, "Sdata\"><b>");
              _this.setData({ CertMsg: WxParse.wxParse('item', 'html', body_match[0], _this, null).nodes, ShowCertMsg: true, CertFormShow: false });
              _this.waitCert();
            }
            else {
              app.showError('发生了错误');
            }
          }
          _this.setData({ EnterButLoading: false });
        }
        catch (err) {
          app.log(err.message);
          app.showError(err.message);
          _this.setData({ EnterButLoading: false });
        }
      },
      function () {
        app.showError('发生了错误');
        _this.setData({ EnterButLoading: false });
      });
  },
  onTapVerifyCode: function (e) {
    this.getNewVcode();
  },
  onPhoneCert: function () {
    this.getNewVcode();
    this.setData({ CertFormShow: true });
  },
  bindPickerChange: function (e) {
    this.setData({ Cindex: e.detail.value });
  },
  onCopy: function (e) {
    var _this = this;
    if (this.data.CopyLoading == true) return;
    this.setData({ CopyLoading: true });
    http.api_request(
      app.globalData.ApiUrls.GetAuthPhoneURL,
      {
        rawdata: authData,
      },
      function (res) {
        if (res == null || res == "error") {
          app.showError('复制失败');
        }
        else {
          wx.setClipboardData({
            data: res,
            success: function () {
              app.showSuccess('复制完成');
            },
            fail: function () {
              app.showError('复制失败');
            }
          });
        }

        _this.setData({ CopyLoading: false });
      },
      function () {
        app.showError('获取失败');
        _this.setData({ CopyLoading: false });
      }
    );
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
    var _this = this;
    this.setData({ vCodeLoading: true, verifyCodeURL: "" });
    http.get_verifycode(function (sta, img, msg) {
      if (sta == false) {
        app.showError(msg);
      }
      _this.setData({ vCodeLoading: false, verifyCodeURL: img });
    });
  },
  /**
   * 获取当前认证状态
   */
  getCertifiedStatus: function () {
    var _this = this;
    http.api_request(
      app.globalData.ApiUrls.CertifiedStatusURL,
      null,
      function (res) {
        if (typeof res != 'string') {
          wx.stopPullDownRefresh();
          wx.hideNavigationBarLoading();
          return;
        }
        res = res.replace(/ /g, '');
        res = res.replace(/\r/g, '');
        res = res.replace(/\n/g, '');
        var cert_status = '';
        var phone_status = '';
        if (res.indexOf('实名状态') > 0) {
          cert_status = res.split('实名状态')[1].match(/<b>[\s\S]*?<\/b>/i);
          if (cert_status != null) {
            cert_status = cert_status[0].replace(/(<b>)|(<\/b>)/ig, '');
            _this.setData({ CertStatus: cert_status });
          }
          else {
            app.showError('实名状态错误');
          }
          if (res.indexOf('已绑定手机') > 0)//手机认证已经成功的
          {
            phone_status = res.split('已绑定手机')[1].replace(/(><)/g, "").match(/>[\s\S]*?</i);
            if (phone_status != null) {
              phone_status = phone_status[0].replace(/(>)|(<)/ig, "");
              if (phone_status != null) {
                _this.setData({ PhoneStatus: phone_status });
              }
            }
            _this.setData({ CanCert: false });
          }
          else if (res.indexOf('绑定手机') > 0)//未进行手机实名认证
          {
            _this.setData({ PhoneStatus: "未认证", CanCert: true });
          }
        }
        else {
          app.showError('发生了错误');
        }
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
      },
      function () {
        app.showError('发生了错误');
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
      }
    );
  },
  /**
   * 等待认证成功
   */
  waitCert: function () {
    timer = setInterval(function () {
      http.api_request(app.globalData.ApiUrls.MobileCheckURL,
        null,
        function (res) {
          console.log(res);
          if (res == true) {
            clearInterval(timer);
            timer = null;
            app.log('phone auth success');
            wx.startPullDownRefresh({});
          }
        },
        function () {

        }
      );
    }, 5000);
  }
})