import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {BaseUI} from "../";
import {Api} from "../../providers";

/**
 * Generated class for the SetProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-set-profile',
  templateUrl: 'set-profile.html',
})
export class SetProfilePage extends BaseUI {
  list: any[];

  //plant_choose: any[];
  workshop_choose: any[];

  //plantid: string;
  plant: any;
  workshop: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private storage: Storage,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public viewCtrl: ViewController,
              public api: Api) {
    super();
  }

   ionViewDidLoad() {
    this.plant = this.api.plant;

    let loading = super.showLoading(this.loadingCtrl,"正在加载数据...");
    setTimeout(()=> {
      this.api.get('system/getPlants', {plant: this.plant, type: -1}).subscribe((res: any) => {
          loading.dismiss();
        if (res.successful) {
          res.data = this.returnS();  //模拟数据
            this.list = res.data;
           
            //this.plant_choose = res.data;
            //this.plant = res.data[0].value;

            this.workshop_choose = res.data;//res.data[0].children;
            //this.workshop = res.data[0].children[0].value;

            this.getConfig();
          } else {
            super.showToast(this.toastCtrl, res.message);
          }
        },
        err => {
          loading.dismiss();
          alert(JSON.stringify(err))
        });
    });
   }

  getConfig() {
    this.storage.get('WORKSHOP').then(res=> {
      if(res) {
        this.workshop = res;//JSON.parse(res);
      }
    }).catch(e=> console.error(e.toString()))
  }

  plantSelect(){

  }

  save(){
    this.storage.set('WORKSHOP', this.workshop).then((res)=>{
      this.viewCtrl.dismiss(this.workshop);
    }).catch(()=>{});
  }
  cancel() {
    this.viewCtrl.dismiss();
  }
  returnS() { 
    return [
      {
        "value": "BD1",
        "text": "BD1(东部车身生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "BD2",
        "text": "BD2(西部车身生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA1-C",
        "text": "GA1-C(东部总装C线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA1-D",
        "text": "GA1-D(东部总装D线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA2-B",
        "text": "GA2-B(西部总装B线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "GA2-C",
        "text": "GA2-C(西部总装C线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LOC1",
        "text": "LOC1(河西基地集配中心)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LOC2",
        "text": "LOC2(河西基地集配中心2)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LTX",
        "text": "LTX(河西基地轮胎线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "LTX1",
        "text": "LTX1(轮胎线虚拟车间)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC02",
        "text": "MC02(西总C线线旁缓冲库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC04",
        "text": "MC04(西部总装缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC05",
        "text": "MC05(北库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC07",
        "text": "MC07(东部总装C线缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC08",
        "text": "MC08(轮胎库房（老B线）)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC10",
        "text": "MC10(厂外RDC库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC12",
        "text": "MC12(东总D线缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC13",
        "text": "MC13(东部车身缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC14",
        "text": "MC14(西部库房)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MC15",
        "text": "MC15(西部车身缓冲区)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP01",
        "text": "MP01(河西工业园喷涂车间原材料库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP02",
        "text": "MP02(河西工业园喷涂车间线边库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "MP03",
        "text": "MP03(河西工业园喷涂车间成品库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "PUL1",
        "text": "PUL1(保险杠生产线)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "WK01",
        "text": "WK01(外库-车身件)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      },
      {
        "value": "WPP1",
        "text": "WPP1(涂装成品库)",
        "data1": null,
        "data2": null,
        "isSelect": false,
        "children": null
      }
    ]
  }
}
