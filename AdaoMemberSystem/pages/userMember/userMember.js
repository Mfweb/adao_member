const app = getApp();
const http = require('../../utils/http.js');

Page({
  data: {
    pageIndex: 0,
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
    verifyCodeURL: "",//验证码链接
    vCodeLoading: false,//验证码是否在载入
    startLoadCookies: false,
    startLoadAuth: false,
    startLoadSport: false,

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
      verifyCodeURL: '',
      vCodeLoading: false,

      startLoadCookies: false,
      startLoadAuth: false,
      startLoadSport: false,

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
   * 页面关闭
   */
  onHide: function () {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
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
   * 页面改变
   */
  onChangePage: function(id) {
    if (id.detail == 4) {
      wx.navigateTo({
        url: '../about/about',
      });
    }
    else if (id.detail == 5) {
      app.logOut();
    }
    else {
      this.setData({ pageIndex: id.detail });
    }
  }
})