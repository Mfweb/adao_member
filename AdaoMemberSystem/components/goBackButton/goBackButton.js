// components/goBackButton.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapBack: function () {
      wx.navigateBack({});
    }
  }
})
