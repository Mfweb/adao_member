// components/wifeList/wifeList.js
var nowPage = 0;
const app = getApp();
const http = require('../../utils/http.js');
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
          this.setData({
            loadWife: false,
            bottomMessage: '正在加载...'
          });
          this.getData();
        }
      }
    },
    reloadWife: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal == true) {
          nowPage = 0;
          this.setData({
            reloadWife: false,
            leftList: [],
            rightList: [],
            bottomMessage: '正在加载...'
          });
          this.getData();
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
    rightList: [],
    bottomMessage: '上拉继续加载'
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
      this.triggerEvent('startload', { from: 'wife', needRefresh: false });
      http.requestGet(app.globalData.ApiUrls.GetRandomPicURL, { page: nowPage}).then(res => {
        if (res.data.items.length == 0) {
          app.showError('老婆就这些啦');
          this.setData({ bottomMessage: '到底啦'});
          return;
        }
        this._addImage(res.data.items, 0);
        nowPage++;
        this.setData({ bottomMessage: '上拉继续加载'});
      }).catch(error => {
        app.showError(error == false ? '错误[Wife]' : ('Wife:' + error.statusCode));
      }).finally(() => {
        this.setData({ isLoading: false });
        this.triggerEvent('endload', { from: 'wife', needRefresh: false });
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
    },
    onTapLeft: function(e){
      wx.previewImage({
        urls: [this.data.leftList[e.currentTarget.id].url],
      });
    },
    onTapRight: function (e) {
      wx.previewImage({
        urls: [this.data.rightList[e.currentTarget.id].url],
      });
    },
  }
})
