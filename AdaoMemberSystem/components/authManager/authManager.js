const app = getApp();
const http = require('../../utils/http.js');
var WxParse = require('../../wxParse/wxParse.js');
var timer = null;
var authData = null;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number
    },
    hide: {
      type: Boolean
    },
    loadAuth: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal == true) {
          if (timer != null) {
            clearInterval(timer);
            timer = null;
          }

          this.setData({
            CertFormShow: false,
            ShowCertMsg: false,
            loadAuth: false
          });
          this.triggerEvent('startload', { from: 'auth', needRefresh: false });
          this.getCertifiedStatus();
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    verifyCodeURL: '',
    vCodeLoading: false,
    EnterButLoading: false,//确认按钮loading
    CertStatus: "请下拉刷新",//实名认证状态
    PhoneStatus: "请下拉刷新",//手机实名认证状态
    CanCert: false,//是否可以手机实名认证（是否显示按钮）
    CertFormShow: false,//实名认证表单是否显示
    Cindex: 0,
    Carray: [
      '中国 - +86', '美国 - +1', '加拿大 - +1', '香港 - +852', '澳门 - +853', '台湾 - +886', '马来西亚 - +60', '印度尼西亚 - +62',
      '新加坡 - +65', '泰国 - +66', '日本 - +81', '韩国 - +82', '越南 - +84', '哈萨克斯坦 - +7', '塔吉克斯坦 - +7', '土耳其 - +90', '印度 - +91',
      '巴基斯坦 - +92', '阿富汗 - +93', '斯里兰卡 - +94', '缅甸 - +95', '伊朗 - +98', '文莱 - +673', '朝鲜 - +850', '柬埔寨 - +855', '老挝 - +865',
      '孟加拉国 - +880', '马尔代夫 - +960', '叙利亚 - +963', '伊拉克 - +964', '巴勒斯坦 - +970', '阿联酋 - +971', '以色列 - +972', '巴林 - +973',
      '不丹 - +975', '蒙古 - +976', '尼珀尔 - +977', '英国 - +44', '德国 - +49', '意大利 - +39', '法国 - +33', '俄罗斯 - +7', '希腊 - +30', '荷兰 - +31',
      '比利时 - +32', '西班牙 - +34', '匈牙利 - +36', '罗马尼亚 - +40', '瑞士 - +41', '奥地利 - +43', '丹麦 - +45', '瑞典 - +46', '挪威 - +47',
      '波兰 - +48', '圣马力诺 - +223', '匈牙利 - +336', '南斯拉夫 - +338', '直布罗陀 - +350', '葡萄牙 - +351', '卢森堡 - +352', '爱尔兰 - +353',
      '冰岛 - +354', '马耳他 - +356', '塞浦路斯 - +357', '芬兰 - +358', '保加利亚 - +359', '立陶宛 - +370', '乌克兰 - +380', '南斯拉夫 - +381',
      '捷克 - +420', '秘鲁 - +51', '墨西哥 - +52', '古巴 - +53', '阿根廷 - +54', '巴西 - +55', '智利 - +56', '哥伦比亚 - +57', '委内瑞拉 - +58',
      '澳大利亚 - +61', '新西兰 - +64', '关岛 - +671', '斐济 - +679', '圣诞岛 - +619164', '夏威夷 - +1808', '阿拉斯加 - +1907', '格陵兰岛 - +299',
      '牙买加 - +1876', '南极洲 - +64672'],
    CertMsg: null,//手机实名认证显示的消息
    ShowCertMsg: false,//是否显示实名认证消息
    CopyLoading: false,//复制手机号loading
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
      * 点击了关闭实名认证
      */
    onAuthClose: function () {
      this.setData({ CertFormShow: false });
    },
    /**
      * 确认实名认证
      */
    onEnterAuth: function (e) {
      var u_vcode = e.detail.value.verifycode;
      if (u_vcode.length != 5) {
        app.showError('验证码错误');
        return;
      }
      if (this.data.EnterButLoading == true) return;
      this.setData({ EnterButLoading: true });

      var u_country = parseInt(this.data.Cindex) + 1;
      var u_phone = e.detail.value.phonenumber;
      if (!(/^\d{5,}$/.test(u_phone))) {
        app.showError('手机号错误');
        return;
      }
      this.triggerEvent('startload', { from: 'auth', needRefresh: false });
      http.request(
        app.globalData.ApiUrls.MobileCertURL,
        {
          verify: u_vcode,//验证码
          mobile_country_id: u_country,//国家序号
          mobile: u_phone//手机号
        }).then(res => {
          try {
            if (res.status == 0) {
              app.showError(res.info);
              this.getNewVcode();
            }
            else {
              res = res.data;
              authData = res;
              res = res.replace(/\r/g, "");
              res = res.replace(/\n/g, "");

              let body_match = res.match(/<form[\s\S]*?>[\s\S]*?<\/form>/ig);
              if (body_match != null) {
                body_match[0] = body_match[0].replace(/tpl-form-maintext">[\s\D]*<b>/ig, "Sdata\"><b>");
                this.setData({
                  CertMsg: WxParse.wxParse('item', 'html', body_match[0], this, null).nodes,
                  ShowCertMsg: true,
                  CertFormShow: false
                });
                this.waitCert();
              }
              else {
                app.showError('发生了错误');
              }
            }
          }
          catch (err) {
            app.log(err.message);
          }
          finally {
            this.setData({ EnterButLoading: false });
            this.triggerEvent('endload', { from: 'auth', needRefresh: false })
          }
        }).catch(error => {
          app.showError(error == false ? '发生了错误' : ('http' + error.statusCode));
          this.setData({ EnterButLoading: false });
          this.triggerEvent('endload', { from: 'auth', needRefresh: false })
        });
    },
    /**
     * 点击了开始实名认证
     */
    onPhoneCert: function () {
      this.getNewVcode();
      this.setData({ CertFormShow: true });
    },
    /**
     * 修改了国家选择Picker
     */
    bindPickerChange: function (e) {
      this.setData({ Cindex: e.detail.value });
    },
    /**
     * 点击了复制手机号
     */
    onCopyAuthPhoneNumber: function (e) {
      if (this.data.CopyLoading == true) return;
      this.setData({ CopyLoading: true });
      http.request(app.globalData.ApiUrls.GetAuthPhoneURL, { rawdata: authData}).then(res => {
        if (res.data == null || res.data == "error") {
          app.showError('复制失败');
        }
        else {
          wx.setClipboardData({
            data: res.data,
            success: function () {
              app.showSuccess('复制完成');
            },
            fail: function () {
              app.showError('复制失败');
            }
          });
        }
        this.setData({ CopyLoading: false });
      }).catch(error => {
        app.showError(error == false ? '获取失败' : ('http' + error.statusCode));
        this.setData({ CopyLoading: false });
      });
    },

    /**
     * 获取新验证码
     */
    getNewVcode: function () {
      this.setData({
        vCodeLoading: true,
        verifyCodeURL: '../../imgs/loading.gif'
      });
      http.get_verifycode().then(res => {
        this.setData({
          vCodeLoading: false,
          verifyCodeURL: res
        });
      }).catch(err => {
        app.showError('获取验证码错误');
        this.setData({
          vCodeLoading: false,
          verifyCodeURL: err
        });
      });
    },
    /**
     * 获取当前认证状态
     */
    getCertifiedStatus: function () {
      http.request(app.globalData.ApiUrls.CertifiedStatusURL, null).then(res => {
        if (typeof res.data == 'string') {
          let content = res.data.replace(/ /g, '');
          content = content.replace(/\r/g, '');
          content = content.replace(/\n/g, '');
          if (content.indexOf('实名状态') > 0) {
            let certStatus = {
              statusString: '错误',
              phoneNumber: '错误',
              statusBool: false
            };

            let cert_status = content.split('实名状态')[1].match(/<b>[\s\S]*?<\/b>/i);
            if (cert_status != null) {
              certStatus.statusString = cert_status[0].replace(/(<b>)|(<\/b>)/ig, '');
            }
            else {
              certStatus.statusString = '状态错误';
            }

            if (content.indexOf('已绑定手机') > 0) {//手机认证已经成功的
              let phoneContent = content.split('已绑定手机')[1].replace(/(><)/g, "").match(/>[\s\S]*?</i);
              if (phoneContent != null) {
                phoneContent = phoneContent[0].replace(/(>)|(<)/ig, "");
                if (phoneContent != null) {
                  certStatus.phoneNumber = phoneContent;
                }
              }
              certStatus.statusBool = true;
            }
            else if (content.indexOf('绑定手机') > 0) {//未进行手机实名认证
              certStatus.phoneNumber = '未认证';
              certStatus.statusBool = false;
            }

            this.setData({
              CertStatus: certStatus.statusString,
              PhoneStatus: certStatus.phoneNumber,
              CanCert: !certStatus.statusBool
            });
          }
          else {
            app.showError('发生了错误');
          }
        }
        this.triggerEvent('endload', { from: 'auth', needRefresh: false })
      }).catch(error => {
        app.log(error);
        app.showError(error == false ? '发生了错误' : ('http' + error.statusCode));
        this.triggerEvent('endload', { from: 'auth', needRefresh: false })
      });
    },
    /**
     * 等待认证成功
     */
    waitCert: function () {
      timer = setInterval(function () {
        http.request(app.globalData.ApiUrls.MobileCheckURL, null).then(res => {
          console.log(res.data);
          if (res.data == true) {
            clearInterval(timer);
            timer = null;
            app.log('phone auth success');
            this.triggerEvent('endload', { from: 'auth', needRefresh: true })
          }
        });
      }.bind(this), 5000);
    },
    /**
     * 刷新验证码
     */
    onTapVerifyCode: function (e) {
      this.getNewVcode();
    },
  }
})
