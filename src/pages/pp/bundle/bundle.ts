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
  selector: 'page-bundle',
  templateUrl: 'bundle.html',
})
export class BundlePage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '请扫描捆包号';   //扫描文本框placeholder属性
  workshop: string; //初始化获取的车间
  keyPressed: any;
  scanCount: number = 0;//记录扫描总数
  errors: any[] = [];
  item: any = {
    bundles: [],
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
        this.cancel();
        break;
      case 113:
        //f2
        this.outStock();
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
  insertError = (msg: string, t:string  = 'e') => {
    this.zone.run(() => {
      this.errors.splice(0, 0, { message: msg, type: t, time: new Date() });
    });
  }
  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.workshop = val;
    });
  }

  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code == '') {
      err = '请扫描捆包号！';
      this.insertError(err);
    }

    if (this.item.bundles.findIndex(p => p.bundleNo === this.code) >= 0) {
      err = `标签${this.code}已扫描过，请扫描其他标签`;
      this.insertError(err);
    }

    if (err.length > 0) {
      this.searchbar.setFocus();
      return false;
    }
    return true;
  }


  //开始扫描
  scan() {
    if (this.checkScanCode()) {
      //扫捆包号
      this.scanSheet();
    }
    else {
      this.resetScan();
    }
  }


  //扫描执行的过程
  scanSheet() {
    this.errors = [];
    this.api.get('PP/GetPanelMaterial', { plant: this.api.plant, workshop: this.workshop, bundle_no: this.code }).subscribe((res: any) => {
      if (res.successful) {
        if (res.data.plant === this.api.plant && res.data.workshop === this.workshop) {
          if (this.item.bundles.findIndex(p => p.bundleNo === this.code) >= 0) {
            this.insertError(`标签${this.code}已扫描过，请扫描其他标签`);
            return;
          }
          let model = res.data;
          this.item.bundles.splice(0, 0, {
            plant: model.plant,
            bundleNo: model.bundleNo,
            weight: model.weight,
            workshop: model.workshop,
            received_time: model.received_time,
            bundleLabel: model.bundleLabel,
            pieces: model.pieces,
            actualReceivePieces: model.actualReceivePieces,
            supplier: model.supplier,
            sapNo: model.sapNo,
            sapOrderNo: model.sapOrderNo
          });
          this.scanCount = this.item.bundles.length;
        }
        else {

        }
        this.resetScan();
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('系统级别错误');
      });
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.actualReceivePieces,
    });
    _m.onDidDismiss(data => {
      if (data) {
        model.actualReceivePieces = data.receive
      }
    });
    _m.present();
  }

  cancel() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '将撤销刚才本次的操作记录，不可恢复。您确认要执行全单撤销操作吗？',
      buttons: [{
        text: '不撤销',
        handler: () => { }
      }, {
        text: '确认撤销',
        handler: () => {
          this.navCtrl.popToRoot();
        }
      }]
    });
    prompt.present();
  }

  //撤销
  // cancel_do() {
  //   this.insertError('正在撤销...', 2);
  //   this.code = '';
  //   this.errors = [];
  //   this.item.bundles = [];
  //   this.insertError("撤销成功");
  //   this.resetScan();
  // }

  //删除
  delete(i) {
    this.item.bundles.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() {
    this.code = '';
    this.searchbar.setFocus();
  }
  //提交
  outStock() {
    if (!this.item.bundles) {
      this.insertError('请先扫描捆包号');
      return;
    };

    if (new Set(this.item.bundles).size !== this.item.bundles.length) {
      this.insertError("提交的数据中存在重复的捆包号，请检查！");
      return;
    };

    // if (this.item.bundles.findIndex(p => p.bundleNo === this.code) >= 0) {
    //   err = `标签${this.code}已扫描过，请扫描其他标签`;
    //   this.insertError(err);
    // }

    this.api.post('PP/PostPanelMaterial', {
      plant: this.api.plant,
      workshop: this.workshop,
      bundle_no: this.code,
      partPanel: this.item.bundles
    }).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功');
        this.item.bundles = [];
      }
      else {
        this.insertError(res.message);
      }
    },
      err => {
        this.insertError('提交失败');
      });

    this.resetScan();
  }

  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }
}
