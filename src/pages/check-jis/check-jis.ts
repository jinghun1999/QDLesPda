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
import { Api } from '../../providers';
import { BaseUI } from '../baseUI';
import { fromEvent } from "rxjs/observable/fromEvent";
import { Storage } from "@ionic/storage";
@IonicPage()
@Component({
  selector: 'page-check-jis',
  templateUrl: 'check-jis.html',
})
export class CheckJisPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描JIS单号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  jis: string = '';
  warehouse_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  plant: string = '';
  workshop: string = '';
  warehouse: string = '';
  scanOrder: number = 0;
  show: boolean = false;
  JISList: any[] = [];
  item: any = {
    jis_no: '',
    rack: '',
    rack_name:'',
    sheet_c: '',
    parts: []
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
    if (!this.item.parts.length) {   //获取jis单
      this.api.get('wm/getJISSheet/' + this.label).subscribe((res: any) => {
        if (res.successful) {
          this.item.jis_no = res.data.jis_no;
          this.item.rack = res.data.rack;
          this.item.rack_name = res.data.rack_name;
          this.item.sheet_c = res.data.sheet_c;
          this.item.parts = res.data.parts;
        }
        else {
          this.insertError(res.message);
        }
      });
    } else {
      this.cheakLabel();
      //const scanIndex = this.item.parts.findIndex(p => p.part_no == this.label);
      const part = this.item.parts[this.scanOrder];
      if (part.csn && part.part_no == '') { //空车,不用校验

      }else if (this.item.parts[this.scanOrder].part_no == this.label) { 
        this.insertError('匹配不成功');
        return;
      };
      this.item.parts[this.scanOrder].saned = true;
      this.scanOrder++;
      if (this.scanOrder == this.item.parts.length) {
        let alert = this.alertCtrl.create({
          title: '提示信息',
          subTitle: '校验完成',
          buttons: [{
              text: '确定',
            handler: () => {
                //更新
                this.reset();
              }
            }]
        })
        alert.present();
      }
    }
    this.setReset();
  }
  showErr() {
    this.show = !this.show;
  }
  reset() {
    this.label = '';
    this.item.jis_no = '';
    this.item.reck = '';
    this.item.sheet_c = '';
    this.scanOrder = 0;
    this.item.parts.length = 0;
  }
  focusInput = () => {
    this.searchbar.setElementClass('bgred', false);
    this.searchbar.setElementClass('bggreen', true);
  };
  blurInput = () => {
    this.searchbar.setElementClass('bggreen', false);
    this.searchbar.setElementClass('bgred', true);
  };

  setReset() {
    this.label = '';
    this.searchbar.setFocus();
  }
  //校验扫描的零件号
  cheakLabel() {
    if (!this.label
      || (this.label.substr(0, 2).toUpperCase() !== 'LN' && this.label.substr(0, 2).toUpperCase() !== 'BP')
      || this.label.length < 19) {
      this.insertError('无效的箱标签，请重新扫描');
      this.searchbar.setFocus();
      return;
    }
    let err = '';
    let prefix = this.label.substr(0, 2).toUpperCase();
    if (prefix === 'LN') {
      if (this.item.parts.findIndex(p => p.label) >= 0) {
        err = '提交前扫描过保险杠小标签，不能再扫描零件包装标签';
      }
    } else if (prefix === 'BP') {
      if (this.item.parts.findIndex(p => !p.label) >= 0) {
        err = '提交前扫描过零件包装标签，不能再扫描保险杠小标签';
      } else if (this.item.parts.findIndex(p => p.label === this.label) >= 0) {
        err = `标签${this.label}已扫描过，请扫描其他标签`;
      }
    }
    if (err.length) {
      this.insertError(err);
      this.searchbar.setFocus();
      return;
    }
    this.label = this.label.substr(12, 8);
  }
}
