// components/lwMeme/lwMeme.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    lwMemeSampleLeft: ['0.png', '2.png', '4.png', '6.png', '8.png', '10.png', '12.png', '14.png', '16.png'],
    lwMemeSampleRight: ['1.png', '3.png', '5.png', '7.png', '9.png', '11.png', '13.png', '15.png']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
    onDownloadFull() {
      wx.setClipboardData({
        data: 'http://cover.acfunwiki.org/adnmb-reed.zip', 
        success: function () {
          app.showSuccess('链接已复制');
        },
        fail: function () {
          app.showError('链接复制失败');
        }
      })
    },

    onViewQrcode() {
      wx.previewImage({
        urls: ['https://amember.mfweb.top/adao/member/upload/lwmeme-qrcode.png'],
      })
    }
  }
})
