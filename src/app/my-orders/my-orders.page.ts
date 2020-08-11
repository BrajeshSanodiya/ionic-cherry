import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { PaytmService } from 'src/providers/paytm/paytm.service';
import { LoadingService } from 'src/providers/loading/loading.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
})
export class MyOrdersPage implements OnInit {

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

  refreshPage() {
    this.page = 1;
    this.infinite.disabled = false;
    this.getOrders();
  }
  addCurrecny(order, v2) {
    return order.currency + " " + v2;
  }

  ngOnInit() {
    this.httpRunning = true;
    this.getOrders();
	this.initializePaymentMethods();
  }

  getOrders() {
    this.httpRunning = true;
    this.orders = [];
    this.loading.show();
    var dat: { [k: string]: any } = {};
    dat.customers_id = this.shared.customerData.customers_id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getorders', dat).then((data: any) => {
      this.loading.hide();
      this.httpRunning = false;
      //$rootScope.address=response.data.data;
      if (data.success == 1) {
        this.orders = [];
        this.orders = data.data;
		
      }
      // $scope.$broadcast('scroll.refreshComplete');
    },
      function (response) {
        this.loading.hide();

        this.shared.toast("Server Error while Loading Orders");
        console.log(response);
      });
  };
  
  
  updateOrder(order_id,amount,trans_id){
	  
	let cutomerId=0;
    cutomerId = this.shared.customerData.customers_id;
		  
	this.loading.show();
    this.config.getHttp("updatePayment/"+order_id+"/"+amount+"/"+cutomerId+"/"+trans_id).then((data: any) => {
      this.loading.hide();
     
	 
        if (data.success == 1) {
		  this.shared.toast("Payment Done");
		  this.ngOnInit();
          this.navCtrl.navigateRoot(this.config.currentRoute + "/my-orders");
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
  orderPayment(amountt,order_id,wallet_ded) {
    let mId = ""
    let order_amount = parseInt(amountt)-parseInt(wallet_ded);
	
	let amount = 0;
	let wallet_balance=0;
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
    this.config.getHttp("walletBalance/"+cutomerId).then((data: any) => {
      this.loading.hide();
      wallet_balance = data.data.walle_balance;
	  if(wallet_balance>=order_amount){
		  
		  this.updateOrder(order_id,order_amount,0);
		  
	  }
	  else{
		  if(wallet_balance>0){
			  
			  amount=order_amount-wallet_balance;
			  
		  }
		  else{
			  
			  amount=order_amount;
		  }
		  
	this.loading.show();
    this.config.getHttp("generatpaytmhashes/"+cutomerId+"/"+amount).then((data: any) => {
      this.loading.hide();
      checkSum = data.data.CHECKSUMHASH;
      orderId = data.data.ORDER_ID;
      this.paytmService.paytmpage(checkSum, orderId, mId, cutomerId, amount, production).then((data: any) => {
        if (data.status == "sucess" && data.trans_status=='TXN_SUCCESS') {
          this.updateOrder(order_id,amount,data.trans_id);
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
	});
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
