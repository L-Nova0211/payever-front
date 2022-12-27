/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * Web Animations `@angular/platform-browser/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 */

(window as any).global = window;

// Needed on browsers with native `customElements`.
// (E.g.: Chrome, Opera)
import '@webcomponents/custom-elements/src/native-shim'; // 1kb

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

(function () {
  if ( typeof (window as any).CustomEvent === "function" ) return false; //If not IE

  function CustomEvent ( event: any, params: any ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;

  (window as any).CustomEvent = CustomEvent;

  // Polyfill for IE - .remove() method is not supported
  if (!('remove' in Element.prototype as any)) {
    Element.prototype['remove'] = function(): any {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  // @ts-ignore
  if ( !Object.values ) {
    // @ts-ignore
    Object.values = function(obj: any) {
      // @ts-ignore
      return Object.keys(obj).map((key: string) => obj[key]);
    }
  }
})();

//from: https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/after()/after().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('after')) {
      return;
    }
    Object.defineProperty(item, 'after', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function after() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem: any) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.parentNode.insertBefore(docFrag, this.nextSibling);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

// Function to make IE9+ support forEach:
(function() {
  if (typeof NodeList.prototype.forEach !== "function") {
    // @ts-ignore
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
})();

(function() {
  Object.setPrototypeOf = Object.setPrototypeOf || ({__proto__: []} instanceof Array ? setProtoOf : mixinProperties);

  function setProtoOf(obj: any, proto: any) {
    obj.__proto__ = proto;
    return obj;
  }

  function mixinProperties(obj: any, proto: any) {
    for (const prop in proto) {
      if (!obj.hasOwnProperty(prop)) {
        obj[prop] = proto[prop];
      }
    }
    return obj;
  }
})();

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(valueToFind: any, fromIndex: any) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x: any, y: any) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(valueToFind, elementK) is true, return true.
        if (sameValueZero(o[k], valueToFind)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

//To avoid micro.js intersections
if (typeof Symbol === 'function' && !(Symbol as any).observable) {
  (Symbol as any).observable = Symbol("observable");
}
