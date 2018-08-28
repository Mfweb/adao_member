const http = require('http.js');
var getCookieRunning = false;
var getDetailRunning = false;
const app = getApp();
/**
 * 获取所有拥有的Cookie
 */
function getCookies(callback) {
  if (getCookieRunning) return;
  getCookieRunning = true;

  http.api_request(
    app.globalData.ApiUrls.CookiesListURL,
    null,
    function (res) {
      if (typeof res == 'string' && res.indexOf('饼干列表') > 0) {
        res = res.replace(/ /g, '');
        res = res.replace(/\r/g, '');
        res = res.replace(/\n/g, '');
        let warning = res.match(/<b>\[警告\]<\/b>[\s\S]*?<\/span>/ig);
        if (warning != null) {
          warning = '⚠️ [警告]' + warning[0].replace(/<b>\[警告\]<\/b>/g, '').replace(/<\/span>/g, '');
        }
        let capacity = res.match(/饼干容量<bclass="am-text-primary">[\s\S]*?<\/b>/ig);
        if (capacity != null) {
          capacity = capacity[0].replace(/饼干容量<bclass="am-text-primary">/g, '').replace(/<\/b>/g, '');
        }

        let info = { warning: warning, capacity: capacity};

        let tbody = res.match(/<tbody>[\s\S]*?<\/tbody>/ig);
        if (tbody != null) {
          let tableRoll = tbody[0].match(/<tr>[\s\S]*?<\/tr>/ig);
          if (tableRoll != null) {
            let cookieList = Array();
            for (let i = 0; i < tableRoll.length; i++) {
              let find_td = tableRoll[i].match(/<td>[\s\S]*?<\/td>/ig);
              if (find_td != null) {
                cookieList.push({ id: find_td[1].replace(/(<td>)|(<\/td>)/g, ""), value: find_td[2].replace(/(<td><ahref="\#">)|(<\/a><\/td>)/g, ""), delLoading: false, getLoading: false });
              }
            }
            callback(true, cookieList, info);
          }
          else {
            callback(false, '饼干列表为空', info);
          }
        }
        else {
          callback(false, '获取信息错误', info);
        }
      }
      else if (typeof res == 'object' && res.hasOwnProperty('status')) {
        if (res.status == 0) {
          callback(false, res.info, null);
        }
        else {
          callback(false, '获取饼干错误2', null);
        }
      }
      else {
        callback(false, '获取饼干错误1', null);
      }
      getCookieRunning = false;
    },
    function () {
      callback(false, '网络错误', null);
      getCookieRunning = false;
    }
  );
}

/**
 * 获取Cookie内容
 */
function getCookieDetail(id, callback) {
  if (getDetailRunning)return;
  getDetailRunning = true;

  http.api_request(
    app.globalData.ApiUrls.CookieGetDetailURL + id + ".html",
    null,
    function (res, header) {
      if (header !== null && header !== undefined && header['Set-Cookie'] != null && header['Set-Cookie'] != undefined && typeof header['Set-Cookie'] == 'string') {
        var cookieAll = header['Set-Cookie'];
        if (cookieAll.indexOf('userhash=') >= 0) {
          var cookieDetail = cookieAll.split(';');
          for (let i = 0; i < cookieDetail.length; i++) {
            if (cookieDetail[i].indexOf('userhash=') >= 0) {
              callback(true, cookieDetail[i].replace(/userhash=/ig, ''));
              getDetailRunning = false;
              return;
            }
          }
        }
      }
      callback(false, '获取错误');
      getDetailRunning = false;
    },
    function () {
      callback(false, '网络错误');
      getDetailRunning = false;
  });
}

module.exports = {
  getCookies: getCookies,
  getCookieDetail: getCookieDetail
}
