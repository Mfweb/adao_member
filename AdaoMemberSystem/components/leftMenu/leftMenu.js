Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object
    },
    userIco: {
      type: String,
      value: 'http://adnmb2.com/Public/member/users/assets/img/user_nohead.png'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  attached: function () {
    /*getApp().getImage().then(res => {
      console.log(res); // 有的手机上莫名其妙404，换成静态图
      this.setData({ 'data.picURL': res });
    }).catch(()=>{
      console.log("error");
    })*/
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击了左上角菜单按钮
     */
    onTapMenuButton: function (e) {
      this.setData({ 'data.show': true });
    },
    /**
     * 食我大屌
     */
    onEat: function (e) {
      getApp().playEat();
    },
    /**
     * 切换页面
     */
    onTapMenuItem: function (e) {
      this.triggerEvent('pagechanged', e.currentTarget.id)
      if (this.data.data.menuList[e.currentTarget.id].canSwitch == true) {
        this.setData({ 'data.selectedIndex': e.currentTarget.id });
      }
      this.setData({ 'data.show': false });
    },
    /**
     * 点击了APP下载
     */
    onTapDownloadApp: function (e) {
      wx.setClipboardData({
        data: getApp().globalData.AppList[e.currentTarget.id].url,
        success: function () {
          getApp().showSuccess('链接已复制');
          this.onTapOverlay();
        }.bind(this),
        fail: function () {
          getApp().showError('复制失败');
        }
      });
    },
    /**
     * 点击了遮罩层
     */
    onTapOverlay: function () {
      this.setData({ 'data.show': false });
    },
    onPopupMenuCatchScroll: function () {

    },
    onViewImage: function () {
      if (this.data.data.picURL == '' || this.data.data.picURL == null) {
        getApp().showError('图片为空');
        return;
      }
      wx.previewImage({
        urls: [this.data.data.picURL],
      });
      getApp().getImage().then(res => {
        this.setData({ 'data.picURL': res });
      });
    }
  }
})
