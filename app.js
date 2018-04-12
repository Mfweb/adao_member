//app.js
App({
  onLaunch: function () {
  },
  globalData: {
    ApiUrls:{
      //请求验证码需要带Cookie，小程序不好实现，转一下
      VerifyCodeURL: "https://mfweb.top/adao/member/vcode.php",
      LoginURL:"http://adnmb1.com/Member/User/Index/login.html",
      SignupURL:"http://adnmb1.com/Member/User/Index/sendRegister.html",
      ForgotURL:"http://adnmb1.com/Member/User/Index/sendForgotPassword.html"
    }
  }
})