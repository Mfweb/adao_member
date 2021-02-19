const app = getApp();

Page({
    data: {
        pageIndex: 'cookie',
        statusBarHeight: app.globalData.SystemInfo.Windows.statusBarHeight,

        startLoadCookies: false,
        startLoadAuth: false,
        startLoadSport: false,
        startLoadWife: false,
        startLoadArticle: false,
        startReloadWife: false,
        startReloadArticle: false,

        cookieReloading: false,
        authReloading: false,
        sportReloading: false,
        wifeReloading: false,
        articleReloading: false,

        cookieLoading: false,
        authLoading: false,
        sportLoading: false,
        wifeLoading: false,
        articleLoading: false,

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
            startLoadArticle: false,
            startReloadWife: false,
            startReloadArticle: false,

            cookieReloading: false,
            authReloading: false,
            sportReloading: false,
            wifeReloading: false,
            articleReloading: false,

            cookieLoading: false,
            authLoading: false,
            sportLoading: false,
            wifeLoading: false,
            articleLoading: false,


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
                            onPullDownRefresh: () => this.setData({ startLoadCookies: true, cookieReloading: true }),
                            onReachBottom: this.clearLoading
                        }
                    }, certified: {
                        name: '实名认证',
                        icon: 'certified',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startLoadAuth: true, authReloading: true }),
                            onReachBottom: this.clearLoading
                        }
                    }, article: {
                        name: '推送历史',
                        icon: 'article',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startReloadArticle: true, articleReloading: true }),
                            onReachBottom: () => this.setData({ startLoadArticle: true, articleLoading: true })
                        }
                    }, sport: {
                        name: '肥宅排行',
                        icon: 'sport',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startLoadSport: true, sportReloading: true }),
                            onReachBottom: this.clearLoading
                        }
                    }, wifes: {
                        name: '选老婆',
                        icon: 'wifes',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: () => this.setData({ startReloadWife: true, wifeReloading: true }),
                            onReachBottom: () => this.setData({ startLoadWife: true, wifeLoading: true })
                        }
                    }, lwmeme: {
                        name: '芦苇表情包',
                        icon: 'lw',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: this.clearLoading,
                            onReachBottom: this.clearLoading
                        }
                    }, about: {
                        name: '关于',
                        icon: 'about',
                        canSwitch: false,
                        events: {
                            onPullDownRefresh: this.clearLoading,
                            onReachBottom: this.clearLoading
                        }
                    }, password: {
                        name: '密码修改',
                        icon: 'passwd',
                        canSwitch: true,
                        events: {
                            onPullDownRefresh: this.clearLoading,
                            onReachBottom: this.clearLoading
                        }
                    }, exit: {
                        name: '退出',
                        icon: 'exit',
                        canSwitch: false,
                        events: {
                            onPullDownRefresh: this.clearLoading,
                            onReachBottom: this.clearLoading
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
        this.setData({ startLoadCookies: true, cookieLoading: true });
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
     * 点了标题
     */
    ontaptitle: function () {
        this.selectComponent('.list').scrollToTop();
    },
    /**
     * 页面改变
     * @param {Object} event
     */
    onChangePage: function (event) {
        switch (event.detail) {
            case 'cookie':
                this.setData({ startLoadCookies: true, cookieLoading: true, pageIndex: event.detail });
                break;
            case 'certified':
                this.setData({ startLoadAuth: true, authLoading: true, pageIndex: event.detail });
                break;
            case 'sport':
                this.setData({ startLoadSport: true, sportLoading: true, pageIndex: event.detail });
                break;
            case 'wifes':
                this.setData({ startReloadWife: true, wifeLoading: true, pageIndex: event.detail });
                break;
            case 'article':
                this.setData({ startReloadArticle: true, articleLoading: true, pageIndex: event.detail });
                break;
            case 'lwmeme':
            case 'password':
                this.setData({ pageIndex: event.detail });
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
        this.selectComponent('.list').scrollToTop();
    },
    clearLoading: function () {
        this.selectComponent('.list').stopLoading();
    },
    /**
     * 开始加载数据
     * @param {Object} event 
     */
    onLoadStart: function (event) {
        /*switch (event.detail.from) {
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
            case 'article':
                this.setData({ articleLoading: true });
                break;
        }*/
    },
    /**
     * 加载数据结束
     * @param {Object} event 
     */
    onLoadEnd: function (event) {
        switch (event.detail.from) {
            case 'auth':
                this.setData({ authLoading: false, authReloading: false });
                break;
            case 'cookie':
                if (event.detail.userInfo) {
                    this.setData({ 'popupMenuOpenData.userIco': 'http://adnmb.com' + event.detail.userInfo.userIco });
                }
                this.setData({ cookieLoading: false, cookieReloading: false });
                break;
            case 'sport':
                this.setData({ sportLoading: false, sportReloading: false });
                break;
            case 'wife':
                this.setData({ wifeLoading: false, wifeReloading: false });
                break;
            case 'article':
                this.setData({ articleLoading: false, articleReloading: false });
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