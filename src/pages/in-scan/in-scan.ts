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
  selector: 'page-in-scan',
  templateUrl: 'in-scan.html',
})
export class InScanPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  code: string = '';                      //记录扫描编号
  barTextHolderText: string = '扫描零件号，光标在此处';   //扫描文本框placeholder属性
  keyPressed: any;
  workshop_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  show: boolean = false;
  item: any[] = [];
  sheet_list: any[] = [];
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
        this.save();
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


  //校验扫描
  checkScanCode() {
    let err = '';
    if (this.code == '') {
      err = '请扫描零件号！';
      this.insertError(err);
    }

    if (this.item.findIndex(p => p.boxLabel === this.code) >= 0) {
      err = `零件${this.code}已扫描过，请扫描其他标签`;
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
      //扫零件号
      this.scanSheet();
    }
    else {
      this.resetScan();
    }
  }
  //扫描执行的过程
  scanSheet() {
    this.api.get('wm/getInboundSheet/' + this.code).subscribe((res: any) => {
      if (res.successful) {
        let model = res.data;
        if (this.item.findIndex(p => p.sheet_no === model.sheet_no) >= 0) {
          this.insertError(`零件${model.sheet_no}已扫描过，请扫描其他标签`);
          return;
        }
        this.item.push(res.data);
      }
      else {
        this.insertError(res.message,);
      }
    },
      error => {
        this.insertError('扫描失败');
      });
    this.resetScan();
  }

  //非标跳转Modal页
  changeQty(model) {
    let _m = this.modalCtrl.create('ChangePiecesPage', {
      max_parts: model.currentParts,
    });
    _m.onDidDismiss(data => {
      if (data) {
        model.packingQty - data.receive > 0 ? model.currentParts = data.receive : this.insertError('数量不能大于包装数');
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
          this.cancel_do();
        }
      }]
    });
    prompt.present();
  }

  //撤销
  cancel_do() {
    this.insertError('正在撤销...', 'i');
    this.code = '';
    this.item.length = 0;
    this.sheet_list.length = 0;

    this.insertError("撤销成功", 's');
  }

  //删除
  delete(i) {
    this.item.splice(i, 1);
  }
  //手工调用，重新加载数据模型
  resetScan() {
    setTimeout(() => {
      this.code = '';
      this.searchbar.setFocus();
    });
  }
  //确认提交
  showConfirm() {
    let prompt = this.alertCtrl.create({
      title: '操作提醒',
      message: '是否确定要提交？',
      buttons: [{
        text: '取消',
        handler: () => {
        }
      }, {
        text: '确定',
        handler: () => {          
            this.save();          
        }
      }]
    });
    prompt.present();
  }
  //提交
  save() {
    if (this.item.length == 0) {
      this.insertError('请先扫描零件号', 'i');
      return;
    };

    if (new Set(this.item).size !== this.item.length) {
      this.insertError("明细列表存在重复的零件号，请检查！", 'i');
      return;
    };
    let loading = super.showLoading(this.loadingCtrl, '提交中...');
    this.sheet_list.length = 0;
    for (let item of this.item) { 
      this.sheet_list.push(item.sheet_no);
    }
    this.api.post('wm/postArrived', this.sheet_list).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('提交成功', 's');
        this.item.length = 0;
        this.sheet_list.length = 0;
      }
      else {
        this.insertError('提交失败,' + res.message);
      }
      loading.dismiss();
    },
      error => {
        this.insertError('提交失败,' + error);
        loading.dismiss();
      });
    this.resetScan();
  }
  showErr() {
    this.show = !this.show;
  }
  focusInput = () => {
    this.searchbar.setElementClass('bg-red', false);
    this.searchbar.setElementClass('bg-green', true);
  };
  blurInput = () => {
    this.searchbar.setElementClass('bg-green', false);
    this.searchbar.setElementClass('bg-red', true);
  };
}
