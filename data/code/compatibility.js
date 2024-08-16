/**
 * @name CeL function for compatibility
 * @fileoverview 本檔案包含了 new ECMAScript standard 標準已規定，但先前版本未具備的內建物件功能；以及相容性 test
 *               專用的 functions。<br />
 *               ES6 shim / polyfill<br />
 *               部分標準功能已經包含於 ce.js。
 * 
 * @see see Set, Map @ _structure/dependency_chain.js
 * 
 * 注意: 本檔案可能會被省略執行，因此不應有標準之外的設定，應將之放置於 data.native。
 * 
 * More examples: see /_test suite/test.js
 * 
 * @since
 * @see https://www.audero.it/blog/2016/12/05/monkey-patching-javascript/
 * @see https://tc39.es/proposal-collection-methods/
 * @see https://github.com/tc39/proposals
 * @see https://github.com/Financial-Times/polyfill-library/tree/master/polyfills
 * @see <a
 *      href="http://msdn.microsoft.com/en-us/library/s4esdbwz%28v=VS.85%29.aspx"
 *      accessdate="2010/4/16 20:4">Version Information (Windows Scripting -
 *      JScript)</a> http://espadrine.github.io/New-In-A-Spec/es2017/
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.code.compatibility',

	// This module should NOT require other modules!
	// nothing required.
	// 本 module 為許多 module 所用，應盡可能勿 requiring 其他 module。
	// require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/**
	 * null module constructor
	 * 
	 * @class 標準已規定，但先前版本未具備的功能；以及相容性 test 專用的 functions。
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// cache
	var Array_slice = Array.prototype.slice,
	// cache
	set_method = library_namespace.set_method,
	/**
	 * The index return when not found.<br />
	 * 未發現之index。未找到時的 index。基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1)
	 * 
	 * @type {Number}
	 * @constant
	 */
	NOT_FOUND = ''.indexOf('_');

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * TODO:
	 * 
	 * http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K875.aspx<br />
	 * 8進制數字表示被禁止， 010 代表 10 而不是 8
	 * 
	 * http://jquerymobile.com/gbs/
	 */

	var main_version = 0, full_version = '';
	// for IE/NS only
	if (typeof window !== 'undefined' && window.ScriptEngine) {
		library_namespace.debug(library_namespace
				.is_type(ScriptEngineMajorVersion), 2);
		main_version = window.ScriptEngineMajorVersion() + '.'
				+ window.ScriptEngineMinorVersion();
		full_version = window.ScriptEngine() + ' ' + main_version + '.'
				+ window.ScriptEngineBuildVersion();
		main_version = Number(main_version);
	} else if (false
	// java test: 加了下面這段在 FF3 會召喚出 java! IE中沒有java object.
	// old: object, new: function (?)
	// && (typeof java == 'function' || typeof java == 'object') && java
	) {
		library_namespace.debug("Today is "
				+ java.text.SimpleDateFormat("EEEE-MMMM-dd-yyyy").format(
						new java.util.Date()));
		if (main_version = java.lang.System.getProperty('os.name') + ' '
				+ java.lang.System.getProperty('os.version') + ' '
				+ java.lang.System.getProperty('os.arch'))
			full_version = main_version;
		else
			main_version = 0;
	}

	if (full_version)
		library_namespace.debug('Script engine: ' + full_version);

	/**
	 * 版本檢查.
	 * 
	 * @param {Number}version
	 *            最低 version
	 */
	function check_version(version) {
		if (!library_namespace.is_digits(version) || version < 5)
			version = 5;

		if (typeof WScript !== 'undefined' && WScript.Version < version) {
			// WScript.FullName, WScript.Path
			var Locale = library_namespace.env.locale, promptTitle = Locale == 0x411 ? 'アップグレードしませんか？'
					: '請升級', promptC = Locale == 0x411 ? "今使ってる "
					+ WScript.Name
					+ " のバージョンは古過ぎるから、\nMicrosoft Windows スクリプト テクノロジ Web サイトより\nバージョン "
					+ WScript.Version + " から " + version + " 以上にアップグレードしましょう。"
					: "正使用的 " + WScript.Name
							+ " 版本過舊，\n請至 Microsoft Windows 網站將版本由 "
							+ WScript.Version + " 升級到 " + version + " 以上。", url = /* Locale==0x411? */"http://www.microsoft.com/japan/developer/scripting/default.htm";
			if (1 == WScript.Popup(promptC, 0, promptTitle, 1 + 48))
				WshShell.Run(url);
			WScript.Quit(1);
		}
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// global object

	var globalThis = library_namespace.env.global;
	if (false && (!globalThis.global || globalThis.global !== globalThis)) {
		// Object.defineProperty() defined in base.js
		Object.defineProperty(globalThis, 'global', {
			configurable : true,
			enumerable : false,
			value : globalThis,
			writable : false
		});
	}

	if (!globalThis.globalThis || globalThis.globalThis !== globalThis) {
		// e.g., node-v10.19.0
		// Object.defineProperty() defined in base.js
		Object.defineProperty(globalThis, 'globalThis', {
			configurable : true,
			enumerable : false,
			value : globalThis,
			writable : false
		});
	}

	set_method(globalThis, {
		encodeURI : escape,
		decodeURI : unescape,
		encodeURIComponent : encodeURI,
		decodeURIComponent : decodeURI,
		isNaN : function(value) {
			// parseFloat(value)
			// var a = typeof value == 'number' ? value : parseInt(value);
			// alert(typeof a + ',' + a + ',' + (a === a));

			/**
			 * 變數可以與其本身比較。如果比較結果不相等，則它會是 NaN。原因是 NaN 是唯一與其本身不相等的值。
			 * 
			 * A reliable way for ECMAScript code to test if a value X is a NaN
			 * is an expression of the form X !== X. The result will be true if
			 * and only if X is a NaN.
			 */
			// return /* typeof value=='number'&& */a != a;
			value = Number(value);
			return value !== value;
		},
		// isFinite(null) === true
		isFinite : function isFinite(value) {
			// https://tc39.es/ecma262/#sec-isfinite-number
			return Number.isFinite(Number(value));
		}
	}, null);

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// Object.*

	if (typeof Object.freeze === 'function')
		try {
			// https://github.com/es-shims/es5-shim/blob/master/es5-sham.js
			Object.freeze(function() {
			});
		} catch (e) {
			var Object_freeze = Object.freeze;
			Object.freeze = function freeze_Object(object) {
				return typeof object == 'function' ? Object_freeze(object)
						: object;
			};
		}

	if (!Object.setPrototypeOf) {
		(function() {
			var Object_getPrototypeOf, Object_setPrototypeOf;

			// test prototype chain
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
			if ({
				__proto__ : []
			} instanceof Array) {
				// http://ejohn.org/blog/objectgetprototypeof/
				// https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/object-set-prototype-of.js
				// https://github.com/wesleytodd/setprototypeof/blob/master/index.js
				// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf
				// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
				Object_getPrototypeOf = function get__proto__Of(object) {
					return object.__proto__;
				};
				Object_setPrototypeOf = function set__proto__Of(object,
						prototype) {
					object.__proto__ = prototype;
					return object;
				};

			} else if ({}.constructor && {}.constructor.prototype) {
				Object_getPrototypeOf = function(object) {
					return object.constructor.prototype;
				};
				Object_setPrototypeOf = function(object, prototype) {
					object.constructor.prototype = prototype;
					return object;
				};
			}

			if (Object_getPrototypeOf) {
				set_method(Object, {
					getPrototypeOf : Object_getPrototypeOf,
					setPrototypeOf : Object_setPrototypeOf
				});
			}
		})();
	}

	// IE 8, JScript 5.8.23141 中，DOM 可能沒有 .hasOwnProperty()。
	var hasOwnProperty = Object.prototype.hasOwnProperty
	// Object.getOwnPropertyDescriptor(object, 'property')
	|| function hasOwnProperty(key) {
		try {
			// Object.getPrototypeOf() 返回給定對象的原型。
			var prototype = Object.getPrototypeOf(this);
			return (key in this) && prototype
			//
			&& (!(key in prototype) || this[key] !== prototype[key]);
		} catch (e) {
			// TODO: handle exception
		}
	};

	// Object.keys(): get Object keys, 列出對象中所有可以枚舉的屬性 (Enumerable Only)
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
	// 可用來防止 .prototype 帶來之 properties。e.g., @ IE
	// cf. Object.getOwnPropertyNames() 會列出對象中所有可枚舉以及不可枚舉的屬性 (enumerable or
	// non-enumerable)
	function Object_keys(object) {
		var keys = [];
		try {
			for ( var key in object) {
				if (Object.hasOwn(object, key))
					keys.push(key);
			}

		} catch (e) {
			// TODO: handle exception
		}

		return keys;
	}

	/**
	 * @deprecatred
	 */
	function getPropertyNames() {
		return Object.keys(this);
	}

	function getOwnPropertyDescriptor(object, property) {
		if (Object.hasOwn(object, property)) {
			return {
				configurable : true,
				enumerable : true,
				value : object[property],
				writable : true
			};
		}
	}

	function getOwnPropertyDescriptors(object) {
		var descriptors = Object.create(null);
		// for...in 循環也枚舉原型鏈中的屬性
		for ( var property in object) {
			var descriptor = Object.getOwnPropertyDescriptor(object, property);
			if (descriptor)
				descriptors[property] = descriptor;
		}
		return descriptors;
	}

	// https://tc39.github.io/ecma262/#sec-object.values
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
	// http://www.2ality.com/2015/11/stage3-object-entries.html
	// Object.values()
	function Object_values(object) {
		var values = [];
		for (var keys = Object.keys(object), index = 0, length = keys.length; index < length; index++) {
			values.push(object[keys[index]]);
		}
		return values;

		return Object.keys(object).map(function(key) {
			return object[key];
		});
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
	// Object.entries()
	function Object_entries(object) {
		var entries = [];
		for (var keys = Object.keys(object), index = 0, length = keys.length; index < length; index++) {
			var key = keys[index];
			entries.push([ key, object[key] ]);
		}
		return entries;

		return Object.keys(object).map(function(key) {
			// [ key, value ]
			return [ key, object[key] ];
		});
	}

	// Object.fromEntries()
	function fromEntries(iterable) {
		var object = Object.create(null);

		iterable.forEach(function(pair) {
			// pair = [ key, value ]
			object[pair[0]] = pair[1];
		});

		return object;
	}

	set_method(Object, {
		// 鎖定物件。
		// Object.seal()
		seal : function seal(object) {
			// 無法以舊的語法實現。
			return object;
		},
		// Object.isSealed()
		isSealed : function isSealed(object) {
			// 若欲更嚴謹些，可依照經驗法則，避開無法測試的 write-only 物件、或一改變就會產生後續影響的 object，
			// 並對 object 作變更測試，確保 object 真的具有不可變更之性質。
			return false;
		},
		// Object.preventExtensions()
		preventExtensions : function preventExtensions(object) {
			// 無法以舊的語法實現。
			return object;
		},
		// Object.isExtensible()
		isExtensible : function isExtensible(object) {
			return true;
		},

		// Object.freeze()
		freeze : function freeze(object) {
			// 無法以舊的語法實現。
			return object;
		},
		// Object.isFrozen()
		isFrozen : function isFrozen(object) {
			// 無法以舊的語法實現。
			return false;
		},

		// Object.is(): Return SameValue(value_1, value_2).
		// 以 SameValue Algorithm 判斷。
		is : function is(value_1, value_2) {
			return value_1 === value_2 ? value_1 !== 0
			// check +0 and -0
			|| 1 / value_1
			// 為 JsDoc 換行。
			=== 1 / value_2
			// check NaN. May use Number.isNaN() as well.
			: value_1 !== value_1 && value_2 !== value_2;
		},

		// Object.fromEntries()
		fromEntries : fromEntries,

		// Object.keys(): get Object keys, 列出對象中所有可以枚舉的屬性 (enumerable only)
		keys : Object_keys,
		values : Object_values,
		entries : Object_entries,

		// Object.hasOwn(object, property)
		// https://github.com/tc39/proposal-accessible-object-hasownproperty
		hasOwn : function hasOwn(object, property) {
			return hasOwnProperty.call(object, property);
		},

		// Object.getOwnPropertyDescriptor()
		getOwnPropertyDescriptor : getOwnPropertyDescriptor,
		// Object.getOwnPropertyDescriptors()
		getOwnPropertyDescriptors : getOwnPropertyDescriptors,
		// Object.getOwnPropertyNames()
		// 會列出對象中所有可枚舉以及不可枚舉的屬性 (enumerable or non-enumerable)
		// 列出的比 Object.keys() 多
		getOwnPropertyNames : Object_keys
	});

	// 會造成幾乎每個使用 for(.. in Object)，而不是使用 Object.keys() 的，都出現問題。
	if (false)
		set_method(Object.prototype, {
			// getPropertyNames : getPropertyNames,
			hasOwnProperty : hasOwnProperty
		});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// Array.*

	// Array.prototype.at(), String.prototype.at(), typed_array.at()
	// https://github.com/tc39/proposal-relative-indexing-method#polyfill
	function get_item_at(index) {
		index = ToInteger(index);
		var length = this.length;
		// Allow negative indexing from the end
		if (index < 0)
			index += length;
		// incase (a=[])[-3]=3;a.at(-3);
		if (0 <= index && index < length) {
			// typeof this === 'object' @ HTA (HTML Application) @ Windows 10
			// return this instanceof String ? this.charAt(index) : this[index];
			return this.charAt ? this.charAt(index) : this[index];
		}
	}

	// 稀疏矩陣 (sparse matrix) 用的 Array.prototype.some()
	// 要到 index > 1e7 比較感覺得出來。
	// e.g.,
	// a=[];a[1e7]=2;alert(a.some(function(v){return v===2}));
	// a=[];a[1e7]=2;alert(a.sparse_some(function(v){return v===2}));
	function sparse_some(callback, thisArg) {
		for ( var index in this)
			if (!isNaN(index))
				if (thisArg ? callback.call(thisArg, this[index], index, this)
				// 不採用 .call() 以加速執行。
				: callback(this[index], index, this))
					return true;
		return false;
	}

	// 稀疏矩陣 (sparse matrix) 用的 Array.prototype.every()
	// 要到 index > 1e7 比較感覺得出來。
	function sparse_every(callback, thisArg) {
		for ( var index in this)
			if (!isNaN(index))
				if (!(thisArg ? callback
						.call(thisArg, this[index], index, this)
				// 不採用 .call() 以加速執行。
				: callback(this[index], index, this)))
					return false;
		return true;
	}

	// 測試 for ( ... in array ) 時，會依順序提供 index。
	if (typeof Array.prototype.some !== 'function')
		(function() {
			var array = [], result = [];
			array[4] = 4;
			array[2] = 2;
			array[0] = 0;
			for ( var index in array)
				if (!isNaN(index))
					result.push(index);
			// CeL.log(result.join());

			if (library_namespace.env.sequenced_Array = result.join() === '0,2,4')
				set_method(Array.prototype, {
					sparse_some : sparse_some,
					sparse_every : sparse_every
				});
		})();

	set_method(Array, {
		// Array.of()
		of : function of() {
			return Array_slice.call(arguments);
		}
	});

	function normalize_position(position, length) {
		return position < 0 && (position += length) < 0 ? 0
		//
		: (position |= 0) > length ? length : position;
	}

	// Array.prototype.copyWithin(target, start[, end = this.length])
	function copyWithin(target, start, end) {
		var length = this.length;
		start = normalize_position(start, length);
		end = normalize_position(end || length, length);
		target = normalize_position(target, length);
		if (target < start || end <= target)
			while (start < end)
				this[target++] = this[start++];
		else if (target !== start) {
			if (length < target + start) {
				end -= target - start;
				target = length;
			} else
				target += start;
			// 反向（後→前） copy，確保 copy from 不曾被本操作汙染過。
			while (start < end)
				this[--target] = this[--end];
		}
		return this;
	}

	// https://github.com/tc39/proposal-flatMap
	function flat(depth) {
		if (depth === undefined)
			depth = 1;
		else
			depth |= 0;

		var array = [];

		function push_item(_this, _depth) {
			_depth--;
			_this.forEach(function(item) {
				if (_depth >= 0 && Array.isArray(item))
					push_item(item, _depth);
				else
					array.push(item);
			});
		}
		push_item(this, depth);

		return array;
	}

	function flatMap(mapperFunction, thisArg) {
		if (false) {
			return this.map(
					thisArg ? mapperFunction.bind(thisArg) : mapperFunction)
					.flat();
		}

		var array = [];

		this.forEach(function(item) {
			item = thisArg ? mapperFunction.call(thisArg, item)
					: mapperFunction(item);
			if (Array.isArray(item))
				item.forEach(function(_item) {
					array.push(_item);
				});
			else
				array.push(item);
		});

		return array;
	}

	set_method(Array.prototype, {
		/** <code>Array.prototype.copyWithin(target, start [ , end ])</code> */
		copyWithin : copyWithin,

		// https://github.com/tc39/proposal-relative-indexing-method#polyfill
		at : get_item_at,

		// Array.prototype.includes()
		// part of the Harmony (ECMAScript 7) proposal.
		// http://www.2ality.com/2016/01/ecmascript-2016.html
		includes : function Array_includes(search_target, position) {
			if (search_target === search_target)
				return this.indexOf(search_target, position) !== NOT_FOUND;
			// assert: search_target is NaN
			var length = this.length;
			// position = normalize_position(position, length);
			if (position < 0 && (position += length) < 0)
				position = 0;
			else if ((position |= 0) > length)
				position = length;
			for (; position < length; position++)
				if (this[position] !== this[position])
					return true;
			return false;
		},
		// Array.prototype.reduce()
		reduce : function reduce(callbackfn/* , initialValue */) {
			var index = 0, length = this.length, value;
			if (arguments.length > 1)
				value = arguments[1];
			else
				// initialValue
				for (; index < length; index++)
					if (index in this) {
						value = this[index++];
						break;
					}
			for (; index < length; index++)
				if (index in this)
					value = callbackfn(value, this[index], index, this);
			return value;
		},
		// Array.prototype.reduceRight()
		reduceRight : function reduceRight(callbackfn
		// , initialValue
		) {
			var index = this.length, value;
			if (arguments.length > 1)
				value = arguments[1];
			else
				// initialValue
				while (index-- > 0)
					if (index in this) {
						value = this[index];
						break;
					}
			while (index-- > 0)
				if (index in this)
					value = callbackfn(value, this[index], index, this);
			return value;
		},

		// Array.prototype.entries()
		entries : function entries() {
			// new Array_Iterator(array, use value)
			return new library_namespace.Array_Iterator(this);
		},
		// Array.prototype.values()
		values : function values() {
			// new Array_Iterator(array, use value)
			return new library_namespace.Array_Iterator(this, true);
		},
		// Array.prototype.keys()
		keys : function Array_keys() {
			var keys = [];
			for ( var key in this)
				if (/^\d+$/.test(key))
					keys.push(key | 0);
			library_namespace.debug('keys: ' + keys, 5,
			//
			'Array.prototype.keys');
			return new library_namespace.Array_Iterator(keys, true);
		},

		// Array.prototype.findIndex()
		findIndex : function findIndex(predicate, thisArg) {
			for (var index = 0, length = this.length; index < length; index++)
				if (index in this)
					if (thisArg ? predicate.call(thisArg, this[index], index,
							this)
					// 不採用 .call() 以加速執行。
					: predicate(this[index], index, this))
						return index;
			return NOT_FOUND;
		},
		// Array.prototype.find()
		find : function find(predicate, thisArg) {
			var index = this.findIndex(predicate, thisArg);
			if (index !== NOT_FOUND)
				return this[index];
			// return undefined;
		},
		// https://github.com/tc39/proposal-array-find-from-last
		// Array.prototype.findLastIndex()
		findLastIndex : function findLastIndex(predicate, thisArg) {
			for (var index = this.length; index > 0;)
				if (--index in this)
					if (thisArg ? predicate.call(thisArg, this[index], index,
							this)
					// 不採用 .call() 以加速執行。
					: predicate(this[index], index, this))
						return index;
			return NOT_FOUND;
		},
		// Array.prototype.findLast()
		findLast : function findLast(predicate, thisArg) {
			var index = this.findLastIndex(predicate, thisArg);
			if (index !== NOT_FOUND)
				return this[index];
			// return undefined;
		},

		// Array.prototype.some()
		some : function some(callback, thisArg) {
			for (var index = 0, length = this.length; index < length; index++)
				if (index in this)
					if (thisArg ? callback.call(thisArg, this[index], index,
							this)
					// 不採用 .call() 以加速執行。
					: callback(this[index], index, this))
						return true;
			return false;
		},
		// Array.prototype.every()
		every : function every(callback, thisArg) {
			for (var index = 0, length = this.length; index < length; index++)
				if (index in this)
					if (!(thisArg ? callback.call(thisArg, this[index], index,
							this)
					// 不採用 .call() 以加速執行。
					: callback(this[index], index, this)))
						return false;
			return true;
		},

		// Array.prototype.map()
		map : function map(callback, thisArg) {
			var result = [];
			this.forEach(function() {
				result.push(callback.apply(this, arguments));
			}, thisArg);
			return result;
		},
		// Array.prototype.filter()
		filter : function map(callback, thisArg) {
			var result = [];
			this.forEach(function(value) {
				if (callback.apply(this, arguments))
					result.push(value);
			}, thisArg);
			return result;
		},

		// Array.prototype.flat
		flat : flat,
		// Array.prototype.flatMap
		flatMap : flatMap,

		// Array.prototype.indexOf ( searchElement [ , fromIndex ] )
		indexOf : function indexOf(searchElement, fromIndex) {
			fromIndex |= 0;
			var length = this.length;
			if (fromIndex < 0 && (fromIndex += length) < 0)
				fromIndex = 0;

			for (; fromIndex < length; fromIndex++)
				if (searchElement === this[fromIndex])
					return fromIndex;
			return NOT_FOUND;
		},
		// Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
		lastIndexOf : function lastIndexOf(searchElement, fromIndex) {
			var length = this.length;
			if (isNaN(fromIndex))
				fromIndex = length - 1;
			else if ((fromIndex |= 0) < 0)
				fromIndex += length;
			else
				fromIndex = Math.min(fromIndex, length - 1);

			for (; 0 <= fromIndex; fromIndex--)
				if (searchElement === this[fromIndex])
					return fromIndex;
			return NOT_FOUND;
		},
		// Array.prototype.fill()
		fill : function fill(value, start, end) {
			// Array.prototype.fill() 只會作用於 0~原先的 length 範圍內！
			if (isNaN(end) || this.length < (end |= 0))
				end = this.length;
			else if (end < 0)
				end += this.length;
			for (var index = start || 0; index < end;)
				this[index++] = value;
			return this;
		},
		/**
		 * 對於舊版沒有 Array.push() 等函數時之判別及處置。<br />
		 * 不能用t=this.valueOf(); ... this.push(t);
		 */
		// Array.prototype.push()
		push : function push() {
			var i = 0, l = arguments.length, w = this.length;
			// 在 FF3 僅用 this[this.length]=o; 效率略好於 Array.push()，
			// 但 Chrome 6 相反。
			for (; i < l; i++)
				this[w++] = arguments[i];
			return w;
		},
		// Array.prototype.pop()
		pop : function pop() {
			// 不能用 return this[--this.length];
			var l = this.length, v;
			if (l) {
				v = this[l];
				this.length--;
			}
			return v;
		},
		// Array.prototype.shift()
		shift : function shift() {
			var v = this[0];
			// ECMAScript 不允許設定 this=
			this.value = this.slice(1);
			return v;
		},
		// Array.prototype.unshift()
		unshift : function unshift() {
			// ECMAScript 不允許設定 this =
			this.value = Array_slice.call(arguments).concat(this);
			return this.length;
		}
	}, null);

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
	// It's hard to fully simulate typed arrays.
	// 只能把原先即存在的功能加強到可用。
	var typed_arrays = [];
	if (typeof Uint32Array === 'function')
		(function() {
			var Array_prototype = Array.prototype,
			// TODO: .slice() and others
			typed_array_methods = 'copyWithin,entries,every,fill,filter,find,findIndex,forEach,includes,indexOf,join,keys,lastIndexOf,map,reduce,reduceRight,reverse,set,slice,some,subarray,values,at'
					.split(',');
			'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
			//
			.split(',').forEach(function(typed_array) {
				try {
					typed_array = eval(typed_array);
				} catch (e) {
					library_namespace.warn('Not exist: ' + typed_array);
					return;
				}
				var prototype = typed_array.prototype;
				typed_array_methods.forEach(function(method) {
					if (!(method in typed_array.prototype))
						Object.defineProperty(prototype, method, {
							value : Array_prototype[method]
						});
				});
				typed_arrays.push(typed_array);
			});
		})();

	if (typed_arrays.length === 0)
		typed_arrays = null;

	_.typed_arrays = typed_arrays;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// Number.*

	// 1. === 1.0

	function ToNumber(value) {
		// Number(value)
		return +value;
	}

	// cf. value | 0
	/** <code>((Number.MAX_SAFE_INTEGER / 4) | 0) < 0, 0 < ((Number.MAX_SAFE_INTEGER / 5) | 0)</code> */
	function ToInteger(value) {
		return Math.trunc(value) || 0;

		// return value >> 0;

		// https://tc39.es/ecma262/#sec-tointeger
		value = Number(value);
		return value > 0 ? Math.floor(value) : value < 0 ? -Math.floor(value)
				: 0;
	}

	// Number.isNaN()
	// http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
	function is_NaN(value) {
		return typeof value === 'number' &&
		// isNaN(value)
		value !== value;
	}

	// calculatable
	/**
	 * 取得最小最低可做除法計算數值。回傳值為邊界，已不可再做操作。但可做乘法操作。
	 * 
	 * @param [base_integral]
	 * @returns {Number}
	 */
	function dividable_minimum(base_integral, return_last) {
		if (!base_integral || isNaN(base_integral))
			base_integral = 1;
		var last = 1, min;
		// 預防 min 變成0，因此設置前一步 last。
		while (base_integral !== base_integral + (min = last / 2))
			last = min;
		return !return_last && min || last;
	}

	// calculatable
	/**
	 * 取得最大可做加法計算數值。回傳值為邊界，已不可再做加法操作。但可做減法操作。
	 * 
	 * @param [base_integral]
	 * @returns {Integer}
	 */
	function addable_maximum(base_integral) {
		if (!base_integral || isNaN(base_integral))
			base_integral = 1;
		var max = 1, test;
		while ((max *= 2) < (test = max + base_integral)
				&& max === test - base_integral)
			;
		return max;
	}
	var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || addable_maximum() - 1;
	// Number.isSafeInteger()
	function isSafeInteger(number) {
		return typeof number === 'number'

		// && number <= MAX_SAFE_INTEGER && -MAX_SAFE_INTEGER <= number
		&& Math.abs(number) <= MAX_SAFE_INTEGER

		// 在範圍外的，常常 % 1 亦為 0。
		&& 0 === number % 1
		// && Math.floor(number) === number
		;
	}

	set_method(Number, {
		/**
		 * The value of Number.MAX_SAFE_INTEGER is the largest integer value
		 * that can be represented as a Number value without losing precision,
		 * which is 9007199254740991 (2^53-1).
		 */
		MAX_SAFE_INTEGER : MAX_SAFE_INTEGER,
		/**
		 * The value of Number.MIN_SAFE_INTEGER is -9007199254740991
		 * (-(2^53-1)).
		 */
		MIN_SAFE_INTEGER : -MAX_SAFE_INTEGER,
		/**
		 * The value of Number.EPSILON is the difference between 1 and the
		 * smallest value greater than 1 that is representable as a Number
		 * value, which is approximately 2.2204460492503130808472633361816 x
		 * 10-16.
		 */
		EPSILON : dividable_minimum(0, 1)
	}, 'number');

	set_method(Number, {
		isSafeInteger : isSafeInteger,
		/**
		 * Number.toInteger() is obsolete.
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toInteger
		 * Number.toInteger was part of the draft ECMAScript 6 specification,
		 * but has been removed on August 23, 2013 in Draft Rev 17.
		 */
		// toInteger: ToInteger,
		/**
		 * Number.isInteger()<br />
		 * cf. .is_digits()
		 */
		isInteger : function isInteger(number) {
			// https://tc39.es/ecma262/#sec-number.isinteger
			return Number.isFinite(number)
			// Math.floor(Infinity) === Infinity
			&& ToInteger(number) === number;
		},
		parseFloat : parseFloat,
		parseInt : parseInt,
		/**
		 * Number.isNaN()
		 */
		isNaN : is_NaN,
		isFinite : function isFinite(value) {
			return typeof value === 'number' && !isNaN(value)
					&& value !== Infinity && value !== -Infinity;
		}
	});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// Math.*
	// https://rwaldron.github.io/proposal-math-extensions/

	// 32 bits
	var BITS = 1;
	while (1 !== 1 << BITS)
		BITS <<= 1;
	// assert: BITS === 32

	// Math.clz32()
	// TODO: 增進效率。
	function clz32(value) {
		// ToUint32() ??
		value >>>= 0;
		// console.log(value + ' = ' + value.toString(2) + ' (2)');
		// binary search: 計算數字本身具有的 bits.
		for (var min = 0, MAX = BITS, zeros;;) {
			zeros = (min + MAX) >> 1;
			// console.log(min + ' - ' + zeros + ' - ' + MAX);
			if (0 === value >> zeros)
				if (MAX === zeros)
					break;
				else
					MAX = zeros;
			else if (min === zeros)
				break;
			else
				min = zeros;
		}
		return BITS - MAX;
	}

	// 分界
	var Math_hypot_up_boundary = Math.sqrt(Number.MAX_SAFE_INTEGER) / 2 | 0,
	//
	Math_hypot_down_boundary = Math.sqrt(Number.MIN_VALUE);

	// Math.hypot(value_1 , value_2, value_3 = 0)
	// TODO: 增進效率。
	// http://en.wikipedia.org/wiki/Hypot
	function hypot(value_1, value_2, value_3) {
		var r, MAX = Math.max(value_1 = Math.abs(value_1),
		// 轉正
		value_2 = Math.abs(value_2),
		//
		value_3 = value_3 === undefined ? 0 : Math.abs(value_3));
		if (!MAX || !Number.isFinite(MAX))
			return MAX;

		if (MAX < Math_hypot_up_boundary
				// avoid underflow
				&& Math_hypot_down_boundary < Math.min(value_1, value_2,
						value_3)
				// avoid overflow, minimise rounding errors (預防本該為整數的出現小數).
				&& Number.isFinite(r = value_1 * value_1 + value_2 * value_2
						+ value_3 * value_3))
			return Math.sqrt(r);

		return MAX
				* Math.sqrt((value_1 ? (value_1 /= MAX) * value_1 : 0)
						+ (value_2 ? (value_2 /= MAX) * value_2 : 0)
						+ (value_3 ? (value_3 /= MAX) * value_3 : 0));
	}

	set_method(Math, {
		LN2 : Math.log(2),
		LN10 : Math.log(10)
	}, 'number');

	var expm1_error = 1e-5;

	set_method(Math, {
		expm1 : function expm1(value) {
			// If x is −0, the result is −0.
			if (!value)
				return value;
			// 在這範圍外不會有誤差。
			// x = 1e-5; Math.expm1(x) === Math.exp(x) - 1
			if (Math.abs(value) > expm1_error)
				return Math.exp(value) - 1;

			// 提高精準度。
			// x = 1e-6; Math.expm1(x) > Math.exp(x) - 1

			// http://www.wolframalpha.com/input/?i=e^x-1
			// Taylor series: x+x^2/2+x^3/6+x^4/24+x^5/120+O(x^6)
			var delta = value,

			index = 1, result = value;
			// 頂多跑個 2~3 次就該結束了。
			while (result + (delta *= value / ++index) !== result)
				result += delta;
			return result;
		},

		// hyperbolic functions
		// https://en.wikipedia.org/wiki/Hyperbolic_function
		sinh : function sinh(value) {
			// If x is −0, the result is −0.
			return value ? Math.abs(value) > expm1_error
			//
			? (Math.exp(value) - Math.exp(-value)) / 2
			//
			: (Math.expm1(value) - Math.expm1(-value)) / 2
			//
			: value;
		},
		cosh : function cosh(value) {
			// If x is −0, the result is −0.
			return value ? (value = Math.abs(value)) < 19
			//
			? (Math.exp(value) + Math.exp(-value)) / 2
			// value = 19;
			// Math.exp(value) + Math.exp(-value) === Math.exp(value);
			: Math.exp(value) / 2 : value;
		},
		tanh : function tanh(value) {
			if (!value)
				// If x is −0, the result is −0.
				return value;
			// value = 19;
			// Math.exp(value) + Math.exp(-value) === Math.exp(value);
			if (Math.abs(value) > 19)
				// If x is +∞, the result is +1.
				return value > 0 ? 1 : -1;
			var e = Math.exp(value), me = Math.exp(-value);
			return (Math.abs(value) < expm1_error
			// 提高精準度。
			? Math.expm1(value) - Math.expm1(-value) : e - me) / (e + me);
		},

		// https://en.wikipedia.org/wiki/Hyperbolic_function#Inverse_functions_as_logarithms
		// inverse hyperbolic function
		// https://en.wikipedia.org/wiki/Inverse_hyperbolic_function
		asinh : function asinh(value) {
			// If x is −0, the result is −0.
			if (!value)
				return value;
			// http://www.wolframalpha.com/input/?i=asinh+x
			var v = Math.abs(value);
			v = Math.log(v + Math.sqrt(v * v + 1));
			return value < 0 ? -v : v;
		},
		acosh : function acosh(value) {
			// http://www.wolframalpha.com/input/?i=acosh+x
			return Math.log(value + Math.sqrt(value * value - 1));
		},
		atanh : function atanh(value) {
			// If x is −0, the result is −0.
			return value ? Math.log((1 + value) /
			// 為 JsDoc 換行。
			(1 - value)) / 2 : value;
		},

		// Math.log2()
		log2 : function log2(value) {
			// return Math.log(value) / Math.LN2;
			return Math.log(value) * Math.LOG2E;
		},
		// Math.log10()
		log10 : function log10(value) {
			// 採用 /Math.LN10 會造成 Math.log10(1e-12) !== -12
			// return Math.log(value) / Math.LN10;
			return Math.log(value) * Math.LOG10E;
		},
		log1p : function log1p(value) {
			// If x is −0, the result is −0.
			return value ? Math.log(1 + value) : value;
		},

		hypot : hypot,
		cbrt : function cbrt(value) {
			// If x is −0, the result is −0.
			return value ? Math.pow(value, 1 / 3) : value;
		},

		clz32 : clz32,

		// Math.trunc()
		trunc : function trunc(value) {
			// value >= 0 ? Math.floor(value) : Math.ceil(value)
			return value > 0 ? Math.floor(value)
			//
			: value < 0 ? Math.ceil(value)
			//
			: value === 0 ? value : isNaN(value) ? NaN
			// null, true, false, ..
			: value | 0;
		},
		sign : function sign(value) {
			// If x is −0, the result is −0.
			return 0 < value ? 1 : value < 0 ? -1 : value;
		}
	});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// RegExp.*

	// 注意: 因為要設定額外功能，RegExp.prototype.flags 放在 data.native

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// String.*

	/**
	 * bug fix (workaround) for String.prototype.split():
	 * 
	 * @see https://github.com/es-shims/es5-shim/blob/master/es5-shim.js
	 *      http://blog.stevenlevithan.com/archives/cross-browser-split
	 *      http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
	 * 
	 * @since 2010/1/1 19:03:40 2015/1/28 17:43:0 refactoring 重構
	 * 
	 * @example <code>

	 // More examples: see /_test suite/test.js

	 * </code>
	 */
	if (
	// [ "", "" ] @ IE8, [ "", "_", "" ] @ firefox 38+
	'_'.split(/(_)/)[1] !== '_'
	// 理論上 '.'.split(/\./).length 應該是 2，但 IE 5–8 中卻為 0!
	// 用 .split('.') 倒是 OK.
	// || '.'.split(/\./).length === 0
	)
		(function() {
			var native_String_split =
			// 增加可以管控與回復的手段，預防有時需要回到原有行為。
			library_namespace.native_String_split = String.prototype.split;

			// The length property of the split method is 2.
			(String.prototype.split = function(separator, limit) {
				if (!library_namespace.is_RegExp(separator))
					return native_String_split.apply(this, arguments);

				// 不改變 separator 本身，加上 .global flag。
				separator = new RegExp(separator.source, (separator.global ? ''
						: 'g')
						// should use: RegExp_flags(separator)
						+ ('' + separator).match(/[^\/]*$/)[0]);
				var matched, result = [], last_index = 0;
				if (0 <= limit)
					// ToLength(), ToUint32()
					limit >>>= 0;
				else
					// Math.pow(2, 32) - 1
					limit = -1 >>> 0;

				while (result.length < limit && last_index < this.length) {
					matched = separator.exec(this);
					if (!matched) {
						if (false)
							library_namespace.debug('push (last) ['
									+ this.slice(last_index) + ']');
						result.push(this.slice(last_index));
						break;
					}
					if (false) {
						library_namespace.warn('index: ' + last_index + '-'
								+ matched.index + '-' + separator.lastIndex
								+ ' (' + matched[0].length + ')'
								+ ' [<span style="color:#22a;">'
								+ this.slice(0, last_index)
								+ '<span style="color:#182;">'
								+ this.slice(last_index, separator.lastIndex)
								+ '</span>' + this.slice(separator.lastIndex)
								+ '</span>]');
						library_namespace.log('matched 1 ['
								+ matched.join('<b style="color:#b94;">;</b>')
								+ ']');
					}
					if (false && library_namespace.show_value) {
						library_namespace.show_value(matched, 'matched');
						library_namespace.show_value(result.slice(), 'result');
					}
					// 當有東西時才登記。
					if (last_index < matched.index || matched[0]) {
						result.push(this.slice(last_index, matched.index));
						if (false)
							library_namespace.debug('push ['
									+ this.slice(last_index, matched.index)
									+ ']');
						if (matched.length > 1 && matched.index < this.length)
							Array.prototype.push
									.apply(result, matched.slice(1));
						// IE 中，匹配到 null string 時，lastIndex 會自動 +1。
						// /(,?)/g.exec('1') 之 lastIndex = 1，
						last_index = matched.index + matched[0].length;
						if (false)
							library_namespace.debug('last_index: ['
									+ last_index + ']');
						if (last_index === this.length) {
							if (matched[0]) {
								if (false)
									library_namespace.debug('push null (last)');
								result.push('');
							}
							break;
						}
					} else if (false)
						library_namespace.debug('Skip this.');

					if (separator.lastIndex === matched.index)
						// 避免無窮迴圈。
						separator.lastIndex++;

					if (false && library_namespace.show_value) {
						library_namespace
								.info('lastIndex: <span style="color:#905;">'
										+ separator.lastIndex
										+ '</span>, next from: [<span style="color:#62a;">'
										+ this.slice(0, separator.lastIndex)
										+ '</span>|<span style="color:#a42;">'
										+ this.slice(separator.lastIndex)
										+ '</span>]');
						library_namespace.log('matched 2 ['
								+ matched.join('<b style="color:#b94;">;</b>')
								+ ']');
						library_namespace.log('result ['
								+ result.join('<b style="color:#b94;">;</b>')
								+ ']');
					}
				}

				return result;
			})[library_namespace.env.not_native_keyword] = true;
		})();

	// String.prototype.repeat()
	// in VB: String(count, this)
	// “x” operator @ perl
	// http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
	function repeat(count) {
		var result = [],
		/**
		 * The repeat function is intentionally generic
		 * https://mail.mozilla.org/pipermail/es-discuss/2011-January/012538.html
		 * Trivia: ""+obj is not the same thing as ToString(obj). They differ if
		 * obj has a .valueOf method.
		 */
		piece = '' + this;

		if (!piece || isNaN(count) || (count = Math.floor(count)) < 1)
			return '';

		// https://mail.mozilla.org/pipermail/es-discuss/2011-January/012525.html
		// If ToUint32(`amount) is not equal to `amount, throw a RangeError.
		// isFinite()
		if (count >>> 0 !== count)
			throw new Error("invalid repeat argument");

		// http://stackoverflow.com/questions/202605/repeat-string-javascript
		// 此法較 (new Array( count + 1 ).join(this)) 稍快。
		while (true) {
			library_namespace.debug('left: ' + count, 3,
					'String.prototype.repeat');
			if (count & 1)
				result.push(piece);

			if (count >>>= 1)
				piece += piece;
			else
				break;
		}

		return result.join('');
	}

	/**
	 * <code>

	2010/6/1
	test time:

	'   fhdgjk   lh gjkl ;sfdf d  hf gj '

	.replace(/^\s+|\s+$/g, '')
	~<
	.replace(/\s+$|^\s+/g, '')
	<
	.replace(/^\s+/, '').replace(/\s+$/, '')
	~<
	.replace(/\s+$/, '').replace(/^\s+/, '')

	</code>
	 */

	/**
	 * 去除首尾空白。去除前後空白。去頭去尾。去掉 string 前後 space.
	 * 
	 * @param {String}
	 *            string input string
	 * @return {String} 轉換過的 string
	 * @since 2006/10/27 16:36
	 * @see from lib/perl/BaseF.pm (or program/database/BaseF.pm)<br />
	 * function strip() @ Prototype JavaScript framework
	 * 
	 * String.prototype.trim()
	 * http://stackoverflow.com/questions/1418050/string-strip-for-javascript
	 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim
	 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
	 * 
	 * @_memberOf _module_
	 */
	function trim() {
		// The repeat function is intentionally generic
		var string = String(this)

		// https://blog.stevenlevithan.com/archives/faster-trim-javascript
		.replace(/^\s\s*/, '');
		var PATTERN_SPACE = /\s/, index = string.length;
		while (PATTERN_SPACE.test(string.charAt(--index)))
			;
		return string.slice(0, index + 1);

		// .replace(/\s+$|^\s+/g, '');
		// .replace(/^\s+|\s+$/g, '');

		// The definition of white space is the union of WhiteSpace and
		// LineTerminator.
		// .replace(/[\s\n]+$|^[\s\n]+/g, '');
	}

	// String.prototype.trimStart(), String.prototype.trimLeft()
	var trimStart = String.prototype.trimLeft || function trimStart() {
		return String(this).replace(/^[\s\n]+/, '');
	};

	// String.prototype.trimEnd(), String.prototype.trimRight()
	var trimEnd = String.prototype.trimRight || function trimEnd() {
		return String(this).replace(/[\s\n]+$/, '');
	};

	// ---------------------------------------------------------------------------
	// http://tc39.github.io/proposal-string-pad-start-end/
	// https://github.com/tc39/proposal-string-pad-start-end
	function pad_String(/* targetLength */maxLength, /* padString */
	fillString) {
		if (!(this.length < maxLength)) {
			return '';
		}
		if (fillString === undefined) {
			fillString = ' ';
		} else if (!(fillString = String(fillString))) {
			return '';
		}

		maxLength -= this.length;

		if (fillString.length < maxLength) {
			fillString = fillString.repeat(Math.ceil(maxLength
					/ fillString.length));
		}

		return fillString.length === maxLength ? fillString
		// assert: fillString.length > maxLength
		: fillString.slice(0, maxLength);
	}

	// ---------------------------------------------------------------------------

	// String.prototype.startsWith()
	function startsWith(searchString, position) {
		if (library_namespace.is_RegExp(searchString)) {
			throw new Error(
					"Invalid type: searchString can't be a Regular Expression");
		}
		searchString = String(searchString);
		if (!position || !(position |= 0) || position < 0)
			return this.indexOf(searchString, 0) === 0;

		return searchString === this.substr(position, searchString.length);
	}

	// String.prototype.endsWith()
	function endsWith(searchString, endPosition) {
		if (library_namespace.is_RegExp(searchString)) {
			throw new Error(
					"Invalid type: searchString can't be a Regular Expression");
		}
		searchString = String(searchString);
		var is_tail = endPosition === undefined
				|| (endPosition |= 0) === this.length,
		//
		position = (is_tail ? this.length : endPosition) - searchString.length;
		return position >= 0
				&& (is_tail ? this.indexOf(searchString, position) === position
						: searchString === this.substr(position,
								searchString.length));
	}

	// String.prototype.codePointAt(position)
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
	function codePointAt(index) {
		var _1 = this.charCodeAt(index), _2;
		if (index + 1 < this.length
		// check high surrogate
		&& _1 >= 0xD800 && _1 <= 0xDBFF
		// check low surrogate
		&& (_2 = this.charCodeAt(index + 1)) >= 0xDC00 && _2 <= 0xDFFF) {
			return (_1 - 0xD800) * 0x400 + _2 - 0xDC00 + 0x10000;
		}
		return _1;
	}

	// String.fromCodePoint(...codePoints)
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
	function fromCodePoint() {
		var result = '';
		for (var index = 0, length = arguments.length; index < length; index++) {
			var char_code = +arguments[index];
			if (char_code < 0x10000) {
				result += String.fromCharCode(char_code);
			} else {
				char_code -= 0x10000;
				result += String.fromCharCode((char_code >> 10) + 0xD800,
						(char_code % 0x400) + 0xDC00);
			}
		}
		return result;
	}

	// ------------------------------------------

	// @see CeL.data.native.RegExp_flags()
	var has_RegExp_flags = /./g.flags === 'g';

	// Generator function
	var has_Generator;
	(function() {
		var g, i, l;
		try {
			eval('g = function*() { yield 2;yield 1; }; l = []; for(i of g()) l.push(i); l = l.join();');
			has_Generator = l === '2,1';
		} catch (e) {
		}
	})();

	/**
	 * return a new RegExp instance with global flag
	 */
	function new_global_RegExp(regexp) {
		return library_namespace.is_RegExp(regexp)
		// do NOT chancg regexp.lastIndex
		? new RegExp(regexp.source,
				has_RegExp_flags ? regexp.global ? regexp.flags : regexp.flags
						+ 'g' : regexp.ignoreCase ? 'ig' : 'g')
		//
		: new RegExp(regexp, 'g');
	}
	_.new_global_RegExp = new_global_RegExp;

	// String.prototype.matchAll()
	// http://2ality.com/2018/02/string-prototype-matchall.html
	// https://tc39.github.io/proposal-string-matchall/
	// let all_matched = [...string.matchAll(regExp)].map(mapfn);
	// let all_matched = Array.from(string.matchAll(regExp), mapfn);
	var matchAll;
	if (has_Generator) {
		// e.g., node.ja 11.9.0, Chrome/61.0.3163.100 Electron/2.0.9
		// TODO: returns an RegExpStringIterator
		// String.prototype.matchAll 調用 RegExp.prototype[Symbol.matchAll]
		eval('matchAll = function* matchAll(regexp) { const is_global = !library_namespace.is_RegExp(regexp) || regexp.global; regexp = new_global_RegExp(regexp); let matched; if (is_global) { while (matched = regexp.exec(this)) { yield matched; } } else { throw new TypeError("String.prototype.matchAll called with a non-global RegExp argument"); if (matched = regexp.exec(this)) { yield matched; } } }');
	}

	// ------------------------------------------

	set_method(String.prototype, {
		repeat : repeat,
		trim : trim,
		trimStart : trimStart,
		trimEnd : trimEnd,
		// String.prototype.padStart()
		padStart : function padStart(maxLength, fillString) {
			return pad_String.call(this, maxLength, fillString) + this;
		},
		// String.prototype.padEnd()
		padEnd : function padEnd(maxLength, fillString) {
			return this + pad_String.call(this, maxLength, fillString);
		},
		// String.prototype.includes()
		includes : function includes(searchString, position) {
			return this.indexOf(searchString, position) !== NOT_FOUND;
		},
		startsWith : startsWith,
		endsWith : endsWith,

		matchAll : matchAll || function matchAll_array(regexp) {
			/* const */var is_global = !library_namespace.is_RegExp(regexp)
			//
			|| regexp.global;

			/* const */regexp = new_global_RegExp(regexp);

			var matched, list = [];
			if (is_global) {
				while (matched = regexp.exec(this)) {
					// yield matched;
					list.push(matched);
				}
			} else if (matched = regexp.exec(this)) {
				// e.g., 'a1b2A3B4a5cc'.matchAll(/(a)(.)/ig)
				list.push(matched);
			}

			return list;
		},

		at : get_item_at,
		codePointAt : codePointAt
	});

	set_method(String, {
		fromCodePoint : fromCodePoint
	});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// Date.*

	function pad_00(integer) {
		return integer < 10 ? '0' + integer : integer;
	}

	// Date.prototype.toISOString() for IE8
	// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
	function toISOString() {
		var year = this.getUTCFullYear(), m = year < 0;
		if (m)
			year = -year;
		if (year < 1000)
			year = (year < 100 ? year < 10 ? '000' : '00' : '0') + year;
		if (m)
			year = '-' + year;

		m = this.getUTCMilliseconds();
		if (m < 100)
			m = (m < 10 ? '00' : '0') + m;

		return year + '-' + pad_00(this.getUTCMonth() + 1) + '-'
				+ pad_00(this.getUTCDate()) + 'T' + pad_00(this.getUTCHours())
				+ ':' + pad_00(this.getUTCMinutes()) + ':'
				+ pad_00(this.getUTCSeconds()) + '.' + m + 'Z';
	}

	set_method(Date, {
		// Date.UTC()
		UTC : function UTC(year, month, day, hour, minute, second,
		//
		millisecond) {
			var date = new Date(year || 0, month || 0, isNaN(day) ? 1 : day,
					hour || 0, minute || 0, second || 0, millisecond || 0);
			return date.getTime() - 60 * 1000 * date.getTimezoneOffset();
		},
		// Date.now()
		now : function now() {
			return new Date().getTime();
		},
		// Date.parse()
		parse : function parse(string) {
			return new Date(string).getTime();
		}
	});

	set_method(Date.prototype, {
		// Date.prototype.toJSON()
		toJSON : function toJSON() {
			return this.toISOString();
		},
		// Date.prototype.toISOString()
		toISOString : toISOString
	});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// JSON.*

	/**
	 * 2008/12/21 18:53:42<br />
	 * value to json<br />
	 * JavaScript Object Notation ECMA-262 3rd Edition
	 * 
	 * http://stackoverflow.com/questions/1500745/how-to-pass-parameters-in-eval-in-an-object-form
	 * json={name:'~',values:..,description:'~'}<br />
	 * window[json.name].apply(null, json.values)
	 * 
	 * usage:<br />
	 * json(value)
	 * 
	 * parse:<code>
	// 字串的前後記得要加上刮號 ()，這是用來告知 Javascript Interpreter 這是個物件描述，不是要執行的 statement。
	data=eval('('+data+')');
	eval('data='+data);
	</code>
	 * 
	 * TODO:
	 * 
	 * useObj<br />
	 * 加入function object成員，.prototype可用with()。加入函數相依性(dependency)
	 * 
	 * array用name:<code>
	(function(){
		var o;
		o = [...];
		var i, v = {...};
		for(i in v)
			o[i] = v[i];
		return o;
	})()
	</code>
	 * 
	 * recursion 循環參照<code>
	(function(){
		var o;
		o = {a:[]};
		o['b'] = [o['a']],
		o['a'].push([o['b']]);
		return o;
	})()
	</code>
	 * 
	 * BUG:<br />
	 * function 之名稱被清除掉了，這可能會產生問題！<code>
	(function(){
		var f=function(){...};
		f.a=...;
		f.b=...;
		f.prototype={ a:..., b:... }
		return f;
	})()
	</code>
	 * 
	 * test recursion 循環參照:<br />
	 * function 之名稱被清除掉了，這可能會產生問題！<code>
	(function(){
		var o=[], _1=[o];
		o.push(_1);
		return o;
	})();

	var a=[], b;
	a.push(b=[a]);
	json(a);
	</code>
	 */

	// json[generateCode.dLK]='qNum,dQuote';
	/**
	 * 須判別來源是否為 String or Number!
	 * 
	 * @deprecated 改用 window.JSON, jQuery.parseJSON.
	 * @param val
	 * @param name
	 * @param type
	 *            type==2: inside object, treat undefined as ''
	 * @returns
	 */
	function json(val, name, type) {
		var _f = json, expA = [], expC = [], vType = typeof val, addE = function(
				o, l, n) {
			if (l) {
				o = _f(o, 0, 2);
				n = typeof n == 'undefined' || n === '' ? ''
						: (/^(\d{1,8})?(\.\d{1,8})?$/.test(n)
								|| /^[a-z_][a-z_\d]{0,30}$/i.test(n) ? n
								: dQuote(n))
								+ ':' + _f.separator;
				expA.push(n, o[1]);

				// expC.push(_f.indentString+n+o[0].join(_f.line_separator+_f.indentString)+',');
				o = o[0];
				o[0] = n + (typeof o[0] == 'undefined' ? '' : o[0]);
				o[o.length - 1] += ',';
				for (var i = 0; i < o.length; i++)
					o[i] = _f.indentString
							+ (typeof o[i] == 'undefined' ? '' : o[i]);
				expC = expC.concat(o);
			} else
				expA.push(o), expC.push(o);
		}
		// 去掉最後一組的 ',' 並作結。
		, closeB = function(c) {
			var v = expC.at(-1);
			if (v.charAt(v.length - 1) == ',')
				expC[expC.length - 1] = v.slice(0, v.length - 1);
			addE(c);
		};

		switch (vType) {
		case 'number':
			// http://msdn2.microsoft.com/zh-tw/library/y382995a(VS.80).aspx
			// isFinite(value) ? String(value)
			var k = 0, m = 'MAX_VALUE,MIN_VALUE,NEGATIVE_INFINITY,POSITIVE_INFINITY,NaN'
					.split(','), t = 0;
			if (val === NaN || val === Infinity || val === -Infinity)
				t = '' + val;
			else
				for (; k < m.length; k++)
					if (val === Number[m[k]]) {
						t = 'Number.' + m[k];
						break;
					}
			if (!t) {
				// http://msdn2.microsoft.com/zh-tw/library/shydc6ax(VS.80).aspx
				for (k = 0, m = 'E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2'
						.split(','); k < m.length; k++)
					if (val === Math[m[k]]) {
						t = 'Math.' + m[k];
						break;
					}
				if (!t)
					if (k = ('' + val).match(/^(-?\d*[1-9])(0{3,})$/))
						t = k[1] + 'e' + k[2].length;
					else {

						// 有理數判別
						k = qNum(val);

						// 小數不以分數顯示. m==1:非分數
						m = k[1];
						while (m % 2 == 0)
							m /= 2;
						while (m % 5 == 0)
							m /= 5;

						t = k[2] == 0 && m != 1 ? k[0] + '/' + k[1] :
						// TODO: 加速(?)
						(t = Math.floor(val)) == val
								&& ('' + t).length > (t = '0x'
										+ val.toString(16)).length ? t : val;
					}

			}
			addE(t);
			break;
		case 'null':
			addE('' + val);
			break;
		case 'boolean':
			addE(val);
			break;
		case 'string':
			addE(dQuote(val));
			break;
		case 'undefined':
			addE(type == 2 ? '' : 'undefined');
			break;

		case 'function':
			// 加入function
			// object成員，.prototype可用with()。加入函數相依性(dependency)
			var toS, f;
			// 這在多執行緒有機會出問題！
			if (typeof val.toString != 'undefined') {
				toS = val.toString;
				delete val.toString;
			}
			f = '' + val;
			if (typeof toS != 'undefined')
				val.toString = toS;

			// function 才會產生 \r\n 問題，所以先處理掉
			f = f.replace(/\r?\n/g, _f.line_separator);
			var r = /^function\s+([^(\s]+)/, m = f.match(r), t;
			if (m)
				m = m[1], addE('//	function [' + m + ']'), t = f.replace(r,
						'function' + _f.separator);
			if (m && t.indexOf(m) !== NOT_FOUND)
				library_namespace.error('function [' + m
						+ '] 之名稱被清除掉了，這可能會產生問題！');
			addE(t || f);
			// UNDO
			break;

		case 'object':
			try {
				if (val === null) {
					addE('' + val);
					break;
				}
				var c = val.constructor;
				if (c === RegExp) {
					addE(val);
					break;
				}
				// typeof val.getTime=='function'
				if (c == Date || vType == 'date') {
					// 與 now 相隔過短(<1e7, 約3h)視為 now。
					// 但若是 new Date()+3 之類的會出現誤差！
					addE('new Date'
					// date 被當作 object
					+ ((val - new Date) > 1e7 ? '(' + val.getTime() + ')' : ''));
					break;
				}
				if (('' + c).indexOf('Error') !== NOT_FOUND) {
					addE('new Error'
							+ (val.number || val.description ? '('
									+ (val.number || '')
									+ (val.description ? (val.number ? ',' : '')
											+ dQuote(val.description)
											: '') + ')'
									: ''));
					break;
				}

				var useObj = 0;
				if (c == Array) {
					var i, l = 0;
					if (!_f.forceArray)
						for (i in val)
							if (isNaN(i)) {
								useObj = 1;
								break;
							} else
								l++;

					if (_f.forceArray || !useObj && l > val.length * .8) {
						addE('[');
						for (i = 0; i < val.length; i++)
							addE(val[i], 1);
						closeB(']');
						break;
					} else
						useObj = 1;
				}

				if (useObj || c == Object) {// instanceof
					addE('{');
					for ( var i in val)
						addE(val[i], 1, i);
					closeB('}');
					break;
				}
				addE(dQuote(val));
				break;
			} catch (e) {
				if (28 == (e.number & 0xFFFF))
					alert('json: Too much recursion?\n循環參照？');
				return;
			}

		case 'unknown':
			// sometimes we have this kind of type
		default:
			alert('Unknown type: [' + vType + '] (constructor: '
					+ val.constructor + '), please contract me!\n' + val);
			break;
		// alert(vType);
		}
		return type ? [ expC, expA ] : expC.join(_f.line_separator);
	}
	// dependency List Key
	json.dL = 'dependencyList';
	json.forceArray = 1;

	json.indentString = '	';
	json.line_separator = '\n';
	json.separator = ' ';

	// --------------------------------------------
	// JSON polyfill
	// 2021: library_namespace.parse_JSON() @ _structure/module.js

	function JSON_parse(text, reviver) {

		function parse_next_value() {
			/**
			 * <code>
			[...
			{...
			"...
			00000
			null
			<code>
			 */
			var matched = text.match(/^\s*([\[{"]|null|\d+)/);
			if (!matched) {
				// SyntaxError
				return;
			}

			text = text.slice(/* matched.index(=0) + */matched[0].length);

			if (matched[1] === 'null' || /^\d/.test(matched[1])) {
				return matched[1] === 'null' ? null : +matched[1];
			}

			// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/JSON
			if (matched[1] === '"') {
				matched = text.match(/^(?:\\"|[^"])*"/);
				text = text.slice(matched[0].length);

				return matched[0].slice(0, -1)
				//
				.replace(/\\u([0-9a-f]{4})/ig, function(code) {
					return String.fromCharCode(parseInt(code, 16));
				}).replace(/\\([\s\S]|$)/g, function(escape_char) {
					// /\\(["\\\/\b\f\t\r\n])/g
					var escaped = {
						'"' : '"',
						'\\' : '\\',
						b : '\b',
						f : '\f',
						t : '\t',
						r : '\r',
						n : '\n'
					}[escape_char];
					if (!escaped) {
						throw new SyntaxError('Unexpected token \\'
						// Invalid JSON
						+ escape_char + ' in JSON');
					}
					return escaped;
				});
			}

			if (matched[1] === '[') {
				var array = [];
				matched = text.match(/^\s*\]/);
				if (matched) {
					// "{}"
					text = text.slice(matched[0].length);
					return array;
				}
				while (true) {
					var next_value = parse_next_value();
					if (next_value === undefined)
						return;
					array.push(next_value);
					matched = text.match(/^\s*([,\]])/);
					if (!matched) {
						// SyntaxError
						return;
					}
					text = text.slice(matched[0].length);
					if (matched[1] === ']') {
						break;
					}
				}
				return array;
			}

			// assert: matched[1] === '{'
			var object = {};
			matched = text.match(/^\s*}/);
			if (matched) {
				// "{}"
				text = text.slice(matched[0].length);
				return object;
			}
			while (true) {
				var next_key = parse_next_value();
				if (typeof next_key !== 'string') {
					throw new SyntaxError('Unexpected token in JSON: '
							+ next_key + '; ' + text);
				}
				matched = text.match(/^\s*:/);
				if (!matched) {
					// SyntaxError
					return;
				}
				text = text.slice(matched[0].length);
				var next_value = parse_next_value();
				if (next_value === undefined)
					return;
				matched = text.match(/^\s*([,}])/);
				if (!matched) {
					// SyntaxError
					return;
				}
				object[next_key] = next_value;
				text = text.slice(matched[0].length);
				if (matched[1] === '}') {
					break;
				}
			}
			return object;
		}

		text = String(text);

		var result = parse_next_value();
		if (text.trim())
			throw new SyntaxError('Unexpected token in JSON: ' + text);

		return result;
	}

	function JSON_stringify(value, replacer, space) {
		var object_Set = new Set;

		if (!space) {
			space = '';
		} else if (typeof space === 'number') {
			if (space > 10)
				space = 10;
			else if (space < 1)
				space = 0;
			space = ' '.repeat(space);
		} else {
			space = String(space).slice(0, 10);
		}

		function stringify(object, /* 累積的空格 */_spaces, key, obj) {
			if (object && typeof object.toJSON === 'function') {
				// e.g., {Date}
				object = object.toJSON(key);
			}

			if (replacer)
				object = replacer.call(obj, key, value);

			if (typeof object === 'string')
				return '"' + object.replace(/["\\\/\b\f\t\r\n]/g, '\\"') + '"';

			if (!object || typeof object !== 'object') {
				if (object === undefined) {
					if (!key)
						return;
					object = null;
				}
				object = String(object);
				return object;
			}

			var next_spaces = _spaces + space;

			var output = [];
			if (Array.isArray(object)) {
				for (var index = 0; index < object.length; index++) {
					var value = object[index];
					if (object_Set.has(value)) {
						throw new Error(
						// Too much recursion?\n循環參照？
						'Converting circular structure to JSON: [' + index
								+ ']');
					}
					if (value === undefined)
						value = null;
					output.push('\n' + next_spaces
							+ stringify(value, next_spaces, key, object));
				}
				return '[' + output.join(',') + (space ? '\n' + _spaces : '')
						+ ']';
			}

			var keys = Object.keys(object);
			for (var index = 0; index < keys.length; index++) {
				var key = keys[index], value = object[key];
				if (object_Set.has(value)) {
					throw new Error('Converting circular structure to JSON: .'
							+ key);
				}
				if (value === undefined)
					continue;
				output.push('\n' + next_spaces + stringify(key, next_spaces)
						+ (space ? ': ' : ':')
						+ stringify(value, next_spaces, key, object));
			}
			return '{' + output.join(',') + (space ? '\n' + _spaces : '') + '}';
		}

		return stringify(value, '');
	}

	if (!globalThis.JSON) {
		globalThis.JSON = {
			parse : JSON_parse,
			stringify : JSON_stringify
		};
	}

	// --------------------------------------------
	// for old node.js

	function Buffer_from(source, encoding) {
		return new Buffer(source, encoding);
	}

	if (library_namespace.platform.nodejs) {
		if (!Buffer.from) {
			// For Node.js v5.11.1 and below
			// e.g., node.js v0.10.25
			Buffer.from = Buffer_from
		}
		if (!Buffer.allocUnsafe) {
			Buffer.allocUnsafe = Buffer_from;
		}
		if (!Buffer.prototype.forEach) {
			Buffer.prototype.forEach = Array.prototype.forEach;
		}
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * Promise polyfill
	 * 
	 * <code>

	https://babeljs.io/repl

	Promise test cases:

	promise = new Promise(function(r,R){r()})
		r(value)	fulfilled
			(p=new Promise(function(r,R){r( 2 )}));console.log(p)
				Promise {<resolved>: 2}
		r(promise)	promise→p
			(p=new Promise(function(r,R){r( Promise.resolve(2) )}));console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 2}
			(p=new Promise(function(r,R){r( Promise.reject(2) )})).then(null,function(){});console.log(p)
				p: Promise {<pending>}
				→ Promise {<rejected>: 2}
			(q=(p=new Promise(function(r,R){r( Promise.reject(2) )})).then(3,4)).then(5,function(v){console.log(v)});console.log(p);console.log(q)
				2
				p: Promise {<pending>}
				→ Promise {<rejected>: 2}
			p=new Promise(function(r,R){r(Promise.resolve(1));throw 2});console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 1}
		r(thenable)	thenable→p
			(p=new Promise(function(r,R){r({then:function(r,R){r(4)}})}));console.log(p)
				Promise {<pending>}
				→ Promise {<resolved>: 4}
			(p=new Promise(function(r,R){r({then:function(r,R){console.log(this);R(4)}})})).then(null,function(){});
				this: {then: ƒ}
				p → Promise {<rejected>: 4}
		R(value)	rejected
		R(promise)
			(p=new Promise(function(r,R){R( Promise.resolve(2) )})).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
		R(thenable)

	promise.then(r_,R_)
	promise: pending, fulfilled, rejected
		r_ return value	value→return
			(p=new Promise(function(r){throw 2})).then(null,function(){});console.log(p)
				Promise {<rejected>: 2}
		r_ return promise	p→promise→return
			p=Promise.resolve(2).then(function(){return Promise.resolve(4)});console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 4}
			(p=Promise.reject(3)).then(null,function(){});(q=Promise.resolve(2).then(function(){return p})).then(null,function(){});console.log(p);console.log(q)
				Promise {<rejected>: 3} ; Promise {<pending>}
				→ Promise {<rejected>: 3} ; Promise {<rejected>: 3}
			p=Promise.resolve(2).then(function(){return new Promise(function(r){setTimeout(function(){r(4)},2);})});console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 4}
			p=Promise.resolve(2).then(function(){return new Promise(function(){})});console.log(p)
				Promise {<pending>}
			Promise.resolve().then(function(){return Promise.reject(3)}).then(null,function(){});console.log(p)
				Promise {<pending>}
			p=Promise.resolve().then(function(){return new Promise(function(r){setTimeout(function(){console.log(4);r(4)},500)}).then(function(v){console.log(++v);return v})}).then(function(v){console.log(++v);return v},function(){});console.log(p)
				p: Promise {<pending>}
				4
				5
				6
				p → Promise {<resolved>: 6}
		r_ return thenable	p→thenable→returned
			p=Promise.resolve(2).then(function(){return {then:function(r,R){r(4)}}});console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 4}
			(p=Promise.resolve(2).then(function(){return {then:function(r,R){R(4)}}})).then(null,function(){});
				chrome: Promise {<resolved>: undefined}	or	firefox: Promise { <state>: "pending" }
				p: Promise {<pending>}
				→ Promise {<rejected>: 4}
			p=Promise.resolve(2).then(function(){return {then:function(r,R){setTimeout(function(){r(4)},2);}}});console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 4}
		R_ return value
			(p=new Promise(function(r,R){R(2)})).then(null,function(){});console.log(p)
				Promise {<rejected>: 2}
		R_ return promise
			(p=new Promise(function(r,R){R(Promise.resolve(2))})).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
			(q=Promise.reject(2)).then(null,function(){});(p=new Promise(function(r,R){R(q)})).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
		R_ return thenable
			(p=new Promise(function(r,R){R({then:function(r,R){R(2)}})})).then(null,function(){});console.log(p)
				Promise {<rejected>: {…}}


	Promise.resolve(v)
		v: value: tested above
			p=Promise.resolve('v');console.log(p)
			p=Promise.resolve(2).then(function(v){console.log(v);return 3}).then(function(v){console.log(v);return 3});console.log(p)
				Promise {<pending>}
				2
				3
		v: promise
			(q=Promise.resolve(2)).then(null,function(){});p=Promise.resolve(q);console.log(p)
				Promise {<resolved>: 2}
			(q=Promise.reject(2)).then(null,function(){});p=Promise.resolve(q);console.log(p)
				Promise {<rejected>: 2}
		v: thenable
			q={then:function(r,R){r(2)}};p=Promise.resolve(q);console.log(p)
				p: Promise {<pending>}
				→ Promise {<resolved>: 2}
			q={then:function(r,R){R(2)}};(p=Promise.resolve(q)).then(null,function(){});console.log(p)
				p: Promise {<pending>}
				→ Promise {<rejected>: 2}
			q={b:2,then:function(r){console.log(this.b);r(2)}};p=Promise.resolve(q);console.log(p)
			q={b:2,then:function(r){console.log(this.b);throw 2}};(p=Promise.resolve(q)).then(null,function(){});console.log(p)


	Promise.reject(v)
		v: value: tested above
			(p=Promise.reject('v')).then(null,function(){});console.log(p)
			p=Promise.resolve(1);console.log(p);(q=Promise.reject(p)).then(null,function(){});console.log(p!==q)
				Promise {<resolved>: 1}
				console.log(p!==q): true
			(p=Promise.reject(1)).then(null,function(){});(q=Promise.reject(p)).then(null,function(){});console.log(p!==q)
				console.log(p!==q): true
		v: promise
			(p=Promise.reject(Promise.resolve(2))).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
			(q=Promise.resolve(2)).then(null,function(){});(p=Promise.reject(q)).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
			(q=Promise.reject(2)).then(null,function(){});(p=Promise.reject(q)).then(null,function(){});console.log(p)
				Promise {<rejected>: Promise}
		v: thenable
			q={then:function(r,R){R(2)}};(p=Promise.reject(q)).then(null,function(){});console.log(p)
				Promise {<rejected>: {…}}


	Promise.all ( iterable )
		iterable: value:
			(p=Promise.all([])).then(function(L){console.log(Array.isArray(L)+','+L.length)});console.log(p)
				p: Promise {<resolved>: Array(0)}
				true,0
			Promise.all(1).then(function(L){console.log('_'+L)},function(x){console.log('!'+x.message)})
				x: TypeError: number 1 is not iterable (cannot read property Symbol(Symbol.iterator))
		iterable: promise, thenable:
			Promise.all([2,1,Promise.reject(8)]).then(function(){},function(R){console.log(R)})
				8
			l=[3,'a',new Promise(function(r,R){setTimeout(function(){r(4)},8)}),9,{then:3},{then:function(r,R){return r(7)}},Promise.resolve(3),[2,3],null,undefined];Promise.all(l).then(function(L){console.log(L);})
				Promise {<pending>}
				(10) [3, "a", 4, 9, {…}, 7, 3, Array(2), null, undefined]


	Promise.race ( iterable )
			Promise.race([new Promise(function(r,R){setTimeout(function(){console.log(500);r(3)},500)}),new Promise(function(r,R){setTimeout(function(){console.log(5);r(1)},5)}),Promise.resolve(6),new Promise(function(r,R){setTimeout(function(){console.log(400);r(7)},400)})]).then(function(r){console.log('** '+r)})
				→ 6

	promise.finally(onFinally)	Promise_finally(onFinally)
		onFinally: value
			p=Promise.resolve(2)['finally'](3).then(function(v){console.log(v);return 4});console.log(p)
				2
				p: Promise {<pending>}
				→ Promise {<resolved>: 4}
		onFinally: function return value
			p=Promise.resolve(2).then(function(v){console.log(v);return 3})['finally'](function(v){console.log('_'+v);return 4}).then(function(v){console.log(v);return 5});console.log(p)
				p: Promise {<pending>}
				2
				_undefined
				3
				p → Promise {<resolved>: 5}
			p=Promise.reject(2).then(function(v){console.log(v);return 3})['finally'](function(v){console.log('_'+v);return 4}).then(function(v){console.log(v);return 5}).then(null,function(v){console.log(v);return 6});console.log(p)
				p: Promise {<pending>}
				_undefined
				2
				p → Promise {<resolved>: 6}
		onFinally: function return promise, thenable:
			p=Promise.resolve(2).then(function(v){console.log(v);return 3})['finally'](function(v){console.log('_'+v);return Promise.resolve(3)}).then(function(v){console.log(v);return 5});console.log(p)
				p: Promise {<pending>}
				2
				_undefined
				3
				p → Promise {<resolved>: 5}

	// --------------------------------------------------------------------------------------

	var v='';(p=new Promise(function(r,R){r(1);throw '0'}))
	.then(function(x){v+=x;console.log(v);return 2})
	.then(function(x){v+=x;return 3})
	.then(function(x){v+=x;throw '4'},function(y){v+=y;return 0})
	.then(function(x){v+=x;throw 0},function(y){v+=y;return 5})
	.then(function(x){v+=x;return 6})
	.then(function(x){v+=x;console.log(v==="_123456")});v='_';console.log(p)
	console.log(v)

	var v='';(p=new Promise(function(r,R){r(Promise.resolve(1));r(0);throw '2'}))
	.then(function(x){v+=x;console.log(v);return 2})
	.then(function(x){v+=x;return 3})
	.then(function(x){v+=x;throw '4'},function(y){v+=y;return 0})
	.then(function(x){v+=x;throw 0},function(y){v+=y;return 5})
	.then(function(x){v+=x;return 6})
	.then(function(x){v+=x;console.log(v==="_123456")});v='_';console.log(p)
	console.log(v)


	(q=Promise.reject(2).then(function(){})).then(function(){},function(y){})
	// console.log(q): Promise {<rejected>: 2}


	var v='';(p=new Promise(function(r,R){R(1);r(0)}))
	.then(function(x){v+=x;console.log('!!');return 0})
	.then(function(x){v+=x;return 0})
	.then(function(x){v+=x;throw '0'},function(y){console.log('y='+y);v+=y;return 2})
	.then(function(x){v+=x;throw '3'},function(y){v+=y;return 0})
	.then(function(x){v+=x;return 0})
	.then(function(x){v+=x;},function(x){v+=x;console.log(v);console.log(v==="_123")});v='_';


	var q=null,r='';Promise.resolve()
	.then(function(x){r+=x;return 1})
	.then(function(x){r+=x;q=new Promise(function(r,R){setTimeout(r,8)});return q})
	.then(function(x){r+=x;return 2})
	.then(function(x){r+=x;
		q
		.then(function(x){r+=x;return 3})
		.then(function(x){r+=x;return 5})
		.then(function(x){r+=x;return 7})
		.then(function(x){r+=x;});
		return '_'})
	.then(function(x){r+=x;return 4})
	.then(function(x){r+=x;return 6})
	.then(function(x){r+=x;return 8})
	.then(function(x){r+=x;console.log(r==="undefined1undefined2undefined_345678")})


	var q=null,r='';Promise.resolve()
	.then(function(x){r+='_';return 1})
	.then(function(x){r+=x;q=new Promise(function(r,R){setTimeout(function(){R(2)},8)});q.then(function(x){r+=x;return 0},function(y){r+=2&&y;});return q})
	.then(function(x){r+=x;return 0})
	.then(function(x){r+=x;
		q
		.then(function(x){r+=x;return 0},function(y){r+=y;return 0})
		.then(function(x){r+=x;return 0})
		.then(function(x){r+=x;return 0})
		.then(function(x){r+=x;});
		return 0})
	.then(function(x){r+=x;return 0},function(y){r+=3;return 4})
	.then(function(x){r+=x;return 5})
	.then(function(x){r+=x;return 6})
	.then(function(x){r+=x;console.log(r==="_123456")})


	var q=null,r='';Promise.resolve()
	.then(function(x){r+='_';return 1})
	.then(function(x){r+=x;q=new Promise(function(r,R){setTimeout(function(){R(2)},8)});q.then(function(x){r+=x;return 0},function(y){r+=2&&y;});return q})
	.then(function(x){r+=x;return 0},function(y){r+=3;return 4})
	//.then(function(x){r+='^^^';return 4})
	.then(function(x){r+=4&&x;
		console.log(q)
		q // Promise {<rejected>: 2}
		.then(function(x){r+=x;return 0},function(y){r+=5;return 7})
		.then(function(x){r+=x;return 9})
		.then(function(x){r+=x;return 'b'})
		.then(function(x){r+=x;});
		return 6})
	.then(function(x){r+=6&&x;return 8},function(y){r+=y;return 0})
	.then(function(x){r+=x;return 'a'})
	.then(function(x){r+=x;return 'c'})
	.then(function(x){r+=x;console.log(r==="_123456789abc")})




	r='';(q=new Promise(function(r,R){setTimeout(function(){R(1)},5000)}))
	.then(function(x){r+=x;return 0},function(y){r+=1&&y;return 2})
	.then(function(x){r+=2&&x;return 3})
	.then(function(x){r+=3&&x;console.log(r==='123')})

	r='';(q=new Promise(function(r,R){setTimeout(function(){R(1)},50)}))
	.then(function(x){r+=x;return 0},function(y){r+=1&&y;return 2})
	.then(function(x){r+=2&&x;return 3})
	//console.log(r): '12'
	//
	// another:
	q.then(function(x){r+=3&&x;console.log(r==='123')})
	// Uncaught (in promise) 1
	// r==='12'



	q=new Promise(function(r,R){setTimeout(R,8)})
	s=q.then(function(x){},function(y){})
	console.log([s!==q,s,q])
	// s: resolved, q: rejected. then方法執行完會另外產生一個新的 Promise 物件。
	// https://eyesofkids.gitbooks.io/javascript-start-es6-promise/content/contents/then_adv.html



	test of Promise.prototype.then(): this[KEY_STATE] === PromiseState_pending

	p=new Promise(function(r,R){setTimeout(function(){r(9)},8)});
	p.then(function(a){r+=1});
	p.then(function(a){r+=2});
	p.then(function(a){r+=3});
	console.log(p);r='';
	//
	console.log(r==='123');

	p=new Promise(function(r,R){setTimeout(function(){R(9)},8)});
	p.then(null,function(a){r+=1});
	p.then(null,function(a){r+=2});
	p.then(null,function(a){r+=3});
	console.log(p);r='';
	//
	console.log(r==='123');


	p=new Promise(function(r,R){setTimeout(function(){r(9)},8)});p.then(123).then(function(x){console.log(x===9);});


	</code>
	 * 
	 * @since 2018/9/16 7:37:10
	 */

	// Promise 標準規格書/定義
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promise-objects
	// https://promisesaplus.com/
	// https://github.com/promises-aplus/promises-spec
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
	// http://azu.github.io/promises-book/
	// 實作 Promise polyfill
	// https://github.com/stefanpenner/es6-promise/tree/master/lib/es6-promise
	// https://github.com/taylorhakes/promise-polyfill/blob/master/dist/polyfill.js
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-enqueuejob
	var EnqueueJob = library_namespace.platform.nodejs && process.nextTick
	// https://github.com/stefanpenner/es6-promise/blob/master/lib/es6-promise/asap.js
	// node version 0.10.x displays a deprecation warning when nextTick is used
	// recursively
	// see https://github.com/cujojs/when/issues/410 for details
	? function(job) {
		return process.nextTick(job);
	}
	// https://github.com/cssmagic/ChangeLog/issues/3
	// setImmediate() 會調度宏微任務而不是微任務，可能導致不一樣的調度結果。
	: typeof setImmediate === 'function' ? setImmediate : function(job) {
		setTimeout(job, 1);
	},
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-properties-of-promise-instances
	// const
	PromiseState_pending = 0, PromiseState_fulfilled = 1, PromiseState_rejected = -1,
	// const
	KEY_STATE = '_state', KEY_VALUE = '_value', KEY_HANDLED = '_handled', KEY_REACTIONS = '_reactions',
	// KEY_DEPEND_ON = KEY_VALUE; 因為沒有衝突，可重複利用 KEY_VALUE。
	// 應對: @see TriggerPromiseReactions(promise)
	KEY_DEPEND_ON = '_depend_on' && KEY_VALUE;

	// @private
	// assert: won't throw
	function PerformPromiseThen(promise, reaction, rejected, value) {
		if (typeof reaction !== 'function') {
			(rejected ? RejectPromise : FulfillPromise)(promise, value);
			return;
		}

		/**
		 * <code>
		(p=Promise.reject(2).then(function(){},function(v){return Promise.resolve(2)})).then(null,function(){});
			Promise {<pending>}
			→ Promise {<resolved>: 2}
		</code>
		 */
		try {
			value = reaction(value);
			FulfillPromise(promise, value);
		} catch (e) {
			RejectPromise(promise, e);
		}
	}

	// @private
	// assert: won't throw
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-triggerpromisereactions
	function TriggerPromiseReactions(promise) {
		var value = promise[KEY_VALUE], rejected = promise[KEY_STATE] === PromiseState_rejected, reactions = promise[KEY_REACTIONS];
		if (!reactions) {
			// TriggerPromiseReactions() already executed
			/** <code>p=new Promise(function(r,R){r(Promise.resolve(1));throw 2});console.log(p)</code> */
			return;
		}

		// free
		delete promise[KEY_REACTIONS];
		if (false && KEY_VALUE !== KEY_DEPEND_ON)
			delete promise[KEY_DEPEND_ON];

		// assert: (`value` is not thenable || rejected) === true
		EnqueueJob(function() {
			if (rejected && !promise[KEY_HANDLED]) {
				// assert: no onRejected reaction

				// Promise.reject(2).then(function(v){}).catch(function(v){})

				// HostPromiseRejectionTracker ( promise, operation )
				// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-host-promise-rejection-tracker
				throw new Error('Uncaught (in promise): ' + value);
			}

			library_namespace.debug('reactions of ' + promise + ': '
					+ reactions.join(';'), 8, 'TriggerPromiseReactions');
			// PromiseReactionJob ( reaction, argument )
			// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promisereactionjob
			reactions.forEach(function(reaction) {
				if (Array.isArray(reaction)) {
					// @see
					// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promisereaction-records
					// reaction = [ promise, onFulfilled, onRejected ]
					PerformPromiseThen(reaction[0], reaction[rejected ? 2 : 1],
							rejected, value);
				} else {
					// assert: IsPromise(reaction)
					(rejected ? RejectPromise : FulfillPromise)
							(reaction, value);
				}
			});
		});
	}

	// @private
	// assert: won't throw
	// Promise Resolve Functions, resolve `promise` with `result`.
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promise-resolve-functions
	// https://promisesaplus.com/#the-promise-resolution-procedure
	function FulfillPromise(promise, result, no_enqueue) {
		// test if promise is settled / alreadyResolved
		if (promise[KEY_STATE] !== PromiseState_pending) {
			// p=new Promise(function(r,R){setTimeout(function(){r(1);r(p)},1)})
			return;
		}

		function executing_job(job) {
			if (no_enqueue)
				job();
			else
				EnqueueJob(job);
		}

		var then;
		try {
			if (promise === result) {
				// selfResolutionError
				/** <code>(p=new Promise(function(r,R){setTimeout(function(){r(p)},1)})).then(null,function(){})</code> */
				// Chaining cycle detected for promise #<Promise>
				throw new TypeError('A promise cannot be resolved with itself.');
			}

			then = get_then_of_thenable(result);
			if (!then) {
				// p=new Promise(function(r,R){r({then:2})})
				promise[KEY_STATE] = PromiseState_fulfilled;
				promise[KEY_VALUE] = result;

				TriggerPromiseReactions(promise);

			} else {
				if (IsPromise(result)) {
					/**
					 * <code>
					// won't throw HostPromiseRejectionTracker:
					(p=new Promise(function(r,R){r( Promise.reject(2) )})).then(null,function(){});console.log(p)
					q=Promise.reject(2);(p=new Promise(function(r,R){r( q )})).then(null,function(){});console.log(p)
					Promise.resolve().then(function(){return Promise.reject(3)}).then(null,function(){});
					Promise.resolve().then(function(){return new Promise(function(r,R){R(3)})}).then(null,function(){});
					</code>
					 */
					library_namespace.debug('handled: ' + result, 8,
							'FulfillPromise');
					result[KEY_HANDLED] = true;
				}

				executing_job(function() {
					/**
					 * old runtime environment may not has
					 * Function.prototype.bind(), so we use anonymous functions
					 * instead of FulfillPromise.bind() to improve performance.
					 */
					function onFulfilled(value) {
						if (!called) {
							called = true;
							FulfillPromise(promise, value, no_enqueue);
						}
					}
					function onRejected(value) {
						if (!called) {
							called = true;
							RejectPromise(promise, value);
						}
					}
					var called;
					try {
						if (IsPromise(result)) {
							/**
							 * <code>
							p=new Promise(function(r){setTimeout(function(){r(Promise.resolve(2))},1)})
							</code>
							 */
							if (result[KEY_STATE] === PromiseState_pending) {
								promise[KEY_DEPEND_ON] = result;
								result[KEY_REACTIONS].push(promise);

							} else {
								// copy result → promise
								promise[KEY_STATE] = result[KEY_STATE];
								promise[KEY_VALUE] = result[KEY_VALUE];

								// assert: promise[KEY_STATE] !==
								// PromiseState_pending
								TriggerPromiseReactions(promise);
							}

						} else {
							/**
							 * <code>
							 is_thenable(result)
							 p=new Promise(function(r,R){r({then:function(){}})})
							 t={};t.then=function(r){r(2)};p=new Promise(function(r,R){r(t)})
							 t=function(){};t.then=function(r){r(2)};p=new Promise(function(r,R){r(t)})
							 </code>
							 */

							then.call(result, onFulfilled, onRejected);
						}
					} catch (e) {
						onRejected(e);
					}
				});
			}

		} catch (e) {
			executing_job(function() {
				RejectPromise(promise, e);
			});
		}
	}

	// @private
	// assert: won't throw
	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promise-reject-functions
	function RejectPromise(promise, reason) {
		// test if promise is settled / alreadyResolved
		if (promise[KEY_STATE] !== PromiseState_pending) {
			return;
		}

		// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-rejectpromise

		// p=new Promise(function(r,R){setTimeout(function(){R(p)},1)})
		// p=new Promise(function(r,R){R(function(){throw p})})
		// p=new Promise(function(r,R){R({then:function(){throw p}})})
		promise[KEY_STATE] = PromiseState_rejected;
		promise[KEY_VALUE] = reason;
		EnqueueJob(function() {
			// (q=(p=Promise.reject(2)).then(3,4)).then(null,function(){});console.log(p);console.log(q);
			TriggerPromiseReactions(promise);
		});
	}

	// @private
	// is thenable object, thenable 物件
	function get_then_of_thenable(value) {
		// `value &&`: for null
		if (value && (typeof value === 'function' || typeof value === 'object')) {
			var then = value.then;
			return typeof then === 'function' && then;
		}
	}

	// @see is_thenable() @ base.js
	// cf. Promise.isPromise()
	function is_thenable(value) {
		return !!get_then_of_thenable(value);
		// old style
		return value && typeof value.then === 'function';
	}
	// library_namespace.is_thenable = is_thenable;

	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-ispromise
	// https://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
	// test if is Promise 物件, Promise.isPromise(),
	// `require('util').types.isPromise()`
	function IsPromise(value) {
		return value instanceof Promise;

		return Promise.resolve(value) == value;
		return value && value.constructor === Promise;
		return value
				&& Object.prototype.toString.call(value) === "[object Promise]";

		// NG: only thenable
		return is_thenable(value);

		// assert: Should NOT access value.then
		// https://promisesaplus.com/#point-75

		// NG:
		var then = get_then_of_thenable(value), constructor;
		return then && typeof (constructor = value.constructor) === 'function'
				&& typeof constructor.resolve === 'function'
				&& typeof constructor.reject === 'function'
				// ECMA-262, 9th edition 標準
				// && typeof constructor.all === 'function'
				// && typeof constructor.race === 'function'
				&& then;
	}

	// --------------------------------------------------------

	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promise-executor
	function Promise(executor) {
		if (!(this instanceof Promise))
			// calling a builtin Promise constructor without new is forbidden
			throw new TypeError((typeof this) + ' is not a promise');

		if (typeof executor !== 'function')
			// calling a builtin Promise constructor without new is forbidden
			throw new TypeError('Promise resolver ' + executor
					+ ' is not a function');

		// private:

		// [[PromiseState]]
		this[KEY_STATE] = PromiseState_pending;

		// [[PromiseResult]]
		// this[KEY_VALUE] = undefined;

		// [[PromiseIsHandled]]
		// this[KEY_HANDLED] = false;

		// 因為本promise擱置而擱置的{Promise} or 函數。
		// subscribers, deferreds
		// [[PromiseFulfillReactions]] queue
		// [[PromiseRejectReactions]] queue
		this[KEY_REACTIONS] = [];

		var promise = this;
		// forced to convert to thenable
		FulfillPromise(promise, 'then' in executor ? executor : {
			then : executor
		}, /* no_enqueue */!('then' in executor));
	}

	// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promise.prototype.then
	// .then()會另外產生一個新的promise物件。 NewPromiseCapability()
	function then(onFulfilled, onRejected) {
		// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-performpromisethen
		if (typeof onFulfilled !== 'function')
			onFulfilled = undefined;
		if (typeof onRejected !== 'function')
			onRejected = undefined;

		if (onRejected) {
			var promise = this;
			do {
				/**
				 * if promise[KEY_HANDLED] is already `true`, it means there are
				 * more than one handler.<br />
				 * e.g.,
				 * <code>(q=Promise.reject(2)).then(null,function h1(){});q.then(null,function h2(){});</code>
				 */
				promise[KEY_HANDLED] = true;
			} while (IsPromise(promise = promise[KEY_DEPEND_ON]));
		}

		// 回傳另一個被擱置的 Promise 物件
		// NewPromiseCapability(C)
		var promise = new this.constructor(library_namespace.null_function);
		promise[KEY_DEPEND_ON] = this;

		if (this[KEY_STATE] === PromiseState_pending) {
			// test case: see "test of Promise.prototype.then()" above

			/**
			 * 等待本promise解決了再處理。<br />
			 * p=Promise.resolve(2);q=p.then();p!==q
			 * 
			 * @see https://www.ecma-international.org/ecma-262/9.0/index.html#sec-promisereaction-records
			 */
			this[KEY_REACTIONS].push(onFulfilled || onRejected
			// reaction = [ promise, onFulfilled, onRejected ]
			? [ promise, onFulfilled, onRejected ] : promise);

		} else {
			// assert: `this` promise is settled, solved.

			/**
			 * <code>
			p=Promise.resolve().then(function(){})
			p=Promise.resolve().then(function(a){return {a:1,b:2}})
			p=Promise.resolve().then(function(a){return function(a){return a}})
			q={b:2,then:5};p=Promise.resolve(2).then(a=>{return q});console.log(p);

			(p=Promise.reject(2)).catch(a=>0);(q=Promise.resolve(1).then(a=>p)).catch(a=>0);p!==q
			q=new Promise(r=>setTimeout(r,500));p=Promise.resolve(2).then(a=>{return q});console.log(p);
			p=new Promise((r,R)=>{setTimeout(function(){r(9)},8)});p.then(p);p.then(p);

			value is thenable object / function
			q={then:r=>r(1)};p=Promise.resolve(2).then(a=>{return q})
			q={b:2,then:r=>{console.log(this);r(this.b)}};p=Promise.resolve(2).then(a=>{return q});console.log(p);

			(q=(p=Promise.reject(2)).then(3,4)).then(null,function(){});console.log(p);console.log(q);
			(q=Promise.reject(2).then(function(){})).then(function(){},function(y){})
			</code>
			 */
			var rejected = this[KEY_STATE] === PromiseState_rejected, value = this[KEY_VALUE];
			EnqueueJob(function() {
				PerformPromiseThen(promise,
						rejected ? onRejected : onFulfilled, rejected, value);
			});
		}

		return promise;
	}

	// --------------------------------------------------------

	Promise.resolve = function resolve(result) {
		if (IsPromise(result) && result[KEY_STATE] === PromiseState_fulfilled)
			// p=Promise.resolve(1);q=Promise.resolve(p);console.log(p===q)
			return result;

		// NewPromiseCapability(C)
		// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-newpromisecapability
		var promise = new this(library_namespace.null_function);

		/**
		 * <code>
		(q=new Promise(function(r,R){setTimeout(function(){R(2)},80)}));(p=Promise.resolve(q)).then(function(x){console.log('*'+x)},function(y){console.log('_'+y)});console.log(p)
		</code>
		 */
		if (IsPromise(result) && result[KEY_STATE] !== PromiseState_pending) {
			// Promise.resolve() 基本上盡可能早點得到一個確定的 Promise 物件，並且不會改變傳入的引數。
			// copy result → promise
			promise[KEY_STATE] = result[KEY_STATE];
			promise[KEY_VALUE] = result[KEY_VALUE];

			/**
			 * <code>
			// won't throw HostPromiseRejectionTracker:
			(q=Promise.reject(2)).then(null,function(){});p=Promise.resolve(q);console.log(p)
			(q=new Promise(function(r,R){R(2)})).then(null,function(){});p=Promise.resolve(q);console.log(p)
			</code>
			 */

			// will throw HostPromiseRejectionTracker:
			// Promise.resolve(Promise.reject(2))
			/**
			 * <code>

			//	throw:
			(q=Promise.reject(2));
			//	no throw:
			console.log(q);p=Promise.resolve(q);console.log(p)

			//	no throw:
			(q=new Promise(function(r,R){R(2)})).then(null,function(){});
			//	throw:
			p=new Promise(function(r){r(q)});console.log(p)
			
			//	throw:
			(q=Promise.reject(2));
			//	throw:
			console.log(q);p=new Promise(function(r,R){r(q)});console.log(p)
			</code>
			 */
			promise[KEY_HANDLED] = true;
		} else {
			FulfillPromise(promise, result);
		}

		return promise;
	};

	Promise.reject = function reject(reason) {
		// NewPromiseCapability(C)
		var promise = new this(library_namespace.null_function);
		RejectPromise(promise, reason);
		return promise;
	};

	// @private
	function GetIterator(iterable) {
		if (typeof iterable === 'string') {
			// return Array.from(iterable);
			return iterable.split('');
		}

		if (!Array.isArray(iterable)) {
			// e.g., {Number|Object|Function|Null|Undefined}
			throw new TypeError('Argument of Promise.all: {'
					+ (typeof iterable) + '} ' + iterable + ' is not iterable');
		}

		return iterable;
	}

	/**
	 * <code>
	var promise1 = Promise.resolve(3);
	var promise2 = new Promise(function(resolve, reject) {
		setTimeout(function() {
			reject('foo');
		}, 100);
	});
	var promises = [ promise1, promise2 ];

	Promise.allSettled(promises).then(function(results) {
		results.forEach(function(result) {
			console.log([ result.status, result.value, result.reason ].join(', '));
		});
	});

	Promise.all(promises).then(function(results) {
		results.forEach(function(result) {
			console.log(result.join(', '));
		});
	});
	</code>
	 */

	function for_all_promises(iterable, onFulfilled, onRejected) {
		// -iterable.length: be sure `remaining` is negative before
		// iterable.forEach() completed
		var remaining = -iterable.length, result_list = [];

		function fill(value, index) {
			// CeL.log([ remaining, index, value ].join(', '));
			result_list[index] = value;
			if (--remaining === 0) {
				// CeL.log('result_list: ' + result_list);
				onFulfilled(result_list);
			}
		}

		GetIterator(iterable).forEach(function(item, index) {
			var then = get_then_of_thenable(item);
			if (!then) {
				// Not a .then() object
				result_list[index] = item;
				return;
			}

			function reject(reason) {
				if (onRejected) {
					// Promise.all()
					onRejected(reason);
				} else {
					// Promise.allSettled()
					fill({
						status : "rejected",
						reason : reason
					}, index);
				}
			}

			try {
				then.call(item, function(result) {
					fill(onRejected ? result : {
						status : "fulfilled",
						value : result
					}, index);
				}, reject);
			} catch (e) {
				reject(e);
			}

			remaining++;
		});

		remaining += iterable.length;
		if (remaining === 0) {
			// No .then() object
			onFulfilled(result_list);
		}
	}

	// https://eyesofkids.gitbooks.io/javascript-start-es6-promise/content/contents/promise_all_n_race.html
	// Promises/A+並沒有關於Promise.reject或Promise.resolve的定義，它們是ES6 Promise標準中的實作。
	// 如果參數中 promise 有一個失敗（rejected），此實例回調失敗（reject）
	Promise.all = function all(iterable) {
		return new this(function(onFulfilled, onRejected) {
			for_all_promises(iterable, onFulfilled, onRejected);
		});
	};

	// 拿到每個Promise的狀態 不管其是否處理成功
	Promise.allSettled = function allSettled(iterable) {
		return new this(function(onFulfilled/* , onRejected */) {
			for_all_promises(iterable, onFulfilled);
		});
	};

	// 如果參數中某個promise解決或拒絕，返回的promise就會解決或拒絕。
	Promise.race = function race(iterable) {
		return new this(function(onFulfilled, onRejected) {
			GetIterator(iterable)
			// won't skip anyone. Using forEach for sparse array
			.forEach(function(item) {
				try {
					var then = get_then_of_thenable(item);
					if (then) {
						then.call(item, onFulfilled, onRejected);
					} else {
						onFulfilled(item);
					}
				} catch (e) {
					onRejected(e);
				}
			});
		});
	};

	// https://sung.codes/blog/2019/05/18/promise-race-vs-promise-any-and-promise-all-vs-promise-allsettled/
	Promise.any = function any(iterable) {
		return new this(function(onFulfilled, onRejected) {
			var remaining = 0, waiting;
			GetIterator(iterable)
			// won't skip anyone. Using forEach for sparse array
			.forEach(function(item) {
				try {
					var then = get_then_of_thenable(item);
					if (then) {
						remaining++;
						then.call(item, function(item) {
							remaining--;
							some_fulfilled = true;
							onFulfilled(item);
						}, function(item) {
							// TODO: check what to onRejected()
							// TODO: Using AggregateError object
							if (--remaining === 0 && waiting)
								onRejected(item);
						});
					} else {
						onFulfilled(item);
					}
				} catch (e) {
					// ignores rejections. Ignore error
				}
			});
			if (remaining > 0)
				waiting = true;
			else
				onFulfilled();
		});
	};

	// --------------------------------------------------------

	// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
	function Promise_finally(onFinally) {
		if (typeof onFinally !== 'function')
			// p=Promise.resolve(2)['finally'](3).then(function(v){console.log(v)});console.log(p)
			return this.then();

		if (false)
			library_namespace.debug('creating onFinally step: ' + onFinally, 0,
					'Promise_finally');
		var _Promise = this.constructor || globalThis.Promise;
		// onFinally won't get any arguments
		return this.then(function(value) {
			return _Promise.resolve(onFinally()).then(function() {
				// inherit value
				return value;
			});
		}, function(value) {
			return _Promise.resolve(onFinally()).then(function() {
				// return _Promise.reject(value);
				throw value;
			});
		});
	}

	// https://github.com/tc39/proposal-promise-try
	// a syntactic sugar
	function Promise_try(executor) {
		return new this(function(resolve/* , reject */) {
			return resolve(executor());
		});
	}

	// Promise.allSettled()
	//
	// Cannot catch Promise.allSettled(). Only use Using Promise.allSettled()
	// when you do not care errors. Or using `Promise.all().then(, cacher)`
	// before Promise.allSettled() to catch error.
	//
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
	// https://github.com/es-shims/Promise.allSettled/blob/master/implementation.js
	function Promise_allSettled(iterable) {
		function onFulfilled(result) {
			return {
				status : "fulfilled",
				value : result
			};
		}

		function onRejected(reason) {
			return {
				status : "rejected",
				reason : reason
			};
		}

		var _Promise = this;
		iterable = Array.from(iterable, function(promise) {
			if (!is_thenable(promise))
				promise = _Promise.resolve(promise);
			return promise.then(onFulfilled, onRejected);
		});
		return _Promise.all(iterable);
	}

	// --------------------------------------------------------

	function Promise_toString() {
		return 'Promise {<i style="color:#43e">['
				+ (this[KEY_STATE] === PromiseState_pending ? 'pending'
						: this[KEY_STATE] === PromiseState_rejected ? 'rejected'
								: 'fulfilled') + ']</i>: ' + this[KEY_VALUE]
				+ '}';
	}

	// Do not set `Promise.prototype={...}`,
	// so we can use `new this.constructor()`
	Object.assign(Promise.prototype, {
		// for debug only
		// toString : Promise_toString,

		then : then,
		// a syntactic sugar
		// caught
		'catch' : function Promise_catch(onRejected) {
			return this.then(undefined, onRejected);
		}
	});

	set_method(globalThis, {
		Promise : Promise
	}, 'function');

	set_method(globalThis.Promise, {
		'try' : Promise_try,
		allSettled : Promise_allSettled
	}, 'function');

	set_method(globalThis.Promise.prototype, {
		// finale
		'finally' : Promise_finally
	}, 'function');

	// --------------------------------------------------------

	if (typeof Symbol === 'function') {
		// Symbol.prototype.description
		if (!('description' in Symbol.prototype)) {
			// Object.getOwnPropertyDescriptor(Symbol.prototype, 'description');
			Object.defineProperty(Symbol.prototype, 'description', {
				enumerable : false,
				configurable : true,
				get : function() {
					var matched = String(this).match(/^Symbol\(([\s\S]*)\)$/);
					return matched[1];
				}
			});
		}
	}

	// --------------------------------------------------------

	/**
	 * defective polyfill for W3C URL API, URLSearchParams() @ CeL.application.net.
	 * 
	 * defective polyfill for W3C fetch API @ CeL.application.net.Ajax.
	 */

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	return (_// JSDT:_module_
	);
}
