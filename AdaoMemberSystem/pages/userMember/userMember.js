const app = getApp();
const http = require('../../utils/http.js');

Page({
  data: {
    pageIndex: 0,
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,

    startLoadCookies: false,
    startLoadAuth: false,
    startLoadSport: false,
    startLoadWife: false,
    startReloadWife: false,

    cookieLoading: true,
    authLoading: true,
    sportLoading: true,
    wifeLoading: false,

    popupMenuOpenData: {}
  },
  /**
   * 初始化变量
   * 有的手机退出登录的时候页面数据不会重新初始化
   */
  resetData: function () {
    this.setData({
      pageIndex: 0,
      statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,

      startLoadCookies: false,
      startLoadAuth: false,
      startLoadSport: false,
      startLoadWife: false,
      startReloadWife: false,

      cookieLoading: true,
      authLoading: false,
      sportLoading: false,
      wifeLoading: false,


      popupMenuOpenData: {
        show: false,
        statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
        selectedIndex: 0,
        picURL: '',
        userName: '匿名肥宅',
        appList: app.globalData.AppList,
        menuList: [{
            name: '饼干管理',
            icon: 'cookie',
            canSwitch: true
          },{
            name: '实名认证',
            icon: 'certified',
            canSwitch: true
          },{
            name: '密码修改',
            icon: 'passwd',
            canSwitch: true
          },{
            name: '肥宅排行',
            icon: 'sport',
            canSwitch: true
          },{
            name: '选老婆',
            icon: 'wifes',
            canSwitch: true
          }, {
            name: '关于',
            icon: 'about',
            canSwitch: false
          },{
            name: '退出',
            icon: 'exit',
            canSwitch: false
          },
        ]
      }
    });
  },
  /**
   * 页面渲染完成
   */
  onReady: function () {
    this.resetData();
    app.checkVersion();
    this.pullDownRefreshAll();
    let tempUserName = wx.getStorageSync('UserName');
    if (tempUserName == undefined || tempUserName == '') {
      tempUserName = '匿名肥宅';
    }
    this.setData({ 'popupMenuOpenData.userName': tempUserName });
  },
  /**
   * 开始下拉刷新
   */
  onPullDownRefresh: function () {
    if (this.data.pageIndex == 0) {
      //处理饼干数据
      this.setData({
        startLoadCookies: true
      });
    }
    else if (this.data.pageIndex == 1) {
      //处理实名认证相关数据
      this.setData({
        startLoadAuth: true
      });
    }
    else if (this.data.pageIndex == 2){
      wx.stopPullDownRefresh();
    }
    else if (this.data.pageIndex == 3){
      this.setData({
        startLoadSport: true
      });
    }
    else if (this.data.pageIndex == 4) {
      this.setData({
        startReloadWife: true
      });
    }
  },
  /**
   * 下拉刷新所有
   * 不会有下拉动画
   */
  pullDownRefreshAll: function () {
    this.setData({
      startLoadCookies: true,
      startLoadAuth: true,
      startLoadSport: true
    });
  },
  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (this.data.pageIndex == 4) {
      this.setData({
        startLoadWife: true
      });
    }
  },
  /**
   * 页面改变
   */
  onChangePage: function(id) {
    switch (parseInt(id.detail)) {
      case 0: 
      case 1:
      case 2:
      case 3:
      case 4:
        this.setData({ pageIndex: id.detail });
        break;
      case 5:
        wx.navigateTo({
          url: '../about/about',
        });
        break;
      case 6:
        app.logOut();
        break;
      default:
        app.showError('哈？');
    }
  },
  onLoadStart: function (event) {
    switch (event.detail.from) {
      case 'auth':
        this.setData({ authLoading: true });
        break;
      case 'cookie':
        this.setData({ cookieLoading: true });
        break;
      case 'sport':
        this.setData({ sportLoading: true });
        break;
      case 'wife':
        this.setData({ wifeLoading: true });
        break;
    }
  },
  onLoadEnd: function (event) {
    switch (event.detail.from) {
      case 'auth':
        this.setData({ authLoading: false });
        break;
      case 'cookie':
        this.setData({ cookieLoading: false });
        break;
      case 'sport':
        this.setData({ sportLoading: false });
        break;
      case 'wife':
        this.setData({ wifeLoading: false });
        break;
    }

    if (event.detail.needRefresh) {
      wx.startPullDownRefresh({});
    }
    else {
      wx.stopPullDownRefresh();
    }
    this.setData({ authLoading: false });
  }
})