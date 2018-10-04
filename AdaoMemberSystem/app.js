//app.js
//const hostURL = "https://nmb.fastmirror.org";
const hostURL = "https://amember.mfweb.top";
App({
  onLaunch: function () {
    this.getSysWindow();
    this.getCDN();
  },
  onShow: function (res) {
    this.globalData.SystemInfo.Scene = res.scene;
  },
  globalData: {
    ApiUrls: {
      VerifyCodeURL: hostURL + "/nmb/Member/User/Index/verify.html",//请求验证码
      LoginURL: hostURL + "/nmb/Member/User/Index/login.html",//登录
      SignupURL: hostURL + "/nmb/Member/User/Index/sendRegister.html",//注册
      ForgotURL: hostURL + "/nmb/Member/User/Index/sendForgotPassword.html",//忘记密码
      CheckSessionURL: hostURL + "/nmb/Member/User/Index/index.html",//检查是Session是否有效
      CookiesListURL: hostURL + "/nmb/Member/User/Cookie/index.html",//饼干列表
      CookieDeleteURL: hostURL + "/nmb/Member/User/Cookie/delete/id/",//删除饼干
      CookieGetQRURL: hostURL + "/nmb/Member/User/Cookie/export/id/",//获取饼干二维码
      CookieGetDetailURL: hostURL + "/nmb/Member/User/Cookie/switchTo/id/",//获取饼干内容
      CookieGetNewURL: hostURL + "/nmb/Member/User/Cookie/apply.html",//获取新饼干
      CertifiedStatusURL: hostURL + "/nmb/Member/User/Authentication/mobile.html",//认证状态
      MobileCertURL: hostURL + "/nmb/Member/User/Authentication/mobileReverseAuthCode",//手机认证
      MobileCheckURL: hostURL + "/nmb/Member/User/Authentication/isBindMobile",//手机认证校验
      ChangePasswordURL: hostURL + "/nmb/Member/User/Index/changePassword.html",//修改密码

      GetNoticeURL: hostURL + "/adao/member/notice.php",//获取公告
      GetAuthPhoneURL: hostURL + "/adao/member/getphone.php",//获取三酱验证手机号
      GetRandomPicURL: hostURL + "/adao/getpicture.php",//获取随机图
      Tnnaii_H_IslandURL: "http://cdn.aixifan.com/h/mp3/tnnaii-h-island-c.mp3",//奈奈-食我大雕
      //获取分享串
      GetSharesURL: hostURL + "/adao/getshare.php",
      //获取服务条款
      GetTermsURL: hostURL + "/adao/member/getterms.php",
      GetCDNURL: "https://nmb.fastmirror.org/Api/getCdnPath?appid=wechatapp",//获取CDN地址
      //主岛配置
      ThreadURL: hostURL + "/nmb/Api/thread?appid=wechatapp",//获得串内容和回复
      GetThreadURL: hostURL + "/nmb/Api/ref?appid=wechatapp",//获得串内容
      ThumbImgURL: "https://nmbimg.fastmirror.org/thumb/",//缩略图
      FullImgURL: "https://nmbimg.fastmirror.org/image/",//原图
      //备胎岛配置
      BTThreadURL: hostURL + "/btnmb/Api/thread?appid=wechatapp",//获得串内容和回复
      BTGetThreadURL: hostURL + "/btnmb/Api/ref?appid=wechatapp",//获得串内容
      BTThumbImgURL: "https://tnmbstatic.fastmirror.org/Public/Upload/thumb/",//缩略图
      BTFullImgURL: "https://tnmbstatic.fastmirror.org/Public/Upload/image/",//原图
      //小程序功能
      WeLoginURL: hostURL + "/adao/member/login.php",//登录
      WeUploadRunURL: hostURL + "/adao/member/uprun.php",//上传微信运动数据
      WeDownloadRunURL: hostURL + "/adao/member/dwrun.php",//获取微信运动排行
    },
    AppList: [
      {
        name: 'iOS芦苇娘',
        url: 'https://itunes.apple.com/cn/app/ni-ming-bana-dao/id1094980737?mt=8',
        icon: 'ilw.png'
      },
      {
        name: 'iOS橙岛',
        url: 'https://itunes.apple.com/cn/app/ac-ni-ming-ban/id987004913?mt=8',
        icon: 'izzz.png'
      },
      {
        name: '安卓芦苇娘',
        url: 'https://www.pgyer.com/adao',
        icon: 'alw.png'
      },
      {
        name: '安卓基佬紫',
        url: 'https://www.pgyer.com/nimingban',
        icon: 'azd.png'
      },
      {
        name: '人权芦苇娘',
        url: 'https://www.microsoft.com/zh-cn/store/apps/a%E5%B2%9B%E5%8C%BF%E5%90%8D%E7%89%88/9nblggh1ng7h',
        icon: 'rqlw.png'
      },
    ],
    SystemInfo: {
      Windows: {
        height: 0,
        width: 0,
        statusBarHeight: 0
      },
      Scene: 0
    }
  },
  getCDN: function () {
    wx.request({
      url: this.globalData.ApiUrls.GetCDNURL,
      success: function (res) {
        if (typeof res.data == 'object') {
          let max = 0;
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].rate > max) {
              this.globalData.ApiUrls.ThumbImgURL = res.data[i].url + "thumb/"
              this.globalData.ApiUrls.FullImgURL = res.data[i].url + "image/"
              max = res.data[i].rate;
            }
          }
        }
      }.bind(this)
    });
  },
  getSysWindow: function () {
    var res = wx.getSystemInfoSync();//获取屏幕尺寸
    this.globalData.SystemInfo.Windows.width = res.windowWidth;
    this.globalData.SystemInfo.Windows.height = res.windowHeight;
    this.globalData.SystemInfo.Windows.statusBarHeight = res.statusBarHeight + 4;
    if (res.model.indexOf('iPhone') < 0) {
      this.globalData.SystemInfo.Windows.statusBarHeight += 4;
    }
  },
  showSuccess: function (msg) {
    if (msg.length > 7) {
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false
      })
    }
    else {
      wx.showToast({
        icon: 'success',
        title: msg
      });
    }
  },
  showError: function (msg) {
    let xmsg = '无';
    if (typeof msg != 'string') {
      if (typeof msg != 'undefined') {
        try {
          xmsg = JSON.stringify(msg);
        }
        catch (err) {
          xmsg = typeof msg;
        }
      }
      msg = '错误';
    }

    wx.reportAnalytics('on_user_error', {
      strerror: msg,
      undefineerror: xmsg,
    });

    if (msg.length > 7) {
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false
      })
    }
    else {
      wx.showToast({
        title: msg,
        image: '../../imgs/alert.png'
      });
    }
  },
  log: function (msg) {
    console.log(msg);
    if (wx.getLogManager) {
      const logger = wx.getLogManager();
      logger.log(msg);
    }
  },
  showDownloadAPP: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['iOS-芦苇娘', 'iOS-橙岛', '安卓-芦苇娘', '安卓-基佬紫', '人权机'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          wx.setClipboardData({
            data: that.globalData.AppList[e.tapIndex].url,
            success: function () {
              that.showSuccess('链接已复制');
            },
            fail: function () {
              that.showError('复制失败');
            }
          });
        }
      }
    });
  },
  logOut: function () {
    wx.setStorageSync('user_cookie', '');
    wx.setStorageSync('LoginSession', '');
    //const http = require('utils/http.js');
    //http.set_cookie_key('memberUserspapapa', '');
    wx.reLaunch({
      url: '../index/index',
    });
  },
  playEat: function () {
    wx.playBackgroundAudio({
      dataUrl: this.globalData.ApiUrls.Tnnaii_H_IslandURL,
    });
    this.log('play eat');
  },
  getTerms: function (callback = null) {
    var terms_saved;
    try {
      terms_saved = JSON.parse(wx.getStorageSync('Terms'));
    }
    catch (e) {
      terms_saved = null;
    }

    if (terms_saved == null || Date.parse(new Date()) - terms_saved.get_time > (1 * 60 * 60 * 1000)) {
      wx.request({
        url: this.globalData.ApiUrls.GetTermsURL,
        success: function (res) {
          if (res.data.hasOwnProperty('status') && res.data.status == 'ok') {
            res.data.get_time = Date.parse(new Date());
            wx.setStorageSync('Terms', JSON.stringify(res.data));
          }
          if (callback != null) {
            callback(res.data);
          }
        },
        fail: function () {
          if (callback != null) {
            if (terms_saved != null) {
              callback(terms_saved);
            }
            else {
              callback(false);
            }
          }
        }
      });
    }
    else {
      if (callback != null) {
        callback(terms_saved);
      }
    }
  },
  checkVersion: function () {
    let verString = wx.getSystemInfoSync();
    let version = verString.SDKVersion.split('.');
    if (parseInt(version[0]) <= 1 && parseInt(version[1]) < 9) {
      this.showError('你的微信版本太低了，可能会遇到各种问题。\r\n请升级到6.6.0或以上');
    }
  },
  getImage: function (success) {
    wx.request({
      url: this.globalData.ApiUrls.GetRandomPicURL,
      success: function (res) {
        if (res.statusCode == 200) {
          success(res.data);
        }
      }
    });
  }
})