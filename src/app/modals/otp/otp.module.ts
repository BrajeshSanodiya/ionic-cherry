import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { verifyOtp } from   './otp.page';

const routes: Routes = [
  {
    path: '',
    component: verifyOtp
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    RouterModule.forChild(routes),
  ],
  declarations: [verifyOtp],
  entryComponents: [
    verifyOtp
  ]
})
export class verifyOtpModule { }
