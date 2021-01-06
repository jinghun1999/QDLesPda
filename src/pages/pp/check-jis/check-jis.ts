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
  warehouse_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  scanOrder: number = 0;  //记录扫描的顺序
  plant: string = '';
  workshop: string = '';
  warehouse: string = '';
  show: boolean = false;
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
    this.item = this.returnJIS();
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
    this.storage.get('warehouse').then((val) => {
      this.plant = this.api.plant;
      this.warehouse = val;
    });
    this.storage.get('workshop').then((val) => {      
      this.workshop = val;
    }); 
  }

  //扫描执行的过程
  scan() {
    
    this.JISList.length ? this.jis = this.code : null;
    if (this.item) {
      const scanIndex = this.item.data.findIndex(p => p.vsn == this.code);
      if (scanIndex != this.scanOrder) { 
        this.insertError('匹配不成功');
      }
      this.scanOrder++;
    } else { 
      ///this.api.get();
    }


    this.code = '';
  }
  showErr() { 
    this.show = !this.show;
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
          "vsn": "C557DY0PRGA0000",
          "csn": "5268",
          "color": "珠光白",
          "diaojia": "3511",
          "part": "23626893",
          "count": 45
        },
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
