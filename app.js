//app.js
App({
  onLaunch: function () {
  },
  globalData: {
    ApiUrls:{
      VerifyCodeURL: "https://nmb.fastmirror.org/Member/User/Index/verify.html",//请求验证码
      LoginURL:"https://nmb.fastmirror.org/Member/User/Index/login.html",//登录
      SignupURL:"https://nmb.fastmirror.org/Member/User/Index/sendRegister.html",//注册
      ForgotURL:"https://nmb.fastmirror.org/Member/User/Index/sendForgotPassword.html",//忘记密码
      CheckSessionURL:"https://nmb.fastmirror.org/Member/User/Index/index.html",//检查是Session是否有效
      CookiesListURL:"https://nmb.fastmirror.org/Member/User/Cookie/index.html",//饼干列表
      CookieDeleteURL:"https://nmb.fastmirror.org/Member/User/Cookie/delete/id/",//删除饼干
      CookieGetQRURL: "https://nmb.fastmirror.org/Member/User/Cookie/export/id/",//获取饼干二维码
      CookieGetNewURL:"https://nmb.fastmirror.org/Member/User/Cookie/apply.html",//获取新饼干
      CertifiedStatusURL:"https://nmb.fastmirror.org/Member/User/Authentication/mobile.html",//认证状态
      MobileCertURL:"https://nmb.fastmirror.org/Member/User/Authentication/mobileReverseAuthCode",//手机认证
      MobileCheckURL:"https://nmb.fastmirror.org/Member/User/Authentication/isBindMobile",//手机认证校验
      ChangePasswordURL:"https://nmb.fastmirror.org/Member/User/Index/changePassword.html"//修改密码
    }
  }
})