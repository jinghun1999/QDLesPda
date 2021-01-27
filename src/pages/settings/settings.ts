import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Settings, User, Api } from '../../providers';
import { BaseUI } from '../'

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage extends BaseUI {
  options: any;
  workshop: string = '';
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
  ionViewDidEnter() {
    this.storage.get('workshop').then((val) => {
      this.data.workshop = val;
    });
  }
  ionViewDidLoad() {
    this.data.plant = this.api.plant;
    this.storage.get('warehouse').then((val) => {
      this.data.warehouse = val;
    });
  }
  ngOnChanges() {

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
