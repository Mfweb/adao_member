//app.js
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
    }
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