// components/termsWindow/termsWindow.js
import { wxParse } from '../../wxParse/wxParse.js';
const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        closeText: {
            type: String,
            value: '已阅读并同意'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        termsNodes: null,
        showTermsWindow: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        showWindow: function () {
            app.getTerms(function (res) {
                if (res === false) {
                    app.showError('网络错误');
                }
                else if (res.status != 'ok') {
                    app.showError(res.errmsg);
                }
                else {
                    this.setData({
                        termsNodes: wxParse('item', 'html', res.data, this, null).nodes,
                        showTermsWindow: true
                    });
                }
            }.bind(this));
        },
        close: function () {
            this.setData({ showTermsWindow: false });
        }
    }
})
