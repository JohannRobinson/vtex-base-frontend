/**
 *      i2bmod VTEX class
 *      @version 1.5.1
 *      @copyright i2bmod 2015
 *      @author Marcos Casagrande
 *
 */

/* globals vtexjs,dataLayer,jQuery,google */

"use strict";
var i2bmod = (function ($, window, undefined) {

	/**
	 *      i2bmod Class
	 *      @class module:i2bmod
	 *      @module i2bmod
	 */

    function i2bmod() { }



	/**
	 *      i2bmod TagManager
	 *      @class module:i2bmod.TagManager
	 *      @author Marcos Casagrande
	 */

    if (!window.dataLayer)
        window.dataLayer = [];

    var TagManager = (function () {
        var dataLayerEventsQueue = {};
        var GTMEventsCallback = {};
        var GTMOnceEventsCallback = {};

        /** Watched Properties map **/
        var watchedProperties = {
            "event": ".event", //Dynamic event name dataLayer[0].event
            "pageCategory": "page",
            "categoryId": "category" //Static property name
        };

        function dataLayerWatcher(dl, length, item) {

            for (var property in watchedProperties) {
                if (watchedProperties.hasOwnProperty(property)) {
                    /** If the dataLayer item has the watched property **/
                    if (property in item) {
                        var prop = null;
                        var event = null;
                        if (watchedProperties[property].indexOf(".") === 0) {
                            prop = watchedProperties[property].substr(1, watchedProperties[property].length);
                            event = prop in item ? item[prop] : null;
                        } else {
                            event = watchedProperties[property];
                        }

                        if (event) {
                            /** ONCE events **/
                            if (event in GTMOnceEventsCallback) {
                                var j = GTMOnceEventsCallback[event].length;
                                while (j--) {
                                    GTMOnceEventsCallback[event][j].call(null, event, item);
                                    GTMOnceEventsCallback[event].splice(j, 1);
                                }
                            }

                            /** Event listener */
                            if (event in GTMEventsCallback) {
                                var h = GTMEventsCallback[event].length;
                                while (h--) {

                                    GTMEventsCallback[event][h].call(null, event, item);
                                }
                            }

                            dataLayerEventsQueue[event] = item;
                        }

                    }
                }
            }

        }

        if (window.dataLayer instanceof Array) {

            /** Get already pushed events **/
            for (var i = 0, dl = window.dataLayer.length; i < dl; i++) {

                for (var property in watchedProperties) {
                    if (watchedProperties.hasOwnProperty(property)) {
                        /** If the dataLayer item has the watched property **/
                        if (property in window.dataLayer[i]) {
                            if (watchedProperties[property].indexOf(".") === 0) {
                                var prop = watchedProperties[property].substr(1, watchedProperties[property].length);
                                dataLayerEventsQueue[window.dataLayer[i][prop]] = window.dataLayer[i];
                            } else {
                                dataLayerEventsQueue[watchedProperties[property]] = window.dataLayer[i];
                            }

                        }
                    }
                }

            }

            /** Modify data layer push with watcher function and call tag manager data layer push **/
            window.dataLayer.push = (function () {
                var original = this.push;
                return function () {

                    for (var i = 0, n = this.length, l = arguments.length; i < l; i++ , n++) {
                        dataLayerWatcher(this, n, arguments[i]);
                    }
                    return original.apply(this, arguments);
                }.bind(this);
            }.bind(window.dataLayer))();
        }

        function TagManager() { }

        TagManager.prototype = {

			/**
			 *	Listen to the given tagmanager event
			 *	@method module:i2bmod.TagManager#on
			 *	@param {string} events - The events to listen to
			 *	@param {...function} callbacks - The callback that will be called upon entering the given event.
			 *	@returns {object} i2bmod.Tagmanager (chainable)
			 *	@example
			 *i2bmod.TagManager.on("homeView", function(){
			 *  //some function
			 *},
			 *function(){
			 *  //other function
			 *})
			 */

            on: function () {

                var events = Array.prototype.shift.call(arguments).split(" ");
                var callbacks = Array.prototype.slice.call(arguments);
                for (var i = 0, len = events.length; i < len; i++) {
                    if (!(events[i] in GTMEventsCallback))
                        GTMEventsCallback[events[i]] = [];

                    GTMEventsCallback[events[i]] = GTMEventsCallback[events[i]].concat(callbacks);

                    var pos;
                    if (events[i] in dataLayerEventsQueue) {
                        var j = callbacks.length;
                        while (j--) {
                            callbacks[j].call(null, events[i], dataLayerEventsQueue[events[i]]);
                        }
                    }

                }
                return this;
            },

			/**
			 *	Listen to the given tagmanager event only ONCE
			 *	@method module:i2bmod.TagManager#once
			 *	@param {string} events - The events to listen to
			 *	@param {...function} callbacks - The callback that will be called upon entering the given event.
			 *	@returns {object} i2bmod.Tagmanager (chainable)
			 *	@example
			 *i2bmod.TagManager.on("homeView", function(){
			 *  //some function
			 *},
			 *function(){
			 *  //other function
			 *})
			 */

            once: function () {

                var events = Array.prototype.shift.call(arguments).split(" ");
                var callbacks = Array.prototype.slice.call(arguments);
                for (var i = 0, len = events.length; i < len; i++) {

                    if (events[i] in dataLayerEventsQueue) {
                        var j = callbacks.length;
                        while (j--) {
                            callbacks[j].call(null, events[i], dataLayerEventsQueue[events[i]]);
                        }

                    } else {
                        if (!(events[i] in GTMOnceEventsCallback))
                            GTMOnceEventsCallback[events[i]] = [];

                        GTMOnceEventsCallback[events[i]] = GTMOnceEventsCallback[events[i]].concat(callbacks);

                    }

                }
                return this;
            }

        };

        return new TagManager();

    })();

    i2bmod.prototype.TagManager = TagManager;



	/**
		Browser Polyfill
	**/
    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }
            return keys;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }

    RegExp.escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };


    var _animationCallbacks = {};
    var supportsTouch = !!('ontouchstart' in window || navigator.msMaxTouchPoints);

    /** VTEX APIs URL **/
    var API_URL = {
        SEARCH: "/api/catalog_system/pub/products/search/"
    };

    var Cache = {};



	/**
	 *      i2bmod Utils
	 *      @class module:i2bmod.Utils
	 *      @author Marcos Casagrande
	 */

    var Utils = {

        currency: null,


		/**
		 *      Get the VTEX server time
		 *      @method module:i2bmod.Utils#getServerTime
		 *      @access public
		 *      @param {function} callback - The callback to call when the request finishes. The callback will a javascript Date object.
		 *      @returns {promise} - jquery Ajax promise
		 *      @example
		 *i2bmod.Utils.getServerTime(function(date){
		 *  console.log(date.getFullYear());
		 *});
		 */

        getServerTime: function (callback) {
            return $.ajax({
                url: "/no-cache/HoraAtualServidor.aspx",
                success: function (response) {
                    var monthBr = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

                    var time = response.match(/([0-9]+):([0-5][0-9]):([0-5][0-9])/)[0];
                    var day = parseInt(response.match(/[a-z]{3} ([0-9]{1,2})/)[1]);
                    var month = monthBr.indexOf(response.match(/[a-z]{3}/)[0]) + 1;
                    var year = parseInt(response.match(/[0-9]{4}/)[0]);

                    if (day < 10)
                        day = "0" + day;

                    if (month < 10)
                        month = "0" + month;

                    if (typeof callback == "function") {
                        callback.call(null, new Date(year + "/" + month + "/" + day + " " + time));
                    }
                }
            });
        },


		/**
		 *      Get a specific order data.
		 *      @method module:i2bmod.Utils#getOrder
		 *		  @param {string} order - The order ID
		 *      @access public
		 *      @returns {promise} - jquery Ajax promise
		 */

        getOrder: function (order) {

            return $.ajax({
                type: "GET",
                url: "/api/checkout/pub/orders/" + order
            });

        },

		/**
		 *      Get the original VTEX image source from a thumb
		 *      @method module:i2bmod.Utils#getOriginalImage
		 *      @access public
		 *      @param {string} src - The source of the thumb
		 *      @returns {string} The original image source
		 *      @example
		 *i2bmod.Utils.getOriginalImage('http://i2bmod.vteximg.com.br/arquivos/ids/155242-292-292/image.png');
		 * //http://i2bmod.vteximg.com.br/arquivos/ids/155242/image.png
		 */

        getOriginalImage: function (src) {
            return typeof src == 'string' ? src.replace(/(ids\/[0-9]+)-([0-9-]+)\//, "$1/") : src;
        },

		/**
		 *       Change the width & height from a given VTEX image source
		 *       @method module:i2bmod.Utils#getResizedImage
		 *       @access public
		 *       @param {string} src - The source of the image
		 *       @param {int|string} width - The new image with
		 *       @param {int|string} height - The new image height
		 *       @returns {string} The resized image source
		 *       @example
		 * //Given an image thumb source
		 *i2bmod.Utils.getResizedImage('http://i2bmod.vteximg.com.br/arquivos/ids/155242-292-292/image.png', 500, 600);
		 * //Output: http://i2bmod.vteximg.com.br/arquivos/ids/155242-500-600/image.png
		 *
		 * //Given a full image source
		 * i2bmod.Utils.getResizedImage('http://i2bmod.vteximg.com.br/arquivos/ids/155242/image.png', 100, 100);
		 * //Output: http://i2bmod.vteximg.com.br/arquivos/ids/155242-100-100/image.png
		 */

        getResizedImage: function (src, width, height) {

            if (width === undefined || height === undefined || typeof src != 'string')
                return src;

            src = src.replace(/(?:ids\/[0-9]+)-([0-9]+)-([0-9]+)\//, function (match, matchedWidth, matchedHeight) {
                return match.replace("-" + matchedWidth + "-" + matchedHeight, "-" + width + "-" + height);
            });

            return src.replace(/(ids\/[0-9]+)\//, "$1-" + width + "-" + height + "/");
        },

		/**
		 *       Check if the given price is valid
		 *       @method module:i2bmod.Utils#isValidPrice
		 *       @access public
		 *       @param {string} price - The price to check
		 *       @param {string} [thousand=","] - The thousands separator
		 *       @param {string} [decimal="."] - The decimal separator
		 *			@param {int} [decimalLength=2] - The decimal length
		 *       @returns {boolean}
		 *
		 */

        isValidPrice: function (price, thousands, decimal, decimalLength) {
            //^[0-9]{1,3}(?:\,(?:(?:[0-9]{3}(?:,|))+))?(?:\.[0-9]{0,2})?$
            thousands = thousands || ",";
            decimal = decimal || ".";
            decimalLength = typeof decimalLength !== 'number' ? 2 : decimalLength;
            var regex = new RegExp("^[0-9]{1,3}(?:\\" + thousands + "(?:(?:[0-9]{3}(?:" + thousands + "|))+))?(?:\\" + decimal + "[0-9]{0," + decimalLength + "})?$");
            return regex.test(price.toString());
        },

		/**
		 *       Get a product by product Id using VTEX API Search
		 *       @method module:i2bmod.Utils#getProduct
		 *       @access public
		 *       @param {string/int} product - The product Id
		 *       @returns {Promise} - Promise
		 *
		 */


        getProduct: function (product) {

            if (!("products" in Cache))
                Cache.products = {};

            if (typeof Cache.products[product] !== "undefined" && typeof Cache.products[product].done !== "undefined") { //Return promise
                return Cache.products[product];
            }

            return $.Deferred(function () {
                var def = this;

                if (typeof Cache.products[product] !== "undefined") //Item is in cache, return it.
                    return def.resolve(Cache.products[product]);

                Cache.products[product] = def;

                $.ajax({
                    url: API_URL.SEARCH + "?fq=productId:" + product,
                    dataType: "json",
                    success: function (response) {
                        Cache.products[product] = response;
                        def.resolve(response);
                    },
                    error: function () {
                        Cache.products[product] = undefined;
                        def.reject();
                    }
                });

            }).promise();

        },

		/**
		 *       Get a product by sku Id using VTEX API Search
		 *       @method module:i2bmod.Utils#getSKU
		 *       @access public
		 *       @param {string/int} sku - The sku Id
		 *       @returns {Promise} - Promise
		 *
		 */

        getSKU: function (sku) {
            if (!("skus" in Cache))
                Cache.skus = {};

            if (typeof Cache.skus[sku] !== "undefined" && typeof Cache.skus[sku].done !== "undefined") { //Return promise
                return Cache.skus[sku];
            }

            return $.Deferred(function () {
                var def = this;

                if (typeof Cache.skus[sku] !== "undefined") //Item is in cache, return it.
                    return def.resolve(Cache.skus[sku]);

                Cache.skus[sku] = def;

                $.ajax({
                    url: API_URL.SEARCH + "?fq=skuId:" + sku,
                    dataType: "json",
                    success: function (response) {
                        Cache.skus[sku] = response;
                        def.resolve(response);
                    },
                    error: function () {
                        Cache.skus[sku] = undefined;
                        def.reject();
                    }
                });

            }).promise();

        },

		/**
		 *       get country file
		 *       @method module:i2bmod.Utils#getCountryFile
		 *       @access public
		 *       @param {string} [countryCode="ARG"] - The country code
		 *       @returns {promise}
		 *       @example
		 *i2bmod.Utils.getCountryFile().done(function(file){
		 *		console.log(file);
		 *		//https://io.vtex.com.br/front.shipping-data/2.10.2/script/rule/CountryARG.js
		 *});
		 */

        getCountryFile: function (countryCode) {
            return $.Deferred(function () {

                var _def = this;

                var bucketSearchUrl = "https://io.vtex.com.br/?prefix=front.shipping-data";
                var fileUrlPrefix = "https://io.vtex.com.br/";

                if (typeof countryCode == "undefined") countryCode = "ARG";

                $.ajax({
                    url: bucketSearchUrl,
                    type: "get",
                    dataType: "xml",
                    success: function (res) {
                        var file = false;
                        $(res).find("Contents Key").each(function () {
                            if (this.innerHTML.match("front.shipping-data/[0-9\.]+/script/rule/Country" + countryCode + ".js$")) {
                                file = this.innerHTML;
                            }
                        });

                        if (file) _def.resolve(fileUrlPrefix + file);
                        else _def.reject();
                    },
                    error: function () {
                        _def.reject();
                    }
                });

            }).promise();
        },


		/**
		 *       Add SKU's to cart
		 *       @method module:i2bmod.Utils#addSKU
		 *       @access public
		 *       @param {int|object} SKUs - A key/value pair indicating SKU & quantity to add
		 *       @param {int|string} [salesChannel=1] - The sales channel
		 *       @param {int|string} [seller=1] - The seller
		 *       @param {object} [extra=""] - Extra url parameters, utmi_cp
		 *		 	@param {string} [url] - The Host URL, used only for multiple sites sharing same checkout. Ie: http://example.com  - Without trailing slash
		 *       @returns {promise} jQuery Ajax Promise
		 *       @example
		 *i2bmod.Utils.addSKU({ sku1: qty1, sku2: qty2 });
		 *i2bmod.Utils.addSKU(sku); //default quantity 1
		 *i2bmod.Utils.addSKU({ sku1: qty1 }, '1', '1', { utmi_cp: 2, utmi_campaign: 'google'  });
		 */

        addSKU: function (SKUs, salesChannel, seller, extra, url) {

            var qty = 1;
            var params = "";

            salesChannel = salesChannel || 1;
            seller = seller || 1;

            if (typeof SKUs == "object") {
                for (var sku in SKUs)
                    params += "sku=" + sku + "&qty=" + SKUs[sku] + "&seller=" + seller + "&";

                params = params.substring(0, params.length - 1);

            } else {
                params = "sku=" + SKUs + "&qty=" + qty + "&seller=" + seller;
            }

            return $.ajax({
                url: (url || "") + "/checkout/cart/add?" + params + "&redirect=false&sc=" + salesChannel + Utils.serialize(extra, true)
            });

        },

		/**
		 *      	Remove the given SKU's from the cart
		 *       @method module:i2bmod.Utils#removeSKU
		 *			@param {int/Array} skus - The sku's to remove.
		 *       @access public
		 *       @returns {promise} Order Form
		 *       @example
		 *i2bmod.Utils.removeSKU([123,125]).done(function(orderForm){ console.log(orderForm); });
		 */

        removeSKU: function (skus) {
            skus = skus instanceof Array ? skus : [skus];

            skus = skus.map(function (sku) {
                return sku | 0;
            }); //String to int conversion

            return $.Deferred(function () {
                var def = this;
                vtexjs.checkout.getOrderForm().then(function (orderForm) {
                    var itemsToRemove = [];

                    for (var i = 0, len = orderForm.items.length; i < len; i++) {
                        if (~skus.indexOf(orderForm.items[i].id | 0)) {
                            orderForm.items[i].index = i;
                            itemsToRemove.push(orderForm.items[i]);
                        }

                    }

                    return vtexjs.checkout.removeItems(itemsToRemove).done(function (orderForm) {
                        def.resolve(orderForm);
                    });

                });
            }).promise();
        },

		/**
		 *       Empty the cart
		 *       @method module:i2bmod.Utils#emptyCart
		 *       @access public
		 *       @returns {promise} Order Form
		 *       @example
		 *i2bmod.Utils.emptyCart().done(function(orderForm){ console.log(orderForm); });
		 */

        emptyCart: function () {
            return $.Deferred(function () {
                var def = this;
                vtexjs.checkout.getOrderForm().done(function (orderForm) {
                    if (orderForm.items.length) {
                        return vtexjs.checkout.removeAllItems(orderForm.items).done(function (orderForm) {
                            def.resolve(orderForm);
                        });
                    }
                    return def.resolve(orderForm);
                }).fail(function () {
                    def.reject();
                });
            }).promise();
        },


		/**
		 *       Check if the user is logged into VTEX
		 *       @method module:i2bmod.Utils#checkLogin
		 *       @access public
		 *       @returns {promise} jQuery Ajax Promise
		 */

        checkLogin: function () {

            return $.Deferred(function () {
                var def = this;

                $.ajax({
                    type: "GET",
                    url: "/no-cache/profileSystem/getProfile",
                    data: {},
                    success: function (res) {
                        if (typeof res.IsUserDefined == "undefined" || !res.IsUserDefined) {
                            def.reject(res);
                        } else def.resolve(res);
                    },
                    error: function () {
                        def.reject();
                    }
                });
            }).promise();
        },

		/**
		 *       Get category tree
		 *       @method module:i2bmod.Utils#getCategories
		 *			@param [depth=50] - The tree depth
		 *			@param [categoryId] - Return the specific Category
		 *       @access public
		 *       @returns {promise} Promise
		 */

        getCategories: function (depth, categoryId) {

            return $.Deferred(function () {
                var def = this;
                $.ajax({
                    type: "GET",
                    url: "/api/catalog_system/pub/category/tree/" + (depth || 50),
                    dataType: "json",
                    headers: {
                        accept: "application/json",
                        contentType: "application/json; charset=utf-8",
                    },
                    success: function (response) {
                        if (typeof categoryId !== "undefined")
                            def.resolve(Utils.objectSearch(response, {
                                id: categoryId
                            }));
                        else def.resolve(response);
                    },
                    error: function () {
                        def.reject();
                    }
                });
            }).promise();
        },

		/**
		 *       Get Search total items
		 *       @method module:i2bmod.Utils#getCategories
		 *			@param [query] - API Search query string
		 *       @access public
		 *       @returns {promise}
		 */

        getSearchTotalItems: function (query) {

            var deferred = $.Deferred();

            $.ajax({
                url: "/api/catalog_system/pub/products/search/" + (query || ""),
                type: "GET",
                headers: {
                    resources: '0-0'
                },
                success: function (response, status, request) {
                    deferred.resolve(request.getResponseHeader("resources").split("/").pop());
                },
                error: function () {
                    deferred.reject();
                }
            });

            return deferred.promise();

        },




		/**
		 *		Add an animation listener for the given animation name
		 *		@access public
		 *    @method module:i2bmod.Utils#addAnimation
		 *    @param {object} SKUs - The source of the image
		 *   	@param {int|string} [salesChannel=1] - The sales channel
		 *    @param {int|string} [seller=1] - The seller
		 *    @example
		 *i2bmod.Utils.addAnimation('nodeInserted', myFunction);
		 *
		 */

        addAnimation: function (name, callback) {

            if (!Object.keys(_animationCallbacks).length) {
                document.addEventListener("animationstart", function (e) {
                    if (e.animationName in _animationCallbacks) {
                        for (var i = 0, animationLength = _animationCallbacks[e.animationName].length; i < animationLength; i++) {
                            _animationCallbacks[e.animationName][i].call(null, e);
                        }
                    }
                });

                document.addEventListener("webkitAnimationStart", function (e) {
                    if (e.animationName in _animationCallbacks) {
                        for (var i = 0, animationLength = _animationCallbacks[e.animationName].length; i < animationLength; i++) {
                            _animationCallbacks[e.animationName][i].call(null, e);
                        }
                    }

                });

                document.addEventListener("MSAnimationStart", function (e) {
                    if (e.animationName in _animationCallbacks) {
                        for (var i = 0, animationLength = _animationCallbacks[e.animationName].length; i < animationLength; i++) {
                            _animationCallbacks[e.animationName][i].call(null, e);
                        }
                    }

                });

                document.addEventListener("oAnimationStart", function (e) {
                    if (e.animationName in _animationCallbacks) {
                        for (var i = 0, animationLength = _animationCallbacks[e.animationName].length; i < animationLength; i++) {
                            _animationCallbacks[e.animationName][i].call(null, e);
                        }
                    }

                });

                document.addEventListener("mozAnimationStart", function (e) {
                    if (e.animationName in _animationCallbacks) {
                        for (var i = 0, animationLength = _animationCallbacks[e.animationName].length; i < animationLength; i++) {
                            _animationCallbacks[e.animationName][i].call(null, e);
                        }
                    }

                });

            }
            if (!(_animationCallbacks[name] instanceof Array))
                _animationCallbacks[name] = [];
            _animationCallbacks[name].push(callback);

        },

		/**
		 *      set a cookie
		 *      @method module:i2bmod.Utils#setCookie
		 *      @access public
		 *      @param {string} cname - The name of the cookie
		 *      @param {mixed} cvalue - The value of the cookie, if the value is an object, it will be JSON encoded
		 *      @param {int} [cvalue] - Expiration days, if not set the cookie will last through the session only.
		 *      @returns {void}
		 */

        setCookie: function (cname, cvalue, exdays) {
            var expires = "";
            cvalue = typeof cvalue == 'object' ? JSON.stringify(cvalue) : cvalue;

            if (!isNaN(exdays)) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toGMTString() + ";";
            }

            document.cookie = cname + "=" + cvalue + "; " + expires + "path=/";
        },

		/**
		 *      get a cookie
		 *      @method module:i2bmod.Utils#getCookie
		 *      @access public
		 *      @param {string} cname - The name of the cookie to retrieve
		 *      @returns {string/object} The cookie value. If the value is a valid JSON it will be decoded into an object.
		 */

        getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ')
                    c = c.substring(1);
                if (c.indexOf(name) === 0) {
                    var value = c.substring(name.length, c.length);
                    return Utils.isJSON(value) ? JSON.parse(value) : value;
                }

            }
            return "";
        },

		/**
		 *      delete a cookie
		 *      @method module:i2bmod.Utils#deleteCookie
		 *      @access public
		 *      @param {string} cname - The name of the cookie to delete
		 *      @returns {void}
		 */

        deleteCookie: function (cname) {
            this.setCookie(cname, "", -1);
        },

		/**
		 *      Check if a string is a valid mail
		 *      @method module:i2bmod.Utils#isEmail
		 *      @access public
		 *      @param {string} email - The string to check
		 *      @returns {boolean}
		 */

        isEmail: function (email) {
            return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
        },

		/**
		 *      Check if a string is a valid URL
		 *      @method module:i2bmod.Utils#isURL
		 *      @access public
		 *      @param {string} URL - The string to check
		 *      @returns {boolean}
		 */

        isURL: function (URL) {
            return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(URL);
        },


		/**
		 *      Check if a string is a valid JSON
		 *      @method module:i2bmod.Utils#isJSON
		 *      @access public
		 *      @param {string} json - The string to check
		 *      @returns {boolean}
		 */


        isJSON: function (json) {
            try {
                JSON.parse(json);
                return true;
            } catch (e) {
                return false;
            }
        },


		/**
		 *      Validate RUT (Chile)
		 *      @method module:i2bmod.Utils#isRUT
		 *      @access public
		 *      @param {string} rut - The rut to validate
		 *      @returns {boolean}
		 */

        isRUT: function (rut) {
            if (rut.indexOf("-") > -1) {

                rut = rut.replace(/\./g, "").toUpperCase();
                rut = rut.split("-");

                if (rut.length == 2) {

                    var rutNum = rut[0];
                    var rutLast = rut[1];

                    if (rutLast.length < 3 && rutLast.match(/[0-9kK]/g)) {

                        var sum = 0;
                        var m = 2;

                        for (var i = (rutNum.length - 1); i >= 0; i--) {
                            sum += rutNum[i] * m;
                            m = m == 7 ? 2 : m + 1;
                        }

                        var mod = parseInt(sum / 11);
                        var res = sum - (11 * mod);
                        var last = 11 - res;
                        if (last.toString().length > 2) return false;

                        last = last == 11 ? 0 : (last == 10 ? "K" : last);

                        return last == rutLast;
                    }
                }
            }
            return false;
        },

		/**
		 *      Validate RUC (Perú)
		 *      @method module:i2bmod.Utils#isRUC
		 *      @access public
		 *      @param {string} ruc - The ruc to validate
		 *      @returns {boolean}
		 */

        isRUC: function (ruc) {
            if (ruc.match(/[^0-9]+/g) === null && ruc.length == 11) {

                var rucFirstTwo = ruc.substr(0, 2);

                if (rucFirstTwo != "10" && rucFirstTwo != "15" && rucFirstTwo != "17" && rucFirstTwo != "20") return false;

                var num;
                var i;
                var sum = 0;
                var m = 5;

                for (i = 0; i < 4; i++) {
                    num = ruc[i];
                    sum += parseInt(num) * m;
                    m--;
                }

                m = 7;
                for (i = 4; i < 10; i++) {
                    num = ruc[i];
                    sum += parseInt(num) * m;
                    m--;
                }

                var intNum = parseInt(sum / 11);
                var aux = 11 - (sum - intNum * 11);
                var res = aux == 10 ? 0 : (aux == 11 ? 1 : aux);

                return res == ruc[10];

            }

            return false;
        },

		/**
		 *      Validate RFC (Mexico)
		 *      @method module:i2bmod.Utils#isRFC
		 *      @access public
		 *      @param {string} RFC - The RFC to validate
		 *      @returns {boolean}
		 */

        isRFC: function (RFC) {
            return /[A-Z\{\¡\!\"\#\$\&\%\/\(\)\=]{3,4} ?([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]) ?[A-z0-9]{3}/i.test(RFC);
        },

		/**
		 *      Return an array with unique values
		 *      @method module:i2bmod.Utils#arrayUnique
		 *      @access public
		 *      @param {Array} arr - The array
		 *      @returns {Array}
		 */

        arrayUnique: function (arr) {

            return arr.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });

        },

		/**
		 *      	Search through an object recursively and return the first match of the key:value passed
		 *      	@method module:i2bmod.Utils#objectSearch
		 *      	@access public
		 *      	@param {Object} object - The haystack
		 *		  	@param {Object} needle - Key value pair that will be searched
		 *      	@returns {Object}
		 *			@example
		 *var data = [{
		 *	id: 0,
		 *	name: 'key 0',
		 *	children: [{
		 *		id: 1,
		 *		name: 'key 1',
		 *		children: [{
		 *			id: 2,
		 *			name: 'key 2',
		 *			item: [{
		 *				id: 3,
		 *				name: 'key 3'
		 *			}],
		 *			item: [{
		 *				id: 4,
		 *				name: 'key 4'
		 *			}]
		 *		}]
		 *	}]
		 *}];
		 *i2bmod.Utils.objectSearch(data, {id: 4}); //{ id: 4, name: 'key 4'};
		 */

        objectSearch: function (object, needle) {

            var p, key, val, tRet;
            for (p in needle) {
                if (needle.hasOwnProperty(p)) {
                    key = p;
                    val = needle[p];
                }
            }

            for (p in object) {
                if (p == key) {
                    if (object[p] == val) {
                        return object;
                    }
                } else if (object[p] instanceof Object) {
                    if (object.hasOwnProperty(p)) {
                        tRet = Utils.objectSearch(object[p], needle);
                        if (tRet) {
                            return tRet;
                        }
                    }
                }
            }

            return false;

        },

		/**
		 *      Serialize an object into query string
		 *      @method module:i2bmod.Utils#serialize
		 *      @access public
		 *      @param {object} object - The object that will be converted into query string
		 *      @param {boolean} addAmp - Whether to add ampersand at the beginning or not.
		 *      @returns {string} A valid query string
		 */

        serialize: function (object, addAmp) {
            if (typeof object !== 'object')
                return "";

            var str = [];
            for (var p in object) {
                if (object.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(object[p]));
                }
            }
            return (addAmp ? "&" : "") + str.join("&");

        },

		/**
		 *      Unserialize a query string into an object
		 *      @method module:i2bmod.Utils#unserialize
		 *      @access public
		 *      @param {string} string - The object that will be converted into query string
		 *      @returns {object}
		 */

        unserialize: function (string) {
            var query = {};

            if (string.indexOf("?") === 0)
                string = string.substr(1);

            var parts = string.split('&');
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].split('=');
                query[decodeURIComponent(part[0])] = decodeURIComponent(part[1] || '');
            }
            return query;
        },

		/**
		 *          Join array elements with glue string - PHP implode alike
		 *          @method module:i2bmod.Utils#implode
		 *          @access public
		 *          @param {object|array} pieces - The array|object to implode.  If object it will implode the values, not the keys.
		 *          @param {string} [glue=','] - The glue
		 *          @returns {string} The imploded array|object
		 *          @example i2bmod.implode(['Foo', 'Bar']); //'Foo,Bar'
		 *
		 */

        implode: function (pieces, glue) {

            if (pieces instanceof Array)
                return pieces.join(glue || ",");

            else if (typeof pieces === 'object') {
                var arr = [];
                for (var o in pieces) {
                    arr.push(pieces[o]);
                }

                return arr.join(glue || ",");
            }

            return "";
        },

		/**
		 *          Formats a number
		 *          @method module:i2bmod.Utils#formatPrice
		 *          @param {number|string} number - The number to format
		 *          @param {string} [thousands="."] - thousands delimiter
		 *          @param {string} [decimals=","] - decimal delimiter
		 *          @param {integer} [length=2] - length of decimal
		 *          @param {boolean/string} [currency] - If true, the currency setted with i2bmod.Utils.setCurrency("$") will be added, if a currency (string) is passed it will use that instead;
		 *          @returns {string} The formatted price
		 */

        formatPrice: function (number, thousands, decimals, length, currency) {
            currency = this.currency ? this.currency : (typeof currency == "string" ? currency : "");
            length = typeof length !== 'number' ? 2 : length;

            var re = '\\d(?=(\\d{' + (3) + '})+' + (length > 0 ? '\\D' : '$') + ')';
            number = (number * 1).toFixed(Math.max(0, ~~length));

            return currency + number.replace('.', (decimals || ",")).replace(new RegExp(re, 'g'), '$&' + (thousands || '.'));
        },


		/**
		 *          Sets the currency that will be used by helper functions
		 *          @method module:i2bmod.Utils#setCurrency
		 *          @param {string} currency - The currency
		 */

        setCurrency: function (currency) {
            this.currency = currency;
        },


		/**
		 *          Formats a date (dd/mm/yyyy hh:mm:ss)
		 *          @method module:i2bmod.Utils#formatDate
		 *          @param {object} date - Date object
		 *          @returns {string} The formatted date
		 */

        formatDate: function (date) {
            if (typeof date == "object") {
                var minutes = date.getMinutes();
                var hour = date.getHours();
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var seconds = date.getSeconds();

                month = month > 9 ? month : "0" + month;
                day = day > 9 ? day : "0" + day;
                hour = hour > 9 ? hour : "0" + hour;
                minutes = minutes > 9 ? minutes : "0" + minutes;
                seconds = seconds > 9 ? seconds : "0" + seconds;

                return day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;
            }

            return null;

        },

		/**
		 *       Multiple string replace, PHP str_replace clone
		 *       @method module:i2bmod.Utils#strReplace
		 *       @param {string|Array} search - The value being searched for, otherwise known as the needle. An array may be used to designate multiple needles.
		 *       @param {string|Array} replace - The replacement value that replaces found search values. An array may be used to designate multiple replacements.
		 *       @param {string} subject - The subject of the replacement
		 *       @returns {string} The modified string
		 *       @example i2bmod.Utils.strReplace(["hola", "mundo"], ["hello", "world"], "hola mundo"); //Output "hello world"
		 *i2bmod.Utils.strReplace(["uno", "dos"], "hola", "uno dos tres"); //Output "hola hola tres"
		 */

        strReplace: function (search, replace, subject) {
            var regex;
            if (search instanceof Array) {
                for (var i = 0; i < search.length; i++) {
                    search[i] = search[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                    regex = new RegExp(search[i], "g");
                    subject = subject.replace(regex, (replace instanceof Array ? replace[i] : replace));
                }
            } else {
                search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                regex = new RegExp(search, "g");
                subject = subject.replace(regex, (replace instanceof Array ? replace[0] : replace));
            }

            return subject;
        },

		/**
		 *       Removes the host from an URL
		 *       @method module:i2bmod.Utils#stripHost
		 *       @param {string} URL - The URL
		 *       @returns {string} The modified string
		 *       @example i2bmod.Utils.stripHost("http://test.vtexcommercestable.com.br/contacto/test"); //  "/contacto/test"
		 */

        stripHost: function (URL) {
            return URL.toString().replace(/https?:\/\/.*?\//i, "/");
        },


		/**
		 *       Removes the host from an URL
		 *       @method module:i2bmod.Utils#addHttp
		 *       @param {string} URL - The URL
		 *       @returns {string} The modified string
		 *       @example i2bmod.Utils.addHttp("google.com.ar"); //  "http://google.com.ar"
		 */

        addHttp: function (URL) {
            if (!/^(?:f|ht)tps?:\/\//i.test(URL))
                URL = "http://" + URL;
            return URL;
        },

		/**
		 *       Sanitize a string, removing/replacing all special characters and spaces with underscore
		 *       @method module:i2bmod.Utils#sanitizeString
		 *       @param {string} str - The string to sanitize
		 *       @param {string} [replace="-"] - The string to replace white spaces with, default "-"
		 *       @returns {string} The modified string
		 *       @example i2bmod.Utils.sanitizeString("hóla múndo"); //Output "hola-mundo"
		 */


        sanitizeString: function (str, replace) {
            replace = typeof replace == "string" ? replace : "-";

            str = str.toLowerCase();
            str = str.replace(/[\[\]\(\)\-\{\}\^]/g, "");
            str = str.replace(/[àáâãäåª]/g, "a");
            str = str.replace(/[éèëê]/g, "e");
            str = str.replace(/[íìïî]/g, "i");
            str = str.replace(/[óòöô]/g, "o");
            str = str.replace(/[úùüû]/g, "u");
            str = str.replace(/[ñ]/g, "n");
            str = str.replace(/[ç]/g, "c");
            str = str.replace(/ /g, replace);
            return str;

        },

		/**
		 *       Capitalize a string
		 *       @method module:i2bmod.Utils#capitalize
		 *       @param {string} URL - The String
		 *       @returns {string} The modified string
		 *       @example i2bmod.Utils.capitalize("foo bar"); //  "Foo Bar"
		 */


        capitalize: function (str) {
            return str.replace(/(?:^|\s)\S/g, function (match) {
                return match.toUpperCase();
            });
        },

		/**
		 *      Get window height
		 *      @method module:i2bmod.Utils#getWindowHeight
		 *      @returns {int} The modified string
		 */

        getWindowHeight: function () {
            return window.innerHeight ? window.innerHeight : $(window).height();
        },

		/**
		 *      Get window width
		 *      @method module:i2bmod.Utils#getWindowWidth
		 *      @returns {int} The modified string;
		 */

        getWindowWidth: function () {
            return $(window).width();
        },


		/**
		 *      Get location origin
		 *      @method module:i2bmod.Utils#getLocationOrigin
		 *      @returns {string} The location origin, ie: http://host.com
		 */

        getLocationOrigin: function () {
            if (!window.location.origin)
                return window.location.protocol + "\/\/" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            return window.location.origin;
        },

		/**
		 *      Check whether the browser is IE and return the version if so.
		 *      @method module:i2bmod.Utils#detectIE
		 *      @returns {string} The IE version or false if other browser
		 */

        detectIE: function () {
            var ua = window.navigator.userAgent;

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // IE 12 => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        },

		/**
		 *      Check whether a the device supports touch or not.
		 *      @method module:i2bmod.Utils#isTouchDevice
		 *      @returns {boolean}
		 */


        isTouchDevice: function () {
            return supportsTouch;
        },

		/**
		 *      Return the length of an item (Object mostly)
		 *      @method module:i2bmod.Utils#length
		 *		  @param {mixed}
		 *      @returns {int}
		 */

        length: function (item) {

            if (typeof item.length != "undefined")
                return item.length;

            if (typeof item == "object")
                return Object.keys(item).length;

            return 0;
        },

		/**
		 *      @method module:i2bmod.Utils#delay
		 *		  @param {array} timeouts -  An array of milliseconds on which the callbacks will be executed
		 *		  @param {...functions} callbacks
		 *      @returns {int}
		 */

        delay: function () {

            var timeouts = Array.prototype.shift.call(arguments);
            var callbacks = Array.prototype.slice.call(arguments);

            var func = function () {
                var callbacksLength = callbacks.length;
                while (callbacksLength--) {
                    callbacks[callbacksLength].call(null);
                }
            };

            for (var i = 0, len = timeouts.length; i < len; i++) {
                setTimeout(func, timeouts[i]);
            }

        },

        googleMapLoaded: function () {
            return typeof google !== "undefined" && typeof google.maps !== "undefined";
        },

		/**
		 *			@method module:i2bmod.Utils#buildQueryString
		 *			@param {mixed} name - The param name
		 *			@param {mixed} value - The param value
		 *			@param {string} [queryString] - The url/query string where the values will be added/removed
		 *			@returns String The new url / query string
		 *			@example i2bmod.Utils.buildQueryString("param", "value") // Adds param=value to current query string
		 *			i2bmod.Utils.buildQueryString("param", undefined) // Removes param from current query string
		 *			i2bmod.Utils.buildQueryString(["param1", "param2"], ["value1", "value2"]) // Adds param1=value1 and param2=value2 to current query string
		 *			i2bmod.Utils.buildQueryString("param", "value", "?myParam=4&foo=bar") // Adds param=value to passed query string
		 *			i2bmod.Utils.buildQueryString("param", "value", "/foo/var") // Adds param=value to passed url
		 */

        buildQueryString: function (name, value, url) {

            url = url || location.search;
            url = url.split("?");

            var path = url[0] || "";
            var queryString = url[1] || "";

            var _obj = {};
            var arr = queryString.split("&");
            if (arr[0] == "") arr.pop();


            // Parsea los valores de "queryString"
            $.each(arr, function () {
                var _tmp = this.split("=");
                if (_tmp[0] == "fq") {

                    var parts = _tmp[1].split(":");

                    if (typeof _obj["fq"] == "undefined") _obj["fq"] = {};
                    _obj["fq"][parts[0]] = parts[1] || "";

                } else _obj[_tmp[0]] = _tmp[1] || "";
            });

            // Modifica los que se pasan por parámetro
            if (typeof name == "object" && typeof value == "object") $.each(name, function (i, e) {
                if (name[i] == "fq") {
                    var parts = value[i].split(":");
                    if (typeof _obj[name[i]] == "undefined") _obj[name[i]] = {};
                    _obj[name[i]][parts[0]] = parts[1] || undefined;
                }
                _obj[name[i]] = value[i] || undefined;
            });
            else {
                if (name == "fq") {

                    var parts = value.split(":");
                    if (typeof _obj[name] == "undefined") _obj[name] = {};
                    _obj[name][parts[0]] = parts[1] || undefined;

                } else _obj[name] = value || undefined;
            }

            // Arma el query string con los valores modificados
            var _p = "?";

            var first = true;
            $.each(_obj, function (i, e) {
                if (typeof e == "undefined") return; // Si el valor es undefined, se saca del query string

                if (i == "fq") {

                    $.each(e, function (ii, ee) {
                        first ? first = !first : _p += "&";
                        _p += i + "=" + ii + ":" + ee;
                    });

                } else {
                    first ? first = !first : _p += "&";
                    _p += i + "=" + e;
                }
            })

            if (_p == "?") _p = "";

            return path + _p;
        }

    };

    i2bmod.prototype.Utils = Utils;





    var onceEventsCallbacksQueue = {
        custom: {}
    };

    var eventsCallbacksQueue = {
        resize: [],
        resizeStop: [],
        hashChange: [],
        custom: {}
    };

    var addEvent = function (object, type, callback) {
        if (object === null || typeof (object) == 'undefined') return;
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
        } else if (object.attachEvent) {
            object.attachEvent("on" + type, callback);
        } else {
            object["on" + type] = callback;
        }
    };

    var resizeStopTimeout;
    addEvent(window, "resize", function (event) {
        for (var i = 0, length = eventsCallbacksQueue.resize.length; i < length; i++) {
            eventsCallbacksQueue.resize[i].call(null, event);
        }

        if (eventsCallbacksQueue.resizeStop.length) {
            resizeStopTimeout = setTimeout(function () {
                for (var i = 0, length = eventsCallbacksQueue.resizeStop.length; i < length; i++) {
                    eventsCallbacksQueue.resizeStop[i].call(null, event);
                }
            }, 100);
        }
    });

    addEvent(window, "hashchange", function (event) {
        for (var i = 0, length = eventsCallbacksQueue.hashChange.length; i < length; i++) {
            eventsCallbacksQueue.hashChange[i].call(null, event);
        }
    });

	/**
	 *    i2bmod Events
	 *    @class module:i2bmod.Events
	 *    @author Marcos Casagrande
	 *    @example
	 *		i2bmod.Events.resize(function(e){
	 *			console.log("Window resized!");
	 *		})
	 *		.resizeStop(function(e){
	 *			console.log("Window resize ended");
	 *		});
	 */


    var Events = {

		/**
		 *		Attach an event listener on a target
		 *		This method accepts:
		 *       - 3 parameters when attaching a event to a DOM element (target, event, callback)
		 * 		- 2 arguments when creating a custom event to be triggered later (event, callback)
		 *		@method module:i2bmod.Events#on
		 *		@access public
		 *
		 *		@example
		 * //attach event to DOM element
		 * i2bmod.Events.on(window, "scroll", function(e){ console.log("Window has scrolled!") });
		 *
		 *	//Custom Event
		 * i2bmod.Events.on("myEvent", function(param, paramN){ console.log("myEvent triggered") });
		 * i2bmod.Events.trigger("myEvent", param, paramN);
		 */

        on: function () {

            if (arguments.length > 2)
                addEvent(arguments[0], arguments[1], arguments[2]); //target, event, callback

            if (arguments.length == 2) {
                var event = arguments[0];
                var callback = arguments[1];
                if (typeof event === "string" && typeof callback === "function") {
                    if (!(event in eventsCallbacksQueue.custom))
                        eventsCallbacksQueue.custom[event] = [];

                    eventsCallbacksQueue.custom[event].push(callback);
                }
            }

            return this;
        },


		/**
		 *		Register an event that will be triggered once
		 *
		 *		@method module:i2bmod.Events#once
		 *		@access public
		 *		@param {string} event - Event name
		 *		@param {function} callback - The function callback
		 *
		 * i2bmod.Events.once("myEvent", function(param, paramN){ console.log("myEvent triggered") });
		 * i2bmod.Events.trigger("myEvent", param, paramN);
		 */

        once: function () {

            if (arguments.length == 2) {
                var event = arguments[0];
                var callback = arguments[1];
                if (typeof event === "string" && typeof callback === "function") {
                    if (!(event in onceEventsCallbacksQueue.custom))
                        onceEventsCallbacksQueue.custom[event] = [];

                    onceEventsCallbacksQueue.custom[event].push(callback);
                }
            }

        },


		/**
		 *	Trigger a registered custom event
		 *	@method module:i2bmod.Events#trigger
		 *	@param {string} - Event
		 *	@example
		 *i2bmod.Events.trigger("myEvent", params);
		 */

        trigger: function (event) {
            if (arguments.length < 1)
                return;

            var i;
            var length;

            Array.prototype.shift.call(arguments);

            if (event in eventsCallbacksQueue.custom) {
                for (i = 0, length = eventsCallbacksQueue.custom[event].length; i < length; i++) {
                    eventsCallbacksQueue.custom[event][i].apply(null, arguments);
                }
            }

            if (event in onceEventsCallbacksQueue.custom) {
                i = onceEventsCallbacksQueue.custom[event].length;
                while (i--) {
                    onceEventsCallbacksQueue.custom[event][i].apply(null, arguments);
                    onceEventsCallbacksQueue.custom[event].splice(i, 1);
                }
            }
        },

		/**
		 *	Window resize event listener
		 *	@method module:i2bmod.Events#resize
		 *	@param {function} callback - The callback that will be called upon window resize, event will be passed along.
		 *	@return {object} i2bmod.Events (chainable)
		 */

        resize: function (callback) {
            eventsCallbacksQueue.resize.push(callback);
            return this;
        },

		/**
		 *	Window resize stop event listener
		 *	@method module:i2bmod.Events#resizeStop
		 *	@param {function} callback - The callback that will be called upon window resize stop, event will be passed along.
		 *	@return {object} i2bmod.Events (chainable)
		 */

        resizeStop: function (callback) {
            eventsCallbacksQueue.resizeStop.push(callback);
            return this;
        },

		/**
		 *	Window hashchange listener, The hashchange event fires when a window's hash changes (location.hash)
		 *	@method module:i2bmod.Events#hashChange
		 *	@param {function} callback - The callback that will be called upon window hash change, event will be passed along.
		 *	@return {object} i2bmod.Events (chainable)
		 */

        hashChange: function (callback) {
            eventsCallbacksQueue.hashChange.push(callback);
            return this;
        }
    };

    i2bmod.prototype.Events = Events;






	/**
	 *    i2bmod Checkout
	 *    @class module:i2bmod.Checkout
	 *    @author Marcos Casagrande
	 *    @example
	 *i2bmod.Checkout.onCart(function(){
	 *	console.log("Checkout Cart!");
	 *})
	 *.onEmail(function(e){
	 *	console.log("Checkout Emails!");
	 *});
	 */


    i2bmod.prototype.Checkout = (function () {

        var hashEvents = ["cart", "email", "profile", "shipping", "payment"];
        var GTMEvents = ["orderPlaced", "cartLoaded"]; //This events are called only once.

        var eventType = {
            ON: 1,
            ONCE: 2
        };

        var checkoutEventsCallback = {
            cart: [],
            email: [],
            profile: [],
            shipping: [],
            payment: [],
            cartLoaded: [],
            orderPlaced: [],
            itemsUpdated: []
        };

        var checkoutOnceEventsCallback = {
            cart: [],
            email: [],
            profile: [],
            shipping: [],
            payment: [],
            cartLoaded: [],
            orderPlaced: [],
            itemsUpdated: []
        };


        function Checkout() { }

        function setCheckoutStepClass(step) {
            if (~hashEvents.indexOf(step)) {
                var actualClass = step + "Step";
                var removeClasses = hashEvents.join("Step ");
                removeClasses.replace(actualClass, "");
                $("body").removeClass(removeClasses).addClass(actualClass);
            }
        }

        function eventCallback(event, type, extra, tagManager) {
            var j;

            setCheckoutStepClass(event);

            if ((type & eventType.ON) && event in checkoutEventsCallback) {
                j = checkoutEventsCallback[event].length;
                while (j--) {
                    checkoutEventsCallback[event][j].call(null, event, extra);
                }
            }

            if ((type & eventType.ONCE) && event in checkoutOnceEventsCallback) {
                j = checkoutOnceEventsCallback[event].length;
                while (j--) {
                    checkoutOnceEventsCallback[event][j].call(null, event, extra);
                    checkoutOnceEventsCallback[event].splice(j, 1);
                }
            }

            return;
        }

        setCheckoutStepClass(window.location.hash.replace(/[^A-Z]/gi, ""));


        Checkout.prototype = {

			/**
			 *		Listen to the given checkout event only once, the event will only fire ONCE.
			 *		@method module:i2bmod.Checkout#once
			 *    @access public
			 *		@param {string} events - The events to listen to
			 *		@param {...function} callback - The callback that will be called upon entering the given event.
			 *		@returns {object} i2bmod.Checkout (chainable)
			 *		@example
			 *i2bmod.Checkout.once("cart", function(){
			 *	vtexjs.checkout.orderForm().done(function(){
			 *
			 *	});
			 *});
			 */

            once: function () {
                var events = Array.prototype.shift.call(arguments).split(" ");
                var callbacks = Array.prototype.slice.call(arguments);

                var location = window.location.hash.toLowerCase();

                for (var i = 0, len = events.length; i < len; i++) {

                    if (~GTMEvents.indexOf(events[i])) {
                        TagManager.once.apply(null, [events[i]].concat(Array.prototype.slice.call(arguments)));
                    } else {
                        if (~location.indexOf(events[i])) {
                            setCheckoutStepClass(events[i]);
                            for (var j = 0, callbacksLength = callbacks.length; j < callbacksLength; j++) {
                                callbacks[j].call(null, events[i]);
                            }
                        } else if (events[i] in checkoutOnceEventsCallback) {
                            checkoutOnceEventsCallback[events[i]] = checkoutOnceEventsCallback[events[i]].concat(callbacks);
                        }
                    }
                }

                return this;
            },

			/**
			 *	Listen to the given checkout event
			 *	@method module:i2bmod.Checkout#on
			 *	@param {string} events - The events to listen to
			 *	@param {...function} callbacks - The callback that will be called upon entering the given event.
			 *	@returns {object} i2bmod.Checkout (chainable)
			 *	@example
			 *i2bmod.Checkout.on("cart payment", function(){
			 *  //some function
			 *},
			 *function(){
			 *  //other function
			 *})
			 */


            on: function () {

                var events = Array.prototype.shift.call(arguments).split(" ");
                var callbacks = Array.prototype.slice.call(arguments);

                var location = window.location.hash.toLowerCase();
                for (var i = 0, len = events.length; i < len; i++) {
                    if (events[i] in checkoutEventsCallback) {

                        if (~GTMEvents.indexOf(events[i])) {
                            TagManager.on.apply(null, [events[i]].concat(Array.prototype.slice.call(arguments)));
                        } else {

                            checkoutEventsCallback[events[i]] = checkoutEventsCallback[events[i]].concat(callbacks);

                            //Hash events
                            if (~location.indexOf(events[i])) {
                                setCheckoutStepClass(events[i]);
                                var j = callbacks.length;
                                while (j--) {
                                    callbacks[j].call(null, events[i]);
                                }
                            }
                        }
                    }
                }
                return this;
            },

			/**
			 *	Checkout view listener.
			 *	@method module:i2bmod.Checkout#onOrderPlaced
			 *	@param {...function} callbacks - The callback that will be called upon entering the checkout.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */


            onCheckout: function () {
                if (window.location.href.match(/\/checkout/)) {
                    var callbacks = Array.prototype.slice.call(arguments);
                    var i = callbacks.length;
                    while (i--) {
                        callbacks[i].call(null, "checkout");
                    }
                }
                return this;
            },

			/**
			 *	Checkout Order Placed page view.
			 *	@method module:i2bmod.Checkout#onOrderPlacedView
			 *	@param {...function} callbacks - The callback that will be called upon entering order placed.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onOrderPlacedView: function () {
                if (window.location.href.match(/\/checkout\/orderPlaced/)) {
                    var callbacks = Array.prototype.slice.call(arguments);
                    var i = callbacks.length;
                    while (i--) {
                        callbacks[i].call(null, "orderPlacedView");
                    }
                }
                return this;
            },

			/**
			 *	Checkout Order Placed event listener.
			 *	@method module:i2bmod.Checkout#onOrderPlaced
			 *	@param {...function} callbacks - The callback that will be called upon orderPlaced event.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onOrderPlaced: function () {
                return this.on.apply(null, ["orderPlaced"].concat(Array.prototype.slice.call(arguments)));
            },


			/**
			 *	Checkout cart view listener, The onCart event fires when the VTEX checkout step is cart.
			 *	@method module:i2bmod.Checkout#onCart
			 *	@param {...function} callbacks - The callback that will be called upon entering the cart view.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onCart: function (callback) {
                return this.on.apply(null, ["cart"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout email view listener, The onEmail event fires when the VTEX checkout step is email.
			 *	@method module:i2bmod.Checkout#onEmail
			 *	@param {...function} callbacks - The callback that will be called upon entering the email view.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onEmail: function (callback) {
                return this.on.apply(null, ["email"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout profile view listener, The onProfile event fires when the VTEX checkout step is profile.
			 *	@method module:i2bmod.Checkout#onProfile
			 *	@param {...function} callbacks - The callback that will be called upon entering the email view.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onProfile: function (callback) {
                return this.on.apply(null, ["profile"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout shipping view listener, The onShipping event fires when the VTEX checkout step is shipping.
			 *	@method module:i2bmod.Checkout#onShipping
			 *	@param {...function} callbacks - The callback that will be called upon entering the email view.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */


            onShipping: function (callback) {
                return this.on.apply(null, ["shipping"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout payment view listener, The onPayment event fires when the VTEX checkout step is shipping.
			 *	@method module:i2bmod.Checkout#onPayment
			 *	@param {...function} callbacks - The callback that will be called upon entering the email view.
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onPayment: function (callback) {
                return this.on.apply(null, ["payment"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout cartLoaded event listener, The onCartLoaded event fires when the VTEX orderForm is loaded for the first time.
			 *	@method module:i2bmod.Checkout#onCartLoaded
			 *	@param {...function} callbacks - The callback that will be called on cart loaded
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onCartLoaded: function (callback) {
                return this.on.apply(null, ["cartLoaded"].concat(Array.prototype.slice.call(arguments)));
            },

			/**
			 *	Checkout itemsUpdated event listener, The onItemsUpdated event fires whenever an item is modified
			 *	@method module:i2bmod.Checkout#onItemsUpdated
			 *	@param {...function} callbacks - The callback that will be called on itemsUpdated
			 *	@return {object} i2bmod.Checkout (chainable)
			 */

            onItemsUpdated: function (callback) {
                return this.on.apply(null, ["itemsUpdated"].concat(Array.prototype.slice.call(arguments)));
            }

        };

        Events.hashChange(function () {
            var location = window.location.hash.toLowerCase();
            console.log("HashChange: " + location);
            var hashes = ["cart", "email", "profile", "shipping", "payment"];

            for (var i = 0, hashesLen = hashes.length; i < hashesLen; i++) {
                var event = hashes[i];
                if (~location.indexOf(event)) {
                    eventCallback(event, eventType.ON | eventType.ONCE);
                }
            }
        });

        /** Detect items Update **/

        $(document).ajaxSuccess(function (event, xhr, settings) {
            try {
                if (settings.url.match(vtexjs.checkout._getUpdateItemURL()) && typeof xhr.responseText != "undefined") {
                    var orderForm = $.parseJSON(xhr.responseText);
                    eventCallback("itemsUpdated", eventType.ON | eventType.ONCE, orderForm);
                }
            } catch (e) { }
        });


        return new Checkout();

    })(window);





    //http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=processJSON&tags=monkey&tagmode=any&format=json
    //TODO
    var JSONP = (function () {
        var unique = 0;
        return function (url, callback, callbackName) {
            // INIT
            return $.Deferred(function () {
                var def = this;
                var callbackName = callbackName || "callback";
                var name = "_jsonp_" + unique++;
                if (url.match(/\?/)) url += "&" + callbackName + "=" + name;
                else url += "?" + callbackName + "=" + name;

                // Create script
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;

                // Setup handler
                window[name] = function (data) {
                    callback.call(window, data);
                    def.resolve(data);
                    document.getElementsByTagName('head')[0].removeChild(script);
                    script = null;
                    delete window[name];
                };

                // Load JSON
                document.getElementsByTagName('head')[0].appendChild(script);
            }).promise();
        };
    })();

    i2bmod.prototype.JSONP = JSONP;

	/**
	 *    i2bmod Ajax
	 *    @class module:i2bmod.Ajax
	 *    @author Marcos Casagrande
	 *    @example
	 *
	 *i2bmod.Ajax.get('http://example.com', { foo: 'bar' }, function(result){  }, 'json');
	 *
	 * //LOWERCASE!
	 *i2bmod.ajax({
	 *    url: "http://example.com",
	 *    type: 'POST', //'GET', 'PATCH', 'POST', 'PUT', 'DELETE'
	 *    data: { foo: 1, bar: "text" },
	 *    headers: { "Content-type": "application/x-www-form-urlencoded" },
	 *    beforeSend: function(xhr){
	 *    //Before send operations
	 *
	 *    },
	 *    success: function(result){
	 *
	 *    //Ajax success callback
	 *
	 *    },
	 *    error: function(xhr){
	 *
	 *       //Ajax error callback
	 *
	 *    }
	 *}).done(function(result){
	 *
	 *}).fail(function(xhr){
	 *
	 *});
	 *
	 */

    var Ajax = (function (window, undefined) {

        function Ajax() {

            var that = this;
            var _priv = {

                parseResult: function (result, type) {
                    if (type !== null && type.toUpperCase() == 'JSON')
                        return Utils.isJSON(result) ? JSON.parse(result) : result;
                    return result;
                }


            };

            this.methods = {
                GET: 'GET',
                PATCH: 'PATCH',
                POST: 'POST',
                PUT: 'PUT',
                DELETE: 'DELETE'
            };


            /** Privileged Methods **/


			/**
			 *       Perform an asynchronous HTTP (Ajax) request
			 *       @method module:i2bmod.Ajax#_call
			 *       @access private
			 *       @param {string} [method='GET] - The HTTP method to use for the request
			 *       @param {string} URL - A string containing the URL to which the request is sent.
			 *       @param {object} settings - A set of key/value pairs that configure the Ajax request. All settings are optional.
			 */

            this._call = function (method, URL, settings) {

                settings = settings || {};

                return $.Deferred(function () {
                    var def = this;

                    var xhr;

                    if (!settings.crossDomain || !window.XDomainRequest) {
                        xhr = new XMLHttpRequest();
                    } else if (window.XDomainRequest) {
                        xhr = new XDomainRequest();
                    }

                    if (!xhr)
                        throw "XMLHttpRequest not supported";

                    var requestMethod = typeof method == "string" ? method.toUpperCase() : that.methods.GET;
                    var queryString = settings.data ? Utils.serialize(settings.data) : "";

                    if (typeof settings.dataType == "string" && settings.dataType.toUpperCase() == 'JSONP') {
                        return JSONP(URL, settings.jsonp); //TODO
                    }

                    xhr.open(requestMethod, URL + (requestMethod == that.methods.GET ? "?" + queryString : ""));

                    switch (requestMethod) {
                        case that.methods.POST:
                            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            break;
                    }

                    if (typeof settings.headers == "object") {
                        for (var header in settings.headers) {
                            xhr.setRequestHeader(header, settings.headers[header]);
                        }
                    }

                    xhr.onload = function () {

                        if (xhr.status == 200 || window.XDomainRequest) { //IE returns no status for 304
                            var response = _priv.parseResult(xhr.responseText, settings.dataType || null);
                            if (settings.success !== undefined)
                                settings.success.call(null, response);
                            def.resolve(response);
                        } else {
                            if (settings.error !== undefined)
                                settings.error.call(null, xhr);
                            def.reject(xhr);
                        }

                    };

                    xhr.onerror = function () {

                        if (settings.error !== undefined)
                            settings.error.call(null, xhr);
                        def.reject(xhr);
                    };

                    if (typeof settings.beforeSend == "function") {
                        settings.beforeSend.call(null, xhr);
                    }

                    xhr.send(queryString);

                }).promise();

            };

        }

        Ajax.prototype = {


			/**
			 *       Perform an asynchronous HTTP GET request
			 *       @method module:i2bmod.Ajax#get
			 *       @param {string} URL - A string containing the URL to which the request is sent.
			 *       @param {object|string} data - Data to be sent to the server. It is converted to a query string, if not already a string. It's appended to the url for GET-requests
			 *       @param {function} success - The success callback function
			 *       @param {string} dataType - The request data Type. e.g: 'json'
			 *       @returns {promise}
			 */

            get: function (URL, data, success, dataType) {

                var settings = {
                    data: data,
                    success: success,
                    dataType: dataType
                };

                return this._call(this.methods.GET, URL, settings);
            },

			/**
			 *       Perform an asynchronous HTTP POST request
			 *       @method module:i2bmod.Ajax#post
			 *       @param {string} URL - A string containing the URL to which the request is sent.
			 *       @param {object|string} data - Data to be sent to the server. It is converted to a query string, if not already a string.
			 *       @param {function} success - The success callback function
			 *       @param {string} dataType - The request data Type. e.g: 'json'
			 *       @returns {promise}
			 */

            post: function (URL, data, success, dataType) {

                var settings = {
                    data: data,
                    success: success,
                    dataType: dataType
                };

                return this._call(this.methods.POST, URL, settings);
            }

        };


        return new Ajax();
    })(window);


	/**
	 *       Performs an asyncronous HTTP (Ajax) request.
	 *       @method module:i2bmod#ajax
	 *       @param {object} options - A set of key/value pairs that configure the Ajax request. All settings are optional A default can be set for any option with i2bmod.Ajax.setup()
	 *       @example
	 *i2bmod.ajax({
	 *    url: "http://example.com",
	 *    type: 'POST', //'GET', 'PATCH', 'POST', 'PUT', 'DELETE'
	 *    data: { foo: 1, bar: "text" },
	 *    headers: { "Content-type": "application/x-www-form-urlencoded" },
	 *    beforeSend: function(xhr){
	 *    //Before send operations
	 *
	 *    },
	 *    success: function(result){
	 *
	 *    //Ajax success callback
	 *
	 *    },
	 *    error: function(xhr){
	 *
	 *       //Ajax error callback
	 *
	 *    }
	 *}).done(function(result){
	 *
	 *}).fail(function(xhr){
	 *
	 *});
	 *
	 */


    i2bmod.prototype.ajax = function (options) {

        return Ajax._call(options.type, options.url, options);

    };

    i2bmod.prototype.Ajax = Ajax;





	/**
	 *      i2bmod Master Data class <br/>
	 *  <b>NOTE:</b> You shouldn't call any underscore methods
	 *      @class module:i2bmod.MasterData
	 *      @author Marcos Casagrande
	 *      @example
	 *i2bmod.MasterData.setStore("fravega"); //Mandatory - Set the current Store
	 *
	 * //[Optional] Set Entity - Default: 'CL'
	 *i2bmod.MasterData.setEntity('CL');
	 *
	 *i2bmod.MasterData.newsletter("marcos@i2bmod.com").done(function(result) {
	 *  if(result.isUpdate()){
	 *      console.log("User updated!");
	 *  }else if(result.isInsert()){
	 *      console.log("New user!");
	 *  }
	 *});
	 */


    i2bmod.prototype.MasterData = (function ($, window, undefined) {
        function MasterData() {

            var that = this;

			/**
			 *      @var {string}
			 *      @description The current storeName, MUST BE EDITED and must be the a valid store name
			 *      @example var storeName = "fravega";
			 */
            var storeName = null;

            /** @constant {string} */
            var API_URL = "\/\/api.vtexcrm.com.br/{storeName}/dataentities/{entity}/{type}/";
            var API_ATTACHMENT_URL = "\/\/api.vtexcrm.com.br/{storeName}/dataentities/{entity}/documents/{id}/{field}/attachments";
			/**
			 *      @var {string}
			 *      @description Default entity that will be used if nothing is specified in every method
			 *      @example var defaultEntity = "CL";
			 */

            var defaultEntity = "CL";

            /** @constant {string} */
            this.OP_INSERT = 'insert';

            /** @constant {string} */
            this.OP_UPDATE = 'update';


			/**
			 *
			 *
			 */

            this.ERR_INVALID_USER = "User doesn't exist";
            this.ERR_INVALID_PARTNER = "Partner doesn't exist";
            this.ERR_INVALID_EMAIL = "Invalid email";

            /** Private Methods */

            var priv = {

                types: {
                    DOCUMENTS: 'documents',
                    SEARCH: 'search',
                    SCHEMAS: 'schemas',
                    FACET: 'search/facet',
                    ATTACHMENT: 'documents'
                },

                _getURL: function (entity, type, id) {

                    entity = entity !== undefined ? entity : defaultEntity;

                    if (storeName === null)
                        throw "storeName is not set, i2bmod.MasterData.setStore(storeName) must be called";

                    return Utils.strReplace(["{storeName}", "{entity}", "{type}"], [storeName, entity, type], API_URL) + (id !== undefined && id !== null ? id : "");
                },

                _getAttachmentURL: function (entity, id, field) {
                    entity = entity !== undefined ? entity : defaultEntity;

                    if (storeName === null)
                        throw "storeName is not set, i2bmod.MasterData.setStore(storeName) must be called";

                    return Utils.strReplace(["{storeName}", "{entity}", "{field}"], [storeName, entity, field], API_ATTACHMENT_URL) + (id !== undefined && id !== null ? id : "");
                },

                _call: function (method, id, data, entity, type, headers) {

                    return $.ajax({
                        url: this._getURL(entity, type, id),
                        type: method,
                        accept: "application/vnd.vtex.ds.v10+json",
                        contentType: "application/json; charset=utf-8",
                        beforeSend: function (request) {
                            for (var header in headers)
                                request.setRequestHeader(header, headers[header]);
                        },
                        crossDomain: true,
                        data: method !== "GET" && data !== null ? JSON.stringify(data) : data
                    });

                },

                _upload: function (id, data, entity, field) {

                    return $.ajax({
                        url: this._getAttachmentURL(entity, id, field),
                        type: 'POST',
                        data: data,
                        processData: false,
                        contentType: false,
                        accept: "application/vnd.vtex.ds.v10+json",
                        enctype: 'multipart/form-data'
                    });

                }


            };


			/**
			 *      i2bmod Success <br /><br />
			 *      <b>NOTE:</b> this class can only be accessed through a i2bmod.MasterData success result
			 *      @class module:i2bmod.MasterData.i2bmodSuccess
			 *      @access public
			 *      @example
			 *i2bmod.MasterData.newsletter("marcos@i2bmod.com").done(function(response) {
			 *  //Get the response results, whatever it might be [array, object, string, integer]
			 *  var results = response.getResults();
			 *  if(response.isUpdate()){
			 *      console.log("User updated!");
			 *  }else if(response.isInsert()){
			 *      console.log("New user!");
			 *  }
			 *});
			 *
			 */

            var i2bmodSuccess = function (result, operation) {

                var _result = result;
                var _operation = operation;


				/**
				 *      To check if the response was successfull or not. Used in "always" callback,
				 *      @method module:i2bmod.MasterData.i2bmodError#isOK
				 *      @access public
				 *      @returns {mixed}
				 */

                this.isOK = function () {
                    return true;
                };

				/**
				 *      Check if the operation was an insert
				 *      @method module:i2bmod.MasterData.i2bmodSuccess#isInsert
				 *      @access public
				 *      @returns {boolean} Whether the operation was an insert or not
				 */

                this.isInsert = function () {
                    return _operation == that.OP_INSERT;
                };

				/**
				 *      Check if the operation was an update
				 *      @method module:i2bmod.MasterData.i2bmodSuccess#isUpdate
				 *      @access public
				 *      @returns {boolean} Whether the operation was an update or not
				 */

                this.isUpdate = function () {
                    return _operation == that.OP_UPDATE;
                };

				/**
				 *      Returns the results of the operation
				 *      @method module:i2bmod.MasterData.i2bmodSuccess#getResults
				 *      @access public
				 *      @returns {mixed}
				 */

                this.getResults = function () {
                    return _result;
                };
            };


			/**
			 *      i2bmod Error <br /><br />
			 *      <b>NOTE:</b> this class can only be accessed through a i2bmod.MasterData error result
			 *      @class module:i2bmod.MasterData.i2bmodError
			 *      @access public
			 *      @example
			 *i2bmod.MasterData.getUser("marcos@i2bmod.com", ["isNewsletterOptIn"]).done(function(response) {
			 * //success
			 *}).fail(function(error){
			 * //error
			 * console.log(error.getResponse());
			 * console.log(error.getMessage());
			 *});
			 *
			 */

            var i2bmodError = function (error) {
                var _response = null;
                var _message = null;


                if (typeof error == 'object') {
                    for (var key in error) {
                        if (error.hasOwnProperty(key) && typeof error[key] !== "function") {
                            if (key == "responseText")
                                _response = $.parseJSON(error[key]);
                            if (typeof key == 'string' && key.toLowerCase() == "message")
                                _message = error[key];

                            else this[key] = error[key];
                        }
                    }
                } else if (typeof error == 'string') {
                    _message = error;
                }

				/**
				 *      To check if the response was successfull or not. Used in "always" callback,
				 *      @method module:i2bmod.MasterData.i2bmodError#isOK
				 *      @access public
				 *      @returns {mixed}
				 */

                this.isOK = function () {
                    return false;
                };

				/**
				 *      Returns the AJAX error response
				 *      @method module:i2bmod.MasterData.i2bmodError#getResponse
				 *      @access public
				 *      @returns {mixed}
				 */

                this.getResponse = function () {
                    return _response;
                };

				/**
				 *      Returns the error message
				 *      @method module:i2bmod.MasterData.i2bmodError#getMessage
				 *      @access public
				 *      @returns {mixed}
				 */

                this.getMessage = function () {
                    return _message !== null ? _message : (_response !== null && _response.Message !== undefined ? _response.Message : null);
                };

            };


            /** Privileged methods */


			/**
			 *      Check if a result is valid
			 *      @method module:i2bmod.MasterData#_resultOK
			 *      @access private
			 *      @param {object} result - The result that will be parsed
			 *      @returns {boolean}
			 */

            this._resultOK = function (result) {
                return result !== undefined && result.length && result[0].id !== undefined;
            };

			/**
			 *      Parse a result
			 *      @method module:i2bmod.MasterData#_parseResult
			 *      @access private
			 *      @param {object} result - The result that will be parsed
			 *      @returns {i2bmodSuccess} i2bmodSuccess object
			 */

            this._parseResult = function (result, operation) {
                return new i2bmodSuccess(result, operation);
            };

			/**
			 *      Parse an error
			 *      @method module:i2bmod.MasterData#_parseError
			 *      @access private
			 *      @param {object} error - The error that will be parsed
			 *      @returns {i2bmodError} i2bmodError object
			 */

            this._parseError = function (error) {
                return new i2bmodError(error);
            };

			/**
			 *      Get a master data document
			 *      @method module:i2bmod.MasterData#_get
			 *      @access private
			 *      @param {string} id - The ID of the document to get
			 *      @param {Array} [fields=["email", "id"]] - A list of fields to retrieve
			 *      @param {string} entity - The entity of the document to get
			 *      @returns {promise}
			 */

            this._get = function (id, fields, entity) {

                var defaults = ["email", "id"];

                fields = fields instanceof Array ? Utils.arrayUnique(fields.concat(["id"])) : defaults;

                var data = {
                    "_fields": fields.join(",")
                };

                return priv._call("GET", id, data, entity, priv.types.DOCUMENTS);

            };


			/**
			 *      Check if a master data document exists
			 *      @method module:i2bmod.MasterData#_exists
			 *      @access private
			 *      @param {string} id - The ID of the document to check
			 *      @param {string} entity - The entity of the document to check
			 *      @returns {promise} A rejected promise if it doesn't exist and a resolved one if it does
			 */

            this._exists = function (id, entity) {

                return $.Deferred(function () {
                    var def = this;
                    return priv._call("GET", id, {
                        _fields: "id"
                    }, entity, priv.types.DOCUMENTS).done(function (result) {

                        if (result !== undefined && result.id !== undefined) {
                            def.resolve(result);
                        } else def.reject(false);


                    }).fail(function (error) {
                        def.reject(error);
                    });

                }).promise();
            };

			/**
			 *      Insert a document
			 *      @method module:i2bmod.MasterData#_insert
			 *      @access private
			 *      @param {Object} data - The data that will be inserted
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            this._insert = function (data, entity) {
                return $.Deferred(function () {
                    var def = this;

                    return priv._call("POST", null, data, entity, priv.types.DOCUMENTS).done(function (result) {
                        def.resolve($.extend(data, result));
                    }).fail(function (error) {
                        def.reject(error);
                    });

                }).promise();
            };


			/**
			 *      Insert a document
			 *      @method module:i2bmod.MasterData#_insert
			 *      @access private
			 *      @param {Object} data - The data that will be inserted
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            this._upload = function (data, entity) {
                return $.Deferred(function () {
                    var def = this;

                    return priv._call("POST", null, data, entity, priv.types.DOCUMENTS).done(function (result) {
                        def.resolve($.extend(data, result));
                    }).fail(function (error) {
                        def.reject(error);
                    });

                }).promise();
            };


			/**
			 *      Full update of a document, all fields must be specified in the request
			 *      @method module:i2bmod.MasterData#_fullUpdate
			 *      @access private
			 *      @param {string} id - The ID of the document to get
			 *      @param {Object} data - The data that will be inserted
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            this._fullUpdate = function (id, data, entity) {
                return priv._call("PUT", id, data, entity, priv.types.DOCUMENTS);
            };

			/**
			 *      Partial update of a document
			 *      @method module:i2bmod.MasterData#_partialUpdate
			 *      @access private
			 *      @param {string} id - The ID of the document to update
			 *      @param {Object} data - The data that will be updated
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            this._partialUpdate = function (id, data, entity) {
                return $.Deferred(function () {
                    var def = this;

                    return priv._call("PATCH", id, data, entity, priv.types.DOCUMENTS).done(function (result) {
                        def.resolve(data);
                    }).fail(function (error) {
                        def.reject(error);
                    });

                }).promise();
            };

			/**
			 *      Performs a search
			 *      @method module:i2bmod.MasterData#_search
			 *      @access private
			 *      @param {Object} params - The search parameters
			 *      @param {Array} fields - The fields that will be retrieved
			 *      @param {string} entity - The entity where the search will be performed
			 *      @param {int} [limit=49] - The search limit
			 *      @param {int} [offset=0] - The search offset
			 *      @returns {promise}
			 */

            this._search = function (params, fields, entity, limit, offset) {
                limit = limit || 49;
                offset = offset || 0;

                var headers = {
                    "REST-Range": "resources=" + offset + "-" + (limit + offset)
                };

                params._fields = fields.join(",");

                return priv._call("GET", null, params, entity, priv.types.SEARCH, headers);
            };

			/**
			 *      Performs a search by email
			 *      @method module:i2bmod.MasterData#_getByEmail
			 *      @access private
			 *      @param {string} email - The email that will be searched
			 *      @param {string} entity - The entity where the search will be performed
			 *      @returns {promise}
			 */

            this._getByEmail = function (email, entity) {

                return this._search({
                    email: email
                }, ["email", "id"], entity, 1, 0);

            };

			/**
			 *       Set the current Store
			 *       @method module:i2bmod.MasterData#setStore
			 *       @param {string} store - The current store
			 *       @returns {object} - The current instance (chainable)
			 */

            this.setStore = function (store) {
                storeName = store;
                return this;
            };

			/**
			 *       Set the default entity
			 *       @method module:i2bmod.MasterData#setEntity
			 *       @param {string} entity - The entity to set to default one
			 *       @returns {object} - The current instance (chainable)
			 */

            this.setEntity = function (entity) {
                defaultEntity = entity;
                return this;
            };

        }


        /** Public Methods */

        MasterData.prototype = {

			/**
			 *      Newsletter opt-in / opt-out
			 *      @method module:i2bmod.MasterData#newsletter
			 *      @access public
			 *      @param {string} email - The email of the user to opt-in/out
			 *      @param {boolean} [newsletter=true] - Whether to opt-in/out
			 *      @param {string} [entity='CL'] - The Entity
			 *      @returns {promise}
			 *      @example
			 *i2bmod.MasterData.newsletter("marcos@i2bmod.com").done(function(response) {
			 *  if(response.success){ //i2bmodSuccess
			 *      console.log("Subscribed");
			 *  }
			 *}).fail(function(error){ console.log(error); }); //i2bmodError
			 */
            newsletter: function (email, newsletter, entity) {

                var that = this;
                var data = {
                    isNewsletterOptIn: newsletter === undefined ? true : newsletter
                };

                return $.Deferred(function () {
                    var def = this;

                    if (!Utils.isEmail(email))
                        return def.reject(that._parseError(that.ERR_INVALID_EMAIL));

                    that._getByEmail(email, entity).done(function (result) {
                        if (that._resultOK(result)) {

                            return that._partialUpdate(result[0].id, data, entity).done(function (result) {
                                def.resolve(that._parseResult(result, that.OP_UPDATE));
                            }).fail(function (error) {
                                def.reject(that._parseResult(error));
                            });

                        } else {

                            return that._insert($.extend({
                                email: email
                            }, data), entity).done(function (result) {
                                def.resolve(that._parseResult(result, that.OP_INSERT));
                            }).fail(function (error) {
                                def.reject(that._parseResult(error));
                            });
                        }

                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Get User by mail
			 *      @method module:i2bmod.MasterData#getUser
			 *      @access public
			 *      @param {string} email - The email of the user
			 *      @param {Array} [fields] - A list of fields to retrieve
			 *      @param {string} [entity='CL'] - The Entity of the user
			 *      @returns {promise}
			 *      @example
			 *i2bmod.MasterData.getUser("marcos@i2bmod.com", ["isNewsletterOptIn"]).done(function(response) {
			 *  if(response.result.isNewsletterOptIn){ //i2bmodSuccess
			 *      console.log("Subscribed");
			 *  }
			 *}).fail(function(error){ console.log(error); }); //i2bmodError
			 */

            getUser: function (email, fields, entity) {
                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    if (!Utils.isEmail(email))
                        return def.reject(that._parseError(that.ERR_INVALID_EMAIL));

                    that._getByEmail(email, entity).done(function (result) {

                        if (that._resultOK(result)) {
                            return that._get(result[0].id, fields, entity).done(function (result) {
                                def.resolve(that._parseResult(result));
                            }).fail(function (error) {
                                def.reject(that._parseResult(error));
                            });

                        } else def.reject(that._parseError(that.ERR_INVALID_USER));

                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Update User by email
			 *      @method module:i2bmod.MasterData#updateUser
			 *      @access public
			 *      @param {string} email - The email of the user
			 *      @param {Object} data - The data that will be updated.
			 *      @param {string} [entity='CL'] - The Entity
			 *      @returns {promise}
			 *      @example
			 *i2bmod.MasterData.updateUser("marcos@i2bmod.com",
			 *      {isNewsletterOptIn: true, firstName: 'Master', lastName: 'of the Matrix'}).done(function(response) {
			 *  if(response.result.isNewsletterOptIn){ //i2bmodSuccess
			 *      console.log("Subscribed");
			 *  }
			 *}).fail(function(error){ console.log(error); }); //i2bmodError
			 */

            updateUser: function (email, data, entity) {

                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    if (!Utils.isEmail(email))
                        return def.reject(that._parseError(that.ERR_INVALID_EMAIL));

                    return that._getByEmail(email, entity).done(function (result) {

                        if (that._resultOK(result)) {

                            return that._partialUpdate(result[0].id, data, entity).done(function (result) {
                                def.resolve(that._parseResult(result));
                            }).fail(function (error) {
                                def.reject(error);
                            });

                        } else def.reject(that._parseError(that.ERR_INVALID_USER));

                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },


			/**
			 *      Update a user if the email exists, or insert a new one if it doesn't
			 *      @method module:i2bmod.MasterData#insertUpdateUser
			 *      @access public
			 *      @param {string} email - The email of the user
			 *      @param {Object} data - The data that will be updated.
			 *      @param {string} [entity='CL'] - The Entity
			 *      @returns {promise}
			 *      @example
			 *i2bmod.MasterData.insertUpdateUser("marcos@i2bmod.com",
			 *      {document: 'xxxxxxxxxx', firstName: 'Master', lastName: 'of the Matrix'}).done(function(response) {
			 *  if(response.isInsert()){
			 *      console.log("New user!");
			 *  }else if(response.isUpdate()){
			 *      console.log("User updated!");
			 *  }
			 *}).fail(function(error){ console.log(error); });
			 */


            insertUpdateUser: function (email, data, entity) {
                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    if (!Utils.isEmail(email))
                        return def.reject(that._parseError(that.ERR_INVALID_EMAIL));

                    return that._getByEmail(email, entity).done(function (result) {

                        if (that._resultOK(result)) {
                            return that._partialUpdate(result[0].id, data, entity).done(function (result) {
                                def.resolve(that._parseResult(result, that.OP_UPDATE));
                            }).fail(function (error) {
                                def.reject(that._parseError(error));
                            });

                        } else {
                            return that._insert($.extend({
                                email: email
                            }, data), entity).done(function (result) {
                                def.resolve(that._parseResult(result, that.OP_INSERT));
                            }).fail(function (error) {
                                def.reject(that._parseError(error));
                            });
                        }

                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Insert a document
			 *      @method module:i2bmod.MasterData#insert
			 *      @access public
			 *      @param {Object} data - The data that will be inserted
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            insert: function (data, entity) {

                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    return that._insert(data, entity).done(function (result) {
                        def.resolve(that._parseResult(result));
                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Insert/update a document
			 *      @method module:i2bmod.MasterData#insertUpdate
			 *      @access public
			 *      @param {string} id - The ID of the item that will be inserted/updated
			 *      @param {Object} data - The data that will be inserted
			 *      @param {string} entity - The entity of the document to insert
			 *      @returns {promise}
			 */

            insertUpdate: function (id, data, entity) {

                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    return that._partialUpdate(id, data, entity).done(function (result) {
                        def.resolve(that._parseResult(result));
                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Performs a search
			 *      @method module:i2bmod.MasterData#search
			 *      @param {Object} params - The search parameters
			 *      @param {Array} fields - The Fields that will be retrieved
			 *      @param {string} entity - The entity where the search will be performed
			 *      @param {int} [limit=49] - The search limit
			 *      @param {int} [offset=0] - The search offset
			 *      @returns {promise}
			 */

            search: function (params, fields, entity, limit, offset) {

                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    return that._search(params, fields, entity, limit, offset).done(function (result) {
                        def.resolve(that._parseResult(result));
                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },

			/**
			 *      Get a master data document
			 *      @method module:i2bmod.MasterData#get
			 *      @param {string} id - The ID of the document to get
			 *      @param {Array} [fields=["id"]] - A list of fields to retrieve, default values will always be retrieved
			 *      @param {string} entity - The entity of the document to get
			 *      @returns {promise}
			 */

            get: function (id, fields, entity) {

                var that = this;

                return $.Deferred(function () {
                    var def = this;

                    return that._get(id, fields, entity).done(function (result) {
                        def.resolve(that._parseResult(result));
                    }).fail(function (error) {
                        def.reject(that._parseError(error));
                    });

                }).promise();

            },


            uploadFile: function (input) {


                var files = input.files;

                //TODO

            }

        }; //Master Data prototype

        var MD = new MasterData(); //MasterData instance






        return MD; //return Master Data instance

    })(jQuery, window);


    return new i2bmod();

})(jQuery, window); // End i2bmod

if (typeof dataLayer !== "undefined") {
    dataLayer.push({
        event: 'i2bmodLoaded'
    });
}