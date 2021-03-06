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
  warehouse: string; //仓库
  username: string;
  workshop: string;//存储区
  version: string;
  selectLevel: number = 1;
  now_txt: string;
  version_code: number;
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
    this.getMenus();
    this.getWorkshop();
  }
  getWorkshop = () => {
    this.storage.get("workshop").then((res) => {
      if (res === '') { //仓库为空
        //
      }
      else if (res) {
        this.workshop = res;
      } else {
        //this.goSetting();
        this.change();
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
    //请求超时，跳转到登录页
  goLoginPage() { 
    window.localStorage.removeItem('TOKEN');
    this.storage.clear();
    this.navCtrl.push("LoginPage", {});
    this.app.getRootNav().setRoot(
      "LoginPage", {},
      {
        animate: true,
        direction: "forward",
      }
    );
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
    let errMsg = '';
    if (err instanceof TimeoutError) {
      errMsg = '服务器连接超时';
    } else if (err instanceof HttpErrorResponse) {
      errMsg = '网络连接异常';
    } else {
      errMsg = '未知原因，请求失败';
    }
    this.goLoginPage();
    super.showToast(this.toastCtrl, errMsg, "error");
    });
  }
  doUpData() {
    if (this.plt.is('android')) {
      let t = this;
      this.appVersion.getVersionNumber().then(ver => {
        t.api.get('system/getApkUpdate').subscribe((res: any) => {
          //alert(JSON.stringify(res.data))
          if (res.data.version > ver) {
            let dt = {
              current_version: ver,
              version: res.data.version,
              url: res.data.url
            };
            //跳转到升级页面
            t.app.getRootNav().setRoot(
              "UpgradePage", { data: dt },
              {
                animate: true,
                direction: "forward",
              }
            );
          }
        });
      });
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
  //选择仓库
  change() {
    let addModal = this.modalCtrl.create('SetProfilePage', {},);
    addModal.onDidDismiss(ds => {
      if (ds) {
        this.warehouse = ds.warehouse;
        this.setStoeaArea(this.warehouse);
      }
    })
    addModal.present();
  }
  //选择存储区
  setStoeaArea(warehouse) {
    if (!this.warehouse) {
      alert('请先选择仓库');
      return;
    }
    let addModal = this.modalCtrl.create("SetStorageAreaPage", { warehouse: warehouse });
    addModal.onDidDismiss((item) => {
      if (item) {
        this.workshop = item;
      }
    });
    addModal.present();
  }
}
