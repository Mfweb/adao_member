var WxParse = require('../../wxParse/wxParse.js');
const http = require('../../utils/http.js');
var page = 1;//当前页数
var forum_id = 0;//串ID
var last_length = 0;
var app = getApp();
var pw_run = false;//防止下拉刷新清空列表的时候触发上拉加载
var post_run = false;//防止重复拉取
var lont_tap_lock = false;
var image_list = [];//图片列表
var po_id = "";
var mainListQuery = null;
var is_bt = false;

//先当做主串拉取 如果失败就当做回复拉取
function GetQuoteOne(kindex, that, mode = 0) {
  if (mode == 0) {
    http.api_request(
      is_bt ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL,
      { id: that.data.q_list[kindex].id, page: 1 },
      function (res) {//success
        if (res == "该主题不存在")//不是主串 拉取串内容
          GetQuoteOne(kindex, that, 1);
        else {
          var q_list = that.data.q_list;
          res.content = WxParse.wxParse('item', 'html', res.content, that, null).nodes;
          res.sid = res.id;
          if (res.img != "") {
            res.img = res.img + res.ext;
            res.thumburl = res.ext == ".gif" ? (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (is_bt ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
          }
          var html_h = "<font class='";

          if (res.admin == 1)
            html_h += "xuankuhongming";
          if (res.userid == po_id)
            html_h += " po";
          html_h += "'>"
          html_h += res.userid + "</font>";
          res.userid = WxParse.wxParse('item', 'html', html_h, that, null).nodes;

          q_list[kindex] = res;
          that.setData({ q_list: q_list });
        }
      },
      function () {//fail
        app.log("get quoteon error1");
      });
  }
  else {
    http.api_request(
      (is_bt ? app.globalData.ApiUrls.BTGetThreadURL : app.globalData.ApiUrls.GetThreadURL) + "&id=" + that.data.q_list[kindex].id,
      {},
      function (res) {//success
        var q_list = that.data.q_list;
        if (res == "thread不存在") {
          var temp = { id: "ID不存在" };
          q_list[kindex] = temp;
        }
        else {
          res.content = WxParse.wxParse('item', 'html', res.content, that, null).nodes;
          if (res.img != "") {
            res.img = res.img + res.ext;
            res.thumburl = res.ext == ".gif" ? (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (is_bt ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
          }
          var html_h = "<font class='";

          if (res.admin == 1)
            html_h += "xuankuhongming";
          if (res.userid == po_id)
            html_h += " po";
          html_h += "'>"
          html_h += res.userid + "</font>";
          res.userid = WxParse.wxParse('item', 'html', html_h, that, null).nodes;

          q_list[kindex] = res;
        }
        that.setData({ q_list: q_list });
      },
      function () {//fail
        app.log("get quoteon error2");
      });
  }
}
//获取引用串 
function GetQuoteBody(all_kid, that, mode = 1) {
  var temp_q_list = [];
  for (let i = 0; i < all_kid.length; i++) {
    var temp = { id: all_kid[i] };
    temp_q_list.push(temp);
    // GetQuoteOne(i,that);
  }
  that.setData({ q_list: temp_q_list });
  for (let i = 0; i < all_kid.length; i++) {
    GetQuoteOne(i, that);//拉取内容
  }
}
//引用串高亮
function GetQuote(kid) {
  var te = /((&gt;){2}|(>){2})(No\.){0,3}\d{1,11}/g;//正则表达式匹配出所有引用串号，支持>>No.123123和>>123123 两种引用格式
  //var te_addr = /h.nimingban.com\/t\/\d{1,11}/g;
  var te2 = /\d{1,11}/g;
  var out_data = { html: null, all_kid: [] };
  var all_find = kid.match(te);
  if (all_find != null && all_find != false && all_find.length > 0) {
    out_data.html = kid.replace(te, '<view class="bequote">$&</view><view class="be_br"></view>');
    for (let i = 0; i < all_find.length; i++) {
      let temp_find = all_find[i].match(te2);
      if (temp_find != null && temp_find != false && temp_find.length > 0) {
        out_data.all_kid.push(temp_find[0]);
      }
    }
  }
  else {
    out_data.html = kid;
  }
  return out_data;
}
//获取回复
function GetList(that) {
  if (post_run) return;
  post_run = true;
  if (page != 1)
    that.setData({ bot_text: that.data.bot_text + ",Loading..." });
  else
    that.setData({ bot_text: "Loading..." });
  http.api_request(
    is_bt ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL,
    { id: forum_id, page: page },
    function (res) {//success
      if (res == "该主题不存在") {
        that.setData({ bot_text: "该主题不存在" });
        return;
      }
      var list = that.data.list;
      if (list.length == 0)//第一页 添加正文内容
      {
        var temp_fid = GetQuote(res.content);

        var header = {
          'id': res.id,
          'now': res.now,
          'userid': res.userid,
          'name': res.name,
          'email': res.email,
          'title': res.title,
          'content': WxParse.wxParse('item', 'html', temp_fid.html, that, null).nodes,
          'all_kid': temp_fid.all_kid,
          'admin': res.admin,
          'replyCount': res.replyCount,
          'sage': res.sage,
          'admin': res.admin,
          'img_height': 0,
          'img_width': 0
        };
        po_id = res.userid;

        var html_h = "<font class='";

        if (res.admin == 1)
          html_h += "xuankuhongming";
        if (res.userid == po_id)
          html_h += " po";
        html_h += "'>"
        html_h += res.userid + "</font>";
        header.userid = WxParse.wxParse('item', 'html', html_h, that, null).nodes;

        if (res.img != "") {
          header.img = res.img + res.ext;
          header.thumburl = res.ext == ".gif" ? (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (is_bt ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
          header.img_load_success = false;
          image_list.push((is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + res.img + res.ext);
        }
        else {
          header.img = "";
          header.thumburl = "";
        }
        list.push(header);
        wx.setNavigationBarTitle({//设置标题
          title: list[0].title,
          success: function (res) { }
        });
      }

      var len = 0;
      if (last_length > 0)
        len = res.replys.length - last_length;
      else
        len = res.replys.length;
      if (len > 0)//本次拉取的数量大于0就push
      {
        list[0].replyCount = res.replyCount;
        for (let i = last_length; i < res.replys.length; i++) {
          if (res.replys[i].img != "") {
            res.replys[i].img = res.replys[i].img + res.replys[i].ext;
            res.replys[i].thumburl = res.replys[i].ext == ".gif" ? (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (is_bt ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
            image_list.push((is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + res.replys[i].img);
          }
          let temp_html = GetQuote(res.replys[i].content);
          res.replys[i].content = temp_html.html;//正则高亮所有引用串号
          res.replys[i].all_kid = temp_html.all_kid;
          res.replys[i].content = WxParse.wxParse('item', 'html', res.replys[i].content, that, null).nodes;
          res.replys[i].img_height = 0;
          res.replys[i].img_width = 0;
          res.replys[i].img_load_success = false;

          var html_h = "<font class='";

          if (res.replys[i].admin == 1)
            html_h += "xuankuhongming";
          if (res.replys[i].userid == po_id)
            html_h += " po";
          html_h += "'>"
          html_h += res.replys[i].userid + "</font>";
          res.replys[i].userid = WxParse.wxParse('item', 'html', html_h, that, null).nodes;

          list.push(res.replys[i]);
        }
        that.setData({ list: list });

        if (res.replys.length >= 19)//本页已经完
        {
          page++;
          last_length = 0;
        }
        else//本页还没满，下次要再拉取
        {
          if (res.replys[0].id == 9999999)
            last_length = res.replys.length - 1;
          else
            last_length = res.replys.length + 1;
        }
      }
      else//本次没有拉取到
      {
        if (page == 1) {
          that.setData({ list: list });
        }
      }
      that.setData({ bot_text: (list.length - 1) + "/" + list[0].replyCount });
      pw_run = false;
      post_run = false;
      wx.stopPullDownRefresh();
    },
    function () {//fail
      that.setData({ bot_text: "error" });
      app.showError('加载失败');
      that.setData({ bot_text: "加载失败" });
      pw_run = false;
      post_run = false;
      wx.stopPullDownRefresh();
    });
}

Page({
  data:
  {
    list: [],
    scrollTop: 0,
    scrollHeight: 0,
    bot_text: "",
    modalFlag: true,//显示跳转页面
    default_page: 1,//跳转页面默认值
    ShowMenu: true,
    open: false,
    q_list: [],
  },

  onLoad: function (e) {
    console.log(e);
    forum_id = e.id;
    page = 1;
    last_length = 0;
    page = 1;
    pw_run = false;
    post_run = false;
    lont_tap_lock = false;
    image_list = [];
    po_id = "";
    mainListQuery = null;
    is_bt = e.is_bt == 'true' ? true : false;
  },
  onShow: function () {
    mainListQuery = wx.createSelectorQuery();
    mainListQuery.select('#main_list').boundingClientRect();
  },
  onReady: function () {
    wx.startPullDownRefresh({});
  },
  bind_view_tap: function (e)//点击查看引用串内容
  {
    if (lont_tap_lock) return;
    var all_kid = this.data.list[e.currentTarget.id].all_kid;
    if (all_kid != null && all_kid.length > 0) {
      this.setData({ q_list: [] });
      var that = this;
      GetQuoteBody(all_kid, that);
      this.setData({ open: true });
    }
  },
  bind_qd_tap: function (e)//打开引用的串
  {
    if (e['currentTarget'].id == "") return;
    wx.navigateTo({ url: '../thread/thread?id=' + e['currentTarget'].id });
  },
  onPullDownRefresh: function ()//下拉刷新
  {
    pw_run = true;
    page = 1;
    last_length = 0;
    this.setData(
      {
        list: [],
        scrollTop: 0
      });
    var that = this;
    GetList(that);
  },
  onReachBottom: function ()//上拉加载更多
  {
    if (pw_run) return;
    var that = this;
    GetList(that);
  },
  bind_pic_tap: function (e)//单击图片
  {
    var img_url;
    if (this.data.open)
      img_url = this.data.q_list[e['currentTarget'].id].img;
    else
      img_url = this.data.list[e['currentTarget'].id].img;

    wx.previewImage({
      current: (is_bt ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + img_url,
      urls: image_list
    });
  },
  bind_pic_load: function (e)//图片载入完成
  {
    var temp_width = 0;
    var temp_height = 0;
    var temp_ratio = 0.0;
    if (app.globalData.SystemInfo.Windows.height == 0 || app.globalData.SystemInfo.Windows.width == 0) {
      app.getSysWindow();
    }

    temp_width = app.globalData.SystemInfo.Windows.width / 2;//要缩放到的图片宽度
    temp_ratio = temp_width / e.detail.width;//计算缩放比例
    temp_height = e.detail.height * temp_ratio;//计算缩放后的高度

    if (!this.data.list[e.target.id].hasOwnProperty('img_height')) {

      this.data.list[e.target.id].push({ img_height: parseInt(temp_height) });
    }

    if (!this.data.list[e.target.id].hasOwnProperty('img_width')) {
      this.data.list[e.target.id].push({ img_width: parseInt(temp_width) });
    }

    if (!this.data.list[e.target.id].hasOwnProperty('img_load_success')) {
      this.data.list[e.target.id].push({ img_load_success: true });
    }

    this.data.list[e.target.id].img_height = parseInt(temp_height);
    this.data.list[e.target.id].img_width = parseInt(temp_width);
    this.data.list[e.target.id].img_load_success = true;
    this.setData({ list: this.data.list });
  },
  f_touch: function () {

  },
  onPageScroll: function (e) {
    var that = this;
    mainListQuery.exec(function (res) {
      var max_height = res[0].height;
      if (e.scrollTop > (max_height * 0.66) && e.scrollTop < (max_height * 0.7))//大于2/3就加载下一页
      {
        if (pw_run) return;
        GetList(that);
      }
    })
  },
  tap_ch: function () {
    this.setData({ open: false });
  },
})