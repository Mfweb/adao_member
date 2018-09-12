//
//  AppDelegate.swift
//  xAdao
//
//  Created by やもと咲 on 2018/8/19.
//  Copyright © 2018年 mfweb. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WXApiDelegate {

    var window: UIWindow?


    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        //微信开放平台AppID（不是小程序的AppID），除了在这设置，还要在info-URL Types 里设置
        //请在微信开放平台申请自己的AppID，审核通过后在微信开放平台应用的 关联小程序信息 中 输入A岛小程序的AppID绑定A岛小程序，A岛小程序的AppID是 wx0066e3ac88fdccb2
        //请注意，小程序1.5.9或以上版本支持返回Cookie
        let registerStatus = WXApi.registerApp("wxae088b5c050dc89c")
        print("registerStatus:\(registerStatus)")
        return true
    }
    
    //openURL
    func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
        return WXApi.handleOpen(url, delegate: self)
    }
    //微信API回调
    func onResp(_ resp: BaseResp!) {
        var showText: String
        if resp.isKind(of: WXLaunchMiniProgramResp.self) {
            let miniProgramResp = resp as! WXLaunchMiniProgramResp
            showText = "Error Code:\(miniProgramResp.errCode)\r\nextMsg:\(miniProgramResp.extMsg)"
        }
        else{
            showText = "type error"
        }
        
        let alert = UIAlertController(title: "Callback", message: showText, preferredStyle: .alert)
        let ok = UIAlertAction(title: "OK", style: .default)
        alert.addAction(ok)
        UIApplication.shared.keyWindow?.rootViewController?.present(alert, animated: true, completion: nil)
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

