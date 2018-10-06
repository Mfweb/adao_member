var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
const http = require('../../utils/http.js');

var postID = 0;//串ID
var page = 1;//当前页数
var localReplyLength = 0;
var isRefreshing = false;
var isGettingReply = false;
var imageList = [];//图片列表
var poUserID = "";
var mainListQuery = null;
var isBtIsland = false;

Page({
  data:
    {
      list: [],
      scrollTop: 0,
      scrollHeight: 0,
      bottomMessage: "",
      showQuoteWindow: false,
      quoteList: [],
      title: '无标题',
      listLoading: false,
      statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight
    },

  onLoad: function (e) {
    postID = e.id;
    page = 1;
    localReplyLength = 0;
    page = 1;
    isRefreshing = false;
    isGettingReply = false;
    imageList = [];
    poUserID = "";
    mainListQuery = null;
    isBtIsland = (e.is_bt == 'true' || e.is_bt == true) ? true : false;
  },
  onShow: function () {
    mainListQuery = wx.createSelectorQuery();
    mainListQuery.select('#main_list').boundingClientRect();
  },
  onReady: function () {
    if (wx.startPullDownRefresh) {
      wx.startPullDownRefresh({});
    }
    else {
      isRefreshing = true;
      page = 1;
      localReplyLength = 0;
      this.setData(
        {
          list: [],
          scrollTop: 0
        });
      this.getReplys();
    }
    wx.startPullDownRefresh({});
  },
  /**
   * 查看引用串内容
   */
  onTapQuoteDetail: function (e) {
    var all_kid = this.data.list[e.currentTarget.id].all_kid;
    if (all_kid != null && all_kid.length > 0) {
      this.setData({ quoteList: [] });
      this.getQuoteDetailList(all_kid);
      this.setData({ showQuoteWindow: true });
    }
  },
  /**
   * 打开引用串
   */
  onTapQuoteID: function (e) {
    if (e['currentTarget'].id == "") return;
    wx.navigateTo({ url: '../thread/thread?id=' + e['currentTarget'].id });
  },
  onPullDownRefresh: function () {
    if (isRefreshing == true) return;
    isRefreshing = true;
    page = 1;
    localReplyLength = 0;
    this.setData(
      {
        list: [],
        scrollTop: 0
      });
    this.getReplys();
  },
  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (isRefreshing) return;
    isRefreshing = true;
    this.getReplys();
  },
  /**
   * 查看大图
   */
  onTapPicture: function (e) {
    var img_url;
    if (this.data.showQuoteWindow)
      img_url = this.data.quoteList[e['currentTarget'].id].img;
    else
      img_url = this.data.list[e['currentTarget'].id].img;
    wx.previewImage({
      current: (isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + img_url,
      urls: imageList
    });
  },
  /**
   * 图片载入完成
   */
  onPictureLoad: function (e) {
    var temp_width = 0;
    var temp_height = 0;
    var temp_ratio = 0.0;
    if (app.globalData.SystemInfo.Windows.height == 0 || app.globalData.SystemInfo.Windows.width == 0) {
      app.getSysWindow();
    }

    temp_width = app.globalData.SystemInfo.Windows.width / 2;//要缩放到的图片宽度
    temp_ratio = temp_width / e.detail.width;//计算缩放比例
    temp_height = e.detail.height * temp_ratio;//计算缩放后的高度

    var tempData = this.data.list;
    if (tempData[e.target.id] == undefined || tempData[e.target.id] == null) {
      app.log('aerror');
      return;
    }
    tempData[e.target.id].img_height = temp_height;
    tempData[e.target.id].img_width = temp_width;
    tempData[e.target.id].img_load_success = true;

    this.setData({ list: tempData });
  },
  /**
   * 页面滚动
   */
  onPageScroll: function (e) {
    mainListQuery.exec(function (res) {
      var max_height = res[0].height;
      //大于2/3就加载下一页
      if (e.scrollTop > (max_height * 0.66) && e.scrollTop < (max_height * 0.7)) {
        if (isRefreshing) return;
        this.getReplys();
      }
    }.bind(this))
  },
  /**
   * 点击了遮罩
   */
  onTapMask: function () {
    this.setData({ showQuoteWindow: false });
  },
  /**
   * 获取回复
   */
  getReplys: function () {
    if (isGettingReply) return;
    isGettingReply = true;
    this.setData({ listLoading: true });
    if (page != 1)
      this.setData({ bottomMessage: this.data.bottomMessage + ",Loading..." });
    else
      this.setData({ bottomMessage: "Loading..." });
    http.api_request(
      isBtIsland ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL,
      { id: postID, page: page },
      function (res) {
        if (res == "该主题不存在") {
          this.setData({ bottomMessage: "该主题不存在", listLoading: false });
          return;
        }
        let list = this.data.list;

        //第一页 添加正文内容
        if (list.length == 0) {
          let temp_fid = this.getQuoteList(res.content);

          let header = {
            'id': res.id,
            'now': res.now,
            'userid': res.userid,
            'name': res.name,
            'email': res.email,
            'title': res.title,
            'content': WxParse.wxParse('item', 'html', temp_fid.html, this, null).nodes,
            'all_kid': temp_fid.all_kid,
            'admin': res.admin,
            'replyCount': res.replyCount,
            'sage': res.sage,
            'admin': res.admin,
            'img_height': 0,
            'img_width': 0
          };
          poUserID = res.userid;

          let html_h = "<font class='";

          if (res.admin == 1)
            html_h += "xuankuhongming";
          if (res.userid == poUserID)
            html_h += " po";
          html_h += "'>"
          html_h += res.userid + "</font>";
          header.userid = WxParse.wxParse('item', 'html', html_h, this, null).nodes;

          if (res.img != "") {
            header.img = res.img + res.ext;
            header.thumburl = res.ext == ".gif" ? (isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (isBtIsland ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
            header.img_load_success = false;
            imageList.push((isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + res.img + res.ext);
          }
          else {
            header.img = "";
            header.thumburl = "";
          }
          list.push(header);
          this.setData({ title: list[0].title});
        }
        else {
          if (res.replys[0].id == 9999999) {
            console.log('ad');
            res.replys.splice(0, 1);
          }
        }
        let len = 0;
        if (localReplyLength > 0)
          len = res.replys.length - localReplyLength;
        else
          len = res.replys.length;
        if (len > 0) {
          list[0].replyCount = res.replyCount;
          for (let i = localReplyLength; i < res.replys.length; i++) {
            if (res.replys[i].img != "") {
              res.replys[i].img = res.replys[i].img + res.replys[i].ext;
              res.replys[i].thumburl = res.replys[i].ext == ".gif" ? (isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (isBtIsland ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
              imageList.push((isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) + res.replys[i].img);
            }
            let temp_html = this.getQuoteList(res.replys[i].content);
            res.replys[i].content = temp_html.html;//正则高亮所有引用串号
            res.replys[i].all_kid = temp_html.all_kid;
            res.replys[i].content = WxParse.wxParse('item', 'html', res.replys[i].content, this, null).nodes;
            res.replys[i].img_height = 0;
            res.replys[i].img_width = 0;
            res.replys[i].img_load_success = false;

            let html_h = "<font class='";

            if (res.replys[i].admin == 1)
              html_h += "xuankuhongming";
            if (res.replys[i].userid == poUserID)
              html_h += " po";
            html_h += "'>"
            html_h += res.replys[i].userid + "</font>";
            res.replys[i].userid = WxParse.wxParse('item', 'html', html_h, this, null).nodes;

            list.push(res.replys[i]);
          }
          this.setData({ list: list });
          //本页已经完
          if (res.replys.length >= 19) {
            page++;
            localReplyLength = 0;
          }
          else {
            if (res.replys[0].id == 9999999)
              localReplyLength = res.replys.length - 1;
            else
              localReplyLength = res.replys.length + 1;
          }
        }
        else {
          if (page == 1) {
            this.setData({ list: list });
          }
        }
        this.setData({ bottomMessage: (list.length - 1) + "/" + list[0].replyCount, listLoading: false});
        isRefreshing = false;
        isGettingReply = false;
        wx.stopPullDownRefresh();
      }.bind(this),
      function () {
        app.showError('加载失败');
        this.setData({ bottomMessage: "加载失败", listLoading: true });
        isRefreshing = false;
        isGettingReply = false;
        wx.stopPullDownRefresh();
      }.bind(this)
    );
  },
  /**
   * 获得引用串列表
   */
  getQuoteList: function (kid) {
    var te = /((&gt;){2}|(>){2})(No\.){0,3}\d{1,11}/g;//正则表达式匹配出所有引用串号，支持>>No.123123和>>123123 两种引用格式
    //var te_addr = /h.nimingban.com\/t\/\d{1,11}/g;
    var te2 = /\d{1,11}/g;
    var out_data = { html: null, all_kid: [] };
    if (typeof kid != 'string' || kid.length == 0) {
      return { html: kid, all_kid: [] };
    }
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
  },
  /**
   * 获取一个引用串的内容
   * 先作为主串，如果不是，则作为回复
   */
  getQuoteDetail: function (kindex, mode = 0) {
    if (mode == 0) {
      http.api_request(
        isBtIsland ? app.globalData.ApiUrls.BTThreadURL : app.globalData.ApiUrls.ThreadURL,
        { id: this.data.quoteList[kindex].id, page: 1 },
        function (res) {
          if (res == "该主题不存在") {//不是主串 拉取串内容
            this.getQuoteDetail(kindex, 1);
          }
          else {
            var quoteList = this.data.quoteList;
            res.content = WxParse.wxParse('item', 'html', res.content, this, null).nodes;
            res.sid = res.id;
            if (res.img != "") {
              res.img = res.img + res.ext;
              res.thumburl = res.ext == ".gif" ? (isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (isBtIsland ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
            }
            var html_h = "<font class='";

            if (res.admin == 1)
              html_h += "xuankuhongming";
            if (res.userid == poUserID)
              html_h += " po";
            html_h += "'>"
            html_h += res.userid + "</font>";
            res.userid = WxParse.wxParse('item', 'html', html_h, this, null).nodes;

            quoteList[kindex] = res;
            this.setData({ quoteList: quoteList });
          }
        }.bind(this),
        function () {
          app.log("get quoteon error1");
        });
    }
    else {
      http.api_request(
        (isBtIsland ? app.globalData.ApiUrls.BTGetThreadURL : app.globalData.ApiUrls.GetThreadURL) + "&id=" + this.data.quoteList[kindex].id,
        {},
        function (res) {
          var quoteList = this.data.quoteList;
          if (res == "thread不存在") {
            var temp = { id: "ID不存在" };
            quoteList[kindex] = temp;
          }
          else {
            res.content = WxParse.wxParse('item', 'html', res.content, this, null).nodes;
            if (res.img != "") {
              res.img = res.img + res.ext;
              res.thumburl = res.ext == ".gif" ? (isBtIsland ? app.globalData.ApiUrls.BTFullImgURL : app.globalData.ApiUrls.FullImgURL) : (isBtIsland ? app.globalData.ApiUrls.BTThumbImgURL : app.globalData.ApiUrls.ThumbImgURL);
            }
            var html_h = "<font class='";

            if (res.admin == 1)
              html_h += "xuankuhongming";
            if (res.userid == poUserID)
              html_h += " po";
            html_h += "'>"
            html_h += res.userid + "</font>";
            res.userid = WxParse.wxParse('item', 'html', html_h, this, null).nodes;

            quoteList[kindex] = res;
          }
          this.setData({ quoteList: quoteList });
        }.bind(this),
        function () {//fail
          app.log("get quoteon error2");
        });
    }
  },
  getQuoteDetailList: function (all_kid, mode = 1) {
    var temp_quoteList = [];
    for (let i = 0; i < all_kid.length; i++) {
      var temp = { id: all_kid[i] };
      temp_quoteList.push(temp);
    }
    this.setData({ quoteList: temp_quoteList });
    for (let i = 0; i < all_kid.length; i++) {
      this.getQuoteDetail(i);//拉取内容
    }
  }
})