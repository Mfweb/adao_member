const http = require('./http.js');
const Promise = require('./es6-promise.js');
const app = getApp();
/**
 * 获取所有拥有的Cookie
 */
function getCookies() {
    return new Promise(function (resolve, reject) {
        http.request(app.globalData.ApiUrls.CookiesListURL, null).then(res => {
            if (!res.data) {
                reject({ message: '服务器错误' });
                return;
            }
            if (typeof res.data == 'string' && res.data.indexOf('饼干列表') > 0) {
                let content = res.data.replace(/\r/g, '');
                content = content.replace(/\n/g, '');

                let info = {
                    warning: null,
                    capacity: null,
                    userIco: null
                };
                info.userIco = content.match(/tpl-header-list-user-ico">\s*<img\s*src="[\s\S]*?"><\/span>/ig);
                if (info.userIco != null) {
                    info.userIco = info.userIco[0].replace(/tpl-header-list-user-ico">\s*<img\s*src="/g, '').replace(/"><\/span>/g, '');
                }

                info.warning = content.match(/<b>\[警告\]<\/b>[\s\S]*?<\/span>/ig);
                if (info.warning != null) {
                    info.warning = '⚠️ [警告]' + info.warning[0].replace(/<b>\[警告\]<\/b>/g, '').replace(/<\/span>/g, '').replace(/<\/?[^>]*>/g, '').replace('(点我)', '');
                }

                info.capacity = content.match(/饼干容量<b class="am-text-primary">[\s\S]*?<\/b>/ig);
                if (info.capacity != null) {
                    info.capacity = info.capacity[0].replace(/饼干容量<b class="am-text-primary">/g, '').replace(/<\/b>/g, '');
                }

                let tbody = content.match(/<tbody>[\s\S]*?<\/tbody>/ig);
                if (tbody != null) {
                    let tableRoll = tbody[0].match(/<tr>[\s\S]*?<\/tr>/ig);
                    if (tableRoll != null) {
                        let cookieList = Array();
                        for (let i = 0; i < tableRoll.length; i++) {
                            let find_td = tableRoll[i].match(/<td>[\s\S]*?<\/td>/ig);
                            if (find_td != null) {
                                cookieList.push({ id: find_td[1].replace(/(<td>)|(<\/td>)/g, ""), value: find_td[2].replace(/(<td><a href="\#">)|(<\/a><\/td>)/g, ""), delLoading: false, getLoading: false });
                            }
                        }
                        console.log(info);
                        resolve({ cookies: cookieList, info: info });
                    }
                    else {
                        resolve({ cookies: [], info: info });
                    }
                }
                else {
                    reject({ message: '获取信息错误' });
                }
            }
            else if (typeof res.data == 'object' && res.data.hasOwnProperty('status')) {
                if (res.data.status == 0) {
                    reject({ message: res.data.info });
                }
                else {
                    reject({ message: '获取饼干错误2' });
                }
            }
            else {
                reject({ message: '获取饼干错误1' });
            }
        }).catch(error => {
            reject({ message: error == false ? '网络错误' : ('http' + error.statusCode) });
        });
    });
}

/**
 * 获取Cookie内容
 */
function getCookieDetail(id) {
    return new Promise(function (resolve, reject) {
        http.request(app.globalData.ApiUrls.CookieGetDetailURL + id + ".html", null).then(res => {
            if (res && res.header && res.header['Set-Cookie']) {
                let cookieAll = res.header['Set-Cookie'];
                if (cookieAll.indexOf('userhash=') >= 0) {
                    let cookieDetail = cookieAll.split(';');
                    for (let i = 0; i < cookieDetail.length; i++) {
                        if (cookieDetail[i].indexOf('userhash=') >= 0) {
                            resolve(cookieDetail[i].replace(/userhash=/ig, ''));
                            return;
                        }
                    }
                }
            }
            reject('获取错误');
        }).catch(error => {
            reject(error == false ? '网络错误' : ('http' + error.statusCode));
        });
    });
}

/**
 * 删除指定饼干
 */
function deleteCookie(id, vcode) {
    return new Promise(function (resolve, reject) {
        http.request(app.globalData.ApiUrls.CookieDeleteURL + id + ".html", { verify: vcode }).then(res => {
            if (res.data.status == 1) {
                resolve();
            }
            else {
                reject(res.data.info);
            }
        }).catch(error => {
            reject(error == false ? '发生了错误' : ('http' + error.statusCode));
        });
    });
}

/**
 * 获取新饼干
 */
function getNewCookie(vcode) {
    return new Promise(function (resolve, reject) {
        http.request(app.globalData.ApiUrls.CookieGetNewURL, { verify: vcode }).then(res => {
            if (res.data.status == 1) {
                resolve();
            }
            else {
                reject(res.data.info);
            }
        }).catch(error => {
            reject(error == false ? '发生了错误' : ('http' + error.statusCode));
        });
    });
}

module.exports = {
    getCookies,
    getCookieDetail,
    deleteCookie,
    getNewCookie
}
