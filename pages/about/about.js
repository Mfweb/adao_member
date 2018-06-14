const app = getApp();

function getImage(that) {
  wx.request({
    url: app.globalData.ApiUrls.GetRandomPicURL,
    success: function (res) {
      if (res.statusCode == 200) {
        that.setData({ pic_url: res.data });
      }
    }
  });
}

Page({
  data: {
    pic_url : ""
  },
  onLoad: function (options) {
    var that = this;
    getImage(that);
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
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
    })
  },
  feedbacktap: function(e) {
    let res = wx.getSystemInfoSync();
    let version = res.SDKVersion.split('.');
    
    if (version[0] < 2 || (version[0] == 2 && version[1] > 1))
    {
      wx.showModal({
        title: '提示',
        content: '微信版本号不支持该反馈方式，请更新微信或反馈到\r\nh@mfweb.pw',
        showCancel: false
      });
    }
  }
})