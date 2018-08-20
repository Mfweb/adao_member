// pages/list/list.js
var tid_list = [];
const app = getApp();
var pw_run = false;
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var launchOpt = null;


function getData(that, id) {
  if (id >= tid_list.length) {
    pw_run = false;
    wx.stopPullDownRefresh();
    return;
  }
  var temp_data = that.data.tlist;

  var is_bt = false;
  if (tid_list[id].toString().substr(0, 1) == 'b') {
    is_bt = true;
    tid_list[id] = tid_list[id].substr(1);
  }

  http.api_request(is_bt ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL,
    { id: tid_list[id], page: 1 },
    function (res) {
      if (typeof res == 'string') {
        var data = {
          'id': tid_list[id],
          'content': WxParse.wxParse('item', 'html', '<p>' + res + '</p>', that, null).nodes,
          'img': '',
          'thumburl': '',
          'img_height': 0,
          'img_width': 0,
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
          'img_width': 0,
          'is_bt': is_bt
        }
        if (res.img != "") {
          data.img = res.img + res.ext;
          data.thumburl = res.ext == ".gif" ? (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (is_bt ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
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


function GetLists(that) {
  http.api_request(app.globalData.ApiUrls.GetSharesURL,
    { tids: launchOpt.tid },
    function (res) {
      if (res.status != 'ok') {
        app.showError(res.status);
        wx.hideNavigationBarLoading();
        wx.reLaunch({
          url: '../index/index',
        });
      }
      else {
        tid_list = res.tids;
        wx.hideNavigationBarLoading();
        getData(that, 0);
      }
    },
    function () {
      app.showError('发生了错误');
      wx.hideNavigationBarLoading();
      wx.reLaunch({
        url: '../index/index',
      });
    }
  );
}

Page({
  data: {
    tlist: []
  },
  onLoad: function (options) {
    launchOpt = options;
  },
  onReady: function () {
    if (launchOpt == null) {
      wx.reLaunch({
        url: '../index/index',
      });
    }
    var messageMark_this = 1;

    pw_run = false;
    var messagemark_save = wx.getStorageSync('MessageMark');
    if (messagemark_save == undefined || messagemark_save == null || messagemark_save == '')
      messagemark_save = 0;
    if (messagemark_save < messageMark_this) {
      wx.showModal({
        title: '提示',
        content: '本页已支持长按复制串号。',
        confirmText: '不再显示',
        success: function (e) {
          if (e.confirm == true) {
            wx.setStorageSync('MessageMark', messageMark_this);
          }
        }
      });
    }
    if (launchOpt.tid != undefined) {
      if (wx.startPullDownRefresh){
        wx.startPullDownRefresh({});
      }
      else{
        pw_run = true;
        wx.showNavigationBarLoading();
        var _this = this;
        _this.setData({ tlist: [] });
        GetLists(_this);
      }
    }
    else {
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
    GetLists(that);
  },
  onUnload: function (e) {
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

    var tempData = this.data.tlist;

    tempData[e.target.id].img_height = temp_height;
    tempData[e.target.id].img_width = temp_width;
    tempData[e.target.id].img_load_success = true;

    this.setData({ tlist: tempData });
  },
  bind_view_tap: function (e) {
    wx.navigateTo({ url: '../thread/thread?id=' + this.data.tlist[e['currentTarget'].id].id + "&is_bt=" + this.data.tlist[e['currentTarget'].id].is_bt });
  },
  bind_pic_tap: function (e) {
    let is_bt = this.data.tlist[e['currentTarget'].id].is_bt;
    wx.previewImage({
      current: (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + this.data.tlist[e['currentTarget'].id].img,
      urls: [(is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + this.data.tlist[e['currentTarget'].id].img]
    });
  },
  onLongtapItem: function (e) {
    var is_bt = this.data.tlist[e['currentTarget'].id].is_bt;
    var tid = this.data.tlist[e['currentTarget'].id].id;
    wx.showActionSheet({
      itemList: ['复制串号', '复制链接'],
      success: function (ex) {
        if (ex.cancel != true) {
          if (ex.tapIndex == 0) {
            wx.setClipboardData({
              data: tid,
              success: function () {
                app.showSuccess('复制完成');
              },
              fail: function () {
                app.showError('复制失败');
              }
            });
          }
          else {
            wx.setClipboardData({
              data: (is_bt ? 'https://tnmb.org/t/' : 'http://adnmb.com/t/') + tid,
              success: function () {
                app.showSuccess('复制完成');
              },
              fail: function () {
                app.showError('复制失败');
              }
            });
          }
        }
      }
    });
  }
})