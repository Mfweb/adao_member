//
//  ViewController.swift
//  xAdao
//
//  Created by やもと咲 on 2018/8/19.
//  Copyright © 2018年 mfweb. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    //MARK - OpenReg
    @IBAction func onOpenReg(_ sender: UIButton) {
        let launchManager = WXLaunchMiniProgramReq()
        launchManager.miniProgramType = WXMiniProgramType.test  //release  preview  test
        launchManager.path = "pages/index/index?mode=reg"
        launchManager.userName = "gh_f8c1b9909e51@app"
        WXApi.send(launchManager)
    }
    
    //MARK - OpenCookie
    @IBAction func onOpenCookie(_ sender: UIButton) {
        let launchManager = WXLaunchMiniProgramReq()
        launchManager.miniProgramType = WXMiniProgramType.test
        launchManager.path = "pages/index/index?mode=cookie"
        launchManager.userName = "gh_f8c1b9909e51@app"
        WXApi.send(launchManager)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}
