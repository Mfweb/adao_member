const app = getApp();
const http = require('../../utils/http.js');
var pw_run = false;
var gt_run = false;
var de_run = false;
var nw_run = false;

/**
 * @brief 获得新的验证码
 */
function getNewVcode(that) {
  that.setData({ vCodeLoading: true, verifyCodeURL: app.globalData.ApiUrls.VerifyCodeURL + "?code=" + http.get_cookie_key('PHPSESSID') + "&c=" + Math.random().toString() });
}


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
            wx.showToast({
              title: '没有找到饼干',
              image: '../../imgs/alert.png'
            });
          }
        }
      }
      else
      {
        wx.showToast({
          title: '获取饼干错误',
          image: '../../imgs/alert.png'
        });
      }
      wx.stopPullDownRefresh();
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

function delCookie(that, index)
{
  if (de_run) return;
  de_run = true;
  var temp_data = that.data.CookieList;
  temp_data[index].getLoading = true;
  that.setData({ CookieList: temp_data });
  temp_data[index].getLoading = false;
  //console.log(temp_data[index]);
  getNewVcode(that);
  de_run = false;
  that.setData({ CookieList: temp_data, vCodeLoading: true, vCodeShow: true, needDeleteID: index, FormID:"delete"});
}

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
          wx.showToast({
            title: '发生了错误',
            image: '../../imgs/alert.png'
          });          
        }
      }
      else
      {
        wx.showToast({
          title: '发生了错误',
          image: '../../imgs/alert.png'
        });       
      }
      gt_run = false;
      that.setData({ CookieList: temp_data });
    },
    function () {
      wx.showToast({
        title: '发生了错误',
        image: '../../imgs/alert.png'
      });
      gt_run = false;
      that.setData({ CookieList: temp_data });
    });
}





Page({
  data: {
    CookieList:[],
    vCodeLoading:false,
    vCodeShow:false,
    verifyCodeURL:"",
    needDeleteID:"",
    FormID:""
  },
  onLoad: function (options) {
    var that = this;
    wx.showNavigationBarLoading();
    http.api_request(
      app.globalData.ApiUrls.CheckSessionURL,
      null,
      function (res) {
        wx.hideNavigationBarLoading();
        if (res.status == 0)//登陆已经失效
        {
          wx.navigateTo({
            url: '../index/index'
          });
        }
        else if (res.toString().indexOf('饼干管理') > 0) {
          console.log("登陆有效");
          wx.startPullDownRefresh({});
        }
        else {
          wx.showToast({
            title: '未知错误',
            image: '../../imgs/alert.png'
          });
          wx.navigateTo({
            url: '../index/index'
          });
        }
      },
      function () {
        wx.hideNavigationBarLoading();
        wx.navigateTo({
          url: '../index/index'
        });
      }
    );
  },
  onPullDownRefresh: function ()
  {
    var that = this;
    getCookies(that);
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
    this.setData({ vCodeShow:false});
  },
  onEnter:function(e)
  {
    var that = this;
    var u_vcode = e.detail.value.verifycode;
    var u_index = e.detail.value.needDeleteID;
    if (u_vcode.length != 5) {
      wx.showToast({
        title: '验证码错误',
        image: '../../imgs/alert.png'
      });
      return;
    }
    if(e.target.id == 'delete')//删除Cookie
    {
      if (de_run) return;
      de_run = true;
      var temp_data = that.data.CookieList;
      temp_data[u_index].getLoading = true;
      that.setData({ CookieList: temp_data });
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
            wx.startPullDownRefresh({});
            that.setData({ vCodeShow: false });
          }
          else {
            wx.showToast({
              title: res.info,
              image: '../../imgs/alert.png'
            });
          }
          de_run = false;
          that.setData({ CookieList: temp_data });
        },
        function () {
          wx.showToast({
            title: '发生了错误',
            image: '../../imgs/alert.png'
          });
          de_run = false;
          that.setData({ CookieList: temp_data });
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
          if (res.status == 1) {
            wx.startPullDownRefresh({});
            that.setData({ vCodeShow: false });
          }
          else {
            wx.showToast({
              title: res.info,
              image: '../../imgs/alert.png'
            });
          }
          nw_run = false;
          that.setData({ CookieList: temp_data });
        },
        function () {
          wx.showToast({
            title: '发生了错误',
            image: '../../imgs/alert.png'
          });
          nw_run = false;
          that.setData({ CookieList: temp_data });
        });
    }
  },
  onGetNewCookie:function()
  {
    var that = this;
    getNewVcode(that);
    this.setData({vCodeLoading: true, vCodeShow: true, FormID: "new" });
  }
})