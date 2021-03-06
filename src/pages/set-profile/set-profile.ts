import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, ToastController, ModalController, ViewController } from 'ionic-angular';
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
  workshop: any; //存储区
  workshop_shoose: any[] = [];// 存储区列表
  data: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public api: Api) {
    super();
  }

  ionViewDidLoad() {
    this.plant = this.api.plant;
    let loading = super.showLoading(this.loadingCtrl, "正在加载数据...");
    this.api.get('system/getPlants', { plant: this.plant, type: -1 }).subscribe((res: any) => {
      loading.dismiss();
      if (res.successful) {
        this.list = res.data;
        this.warehouse_choose = res.data;
      } else {
        super.showToast(this.toastCtrl, res.message);
      }
    },
      err => {
        loading.dismiss();
        alert("加载失败")
      });
  }
  ionViewDidEnter() {
    this.storage.get('warehouse').then(val => {
      this.warehouse = val;
    });
  }
  save() {
    if (this.list && this.list.length) {
    } else {
      this.storage.set('warehouse', ''); //设置存储区为''
      this.storage.set('workshop', '');//设置仓库为''
      this.viewCtrl.dismiss();
      return;
    }

    this.data.warehouse = this.warehouse;
    this.storage.set('warehouse', this.warehouse).then((res) => {
      //this.viewCtrl.dismiss(this.data);
    }).catch(() => { });

    const workshops = this.list.find((f) => f.value == this.warehouse);
    if (!workshops.children) {  //当前仓库没有存储区
      super.showToast(this.toastCtrl, '当前仓库没有存储区');
      this.viewCtrl.dismiss();
      return;
    }
    this.workshop_shoose = workshops ? workshops.children : '';
    this.storage.set('workshop_shoose', this.workshop_shoose).then((res) => {
    }).catch(() => { });
    this.data.workshop_shoose = this.workshop_shoose;
    this.viewCtrl.dismiss(this.data);
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
}
