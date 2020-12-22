import { Component } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavParams,
  ViewController,
  ToastController,
  NavController
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { Storage } from "@ionic/storage";


@IonicPage()
@Component({
  selector: 'page-set-storage-area',
  templateUrl: 'set-storage-area.html',
})
export class SetStorageAreaPage extends BaseUI {
  list: any[];
  store_area_choose: any[];
  plant: any;
  workshop: any;
  store_area: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private storage: Storage,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public viewCtrl: ViewController,
              public api: Api) {
    super();
    this.workshop = this.navParams.get('workshop');
  }

  ionViewDidLoad() {
     
    this.plant = this.api.plant;
    //let loading = super.showLoading(this.loadingCtrl,"正在加载数据...");
    setTimeout(()=> {
      // 正确的写法 this.api.get('system/getAreas', { plant: this.api.plant,workshop:this.workshop, type: -1 }).subscribe((res: any) => { 
        this.api.get('system/getPlants', {plant: this.plant, type: -1}).subscribe((res: any) => { //测试写法
        if (res.successful) {
          res.data = this.returnS();  //模拟数据
            this.list = res.data;
            this.store_area_choose = res.data;
            this.getConfig();
          } else {
            super.showToast(this.toastCtrl, res.message);
        }
        //loading.dismiss();
        },
        err => {
          //loading.dismiss();
          alert(JSON.stringify(err))
        });
    });
   }

  getConfig() {
    this.storage.get('store_area').then(res => {
      if (res) {
        this.store_area = res;//JSON.parse(res);
      }
    }).catch(e => console.error(e.toString()));
  }
  plantSelect(){

  }

  save(){
    this.storage.set('store_area', this.store_area).then((res)=>{
      this.viewCtrl.dismiss(this.store_area);
    }).catch(() => { });
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
  returnS() { 
    return [
      {
        "value": "TX1",
        "text": "TX1(东部车身存储区)",
        "data1": null,
        "data2": null,
        "children": null
      },
      {
        "value": "LT1",
        "text": "LT1(西部车身存储区)",
        "data1": null,
        "data2": null,
        "children": null
      }
    ]
  }
}

