const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var pw_run = false;
var nw_run = false;
var timer = null;


function logOut() {
  if(timer != null){
    clearInterval(timer);
    timer = null;
  }
  http.set_cookie_key('memberUserspapapa', '');
  wx.reLaunch({
    url: '../index/index',
  });
}


/**
 * @brief 获得新的验证码
 */
function getNewVcode(that) {
  that.setData({ vCodeLoading: true });
  http.get_verifycode(function (res) {
    if (res.statusCode == 200) {
      that.setData({ verifyCodeURL: res.tempFilePath });
    }
    else {
      app.showError('http错误' + res.statusCode.toString());
    }
  },
    function () {
      app.showError('获取验证码错误' + res.statusCode.toString());
    });
}

/**
 * 实名认证状态
 */
function getCertifiedStatus(that) {
  if (pw_run) return;
  pw_run = true;
  http.api_request(
    app.globalData.ApiUrls.CertifiedStatusURL,
    null,
    function (res) {
      res = res.replace(/ /g, '');
      res = res.replace(/\r/g, '');
      res = res.replace(/\n/g, '');
      var cert_status = '';
      var phone_status = '';
      if (res.indexOf('实名状态') > 0) {
        cert_status = res.split('实名状态')[1].match(/<b>[\s\S]*?<\/b>/i);
        if (cert_status != null) {
          cert_status = cert_status[0].replace(/(<b>)|(<\/b>)/ig, '');
          that.setData({ CertStatus: cert_status });
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
              //console.log(phone_status);
              that.setData({ PhoneStatus: phone_status });
            }
          }
          that.setData({ CanCert: false });
        }
        else if (res.indexOf('绑定手机') > 0)//未进行手机实名认证
        {
          that.setData({ PhoneStatus: "未认证", CanCert: true });
        }
      }
      else {
        app.showError('发生了错误');
      }
      pw_run = false;
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    },
    function () {
      app.showError('发生了错误');
      pw_run = false;
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    });
}

/**
 * 等到完成手机认证
 */
function waitCert() {
  timer = setInterval(function () {
    http.api_request(app.globalData.ApiUrls.MobileCheckURL,
      null,
      function (res) {
        if (res == true) {
          clearInterval(timer);
          timer = null;
          console.log('phone auth success');
          wx.startPullDownRefresh({});
        }
      },
      function () {

      }
    );
  }, 5000);
}


Page({
  data: {
    vCodeLoading: false,//验证码是否在载入
    vCodeShow: false,//验证码是否已显示
    verifyCodeURL: "",//验证码链接
    EnterButLoading: false,//确认按钮loading
    //实名认证相关
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
  //下拉刷新
  onPullDownRefresh: function () {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
    wx.showNavigationBarLoading();
    var that = this;
    getCertifiedStatus(that);
    that.setData({ CertFormShow: false, ShowCertMsg: false });
  },
  //验证码载入完成
  onCodeLoad: function (e) {
    this.setData({ vCodeLoading: false });
  },
  //验证码输入窗口关闭
  onUClose: function (e) {
    this.setData({ vCodeShow: false, CertFormShow: false });
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
    var u_country = that.data.Cindex + 1;
    var u_phone = e.detail.value.phonenumber;
    if (!(/^\d{5,}$/.test(u_phone))) {
      app.showError('手机号错误');
      return false;
    }

    if (nw_run) return;
    nw_run = true;
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
            res = res.replace(/\r/g, "");
            res = res.replace(/\n/g, "");

            var body_match = res.match(/<form[\s\S]*?>[\s\S]*?<\/form>/ig);
            if (body_match != null) {
              body_match[0] = body_match[0].replace(/tpl-form-maintext">[\s\D]*<b>/ig, "Sdata\"><b>");
              that.setData({ CertMsg: WxParse.wxParse('item', 'html', body_match[0], that, null).nodes, ShowCertMsg: true, CertFormShow: false });
              waitCert();
            }
            else {
              app.showError('发生了错误');
            }
          }
          nw_run = false;
          that.setData({ EnterButLoading: false });
        }
        catch (err) {
          console.log(err.message);
          app.showError(err.message);
          nw_run = false;
          that.setData({ EnterButLoading: false });
        }
      },
      function () {
        app.showError('发生了错误');
        nw_run = false;
        that.setData({ EnterButLoading: false });
      });
  },
  onTapVerifyCode: function (e) {
    var that = this;
    getNewVcode(that);
  },
  onPhoneCert: function () {
    var that = this;
    getNewVcode(that);
    this.setData({ CertFormShow: true });
  },
  bindPickerChange: function (e) {
    this.setData({ Cindex: e.detail.value });
  },
  onCopy: function (e) {
    wx.setClipboardData({
      data: '+8617722525567',
      success: function () {
        app.showSuccess('复制完成');
      },
      fail: function () {
        app.showError('复制失败');
      }
    });
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
            app.showError('并没有关于');
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
    console.log('play eat');
  }
})