const app = getApp();

Page({
  data: {
    pic_url : "",
    statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight + 16
  },
  onLoad: function (options) {
    app.getImage().then(res => {
      this.setData({ pic_url: res });
    });
  },
  tap1: function (e) {
    wx.setClipboardData({
      data: 'https://mfweb.top/',
      success: function () {
        app.showSuccess("链接已复制");
      },
      fail: function () {
        app.showError("复制失败");
      }
    });
  },
  tap2: function (e) {
    wx.setClipboardData({
      data: 'https://github.com/Mfweb/adao_member.git',
      success: function () {
        app.showSuccess("链接已复制");
      },
      fail: function () {
        app.showError("复制失败");
      }
    });
  },
  tap3: function (e) {
    wx.setClipboardData({
      data: 'https://mfweb.top/595.html',
      success: function () {
        app.showSuccess("链接已复制");
      },
      fail: function () {
        app.showError("复制失败");
      }
    });
  },
  onTapImg: function(e){
    wx.previewImage({
      urls: [this.data.pic_url],
    });
  },
  feedbacktap: function(e) {
    let res = wx.getSystemInfoSync();
    let version = res.SDKVersion.split('.');
    if (parseInt(version[0]) < 2 || (parseInt(version[0]) == 2 && parseInt(version[1]) < 1)) {
      wx.showModal({
        title: '提示',
        content: '微信版本号不支持该反馈方式，请更新微信或反馈到\r\nh@mfweb.pw',
        showCancel: false
      });
    }
  }
})