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
  workshop: string;
  username: string;
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
    //this.currentItems = this.items.query();
    //this.gridList = this.currentItems;
    this.storage.get("USER_INFO").then((res) => {
      this.username = res;
    });
    //this.username = this.user._user.username;
    this.version = this.api.version;
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    this.getWorkshop();
  }
  getWorkshop = () => {
    this.storage.get("WORKSHOP").then((res) => {
      if (!res) {
        this.setProfile();
      } else {
        //this.workshop = res;
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
  // ionViewDidEnter(){
  //   document.addEventListener("keydown", this.keydown);
  // }
  // ionViewWillUnload(){
  //   document.removeEventListener("keydown", this.keydown);
  //   alert('remove home')
  // }
  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  setProfile() {
    let addModal = this.modalCtrl.create(
      "SetProfilePage",
      {},
      { enableBackdropDismiss: false, showBackdrop: false }
    );
    addModal.onDidDismiss((item) => {
      this.getWorkshop();
      if (item) {
        //this.items.add(item);
      }
    });
    addModal.present();
  }

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
  returePlans() {
    return [
      {
        "value": "BD1",
        "text": "BD1(东部车身生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "BD2",
        "text": "BD2(西部车身生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA1-C",
        "text": "GA1-C(东部总装C线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA1-D",
        "text": "GA1-D(东部总装D线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA2-B",
        "text": "GA2-B(西部总装B线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA2-C",
        "text": "GA2-C(西部总装C线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LOC1",
        "text": "LOC1(河西基地集配中心)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LOC2",
        "text": "LOC2(河西基地集配中心2)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LTX",
        "text": "LTX(河西基地轮胎线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LTX1",
        "text": "LTX1(轮胎线虚拟车间)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC02",
        "text": "MC02(西总C线线旁缓冲库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC04",
        "text": "MC04(西部总装缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC05",
        "text": "MC05(北库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC07",
        "text": "MC07(东部总装C线缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC08",
        "text": "MC08(轮胎库房（老B线）)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC10",
        "text": "MC10(厂外RDC库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC12",
        "text": "MC12(东总D线缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC13",
        "text": "MC13(东部车身缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC14",
        "text": "MC14(西部库房)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC15",
        "text": "MC15(西部车身缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP01",
        "text": "MP01(河西工业园喷涂车间原材料库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP02",
        "text": "MP02(河西工业园喷涂车间线边库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP03",
        "text": "MP03(河西工业园喷涂车间成品库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "PUL1",
        "text": "PUL1(保险杠生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "WK01",
        "text": "WK01(外库-车身件)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "WPP1",
        "text": "WPP1(涂装成品库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      }];
  }
}
