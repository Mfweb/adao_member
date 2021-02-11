const app = getApp();
const http = require('../../utils/http.js');
const cookie = require('../../utils/cookie.js');
var selectedList = [];

Page({
    data: {
        CookieList: [],
        returnJson: '',
        disableLaunch: true,
        disableCheckbox: false,
        statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
        loading: false
    },
    onReady: function () {
        selectedList = [];
        if (wx.startPullDownRefresh) {
            wx.startPullDownRefresh({});
        }
        else {
            wx.showNavigationBarLoading();
            this.getCookies();
        }
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading();
        this.getCookies();
    },
    onTapReturn: function (res) {
        if (selectedList.length > 0) {
            wx.reLaunch({
                url: '../index/index',
            });
        }
    },
    onLaunchAppError: function (res) {
        app.showError("返回APP失败\r\n" + res.detail.errMsg);
        app.log(res);
    },
    checkboxChange: function (res) {
        selectedList = res.detail.value;
        if (this.data.disableCheckbox == true) {
            this.setData({ disableLaunch: true });
            return;
        }
        if (selectedList.length > 0) {
            this.setData({ disableLaunch: false });
        }
        else {
            this.setData({ disableLaunch: true });
        }
    },
    onTapCheckbox: function (res) {
        var detail = this.data.CookieList[res.currentTarget.id].detail;
        if (this.data.CookieList[res.currentTarget.id].checked == true) {
            this.data.CookieList[res.currentTarget.id].checked = false;
            this.setData({ CookieList: this.data.CookieList });
            return;
        }
        if (detail == undefined || detail == null || detail == '') {
            this.setData({ disableCheckbox: true, disableLaunch: true });
            this.getDetail(res.currentTarget.id);
        }
        else {
            var tempString = this.detailToString();
            this.setData({ returnJson: tempString });
        }
    },
    getCookies: function () {
        this.setData({ loading: true }, () => cookie.getCookies().then(res => {
            if (res.cookies.length == 0) {
                app.showError('你没有饼干，点击确认重新登录后获取饼干再次进行导入。', () => {
                    wx.navigateBack({});
                    this.setData({ loading: false });
                });
            }
            else {
                this.setData({
                    CookieList: res.cookies,
                    loading: false
                });
            }
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        }).catch(error => {
            if (error.message == '本页面需要实名后才可访问_(:з」∠)_') {
                app.showError('你还没有实名认证，请点击确认后重新登录，进入用户系统完成实名认证并领取饼干后再次导入。', () => {
                    wx.navigateBack({});
                });
            }
            else {
                app.showError(error.message);
            }
            this.setData({ loading: false });
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        }));
    },
    detailToString: function () {
        var tempObj = [];
        for (let i = 0; i < selectedList.length; i++) {
            tempObj.push(this.data.CookieList[selectedList[i]].detail);
        }
        return JSON.stringify(tempObj);
    },
    getDetail: function (id) {
        let tempList = this.data.CookieList;
        cookie.getCookieDetail(this.data.CookieList[id].id).then(res => {
            if (tempList != undefined && tempList != []) {
                tempList[id].checked = true;
                tempList[id].detail = res;
                this.setData({ disableCheckbox: false, CookieList: tempList });
                var tempString = this.detailToString();
                this.setData({ returnJson: tempString });
                if (selectedList.length > 0) {
                    this.setData({ disableLaunch: false });
                }
                else {
                    this.setData({ disableLaunch: true });
                }
            }
            else {
                app.showError('数据错误');
            }
        }).catch(error => {
            app.showError(error);
            if (tempList != undefined && tempList != []) {
                tempList[id].checked = false;
            }
            this.setData({ disableCheckbox: false, CookieList: tempList });
        });
    }
})