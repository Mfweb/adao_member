// components/wifeList/wifeList.js
var nowPage = 0;
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number
    },
    loadWife: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal == true) {
          this.getData();
          this.setData({ loadWife: false });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLoading: false,
    leftList: [],
    rightList: []
  },
  attached: function () {
    this.setData({
      leftList: [],
      rightList: [],
      isLoading: false
    });
    nowPage = 0;
    this.getData();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getData: function () {
      if (this.data.isLoading) return;
      this.setData({ isLoading: true });
      wx.request({
        url: app.globalData.ApiUrls.GetRandomPicURL,
        data: {
          page: nowPage
        },
        method: 'GET',
        success: function (res) {
          if(res.statusCode != 200 && res.statusCode != '200') {
            app.showError('http错误' + res.statusCode);
            return;
          }
          console.log(res.data);
          for(let i = 0; i < res.data.items.length;i++) {
            this._addImage(res.data.items[i]);
          }
          nowPage ++;
          //this.setData({ leftList: res.data.items, rightList: res.data.items });
          //this._addImage();
        }.bind(this),
        fail: function () {
          app.showError('加载失败');
        },
        complete: function () {
          this.setData({ isLoading: false });
        }.bind(this)
      });
    },
    _addImage: function (imgName) {
      this.createSelectorQuery().select('#list-left').boundingClientRect(function (res) {
        let leftHeight = res.height;
        this.createSelectorQuery().select('#list-right').boundingClientRect(function (res2) {
          let rightHeight = res2.height;
          if (rightHeight == leftHeight) {
            if (this.data.leftList.length > this.data.rightList.length) {
              this.data.rightList.push(imgName);
              this.setData({ rightList: this.data.rightList });
            }
            else {
              this.data.leftList.push(imgName);
              this.setData({ leftList: this.data.leftList });
            }
          }
          else if(rightHeight > leftHeight) {
            this.data.leftList.push(imgName);
            this.setData({ leftList: this.data.leftList });
          }
          else {
            this.data.rightList.push(imgName);
            this.setData({ rightList: this.data.rightList });
          }
        }.bind(this)).exec();
      }.bind(this)).exec();
    }
  }
})
