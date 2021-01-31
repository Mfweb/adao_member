// pages/list/list.js
const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');

var idList = [];
var launchOpt = null;

Page({
  data: {
    tlist: [],
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
    listLoading: false
  },
  onLoad: function (options) {
    app.checkVersion();
    launchOpt = options;
  },
  onReady: function () {
    if (launchOpt == null) {
      wx.reLaunch({
        url: '../index/index',
      });
      return;
    }
    var messageMark_this = 2;

    var messagemark_save = wx.getStorageSync('MessageMark');
    if (messagemark_save == undefined || messagemark_save == null || messagemark_save == '') {
      messagemark_save = 0;
    }

    if (messagemark_save < messageMark_this) {
      wx.showModal({
        title: '提示',
        content: '长按可复制链接；右上角[...]支持分享。',
        confirmText: '不再显示',
        success: function (e) {
          if (e.confirm == true) {
            wx.setStorageSync('MessageMark', messageMark_this);
          }
        }
      });
    }
    if (launchOpt.tid != undefined) {
      if (wx.startPullDownRefresh) {
        wx.startPullDownRefresh({});
      }
      else {
        this.setData({ tlist: [] });
        this.getPostList();
      }
    }
    else {
      wx.reLaunch({
        url: '../index/index',
      });
    }
  },
  onPullDownRefresh: function () {
    this.setData({ tlist: [] });
    this.getPostList();
  },
  onUnload: function (e) {
    wx.reLaunch({
      url: '../index/index',
    });
  },
  bind_pic_load: function (e) {
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

    if (tempData[e.target.id] == undefined || tempData[e.target.id] == null) return;
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
  /**
   * 长按复制
   */
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
  },
  /**
   * 获取串列表
   */
  getPostList: function () {
    this.setData({ listLoading: true });
    http.request(app.globalData.ApiUrls.GetSharesURL, { tids: launchOpt.tid }).then(res => {
      if (res.data.status != 'ok') {
        app.showError(res.data.status);
        this.setData({ listLoading: false });
        wx.stopPullDownRefresh();
        wx.reLaunch({
          url: '../index/index',
        });
      }
      else {
        idList = res.data.tids;
        this.getPostDetail(0);
      }
    }).catch(error => {
      app.showError(error == false ? '发生了错误' : ('http' + error.statusCode));
      this.setData({ listLoading: false });
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 获取串内容
   */
  getPostDetail: function (id) {
    if (id >= idList.length) {
      wx.stopPullDownRefresh();
      this.setData({ listLoading: false });
      return;
    }
    var tempData = this.data.tlist;

    var is_bt = false;
    if (idList[id].toString().substr(0, 1) == 'b') {
      is_bt = true;
      idList[id] = idList[id].substr(1);
    }
    http.request(is_bt ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL, 
      { id: idList[id], page: 1 }).then(res => {
        if (typeof res.data == 'string') {
          let data = {
            'id': idList[id],
            'content': WxParse.wxParse('item', 'html', '<p>' + res.data + '</p>', this, null).nodes,
            'img': '',
            'thumburl': '',
            'img_height': 0,
            'img_width': 0,
          }
          tempData.push(data);
        }
        else {
          res = res.data;
          let data = {
            'id': res.id,
            'now': res.now,
            'userid': res.userid,
            'name': res.name,
            'email': res.email,
            'title': res.title,
            'content': WxParse.wxParse('item', 'html', res.content, this, null).nodes,
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
          tempData.push(data);
        }
        this.setData({ tlist: tempData });
        this.getPostDetail(++id);
      }).catch(error => {
        app.showError(httpCode == null ? '串获取错误' : ('topic:' + httpCode));
        var data = {
          'id': idList[id],
          'content': WxParse.wxParse('item', 'html', '<p>获取失败</p>', this, null).nodes,
          'img': '',
          'thumburl': ''
        }
        tempData.push(data);
        this.setData({ tlist: tempData });
        this.getPostDetail(++id);
      });
  },
  onShareAppMessage: function(res)
  {
    console.log(res);
    return {
      title: 'A岛匿名版',
      desc: '今日精选串',
      path: `pages/index/index?tid=${launchOpt.tid}`
    };
  }
})