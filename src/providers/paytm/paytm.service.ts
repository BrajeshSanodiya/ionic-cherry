import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { SharedDataService } from '../shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';
import { LoadingService } from 'src/providers/loading/loading.service';
@Injectable({
  providedIn: 'root'
})
export class PaytmService {

  constructor(
    public iab: InAppBrowser,
	public config: ConfigService,
	public loading: LoadingService,
    public shared: SharedDataService) { }

  paytmpage(chcksum, orderId, mId, customerId, amount, inProduction) {
    return new Promise(resolve => {
      var paytmUrl = 'https://securegw-stage.paytm.in';
      if (inProduction == true)
        paytmUrl = 'https://securegw.paytm.in'

      var callBackUrl = paytmUrl + "/theia/paytmCallback?ORDER_ID=" + orderId;

      var completeUrl = paytmUrl + "/order/process";
      var pageContetn = `<html>
   <head>
      <title>Show Payment Page</title>
   </head>
   <body>
      <center>
         <h1>Please do not refresh this page...</h1>
      </center>
      <form method="post" action="https://securegw.paytm.in/theia/api/v1/showPaymentPage?mid=${mId}&orderId=${orderId}" name="paytm">
         <table border="1">
            <tbody>
               <input type="hidden" name="mid" value="${mId}">
               <input type="hidden" name="orderId" value="${orderId}">
               <input type="hidden" name="txnToken" value="${chcksum}">
            </tbody>
         </table>
         <script type="text/javascript"> document.paytm.submit(); </script>
      </form>
   </body>
</html>`
		  
		  
      var pageContentUrl = "data:text/html;base64," + btoa(pageContetn);
      console.log(pageContentUrl)

      let options: InAppBrowserOptions = {
        
	location : 'yes',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'yes', //iOS only 
    enableViewportScale : 'no', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    fullscreen : 'yes',//Windows only   
      };

      const bb = this.iab.create(pageContentUrl, "_blank", options)
      bb.on('loadstart').subscribe(res => {
        console.log(res.url);
        if (res.url == callBackUrl) {
         this.config.getHttp("generatpaytmhashes").then((data: any) => {
            this.loading.hide();
            console.log("---------------- payment sucess ---------------");
            bb.close();
resolve({ status: "sucess", id: orderId ,trans_status:data.data.transaction_status ,trans_id:data.data.transaction_id });
      
    
         });
        }
      }), error => {
        console.log(error);
        resolve({ status: "error", error: error });
      };
    });
  }
}
