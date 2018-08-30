//app.js
//const hostURL = "https://nmb.fastmirror.org";
const hostURL = "https://amember.mfweb.top";
App({
  onLaunch: function () {
    this.getSysWindow();
  },
  onShow: function(res){
    this.globalData.SystemInfo.Scene = res.scene;
  },
  globalData: {
    ApiUrls:{
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
    AppList : Array(
      'https://itunes.apple.com/cn/app/ni-ming-bana-dao/id1094980737?mt=8',//iOS芦苇娘
      'https://itunes.apple.com/cn/app/ac-ni-ming-ban/id987004913?mt=8',//iOS橙岛(贼贼贼)
      'https://www.pgyer.com/adao',//安卓芦苇娘
      'https://www.pgyer.com/nimingban',//安卓基佬紫
      'https://www.microsoft.com/zh-cn/store/apps/a%E5%B2%9B%E5%8C%BF%E5%90%8D%E7%89%88/9nblggh1ng7h'//人权机
    ),
    SystemInfo: {
      Windows: {
        height:0,
        width:0
      },
      Scene: 0
    }
  },
  getSysWindow(){
    var res = wx.getSystemInfoSync();//获取屏幕尺寸
    this.globalData.SystemInfo.Windows.width = res.windowWidth;
    this.globalData.SystemInfo.Windows.height = res.windowHeight;
  },
  showSuccess(msg)
  {
    if(msg.length > 7) {
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
  showError(msg)
  {
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
  log(msg)
  {
    console.log(msg);
    if (wx.getLogManager)
    {
      const logger = wx.getLogManager();
      logger.log(msg);
    }
  },
  showDownloadAPP(){
    var that = this;
    wx.showActionSheet({
      itemList: ['iOS-芦苇娘', 'iOS-橙岛', '安卓-芦苇娘', '安卓-基佬紫', '人权机'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          wx.setClipboardData({
            data: that.globalData.AppList[e.tapIndex],
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
  ExitMenu(){
    var that = this;
    wx.showActionSheet({
      itemList: ['APP下载', '关于', '退出登录'],
      itemColor: '#334054',
      success: function (e) {
        if (e.cancel != true) {
          if (e.tapIndex == 0) {//App下载
            that.showDownloadAPP();
          }
          else if (e.tapIndex == 1) {//关于
            wx.navigateTo({
              url: '../about/about',
            });
          }
          else if (e.tapIndex == 2) {//退出登录
            that.logOut();
          }
        }
      },
      fail: function () { }
    });
  },
  logOut() {
    wx.setStorageSync('user_cookie', '');
    wx.setStorageSync('LoginSession', '');
    //const http = require('utils/http.js');
    //http.set_cookie_key('memberUserspapapa', '');
    wx.reLaunch({
      url: '../index/index',
    });
  },
  playEat() {
    wx.playBackgroundAudio({
      dataUrl: this.globalData.ApiUrls.Tnnaii_H_IslandURL,
    });
    this.log('play eat');
  },
  getTerms(callback = null) {
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
  checkVersion: function(){
    let verString = wx.getSystemInfoSync();
    let version = verString.SDKVersion.split('.');
    if (parseInt(version[0]) <= 1 && parseInt(version[1]) < 9) {
      this.showError('你的微信版本太低了，可能会遇到各种问题。\r\n请升级到6.6.0或以上');
    }
  }
})