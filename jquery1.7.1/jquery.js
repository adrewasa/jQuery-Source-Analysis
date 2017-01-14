/*!
 * jQuery JavaScript Library v1.7.2
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Wed Mar 21 12:46:34 2012 -0700
 */
(function(window, undefined) {

	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document,
		navigator = window.navigator,
		location = window.location;
	// 这里返回的jquery是一个函数
	// 那么是一个函数应该关注什么呢?
	// 输入输出参数,明显这里面的输入就是$()接受的形参
	var jQuery = (function() {

		// Define a local copy of jQuery
		// 定义jquery为一个方法
		// 定义jquery的构造方法,并对其原型进行定制
		// 同时把一些常用的函数功能添加到jquery构造方法中
		var jQuery = function(selector, context) {
				// The jQuery object is actually just the init constructor 'enhanced'
				return new jQuery.fn.init(selector, context, rootjQuery);
			},

			// Map over jQuery in case of overwrite
			_jQuery = window.jQuery,

			// Map over the $ in case of overwrite
			_$ = window.$,

			// A central reference to the root jQuery(document)
			rootjQuery,

			// A simple way to check for HTML strings or ID strings
			// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
			quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

			// Check if a string has a non-whitespace character in it
			rnotwhite = /\S/,

			// Used for trimming whitespace
			trimLeft = /^\s+/,
			trimRight = /\s+$/,

			// Match a standalone tag
			rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

			// JSON RegExp
			rvalidchars = /^[\],:{}\s]*$/,
			rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
			rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
			rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

			// Useragent RegExp
			rwebkit = /(webkit)[ \/]([\w.]+)/,
			ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
			rmsie = /(msie) ([\w.]+)/,
			rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

			// Matches dashed string for camelizing
			rdashAlpha = /-([a-z]|[0-9])/ig,
			rmsPrefix = /^-ms-/,

			// Used by jQuery.camelCase as callback to replace()
			fcamelCase = function(all, letter) {
				return (letter + "").toUpperCase();
			},

			// Keep a UserAgent string for use with jQuery.browser
			userAgent = navigator.userAgent,

			// For matching the engine and version of the browser
			browserMatch,

			// The deferred used on DOM ready
			readyList,

			// The ready event handler
			DOMContentLoaded,

			// Save a reference to some core methods
			toString = Object.prototype.toString,
			hasOwn = Object.prototype.hasOwnProperty,
			push = Array.prototype.push,
			slice = Array.prototype.slice,
			trim = String.prototype.trim,
			indexOf = Array.prototype.indexOf,

			// [[Class]] -> type pairs
			class2type = {};

		// 为jquery方法添加属性fn和原型方法
		// 这里的fn属性和原型方法都指向同一套
		// 但是这里的同一套指的是什么?同一个地址?
		// 到底是不是同一个地址
		jQuery.fn = jQuery.prototype = {
			constructor: jQuery,
			init: function(selector, context, rootjQuery) {
				var match, elem, ret, doc;

				// Handle $(""), $(null), or $(undefined)
				// 传入selector为空的
				if (!selector) {
					// 这里的this指的是什么 
					// 这里的this就是指空的jQuery对象
					return this;
				}

				// Handle $(DOMElement)
				// 处理selector为dom元素的
				if (selector.nodeType) {
					this.context = this[0] = selector;
					this.length = 1;
					return this;
				}

				// The body element only exists once, optimize finding it
				// 处理传入参数为"body"字符串的
				// 且没有传入上下文且当前的document有body对象
				// 那么当前jquery对象的上下文为document对象,当前存储的
				// DOM元素为document元素里面的body元素
				if (selector === "body" && !context && document.body) {
					this.context = document;
					this[0] = document.body;
					this.selector = selector;
					this.length = 1;
					// 返回当前jQuery对象
					return this;
				}

				// Handle HTML strings
				// 处理传入参数为字符串的
				if (typeof selector === "string") {
					// Are we dealing with HTML string or an ID?
					// 如果selector是以"<"开头以">"结尾,且长度大于3则先假设其为html跳过regex检查
					// quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, 判断是html亦或是'#id'
					// 如果匹配这里的match[1]为要创建的DOM元素如<a/>中的a
					// 如果是id则match[1] == null match[2] = id
					// html以'<'开头以">"结尾
					if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
						// Assume that strings that start and end with <> are HTML and skip the regex check
						// 如果字符串是以"<"开头已">"结尾则跳过下面的正则检验
						// 下面的正则可以全面的判断是否是简单的html片段或id选择器
						match = [null, selector, null];

					} else {
						match = quickExpr.exec(selector);
					}

					// Verify a match, and that no context was specified for #id
					// 这里match成立就说明了是
					// 1:有html片段代码
					// 2:有id选择器
					// 两者必有一个
					// Q:但是这里为什么把context放上去难道有id就必须有context?还有一个对象是否能变成false
					// A:比如传进来<a></a>的时候后面的context可以这样写{abc:"abc"}
					// 这时候jquery会先用浏览器的原生方法创建一个a元素
					// 然后把后面的属性赋予生成的a元素
					// 
					// 传入id选择器就不能够传入context这是怎么回事
					// 因为如果有match[1]那么就表示是html片段,这时候
					// context有没有都没有关系
					// 但是如果match[1]不存在那么则要求context
					// 也不存在
					// 这就是说如果是id选择符,那么就不需要context
					// 作为上下文片段
					if (match && (match[1] || !context)) {

						// HANDLE: $(html) -> $(array)
						// 传入的参数是html片段
						if (match[1]) {
							//
							context = context instanceof jQuery ? context[0] : context;
							// 这里doc肯定是一个dom对象??
							// 并不是这样的,在这里如果上面的context存在但是不是jquery对象
							// 上面的context还是他自己
							// 所以这里的doc为doucument不管其context有没有存在
							// 但反之如果传进来的context为jquery对象在上面已经取出
							// 第一个dom元素,那么这里的doc就是他自己的doc或者自己
							// 总的就是如果context不是jquery对象那么这里的doc就是他自己
							doc = (context ? context.ownerDocument || context : document);

							// If a single string is passed in and it's a single tag
							// just do a createElement and skip the rest
							// rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
							// 检查是否是单独标签
							ret = rsingleTag.exec(selector);

							if (ret) {
								//如果是单独标签
								//且context为普通对象
								if (jQuery.isPlainObject(context)) {
									selector = [document.createElement(ret[1])];
									// 设置属性
									jQuery.fn.attr.call(selector, context, true);

								} else {
									//如果context不是普通的对象
									//那么这里的context的意义是??
									selector = [doc.createElement(ret[1])];
								}

							} else {
								//如果selector是复杂的html代码
								//同时从这里也可看出buildFragment的参数格式
								//详细见下面的buildFragment分析
								//一个是html片段,一个是上下文
								//buildFragment返回格式
								//{
								//	fragment:含有转换后的dom元素的文档片段
								//	cacheable:代码是否满足缓存条件
								//}
								//
								//同时结合buildFragment来看还可以的出下面的结论
								//1:因为在buildFragment里面并没有传入script进去
								//所有可知即使html片段里面有script元素也不会进行
								//运行
								//2:该方法处理并行的标签很粗糙,但是
								//又有什么业务需要处理并行的标签呢?
								//3:在abc<a>创建元素之前前面的abc已经被过滤掉了
								//
								ret = jQuery.buildFragment([match[1]], [doc]);
								selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
							}

							// 合并元素对象
							return jQuery.merge(this, selector);

							// HANDLE: $("#id")
						} else {
							//传入的参数是'#id'
							//这是调用浏览器的原生方法进行查找
							elem = document.getElementById(match[2]);

							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							// Blackberry 4.6可能会返回已经不再dom文档之中的dom元素
							if (elem && elem.parentNode) {
								// Handle the case where IE and Opera return items
								// by name instead of ID
								// ie 和 opera可能查找时是按name查找所有的检查查找得到的元素的id是否就是我们需要查找的
								// 如果不是则调用根元素的find方法进行查找.
								if (elem.id !== match[2]) {
									return rootjQuery.find(selector);
								}

								// Otherwise, we inject the element directly into the jQuery object
								// 如果id匹配则
								// 进行设置
								this.length = 1;
								this[0] = elem;
							}

							this.context = document;
							this.selector = selector;
							return this;
						}

						// HANDLE: $(expr, $(...))
						// 这里说明是
						// 1:没有检测到符合的quickExpr
					} else if (!context || context.jquery) {
						// 这里是说没有上下文或则上下文是jquery对象
						// 这里就表明了1如果没上下文肯定是用rootjquery对象进行查询
						// 如果有上下文这里的上下文肯定是一个jquery对象
						// 如果没有上下文则运用rootjquery进行查询
						// 如果指定了上下文则运用上下文的find方法进行查找
						// 这里就能回应上面的,并不是不能够传入上下文,而是如果传入的是id选择符并且传入了上下文就
						// 运用上下文的find进行查找
						// 但是如果传入的上下文并不是一个jquery对象呢?这种情况是否要确保不出现
						return (context || rootjQuery).find(selector);

						// HANDLE: $(expr, context)
						// (which is just equivalent to: $(context).find(expr)
					} else {
						//到这里就说明
						//1:有上下文
						//2:上下文不是一个jquery对象,参考上面的全部分析既可以得出
						return this.constructor(context).find(selector);
					}

					// HANDLE: $(function)
					// Shortcut for document ready
					// 如果传进来的选择器为函数
				} else if (jQuery.isFunction(selector)) {
					// 传递的第一个参数为函数
					return rootjQuery.ready(selector);
				}
				//如果传进来的选择器是jquery对象
				//用传递进来的jquery中的对象为当前jquery对象赋值
				if (selector.selector !== undefined) {
					this.selector = selector.selector;
					this.context = selector.context;
				}
				//传进来的是任意其他值{abc:123}等
				//这里并不是像上面那样的
				//如果上面的传递进来的是jquery对象那么这里的方法是
				//把传递进来的jquery中的dom元素复制到本jquery对象里面
				//如果是数组同样进行拷贝
				//如果是别的对象则直接压入this[0]
				return jQuery.makeArray(selector, this);
			},

			// Start with an empty selector
			selector: "",

			// The current version of jQuery being used
			// 表明为一个jquery对象
			jquery: "1.7.2",

			// The default length of a jQuery object is 0
			length: 0,

			// The number of elements contained in the matched element set
			size: function() {
				return this.length;
			},

			toArray: function() {
				return slice.call(this, 0);
			},

			// Get the Nth element in the matched element set OR
			// Get the whole matched element set as a clean array
			get: function(num) {
				return num == null ?

					// Return a 'clean' array
					this.toArray() :

					// Return just the object
					(num < 0 ? this[this.length + num] : this[num]);
			},

			// Take an array of elements and push it onto the stack
			// (returning the new matched element set)
			pushStack: function(elems, name, selector) {
				// Build a new jQuery matched element set
				var ret = this.constructor();

				if (jQuery.isArray(elems)) {
					push.apply(ret, elems);

				} else {
					jQuery.merge(ret, elems);
				}

				// Add the old object onto the stack (as a reference)
				ret.prevObject = this;

				ret.context = this.context;

				if (name === "find") {
					ret.selector = this.selector + (this.selector ? " " : "") + selector;
				} else if (name) {
					ret.selector = this.selector + "." + name + "(" + selector + ")";
				}

				// Return the newly-formed element set
				return ret;
			},

			// Execute a callback for every element in the matched set.
			// (You can seed the arguments with an array of args, but this is
			// only used internally.)
			each: function(callback, args) {
				return jQuery.each(this, callback, args);
			},

			ready: function(fn) {
				// Attach the listeners
				jQuery.bindReady();

				// Add the callback
				readyList.add(fn);

				return this;
			},

			eq: function(i) {
				i = +i;
				return i === -1 ?
					this.slice(i) :
					this.slice(i, i + 1);
			},

			first: function() {
				return this.eq(0);
			},

			last: function() {
				return this.eq(-1);
			},

			slice: function() {
				return this.pushStack(slice.apply(this, arguments),
					"slice", slice.call(arguments).join(","));
			},

			map: function(callback) {
				return this.pushStack(jQuery.map(this, function(elem, i) {
					return callback.call(elem, i, elem);
				}));
			},

			end: function() {
				return this.prevObject || this.constructor(null);
			},

			// For internal use only.
			// Behaves like an Array's method, not like a jQuery method.
			push: push,
			sort: [].sort,
			splice: [].splice
		};

		// Give the init function the jQuery prototype for later instantiation
		// 赋予init方法jquery原型
		jQuery.fn.init.prototype = jQuery.fn;

		jQuery.extend = jQuery.fn.extend = function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			// 如果目标是一个boolean类型修正参数
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			}

			// Handle case when target is a string or something (possible in deep copy)
			// 如果target不是一个对象且不是一个函数则设置为{}
			if (typeof target !== "object" && !jQuery.isFunction(target)) {
				target = {};
			}

			// extend jQuery itself if only one argument is passed
			// 如果只是传递一个复制参数则把当前对象作为目标对象,并且修改需要进行合并对象的下标
			if (length === i) {
				// 这里的this才是关键
				// 如果传入进来只有没有target那么把jquery或jquery.fn作为目标对象
				// 也就是说把jquery的构造函数当成目标
				// 或者把jquery的原型作为目标
				// 这里就是$.function
				// 和$(select).function的区别
				// 同时也可以这样添加
				// $[xxx] = $$$
				// 或则$.fn[xxx] = $$$
				// 总的一句话就是把进行构造函数的属性和方法的扩展
				// 或者对构造函数的原型进行属性和方法的扩展
				// 那么说前面的init.prototype=fn那就是说他们指向的是
				// 同一个地址
				// 
				target = this;
				--i;
			}
			//下面是组个进行赋值
			for (; i < length; i++) {
				// Only deal with non-null/undefined values
				// 如果参数不是null才进行合并
				if ((options = arguments[i]) != null) {
					// Extend the base object
					for (name in options) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						// 如果目标对象的一个属性和源对象的一个属性引用的是同一个值/对象,则不进行合并
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						// 如果进行深度合并且
						// 1:当原属性是一个基本数据类型时
						//    而目标属性1,是基本数据类型
						//    			2,是对象,函数等类型时应该怎么办
						// 2:当原属性不是一个一个基本数据类型
						// 	  而目标属性1,是基本数据类型
						// 	  			2,是对象
						// 上面两种情况下,如果是
						// 1:深度复制时又怎样
						// 2:浅度复制时又该怎样
						// 
						// 一句话,以后面进行合并的为准即像后面的对象看起
						// 如果目标对象的某个属性是原始数据,但是源对象是数组,对象等数据,那么前面属性会被扩展为数组,对象的
						// 扩展属性
						if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
							//需要复制的对象为数组
							if (copyIsArray) {
								copyIsArray = false;
								//修正
								clone = src && jQuery.isArray(src) ? src : [];

							} else {
								//需要复制的对象那个是简单对象那个
								clone = src && jQuery.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = jQuery.extend(deep, clone, copy);

							// Don't bring in undefined values
							// 到这里有几种情况
							// 1:不需要进行深度复制
							// 2:所复制的属性不是数组,简单对象类型
						} else if (copy !== undefined) {
							// 这里说明如果是函数,不是有{}创建,不是有new Object()创建的对象则会直接进行覆盖
							// 但是怎样判断是不是由new Object(),或者{}直接创建的依据还是
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		};

		jQuery.extend({
			noConflict: function(deep) {
				if (window.$ === jQuery) {
					window.$ = _$;
				}

				if (deep && window.jQuery === jQuery) {
					window.jQuery = _jQuery;
				}

				return jQuery;
			},

			// Is the DOM ready to be used? Set to true once it occurs.
			isReady: false,

			// A counter to track how many items to wait for before
			// the ready event fires. See #6781
			readyWait: 1,

			// Hold (or release) the ready event
			holdReady: function(hold) {
				if (hold) {
					jQuery.readyWait++;
				} else {
					jQuery.ready(true);
				}
			},

			// Handle when the DOM is ready
			ready: function(wait) {
				// Either a released hold or an DOMready/load event and not yet ready
				if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {
					// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
					if (!document.body) {
						return setTimeout(jQuery.ready, 1);
					}

					// Remember that the DOM is ready
					jQuery.isReady = true;

					// If a normal DOM Ready event fired, decrement, and wait if need be
					if (wait !== true && --jQuery.readyWait > 0) {
						return;
					}

					// If there are functions bound, to execute
					readyList.fireWith(document, [jQuery]);

					// Trigger any bound ready events
					if (jQuery.fn.trigger) {
						jQuery(document).trigger("ready").off("ready");
					}
				}
			},

			bindReady: function() {
				if (readyList) {
					return;
				}

				readyList = jQuery.Callbacks("once memory");

				// Catch cases where $(document).ready() is called after the
				// browser event has already occurred.
				if (document.readyState === "complete") {
					// Handle it asynchronously to allow scripts the opportunity to delay ready
					return setTimeout(jQuery.ready, 1);
				}

				// Mozilla, Opera and webkit nightlies currently support this event
				if (document.addEventListener) {
					// Use the handy event callback
					document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

					// A fallback to window.onload, that will always work
					window.addEventListener("load", jQuery.ready, false);

					// If IE event model is used
				} else if (document.attachEvent) {
					// ensure firing before onload,
					// maybe late but safe also for iframes
					document.attachEvent("onreadystatechange", DOMContentLoaded);

					// A fallback to window.onload, that will always work
					window.attachEvent("onload", jQuery.ready);

					// If IE and not a frame
					// continually check to see if the document is ready
					var toplevel = false;

					try {
						toplevel = window.frameElement == null;
					} catch (e) {}

					if (document.documentElement.doScroll && toplevel) {
						doScrollCheck();
					}
				}
			},

			// See test/unit/core.js for details concerning isFunction.
			// Since version 1.3, DOM methods and functions like alert
			// aren't supported. They return false on IE (#2968).
			isFunction: function(obj) {
				return jQuery.type(obj) === "function";
			},

			// 判断颜色是否为数组,如果有数组的原生方法则用数组的原生
			// 方法
			isArray: Array.isArray || function(obj) {
				return jQuery.type(obj) === "array";
			},

			isWindow: function(obj) {
				return obj != null && obj == obj.window;
			},

			isNumeric: function(obj) {
				return !isNaN(parseFloat(obj)) && isFinite(obj);
			},

			type: function(obj) {
				return obj == null ?
					String(obj) :
					class2type[toString.call(obj)] || "object";
			},

			// 判断对象是否有Object()创建亦或是{abc:"abc"}即用对象直接量{}创建
			isPlainObject: function(obj) {
				// Must be an Object.
				// Because of IE, we also have to check the presence of the constructor property.
				// Make sure that DOM nodes and window objects don't pass through, as well
				// 如果参数满足以下的条件之一就表明不是扁平对象
				// 1:能转化为false,什么样的对象能转化为false
				// 2:Object.prototype.toString.call(obj)返回的不是[object Object],什么样的对象才有tostring亦或说返回
				// 3:obj是dom对象
				// 4:obj是window对象
				if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
					return false;
				}

				try {
					// Not own constructor property must be Object
					if (obj.constructor &&
						!hasOwn.call(obj, "constructor") &&
						!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false;
					}
				} catch (e) {
					// IE8,9 Will throw exceptions on certain host objects #9897
					return false;
				}

				// Own properties are enumerated firstly, so to speed up,
				// if last one is own, then all properties are own.

				var key;
				for (key in obj) {}

				return key === undefined || hasOwn.call(obj, key);
			},

			isEmptyObject: function(obj) {
				for (var name in obj) {
					return false;
				}
				return true;
			},

			// 抛出异常
			error: function(msg) {
				throw new Error(msg);
			},

			parseJSON: function(data) {
				if (typeof data !== "string" || !data) {
					return null;
				}

				// Make sure leading/trailing whitespace is removed (IE can't handle it)
				data = jQuery.trim(data);

				// Attempt to parse using the native JSON parser first
				if (window.JSON && window.JSON.parse) {
					return window.JSON.parse(data);
				}

				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if (rvalidchars.test(data.replace(rvalidescape, "@")
						.replace(rvalidtokens, "]")
						.replace(rvalidbraces, ""))) {

					return (new Function("return " + data))();

				}
				jQuery.error("Invalid JSON: " + data);
			},

			// Cross-browser xml parsing
			parseXML: function(data) {
				if (typeof data !== "string" || !data) {
					return null;
				}
				var xml, tmp;
				try {
					if (window.DOMParser) { // Standard
						tmp = new DOMParser();
						xml = tmp.parseFromString(data, "text/xml");
					} else { // IE
						xml = new ActiveXObject("Microsoft.XMLDOM");
						xml.async = "false";
						xml.loadXML(data);
					}
				} catch (e) {
					xml = undefined;
				}
				if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
					jQuery.error("Invalid XML: " + data);
				}
				return xml;
			},

			noop: function() {},

			// Evaluates a script in a global context
			// Workarounds based on findings by Jim Driscoll
			// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
			globalEval: function(data) {
				if (data && rnotwhite.test(data)) {
					// We use execScript on Internet Explorer
					// We use an anonymous function so that context is window
					// rather than jQuery in Firefox
					(window.execScript || function(data) {
						window["eval"].call(window, data);
					})(data);
				}
			},

			// Convert dashed to camelCase; used by the css and data modules
			// Microsoft forgot to hump their vendor prefix (#9572)
			camelCase: function(string) {
				return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
			},

			nodeName: function(elem, name) {
				return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
			},

			// args is for internal usage only
			each: function(object, callback, args) {
				var name, i = 0,
					length = object.length,
					isObj = length === undefined || jQuery.isFunction(object);

				if (args) {
					if (isObj) {
						for (name in object) {
							if (callback.apply(object[name], args) === false) {
								break;
							}
						}
					} else {
						for (; i < length;) {
							if (callback.apply(object[i++], args) === false) {
								break;
							}
						}
					}

					// A special, fast, case for the most common use of each
				} else {
					if (isObj) {
						for (name in object) {
							if (callback.call(object[name], name, object[name]) === false) {
								break;
							}
						}
					} else {
						for (; i < length;) {
							if (callback.call(object[i], i, object[i++]) === false) {
								break;
							}
						}
					}
				}

				return object;
			},

			// Use native String.trim function wherever possible
			trim: trim ?
				function(text) {
					return text == null ?
						"" :
						trim.call(text);
				} :

				// Otherwise use our own trimming functionality
				function(text) {
					return text == null ?
						"" :
						text.toString().replace(trimLeft, "").replace(trimRight, "");
				},

			// results is for internal usage only
			makeArray: function(array, results) {
				var ret = results || [];

				if (array != null) {
					// The window, strings (and functions) also have 'length'
					// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
					var type = jQuery.type(array);

					if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) {
						push.call(ret, array);
					} else {
						jQuery.merge(ret, array);
					}
				}

				return ret;
			},

			// 判断数组指定的下标是否为某元素
			inArray: function(elem, array, i) {
				var len;

				if (array) {
					if (indexOf) {
						return indexOf.call(array, elem, i);
					}

					len = array.length;
					i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

					for (; i < len; i++) {
						// Skip accessing in sparse arrays
						if (i in array && array[i] === elem) {
							return i;
						}
					}
				}

				return -1;
			},

			// 数组之间的合并,jquery的行为类似于数组就是用
			// 这个来进行合并的,同时只对不为空的元素进行合并
			merge: function(first, second) {
				var i = first.length,
					j = 0;

				if (typeof second.length === "number") {
					for (var l = second.length; j < l; j++) {
						first[i++] = second[j];
					}

				} else {
					while (second[j] !== undefined) {
						first[i++] = second[j++];
					}
				}

				first.length = i;

				return first;
			},

			grep: function(elems, callback, inv) {
				var ret = [],
					retVal;
				inv = !!inv;

				// Go through the array, only saving the items
				// that pass the validator function
				for (var i = 0, length = elems.length; i < length; i++) {
					retVal = !!callback(elems[i], i);
					if (inv !== retVal) {
						ret.push(elems[i]);
					}
				}

				return ret;
			},

			// arg is for internal usage only
			map: function(elems, callback, arg) {
				var value, key, ret = [],
					i = 0,
					length = elems.length,
					// jquery objects are treated as arrays
					isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ((length > 0 && elems[0] && elems[length - 1]) || length === 0 || jQuery.isArray(elems));

				// Go through the array, translating each of the items to their
				if (isArray) {
					for (; i < length; i++) {
						value = callback(elems[i], i, arg);

						if (value != null) {
							ret[ret.length] = value;
						}
					}

					// Go through every key on the object,
				} else {
					for (key in elems) {
						value = callback(elems[key], key, arg);

						if (value != null) {
							ret[ret.length] = value;
						}
					}
				}

				// Flatten any nested arrays
				return ret.concat.apply([], ret);
			},

			// A global GUID counter for objects
			guid: 1,

			// Bind a function to a context, optionally partially applying any
			// arguments.
			proxy: function(fn, context) {
				if (typeof context === "string") {
					var tmp = fn[context];
					context = fn;
					fn = tmp;
				}

				// Quick check to determine if target is callable, in the spec
				// this throws a TypeError, but we will just return undefined.
				if (!jQuery.isFunction(fn)) {
					return undefined;
				}

				// Simulated bind
				var args = slice.call(arguments, 2),
					proxy = function() {
						return fn.apply(context, args.concat(slice.call(arguments)));
					};

				// Set the guid of unique handler to the same of original handler, so it can be removed
				proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

				return proxy;
			},

			// Mutifunctional method to get and set values to a collection
			// The value/s can optionally be executed if it's a function
			access: function(elems, fn, key, value, chainable, emptyGet, pass) {
				var exec,
					bulk = key == null,
					i = 0,
					length = elems.length;

				// Sets many values
				if (key && typeof key === "object") {
					for (i in key) {
						jQuery.access(elems, fn, i, key[i], 1, emptyGet, value);
					}
					chainable = 1;

					// Sets one value
				} else if (value !== undefined) {
					// Optionally, function values get executed if exec is true
					exec = pass === undefined && jQuery.isFunction(value);

					if (bulk) {
						// Bulk operations only iterate when executing function values
						if (exec) {
							exec = fn;
							fn = function(elem, key, value) {
								return exec.call(jQuery(elem), value);
							};

							// Otherwise they run against the entire set
						} else {
							fn.call(elems, value);
							fn = null;
						}
					}

					if (fn) {
						for (; i < length; i++) {
							fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
						}
					}

					chainable = 1;
				}

				return chainable ?
					elems :

					// Gets
					bulk ?
					fn.call(elems) :
					length ? fn(elems[0], key) : emptyGet;
			},

			now: function() {
				return (new Date()).getTime();
			},

			// Use of jQuery.browser is frowned upon.
			// More details: http://docs.jquery.com/Utilities/jQuery.browser
			uaMatch: function(ua) {
				ua = ua.toLowerCase();

				var match = rwebkit.exec(ua) ||
					ropera.exec(ua) ||
					rmsie.exec(ua) ||
					ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
					[];

				return {
					browser: match[1] || "",
					version: match[2] || "0"
				};
			},

			sub: function() {
				function jQuerySub(selector, context) {
					return new jQuerySub.fn.init(selector, context);
				}
				jQuery.extend(true, jQuerySub, this);
				jQuerySub.superclass = this;
				jQuerySub.fn = jQuerySub.prototype = this();
				jQuerySub.fn.constructor = jQuerySub;
				jQuerySub.sub = this.sub;
				jQuerySub.fn.init = function init(selector, context) {
					if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
						context = jQuerySub(context);
					}

					return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
				};
				jQuerySub.fn.init.prototype = jQuerySub.fn;
				var rootjQuerySub = jQuerySub(document);
				return jQuerySub;
			},

			browser: {}
		});

		// Populate the class2type map
		jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type["[object " + name + "]"] = name.toLowerCase();
		});

		// 浏览器类型解析,主要运用到navigator.userAgent对象
		browserMatch = jQuery.uaMatch(userAgent);
		if (browserMatch.browser) {
			jQuery.browser[browserMatch.browser] = true;
			jQuery.browser.version = browserMatch.version;
		}

		// Deprecated, use jQuery.browser.webkit instead
		if (jQuery.browser.webkit) {
			jQuery.browser.safari = true;
		}

		// IE doesn't match non-breaking spaces with \s
		if (rnotwhite.test("\xA0")) {
			trimLeft = /^[\s\xA0]+/;
			trimRight = /[\s\xA0]+$/;
		}

		// All jQuery objects should point back to these
		rootjQuery = jQuery(document);

		// Cleanup functions for the document ready method
		if (document.addEventListener) {
			DOMContentLoaded = function() {
				document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				jQuery.ready();
			};

		} else if (document.attachEvent) {
			DOMContentLoaded = function() {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if (document.readyState === "complete") {
					document.detachEvent("onreadystatechange", DOMContentLoaded);
					jQuery.ready();
				}
			};
		}

		// The DOM ready check for Internet Explorer
		function doScrollCheck() {
			if (jQuery.isReady) {
				return;
			}

			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch (e) {
				setTimeout(doScrollCheck, 1);
				return;
			}

			// and execute any waiting functions
			jQuery.ready();
		}

		return jQuery;

	})();


	// String to Object flags format cache
	var flagsCache = {};

	// Convert String-formatted flags into Object-formatted ones and store in cache
	// "once memory" ==> flagsCache[once memory] = [once:true,memory:true]
	function createFlags(flags) {
		var object = flagsCache[flags] = {},
			i, length;
		flags = flags.split(/\s+/);
		for (i = 0, length = flags.length; i < length; i++) {
			object[flags[i]] = true;
		}
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	flags:	an optional list of space-separated flags that will change how
	 *			the callback list behaves
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible flags:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function(flags) {

		// Convert flags from String-formatted to Object-formatted
		// (we check in cache first)
		flags = flags ? (flagsCache[flags] || createFlags(flags)) : {};

		var // Actual callback list
			list = [],
			// Stack of fire calls for repeatable lists
			stack = [],
			// 上一次运行的函数环境
			// Last fire value (for non-forgettable lists)
			memory,
			// Flag to know if list was already fired
			// 判断回调函数是否已经被触发过初始值为undefined,表示当前回调函数
			// 列表没有被触发过
			fired,
			// Flag to know if list is currently firing
			// 判断当前回调函数队列是否正在执行
			firing,
			// First callback to fire (used internally by add and fireWith)
			firingStart,
			// End of the loop when firing
			firingLength,
			// Index of currently firing callback (modified by remove if needed)
			firingIndex,
			// Add one or several callbacks to the list
			// 工具函数往异步队列里面添加函数
			add = function(args) {
				var i,
					length,
					elem,
					type,
					actual;
				for (i = 0, length = args.length; i < length; i++) {
					elem = args[i];
					type = jQuery.type(elem);
					//如果是数组类型则递归调用
					if (type === "array") {
						// Inspect recursively
						add(elem);
					} else if (type === "function") {
						// Add if not in unique mode and callback is not in
						// 如果没有设置unique模式以及回调函数里面没有现添加的回调函数则添加
						if (!flags.unique || !self.has(elem)) {
							list.push(elem);
						}
					}
				}
			},
			// Fire callbacks
			fire = function(context, args) {
				// context用于指定回调函数执行时的上下文
				args = args || [];
				//如果是在memory模式下memory为[context,args]
				//如果是在非memory模式下memory为true
				//同时衍生出来的有如果memory为非undefined则表示fire至少已经执行过一次
				//同理如果memory为undefined则表示fire没有被触发过
				memory = !flags.memory || [context, args];
				//表明回调函数列表至少已经被触发过
				fired = true;
				firing = true;
				//注意这里的firingIndex在会在self里面的add函数中会被改变
				firingIndex = firingStart || 0;
				firingStart = 0;
				firingLength = list.length;
				// 
				// 执行从firingStart到firingLength的回调函数
				// 注意这里的还有一个判断条件list &&
				// 因为在执行回调函数的时候可能会调用disable()函数
				// 这时就会list==undefined
				// 从这个意义来说这才是理解整个回调函数最关键的点,即
				// 在进行下面的回调函数的调用的时候,回调函数里面可能会
				// 进行调用增删改查等操作,而并不是一开始的考虑多线程的
				// 问题,而js之所以不是严格的顺序执行,在我现在发现的只有
				// 1)定时器
				// 2)事件
				// 3)ajax请求(在我看来这也是事件的一种)
				for (; list && firingIndex < firingLength; firingIndex++) {
					//这里即执行当前回调函数同时如果是stopOnfalse模式且返回false则停止执行
					//且注意这里的memory设置为true说明memory为true有以下情况
					//1)stopOnFalse模式且某个回调函数返回false
					//2)非memory模式(参见上面)
					if (list[firingIndex].apply(context, args) === false && flags.stopOnFalse) {
						memory = true; // Mark as halted
						break;
					}
				}

				// 为什么上面都已经执行了一遍回调函数这里还需要进行这种判断
				// 为什么搞的那么复杂????
				//这里置当前回调列表函数停止执行
				//这里包括以下情况
				//1)回调函数列表已经执行完成
				//2)设置了stopOnFales模式且回调函数列表中有函数返回false
				firing = false;
				// 这里之所以需要判断list因为self.disable()的时候
				// 会list = stack = memory = undefined;
				if (list) {
					// 表示非执行一次模式下
					// 这里的once是指函数指执行一次然后新添加
					if (!flags.once) {
						// 之所以会这样处理是因为当刚才回调函数在执行之中的过程中fireWith
						// 可能会被调用,当fireWith被调用时如果判断当前回调函数列表正在执行
						// 则会把content和args压入stack之中这里就进行再次调用fireWith确保??
						if (stack && stack.length) {
							// 如果不是一次模式下则把上一次保存的
							memory = stack.shift();
							self.fireWith(memory[0], memory[1]);
						}
					} else if (memory === true) {
						//表示是在执行一次模式下且以下情况中一种
						//1)非memory模式
						//2)stopOnFalse模式 + 某个回调函数的返回值为false
						//stopOnFalse模式还没碰到所以可以先忽略
						self.disable();
					} else {
						// once + memory模式清空数组,后续添加的回调函数
						// 还是会立即执行
						list = [];
					}
				}
			},
			// Actual Callbacks object
			self = {
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if (list) {
						var length = list.length;
						// 闭包机制引用上面的add工具方法
						// 所以在上层方法中可以传入的参数有[[],function]都可以
						// 但是只是会把函数添加进回调函数队列里面而已
						add(arguments);
						// 这里进行添加函数到回调函数队列里面之后会改变异步队列的
						// 长度.所以需要记录length值
						// Do we need to add the callbacks to the
						// current firing batch?
						// 如果当前有回调函数正在被执行则执行刚添加的函数
						// Q:什么情况下是正在执行的??
						// A:在调用回调函数的时候在进行调用add()方法.是脑袋被门夹了还是有什么我
						// 还没有考虑到的用途$
						if (firing) {
							// 如果当前异步队列里面的函数正在运行,只需要改变firingLength
							// 的值即可顺利的调用刚添加进去的函数,这里就不需要考虑什么onece等问题
							firingLength = list.length;
							// With memory, if we're not firing then
							// we should call right away, unless previous
							// firing was halted (stopOnFalse)
							// 如果回调函数列表未执行且已经被触发过
							// memory非undefined则表示回调函数列表已经被触发
							// memory非true有以下表示
							// 1)memory + 非stopOnFalse模式
							// 2)memory + stopOnFalse模式
						} else if (memory && memory !== true) {
							// memory 模式
							// 从当前添加的函数地方进行开始执行立即执行函数
							// 结合上面的fire来看这里定义的firingStart
							// Q:但是如果不是memory模式就不用管了???
							// A:见下面
							firingStart = length;
							fire(memory[0], memory[1]);
						}
						// 这里什么都不做的有以下情况
						// 1)添加操作不是在执行函数中添加的且memory为undefined
						// 这时表示回调函数队列没有执行过
						// 2)添加操作不是在执行函数中添加且回调函数队列触发过且
						// 这时memory !== true有以下情况
						// 1)非memory模式这时向里面添加函数并不需要触发,因为这里
						// 并没有提供触发的上下文
						// 2)stopOnfalse模式且触发过且有一个函数返回错误,这时候也
						// 不需要马上触发,因为都说了是stop所以需要自己手动触发
						// 
					}
					// 这里的this指的是什么??
					// 回调函数调用列表???这是什么??
					// 是否这的this是指self
					// 从$.Deferred()里面的then函数的使用来看
					// 这里的this指的是拥有该方法的对象.
					return this;
				},
				// Remove a callback from the list
				// 从列表里面移除一个回调函数
				remove: function() {
					// 只有回调函数队列存在的时候才进行下面的操作
					// 
					if (list) {
						var args = arguments,
							argIndex = 0,
							argLength = args.length;
						for (; argIndex < argLength; argIndex++) {
							// 一个一个删除
							for (var i = 0; i < list.length; i++) {
								if (args[argIndex] === list[i]) {
									// Handle firingIndex and firingLength
									// 如果是在回调函数里面触发的删除操作
									if (firing) {
										// 如果
										if (i <= firingLength) {
											// 把终止回调函数的下标减一
											firingLength--;
											if (i <= firingIndex) {
												// 如果删除的是已经触发过的回调函数
												firingIndex--;
											}
										}
									}
									// Remove the element
									// 在上面的操作之下统一删去一个函数
									list.splice(i--, 1);
									// If we have some unicity property then
									// we only need to do this once
									// 如果是唯一模式就不需要进行判断下面的队列里面
									// 是否还有和当前函数相同的函数了
									// 因为在队列里面一个函数只能存在一次
									// 而不是unique模式下,一个函数可能存在多次
									// 所以需要进行全部删除
									if (flags.unique) {
										break;
									}
								}
							}
						}
					}
					return this;
				},
				// Control if a given callback is in the list
				// 判断当前函数是否已经在回调函数队列里面
				has: function(fn) {
					if (list) {
						var i = 0,
							length = list.length;
						for (; i < length; i++) {
							if (fn === list[i]) {
								return true;
							}
						}
					}
					return false;
				},
				// Remove all callbacks from the list
				empty: function() {
					list = [];
					return this;
				},
				// Have the list do nothing anymore
				disable: function() {
					list = stack = memory = undefined;
					return this;
				},
				// Is it disabled?
				disabled: function() {
					return !list;
				},
				// Lock the list in its current state
				// 锁定队列
				lock: function() {
					stack = undefined;
					if (!memory || memory === true) {
						// 如果没有触发过则禁止
						// 如果触发过且不是memory模式则禁止
						self.disable();
					}
					return this;
				},
				// Is it locked?
				locked: function() {
					return !stack;
				},
				// Call all callbacks with the given context and arguments
				fireWith: function(context, args) {
					//stack的初始值为[]只有调用
					//callbacks.lock()或callbacks.disable()时才会变为undefined
					//说明只有没有禁用和锁定回调函数列表时才能调用该方法亦或说该方法才起作用
					if (stack) {
						// 如果当前回调函数列表正在执行中
						// 谁的脑门被夹了,在回调函数里面调用fireWith()函数
						// 还有生面的在回调函数里面调用add()方法这是什么鬼??
						if (firing) {
							// 并且不是once模式则才会把上下文和参数存入堆栈中
							if (!flags.once) {
								stack.push([context, args]);
							}
							// 在回调函数都执行一遍之后会检查stack
							// 里面是否有值,如果有则会再次调用fireWith()
							// 因为上面已经执行完一遍所以firing为false
							// 然后会走下面的分支然后在下面的分支
						} else if (!(flags.once && memory)) {
							// 这里表示如果当前回调函数列表不是正在执行状态
							// 且不是一次模式或者回调列表没有被触发过
							// 这里也可以说明,即使在回调函数中再次调用fireWith
							// 只要是once模式且已经执行过一次那么也不会再次执行
							// 同时也可推断出一次模式还是可以通过add方法来
							// 确保后续添加的方法被执行
							fire(context, args);
						}
					}
					return this;
				},
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith(this, arguments);
					return this;
				},
				// To know if the callbacks have already been called at least once
				fired: function() {
					// 判断队列是否已经触发过
					return !!fired;
				}
			};

		return self;
	};



	var // Static reference to slice
		sliceDeferred = [].slice;

	jQuery.extend({
		// func成功创建异步队列的回调函数
		Deferred: function(func) {
			//成功回调函数调用列表
			//失败回调函数调用列表
			//消息回调函数调用列表
			var doneList = jQuery.Callbacks("once memory"),
				failList = jQuery.Callbacks("once memory"),
				// 说明可以多次执行
				// 消息队列的用途至今没有看到??
				progressList = jQuery.Callbacks("memory"),
				state = "pending",
				// 异步队列集合
				lists = {
					resolve: doneList,
					reject: failList,
					notify: progressList
				},
				promise = {
					// 从then函数里面来看调用deferred的done之后
					// 还是返回的是promise
					// 因为其可以调用.fail()
					// 但是这里调用的是doneList.add()
					// 能够说明add()返回的是promise
					// 但是这个promise和
					done: doneList.add,
					fail: failList.add,
					progress: progressList.add,

					// 异步队列的状态
					// 起始为"paddiing"成功回调为"resolved"失败为"rejected"
					state: function() {
						return state;
					},

					// Deprecated
					isResolved: doneList.fired,
					isRejected: failList.fired,

					then: function(doneCallbacks, failCallbacks, progressCallbacks) {
						deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
						return this;
					},
					always: function() {
						deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
						return this;
					},
					pipe: function(fnDone, fnFail, fnProgress) {
						// 这里返回一个新的异步队列的只读副本
						// 既然既是副本,那么肯定是有触发的地方
						// 这里触发的地方就是当前的异步队列
						// 而下面就是制定什么时候,以何种方式触发新的异步队列
						return jQuery.Deferred(function(newDefer) {
							// 在该函数中this指向newDefer详见下面的
							jQuery.each({
								done: [fnDone, "resolve"],
								fail: [fnFail, "reject"],
								progress: [fnProgress, "notify"]
							}, function(handler, data) {
								// 在$.each()里面的函数里面this值每个循环到的对象
								var fn = data[0],
									action = data[1],
									returned;
								if (jQuery.isFunction(fn)) {
									// 如果是函数往相应的列表里面添加函数
									// 也就是当前回调函数会触发响应的过滤函数,然后根据
									// 过滤函数返回的值进行相应的操作
									// 同时注意的是这里过滤函数函数的调用参数为当前
									// 异步队列响应的触发上下文
									deferred[handler](function() {
										// 这里的this指的是[fnDone, "resolve"]等
										// 这里的arguments值的是第一个异步队列被触发的时候的上下文参数
										returned = fn.apply(this, arguments);
										if (returned && jQuery.isFunction(returned.promise)) {
											// 如果过滤函数返回一个异步队列或支持异步队列功能的对象
											// 则把异步队列二的方法resolve(),reject(),notify()添加到异步队列3中
											// 当异步队列3倍触发是,异步队列2中相应状态的回调函数被调用,参数为异步
											// 队列3中的参数(即触发上下文)
											// 似乎这个特性可以用来限制一些需要顺序加载资源的页面
											// Q:这里的返回又是在哪里进行接收??
											// A:这里并不需要进行接收,只需要强调的是这里的异步队列是由异步队列3触发就行了
											returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
										} else {
											// 如果过滤函数的返回值不是异步队列或不支持异步队列功能
											// 异步队列2中的相应状态回调函数将会被执行,参数为过滤
											// 函数的返回值
											newDefer[action + "With"](this === deferred ? newDefer : this, [returned]);
										}
									});
								} else {
									// 如果在pipe里面传入的不是函数则进行相应的函数触发
									// 这里可以不用管
									deferred[handler](newDefer[action]);
								}
							});
						}).promise();
					},
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					// 
					promise: function(obj) {
						if (obj == null) {
							obj = promise;
						} else {
							for (var key in promise) {
								obj[key] = promise[key];
							}
						}
						return obj;
					}
				},

				deferred = promise.promise({}),
				key;

			// 为异步队列deferred添加触发执行成功,失败,消息回调函数的方法,包括
			// resolve(),resolveWith(),reject(),rejectWith(),notify(),notifyWith();
			// 这里说明deferred是有触发回调函数和的能力的
			// 只是如果调用了deferred.promise(obj|null)这时obj或返回的
			// 对象并没有触发回调函数列表的能力所以才会说promise()返回的
			// 是一个只读副本
			// 从这个触发点出发,这种思想似乎可以还有别的作用
			// 即从$.Callbacks()得到一个间接操作队列的对象
			// 到这里的.promise()只能得到一个自己限制行为的对象
			// 从这里就可以看出其限制性一步一步的增大,而这背后只是运用
			// 一个原理即闭包机制.
			// 还有像jquery ui里面的模仿类的继承机制等等,似乎面向对象的
			// 编程亦可以很方便的引进js
			// 模块化的思想亦是如此,但是这些还需要进一步的思考
			for (key in lists) {
				deferred[key] = lists[key].fire;
				deferred[key + "With"] = lists[key].fireWith;
			}

			// Handle state
			// 处理函数状态
			// 一旦异步队列进入成功或失败状态,就会保持它的状态不变
			// 再次调用deffered.resolve()或deferred.reject()这些
			// 函数将不起作用
			deferred.done(function() {
				state = "resolved";
			}, failList.disable, progressList.lock).fail(function() {
				state = "rejected";
			}, doneList.disable, progressList.lock);

			// Call given func if any
			// 如果有回调函数则进行调用回调函数
			if (func) {
				func.call(deferred, deferred);
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function(firstParam) {
			var args = sliceDeferred.call(arguments, 0),
				i = 0,
				length = args.length,
				// 消息会回调函数的参数
				pValues = new Array(length),
				count = length,
				pCount = length,
				deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ?
				firstParam :
				jQuery.Deferred(),
				promise = deferred.promise();

			function resolveFunc(i) {
				return function(value) {
					// 注意这里是把异步队列的成功回调参数替换掉args[i]即用
					// 各自的异步队列触发参数替换掉异步队列
					// 
					args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
					if (!(--count)) {
						// 触发
						deferred.resolveWith(deferred, args);
					}
				};
			}

			function progressFunc(i) {
				return function(value) {
					// 参数替换
					pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
					deferred.notifyWith(promise, pValues);
				};
			}
			if (length > 1) {
				for (; i < length; i++) {
					if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise)) {
						// 参数为异步队列
						// 如果一个异步队列失败,则直接触发当前异步队列的失败回调函数
						// 触发的参数为失败的异步队列的失败列表触发参数
						args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
					} else {
						// 
						--count;
					}
				}
				if (!count) {
					// 如果参数中没有异步队列则直接触发失败回调函数列表
					deferred.resolveWith(deferred, args);
				}
			} else if (deferred !== firstParam) {
				// 如果只传入一个参数且不是异步队列,或者没有传入参数
				// 则直接触发成功回调函数列表参数为传入进来的对象
				deferred.resolveWith(deferred, length ? [firstParam] : []);
			}
			return promise;
		}
	});


	// 在上面分析出jQuery是一个函数之后那么这样的浏览器支持模块
	// 完全可以移植到自己编写的插件上面去
	jQuery.support = (function() {

		var support,
			all,
			a,
			select,
			opt,
			input,
			fragment,
			tds,
			events,
			eventName,
			i,
			isSupported,
			div = document.createElement("div"),
			documentElement = document.documentElement;

		// Preliminary tests
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

		all = div.getElementsByTagName("*");
		a = div.getElementsByTagName("a")[0];

		// Can't get basic test support
		if (!all || !all.length || !a) {
			return {};
		}

		// First batch of supports tests
		select = document.createElement("select");
		opt = select.appendChild(document.createElement("option"));
		input = div.getElementsByTagName("input")[0];

		support = {
			// IE strips leading whitespace when .innerHTML is used
			leadingWhitespace: (div.firstChild.nodeType === 3),

			// Make sure that tbody elements aren't automatically inserted
			// IE will insert them into empty tables
			tbody: !div.getElementsByTagName("tbody").length,

			// Make sure that link elements get serialized correctly by innerHTML
			// This requires a wrapper element in IE
			htmlSerialize: !!div.getElementsByTagName("link").length,

			// Get the style information from getAttribute
			// (IE uses .cssText instead)
			style: /top/.test(a.getAttribute("style")),

			// Make sure that URLs aren't manipulated
			// (IE normalizes it by default)
			hrefNormalized: (a.getAttribute("href") === "/a"),

			// Make sure that element opacity exists
			// (IE uses filter instead)
			// Use a regex to work around a WebKit issue. See #5145
			opacity: /^0.55/.test(a.style.opacity),

			// Verify style float existence
			// (IE uses styleFloat instead of cssFloat)
			cssFloat: !!a.style.cssFloat,

			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			checkOn: (input.value === "on"),

			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			optSelected: opt.selected,

			// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
			getSetAttribute: div.className !== "t",

			// Tests for enctype support on a form(#6743)
			enctype: !!document.createElement("form").enctype,

			// Makes sure cloning an html5 element does not cause problems
			// Where outerHTML is undefined, this still works
			html5Clone: document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",

			// Will be defined later
			submitBubbles: true,
			changeBubbles: true,
			focusinBubbles: false,
			deleteExpando: true,
			noCloneEvent: true,
			inlineBlockNeedsLayout: false,
			shrinkWrapBlocks: false,
			reliableMarginRight: true,
			pixelMargin: true
		};

		// jQuery.boxModel DEPRECATED in 1.3, use jQuery.support.boxModel instead
		jQuery.boxModel = support.boxModel = (document.compatMode === "CSS1Compat");

		// Make sure checked status is properly cloned
		input.checked = true;
		support.noCloneChecked = input.cloneNode(true).checked;

		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Test to see if it's possible to delete an expando from an element
		// Fails in Internet Explorer
		try {
			delete div.test;
		} catch (e) {
			support.deleteExpando = false;
		}

		if (!div.addEventListener && div.attachEvent && div.fireEvent) {
			div.attachEvent("onclick", function() {
				// Cloning a node shouldn't copy over any
				// bound event handlers (IE does this)
				support.noCloneEvent = false;
			});
			div.cloneNode(true).fireEvent("onclick");
		}

		// Check if a radio maintains its value
		// after being appended to the DOM
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";

		input.setAttribute("checked", "checked");

		// #11217 - WebKit loses check when the name is after the checked attribute
		input.setAttribute("name", "t");

		div.appendChild(input);
		fragment = document.createDocumentFragment();
		fragment.appendChild(div.lastChild);

		// WebKit doesn't clone checked state correctly in fragments
		support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		support.appendChecked = input.checked;

		fragment.removeChild(input);
		fragment.appendChild(div);

		// Technique from Juriy Zaytsev
		// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
		// We only care about the case where non-standard event systems
		// are used, namely in IE. Short-circuiting here helps us to
		// avoid an eval call (in setAttribute) which can cause CSP
		// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
		if (div.attachEvent) {
			for (i in {
					submit: 1,
					change: 1,
					focusin: 1
				}) {
				eventName = "on" + i;
				isSupported = (eventName in div);
				if (!isSupported) {
					div.setAttribute(eventName, "return;");
					isSupported = (typeof div[eventName] === "function");
				}
				support[i + "Bubbles"] = isSupported;
			}
		}

		fragment.removeChild(div);

		// Null elements to avoid leaks in IE
		fragment = select = opt = div = input = null;

		// Run tests that need a body at doc ready
		jQuery(function() {
			var container, outer, inner, table, td, offsetSupport,
				marginDiv, conMarginTop, style, html, positionTopLeftWidthHeight,
				paddingMarginBorderVisibility, paddingMarginBorder,
				body = document.getElementsByTagName("body")[0];

			if (!body) {
				// Return for frameset docs that don't have a body
				return;
			}

			conMarginTop = 1;
			paddingMarginBorder = "padding:0;margin:0;border:";
			positionTopLeftWidthHeight = "position:absolute;top:0;left:0;width:1px;height:1px;";
			paddingMarginBorderVisibility = paddingMarginBorder + "0;visibility:hidden;";
			style = "style='" + positionTopLeftWidthHeight + paddingMarginBorder + "5px solid #000;";
			html = "<div " + style + "display:block;'><div style='" + paddingMarginBorder + "0;display:block;overflow:hidden;'></div></div>" +
				"<table " + style + "' cellpadding='0' cellspacing='0'>" +
				"<tr><td></td></tr></table>";

			container = document.createElement("div");
			container.style.cssText = paddingMarginBorderVisibility + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
			body.insertBefore(container, body.firstChild);

			// Construct the test element
			div = document.createElement("div");
			container.appendChild(div);

			// Check if table cells still have offsetWidth/Height when they are set
			// to display:none and there are still other visible table cells in a
			// table row; if so, offsetWidth/Height are not reliable for use when
			// determining if an element has been hidden directly using
			// display:none (it is still safe to use offsets if a parent element is
			// hidden; don safety goggles and see bug #4512 for more information).
			// (only IE 8 fails this test)
			div.innerHTML = "<table><tr><td style='" + paddingMarginBorder + "0;display:none'></td><td>t</td></tr></table>";
			tds = div.getElementsByTagName("td");
			isSupported = (tds[0].offsetHeight === 0);

			tds[0].style.display = "";
			tds[1].style.display = "none";

			// Check if empty table cells still have offsetWidth/Height
			// (IE <= 8 fail this test)
			support.reliableHiddenOffsets = isSupported && (tds[0].offsetHeight === 0);

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			if (window.getComputedStyle) {
				div.innerHTML = "";
				marginDiv = document.createElement("div");
				marginDiv.style.width = "0";
				marginDiv.style.marginRight = "0";
				div.style.width = "2px";
				div.appendChild(marginDiv);
				support.reliableMarginRight =
					(parseInt((window.getComputedStyle(marginDiv, null) || {
						marginRight: 0
					}).marginRight, 10) || 0) === 0;
			}

			if (typeof div.style.zoom !== "undefined") {
				// Check if natively block-level elements act like inline-block
				// elements when setting their display to 'inline' and giving
				// them layout
				// (IE < 8 does this)
				div.innerHTML = "";
				div.style.width = div.style.padding = "1px";
				div.style.border = 0;
				div.style.overflow = "hidden";
				div.style.display = "inline";
				div.style.zoom = 1;
				support.inlineBlockNeedsLayout = (div.offsetWidth === 3);

				// Check if elements with layout shrink-wrap their children
				// (IE 6 does this)
				div.style.display = "block";
				div.style.overflow = "visible";
				div.innerHTML = "<div style='width:5px;'></div>";
				support.shrinkWrapBlocks = (div.offsetWidth !== 3);
			}

			div.style.cssText = positionTopLeftWidthHeight + paddingMarginBorderVisibility;
			div.innerHTML = html;

			outer = div.firstChild;
			inner = outer.firstChild;
			td = outer.nextSibling.firstChild.firstChild;

			offsetSupport = {
				doesNotAddBorder: (inner.offsetTop !== 5),
				doesAddBorderForTableAndCells: (td.offsetTop === 5)
			};

			inner.style.position = "fixed";
			inner.style.top = "20px";

			// safari subtracts parent border width here which is 5px
			offsetSupport.fixedPosition = (inner.offsetTop === 20 || inner.offsetTop === 15);
			inner.style.position = inner.style.top = "";

			outer.style.overflow = "hidden";
			outer.style.position = "relative";

			offsetSupport.subtractsBorderForOverflowNotVisible = (inner.offsetTop === -5);
			offsetSupport.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== conMarginTop);

			if (window.getComputedStyle) {
				div.style.marginTop = "1%";
				support.pixelMargin = (window.getComputedStyle(div, null) || {
					marginTop: 0
				}).marginTop !== "1%";
			}

			if (typeof container.style.zoom !== "undefined") {
				container.style.zoom = 1;
			}

			body.removeChild(container);
			marginDiv = div = container = null;

			jQuery.extend(support, offsetSupport);
		});

		return support;
	})();



	var rbrace = /^(?:\{.*\}|\[.*\])$/,
		rmultiDash = /([A-Z])/g;

	// 从上面可以看出在jQuery扩展开来应该是提供的接口中
	// 这两个是用来进行扩展jQuery原型方法和对象方法的
	// 
	jQuery.extend({
		cache: {},

		// Please use with caution
		uuid: 0,

		// Unique for each copy of jQuery on the page
		// Non-digits removed to match rinlinejQuery
		expando: "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),

		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData: {
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},

		hasData: function(elem) {
			elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
			return !!elem && !isEmptyDataObject(elem);
		},

		data: function(elem, name, data, pvt /* Internal Use Only */ ) {
			if (!jQuery.acceptData(elem)) {
				return;
			}

			var privateCache, thisCache, ret,
				internalKey = jQuery.expando,
				getByName = typeof name === "string",

				// We have to handle DOM nodes and JS objects differently because IE6-7
				// can't GC object references properly across the DOM-JS boundary
				isNode = elem.nodeType,

				// Only DOM nodes need the global jQuery cache; JS object data is
				// attached directly to the object so GC can occur automatically
				cache = isNode ? jQuery.cache : elem,

				// Only defining an ID for JS objects if its cache already exists allows
				// the code to shortcut on the same path as a DOM node with no cache
				id = isNode ? elem[internalKey] : elem[internalKey] && internalKey,
				isEvents = name === "events";

			// Avoid doing any more work than we need to when trying to get data on an
			// object that has no data at all
			if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined) {
				return;
			}

			if (!id) {
				// Only DOM nodes need a new unique ID for each element since their data
				// ends up in the global cache
				if (isNode) {
					elem[internalKey] = id = ++jQuery.uuid;
				} else {
					id = internalKey;
				}
			}

			if (!cache[id]) {
				cache[id] = {};

				// Avoids exposing jQuery metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if (!isNode) {
					cache[id].toJSON = jQuery.noop;
				}
			}

			// An object can be passed to jQuery.data instead of a key/value pair; this gets
			// shallow copied over onto the existing cache
			if (typeof name === "object" || typeof name === "function") {
				if (pvt) {
					cache[id] = jQuery.extend(cache[id], name);
				} else {
					cache[id].data = jQuery.extend(cache[id].data, name);
				}
			}

			privateCache = thisCache = cache[id];

			// jQuery data() is stored in a separate object inside the object's internal data
			// cache in order to avoid key collisions between internal data and user-defined
			// data.
			if (!pvt) {
				if (!thisCache.data) {
					thisCache.data = {};
				}

				thisCache = thisCache.data;
			}

			if (data !== undefined) {
				thisCache[jQuery.camelCase(name)] = data;
			}

			// Users should not attempt to inspect the internal events object using jQuery.data,
			// it is undocumented and subject to change. But does anyone listen? No.
			if (isEvents && !thisCache[name]) {
				return privateCache.events;
			}

			// Check for both converted-to-camel and non-converted data property names
			// If a data property was specified
			if (getByName) {

				// First Try to find as-is property data
				ret = thisCache[name];

				// Test for null|undefined property data
				if (ret == null) {

					// Try to find the camelCased property
					ret = thisCache[jQuery.camelCase(name)];
				}
			} else {
				ret = thisCache;
			}

			return ret;
		},

		removeData: function(elem, name, pvt /* Internal Use Only */ ) {
			if (!jQuery.acceptData(elem)) {
				return;
			}

			var thisCache, i, l,

				// Reference to internal data cache key
				internalKey = jQuery.expando,

				isNode = elem.nodeType,

				// See jQuery.data for more information
				cache = isNode ? jQuery.cache : elem,

				// See jQuery.data for more information
				id = isNode ? elem[internalKey] : internalKey;

			// If there is already no cache entry for this object, there is no
			// purpose in continuing
			if (!cache[id]) {
				return;
			}

			if (name) {

				thisCache = pvt ? cache[id] : cache[id].data;

				if (thisCache) {

					// Support array or space separated string names for data keys
					if (!jQuery.isArray(name)) {

						// try the string as a key before any manipulation
						if (name in thisCache) {
							name = [name];
						} else {

							// split the camel cased version by spaces unless a key with the spaces exists
							name = jQuery.camelCase(name);
							if (name in thisCache) {
								name = [name];
							} else {
								name = name.split(" ");
							}
						}
					}

					for (i = 0, l = name.length; i < l; i++) {
						delete thisCache[name[i]];
					}

					// If there is no data left in the cache, we want to continue
					// and let the cache object itself get destroyed
					if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) {
						return;
					}
				}
			}

			// See jQuery.data for more information
			if (!pvt) {
				delete cache[id].data;

				// Don't destroy the parent cache unless the internal data object
				// had been the only thing left in it
				if (!isEmptyDataObject(cache[id])) {
					return;
				}
			}

			// Browsers that fail expando deletion also refuse to delete expandos on
			// the window, but it will allow it on all other JS objects; other browsers
			// don't care
			// Ensure that `cache` is not a window object #10080
			if (jQuery.support.deleteExpando || !cache.setInterval) {
				delete cache[id];
			} else {
				cache[id] = null;
			}

			// We destroyed the cache and need to eliminate the expando on the node to avoid
			// false lookups in the cache for entries that no longer exist
			if (isNode) {
				// IE does not allow us to delete expando properties from nodes,
				// nor does it have a removeAttribute function on Document nodes;
				// we must handle all of these cases
				if (jQuery.support.deleteExpando) {
					delete elem[internalKey];
				} else if (elem.removeAttribute) {
					elem.removeAttribute(internalKey);
				} else {
					elem[internalKey] = null;
				}
			}
		},

		// For internal use only.
		_data: function(elem, name, data) {
			return jQuery.data(elem, name, data, true);
		},

		// A method for determining if a DOM node can handle the data expando
		acceptData: function(elem) {
			if (elem.nodeName) {
				var match = jQuery.noData[elem.nodeName.toLowerCase()];

				if (match) {
					return !(match === true || elem.getAttribute("classid") !== match);
				}
			}

			return true;
		}
	});

	jQuery.fn.extend({
		data: function(key, value) {
			var parts, part, attr, name, l,
				elem = this[0],
				i = 0,
				data = null;

			// Gets all values
			if (key === undefined) {
				if (this.length) {
					data = jQuery.data(elem);

					if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
						attr = elem.attributes;
						for (l = attr.length; i < l; i++) {
							name = attr[i].name;

							if (name.indexOf("data-") === 0) {
								name = jQuery.camelCase(name.substring(5));

								dataAttr(elem, name, data[name]);
							}
						}
						jQuery._data(elem, "parsedAttrs", true);
					}
				}

				return data;
			}

			// Sets multiple values
			if (typeof key === "object") {
				return this.each(function() {
					jQuery.data(this, key);
				});
			}

			parts = key.split(".", 2);
			parts[1] = parts[1] ? "." + parts[1] : "";
			part = parts[1] + "!";

			return jQuery.access(this, function(value) {

				if (value === undefined) {
					data = this.triggerHandler("getData" + part, [parts[0]]);

					// Try to fetch any internally stored data first
					if (data === undefined && elem) {
						data = jQuery.data(elem, key);
						data = dataAttr(elem, key, data);
					}

					return data === undefined && parts[1] ?
						this.data(parts[0]) :
						data;
				}

				parts[1] = value;
				this.each(function() {
					var self = jQuery(this);

					self.triggerHandler("setData" + part, parts);
					jQuery.data(this, key, value);
					self.triggerHandler("changeData" + part, parts);
				});
			}, null, value, arguments.length > 1, null, false);
		},

		removeData: function(key) {
			return this.each(function() {
				jQuery.removeData(this, key);
			});
		}
	});

	function dataAttr(elem, key, data) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if (data === undefined && elem.nodeType === 1) {

			var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();

			data = elem.getAttribute(name);

			if (typeof data === "string") {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :
						jQuery.isNumeric(data) ? +data :
						rbrace.test(data) ? jQuery.parseJSON(data) :
						data;
				} catch (e) {}

				// Make sure we set the data so it isn't changed later
				jQuery.data(elem, key, data);

			} else {
				data = undefined;
			}
		}

		return data;
	}

	// checks a cache object for emptiness
	function isEmptyDataObject(obj) {
		for (var name in obj) {

			// if the public data object is empty, the private is still empty
			if (name === "data" && jQuery.isEmptyObject(obj[name])) {
				continue;
			}
			if (name !== "toJSON") {
				return false;
			}
		}

		return true;
	}



	function handleQueueMarkDefer(elem, type, src) {
		var deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			defer = jQuery._data(elem, deferDataKey);
		// 如果关联的队列为空,且关联的计数器为0,则
		// 移除并触发回调函数列表,这会导致.promise()中
		// 的计数器减1.
		// 使用setTimeout是为了使关联的队列或计数器的回调
		// 函数优先执行??
		// 在._unmark()中如果计数器变为0则调用该函数,在调用
		// 该函数的时候已经移除了数据,这里传入这个只是为了提醒不用判断
		if (defer &&
			(src === "queue" || !jQuery._data(elem, queueDataKey)) &&
			(src === "mark" || !jQuery._data(elem, markDataKey))) {
			// Give room for hard-coded callbacks to fire first
			// and eventually mark/queue something else on the element
			setTimeout(function() {
				if (!jQuery._data(elem, queueDataKey) &&
					!jQuery._data(elem, markDataKey)) {
					jQuery.removeData(elem, deferDataKey, true);
					defer.fire();
				}
			}, 0);
		}
	}

	jQuery.extend({

		_mark: function(elem, type) {
			if (elem) {
				type = (type || "fx") + "mark";
				jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1);
			}
		},

		_unmark: function(force, elem, type) {
			if (force !== true) {
				type = elem;
				elem = force;
				force = false;
			}
			if (elem) {
				type = type || "fx";
				var key = type + "mark",
					count = force ? 0 : ((jQuery._data(elem, key) || 1) - 1);
				if (count) {
					jQuery._data(elem, key, count);
				} else {
					jQuery.removeData(elem, key, true);
					handleQueueMarkDefer(elem, type, "mark");
				}
			}
		},

		queue: function(elem, type, data) {
			var q;
			if (elem) {
				type = (type || "fx") + "queue";
				q = jQuery._data(elem, type);

				// Speed up dequeue by getting out quickly if this is just a lookup
				if (data) {
					if (!q || jQuery.isArray(data)) {
						q = jQuery._data(elem, type, jQuery.makeArray(data));
					} else {
						q.push(data);
					}
				}
				return q || [];
			}
		},

		dequeue: function(elem, type) {
			type = type || "fx";

			var queue = jQuery.queue(elem, type),
				fn = queue.shift(),
				hooks = {};

			// If the fx queue is dequeued, always remove the progress sentinel
			if (fn === "inprogress") {
				// 
				fn = queue.shift();
			}

			if (fn) {
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if (type === "fx") {
					queue.unshift("inprogress");
				}

				jQuery._data(elem, type + ".run", hooks);
				fn.call(elem, function() {
					jQuery.dequeue(elem, type);
				}, hooks);
			}

			if (!queue.length) {
				jQuery.removeData(elem, type + "queue " + type + ".run", true);
				handleQueueMarkDefer(elem, type, "queue");
			}
		}
	});

	jQuery.fn.extend({
		queue: function(type, data) {
			var setter = 2;

			if (typeof type !== "string") {
				data = type;
				type = "fx";
				setter--;
			}

			if (arguments.length < setter) {
				return jQuery.queue(this[0], type);
			}

			return data === undefined ?
				this :
				this.each(function() {
					var queue = jQuery.queue(this, type, data);

					if (type === "fx" && queue[0] !== "inprogress") {
						jQuery.dequeue(this, type);
					}
				});
		},
		dequeue: function(type) {
			return this.each(function() {
				jQuery.dequeue(this, type);
			});
		},
		// Based off of the plugin by Clint Helfers, with permission.
		// http://blindsignals.com/index.php/2009/07/jquery-delay/
		delay: function(time, type) {
			time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
			type = type || "fx";

			return this.queue(type, function(next, hooks) {
				var timeout = setTimeout(next, time);
				hooks.stop = function() {
					clearTimeout(timeout);
				};
			});
		},
		clearQueue: function(type) {
			return this.queue(type || "fx", []);
		},
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function(type, object) {
			if (typeof type !== "string") {
				object = type;
				type = undefined;
			}
			type = type || "fx";
			var defer = jQuery.Deferred(),
				elements = this,
				i = elements.length,
				count = 1,
				deferDataKey = type + "defer",
				queueDataKey = type + "queue",
				markDataKey = type + "mark",
				tmp;

			function resolve() {
				if (!(--count)) {
					defer.resolveWith(elements, [elements]);
				}
			}
			while (i--) {
				// 如果元素已经有关联的回调函数列表(type+"deff"),说明需要观察该DOM元素
				// 把取出的回调函数列表赋值给临时变量tmp;
				// 如果元素有关联的列表(type+"queue"),或有关联的计数器(type+"mark")
				// 也说明需要观察该元素,这时会新创建一个回调函数列表,并赋值给临时变量
				// tmp
				if ((tmp = jQuery.data(elements[i], deferDataKey, undefined, true) ||
						(jQuery.data(elements[i], queueDataKey, undefined, true) ||
							jQuery.data(elements[i], markDataKey, undefined, true)) &&
						jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true))) {
					count++;
					tmp.add(resolve);
				}
			}
			resolve();
			return defer.promise(object);
		}
	});



	var rclass = /[\n\t\r]/g,
		rspace = /\s+/,
		rreturn = /\r/g,
		rtype = /^(?:button|input)$/i,
		rfocusable = /^(?:button|input|object|select|textarea)$/i,
		rclickable = /^a(?:rea)?$/i,
		rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
		getSetAttribute = jQuery.support.getSetAttribute,
		nodeHook, boolHook, fixSpecified;

	// CSS操作
	jQuery.fn.extend({
		attr: function(name, value) {
			return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
		},

		removeAttr: function(name) {
			return this.each(function() {
				jQuery.removeAttr(this, name);
			});
		},

		prop: function(name, value) {
			return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
		},

		removeProp: function(name) {
			name = jQuery.propFix[name] || name;
			return this.each(function() {
				// try/catch handles cases where IE balks (such as removing a property on window)
				try {
					this[name] = undefined;
					delete this[name];
				} catch (e) {}
			});
		},

		addClass: function(value) {
			var classNames, i, l, elem,
				setClass, c, cl;

			if (jQuery.isFunction(value)) {
				return this.each(function(j) {
					jQuery(this).addClass(value.call(this, j, this.className));
				});
			}

			if (value && typeof value === "string") {
				classNames = value.split(rspace);

				for (i = 0, l = this.length; i < l; i++) {
					elem = this[i];

					if (elem.nodeType === 1) {
						if (!elem.className && classNames.length === 1) {
							elem.className = value;

						} else {
							setClass = " " + elem.className + " ";

							for (c = 0, cl = classNames.length; c < cl; c++) {
								if (!~setClass.indexOf(" " + classNames[c] + " ")) {
									setClass += classNames[c] + " ";
								}
							}
							elem.className = jQuery.trim(setClass);
						}
					}
				}
			}

			return this;
		},

		removeClass: function(value) {
			var classNames, i, l, elem, className, c, cl;

			if (jQuery.isFunction(value)) {
				return this.each(function(j) {
					jQuery(this).removeClass(value.call(this, j, this.className));
				});
			}

			if ((value && typeof value === "string") || value === undefined) {
				classNames = (value || "").split(rspace);

				for (i = 0, l = this.length; i < l; i++) {
					elem = this[i];

					if (elem.nodeType === 1 && elem.className) {
						if (value) {
							className = (" " + elem.className + " ").replace(rclass, " ");
							for (c = 0, cl = classNames.length; c < cl; c++) {
								className = className.replace(" " + classNames[c] + " ", " ");
							}
							elem.className = jQuery.trim(className);

						} else {
							elem.className = "";
						}
					}
				}
			}

			return this;
		},

		toggleClass: function(value, stateVal) {
			var type = typeof value,
				isBool = typeof stateVal === "boolean";

			if (jQuery.isFunction(value)) {
				return this.each(function(i) {
					jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
				});
			}

			return this.each(function() {
				if (type === "string") {
					// toggle individual class names
					var className,
						i = 0,
						self = jQuery(this),
						state = stateVal,
						classNames = value.split(rspace);

					while ((className = classNames[i++])) {
						// check each className given, space seperated list
						state = isBool ? state : !self.hasClass(className);
						self[state ? "addClass" : "removeClass"](className);
					}

				} else if (type === "undefined" || type === "boolean") {
					if (this.className) {
						// store className if set
						jQuery._data(this, "__className__", this.className);
					}

					// toggle whole className
					this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
				}
			});
		},

		hasClass: function(selector) {
			var className = " " + selector + " ",
				i = 0,
				l = this.length;
			for (; i < l; i++) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
					return true;
				}
			}

			return false;
		},

		val: function(value) {
			var hooks, ret, isFunction,
				elem = this[0];

			if (!arguments.length) {
				if (elem) {
					hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

					if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?
						// handle most common string cases
						ret.replace(rreturn, "") :
						// handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction(value);

			return this.each(function(i) {
				var self = jQuery(this),
					val;

				if (this.nodeType !== 1) {
					return;
				}

				if (isFunction) {
					val = value.call(this, i, self.val());
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if (val == null) {
					val = "";
				} else if (typeof val === "number") {
					val += "";
				} else if (jQuery.isArray(val)) {
					val = jQuery.map(val, function(value) {
						return value == null ? "" : value + "";
					});
				}

				hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

				// If set returns undefined, fall back to normal setting
				if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
					this.value = val;
				}
			});
		}
	});

	jQuery.extend({
		valHooks: {
			option: {
				get: function(elem) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}
			},
			select: {
				get: function(elem) {
					var value, i, max, option,
						index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";

					// Nothing was selected
					if (index < 0) {
						return null;
					}

					// Loop through all the selected options
					i = one ? index : 0;
					max = one ? index + 1 : options.length;
					for (; i < max; i++) {
						option = options[i];

						// Don't return options that are disabled or in a disabled optgroup
						if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

							// Get the specific value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if (one) {
								return value;
							}

							// Multi-Selects return an array
							values.push(value);
						}
					}

					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if (one && !values.length && options.length) {
						return jQuery(options[index]).val();
					}

					return values;
				},

				set: function(elem, value) {
					var values = jQuery.makeArray(value);

					jQuery(elem).find("option").each(function() {
						this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
					});

					if (!values.length) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		},

		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},

		attr: function(elem, name, value, pass) {
			var ret, hooks, notxml,
				nType = elem.nodeType;

			// don't get/set attributes on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			if (pass && name in jQuery.attrFn) {
				return jQuery(elem)[name](value);
			}

			// Fallback to prop when attributes are not supported
			if (typeof elem.getAttribute === "undefined") {
				return jQuery.prop(elem, name, value);
			}

			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if (notxml) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook);
			}

			if (value !== undefined) {

				if (value === null) {
					jQuery.removeAttr(elem, name);
					return;

				} else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) {
					return ret;

				} else {
					elem.setAttribute(name, "" + value);
					return value;
				}

			} else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) {
				return ret;

			} else {

				ret = elem.getAttribute(name);

				// Non-existent attributes return null, we normalize to undefined
				return ret === null ?
					undefined :
					ret;
			}
		},

		removeAttr: function(elem, value) {
			var propName, attrNames, name, l, isBool,
				i = 0;

			if (value && elem.nodeType === 1) {
				attrNames = value.toLowerCase().split(rspace);
				l = attrNames.length;

				for (; i < l; i++) {
					name = attrNames[i];

					if (name) {
						propName = jQuery.propFix[name] || name;
						isBool = rboolean.test(name);

						// See #9699 for explanation of this approach (setting first, then removal)
						// Do not do this for boolean attributes (see #10870)
						if (!isBool) {
							jQuery.attr(elem, name, "");
						}
						elem.removeAttribute(getSetAttribute ? name : propName);

						// Set corresponding property to false for boolean attributes
						if (isBool && propName in elem) {
							elem[propName] = false;
						}
					}
				}
			}
		},

		attrHooks: {
			type: {
				set: function(elem, value) {
					// We can't allow the type property to be changed (since it causes problems in IE)
					if (rtype.test(elem.nodeName) && elem.parentNode) {
						jQuery.error("type property can't be changed");
					} else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
						// Setting the type on a radio button after the value resets the value in IE6-9
						// Reset value to it's default in case type is set after value
						// This is for element creation
						var val = elem.value;
						elem.setAttribute("type", value);
						if (val) {
							elem.value = val;
						}
						return value;
					}
				}
			},
			// Use the value property for back compat
			// Use the nodeHook for button elements in IE6/7 (#1954)
			value: {
				get: function(elem, name) {
					if (nodeHook && jQuery.nodeName(elem, "button")) {
						return nodeHook.get(elem, name);
					}
					return name in elem ?
						elem.value :
						null;
				},
				set: function(elem, value, name) {
					if (nodeHook && jQuery.nodeName(elem, "button")) {
						return nodeHook.set(elem, value, name);
					}
					// Does not return so that setAttribute is also used
					elem.value = value;
				}
			}
		},

		propFix: {
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		},

		prop: function(elem, name, value) {
			var ret, hooks, notxml,
				nType = elem.nodeType;

			// don't get/set properties on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

			if (notxml) {
				// Fix name and attach hooks
				name = jQuery.propFix[name] || name;
				hooks = jQuery.propHooks[name];
			}

			if (value !== undefined) {
				if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
					return ret;

				} else {
					return (elem[name] = value);
				}

			} else {
				if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
					return ret;

				} else {
					return elem[name];
				}
			}
		},

		propHooks: {
			tabIndex: {
				get: function(elem) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabindex");

					return attributeNode && attributeNode.specified ?
						parseInt(attributeNode.value, 10) :
						rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ?
						0 :
						undefined;
				}
			}
		}
	});

	// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
	jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

	// Hook for boolean attributes
	// boolean属性
	boolHook = {
		get: function(elem, name) {
			// Align boolean attributes with corresponding properties
			// Fall back to attribute presence where some booleans are not supported
			var attrNode,
				property = jQuery.prop(elem, name);
			// 如果对应DOM属性值为true,或HTML属性值不是false,则返回
			// 小写属性名,否则返回undefined
			// 这里的属性名等同于ture
			// 
			return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ?
				name.toLowerCase() :
				undefined;
		},
		set: function(elem, value, name) {
			var propName;
			if (value === false) {
				// Remove boolean attributes when set to false
				// 如果参数value为false,则移除指定的HTML属性
				jQuery.removeAttr(elem, name);
			} else {
				// value is true since we know at this point it's type boolean and not false
				// Set boolean attributes to the same name and set the DOM property
				// 取出HTML属性名对应的DOM属性名,如果该DOM属性名
				// 在DOM元素上已存在,则设置为true
				propName = jQuery.propFix[name] || name;
				if (propName in elem) {
					// Only set the IDL specifically if it already exists on the element
					elem[propName] = true;
				}
				// 调用原生方法设置属性,属性为小写属性名
				elem.setAttribute(name, name.toLowerCase());
			}
			return name;
		}
	};

	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if (!getSetAttribute) {

		fixSpecified = {
			name: true,
			id: true,
			coords: true
		};

		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		nodeHook = jQuery.valHooks.button = {
			get: function(elem, name) {
				var ret;
				// 读取属性节点
				ret = elem.getAttributeNode(name);
				// ret.specified为false表示从未设置过该属性
				return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ?
					ret.nodeValue :
					undefined;
			},
			set: function(elem, value, name) {
				// Set the existing or create a new attribute node
				var ret = elem.getAttributeNode(name);
				if (!ret) {
					ret = document.createAttribute(name);
					elem.setAttributeNode(ret);
				}
				return (ret.nodeValue = value + "");
			}
		};

		// Apply the nodeHook to tabindex
		jQuery.attrHooks.tabindex.set = nodeHook.set;

		// Set width and height to auto instead of 0 on empty string( Bug #8150 )
		// This is for removals
		jQuery.each(["width", "height"], function(i, name) {
			jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
				set: function(elem, value) {
					if (value === "") {
						// 对于值为""自动设置为auto
						elem.setAttribute(name, "auto");
						return value;
					}
				}
			});
		});

		// Set contenteditable to false on removals(#10429)
		// Setting to empty string throws an error as an invalid value
		jQuery.attrHooks.contenteditable = {
			get: nodeHook.get,
			set: function(elem, value, name) {
				if (value === "") {
					value = "false";
				}
				nodeHook.set(elem, value, name);
			}
		};
	}


	// Some attributes require a special call on IE
	if (!jQuery.support.hrefNormalized) {
		jQuery.each(["href", "src", "width", "height"], function(i, name) {
			jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
				get: function(elem) {
					var ret = elem.getAttribute(name, 2);
					return ret === null ? undefined : ret;
				}
			});
		});
	}

	if (!jQuery.support.style) {
		jQuery.attrHooks.style = {
			get: function(elem) {
				// Return undefined in the case of empty string
				// Normalize to lowercase since IE uppercases css property names
				return elem.style.cssText.toLowerCase() || undefined;
			},
			set: function(elem, value) {
				return (elem.style.cssText = "" + value);
			}
		};
	}

	// Safari mis-reports the default selected property of an option
	// Accessing the parent's selectedIndex property fixes it
	if (!jQuery.support.optSelected) {
		jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
			get: function(elem) {
				var parent = elem.parentNode;

				if (parent) {
					parent.selectedIndex;

					// Make sure that it also works with optgroups, see #5701
					if (parent.parentNode) {
						parent.parentNode.selectedIndex;
					}
				}
				return null;
			}
		});
	}

	// IE6/7 call enctype encoding
	if (!jQuery.support.enctype) {
		jQuery.propFix.enctype = "encoding";
	}

	// Radios and checkboxes getter/setter
	if (!jQuery.support.checkOn) {
		jQuery.each(["radio", "checkbox"], function() {
			jQuery.valHooks[this] = {
				get: function(elem) {
					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}
			};
		});
	}
	jQuery.each(["radio", "checkbox"], function() {
		jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
			set: function(elem, value) {
				if (jQuery.isArray(value)) {
					return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
				}
			}
		});
	});



	var rformElems = /^(?:textarea|input|select)$/i,
		rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
		rhoverHack = /(?:^|\s)hover(\.\S+)?\b/,
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|contextmenu)|click/,
		rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
		rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
		quickParse = function(selector) {
			var quick = rquickIs.exec(selector);
			if (quick) {
				//   0  1    2   3
				// [ _, tag, id, class ]
				quick[1] = (quick[1] || "").toLowerCase();
				quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)");
			}
			return quick;
		},
		quickIs = function(elem, m) {
			var attrs = elem.attributes || {};
			return (
				(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
				(!m[2] || (attrs.id || {}).value === m[2]) &&
				(!m[3] || m[3].test((attrs["class"] || {}).value))
			);
		},
		/**
		 * 用来把组合事件"hover.namespace"分解为"mouseenter.namespace mouseleave.namespace"
		 * @param  {[type]} events [description]
		 * @return {[type]}        [description]
		 */
		hoverHack = function(events) {
			return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
		};

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	// jquery事件系统支持方法

	jQuery.event = {
		/**
		 * [事件绑定函数]
		 * @param {[type]} elem     [待绑定事件的DOM元素]
		 * @param {[type]} types    [事件类型字符串,多个事件之间用空格隔开,命名空间之间用"."隔开]
		 * @param {[type]} handler  [待绑定的事件监听函数,还可以是一个自定义的监听对象]
		 * @param {[type]} data     [description]
		 * @param {[type]} selector [description]
		 */
		add: function(elem, types, handler, data, selector) {

			var elemData, // DOM元素关联的缓存对象
				eventHandle, // 指向主监听函数
				events, // DOM元素管理的事件缓存对象
				t, tns, type,
				namespaces, // 命名空间数组
				handleObj, // 封装了监听函数的监听对象
				handleObjIn, // 传进来的监听对象
				quick,
				handlers, // 指向事件类型对应的监听对象数组
				special; // 特殊事件类型对应的修正对象

			// Don't attach events to noData or text/comment nodes (allow plain objects tho)
			// 不再文本节点和注释节点上面绑定事件因为浏览器不会再这俩那个节点上面触发事件
			// 如果绑定没有传入绑定的事件类型也忽略本次调动
			// 如果当前元素不支持附加扩展属性也忽略本次调用,因为像主监听函数这些东西都需要
			// 缓存模块的支持
			if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			// 如果传进来的是自定义监听对象
			// 那么自定义监听对象需要进行哪些定制
			// 1:handler处理函数
			// 2:选择器
			// ...
			if (handler.handler) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			// 为监听函数分配一个唯一标识guid
			// 在移除监听函数时将通过唯一标识来匹配监听函数
			if (!handler.guid) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			// 取出事件缓存对象events,如果不存在则进行初始化
			events = elemData.events;
			if (!events) {
				elemData.events = events = {};
			}

			// 取出或初始化主监听函数
			eventHandle = elemData.handle;
			// 这里的elemHandle是什么时候传进去的js又是在哪里进行保存
			// 所谓的js垃圾回收机制就是如果对象里面进行了对象引用就
			// 不会对垃圾进行回收?
			// 这里面的垃圾回收机制又和java里面的垃圾回收机制有什么不同
			// 
			if (!eventHandle) {
				elemData.handle = eventHandle = function(e) {
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
						// 从这里就可以看出在dispatch函数里面的this指向的是事件绑定的DOM元素
						// 亦或说进行事件邦迪传递进来的elem元素
						// 这里的arguments指的是什么??是不是上面的e,即浏览器传递进来的
						// 浏览器原生事件??
						jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
						undefined;
				};
				// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
				// 这里为什么可以在里面应用再在下面进行,定义就像这里面的eventHandle.elem
				// 从这里是否能说明js的执行顺序??
				eventHandle.elem = elem;
			}

			// Handle multiple events separated by a space
			// jQuery(...).bind("mouseover mouseout", fn);
			// 这里引用命名空间有什么好处
			types = jQuery.trim(hoverHack(types)).split(" ");
			for (t = 0; t < types.length; t++) {

				tns = rtypenamespace.exec(types[t]) || [];
				type = tns[1];
				// 命名空间之间没有层级关系
				namespaces = (tns[2] || "").split(".").sort();

				// If event changes its type, use the special event handlers for the changed type
				// 尝试从jQuery.event.special中获取当前事件类型对应的修正对象
				special = jQuery.event.special[type] || {};

				// If selector defined, determine special event api type, otherwise given type
				// 如果传入了参数selector,则绑定的是代理事件,可能需要把当前事件类型修正为可
				// 冒泡的事件类型(special.delegateType),例如不冒泡的focus,blur
				// 会被修正为可冒泡的focusin,focusout;
				// 如果未传入的参数selector,则是普通的事件绑定,但是也可能因为浏览器对某些
				// 事件不支持或支持不完整,需要修正为支持度更好的事件类型(special.bindType)
				// 例如:mouseenter,mouseleave会修正为mouseover和mouseout
				type = (selector ? special.delegateType : special.bindType) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[type] || {};

				// handleObj is passed to all event handlers
				// 把监听函数封装为监听对象
				handleObj = jQuery.extend({
					type: type,
					origType: tns[1],
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					// 缓存简单选择器表达式(只包含了标签,id或类样式)的解析结果,
					// 用于加快对后代元素的过滤速度
					quick: selector && quickParse(selector),
					namespace: namespaces.join(".")
				}, handleObjIn);

				// Init the event handler queue if we're the first
				handlers = events[type];
				if (!handlers) {
					// 第一次绑定该类型事件,则初始化监听对象数组,并绑定主监听函数
					handlers = events[type] = [];
					// 用于指示下一个代理监听对象的插入位置
					handlers.delegateCount = 0;

					// Only use addEventListener/attachEvent if the special events handler returns false
					// 如果第一次绑定该类型的事件,则绑定监听主函数.绑定时
					// 优先调用修正对象的修正方法setup();如果修正对象没有修正方法setup()
					// 或者修正方法setup返回false则调用原生方法进行绑定主监听函数
					if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
						// Bind the global event handler to the element
						if (elem.addEventListener) {
							// IE9+和别的浏览器用该方法进行绑定
							// 这里表明的是表明其绑定的仅仅是非捕获事件阶段而已
							// 因为这里第三个参数设置为false以及在
							// IE9-的浏览其中没有捕获阶段的说法
							elem.addEventListener(type, eventHandle, false);

						} else if (elem.attachEvent) {
							// IE9-用该方法绑定
							elem.attachEvent("on" + type, eventHandle);
						}
					}
				}

				// 如果修正对象有add方法,则优先调用修正方法add()绑定监听函数
				// 这是否就是说特殊事件的绑定是自己进行添加的
				// 但是为什么要区分特俗事件和普通事件绑定呢??
				if (special.add) {
					special.add.call(elem, handleObj);

					if (!handleObj.handler.guid) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if (selector) {
					handlers.splice(handlers.delegateCount++, 0, handleObj);
				} else {
					handlers.push(handleObj);
				}

				// Keep track of which events have ever been used, for event optimization
				// 记录绑定过的事件类型.
				jQuery.event.global[type] = true;
			}

			// Nullify elem to prevent memory leaks in IE
			elem = null;
		},

		global: {},

		// Detach an event or set of events from an element
		remove: function(elem, types, handler, selector, mappedTypes) {

			var elemData = jQuery.hasData(elem) && jQuery._data(elem),
				t, tns, type, origType, namespaces, origCount,
				j, events, special, handle, eventType, handleObj;

			if (!elemData || !(events = elemData.events)) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = jQuery.trim(hoverHack(types || "")).split(" ");
			for (t = 0; t < types.length; t++) {
				tns = rtypenamespace.exec(types[t]) || [];
				type = origType = tns[1];
				namespaces = tns[2];

				// Unbind all events (on this namespace, if provided) for the element
				if (!type) {
					for (type in events) {
						jQuery.event.remove(elem, type + types[t], handler, selector, true);
					}
					continue;
				}

				special = jQuery.event.special[type] || {};
				type = (selector ? special.delegateType : special.bindType) || type;
				eventType = events[type] || [];
				origCount = eventType.length;
				// 先进行排序,然后合并成正则表达式
				// "ns1" ==> /(^|\.)ns1(\.|$)/
				// "ns2.ns1" ==> /(^|\.)ns1\.(?:.*\.)?ns2(\.|$)/
				// 其中中间表示ns1和ns2之间还可以有别的命名空间
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

				// Remove matching events
				for (j = 0; j < eventType.length; j++) {
					handleObj = eventType[j];

					if ((mappedTypes || origType === handleObj.origType) &&
						(!handler || handler.guid === handleObj.guid) &&
						(!namespaces || namespaces.test(handleObj.namespace)) &&
						(!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
						eventType.splice(j--, 1);

						if (handleObj.selector) {
							eventType.delegateCount--;
						}
						if (special.remove) {
							special.remove.call(elem, handleObj);
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if (eventType.length === 0 && origCount !== eventType.length) {
					if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
						jQuery.removeEvent(elem, type, elemData.handle);
					}

					delete events[type];
				}
			}

			// Remove the expando if it's no longer used
			if (jQuery.isEmptyObject(events)) {
				handle = elemData.handle;
				if (handle) {
					handle.elem = null;
				}

				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				jQuery.removeData(elem, ["events", "handle"], true);
			}
		},

		// Events that are safe to short-circuit if no handlers are attached.
		// Native DOM events should not be added, they may have inline handlers.
		customEvent: {
			"getData": true,
			"setData": true,
			"changeData": true
		},

		trigger: function(event, data, elem, onlyHandlers) {
			// Don't do events on text and comment nodes
			if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
				return;
			}

			// Event object or event type
			// 事件对象或事件类型
			var type = event.type || event,
				namespaces = [],
				cache, exclusive, i, cur, old, ontype, special,
				handle, // 主监听函数或行内监听函数
				// 冒泡路径数组
				// [
				// 		[当前元素,事件类型]
				// 		[父元素,支持冒泡的事件类型]
				// 		[祖先元素,支持冒泡的事件类型]
				// 		...
				// 		[window对象,支持冒泡的事件类型]
				// ]
				eventPath,
				bubbleType; // 当前事件类型所对应的冒泡事件类型

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			// rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
			if (rfocusMorph.test(type + jQuery.event.triggered)) {
				return;
			}

			if (type.indexOf("!") >= 0) {
				// Exclusive events trigger only for the exact event (no namespaces)
				// 如果事件类型以感叹号结尾如("click!"),表示只会触发没有命名空间的监听函数
				// 
				type = type.slice(0, -1);
				exclusive = true;
			}

			// 有命名空间
			if (type.indexOf(".") >= 0) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				// 解析,排序
				type = namespaces.shift();
				namespaces.sort();
			}

			// jQuery.event.global为false表示从未绑定过该类型的事件
			// 在这种情况下,如果不会触发或不会有行内监听函数和默认行为,那么后面的
			// 代码什么也不会触发
			// 如果未传入参数elem,表示要触发的是该类型的所有事件,但不会触发行内
			// 监听函数和默认行为以避免浏览器的行为变的混乱和不可预知
			// 如果参数type是自定义事件,则不会有对应的行内监听和默认行为
			// jQuery.event.customEvent
			if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type]) {
				// No jQuery handlers for this event type, and it can't have inline handlers
				return;
			}

			// Caller can pass in an Event, Object, or just an event type string
			event = typeof event === "object" ?
				// jQuery.Event object
				// 如果已经是一个事件对象了
				event[jQuery.expando] ? event :
				// Object literal
				new jQuery.Event(type, event) :
				// Just the event type (string)
				// 仅仅是事件类型就构造一个新的事件对象
				new jQuery.Event(type);

			// 这里为没有命名空间的事件类型
			event.type = type;
			// 表示正在触发这个事件
			event.isTrigger = true;
			// 是否只触发没有命名空间的监听函数
			event.exclusive = exclusive;
			// 命名空间
			event.namespace = namespaces.join(".");
			// 命名空间正则表达式,用于检测已经绑定事件的命名空间是否与参数event中
			// 的命名空间相匹配
			event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			// type里面是否有":"号
			ontype = type.indexOf(":") < 0 ? "on" + type : "";

			// Handle a global trigger
			// 如果没有传入参数elem,即没有指定DOM元素,则在所有绑定过该类型
			// 事件的元素上手动触发,这个过程称为"全局触发事件"
			if (!elem) {

				// TODO: Stop taunting the data cache; remove global events and always attach to document
				cache = jQuery.cache;
				for (i in cache) {
					if (cache[i].events && cache[i].events[type]) {
						jQuery.event.trigger(event, data, cache[i].handle.elem, true);
					}
				}
				return;
			}

			// Clean up the event in case it is being reused
			event.result = undefined;
			if (!event.target) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data != null ? jQuery.makeArray(data) : [];
			data.unshift(event);

			// Allow special events to draw outside the lines
			special = jQuery.event.special[type] || {};
			if (special.trigger && special.trigger.apply(elem, data) === false) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			eventPath = [
				[elem, special.bindType || type]
			];
			if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

				bubbleType = special.delegateType || type;
				cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
				old = null;
				for (; cur; cur = cur.parentNode) {
					eventPath.push([cur, bubbleType]);
					old = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if (old && old === elem.ownerDocument) {
					eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
				}
			}

			// Fire handlers on the event path
			for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {

				cur = eventPath[i][0];
				event.type = eventPath[i][1];

				handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
				if (handle) {
					handle.apply(cur, data);
				}
				// Note that this is a bare JS function and not a jQuery handler
				handle = ontype && cur[ontype];
				if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) {
					event.preventDefault();
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			// 如果调用trigger的时候传递进来的最后一个参数为false,表示希望触发默认行为
			// 同时如果在上面的模拟过程中没有事件处理函数调用过阻止默认行为函数
			// 
			if (!onlyHandlers && !event.isDefaultPrevented()) {

				// 如果不是a元素的click事件因为该事件的默认行为是页面跳转
				// 且当前处理元素为可存储数据的元素
				if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) &&
					!(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {

					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					// IE<9 dies on focus/blur to hidden element (#1486)
					if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ontype];

						if (old) {
							elem[ontype] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[type]();
						jQuery.event.triggered = undefined;

						if (old) {
							elem[ontype] = old;
						}
					}
				}
			}

			return event.result;
		},

		dispatch: function(event) {

			// Make a writable jQuery.Event from the native event object
			// 这里的window.event主要是为了匹配IE9-的,具体参见JavaScript权威指南
			// 把浏览器的事件修正为jQuery事件类型
			event = jQuery.event.fix(event || window.event);

			var handlers = ((jQuery._data(this, "events") || {})[event.type] || []),
				// 获取转发请求事件个数
				delegateCount = handlers.delegateCount,
				args = [].slice.call(arguments, 0),
				// 判断是否执行完所有的事件
				run_all = !event.exclusive && !event.namespace,
				// 特殊事件类型对应的修正对象
				special = jQuery.event.special[event.type] || {},
				// 待执行队列,格式为
				// [
				// 		elem:冒泡路径上的某个后代元素,matches:该后代元素匹配的代理事件监听对象数组
				// 		elem:冒泡路径上的某个后代元素,matches:该后代元素匹配的代理事件监听对象数组
				// 		....
				// 		elem:代理元素,matches:该元素上绑定的普通事件监听对象
				// ]
				handlerQueue = [],
				i, j, cur, jqcur, ret,
				// 记录摸个后代元素cur与代理监听对象的选择器表达式匹配的结果,其格式为
				// {
				// 		handObj.selector:true
				// 		handObj.selector:false
				// 		...
				// 		handObj.selector:true/false
				// }
				selMatch, matched, matches,
				handleObj, // 监听对象
				sel, // 监听对象选择器
				related;

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[0] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if (special.preDispatch && special.preDispatch.call(this, event) === false) {
				return;
			}

			// 下面的两个if是用来找到所有需要响应的事件监听对象
			// Determine handlers that should run if there are delegated events
			// Avoid non-left-click bubbling in Firefox (#3861)
			if (delegateCount && !(event.button && event.type === "click")) {

				// Pregenerate a single jQuery object for reuse with .is()
				// 
				jqcur = jQuery(this);
				jqcur.context = this.ownerDocument || this;

				for (cur = event.target; cur != this; cur = cur.parentNode || this) {

					// Don't process events on disabled elements (#6911, #8165)
					if (cur.disabled !== true) {
						selMatch = {};
						matches = [];
						jqcur[0] = cur;
						for (i = 0; i < delegateCount; i++) {
							handleObj = handlers[i];
							sel = handleObj.selector;

							if (selMatch[sel] === undefined) {
								selMatch[sel] = (
									handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel)
								);
							}
							if (selMatch[sel]) {
								matches.push(handleObj);
							}
						}
						if (matches.length) {
							handlerQueue.push({
								elem: cur,
								matches: matches
							});
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if (handlers.length > delegateCount) {
				handlerQueue.push({
					elem: this,
					matches: handlers.slice(delegateCount)
				});
			}

			// Run delegates first; they may want to stop propagation beneath us
			// 执行后代元素匹配的代理监听对象数组和代理元素上绑定的普通监听对象数组
			for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
				matched = handlerQueue[i];
				// 这是用来模拟事件冒泡用的
				event.currentTarget = matched.elem;

				for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
					handleObj = matched.matches[j];

					// Triggered event must either 1) be non-exclusive and have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					// 必须满足以下条件之一才会执行
					// 1)变量run_all为true
					// 2)当前事件没有命名空间,且监听对象也没有命名空间
					// 3)当前事件有命名空间,则要求它与事件监听对象的命名空间匹配
					if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

						event.data = handleObj.data;
						event.handleObj = handleObj;

						// 优先调用修正对象的修正方法spcial.handle(),来执行特殊的事件响应行为
						// 其次才会
						ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler)
							.apply(matched.elem, args);
						// 这的args已经在上面指向了jquery的事件对象

						if (ret !== undefined) {
							event.result = ret;
							if (ret === false) {
								// 如果返回false,则调用方法event.preventDefault()阻止默认行为,并调用
								// event.stopPropagation()停止事件传播
								// 在浏览器事件模型中,如果监听函数返回false,只会
								// 阻止默认行为,并不会阻止事件传播
								// 那是否是所谓的默认行为就是区该事件的监听函数一个一个执行下去
								// 所谓的事件传播是否就是指冒泡??
								// 但是如果是这样因为这里面是代理函数执行的
								// 
								event.preventDefault();
								// 这里同时也说明了可以不返回false,但是可以调用
								// event.preventDefault();这样就可以终止当前的默认行为
								// 但是却不会终止冒泡
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if (special.postDispatch) {
				special.postDispatch.call(this, event);
			}

			// 返回最后一个有返回值的事件监听函数的返回值
			return event.result;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
		props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function(event, original) {

				// Add which for key events
				if (event.which == null) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function(event, original) {
				var eventDoc, doc, body,
					button = original.button,
					fromElement = original.fromElement;

				// Calculate pageX/Y if missing and clientX/Y available
				if (event.pageX == null && original.clientX != null) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
				}

				// Add relatedTarget, if necessary
				if (!event.relatedTarget && fromElement) {
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if (!event.which && button !== undefined) {
					event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
				}

				return event;
			}
		},

		// 把原生事件封装成为一个jquery事件对象
		// dispatch()会调用
		fix: function(event) {
			if (event[jQuery.expando]) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop,
				originalEvent = event,
				fixHook = jQuery.event.fixHooks[event.type] || {},
				copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

			event = jQuery.Event(originalEvent);

			for (i = copy.length; i;) {
				prop = copy[--i];
				event[prop] = originalEvent[prop];
			}

			// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
			if (!event.target) {
				event.target = originalEvent.srcElement || document;
			}

			// Target should not be a text node (#504, Safari)
			// 如果是文本节点则把target修正为其父节点
			// 这里原生事件的target属性就是该对象,即使是文本对象,这里又是基于什么样的考虑才需要
			// 进行这样的修正
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode;
			}

			// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
			// 指示meta间是否已经被按下,如果没有metakey则用ctrlkey代替
			if (event.metaKey === undefined) {
				event.metaKey = event.ctrlKey;
			}

			// 修正键盘事件或鼠标事件专属属性
			return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
		},
		/**
		// 事件修正对象集,用于修正事件的绑定,代理,触发和移除行为
		// 该对象集中存放了事件类型和修正对象的映射,修正对象可能含有的属性和
		// 修正方法如下:
		// noBubble:指示当前事件类型不支持或不允许冒泡
		// bindType:指示绑定普通事件时使用的事件类型
		// delegateType:指示绑定代理事件时使用的事件类型
		// setup(data,namespace,eventHandle):用于执行特殊的主监听函数绑定行为或者
		// 									执行必需的初始化操作,在第一次绑定当前类型的
		// 									事件时被调用.如果该方法返回false,则继续调用
		// 									原生方法addEventlistener()或attachEvent
		// 									绑定主监听函数
		// 	teardown(namspace)用于执行特殊的监听函数移除行为,在当前类型的事件全部移除后被
		// 						调用.如果该方法返回false,则继续调用原生方法removeEventListener
		// 						或detachEvent移除主监听函数
		// 	handle:用于执行特殊的事件响应行为,在每次触发当前类型的事件时被调用.
		// 	add:用于执行特殊的事件绑定行为,在绑定但钱类型的事件前被调用,调用该方法后,
		// 		会继续执行正常的事件绑定流程
		// 	remove:用于执行特殊的事件移除行为,在移除当前类型的事件后调用
		// 	trigger(data):用于执行特殊的事件响应行为,在触发当前类型的事件时被调用
		// 	_default(data):用于执行特殊的默认行为,在触发默认行为是被调用.如果该
		// 					方法返回false,则触发浏览器的默认行为.关键字指向document
		// 
		**/
		special: {
			ready: {
				// Make sure the ready event is setup
				setup: jQuery.bindReady
			},

			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},

			focus: {
				delegateType: "focusin"
			},
			blur: {
				delegateType: "focusout"
			},

			beforeunload: {
				setup: function(data, namespaces, eventHandle) {
					// We only want to do this special case on windows
					if (jQuery.isWindow(this)) {
						this.onbeforeunload = eventHandle;
					}
				},

				teardown: function(namespaces, eventHandle) {
					if (this.onbeforeunload === eventHandle) {
						this.onbeforeunload = null;
					}
				}
			}
		},

		simulate: function(type, elem, event, bubble) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = jQuery.extend(
				new jQuery.Event(),
				event, {
					type: type,
					isSimulated: true,
					originalEvent: {}
				}
			);
			if (bubble) {
				jQuery.event.trigger(e, null, elem);
			} else {
				jQuery.event.dispatch.call(elem, e);
			}
			if (e.isDefaultPrevented()) {
				event.preventDefault();
			}
		}
	};

	// Some plugins are using, but it's undocumented/deprecated and will be removed.
	// The 1.7 special event interface should provide all the hooks needed now.
	jQuery.event.handle = jQuery.event.dispatch;

	jQuery.removeEvent = document.removeEventListener ?
		function(elem, type, handle) {
			if (elem.removeEventListener) {
				elem.removeEventListener(type, handle, false);
			}
		} :
		function(elem, type, handle) {
			if (elem.detachEvent) {
				elem.detachEvent("on" + type, handle);
			}
		};

	jQuery.Event = function(src, props) {
		// Allow instantiation without the 'new' keyword
		// 这里的允许初始化一个jquery对象而使用new关键字是怎样实现的,为什么如果使用n
		// 这里的this就指向一个instanceof 
		if (!(this instanceof jQuery.Event)) {
			return new jQuery.Event(src, props);
		}

		// Event object
		if (src && src.type) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			// 这里是修正事件方法isDefaultPrevented
			// 所谓的修正就是,1:有原型
			// 				  2:对原型不满意,所以要改正其值
			this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
				src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

			// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if (props) {
			jQuery.extend(this, props);
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[jQuery.expando] = true;
	};

	function returnFalse() {
		return false;
	}

	function returnTrue() {
		return true;
	}

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		preventDefault: function() {
			this.isDefaultPrevented = returnTrue;

			var e = this.originalEvent;
			if (!e) {
				return;
			}

			// if preventDefault exists run it on the original event
			if (e.preventDefault) {
				e.preventDefault();

				// otherwise set the returnValue property of the original event to false (IE)
			} else {
				e.returnValue = false;
			}
		},
		stopPropagation: function() {
			this.isPropagationStopped = returnTrue;

			var e = this.originalEvent;
			if (!e) {
				return;
			}
			// if stopPropagation exists run it on the original event
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			// otherwise set the cancelBubble property of the original event to true (IE)
			e.cancelBubble = true;
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		},
		// 原生方法的默认值
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// 修正mouseenter和mouseout事件
	// 但是mouseover和mouseover事件呢??
	jQuery.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function(orig, fix) {
		jQuery.event.special[orig] = {
			delegateType: fix,
			bindType: fix,

			handle: function(event) {
				var target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj,
					selector = handleObj.selector,
					ret;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				// 当鼠标指针从父元素进入子元素时事件的触发顺序和处理过程如下
				// 1)首先,浏览器在父元素上触发mouseout事件,此时变量target是父元素,
				// 	  变量related是子元素,方法jquery.contains(target,related)返回true
				// 	  这个事件被忽略
				// 2)然后,浏览器在子元素上触发mouseover事件,此时变量target是子元素,变量related
				//   是父元素,contains返回false,执行监听函数
				// 3)最后,子元素的mouseover事件冒泡到父元素,触发父元素的mouseover事件
				// 	 此时变量target是父元素,related也是父元素,表达式related!==target返回
				// 	 false,这个事件被忽略.
				// 
				// 当鼠标指针从父元素进入子元素时,将会过滤父元素上触发的mouseout事件
				// 和从子元素冒泡到父元素的mouseover事件,只处理在子元素上触发的mouseover
				// 事件
				// 
				// 当鼠标指针从父元素进入子元素时,事件的触发顺序和处理过程如下
				// 1)首先,浏览器在子元素上触发mouseout事件,此时变量target是子元素,变量
				// 	  related是父元素,方法contains返回false,执行监听函数
				// 2)然后,子元素的mouseout事件向上冒泡到父元素,触发父元素的mouseout事件
				//   此时变量target是父元素,变量related也是父元素,表达式related!==tatget返回
				//   false,这个事件被忽略掉.
				// 3)浏览器在父元素上触发mouseover事件,此时变量target是父元素,变量related
				//   是子元素,方法contains返回true,这个事件被忽略掉
				// 
				// 因此,当鼠标指针从子元素进入父元素是,将会过滤从子元素冒泡到父元素
				// 上触发的mouseover事件,只处理在子元素上触发的mouseout事件
				// 
				// 但是为什么只有子元素会进行触发而已,这样是否是设计不合理,同时
				// 为什么冒泡到父元素的时候,为什么target和related都是父元素
				// 难道这些在过程中不应该是要保持不变的么??这样是不是浏览器
				// 设计的一些问题,等到具体应用的时候再来回答这个问题...待定
				if (!related || (related !== target && !jQuery.contains(target, related))) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply(this, arguments);
					event.type = fix;
				}
				return ret;
			}
		};
	});

	// IE submit delegation
	// submit为false时表示submit事件不会冒泡
	if (!jQuery.support.submitBubbles) {

		jQuery.event.special.submit = {
			setup: function() {
				// Only need this for delegated form submit events
				if (jQuery.nodeName(this, "form")) {
					// 如果当前元素为form元素,则返回false,执行普通的事件绑定
					// 流程.因为在这种情况下不需要模拟冒泡过程,当前元素上绑定的
					// submit事件会被直接触发
					return false;
				}

				// Lazy-add a submit handler when a descendant form may potentially be submitted
				jQuery.event.add(this, "click._submit keypress._submit", function(e) {
					// Node name check avoids a VML-related crash in IE (#9807)
					var elem = e.target,
						form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
					// 如果触发事件的是某个表单中的input或button元素,并且没有
					// 在该表单上绑定过"submit._submit"事件,则为该表单绑定一次
					// 绑定该事件有什么用??
					if (form && !form._submit_attached) {
						jQuery.event.add(form, "submit._submit", function(event) {
							event._submit_bubble = true;
						});
						form._submit_attached = true;
					}
				});
				// return undefined since we don't need an event listener
			},

			postDispatch: function(event) {
				// If form was submitted by the user, bubble the event up the tree
				if (event._submit_bubble) {
					delete event._submit_bubble;
					if (this.parentNode && !event.isTrigger) {
						jQuery.event.simulate("submit", this.parentNode, event, true);
					}
				}
			},

			teardown: function() {
				// Only need this for delegated form submit events
				if (jQuery.nodeName(this, "form")) {
					return false;
				}

				// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
				jQuery.event.remove(this, "._submit");
			}
		};
	}

	// IE change delegation and checkbox/radio fix
	if (!jQuery.support.changeBubbles) {

		jQuery.event.special.change = {

			setup: function() {

				if (rformElems.test(this.nodeName)) {
					// IE doesn't fire change on a check/radio until blur; trigger it on click
					// after a propertychange. Eat the blur-change in special.change.handle.
					// This still fires onchange a second time for check/radio after blur.
					if (this.type === "checkbox" || this.type === "radio") {
						jQuery.event.add(this, "propertychange._change", function(event) {
							if (event.originalEvent.propertyName === "checked") {
								this._just_changed = true;
							}
						});
						jQuery.event.add(this, "click._change", function(event) {
							if (this._just_changed && !event.isTrigger) {
								this._just_changed = false;
								jQuery.event.simulate("change", this, event, true);
							}
						});
					}
					return false;
				}
				// Delegated event; lazy-add a change handler on descendant inputs
				jQuery.event.add(this, "beforeactivate._change", function(e) {
					var elem = e.target;

					if (rformElems.test(elem.nodeName) && !elem._change_attached) {
						jQuery.event.add(elem, "change._change", function(event) {
							if (this.parentNode && !event.isSimulated && !event.isTrigger) {
								jQuery.event.simulate("change", this.parentNode, event, true);
							}
						});
						elem._change_attached = true;
					}
				});
			},

			handle: function(event) {
				var elem = event.target;

				// Swallow native change events from checkbox/radio, we already triggered them above
				if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
					return event.handleObj.handler.apply(this, arguments);
				}
			},

			teardown: function() {
				jQuery.event.remove(this, "._change");

				return rformElems.test(this.nodeName);
			}
		};
	}

	// Create "bubbling" focus and blur events
	if (!jQuery.support.focusinBubbles) {
		jQuery.each({
			focus: "focusin",
			blur: "focusout"
		}, function(orig, fix) {

			// Attach a single capturing handler while someone wants focusin/focusout
			var attaches = 0,
				handler = function(event) {
					jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
				};

			jQuery.event.special[fix] = {
				setup: function() {
					if (attaches++ === 0) {
						document.addEventListener(orig, handler, true);
					}
				},
				teardown: function() {
					if (--attaches === 0) {
						document.removeEventListener(orig, handler, true);
					}
				}
			};
		});
	}

	// 事件系统暴露的方法
	jQuery.fn.extend({

		// 主要是对参数进行修正然后调用jQuery.even.add();
		on: function(types, selector, data, fn, /*INTERNAL*/ one) {
			var origFn, type;

			// Types can be a map of types/handlers
			if (typeof types === "object") {
				// ( types-Object, selector, data )
				if (typeof selector !== "string") { // && selector != null
					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for (type in types) {
					this.on(type, selector, data, types[type], one);
				}
				return this;
			}

			if (data == null && fn == null) {
				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if (fn == null) {
				if (typeof selector === "string") {
					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {
					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if (fn === false) {
				fn = returnFalse;
			} else if (!fn) {
				return this;
			}

			if (one === 1) {
				origFn = fn;
				fn = function(event) {
					// Can use an empty set, since event contains the info
					jQuery().off(event);
					return origFn.apply(this, arguments);
				};
				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
			}
			return this.each(function() {
				jQuery.event.add(this, types, fn, data, selector);
			});
		},
		one: function(types, selector, data, fn) {
			return this.on(types, selector, data, fn, 1);
		},
		off: function(types, selector, fn) {
			// 这里说明该参数是一个
			if (types && types.preventDefault && types.handleObj) {
				// ( event )  dispatched jQuery.Event
				var handleObj = types.handleObj;
				jQuery(types.delegateTarget).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if (typeof types === "object") {
				// ( types-object [, selector] )
				for (var type in types) {
					this.off(type, selector, types[type]);
				}
				return this;
			}

			// 也就是说上面都是过滤主要的处理过程都是这个,上面过滤掉了
			// 多个事件的解除
			if (selector === false || typeof selector === "function") {
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if (fn === false) {
				fn = returnFalse;
			}
			return this.each(function() {
				jQuery.event.remove(this, types, fn, selector);
			});
		},

		bind: function(types, data, fn) {
			return this.on(types, null, data, fn);
		},
		unbind: function(types, fn) {
			return this.off(types, null, fn);
		},

		live: function(types, data, fn) {
			jQuery(this.context).on(types, this.selector, data, fn);
			return this;
		},
		die: function(types, fn) {
			jQuery(this.context).off(types, this.selector || "**", fn);
			return this;
		},

		delegate: function(selector, types, data, fn) {
			return this.on(types, selector, data, fn);
		},
		undelegate: function(selector, types, fn) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn);
		},

		trigger: function(type, data) {
			return this.each(function() {
				jQuery.event.trigger(type, data, this);
			});
		},
		triggerHandler: function(type, data) {
			if (this[0]) {
				return jQuery.event.trigger(type, data, this[0], true);
			}
		},

		toggle: function(fn) {
			// Save reference to arguments for access in closure
			var args = arguments,
				guid = fn.guid || jQuery.guid++,
				i = 0,
				toggler = function(event) {
					// Figure out which function to execute
					var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
					jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

					// Make sure that clicks stop
					event.preventDefault();

					// and execute the function
					return args[lastToggle].apply(this, arguments) || false;
				};

			// link all the functions, so any of them can unbind this click handler
			toggler.guid = guid;
			while (i < args.length) {
				args[i++].guid = guid;
			}

			return this.click(toggler);
		},

		hover: function(fnOver, fnOut) {
			return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
		}
	});

	// 事件便捷方法
	jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {

		// Handle event binding
		jQuery.fn[name] = function(data, fn) {
			if (fn == null) {
				fn = data;
				data = null;
			}

			return arguments.length > 0 ?
				this.on(name, null, data, fn) :
				this.trigger(name);
		};

		if (jQuery.attrFn) {
			jQuery.attrFn[name] = true;
		}

		if (rkeyEvent.test(name)) {
			jQuery.event.fixHooks[name] = jQuery.event.keyHooks;
		}

		if (rmouseEvent.test(name)) {
			jQuery.event.fixHooks[name] = jQuery.event.mouseHooks;
		}
	});



	/*!
	 * Sizzle CSS Selector Engine
	 *  Copyright 2011, The Dojo Foundation
	 *  Released under the MIT, BSD, and GPL Licenses.
	 *  More information: http://sizzlejs.com/
	 *
	 * css选择器引擎
	 */
	(function() {

		var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
			expando = "sizcache" + (Math.random() + '').replace('.', ''),
			done = 0,
			toString = Object.prototype.toString,
			hasDuplicate = false,
			baseHasDuplicate = true,
			rBackslash = /\\/g,
			rReturn = /\r\n/g,
			rNonWord = /\W/;

		// Here we check if the JavaScript engine is using some sort of
		// optimization where it does not always call our comparision
		// function. If that is the case, discard the hasDuplicate value.
		//   Thus far that includes Google Chrome.
		// 在这里检查JavaScript解释权是否会调用自定义的比较函数进行排序
		// 如果
		[0, 0].sort(function() {
			baseHasDuplicate = false;
			return 0;
		});

		// 选择器引擎入口,查找与选择器表达式selector匹配的元素
		// 元素查找
		// 在context上面查找符合selector的元素并把结果匹配结果
		// 放置在results里面
		var Sizzle = function(selector, context, results, seed) {
			results = results || [];
			context = context || document;

			var origContext = context;

			// 如果context不是DOM元素或者document元素
			// 则直接返回一个空数组
			if (context.nodeType !== 1 && context.nodeType !== 9) {
				return [];
			}

			// 选择器为空或者不是字符串直接返回results
			if (!selector || typeof selector !== "string") {
				return results;
			}

			var m, set, checkSet, extra, ret, cur, pop, i,
				prune = true,
				contextXML = Sizzle.isXML(context),
				parts = [],
				soFar = selector;

			// Reset the position of the chunker regexp (start from head)
			// chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
			// str="div div" chunker.exec(str) ==> "div" null " div"
			// chunker.exec(" div") ===>"" null "div"
			// str="div,a" chunker.exec(str) ==> "div" "," "a"
			// 块间选择器分割器
			do {
				chunker.exec("");
				m = chunker.exec(soFar);

				if (m) {
					soFar = m[3];

					parts.push(m[1]);

					// 如果存在并列表达式分隔符
					if (m[2]) {
						// 如果有并列符即","号,那么一部分一部分的进行
						// 检测,联系后面的知道当extra还有
						// 的时候会进行递归调用,然后才对合并后的
						// 集合进行去重操作才返回
						// 这里m分组3就是分隔符后面的表达式
						extra = m[3];
						break;
					}
				}
			} while (m);

			//这里parts.length > 1表明有块间关系符
			//后一个判断表示选择表达式里面有位置伪类
			//origPOS = Expr.match.POS
			//POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
			//但是如果是div div,a:eq(0)这样呢?
			//这时候难道不应该在上面先把selector的值先复制给div
			//反过来就可以说就像上面的列子那样后面的位置伪类会作用于前面的
			//块选择符
			if (parts.length > 1 && origPOS.exec(selector)) {

				if (parts.length === 2 && Expr.relative[parts[0]]) {
					// 删除选择器表达式中的所有伪类
					// 调用Sizzle()查找删除伪类后的选择器表达式
					set = posProcess(parts[0] + parts[1], context, seed);

				} else {
					set = Expr.relative[parts[0]] ?
						[context] :
						Sizzle(parts.shift(), context);

					while (parts.length) {
						selector = parts.shift();

						if (Expr.relative[selector]) {
							selector += parts.shift();
						}

						set = posProcess(selector, set, seed);
					}
				}

			} else {
				// Take a shortcut and set the context if the root selector is an ID
				// (but not if it'll be faster if the inner selector is an ID)
				// 1:或者没有块关系符
				// 2:或者没有位置伪类符
				// 3:上下文为document对象且且不是xml文档对象
				// 
				// 且添加下面条件
				// 1:第一个块选择器是id选择器
				// 2:最后一个块选择器不是块选择器
				// Q:为什么要规定最后一块不是快选择器
				// 
				// 3:contextXML 上下文不是xml文档
				// Q:下面做的这些有什么特别的含义?
				// 4:?
				// 现在的浏览器基本上都支持querySelectorAll
				// 所以到达这里的如果seed为null则说明是上面的
				// 原生方法调用执行之后会抛出异常
				if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {

					// 这里为什么需要限制最后一个选择块不是id选择符???
					// #input.claa[input=3]+.class
					// parts[0] = #input.claa[input=3]
					// parts[1] = +
					// parts[2] = .class
					// 这里的含义是取第一个匹配id的元素作为下面进行查找的查找上下文
					// 我们假设这里是#input.claa[input=3]+#class
					// 这一步进行跳过,下面就会先从#class查找,没有必要多此一举
					// 这是现在能想到的答案之一
					ret = Sizzle.find(parts.shift(), context, contextXML);
					// 因为上面递交给.find查找的是一个匹配ID的选择符
					// 所以上面返回的结果指可能是[]或则一个[iddom]元素
					// 而不管哪种结果再经过下面的过滤只肯有两种结果
					// 一个是里面没有元素,一个是只有一个元素
					// 除此之外就没有了.而如果没有元素那么ret.[0]为undefined
					// 即下面的操作就无需进行了.
					// 如果运用id选择器查找的时候只可能返回一个elem
					// 那么这里再运用.filter进行过滤
					// 过滤的结果是保存在ret.set中
					// 所谓的过滤的意思就是并不会增删改查set里面的元素
					// 但是还是需要进行深入的了解.filter函数
					context = ret.expr ?
						Sizzle.filter(ret.expr, ret.set)[0] :
						ret.set[0];
				}

				// 注意:这里如果上面的第一个是id选择器但是
				// 却没有获得想要的结果那么这里的结果可能为空就没有进行
				// 下面的查找和过滤的必要了.
				if (context) {
					ret = seed ? {
							expr: parts.pop(),
							set: makeArray(seed)
						} :
						Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
					// 上面那是怎么一回事??
					// 从这里是否就可以推断出Sizzle.find返回的值
					// 的形式是{set:set,expr:expr}
					// 这里的如果expr还存在说明是经过上面的.Sizzle.find方法之后
					// 还有expr保留下来,所以接下来需要对上面的ret.set集合根据保留
					// 下来的expr进行进一步的过滤.比如.claa1.class2
					// 在上面解析完.class2并把其保存在set.set中并没有再进行解析.class1
					// 所以这里需要运用剩余的.class1选择器对set.set里面的集合进行过滤
					set = ret.expr ?
						Sizzle.filter(ret.expr, ret.set) :
						ret.set;

					if (parts.length > 0) {
						// 还有其他元素那么就表明
						checkSet = makeArray(set);

					} else {
						// 表明不需要对候选集进行刷选
						prune = false;
					}

					// 根据块间关系和pop块表达式不断更新映射集checkSet里面的元素
					// 
					while (parts.length) {
						// cur块间关系符
						cur = parts.pop();
						// 块间关系左侧的块表达式
						// 
						pop = cur;

						if (!Expr.relative[cur]) {
							// 如果不是块间关系符,那么默认为后代关系符
							cur = "";
						} else {
							// 如果有块间关系符,再弹出一个作为块表达式
							// 
							pop = parts.pop();
						}

						if (pop == null) {
							// 如果仍然未找到前一个快表达式pop,则表示
							// 已经达到数组头部,直接将上下文context作为映射集
							// checkSet的上下文
							pop = context;
						}

						Expr.relative[cur](checkSet, pop, contextXML);
					}

				} else {
					checkSet = parts = [];
				}
			}

			if (!checkSet) {
				checkSet = set;
			}

			if (!checkSet) {
				Sizzle.error(cur || selector);
			}

			if (toString.call(checkSet) === "[object Array]") {
				if (!prune) {
					results.push.apply(results, checkSet);

				} else if (context && context.nodeType === 1) {
					// 如果上下文是元素而不是文档对象
					for (i = 0; checkSet[i] != null; i++) {
						// Q:这里的true在哪里进行设置??
						// A:在块间关系处理函数Expr.relative[cur]里面进行替换
						if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
							// 映射元素为true
							// 映射元素是DOM元素,且包含在上下文context中
							// 但是这里为什么push的是set[i]??
							results.push(set[i]);
						}
					}

				} else {
					// 如果上下文是文档对象
					for (i = 0; checkSet[i] != null; i++) {
						// 不是null且是DOM元素
						if (checkSet[i] && checkSet[i].nodeType === 1) {
							results.push(set[i]);
						}
					}
				}

			} else {
				// 如果映射集不是数组的情况,那么为什么,又是在哪里会出现映射集
				// 不是数组的情况
				makeArray(checkSet, results);
			}
			//如果存在并列选择器
			if (extra) {
				//递归调用
				Sizzle(extra, origContext, results, seed);
				//去重
				Sizzle.uniqueSort(results);
			}

			return results;
		};

		// 工具方法,排序,去重
		Sizzle.uniqueSort = function(results) {
			if (sortOrder) {
				hasDuplicate = baseHasDuplicate;
				results.sort(sortOrder);

				if (hasDuplicate) {
					for (var i = 1; i < results.length; i++) {
						if (results[i] === results[i - 1]) {
							results.splice(i--, 1);
						}
					}
				}
			}

			return results;
		};

		// 便捷方法,使用指定的选择器表达式erpr对元素集合set进行过滤
		Sizzle.matches = function(expr, set) {
			// 集合过滤
			return Sizzle(expr, null, null, set);
		};

		// 便捷方法,检查某个元素node是否匹配选择器表达式
		Sizzle.matchesSelector = function(node, expr) {
			return Sizzle(expr, null, null, [node]).length > 0;
		};

		// 内部方法,对块表达式进行查找
		Sizzle.find = function(expr, context, isXML) {
			var set, i, len, match, type, left;

			if (!expr) {
				return [];
			}

			// 这里为什么只是检查一遍,比如#id1#id2
			// 如果这里面的id1找不到,按照这里的原则不就是
			// 不进行查找#id2了?因为
			for (i = 0, len = Expr.order.length; i < len; i++) {
				type = Expr.order[i];

				if ((match = Expr.leftMatch[type].exec(expr))) {
					left = match[1];
					// 注意这里是取出的是前缀表达式
					// 即剩余的match前缀已经没有了
					match.splice(1, 1);

					if (left.substr(left.length - 1) !== "\\") {
						// rBackslash=/\\/g
						// exec("#a\\.b") ==> match[1] ==> "\\"
						// .replace() ==> a.b
						match[1] = (match[1] || "").replace(rBackslash, "");

						set = Expr.find[type](match, context, isXML);

						// 如果结果不是null或undefined
						if (set != null) {
							// 删除表达式中已经查找的部分
							expr = expr.replace(Expr.match[type], "");
							// Q:这里的break是break哪里的?
							// A:上面的for,从这里就可以看出这里只要找到一个
							// 就直接返回了,剩下的事情就交由filter来做
							break;
						}
					}
				}
			}

			// 如果上面的查找没有结果
			if (!set) {
				set = typeof context.getElementsByTagName !== "undefined" ?
					context.getElementsByTagName("*") :
					[];
			}

			return {
				set: set,
				// 剩余的表达式
				expr: expr
			};
		};

		// 内部方法,用块表达式过滤元素集合
		/**
		 * 用表达式过滤元素集合
		 * @param  {[type]} expr    [块表达式]
		 * @param  {[type]} set     [需要过滤的元素集合]
		 * @param  {[type]} inplace [是否替换set里面的元素,如果为true,则把其中不匹配的元素设置为false,如果为false则重新构造一个元素数组并返回]
		 * @param  {[type]} not     [是否取反,即如果为true去除匹配元素,保留不匹配元素如果为false则保留匹配元素,去除不匹配元素,这里还要结合inplace参数]
		 * @return {[type]}         [description]
		 */
		Sizzle.filter = function(expr, set, inplace, not) {
			var match, anyFound,
				type, found, item, filter, left,
				i, pass,
				old = expr,
				result = [],
				curLoop = set,
				isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

			while (expr && set.length) {
				for (type in Expr.filter) {
					if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
						// 	Q:这里的match[2]指的是什么?
						// 	A:具体参看下面的选择器分析
						filter = Expr.filter[type];
						left = match[1];

						anyFound = false;

						match.splice(1, 1);

						if (left.substr(left.length - 1) === "\\") {
							// 如果是"\\"开头说明是转意符如"\\#id"那么就可以跳过本次过滤了
							continue;
						}

						if (curLoop === result) {
							result = [];
						}

						if (Expr.preFilter[type]) {
							// 这里的preFilter会返回不同的match
							// class的前置处理处会把curLoop进行过滤,并返回false
							// id会把第一个分组中的反斜杠进行转意并返回match如"\\."==>"."
							// tag进行转义并把tag变为小写"T\\.AG" ==> "t.ag"并返回原match
							// child返回修改过后的match
							// attr返回修改过后的match
							// pseudo
							// 	1:如果为:not(selctor)则已经经过过滤返回false
							// 	2:如果是位置伪类或子元素伪类child则返回true表示仍需要继续执行各自的过滤函数
							// pos返回修正之后的match
							// 
							match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

							if (!match) {
								// 返回false的前置过滤器有
								// 表示已经执行了过滤
								// CLASS,pseudo的not()
								anyFound = found = true;
							} else if (match === true) {
								// 返回true前置过滤器有
								// 表示还没有执行过滤如:nth-child(odd)
								// 因为这里先会调用pseudo然后---调用child
								// PSEUDO
								continue;
							}
						}

						// 1:如果是class和:not()则不会走这里
						// 2
						if (match) {
							// 这里是除去class和:not(selector)的情况
							for (i = 0;
								(item = curLoop[i]) != null; i++) {
								if (item) {
									// 调用各自的过滤函数
									// 这里的i是在元素集合的下标
									// 如果元素符合match的要求
									// 则返回true否则返回false
									found = filter(item, match, i, curLoop);
									pass = not ^ found;

									if (inplace && found != null) {
										if (pass) {
											anyFound = true;
										} else {
											curLoop[i] = false;
										}

									} else if (pass) {
										// 这里表明的是查找到符合需要查找要求的元素
										// 到这里说明inplace为false
										// 因为found不可能等于null
										result.push(item);
										anyFound = true;
									}
								}
							}
						}

						// 1:如果是class和:not会走这里
						// 2:
						// 这里的found只有一种情况为undefined
						// 那就位置伪类的时候即没有相应的伪类处理函数
						if (found !== undefined) {
							if (!inplace) {
								curLoop = result;
							}
							// 删除已经过滤掉的条件
							expr = expr.replace(Expr.match[type], "");

							// 1:如果是class和:not()这里不可能
							if (!anyFound) {
								// found表示元素是否符合
								return [];
							}

							break;
						}
					}
				}

				// Improper expression
				// 也就是说经过上面那一轮到这里如果没有动
				// 表达式分毫,那么没有动分毫有哪几种情况
				// 像下面的判断应该有两种
				// 1:一种是给出的表达式Sizzle不支持,这时候直接抛出异常
				// 2:第二种情况又是什么?什么情况下是不动分毫却不抛出异常的
				if (expr === old) {
					if (anyFound == null) {
						// 这里只有上面的for循环都没有通过才会出现
						Sizzle.error(expr);
					} else {
						// 但是这又什么情况??
						break;
					}
				}
				old = expr;
			}

			return curLoop;
		};

		// 工具方法,获取DOM元素集合的文本内容
		Sizzle.error = function(msg) {
			throw new Error("Syntax error, unrecognized expression: " + msg);
		};

		/**
		 * Utility function for retreiving the text value of an array of DOM nodes
		 * @param {Array|Element} elem
		 */
		// 工具方法,获取DOM元素集合的文本内容
		var getText = Sizzle.getText = function(elem) {
			var i, node,
				nodeType = elem.nodeType,
				ret = "";

			if (nodeType) {
				if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
					// Use textContent || innerText for elements
					if (typeof elem.textContent === 'string') {
						return elem.textContent;
					} else if (typeof elem.innerText === 'string') {
						// Replace IE's carriage returns
						return elem.innerText.replace(rReturn, '');
					} else {
						// Traverse it's children
						for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
							ret += getText(elem);
						}
					}
				} else if (nodeType === 3 || nodeType === 4) {
					return elem.nodeValue;
				}
			} else {

				// If no nodeType, this is expected to be an array
				for (i = 0;
					(node = elem[i]); i++) {
					// Do not traverse comment nodes
					if (node.nodeType !== 8) {
						ret += getText(node);
					}
				}
			}
			return ret;
		};

		// 扩展方法和属性
		var Expr = Sizzle.selectors = {
			// 块表达式查找顺序
			order: ["ID", "NAME", "TAG"],
			// 正则表达式集,用于匹配和解析块表达式
			match: {
				// id选择器
				ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				// 类名选择器
				CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				// 名字选择器
				NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
				// 属性选择器
				ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
				// 标签选择器
				TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
				// 子类伪类
				CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
				//位置伪类
				//'\d'===>[0-9]
				POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
				//伪类选择器
				//1:以':'开头
				//\w===>[a-zA-Z0-9]
				PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			},

			leftMatch: {},
			// 属性名修正函数集
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			// 属性值读取函数集
			attrHandle: {
				href: function(elem) {
					return elem.getAttribute("href");
				},
				type: function(elem) {
					return elem.getAttribute("type");
				}
			},
			// 块间关系过滤集
			relative: {
				"+": function(checkSet, part) {
					var isPartStr = typeof part === "string",
						isTag = isPartStr && !rNonWord.test(part),
						isPartStrNotTag = isPartStr && !isTag;

					if (isTag) {
						part = part.toLowerCase();
					}

					for (var i = 0, l = checkSet.length, elem; i < l; i++) {
						if ((elem = checkSet[i])) {
							while ((elem = elem.previousSibling) && elem.nodeType !== 1) {}
							/**
							// 到这里其兄弟元素可能为undefined或者DOM元素
							// 1:如果是非标签字符串,这里的chekset[i] = 其兄弟元素(如果其兄弟为undefined则设置为false)
							// 2:如果是不是非标签字符串
							// 	2.1:如果是part是标签且节点名和元素的标签名相同则替换为elem即替换为
							// 		其兄弟元素不相等则替换为false
							// 	2.2:如果part是DOM则判断其兄弟元素elem是否与part相等,如果相等则设置
							// 	为true,如果不相等则设置为false
							**/
							checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
								elem || false :
								elem === part;
						}
					}

					// 如果是非标签字符串,则调用方法过虑Sizzle.filter映射集
					if (isPartStrNotTag) {
						Sizzle.filter(part, checkSet, true);
					}
				},

				">": function(checkSet, part) {
					var elem,
						isPartStr = typeof part === "string",
						i = 0,
						l = checkSet.length;

					if (isPartStr && !rNonWord.test(part)) {
						part = part.toLowerCase();

						for (; i < l; i++) {
							elem = checkSet[i];

							if (elem) {
								var parent = elem.parentNode;
								checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
							}
						}

					} else {
						for (; i < l; i++) {
							elem = checkSet[i];

							if (elem) {
								checkSet[i] = isPartStr ?
									elem.parentNode :
									elem.parentNode === part;
							}
						}

						if (isPartStr) {
							Sizzle.filter(part, checkSet, true);
						}
					}
				},

				"": function(checkSet, part, isXML) {
					var nodeCheck,
						doneName = done++,
						checkFn = dirCheck;

					if (typeof part === "string" && !rNonWord.test(part)) {
						part = part.toLowerCase();
						nodeCheck = part;
						checkFn = dirNodeCheck;
					}

					checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
				},

				"~": function(checkSet, part, isXML) {
					var nodeCheck,
						doneName = done++,
						checkFn = dirCheck;

					if (typeof part === "string" && !rNonWord.test(part)) {
						part = part.toLowerCase();
						nodeCheck = part;
						checkFn = dirNodeCheck;
					}

					checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
				}
			},

			//块表达式查找函数集
			//这是封装浏览器原生方法的地方getElementById,getElementsByName,getElementsByTagName
			find: {
				// 下面这些match的格式,分组情况参见Sizzle.selectors.match
				ID: function(match, context, isXML) {
					if (typeof context.getElementById !== "undefined" && !isXML) {
						var m = context.getElementById(match[1]);
						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						// 检查查询到的元素是否还有parentNode属性
						// 因为在Blackberry 4.6不在document上面的元素采用getElementById也能查询到
						return m && m.parentNode ? [m] : [];
					}
				},

				// 
				NAME: function(match, context) {
					if (typeof context.getElementsByName !== "undefined") {
						var ret = [],
							results = context.getElementsByName(match[1]);

						for (var i = 0, l = results.length; i < l; i++) {
							// 这里应该是做浏览器兼容问题,因为某些浏览器
							// 调用getElementsByName的时候返回的并不一定
							// 是指定name的元素,但是具体是哪些浏览器呢??
							// 待定...
							if (results[i].getAttribute("name") === match[1]) {
								ret.push(results[i]);
							}
						}

						return ret.length === 0 ? null : ret;
					}
				},

				TAG: function(match, context) {
					if (typeof context.getElementsByTagName !== "undefined") {
						return context.getElementsByTagName(match[1]);
					}
				}
			},
			// 块表达式预过滤函数集
			preFilter: {
				// 检查元素集合中的每个元素是否还有指定的类样式
				// 如果参数inplace为则将不匹配的元素替换为false
				// 如果为false则将匹配的元素放入元素集合result中
				CLASS: function(match, curLoop, inplace, result, not, isXML) {
					match = " " + match[1].replace(rBackslash, "") + " ";

					if (isXML) {
						return match;
					}

					for (var i = 0, elem;
						(elem = curLoop[i]) != null; i++) {
						if (elem) {
							// classname  "aaa bbb" ===> " aaa bbb "
							// match===>" match "
							// "^"亦或操作符
							// not是否取反
							if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
								// 到这里需要
								// 1:not为true且元素类名不匹配
								// 2:not为false且类名匹配
								// 同时需要注意的是这里即使上面的两种情况都通过匹配之后
								// 并不一定把不匹配的赋值为false而是通过下面判断才进行存入
								// 也就是说这里是需要考虑取反的情况
								// 而考虑取反的情况需要判断取反的元素是否需要放入到新集合中
								// 但是哪类需要进行采取取反的情况?哪里又需要进行
								if (!inplace) {
									result.push(elem);
								}
							} else if (inplace) {
								// 总的来说这里表示没有通过过滤且需要进行把没有通过
								// 过滤的元素置换为false的情况
								// 只有在上面没通过过滤的情况(和上面通过过滤的考虑相反)
								curLoop[i] = false;
							}
						}
					}

					return false;
				},

				ID: function(match) {
					return match[1].replace(rBackslash, "");
				},

				TAG: function(match, curLoop) {
					return match[1].replace(rBackslash, "").toLowerCase();
				},

				CHILD: function(match) {
					if (match[1] === "nth") {
						if (!match[2]) {
							Sizzle.error(match[0]);
						}

						match[2] = match[2].replace(/^\+|\s*/g, '');

						// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
						// 注意这里的如果是even则替换为2n
						// 因为match[2] === even的时候会返回true所以'&&'还需要判断'2n'并且返回'2n'
						// 而如果match[2] === 'even'返回的是false则该判断不用进行了直接进入
						// match[2] === "odd" 的判断,同上
						var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
							match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
							!/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

						// calculate the numbers (first)n+(last) including if they are negative
						match[2] = (test[1] + (test[2] || 1)) - 0;
						match[3] = test[3] - 0;
					} else if (match[2]) {
						Sizzle.error(match[0]);
					}

					// TODO: Move to normal caching system
					match[0] = done++;

					return match;
				},

				ATTR: function(match, curLoop, inplace, result, not, isXML) {
					var name = match[1] = match[1].replace(rBackslash, "");

					if (!isXML && Expr.attrMap[name]) {
						match[1] = Expr.attrMap[name];
					}

					// Handle if an un-quoted value was used
					match[4] = (match[4] || match[5] || "").replace(rBackslash, "");

					if (match[2] === "~=") {
						match[4] = " " + match[4] + " ";
					}

					return match;
				},

				PSEUDO: function(match, curLoop, inplace, result, not) {
					if (match[1] === "not") {
						// If we're dealing with a complex expression, or a simple one
						if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
							match[3] = Sizzle(match[3], null, null, curLoop);

						} else {
							var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

							if (!inplace) {
								result.push.apply(result, ret);
							}

							return false;
						}

					} else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
						return true;
					}

					return match;
				},

				POS: function(match) {
					match.unshift(true);

					return match;
				}
			},
			// 伪类过滤函数集
			filters: {
				//匹配所有可用元素(未禁用,不隐藏)
				enabled: function(elem) {
					return elem.disabled === false && elem.type !== "hidden";
				},

				disabled: function(elem) {
					return elem.disabled === true;
				},

				checked: function(elem) {
					return elem.checked === true;
				},

				selected: function(elem) {
					// Accessing this property makes selected-by-default
					// options in Safari work properly
					if (elem.parentNode) {
						elem.parentNode.selectedIndex;
					}

					return elem.selected === true;
				},

				parent: function(elem) {
					return !!elem.firstChild;
				},

				empty: function(elem) {
					return !elem.firstChild;
				},

				has: function(elem, i, match) {
					return !!Sizzle(match[3], elem).length;
				},

				header: function(elem) {
					return (/h\d/i).test(elem.nodeName);
				},

				text: function(elem) {
					var attr = elem.getAttribute("type"),
						type = elem.type;
					// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
					// use getAttribute instead to test this case
					return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null);
				},

				radio: function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
				},

				checkbox: function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
				},

				file: function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
				},

				password: function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
				},

				submit: function(elem) {
					var name = elem.nodeName.toLowerCase();
					return (name === "input" || name === "button") && "submit" === elem.type;
				},

				image: function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
				},

				reset: function(elem) {
					var name = elem.nodeName.toLowerCase();
					return (name === "input" || name === "button") && "reset" === elem.type;
				},

				button: function(elem) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && "button" === elem.type || name === "button";
				},

				input: function(elem) {
					return (/input|select|textarea|button/i).test(elem.nodeName);
				},

				focus: function(elem) {
					return elem === elem.ownerDocument.activeElement;
				}
			},
			// 位置伪类过滤函数集
			setFilters: {
				first: function(elem, i) {
					return i === 0;
				},

				last: function(elem, i, match, array) {
					return i === array.length - 1;
				},

				even: function(elem, i) {
					return i % 2 === 0;
				},

				odd: function(elem, i) {
					return i % 2 === 1;
				},

				lt: function(elem, i, match) {
					return i < match[3] - 0;
				},

				gt: function(elem, i, match) {
					return i > match[3] - 0;
				},

				nth: function(elem, i, match) {
					return match[3] - 0 === i;
				},

				eq: function(elem, i, match) {
					return match[3] - 0 === i;
				}
			},
			// 块间表达式过滤函数集
			filter: {
				PSEUDO: function(elem, match, i, array) {
					var name = match[1],
						filter = Expr.filters[name];

					if (filter) {
						return filter(elem, i, match, array);

					} else if (name === "contains") {
						return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;

					} else if (name === "not") {
						//在preFilter.PSEUDO中会把match[3]替换为其匹配的元素集合
						var not = match[3];

						for (var j = 0, l = not.length; j < l; j++) {
							if (not[j] === elem) {
								return false;
							}
						}

						return true;

					} else {
						//对于不支持的伪类一律会抛出异常
						Sizzle.error(name);
					}
				},

				CHILD: function(elem, match) {
					var first, last,
						doneName, parent, cache,
						count, diff,
						type = match[1],
						node = elem;

					switch (type) {
						case "only":
						case "first":
							while ((node = node.previousSibling)) {
								if (node.nodeType === 1) {
									return false;
								}
							}

							if (type === "first") {
								return true;
							}

							node = elem;

							/* falls through */
						case "last":
							while ((node = node.nextSibling)) {
								if (node.nodeType === 1) {
									return false;
								}
							}

							return true;

						case "nth":
							first = match[2];
							last = match[3];

							if (first === 1 && last === 0) {
								return true;
							}

							doneName = match[0];
							parent = elem.parentNode;

							if (parent && (parent[expando] !== doneName || !elem.nodeIndex)) {
								count = 0;

								for (node = parent.firstChild; node; node = node.nextSibling) {
									if (node.nodeType === 1) {
										node.nodeIndex = ++count;
									}
								}

								parent[expando] = doneName;
							}

							diff = elem.nodeIndex - last;

							if (first === 0) {
								return diff === 0;

							} else {
								return (diff % first === 0 && diff / first >= 0);
							}
					}
				},

				ID: function(elem, match) {
					return elem.nodeType === 1 && elem.getAttribute("id") === match;
				},

				TAG: function(elem, match) {
					return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
				},

				CLASS: function(elem, match) {
					return (" " + (elem.className || elem.getAttribute("class")) + " ")
						.indexOf(match) > -1;
				},

				ATTR: function(elem, match) {
					var name = match[1],
						result = Sizzle.attr ?
						Sizzle.attr(elem, name) :
						Expr.attrHandle[name] ?
						Expr.attrHandle[name](elem) :
						elem[name] != null ?
						elem[name] :
						elem.getAttribute(name),
						value = result + "",
						type = match[2],
						check = match[4];

					return result == null ?
						type === "!=" :
						!type && Sizzle.attr ?
						result != null :
						type === "=" ?
						value === check :
						type === "*=" ?
						value.indexOf(check) >= 0 :
						type === "~=" ?
						(" " + value + " ").indexOf(check) >= 0 :
						!check ?
						value && result !== false :
						type === "!=" ?
						value !== check :
						type === "^=" ?
						value.indexOf(check) === 0 :
						type === "$=" ?
						value.substr(value.length - check.length) === check :
						type === "|=" ?
						value === check || value.substr(0, check.length + 1) === check + "-" :
						false;
				},

				POS: function(elem, match, i, array) {
					var name = match[2],
						filter = Expr.setFilters[name];

					if (filter) {
						return filter(elem, i, match, array);
					}
				}
			}
		};

		var origPOS = Expr.match.POS,
			fescape = function(all, num) {
				// 这里的all是下面匹配的整个正则
				// num为数字
				// \15---->\16
				// 上面存在的各个表达式并不需要调用到这个
				// 但是这里为什么给出??
				return "\\" + (num - 0 + 1);
			};

		for (var type in Expr.match) {
			Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
			Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
		}
		// Expose origPOS
		// "global" as in regardless of relation to brackets/parens
		Expr.match.globalPOS = origPOS;

		var makeArray = function(array, results) {
			array = Array.prototype.slice.call(array, 0);

			if (results) {
				results.push.apply(results, array);
				return results;
			}

			return array;
		};

		// Perform a simple check to determine if the browser is capable of
		// converting a NodeList to an array using builtin methods.
		// Also verifies that the returned array holds DOM nodes
		// (which is not the case in the Blackberry browser)
		try {
			Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

			// Provide a fallback method if it does not work
		} catch (e) {
			makeArray = function(array, results) {
				var i = 0,
					ret = results || [];

				if (toString.call(array) === "[object Array]") {
					Array.prototype.push.apply(ret, array);

				} else {
					if (typeof array.length === "number") {
						for (var l = array.length; i < l; i++) {
							ret.push(array[i]);
						}

					} else {
						for (; array[i]; i++) {
							ret.push(array[i]);
						}
					}
				}

				return ret;
			};
		}

		var sortOrder, siblingCheck;

		if (document.documentElement.compareDocumentPosition) {
			sortOrder = function(a, b) {
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
					return a.compareDocumentPosition ? -1 : 1;
				}

				return a.compareDocumentPosition(b) & 4 ? -1 : 1;
			};

		} else {
			sortOrder = function(a, b) {
				// The nodes are identical, we can exit early
				if (a === b) {
					hasDuplicate = true;
					return 0;

					// Fallback to using sourceIndex (in IE) if it's available on both nodes
				} else if (a.sourceIndex && b.sourceIndex) {
					return a.sourceIndex - b.sourceIndex;
				}

				var al, bl,
					ap = [],
					bp = [],
					aup = a.parentNode,
					bup = b.parentNode,
					cur = aup;

				// If the nodes are siblings (or identical) we can do a quick check
				if (aup === bup) {
					return siblingCheck(a, b);

					// If no parents were found then the nodes are disconnected
				} else if (!aup) {
					return -1;

				} else if (!bup) {
					return 1;
				}

				// Otherwise they're somewhere else in the tree so we need
				// to build up a full list of the parentNodes for comparison
				while (cur) {
					ap.unshift(cur);
					cur = cur.parentNode;
				}

				cur = bup;

				while (cur) {
					bp.unshift(cur);
					cur = cur.parentNode;
				}

				al = ap.length;
				bl = bp.length;

				// Start walking down the tree looking for a discrepancy
				for (var i = 0; i < al && i < bl; i++) {
					if (ap[i] !== bp[i]) {
						return siblingCheck(ap[i], bp[i]);
					}
				}

				// We ended someplace up the tree so do a sibling check
				return i === al ?
					siblingCheck(a, bp[i], -1) :
					siblingCheck(ap[i], b, 1);
			};

			siblingCheck = function(a, b, ret) {
				if (a === b) {
					return ret;
				}

				var cur = a.nextSibling;

				while (cur) {
					if (cur === b) {
						return -1;
					}

					cur = cur.nextSibling;
				}

				return 1;
			};
		}

		// Check to see if the browser returns elements by name when
		// querying by getElementById (and provide a workaround)
		(function() {
			// We're going to inject a fake input element with a specified name
			var form = document.createElement("div"),
				id = "script" + (new Date()).getTime(),
				root = document.documentElement;

			form.innerHTML = "<a name='" + id + "'/>";

			// Inject it into the root element, check its status, and remove it quickly
			root.insertBefore(form, root.firstChild);

			// The workaround has to do additional checks after a getElementById
			// Which slows things down for other browsers (hence the branching)
			if (document.getElementById(id)) {
				Expr.find.ID = function(match, context, isXML) {
					if (typeof context.getElementById !== "undefined" && !isXML) {
						var m = context.getElementById(match[1]);

						return m ?
							m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
							[];
					}
				};

				Expr.filter.ID = function(elem, match) {
					var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

					return elem.nodeType === 1 && node && node.nodeValue === match;
				};
			}

			root.removeChild(form);

			// release memory in IE
			root = form = null;
		})();

		(function() {
			// Check to see if the browser returns only elements
			// when doing getElementsByTagName("*")

			// Create a fake element
			var div = document.createElement("div");
			div.appendChild(document.createComment(""));

			// Make sure no comments are found
			if (div.getElementsByTagName("*").length > 0) {
				Expr.find.TAG = function(match, context) {
					var results = context.getElementsByTagName(match[1]);

					// Filter out possible comments
					if (match[1] === "*") {
						var tmp = [];

						for (var i = 0; results[i]; i++) {
							if (results[i].nodeType === 1) {
								tmp.push(results[i]);
							}
						}

						results = tmp;
					}

					return results;
				};
			}

			// Check to see if an attribute returns normalized href attributes
			div.innerHTML = "<a href='#'></a>";

			if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#") {

				Expr.attrHandle.href = function(elem) {
					return elem.getAttribute("href", 2);
				};
			}

			// release memory in IE
			div = null;
		})();

		// 如果浏览器有querySelectorAll则优先进行调用原有方法
		if (document.querySelectorAll) {
			(function() {
				var oldSizzle = Sizzle,
					div = document.createElement("div"),
					id = "__sizzle__";

				div.innerHTML = "<p class='TEST'></p>";

				// Safari can't handle uppercase or unicode characters when
				// in quirks mode.
				if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
					return;
				}

				Sizzle = function(query, context, extra, seed) {
					context = context || document;
					// 这边做这些包装又有什么作用??
					// Only use querySelectorAll on non-XML documents
					// (ID selectors don't work in non-HTML documents)
					// 这里说明如果seed存在或者是传进来的上下文为xml片段
					// 那么任然还是调用原来的Sizzle
					if (!seed && !Sizzle.isXML(context)) {
						// See if we find a selector to speed up
						var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

						// 如果为DOM元素或document元素
						if (match && (context.nodeType === 1 || context.nodeType === 9)) {
							// Speed-up: Sizzle("TAG")
							// 下面处理的是简单的tag标签和class选择器的查找
							// 直接调用浏览器原生的方法即可
							if (match[1]) {
								return makeArray(context.getElementsByTagName(query), extra);
								// Speed-up: Sizzle(".CLASS")
							} else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
								return makeArray(context.getElementsByClassName(match[2]), extra);
							}
						}

						// 当上下文为document时这时如果浏览器
						// 支持高级选择器querySelectorAll那么就进行调用
						// 因为querySelectorAll在群当内查找全部符合选择器描述的节点
						if (context.nodeType === 9) {
							// querySelectorAll 在文档内找全部符合选择器描述的节点包括Element本身
							// jQuery(element).find(selector) 在文档内找全部符合选择器描述的节点不包括Element本身
							// Speed-up: Sizzle("body")
							// The body element only exists once, optimize finding it
							// 查询的是body
							if (query === "body" && context.body) {
								return makeArray([context.body], extra);

								// Speed-up: Sizzle("#ID")
								// 简短的id查询
							} else if (match && match[3]) {
								var elem = context.getElementById(match[3]);

								// Check parentNode to catch when Blackberry 4.6 returns
								// nodes that are no longer in the document #6963
								if (elem && elem.parentNode) {
									// Handle the case where IE and Opera return items
									// by name instead of ID
									if (elem.id === match[3]) {
										return makeArray([elem], extra);
									}

								} else {
									return makeArray([], extra);
								}
							}

							// 这里才是真正调用querySelectorAll方法
							try {
								return makeArray(context.querySelectorAll(query), extra);
							} catch (qsaError) {
								// 这里是不是说明只有当调用querySelectorAll出现异常的时候
								// 才会调用自己定义的选择器查询器
								// 但是又有哪些情况会出现调用不正常的情况呢,还有上面的
								// 判断标签,类,id又有写什么作用

							}

							// qSA works strangely on Element-rooted queries
							// We can work around this by specifying an extra ID on the root
							// and working up from there (Thanks to Andrew Dupont for the technique)
							// IE 8 doesn't work on object elements
						} else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
							// 如果上下文是节点元素也就是不是document
							// 因为调用querySelectorAll可能会把其自己包含进去
							// 所以需要过滤掉自己
							var oldContext = context,
								old = context.getAttribute("id"),
								nid = old || id,
								hasParent = context.parentNode,
								relativeHierarchySelector = /^\s*[+~]/.test(query);

							if (!old) {
								// 原先没id属性则设置为
								// id = "__sizzle__";
								context.setAttribute("id", nid);
							} else {
								// 如果原先有id
								nid = nid.replace(/'/g, "\\$&");
							}
							if (relativeHierarchySelector && hasParent) {
								context = context.parentNode;
							}

							try {
								if (!relativeHierarchySelector || hasParent) {
									return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
								}

							} catch (pseudoError) {
								// 出错的时候是否会进行下面的调用原先的Sizzle??
								// 又有哪些情况是会出错的??
							} finally {
								// 如果原先没有那么上面已经添加了id所以这里需要移除
								// 但是这里的finally做的就非常的曲线化了
								if (!old) {
									oldContext.removeAttribute("id");
								}
							}
						}
					}

					return oldSizzle(query, context, extra, seed);
				};

				// 属性移植
				for (var prop in oldSizzle) {
					Sizzle[prop] = oldSizzle[prop];
				}

				// release memory in IE
				div = null;
			})();
		}

		(function() {
			var html = document.documentElement,
				matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

			if (matches) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9 fails this)
				var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
					pseudoWorks = false;

				try {
					// This should fail with an exception
					// Gecko does not error, returns false instead
					matches.call(document.documentElement, "[test!='']:sizzle");

				} catch (pseudoError) {
					pseudoWorks = true;
				}

				Sizzle.matchesSelector = function(node, expr) {
					// Make sure that attribute selectors are quoted
					expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

					if (!Sizzle.isXML(node)) {
						try {
							if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
								var ret = matches.call(node, expr);

								// IE 9's matchesSelector returns false on disconnected nodes
								if (ret || !disconnectedMatch ||
									// As well, disconnected nodes are said to be in a document
									// fragment in IE 9, so check for that
									node.document && node.document.nodeType !== 11) {
									return ret;
								}
							}
						} catch (e) {}
					}

					return Sizzle(expr, null, null, [node]).length > 0;
				};
			}
		})();

		(function() {
			var div = document.createElement("div");

			div.innerHTML = "<div class='test e'></div><div class='test'></div>";

			// Opera can't find a second classname (in 9.6)
			// Also, make sure that getElementsByClassName actually exists
			if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
				return;
			}

			// Safari caches class attributes, doesn't catch changes (in 3.2)
			div.lastChild.className = "e";

			if (div.getElementsByClassName("e").length === 1) {
				return;
			}

			Expr.order.splice(1, 0, "CLASS");
			Expr.find.CLASS = function(match, context, isXML) {
				if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
					return context.getElementsByClassName(match[1]);
				}
			};

			// release memory in IE
			div = null;
		})();

		function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
			for (var i = 0, l = checkSet.length; i < l; i++) {
				var elem = checkSet[i];

				if (elem) {
					var match = false;

					elem = elem[dir];

					while (elem) {
						if (elem[expando] === doneName) {
							match = checkSet[elem.sizset];
							break;
						}

						if (elem.nodeType === 1 && !isXML) {
							elem[expando] = doneName;
							elem.sizset = i;
						}

						if (elem.nodeName.toLowerCase() === cur) {
							match = elem;
							break;
						}

						elem = elem[dir];
					}

					checkSet[i] = match;
				}
			}
		}

		function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
			for (var i = 0, l = checkSet.length; i < l; i++) {
				var elem = checkSet[i];

				if (elem) {
					var match = false;

					elem = elem[dir];

					while (elem) {
						if (elem[expando] === doneName) {
							match = checkSet[elem.sizset];
							break;
						}

						if (elem.nodeType === 1) {
							if (!isXML) {
								elem[expando] = doneName;
								elem.sizset = i;
							}

							if (typeof cur !== "string") {
								if (elem === cur) {
									match = true;
									break;
								}

							} else if (Sizzle.filter(cur, [elem]).length > 0) {
								match = elem;
								break;
							}
						}

						elem = elem[dir];
					}

					checkSet[i] = match;
				}
			}
		}

		if (document.documentElement.contains) {
			Sizzle.contains = function(a, b) {
				return a !== b && (a.contains ? a.contains(b) : true);
			};

		} else if (document.documentElement.compareDocumentPosition) {
			Sizzle.contains = function(a, b) {
				return !!(a.compareDocumentPosition(b) & 16);
			};

		} else {
			Sizzle.contains = function() {
				return false;
			};
		}

		Sizzle.isXML = function(elem) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

			return documentElement ? documentElement.nodeName !== "HTML" : false;
		};

		var posProcess = function(selector, context, seed) {
			var match,
				tmpSet = [],
				later = "",
				root = context.nodeType ? [context] : context;

			// Position selectors must be done after the filter
			// And so must :not(positional) so we move all PSEUDOs to the end
			while ((match = Expr.match.PSEUDO.exec(selector))) {
				later += match[0];
				selector = selector.replace(Expr.match.PSEUDO, "");
			}

			selector = Expr.relative[selector] ? selector + "*" : selector;

			for (var i = 0, l = root.length; i < l; i++) {
				Sizzle(selector, root[i], tmpSet, seed);
			}

			return Sizzle.filter(later, tmpSet);
		};

		// EXPOSE
		// Override sizzle attribute retrieval
		// 暴露给jquery对象
		Sizzle.attr = jQuery.attr;
		Sizzle.selectors.attrMap = {};
		jQuery.find = Sizzle;
		jQuery.expr = Sizzle.selectors;
		// ??
		jQuery.expr[":"] = jQuery.expr.filters;
		jQuery.unique = Sizzle.uniqueSort;
		jQuery.text = Sizzle.getText;
		jQuery.isXMLDoc = Sizzle.isXML;
		jQuery.contains = Sizzle.contains;


	})();


	var runtil = /Until$/,
		rparentsprev = /^(?:parents|prevUntil|prevAll)/,
		// Note: This RegExp should be improved, or likely pulled from Sizzle
		rmultiselector = /,/,
		isSimple = /^.[^:#\[\.,]*$/,
		slice = Array.prototype.slice,
		POS = jQuery.expr.match.globalPOS,
		// methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	// 原型扩展
	jQuery.fn.extend({
		// 用于获取匹配元素集合中符合要求的后代元素
		// 其中selector可以是
		// DOM对象,jquery对象
		// 这时该方法会遍历自己,用遍历到的元素进行判断selector
		// 是否为其子元素,如果是则保留
		// selector是字符串
		// 则调用$.find方法,然后进行去重处理
		find: function(selector) {
			var self = this,
				i, l;

			if (typeof selector !== "string") {
				return jQuery(selector).filter(function() {
					for (i = 0, l = self.length; i < l; i++) {
						if (jQuery.contains(self[i], this)) {
							return true;
						}
					}
				});
			}

			var ret = this.pushStack("", "find", selector),
				length, n, r;

			for (i = 0, l = this.length; i < l; i++) {
				length = ret.length;
				jQuery.find(selector, this[i], ret);

				if (i > 0) {
					// Make sure that the results are unique
					for (n = length; n < ret.length; n++) {
						for (r = 0; r < length; r++) {
							if (ret[r] === ret[n]) {
								ret.splice(n--, 1);
								break;
							}
						}
					}
				}
			}

			return ret;
		},

		// 用当前的$对象里符合条件的元素构造一个新的集合
		// 能往新集合里面添加的元素应包含target里面的元素
		// 
		has: function(target) {
			var targets = jQuery(target);
			return this.filter(function() {
				for (var i = 0, l = targets.length; i < l; i++) {
					if (jQuery.contains(this, targets[i])) {
						return true;
					}
				}
			});
		},


		not: function(selector) {
			return this.pushStack(winnow(this, selector, false), "not", selector);
		},

		filter: function(selector) {
			return this.pushStack(winnow(this, selector, true), "filter", selector);
		},

		is: function(selector) {
			return !!selector && (
				typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test(selector) ?
				jQuery(selector, this.context).index(this[0]) >= 0 :
				jQuery.filter(selector, this).length > 0 :
				this.filter(selector).length > 0);
		},

		closest: function(selectors, context) {
			var ret = [],
				i, l, cur = this[0];

			// Array (deprecated as of jQuery 1.7)
			if (jQuery.isArray(selectors)) {
				var level = 1;

				while (cur && cur.ownerDocument && cur !== context) {
					for (i = 0; i < selectors.length; i++) {

						if (jQuery(cur).is(selectors[i])) {
							ret.push({
								selector: selectors[i],
								elem: cur,
								level: level
							});
						}
					}

					cur = cur.parentNode;
					level++;
				}

				return ret;
			}

			// String
			var pos = POS.test(selectors) || typeof selectors !== "string" ?
				jQuery(selectors, context || this.context) :
				0;

			for (i = 0, l = this.length; i < l; i++) {
				cur = this[i];

				while (cur) {
					if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
						ret.push(cur);
						break;

					} else {
						cur = cur.parentNode;
						if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) {
							break;
						}
					}
				}
			}

			ret = ret.length > 1 ? jQuery.unique(ret) : ret;

			return this.pushStack(ret, "closest", selectors);
		},

		// Determine the position of an element within
		// the matched set of elements
		index: function(elem) {

			// No argument, return index in parent
			if (!elem) {
				return (this[0] && this[0].parentNode) ? this.prevAll().length : -1;
			}

			// index in selector
			if (typeof elem === "string") {
				return jQuery.inArray(this[0], jQuery(elem));
			}

			// Locate the position of the desired element
			return jQuery.inArray(
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[0] : elem, this);
		},

		add: function(selector, context) {
			var set = typeof selector === "string" ?
				jQuery(selector, context) :
				jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
				all = jQuery.merge(this.get(), set);

			return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ?
				all :
				jQuery.unique(all));
		},

		andSelf: function() {
			return this.add(this.prevObject);
		}
	});

	// A painfully simple check to see if an element is disconnected
	// from a document (should be improved, where feasible).
	function isDisconnected(node) {
		return !node || !node.parentNode || node.parentNode.nodeType === 11;
	}

	jQuery.each({
		parent: function(elem) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function(elem) {
			return jQuery.dir(elem, "parentNode");
		},
		parentsUntil: function(elem, i, until) {
			return jQuery.dir(elem, "parentNode", until);
		},
		next: function(elem) {
			return jQuery.nth(elem, 2, "nextSibling");
		},
		prev: function(elem) {
			return jQuery.nth(elem, 2, "previousSibling");
		},
		nextAll: function(elem) {
			return jQuery.dir(elem, "nextSibling");
		},
		prevAll: function(elem) {
			return jQuery.dir(elem, "previousSibling");
		},
		nextUntil: function(elem, i, until) {
			return jQuery.dir(elem, "nextSibling", until);
		},
		prevUntil: function(elem, i, until) {
			return jQuery.dir(elem, "previousSibling", until);
		},
		siblings: function(elem) {
			return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
		},
		children: function(elem) {
			return jQuery.sibling(elem.firstChild);
		},
		contents: function(elem) {
			return jQuery.nodeName(elem, "iframe") ?
				elem.contentDocument || elem.contentWindow.document :
				jQuery.makeArray(elem.childNodes);
		}
	}, function(name, fn) {
		jQuery.fn[name] = function(until, selector) {
			var ret = jQuery.map(this, fn, until);

			if (!runtil.test(name)) {
				selector = until;
			}

			if (selector && typeof selector === "string") {
				ret = jQuery.filter(selector, ret);
			}

			ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;

			if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
				ret = ret.reverse();
			}

			return this.pushStack(ret, name, slice.call(arguments).join(","));
		};
	});

	jQuery.extend({
		filter: function(expr, elems, not) {
			if (not) {
				expr = ":not(" + expr + ")";
			}

			return elems.length === 1 ?
				jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] :
				jQuery.find.matches(expr, elems);
		},

		dir: function(elem, dir, until) {
			var matched = [],
				cur = elem[dir];

			while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
				if (cur.nodeType === 1) {
					matched.push(cur);
				}
				cur = cur[dir];
			}
			return matched;
		},

		nth: function(cur, result, dir, elem) {
			result = result || 1;
			var num = 0;

			for (; cur; cur = cur[dir]) {
				if (cur.nodeType === 1 && ++num === result) {
					break;
				}
			}

			return cur;
		},

		sibling: function(n, elem) {
			var r = [];

			for (; n; n = n.nextSibling) {
				if (n.nodeType === 1 && n !== elem) {
					r.push(n);
				}
			}

			return r;
		}
	});

	// Implement the identical functionality for filter and not
	// 对elements中的元素进行过滤,过滤条件为qualifier
	// 如果根据qualifier的判断的结果与keep相一致则保留
	// 这里的qualifier可以是
	// 1:function
	// 2:DOM元素
	// 3:数组或$对象
	function winnow(elements, qualifier, keep) {

		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		// Firefox 4里面的null或者undefined不能通过下标读取其值
		// 所以设置为0跳过字符串检验
		qualifier = qualifier || 0;

		if (jQuery.isFunction(qualifier)) {
			return jQuery.grep(elements, function(elem, i) {
				var retVal = !!qualifier.call(elem, i, elem);
				return retVal === keep;
			});

		} else if (qualifier.nodeType) {
			return jQuery.grep(elements, function(elem, i) {
				return (elem === qualifier) === keep;
			});

		} else if (typeof qualifier === "string") {
			var filtered = jQuery.grep(elements, function(elem) {
				return elem.nodeType === 1;
			});

			// isSimple = /^.[^:#\[\.,]*$/
			if (isSimple.test(qualifier)) {
				return jQuery.filter(qualifier, filtered, !keep);
			} else {
				qualifier = jQuery.filter(qualifier, filtered);
			}
		}

		// 到这里表明如果qualifier是数组或者是$对象
		return jQuery.grep(elements, function(elem, i) {
			return (jQuery.inArray(elem, qualifier) >= 0) === keep;
		});
	}



	function createSafeFragment(document) {
		var list = nodeNames.split("|"),
			safeFrag = document.createDocumentFragment();

		if (safeFrag.createElement) {
			while (list.length) {
				safeFrag.createElement(
					list.pop()
				);
			}
		}
		return safeFrag;
	}

	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
		rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
		rleadingWhitespace = /^\s+/,
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		rtagName = /<([\w:]+)/,
		rtbody = /<tbody/i,
		rhtml = /<|&#?\w+;/,
		rnoInnerhtml = /<(?:script|style)/i,
		rnocache = /<(?:script|object|embed|option|style)/i,
		rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptType = /\/(java|ecma)script/i,
		rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
		wrapMap = {
			option: [1, "<select multiple='multiple'>", "</select>"],
			legend: [1, "<fieldset>", "</fieldset>"],
			thead: [1, "<table>", "</table>"],
			tr: [2, "<table><tbody>", "</tbody></table>"],
			td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
			col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
			area: [1, "<map>", "</map>"],
			_default: [0, "", ""]
		},
		safeFragment = createSafeFragment(document);

	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	// IE can't serialize <link> and <script> tags normally
	if (!jQuery.support.htmlSerialize) {
		wrapMap._default = [1, "div<div>", "</div>"];
	}

	// DOM元素操作系统暴露的方法
	jQuery.fn.extend({
		text: function(value) {
			return jQuery.access(this, function(value) {
				return value === undefined ?
					jQuery.text(this) :
					this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
			}, null, value, arguments.length);
		},

		wrapAll: function(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function(i) {
					jQuery(this).wrapAll(html.call(this, i));
				});
			}

			if (this[0]) {
				// The elements to wrap the target around
				var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

				if (this[0].parentNode) {
					wrap.insertBefore(this[0]);
				}

				wrap.map(function() {
					var elem = this;

					while (elem.firstChild && elem.firstChild.nodeType === 1) {
						elem = elem.firstChild;
					}

					return elem;
				}).append(this);
			}

			return this;
		},

		wrapInner: function(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function(i) {
					jQuery(this).wrapInner(html.call(this, i));
				});
			}

			return this.each(function() {
				var self = jQuery(this),
					contents = self.contents();

				if (contents.length) {
					contents.wrapAll(html);

				} else {
					self.append(html);
				}
			});
		},

		wrap: function(html) {
			var isFunction = jQuery.isFunction(html);

			return this.each(function(i) {
				jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
			});
		},

		unwrap: function() {
			return this.parent().each(function() {
				if (!jQuery.nodeName(this, "body")) {
					jQuery(this).replaceWith(this.childNodes);
				}
			}).end();
		},

		append: function() {
			return this.domManip(arguments, true, function(elem) {
				if (this.nodeType === 1) {
					this.appendChild(elem);
				}
			});
		},

		prepend: function() {
			return this.domManip(arguments, true, function(elem) {
				if (this.nodeType === 1) {
					this.insertBefore(elem, this.firstChild);
				}
			});
		},

		before: function() {
			if (this[0] && this[0].parentNode) {
				return this.domManip(arguments, false, function(elem) {
					this.parentNode.insertBefore(elem, this);
				});
			} else if (arguments.length) {
				var set = jQuery.clean(arguments);
				set.push.apply(set, this.toArray());
				return this.pushStack(set, "before", arguments);
			}
		},

		after: function() {
			if (this[0] && this[0].parentNode) {
				return this.domManip(arguments, false, function(elem) {
					this.parentNode.insertBefore(elem, this.nextSibling);
				});
			} else if (arguments.length) {
				var set = this.pushStack(this, "after", arguments);
				set.push.apply(set, jQuery.clean(arguments));
				return set;
			}
		},

		// keepData is for internal use only--do not document
		remove: function(selector, keepData) {
			for (var i = 0, elem;
				(elem = this[i]) != null; i++) {
				// 如果没有传入选择器,或者传入了选择器且当前元素与之匹配
				if (!selector || jQuery.filter(selector, [elem]).length) {
					// 如果不需要保留数据且
					if (!keepData && elem.nodeType === 1) {
						jQuery.cleanData(elem.getElementsByTagName("*"));
						jQuery.cleanData([elem]);
					}

					if (elem.parentNode) {
						elem.parentNode.removeChild(elem);
					}
				}
			}

			return this;
		},

		// 移除子元素,先进行相关数据的清除,以防内存泄漏?但是这里为什么会内存泄漏
		empty: function() {
			for (var i = 0, elem;
				(elem = this[i]) != null; i++) {
				// Remove element nodes and prevent memory leaks
				if (elem.nodeType === 1) {
					jQuery.cleanData(elem.getElementsByTagName("*"));
				}

				// Remove any remaining nodes
				while (elem.firstChild) {
					elem.removeChild(elem.firstChild);
				}
			}

			return this;
		},

		clone: function(dataAndEvents, deepDataAndEvents) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map(function() {
				return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
			});
		},

		html: function(value) {
			return jQuery.access(this, function(value) {
				var elem = this[0] || {},
					i = 0,
					l = this.length;

				if (value === undefined) {
					// 这里的replace是用来除去jquery运行时可能在元素上设置的扩展属性jquery.expando
					return elem.nodeType === 1 ?
						elem.innerHTML.replace(rinlinejQuery, "") :
						null;
				}


				if (typeof value === "string" && !rnoInnerhtml.test(value) &&
					(jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) &&
					!wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

					value = value.replace(rxhtmlTag, "<$1></$2>");

					try {
						for (; i < l; i++) {
							// Remove element nodes and prevent memory leaks
							elem = this[i] || {};
							if (elem.nodeType === 1) {
								jQuery.cleanData(elem.getElementsByTagName("*"));
								elem.innerHTML = value;
							}
						}

						elem = 0;

						// If using innerHTML throws an exception, use the fallback method
					} catch (e) {}
				}

				if (elem) {
					this.empty().append(value);
				}
			}, null, value, arguments.length);
		},

		replaceWith: function(value) {
			// 如果有parent的元素
			if (this[0] && this[0].parentNode) {
				// Make sure that the elements are removed from the DOM before they are inserted
				// this can help fix replacing a parent with child elements
				if (jQuery.isFunction(value)) {
					return this.each(function(i) {
						var self = jQuery(this),
							old = self.html();
						self.replaceWith(value.call(this, i, old));
					});
				}

				if (typeof value !== "string") {
					value = jQuery(value).detach();
				}

				return this.each(function() {
					var next = this.nextSibling,
						parent = this.parentNode;

					jQuery(this).remove();

					if (next) {
						jQuery(next).before(value);
					} else {
						jQuery(parent).append(value);
					}
				});
			} else {
				// 没有parent的元素
				return this.length ?
					this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) :
					this;
			}
		},

		detach: function(selector) {
			return this.remove(selector, true);
		},

		// args:含有待插入内容
		domManip: function(args, table, callback) {
			var results, first, fragment, parent,
				value = args[0],
				scripts = [];

			// We can't cloneNode fragments that contain checked, in WebKit
			// 如果复制文档片段会丢失其中复选框和单选按钮的选中状态checked
			// 
			if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) {
				return this.each(function() {
					jQuery(this).domManip(args, table, callback, true);
				});
			}

			//
			if (jQuery.isFunction(value)) {
				return this.each(function(i) {
					var self = jQuery(this);
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip(args, table, callback);
				});
			}

			if (this[0]) {
				parent = value && value.parentNode;

				// If we're in a fragment, just use that instead of building a new one
				if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) {
					results = {
						fragment: parent
					};

				} else {
					results = jQuery.buildFragment(args, this, scripts);
				}

				fragment = results.fragment;

				if (fragment.childNodes.length === 1) {
					first = fragment = fragment.firstChild;
				} else {
					first = fragment.firstChild;
				}

				if (first) {
					table = table && jQuery.nodeName(first, "tr");

					for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) {
						callback.call(
							table ?
							root(this[i], first) :
							this[i],
							// Make sure that we do not leak memory by inadvertently discarding
							// the original fragment (which might have attached data) instead of
							// using it; in addition, use the original fragment object for the last
							// item instead of first because it can end up being emptied incorrectly
							// in certain situations (Bug #8070).
							// Fragments from the fragment cache must always be cloned and never used
							// in place.
							results.cacheable || (l > 1 && i < lastIndex) ?
							jQuery.clone(fragment, true, true) :
							fragment
						);
					}
				}

				if (scripts.length) {
					jQuery.each(scripts, function(i, elem) {
						if (elem.src) {
							jQuery.ajax({
								type: "GET",
								global: false,
								url: elem.src,
								async: false,
								dataType: "script"
							});
						} else {
							jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
						}

						if (elem.parentNode) {
							elem.parentNode.removeChild(elem);
						}
					});
				}
			}

			return this;
		}
	});

	// 如果elem是table元素则返回第一个tbody元素,如果没有则创建一个
	function root(elem, cur) {
		return jQuery.nodeName(elem, "table") ?
			(elem.getElementsByTagName("tbody")[0] ||
				elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
			elem;
	}

	function cloneCopyEvent(src, dest) {

		if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
			return;
		}

		var type, i, l,
			oldData = jQuery._data(src),
			curData = jQuery._data(dest, oldData),
			events = oldData.events;

		if (events) {
			delete curData.handle;
			curData.events = {};

			for (type in events) {
				for (i = 0, l = events[type].length; i < l; i++) {
					jQuery.event.add(dest, type, events[type][i]);
				}
			}
		}

		// make the cloned public data object a copy from the original
		if (curData.data) {
			curData.data = jQuery.extend({}, curData.data);
		}
	}

	function cloneFixAttributes(src, dest) {
		var nodeName;

		// We do not need to do anything for non-Elements
		if (dest.nodeType !== 1) {
			return;
		}

		// clearAttributes removes the attributes, which we don't want,
		// but also removes the attachEvent events, which we *do* want
		if (dest.clearAttributes) {
			dest.clearAttributes();
		}

		// mergeAttributes, in contrast, only merges back on the
		// original attributes, not the events
		if (dest.mergeAttributes) {
			dest.mergeAttributes(src);
		}

		nodeName = dest.nodeName.toLowerCase();

		// IE6-8 fail to clone children inside object elements that use
		// the proprietary classid attribute value (rather than the type
		// attribute) to identify the type of content to display
		if (nodeName === "object") {
			dest.outerHTML = src.outerHTML;

		} else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set
			if (src.checked) {
				dest.defaultChecked = dest.checked = src.checked;
			}

			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if (dest.value !== src.value) {
				dest.value = src.value;
			}

			// IE6-8 fails to return the selected option to the default selected
			// state when cloning options
		} else if (nodeName === "option") {
			dest.selected = src.defaultSelected;

			// IE6-8 fails to set the defaultValue to the correct value when
			// cloning other types of input fields
		} else if (nodeName === "input" || nodeName === "textarea") {
			dest.defaultValue = src.defaultValue;

			// IE blanks contents when cloning scripts
		} else if (nodeName === "script" && dest.text !== src.text) {
			dest.text = src.text;
		}

		// Event data gets referenced instead of copied if the expando
		// gets copied too
		dest.removeAttribute(jQuery.expando);

		// Clear flags for bubbling special change/submit events, they must
		// be reattached when the newly cloned events are first activated
		dest.removeAttribute("_submit_attached");
		dest.removeAttribute("_change_attached");
	}

	// 这里文档片段的知识,可以把它看成一个容器
	jQuery.buildFragment = function(args, nodes, scripts) {
		var fragment, cacheable, cacheresults, doc,
			first = args[0];

		// nodes may contain either an explicit document object,
		// a jQuery collection or context object.
		// If nodes[0] contains a valid object to assign to doc
		if (nodes && nodes[0]) {
			doc = nodes[0].ownerDocument || nodes[0];
		}

		// Ensure that an attr object doesn't incorrectly stand in as a document object
		// Chrome and Firefox seem to allow this to occur and will throw exception
		// Fixes #8950
		// 如果没有当前文档对象则赋值为document对象
		// 从这里doc不一定为document是否能说,并不是所有的dom对象的文档对象都是document对象
		// 那么真正的文档对象是怎样定义的,除了document对象之外还有什么所谓的文档对象??
		if (!doc.createDocumentFragment) {
			doc = document;
		}

		// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
		// Cloning options loses the selected state, so don't cache them
		// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
		// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
		// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
		// 下面是判断是否满足缓存对象的条件
		// 1:数组的args长度为1,且第一个元素是字符串,即只需要创建一段html代码
		// 2:html片段的长度小于521(1/2kb)
		// 3:传入的文档对象是当前文档对象
		// 4:以'<'开头且rnocache = /<(?:script|object|embed|option|style)/i,不含有这些元素
		// 5:浏览器支持正确的复制单选按钮和复选框的选中状态checked,或者html片段中没有单选按钮和复选按钮被选中
		// 6:当前浏览器可以正确地复制html5元素,或者html代码片段中没有html5代码片段
		// rnocache = /<(?:script|object|embed|option|style)/i,
		// rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
		// 
		// 
		// 缓存在哪里,缓存有什么用,缓存条件4代表什么,浏览器又提供了哪些原生方法?
		if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
			first.charAt(0) === "<" && !rnocache.test(first) &&
			(jQuery.support.checkClone || !rchecked.test(first)) &&
			(jQuery.support.html5Clone || !rnoshimcache.test(first))) {

			cacheable = true;

			//这里的cacheresult可能有几个值
			//1:null表示不存在
			//2:1表示前面已经创建过一次
			//3:原先创建的值,表示已经存放超过一次
			cacheresults = jQuery.fragments[first];
			if (cacheresults && cacheresults !== 1) {
				// 直接从缓存里面读取
				fragment = cacheresults;
			}
		}

		//这里!为true可能有以下几种情况
		//1:html代码不符合缓存对象
		//2:代码符合缓存对象但是是第一次进行转换,不存在对应的缓存
		//3:代码符合缓存条件,但是此时是第二次转换,对应的缓存值为1
		//
		if (!fragment) {
			fragment = doc.createDocumentFragment();
			jQuery.clean(args, doc, fragment, scripts);
		}

		if (cacheable) {
			// 如果符合缓存的条件
			// 这里面的cacheresults不为空有两种情况
			// 一是cacheresults为1则表示已经创建过一次
			// 所以的fragment为空是阔以会调用createDocumentFragment
			// 创建这里就会进行缓存
			// 二是cacheresults为原文档片段
			// 这里同样会进行缓存
			// 而为空这说明该文档片段已经创建过一次
			// 之所以这样进行设计是为了优化
			jQuery.fragments[first] = cacheresults ? fragment : 1;
		}

		//这里说明不管html片段是否符合缓存最终都会调用createDocumentFragment函数的
		//只不过如果符合缓存且为第一次转则往jQuery.fragments[first]存放1
		//第二次转换往jQuery.fragments[first]存放createDocumentFragment函数的值
		//第三次转换则直接从jQuery.fragments[first]里面读取值
		return {
			fragment: fragment,
			cacheable: cacheable
		};
	};

	jQuery.fragments = {};

	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function(name, original) {
		jQuery.fn[name] = function(selector) {
			var ret = [],
				insert = jQuery(selector),
				parent = this.length === 1 && this[0].parentNode;

			if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
				insert[original](this[0]);
				return this;

			} else {
				for (var i = 0, l = insert.length; i < l; i++) {
					var elems = (i > 0 ? this.clone(true) : this).get();
					jQuery(insert[i])[original](elems);
					ret = ret.concat(elems);
				}

				return this.pushStack(ret, name, insert.selector);
			}
		};
	});

	function getAll(elem) {
		if (typeof elem.getElementsByTagName !== "undefined") {
			return elem.getElementsByTagName("*");

		} else if (typeof elem.querySelectorAll !== "undefined") {
			return elem.querySelectorAll("*");

		} else {
			return [];
		}
	}

	// Used in clean, fixes the defaultChecked property
	function fixDefaultChecked(elem) {
		if (elem.type === "checkbox" || elem.type === "radio") {
			elem.defaultChecked = elem.checked;
		}
	}
	// Finds all inputs and passes them to fixDefaultChecked
	function findInputs(elem) {
		var nodeName = (elem.nodeName || "").toLowerCase();
		if (nodeName === "input") {
			fixDefaultChecked(elem);
			// Skip scripts, get other children
		} else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
			jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
		}
	}

	// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
	function shimCloneNode(elem) {
		var div = document.createElement("div");
		safeFragment.appendChild(div);

		div.innerHTML = elem.outerHTML;
		return div.firstChild;
	}

	jQuery.extend({
		clone: function(elem, dataAndEvents, deepDataAndEvents) {
			var srcElements,
				destElements,
				i,
				// IE<=8 does not properly clone detached, unknown element nodes
				clone = jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">") ?
				elem.cloneNode(true) :
				shimCloneNode(elem);

			if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
				// IE copies events bound via attachEvent when using cloneNode.
				// Calling detachEvent on the clone will also remove the events
				// from the original. In order to get around this, we use some
				// proprietary methods to clear the events. Thanks to MooTools
				// guys for this hotness.

				cloneFixAttributes(elem, clone);

				// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
				srcElements = getAll(elem);
				destElements = getAll(clone);

				// Weird iteration because IE will replace the length property
				// with an element if you are cloning the body and one of the
				// elements on the page has a name or id of "length"
				for (i = 0; srcElements[i]; ++i) {
					// Ensure that the destination node is not null; Fixes #9587
					if (destElements[i]) {
						cloneFixAttributes(srcElements[i], destElements[i]);
					}
				}
			}

			// Copy the events from the original to the clone
			if (dataAndEvents) {
				cloneCopyEvent(elem, clone);

				if (deepDataAndEvents) {
					srcElements = getAll(elem);
					destElements = getAll(clone);

					for (i = 0; srcElements[i]; ++i) {
						cloneCopyEvent(srcElements[i], destElements[i]);
					}
				}
			}

			srcElements = destElements = null;

			// Return the cloned set
			return clone;
		},

		// 生成根据给定的elems生成相应的DOM元素
		//elems
		clean: function(elems, context, fragment, scripts) {
			var checkScriptType, script, j,
				ret = [];

			context = context || document;

			// !context.createElement fails in IE with an error but returns typeof 'object'
			// 这里之所有会那么谨慎是因为clean不仅仅是在buildFragment里面被调用
			// 修正context对象
			// 因为这些在.before和.after方法之中只是传入第一个参数而已
			// 并没有传入所谓的context等等参数
			// 具体参见后面的响应的方法的分析
			if (typeof context.createElement === "undefined") {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
			}

			for (var i = 0, elem;
				(elem = elems[i]) != null; i++) {
				// 在上面同时过滤掉了null 和 undefined
				//Q:什么时候会传入数字
				//A:可以创建文本节点
				if (typeof elem === "number") {
					// 转换成为字符串
					elem += "";
				}
				//又什么时候会传入可以转换为false的参数
				//什么样的参数可以转换为false
				//A:["<a>",false]这样的参数
				//这里数字0是不会转换为false的因为上面已经+=""转换成为字符串了
				if (!elem) {
					continue;
				}

				// 下面是重点转换html片段的重点
				// Convert html string into DOM nodes
				if (typeof elem === "string") {
					//rhtml = /<|&#?\w+;/,
					//判断是否含有标签,字符代码或数字代码
					if (!rhtml.test(elem)) {
						// 不包含'<标签',符号代码,数字代码
						//创建createTextNode的时候不能正确解析字符代码和数字代码
						elem = context.createTextNode(elem);
					} else {
						// 包含标签'<'或者包含字符代码或数字代码
						// Fix "XHTML"-style tags in all browsers
						// rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
						// 修正自关闭标签
						// 第一个分组是保留其标签和属性,第二个分组只是保留其标签
						// 这里是全局ig
						// 当可以是area|br等允许半闭标签的就不进行匹配
						elem = elem.replace(rxhtmlTag, "<$1></$2>");

						// Trim whitespace, otherwise indexOf won't work as expected
						// rtagName = /<([\w:]+)/,
						// 提取标签部分
						var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
							//取出标签的父标签,如果有
							// 	wrapMap = {
							// 	option: [1, "<select multiple='multiple'>", "</select>"],
							// 	legend: [1, "<fieldset>", "</fieldset>"],
							// 	thead: [1, "<table>", "</table>"],
							// 	tr: [2, "<table><tbody>", "</tbody></table>"],
							// 	td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
							// 	col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
							// 	area: [1, "<map>", "</map>"],
							// 	_default: [0, "", ""]
							// },
							wrap = wrapMap[tag] || wrapMap._default,
							depth = wrap[0],
							div = context.createElement("div"),
							safeChildNodes = safeFragment.childNodes,
							remove;

						// Append wrapper element to unknown element safe doc fragment
						if (context === document) {
							// Use the fragment we've already created for this document
							safeFragment.appendChild(div);
						} else {
							// Use a fragment created with the owner document
							createSafeFragment(context).appendChild(div);
						}

						// Go to html and back, then peel off extra wrappers
						div.innerHTML = wrap[1] + elem + wrap[2];

						// Move to the right depth
						// 因为有包裹层次而要操作的是传递进来的html元素,所以这里需要去除包裹的元素
						while (depth--) {
							div = div.lastChild;
						}

						// Remove IE's autoinserted <tbody> from table fragments
						// ie6,7会为空的table元素插入tbody元素
						if (!jQuery.support.tbody) {

							// String was a <table>, *may* have spurious <tbody>
							// rtbody = /<tbody/i,
							// 这里主要是考虑两种情况
							// 1:插入的是table元素且table中没有tbody元素
							// 2:用table包裹别的元素,且包裹的html没有tbody元素
							// 这两种情况下tbody都是指向该table下面的thead,tfoot等元素
							var hasBody = rtbody.test(elem),
								tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
								div.childNodes :
								[];
							//移除空的tbody节点
							for (j = tbody.length - 1; j >= 0; --j) {
								if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
									tbody[j].parentNode.removeChild(tbody[j]);
								}
							}
						}

						// IE completely kills leading whitespace when innerHTML is used
						if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
							//这里提取前空白代码并生成textnode类型插入第一个元素的前面
							div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
						}

						elem = div.childNodes;

						// Clear elements from DocumentFragment (safeFragment or otherwise)
						// to avoid hoarding elements. Fixes #11356
						if (div) {
							div.parentNode.removeChild(div);

							// Guard against -1 index exceptions in FF3.6
							if (safeChildNodes.length > 0) {
								remove = safeChildNodes[safeChildNodes.length - 1];

								if (remove && remove.parentNode) {
									remove.parentNode.removeChild(remove);
								}
							}
						}
					}
				}

				// Resets defaultChecked for any radios and checkboxes
				// about to be appended to the DOM in IE 6/7 (#8060)
				var len;
				if (!jQuery.support.appendChecked) {
					if (elem[0] && typeof(len = elem.length) === "number") {
						for (j = 0; j < len; j++) {
							findInputs(elem[j]);
						}
					} else {
						findInputs(elem);
					}
				}

				if (elem.nodeType) {
					ret.push(elem);
				} else {
					//把的当前处理的元素存放到ret中
					ret = jQuery.merge(ret, elem);
				}
			}
			//数组中的所有html代码都已经转换为dom元素,并合并到数组ret中
			//这里是如果传入了文档片段的情况
			//则便利数组ret,提取所有(包括子元素)合法的script元素
			//存入数组script
			//并把其他元素插入文档片段frament
			if (fragment) {
				checkScriptType = function(elem) {
					return !elem.type || rscriptType.test(elem.type);
				};
				for (i = 0; ret[i]; i++) {
					script = ret[i];
					//下面是判断条件
					//rscriptType = /\/(java|ecma)script/i,这里是判断type属性里面是否与"/javascript" "/ecamscript等字段"
					//如果有则表示是可以执行的
					//1:如果传入了scripts变量
					//2:如果当前的元素类型是script
					//3:如果script类型里面没有type属性或则type的值是text/JavaScript属性则认为是合法的则把
					if (scripts && jQuery.nodeName(script, "script") && (!script.type || rscriptType.test(script.type))) {
						//这里是把script元素从其父元素中删除并放入scripts中以便后
						scripts.push(script.parentNode ? script.parentNode.removeChild(script) : script);

					} else {
						if (script.nodeType === 1) {
							//这里是提取当前元素所包含的scrip元素,并把其插入ret数组中,以便进行上面的提取操作
							var jsTags = jQuery.grep(script.getElementsByTagName("script"), checkScriptType);

							ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
						}
						//把元素插入传进来的fragment中
						fragment.appendChild(script);
					}
				}
			}

			return ret;
		},

		cleanData: function(elems) {
			var data, id,
				cache = jQuery.cache,
				special = jQuery.event.special,
				deleteExpando = jQuery.support.deleteExpando;

			for (var i = 0, elem;
				(elem = elems[i]) != null; i++) {
				if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) {
					continue;
				}

				id = elem[jQuery.expando];

				if (id) {
					data = cache[id];

					if (data && data.events) {
						for (var type in data.events) {
							if (special[type]) {
								jQuery.event.remove(elem, type);

								// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent(elem, type, data.handle);
							}
						}

						// Null the DOM reference to avoid IE6/7/8 leak (#7054)
						if (data.handle) {
							data.handle.elem = null;
						}
					}

					if (deleteExpando) {
						delete elem[jQuery.expando];

					} else if (elem.removeAttribute) {
						elem.removeAttribute(jQuery.expando);
					}

					delete cache[id];
				}
			}
		}
	});



	var ralpha = /alpha\([^)]*\)/i,
		ropacity = /opacity=([^)]*)/,
		// fixed for IE9, see #8346
		rupper = /([A-Z]|^ms)/g,
		rnum = /^[\-+]?(?:\d*\.)?\d+$/i,
		rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rrelNum = /^([\-+])=([\-+.\de]+)/,
		rmargin = /^margin/,

		cssShow = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		},

		// order is important!
		cssExpand = ["Top", "Right", "Bottom", "Left"],

		curCSS,

		getComputedStyle,
		currentStyle;

	jQuery.fn.css = function(name, value) {
		return jQuery.access(this, function(elem, name, value) {
			return value !== undefined ?
				jQuery.style(elem, name, value) :
				jQuery.css(elem, name);
		}, name, value, arguments.length > 1);
	};

	jQuery.extend({
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function(elem, computed) {
					if (computed) {
						// We should always get a number back from opacity
						var ret = curCSS(elem, "opacity");
						return ret === "" ? "1" : ret;

					} else {
						return elem.style.opacity;
					}
				}
			}
		},

		// Exclude the following css properties to add px
		cssNumber: {
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			// normalize float css property
			"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
		},

		// Get and set the style property on a DOM Node
		style: function(elem, name, value, extra) {
			// Don't set styles on text and comment nodes
			if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, origName = jQuery.camelCase(name),
				style = elem.style,
				hooks = jQuery.cssHooks[origName];

			name = jQuery.cssProps[origName] || origName;

			// Check if we're setting a value
			if (value !== undefined) {
				type = typeof value;

				// convert relative number strings (+= or -=) to relative numbers. #7345
				if (type === "string" && (ret = rrelNum.exec(value))) {
					value = (+(ret[1] + 1) * +ret[2]) + parseFloat(jQuery.css(elem, name));
					// Fixes bug #9237
					type = "number";
				}

				// Make sure that NaN and null values aren't set. See: #7116
				if (value == null || type === "number" && isNaN(value)) {
					return;
				}

				// If a number was passed in, add 'px' to the (except for certain CSS properties)
				if (type === "number" && !jQuery.cssNumber[origName]) {
					value += "px";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
					// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
					// Fixes bug #5509
					try {
						style[name] = value;
					} catch (e) {}
				}

			} else {
				// If a hook was provided get the non-computed value from there
				if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
					return ret;
				}

				// Otherwise just get the value from the style object
				return style[name];
			}
		},

		css: function(elem, name, extra) {
			var ret, hooks;

			// Make sure that we're working with the right name
			name = jQuery.camelCase(name);
			hooks = jQuery.cssHooks[name];
			name = jQuery.cssProps[name] || name;

			// cssFloat needs a special treatment
			if (name === "cssFloat") {
				name = "float";
			}

			// If a hook was provided get the computed value from there
			if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
				return ret;

				// Otherwise, if a way to get the computed value exists, use that
			} else if (curCSS) {
				return curCSS(elem, name);
			}
		},

		// A method for quickly swapping in/out CSS properties to get correct calculations
		swap: function(elem, options, callback) {
			var old = {},
				ret, name;

			// Remember the old values, and insert the new ones
			for (name in options) {
				old[name] = elem.style[name];
				elem.style[name] = options[name];
			}

			ret = callback.call(elem);

			// Revert the old values
			for (name in options) {
				elem.style[name] = old[name];
			}

			return ret;
		}
	});

	// DEPRECATED in 1.3, Use jQuery.css() instead
	jQuery.curCSS = jQuery.css;

	if (document.defaultView && document.defaultView.getComputedStyle) {
		getComputedStyle = function(elem, name) {
			var ret, defaultView, computedStyle, width,
				style = elem.style;

			name = name.replace(rupper, "-$1").toLowerCase();

			if ((defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle(elem, null))) {

				ret = computedStyle.getPropertyValue(name);
				if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
					ret = jQuery.style(elem, name);
				}
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// WebKit uses "computed value (percentage if specified)" instead of "used value" for margins
			// which is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if (!jQuery.support.pixelMargin && computedStyle && rmargin.test(name) && rnumnonpx.test(ret)) {
				width = style.width;
				style.width = ret;
				ret = computedStyle.width;
				style.width = width;
			}

			return ret;
		};
	}

	if (document.documentElement.currentStyle) {
		currentStyle = function(elem, name) {
			var left, rsLeft, uncomputed,
				ret = elem.currentStyle && elem.currentStyle[name],
				style = elem.style;

			// Avoid setting ret to empty string here
			// so we don't default to auto
			if (ret == null && style && (uncomputed = style[name])) {
				ret = uncomputed;
			}

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if (rnumnonpx.test(ret)) {

				// Remember the original values
				left = style.left;
				rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				if (rsLeft) {
					elem.runtimeStyle.left = elem.currentStyle.left;
				}
				style.left = name === "fontSize" ? "1em" : ret;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				if (rsLeft) {
					elem.runtimeStyle.left = rsLeft;
				}
			}

			return ret === "" ? "auto" : ret;
		};
	}

	curCSS = getComputedStyle || currentStyle;

	function getWidthOrHeight(elem, name, extra) {

		// Start with offset property
		var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			i = name === "width" ? 1 : 0,
			len = 4;

		if (val > 0) {
			if (extra !== "border") {
				for (; i < len; i += 2) {
					if (!extra) {
						val -= parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;
					}
					if (extra === "margin") {
						val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
					} else {
						val -= parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
					}
				}
			}

			return val + "px";
		}

		// Fall back to computed then uncomputed css if necessary
		val = curCSS(elem, name);
		if (val < 0 || val == null) {
			val = elem.style[name];
		}

		// Computed unit is not pixels. Stop here and return.
		if (rnumnonpx.test(val)) {
			return val;
		}

		// Normalize "", auto, and prepare for extra
		val = parseFloat(val) || 0;

		// Add padding, border, margin
		if (extra) {
			for (; i < len; i += 2) {
				val += parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;
				if (extra !== "padding") {
					val += parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
				}
				if (extra === "margin") {
					val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
				}
			}
		}

		return val + "px";
	}

	jQuery.each(["height", "width"], function(i, name) {
		jQuery.cssHooks[name] = {
			get: function(elem, computed, extra) {
				if (computed) {
					if (elem.offsetWidth !== 0) {
						return getWidthOrHeight(elem, name, extra);
					} else {
						return jQuery.swap(elem, cssShow, function() {
							return getWidthOrHeight(elem, name, extra);
						});
					}
				}
			},

			set: function(elem, value) {
				return rnum.test(value) ?
					value + "px" :
					value;
			}
		};
	});

	if (!jQuery.support.opacity) {
		jQuery.cssHooks.opacity = {
			get: function(elem, computed) {
				// IE uses filters for opacity
				return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
					(parseFloat(RegExp.$1) / 100) + "" :
					computed ? "1" : "";
			},

			set: function(elem, value) {
				var style = elem.style,
					currentStyle = elem.currentStyle,
					opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
					filter = currentStyle && currentStyle.filter || style.filter || "";

				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
				if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {

					// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
					// if "filter:" is present at all, clearType is disabled, we want to avoid this
					// style.removeAttribute is IE Only, but so apparently is this code path...
					style.removeAttribute("filter");

					// if there there is no filter style applied in a css rule, we are done
					if (currentStyle && !currentStyle.filter) {
						return;
					}
				}

				// otherwise, set new filter values
				style.filter = ralpha.test(filter) ?
					filter.replace(ralpha, opacity) :
					filter + " " + opacity;
			}
		};
	}

	jQuery(function() {
		// This hook cannot be added until DOM ready because the support test
		// for it is not run until after DOM ready
		if (!jQuery.support.reliableMarginRight) {
			jQuery.cssHooks.marginRight = {
				get: function(elem, computed) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap(elem, {
						"display": "inline-block"
					}, function() {
						if (computed) {
							return curCSS(elem, "margin-right");
						} else {
							return elem.style.marginRight;
						}
					});
				}
			};
		}
	});

	if (jQuery.expr && jQuery.expr.filters) {
		jQuery.expr.filters.hidden = function(elem) {
			var width = elem.offsetWidth,
				height = elem.offsetHeight;

			return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
		};

		jQuery.expr.filters.visible = function(elem) {
			return !jQuery.expr.filters.hidden(elem);
		};
	}

	// These hooks are used by animate to expand properties
	jQuery.each({
		margin: "",
		padding: "",
		border: "Width"
	}, function(prefix, suffix) {

		jQuery.cssHooks[prefix + suffix] = {
			expand: function(value) {
				var i,

					// assumes a single number if not a string
					parts = typeof value === "string" ? value.split(" ") : [value],
					expanded = {};

				for (i = 0; i < 4; i++) {
					expanded[prefix + cssExpand[i] + suffix] =
						parts[i] || parts[i - 2] || parts[0];
				}

				return expanded;
			}
		};
	});



	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rhash = /#.*$/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
		rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
		rquery = /\?/,
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		rselectTextarea = /^(?:select|textarea)/i,
		rspacesAjax = /\s+/,
		rts = /([?&])_=[^&]*/,
		rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

		// Keep a copy of the old load method
		_load = jQuery.fn.load,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		// 前置过滤器集合
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		// 请求发送器集合
		transports = {},

		// Document location
		ajaxLocation,

		// Document location segments
		ajaxLocParts,

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = ["*/"] + ["*"];

	// #8138, IE may throw an exception when accessing
	// a field from window.location if document.domain has been set
	try {
		ajaxLocation = location.href;
	} catch (e) {
		// Use the href attribute of an A element
		// since IE will modify it given document.location
		ajaxLocation = document.createElement("a");
		ajaxLocation.href = "";
		ajaxLocation = ajaxLocation.href;
	}

	// Segment location into parts
	ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	// 从这里就可以推断出前置过滤器的结构是
	// {
	// 	 [datatype-->array],
	// 	 [datatype-->array]
	// }
	// 
	function addToPrefiltersOrTransports(structure) {

		// dataTypeExpression is optional and defaults to "*"
		return function(dataTypeExpression, func) {

			// 如果数据类型不是字符串则修正为*类型
			// 即通用类型
			if (typeof dataTypeExpression !== "string") {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			if (jQuery.isFunction(func)) {
				// rspacesAjax = /\s+/
				var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax),
					i = 0,
					length = dataTypes.length,
					dataType,
					list,
					placeBefore;

				// For each dataType in the dataTypeExpression
				for (; i < length; i++) {
					dataType = dataTypes[i];
					// We control if we're asked to add before
					// any existing element
					// 数据类型是否是'+'开头
					placeBefore = /^\+/.test(dataType);
					//如果是"+"开头则插入数组前面
					if (placeBefore) {
						dataType = dataType.substr(1) || "*";
					}
					// 如果数组不存在则初始化为空数组
					list = structure[dataType] = structure[dataType] || [];
					// then we add to the structure accordingly
					// 如果数据类型是以'+'开头则插入数组头部
					list[placeBefore ? "unshift" : "push"](func);
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	// 应用前置过滤器或者获取请求发送器主要是根据structure来决定
	// 可以进行数据类型的转换
	function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR,
		dataType /* internal */ , inspected /* internal */ ) {

		dataType = dataType || options.dataTypes[0];
		inspected = inspected || {};

		// 已经执行过的数据类型的对象,主要是为了递归调用
		inspected[dataType] = true;

		// 获取数组
		var list = structure[dataType],
			i = 0,
			length = list ? list.length : 0,
			// 第一个参数是否是前置过滤集
			executeOnly = (structure === prefilters),
			selection;

		//这是前置过滤器的处理
		//这里如果executeOnly为false则表示为获取发送器,并且如果在list[i](options, originalOptions, jqXHR);
		//中有返回值且不是字符串,那么表明找到了一个发送器,那么这里就跳出了循环
		// 如果executeOnly则表明为应用前置过滤器,则遍历执行所有的函数
		// 
		for (; i < length && (executeOnly || !selection); i++) {
			// 具体实例见jQuery.ajaxTransport("script", function(s)
			selection = list[i](options, originalOptions, jqXHR);
			// If we got redirected to another dataType
			// we try there if executing only and not done already
			// 所以上面的selction可能是前置过滤器执行的结果,也可能是发送请求其执行的结果
			if (typeof selection === "string") {
				// 如果是获取发送请求其且
				if (!executeOnly || inspected[selection]) {
					// ??
					selection = undefined;
				} else {
					// 如果是前置过滤器并且没有被处理过
					// 改变当前请求数据类型
					// 并递归进行调用,从这里可以看出,后面两个参数是用于优化而已
					// 
					options.dataTypes.unshift(selection);
					selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected);
				}
			}
		}
		// If we're only executing or nothing was selected
		// we try the catchall dataType if not done already
		// 有以下情况
		// 1)没有处理过通配符*且为前置过滤器则递归调用应用通配符*对应的前置过滤器
		// 2)没有处理过通配符*且为获取请求发送器,并且没有找到数据类型对应的发送器,则递归调用获取通配符*
		// 对应的发送器
		if ((executeOnly || !selection) && !inspected["*"]) {
			selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected);
		}
		// unnecessary when only executing (prefilters)
		// but it'll be ignored by the caller in that case
		// 对于应用前置过滤器,则返回undefined
		// 对于获取请求发送器,返回一个请求发送器
		return selection;
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	// 除url和context的深度复制
	function ajaxExtend(target, src) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
		for (key in src) {
			if (src[key] !== undefined) {
				// 除context,url之外的其他选项复制到临时变量deep中
				// 这里如果不是基本数据对象不过为引用而已
				// 同时注意这里如果为context和url则直接复制
				(flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
			}
		}
		if (deep) {
			// 深度复制到target中
			jQuery.extend(true, target, deep);
		}
	}

	jQuery.fn.extend({
		load: function(url, params, callback) {
			//因为事件系统中也有一个同名便捷方法.load(data,fn)
			//如果第一个参数不是url则调用事件系统中的_load
			if (typeof url !== "string" && _load) {
				return _load.apply(this, arguments);

				// Don't do a request if no elements are being requested
				// 匹配元素中没有元素??
			} else if (!this.length) {
				return this;
			}

			var off = url.indexOf(" ");
			if (off >= 0) {
				var selector = url.slice(off, url.length);
				url = url.slice(0, off);
			}

			// Default to a GET request
			// 默认是用get方式向服务器提出请求
			var type = "GET";

			// If the second parameter was provided
			if (params) {
				// If it's a function
				if (jQuery.isFunction(params)) {
					// We assume that it's the callback
					callback = params;
					params = undefined;

					// Otherwise, build a param string
				} else if (typeof params === "object") {
					params = jQuery.param(params, jQuery.ajaxSettings.traditional);
					//如果有参数则修改请求方式为post
					type = "POST";
				}
			}

			var self = this;
			//这里在函数内部如果不定义self=this而直接在内部函数中使用this默认引用额
			//并不是当前对象而是window对象

			// Request the remote document
			jQuery.ajax({
				url: url,
				type: type,
				dataType: "html",
				data: params,
				// Complete callback (responseText is used internally)
				complete: function(jqXHR, status, responseText) {
					// Store the response as specified by the jqXHR object
					responseText = jqXHR.responseText;
					// If successful, inject the HTML into all the matched elements
					if (jqXHR.isResolved()) {
						// #4825: Get the actual response in case
						// a dataFilter is present in ajaxSettings
						// 异步队列在memory模式下会记录触发回调函数时的参数,并立即用记录的参数调用
						// 新添加的回调函数,这里利用异步队列的这一特性来获取选项dataFilter处理过的响应数据
						jqXHR.done(function(r) {
							responseText = r;
						});
						// See if a selector was specified
						self.html(selector ?
							// Create a dummy div to hold the results
							jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

							// If not, just inject the full result
							responseText);
					}

					if (callback) {
						//self指向当前元素,说明的是在每个匹配的元素上面执行一遍回调函数
						//jquery如果匹配的是多个元素,那么构造函数返回的对象又是怎样组织的
						//
						self.each(callback, [responseText, status, jqXHR]);
					}
				}
			});

			return this;
		},

		serialize: function() {
			return jQuery.param(this.serializeArray());
		},

		serializeArray: function() {
			return this.map(function() {
					return this.elements ? jQuery.makeArray(this.elements) : this;
				})
				.filter(function() {
					return this.name && !this.disabled &&
						(this.checked || rselectTextarea.test(this.nodeName) ||
							rinput.test(this.type));
				})
				.map(function(i, elem) {
					var val = jQuery(this).val();

					return val == null ?
						null :
						jQuery.isArray(val) ?
						jQuery.map(val, function(val, i) {
							return {
								name: elem.name,
								value: val.replace(rCRLF, "\r\n")
							};
						}) : {
							name: elem.name,
							value: val.replace(rCRLF, "\r\n")
						};
				}).get();
		}
	});

	// Attach a bunch of functions for handling common AJAX events
	jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(i, o) {
		jQuery.fn[o] = function(f) {
			return this.on(o, f);
		};
	});

	jQuery.each(["get", "post"], function(i, method) {
		jQuery[method] = function(url, data, callback, type) {
			// shift arguments if data argument was omitted
			if (jQuery.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			return jQuery.ajax({
				type: method,
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		};
	});

	jQuery.extend({

		getScript: function(url, callback) {
			return jQuery.get(url, undefined, callback, "script");
		},

		getJSON: function(url, data, callback) {
			return jQuery.get(url, data, callback, "json");
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		// 构造完整请求选项集
		// 
		ajaxSetup: function(target, settings) {
			if (settings) {
				// Building a settings object
				// 除url和context的深度复制
				ajaxExtend(target, jQuery.ajaxSettings);
			} else {
				// Extending ajaxSettings
				// 扩展ajaxSettings
				settings = target;
				target = jQuery.ajaxSettings;
			}
			ajaxExtend(target, settings);
			return target;
		},

		ajaxSettings: {
			url: ajaxLocation,
			isLocal: rlocalProtocol.test(ajaxLocParts[1]),
			global: true,
			type: "GET",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			// 是否提前处理
			processData: true,
			// 是否异步
			async: true,
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			traditional: false,
			headers: {},
			*/

			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				text: "text/plain",
				json: "application/json, text/javascript",
				"*": allTypes
			},

			// 数据类型转换的正则表达式
			// 当构造ajax没有指定一个数据类型时会尝试从mimeType
			// 或者中content-type中寻找一个特定的数据结构类型
			// 这里就是正则表达式
			contents: {
				xml: /xml/,
				html: /html/,
				json: /json/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText"
			},

			// List of data converters
			// 1) key format is "source_type destination_type" (a single space in-between)
			// 2) the catchall symbol "*" can be used for source_type
			converters: {

				// Convert anything to text
				"* text": window.String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				context: true,
				url: true
			}
		},

		//注意这两个函数返回的是一个匿名函数function(dataTypeExpression,func)
		//在匿名函数内,将参数dataTypeExpression作为属性添加到参数中,其属性值是一个数组
		ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
		ajaxTransport: addToPrefiltersOrTransports(transports),

		// Main method
		ajax: function(url, options) {

			// If url is an object, simulate pre-1.5 signature
			if (typeof url === "object") {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var // Create the final options object
			// 创建,构造当前请求完整选项集
				s = jQuery.ajaxSetup({}, options),
				// Callbacks context
				// 回调函数上下文,如果options指定了则用指定的
				// 这个特性可以很好的应用,应该说可以做很好的扩展,因为
				// 自己可以传递过来一个DOM元素,$对象等等
				callbackContext = s.context || s,
				// Context for global events
				// It's the callbackContext if one was provided in the options
				// and if it's a DOM node or a jQuery collection
				globalEventContext = callbackContext !== s &&
				(callbackContext.nodeType || callbackContext instanceof jQuery) ?
				jQuery(callbackContext) : jQuery.event,
				// Deferreds
				deferred = jQuery.Deferred(),
				// 完成异步队列
				completeDeferred = jQuery.Callbacks("once memory"),
				// Status-dependent callbacks
				// 依赖于状态码的回调函数
				statusCode = s.statusCode || {},
				// ifModified key
				ifModifiedKey,
				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},
				// Response headers
				responseHeadersString,
				responseHeaders,
				// transport
				transport,
				// timeout handle
				timeoutTimer,
				// Cross-domain detection vars
				parts,
				// The jqXHR state
				// 当前请求(jqXHR对象)的状态
				// 0:初始状态 1:处理中状态 2:响应成功状态
				state = 0,
				// To know if global events are to be dispatched
				fireGlobals,
				// Loop variable
				i,
				// Fake xhr
				jqXHR = {

					readyState: 0,

					// Caches the header
					setRequestHeader: function(name, value) {
						if (!state) {
							var lname = name.toLowerCase();
							name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
							requestHeaders[name] = value;
						}
						return this;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},

					// Builds headers hashtable if needed
					getResponseHeader: function(key) {
						var match;
						if (state === 2) {
							if (!responseHeaders) {
								responseHeaders = {};
								while ((match = rheaders.exec(responseHeadersString))) {
									responseHeaders[match[1].toLowerCase()] = match[2];
								}
							}
							match = responseHeaders[key.toLowerCase()];
						}
						return match === undefined ? null : match;
					},

					// Overrides response content-type header
					overrideMimeType: function(type) {
						if (!state) {
							s.mimeType = type;
						}
						return this;
					},

					// Cancel the request
					abort: function(statusText) {
						statusText = statusText || "abort";
						if (transport) {
							transport.abort(statusText);
						}
						done(0, statusText);
						return this;
					}
				};

			// Callback for when everything is done
			// It is defined here because jslint complains if it is declared
			// at the end of the function (which would be more logical and readable)
			/**
			 * 构造回调函数,即服务器端完成响应的时候会进行回调的函数
			 * 事件绑定在:
			 * 函数响应在:
			 * 
			 * @param  {[int]}   status           [HTTP响应状态码,如果没有找到请求发送器,或调用请求发送器的方法send()方法时抛出异常
			 *                                     则该参数的值为-1,否则其值为响应的HTTP响应状态码]
			 * @param  {[type]}   nativeStatusText [description]
			 * @param  {[type]}   responses        [description]
			 * @param  {[type]}   headers          [description]
			 * @return {Function}                  [description]
			 */
			function done(status, nativeStatusText, responses, headers) {

				// Called once
				// 只进行调用一次
				if (state === 2) {
					return;
				}

				// State is "done" now
				// 现在的状态已经是完成状态了
				state = 2;

				// Clear timeout if it exists
				if (timeoutTimer) {
					clearTimeout(timeoutTimer);
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				// 设置状态为响应完成
				jqXHR.readyState = status > 0 ? 4 : 0;

				var isSuccess,
					success,
					error,
					statusText = nativeStatusText,
					// 修正数据类型,并读取响应数据
					response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined,
					lastModified,
					etag;

				// If successful, handle type chaining
				// 设置,标识响应,解析数据成功与否
				if (status >= 200 && status < 300 || status === 304) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if (s.ifModified) {
						// 设置了ifModified值,则记录lastModified和etag值,以便下一次用于同一请求
						if ((lastModified = jqXHR.getResponseHeader("Last-Modified"))) {
							jQuery.lastModified[ifModifiedKey] = lastModified;
						}
						if ((etag = jqXHR.getResponseHeader("Etag"))) {
							jQuery.etag[ifModifiedKey] = etag;
						}
					}

					// If not modified
					if (status === 304) {
						// 表示请求资源没有改变
						statusText = "notmodified";
						isSuccess = true;

						// If we have data
					} else {

						try {
							// 将响应的数据转换为期望的类型
							success = ajaxConvert(s, response);
							// 这里换为
							statusText = "success";
							isSuccess = true;
						} catch (e) {
							// We have a parsererror
							statusText = "parsererror";
							error = e;
						}
					}
				} else {
					// We extract error from statusText
					// then normalize statusText and status for non-aborts
					error = statusText;
					if (!statusText || status) {
						statusText = "error";
						if (status < 0) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = "" + (nativeStatusText || statusText);

				// Success/Error
				if (isSuccess) {
					// 响应成功执行成功回调函数
					// 这里的success为经过转换之后的响应数据
					deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
				} else {
					// 响应失败,执行失败回调函数
					deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
				}

				// Status-dependent callbacks
				// 执行状态码对应回调函数
				jqXHR.statusCode(statusCode);
				statusCode = undefined;

				if (fireGlobals) {
					globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [jqXHR, s, isSuccess ? success : error]);
				}

				// Complete
				// 触发完成事件,但是注意这里的参数[jqXHR, statusText]
				completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

				if (fireGlobals) {
					globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
					// Handle the global AJAX counter
					if (!(--jQuery.active)) {
						jQuery.event.trigger("ajaxStop");
					}
				}
			}

			// Attach deferreds
			// 为jqXHR添加异步队列行为
			deferred.promise(jqXHR);
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
			jqXHR.complete = completeDeferred.add;

			// Status-dependent callbacks
			// 对应状态码处理函数,在done里面会进行调用
			jqXHR.statusCode = function(map) {
				if (map) {
					var tmp;
					if (state < 2) {
						for (tmp in map) {
							statusCode[tmp] = [statusCode[tmp], map[tmp]];
						}
					} else {
						tmp = map[jqXHR.status];
						// 传入成功或失败回调函数列表??
						// 在上面成功只会触发成功回调函数列表,失败只会触发
						// 失败回调函数列表
						// 所以这里并不需要担心
						jqXHR.then(tmp, tmp);
					}
				}
				return this;
			};

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
			// We also use the url parameter if available
			// 继续修正url
			s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

			// Extract dataTypes list
			// 修正数据类型
			// 这说明dataTypes的长度至少为1
			s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);

			// Determine if a cross-domain request is in order
			// 修正crossDomain
			if (s.crossDomain == null) {
				// 如果没有指定crossDomain字段则程序自己判断请求是否跨域
				// http://www.asa.com/xxx:8080/
				// rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
				parts = rurl.exec(s.url.toLowerCase());
				s.crossDomain = !!(parts &&
					(parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
						(parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
						(ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
				);
			}

			// Convert data if not already a string
			// 如果传送的数据不是一个字符串则进行转换
			if (s.data && s.processData && typeof s.data !== "string") {
				s.data = jQuery.param(s.data, s.traditional);
			}

			// Apply prefilters
			// 应用前置过滤器
			inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

			// If request was aborted inside a prefilter, stop there
			if (state === 2) {
				return false;
			}

			// We can fire global events as of now if asked to
			fireGlobals = s.global;

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			// 判断当前请求是否包含内容
			// GET和HEAD请求中没有请求内容
			// rnoContent = /^(?:GET|HEAD)$/,
			s.hasContent = !rnoContent.test(s.type);

			// Watch for a new set of requests
			if (fireGlobals && jQuery.active++ === 0) {
				jQuery.event.trigger("ajaxStart");
			}

			// More options handling for requests with no content
			// 特殊处理GET,HEAD请求
			// 主要是如果禁止使用缓存则在url中添加时间戳
			if (!s.hasContent) {

				// If data is available, append data to url
				if (s.data) {
					// rquery = /\?/
					s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Get ifModifiedKey before adding the anti-cache parameter
				ifModifiedKey = s.url;

				// Add anti-cache in url if needed
				// 禁止缓存的设置,主要是在url中添加时间戳
				if (s.cache === false) {
					// 如果禁止缓存
					var ts = jQuery.now(),
						// try replacing _= if it is there
						// rts = /([?&])_=[^&]*/
						// 则在选项url上替换或追加时间戳
						// 先尝试替换选项url中可能有的"_=",参数名为下划线
						// 参数值为当前时间戳
						ret = s.url.replace(rts, "$1_=" + ts);

					// if nothing was replaced, add timestamp to the end
					s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
				}
			}

			// Set the correct header, if data is being sent
			// 设置contentType
			if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
				jqXHR.setRequestHeader("Content-Type", s.contentType);
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if (s.ifModified) {
				ifModifiedKey = ifModifiedKey || s.url;
				if (jQuery.lastModified[ifModifiedKey]) {
					jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey]);
				}
				if (jQuery.etag[ifModifiedKey]) {
					jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey]);
				}
			}

			// Set the Accepts header for the server, depending on the dataType
			// 设置接收的数据类型
			// 如果没有指定则设置为"*"
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
				s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
				s.accepts["*"]
			);

			// Check for headers option
			// 设置请求头
			for (i in s.headers) {
				jqXHR.setRequestHeader(i, s.headers[i]);
			}

			// Allow custom headers/mimetypes and early abort
			if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
				// Abort if not done already
				jqXHR.abort();
				return false;
			}

			// Install callbacks on deferreds
			// 添加成功,失败,完成回调函数
			// 
			for (i in {
					success: 1,
					error: 1,
					complete: 1
				}) {
				// 这就是成功,失败,完成事件的添加了
				jqXHR[i](s[i]);
			}

			// Get transport
			// 获取请求发送器
			transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

			// If no transport, we auto-abort
			// 如果没有发送器,则终止本次请求
			if (!transport) {
				done(-1, "No Transport");
			} else {
				jqXHR.readyState = 1;
				// Send global event
				// 触发全局事件
				if (fireGlobals) {
					globalEventContext.trigger("ajaxSend", [jqXHR, s]);
				}
				// Timeout
				// 如果设置了定时器,则设置定时器
				if (s.async && s.timeout > 0) {
					timeoutTimer = setTimeout(function() {
						jqXHR.abort("timeout");
					}, s.timeout);
				}

				try {
					state = 1;
					// 调用请求发送器发送请求,传入请求集requestHeaders,和回调函数
					// xhr的生成,事件绑定,请求的发送将在这里进行
					transport.send(requestHeaders, done);
				} catch (e) {
					// Propagate exception as error if not done
					if (state < 2) {
						done(-1, e);
						// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			return jqXHR;
		},

		// Serialize an array of form elements or a set of
		// key/values into a query string
		// a:{}/[]
		// traditionnal:true/false 是否禁止深度序列化
		param: function(a, traditional) {
			var s = [],
				add = function(key, value) {
					// If value is a function, invoke it and return its value
					value = jQuery.isFunction(value) ? value() : value;
					s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
				};

			// Set traditional to true for jQuery <= 1.3.2 behavior.
			if (traditional === undefined) {
				traditional = jQuery.ajaxSettings.traditional;
			}

			// If an array was passed in, assume that it is an array of form elements.
			if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
				// Serialize the form elements
				jQuery.each(a, function() {
					add(this.name, this.value);
				});

			} else {
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for (var prefix in a) {
					buildParams(prefix, a[prefix], traditional, add);
				}
			}

			// Return the resulting serialization
			return s.join("&").replace(r20, "+");
		}
	});

	function buildParams(prefix, obj, traditional, add) {
		if (jQuery.isArray(obj)) {
			// Serialize array item.
			jQuery.each(obj, function(i, v) {
				if (traditional || rbracket.test(prefix)) {
					// Treat each array item as a scalar.
					add(prefix, v);

				} else {
					// If array item is non-scalar (array or object), encode its
					// numeric index to resolve deserialization ambiguity issues.
					// Note that rack (as of 1.0.0) can't currently deserialize
					// nested arrays properly, and attempting to do so may cause
					// a server error. Possible fixes are to modify rack's
					// deserialization algorithm or to provide an option or flag
					// to force array serialization to be shallow.
					buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
				}
			});

		} else if (!traditional && jQuery.type(obj) === "object") {
			// Serialize object item.
			for (var name in obj) {
				buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
			}

		} else {
			// Serialize scalar item.
			add(prefix, obj);
		}
	}

	// This is still on the jQuery object... for now
	// Want to move this to jQuery.ajax some day
	jQuery.extend({

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {}

	});

	/* Handles responses to an ajax request:
	 * - sets all responseXXX fields accordingly
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses(s, jqXHR, responses) {

		var contents = s.contents,
			dataTypes = s.dataTypes,
			responseFields = s.responseFields,
			ct,
			type,
			finalDataType,
			firstDataType;

		// Fill responseXXX fields
		// 填充数据
		// 在jqXHR上面添加属性
		// responseXML或responseText
		// 其值为返回的原始值
		for (type in responseFields) {
			if (type in responses) {
				jqXHR[responseFields[type]] = responses[type];
			}
		}

		// Remove auto dataType and get content-type in the process
		// 移除"*"类型的数据类型标识,当进行异步请求但是不传如dataType类型
		// 的时候jquery会自动应用为"*"
		// 
		while (dataTypes[0] === "*") {
			dataTypes.shift();
			if (ct === undefined) {
				// 之所以会这样考虑大概是考虑到"* *"这种情况
				ct = s.mimeType || jqXHR.getResponseHeader("content-type");
			}
		}

		// Check if we're dealing with a known content-type
		if (ct) {
			for (type in contents) {
				if (contents[type] && contents[type].test(ct)) {
					// 只需要找到一个就可以这里是压人栈首
					dataTypes.unshift(type);
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		// 似乎dataType不仅仅是只能指定一种数据类型而已,还可以用空格
		// 隔开指定好几种希望返回的数据类型
		// 如果是text,xml才可能在responses中存在
		if (dataTypes[0] in responses) {
			finalDataType = dataTypes[0];
		} else {
			// Try convertible dataTypes
			// 尝试转换数据类型
			for (type in responses) {
				// 如果上面是"*"那么肯定已经弹出了,且没有能够在cont
				if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
					finalDataType = type;
					break;
				}
				if (!firstDataType) {
					// 这里只可能是text或xml
					firstDataType = type;
				}
			}
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if (finalDataType) {
			// 因为ajax返回的只可能是两种数据格式text和xml
			// 所以这里的一个finalDataType也只可能是text,xml
			// 而在ajaxConvert里面是存放,调用的是"text xml"
			// "text json"这样的转换器
			if (finalDataType !== dataTypes[0]) {
				// 入栈首
				dataTypes.unshift(finalDataType);
			}
			// 
			return responses[finalDataType];
		}
	}

	// Chain conversions given the request and the original response
	// s完整选项集 response响应原始数据
	function ajaxConvert(s, response) {

		// Apply the dataFilter if provided
		// 如果定义了数据过滤器,则先进行数据的第一次过滤
		if (s.dataFilter) {
			response = s.dataFilter(response, s.dataType);
		}

		var dataTypes = s.dataTypes,
			converters = {},
			i,
			key,
			length = dataTypes.length,
			tmp,
			// Current and previous dataTypes
			current = dataTypes[0],
			prev,
			// Conversion expression
			conversion,
			// Conversion function
			conv,
			// Conversion functions (transitive conversion)
			conv1,
			conv2;

		// For each dataType in the chain
		// 如果$.ajax({dataType:"json"})
		// 那么这里为什么一定length长度??
		for (i = 1; i < length; i++) {

			// Create converters map
			// with lowercased keys
			if (i === 1) {
				for (key in s.converters) {
					if (typeof key === "string") {
						converters[key.toLowerCase()] = s.converters[key];
					}
				}
			}

			// Get the dataTypes
			prev = current;
			current = dataTypes[i];

			// If current is auto dataType, update it to prev
			// 以下几种情况将不会进行转换直接跳过
			// 1)目标类型是通配符
			// 2)被转换类型和目标类型相同
			// 3)数组dataTypes中的第一个数据类型是通配符
			// 	 这主要反映在prev !== "*"上面
			if (current === "*") {
				current = prev;
				// If no auto and dataTypes are actually different
			} else if (prev !== "*" && prev !== current) {

				// Get the converter
				conversion = prev + " " + current;
				// 尝试获取转换器
				conv = converters[conversion] || converters["* " + current];

				// If there is no direct converter, search transitively
				// 如果没有找到原始数据类型-->希望数据类型或者*-->希望数据类型的转换函数
				// 则进行下列的过渡转换
				if (!conv) {
					conv2 = undefined;
					for (conv1 in converters) {
						tmp = conv1.split(" ");
						//这里说明是找到一个
						//a-->c
						//但是有
						//a-->b 
						//*-->b
						if (tmp[0] === prev || tmp[0] === "*") {
							conv2 = converters[tmp[1] + " " + current];
							//这里是说明找到一个
							//b-->c
							if (conv2) {
								conv1 = converters[conv1];
								//这里什么时候会变为ture??
								if (conv1 === true) {
									conv = conv2;
								} else if (conv2 === true) {
									conv = conv1;
								}
								break;
							}
						}
					}
				}
				// If we found no converter, dispatch an error
				// 如果没有直接找到转换数据器且
				// 没有找到func(过渡类型-->目标类型)则抛出异常
				// 为什么一定能找到conv1
				if (!(conv || conv2)) {
					jQuery.error("No conversion from " + conversion.replace(" ", " to "));
				}
				// If found converter is not an equivalence
				// 这里是说找到了一个转换器
				// "* text"  		---->   window.String()
				// "text json" 	 	---->   $.parseJSON()
				// "text html"  	---->   true
				// "text xml"  	  	---->   $.parseXML()
				// "text script"  	---->   $.globalEval()
				// "script json"  	---->   闭包机制
				if (conv !== true) {
					// Convert with 1 or 2 converters accordingly
					response = conv ? conv(response) : conv2(conv1(response));
				}
			}
		}
		return response;
	}



	var jsc = jQuery.now(),
		jsre = /(\=)\?(&|$)|\?\?/i;

	// Default jsonp settings
	// 这里只提供一个参数所以是对默认参数集的扩展
	jQuery.ajaxSetup({
		jsonp: "callback",
		jsonpCallback: function() {
			return jQuery.expando + "_" + (jsc++);
		}
	});

	// Detect, normalize options and install callbacks for jsonp requests
	// 添加json,jsonp的前置过滤器
	jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {

		var inspectData = (typeof s.data === "string") && /^application\/x\-www\-form\-urlencoded/.test(s.contentType);

		// 检测当前请求是否为jsonp请求,判断条件如下
		// jsre = /(\=)\?(&|$)|\?\?/i;
		// 1)数据类型为jsonp
		// 2)数据类型为json并且未禁止jsonp请求,并且选项url中包含触发jsonp请求的
		//   字符"=?&" 或 "=?$" 或 "??"
		// 3)数据类型为json并且为禁止jsonp请求,并且选项data中含有触发
		// jsonp请求的特征字符
		// 这里的dataTypes是在哪里进行初始化的??
		if (s.dataTypes[0] === "jsonp" ||
			s.jsonp !== false && (jsre.test(s.url) ||
				inspectData && jsre.test(s.data))) {

			var responseContainer,
				jsonpCallback = s.jsonpCallback =
				jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,
				// 从上面可以推断出来jsonpCallback传入一个函数的名字就可以了
				// 用于备份可能曾经在window对象上注册过的同名jsonp回调函数.当
				// 前响应完成后,就会触发该函数,后面的函数通过闭包机制访问该变量
				previous = window[jsonpCallback],
				url = s.url,
				data = s.data,

				replace = "$1" + jsonpCallback + "$2";

			if (s.jsonp !== false) {
				// callback=?&xxx===>callback=jsonpCallback&
				url = url.replace(jsre, replace);
				// 如果上面的修正不成功
				if (s.url === url) {
					// 待定...
					if (inspectData) {
						data = data.replace(jsre, replace);
					}
					if (s.data === data) {
						// Add callback manually
						// url末尾手动添加
						url += (/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
					}
				}
			}

			s.url = url;
			s.data = data;

			// Install callback
			// 在window对象上注册一个同名回调函数,用于
			// 获取响应的json数据.该回调函数在响应完成或会被自动调用,其参数
			// 为服务器返回的json数据(如果服务器正确响应的话)
			// 在该回调函数中
			// 这里的response有是什么时候传进来的
			window[jsonpCallback] = function(response) {
				responseContainer = [response];
			};

			// Clean-up function
			// 这里为什么没有参数
			jqXHR.always(function() {
				// Set callback back to previous value
				window[jsonpCallback] = previous;
				// Call if it was a function and we have a response
				if (responseContainer && jQuery.isFunction(previous)) {
					window[jsonpCallback](responseContainer[0]);
				}
			});

			// Use data converter to retrieve json after script execution
			// 为本次请求添加"script json"对应的数据转换器
			s.converters["script json"] = function() {
				if (!responseContainer) {
					jQuery.error(jsonpCallback + " was not called");
				}
				return responseContainer[0];
			};

			// force json dataType
			// 强制请求的数据类型为json类型,即期望服务器返回json数据
			s.dataTypes[0] = "json";

			// Delegate to script
			// 重定向到script的前置过滤器
			return "script";
		}

		// 也就是上面那都是为了支持jsonp请求所做的操作即
		// jsonp请求转为script请求
	});



	// Install script dataType
	jQuery.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /javascript|ecmascript/
		},
		converters: {
			"text script": function(text) {
				jQuery.globalEval(text);
				return text;
			}
		}
	});

	// Handle cache's special case and global
	// 添加script的前置过滤器
	jQuery.ajaxPrefilter("script", function(s) {
		if (s.cache === undefined) {
			s.cache = false;
		}
		if (s.crossDomain) {
			s.type = "GET";
			s.global = false;
		}
	});

	// Bind script tag hack transport
	// 绑定script请求的请求发送器
	// send()创建script元素,并进行绑定回调函数回调函数
	jQuery.ajaxTransport("script", function(s) {

		// This transport only deals with cross domain requests
		// 只有明确是跨域请求时才会返回该发送器,主要是利用script元素发送请求
		// 具体就是在head里面添加该元素
		if (s.crossDomain) {
			// 采用闭包机制,当调用该方法时返回的只是
			// {
			// 		send:function()
			// 		abort:function()
			// }
			// 这时就可以var t = XX.send(xx)
			var script,
				head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

			return {

				send: function(_, callback) {
					// 1:第一个参数为"_"表示不关心或不会用到该参数
					// 2:为了和别的发送请求器的参数保持一致

					script = document.createElement("script");

					script.async = "async";

					if (s.scriptCharset) {
						script.charset = s.scriptCharset;
					}

					script.src = s.url;

					// Attach handlers for all browsers
					// 从这里可以推断出
					// 1:script.onreadystatechange的回调函数浏览器并不会传入参数
					// 2:但是如果状态改变其会调用回调函数,所以需要用script.readyState
					// 	来判断是什么类型的状态改变
					// 3:官方文档说明待定...
					script.onload = script.onreadystatechange = function(_, isAbort) {

						//??如果是终止,readyState状态为0?亦或是undefined?或者状态是loaded,complete?这些都代表什么
						//状态,加载过后是否就已经执行一遍就会在浏览器里面已经有了一份?
						//loaded和complete有什么不同?
						if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

							// 移除事件句柄以及script元素
							// Handle memory leak in IE
							// 处理IE下的内存泄漏问题
							script.onload = script.onreadystatechange = null;

							// Remove the script
							if (head && script.parentNode) {
								head.removeChild(script);
							}

							// Dereference the script
							script = undefined;

							// Callback if not abort
							// 如果不是取消请求,则执行回调函数done(status,nativeStatusText,response,headers)
							if (!isAbort) {
								callback(200, "success");
							}
						}
					};
					// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
					// This arises when a base node is used (#2709 and #4378).
					// 将创建的script元素插入head头部,浏览器会开始加载外部文件并执行响应的脚本,即开始
					// 发送请求并执行jsonp响应
					// 注意在ie中,设置script属性src会立即加载文件,但是不会执行,直到插入文档中才会执行
					// 在chrome,safari,firefox中设置script元素的属性src后不会做任何动作,直到插入文档后
					// 才会加载,执行文件
					head.insertBefore(script, head.firstChild);
				},

				abort: function() {
					//如果这里script存在则说明已经调用过send函数
					//这里onload(0,1)第二个参数为1参见上面,则会删除事件句柄以及script元素
					if (script) {
						script.onload(0, 1);
					}
				}
			};
		}
	});


	// 页面退出时终止xhr的请求,因为在ie中即使页面退出
	// xhr的请求并不会终止
	var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
		xhrOnUnloadAbort = window.ActiveXObject ? function() {
			// Abort all pending requests
			for (var key in xhrCallbacks) {
				xhrCallbacks[key](0, 1);
			}
		} : false,
		xhrId = 0,
		xhrCallbacks;

	// Functions to create xhrs
	// 非IE中创建XHR对象
	function createStandardXHR() {
		try {
			return new window.XMLHttpRequest();
		} catch (e) {}
	}

	// IE中创建XHR对象
	function createActiveXHR() {
		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {}
	}

	// 浏览器兼容处理,创建XHR对象
	// Create the request object
	// (This is still attached to ajaxSettings for backward compatibility)
	jQuery.ajaxSettings.xhr = window.ActiveXObject ?
		/* Microsoft failed to properly
		 * implement the XMLHttpRequest in IE7 (can't request local files),
		 * so we use the ActiveXObject when it is available
		 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
		 * we need a fallback.
		 */
		function() {
			return !this.isLocal && createStandardXHR() || createActiveXHR();
		} :
		// For all other browsers, use the standard XMLHttpRequest object
		createStandardXHR;

	// Determine support properties
	(function(xhr) {
		jQuery.extend(jQuery.support, {
			ajax: !!xhr,
			cors: !!xhr && ("withCredentials" in xhr)
		});
	})(jQuery.ajaxSettings.xhr());

	// 通配符*对应的请求发送器工厂函数将会返回一个请求发送器
	// Create transport if the browser can provide an xhr
	if (jQuery.support.ajax) {

		jQuery.ajaxTransport(function(s) {
			// Cross domain only allowed if supported through XMLHttpRequest
			// 如果当前请求不跨域,或支持跨域资源共享
			if (!s.crossDomain || jQuery.support.cors) {

				var callback;

				return {
					send: function(headers, complete) {

						// Get a new xhr
						var xhr = s.xhr(),
							handle,
							i;

						// Open the socket
						// 打开socket链接
						// Passing null username, generates a login popup on Opera (#2865)
						if (s.username) {
							xhr.open(s.type, s.url, s.async, s.username, s.password);
						} else {
							xhr.open(s.type, s.url, s.async);
						}

						// Apply custom fields if provided
						// 设置自定义
						if (s.xhrFields) {
							for (i in s.xhrFields) {
								xhr[i] = s.xhrFields[i];
							}
						}

						// Override mime type if needed
						if (s.mimeType && xhr.overrideMimeType) {
							xhr.overrideMimeType(s.mimeType);
						}

						// X-Requested-With header
						// For cross-domain requests, seeing as conditions for a preflight are
						// akin to a jigsaw puzzle, we simply never set it to be sure.
						// (it can always be set on a per-request basis or even using ajaxSetup)
						// For same-domain requests, won't change header if already provided.
						if (!s.crossDomain && !headers["X-Requested-With"]) {
							headers["X-Requested-With"] = "XMLHttpRequest";
						}

						// Need an extra try/catch for cross domain requests in Firefox 3
						try {
							for (i in headers) {
								xhr.setRequestHeader(i, headers[i]);
							}
						} catch (_) {}

						// Do send the request
						// This may raise an exception which is actually
						// handled in jQuery.ajax (so no try/catch here)
						xhr.send((s.hasContent && s.data) || null);

						// Listener
						callback = function(_, isAbort) {

							var status,
								statusText,
								responseHeaders,
								responses,
								xml;

							// Firefox throws exceptions when accessing properties
							// of an xhr when a network error occured
							// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
							try {

								// Was never called and is aborted or complete
								if (callback && (isAbort || xhr.readyState === 4)) {

									// Only called once
									callback = undefined;

									// Do not keep as active anymore
									// ie处理
									if (handle) {
										xhr.onreadystatechange = jQuery.noop;
										if (xhrOnUnloadAbort) {
											delete xhrCallbacks[handle];
										}
									}

									// If it's an abort
									// 手动终止
									if (isAbort) {
										// Abort it manually if needed
										if (xhr.readyState !== 4) {
											xhr.abort();
										}
									} else {
										status = xhr.status;
										responseHeaders = xhr.getAllResponseHeaders();
										responses = {};
										xml = xhr.responseXML;

										// Construct response list
										if (xml && xml.documentElement /* #4958 */ ) {
											responses.xml = xml;
										}

										// When requesting binary data, IE6-9 will throw an exception
										// on any attempt to access responseText (#11426)
										try {
											responses.text = xhr.responseText;
										} catch (_) {}

										// 从上面可以得到response里面有两个字段(可能)
										// 这在ajaxHandleResponses方法中有应用,但是什么
										// 时候是xml,什么时候又是text呢?
										// 又该能进行怎样的控制
										//  
										// Firefox throws an exception when accessing
										// statusText for faulty cross-domain requests
										try {
											statusText = xhr.statusText;
										} catch (e) {
											// We normalize with Webkit giving an empty statusText
											statusText = "";
										}

										// Filter status for non standard behaviors

										// If the request is local and we have data: assume a success
										// (success with no data won't get notified, that's the best we
										// can do given current implementations)
										if (!status && s.isLocal && !s.crossDomain) {
											status = responses.text ? 200 : 404;
											// IE - #1450: sometimes returns 1223 when it should be 204
										} else if (status === 1223) {
											status = 204;
										}
									}
								}
							} catch (firefoxAccessException) {
								if (!isAbort) {
									complete(-1, firefoxAccessException);
								}
							}

							// Call complete if needed
							if (responses) {
								complete(status, statusText, responses, responseHeaders);
							}
						};

						// if we're in sync mode or it's in cache
						// and has been retrieved directly (IE6 & IE7)
						// we need to manually fire the callback
						// 如果是同步模式或者当前请求已经完成
						if (!s.async || xhr.readyState === 4) {
							callback();
						} else {
							handle = ++xhrId;
							// 这里说明是IE
							if (xhrOnUnloadAbort) {
								// Create the active xhrs callbacks list if needed
								// and attach the unload handler
								if (!xhrCallbacks) {
									xhrCallbacks = {};
									jQuery(window).unload(xhrOnUnloadAbort);
								}
								// Add to list of active xhrs callbacks
								xhrCallbacks[handle] = callback;
							}
							xhr.onreadystatechange = callback;
						}
					},

					abort: function() {
						if (callback) {
							callback(0, 1);
						}
					}
				};
			}
		});
	}



	var elemdisplay = {},
		iframe, iframeDoc,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
		timerId,
		fxAttrs = [
			// height animations
			["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
			// width animations
			["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
			// opacity animations
			["opacity"]
		],
		fxNow;

	jQuery.fn.extend({
		show: function(speed, easing, callback) {
			var elem, display;

			if (speed || speed === 0) {
				return this.animate(genFx("show", 3), speed, easing, callback);

			} else {
				for (var i = 0, j = this.length; i < j; i++) {
					elem = this[i];

					if (elem.style) {
						display = elem.style.display;

						// Reset the inline display of this element to learn if it is
						// being hidden by cascaded rules or not
						if (!jQuery._data(elem, "olddisplay") && display === "none") {
							display = elem.style.display = "";
						}

						// Set elements which have been overridden with display: none
						// in a stylesheet to whatever the default browser style is
						// for such an element
						if ((display === "" && jQuery.css(elem, "display") === "none") ||
							!jQuery.contains(elem.ownerDocument.documentElement, elem)) {
							jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
						}
					}
				}

				// Set the display of most of the elements in a second loop
				// to avoid the constant reflow
				for (i = 0; i < j; i++) {
					elem = this[i];

					if (elem.style) {
						display = elem.style.display;

						if (display === "" || display === "none") {
							elem.style.display = jQuery._data(elem, "olddisplay") || "";
						}
					}
				}

				return this;
			}
		},

		hide: function(speed, easing, callback) {
			if (speed || speed === 0) {
				return this.animate(genFx("hide", 3), speed, easing, callback);

			} else {
				var elem, display,
					i = 0,
					j = this.length;

				for (; i < j; i++) {
					elem = this[i];
					if (elem.style) {
						display = jQuery.css(elem, "display");

						if (display !== "none" && !jQuery._data(elem, "olddisplay")) {
							jQuery._data(elem, "olddisplay", display);
						}
					}
				}

				// Set the display of the elements in a second loop
				// to avoid the constant reflow
				for (i = 0; i < j; i++) {
					if (this[i].style) {
						this[i].style.display = "none";
					}
				}

				return this;
			}
		},

		// Save the old toggle function
		_toggle: jQuery.fn.toggle,

		toggle: function(fn, fn2, callback) {
			var bool = typeof fn === "boolean";

			if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
				this._toggle.apply(this, arguments);

			} else if (fn == null || bool) {
				this.each(function() {
					var state = bool ? fn : jQuery(this).is(":hidden");
					jQuery(this)[state ? "show" : "hide"]();
				});

			} else {
				this.animate(genFx("toggle", 3), fn, fn2, callback);
			}

			return this;
		},

		fadeTo: function(speed, to, easing, callback) {
			return this.filter(":hidden").css("opacity", 0).show().end()
				.animate({
					opacity: to
				}, speed, easing, callback);
		},

		animate: function(prop, speed, easing, callback) {
			var optall = jQuery.speed(speed, easing, callback);

			if (jQuery.isEmptyObject(prop)) {
				return this.each(optall.complete, [false]);
			}

			// Do not change referenced properties as per-property easing will be lost
			prop = jQuery.extend({}, prop);

			function doAnimation() {
				// XXX 'this' does not always have a nodeName when running the
				// test suite

				if (optall.queue === false) {
					jQuery._mark(this);
				}

				var opt = jQuery.extend({}, optall),
					isElement = this.nodeType === 1,
					hidden = isElement && jQuery(this).is(":hidden"),
					name, val, p, e, hooks, replace,
					parts, start, end, unit,
					method;

				// will store per property easing and be used to determine when an animation is complete
				opt.animatedProperties = {};

				// first pass over propertys to expand / normalize
				for (p in prop) {
					name = jQuery.camelCase(p);
					if (p !== name) {
						prop[name] = prop[p];
						delete prop[p];
					}

					if ((hooks = jQuery.cssHooks[name]) && "expand" in hooks) {
						replace = hooks.expand(prop[name]);
						delete prop[name];

						// not quite $.extend, this wont overwrite keys already present.
						// also - reusing 'p' from above because we have the correct "name"
						for (p in replace) {
							if (!(p in prop)) {
								prop[p] = replace[p];
							}
						}
					}
				}

				for (name in prop) {
					val = prop[name];
					// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
					if (jQuery.isArray(val)) {
						opt.animatedProperties[name] = val[1];
						val = prop[name] = val[0];
					} else {
						opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
					}

					if (val === "hide" && hidden || val === "show" && !hidden) {
						return opt.complete.call(this);
					}

					if (isElement && (name === "height" || name === "width")) {
						// Make sure that nothing sneaks out
						// Record all 3 overflow attributes because IE does not
						// change the overflow attribute when overflowX and
						// overflowY are set to the same value
						opt.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];

						// Set display property to inline-block for height/width
						// animations on inline elements that are having width/height animated
						if (jQuery.css(this, "display") === "inline" &&
							jQuery.css(this, "float") === "none") {

							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline") {
								this.style.display = "inline-block";

							} else {
								this.style.zoom = 1;
							}
						}
					}
				}

				// 如果样式名是width或height,则设置overflow为"hidden"
				if (opt.overflow != null) {
					this.style.overflow = "hidden";
				}

				for (p in prop) {
					e = new jQuery.fx(this, opt, p);
					val = prop[p];
					// rfxtypes = /^(?:toggle|show|hide)$/
					if (rfxtypes.test(val)) {

						// Tracks whether to show or hide based on private
						// data attached to the element
						method = jQuery._data(this, "toggle" + p) || (val === "toggle" ? hidden ? "show" : "hide" : 0);
						if (method) {
							jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
							e[method]();
						} else {
							e[val]();
						}

					} else {
						// rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
						parts = rfxnum.exec(val);
						start = e.cur();

						if (parts) {
							end = parseFloat(parts[2]);
							unit = parts[3] || (jQuery.cssNumber[p] ? "" : "px");

							// We need to compute starting value
							if (unit !== "px") {
								jQuery.style(this, p, (end || 1) + unit);
								start = ((end || 1) / e.cur()) * start;
								jQuery.style(this, p, start + unit);
							}

							// If a +=/-= token was provided, we're doing a relative animation
							if (parts[1]) {
								end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
							}

							e.custom(start, end, unit);

						} else {
							e.custom(start, val, "");
						}
					}
				}

				// For JS strict compliance
				return true;
			}

			return optall.queue === false ?
				this.each(doAnimation) :
				this.queue(optall.queue, doAnimation);
		},

		stop: function(type, clearQueue, gotoEnd) {
			if (typeof type !== "string") {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if (clearQueue && type !== false) {
				this.queue(type || "fx", []);
			}

			return this.each(function() {
				var index,
					hadTimers = false,
					timers = jQuery.timers,
					data = jQuery._data(this);

				// clear marker counters if we know they won't be
				if (!gotoEnd) {
					jQuery._unmark(true, this);
				}

				function stopQueue(elem, data, index) {
					var hooks = data[index];
					jQuery.removeData(elem, index, true);
					hooks.stop(gotoEnd);
				}

				if (type == null) {
					for (index in data) {
						if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4) {
							stopQueue(this, data, index);
						}
					}
				} else if (data[index = type + ".run"] && data[index].stop) {
					stopQueue(this, data, index);
				}

				for (index = timers.length; index--;) {
					if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
						if (gotoEnd) {

							// force the next step to be the last
							timers[index](true);
						} else {
							timers[index].saveState();
						}
						hadTimers = true;
						timers.splice(index, 1);
					}
				}

				// start the next in the queue if the last step wasn't forced
				// timers currently will call their complete callbacks, which will dequeue
				// but only if they were gotoEnd
				if (!(gotoEnd && hadTimers)) {
					jQuery.dequeue(this, type);
				}
			});
		}

	});

	// Animations created synchronously will run synchronously
	function createFxNow() {
		setTimeout(clearFxNow, 0);
		return (fxNow = jQuery.now());
	}

	function clearFxNow() {
		fxNow = undefined;
	}

	// Generate parameters to create a standard animation
	function genFx(type, num) {
		var obj = {};

		jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function() {
			obj[this] = type;
		});

		return obj;
	}

	// Generate shortcuts for custom animations
	jQuery.each({
		slideDown: genFx("show", 1),
		slideUp: genFx("hide", 1),
		slideToggle: genFx("toggle", 1),
		fadeIn: {
			opacity: "show"
		},
		fadeOut: {
			opacity: "hide"
		},
		fadeToggle: {
			opacity: "toggle"
		}
	}, function(name, props) {
		jQuery.fn[name] = function(speed, easing, callback) {
			return this.animate(props, speed, easing, callback);
		};
	});

	jQuery.extend({
		speed: function(speed, easing, fn) {
			var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
				complete: fn || !fn && easing ||
					jQuery.isFunction(speed) && speed,
				duration: speed,
				easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
			};

			opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
				opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

			// normalize opt.queue - true/undefined/null -> "fx"
			if (opt.queue == null || opt.queue === true) {
				opt.queue = "fx";
			}

			// Queueing
			opt.old = opt.complete;

			opt.complete = function(noUnmark) {
				if (jQuery.isFunction(opt.old)) {
					opt.old.call(this);
				}

				if (opt.queue) {
					jQuery.dequeue(this, opt.queue);
				} else if (noUnmark !== false) {
					jQuery._unmark(this);
				}
			};

			return opt;
		},

		easing: {
			linear: function(p) {
				return p;
			},
			swing: function(p) {
				return (-Math.cos(p * Math.PI) / 2) + 0.5;
			}
		},

		timers: [],

		fx: function(elem, options, prop) {
			this.options = options;
			this.elem = elem;
			this.prop = prop;

			options.orig = options.orig || {};
		}

	});

	jQuery.fx.prototype = {
		// Simple function for setting a style value
		update: function() {
			if (this.options.step) {
				this.options.step.call(this.elem, this.now, this);
			}

			(jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this);
		},

		// Get the current size
		cur: function() {
			if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
				return this.elem[this.prop];
			}

			var parsed,
				r = jQuery.css(this.elem, this.prop);
			// Empty strings, null, undefined and "auto" are converted to 0,
			// complex values such as "rotate(1rad)" are returned as is,
			// simple values such as "10px" are parsed to Float.
			return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
		},

		// Start an animation from one number to another
		custom: function(from, to, unit) {
			var self = this,
				fx = jQuery.fx;

			this.startTime = fxNow || createFxNow();
			this.end = to;
			this.now = this.start = from;
			this.pos = this.state = 0;
			this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");

			function t(gotoEnd) {
				return self.step(gotoEnd);
			}

			t.queue = this.options.queue;
			t.elem = this.elem;
			t.saveState = function() {
				if (jQuery._data(self.elem, "fxshow" + self.prop) === undefined) {
					if (self.options.hide) {
						jQuery._data(self.elem, "fxshow" + self.prop, self.start);
					} else if (self.options.show) {
						jQuery._data(self.elem, "fxshow" + self.prop, self.end);
					}
				}
			};

			if (t() && jQuery.timers.push(t) && !timerId) {
				timerId = setInterval(fx.tick, fx.interval);
			}
		},

		// Simple 'show' function
		show: function() {
			var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);

			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
			this.options.show = true;

			// Begin the animation
			// Make sure that we start at a small width/height to avoid any flash of content
			if (dataShow !== undefined) {
				// This show is picking up where a previous hide or show left off
				this.custom(this.cur(), dataShow);
			} else {
				this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
			}

			// Start by showing the element
			jQuery(this.elem).show();
		},

		// Simple 'hide' function
		hide: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
			this.options.hide = true;

			// Begin the animation
			this.custom(this.cur(), 0);
		},

		// Each step of an animation
		step: function(gotoEnd) {
			var p, n, complete,
				t = fxNow || createFxNow(),
				done = true,
				elem = this.elem,
				options = this.options;

			// 如果参数为true或者时间已经超过终止时间则立马结束
			if (gotoEnd || t >= options.duration + this.startTime) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();

				options.animatedProperties[this.prop] = true;

				for (p in options.animatedProperties) {
					if (options.animatedProperties[p] !== true) {
						done = false;
					}
				}

				// 全部动画完成
				if (done) {
					// Reset the overflow
					if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) {

						jQuery.each(["", "X", "Y"], function(index, value) {
							elem.style["overflow" + value] = options.overflow[index];
						});
					}

					// Hide the element if the "hide" operation was done
					if (options.hide) {
						jQuery(elem).hide();
					}

					// Reset the properties, if the item has been hidden or shown
					if (options.hide || options.show) {
						for (p in options.animatedProperties) {
							jQuery.style(elem, p, options.orig[p]);
							jQuery.removeData(elem, "fxshow" + p, true);
							// Toggle data is no longer needed
							jQuery.removeData(elem, "toggle" + p, true);
						}
					}

					// Execute the complete function
					// in the event that the complete function throws an exception
					// we must ensure it won't be called twice. #5684

					complete = options.complete;
					if (complete) {

						options.complete = false;
						complete.call(elem);
					}
				}

				return false;

			} else {
				// classical easing cannot be used with an Infinity duration
				if (options.duration == Infinity) {
					this.now = t;
				} else {
					// 已经执行的时间
					n = t - this.startTime;
					// 完成的百分比
					this.state = n / options.duration;

					// Perform the easing function, defaults to swing
					// 差值百分比 = 缓动函数(已执行时间百分比, 已执行时间, 0,1,运行时间)
					this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
					// 当前帧样式值 = 开始值 + 差值百分比*(结束值 - 开始值)
					this.now = this.start + ((this.end - this.start) * this.pos);
				}
				// Perform the next step of the animation
				this.update();
			}

			// 表示当前未完成
			return true;
		}
	};

	jQuery.extend(jQuery.fx, {
		tick: function() {
			var timer,
				timers = jQuery.timers,
				i = 0;

			for (; i < timers.length; i++) {
				timer = timers[i];
				// Checks the timer has not already been removed
				if (!timer() && timers[i] === timer) {
					timers.splice(i--, 1);
				}
			}

			if (!timers.length) {
				jQuery.fx.stop();
			}
		},

		interval: 13,

		stop: function() {
			clearInterval(timerId);
			timerId = null;
		},

		speeds: {
			slow: 600,
			fast: 200,
			// Default speed
			_default: 400
		},

		step: {
			opacity: function(fx) {
				jQuery.style(fx.elem, "opacity", fx.now);
			},

			_default: function(fx) {
				if (fx.elem.style && fx.elem.style[fx.prop] != null) {
					fx.elem.style[fx.prop] = fx.now + fx.unit;
				} else {
					fx.elem[fx.prop] = fx.now;
				}
			}
		}
	});

	// Ensure props that can't be negative don't go there on undershoot easing
	jQuery.each(fxAttrs.concat.apply([], fxAttrs), function(i, prop) {
		// exclude marginTop, marginLeft, marginBottom and marginRight from this list
		if (prop.indexOf("margin")) {
			jQuery.fx.step[prop] = function(fx) {
				jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit);
			};
		}
	});

	if (jQuery.expr && jQuery.expr.filters) {
		jQuery.expr.filters.animated = function(elem) {
			return jQuery.grep(jQuery.timers, function(fn) {
				return elem === fn.elem;
			}).length;
		};
	}

	// Try to restore the default display value of an element
	function defaultDisplay(nodeName) {

		if (!elemdisplay[nodeName]) {

			var body = document.body,
				elem = jQuery("<" + nodeName + ">").appendTo(body),
				display = elem.css("display");
			elem.remove();

			// If the simple way fails,
			// get element's real default display by attaching it to a temp iframe
			if (display === "none" || display === "") {
				// No iframe to use yet, so create it
				if (!iframe) {
					iframe = document.createElement("iframe");
					iframe.frameBorder = iframe.width = iframe.height = 0;
				}

				body.appendChild(iframe);

				// Create a cacheable copy of the iframe document on first call.
				// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
				// document to it; WebKit & Firefox won't allow reusing the iframe document.
				if (!iframeDoc || !iframe.createElement) {
					iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
					iframeDoc.write((jQuery.support.boxModel ? "<!doctype html>" : "") + "<html><body>");
					iframeDoc.close();
				}

				elem = iframeDoc.createElement(nodeName);

				iframeDoc.body.appendChild(elem);

				display = jQuery.css(elem, "display");
				body.removeChild(iframe);
			}

			// Store the correct default display
			elemdisplay[nodeName] = display;
		}

		return elemdisplay[nodeName];
	}



	var getOffset,
		rtable = /^t(?:able|d|h)$/i,
		rroot = /^(?:body|html)$/i;

	if ("getBoundingClientRect" in document.documentElement) {
		getOffset = function(elem, doc, docElem, box) {
			try {
				box = elem.getBoundingClientRect();
			} catch (e) {}

			// Make sure we're not dealing with a disconnected DOM node
			if (!box || !jQuery.contains(docElem, elem)) {
				return box ? {
					top: box.top,
					left: box.left
				} : {
					top: 0,
					left: 0
				};
			}

			var body = doc.body,
				win = getWindow(doc),
				clientTop = docElem.clientTop || body.clientTop || 0,
				clientLeft = docElem.clientLeft || body.clientLeft || 0,
				scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
				scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
				top = box.top + scrollTop - clientTop,
				left = box.left + scrollLeft - clientLeft;

			return {
				top: top,
				left: left
			};
		};

	} else {
		getOffset = function(elem, doc, docElem) {
			var computedStyle,
				offsetParent = elem.offsetParent,
				prevOffsetParent = elem,
				body = doc.body,
				defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
				top = elem.offsetTop,
				left = elem.offsetLeft;

			while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
				if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
					break;
				}

				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top -= elem.scrollTop;
				left -= elem.scrollLeft;

				if (elem === offsetParent) {
					top += elem.offsetTop;
					left += elem.offsetLeft;

					if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
						top += parseFloat(computedStyle.borderTopWidth) || 0;
						left += parseFloat(computedStyle.borderLeftWidth) || 0;
					}

					prevOffsetParent = offsetParent;
					offsetParent = elem.offsetParent;
				}

				if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
					top += parseFloat(computedStyle.borderTopWidth) || 0;
					left += parseFloat(computedStyle.borderLeftWidth) || 0;
				}

				prevComputedStyle = computedStyle;
			}

			if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
				top += body.offsetTop;
				left += body.offsetLeft;
			}

			if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
				top += Math.max(docElem.scrollTop, body.scrollTop);
				left += Math.max(docElem.scrollLeft, body.scrollLeft);
			}

			return {
				top: top,
				left: left
			};
		};
	}

	jQuery.fn.offset = function(options) {
		if (arguments.length) {
			return options === undefined ?
				this :
				this.each(function(i) {
					jQuery.offset.setOffset(this, options, i);
				});
		}

		var elem = this[0],
			doc = elem && elem.ownerDocument;

		if (!doc) {
			return null;
		}

		if (elem === doc.body) {
			return jQuery.offset.bodyOffset(elem);
		}

		return getOffset(elem, doc, doc.documentElement);
	};

	jQuery.offset = {

		bodyOffset: function(body) {
			var top = body.offsetTop,
				left = body.offsetLeft;

			if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
				top += parseFloat(jQuery.css(body, "marginTop")) || 0;
				left += parseFloat(jQuery.css(body, "marginLeft")) || 0;
			}

			return {
				top: top,
				left: left
			};
		},

		setOffset: function(elem, options, i) {
			var position = jQuery.css(elem, "position");

			// set position first, in-case top/left are set even on static elem
			if (position === "static") {
				elem.style.position = "relative";
			}

			var curElem = jQuery(elem),
				curOffset = curElem.offset(),
				curCSSTop = jQuery.css(elem, "top"),
				curCSSLeft = jQuery.css(elem, "left"),
				calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
				props = {},
				curPosition = {},
				curTop, curLeft;

			// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
			if (calculatePosition) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
			} else {
				curTop = parseFloat(curCSSTop) || 0;
				curLeft = parseFloat(curCSSLeft) || 0;
			}

			if (jQuery.isFunction(options)) {
				options = options.call(elem, i, curOffset);
			}

			if (options.top != null) {
				props.top = (options.top - curOffset.top) + curTop;
			}
			if (options.left != null) {
				props.left = (options.left - curOffset.left) + curLeft;
			}

			if ("using" in options) {
				options.using.call(elem, props);
			} else {
				curElem.css(props);
			}
		}
	};


	jQuery.fn.extend({

		position: function() {
			if (!this[0]) {
				return null;
			}

			var elem = this[0],

				// Get *real* offsetParent
				offsetParent = this.offsetParent(),

				// Get correct offsets
				offset = this.offset(),
				parentOffset = rroot.test(offsetParent[0].nodeName) ? {
					top: 0,
					left: 0
				} : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
			offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;

			// Add offsetParent borders
			parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
			parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;

			// Subtract the two offsets
			return {
				top: offset.top - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		},

		offsetParent: function() {
			return this.map(function() {
				var offsetParent = this.offsetParent || document.body;
				while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent;
			});
		}
	});


	// Create scrollLeft and scrollTop methods
	jQuery.each({
		scrollLeft: "pageXOffset",
		scrollTop: "pageYOffset"
	}, function(method, prop) {
		var top = /Y/.test(prop);

		jQuery.fn[method] = function(val) {
			return jQuery.access(this, function(elem, method, val) {
				var win = getWindow(elem);

				if (val === undefined) {
					return win ? (prop in win) ? win[prop] :
						jQuery.support.boxModel && win.document.documentElement[method] ||
						win.document.body[method] :
						elem[method];
				}

				if (win) {
					win.scrollTo(!top ? val : jQuery(win).scrollLeft(),
						top ? val : jQuery(win).scrollTop()
					);

				} else {
					elem[method] = val;
				}
			}, method, val, arguments.length, null);
		};
	});

	function getWindow(elem) {
		return jQuery.isWindow(elem) ?
			elem :
			elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
	}



	// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
	jQuery.each({
		Height: "height",
		Width: "width"
	}, function(name, type) {
		var clientProp = "client" + name,
			scrollProp = "scroll" + name,
			offsetProp = "offset" + name;

		// innerHeight and innerWidth
		jQuery.fn["inner" + name] = function() {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat(jQuery.css(elem, type, "padding")) :
				this[type]() :
				null;
		};

		// outerHeight and outerWidth
		jQuery.fn["outer" + name] = function(margin) {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) :
				this[type]() :
				null;
		};

		jQuery.fn[type] = function(value) {
			return jQuery.access(this, function(elem, type, value) {
				var doc, docElemProp, orig, ret;

				if (jQuery.isWindow(elem)) {
					// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
					doc = elem.document;
					docElemProp = doc.documentElement[clientProp];
					return jQuery.support.boxModel && docElemProp ||
						doc.body && doc.body[clientProp] || docElemProp;
				}

				// Get document width or height
				if (elem.nodeType === 9) {
					// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
					doc = elem.documentElement;

					// when a window > document, IE6 reports a offset[Width/Height] > client[Width/Height]
					// so we can't use max, as it'll choose the incorrect offset[Width/Height]
					// instead we use the correct client[Width/Height]
					// support:IE6
					if (doc[clientProp] >= doc[scrollProp]) {
						return doc[clientProp];
					}

					return Math.max(
						elem.body[scrollProp], doc[scrollProp],
						elem.body[offsetProp], doc[offsetProp]
					);
				}

				// Get width or height on the element
				if (value === undefined) {
					orig = jQuery.css(elem, type);
					ret = parseFloat(orig);
					return jQuery.isNumeric(ret) ? ret : orig;
				}

				// Set the width or height on the element
				jQuery(elem).css(type, value);
			}, type, value, arguments.length, null);
		};
	});



	// Expose jQuery to the global object
	window.jQuery = window.$ = jQuery;

	// Expose jQuery as an AMD module, but only for AMD loaders that
	// understand the issues with loading multiple versions of jQuery
	// in a page that all might call define(). The loader will indicate
	// they have special allowances for multiple jQuery versions by
	// specifying define.amd.jQuery = true. Register as a named module,
	// since jQuery can be concatenated with other files that may use define,
	// but not use a proper concatenation script that understands anonymous
	// AMD modules. A named AMD is safest and most robust way to register.
	// Lowercase jquery is used because AMD module names are derived from
	// file names, and jQuery is normally delivered in a lowercase file name.
	// Do this after creating the global so that if an AMD module wants to call
	// noConflict to hide this version of jQuery, it will work.
	if (typeof define === "function" && define.amd && define.amd.jQuery) {
		define("jquery", [], function() {
			return jQuery;
		});
	}



})(window);