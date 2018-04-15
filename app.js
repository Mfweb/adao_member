//app.js
App({
  onLaunch: function () {
  },
  globalData: {
    ApiUrls:{
      //请求验证码需要带Cookie，小程序不好实现，转一下
      VerifyCodeURL: "https://mfweb.top/adao/member/vcode.php",//请求验证码
      LoginURL:"http://adnmb1.com/Member/User/Index/login.html",//登录
      SignupURL:"http://adnmb1.com/Member/User/Index/sendRegister.html",//注册
      ForgotURL:"http://adnmb1.com/Member/User/Index/sendForgotPassword.html",//忘记密码
      CheckSessionURL:"http://adnmb1.com/Member/User/Index/index.html",//检查是Session是否有效
      CookiesListURL:"http://adnmb1.com/Member/User/Cookie/index.html",//饼干列表
      CookieDeleteURL:"http://adnmb1.com/Member/User/Cookie/delete/id/",//删除饼干
      CookieGetQRURL: "http://adnmb1.com/Member/User/Cookie/export/id/",//获取饼干二维码
      CookieGetNewURL:"http://adnmb1.com/Member/User/Cookie/apply.html",//获取新饼干
      CertifiedStatusURL:"http://adnmb1.com/Member/User/Authentication/mobile.html",//认证状态
      MobileCertURL:"http://adnmb1.com/Member/User/Authentication/mobileReverseAuthCode",//手机认证
      MobileCheckURL:"http://adnmb1.com/Member/User/Authentication/isBindMobile"//手机认证校验
    }
  }
})