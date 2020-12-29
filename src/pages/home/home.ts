import { Component } from "@angular/core";
import {
  App,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Api, Menus, User } from "../../providers";
import { BaseUI } from "../";
//import { l } from "@angular/core/src/render3";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage extends BaseUI {
  //currentItems: Menu[];
  //gridList: Menu[];
  gridList: any[] = [];
  warehouse: string;
  username: string;
  workshop: string;
  version: string;

  constructor(
    public navCtrl: NavController,
    public items: Menus,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private storage: Storage,
    private app: App,
    private user: User,
    public api: Api
  ) {
    super();
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    this.version = this.api.version;
  }

  ionViewDidLoad() {
    this.getWarehouse();
  }
  getWarehouse = () => {
    this.storage.get("warehouse").then((res) => {
      if (!res) {
        this.setProfile();
      } else {
        //this.warehouse = res;
      }
    });

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
  };

  setProfile() {
    let addModal = this.modalCtrl.create(
      "SetProfilePage",
      {},
      { enableBackdropDismiss: false, showBackdrop: false }
    );
    addModal.onDidDismiss((item) => {
      if (item) {
        //this.setStoeaArea(item.workshop_shoose);
      }
    });
    addModal.present();
  }

  // setStoeaArea(warehouse) {
  //   let addModal = this.modalCtrl.create("SetStorageAreaPage", { warehouse: warehouse });
  //   addModal.onDidDismiss((item) => {
  //     if (item) {
  //       this.workshop = item;
  //       this.getWarehouse();
  //     }
  //   });
  //   addModal.present();
  // }
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
