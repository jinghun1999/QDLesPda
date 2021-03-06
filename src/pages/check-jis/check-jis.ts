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
  warehouse_list: any[] = [];//加载获取的的车间列表
  errors: any[] = [];
  plant: string = '';
  isEnd: boolean = false;
  workshop: string = '';
  warehouse: string = '';
  scanOrder: number = 0; //扫描的个数
  show: boolean = false;
  item: any = {
    jis_no: '',
    rack: '',
    rack_name: '',
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
    if (!this.label) {
      this.insertError('无效的箱标签，请重新扫描');
      this.setReset();
      return;
    }
    if (!this.item.jis_no.length) {   //获取jis单
      if (!this.label.startsWith('JS')) {
        this.insertError('请扫描正确的jis单号');
        return;
      }

      this.api.get('wm/getJISSheet/' + this.label).subscribe((res: any) => {
        if (res.successful) {
          this.item.jis_no = res.data.jis_no;
          this.item.rack = res.data.rack;
          this.item.rack_name = res.data.rack_name;
          this.item.sheet_c = res.data.sheet_c;
          this.item.parts =  res.data.parts;
          //扫描零件之前，判断开头的是否为空白车
          for (let i = 0; i < this.item.parts.length; i++) {
            if (this.item.parts[i].part_no == '') {
              this.item.parts[i].saned = true;
              this.scanOrder++;
            }
            else {
              break;
            }
          }
          //当前jis单为空白单
          if (this.scanOrder == this.item.parts.length) {
            this.isEmptyOrder();
            return;
          }
          this.item.parts[this.scanOrder].san_ing = true;//下一个要扫描的零件
        }
        else {
          this.insertError(res.message);
        }
      });
    } else {
      let err = '';
      if ((this.label.substr(0, 2).toUpperCase() !== 'QD' && this.label.substr(0, 2).toUpperCase() !== 'BP')
        || this.label.length < 19) {
        err = '无效的箱标签，请重新扫描';
      }

      let prefix = this.label.substr(0, 2).toUpperCase();
      if (prefix === 'QD') {
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
        this.setReset();
        this.searchbar.setFocus();
        return;
      }
      this.label = this.label.substr(11, 8);
      let part = this.item.parts[this.scanOrder];
      if (part.part_no == '') { //空车,不用校验
      }
      else if (part.part_no != this.label) {
        this.insertError('匹配不成功');
        this.setReset();
        return;
      }
      else {
        this.insertError('匹配成功');
      };

      part.saned = true; //标记为已扫描
      part.san_ing = false; 
      part.scanDate = this.getDate(new Date());
      this.scanOrder++;

      //判断当前零件后面的是否为空白车,是的话直接跳过
      for (let i = this.scanOrder; i < this.item.parts.length; i++) {
        if (this.item.parts[i].part_no == '') {
          this.item.parts[i].saned = true;
          this.scanOrder++;
        }
        else {
          break;
        }
      }

      //下一个要扫描零件
      if (this.scanOrder < this.item.parts.length) {
        for (let i = this.scanOrder; i >= 0; i--) {
          this.item.parts[i].san_ing = false;
        }
        this.item.parts[this.scanOrder].san_ing = true;
      }

      //扫描完毕
      if (this.scanOrder == this.item.parts.length) {
        let alert = this.alertCtrl.create({
          title: '提示信息',
          subTitle: '校验完成',
          buttons: [{
            text: '确定',
            handler: () => {
              //this.upJIS(this.item.jis_no);
            }
          }]
        })
        alert.present().then(res => { 
          this.upJIS(this.item.jis_no);
        });
      }
    }
    this.setReset();
  }
  showErr() {
    this.show = !this.show;
  }
  getDate(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  }
  confimReset() {
    let alert = this.alertCtrl.create({
      title: '警告信息',
      subTitle: '确认重置吗？已扫描的零件将会无效，数据无法恢复',
      buttons: [{
        text: '确定',
        handler: () => {
          this.reset();
        }
      }, {
        text: '取消',
        handler: () => {

        }
      }]
    })
    alert.present();
  }
  reset() {
    this.label = '';
    this.item.jis_no = '';
    this.item.rack = '';
    this.item.rack_name = '';
    this.item.sheet_c = '';
    this.scanOrder = 0;
    this.item.parts.length = 0;
  }
  focusInput = () => { this.searchbar.setElementClass('bg-red', false); this.searchbar.setElementClass('bg-green', true); }
  blurInput = () => { this.searchbar.setElementClass('bg-green', false); this.searchbar.setElementClass('bg-red', true); }

  setReset() {
    this.label = '';
    this.searchbar.setFocus();
  }
  //空白单据
  isEmptyOrder() { 
    let alert = this.alertCtrl.create({
      title: '提示信息',
      subTitle: '此单是空白单！',
      buttons: [{
        text: '确定',
        handler: () => {
          //更新
          this.api.post('wm/postJisScaned/' + this.item.jis_no, {}).subscribe((res: any) => {
            if (res.successful) {
              this.insertError('已更新', 's');
              this.reset();
            }
            else {
              this.insertError(res.message);
              return;
            }
          });
          this.reset();
        }
      }]
    })
    alert.present();
  }
  //检验完成，更新jis单据
  upJIS(jis_no) { 
    this.api.post('wm/postJisScaned/' + jis_no, {}).subscribe((res: any) => {
      if (res.successful) {
        this.insertError('已更新', 's');
        this.reset();
      }
      else {
        this.insertError(res.message);
        return;
      }
    });
  }
}
