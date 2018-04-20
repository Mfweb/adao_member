const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var pw_run = false;
var gt_run = false;
var de_run = false;
var nw_run = false;
var np_run = false;
var timer = null;


function logOut()
{
  http.set_cookie_key('memberUserspapapa','');
  wx.reLaunch({
    url: '../index/index',
  });
}
/**
 * 切换当前页面
 */
function switchPate(that, new_page) {
  if (pw_run || gt_run || de_run || nw_run)return;
  var now_page = that.data.Mode;
  var now_anime = that.data.animations;

  var animeOut = wx.createAnimation({
    duration: 200,
    timingFunction: 'ease'
  });
  animeOut.opacity(0).step();



  now_anime[now_page] = animeOut.export();
  that.setData({ vCodeLoading: true, animations: now_anime });

  setTimeout((function callback() {
    that.setData({ Mode: new_page });
    var now_anime = that.data.animations;
    var animeIn = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease'
    });
    animeIn.opacity(1).step();
    now_anime[new_page] = animeIn.export();
    that.setData({ animations: now_anime });
    wx.startPullDownRefresh({});
  }).bind(that), 200);
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
 * 获取所有拥有的Cookie
 */
function getCookies(that)
{
  if (pw_run)return;
  pw_run = true;
  http.api_request(
    app.globalData.ApiUrls.CookiesListURL,
    null,
    function (res) {
      //console.log(res);
      if (res.toString().indexOf('饼干列表') > 0)
      {
        res = res.replace(/ /g, '');
        res = res.replace(/\r/g, '');
        res = res.replace(/\n/g, '');

        var finds = res.match(/<tbody>[\s\S]*?<\/tbody>/ig);
        if (finds != null)
        {
          var finds_tr = finds[0].match(/<tr>[\s\S]*?<\/tr>/ig);
          if(finds_tr != null)
          {
            var c_list = Array();
            for (let i = 0; i < finds_tr.length; i++)
            {
              var find_td = finds_tr[i].match(/<td>[\s\S]*?<\/td>/ig);
              if(find_td != null)
              {
                c_list.push({ id: find_td[1].replace(/(<td>)|(<\/td>)/g, ""), value: find_td[2].replace(/(<td><ahref="\#">)|(<\/a><\/td>)/g, ""), delLoading:false, getLoading:false});
              }
            }
            //console.log(finds_tr);
            that.setData({ CookieList: c_list});
          }
          else
          {
            app.showError('没有找到饼干');
          }
        }
      }
      else
      {
        app.showError('获取饼干错误');
      }
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      pw_run = false;
    },
    function () {
      wx.stopPullDownRefresh();
      pw_run = false;
      wx.hideNavigationBarLoading();
      wx.navigateTo({
        url: '../index/index'
      });
    }
  );
}

/**
 * 删除指定Cookie，这里只是弹出了验证码请求界面，具体实现在Enter中
 */
function delCookie(that, index)
{
  if (de_run) return;
  de_run = true;
  getNewVcode(that);
  de_run = false;
  that.setData({vCodeLoading: true, vCodeShow: true, needDeleteID: index, FormID:"delete"});
}
/**
 * 获取指定Cookie的二维码
 */
function getCookieQR(that, index)
{
  if (gt_run)return;
  gt_run = true;
  var temp_data = that.data.CookieList;
  temp_data[index].getLoading = true;
  that.setData({ CookieList: temp_data});
  temp_data[index].getLoading = false;
  //console.log(temp_data[index]);
  
  http.api_request(
    app.globalData.ApiUrls.CookieGetQRURL + temp_data[index].id + ".html",
    null,
    function (res) {
      //console.log(res);
      if (res.indexOf('<div class="tpl-form-maintext"><img src="') > 0)
      {
        res = res.replace(/ /g,"");
        var temp_match = res.match(/<divclass="tpl-form-maintext"><imgsrc="[\s\S]*?"style=/ig);
        if(temp_match != null)
        {
          console.log(temp_match[0]);
          var qrCodeURL = temp_match[0].replace(/(<divclass="tpl-form-maintext"><imgsrc=")|("style=)/g,"");
          wx.previewImage({
            urls: [qrCodeURL],
          })
          console.log(qrCodeURL);
        }
        else
        {
          app.showError('发生了错误');        
        }
      }
      else
      {
        app.showError('发生了错误');  
      }
      gt_run = false;
      that.setData({ CookieList: temp_data });
    },
    function () {
      app.showError('发生了错误');
      gt_run = false;
      that.setData({ CookieList: temp_data });
    });
}

/**
 * 实名认证状态
 */
