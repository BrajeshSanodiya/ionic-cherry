import { Component, OnInit, ApplicationRef } from '@angular/core';

import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/providers/loading/loading.service';
import { CouponService } from 'src/providers/coupon/coupon.service';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../modals/login/login.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  total: any;
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public config: ConfigService,
    public loading: LoadingService,
    private storage: Storage,
    public appEventsService: AppEventsService,
    public modalCtrl: ModalController,
    private applicationRef: ApplicationRef,
    public couponProvider: CouponService,
    private ga: GoogleAnalytics,
    public actionSheetCtrl: ActionSheetController,
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
  totalPrice() {
    var price = 0;
    for (let value of this.shared.cartProducts) {
      var pp = value.final_price * value.customers_basket_quantity;
      price = price + pp;
    }
    this.total = price;
  };
  getSingleProductDetail(id) {
    this.loading.show();

    var dat: { [k: string]: any } = {};
    if (this.shared.customerData != null)
      dat.customers_id = this.shared.customerData.customers_id;
    else
      dat.customers_id = null;
    dat.products_id = id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getallproducts', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.shared.singleProductPageData.push(data.product_data[0]);
        this.navCtrl.navigateForward(this.config.currentRoute + "/product-detail/" + data.product_data[0].products_id);
      }
    });
  }
  removeCart(id) {
    this.shared.removeCart(id);
    this.totalPrice();
  }
  qunatityPlus = function (q) {
    q.customers_basket_quantity++;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
    if (q.customers_basket_quantity > q.quantity) {
      q.customers_basket_quantity--;
      this.shared.toast('Product Quantity is Limited!');
    }
    this.totalPrice();
    this.shared.cartTotalItems();
    this.storage.set('cartProducts', this.shared.cartProducts);
	console.log(q.quantity);
  }
  //function decreasing the quantity
  qunatityMinus = function (q) {
    if (q.customers_basket_quantity == 1) {
      return 0;
    }
    q.customers_basket_quantity--;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
    this.totalPrice();

    this.shared.cartTotalItems();
    this.storage.set('cartProducts', this.shared.cartProducts);
  }

  proceedToCheckOut() {
    //this.shared.changeGuestCheckoutStatus(0);
    this.navCtrl.navigateForward(this.config.currentRoute + "/shipping-address");
  }
  openProductsPage() {
    if (this.config.appNavigationTabs)
      this.navCtrl.navigateForward("tabs/" + this.config.getCurrentHomePage());
    else
      this.navCtrl.navigateForward(this.config.getCurrentHomePage());
  }
  ionViewWillEnter() {
    this.shared.changeGuestCheckoutStatus(0);
    //this.navCtrl.navigateForward(this.config.currentRoute + "/order")
    console.log("Cart is viewed");
    this.totalPrice()
  }

  ngOnInit() {
  }

}
