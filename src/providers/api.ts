import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Events, ToastController } from 'ionic-angular';
import { Storage } from "@ionic/storage";


/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  public plant: string = '3000';
  public version: string = 'P-210106';
  public api_host: string;  //api接口地址，在login.ts配置

  constructor(public http: HttpClient, public events: Events,public alertCtrl: AlertController, public toastCtrl: ToastController, public storage: Storage) {
  }
  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    return this.http.get(this.api_host+'/api' + '/' + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_host + '/api' + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.api_host + '/api' + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.api_host + '/api' + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.api_host + '/api' + '/' + endpoint, body, reqOpts);
  }
}