function getCertifiedStatus(that)
{
  if (pw_run)return;
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
      if(res.indexOf('实名状态') > 0)
      {
        cert_status = res.split('实名状态')[1].match(/<b>[\s\S]*?<\/b>/i);
        if (cert_status != null)
        {
          cert_status = cert_status[0].replace(/(<b>)|(<\/b>)/ig, '');
          that.setData({ CertStatus: cert_status});
        }
        else
        {
          app.showError('实名状态错误');    
        }
        if (res.indexOf('已绑定手机') > 0)//手机认证已经成功的
        {
          phone_status = res.split('已绑定手机')[1].replace(/(><)/g,"").match(/>[\s\S]*?</i);
          if(phone_status != null)
          {
            phone_status = phone_status[0].replace(/(>)|(<)/ig,"");
            if (phone_status != null)
            {
              console.log(phone_status);
              that.setData({ PhoneStatus: phone_status });
            }
          }
          that.setData({ CanCert:false});
        }
        else if (res.indexOf('绑定手机') > 0)//未进行手机实名认证
        {
          that.setData({ PhoneStatus: "未认证", CanCert:true});
        }
      }
      else
      {
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
function waitCert()
{
  timer = setInterval(function () {
    http.api_request(app.globalData.ApiUrls.MobileCheckURL,
    null,
    function(res){
      if (res == true)
      {
        clearInterval(timer);
        timer = null;
        wx.startPullDownRefresh({});
      }
      console.log(res);
    },
    function(){

    }
    );
  }, 5000);
}


Page({
  data: {
    //公用
    Mode:0,//当前模式
    animations: [],//换页动画    
    //饼干管理相关
    CookieList:[],//饼干列表
    vCodeLoading:false,//验证码是否在载入
    vCodeShow:false,//验证码是否已显示
    verifyCodeURL:"",//验证码链接
    needDeleteID:"",//需要删除的饼干index
    FormID:"",//表单提交ID
    EnterButLoading:false,//确认按钮loading
    //实名认证相关
    CertStatus: "未知",//实名认证状态
    PhoneStatus:"未知",//手机实名认证状态
    CanCert:false,//是否可以手机实名认证（是否显示按钮）
    CertFormShow:false,//实名认证表单是否显示
    Cindex:0,
    Carray: [
      '中国 - +86', '美国 - +1', '加拿大 - +1', '香港 - +852', '澳门 - +853', '台湾 - +886', '马来西亚 - +60','印度尼西亚 - +62',
      '新加坡 - +65', '泰国 - +66', '日本 - +81', '韩国 - +82', '越南 - +84', '哈萨克斯坦 - +7', '塔吉克斯坦 - +7', '土耳其 - +90','印度 - +91',
      '巴基斯坦 - +92', '阿富汗 - +93', '斯里兰卡 - +94', '缅甸 - +95', '伊朗 - +98', '文莱 - +673', '朝鲜 - +850', '柬埔寨 - +855','老挝 - +865',
      '孟加拉国 - +880', '马尔代夫 - +960', '叙利亚 - +963', '伊拉克 - +964', '巴勒斯坦 - +970', '阿联酋 - +971', '以色列 - +972','巴林 - +973',
      '不丹 - +975', '蒙古 - +976', '尼珀尔 - +977', '英国 - +44', '德国 - +49', '意大利 - +39', '法国 - +33', '俄罗斯 - +7', '希腊 - +30','荷兰 - +31',
      '比利时 - +32', '西班牙 - +34', '匈牙利 - +36', '罗马尼亚 - +40', '瑞士 - +41', '奥地利 - +43', '丹麦 - +45', '瑞典 - +46','挪威 - +47',
      '波兰 - +48', '圣马力诺 - +223', '匈牙利 - +336', '南斯拉夫 - +338', '直布罗陀 - +350', '葡萄牙 - +351', '卢森堡 - +352','爱尔兰 - +353',
      '冰岛 - +354', '马耳他 - +356', '塞浦路斯 - +357', '芬兰 - +358', '保加利亚 - +359', '立陶宛 - +370', '乌克兰 - +380','南斯拉夫 - +381',
      '捷克 - +420', '秘鲁 - +51', '墨西哥 - +52', '古巴 - +53', '阿根廷 - +54', '巴西 - +55', '智利 - +56', '哥伦比亚 - +57','委内瑞拉 - +58',
      '澳大利亚 - +61', '新西兰 - +64', '关岛 - +671', '斐济 - +679', '圣诞岛 - +619164', '夏威夷 - +1808', '阿拉斯加 - +1907','格陵兰岛 - +299',
      '牙买加 - +1876','南极洲 - +64672'],
    CertMsg: null,//手机实名认证显示的消息
    ShowCertMsg:false,//是否显示实名认证消息
    //修改密码相关
    CPLoading:false
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
          console.log("登陆有效");
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
    switchPate(that,0);
  },
  onPullDownRefresh: function ()
  {
    if(this.data.Mode == 0)//饼干管理 刷新饼干
    {
      wx.showNavigationBarLoading();
      var that = this;
      getCookies(that);
      that.setData({ vCodeShow: false });
    }
    else if(this.data.Mode == 1)//实名认证，获取实名认证状态
    {
      if(timer!=null)
      {
        clearInterval(timer);
        timer = null;
      }
      wx.showNavigationBarLoading();
      var that = this;
      getCertifiedStatus(that);
      that.setData({ CertFormShow: false, ShowCertMsg:false});
    }
    else if(this.data.Mode == 2)
    {
      wx.stopPullDownRefresh();
    }
  },
  onDeleteCookie: function(e)
  {
    var that = this;
    delCookie(that, e.target.id)
  },
  onGetCookie: function(e)
  {
    var that = this;
    getCookieQR(that, e.target.id)
  },
  onCodeLoad: function (e) {
    this.setData({ vCodeLoading: false });
    console.log('load success');
  },
  onUClose:function(e)
  {
    this.setData({ vCodeShow: false, CertFormShow:false});
  },
  /**
   * 确认执行操作，需要验证码请求的操作通过这里执行
   */
  onEnter:function(e)
  {
    var that = this;
    var u_vcode = e.detail.value.verifycode;
    var u_index = e.detail.value.needDeleteID;
    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    that.setData({ EnterButLoading:true});
    if(e.target.id == 'delete')//删除Cookie
    {
      if (de_run) return;
      de_run = true;
      var temp_data = that.data.CookieList;
      temp_data[u_index].getLoading = true;
      that.setData({ CookieList: temp_data });//对应的删除按钮显示loading
      temp_data[u_index].getLoading = false;
      getNewVcode(that);
      de_run = false;
      that.setData({ CookieList: temp_data, vCodeLoading: true, vCodeShow: true, needDeleteID: u_index });

      http.api_request(
        app.globalData.ApiUrls.CookieDeleteURL + temp_data[u_index].id + ".html",
        {
          verify: u_vcode
        },
        function (res) {
          if (res.status == 1) {
            wx.startPullDownRefresh({});//删除请求成功，刷新页面
            that.setData({ vCodeShow: false});
            app.showError('删除完成');
          }
          else {
            app.showError(res.info);
          }
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false});
        },
        function () {
          app.showError('发生了错误');
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false});
        });
    }
    else if (e.target.id == 'new')//获取新Cookie
    {
      if (nw_run) return;
      nw_run = true;
      http.api_request(
        app.globalData.ApiUrls.CookieGetNewURL,
        {
          verify: u_vcode
        },
        function (res) {
          console.log(res);
          if (res.status == 1) {
            that.setData({ vCodeShow: false });
            that.setData({ CookieList: temp_data, EnterButLoading: false });
            wx.startPullDownRefresh({});//获取新Cookie成功，刷新页面
            app.showError('大成功');
          }
          else {
            app.showError(res.info);
          }
          nw_run = false;
          that.setData({ vCodeShow: false });
          that.setData({ CookieList: temp_data, EnterButLoading: false});
          wx.startPullDownRefresh({});
        },
        function () {
          app.showError('发生了错误');
          nw_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false});
        });
    }
    else if (e.target.id == 'Cert')//手机认证
    {
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
          //console.log(res);
          if(res.status == 0)
          {
            app.showError(res.info);
          }
          else
          {
            res = res.replace(/\r/g, "");
            res = res.replace(/\n/g, "");
            
            var body_match = res.match(/<form[\s\S]*?>[\s\S]*?<\/form>/ig);
            if(body_match != null)
            {
              that.setData({ CertMsg: WxParse.wxParse('item', 'html', body_match[0], that, null).nodes, ShowCertMsg: true, CertFormShow:false});
              waitCert();
            }
            else
            {
              app.showError('发生了错误'); 
            }
          }
          nw_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          nw_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
        });
    }
  },
  onChangePasswdSubmit(e)
  {
    var that = this;
    var old_passwd = e.detail.value.opass;
    var new_passwd = e.detail.value.npass;
    var new_passwd2 = e.detail.value.npass2;
    if (old_passwd < 5 || new_passwd < 5 || new_passwd2 < 5)
    {
      app.showError('密码至少5位');
      return;
    }
    if (new_passwd != new_passwd2)
    {
      app.showError('两次输入不一致');
      return;
    }
    if (np_run) return;
    np_run = true;
    that.setData({ CPLoading:true});
    http.api_request(
      app.globalData.ApiUrls.ChangePasswordURL,
      {
        oldpwd: old_passwd,
        pwd: new_passwd,
        repwd: new_passwd2
      },
      function(res){
        if (res.status == 1)
          logOut();
        else
          app.showError(res.info);
        np_run = false;
        that.setData({ CPLoading: false });
      },
      function()
      {
        app.showError('发生了错误');
        np_run = false;
        that.setData({ CPLoading: false });
      }
    );
    console.log(e);
  },
  onUnload:function(){
    logOut();
  },
  onGetNewCookie:function()
  {
    var that = this;
    getNewVcode(that);
    this.setData({vCodeLoading: true, vCodeShow: true, FormID: "new" });
  },
  onTapVerifyCode: function (e) {
    var that = this;
    getNewVcode(that);
  },
  onMCookieTap:function(){
    var that = this;
    switchPate(that, 0)
  },
  onMCertifiedTap:function(){
    var that = this;
    switchPate(that, 1)
  },
  onChangePasswdTap:function(){
    var that = this;
    switchPate(that, 2)
  },
  onPhoneCert:function(){
    var that = this;
    getNewVcode(that);
    this.setData({ CertFormShow:true});
  },
  bindPickerChange:function(e){
    this.setData({ Cindex:e.detail.value});
  }
})