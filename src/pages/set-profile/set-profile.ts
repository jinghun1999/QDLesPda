import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { BaseUI } from "../";
import { Api } from "../../providers";

@IonicPage()
@Component({
  selector: 'page-set-profile',
  templateUrl: 'set-profile.html',
})
export class SetProfilePage extends BaseUI {
  list: any[];
  warehouse_choose: any[];
  plant: any;
  warehouse: any;  //仓库
  workshop_shoose: any[] = [];// 存储区
  data: any={ };
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.plant = this.api.plant;
    let loading = super.showLoading(this.loadingCtrl, "正在加载数据...");
    setTimeout(() => {
      this.api.get('system/getPlants', { plant: this.plant, type: -1 }).subscribe((res: any) => {
        loading.dismiss();
        res = this.returnData();
        if (res.successful) {
          this.list = res.data;
          this.warehouse_choose = res.data;
          //this.getConfig();
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
      },
        err => {
          loading.dismiss();
          alert(JSON.stringify(err))
        });
    });
  }

  // getConfig() {
  //   this.storage.get('warehouse').then(res => {
  //     if (res) {
  //       this.warehouse = res;//JSON.parse(res);
  //     }
  //   }).catch(e => console.error(e.toString()));
  // }

  save() {
    this.workshop_shoose = this.list.find((f) => f.value == this.warehouse).children;
    this.storage.set('workshop_shoose', this.workshop_shoose).then((res) => {
    }).catch(() => { });

    this.data.warehouse = this.warehouse;
    this.data.workshop_shoose = this.workshop_shoose;
    this.storage.set('warehouse', this.warehouse).then((res) => {
      this.viewCtrl.dismiss(this.data);
    }).catch(() => { });
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
  returnData() {
    return {
      successful: true,
      code: "200",
      name: "OK",
      message: null,
      data: [
        {
          value: "GA1-A",
          text: "GA1-A(东部总装A线)",
          data1: null,
          data2: null,
          isSelect: false,
          children: [
            {
              value: "GA1-A",
              text: "GA1-A(西部总装A线)",
              data1: null,
              data2: null,
              isSelect: false,
              children: null
            }
          ]
        },
        {
          value: "LOC",
          text: "LOC(物流仓)",
          data1: null,
          data2: null,
          isSelect: false,
          children: [
            {
              value: "CS01",
              text: "CS01(西部总装A线)",
              data1: null,
              data2: null,
              isSelect: false,
              children: null
            },
            {
              value: "DD01",
              text: "DD01(西部总装A线)",
              data1: null,
              data2: null,
              isSelect: false,
              children: null
            },
            {
              value: "GJ01",
              text: "GJ01(西部总装A线)",
              data1: null,
              data2: null,
              isSelect: false,
              children: null
            }
          ]
        },
        {
          value: "RDC",
          text: "RDC(外库)",
          data1: null,
          data2: null,
          isSelect: false,
          children: [
            {
              value: "RDC",
              text: "RDC(西部总装A线)",
              data1: null,
              data2: null,
              isSelect: false,
              children: null
            }
          ]
        }
      ]
    }
  }
}
