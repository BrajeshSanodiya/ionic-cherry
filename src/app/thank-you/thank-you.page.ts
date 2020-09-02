import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
})
export class ThankYouPage implements OnInit {

  public timee="";
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public config: ConfigService,
    private ga: GoogleAnalytics,
    public appEventsService: AppEventsService,
  ) {

    this.ga.startTrackerWithId('UA-164323626-1')
   .then(() => {
     console.log('Google analytics is ready now');
      this.ga.trackView('227810086');
     // Tracker is ready
     // You can now track pages or set additional information such as AppVersion or UserId
   })
   .catch(e => console.log('Error starting GoogleAnalytics', e));
  }
  openHome() {
    if (this.config.appNavigationTabs)
      this.navCtrl.navigateRoot("tabs/" + this.config.getCurrentHomePage());
    else
      this.navCtrl.navigateRoot(this.config.getCurrentHomePage());
  }
  openOrders() {
    if (this.config.appNavigationTabs)
      this.navCtrl.navigateRoot("tabs/settings");
    else
      this.navCtrl.navigateRoot("my-orders");
  }
  goBack() {
    this.navCtrl.navigateRoot("tabs/cart");
  }
  ngOnInit() {
	  this.timee= new Date().getHours() + ':' + new Date().getMinutes() + ':'+  new Date().getSeconds();
  }
  ionViewDidEnter() {
    this.shared.emptyCart();
  }
}
