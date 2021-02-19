// components/scroll-list/item/scroll-item.js
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    /**
     * 组件的初始数据
     */
    data: {
        height: 0, //卡片高度，用来做外部懒加载的占位
        showSlot: true, //控制是否显示当前的slot内容
        itemId: ''
    },

    created() {
        //设置一个走setData的数据池
        this.extData = {
            listItemContainer: null,
        }
    },

    detached() {
        try {
            this.extData.listItemContainer.disconnect()
        } catch (error) {

        }
        this.extData = null
    },

    ready() {
        this.setData({
            itemId: this.randomString(8) //设置唯一标识
        })

        wx.nextTick(() => {
            // 修改了监听是否显示内容的方法，改为前后showNum屏高度渲染
            // 监听进入屏幕的范围relativeToViewport({top: xxx, bottom: xxx})
            let windowHeight = app.globalData.SystemInfo.Windows.height || 667;
            let showNum = 2 //超过屏幕的数量，目前这个设置是上下2屏
            try {
                this.extData.listItemContainer = this.createIntersectionObserver()
                this.extData.listItemContainer.relativeToViewport({ top: showNum * windowHeight, bottom: showNum * windowHeight })
                    .observe(`#list-item-${this.data.itemId}`, (res) => {
                        let { intersectionRatio } = res
                        if (intersectionRatio === 0) {
                            //console.log('【卸载】', this.data.itemId, '超过预定范围，从页面卸载')
                            this.setData({
                                showSlot: false
                            })
                        } else {
                            //console.log('【进入】', this.data.itemId, '达到预定范围，渲染进页面')
                            this.setData({
                                showSlot: true,
                                height: res.boundingClientRect.height
                            })
                        }
                    })
            } catch (error) {
                console.log(error)
            }
        })

    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 生成随机的字符串
         */
        randomString(len) {
            len = len || 32;
            var $chars = 'abcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = $chars.length;
            var pwd = '';
            for (var i = 0; i < len; i++) {
                pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        }
    }
})
