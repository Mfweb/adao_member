const app = getApp();
const http = require('../../utils/http.js');
var pw_run = false;
var gt_run = false;
var de_run = false;
var nw_run = false;

function logOut() {
  http.set_cookie_key('memberUserspapapa', '');
  wx.reLaunch({
    url: '../index/index',
  });
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
function getCookies(that) {
  if (pw_run) return;
  pw_run = true;
  http.api_request(
    app.globalData.ApiUrls.CookiesListURL,
    null,
    function (res) {
      //console.log(res);
      if (res.toString().indexOf('饼干列表') > 0) {
        res = res.replace(/ /g, '');
        res = res.replace(/\r/g, '');
        res = res.replace(/\n/g, '');

        var finds = res.match(/<tbody>[\s\S]*?<\/tbody>/ig);
        if (finds != null) {
          var finds_tr = finds[0].match(/<tr>[\s\S]*?<\/tr>/ig);
          if (finds_tr != null) {
            var c_list = Array();
            for (let i = 0; i < finds_tr.length; i++) {
              var find_td = finds_tr[i].match(/<td>[\s\S]*?<\/td>/ig);
              if (find_td != null) {
                c_list.push({ id: find_td[1].replace(/(<td>)|(<\/td>)/g, ""), value: find_td[2].replace(/(<td><ahref="\#">)|(<\/a><\/td>)/g, ""), delLoading: false, getLoading: false });
              }
            }
            //console.log(finds_tr);
            that.setData({ CookieList: c_list });
          }
          else {
            app.showError('没有找到饼干');
          }
        }
      }
      else {
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
function delCookie(that, index) {
  if (de_run) return;
  de_run = true;
  getNewVcode(that);
  de_run = false;
  that.setData({ vCodeLoading: true, vCodeShow: true, needDeleteID: index, FormID: "delete" });
}
/**
 * 获取指定Cookie的二维码
 */
function getCookieQR(that, index) {
  if (gt_run) return;
  gt_run = true;
  var temp_data = that.data.CookieList;
  temp_data[index].getLoading = true;
  that.setData({ CookieList: temp_data });
  temp_data[index].getLoading = false;
  //console.log(temp_data[index]);

  http.api_request(
    app.globalData.ApiUrls.CookieGetQRURL + temp_data[index].id + ".html",
    null,
    function (res) {
      //console.log(res);
      if (res.indexOf('<div class="tpl-form-maintext"><img src="') > 0) {
        res = res.replace(/ /g, "");
        var temp_match = res.match(/<divclass="tpl-form-maintext"><imgsrc="[\s\S]*?"style=/ig);
        if (temp_match != null) {
          console.log(temp_match[0]);
          var qrCodeURL = temp_match[0].replace(/(<divclass="tpl-form-maintext"><imgsrc=")|("style=)/g, "");
          wx.previewImage({
            urls: [qrCodeURL],
          })
          console.log(qrCodeURL);
        }
        else {
          app.showError('发生了错误');
        }
      }
      else {
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

Page({
  data: {
    //饼干管理相关
    CookieList: [],//饼干列表
    vCodeLoading: false,//验证码是否在载入
    vCodeShow: false,//验证码是否已显示
    verifyCodeURL: "",//验证码链接
    needDeleteID: "",//需要删除的饼干index
    FormID: "",//表单提交ID
    EnterButLoading: false,//确认按钮loading
    ExitTouch: false
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
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    var that = this;
    getCookies(that);
    that.setData({ vCodeShow: false });

  },
  //删除饼干(弹出验证码)
  onDeleteCookie: function (e) {
    var that = this;
    delCookie(that, e.target.id)
  },
  //获取饼干QR码
  onGetCookie: function (e) {
    var that = this;
    getCookieQR(that, e.target.id)
  },
  //验证码载入完成
  onCodeLoad: function (e) {
    this.setData({ vCodeLoading: false });
    console.log('load success');
  },
  //关闭验证码输入窗口
  onUClose: function (e) {
    this.setData({ vCodeShow: false, CertFormShow: false });
  },
  /**
   * 确认执行操作，需要验证码请求的操作通过这里执行
   */
  onEnter: function (e) {
    var that = this;
    var u_vcode = e.detail.value.verifycode;
    var u_index = e.detail.value.needDeleteID;
    if (u_vcode.length != 5) {
      app.showError('验证码错误');
      return;
    }
    that.setData({ EnterButLoading: true });
    if (e.target.id == 'delete')//删除Cookie
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
            that.setData({ vCodeShow: false });
            app.showError('删除完成');
          }
          else {
            app.showError(res.info);
          }
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
        },
        function () {
          app.showError('发生了错误');
          de_run = false;
          that.setData({ CookieList: temp_data, EnterButLoading: false });
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
            that.setData({ EnterButLoading: false });
            wx.startPullDownRefresh({});//获取新Cookie成功，刷新页面
            app.showError('大成功');
          }
          else {
            app.showError(res.info);
          }
          nw_run = false;
          that.setData({ vCodeShow: false });
          that.setData({ EnterButLoading: false });
          wx.startPullDownRefresh({});
        },
        function () {
          app.showError('发生了错误');
          nw_run = false;
          that.setData({ EnterButLoading: false });
        });
    }
  },
  //窗口被关闭则直接退出登录
  onUnload: function () {
    logOut();
  },
  //获取新Cookie
  onGetNewCookie: function () {
    var that = this;
    getNewVcode(that);
    this.setData({ vCodeLoading: true, vCodeShow: true, FormID: "new" });
  },
  //刷新验证码
  onTapVerifyCode: function (e) {
    var that = this;
    getNewVcode(that);
  },
  onExitTS: function(e){
    this.setData({ ExitTouch:true});
  },
  onExitTE: function (e) {
    this.setData({ ExitTouch: false });
    logOut();
  },
  onExitTC: function (e) {
    this.setData({ ExitTouch: false });
  }
})