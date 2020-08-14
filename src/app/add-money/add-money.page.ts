import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { PaytmService } from 'src/providers/paytm/paytm.service';
import { LoadingService } from 'src/providers/loading/loading.service';

@Component({
  selector: 'app-add-money',
  templateUrl: './add-money.page.html',
  styleUrls: ['./add-money.page.scss'],
})
export class AddMoneyPage implements OnInit {

  @ViewChild(IonInfiniteScroll, { static: false }) infinite: IonInfiniteScroll;
  paymentMethods = [];
  page = 1;
  walletbalance=0;
  orders = new Array;
  httpRunning = true;
  paytmS: any;
  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
    public config: ConfigService,
    public shared: SharedDataService,
    public paytmService: PaytmService,
    public loading: LoadingService,
    private applicationRef: ApplicationRef
  ) {
  }
  formData = { amount:0 };

  refreshPage() {
    this.page = 1;
    this.infinite.disabled = false;
    
  }
  addCurrecny(order, v2) {
    return order.currency + " " + v2;
  }

  ngOnInit() {
    this.httpRunning = true;
	this.initializePaymentMethods();
  }

  
  
  
  updateOrder(order_id,amount,trans_id){
	  
	let cutomerId=0;
    cutomerId = this.shared.customerData.customers_id;
		  
	this.loading.show();
    this.config.getHttp("walletRecharge/"+amount+"/"+cutomerId+"/"+order_id+"/"+trans_id).then((data: any) => {
      this.loading.hide();
     
	 
        if (data.success == 1) {
		  this.shared.toast("Recharge Done");
          this.navCtrl.navigateRoot(this.config.currentRoute + "/wallet");
        }
        else {
          this.shared.toast("Paytm Error");
        }
		  
		  
	  });
    
  
	  
  }
  
   initializePaymentMethods() {
	  
	
    // this.loading.show();
    var dat: { [k: string]: any } = {};
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
	dat.cust_id=this.shared.customerData.customers_id
    this.config.postHttp('getpaymentmethods', dat).then((data: any) => {
      //  this.loading.hide();
      if (data.success == 1) {
		  
		 this.walletbalance=data.balance[0].balance;
        this.paymentMethods = data.data;
        for (let a of data.data) {

         
         

         

           if (a.method == "paytm") {
             this.paytmS = a.public_key;
           }
        }
      }
    },
      err => {
        this.shared.showAlert("getPaymentMethods Server Error");
      });
  }
  orderPayment() {
	  
	 if(this.formData.amount>0){
    let mId = ""
	
	let amount = this.formData.amount;
    let production = true;

    let cutomerId = 0;
    if (this.shared.customerData.customers_id)
      cutomerId = this.shared.customerData.customers_id;
    let checkSum = ""
    let orderId = ""

    this.paymentMethods.forEach(element => {
      if (element.method == "paytm") {
        mId = element.public_key;

        if (element.environment == "Test") {
          production = false
        }
      }
    });
   	this.loading.show();
    this.config.getHttp("generatpaytmhashes/"+cutomerId+"/"+amount).then((data: any) => {
      this.loading.hide();
      checkSum = data.data.CHECKSUMHASH;
      orderId = data.data.ORDER_ID;
      this.paytmService.paytmpage(checkSum, orderId, mId, cutomerId, amount, production).then((data: any) => {
        if (data.status == "sucess" && data.trans_status=='TXN_SUCCESS') {
          this.updateOrder(orderId,amount,data.trans_id);
        }
		else if(data.status == "sucess" && data.trans_status=='TXN_FAILURE'){
			
			this.shared.toast("Transaction Failed");
			
		}
        else {
          this.shared.toast("Paytm Error");
        }
		  
		  
	  });
    });
	 }
	 else{
		 this.shared.toast("Invalid Amount");
	 }
  }
  

  showOrderDetail(order) {

    this.shared.myOrderDetialPageData = order;
    this.navCtrl.navigateForward(this.config.currentRoute + "/my-order-detail");

  }
  openProductsPage() {
    if (this.config.appNavigationTabs)
    this.navCtrl.navigateForward("tabs/" + this.config.getCurrentHomePage());
  else
    this.navCtrl.navigateForward(this.config.getCurrentHomePage());
  }

}
