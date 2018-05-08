// pages/list/list.js
var tid_list = [];
const app = getApp();
var pw_run = false;
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');

function getData(that, id) {
  if (id >= tid_list.length)
  {
    pw_run = false;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
    return;
  }
  var temp_data = that.data.tlist;
  http.api_request(app.globalData.ApiUrls.ThreadURL,
    { id: tid_list[id], page: 1 },
    function (res) {
      if (res == '该主题不存在') {
        var data = {
          'id': tid_list[id],
          'content': WxParse.wxParse('item', 'html', '<p>主题不存在</p>', that, null).nodes,
          'img': '',
          'thumburl': ''
        }
        temp_data.push(data);
      }
      else {
        var data = {
          'id': res.id,
          'now': res.now,
          'userid': res.userid,
          'name': res.name,
          'email': res.email,
          'title': res.title,
          'content': WxParse.wxParse('item', 'html', res.content, that, null).nodes,
          'admin': res.admin,
          'sage': res.sage,
          'replyCount': res.replyCount,
          'img_height': 0,
          'img_width': 0
        }
        if (res.img != "") {
          data.img = res.img + res.ext;
          data.thumburl = res.ext == ".gif" ? app.globalData.ApiUrls.FullImgURL : app.globalData.ApiUrls.ThumbImgURL;
          data.img_load_success = false;
        }
        else {
          data.img = "";
          data.thumburl = "";
        }
        temp_data.push(data);
      }
      that.setData({ tlist: temp_data });
      id++;
      getData(that, id);
    },
    function () {
      app.showError('获取错误');
      var data = {
        'id': tid_list[id],
        'content': WxParse.wxParse('item', 'html', '<p>获取失败</p>', that, null).nodes,
        'img': '',
        'thumburl': ''
      }
      that.setData({ tlist: temp_data });
      temp_data.push(data);
      id++;
      getData(that, id);
    });
}


Page({
  data: {
    tlist: []
  },
  onLoad: function (options) {
    pw_run = false;
    if (options.tid != undefined) {
      http.api_request(app.globalData.ApiUrls.GetSharesURL,
        { tids: options.tid},
        function(res){
          if (res.status != 'ok'){
            app.showError(res.status);
            wx.reLaunch({
              url: '../index/index',
            });
          }
          else{
            tid_list = res.tids;
            wx.startPullDownRefresh({});
          }
        },
        function(){
          app.showError('发生了错误');
          wx.reLaunch({
            url: '../index/index',
          });
        }
      );
    }
    else{
      wx.reLaunch({
        url: '../index/index',
      });
    }
   
  },
  onPullDownRefresh: function () {
    if (pw_run) return;
    pw_run = true;
    wx.showNavigationBarLoading();
    var that = this;
    that.setData({ tlist: [] });
    getData(that, 0);
  },
  onUnload: function(e){
    wx.reLaunch({
      url: '../index/index',
    });
  },
  bind_pic_load: function (e)//图片载入完成
  {
    if (app.globalData.SystemInfo.Windows.height == 0 || app.globalData.SystemInfo.Windows.width == 0) {
      app.getSysWindow();
    }

    var temp_width = 0;
    var temp_height = 0;
    var temp_ratio = 0.0;
    temp_width = app.globalData.SystemInfo.Windows.width / 2;//要缩放到的图片宽度
    temp_ratio = temp_width / e.detail.width;//计算缩放比例
    temp_height = e.detail.height * temp_ratio;//计算缩放后的高度
    this.data.tlist[e.target.id].img_height = parseInt(temp_height);
    this.data.tlist[e.target.id].img_width = parseInt(temp_width);
    this.data.tlist[e.target.id].img_load_success = true;
    this.setData({ tlist: this.data.tlist });
  },
  bind_view_tap: function (e) {
    wx.navigateTo({ url: '../thread/thread?id=' + e['currentTarget'].id });
  },
  bind_pic_tap: function (e) {
    wx.previewImage({
      current: app.globalData.ApiUrls.FullImgURL + this.data.tlist[e['currentTarget'].id].img,
      urls: [app.globalData.ApiUrls.FullImgURL + this.data.tlist[e['currentTarget'].id].img]
    });
  }
})