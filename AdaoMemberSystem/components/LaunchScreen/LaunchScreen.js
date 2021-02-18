// components/launchScreen/launchScreen.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        top: {
            type: Number,
            value: 24
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        launchPicture: '../../imgs/launch.jpg',
        show: true,
        animation: null
    },
    attached: function () {
        let tempUrl = wx.getStorageSync('launchImage');
        wx.getSavedFileInfo({
            filePath: tempUrl,
            success: () => this.setData({ launchPicture: tempUrl })
        });
    },
    /**
     * 组件的方法列表
     */
    methods: {
        hide: function (callback = null) {
            let animeOut = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease'
            });
            animeOut.opacity(0).step();

            this.setData({
                animation: animeOut.export()
            });
            getApp().downloadLaunchScreen();
            setTimeout(() => {
                this.setData({ show: false });
                if (callback != null) {
                    callback();
                }
            }, 310);
        }
    }
})
