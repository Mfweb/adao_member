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
          this._addImage(res.data.items, 0);
          nowPage ++;
        }.bind(this),
        fail: function () {
          app.showError('加载失败');
        },
        complete: function () {
          this.setData({ isLoading: false });
        }.bind(this)
      });
    },
    _addImage: function (imgList, n) {
      if (n >= imgList.length) {
        return;
      }
      this.createSelectorQuery().select('#list-left').boundingClientRect(function (res) {
        let leftInfo = res;
        this.createSelectorQuery().select('#list-right').boundingClientRect(function (res2) {
          let rightInfo = res2;
          let imgHeight = leftInfo.width / imgList[n].width * imgList[n].height;
          if (leftInfo.height < rightInfo.height) {
            this.data.leftList.push({ url: imgList[n].url, height: imgHeight });
            this.setData({ leftList: this.data.leftList });
          }
          else {
            this.data.rightList.push({ url: imgList[n].url, height: imgHeight });
            this.setData({ rightList: this.data.rightList });
          }
          this._addImage(imgList, ++n);

        }.bind(this)).exec();
      }.bind(this)).exec();
    }
  }
})
