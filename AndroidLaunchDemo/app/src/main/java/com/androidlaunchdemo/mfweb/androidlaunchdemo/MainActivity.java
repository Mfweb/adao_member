package com.mfweb.androidlaunchdemo;

import com.tencent.mm.opensdk.modelbiz.WXLaunchMiniProgram;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;


import android.app.Activity;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Toast;


public class MainActivity extends Activity {
    private IWXAPI wxApi;
    /*
    * 微信开放平台APPID需要自己申请，除了在这里设置，还要在WXEntryActivity类中设置
    * */
    private static final String APP_ID = "wxae088b5c050dc89c";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        wxApi = WXAPIFactory.createWXAPI(this, APP_ID);
        wxApi.registerApp(APP_ID);
    }

    /*
    * 拉起注册
    * */
    public void launchReg(android.view.View view) {
        WXLaunchMiniProgram.Req req = new WXLaunchMiniProgram.Req();
        req.userName = "gh_f8c1b9909e51";
        req.path = "pages/index/index?mode=reg";
        req.miniprogramType = WXLaunchMiniProgram.Req.MINIPTOGRAM_TYPE_RELEASE; //release的program在SDK中拼写有误
        wxApi.sendReq(req);
    }
    /*
    * 拉起饼干
    * */
    public void launchCookie(android.view.View view) {
        WXLaunchMiniProgram.Req req = new WXLaunchMiniProgram.Req();
        req.userName = "gh_f8c1b9909e51";
        req.path = "pages/index/index?mode=cookie";
        req.miniprogramType = WXLaunchMiniProgram.Req.MINIPTOGRAM_TYPE_RELEASE; //release的program在SDK中拼写有误
        wxApi.sendReq(req);
    }
}
