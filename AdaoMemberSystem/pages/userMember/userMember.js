const app = getApp();

Page({
    data: {
        pageIndex: 'cookie',
        statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,

        startLoadCookies: false,
        startLoadAuth: false,
        startLoadSport: false,
        startLoadWife: false,
        startReloadWife: false,

        cookieLoading: true,
        authLoading: true,
        sportLoading: true,
        wifeLoading: false,

        popupMenuOpenData: {
            statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight
        }
    },
    /**
     * 初始化变量
     * 有的手机退出登录的时候页面数据不会重新初始化
     */
    resetData: function () {
        this.setData({
            pageIndex: 'cookie',
            statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,

            startLoadCookies: false,
            startLoadAuth: false,
            startLoadSport: false,
            startLoadWife: false,
            startReloadWife: false,

            cookieLoading: true,
            authLoading: false,
            sportLoading: false,
            wifeLoading: false,


            popupMenuOpenData: {
                show: false,
                userIco: 'http://adnmb.com/Public/member/users/assets/img/user_nohead.png',
                statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,
                selectedIndex: 'cookie',
                picURL: '',
                userName: '匿名肥宅',
                appList: app.globalData.AppList.iOS.concat(app.globalData.AppList.Android),
                menuList: {
                    cookie: {
                        name: '饼干管理',
                        icon: 'cookie',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startLoadCookies: true }),
                            onReachBottom: null
                        }
                    }, certified: {
                        name: '实名认证',
                        icon: 'certified',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startLoadAuth: true }),
                            onReachBottom: null
                        }
                    }, sport: {
                        name: '肥宅排行',
                        icon: 'sport',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startLoadSport: true }),
                            onReachBottom: null
                        }
                    }, wifes: {
                        name: '选老婆',
                        icon: 'wifes',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startReloadWife: true }),
                            onReachBottom: () => this.setData({ startLoadWife: true })
                        }
                    }, lwmeme: {
                        name: '芦苇表情包',
                        icon: 'lw',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => wx.stopPullDownRefresh(),
                            onReachBottom: null
                        }
                    }, about: {
                        name: '关于',
                        icon: 'about',
                        canSwitch: false,
                        events: {
                            onPullDownRefresh: null,
                            onReachBottom: null
                        }
                    }, password: {
                        name: '密码修改',
                        icon: 'passwd',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => wx.stopPullDownRefresh(),
                            onReachBottom: null
                        }
                    }, exit: {
                        name: '退出',
                        icon: 'exit',
                        canSwitch: false,
                        events: {
                            onPullDownRefresh: null,
                            onReachBottom: null
                        }
                    }
                }
            }
        });
    },

    /**
     * 页面渲染完成
     */
    onReady: function () {
        this.resetData();
        app.checkVersion();
        this.pullDownRefreshAll();
        let tempUserName = wx.getStorageSync('UserName');
        if (tempUserName == undefined || tempUserName == '') {
            tempUserName = '匿名肥宅';
        }
        this.setData({ 'popupMenuOpenData.userName': tempUserName });
    },

    /**
     * 开始下拉刷新
     */
    onPullDownRefresh: function () {
        if (this.data.popupMenuOpenData.menuList[this.data.pageIndex].events.onPullDownRefresh !== null)
            this.data.popupMenuOpenData.menuList[this.data.pageIndex].events.onPullDownRefresh();
    },

    /**
     * 上拉加载更多
     */
    onReachBottom: function () {
        if (this.data.popupMenuOpenData.menuList[this.data.pageIndex].events.onReachBottom !== null)
            this.data.popupMenuOpenData.menuList[this.data.pageIndex].events.onReachBottom();
    },

    /**
     * 下拉刷新所有
     * 不会有下拉动画
     */
    pullDownRefreshAll: function () {
        this.setData({
            startLoadCookies: true,
            startLoadAuth: true,
            startLoadSport: true
        });
    },

    /**
     * 页面改变
     * @param {Object} event
     */
    onChangePage: function (event) {
        switch (event.detail) {
            case 'cookie':
            case 'certified':
            case 'sport':
            case 'wifes':
            case 'lwmeme':
            case 'password':
                this.setData({ pageIndex: event.detail });
                wx.pageScrollTo({
                    duration: 0,
                    selector: '#top'
                });
                break;
            case 'about':
                wx.navigateTo({
                    url: '../about/about',
                });
                break;
            case 'exit':
                app.logOut();
                break;
            default:
                app.showError('哈？');
        }
    },
    /**
     * 开始加载数据
     * @param {Object} event 
     */
    onLoadStart: function (event) {
        switch (event.detail.from) {
            case 'auth':
                this.setData({ authLoading: true });
                break;
            case 'cookie':
                this.setData({ cookieLoading: true });
                break;
            case 'sport':
                this.setData({ sportLoading: true });
                break;
            case 'wife':
                this.setData({ wifeLoading: true });
                break;
        }
    },
    /**
     * 加载数据结束
     * @param {Object} event 
     */
    onLoadEnd: function (event) {
        switch (event.detail.from) {
            case 'auth':
                this.setData({ authLoading: false });
                break;
            case 'cookie':
                if (event.detail.userInfo) {
                    this.setData({ 'popupMenuOpenData.userIco': 'http://adnmb.com' + event.detail.userInfo.userIco });
                }
                this.setData({ cookieLoading: false });
                break;
            case 'sport':
                this.setData({ sportLoading: false });
                break;
            case 'wife':
                this.setData({ wifeLoading: false });
                break;
        }

        if (event.detail.needRefresh) {
            wx.startPullDownRefresh({});
        }
        else {
            wx.stopPullDownRefresh();
        }
        this.setData({ authLoading: false });
    }
})