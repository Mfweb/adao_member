// components/articleHistory/articleHistory.js
var nowPage = 1;
var isLoading = false;
const app = getApp();
const http = require('../../utils/http.js');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        loadArticle: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal && !oldVal) {
                    this.setData({
                        loadArticle: false,
                        bottomMessage: '正在加载...'
                    });
                    this.getData();
                }
            }
        },
        reloadArticle: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal, changedPath) {
                if (newVal && !oldVal) {
                    nowPage = 1;
                    this.setData({
                        reloadArticle: false,
                        list: [],
                        bottomMessage: '正在加载...'
                    });
                    this.getData();
                }
            }
        }
    },
    lifetimes: {
        detached: function () {
            nowPage = 1;
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        isLoading: false,
        list: [],
        bottomMessage: '上拉继续加载'
    },
    attached: function () {
        nowPage = 1;
        this.setData({
            list: [],
            isLoading: false
        });
    },
    /**
     * 组件的方法列表
     */
    methods: {
        getData: function () {
            if (isLoading) return;
            isLoading = true;
            this.triggerEvent('startload', { from: 'article', needRefresh: false });
            http.requestGet(app.globalData.ApiUrls.GetSharesListURL, { page: nowPage }).then(res => {
                if (res.data.data.length == 0) {
                    app.showError('到底啦');
                    this.setData({ bottomMessage: '到底啦' });
                    return;
                }
                nowPage++;
                let new_list = this.data.list.concat(res.data.data);
                this.setData({ bottomMessage: '上拉继续加载', list: new_list });
            }).catch(error => {
                app.showError(error == false ? '错误[Article]' : ('article:' + error.statusCode));
            }).finally(() => {
                isLoading = false;
                this.triggerEvent('endload', { from: 'article', needRefresh: false });
            });
        },
        onTapItem: function (e) {
            wx.navigateTo({
                url: '../../pages/list/list?relaunch=false&tid=' + e.currentTarget.id,
            });
        }
    }
})
