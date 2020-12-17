import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckJisPage } from './check-jis';
import {ComponentsModule} from "../../../components/components.module";

@NgModule({
  declarations: [
    CheckJisPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckJisPage),
    ComponentsModule
  ],
})
export class CheckJisPageModule {}
