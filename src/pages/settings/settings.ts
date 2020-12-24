import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, App, ModalController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {Settings, User, Api} from '../../providers';
import { BaseUI } from '../'

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage extends BaseUI {
  options: any;
  data: any = {};
  constructor(
    private app: App,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public settings: Settings,
    public api: Api,
    public navParams: NavParams,
    public storage: Storage,
    public user: User) {
    super();
  }

  ionViewDidLoad() {
    this.data.plant = this.api.plant;
    this.storage.get('warehouse').then((val) => {
      this.data.warehouse = val;
    });
    this.storage.get('workshop').then((val) => {
      this.data.workshop = val;
    });
  }

  ionViewWillEnter() {

  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }
  change(){
    let addModal = this.modalCtrl.create('SetProfilePage',{}, );
    addModal.onDidDismiss(ds => {
      if (ds) { 
        this.data.warehouse = ds;
        this.changeArea(ds);
      }
    })
    addModal.present();
  }
  changeArea(warehouse) {
    let addModal = this.modalCtrl.create('SetStorageAreaPage',{warehouse:warehouse} );
    addModal.onDidDismiss(ds => {
      if (ds) {       
        this.data.workshop = ds;
      }
    })
    addModal.present();
  }
  logout() {
    this.user.logout().subscribe((re) => {
      setTimeout(() => {
        this.app.getRootNav().setRoot('LoginPage', {}, {
          animate: true,
          direction: 'forward'
        });
      });
    }, (r) => {
      alert('注销失败');
    });
  }
}
