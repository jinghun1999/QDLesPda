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
import { AppVersion } from '@ionic-native/app-version';

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
  constructor(
    public navCtrl: NavController,
    public items: Menus,
    private appVersion: AppVersion,
    private plt: Platform,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private app: App,
    private user: User,
    public api: Api,
  ) {
    super();
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    this.version = this.api.version;
  }

  ionViewDidLoad() {
    this.doUpData();
    this.getWorkshop();
    this.getMenus();
  }
  getWorkshop = () => {
    this.storage.get("workshop").then((res) => {
      
      if (res === '') { //仓库为空
        //
      }
      else if (res) {
        this.workshop = res;
      } else {
        this.goSetting();
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
  getMenus() {
    let loading = super.showLoading(this.loadingCtrl, "加载中...");
    this.api.get("system/getMenus").subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        this.gridList = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message, "error");
      }
    }, (err) => {
      loading.dismiss();
      super.showToast(this.toastCtrl, "系统错误", "error");
    });
  }
  doUpData() {
    if (this.plt.is('android')) {
      this.api.get('system/getApkUpdate').subscribe((res: any) => {
        if (res.successful) {
          this.appVersion.getVersionNumber().then(value => {
            if (res.data.version > value) {
              this.data.current_version = value;
              this.data.version = res.data.version;
              this.data.url = res.data.url;
              this.navCtrl.push("UpgradePage", { data: this.data });//跳转到升级页面
            }
          });
        }
        else {
          console.log(res.message);
        }
      })
    }
  };
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
