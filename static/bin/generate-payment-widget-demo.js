#!/usr/bin/env node

const fse = require("fs-extra");
const indexPath = `./dist/payment-widget-demo/index.html`;

const baseUrl = 'https://proxy.test.devpayever.com';
const apiCallId = 'd3f5bb9b-afa4-4b73-a412-ad53e02559c7'; // This is harcoded API call id for test. Requires CHECKOUTB-63 to be deployed.

const finalHTML = `
<!DOCTYPE html>
<html>
  <head><style>.display-none { display: none; }</style></head>
  <!--
  <link rel="stylesheet" href="https://material.angular.io/styles.2482741cbee49ee2d1cd.css">
  -->
  <body>
    <h1>Test of payment widget</h1>
    <!-- Preparation for work -->
    <script>
      window.onPayeverPaymentWidgetLoaderReady = function() {
        console.log('onPayeverPaymentWidgetLoaderReady!');
        window.PayeverPaymentWidgetLoader.init(
          "${baseUrl}",
          "${apiCallId}",
          function(payments) {
            console.log('Payment widget was loaded!', payments);
            if (document.getElementById('payments-loading')) document.getElementById('payments-loading').remove();
            document.getElementById('payments-list').style = { display: 'block' };
            payments.map(function(payment) {
              var element = document.getElementById('payment-' + payment);
              if (element) {
                element.style = { display: 'block' };
              }
            });
            
            // window.PayeverPaymentWidgetLoader.load('santander_installment', '#payment-element');
          }, 
          function(error) {
            console.error('Payment widget not initialed!', error);
            if (document.getElementById('payments-loading')) document.getElementById('payments-loading').remove();
          }
        );          
      }
    </script>  
    <script src="/js/pe-payment-widget-loader.js"></script>
    
    <!-- List of payments -->
    <script>
      function loadPayment(payment) {
        console.log('loadPayment(payment)', payment);
        // payment-element
        
        document.getElementById('payment-loading').classList.remove(['display-none']);
        var showSubmitButton = document.getElementById('show-submit-button').checked;
        window.PayeverPaymentWidgetLoader.load(payment, '#payment-element', {
          showSubmitButton: showSubmitButton,
          onSubmit: function(done) {
            console.log('Make some handling on submit');
            setTimeout(function() {
              console.log('Some handling on submit is done');
              done();
            }, 1000);
          },
          onStatus: function(status) {
            console.log('Status', status);
          },
          onReady: function() {
            console.log('Ready!');
            document.getElementById('payment-loading').classList.add('display-none');
          },
          onError: function(error) {
            console.error('Payment widget not loaded!', error);
            document.getElementById('payment-loading').classList.add('display-none');                
          }
        });
      }
      
      function shopExternalSubmit() {
        console.log('shopExternalSubmit()');
        window.PayeverPaymentWidgetLoader.submit();
      }
      
      function changeFlowData() {
        console.log('changeFlowData()');
        window.PayeverPaymentWidgetLoader.patchFlow({billing_address: {
            salutation: 'SALUTATION_MR', first_name: 'Megatron', last_name: 'Pozitron', country: 'DE', city: 'Berlin', street: 'Test', phone: '496912341234'
        }});
      }
    </script>
    
    <p><small>
      If you see "400: This api call is already processed" error - just deploy this task (it allows to use same apiCallId multiple times):<br>
      <a href="https://payeverorg.atlassian.net/browse/CHECKOUTB-63" target="_blank">https://payeverorg.atlassian.net/browse/CHECKOUTB-63</a>
    </small></p>
    
    <div id="payments-loading">Loading payments list....</div>
    <label><input type="checkbox" checked id="show-submit-button" style="width: 16px;"><span>Show submit button</span></label>
    <div id="payments-list" style="display: none">
      <h3>Please choose payment</h3>
      <div id="payment-santander_installment" style="display: none">
        <button onclick="loadPayment('santander_installment')">santander_installment</button><br><br>
      </div>
      <div id="payment-santander_invoice_de" style="display: none">
        <button onclick="loadPayment('santander_invoice_de')">santander_invoice_de</button><br><br>
      </div>
      <div id="payment-non_existing">
        <button onclick="loadPayment('non_existing')">non_existing</button><br><br>
      </div>
    </div>
    
    <hr>
    <div id="payment-loading" class="display-none">Loading payment....</div>
    <div id="payment-element"></div>
    
    <hr>
    <button onclick="shopExternalSubmit()">Shop external submit</button>
    <hr>
    <button onclick="changeFlowData()">Change flow data</button>
  </body>
</html>
`;
fse.createFileSync(indexPath);
fse.writeFile(indexPath, finalHTML, err => {
  if (err) {
    console.log(
      `Error with creation of a payment widget demo file generated, ${err}`
    );
  }
  console.log(`Payment widget demo file generated`);
});
