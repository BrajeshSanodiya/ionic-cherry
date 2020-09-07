import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/providers/config/config.service';
import { NavController } from '@ionic/angular';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
import { LoadingService } from 'src/providers/loading/loading.service';

@Component({
  selector: 'app-home4',
  templateUrl: './home4.page.html',
  styleUrls: ['./home4.page.scss'],
})
export class Home4Page implements OnInit {
  sliderConfig = {
    slidesPerView: this.config.productSlidesPerPage,
    spaceBetween: 0
  }
  constructor(
    public nav: NavController,
    public config: ConfigService,
    public appEventsService: AppEventsService,
    public shared: SharedDataService,
	public loading: LoadingService,
  ) { }


 bannerClick2 = function (image) {
	  
	 
    if (image.type == 'category' || image.type =='categoryparent') {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/" + image.url + "/0/newest");
    }
    else if (image.type == 'product') {
		
      this.getSingleProductDetail(parseInt(image.url));
    }
    else {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/0/0/" + image.type);
    }
  }
   bannerClick3 = function (image) {
	  
	 
    if (image.type == 'category' || image.type =='categoryparent') {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/" + image.url + "/0/newest");
    }
    else if (image.type == 'product') {
		
      this.getSingleProductDetail(parseInt(image.url));
    }
    else {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/0/0/" + image.type);
    }
  }
   bannerClick4 = function (image) {
	  
	 
    if (image.type == 'category' || image.type =='categoryparent') {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/" + image.url + "/0/newest");
    }
    else if (image.type == 'product') {
		
      this.getSingleProductDetail(parseInt(image.url));
    }
    else {
		
      this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/products/0/0/" + image.type);
    }
  }
  //===============================================================================================
  //getting single product data
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
        this.nav.navigateForward("tabs/" + this.config.getCurrentHomePage() + "/product-detail/" + data.product_data[0].products_id);
      }
    });
  }
  
  ionViewDidEnter() {
    this.shared.hideSplashScreen();
  }
  openSubCategories(parent) {
    let count = 0;
    for (let value of this.shared.allCategories) {
      if (parent.id == value.parent_id) count++;
    }
    if (count != 0)
      this.nav.navigateForward(this.config.currentRoute + "/categories/" + parent.id + "/" + parent.name);
    else
      this.nav.navigateForward(this.config.currentRoute + "/products/" + parent.id + "/" + parent.name + "/newest");

  }
  openProducts(value) {
    this.nav.navigateForward(this.config.currentRoute + "/products/0/0/" + value);
  }
  ngOnInit() {
	  
  }
  ionViewCanEnter() {
    if (!this.config.appInProduction) {
      this.config.productCardStyle = "9";
    }
  }
}
