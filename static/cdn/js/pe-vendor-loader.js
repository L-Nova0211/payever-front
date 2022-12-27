// (function() {

  var scripts = [
    "https://unpkg.com/rxjs@6.2.0/bundles/rxjs.umd.js",
    "https://unpkg.com/core-js@2.4.1/client/shim.js",
    "https://unpkg.com/zone.js@0.8.29/dist/zone.js",
    "https://unpkg.com/@angular/compiler@7.0.4/bundles/compiler.umd.js",
    "https://unpkg.com/@angular/core@7.0.4/bundles/core.umd.js",
    "https://unpkg.com/@angular/common@7.0.4/bundles/common.umd.js",
    "https://unpkg.com/@angular/common@7.0.4/bundles/common-http.umd.js",
    "https://unpkg.com/@angular/http@7.0.4/bundles/http.umd.js",
    "https://unpkg.com/@angular/animations@7.0.4/bundles/animations.umd.js",
    "https://unpkg.com/@angular/animations@7.0.4/bundles/animations-browser.umd.js",
    "https://unpkg.com/@angular/forms@7.0.4/bundles/forms.umd.js",
    "https://unpkg.com/@angular/platform-browser@7.0.4/bundles/platform-browser.umd.js",
    "https://unpkg.com/@angular/router@7.0.4/bundles/router.umd.js",

    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-platform.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-observers.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-bidi.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-a11y.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-stepper.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-collections.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-tree.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-table.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-portal.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-scrolling.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-overlay.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-text-field.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-collections.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-layout.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-accordion.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-keycodes.umd.js",
    "https://unpkg.com/@angular/cdk@7.0.4/bundles/cdk-coercion.umd.js",
    "https://unpkg.com/@angular/material@7.0.4/bundles/material.umd.js"
  ];

  // scripts.forEach(function(url) {
  //   setTimeout(function() {
  //     var script = document.createElement("script");  // create a script DOM node
  //     script.src = url;  // set its src to the provided URL
  //     document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
  //   }, 50);
  // });

function addScript(i){
  if (i < scripts.length){
    setTimeout(function(){
      var script = document.createElement("script");  // create a script DOM node
      script.src = scripts[i];  // set its src to the provided URL
      document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
      i++;
      addScript(i);
    },80);
  }
}

addScript(0);

// })();
