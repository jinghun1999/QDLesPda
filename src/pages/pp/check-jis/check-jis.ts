import { Component, NgZone, ViewChild } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavParams,
  ToastController,
  NavController,
  AlertController,
  ModalController,
  Searchbar
} from 'ionic-angular';
import { Api } from '../../../providers';
import { BaseUI } from '../../baseUI';
import { fromEvent } from "rxjs/observable/fromEvent";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-check-jis',
  templateUrl: 'check-jis.html',
})
export class CheckJisPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描JIS单号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  jis: string = '';
  workshop_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  plant: string = '';
  store_area: string = '';
  workshop: string = '';
  JISList: any[] = [];
  item: any = {
    JIS: '',
    orderBy: '',
    boxCode: '',
    data: []
  };
  constructor(public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public api: Api,
    private zone: NgZone,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
    super();
  }

  keyDown(event) {
    switch (event.keyCode) {
      case 112:
        //f1
        this.reset();
        break;
      case 113:
        //f2
        break;
    }
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.addkey();
      this.searchbar.setFocus();
    });
  }
  ionViewWillUnload() {
    this.removekey();
  }
  addkey = () => {
    this.keyPressed = fromEvent(document, 'keydown').subscribe(event => {
      this.keyDown(event);
    });
  }
  removekey = () => {
    this.keyPressed.unsubscribe();
  }
  insertError = (msg: string, t: string = 'e') => {
    this.zone.run(() => {
      this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.plant = this.api.plant;
      this.workshop = val;
    });
    this.storage.get('store_area').then((val) => { 
      console.log(val);
      this.store_area = val;
    });    
  }

  //扫描执行的过程
  scan() {
    this.item = this.returnJIS();

    this.JISList.length ? this.jis = this.code : null;

    this.code = '';
  }
  reset() {
    this.insertError('正在重置', 'i');
    this.code = '';
    this.item.JIS = '';
    this.item.boxCode = '';
    this.item.orderBy = '';
    this.item.data = [];
    this.insertError('重置成功', 's');
  }
  focusInput = () => {
    this.searchbar.setElementClass('bg-red', false);
    this.searchbar.setElementClass('bg-green', true);
  };
  blurInput = () => {
    this.searchbar.setElementClass('bg-green', false);
    this.searchbar.setElementClass('bg-red', true);
  };
  returnJIS() {
    let res = {
      "JIS": "JS1000GA1-C8310288WA9023",
      "boxCode": "ZL",
      "orderBy": "ABS模板",
      "data": [
        {
          "vsn": "C557DY0PRGA0001",
          "csn": "5268",
          "color": "珠光白",
          "diaojia": "3511",
          "part": "23626893",
          "count": 45
        },
        {
          "vsn": "C557DY0PRGA0002",
          "csn": "5268",
          "color": "珠光白",
          "part": "23626893",
          "diaojia": "3511",
          "count": 45
        },
        {
          "vsn": "C557DY0PRGA0003",
          "csn": "5268",
          "color": "珠光白",
          "part": "23626893",
          "diaojia": "3511",
          "count": 45
        },
        {
          "vsn": "C557DY0PRGA0004",
          "csn": "5268",
          "part": "23626893",
          "color": "珠光白",
          "diaojia": "3511",
          "count": 45
        },
        {
          "vsn": "C557DY0PRGA0005",
          "csn": "5268",
          "part": "23626893",
          "color": "珠光白",
          "diaojia": "3511",
          "count": 45
        },
        {
          
          "vsn": "C557DY0PRGA0006",
          "csn": "5268",
          "part": "23626893",
          "color": "珠光白",
          "diaojia": "3511",
          "count": 45
        },
        {
          "vsn": "C557DY0PRGA0007",
          "csn": "5268",
          "part": "23626893",
          "color": "珠光白",
          "diaojia": "3511",
          "count": 45
        }]
    };
    return res;
  }
}
