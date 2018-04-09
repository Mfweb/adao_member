//index.js
//获取应用实例
const app = getApp()
var vCode = '';

function getNewVcode(that)
{
  vCode = Math.random().toString();
  that.setData({ vCodeLoading: true, verifyCodeURL: app.globalData.ApiUrls.VerifyCodeURL + vCode});
  console.log(vCode);
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
    vCodeLoading: true
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    getNewVcode(that);
    switchPate(that,0);
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
  }
})
