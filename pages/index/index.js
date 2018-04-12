//index.js
//获取应用实例
const app = getApp();
const http = require('../../utils/http.js');;

/**
 * @brief 获得新的验证码
 */
function getNewVcode(that)
{
  that.setData({ vCodeLoading: true, verifyCodeURL: app.globalData.ApiUrls.VerifyCodeURL + "?code=" + http.get_cookie_key('PHPSESSID') + "&c=" + Math.random().toString()});
}


function switchPate(that,new_page)
{
  var now_page = that.data.Mode;
  var now_anime = that.data.animations;

  var animeOut = wx.createAnimation({
    duration:200,
    timingFunction:'ease'
  });
  animeOut.opacity(0).step();



  now_anime[now_page] = animeOut.export();
  that.setData({ vCodeLoading:true, animations: now_anime});

  setTimeout((function callback() {
    that.setData({ Mode: new_page});
    var now_anime = that.data.animations;
    var animeIn = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease'
    });
    animeIn.opacity(1).step();
    now_anime[new_page] = animeIn.export();
    var tt = "登陆";
    if(new_page == 0)tt="登陆"
    else if(new_page == 1)tt = "注册"
    else if(new_page == 2)tt = "找回密码"
    that.setData({ animations: now_anime, TitleText:tt});
  }).bind(that), 200);
}

Page({
  data: {
    verifyCodeURL:"",
    Mode:0,
    animations:[],
    TitleText:"登陆",
    vCodeLoading: true,
    BLoading:false
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    });
  },
  onLoad: function () {
    var that = this;
    switchPate(that,0);
    this.setData({ BLoading:true});
    http.api_request(
      'http://adnmb1.com/Member/User/Index/index.html',
      null,
      function(res){
        console.log(res);
        if (res.info == '并没有权限访问_(:з」∠)_')//登陆已经失效
        {
          getNewVcode(that);//请求验证码
          console.log('未登陆');
        }
        else
        {
          console.log("登陆有效");
        }
        that.setData({ BLoading: false});
      },
      function(){
        wx.showToast({
          title: '连接服务器失败',
          image: '../../imgs/alert.png'
        });
      }
    );
  },
  onTapVerifyCode: function(e) {
    var that = this;
    getNewVcode(that);
  },
  onTapIlogin:function(){
    var that = this;
    switchPate(that, 0);
  },
  onTapIsignup: function () {
    var that = this;
    switchPate(that,1);
  },
  onTapIforgot: function () {
    var that = this;
    switchPate(that, 2);
  },
  onCodeLoad: function(e){
    this.setData({ vCodeLoading:false});
    console.log('load success');
  },
  onLoginSubmit:function(e)//登陆
  {
    var that = this;
    var u_email = e.detail.value.email;
    var u_pass  = e.detail.value.passwd;
    var u_vcode = e.detail.value.verifycode;
    if(u_email.indexOf('@') < 1)
    {
      wx.showToast({
        title: '邮箱格式错误',
        image: '../../imgs/alert.png'
      });
      return;
    }
    if (u_pass.length < 5)
    {
      wx.showToast({
        title: '密码长度太短',
        image: '../../imgs/alert.png'
      });
      return;
    }
    if (u_vcode.length != 5) {
      wx.showToast({
        title: '验证码错误',
        image: '../../imgs/alert.png'
      });
      return;
    }
    http.api_request(app.globalData.ApiUrls.LoginURL,
    {
      email:u_email,
      password:u_pass,
      verify:u_vcode
    },
    function(res){
      console.log(res);
      if (res.status == 1)
      {
        wx.showToast({
          icon:'success',
          title:res.info
        });  
      }
      else
      {
        wx.showToast({
          title: res.info,
          image: '../../imgs/alert.png'
        });
        getNewVcode(that);
      }
    },
    function(){
      wx.showToast({
        title: '连接服务器失败',
        image: '../../imgs/alert.png'
      });
    });
    console.log(e);
  }
})
