import { Component } from '@angular/core';
import {
  IonicPage,
  App,
  LoadingController,
  NavParams,
  ViewController,
  ToastController,
  NavController
} from 'ionic-angular';
import { Api } from '../../providers';
import { BaseUI } from '../baseUI';
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-set-storage-area',
  templateUrl: 'set-storage-area.html',
})
export class SetStorageAreaPage extends BaseUI {
  list: any[];
  workshop_choose: any[];
  plant: any;
  warehouse: any;
  workshop: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public app: App,
    public api: Api) {
    super();
  }
  ionViewDidLoad() {
    this.plant = this.api.plant;
    this.storage.get('warehouse').then((val) => {
      this.warehouse = val;
    });
    let loading = super.showLoading(this.loadingCtrl, "正在加载数据...");
    this.storage.get('workshop_shoose').then(res => {
      if (res === '') { //仓库为空
        //
      } else if (res) {
        this.workshop_choose = res;
      }
    }).catch(e => console.error(e.toString()));
    loading.dismiss();
  }
  ionViewDidEnter(){
    this.storage.get('workshop').then(val => { 
      this.workshop = val;
    });
  }
  save() {    
    this.storage.set('workshop', this.workshop).then((res) => {
      this.viewCtrl.dismiss(this.workshop);
    }).catch(() => { });
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
}

