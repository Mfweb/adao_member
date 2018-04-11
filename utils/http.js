function save_cookie(data)
{
  data = data.replace(" ","");
  data = data.split(";");
  var saved_data = wx.getStorageSync('user_cookie');
  saved_data = JSON.parse(saved_data==''?'{}':saved_data);

  var save_array = Array();
  for(let i = 0;i < data.length;i++)
  {
    var temp_data = data[i].split("=");
    saved_data[temp_data[0]] = temp_data[1];
  }
  wx.setStorageSync('user_cookie', JSON.stringify(saved_data))
}

function get_cookie()
{
  var cookies = wx.getStorageSync('user_cookie');
  cookies = JSON.parse(cookies == '' ? '{}' : cookies);
  console.log(cookies);
  var out_str = '';
  for(let o in cookies)
  {
    out_str += o;
    out_str += '=';
    out_str += cookies[o];
    out_str += ';';
  }
  console.log(out_str);
  return out_str;
}

function api_request(url, data, success, fail)
{
  wx.request({
    url: url,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'HavfunClient-WeChatAPP',
      'X-Requested-With': 'XMLHttpRequest',
      'cookie': get_cookie()
    },
    data: data == null ? {} : data,
    method: 'POST',
    success: function(res){
      if (res.header['Set-Cookie'])
        save_cookie(res.header['Set-Cookie']);
      if(success != null)
        success(res.data);
    },
    fail: function(){
      if(fail != null)
        fail();
    }
  })
}

module.exports = {
  api_request: api_request,
}
