import { Component, OnInit, ApplicationRef, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, IonContent, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { CouponService } from 'src/providers/coupon/coupon.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';
import { Stripe } from '@ionic-native/stripe/ngx';
import { PaytmService } from 'src/providers/paytm/paytm.service';
import { HTTP } from '@ionic-native/http/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var Instamojo: any;
declare var braintree;
declare var RazorpayCheckout: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  c;
  orderDetail: { [k: string]: any } = {};//include shipping address, billing address,  shipping methods.
  products = [];
  couponArray = [];
  couponApplied = 0;
  tokenFromServer = null;
  discount = 0;
  productsTotal = 0;
  totalAmountWithDisocunt = 0;
  walletbalance=0;
  nonce = '';
  stripeCard = {
    number: '',
    expMonth: 1,
    expYear: 2020,
    cvc: ''
  };

  paymentMethods = [];
  paypalClientId = "";
  paypalEnviroment = "";
  publicKeyStripe = "";
  razorPayKey: any;
  keyRazorPay: any;
  paytmS: any;
  constructor(
    public navCtrl: NavController,
    public httpClient: HttpClient,
    public config: ConfigService,
    public shared: SharedDataService,
    public loading: LoadingService,
    public couponProvider: CouponService,
    public actionSheetCtrl: ActionSheetController,
    public iab: InAppBrowser,
    public platform: Platform,
    public paytmService: PaytmService,
    private payPal: PayPal,
    private ga: GoogleAnalytics,
    private httpNative: HTTP,
    private stripe: Stripe,) {


      this.ga.startTrackerWithId('UA-164323626-1')
   .then(() => {
     console.log('Google analytics is ready now');
      this.ga.trackView('227810086');
     // Tracker is ready
     // You can now track pages or set additional information such as AppVersion or UserId
   })
   .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  //============================================================================================  
  //placing order
  addOrder_paytm(nonce,trans_id) {
    this.loading.autoHide(5000);
    this.orderDetail.customers_id = this.shared.customerData.customers_id;
    this.orderDetail.customers_name = this.shared.orderDetails.delivery_firstname + " " + this.shared.orderDetails.delivery_lastname;
    this.orderDetail.delivery_name = this.shared.orderDetails.billing_firstname + " " + this.shared.orderDetails.billing_lastname;

    if (this.shared.orderDetails.guest_status == 1) {
      this.orderDetail.email = this.shared.orderDetails.email;
      this.orderDetail.customers_telephone = this.shared.orderDetails.delivery_phone;
    }
    else {
      this.orderDetail.email = this.shared.customerData.email;
      this.orderDetail.customers_telephone = this.shared.customerData.customers_telephone;
    }

    this.orderDetail.delivery_suburb = this.shared.orderDetails.delivery_state
    this.orderDetail.customers_suburb = this.shared.orderDetails.delivery_state;
    this.orderDetail.customers_address_format_id = '1';
    this.orderDetail.delivery_address_format_id = '1';
    this.orderDetail.products = this.products;
    this.orderDetail.is_coupon_applied = this.couponApplied;
    this.orderDetail.coupons = this.couponArray;
    this.orderDetail.coupon_amount = this.discount;
    this.orderDetail.totalPrice = this.totalAmountWithDisocunt;
    this.orderDetail.nonce = nonce;
    this.orderDetail.language_id = this.config.langId;
    this.orderDetail.currency_code = this.config.currecnyCode;
	this.orderDetail.payment_status = 1;
	this.orderDetail.trans_id = trans_id;
    var dat = this.orderDetail;
    console.log(dat);
    this.config.postHttp('addtoorder', dat).then((data: any) => {
      //this.loading.hide();
      if (data.success == 1) {
        this.products = [];
        this.orderDetail = {};
        //this.shared.orderDetails = {};
        this.navCtrl.navigateRoot(this.config.currentRoute + "/thank-you");
      }
      if (data.success == 0) { this.shared.showAlert(data.message); }
    }, err => {
      this.shared.showAlert("Server Error" + " " + err.status);
    });
  };
  
   addOrder(nonce) {
    this.loading.autoHide(5000);
    this.orderDetail.customers_id = this.shared.customerData.customers_id;
    this.orderDetail.customers_name = this.shared.orderDetails.delivery_firstname + " " + this.shared.orderDetails.delivery_lastname;
    this.orderDetail.delivery_name = this.shared.orderDetails.billing_firstname + " " + this.shared.orderDetails.billing_lastname;

    if (this.shared.orderDetails.guest_status == 1) {
      this.orderDetail.email = this.shared.orderDetails.email;
      this.orderDetail.customers_telephone = this.shared.orderDetails.delivery_phone;
    }
    else {
      this.orderDetail.email = this.shared.customerData.email;
      this.orderDetail.customers_telephone = this.shared.customerData.customers_telephone;
    }

    this.orderDetail.delivery_suburb = this.shared.orderDetails.delivery_state
    this.orderDetail.customers_suburb = this.shared.orderDetails.delivery_state;
    this.orderDetail.customers_address_format_id = '1';
    this.orderDetail.delivery_address_format_id = '1';
    this.orderDetail.products = this.products;
    this.orderDetail.is_coupon_applied = this.couponApplied;
    this.orderDetail.coupons = this.couponArray;
    this.orderDetail.coupon_amount = this.discount;
    this.orderDetail.totalPrice = this.totalAmountWithDisocunt;
    this.orderDetail.nonce = nonce;
    this.orderDetail.language_id = this.config.langId;
    this.orderDetail.currency_code = this.config.currecnyCode;
	this.orderDetail.payment_status = 0;
    var dat = this.orderDetail;
    console.log(dat);
    this.config.postHttp('addtoorder', dat).then((data: any) => {
      //this.loading.hide();
      if (data.success == 1) {
        this.products = [];
        this.orderDetail = {};
        //this.shared.orderDetails = {};
        this.navCtrl.navigateRoot(this.config.currentRoute + "/thank-you");
      }
      if (data.success == 0) { this.shared.showAlert(data.message); }
    }, err => {
      this.shared.showAlert("Server Error" + " " + err.status);
    });
  };
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

          if (a.method == "paypal" && a.active == '1') {
            this.paypalClientId = a.public_key;
            if (a.environment == "Test") this.paypalEnviroment = "PayPalEnvironmentSandbox";
            else this.paypalEnviroment = "PayPalEnvironmentProduction"
          }
          if (a.method == "stripe" && a.active == '1') {
            this.publicKeyStripe = a.public_key;
            this.stripe.setPublishableKey(a.public_key);
          }

          if (a.method == "razorpay") {
            this.keyRazorPay = a.public_key;
          }
          // if (a.method == "braintree_dropin_ui") {
          //   this.getToken();
          // }

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

  stripePayment() {
    // this.loading.show();
    this.stripe.createCardToken(this.stripeCard)
      .then(token => {
        // this.loading.hide();
        //this.nonce = token.id
        this.addOrder(token.id);
      })
      .catch(error => {
        //this.loading.hide();
        this.shared.showAlert(error.message)
      });
  }

  //============================================================================================  
  //CAlculate Discount total
  calculateDiscount = function () {
    var subTotal = 0;
    var total = 0;
    for (let value of this.products) {
      subTotal += parseFloat(value.subtotal);
      total += value.total;
    }
    this.productsTotal = subTotal;
    this.discount = (subTotal - total);
  };

  //============================================================================================  
  //CAlculate all total
  calculateTotal = function () {
    let a = 0;
    for (let value of this.products) {
      // console.log(value);
      var subtotal = parseFloat(value.total);
      a = a + subtotal;
    }

    let b = parseFloat(this.orderDetail.total_tax.toString());
    let c = parseFloat(this.orderDetail.shipping_cost.toString());
    this.totalAmountWithDisocunt = parseFloat((parseFloat(a.toString()) + b + c).toString());
    // console.log(" all total " + $scope.totalAmountWithDisocunt);
    // console.log("shipping_tax " + $scope.orderDetail.shipping_tax);
    // console.log(" shipping_cost " + $scope.orderDetail.shipping_cost);
    this.calculateDiscount();
  };

  //============================================================================================  
  //delete Coupon
  deleteCoupon = function (code) {

    this.couponArray.forEach((value, index) => {
      if (value.code == code) { this.couponArray.splice(index, 1); return true; }
    });


    this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
    this.orderDetail.shipping_cost = this.shared.orderDetails.shipping_cost;

    this.couponArray.forEach((value) => {
      //checking for free shipping
      if (value.free_shipping == true) {
        this.orderDetail.shippingName = 'free shipping';
        this.orderDetail.shippingCost = 0;
      }
      this.products = this.couponProvider.apply(value, this.products);
    });
    this.calculateTotal();
    if (this.couponArray.length == 0) {
      this.couponApplied = 0;
    }
  };
  //========================================================================================

  //============================================================================================   
  //getting getMostLikedProducts from the server
  getCoupon = function (code) {
    if (code == '' || code == null) {
      this.shared.showAlert('Please enter coupon code!');
      return 0;
    }
    this.loading.show();
    var dat = { 'code': code };
    this.config.postHttp('getcoupon', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        let coupon = data.data[0]
        // console.log($scope.coupon)
        this.applyCouponCart(coupon);
      }
      if (data.success == 0) {
        this.shared.showAlert(data.message);
      }
    }, error => {
      this.loading.hide();
      console.log(error);
    });

  };

  //============================================================================================  
  //applying coupon on the cart
  applyCouponCart = function (coupon) {
    //checking the coupon is valid or not

    if (this.couponProvider.validateCouponService(coupon, this.products, this.couponArray) == false) {
      return 0;
    } else {
      if (coupon.individual_use == 1) {
        this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
        this.couponArray = [];
        this.orderDetail.shipping_cost = this.shared.orderDetails.shipping_cost;
        console.log('individual_use');
      }
      var v: { [k: string]: any } = {};
      v.code = coupon.code;
      v.amount = coupon.amount;
      v.product_ids = coupon.product_ids;
      v.exclude_product_ids = coupon.exclude_product_ids;
      v.product_categories = coupon.product_categories;
      v.excluded_product_categories = coupon.excluded_product_categories;
      v.discount = coupon.amount;
      v.individual_use = coupon.individual_use;
      v.free_shipping = coupon.free_shipping;
      v.discount_type = coupon.discount_type;
      //   v.limit_usage_to_x_items = coupon.limit_usage_to_x_items;
      //  v.usage_limit = coupon.usage_limit;
      // v.used_by = coupon.used_by ;
      // v.usage_limit_per_user = coupon.usage_limit_per_user ;
      // v.exclude_sale_items = coupon.exclude_sale_items;
      this.couponArray.push(v);
    }


    //checking for free shipping
    if (coupon.free_shipping == 1) {
      // $scope.orderDetail.shippingName = 'free shipping';
      this.orderDetail.shipping_cost = 0;
      //  console.log('free_shipping');
    }
    //applying coupon service
    this.products = this.couponProvider.apply(coupon, this.products);
    if (this.couponArray.length != 0) {
      this.couponApplied = 1;
    }
    this.calculateTotal();
  };

  paypalPayment() {
    this.loading.autoHide(2000);
    this.payPal.init({
      PayPalEnvironmentProduction: this.paypalClientId,
      PayPalEnvironmentSandbox: this.paypalClientId
    }).then(() => {
      // this.loading.hide();
      // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
      this.payPal.prepareToRender(this.paypalEnviroment, new PayPalConfiguration({
        // Only needed if you get an "Internal Service Error" after PayPal login!
        //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
      })).then(() => {
        //this.loading.show();
        let payment = new PayPalPayment(this.totalAmountWithDisocunt.toString(), this.config.paypalCurrencySymbol, 'cart Payment', 'sale');
        this.payPal.renderSinglePaymentUI(payment).then((res) => {
          // Successfully paid
          //  alert(JSON.stringify(res));
          //this.nonce = res.response.id;
          this.addOrder(res);
          // Example sandbox response
          //
          // {
          //   "client": {
          //     "environment": "sandbox",
          //     "product_name": "PayPal iOS SDK",
          //     "paypal_sdk_version": "2.16.0",
          //     "platform": "iOS"
          //   },
          //   "response_type": "payment",
          //   "response": {
          //     "id": "PAY-1AB23456CD789012EF34GHIJ",
          //     "state": "approved",
          //     "create_time": "2016-10-03T13:33:33Z",
          //     "intent": "sale"
          //   }
          // }
        }, () => {
          console.log('Error or render dialog closed without being successful');
          this.shared.showAlert('Error or render dialog closed without being successful');
        });
      }, () => {
        console.log('Error in configuration');
        this.shared.showAlert('Error in configuration');
      });
    }, () => {
      console.log('Error in configuration');
      this.shared.showAlert('Error in initialization, maybe PayPal isnt supported or something else');
    });
  }

  async couponslist() {
    // + '<li>Cart Percentage <span>(cp9989)</a><p>{{"A percentage discount for the entire cart"|translate}}</p></li>'
    //   + '<li>Cart Fixed <span>(cf9999)</span> <p>{{"A fixed total discount for the entire cart"|translate}}</p></li>'
    //   + '<li>Product Fixed <span>(pf8787)</span></a><p>{{"A fixed total discount for selected products only"|translate}}</p></li>'
    //   + '<li>Product Percentage <span>(pp2233)</span><p>{{"A percentage discount for selected products only"|translate}}</p></li>'
    //   + '</ul>';
    // this.translate.get(array).subscribe((res) => { });
    let actionSheet = this.actionSheetCtrl.create({
      header: 'Coupons List',
      buttons: [
        {
          icon: 'arrow-round-forward',
          text: 'Cart Percentage (cp9989). A percentage discount for selected products only',
          handler: () => {
            this.c = 'cp9989';
          }
        }, {
          icon: 'arrow-round-forward',
          text: 'Product Fixed (pf8787). A fixed total discount for selected products only',
          handler: () => {
            this.c = 'pf8787';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Cart Fixed (cf9999). A fixed total discount for the entire cart',
          handler: () => {
            this.c = 'cf9999';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Product Percentage (pp2233). A percentage discount for selected products only',
          handler: () => {
            this.c = 'pp2233';
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    (await actionSheet).present();
  }
  //============================================================================================  
  //getting token from server
  getToken() {
    this.loading.autoHide(2000);
    this.config.getHttp('generatebraintreetoken').then((data: any) => {
      // this.loading.hide();
      if (data.success == 1) {
        if (this.tokenFromServer == null) {
          this.tokenFromServer = data.token;
          this.initializeBraintreeDropInUi(this.tokenFromServer);
        }
      }
      if (data.success == 0) {
        this.shared.showAlert("Server Error" + " " + " Braintree Token");
      }
    }, error => {
      this.shared.showAlert("Server Error" + " " + error.status + " Braintree Token");
    });
  };

  initializeBraintreeDropInUi(token) {

    let enablePaymentMethodsBraintree = {
      paypal: "vault",// checkout, vault, disable
      paypalCredit: "vault",// checkout, vault, disable,
      venmo: "enable",// enable, disabled
      applePay: "enable",// enable, disabled,
      googlePay: {
        enable: "enable", // enable, disabled,
        merchantIdGoogle: "merchant-id-from-google", //id from the google setup
      }
    };

    enablePaymentMethodsBraintree = {
      paypal: "vault",// checkout, vault, disable
      paypalCredit: "vault",// checkout, vault, disable,
      venmo: "enable",// enable, disabled
      applePay: "enable",// enable, disabled,
      googlePay: {
        enable: "enable", // enable, disabled,
        merchantIdGoogle: "merchant-id-from-google", //id from the google setup
      }
    };

    let dat: { [k: string]: any } =
    {
      authorization: token,
      container: '#dropin-container',
      translations: {

      },
      vaultManager: true,
    };

    //enable paypal
    if (enablePaymentMethodsBraintree.paypal == "vault") {
      dat.paypal = {
        flow: 'vault'
      }
    }
    else if (enablePaymentMethodsBraintree.paypal == "checkout") {
      dat.paypal = {
        flow: 'checkout',
        amount: this.totalAmountWithDisocunt,
        currency: this.config.currecnyCode
      }
    }

    //enable paypal credit
    if (enablePaymentMethodsBraintree.paypalCredit == "vault") {
      dat.paypalCredit = {
        flow: 'vault'
      }
    }
    else if (enablePaymentMethodsBraintree.paypalCredit == "checkout") {
      dat.paypalCredit = {
        flow: 'checkout',
        amount: this.totalAmountWithDisocunt,
        currency: this.config.currecnyCode
      }
    }

    //enable paypal credit
    if (enablePaymentMethodsBraintree.venmo == "enable") {
      dat.venmo = {
        // allowNewBrowserTab: false
      }
    }

    //enable paypal credit
    if (enablePaymentMethodsBraintree.applePay == "enable") {
      dat.applePay = {
        displayName: this.config.appName,
        paymentRequest: {
          total: {
            label: this.config.appName,
            amount: this.totalAmountWithDisocunt
          },
          // We recommend collecting billing address information, at minimum
          // billing postal code, and passing that billing postal code with all
          // Apple Pay transactions as a best practice.
          requiredBillingContactFields: ["postalAddress"]
        }
      }
    }

    if (enablePaymentMethodsBraintree.googlePay.enable == "enable") {
      dat.googlePay = {
        // googlePayVersion: 2,
        // merchantId: enablePaymentMethodsBraintree.googlePay.merchantIdGoogle,
        mode: "test",
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: this.totalAmountWithDisocunt,
          currencyCode: this.config.currecnyCode
        },
        cardRequirements: {
          // We recommend collecting and passing billing address information with all Google Pay transactions as a best practice.
          billingAddressRequired: false
        }
      }
    }


    this.loading.show();
    var button = document.querySelector('#submit-button');
    var _this = this;
    braintree.dropin.create(dat, function (createErr, instance) {
      button.addEventListener('click', function () {

        instance.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
          // Submit payload.nonce to your server
          if (payload != undefined)
            _this.addOrder(payload.nonce);
        });
      });
      _this.loading.hide();
      _this.scrollToBottom();
    });
  }
  //================================================================================
  // braintree paypal method
  braintreePaypal = function (clientToken) {
    this.loading.autoHide(2000);
    var nonce = 0;
    var promise = new Promise((resolve, reject) => {
      braintree.setup(clientToken, "custom", {
        paypal: {
          container: "paypal-container",
          displayName: "Shop"
        },
        onReady: function () {

          // $(document).find('#braintree-paypal-button').attr('href', 'javascript:void(0)');
        },
        onPaymentMethodReceived: function (obj) {
          //   console.log(obj.nonce);
          // this.nonce = obj.nonce;
          nonce = obj.nonce;
          resolve();
        }
      });


    });

    promise.then(
      (data) => {
        // console.log(nonce);
        this.addOrder(nonce);
      },
      (err) => { console.log(err); }
    );

  };
  //================================================================================
  // braintree creditcard method
  braintreeCreditCard = function (clientToken) {
    // this.loading.autoHide(2000);
    var nonce = 0;
    var promise = new Promise((resolve, reject) => {

      var braintreeForm = document.querySelector('#braintree-form');
      var braintreeSubmit = document.querySelector('button[id="braintreesubmit"]');
      braintree.client.create({
        authorization: clientToken
      }, function (clientErr, clientInstance) {
        if (clientErr) { }

        braintree.hostedFields.create({
          client: clientInstance,
          styles: {

          },
          fields: {
            number: {
              selector: '#card-number',
              placeholder: '4111 1111 1111 1111'
            },
            cvv: {
              selector: '#cvv',
              placeholder: '123'
            },
            expirationDate: {
              selector: '#expiration-date',
              placeholder: '10/2019'
            }
          }
        }, function (hostedFieldsErr, hostedFieldsInstance) {
          if (hostedFieldsErr) {
            // Handle error in Hosted Fields creation
            //alert("hostedFieldsErr" + hostedFieldsErr);
            document.getElementById('error-message').innerHTML = "hostedFieldsErr" + hostedFieldsErr;
            console.log("hostedFieldsErr" + hostedFieldsErr);
            return;
          }

          braintreeSubmit.removeAttribute('disabled');
          braintreeForm.addEventListener('submit', function (event) {
            document.getElementById('error-message').innerHTML = null;
            event.preventDefault();
            hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
              if (tokenizeErr) {
                //alert('Error : ' + JSON.stringify(tokenizeErr.message));
                // Handle error in Hosted Fields tokenization
                document.getElementById('error-message').innerHTML = tokenizeErr.message;
                return 0;
              }
              // Put `payload.nonce` into the `payment-method-nonce` input, and then
              // submit the form. Alternatively, you could send the nonce to your server
              // with AJAX.

              // document.querySelector('input[name="payment-method-nonce"]').value = payload.nonce;
              // this.nonce = payload.nonce;
              // this.addOrder(payload.nonce);
              nonce = payload.nonce;
              resolve();
              //  console.log(payload.nonce);

            });
          }, false);
        });
      });

    });
    promise.then(
      (data) => { //console.log(nonce); 
        this.addOrder(nonce);
      },
      (err) => { console.log(err); }
    );
  }
  paymentMehodChanged() {
    if (this.orderDetail.payment_method == "braintree_card" || this.orderDetail.payment_method == "braintree_paypal") this.getToken();//braintree_dropin_ui
    //if (this.orderDetail.payment_method == "stripe") this.stripe.setPublishableKey(this.publicKeyStripe);
    this.scrollToBottom();
  }
  scrollToBottom() {

    setTimeout(() => {
      this.content.scrollToBottom();
      console.log("botton");
    }, 300);

  }

  //================================= instamojo ===========================

  instamojoPayment() {
    let instamojoClient = new Instamojo(this.httpNative, this.iab, this.config.url + 'instamojotoken');
    var data = instamojoClient.getPaymentFields();
    data.buyer_name = this.shared.customerData.customers_firstname + " " + this.shared.customerData.customers_lastname
    data.currency = this.config.currency;
    data.purpose = "Order Payment";            // REQUIRED
    data.amount = this.totalAmountWithDisocunt;                  // REQUIRED
    //data.phone = this.shared.customerData.customers_telephone
    data.email = this.shared.customerData.email;
    data.send_email = true;
    data.send_sms = false;
    data.allow_repeated_payments = true;

    // do not change this
    data.redirect_url = "http://localhost";
    instamojoClient.payNow(data).then(response => {
      console.log(response);
      this.addOrder(response.id);
      //alert("Payment complete: " + JSON.stringify(response));
    }).catch(err => {
      console.log(err);
      this.shared.showAlert("Payment failed: " + JSON.stringify(err));
      throw err;
    });

  }
  //
  razorPay() {
    let customerName = this.shared.customerData.customers_firstname + " " + this.shared.customerData.customers_lastname
    let cutomerEmail = this.shared.customerData.email;
    let cutomerPhone = this.shared.customerData.customers_telephone;
    let amount = parseInt((this.totalAmountWithDisocunt * 100).toString());
    //let amount = parseInt((this.totalAmountWithDisocunt.toFixed(2)).toString());

    var options = {
      description: 'Order Payment',
      //image: 'https://i.imgur.com/3g7nmJC.png',
      currency: this.config.currecnyCode,
      key: this.keyRazorPay,
      amount: amount,
      name: customerName,
      prefill: {
        email: cutomerEmail,
        contact: cutomerPhone,
        name: customerName
      },
      theme: {
        color: this.shared.primaryHexColor
      },
      modal: {
        ondismiss: function () {
          //alert('dismissed')
        }
      }
    };

    let _this = this;
    var successCallback = function (payment_id) {
      _this.addOrder(payment_id);
    };

    var cancelCallback = function (error) {
      _this.shared.toast(error.description + ' (Error ' + error.code + ')');
    };


    RazorpayCheckout.open(options, successCallback, cancelCallback);
    if (this.platform.is('android')) {
      this.platform.resume.subscribe((event) => {
        // Re-register the payment success and cancel callbacks
        RazorpayCheckout.on('payment.success', successCallback)
        RazorpayCheckout.on('payment.cancel', cancelCallback)
        // Pass on the event to RazorpayCheckout
        RazorpayCheckout.onResume(event);

      })
    };
  }


  paytmPayment() {
    let mId = ""
    let order_amount = parseInt((this.totalAmountWithDisocunt.toFixed(2)).toString());
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
		  
		  this.addOrder_paytm(12345,0);
		  
	  }
	  else{
		  
		  amount=order_amount-wallet_balance;
		  
	this.loading.show();
    this.config.getHttp("generatpaytmhashes/"+cutomerId+"/"+amount).then((data: any) => {
      this.loading.hide();
      checkSum = data.data.CHECKSUMHASH;
      orderId = data.data.ORDER_ID;
      this.paytmService.paytmpage(checkSum, orderId, mId, cutomerId, amount, production).then((data: any) => {
        if (data.status == "sucess" && data.trans_status=='TXN_SUCCESS') {
			
          this.addOrder_paytm(data.id,data.trans_id);
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
  ngOnInit() {
    this.orderDetail = (JSON.parse(JSON.stringify(this.shared.orderDetails)));
    this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
    this.calculateTotal();
    this.initializePaymentMethods();
  }


  ionViewDidEnter() {
    var toolbar = document.getElementsByTagName("ion-toolbar");
    var style = getComputedStyle(toolbar[0]);
    var color = style.getPropertyValue("--ion-color-primary") || undefined;
    this.shared.primaryHexColor = color;
    console.log(color);
  }
  openHomePage() {
    this.navCtrl.navigateRoot(this.config.currentRoute + "/cart");
  }
  hyperpayPayment() {
    this.addOrder("null");
  }
}
