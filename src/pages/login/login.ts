import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, AlertController } from 'ionic-angular';

import { Api, User } from '../../providers';
import { HomePage, BaseUI } from '../';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage extends BaseUI {
  @ViewChild('userName') usernameInput;
  version: string;
  res: any = {};
  environment: any[] = [];
  workshop: string;
  gender: string = '';
  account: { name: string, password: string } = {
    name: '',
    password: ''
  };

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public api: Api) {
    super();
    this.version = this.api.version;
    this.api.api_host = localStorage.getItem('qd_env');
  }

  ionViewDidLoad() {
    this.setFocus();
    this.environment = [
      {
        id: 1,
        text: "生产环境",
        value: 'http://10.40.248.192/lesapi'
      },
      {
        id: 2,
        text: "测试环境",
        value: 'http://10.1.126.171/qdapi'
      },
      {
        id: 3,
        text: "开发环境",
        value: 'http://localhost:49280'
      }
    ];
    this.api.api_host ? null :this.api.api_host= this.environment[0].value;
  }
  
  doLogin() {
    if (!this.account.name || !this.account.password) {
      super.showToast(this.toastCtrl, '请输入用户名密码');
      this.setFocus();
      return;
    }
    localStorage.setItem('qd_env',this.api.api_host);
    let loading = super.showLoading(this.loadingCtrl, "登录中...");
    this.user.login(this.account).subscribe((resp) => {
      loading.dismiss();
      this.navCtrl.setRoot(HomePage, {}, {
        animate: true,
        direction: 'forward'
      });
    }, (err) => {
      loading.dismiss();
      super.showToast(this.toastCtrl, '登录失败' + err);
    });
  }

  setFocus = () => {
    setTimeout(() => {
      this.usernameInput.setFocus();//为输入框设置焦点
    }, 150);
  }
}