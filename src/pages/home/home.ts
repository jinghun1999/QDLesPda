import { Component } from "@angular/core";
import {
  App,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
  Platform
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Api, Menus, User } from "../../providers";
import { BaseUI } from "../";
import { AppVersion } from '@ionic-native/app-version/ngx';

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage extends BaseUI {
  gridList: any[] = [];
  warehouse: string;
  username: string;
  workshop: string;
  version: string;
  version_code: number;
  data: any = {
    current_version: '',
    version: '',
    url: ''
  };
  url: string;
  constructor(
    public navCtrl: NavController,
    public items: Menus,
    private plt: Platform,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private app: App,
    private user: User,
    public api: Api,
    private appVersion: AppVersion
  ) {
    super();
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    this.version = this.api.version;
  }

  ionViewDidLoad() {
    this.getMenus();
  }
  ionViewDidEnter() {
    this.getWorkshop();
    // if (this.plt.is('android')) {
    //   this.getVersion();
    //   this.appVersion.getVersionCode().then(value => {
    //     if (this.version_code > value) {
    //       this.data.current_version = value;
    //       this.data.version = this.version_code;
    //       this.data.url = this.url;
    //       this.navCtrl.push("UpgradePage", {});//跳转到升级页面
    //     }
    //   })
    // }
    // else {
      
    // }
  }
  getWorkshop = () => {
    this.storage.get("workshop").then((res) => {
      if (!res) {
        this.goSetting();
      } else {
        this.workshop = res;
      }
    });
  };

  openItem(item: any) {
    if (item.link_url) this.navCtrl.push(item.link_url, {});
  }
  getRowListByGridList(size) {
    var rowList = [];
    for (var i = 0; i < this.gridList.length; i += size) {
      rowList.push(this.gridList.slice(i, i + size));
    }
    return rowList;
  }
  goSetting() {
    this.navCtrl.push("SettingsPage", {});
  }
  getVersion() {
    this.api.get('system/getApkUpdate').subscribe((res: any) => {
      if (res.successful) {
        this.version_code = res.data.version;
        this.url = res.data.url;
      }
    });
  }
  getMenus() {
    if (this.warehouse) {
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, "加载中...");
    this.api.get("system/getMenus").subscribe(
      (res: any) => {
        if (res.successful) {
          this.gridList = res.data;
        } else {
          super.showToast(this.toastCtrl, res.message, "error");
        }
        loading.dismiss();
      },
      (err) => {
        super.showToast(this.toastCtrl, "系统错误", "error");
        loading.dismiss();
      }
    );
  }

  logout() {
    this.user.logout().subscribe((re) => {
      setTimeout(() => {
        this.app.getRootNav().setRoot(
          "LoginPage", {},
          {
            animate: true,
            direction: "forward",
          }
        );
      });
    },
      (r) => {
        alert("注销失败");
      }
    );
  }
}
