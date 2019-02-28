import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams, Searchbar,
  ToastController
} from 'ionic-angular';
import {BaseUI} from '../baseUI';
import {Api} from '../../providers';
import {Storage} from "@ionic/storage";
import {INT_TYPE} from "@angular/compiler/src/output/output_ast";

@IonicPage()
@Component({
  selector: 'page-OutJis',
  templateUrl: 'out-jis.html',
})
export class OutJisPage extends BaseUI {
  @ViewChild(Searchbar) searchbar: Searchbar;

  label: string = '';                      //记录扫描编号
  barTextHolderText: string = '请扫描包装标签';   //扫描文本框placeholder属性
  workshop_list: any[] = [];
  item: any = {
    plant: '',                            //工厂
    workshop: '',                         //车间
    target: '',                            //去向车间
    parts: [],                            //出库零件列表
  };

  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public api: Api,
              public modalCtrl: ModalController,
              public storage: Storage) {
    super();
  }

  ionViewDidLoad() {
    this.storage.get('WORKSHOP').then((val) => {
      this.item.plant = this.api.plant;
      this.item.workshop = val;
      this.getWorkshops();
    });
  }

  private getWorkshops() {
    let loading = super.showLoading(this.loadingCtrl, '加载中...');
    this.api.get('system/getPlants', {plant: this.api.plant}).subscribe((res: any) => {
        loading.dismiss();
        if (res.successful) {
          this.workshop_list = res.data;
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
      },
      err => {
        loading.dismiss();
        alert(JSON.stringify(err))
      });
  }
  /*
    //扫描
    scan() {
      if (this.checkScanCode()) {
        //扫箱
        this.scanBox();
      } else {
        this.label = '';   //置空扫描框
      }
    }

    //校验扫描

    checkScanCode() {
      let err = '';
      if (this.label == '') {
        err = '请扫描包装标签！';
      } else {
        let prefix = this.label.substr(0, 2).toUpperCase();

        if (prefix != 'LN') {
          err = '无效的扫描，请重试！';
        } else if (prefix == 'LN' && this.label.length != 24) {
          err = '无效的扫描，请重试！';
        }
      }

      if (err.length > 0) {
        super.showToast(this.toastCtrl, err);
        this.label = '';
        this.searchbar.setFocus();
        return false;
      }
      return true;
    }*/

  //扫箱
  scanBox() {
    if (!this.label || this.label.length != 24 || this.label.substr(0, 2).toUpperCase() != 'LN') {
      super.showToast(this.toastCtrl, '无效的箱标签，请重新扫描');
      this.reload();
      return;
    }

    let _supplier_number = this.label.substr(2, 9).replace(/(^0*)/, '');
    let _part_num = this.label.substr(11, 8).replace(/(^0*)/, '');

    let i = this.item.parts.findIndex(p => p.part_no === _part_num && p.supplier_id === _supplier_number);
    if (i >= 0) {

      let tmpPart=this.item.parts[i];
      let requireBoxes=tmpPart.require_boxes+1;
      let requireParts=tmpPart.require_parts+tmpPart.std_qty;

      if(requireBoxes>tmpPart.current_boxes){
        super.showToast(this.toastCtrl, '零件达到最大箱数，不能继续扫箱！');
        this.refreshDataModal();
        return;
      }
      if(requireParts>tmpPart.current_parts){
        super.showToast(this.toastCtrl, '零件达到最大件数，不能继续扫箱！');
        this.refreshDataModal();
        return;
      }
      tmpPart.require_boxes=requireBoxes;
      tmpPart.require_parts=requireParts;

      this.label = '';
      this.searchbar.setFocus();
      return;
    }
    else {
      //合法标签
      let loading = super.showLoading(this.loadingCtrl, '加载中...');
      this.api.get('wm/getPartByLN', {
        plant: this.item.plant,
        workshop: this.item.workshop,
        ln: this.label
      }).subscribe((res: any) => {
          if (res.successful) {
            let pts = res.data;
            if (pts.length > 0) {
              this.item.parts.push({
                plant: pts[0].plant,
                workshop: pts[0].workshop,
                part_no: pts[0].part_no,
                part_name: pts[0].part_name,
                supplier_id: pts[0].supplier_id,
                supplier_name: pts[0].supplier_name,
                dloc: pts[0].dloc,
                unit: pts[0].unit,
                std_qty: pts[0].pack_std_qty,
                current_boxes: pts[0].boxes,
                current_parts: pts[0].parts,
                require_boxes: pts[0].require_boxes,
                require_parts: pts[0].require_parts,
              });
              super.showToast(this.toastCtrl, '已添加零件' + pts[0].part_name);
              this.label = '';
            }
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
          loading.dismiss();
          this.reload();
        },
        (error) => {
          alert('系统错误,' + error);
          loading.dismiss();
          this.reload();
        });
    }
  }

  //手工调用，重新加载数据模型
  refreshDataModal() {
    setTimeout(() => {
      this.label = '';
      this.searchbar.setFocus();
    }, 1000);
  }


  //非标跳转Modal页
  changeQty(part) {
    let _m = this.modalCtrl.create('UnstandPage', {
      boxes: part.require_boxes,
      parts: part.require_parts,
      std_qty: part.std_qty,
      max_parts: part.current_parts,
    });
    _m.onDidDismiss(data => {
      if (data) {
        part.require_boxes = data.boxes;
        part.require_parts = data.parts;
      }
      this.reload();
    });
    _m.present();
  }

  //出库
  jisOutStock() {
    let err = '';
    if (!this.item.parts.length) {
      err += '请添加出库的零件';
    }
    if (err.length) {
      super.showToast(this.toastCtrl, err);
      this.reload();
      return;
    }
    let loading = super.showLoading(this.loadingCtrl, '正在提交...');
    this.api.post('wm/postJisOutStock', this.item).subscribe((res: any) => {
        if (res.successful) {
          this.item.trans_code = '';
          this.item.parts = [];
          super.showToast(this.toastCtrl, '提交成功');
        } else {
          super.showToast(this.toastCtrl, res.message);
        }
        loading.dismiss();
        this.reload();
      },
      (error) => {
        alert('系统错误,' + error);
        loading.dismiss();
        this.reload();
      });
  }

  cancel() {
    if (this.navCtrl.canGoBack())
      this.navCtrl.pop();
  }

  reload() {
    this.label = '';
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 500);
  }
}
