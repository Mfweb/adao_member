const app = getApp();
const http = require('../../utils/http.js');
var SelectCookieID = 0;


function GetCookies(that)
{
  http.api_request(
    app.globalData.ApiUrls.CookiesListURL,
    null,
    function (res) {
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
                c_list.push({ name: i, value: find_td[2].replace(/(<td><ahref="\#">)|(<\/a><\/td>)/g, ""), delLoading: false, getLoading: false });
              }
            }
            SelectCookieID = 0;
            c_list[0].checked = true;
            that.setData({ cookie_items: c_list, showSelectCookie: true });
          }
          else {
            app.showError('饼干列表为空');
            that.setData({ getLoading: false });
          }
        }
      }
      else {
        if (res.status == 0) {
          app.showError(res.info);
          if (res.info == "本页面需要实名后才可访问_(:з」∠)_" && wx.showTabBarRedDot) {
            wx.showTabBarRedDot({
              index: 1
            });
          }
          that.setData({ getLoading: false });
        }
        else
        {
          app.showError('获取饼干错误');
          that.setData({ getLoading: false });
        }
      }
    },
    function () {

    }
  );
}

//获取并上传运动数据
function UpWeRunData(that)
{
  wx.getWeRunData({
    success: function (e) {
      http.api_request(
        app.globalData.ApiUrls.WeUploadRunURL,
        {
          session: wx.getStorageSync('LoginSession'),
          encryptedData: e.encryptedData,
          iv: e.iv,
          cookie: SelectCookieID
        },
        function (e) {
          if (e.status == 0)
            app.showSuccess(e.msg.toString());
          else
            app.showError(e.msg.toString());
          that.setData({ getLoading: false });
        },
        function () {
          app.showError("上传失败");
          that.setData({ getLoading: false });
        }
      );
    },
    fail: function () {
      app.showError("获取数据失败");
      that.setData({ getLoading: false });
    }
  })
}

//获取授权
function GetAuth(that)
{
  wx.authorize({
    scope: 'scope.werun',
    success: function (e) {
      if (e.errMsg == "authorize:ok") {
        //获取授权成功，获取并上传步数数据
        GetCookies(that);
      }
      else {
        app.showError("获取权限失败");
        that.setData({ getAuthFail: true, getLoading: false });
      }
    },
    fail: function (e) {
      app.showError("获取权限失败");
      that.setData({ getAuthFail: true, getLoading: false });
    }
  });
}


function WeLogin(that)
{
  wx.login({
    //登录成功
    success: function (e) {
      console.log(e);
      if (e.code) {
        wx.request({
          url: app.globalData.ApiUrls.WeLoginURL,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
          },
          data: {
            code: e.code,
            time: new Date().getTime()
          },
          success: function (e) {
            if (e.data.status == 0) {
              wx.setStorageSync('LoginSession', e.data.session);
              //获取授权
              GetAuth(that);
            }
            else {
              app.showError("登录失败4");
              that.setData({ getLoading: false });
            }
          },
          fail: function () {
            app.showError("登录失败3");
            that.setData({ getLoading: false });
          }
        });
      }
      else {
        app.showError("登录失败2");
        app.log(e);
        that.setData({ getLoading: false });
      }
    },
    //登录失败
    fail: function (e) {
      app.showError("登录失败1");
      app.log(e);
      that.setData({ getLoading: false });
    }
  });
}


function GetStep(that)
{
  wx.request({
    url: app.globalData.ApiUrls.WeDownloadRunURL,
    success:function(res){
      if (res.data.status == 0)
        that.setData({StepList: res.data.steps});
      else
        app.showError(res.data.msg);
      wx.stopPullDownRefresh();
    },
    fail:function(){
      app.showError("网络错误");
      wx.stopPullDownRefresh();
    }
  });
}


Page({
  data: {
    StepList: [],
    getAuthFail: false,
    getLoading: false,
    showSelectCookie: false,
    cookie_items: [
      { name: '0', value: 'fasdcfe', checked: 'true' },
      { name: '1', value: 'gwqwetv' },
      { name: '2', value: 'fsdfegt' },
      { name: '3', value: 'fsdfegt' },
      { name: '4', value: 'fsdfegt' },
    ]
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
    wx.startPullDownRefresh({});
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh () {
    var that = this;
    GetStep(that);
  },
  onExit: function (e) {
    app.ExitMenu();
  },
  onEat: function (e) {
    app.playEat();
  },
  onUpload: function (e) {
    if (this.data.getLoading) return;
    this.setData({ getLoading: true });
    var that = this;

    //检查登录是否有效
    var now_session = wx.getStorageSync('LoginSession');
    if (now_session == null || now_session.length != 128) {
      app.log('session fail');
      WeLogin(that);
      return;
    }

    wx.checkSession({
      //登录有效，直接获取授权
      success: function () {
        //WeLogin(that);
        GetAuth(that);
      },
      //登录失败，重新登录
      fail: function () {
        WeLogin(that);
      }
    });
 
  },
  onGetAuth: function (e) {
    if (e.detail.authSetting['scope.werun']) {
      this.setData({ getAuthFail: false });
      app.showSuccess('授权成功');
    }
    else {
      app.showError('授权失败');
    }
  },
  radioChange: function(e) {
    SelectCookieID = e.detail.value;
  },
  onCancel: function(){
    this.setData({ showSelectCookie: false, getLoading: false });
  },
  onSelectedCookie: function(){
    this.setData({ showSelectCookie: false });
    var that = this;
    UpWeRunData(that);
  }
})