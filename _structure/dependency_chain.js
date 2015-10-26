/**
 * @name CeL function for dependency chain
 * @fileoverview 本檔案包含了相依, dependency relation, dependency chain 用的 functions。<br />
 * 
 * TODO:<br />
 * 增加效率。這可能得更動架構設計。<br />
 * throw new DEPENDENCY_ERROR(id);
 * 
 * @example <code>
 * CeL.run([ module_1, module_2 ], function callback(){});
 * </code>
 * 
 * @since 2012/12/18
 * 
 */

if (typeof CeL === 'function')
	(function(library_namespace) {

		/**
		 * 取得裸 Object (naked Object)。
		 * 
		 * @returns 裸 Object (naked Object)。
		 */
		var null_Object = library_namespace.null_Object,
		// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
		NOT_FOUND = ''.indexOf('_');

		// ---------------------------------------------------------------------//
		// 為一些比較舊的版本或不同瀏覽器而做調適。

		// @see data.code.compatibility.

		// cache.
		var Array_slice = Array.prototype.slice;

		/**
		 * Function.prototype.apply();<br />
		 * apply & call: after ECMAScript 3rd Edition.<br />
		 * 不直接用 value undefined: for JS5.
		 * 
		 * 傳回某物件的方法，以另一個物件取代目前的物件。
		 * apply是將現在正在執行的function其this改成apply的引數。所有函數內部的this指針都會被賦值為oThis，這可實現將函數作為另外一個對象的方法運行的目的.
		 * xxx.apply(oThis,arrayArgs): 執行xxx，執行時以 oThis 作為 this，arrayArgs作為
		 * arguments.
		 * 
		 * @param apply_this_obj
		 * @param apply_args
		 * @returns apply 後執行的結果。
		 * @see http://msdn.microsoft.com/en-us/library/4zc42wh1(VS.85).aspx
		 *      http://www.cnblogs.com/sunwangji/archive/2007/06/26/791428.html
		 *      http://www.cnblogs.com/sunwangji/archive/2006/08/21/482341.html
		 *      http://msdn.microsoft.com/en-us/library/4zc42wh1(VS.85).aspx
		 *      http://www.interq.or.jp/student/exeal/dss/ejs/3/1.html
		 *      http://blog.mvpcn.net/fason/
		 *      http://d.hatena.ne.jp/m-hiyama/20051017/1129510043
		 *      http://noir.s7.xrea.com/archives/000203.html
		 *      http://www.tohoho-web.com/js/object.htm#inheritClass
		 * 
		 * @since 2011/11/20
		 */
		function apply(apply_this_obj, apply_args) {
			var temp_apply_key, _arg_list = [], r, i = 0, l = apply_args
					&& apply_args.length;

			if (apply_this_obj !== null
					&& typeof apply_this_obj !== 'undefined')
				try {
					apply_this_obj[temp_apply_key = 'temp_apply'] = this;
				} catch (e) {
					temp_apply_key = null;
				}

			if (l) {
				for (; i < l; i++)
					_arg_list[i] = 'apply_args[' + i + ']';
				if (!temp_apply_key)
					apply_this_obj = this;
				r = eval('apply_this_obj'
						+ (temp_apply_key ? '.' + temp_apply_key : '') + '('
						+ _arg_list.join(',') + ')');
			} else
				r = temp_apply_key ? apply_this_obj[temp_apply_key]() : this();

			if (temp_apply_key)
				delete apply_this_obj[temp_apply_key];
			return r;
		}

		/**
		 * Function.prototype.call();<br />
		 * call 方法是用來呼叫代表另一個物件的方法。call 方法可讓您將函式的物件內容從原始內容變成由 thisObj 所指定的新物件。
		 * 如果未提供 thisObj 的話，將使用 global 物件作為 thisObj。
		 * 
		 * @see http://msdn.microsoft.com/library/CHT/jscript7/html/jsmthcall.asp
		 * @since 2011/11/20
		 */
		function call(this_obj) {
			// 因 arguments 非 instanceof Array，
			// arguments.slice(sp) → Array.prototype.slice.call(arguments, sp).
			return this.apply(this_obj, Array_slice.call(arguments, 1));
		}

		function copy_properties(from, to) {
			for ( var property in from)
				to[property] = from[property];
			return to;
		}
		library_namespace.copy_properties = copy_properties;

		/**
		 * Function.prototype.bind();
		 * 
		 * @since 2011/11/20
		 * @see <a
		 *      href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind"
		 *      accessdate="2012/2/4 16:39">bind</a>
		 */
		function bind(this_obj) {
			var func = this, args;
			if (arguments.length < 2)
				return this_obj === null || typeof this_obj === 'undefined' ? func
						: copy_properties(func, function() {
							if (false)
								library_namespace.debug('this_obj: ['
										+ this_obj + '],<br />\nfunction: ('
										+ typeof func + ') [' + func + ']', 1,
										'bind');
							return func.apply(this_obj, arguments);
						});

			args = Array_slice.call(arguments, 1);
			return copy_properties(func, function() {
				var counter = arguments.length, arg, i;
				if (!counter)
					return func.apply(this_obj, args);

				// TODO: TEST: 對於少量 arguments，將 arguments 添入於 .concat() 以加快速度。
				arg = args.concat();
				i = counter + args.length;
				while (counter--)
					arg[--i] = arguments[counter];
				return func.apply(this_obj, arg);
			});
		}

		// public interface.
		library_namespace.set_method(Function.prototype, {
			apply : apply,
			call : call,
			bind : bind
		});

		// ---------------------------------------------------------------------//
		// for Iterator

		// for the Iterator interface

		/**
		 * 
		 * @param object
		 *            object to iterate
		 * @param {String|Function}kind
		 *            kind (The possible values are: "key", "value",
		 *            "key+value"), or next function(index, Iterator, arguments)
		 */
		function create_list_iterator(object, kind, get_Array, use_origin) {
			var key, iterator;
			if (use_origin && Array.isArray(object))
				iterator = object;
			else
				for (key in (iterator = []))
					// delete any properties that can be iterated.
					delete iterator[key];
			// assert: Array.isArray(iterator)

			if (!kind && typeof kind !== 'function')
				kind = Array.isArray(object) ? 'value'
				// 當作 Object。視 for(in) 而定。
				: 'key';

			// define iterator
			if (typeof object.forEach === 'function')
				object.forEach(kind === 'value' ? function(value) {
					iterator.push(value);
				} : kind === 'key' ? function(value, key) {
					iterator.push(key);
				} : function(value, key) {
					iterator.push([ key, value ]);
				});
			else
				for (key in object)
					iterator.push(
					//
					kind === 'key' ? key
					//
					: kind === 'value' ? object[key]
					// "key+value"
					: [ key, object[key] ]);

			if (get_Array)
				return iterator;

			return new Array_Iterator(iterator, true);
		}

		// ---------------------------------------------------------------------//

		/**
		 * test code for Map, Set, Array.from():
		 * 
		 * TODO:<br />
		 * test: Array.from(Iterator, other arrayLike)
		 * 
		 * @example <code>

		// More examples: see /_test suite/test.js

		 * </code>
		 * 
		 */

		// Array.from()
		function from(items, mapfn, thisArg) {
			var array, i, iterator = items
					&& !Array.isArray(items)
					// 測試是否有 iterator。
					&& (
					// items['@@iterator'] ||
					items.constructor === Set ? 'values'
							: (items.entries ? 'entries' : items.values
									&& 'values'));

			if (!iterator && typeof items.next === 'function')
				// items itself is an iterator.
				iterator = items;

			if (iterator) {
				array = [];

				// need test library_namespace.env.has_for_of
				// for(i of items) array.push(i);

				if (typeof iterator === 'function')
					iterator = iterator.call(items);
				else if (iterator && typeof items[iterator] === 'function')
					iterator = items[iterator]();
				else if (!iterator.next)
					throw new Error('Array.from: invalid iterator!');

				while (!(i = iterator.next()).done)
					array.push(i.value);
				return array;
			}

			if (typeof mapfn !== 'function')
				try {
					// for IE, Array.prototype.slice.call('ab').join() !== 'a,b'
					return typeof items === 'string' ? items.split('')
							: Array_slice.call(items);
				} catch (e) {
					if ((e.number & 0xFFFF) !== 5014)
						throw e;
					mapfn = null;
				}

			var length = items && items.length | 0;
			array = [];
			if (mapfn)
				for (i = 0; i < length; i++)
					array.push(thisArg ? mapfn.call(thisArg, items[i], i)
					// 不採用 .call() 以加速執行。
					: mapfn(items[i], i));
			else
				while (i < length)
					array.push(items[i++]);

			return array;
		}

		library_namespace.set_method(Array, {
			from : from
		});

		function Array_Iterator_next() {
			// this: [ index, array, use value ]
			library_namespace.debug(this.join(';'), 6, 'Array_Iterator.next');
			var index;
			while ((index = this[0]++) < this[1].length)
				if (index in this[1])
					return {
						value : this[2] ? this[1][index]
						//
						: [ index, this[1][index] ],
						done : false
					};

			// 已經 done 的不能 reuse。
			this[0] = NaN;
			return {
				value : undefined,
				done : true
			};
		}

		function Array_Iterator(array, use_value) {
			// library_namespace.debug(array);
			// reset index to next index.
			// define .next() function onto items.
			this.next = Array_Iterator_next.bind([ 0, array, use_value ]);
		}
		Array_Iterator.prototype.toString = function() {
			return "[object Array Iterator]";
		};

		// export.
		library_namespace.Array_Iterator = Array_Iterator;

		// ---------------------------------------------------------------------//
		// 測試是否具有標準的 ES6 Set/Map collections (ECMAScript 6 中的集合類型)。

		var is_Set, is_Map, has_Set, has_Map,
		//
		KEY_not_native = library_namespace.env.not_native_keyword,
		// use Object.defineProperty.not_native to test
		// if the browser don't have native support for Object.defineProperty().
		has_native_Object_defineProperty = !Object.defineProperty[KEY_not_native];

		try {
			has_Set = !!(new Set());
			has_Map = !!(new Map());

			is_Set = function(value) {
				return Object.prototype.toString.call(value) === "[object Set]";
			};
			is_Map = function(value) {
				return Object.prototype.toString.call(value) === "[object Map]";
			};

			// (new Map()).entries();
			(new Map()).forEach();

		} catch (e) {

			// browser 非標準 ES6 collections。
			// 想辦法補強。

			// TODO: WeakMap 概念驗證碼:
			// var _WeakMap=function(v){return function(){return eval('v');};};
			// var a={s:{a:3}},g=_WeakMap(a.s);
			// delete a.s;/* .. */alert(g());
			// https://code.google.com/p/es-lab/source/browse/trunk/src/ses/WeakMap.js

			if (!has_native_Object_defineProperty || !has_Set || !has_Map)
				(function() {
					library_namespace
							.debug('完全使用本 library 提供的 ES6 collections 實作功能。');

					// ---------------------------------------

					/**
					 * hash 處理。在盡可能不動到 value/object 的情況下，為其建立 hash。<br />
					 * 在 ES5 下，盡可能模擬 ES6 collections。<br />
					 * 在先前過舊的版本下，盡可能達到堪用水準。
					 * 
					 * @see <a
					 *      href="https://github.com/Benvie/harmony-collections/blob/master/harmony-collections.js"
					 *      accessdate="2012/12/12 17:0"
					 *      title="harmony-collections/harmony-collections.js at
					 *      master · Benvie/harmony-collections ·
					 *      GitHub">harmony-collections</a>
					 */
					var max_hash_length = 80,
					// operator
					ADD = 1, DELETE = 2,
					// id 註記。
					Map_id = 'Map id\n' + Math.random(),
					// Object.prototype.toString.call()
					get_object_type = library_namespace.get_object_type,
					// private operator, access/pass keys.
					// ** WARNING:
					// Should be Array (see forEach).
					// 只要是 object，會以 reference 傳遞，可以 "===" 判斷即可。
					OP_HASH = [],
					//
					OP_SIZE = [],
					//
					OP_KEYS = [], OP_VALUES = [], OP_ENTRIES = [],
					// 取得裸 Object (naked Object) 與屬性判別函數。
					new_hash_set = function new_hash_set() {
						var hash_map = Object.create(null);
						// [ hash_map, has_hash() ]
						return [ hash_map, function(key) {
							return key in hash_map;
						} ];
					};

					// 測試可否用 \0 作為 id。
					(function() {
						var o = {}, a = [], t = {}, id = '\0' + Map_id;
						o[id] = a[id] = t;
						if (o[id] === t && a[id] === t)
							Map_id = id;
					})();

					try {
						new_hash_set();

					} catch (e) {
						// 使用較原始的方法。
						new_hash_set = function() {
							var hash_map = {};
							return [
									hash_map,
									// has_hash()
									hash_map.hasOwnProperty ? function(key) {
										return hash_map.hasOwnProperty(key);
									}
											: Object.prototype ? function(key) {
												return key in hash_map
														&& hash_map[key] !== Object.prototype[key];
											}
													: function(key) {
														return key in hash_map;
													} ];
						};
					}

					/**
					 * 判別是否為 <a href="http://zh.wikipedia.org/wiki/-0"
					 * accessdate="2013/1/6 19:0" title="負零">−0</a>。
					 * 
					 * @see <a href="http://en.wikipedia.org/wiki/Signed_zero"
					 *      accessdate="2012/12/15 12:58">Signed zero</a>, <a
					 *      href="http://www.cnblogs.com/ziyunfei/archive/2012/12/10/2777099.html"
					 *      accessdate="2012/12/15 13:0">[译]JavaScript中的两个0 -
					 *      紫云飞 - 博客园</a>
					 */
					var is_negative_zero = Object.is && !Object.is(+0, -0)
					// Object.is() 採用 SameValue Algorithm。
					? function(value) {
						return Object.is(value, -0);
					}
					// 相容方法。
					: function(value) {
						return value === -0 && 1 / value === -Infinity;
					};
					library_namespace.is_negative_zero = is_negative_zero;

					/**
					 * 鍵值對。
					 * 
					 * TODO: comparator
					 * 
					 * @constructor
					 * 
					 * @see <a
					 *      href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Map"
					 *      accessdate="2012/12/10 7:48">Map - JavaScript | MDN</a>
					 */
					function Map(iterable, comparator) {
						if (this === null || this === undefined
								|| this === library_namespace.env.global) {
							// 採用 Map()，而非 new 呼叫。
							// called as a function rather than as a
							// constructor.
							return new Map(iterable, comparator);
						}

						var size,
						// {Object}map hash to key (object) Array.
						//
						// get hash map of (
						// hash → [value/object 1, value/object 2, ..]
						// )
						hash_map,
						// has this hash.
						has_hash,
						// {Object}value objects 的 id hash map。可用來維持插入順序。
						// value_of_id[
						// id: {String}hash + "_" + {ℕ⁰:Natural+0}index
						// ] = value.
						//
						// 在 Set 中 value_of_id={ id: key object }，
						// 因此可以更快的作 forEach()。
						value_of_id;

						// 快速處理法。
						Object.defineProperty(this, 'clear', {
							// enumerable : false,
							value : function clear() {
								// reset.
								var set = new_hash_set();
								hash_map = set[0];
								has_hash = set[1];
								value_of_id = null_Object();
								size = 0;
							}
						});
						// 初始化。
						this.clear();

						Object.defineProperty(this, 'size', {
							// enumerable : false,
							// configurable : false,
							get : function() {
								return size;
							},
							set : function(v) {
								if (Array.isArray(v) && v[1] === OP_SIZE)
									size = v[0];
							}
						});

						// 假扮的 interface（仮面）:
						// 借用標準 method 介面，
						// 若是傳入 OP_*，則表示為 private method，作出內部特殊操作。
						// 否則作出正常表現。
						//
						// 使用這方法以盡量減少多餘的 property 出現，
						// 並維持 private method 之私密特性。
						Object.defineProperty(this, 'values', {
							// enumerable : false,
							value : function values() {
								// arguments[0]: 隱藏版 argument。
								if (arguments[0] === OP_ENTRIES)
									// 傳入 OP_*，則表示為 private method。
									// 回傳 private property 以便操作。
									return [ hash_map, value_of_id ];
								if (arguments[0] === OP_VALUES)
									return create_list_iterator(value_of_id,
											'value', true);

								// 作出正常表現。
								return create_list_iterator(value_of_id,
										'value');
							}
						});

						// 為了能初始化 iterable，因此將設定函數放在 constructor 中。

						Object.defineProperty(this, 'has', {
							// enumerable : false,
							value : function has(key) {
								// arguments[1]: 隱藏版 argument。
								return arguments[1] === OP_HASH ?
								// 傳入 OP_HASH，則表示為 private method，回傳 has_hash()。
								has_hash(key) :
								// 作出正常表現。
								!!hash_of_key.call(this, key);
							}
						});

						if (iterable)
							// initialization. 為 Map 所作的初始化工作。
							try {
								if (Array.isArray(iterable))
									// "key+value"
									iterable.forEach(function(entry) {
										this.set(entry[0], entry[1]);
									}, this);
								else if (iterable.forEach)
									iterable.forEach(function(v, k) {
										this.set(k, v);
									}, this);
								else {
									throw 1;
									for ( var k in iterable)
										this.set(k, iterable[k]);
								}
							} catch (e) {
								throw new TypeError(
										'Input value is not iterable.');
							}
					}

					/**
					 * collections 之核心功能：get hash of specified value/object.<br />
					 * 所有對 hash_map 之變更皆由此函式負責。<br />
					 * 
					 * 本函式僅能以下列方式呼叫：<br />
					 * <code>
					 * hash_of_key.call(this, ..)
					 * </code>
					 * 
					 * TODO: hash collision DoS
					 * 
					 * @param key
					 *            key object
					 * @param {Integer}operator
					 *            操作
					 * @param value
					 *            value object
					 * 
					 * @private
					 * 
					 * @returns [ hash, index ]
					 */
					function hash_of_key(key, operator, value) {
						if (arguments.length === 0)
							return;

						var hash = this.values(OP_ENTRIES), type = typeof key, map = this,
						//
						hash_map = hash[0], value_of_id = hash[1],
						//
						add_size = has_native_Object_defineProperty ?
						// set inner 'size' property
						function(v) {
							map.size = [ map.size + v, OP_SIZE ];
						} : function(v) {
							map.size += v;
						},
						//
						add_value = function(no_size_change) {
							value_of_id[hash + '_' + index] = value;
							if (!no_size_change)
								add_size(1);
						},
						//
						delete_one = function() {
							delete value_of_id[hash + '_' + index];
							add_size(-1);
						};

						// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/typeof
						switch (type) {

						case 'string':
							hash = key;
							break;

						case 'number':
							if (is_negative_zero(key)) {
								// 直接避免紛爭。
								//
								// 實際應使用 SameValue Algorithm。
								// 因為本處實作採用 Array.prototype.indexOf()，
								// 而 indexOf() 採用嚴格相等運算符(===)；
								// 實際上應該處理所有 "===" 判斷為相等，
								// 但以 SameValue Algorithm 並不相等的值。
								hash = '-0';
								break;
							}

						case 'boolean':
						case 'undefined':
							hash = String(key);
							break;

						// 對以上純量，無法判別個別 instance。

						case 'function':
							if (library_namespace.is_Function(key)) {
								// 若設定 function.toString，僅能得到 key.toString()。
								hash = String(key);
								// 盡量增加 hash 能取得的特徵。
								hash = hash.length + '|' + hash;
								break;
							}
						case 'object':
							try {
								if (!(hash = key[Map_id])) {
									// 對於 Object/Arrry，在更改內容的情況下，可能無法得到相同的特徵碼，
									// 因此還是加個 id 註記比較保險。
									hash = String(Math.random());
									Object.defineProperty(key, Map_id, {
										// configurable : true,
										// writable : false,
										// enumerable : false,
										value : hash
									});
									if (hash !== key[Map_id])
										throw new Error('無法設定 hash id: .['
												+ Map_id + ']');
								}
								break;
							} catch (e) {
								// TODO: handle exception
							}

							// 警告:採用不保險的方法。
							if (Array.isArray(key)) {
								hash = (2 * key.length < max_hash_length ? key
										: key.slice(0, max_hash_length / 2))
										.toString();
								break;
							}

							if (library_namespace.is_Object(key)) {
								hash = '{';
								var i;
								for (i in key) {
									hash += i + ':' + key[i] + ',';
									// 不須過長。
									if (hash.length > max_hash_length) {
										i = null;
										break;
									}
								}
								if (i !== null)
									// 已完結的時候，加個 ending mark。
									hash += '}';
								break;
							}

							// TODO:
							// test DOM, COM object.

							// case 'xml':
							// case 'date':

						default:
							try {
								hash = get_object_type(key) + key;
							} catch (e) {
								hash = '[' + type + ']' + key;
							}
							break;
						}

						// assert: typeof hash === 'string'

						// 正規化 hash。
						hash = hash.slice(0, max_hash_length).replace(
								/_(\d+)$/, '-$1');
						if (library_namespace.is_debug(6)
								&& library_namespace.is_WWW())
							library_namespace.debug('hash: [' + hash + ']', 0,
									'hash_of_key');

						if (this.has(hash, OP_HASH)) {
							var list = hash_map[hash],
							// 實際上應該以 SameValue Algorithm, Object.is() 判斷。
							// NaN 等於 NaN, -0 不等於 +0.
							index = list.indexOf(key);
							if (library_namespace.is_debug(6)
									&& library_namespace.is_WWW())
								library_namespace.debug('index: [' + index
										+ ']', 0, 'hash_of_key');

							if (index === NOT_FOUND) {
								// 測試是否為本身與本身不相等的特殊情形。

								// TODO:
								// 偵測 ELEMENT_NODE.isSameNode,
								// Array 之深度檢測等。

								// incase NaN. 可用 Number.isNaN().
								// 但不可用 isNaN(key), 因為 isNaN(非數字) === true.
								if (key !== key) {
									for (var i = 0, length = list.length; i < length; i++)
										// 若具有所有可偵測的相同特徵(特徵碼相同+本身與本身不相等)，
										// 則判別為相同。
										if (list[i] !== list[i]) {
											index = i;
											break;
										}
								}

							}

							if (index === NOT_FOUND) {
								if (operator === ADD) {
									if (library_namespace.is_debug(5)
											&& library_namespace.is_WWW())
										library_namespace.debug(
												'衝突(collision) : ' + type
														+ ' @ hash [' + hash
														+ '], index ' + index
														+ ' / ' + list.length,
												0, 'hash_of_key');

									index = list.push(key) - 1;
									add_value();
								} else
									hash = undefined;

							} else if (operator === DELETE) {
								if (library_namespace.is_debug(6)
										&& library_namespace.is_WWW())
									library_namespace.debug('remove key: ['
											+ hash + ']', 0, 'hash_of_key');
								if (list.length < 2)
									// assert: list.length ===1 && list[0] ===
									// key.
									delete hash_map[hash];
								else
									// assert: list[index] === key.
									delete list[index];
								delete_one();
								return true;
							} else if (operator === ADD) {
								if (library_namespace.is_debug(6)
										&& library_namespace.is_WWW())
									library_namespace.debug('modify key: ['
											+ hash + ']', 0, 'hash_of_key');
								add_value(true);
							}

						} else if (operator === ADD) {
							// add new one.
							hash_map[hash] = [ key ];
							index = 0;
							add_value();
						} else
							hash = undefined;

						return operator === DELETE ? false : hash
								&& [ hash, index ];
					}

					function forEach(callbackfn, thisArg) {
						var id, match, key = this.values(OP_ENTRIES), value,
						//
						hash_map = key[0], value_of_id = key[1],
						//
						use_call = thisArg !== undefined && thisArg !== null
								&& typeof callback.call === 'function',
						//
						list = Array.isArray(callbackfn)
								&& (callbackfn === OP_ENTRIES ? function(v, k) {
									list.push([ k, v ]);
								} : callbackfn === OP_KEYS && function(v, k) {
									list.push(k);
								});

						if (list)
							callbackfn = list, list = [];

						for (id in value_of_id) {
							match = id.match(/^([\s\S]*)_(\d+)$/);
							// assert: match succeed.
							key = hash_map[match[1]][match[2] | 0];
							value = value_of_id[id];
							if (use_call)
								callbackfn.call(thisArg, value, key, this);
							else
								callbackfn(value, key, this);
						}

						if (list) {
							// 這裡可以檢測 size。
							// assert: size === list.length
							return new Array_Iterator(list, true);
						}
					}

					// public interface of Map.
					Object.assign(Map.prototype, {
						set : function set(key, value) {
							hash_of_key.call(this, key, ADD, value);
						},
						get : function get(key) {
							var hash = hash_of_key.call(this, key);
							if (hash)
								return this.values(OP_ENTRIES)[1][hash
										.join('_')];
						},
						'delete' : function Map_delete(key) {
							return hash_of_key.call(this, key, DELETE);
						},
						keys : function keys() {
							return this.forEach(OP_KEYS);
						},
						entries : function entries() {
							return this.forEach(OP_ENTRIES);
						},
						forEach : forEach,
						toString : function() {
							// Object.prototype.toString.call(new Map)
							// === "[object Map]"
							return '[object Map]';
						},
						// place holder for Map.prototype.values()
						// will reset runtime
						values : function() {
						}
					});

					// ---------------------------------------

					/**
					 * 一個不包含任何重複值的有序列表。<br />
					 * 
					 * NOTE:<br />
					 * 為了維持插入順序，因此將 Set 作為 Map 之下層 (Set inherits
					 * Map)。副作用為犧牲（加大了）空間使用量。
					 * 
					 * @constructor
					 */
					function Set(iterable, comparator) {
						if (this === null || this === undefined
								|| this === library_namespace.env.global) {
							// 採用 Set()，而非 new 呼叫。
							// called as a function rather than as a
							// constructor.
							return new Set(iterable, comparator);
						}

						var map = new Map(undefined, comparator);

						Object.defineProperty(this, 'size', {
							// enumerable : false,
							// configurable : false,
							get : function() {
								return map.size;
							},
							set : function(v) {
								if (Array.isArray(v) && v[1] === OP_SIZE)
									map.size = v[0];
							}
						});

						this.values = has_native_Object_defineProperty ?
						//
						function values() {
							// arguments[0]: 隱藏版 argument。
							return arguments[0] === OP_VALUES ?
							//
							map[arguments[1]](arguments[2], arguments[3])
							// 作出正常表現。
							// 用 values 會比 keys 快些。
							: map.values();
						}
						// 先前過舊的版本。
						: function values() {
							// arguments[0]: 隱藏版 argument。
							if (arguments[0] === OP_VALUES) {
								var r = map[arguments[1]](arguments[2],
										arguments[3]);
								this.size = map.size;
								return r;
							}

							// 作出正常表現。
							// 用 values 會比 keys 快些。
							return map.values();
						};

						if (iterable)
							// initialization. 為 Set 所作的初始化工作。
							try {
								if (iterable.forEach)
									iterable.forEach(function(v) {
										this.add(v);
									}, this);
								else
									for ( var i in iterable)
										this.add(iterable[i]);
							} catch (e) {
								throw new TypeError(
										'Input value is not iterable.');
							}
					}

					// public interface of Set.
					Object.assign(Set.prototype, {
						add : function add(value) {
							// 在 Set 中 value_of_id={ id: key object }，
							// 因此將 value 設成與 key 相同，可以更快的作 forEach()。
							return this.values(OP_VALUES, 'set', value, value);
						},
						// 對於 Map 已有的 function name，不能取相同的名稱。
						// 相同名稱的 function 在舊版 IE 會出問題：前面的會被後面的取代。
						// 因此無法使用 "function clear()"，
						// 僅能使用 "function Set_clear()"。
						// 餘以此類推。
						clear : function Set_clear() {
							return this.values(OP_VALUES, 'clear');
						},
						'delete' : function Set_delete(value) {
							return this.values(OP_VALUES, 'delete', value);
						},
						has : function Set_has(value) {
							return this.values(OP_VALUES, 'has', value);
						},
						entries : function Set_entries() {
							var entries = [];
							this.values(OP_VALUES, 'values', OP_VALUES)
									.forEach(function(value) {
										entries.push([ value, value ]);
									});
							return new Array_Iterator(entries, true);
						},
						// 在 JScript 10.0.16438 中，兩個 "function forEach()" 宣告，會造成
						// Map.prototype.forEach 也被設到 Set.prototype.forEach，但
						// Map.prototype.forEach !== Set.prototype.forEach。
						forEach : function Set_forEach(callbackfn, thisArg) {
							this.values(OP_VALUES, 'values', OP_VALUES)
									.forEach(callbackfn, thisArg);
						},
						toString : function() {
							// Object.prototype.toString.call(new Set)
							// === "[object Set]"
							return '[object Set]';
						},
						// place holder for Set.prototype.values()
						// will reset runtime
						values : function() {
						}
					});

					// ---------------------------------------

					// export.
					var global = library_namespace.env.global;
					(global.Set = library_namespace.Set = Set)[KEY_not_native] = true;
					(global.Map = library_namespace.Map = Map)[KEY_not_native] = true;

					if (false && Array.from === Array_from) {
						library_namespace
								.debug('做個標記，設定 Set.prototype[@@iterator]。');
						Set.prototype['@@iterator'] = 'values';
					}

					is_Set = function(value) {
						// value.__proto__ === Set.prototype
						return value && value.constructor === Set;
					};
					is_Map = function(value) {
						// value.__proto__ === Map.prototype
						return value && value.constructor === Map;
					};

				})();

			// ---------------------------------------------------------------------//

			// 現在只有 mozilla firefox 20 會執行到這。
			else if (library_namespace.env.has_for_of)

				// 現在只有 mozilla firefox 20 會需要這項補強。
				(function() {
					function collection_clear() {
						if (this.size > 0) {
							var list = [];
							this.forEach(function(v, k) {
								list.push(k);
							});
							list.forEach(function(k) {
								this['delete'](k);
							}, this);
							// last check.
							if (this.size > 0)
								library_namespace
										.warn('collection_clear: 仍有元素存在於 collection 中！');
						}
					}

					try {
						// 確定有 Set。
						var s = new Set(), a = [], Set_forEach;
						if (!s.forEach) {
							// shim (backward compatible) for
							// Set.prototype.forEach().
							// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Set

							// use eval() because for(..of..) is not supported
							// in current (2013) environment.
							eval('Set_forEach=function(callback,thisArg){var i,use_call=thisArg!==undefined&&thisArg!==null&&typeof callback.call==="function";for(i of this)if(use_call)callback.call(thisArg,i,i,this);else callback(i,i,this);}');
							s.add('2 ');
							s.add(1);
							Set_forEach.call(s, function(i) {
								a.push(i);
							});

							if (a.join('|') === '2 |1') {
								library_namespace
										.debug('採用 Set_forEach() 作為 Set.prototype.forEach()。');
								Object.defineProperty(Set.prototype, 'forEach',
										{
											// enumerable : false,
											value : Set_forEach
										});
							}
						}

						if (!Set.prototype.clear)
							Object.defineProperty(Set.prototype, 'clear', {
								// enumerable : false,
								value : collection_clear
							});

						if (typeof Set.prototype.size === 'function') {
							var Set_size = Set.prototype.size;
							Object.defineProperty(Set.prototype, 'size', {
								// enumerable : false,
								get : Set_size
							});
						}

					} catch (e) {
					}

					try {
						// 確定有 Map。
						var m = new Map(), a = [], Map_forEach;
						if (!m.forEach) {
							// use eval() because for(..of..) is not supported
							// in current (2013) environment.
							eval('Map_forEach=function(callback,thisArg){var k,v,use_call=thisArg!==undefined&&thisArg!==null&&typeof callback.call==="function";for([k,v] of this)if(use_call)callback.call(thisArg,v,k,this);else callback(v,k,this);}');
							m.set('1 ', 2);
							m.set(' 3', 4);
							Map_forEach.call(m, function(v, k) {
								a.push(k, v);
							});
							if (a.join('|') === '1 |2| 3|4') {
								library_namespace
										.debug('採用 Map_forEach() 作為 Map.prototype.forEach()。');
								Object.defineProperty(Map.prototype, 'forEach',
										{
											// enumerable : false,
											value : Map_forEach
										});
							}
						}

						if (!Map.prototype.clear)
							Object.defineProperty(Map.prototype, 'clear', {
								// enumerable : false,
								value : collection_clear
							});

						if (typeof Map.prototype.size === 'function') {
							var Map_size = Map.prototype.size;
							Object.defineProperty(Map.prototype, 'size', {
								// enumerable : false,
								get : Map_size
							});
						}

					} catch (e) {
					}

					// TODO: .size

				})();

		}

		// IE11 無法使用 new Set([ , ])，但 firefox 23 可以。
		var Set_from_Array = new Set([ 1, 2 ]);
		library_namespace.Set_from_Array = Set_from_Array =
		//
		Set_from_Array.size === 2 ? function(array) {
			return new Set(array);
		} : function(array) {
			var set = new Set;
			if (typeof array.forEach === 'function')
				array.forEach(function(value) {
					set.add(value);
				});
			else
				set.add(array);
			return set;
		};

		// e.g., IE 11 has no Set.prototype.values()
		if (typeof Set.prototype.values !== 'function'
		//
		&& typeof Set.prototype.forEach === 'function')
			Set.prototype.values = function Set_prototype_values() {
				var values = [];
				this.forEach(function(v) {
					values.push(v);
				});
				return new Array_Iterator(values, true);
			};

		library_namespace.is_Set = is_Set;
		library_namespace.is_Map = is_Map;

		// ---------------------------------------------------------------------//

		var
		// 計數用。
		CONST_COUNT = 0,

		// const: 程序處理方法。
		// {Integer} PARALLEL (平行處理), SEQUENTIAL (循序/依序執行, in order).
		PARALLEL = 0, SEQUENTIAL = 1,

		// const: major status of object.
		// UNKNOWN 不可為 undefined，會造成無法判別。
		UNKNOWN = 'unknown',
		// LOADING, INCLUDING, reloading, reincluding.
		// WORKING = ++CONST_COUNT,
		// 主要的兩種處理結果。
		// IS_OK = ++CONST_COUNT, IS_FAILED = ++CONST_COUNT,
		//
		PROCESSED = ++CONST_COUNT,

		// const: 詳細 status/detailed information of object.
		// LOADING = ++CONST_COUNT, LOAD_FAILED = ++CONST_COUNT,
		//
		INCLUDING = ++CONST_COUNT, INCLUDE_FAILED = ++CONST_COUNT;
		// included: URL 已嵌入/掛上/named source code registered/函數已執行。
		// INCLUDED = ++CONST_COUNT;

		// ---------------------------------------------------------------------//

		/**
		 * 程式碼主檔內建相依性(dependency chain)和關聯性處理 class。
		 * 
		 * @example <code>

		// More examples: see /_test suite/test.js

		 * </code>
		 * 
		 */
		function dependency_chain() {
			this.relations = new Map;
		}

		/**
		 * 取得指定 item 之 relation 結構。<br />
		 * TODO: 無此 item 時，預設不順便加入此 item。
		 * 
		 * @param [item]
		 *            指定 item。未指定 item 時，回傳所有 item 之 Array。
		 * @param {Boolean}[no_add]
		 *            無此 item 時，是否不順便加入此 item。
		 * @returns 指定 item 之 relation 結構。
		 */
		function dependency_chain_get(item, no_add) {
			var relations = this.relations, relation;
			if (arguments.length === 0)
				// 未指定 item 時，回傳所有 items。
				return relations.keys();

			if (!(relation = relations.get(item)) && !no_add)
				// initialization. 為 item 所作的初始化工作。
				relations.set(item, relation = {
					previous : new Set,
					next : new Set,
					// fallback
					item : item
				});

			return relation;
		}

		/**
		 * 將 previous → next (independent → dependent) 之相依性添加進 dependency chain。
		 * 
		 * @param previous
		 *            previous(prior) item.
		 * @param next
		 *            next item.
		 * @returns {dependency_chain} dependency chain
		 */
		function dependency_chain_add(previous, next) {
			if (0 < arguments.length
			//
			&& (previous !== undefined || (previous = next) !== undefined))
				if (previous === next || next === undefined) {
					// initialization. 為 previous 所作的初始化工作。
					this.get(previous);

				} else {
					// 維護雙向指標。
					this.get(previous).next.add(next);
					this.get(next).previous.add(previous);
				}

			return this;
		}

		/**
		 * 自 dependency chain 中，刪除此 item。
		 * 
		 * @param item
		 *            指定欲刪除之 item。
		 * @returns {Boolean} item 是否存在，且成功刪除。
		 */
		function dependency_chain_delete(item) {
			var relation, relations;
			if (!(relation = (relations = this.relations).get(item)))
				// 注意：此處與 ECMAScript [[Delete]] (P) 之預設行為不同！
				return false;

			if (library_namespace.is_debug() && relation.previous.size > 0)
				library_namespace.warn('刪除一個還有 ' + relation.previous.size
						+ ' 個 previous 的元素。循環相依？');

			// 維護雙向指標。
			relation.previous.forEach(function(previous) {
				var next_of_previous = relations.get(previous).next;

				// 維持/傳遞相依關聯性。
				relation.next.forEach(function(next) {
					// 維護雙向指標。

					// assert: previous, next 存在 relations 中。
					// 因此採取下列方法取代 <code>this.add(previous, next);</code> 以加快速度。
					next_of_previous.add(next);
					relations.get(next).previous.add(previous);
				});

				// 一一去除 previous 的關聯性。
				next_of_previous['delete'](item);
			});

			// 一一去除 next 的關聯性。
			relation.next.forEach(function(next) {
				relations.get(next).previous['delete'](item);
			});

			// delete self.
			relations['delete'](item);

			return true;
		}

		/**
		 * 取得需求鏈中獨立之元素 (get the independent one)，<br />
		 * 或者起碼是循環相依(循環參照, circular dependencies)的一員。
		 * 
		 * @param [item]
		 *            指定取得此 item 之上游。
		 * 
		 * @returns 獨立之元素/節點，或者起碼是循環相依的一員。
		 * 
		 * @see <a href="http://en.wikipedia.org/wiki/Loop_dependence_analysis"
		 *      accessdate="2012/12/10 8:54">Loop dependence analysis</a>
		 */
		function dependency_chain_independent(item) {
			var relations = this.relations, no_independent;
			if (relations.size > 0)
				try {
					if (!arguments.length) {
						library_namespace.debug('自 ' + relations.size
								+ ' 個元素中，隨便取得一個沒 previous 的元素。', 5,
								'dependency_chain.independent');
						// 用 for .. of 會更好。
						relations.forEach(function(declaration, _item) {
							library_namespace.debug('item [' + _item + ']', 6,
									'dependency_chain.independent');
							item = _item;
							if (declaration.previous.size === 0)
								throw 1;
						});

						if (library_namespace.is_debug())
							library_namespace
									.warn('dependency_chain.independent: 沒有獨立之元素!');
						no_independent = true;
					}

					var
					// 已經處理過的 item Set。
					chain = new Set,
					// 當前要處理的 item Set。
					current,
					// 下一個要處理的 item Set。
					next = new Set;

					next.add(item);
					item = undefined;

					while ((current = next).size > 0) {
						next = new Set;
						// 針對 item 挑一個沒 previous 的元素。
						current.forEach(function(_item) {
							var declaration = relations.get(_item);
							if (declaration.previous.size === 0) {
								item = _item;
								throw 2;
							}

							if (!chain.has(_item))
								chain.add(_item);
							else {
								// 否則最起碼挑一個在 dependency chain 中的元素。
								item = _item;
								if (no_independent)
									throw 3;
							}

							// 把所有未處理過的 previous 排入 next 排程。
							// 遍歷 previous，找出獨立之元素。
							declaration.previous.forEach(function(previous) {
								// assert: previous !== _item
								if (!chain.has(previous))
									next.add(previous);
								else if (no_independent) {
									item = previous;
									throw 4;
								}
							});

						});
					}
				} catch (e) {
					if (isNaN(e)) {
						library_namespace.warn('dependency_chain.independent: '
								+ e.message);
						library_namespace.err(e);
					}
				}

			return item;
		}

		// public interface of dependency_chain.
		Object.assign(dependency_chain.prototype, {
			get : dependency_chain_get,
			add : dependency_chain_add,
			// quote 'delete' for "必須要有識別項" @ IE8.
			'delete' : dependency_chain_delete,
			independent : dependency_chain_independent
		});

		// export.
		library_namespace.dependency_chain = dependency_chain;

		// ---------------------------------------------------------------------//
		// <b>named source code declaration</b> / <b>module controller</b> 之處理。

		/**
		 * named source code declaration.<br />
		 * named_code = { id : source code declaration }.<br />
		 * assert: is_controller(named_code 之元素) === true.<br />
		 * 
		 * cache 已經 include 了哪些 resource/JavaScript 檔（存有其路徑）/class(函式)。<br />
		 * 預防重複載入。
		 * 
		 * note:<br />
		 * named source code/module 定義: 具 id （預設不會重覆載入）、行使特殊指定功能之 source。<br />
		 * module 特性: 可依名稱自動判別 URL。 預設會搭入 library name-space 中。
		 * 
		 * @inner
		 * @ignore
		 * @type Object
		 */
		var named_code = null_Object();

		/**
		 * 在 module 中稍後求值，僅對 function 有效。<br />
		 * TODO: use get method. TODO: replace 變數.
		 */
		function load_later() {
			var name = String(this);
			if (library_namespace.is_debug()) {
				library_namespace.debug('load_later: 演算 [' + name + ']。', 5,
						'load_later');
				if (name !== this)
					library_namespace.warn('變數名與 "this" 不同！');
			}
			var method;
			try {
				method = library_namespace.value_of(name);
				if (!method || (typeof method !== 'function' &&
				// JScript 中，有些函式可能為object。
				typeof method !== 'object'))
					// 非函式，為常量？
					return method;
				return method.apply(
				// 處理 bind。
				library_namespace.value_of(name.replace(/\.[^.]+$/, '')),
						arguments);
			} catch (e) {
				library_namespace.err(e);
			}
			if (!method) {
				library_namespace.warn('load_later: 無法演算 [' + name + ']！');
				return method;
			}

			if (library_namespace.is_debug())
				library_namespace
						.warn('load_later: 可能是特殊 object，因無法 bind 而出錯。嘗試跳過 bind。');
			var length = arguments.length;
			try {
				if (length > 0)
					return method.apply(null, arguments);
			} catch (e) {
				if (library_namespace.is_debug())
					library_namespace.err(e);
			}

			if (library_namespace.is_debug())
				library_namespace
						.warn('load_later: 可能是特殊 object，因無法 apply 而出錯。嘗試跳過 apply。');
			try {
				switch (length) {
				case 0:
					return method();
				case 1:
					return method(arguments[0]);
				case 2:
					return method(arguments[0], arguments[1]);
				case 3:
					return method(arguments[0], arguments[1], arguments[2]);
				case 4:
					return method(arguments[0], arguments[1], arguments[2],
							arguments[3]);
				default:
					if (length > 5)
						library_namespace.warn('load_later: 共指派了 ' + length
								+ ' 個 arguments，過長。將僅取前 5 個。');
					return method(arguments[0], arguments[1], arguments[2],
							arguments[3], arguments[4]);
				}
			} catch (e) {
				library_namespace.err(e);
			}

			library_namespace.warn('load_later: 無法執行 [' + name
					+ ']！跳過執行動作，直接回傳之。');
			return method;
		}

		/**
		 * Get named source code declaration.<br />
		 * 注意：亦包括 URL/path!!見 check_and_run_normalize()。<br />
		 * 對相同 id 會傳回相同之 declaration。<br />
		 * 
		 * @param {String}name
		 *            source code (module) name/id, URL/path, variable name.
		 * @param {Object}[setup_declaration]
		 *            source code 之設定選項。
		 * 
		 * @return {Object} named source code declaration.
		 */
		function get_named(name, setup_declaration) {
			if (typeof name !== 'string' || !name)
				return name;

			// module declaration/controller.
			var declaration, id,
			// 看看是否為 named source code。
			is_module = library_namespace.match_module_name_pattern(name);

			// TODO:
			// 就算輸入 module path 亦可自動判別出為 module，而非普通 resource。

			// 先嘗試是否為變數/數值名。
			id = library_namespace.value_of(name);
			if (id !== undefined
					&&
					// 若存在此值，且並未載入過（載入過的皆應該有資料），才判別為變數/數值名。
					(!(declaration = library_namespace.to_module_name(name)) || !(declaration in named_code))) {
				library_namespace.is_debug('treat [' + name
						+ '] as variable name.', 2, 'get_named');
				return id;
			}

			// 再看看是否為 named source code。
			if (is_module)
				// 正規化 name。登記 full module name。e.g., 'CeL.data.code'.
				id = declaration || library_namespace.to_module_name(name);
			// 最後看是否為 resource。
			else if (!/^(?:[a-z\-]+:[\/\\]{2}|(?:[.]{2}[\/\\])+)?(?:[^.]+(?:\.[^.]+)*[\/\\])*[^.]+(?:\.[^.]+)*$/i
					.test(id = library_namespace.simplify_path(name))
					&& library_namespace.is_debug())
				library_namespace.warn('get_named: 輸入可能有誤的 URL/path: [' + id
						+ ']');

			if (!(declaration = named_code[id])) {
				if (!is_module
						|| !(declaration = named_code[library_namespace
								.get_module_path(id)])) {
					/**
					 * initialization. 為 declaration 所作的初始化工作。<br />
					 * 因為 URL 可能也具有 named code 功能，因此一視同仁都設定 full function。
					 * 
					 * note:<br />
					 * "use" 是 JScript.NET 的保留字。或可考慮 "requires"。<br />
					 * use -> using because of 'use' is a keyword of JScript.
					 */
					(declaration = named_code[id] = {
						id : id,
						callback : new Set,
						error_handler : new Set,
						load_later : load_later,
						base : library_namespace
					}).use = use_function;
					if (is_module)
						// 判別 URL 並預先登記。但先不處理。
						named_code[library_namespace.get_module_path(id)] = declaration;
				}

				if (is_module) {
					library_namespace.debug('treat resource [' + name
							+ '] as module.', 5, 'get_named');
					declaration.module = id;
					// 若是先 call URL，再 call module，這時需要補充登記。
					if (!(id in named_code))
						named_code[id] = declaration;
				} else {
					library_namespace.debug('treat resource [' + name
							+ '] as URL/path.', 5, 'get_named');
					declaration.URL = id;
				}
			}
			if (declaration.module && declaration.module !== declaration.id)
				id = declaration.id = declaration.module;

			if (library_namespace.is_Object(setup_declaration) &&
			// 已載入過則 pass。
			(!declaration.included || declaration.force)) {
				library_namespace.debug(
						'included' in declaration ? 'named source code [' + id
								+ '] 已經載入過，卻仍然要求再度設定細項。' : '設定 [' + id
								+ '] 之 source code 等 options。', 2, 'get_named');

				var setup_callback = function(name) {
					var i = setup_declaration[name];
					// TODO: 這種判斷法不好。
					if (i) {
						if (typeof i === 'function'
								&& typeof i.forEach !== 'function')
							i = [ i ];
						try {
							if (i && typeof i.forEach === 'function') {
								// 初始設定函式本身定義的 callback 應該先執行。
								// i = new Set(i);
								i = Set_from_Array(i);
								if (i.size > 0) {
									library_namespace.debug('[' + id
											+ '] 初始設定函式本身定義了 ' + i.size + ' 個 '
											+ name + '。', 2, 'get_named');
									declaration[name]
											.forEach(function(callback) {
												i.add(callback);
											});
									declaration[name] = i;
								}
							}
						} catch (e) {
							// TODO: handle exception
						}
					}
				};
				// 需要特別做處理的設定。
				setup_callback('callback');
				setup_callback('error_handler');
				// .finish 會直接設定，不經特別處理！
				if (typeof setup_declaration.extend_to === 'object'
						|| typeof setup_declaration.extend_to === 'function')
					declaration.extend_to = setup_declaration.extend_to;

				// 將 setup_declaration 所有 key of named_code_declaration 之屬性 copy
				// / overwrite 到 declaration。
				library_namespace.set_method(declaration, setup_declaration,
						function(key) {
							return !(key in named_code_declaration);
						}, {
							configurable : true,
							writable : true
						});
			}

			return declaration;
		}

		// {String|Array}name
		function is_included_assertion(name, assertion) {
			if (assertion)
				throw typeof assertion === 'string' ? assertion : new Error(
						'Please include module [' + name + '] first!');
			return false;
		}
		/**
		 * 判斷 module 是否已經成功載入。<br />
		 * 
		 * TODO<br />
		 * 以及檢測是否破損。<br />
		 * prefix.
		 * 
		 * @param {String|Array}name
		 *            resource/module name || name list
		 * @param {Boolean|String}[assertion]
		 *            throw the assertion if NOT included.
		 * 
		 * @returns {Boolean} 所指定 module 是否已經全部成功載入。<br />
		 *          true: 已經成功載入。<br />
		 *          false: 載入失敗。
		 * @returns undefined 尚未載入。
		 */
		function is_included(name, assertion) {
			if (Array.isArray(name)) {
				var i = 0, l = name.length, yet_included = [];
				for (; i < l; i++)
					if (!is_included(name[i]))
						yet_included.push(name[i]);
				if (yet_included.length > 0)
					return is_included_assertion(yet_included, assertion);
				return true;
			}

			if (is_controller(name) || is_controller(name = get_named(name)))
				return name.included;

			return is_included_assertion(name, assertion);
		}
		// export.
		library_namespace.is_included = is_included;

		/**
		 * 解析 dependency list，以獲得所需之 URL/path/module/variable name。<br />
		 * 
		 * note: URL paths 請在 code 中載入。
		 * 
		 * @param {controller}declaration
		 * 
		 * @returns {Array|Object} dependency sequence
		 * @returns {controller}declaration
		 */
		function parse_require(declaration) {
			var code_required = declaration.require;

			if (code_required) {
				library_namespace.debug('解析 [' + declaration.id
				//
				+ '] 之 dependency list，以獲得所需之 URL/path/module/variable name: ['
						+ code_required + ']。', 5, 'parse_require');

				if (typeof code_required === 'string')
					code_required = code_required.split('|');

				if (Array.isArray(code_required)) {
					// 挑出所有需要的 resource，
					// 把需要的 variable 填入 variable_hash 中，
					// 並去除重複。
					var i, require_resource = null_Object(),
					// required variables.
					// variable_hash = {
					// variable name : variable full name
					// }.
					variable_hash = declaration.variable_hash = null_Object();

					code_required.forEach(function(variable) {
						var match = variable.match(/^(.+)\.([^.]*)$/);
						if (match && library_namespace
						//
						.match_module_name_pattern(match[1])) {
							// module/variable name?
							// 類似 'data.split_String_to_Object' 的形式，為 function。
							// 類似 'data.' 的形式，為 module。
							if (match[2])
								variable_hash[match[2]]
								//
								= library_namespace.to_module_name(
								//
								match[1], '.') + '.' + match[2];
							require_resource[match[1]] = null;
						} else {
							// URL/path?
							require_resource[variable] = null;
						}
					});

					// cache. 作個紀錄。
					declaration.require_resource = code_required = [];
					for (i in require_resource)
						code_required.push(i);

					// 處理完把待處理清單消掉。
					delete declaration.require;

				} else
					// TODO: 此處實尚未規範，應不可能執行到。
					library_namespace.warn('無法解析 [' + declaration.id
							+ '] 之 dependency：[' + code_required + ']！');
			}

			if (Array.isArray(code_required) && code_required.length > 0) {
				var require_now = [];
				code_required.forEach(function(item) {
					var declaration = get_named(item);
					// 確定是否還沒載入，必須 load。還沒載入則放在 require_now 中。
					if (is_controller(declaration)
							&& !('included' in declaration))
						require_now.push(item);
				});

				if (Array.isArray(require_now) && require_now.length > 0) {
					library_namespace.debug('檢查並確認 required module/URL，尚須處理 '
							+ require_now.length + ' 項: ['
							+ require_now.join('<b style="color:#47e;">|</b>')
							+ ']。', 5, 'parse_require');
					// 臨時/後續/後來新增
					return [
							SEQUENTIAL,
							require_now.length === 1 ? require_now[0]
									: require_now, declaration ];
				}
			}

			return declaration;
		}

		// ---------------------------------------------------------------------//
		// file loading 之處理。

		// cache
		var document_head, tag_of_type = null_Object(), URL_of_tag = null_Object(), TO_FINISH = null_Object(),
		// 需要修補 load events on linking elements?
		no_sheet_onload = library_namespace.is_WWW(true) && navigator.userAgent,
		// external resource tester.
		external_RegExp = library_namespace.env.module_name_separator,
		// Node.js 有比較特殊的 global scope 處理方法。
		is_nodejs = library_namespace.platform.nodejs,
		// tag_map[tag name]=[URL attribute name, type/extension list];
		tag_map = {
			script : [ 'src', 'js' ],
			link : [ 'href', 'css' ],
			img : [ 'src', 'png|jpg|gif' ]
		};
		external_RegExp = new RegExp('(?:^|\\' + external_RegExp + ')'
				+ library_namespace.env.resource_directory_name + '\\'
				+ external_RegExp + '|^(?:' + library_namespace.Class + '\\'
				+ external_RegExp + ')?'
				+ library_namespace.env.external_directory_name + '\\'
				+ external_RegExp);

		if (no_sheet_onload)
			(function() {
				// Safari css link.onload problem:
				// Gecko and WebKit don't support the onload
				// event on link nodes.
				// http://www.zachleat.com/web/load-css-dynamically/
				// http://www.phpied.com/when-is-a-stylesheet-really-loaded/
				// http://stackoverflow.com/questions/2635814/javascript-capturing-load-event-on-link
				no_sheet_onload = no_sheet_onload.toLowerCase();

				// move from 'interact.DOM'.
				var is_Safari = no_sheet_onload.indexOf('safari') !== NOT_FOUND
						&& no_sheet_onload.indexOf('chrome') === NOT_FOUND
						&& no_sheet_onload.indexOf('chromium') === NOT_FOUND,
				//
				is_old_Firefox = no_sheet_onload.match(/ Firefox\/(\d+)/i);
				if (is_old_Firefox)
					is_old_Firefox = (is_old_Firefox[1] | 0) < 9;

				no_sheet_onload = is_Safari || is_old_Firefox;
				library_namespace.debug(
						'看似需要修補 load events on linking elements.', 5);
			})();

		// TODO: watchdog for link.onload
		// function link_watchdog() {}

		/**
		 * 載入 named source code（具名程式碼: module/URL）。<br />
		 * Include / requires specified module.<br />
		 * 
		 * <p>
		 * 會先嘗試使用 .get_file()，以 XMLHttpRequest
		 * 同時依序(synchronously,會掛住,直至收到回應才回傳)的方式依序取得、載入 module。<br />
		 * 
		 * 若因為瀏覽器安全策略(browser 安全性設定, e.g., same origin policy)等問題，無法以
		 * XMLHttpRequest 取得、循序載入時，則會以異序(asynchronously,不同時)的方式載入 module。<br />
		 * 因為 module 尚未載入，在此階段尚無法判別此 module 所需之 dependency list。
		 * </p>
		 * 
		 * TODO:<br />
		 * unload module.<br />
		 * test: 若兩函數同時 require 相同 path，可能造成其中一個通過，一個未載入?<br />
		 * for <a href="http://en.wikipedia.org/wiki/JSONP"
		 * accessdate="2012/9/14 23:50">JSONP</a>
		 * 
		 * @param {String|Object}item
		 *            source code (module/URL/path) name/id.
		 * @param {Object}[options]
		 *            load options.
		 * @param {Function}[caller]
		 *            當以異序(asynchronously,不同時)的方式載入 module 時，將排入此 caller
		 *            作為回調/回撥函式。
		 * 
		 * @returns {Number} status.<br />
		 *          PROCESSED: done.<br />
		 *          INCLUDE_FAILED: error occurred. fault.<br />
		 *          INCLUDING: loading asynchronously,
		 *          以異序(asynchronously,不同時)的方式載入。<br />
		 */
		function load_named(item, options, caller) {
			var id = typeof item === 'string' ? item : is_controller(item)
					&& item.id,
			//
			force = is_controller(item) && item.force,
			//
			declaration = id && named_code[id];
			if (!id || !is_controller(declaration)) {
				// 內部 bug？
				library_namespace.err('load_named: 沒有 [' + id + '] 的資料！');
				return PROCESSED;
			}

			// id 正規化(normalization)處理。
			id = declaration.id;
			// 預先定義/正規化，避免麻煩。
			if (!library_namespace.is_Object(options))
				options = null_Object();

			// waiting handler
			function waiting() {
				return load_named(item, {
					finish_only : TO_FINISH
				}, caller);
			}

			function run_callback(name) {
				var callback = declaration[name], args, need_waiting = [];
				if (callback) {
					// 因為不能保證 callback 之型態，可能在 module 中被竄改過，
					// 因此需要預先處理。
					if (typeof callback === 'function'
							&& typeof callback.forEach !== 'function')
						callback = [ callback ];
					if (Array.isArray(callback)) {
						// callback = new Set(callback);
						callback = Set_from_Array(callback);
						declaration[name] = new Set;
					}

					// TODO: assert: callback 為 Set。
					if (callback.size > 0
					// && typeof callback.forEach === 'function'
					) {
						// 獲利了結，出清。
						library_namespace.debug('繼續完成 ' + callback.size
								+ ' 個所有原先 ' + name
								+ ' queue 中之執行緒，或是 named source code 所添加之函數。',
								5, 'load_named.run_callback');

						// 作 cache。
						// 需預防 arguments 可被更改的情況！
						args = Array.prototype.slice.call(arguments, 1);

						callback.forEach(library_namespace.env.no_catch
						//
						? function(callback) {
							if (typeof callback === 'function'
									&& callback.apply(declaration, args)
									//
									=== waiting)
								// callback 需要 waiting。
								need_waiting.push(callback);
						} : function(callback) {
							try {
								// 已經過鑑別。這邊的除了 named source code
								// 所添加之函數外，
								// 應該都是 {Function}
								// check_and_run.run。
								// TODO: using setTimeout?
								library_namespace.debug('run ' + name + ' of ['
										+ id + ']: [' + callback + ']', 5,
										'load_named.run_callback');
								if (typeof callback === 'function'
										&& callback.apply(declaration, args)
										//
										=== waiting)
									// callback 需要 waiting。
									need_waiting.push(callback);
							} catch (e) {
								library_namespace.err('執行 [' + id + '] 之 '
										+ name + ' 時發生錯誤！ ' + e.message);
								library_namespace.debug('<code>'
										+ ('' + callback).replace(/</g, '&lt;')
												.replace(/\n/g, '<br />')
										+ '</code>', 1,
										'load_named.run_callback');
							}
						});

						callback.clear();
					}
				}

				// release. 早點 delete 以釋放記憶體空間/資源。
				// assert: declaration.error_handler 為 Set。
				declaration.error_handler.clear();

				if (need_waiting.length > 0) {
					need_waiting.forEach(function(cb) {
						callback.add(cb);
					});
					return true;
				}
			}

			if ('finish_only' in options)
				options.finish_only = options.finish_only === TO_FINISH;

			// 存在 .included 表示已經處理過（無論成功失敗）。
			// URL 已嵌入/含入/掛上/module registered/函數已執行。
			if (force || !('included' in declaration)) {
				if (declaration.code) {
					// ---------------------------------------
					// including code.
					// TODO: 拆開。

					library_namespace.debug(
							'準備嵌入 (include) [<b style="color:#F2a;background-color:#EF0;">'
									+ id + '</b>]。執行 module 初始設定函式。', 2,
							'load_named');

					var initializator, error_Object;
					if (library_namespace.env.no_catch)
						initializator = declaration.code(library_namespace);
					else
						try {
							// 真正執行 module 初始設定函式 / class template。
							// 因為 module 常會用到 library，因此將之當作 argument。
							initializator = declaration.code(library_namespace);
						} catch (e) {
							error_Object = e;
							library_namespace.err('load_named: [' + id
									+ '] 之初始設定函式執行失敗！');
							library_namespace.err(e);
						}

					if (Array.isArray(initializator)) {
						library_namespace.debug('初始設定函式回傳 Array，先轉成 Object。',
								1, 'load_named');
						var list = initializator;
						initializator = null_Object();
						list.forEach(function(method) {
							var name = typeof method === 'function'
									&& library_namespace
											.get_function_name(method);
							if (name) {
								library_namespace.debug('設定 method：[' + name
										+ ']。', 2, 'load_named');
								initializator[name] = method;
							} else {
								library_namespace
										.warn('load_named: 非函式之初始設定值：['
												+ method + ']！');
							}
						});
					}

					if (typeof initializator === 'function'
							|| library_namespace.is_Object(initializator)) {

						library_namespace.debug('預先一層一層定義、準備好 [' + id
								+ '] 之上層 name-space。', 2, 'load_named');
						var module_name_list = library_namespace
								.split_module_name(id),
						//
						i = 0, l = module_name_list.length - 1, name_space = library_namespace, name, sub_name_space;
						for (; i < l; i++) {
							sub_name_space = name_space[name = module_name_list[i]];
							if (!sub_name_space) {
								sub_name_space = name_space[name] = {
									null_constructor_name : library_namespace
											.to_module_name(module_name_list
													.slice(0, i + 1))
								};
								library_namespace.debug('創建 name-space ['
										+ sub_name_space.null_constructor_name
										+ ']', 2, 'load_named');
							}
							name_space = sub_name_space;
						}
						// assert: name_space 這時是 module 的 parent module。
						name = module_name_list[l];
						if (name_space[name])
							if (name_space[name].null_constructor_name) {
								library_namespace.debug(
										'可能因下層 module 先被載入，已預先定義過 [' + id
												+ ']。將把原先的 member 搬過來。', 2,
										'load_named');

								delete name_space[name].null_constructor_name;
								// ** WARNING:
								// 這邊可能出現覆寫基底 method 之情形！
								// e.g., application.debug.log @
								// application.debug

								// ** WARNING:
								// 須注意是否因 name_space 為 function，預設會當作 function
								// 處理，而出問題！
								Object.assign(initializator, name_space[name]);
							} else
								library_namespace.warn(
								//
								'load_named: 已存在 name-space [' + id + ']！');
						// else: 尚未被定義或宣告過

						// TODO: alias

						library_namespace.debug('[' + id
								+ '] 順利執行到最後，準備作 hook 設定。', 3, 'load_named');
						name_space[name] = initializator;

						// 載入 module 時執行 extend 工作。
						var no_extend,
						/**
						 * 擴充目的基底。extend to what name-space。<br />
						 * Extend to specified name-space that you can use
						 * [name_space]._func_ to run it.
						 */
						extend_to = 'extend_to' in declaration ? declaration.extend_to
								/**
								 * 預設會 extend 到 library 本身之下。<br />
								 * extend to root of this library.<br />
								 * 
								 * e.g., call CeL._function_name_ and we can get
								 * the specified function.
								 */
								: library_namespace;

						if (extend_to) {
							library_namespace.debug(
									'設定完 name space。執行擴充 member 的工作。'
									//
									+ (extend_to === library_namespace
									//
									? '將 extend 到 library 本身之下。' : ''), 2,
									'load_named');

							if (no_extend = declaration[library_namespace.env.not_to_extend_keyword]) {
								if (typeof no_extend === 'string')
									no_extend = no_extend.split(',');
								if (Array.isArray(no_extend)) {
									l = null_Object();
									no_extend.forEach(function(i) {
										l[i] = 1;
									});
									no_extend = l;
								}
							}

							if (!library_namespace.is_Object(no_extend))
								no_extend = null_Object();

							// 去掉 function 預設可列舉的成員。
							// Firefox/3.0.19 中，.prototype 亦可列舉。
							// TODO: how to cache.
							(l = function() {
							}).prototype = null_Object();
							for (i in l)
								no_extend[i] = 1;

							if (!('this' in no_extend)) {
								library_namespace.debug('擴充 module 本身到目的基底下。',
										2, 'load_named');
								l = extend_to[name];
								// 只處理雙方皆為 Object 的情況。
								if (typeof l === 'object'
										&& typeof initializator === 'object') {
									library_namespace.debug('目的基底 [' + l.Class
											+ '] 已有 [' + name + ']，將合併/搬移成員。',
											1, 'load_named');
									// 若沒有重新架構，之後的搬移動作可能汙染原先之 name-space!
									if (!('reconstructed' in l))
										extend_to[name] = l = Object.assign({
											reconstructed : true
										}, l);
									for (i in initializator) {
										if (i in l)
											library_namespace.debug('目的基底 ['
													+ name + '] 已有 [' + i
													+ ']，將取代之。', 1,
													'load_named');
										l[i] = initializator[i];
									}

								} else {
									if (l && l.Class)
										library_namespace.warn(
										// 目的基底已有 (l)，將直接以新的 module (id) 取代之。
										'load_named: 將以 ('
										// 未來 extend_to[name] 將代表 (id).
										+ (typeof initializator) + ') [' + id
												+ '] 取代擴充目的基底之同名 module ('
												+ (typeof l) + ') ['
												+ (l.Class || name) + ']。');
									extend_to[name] = initializator;
								}
							}

							if (!('*' in no_extend))
								for (i in initializator) {
									if ((i in no_extend)
											|| extend_to[i] === initializator[i])
										continue;

									if ((i in extend_to)
											&& library_namespace.is_debug())
										library_namespace
												.warn('load_named: 將以 ['
														+ id
														+ '.'
														+ i
														+ '] 取代擴充目的基底之同名 property'
														+ (library_namespace
																.is_debug(2) ? ' ['
																+ extend_to[i]
																+ ']'
																: '') + '。');

									extend_to[i] = initializator[i];
								}
						} else
							library_namespace.debug('跳過擴充 member 之工作。', 5,
									'load_named');

						// 對 name-space 做有必要的操作。
						/**
						 * @see <a
						 *      href="http://developer.51cto.com/art/200907/134913.htm"
						 *      accessdate="2012/12/11 20:51"
						 *      title="JavaScript类和继承：constructor属性 -
						 *      51CTO.COM">JavaScript类和继承：constructor属性</a>
						 */
						if (typeof initializator === 'function') {
							if (!initializator.prototype.constructor)
								initializator.prototype.constructor = initializator;
						}
						if (!initializator.Class)
							initializator.Class = id;

						if (false)
							initializator.toString = function() {
								return '[class ' + name + ']';
							};

						// 設定登記 module 已載入。
						// TODO:
						// 若某 module 很快就 loaded，則剩下的應當亦可很快 loaded。
						// 除非是其他 domain 的。
						declaration.included = true;

					} else {
						if (!error_Object)
							library_namespace.err(error_Object = new Error(
									'load_named: [' + id
											+ '] 之初始設定函式執行成功，但回傳無法處理之值：['
											+ initializator + ']！'));
						declaration.included = false;
						// error callback 僅在每次真正嘗試過後才執行。
						run_callback('error_handler', error_Object);
						if (!item.skip_error)
							return INCLUDE_FAILED;
					}

				} else {

					// ---------------------------------------
					// loading code.
					// TODO: 拆開。

					var file_contents, URL = declaration.URL
							|| library_namespace.get_module_path(id),
					// external_directory_name 下可以放置外部 library/resource files.
					is_external = function(failed) {
						var external = external_RegExp.test(id);
						if (external) {
							declaration.included = !failed;
							library_namespace.debug(
									'由於引用的是 library 外部檔案，自動將之設定為 included '
											+ (declaration.included ? '成功'
													: '失敗') + '。', 5,
									'load_named.is_external');
						}
						return external;
					};

					library_namespace.debug(
							'準備載入 (load) [<a style="color:#ef0;background-color:#018;" href="'
									+ encodeURI(URL) + '">' + id + '</a>]。', 5,
							'load_named');

					// ---------------------------------------
					// loading code: 採用循序/依序執行的方法。

					if (!library_namespace.env.same_origin_policy
							&& /\.js$/i.test(URL))
						try {
							// 對 .js 先試試 .get_file()。
							file_contents = library_namespace.get_file(URL);
							if (library_namespace.is_debug(2)
									&& library_namespace.is_WWW())
								if (typeof file_contents === 'string')
									library_namespace.debug('取得檔案內容: (' +
									//
									file_contents.length + ' bytes) ['
									//
									+ file_contents.slice(0, 200)
									//
									.replace(/ /g, '&nbsp;')
									//
									.replace(/\n/g, '<br />') + ']'
									//
									+ (file_contents.length > 200 ? '..' : ''),
											5, 'load_named');
							if (file_contents) {
								// 對 cscript/wscript，若 /^var variable =
								// /.test(file_contents)，會造成 global 無法設定此
								// variable。
								if (library_namespace.script_host
										//
										&& typeof library_namespace.pre_parse_local_code === 'function')
									file_contents = library_namespace
											.pre_parse_local_code(
													file_contents, URL, id);

								if (is_nodejs)
									// Node.js 有比較特殊的 global scope 處理方法。
									eval(file_contents);
								else
									// eval @ global. 這邊可能會出現 security 問題。
									// TODO: do not use eval. 以其他方法取代 eval 的使用。
									library_namespace.eval_code(file_contents);
								// release. 早點 delete 以釋放記憶體空間/資源。
								file_contents = !!file_contents;
								if (!declaration.module)
									declaration.included = true;

							} else {
								declaration.included = false;
								library_namespace.warn('Get no result from ['
										+ id + ']! Some error occurred?');
							}

							// 以 .get_file() 成功依序載入結束。
							if (!('included' in declaration) && !is_external())
								library_namespace
										.warn('load_named: 雖已處理完 [<a href="'
												+ encodeURI(URL)
												+ '">'
												+ id
												+ '</a>] ，但程式碼並未使用所規範的方法來載入，導致 included flag 未被設定！');

							if (declaration.included) {
								library_namespace.debug(
										'已 include [<a href="' + encodeURI(URL)
												+ '">' + id + '</a>]。', 5,
										'load_named');
								return PROCESSED;
							}

							// Date.now();
							declaration.last_call = new Date();

							// error callback 僅在每次真正嘗試過後才執行。
							run_callback('error_handler');
							if (!item.skip_error)
								return INCLUDE_FAILED;

						} catch (e) {

							// 若為 local，可能是因為瀏覽器安全策略被擋掉了。
							if (!library_namespace.is_local()
									|| library_namespace.is_debug(2)) {
								// http://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
								// http://reference.sitepoint.com/javascript/DOMException
								if (library_namespace
										.is_type(e, 'DOMException')
										&& e.code === 1012) {
									library_namespace
											.err('load_named:\n'
													+ e.message
													+ '\n'
													+ URL
													+ '\n\n程式可能呼叫了一個'
													+ (library_namespace
															.is_local() ? '不存在的，\n或是繞經上層目錄'
															: 'cross domain')
													+ '的檔案？\n\n請嘗試使用相對路徑，\n或 call .run()。');
								} else if (
								// 系統找不到指定的資源/存取被拒。
								library_namespace.is_type(e, 'Error')
										&& (e.number & 0xFFFF) === 5
										|| library_namespace.is_type(e,
												'XPCWrappedNative_NoHelper')
										&& ('' + e.message)
												.indexOf('NS_ERROR_FILE_NOT_FOUND') !== NOT_FOUND) {
									if (library_namespace.is_debug())
										library_namespace
												.err('load_named: 檔案可能不存在或存取被拒？\n['
														+ URL
														+ ']'
														+ (library_namespace.get_error_message ? ('<br />' + library_namespace
																.get_error_message(e))
																: '\n'
																		+ e.message));
								} else if (library_namespace.is_debug())
									library_namespace
											.err('load_named: Cannot load [<a href="'
													+ encodeURI(URL)
													+ '">'
													+ id
													+ '</a>]!'
													+ (library_namespace.get_error_message ? ('<br />'
															+ library_namespace
																	.get_error_message(e) + '<br />')
															: '\n['
																	+ (e.constructor)
																	+ '] '
																	+ (e.number ? (e.number & 0xFFFF)
																			: e.code)
																	+ ': '
																	+ e.message
																	+ '\n')
													+ '抱歉！在載入其他網頁時發生錯誤，有些功能可能失常。\n重新讀取(reload)，或是過段時間再嘗試或許可以解決問題。');
							}

							// 不能直接用 .get_file()，得採用異序(asynchronously,不同時)的方式載入。
							library_namespace.debug(
									'Cannot load [' + id
											+ ']! 以 .get_file() 依序載入的方法失敗：'
											+ e.message, 2, 'load_named');

							// 除非為 eval 錯誤，否則不設定 .included。
							if (!library_namespace.env.same_origin_policy) {
								// 執行 code 時出問題。
								declaration.included = false;
								// error callback 僅在每次真正嘗試過後才執行。
								run_callback('error_handler', e);
								if (!item.skip_error)
									return INCLUDE_FAILED;
							}
						}

					// ---------------------------------------
					// loading code: 循序/依序執行的方法失敗，採用異序(asynchronously,不同時)的方式載入。

					// 若之前已嘗試取得過 code，則即使失敗也不再使用異序(asynchronously,不同時)的方式載入。
					if (!file_contents)
						if (library_namespace.is_WWW()) {
							// 動態載入 / Dynamic Loading / Including other
							// JavaScript/CSS
							// files asynchronously.
							// TODO: http://headjs.com/#theory
							// http://code.google.com/apis/ajax/documentation/#Dynamic
							// http://en.wikipedia.org/wiki/Futures_and_promises

							var type = declaration.type, use_write = item.use_write, node, timeout_id = 'L',
							//
							clean = function(failed) {
								if (timeout_id !== 'L')
									clearTimeout(timeout_id);
								timeout_id = 0;
								onload = null;

								if (type === 'js')
									// callback 完自動移除 .js。
									// 隨即移除會無效。
									// 移除 .css 會失效。
									setTimeout(function() {
										document_head.removeChild(node);
										node = null;
									}, 0);

								try {
									delete node.onload;
								} catch (e) {
									// error on IE5–9: Error: "Object
									// doesn't support this action".
									node.onload = null;
								}
								try {
									delete node.onreadystatechange;
								} catch (e) {
									// error on IE5–9: Error: "Object
									// doesn't support this action".
									node.onreadystatechange = null;
								}

								// 有可能本次載入失敗，但之前已成功過；
								// 這情況下不設定 declaration.included。
								if (!declaration.included) {
									if (!declaration.module)
										// 為 URL/path，只要載入就算成功。
										declaration.included = !failed;
									else if (!is_external(failed))
										if (failed)
											// 載入卻沒設定 included，算失敗。
											declaration.included = false;
										else if (!declaration.variable_hash) {
											library_namespace.warn(
											//
											'load_named: [<a href="'
											//
											+ encodeURI(URL) + '">' + id
											//
											+ '</a>] 的程式碼似乎並未使用所規範的方法來載入？');
											// IE 8 中，當測試不存在的檔案時，
											// 會藉 .readyState ===
											// 'complete'，執行到這邊。
											// 因此除了藉由載入時間，無法分辨檔案到底存不存在。
											declaration.included = UNKNOWN;
										} else if (library_namespace
												.is_debug(2))
											library_namespace
													.warn('load_named: 未能直接載入 (load) ['
															+ id
															+ ']！可能因為 code 還有其他未能掌控，且尚未載入的相依性。');

									if (('included' in declaration)
											&& !declaration.included)
										// error callback 僅在每次真正嘗試過後才執行。
										// 預防還有沒處理的 error callback。
										run_callback('error_handler');
								}

								if ((declaration.included || item.skip_error)
								// 若無 callback 就少耗點資源，別再 call load_named() 了。
								&& declaration.callback
										&& declaration.callback.size > 0)
									// module 若設定了 included 時，
									// 回調/回撥函式應該由 named source code 本身收拾。
									// 這邊不做處理。
									//
									// 這邊呼叫 load_named() 主要是為了利用 load_named()
									// 最後收尾程序的部分。
									load_named(item, options, caller);
							},
							//
							onload = function(e) {
								var r;
								// navigator.platform === 'PLAYSTATION 3' 時僅用
								// 'complete'? from requireJS
								if (timeout_id
										&& (!(r =
										// 'readyState' in this ?
										// this.readyState : e.type !== 'load'
										this.readyState) || r === 'loaded' || r === 'complete'))
									clean();
							};

							try {
								if (type) {
									if (typeof type === 'string')
										type = type.toLocaleLowerCase();
								} else if (type = URL.match(/[^.\\\/]+$/))
									type = type[0].toLocaleLowerCase();

								if (!(node = tag_of_type[type])) {
									library_namespace.warn('無法判別 [' + id
											+ '] 之類型!');
									throw 1;
								}

								if (use_write || type !== 'js'
										&& type !== 'css')
									throw 0;

								// HTML5: document.head ===
								// document.getElementsByTagName('head')[0]
								if (document_head === undefined) {
									if (!(document_head = document.head
											|| document
													.getElementsByTagName('head')[0]))
										(document.body.parentNode || document.body)
												.appendChild(document_head = document
														.createElement('head'));
									if (!document_head)
										document_head = null;
								}
								if (!document_head) {
									library_namespace
											.warn('無法判別 tag &gt;head>!');
									throw 2;
								}

								// TODO: use document.createElementNS()
								// TODO:某些舊版 Firefox 使用 createElement('script')
								// 不被接受，因此可能需要用寫的。
								node = document.createElement(node);
								node.width = node.height = 0;

								// http://www.developer.nokia.com/Community/Wiki/JavaScript_Performance_Best_Practices
								// ** onload 在 local 好像無效?
								// TODO:
								// http://www.xdarui.com/articles/66.shtml
								// 使用 attachEvent 註冊事件，然後用
								// detachEvent。在ie6上就算把onreadystatechange重置為null了，但只是把引用給斷開了，而回調還存在內存之中，只是無法訪問了而已，有可能造成內存的溢出。
								node.onload = node.onreadystatechange = onload;

								switch (type) {
								case 'js':
									node.type = 'text/javascript';
									/**
									 * TODO:<br />
									 * see jquery-1.4a2.js: globalEval<br />
									 * if (is_code) s.text = path;<br />
									 * 
									 * http://www.lampblog.net/2010/12/html5%E4%B8%ADscript%E7%9A%84async%E5%B1%9E%E6%80%A7%E5%BC%82%E6%AD%A5%E5%8A%A0%E8%BD%BDjs/<br />
									 * 如果 async 屬性為
									 * true，則腳本會相對於文檔的其餘部分異步執行，這樣腳本會可以在頁面繼續解析的過程中來執行。<br />
									 * 如果 async 屬性為 false，而 defer 屬性為
									 * true，則腳本會在頁面完成解析時得到執行。<br />
									 * 如果 async 和 defer 屬性均為
									 * false，那麼腳本會立即執行，頁面會在腳本執行完畢繼續解析。<br />
									 * 
									 * http://www.cnblogs.com/darrel/archive/2011/08/02/2124783.html<br />
									 * 當script的 async 屬性被置為 true
									 * 時，腳本的執行序為異步的。即不按照掛載到 Dom 的序順執行 ，相反如果是
									 * false 則按掛載的順序執行。<br />
									 */
									node.async = true;
									// node.setAttribute('src', URL);
									node.src = URL;
									// timeout for giving up.
									if (options.timeout > 0)
										timeout_id = setTimeout(function() {
											// 失敗！
											if (!options.skip_error
													|| library_namespace
															.is_debug())
												library_namespace.warn([
														'load_named: ',
														{
															T : 'Load failed'
														},
														' (',
														{
															T : 'timeout'
														},
														' ' + options.timeout
																+ ' ms): ['
																+ id + ']' ]);
											clean(true);
										}, options.timeout);
									break;
								case 'css':
									node.type = 'text/css';
									// .css 移除會失效。
									// CSS 不設定 timeout。
									// node.media = 'all',//'print'
									node.rel = 'stylesheet';
									// https://developer.mozilla.org/en-US/docs/HTML/Element/link#Stylesheet_load_events
									node.onerror = onload;
									node.href = URL;
									break;

								default:
								}

								// 在 IE 10 中，當 .appendChild() 時，
								// 會先中斷，執行所插入 node 的內容。
								// 因此必須確保在 .appendChild() 前，便已設定好 callback！
								if (caller)
									declaration.callback.add(caller);

								/**
								 * from jquery-1.4a2.js:<br />
								 * Use insertBefore instead of appendChild to
								 * circumvent an IE6 bug when using globalEval
								 * and a base node is found.<br />
								 * This arises when a base node is used (#2709).<br />
								 * 
								 * 不過這會有問題: 後加的 CSS file 優先權會比較高。因此，可以的話還是用
								 * appendChild。
								 * 
								 * @see http://github.com/jquery/jquery/commit/d44c5025c42645a6e2b6e664b689669c3752b236<br />
								 */
								if (false)
									document_head.insertBefore(node,
											document_head.firstChild);
								if (false)
									document_head.parentNode.insertBefore(node,
											document_head);
								document_head.appendChild(node);

								// TODO: This is a ugly hack/workaround.
								if (no_sheet_onload && type === 'css') {
									var test_img = document
											.createElement('img');
									test_img.onerror = function() {
										onload && onload.call(this);
										test_img = null;
									};
									test_img.src = URL;
								}

								declaration.last_call = new Date();

								library_namespace.debug('[' + declaration.id
										+ ']: need asynchronous. 登記完後直接休眠。', 5,
										'load_named');

								// 因無法即時載入，先行退出。
								return INCLUDING;

							} catch (e) {
								if (typeof e !== 'number') {
									declaration.callback['delete'](caller);
									library_namespace.err(e);
								}
								use_write = true;
							}

							if (use_write
							// && TODO: 正在 load 頁面
							) {
								if (library_namespace.is_debug(2)
										&& library_namespace.is_WWW())
									library_namespace
											.debug('直接寫入，Writing code for ['
													+ URL + '].');

								if (!library_namespace.onload_queue)
									library_namespace.onload_queue = [];
								var onload = library_namespace.onload_queue.length, encode_URL = encodeURI(URL);
								// TODO: Not Yet Tested! test callback..
								library_namespace.onload_queue[onload] = function() {
									clean();
								};
								onload = ' onload="' + library_namespace.Class
										+ '.onload_queue[' + onload + ']()"';

								// TODO: 若在 window.onload 之後使用會清空頁面!
								document
										.write(type === 'js' ? '<script type="text/javascript" src="'
												+ encode_URL
												// language="JScript"
												+ '"' + onload + '><\/script>'
												: type === 'css' ?
												// TODO: security concern: 對
												// path 作 filter。
												'<link type="text/css" rel="stylesheet" href="'
														+ encode_URL + '"'
														+ onload + '><\/link>'
												//
												: '<img src="' + encode_URL
														+ '" />');
							}

						} else if (library_namespace.is_debug(2)) {
							library_namespace.warn(
							// 誤在非 HTML 環境執行，卻要求 HTML 環境下的 resource？
							'load_named: No method availed!'
									+ ' 沒有可以載入 resource 的方法！');
						}

					if (!declaration.included)
						library_namespace.warn(
						//
						'load_named: 載入 [' + id + '] 失敗！');
				}

				// force 僅使用一次。
				// delete item.force;

			} else
				library_namespace.debug('之前已處理過 [' + id + '] 之載入程序：'
						+ (declaration.included ? '成功' : '無法') + '載入。', 5,
						'load_named');

			// ---------------------------------------
			// 最後收尾程序。
			if (declaration.included || item.skip_error
			//
			|| options.finish_only) {

				if (options.finish_only) {
					if (library_namespace.is_debug(2)
							&& library_namespace.is_WWW())
						library_namespace.debug('[' + id
								+ '].finish() 已執行完畢。執行回調/回撥函式…', 5,
								'load_named');
				} else {
					// TODO: 將 callback 納入 dependency chain。
					if (library_namespace.is_debug(2)
							&& library_namespace.is_WWW())
						library_namespace.debug('[' + id + '] 已'
								+ (declaration.included ? '成功' : '')
								+ '載入完畢。執行回調/回撥函式…', 5, 'load_named');

					// force 僅使用一次。
					// if (is_controller(item) && item.force) delete item.force;

					// 初始設定函式本身定義的 callback 應該先執行。
					if (run_callback('finish',
					// 傳入 module name space。
					library_namespace.value_of(id), waiting)) {
						if (library_namespace.is_debug(2)
								&& library_namespace.is_WWW())
							library_namespace.debug('[' + id
									+ '].finish() 需要 waiting。等待其執行完畢…', 5,
									'load_named');
						// 因無法即時載入，先行退出。
						return INCLUDING;
					}
				}

				run_callback('callback',
				// 傳入 id。
				id);

				if (library_namespace.is_debug(2) && library_namespace.is_WWW())
					library_namespace.debug('[' + id
							+ '] 之善後/收尾工作函式已執行完畢，清除 cache/stack…', 5,
							'load_named');
				// release. 早點 delete 以釋放記憶體空間/資源。
				// 預防出現問題，如 memory leak 等。
				delete declaration.code;
				delete declaration.finish;
				delete declaration.last_call;
				delete declaration.require_resource;
				delete declaration.variable_hash;
				// delete declaration.use;

				// TODO: destroy item。

				// declaration.status = PROCESSED;
				if (!declaration.included)
					return INCLUDE_FAILED;

			} else if ('included' in declaration) {
				// error callback 僅在每次真正嘗試過後才執行。
				// 這邊不再 run_callback('error_handler');
				return INCLUDE_FAILED;

			} else if (library_namespace.is_debug(2)
					&& library_namespace.is_WWW())
				library_namespace
						.debug(
								'module ['
										+ module
										+ '] is <b>NOT YET</b> loaded。通常為 module code 或呼叫 code 之問題。',
								2, 'load_named');

			library_namespace.debug('[' + id + '] 處理完畢。', 5, 'load_named');
			return PROCESSED;
		}

		// ---------------------------------------------------------------------//

		/**
		 * module_declaration.
		 */
		var named_code_declaration = {
			/**
			 * 本 module 之 module name/id。<br />
			 * TODO: 不設定時會從呼叫時之 path 取得。
			 * 
			 * @type String
			 * @constant
			 * @inner
			 * @ignore
			 */
			name : 'module name',

			// dependency. function name, module name.
			require : 'module.function_name|module_name.',

			/**
			 * 執行成功後，最後階段收拾善後/收尾工作之函式。post action.<br />
			 * 可處理在 module setup/設定 時尚無法完成的工作，例如 including external resources。
			 * 
			 * 因為需要經過特別處理，本設定不可直接匯入！
			 */
			finish : function(name_space, waiting) {
				// in this scope, this === declaration;
				return waiting;
			},
			/**
			 * 執行失敗後之異常/例外處理函式。<br />
			 * error handler, errorcallback, callback on error.<br />
			 * 
			 * 因為需要經過特別處理，本設定不可直接匯入！
			 */
			// error_handler : function(error_Object) { this === declaration; },
			/**
			 * 擴充目的基底。extend to what name-space。<br />
			 * 預設 extend 到哪個 name space。<br />
			 * 
			 * 若有設定，但不為真值，則完全不 extend。
			 * 
			 * 因為需要經過特別處理，本設定不可直接匯入！
			 */
			// extend_to : '',
			/**
			 * 不 extend 到 extend_to 下的 member (property, method) 列表。<br />
			 * '*': 不 extend 所有 member.<br />
			 * this: 連 module 本身都不 extend 到 extend_to 下。
			 * 
			 * @type String
			 * @type Array
			 * @ignore
			 */
			no_extend : 'this,*,no_extend_member',

			/**
			 * 初始設定函式。<br />
			 * 欲 include 整個 module 時，需囊括之 source code。
			 * 
			 * @param {Function}library_namespace
			 *            namespace of library. 通常即 CeL。<br />
			 *            亦可以 this.base 取得。
			 * 
			 * @type Function
			 */
			code : function(library_namespace) {
				/**
				 * full module name.
				 * 
				 * @type {String}
				 */
				var module_name = this.id,
				/**
				 * 呼叫初始設定函式時，採用之初始設定 options/arguments。
				 */
				load_option = this.load_option,
				/**
				 * 預先宣告本模組需要用到的變數名稱。<br />
				 * list of dependency function/module/variable required.<br />
				 * module 須以 CeL.env.module_name_separator ('.') 結尾。<br />
				 * 若輸入 String，則以 (TODO:separator 或) '|' 分割。
				 * 
				 * @type {Array|String}
				 * 
				 * @see parse_require()
				 */
				required_function;
				// 初始設定本模組需要用到的變數。
				eval(this.use());

				// or..
				// nothing required.
				// 本 module 為許多 module 所用，應盡可能勿 requiring 其他 module。

				// 宣告暴露到外部的變量和函數。
				var to_export = function() {
					// null module constructor
				};

				var private_value = 1;
				function get_value() {
					return private_value;
				}

				to_export.method = function() {
					required_function(1, 2, 3);
				};

				// for inherit.
				to_export.grant = function(subclass) {
				};

				// 收尾工作。
				this.finish = function(name_space, waiting) {
					// in this scope, this === declaration;
				};

				return to_export;
			}
		};

		// 本段落接下來為 comments.
		if (false) {
			var named_code_declaration_auto_filled = {

				// 執行完後 callback 原先的執行緒/function。
				callback : new Set,

				// 以下在 setup named source code 時設定。
				base : CeL,
				// for import.
				use : use_function,
				URL : 'path',

				// 載入後設定。
				status : 'included, failed,..',
				included : false
			};

			// code style @_named_code_.js.

			// 'use strict';

			// 若 library base 尚未 load 或本 module 已經 loaded，
			// 則預設會跳過載入。
			typeof CeL === 'function' && CeL.run(named_code_declaration);

			//
			// 載入 module 之方法。
			code.call(module_declaration);
			// release. 早點 delete 以釋放記憶體空間/資源。
			// 預防出現問題，如 memory leak 等。
			delete module_declaration.code;
			delete module_declaration.finish;

			//
			// inherit inside children code.
			var children = parent_code.grant();
		}

		// ---------------------------------------------------------------------//

		/**
		 * 是否為 check_and_run 之 controller。
		 * 
		 * @constant
		 * @private
		 * @inner
		 * @ignore
		 */
		var is_controller = library_namespace.is_Object;

		var
		/**
		 * 可允許被複製的 options。預防不該出現的也被複製了。<br />
		 * 
		 * @constant
		 * @private
		 * @inner
		 * @ignore
		 */
		check_and_run_options = {
			/**
			 * 欲 include 之 module name/id。
			 * 
			 * @type String
			 */
			name : 'module name',
			/**
			 * 欲 include 之 URL/path。
			 * 
			 * @type String
			 */
			URL : 'URL/path',
			/**
			 * not parallel.<br />
			 * Array 之預設 options 為平行處理。
			 * 
			 * @type Boolean
			 */
			sequential : '循序/依序執行',
			/**
			 * 載入 resource 之時間限制 (millisecond)。
			 * 
			 * @type Integer
			 */
			timeout : '載入 resource 之時間限制。',
			/**
			 * 呼叫初始設定函式時，採用之初始設定 options/arguments。
			 */
			load_option : '呼叫初始設定函式時，採用之初始設定 options/arguments。',
			/**
			 * 保證上次 item 執行至此次 item 一定會等超過這段時間 → change .start_time。 TODO
			 * 
			 * @type Integer
			 */
			interval : '時間間隔',
			/**
			 * resource 之 type: 'js', 'css', 'img'.<br />
			 * 未設定則由 extension 自動判別。
			 * 
			 * @type String
			 */
			type : 'MIME type',
			/**
			 * use document.write() instead of insert a element to <head>.
			 * 
			 * @type Boolean
			 */
			use_write : 'use document.write()',
			/**
			 * option 之作用方法。有 'once', 'reset'。
			 * 
			 * @type String
			 */
			operate : 'option 之作用方法。',
			/**
			 * 強制重新加載當前文檔。
			 * 
			 * @type Boolean
			 */
			force : "force reload even it's included.",
			/**
			 * 忽略所有錯誤。<br />
			 * ignore error.
			 * 
			 * @type Boolean
			 */
			skip_error : 'NO stop on error'
		};

		// 全 library 共用之相依關係。這會在外部資源以 .run() 載入時登錄。
		// 因為外部資源的載入除了本身的註記外無法探知。
		// var relation_map = new dependency_chain;

		// ---------------------------------------------------------------------//

		/**
		 * 主要處理程序之內部 front end。<br />
		 * TODO: 為求相容，不用 .bind()。
		 * 
		 * @param {Array}initial_Array
		 *            初始設定 items.
		 * @param {Object}options
		 *            初始設定 options.
		 * @returns {check_and_run}
		 */
		function check_and_run(initial_Array, options) {
			// initialization. 初始化工作。
			this.status = new Map;
			// 紀錄 **正在 load** 之 sequence 所需之 dependency list。
			this.relation_map = new dependency_chain;
			this.run = check_and_run_run.bind(this);

			if (library_namespace.is_debug()) {
				check_and_run.count = (check_and_run.count || 0) + 1;
				var debug_id = 'check_and_run<b style="color:#d42;background-color:#ff4;">['
						+ check_and_run.count
						+ ': %/'
						+ initial_Array.length
						+ ']</b>';
				if (has_native_Object_defineProperty)
					Object.defineProperty(this, 'debug_id', {
						// enumerable : false,
						// configurable : false,
						get : function() {
							return debug_id.replace(/%/,
									this.relation_map.relations.size);
						}
					});
				else
					this.debug_id = debug_id;
				if (library_namespace.is_debug(5))
					library_namespace.log(this.debug_id + ': 初始登記：('
							+ initial_Array.length + ') [' + initial_Array
							+ ']。');
			}

			// 設定好 options。
			this.set_options(options, true);

			this.register(initial_Array);
		}

		/**
		 * use strict mode.<br />
		 * 這得要直接貼在標的 scope 內才有用。
		 */
		function use_strict() {
			var v, i = 0;
			try {
				// find a undefined variable name.
				for (;;)
					eval(v = 'tmp_' + i++);
			} catch (i) {
			}

			try {
				// OK 表示在 eval 中可以設定 var.
				// 若是 'use strict'; 則不可在 eval() 中置新 var.
				eval(v + '=1;delete ' + v);
				return false;
			} catch (i) {
			}
			return true;
		}

		/**
		 * module 中需要 include function/module/variable 時設定 local variables 使用。<br />
		 * 本函數將把所需 function extend 至當前 namespace 下。
		 * 
		 * TODO: auto test strict.
		 * 
		 * @example <code>
		 * //	requires (inside module)
		 * //	事先定義 @ 'use strict';
		 * var split_String_to_Object;
		 * //	之所以需要使用 eval 是因為要 extend 至當前 namespace 下。
		 * //	若無法 load CeL.data，將會 throw
		 * eval(this.use());
		 * //	use it
		 * split_String_to_Object();
		 * 
		 * //TODO
		 * //	不用 eval 的方法 1: function 預設都會 extend 至當前 library_namespace 下。
		 * library_namespace.use_function(this, 'data.split_String_to_Object');
		 * library_namespace.use_function(this, 'data.split_String_to_Object', false);
		 * //	若無法 load CeL.data，將會 throw
		 * //	use it
		 * library_namespace.split_String_to_Object();
		 * 
		 * //TODO
		 * //	不用 eval 的方法 2: 設定 extend_to
		 * var o={};
		 * //	若無法 load CeL.data，將會 throw
		 * library_namespace.use_function(this, 'data.split_String_to_Object', o);
		 * //	use it
		 * o.split_String_to_Object();
		 * </code>
		 * 
		 * @param {Function|Object}extend_to
		 *            把 variable extend 至 name-space extend_to
		 * 
		 */
		function use_function(extend_to, no_strict) {
			if (!is_controller(this)) {
				library_namespace.err('No "this" binded!');
				return '';
			}

			if (no_strict)
				no_strict = [];

			var eval_code = [], variable_name, value, full_name,
			/**
			 * 要 extend 到 extend_to 下的 variables。<br />
			 * function/module/variable required.<br />
			 * 
			 * variable_hash[variable name] = variable full name, <br />
			 * 包括所在 module name。
			 * 
			 * @see check_and_run_normalize()
			 */
			variable_hash = this.variable_hash;

			if (library_namespace.is_Object(variable_hash)) {
				for (variable_name in variable_hash) {
					value = library_namespace
							.value_of(full_name = variable_hash[variable_name]);
					if (extend_to) {
						extend_to[variable_name] = value === undefined ? this.load_later
								.bind(full_name)
								: value;
					} else {
						no_strict && no_strict.push(variable_name);
						eval_code.push('try{' + variable_name + '='
								+ (value === undefined ?
								// 有些 module 尚未載入。
								// 可能因為循環參照(circular dependencies)，
								// 事實上 required 並未 loaded。
								'this.load_later.bind("' + full_name + '")' :
								/**
								 * escaped variable name.<br />
								 * 預防有保留字，所以用 bracket notation。 <br />
								 * 例如 Chrome 中會出現 'Unexpected token native'。
								 * 
								 * @see <a
								 *      href="http://www.dev-archive.net/articles/js-dot-notation/"
								 *      accessdate="2012/12/14 22:58">Dot
								 *      Notation and Square Bracket Notation in
								 *      JavaScript</a>
								 */
								full_name.replace(/\.([a-z\d_]+)/gi, '["$1"]'))
								// throw 到這邊，較可能是因為尚未定義 variable_name。
								// 因此不再嘗試用 load_later。
								+ ';}catch(e){}');
					}
				}
			}

			// 應注意 module_name 為保留字之類的情況，會掛在這邊 return 後的 eval。
			return extend_to
					|| (Array.isArray(no_strict) && no_strict.length > 0 ? 'var '
							+ no_strict.join(',') + ';'
							: '') + eval_code.join('');
		}

		/**
		 * 正規化之前置作業:用於將 item 全部轉為 {Object} controller。
		 * 
		 * @param item
		 *            正規化此 item。
		 * 
		 * @returns 正規化後之 item。
		 */
		function check_and_run_normalize(item) {

			if (item === PARALLEL || item === SEQUENTIAL)
				item = item === SEQUENTIAL;

			var name;

			switch (typeof item) {

			case 'boolean':
				return {
					// 循序/依序執行, one by one. in order / sequentially.
					// successively.
					sequential : item
				};

			case 'number':
				return {
					timeout : item > 0 ? item | 0 : 0
				};

			case 'function':
				// 注意:對 function 有特殊行為，
				// 不 return {Object} controller。
				return item;

			case 'string':
				// 包括 module/URL/path/變數/數值名。
				if (is_controller(name = get_named(item))
						|| typeof name === 'function')
					return name;
				name = undefined;
				break;

			case 'object':
				if (name = is_controller(item)
						&& (item.id || item.name || item.URL)) {
					// 測試是否處於 named source code 中。 item.code 為程式碼(function)。
					// 即使不處於 named source code 中，也應該是有特殊 option 的設定塊。
					// 因此還是得過個 get_named() 正規化一下 .id。
					var is_setup_declaration = typeof item.code === 'function',
					//
					declaration = get_named(name, item);

					if (declaration) {
						if (is_setup_declaration)
							return (declaration.force || !('included' in declaration)) ? parse_require(declaration)
									: declaration;
						library_namespace.debug('正規化載入 id [' + declaration.id
								+ '] 的 controller。', 5,
								'check_and_run_normalize');
						// 將 declaration.{id,name,URL} copy 至 item。
						if (false)
							library_namespace.extend({
								id : 1,
								name : 1,
								URL : 1
							}, item, declaration, 'string');
						library_namespace.set_method(item, declaration, [
								function(key) {
									return typeof declaration[key] !== 'string'
								}, 'id', 'name', 'URL' ]);
					}
				}

			}

			// Array.isArray() 的頻率最高。
			if (Array.isArray(item) || name)
				return item;

			// 其他都將被忽略!
			if (item)
				library_namespace
						.warn('check_and_run.normalize: Unknown item: ('
								+ (typeof item) + ') [' + item + ']!');

		}

		/**
		 * 預設 options。
		 */
		check_and_run.options = {
			// default timeout (millisecond) after options.interval.
			// 若短到 3s， 在大檔案作 auto_TOC() 會逾時。
			timeout : library_namespace.is_local() ? 20000 : 60000
		};

		/**
		 * 設定功能選項。
		 * 
		 * @param {Object}options
		 *            功能選項。
		 * @param {Boolean}reset
		 *            是否重置功能選項。
		 */
		function check_and_run_set_options(options, reset) {
			if (reset)
				Object.assign(this.options = null_Object(),
						check_and_run.options);

			if (library_namespace.is_Object(options)) {
				if (false)
					library_namespace.extend(check_and_run_options,
							this.options, options);

				// TODO: .extend() 預設會 overwrite check_and_run_options.*。
				var i, this_options = this.options;
				for (i in options)
					if (i in check_and_run_options)
						this_options[i] = options[i];
			}
		}

		/**
		 * 登記/注冊整個 array 之元素與相依性。<br />
		 * 增加項目至當前的工作組。
		 * 
		 * @param {Array}array
		 *            欲注冊之 Array。
		 * 
		 * @returns {Number} status.
		 */
		function check_and_run_register(array, previous) {

			// library_namespace.assert(Array.isArray(array));

			// 因為可能動到原 Array，因此重製一個。
			// array = Array.prototype.slice.call(array);
			// 若是在後面還出現與前面相同的元素，則可能造成循環參照(circular dependencies)，此時僅取前面一個相依姓，。
			// array = (new Set(array)).values();

			var i = 0, j, length = array.length, sequential, item, next = array, something_new, relation_map = this.relation_map, status = this.status, _this = this;
			if (length === 0) {
				status.set(array, PROCESSED);
				if (previous !== undefined)
					// 需登記相依性之 array。
					relation_map.add(previous, array);
				return PROCESSED;
			}
			if (status.get(array) === PROCESSED)
				return PROCESSED;

			for (; i < length; i++)
				// 正規化 arguments。
				if ((item = check_and_run_normalize(array[i]))
						&& status.get(item) !== PROCESSED) {

					if (Array.isArray(item)) {
						if (item.length === 0
								|| _this.register(item, previous) === PROCESSED)
							continue;
					} else if (typeof item !== 'function'
							&& (!is_controller(item) || ('included' in item)
									&& !item.force))
						continue;

					if (!is_controller(item) || item === array[i])
						// 若輸入的是純量 option，會造成每次都創建新的 Object。
						// 這會讓此 Array 總是有 something_new。
						something_new = true;

					if (previous !== undefined)
						// 需登記相依性之 array 至 relation map。
						relation_map.add(previous, item);

					// 在中途設定執行次序(running sequence)。
					if (is_controller(item) && ('sequential' in item)
							&& sequential !== (j = !!item.sequential))
						if (sequential = j)
							library_namespace.debug('自 ' + (i + 1) + '/'
									+ length
									+ ' 起依序載入：將元素一個接一個，展開至 relation map。', 5,
									this.debug_id + '.register');
						else {
							// 找出下一個所有平行載入元素都載入完後，才能開始的元素。
							j = i;
							while (++j < length)
								// TODO: cache.
								if (is_controller(next = check_and_run_normalize(array[j]))
										&& next.sequential)
									break;
							if (j === length)
								next = array;
							library_namespace.debug((i + 1) + '-' + j + '/'
									+ length + ' 平行載入：所有 ' + (j - i)
									+ ' 個元素皆 loaded 之後，才算是處理完了 Array。', 5,
									this.debug_id + '.register');
						}

					if (sequential)
						previous = item;
					else
						relation_map.add(item, next);
				}

			if (!something_new)
				// 沒東西。skip.
				return PROCESSED;
			else if (sequential)
				relation_map.add(previous, array);
		}

		/**
		 * check_and_run 之實際載入程序。
		 * 
		 * @returns {Number} status.
		 */
		function check_and_run_run() {
			var item, relation_map = this.relation_map;

			// 解決庫存的工作：
			// 開始測試是否有獨立 object 可直接處理/解決。
			// 對每一項都先找出獨立不依賴它者的，先處理。
			while ((item = relation_map.independent()) || item === 0) {
				// 開始處理當前的 item。

				// 所有加入 relation_map 的應該都已經 normalize 過。
				// item = check_and_run_normalize(item);

				if (typeof item === 'function') {
					library_namespace.debug(
							'直接執行 function ['
									+ (library_namespace
											.get_function_name(item) || item)
									+ ']。', 5, this.debug_id + '.run');
					if (library_namespace.env.no_catch)
						// 當 include 程式碼，執行時不 catch error 以作防範。
						item();
					else
						try {
							// TODO: 可否加點 arguments?
							item();
						} catch (e) {
							library_namespace.err(
							//
							'check_and_run.run: Error to run function: '
									+ e.message);
							library_namespace.debug('<code>'
									+ ('' + item).replace(/</g, '&lt;')
											.replace(/\n/g, '<br />')
									+ '</code>', 5, this.debug_id + '.run');
							return INCLUDE_FAILED;
						}

				} else if (Array.isArray(item)) {
					library_namespace.debug('登記 Array(' + item.length + ') ['
							+ item + ']。', 5, this.debug_id + '.run');
					if (this.register(item) !== PROCESSED)
						// 不清除。繼續處理 Array。
						item = null;

				} else if (is_controller(item)) {
					library_namespace.debug('處理 controller [' + item.id + ']。',
							5, this.debug_id + '.run');

					// import controller.
					// 先處理 options 再載入。
					var options = this.options;
					if (item.operate === 'once')
						options = item;
					else
						this.set_options(item, item.operate === 'reset');

					if (item.id)
						// 若是已處理過則跳過。
						// 因為 item 不一定為 named_code[] 之 declaration，因此只能以
						// is_included() 來判別是否 included。
						if (!item.force && is_included(item.id) !== undefined) {
							library_namespace.debug(
									(is_included(item.id) ? '已經 included'
											: '之前曾 include 失敗')
											+ ': [' + item.id + ']!', 5,
									this.debug_id + '.run');
						} else {
							if (library_namespace.is_debug(2)
									&& library_namespace.is_WWW())
								library_namespace.debug('嘗試'
										+ (is_included(item.id) ? '重新' : '')
										+ '載入 '
										+ (item.module ? 'module' : 'resource')
										+ ' [' + item.id + ']。', 5,
										this.debug_id + '.run');
							// include module/URL resource.
							var result = load_named(item, options, this.run);
							// force 僅使用一次。預防已經重複處理。
							if (item.force)
								delete item.force;
							if (result === INCLUDING) {
								if (false)
									// 在 IE 10 中，當 .appendChild() 時，
									// 會先中斷，執行所插入 node 的內容。
									// 因此必須確保在 .appendChild() 前，便已設定好 callback！
									item.callback.add(this.run);

								// item.status = INCLUDING;

								library_namespace.debug('正等待 loading ['
										+ item.id
										+ '] 中。推入排程開始蟄伏，waiting for callback。',
										5, this.debug_id + '.run');
								return result;
							} else if (result === INCLUDE_FAILED)
								library_namespace.debug('Error to include ['
										+ item.id + ']', 5, this.debug_id
										+ '.run');
							else
								// assert: PROCESSED
								library_namespace.debug('[' + item.id
										+ ']: included.', 5, this.debug_id
										+ '.run');
						}

				} else
					library_namespace.warn('check_and_run.run: Unknown item: ['
							+ item + ']!');

				if (item !== null) {
					// current item is done. 本載入組已全部載入。
					library_namespace.debug('已處理過'
							+ (item.id ? ' [' + item.id + ']' : '此 '
									+ library_namespace.is_type(item))
							+ '，消除其相依關係。', 5, this.debug_id + '.run');
					this.status.set(item, PROCESSED);
					// 執行完清除 relation map 中之登錄。
					relation_map['delete'](item);
				}

				// 移到下一 group/工作組。
			}

			if (relation_map.relations.size > 0) {
				// 確認沒有其他在 queue 中的。
				library_namespace.warn('check_and_run.run: 已無獨立元素，卻仍有 '
						+ relation_map.relations.size + ' 個元素未處理！');
			}

			// destroy this.relation_map。
			// delete this.relation_map;
			library_namespace.debug('本次序列已處理完畢。', 5, this.debug_id + '.run');
		}

		// public interface of check_and_run.
		Object.assign(check_and_run.prototype, {
			set_options : check_and_run_set_options,
			register : check_and_run_register
		});

		// ---------------------------------------------------------------------//
		// for module 操作.

		/**
		 * library 相對於 HTML file 的 base path。<br />
		 * 同目錄時，應為 "./"。
		 * 
		 * @example <code>
		 * // 在特殊環境下，設置 library base path。
		 * var CeL = { library_path : 'path/to/ce.js' };
		 * </code>
		 */
		var library_base_path,

		setup_library_base_path = function() {
			if (!library_base_path) {
				library_base_path = library_namespace.env.registry_path
						|| library_namespace
								.get_script_base_path(library_namespace.env.main_script_name)
						|| library_namespace.get_script_base_path();

				if (!library_base_path
						&& library_namespace.is_Object(library_namespace
								.get_old_namespace())
						&& (library_base_path = library_namespace
								.get_old_namespace().library_path)) {
					if (/^[^\/]/.test(library_base_path)) {
						// library_base_path is relative path
						// library_namespace.debug(library_namespace.get_script_full_name());
						library_base_path = library_namespace
								.simplify_path(library_namespace
										.get_script_full_name().replace(
												/[^\\\/]*$/, library_base_path));
					}
					library_base_path = library_namespace.simplify_path(
							library_base_path).replace(/[^\\\/]*$/, '');
				}

				if (library_base_path) {
					setup_library_base_path = function() {
						return library_base_path;
					};
					library_namespace.debug('library base path: [<a href="'
							+ encodeURI(library_base_path) + '">'
							+ library_base_path + '</a>]', 2,
							'setup_library_base_path');
				} else
					library_namespace
							.warn('setup_library_base_path: Cannot detect the library base path!');
			}

			return library_base_path;
		};

		/**
		 * get the path of specified module.<br />
		 * 外部程式使用時，通常用在 include 相對於 library / module 本身路徑固定的 resource 檔案。<br />
		 * 例如 file_name 改成相對於 library 本身來說的路徑。
		 * 
		 * @example <code>
		 * 
		 * // 存放 data 的 path path =
		 * library_namespace.get_module_path(this, '');
		 * 
		 * </code>
		 * 
		 * @param {String}[module_name]
		 *            module name.<br />
		 *            未提供則設成 library base path，此時 file_name 為相對於 library
		 *            本身路徑的檔案。
		 * @param {String}[file_name]
		 *            取得與 module 目錄下，檔名為 file_name 之 resource file path。<br />
		 *            若填入 '' 可取得 parent 目錄。
		 * 
		 * @returns {String} module path
		 */
		function get_module_path(module_name, file_name) {
			// module_name = get_module_name(module_name);

			library_namespace.debug('test [' + module_name + ']', 4,
					'get_module_path');
			var file_path = library_base_path || setup_library_base_path(),
			//
			separator = file_path.indexOf('\\') === NOT_FOUND ? '/' : '\\';

			file_path += library_namespace.split_module_name(module_name).join(
					separator)
					+ (typeof file_name === 'string' ? (module_name ? separator
							: '')
							+ file_name : (module_name ? ''
							: library_namespace.env.main_script_name)
							+ library_namespace.env.script_extension);

			if (library_namespace.getFP)
				file_path = library_namespace.getFP(file_path, 1);

			library_namespace.debug('Path of module [' + module_name
					+ '] / file [' + file_name + ']: [<a href="'
					+ encodeURI(file_path) + '">' + file_path + '</a>]', 2,
					'get_module_path');

			return file_path;
		}

		// export.
		library_namespace.get_module_path = get_module_path;

		/**
		 * (module 中)模擬繼承時使用。<br />
		 * クラスを継承する。
		 * 
		 * TODO:<br />
		 * thread-safe<br />
		 * initial_arguments 繼承時的 initial arguments。<br />
		 * initializator
		 * 
		 * @param child
		 *            繼承的子類別。
		 * @param parent
		 *            繼承的親類別。
		 * 
		 * @see <a
		 *      href="http://en.wikipedia.org/wiki/Inheritance_(computer_science)"
		 *      accessdate="2012/12/18 18:54">Inheritance</a>,<br />
		 *      <a href="http://fillano.blog.ithome.com.tw/post/257/17355"
		 *      accessdate="2010/1/1 0:6">Fillano's Learning Notes |
		 *      物件導向Javascript - 實作繼承的效果</a>,<br />
		 *      <a href="http://www.crockford.com/javascript/inheritance.html"
		 *      accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>,<br />
		 *      <a href="http://phrogz.net/JS/classes/OOPinJS.html"
		 *      accessdate="2012/12/18 19:16">OOP in JS, Part 1 : Public/Private
		 *      Variables and Methods</a>
		 * 
		 */
		function inherit(child, parent) {
			var i = 1, j, prototype;
			/**
			 * normalize parent.
			 */
			function normalize() {
				if (typeof parent === 'string') {
					library_namespace.debug(
							'get the module namespace of specific parent module name ['
									+ parent + '].', 2, 'inherit');
					parent = library_namespace.value_of(library_namespace
							.to_module_name(parent));
				}
				if (library_namespace.is_Function(parent))
					return parent;
				library_namespace.err('inherit: 無法判別出合理之 parent[' + i + ']！');
			}

			if (!normalize())
				return;

			/**
			 * copy the prototype properties using new.<br />
			 * 另可在 constructor 中: parent.call(this, argument);
			 * 
			 * @see <a
			 *      href="https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Inheritance_Revisited"
			 *      accessdate="2012/12/18 18:59">Inheritance revisited</a>
			 */
			try {
				// Object.setPrototypeOf(prototype, parent.prototype);
				prototype = new parent;
			} catch (e) {
				prototype = parent;
			}
			// TODO
			if (false)
				if (Object.create)
					prototype = Object.create(prototype);

			if (typeof child === 'function')
				// 搬回原先 child 的原型。
				for (j in child.prototype)
					prototype[j] = child.prototype[j];
			else if (!child)
				child = function() {
				};

			(child.prototype = prototype).constructor = child;

			// 處理其他 parent 的 prototype。
			for (var parent_prototype, length = arguments.length; ++i < length;) {
				parent = arguments[i];
				if (normalize()) {
					parent_prototype = parent.prototype;
					for (j in parent_prototype)
						prototype[j] = parent_prototype[j];
				}
			}

			return child;
		}

		// export.
		library_namespace.inherit = inherit;

		// ---------------------------------------------------------------------//

		/**
		 * control/setup source codes to run.<br />
		 * 基本上使用異序(asynchronously,不同時)的方式，<br />
		 * 除非所需資源已經載入，或是有辦法以 {@link XMLHttpRequest} 取得資源。<br />
		 * 
		 * 本函數實為 DOM 載入後，正常 .run 載入處理程序之對外 front end。<br />
		 * 
		 * @param running_sequence
		 * 
		 * running sequence:<br />
		 * {Integer} PARALLEL (平行處理), SEQUENTIAL (循序/依序執行, in order).<br />
		 * {ℕ⁰:Natural+0} timeout (ms): 載入 resource 之時間限制 (millisecond)。<br />
		 * {Array} 另一組動作串 (required sequence): [{String|Function|Integer}, ..] →
		 * 拆開全部當作 PARALLEL loading.<br />
		 * {String} library module name to import, resource (URL/file path)
		 * (e.g., JavaScript/CSS/image) to import.<br />
		 * {Function} function to run/欲執行之 function。<br />
		 * {Object} options: loading with additional config. See
		 * check_and_run_options.
		 * 
		 * @example <code>
		 * </code>
		 * 
		 * 正確:<br />
		 * <code>
		 * CeL.run('code.log', function() {
		 * 	CeL.warn('WARNING message');
		 * });
		 * </code>
		 * 
		 * 錯誤:<br />
		 * <code>
		 * CeL.run('code.log');
		 * //	注意：以下的 code 中，CeL.warn() 不一定會被執行（可能會、可能不會），因為執行時 log 可能尚未被 include。
		 * //	在已經 included 的情況下有可能直接就執行下去。
		 * //	此時應該改用 CeL.run();
		 * CeL.warn('WARNING message');
		 * </code>
		 * 
		 * TODO:<br />
		 * 進度改變時之 handle：一次指定多個 module 時可以知道進度，全部 load 完才 callback()。
		 * 
		 */
		function normal_run() {
			if (arguments.length > 1 || arguments[0]) {
				if (library_namespace.is_debug(2) && library_namespace.is_WWW())
					library_namespace.debug('初始登記/處理 ' + arguments.length
							+ ' items。', 2, 'normal_run');
				var to_run = Array.prototype.slice.call(arguments);
				if (to_run.length > 1)
					// 預設 options 為依序處理。（按順序先後，盡可能同時執行。）
					to_run.unshift(SEQUENTIAL);

				to_run = new check_and_run(to_run);

				library_namespace.debug('做完初始登記，開始跑程序。', 2, 'normal_run');
				return to_run.run();
			}

			library_namespace.debug('未輸入可處理之序列！', 3, library_namespace.Class
					+ 'run', 'normal_run');
		}

		/**
		 * check included resources.
		 * 
		 * @param {String}tag
		 *            tag name to check.
		 * @param {String}URL_attribute
		 *            attribute name of the tag.
		 */
		function check_resource(tag, URL_attribute) {
			if (URL_attribute || (URL_attribute = URL_of_tag[tag]))
				library_namespace.get_tag_list(tag).forEach(
						function(node) {
							var URL = node[URL_attribute];
							if (typeof URL === 'string'
									&& URL
									&& is_controller(URL = get_named(URL
											.replace(/#[^#?]*$/, '')))) {
								library_namespace.debug(
								//
								'add included: [' + URL.id + ']', 2,
										'check_resource');
								URL.included = true;
							}
						});
			else
				library_namespace.warn(
				//
				'check_resource: 無法判別 tag [' + tag + '] 之 URL attribute！');
		}

		// export.
		library_namespace.check_resource = check_resource;

		/**
		 * 設定 library 之初始化程序。
		 */
		var library_initializer = function() {

			setup_library_base_path();

			if (library_namespace.is_WWW()) {
				for ( var tag in tag_map) {
					URL_of_tag[tag] = tag_map[tag][0];
					tag_map[tag][1].split('|').forEach(function(type) {
						tag_of_type[type] = tag;
					});
				}
				[ 'script', 'link' ].forEach(function(tag) {
					check_resource(tag);
				});
			}

			/**
			 * 初始化 user 設定: 處理在 <script> 中插入的初始設定。
			 * 
			 * TODO: 若是設定: <code>
			 * {"run":["css.css","js.js"]}
			 * </code> 則 .js
			 * 可能執行不到，會被跳過。
			 */
			var queue = library_namespace.env.script_config;
			if (library_namespace.is_Object(queue) && (queue = queue.run))
				library_initializer.queue.push(queue);
			queue = library_initializer.queue;

			// 已處理完畢，destroy & set free。
			library_initializer = null;

			// 處理積存工作。
			// export .run().
			return (library_namespace.run = normal_run)(queue);
		};
		library_initializer.queue = [];

		if (!library_namespace.is_WWW() || document.readyState === "complete")
			library_initializer();
		else {
			library_namespace.run = function pre_loader() {
				if (!library_initializer)
					// 已初始化。這是怕有人不用 .run()，而作了 cache。
					return normal_run.apply(null, arguments);

				library_initializer.queue.push(Array.prototype.slice
						.call(arguments));
			};

			/**
			 * 以 event listener 確保初始化程序被執行。
			 * 
			 * @see http://w3help.org/zh-cn/causes/SD9022<br />
			 *      統一為 window 對象的 onload 事件綁定函數，避免在 Firefox 中產生
			 *      document.body.onload 事件理解歧義。<br />
			 *      統一使用 DOM 規範的事件監聽方法（或 IE 專有事件綁定方法）為 IFRAME 標記綁定 onload
			 *      事件處理函數。
			 */
			if (document.addEventListener)
				// https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
				document.addEventListener("DOMContentLoaded",
						library_initializer, false);
			else if (window.attachEvent)
				window.attachEvent("onload", library_initializer);
			else {
				library_namespace
						.debug('No event listener! Using window.onload.');
				if (!window.onload)
					window.onload = library_initializer;
				else
					(function() {
						var old_onload = window.onload;
						window.onload = function() {
							old_onload();
							library_initializer();
						};
					})();
			}
		}

		// ---------------------------------------------------------------------//

	})(CeL);
