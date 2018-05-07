//app.js
require('./utils/tracker.min.js')({ token: '04857e5de9b18566c2e39dd7ec40c746', behaviour: 15 })
//const hostURL = "https://nmb.fastmirror.org";
const hostURL = "https://adao.mfweb.top";
App({
  onLaunch: function () {
  },
  globalData: {
    ApiUrls:{
      VerifyCodeURL: hostURL + "/Member/User/Index/verify.html",//请求验证码
      LoginURL: hostURL + "/Member/User/Index/login.html",//登录
      //LoginURL: hostURL_My + "/adao/login.php",//登录
      SignupURL: hostURL + "/Member/User/Index/sendRegister.html",//注册
      ForgotURL: hostURL + "/Member/User/Index/sendForgotPassword.html",//忘记密码
      CheckSessionURL: hostURL + "/Member/User/Index/index.html",//检查是Session是否有效
      CookiesListURL: hostURL + "/Member/User/Cookie/index.html",//饼干列表
      CookieDeleteURL: hostURL + "/Member/User/Cookie/delete/id/",//删除饼干
      CookieGetQRURL: hostURL + "/Member/User/Cookie/export/id/",//获取饼干二维码
      CookieGetNewURL: hostURL + "/Member/User/Cookie/apply.html",//获取新饼干
      CertifiedStatusURL: hostURL + "/Member/User/Authentication/mobile.html",//认证状态
      MobileCertURL: hostURL + "/Member/User/Authentication/mobileReverseAuthCode",//手机认证
      MobileCheckURL: hostURL + "/Member/User/Authentication/isBindMobile",//手机认证校验
      ChangePasswordURL: hostURL + "/Member/User/Index/changePassword.html"//修改密码
    },
    app_list : Array(
      'https://itunes.apple.com/cn/app/ni-ming-bana-dao/id1094980737?mt=8',//iOS芦苇娘
      'https://itunes.apple.com/cn/app/ac-ni-ming-ban/id987004913?mt=8',//iOS橙岛(贼贼贼)
      'https://www.pgyer.com/adao',//安卓芦苇娘
      'https://www.pgyer.com/nimingban',//安卓基佬紫
      'https://www.microsoft.com/zh-cn/store/apps/a%E5%B2%9B%E5%8C%BF%E5%90%8D%E7%89%88/9nblggh1ng7h'//人权机
    )
  },
  showSuccess(msg)
  {
    wx.showToast({
      icon: 'success',
      title: msg
    });
  },
  showError(msg)
  {
    wx.showToast({
      title: msg,
      image: '../../imgs/alert.png'
    });
  }
})