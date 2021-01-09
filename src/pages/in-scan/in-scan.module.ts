import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InScanPage } from './in-scan';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    InScanPage,
  ],
  imports: [
    IonicPageModule.forChild(InScanPage),
    ComponentsModule
  ],
})
export class InScanPageModule {}
