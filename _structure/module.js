/**
 * @name	CeL function for module/package
 * @fileoverview
 * 本檔案包含了呼叫其他 library 需要用到的 function。
 * @since	2010/1/8 22:21:36
 */

/**
 * <code>
 TODO:

 瘦身


 等呼叫時才 initialization


 http://headjs.com/#theory
 Head JS :: The only script in your HEAD

 Multiversion Support
 http://requirejs.org/docs/api.html



 <a href="http://msdn.microsoft.com/en-us/library/2b36h1wa.aspx" accessdate="2012/12/19 19:48">arguments Object</a>:
 The arguments object is not available when running in fast mode, the default for JScript. To compile a program from the command line that uses the arguments object, you must turn off the fast option by using /fast-. It is not safe to turn off the fast option in ASP.NET because of threading issues.


 </code>
 */

if (typeof CeL === 'function') {
	(function(_) {

		// var _// JSDT:_module_
		// = this;

		if (false) {
			// IE8 中，以 for ( in ) 迭代，會漏掉這兩個。
			var need_check_toString = (function() {
				var a, OK = 0;
				for (a in {
					valueOf : function() {
					},
					toString : function() {
					},
					p : 1
				})
					if (a === 'valueOf' || a === 'toString')
						OK++;
				return OK !== 2;
			})();

			/**
			 * <code>
			CeL.extend(function f_name(){}, object || string, initial arguments);
			CeL.extend({name:function(){},.. }, object || string);
			CeL.extend([function1,function12,..], object || string);
			
			set .name
			</code>
			 */

			/**
			 * 延展物件 (learned from jQuery):<br />
			 * extend variable_set to name_space.<br />
			 * 將 from_name_space 下的 variable_set 延展/覆蓋到 name_space。<br />
			 * 
			 * @remark MooTools 1.4.5 會 overwrite 此函數!
			 * 
			 * @param {Object|Array|String}variable_set
			 *            欲延展之 variable set.
			 * @param {Object|Function}name_space
			 *            target name-space. extend to what name-space.
			 * @param {Object|Function}from_name_space
			 *            When inputing function names, we need a base
			 *            name-space to search these functions.
			 * @param {true|String|Function}reserve_type
			 *            若已存在此 type (true|String)，或 eval 後回傳 true (function)，則不
			 *            overwrite。
			 * @returns target names-pace
			 * @see <a
			 *      href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/03/01/jquery-extend.aspx"
			 *      accessdate="2009/11/17 1:24" title="jQuery.extend的用法 -
			 *      黑暗執行緒">jQuery.extend的用法</a>,<br />
			 *      <a
			 *      href="http://www.cnblogs.com/rubylouvre/archive/2009/11/21/1607072.html"
			 *      accessdate="2010/1/1 1:40">jQuery源码学习笔记三 - Ruby's Louvre -
			 *      博客园</a>
			 * @since 2009/11/25 21:17:44
			 * @deprecated 2014/5/6 → CeL.set_method()
			 */
			var extend = function(variable_set, name_space, from_name_space,
					reserve_type) {

				if (typeof name_space === 'undefined' || name_space === null) {
					_
							.debug('沒有指定擴展的對象，擴展到 extend.default_target。', 3,
									'extend');
					if (!(name_space = extend.default_target))
						if (name_space === null
								&& typeof from_name_space === 'undefined'
						// && _.is_Object(variable_set)
						)
							return variable_set;
						else
							name_space = {};
				}

				if (typeof from_name_space === 'undefined'
						|| from_name_space === null)
					from_name_space = extend.default_target;
				else if (variable_set === null
						&& _.is_Function(from_name_space))
					variable_set = from_name_space;

				var variable_name, setter = function(v) {
					if (!reserve_type
							|| (
							// true: any type.
							reserve_type === true ? !(variable_name in name_space)
									: typeof reserve_type === 'function' ? !reserve_type(
											name_space[variable_name], v)
											: !_.is_type(
													name_space[variable_name],
													reserve_type))) {

						// Warning: 由於執行時可能處於 log() stack 中，若 log() 會用到
						// extend()，這邊又 call .debug()，可能會循環呼叫，造成 stack overflow。
						if (_.is_debug()) {
							var target_name = _.native_name(name_space);
							// 若更動 native Object 等，則作個警示。
							_.debug((target_name || '(' + _.is_type(name_space)
									+ ')')
									+ '.'
									+ variable_name
									+ ' = ('
									+ (typeof v)
									+ ')'
									+ (_.is_debug(4) || typeof v !== 'function'
											&& typeof v !== 'object' ? ' [' + v
											+ ']' : ''), target_name ? 1 : 3,
									'extend.setter');
						}

						name_space[variable_name] = v;
					}
				};

				if (_.is_Object(variable_set)
				// 若 function 另外處理，依現行實作會出問題！
				|| _.is_Function(variable_set)) {
					if (need_check_toString) {
						if ('valueOf' in variable_set)
							variable_set['. added_' + 'valueOf'] = variable_set.valueOf;
						if ('toString' in variable_set)
							variable_set['. added_' + 'toString'] = variable_set.toString;
					}

					for (variable_name in variable_set) {
						if (need_check_toString)
							variable_name = variable_name.replace(/^\. added_/,
									'');
						if (from_name_space)
							if (variable_name in from_name_space) {
								setter(from_name_space[variable_name]);
								// 這邊的處置可能不甚周延。
							} else {
								if (false && (variable_set[variable_name] in from_name_space))
									setter(from_name_space[variable_set[variable_name]]);
							}
						else
							setter(variable_set[variable_name]);
					}

					if (need_check_toString) {
						if ('valueOf' in variable_set)
							delete variable_set['. added_' + 'valueOf'];
						if ('toString' in variable_set)
							delete variable_set['. added_' + 'toString'];
					}
				} else if (Array.isArray(variable_set)
						&& !Array.isArray(name_space)) {
					variable_set
							.forEach(function(o) {
								if (typeof o === 'object'
										|| (o in from_name_space))
									extend(o, name_space, from_name_space,
											reserve_type);
							});

				} else if (typeof variable_set === 'string') {
					if (!from_name_space) {
						_.debug('預設從本 library 自身 extend to target name-space。',
								3, 'extend');
						from_name_space = _;
					}

					if (name_space === from_name_space)
						_
								.debug('(' + variable_set + '): 目標與來源相同。', 2,
										'extend');
					else if ((variable_name = variable_set) in from_name_space) {
						setter(from_name_space[variable_name]);
						_.debug('(' + (typeof from_name_space[variable_name])
								+ ') ' + variable_name + '\n='
								+ from_name_space[variable_name] + '\n\nto:\n'
								+ name_space, 2, 'extend');
					} else
						try {
							setter(_.value_of(variable_name));
							_.debug('.' + variable_name + ' = '
									+ name_space[variable_name], 2, 'extend');
						} catch (e) {
							_.warn(_.Class + '.extend:\n' + e.message);
						}

				} else if (typeof variable_set === 'function') {
					if (_.parse_function) {
						// TODO
						throw new Error(1,
								'extend: Not Yet Implemented! (for function)');
					} else {
						_.warn(_.Class + '.extend: Warning: Please include '
								+ _.Class + '.parse_function() first!');
					}

				}

				return name_space;
			};

			// extend.default_target = _;

			_// JSDT:_module_
			.extend = extend;
		}

		// .object_hash 之類會用到。
		_.set_method(Array.prototype, {
			indexOf : function indexOf(element, index) {
				index = index > 1 ? Math.floor(index) : 0;
				for (var length = this.length; index < length; index++)
					if (index in this && this[index] === element)
						return index;
				return -1;
			}
		});

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		/**
		 * @examples <code>

		var some_function =  args  =>   some_operators  ;
		var some_function = (args) => { some_operators };
		some_function = CeL.function_placeholder(() => some_function = CeL.some_function || some_function, some_function);

		var some_function = function(args) { some_operators; };
		some_function = CeL.function_placeholder(function(){
			return some_function = CeL.some_function || some_function;
		}, some_function);

		</code>
		 */

		function function_placeholder(setter, fallback) {
			var full_version = setter();
			if (full_version && full_version !== fallback
					&& _.is_Function(full_version)) {
				_.debug('採用完整功能版函數', 1, 'function_placeholder');
			} else {
				full_version = fallback;
			}
			return (full_version || fallback).apply(arguments);
		}
		_.function_placeholder = function_placeholder;

		_// JSDT:_module_
		.
		/**
		 * 設定 name_space 下的 function_name 待執行時換作 initializor 的 return。<br />
		 * 換句話說，執行 name_space 下的 function_name (name_space[function_name]) 時把
		 * name_space[function_name] 換成 new_function (initializor 的 return)。
		 * 
		 * for Lazy Function Definition Pattern.<br />
		 * 惰性求值（lazy evaluation or call-by-need），又稱懶惰求值、懶漢求值。
		 * 
		 * TODO:<br />
		 * 使用本函數不能完全解決先前已經指定 identifier 的情況。<br />
		 * 因此對於會使用本函數的函數，盡量別使用 .use_function() 來 include，否則可能會出現問題!
		 * 
		 * @example <code>
		 * library_namespace.set_initializor('function_name', function(function_name){return function(){};}, _);
		 * </code>
		 * 
		 * @param {String}function_name
		 *            function name to replace: name_space.function_name
		 * @param {Function}initializor
		 *            will return function identifier to replace with
		 * @param name_space
		 *            in which name-space
		 * @returns new_function
		 * @see http://realazy.org/blog/2007/08/16/lazy-function-definition-pattern/,
		 *      http://peter.michaux.ca/article/3556
		 */
		set_initializor = function(function_name, initializor, name_space) {
			var do_replace;
			if (arguments.length < 3 && _.is_Function(function_name)
					&& (do_replace = _.get_function_name(function_name))) {
				// e.g., library_namespace.set_initializor(get_HTA, _);
				name_space = initializor;
				initializor = function_name;
				function_name = do_replace;
				// _.debug('Get function name [' + function_name + '].');
			}

			if (!name_space)
				name_space = _;
			if (!initializor)
				initializor = name_space[function_name];

			do_replace = function() {
				if (false) {
					_.debug(name_space[function_name] === do_replace);
					_.debug(name_space.Class + '[' + function_name + ']='
							+ name_space[function_name]);
					_.debug('do_replace=' + do_replace);
				}
				var old_function = name_space[function_name], new_function;
				if (old_function === do_replace) {
					// 實際執行。
					try {
						new_function = initializor.call(name_space,
								function_name, arguments);
						// new_function = initializor.apply(_, arguments);
						if (false)
							_.debug('new_function = [' + (typeof new_function)
									+ ']' + new_function);
					} catch (r) {
						// 可能因時機未到，或是 initialization arguments 不合適。不作 replace。
						return r;
						// throw r;
					}

					if (typeof new_function !== 'function')
						// 確定會回傳 function 以供後續執行。
						initializor = new_function, new_function = function() {
							if (false)
								_.debug('new function return [' + initializor
										+ '].', 1, 'set_initializor');
							return initializor;
						};

					// searching for other extends
					if (_[function_name] === old_function) {
						_.debug('Replace base name-space function ['
								+ function_name + '].', 1, 'set_initializor');
						_[function_name] = new_function;
					} else
						_.debug('Base name-space function [' + function_name
								+ ']: ' + _[function_name] + '.', 1,
								'set_initializor');

					// 設定 name_space[function_name]。
					_.debug('Replace function [' + function_name + '].', 1,
							'set_initializor');
					name_space[function_name] = new_function;
					if (false) {
						_.debug(name_space[function_name] === do_replace);
						_.debug(name_space.Class + '[' + function_name + ']='
								+ name_space[function_name]);
					}
				} else {
					// 已經替換過。
					if (_.is_debug(2))
						_.warn('set_initializor: The function ['
								+ function_name
								+ '] had replaced with a new one.');
					new_function = old_function;
				}

				// _.debug('new function: ' + new_function);
				// _.debug('return ' + new_function.apply(_, arguments));
				return new_function.apply(_, arguments);
			};

			return name_space[function_name] = do_replace;
		};

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		_.is_HTA = _.is_WWW()
		// http://msdn.microsoft.com/en-us/library/ms536496(v=vs.85).aspx
		// HTAs do not support the AutoComplete in HTML forms feature, or the
		// window.external object.
		&& window.external === null && window.ActiveXObject
				&& document.getElementsByTagName('APPLICATION').length === 1;

		function new_XMLHttpRequest() {
			return new XMLHttpRequest();
		}

		// 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'
		// 'Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0',["MSXML2",
		// "Microsoft", "MSXML"].['XMLHTTP','DOMDocument'][".6.0", ".4.0",
		// ".3.0", ""]
		function new_MS_XMLHTTP() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}

		/**
		 * 設定取得 XMLHttpRequest object 的方法。<br />
		 * The XMLHttpRequest object can't be cached. So we cache the method to
		 * get the XMLHttpRequest controller.
		 * 
		 * 在 HTA 中，XMLHttpRequest() 比 ActiveXObject('Microsoft.XMLHTTP')
		 * 更容易遇到拒絕存取。例如在同一目錄下的 .txt 檔。<br />
		 * 但在 IE 中，ActiveXObject 可能造成主動式內容之問題。<br />
		 * jQuery: Microsoft failed to properly implement the XMLHttpRequest in
		 * IE7, so we use the ActiveXObject when it is available.
		 * 
		 * @inner
		 * @ignore
		 */
		if (_.is_HTA)
			try {
				_.new_XMLHttp = new_MS_XMLHTTP() && new_MS_XMLHTTP;
			} catch (e) {
			}

		if (!_.new_XMLHttp)
			try {
				// normal method to get a new XMLHttpRequest controller.
				// 相當於 new XMLHttpRequest()
				// Ajax 程式應該考慮到 server 沒有回應時之處置
				_.new_XMLHttp = new_XMLHttpRequest() && new_XMLHttpRequest;
			} catch (e) {
			}

		// _.is_HTA 的情況，已經測在前面試過了。
		if (!_.new_XMLHttp && !_.is_HTA)
			try {
				_.new_XMLHttp = new_MS_XMLHTTP() && new_MS_XMLHTTP;
			} catch (e) {
			}

		// 皆無：use XMLDocument.
		// The document.all().XMLDocument is a Microsoft IE subset of
		// JavaScript.
		// http://www.bindows.net/
		// http://www.java2s.com/Code/JavaScriptReference/Javascript-Properties/XMLDocument.htm

		if (_.new_XMLHttp
				// https://github.com/electron/electron/issues/2288
				// How to detect if running in electron?
				// https://github.com/cheton/is-electron/blob/master/index.js
				&& (typeof process !== 'object'
						|| typeof process.versions !== 'object' || !process.versions.electron)) {

		} else if (_.platform.nodejs) {
			// for node.js, node_fs
			_.new_XMLHttp = require('fs');
			_.platform.browser = process.versions.electron ? 'electron'
					: 'node';
			_.platform.version = process.versions.electron
					|| process.versions.node;
			_.platform.OS = process.platform;
			// shortcut for Windows
			_.platform.Windows = _.platform.is_Windows();

			// argument vector
			_.env.argv = process.argv;
			// env hash: see CeL.env.arg_hash @ CeL.application.platform.nodejs

			if (_.platform.browser === 'node')
				_.platform.is_CLI = true;
			else if (_.platform.browser === 'electron')
				// is GUI
				_.platform.is_CLI = false;

			// 為 CLI interactive 互動形式。
			// @see WScript.Interactive @ CeL.application.OS.Windows.job
			_.platform.is_interactive
			// isTTY: 為 nodejs: interactive 互動形式。
			// 但 isTTY 在 command line 執行程式時也會為 true！
			= process.stdout && process.stdout.isTTY
			// Windows 7 to Windows 10
			|| process.env.SESSIONNAME === 'Console';

			// TODO:
			// https://github.com/driverdan/node-XMLHttpRequest/blob/master/lib/XMLHttpRequest.js
			var node_read_file = _.new_XMLHttp = _.new_XMLHttp.readFileSync;

			// The encoding can be 'utf8', 'ascii', or 'base64'.
			// http://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
			_.get_file = function get_file(path, encoding) {
				// for node.js
				if (_.platform.Windows && /^\/[a-z]:\//i.test(path)) {
					// 在 electron package 中，script_base_path 可能形如 '/D:/'...。
					// node.js 在讀取 "/D:/"... 這一種檔案時會轉換成 "/D:/D:/"...
					path = path.slice(1);
				}

				var data, i, l, tmp;
				try {
					data = node_read_file(path, encoding);
				} catch (e) {
					data = node_read_file(path);
				}

				if (typeof data !== 'string') {
					// auto detect encoding
					l = data.length;
					if (data[0] === 255 && data[1] === 254) {
						_.debug(path + ': UTF-16LE', 4);
						// 去掉 BOM。
						// pass byte order mark (BOM), the first 2 bytes.
						i = 2;
						tmp = [];
						while (i < l)
							tmp.push(String.fromCharCode(data[i++] + 256
									* data[i++]));
					} else if (data[0] === 254 && data[1] === 255) {
						_.debug(path + ': UTF-16BE', 4);
						// pass byte order mark (BOM), the first 2 bytes.
						i = 2;
						tmp = [];
						while (i < l)
							tmp.push(String.fromCharCode(256 * data[i++]
									+ data[i++]));
					} else if (!encoding && data[0] === 239 && data[1] === 187
							&& data[2] === 191) {
						// 或許是存成了 UTF-8？
						// https://en.wikipedia.org/wiki/Byte_order_mark#Representations_of_byte_order_marks_by_encoding
						_.debug('get_file: Treat file as UTF-8 with BOM: ['
								+ path + ']', 2);
						// tmp = null;
						if (false) {
							// http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_options
							data = node_read_file(path, 'utf8')
							// pass byte order mark (BOM), the first 1 byte:
							// \uFEFF.
							.slice(1);
						} else {
							// console.log([ path, data.slice(0, 10) ]);
							// assert: data.toString().charCodeAt(0) === 65279
							// data.toString().charAt(0) === \uFEFF

							// buffer.toString('utf8', 0, length);
							data = data.toString(/* Default: 'utf8' */)
							// pass byte order mark (BOM), the first 1 byte:
							// \uFEFF.
							// 採用 data.toString('utf8', 3)，奇怪的是有時仍然會得到
							// [65279,...] @ node.js 14.7.0 。
							// 不如全部 .toString() 之後再 .slice(1)。
							.slice(1);
						}

					} else
						try {
							i = node_read_file(path, 'utf8');
							_.debug('get_file: Treat file as UTF-8: [' + path
									+ ']', 2);
							// tmp = null;
							data = i;
						} catch (e) {
							// console.warn(e);
							if (l > 1)
								_
										.debug('get_file: Unknown byte order mark (BOM) of ['
												+ path
												+ ']: '
												+ data[0]
												+ ','
												+ data[1]);
							// 當作 ASCII 處理。
							i = 0;
							tmp = [];
							while (i < l)
								// data.toString('utf-8', 0, length);
								tmp.push(String.fromCharCode(data[i++]));
						}
					if (tmp)
						data = tmp.join('');
				}

				return data;
			};

		} else if (typeof _configuration === 'object'
		// for jslibs
		&& typeof File === 'function') {
			_.platform.browser = 'jsio';
			LoadModule('jsio');
			_.get_file = function(path) {
				// _configuration.stderr(path);
				var c, i, data = new File(path).Open('r').Read(), l = data.length, tmp = [], next_code = function() {
					c = data.charCodeAt(i++);
					return c < 0 ? c + 256 : c;
				};

				_configuration.stderr(path + ': ' + data.charCodeAt(0) + ','
						+ data.charCodeAt(1));
				if (data.charCodeAt(0) === -1 && data.charCodeAt(1) === -2) {
					// _.debug(path + ': UTF-16LE');
					for (i = 2; i < l;)
						tmp.push(String.fromCharCode(next_code() + 256
								* next_code()));
					data = tmp.join('');
				} else if (data.charCodeAt(0) === -2
						&& data.charCodeAt(1) === -1) {
					// _.debug(path + ': UTF-16BE');
					for (i = 2; i < l;)
						tmp.push(String.fromCharCode(next_code() * 256
								+ next_code()));
					data = tmp.join('');
				}

				return data;
			};

		} else if (typeof Stream === 'function') {
			// for JSDB
			_.platform.browser = 'JSDB';
			_.get_file = function(path) {
				// _.log('get_file: ' + path);
				try {
					return new Stream(path
					// , 'r'
					).readFile();
				} catch (e) {
					// _.log(e.message);
				}

				var data = new Stream(path, 'b'), tmp = [],
				// The byte order mark (BOM).
				BOM = [ data.readUInt8(), data.readUInt8() ];
				if (BOM[0] === 255 && BOM[1] === 254) {
					// _.debug(path + ': UTF-16LE');
					while (!data.eof)
						tmp.push(String.fromCharCode(data.readUInt8() + 256
								* data.readUInt8()));
				} else if (BOM[0] === 254 && BOM[1] === 255) {
					// _.debug(path + ': UTF-16BE');
					while (!data.eof)
						tmp.push(String.fromCharCode(data.readUInt8() * 256
								+ data.readUInt8()));
				} else {
					data.rewind();
					while (!data.eof)
						tmp.push(data.get());
				}
				data.close();
				return tmp.join('');
			};

		} else
			_.get_file = function() {
				// No XMLHttpRequest controller.

				var m = 'get_file: This scripting engine does not support XMLHttpRequest.';
				_.warn(m);
				throw new Error(m);
				// firefox: This function must return a result of type any.
				// return undefined;
			};

		_// JSDT:_module_
		.
		/**
		 * Ask privilege in mozilla projects: Firefox 2, 3.<br />
		 * get_file() 遇到需要提高權限時使用。<br />
		 * enablePrivilege 似乎只能在執行的 function 本身或 caller 呼叫才有效果，跳出函數即無效，不能
		 * cache，因此提供 callback。<br />
		 * 就算按下「記住此決定」，重開瀏覽器後需要再重新授權。
		 * 
		 * @param {String|Error}
		 *            privilege privilege that asked 或因權限不足導致的 Error
		 * @param {Function|Array}
		 *            callback|[callback,arguments] Run this callback if getting
		 *            the privilege. If it's not a function but a
		 *            number(經過幾層/loop層數), detect if there's a loop or run the
		 *            caller.
		 * @returns OK / the return of callback
		 * @throws error
		 * @since 2010/1/2 00:40:42
		 */
		require_netscape_privilege = function require_netscape_privilege(
				privilege, callback) {
			var _s = require_netscape_privilege, f, i,
			/**
			 * raise error. error 有很多種，所以僅以 'object' 判定。
			 * 
			 * @inner
			 * @ignore
			 */
			re = function(m) {
				// _.debug('Error: ' + m);
				throw privilege && typeof privilege === 'object' ?
				// Error object
				privilege :
				// new Error (message)
				new Error(m);
			};

			if (!_s.enabled)
				re('Privilege requiring disabled.');

			// test loop
			// 得小心使用: 指定錯可能造成 loop!
			if (!isNaN(callback) && callback > 0 && callback < 32) {
				try {
					/**
					 * @Firefox 4: <code>
					 * TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
					 * </code>
					 */
					for (f = _s, i = 0; i < callback; i++) {
						f = f.caller;
						if (f)
							// TODO: do not use arguments
							f = f.arguments.callee;
					}

					if (f === _s)
						// It's looped
						re('Privilege requiring looped.');

					callback = 1;

				} catch (e) {
					// TODO: handle exception
				}

			}

			f = _s.enablePrivilege;
			// _.debug('enablePrivilege: ' + f);
			// '我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。'
			if (!f
					&& !(_s.enablePrivilege = f = _
							.value_of('netscape.security.PrivilegeManager.enablePrivilege')))
				// 更改設定，預防白忙。
				_s.enabled = false, re('No enablePrivilege get.');

			if (_.is_type(privilege, 'DOMException') && privilege.code === 1012)
				// http://jck11.pixnet.net/blog/post/11630232
				// Mozilla的安全機制是透過PrivilegeManager來管理，透過PrivilegeManager的enablePrivilege()函式來開啟這項設定。
				// 須在open()之前呼叫enablePrivilege()開啟UniversalBrowserRead權限。

				// http://code.google.com/p/ubiquity-xforms/wiki/CrossDomainSubmissionDeployment
				// Or: In the URL type "about:config", get to
				// "signed.applets.codebase_principal_support" and change its
				// value to true.

				// 由任何網站或視窗讀取私密性資料
				privilege = 'UniversalBrowserRead';

			else if (!privilege || typeof privilege !== 'string')
				re('Unknown privilege.');

			// _.debug('privilege: ' + privilege);
			try {
				if (false)
					_.log(_.Class
							+ '.require_netscape_privilege: Asking privilege ['
							+ privilege + ']..');
				f(privilege);
			} catch (e) {
				if (privilege !== 'UniversalBrowserRead' || !_.is_local())
					_
							.warn(_.Class
									+ '.require_netscape_privilege: User denied privilege ['
									+ privilege + '].');
				throw e;
			}

			// _.debug('OK. Get [' + privilege + ']');

			if (callback === 1) {
				// _.debug('再執行一次 caller..');
				try {
					callback = _s.caller;
				} catch (e) {
					// TODO: handle exception
				}
				return callback.apply(_, callback.arguments);

				if (false) {
					i = callback.apply(_, callback.arguments);
					_.debug(('return ' + i).slice(0, 200));
					return i;
				}
			} else if (_.is_Function(callback))
				// 已審查過，為 function
				return callback();
			else if (Array.isArray(callback))
				return callback[0].apply(_, callback[1]);
		};

		/**
		 * 當需要要求權限時，是否執行。（這樣可能彈出對話框）<br />
		 * Firefox 5 之後，就算要求了，對 local 也沒用，甚至會 hang 住掛掉，因此取消了。
		 * 
		 * @type Boolean
		 */
		_// JSDT:_module_
		.require_netscape_privilege.enabled = false;

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		var is_Opera = _.is_WWW(true) && navigator.appName === 'Opera';

		/**
		 * 以同時依序(synchronously)的方式，載入最基本之資源取得功能。<br />
		 * Get resource files by {@link XMLHttpRequest}.<br />
		 * 依序載入 resources，用於 include JavaScript 檔之類需求時，取得檔案內容之輕量級函數。<br />
		 * 除 Ajax，本函數亦可用在 CScript 執行中。<br />
		 * see also: .application.net.Ajax.get_URL()
		 * 
		 * @example<code>

		//	get contents of [path/to/file]:
		var file_contents = CeL.get_file('path/to/file');

		</code>
		 * 
		 * @param {String}
		 *            path URI / full path.
		 *            <em style="text-decoration:line-through;">不能用相對path！</em>
		 * @param {String}
		 *            [encoding] file encoding
		 * @returns {String} data content of path
		 * @returns {undefined} when error occurred: no Ajax function, ..
		 * @throws uncaught
		 * exception @ Firefox: 0x80520012 (NS_ERROR_FILE_NOT_FOUND), <a
		 *           href="http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#exceptions">NETWORK_ERR</a>
		 *           exception
		 * @throws 'Access
		 * to restricted URI denied' 當 access 到上一層目錄時 @ Firefox
		 * @see <a
		 *      href=http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx">Cross
		 *      Site AJAX</a>, <a
		 *      href="http://domscripting.com/blog/display/91">Cross-domain Ajax</a>,
		 *      <a
		 *      href="http://forums.mozillazine.org/viewtopic.php?f=25&amp;t=737645"
		 *      accessdate="2010/1/1 19:37">FF3 issue with iFrames and XSLT
		 *      standards</a>, <a
		 *      href="http://kb.mozillazine.org/Security.fileuri.strict_origin_policy"
		 *      accessdate="2010/1/1 19:38">Security.fileuri.strict origin
		 *      policy - MozillaZine Knowledge Base</a> Chrome: <a
		 *      href="http://code.google.com/p/chromium/issues/detail?id=37586"
		 *      title="between builds 39339 (good) and 39344 (bad)">NETWORK_ERR:
		 *      XMLHttpRequest Exception 101</a>
		 */
		function get_file(path, encoding, post_data) {
			if (_.is_Object(encoding)) {
				post_data = encoding;
				encoding = null;
			}
			if (_.is_Object(path)) {
				post_data = path.post || post_data;
				encoding = path.encoding || encoding;
			}

			var method = post_data ? 'POST' : 'GET',
			/**
			 * The XMLHttpRequest object can't be cached.
			 * 
			 * @inner
			 * @ignore
			 */
			object = _.new_XMLHttp();

			// 4096: URL 長度限制，與瀏覽器有關。
			if (typeof path === 'string' && path.length > 4096
					&& (post_data = path.match(/^([^?]{6,200})\?(.+)$/)))
				path = post_data[1], post_data = post_data[2], method = 'PUT';
			else
				post_data = null;

			try {
				// IE 10 中，local file 光 .open() 就 throw 了。
				object.open(method, path, false);

				// 有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type
				// 檔頭（header）時會出錯。為了避免這個問題，可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
				// http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
				// http://www.w3.org/TR/XMLHttpRequest/ search encoding
				if (encoding && object.overrideMimeType)
					/**
					 * old:<code>
					object.overrideMimeType('text/xml;charset=' + encoding);
					</code>
					 * 但這樣會被當作 XML 解析，產生語法錯誤。
					 * 
					 * TODO:<br />
					 * try:<code>
					object.overrideMimeType('text/plain;charset=' + encoding);
					</code>
					 */
					object.overrideMimeType('application/json;charset='
							+ encoding);

				// http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#dfn-send
				// Invoking send() without the data argument must give the same
				// result as if it was invoked with null as argument.

				// 若檔案不存在，會 throw。
				object.send(post_data);

				if (65533 === object.responseText.charCodeAt(0)
				/**
				 * e.g., @ <code>Mozilla/5.0 (Windows NT 6.1; rv:29.0) Gecko/20100101 Firefox/29.0</code>
				 */
				&& navigator.userAgent.indexOf(' Gecko/2') !== -1) {
					_.env.same_origin_policy = true;
					var error = new Error(
							'get_file: Can not parse UTF-32 encoding of ['
									+ path + '] @ Firefox!');
					// 於 load_name() 使用，避免顯示 '重新讀取(reload)，或是過段時間再嘗試或許可以解決問題。'
					error.type = 'encode';
					throw error;
				}

				delete get_file.error;

			} catch (e) {
				if (e.number === -1072896658
				// || e.message.indexOf('c00ce56e') !== -1
				) {
					// http://support.microsoft.com/kb/304625
					throw new Error(
							'指定的資源回傳了系統不支援的文字編碼，因此無法解碼資料。請檢查此網頁回傳之 header，確認系統可解碼 Content-Type 之 charset。');
				}

				/**
				 * Chome:
				 * <code>XMLHttpRequest cannot load file:///X:/*.js. Cross origin requests are only supported for HTTP.</code>
				 * 
				 * Opera 11.50: 不會 throw，但是 .responseText === ''。
				 * 
				 * Apple Safari 3.0.3 may throw NETWORK_ERR: XMLHttpRequest
				 * Exception 101
				 */
				get_file.error = e;

				if (_.is_debug(2)) {
					_.warn(_.Class + '.get_file: Loading [' + path
							+ '] failed!');
					_.error(e);
				}

				/** <code>[XPCWrappedNative_NoHelper] Cannot modify properties of a WrappedNative @ firefox</code> */
				// e.object = o;
				if (
				// 5: 系統找不到指定的資源。/存取被拒。
				// IE 10 中，5: "存取被拒。"。same origin policy 下，即使是檔案存在，值一樣為
				// 5，因此無法以資判別。
				// (e.number & 0xFFFF) !== 5 &&
				_.is_WWW()
						&& (_.is_local() || ((object = path
								.match(/:(\/\/)?([^\/]+)/)) && object[2] !== window.location.hostname))) {
					// 八九不離十: no Cross-site scripting (XSS).
					if (_.is_debug()) {
						_
								.warn('get_file: '
										+ (_.is_local() ? '呼叫了上層 local file'
												: '所要求檔案之 domain ['
														+ object[2]
														+ '] 與所處之 domain ['
														+ window.location.hostname
														+ '] 不同')
										+ '！<br />\n您可能需要嘗試使用 '
										+ _.Class
										+ '.run()!\nSet up <a href="http://en.wikipedia.org/wiki/Same_origin_policy" accessdate="2012/12/2 18:19">same origin policy</a> flag.');
					}
					_.env.same_origin_policy = true;
					throw new Error('get_file: Different domain!');
				}

				object = _.require_netscape_privilege(e,
						[ get_file, arguments ]);
				if (false)
					_.debug('require_netscape_privilege return ['
							+ typeof (object) + ('] ' + object).slice(0, 200)
							+ ' ' + (e === object ? '=' : '!') + '== '
							+ 'error (' + e + ')');
				if (e === object)
					throw e;

				return object;
			}

			// workaround for Opera: Opera 11.50:
			// 不會 throw，但是 .responseText === ''。
			if (object.responseText === '' && is_Opera)
				throw new Error('get_file: Nothing get @ Opera');

			// 當在 local 時，成功的話 status === 0。失敗的話，除 IE 外，status 亦總是 0。
			// status was introduced in Windows Internet Explorer 7.
			// http://msdn.microsoft.com/en-us/library/ms534650%28VS.85%29.aspx
			// 因此，在 local 失敗時，僅 IE 可由 status 探測，其他得由 responseText 判別。
			if (false)
				_.debug('Get [' + path + '], status: [' + object.status + '] '
						+ object.statusText);

			// .responseXML
			return object.status === 400 ? [ object.status, object.responseText ]
					: object.responseText;
		}

		if (!_.get_file)
			_.get_file = get_file;

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		/**
		 * 較為安全的執行，可當作 JSON.parse()。<br />
		 * we only need simple JSON.parse @ .get_script_base_path
		 * 
		 * @param {String}text
		 *            string to evaluate
		 * @param {Boolean}cache_error
		 *            是否 cache error.<br />
		 *            Warning: deprecated. 請自行 cache.
		 * @param {Function}[filter]
		 *            callback/receiver to filter the value<br />
		 *            Warning: deprecated. Please use Object.filter () instead.
		 * 
		 * @returns evaluated value
		 */
		function eval_parse(text, cache_error, filter) {
			if (cache_error)
				try {
					return eval_parse(text, filter);
				} catch (e) {
					if (_.is_debug(2))
						_.error('eval_parse: SyntaxError: [' + text + ']');
					// throw e;
					return;
				}

			if (text)
				// borrow from Google, jQuery
				// TODO: 對 {String}text 只是做簡單處理，勢必得再加強。
				text = ((new Function("return({o:" + text + "\n})"))()).o;

			return text;
		}
		_.parse_JSON = _.eval_parse = eval_parse;
		if (typeof JSON === 'object' && JSON.parse)
			(function() {
				var t;
				try {
					t = JSON.parse('{"V":"1","v":1}');
				} catch (e) {
				}
				if (_.is_Object(t) && t.V === '1' && t.v === 1)
					_.parse_JSON = JSON.parse;
				else
					// 未正確作動。
					_.error('It seems the JSON.parse() does not work properly');
			})();

		// see Array.from of dependency_chain.js
		function tag_list_default(tag, context) {
			// 必須考量輸入的可能是 document.styleSheets 的情況。
			// 須注意: @ IE8, false === CeL.is_NodeList(document.styleSheets);
			return tag
					&& Array.prototype.slice
							.call(typeof tag === 'string' ? (context || document)
									.getElementsByTagName(tag)
									: tag) || [];
		}
		function tag_list_compatible(tag, context) {
			var list = [], i = 0, nodes = typeof tag === 'string' ? (context || document)
					.getElementsByTagName(tag)
					: tag, length = nodes && nodes.length || 0;
			while (i < length)
				list.push(nodes[i++]);
			return list;
		}
		_// JSDT:_module_
		.
		// 代替 .getElementsByTagName(), get <tag> nodes, 並將之轉成不變化的 native Array.
		get_tag_list = _.is_WWW(1) ? function(tag, context) {
			var list;
			try {
				// 一般做法。
				list = tag_list_default(tag, context);
				_.get_tag_list = tag_list_default;
			} catch (e) {
				// Array.prototype.slice.call(document.getElementsByTagName('a'))
				// Array.prototype.slice.call(document.getElementsByTagName('a'),0)
				// get error @ IE8 (Script engine: JScript 5.8.18702):
				// Error 5014 [TypeError] (facility code 10): 必須要有 JScript 物件
				// @ IE8: typeof document.getElementsByTagName('a') === 'object'
				list = tag_list_compatible(tag, context);
				// 成功才設定。
				if ((e.number & 0xFFFF) === 5014) {
					_.debug('get_tag_list: 使用舊的實現方法。');
					_.get_tag_list = tag_list_compatible;
				}
			}
			return list;
		} : function() {
			_.warn('get_tag_list: No method availed!');
			return [];
		};

		_// JSDT:_module_
		.
		/**
		 * 得知 script file 之相對 base path
		 * 
		 * @param {String}
		 *            JSFN script file name (NOT path name)
		 * @returns {String} relative base path
		 * @example <code>
		<script type="text/javascript" src="../baseFunc.js"></script>
		// 引數為本.js檔名。若是更改.js檔名，亦需要同時更動此值！
		var base_path = CeL.get_script_base_path('baseFunc.js');

		const main_script_path = CeL.get_script_base_path(/\.js/i, module);

		# perl:
		use File::Basename;
		</code>
		 */
		get_script_base_path = function(JSFN, terminal_module) {
			if (terminal_module === undefined && typeof module === 'object')
				terminal_module = module;

			// alert('JSFN: ' + JSFN);
			if (!JSFN) {
				if (_.is_WWW()) {
					// unescape(window.location.pathname)
					JSFN = unescape(window.location.href);
				} else if (typeof terminal_module === 'object') {
					// for node.js
					JSFN = terminal_module.filename;
				} else if (_.script_host) {
					JSFN = WScript.ScriptFullName;
				} else if (false && typeof WshShell === 'object') {
					// 用在把檔案拉到此檔上時不方便。
					JSFN = WshShell.CurrentDirectory;
				}
				return typeof JSFN === 'string' ? JSFN.replace(/[^\\\/]+$/, '')
						: '';
			}

			// ----------------------------------

			// console.log([ typeof require, typeof require.main ]);
			// console.trace(require.main);
			var filename, test_filename = function(module) {
				var path = module.filename;
				if (false) {
					console.log('get_script_base_path: ' + JSFN + ' @ ' + path);
				}
				if (path
				// 在 electron 中可能會是 index.html 之類的。
				// && /\.js/i.test(path)
				&& (_.is_RegExp(JSFN) ? JSFN.test(path)
				//
				: path.indexOf(JSFN) !== -1)) {
					filename = path;
				}
			};
			if (typeof require === 'function'
			// There is no `require.main` @ electron 9.2-
			&& typeof require.main === 'object') {
				// for node.js 14.7+
				var _module = require.main;
				filename = null;
				while (_module) {
					test_filename(_module);
					if (_module === terminal_module)
						break;
					_module = _module.children;
				}
				if (!filename && terminal_module)
					test_filename(terminal_module);
				if (filename)
					return filename;
			}

			// There is no `module.parent` @ node.js 14.7+
			if (typeof module === 'object') {
				// for electron
				var _module = module;
				filename = null;
				while (_module) {
					// Warning: 此處不計 `terminal_module`!
					test_filename(_module);
					_module = _module.parent;
				}
				if (filename)
					return filename;
			}

			// ----------------------------------

			// We don't use is_Object or so.
			// 通常會傳入的，都是已經驗證過的值，不會出現需要特殊認證的情況。
			// 因此精確繁複的驗證只用在可能輸入奇怪引數的情況。
			if (!_.is_WWW())
				return '';

			// form dojo: d.config.baseUrl = src.substring(0, m.index);
			var i = 0, node = document.getElementById(_.env.main_script_name),
			// TODO: 若是有 id，則以 id 為主。
			o = node ? [ node ] : _.get_tag_list('script'), l = o.length, j, base_path, index;
			// console.log('-----------------------------------');
			// console.log(o);

			for (; i < l; i++)
				try {
					// o[i].src 多是 full path, o[i].getAttribute('src')
					// 僅取得其值，因此可能是相對的。
					j = node = o[i];
					j = j.getAttribute && j.getAttribute('src') || j.src;

					index = j.lastIndexOf(JSFN);
					// alert(j + ',' + JSFN + ',' + I);
					if (index !== -1) {
						// 正規化: URL 使用 '/' 而非 '\'
						// TODO: 尚未完善。
						if (j.indexOf('/') === -1 && j.indexOf('\\') !== -1)
							j = j.replace(/\\/g, '/');

						/**
						 * 處理<code>
						<script type="text/javascript" src="path/to/ce.js">//{"run":"initializer"}</script>
						</code>
						 */
						if (setup_extension) {
							if (JSFN === _.env.main_script)
								setup_extension(_.env.script_extension, node);
							else if (JSFN === _.env.main_script_name)
								setup_extension(j.slice(index + JSFN.length),
										node);
						}

						base_path = j.slice(0, index);
						if (j.length === index + JSFN.length) {
							// test 是否以 JSFN 作為結尾。
							// 注意: 依照現行的實作方法，用loader來載入JSFN時，必須以 JSFN 作為結尾。
							break;
						}
					}
				} catch (e) {
				}

			// _.log()

			// base_path || './'
			return base_path || '';
		};
		if (false)
			console.log(_.get_tag_list('script').map(function(n) {
				return n.getAttribute('src')
			}));

		/**
		 * 處理<code>
		<script type="text/javascript" src="path/to/ce.js">//{"run":"initializer"}</script>
		</code>
		 * TODO: modify the dirty hack.
		 */
		var setup_extension = function(extension, node) {
			if (extension === _.env.script_extension
			// || extension === '.js' || extension === '.txt'
			) {
				// TODO: unload 時 delete .script_node
				// _.script_node = node;
				var env = _.env, config, matched;
				try {
					config = node.innerText || (config = node.firstChild)
							&& config.nodeValue;
					// IE8 沒有 .innerText || .nodeValue
					if (!config
							&& typeof (config = node.innerHTML) === 'string')
						config = (matched = config
								.match(/^[\s\n]*<!--(.+?)-->[\s\n]*$/)) ? matched[1]
								: config.replace(/<!--([\s\S]*?)-->/g, '');
					if (config) {
						// http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#inline-documentation-for-external-scripts
						// If there is a src attribute, the element must be
						// either empty or contain only script documentation
						// that also matches script content restrictions.
						if (matched = config.match(/\/\*([\s\S]+?)\*\//))
							config = matched[1];
						if (config = _.parse_JSON(config.replace(
								/[\s\r\n]*\/\//g, '')))
							env.script_config = config;
					}
				} catch (e) {
					_.error('setup_extension: Invalid configuration: ['
							+ node.outerHTML + ']');
					_.error(e);
				}

				env.main_script = env.main_script.replace(new RegExp('\\'
						+ env.script_extension + '$'), extension);
				env.script_extension = extension;

				// alert(env.main_script + '\n' + env.script_extension);

				// done.
				setup_extension = null;
			}
		};

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		_// JSDT:_module_
		.
		/**
		 * test 是否符合 module pattern.
		 * 
		 * TODO: improve
		 * 
		 * @param {String}
		 *            test_string string to test
		 * @returns {Boolean} 是否符合 module pattern
		 */
		is_module_pattern = function(test_string) {
			var r = _.env.module_identifier_RegExp;
			if (!r) {
				// initial module_identifier_RegExp
				r = _.env.identifier_RegExp.source;
				r = _.env.module_identifier_RegExp = new RegExp('^' + r
						+ '(\\.' + r + ')*$');
			}

			return r.test(test_string);
		};

		_// JSDT:_module_
		.
		/**
		 * test function.request 的項目是否為 module.<br />
		 * 以 ./ 開頭可以確保必定是 path.
		 * 
		 * TODO: 現在還有很大問題!
		 * 
		 * @param {String}resource_String
		 *            resource to test
		 * @returns {Boolean} resource 是否為 module (true: is module, false: is
		 *          URL?)
		 */
		match_module_name_pattern = function match_module_name_pattern(
				resource_String) {
			return typeof resource_String !== 'string'
					|| resource_String.charAt(0) === '.'
					|| resource_String.charAt(0) === '/'
					|| resource_String.indexOf(':') !== -1
					// || resource_String.indexOf('%')!==-1
					|| /\.(js|css)$/i.test(resource_String) ? false : /\.$/
					.test(resource_String)
					|| _.is_module_pattern(resource_String);
		};

		_// JSDT:_module_
		.
		/**
		 * 轉化所有 /., /.., //
		 * 
		 * @since 2009/11/23 22:32:52
		 * @param {String}
		 *            path 欲轉化之 path
		 * @returns {String} path
		 */
		simplify_path = function simplify_path(path) {
			if (typeof path !== 'string')
				return path;

			// 有 head 表示 is absolute
			var head, tail, is_URL;
			// 對於 URL 如：
			// https://web.archive.org/web/http://site.org
			// http://site.org?p=//\\#a/b/c
			// 由於有太多不可不可預測因素，因此需特別處理之。
			if (/[\w\-]:\/\//.test(path)) {
				is_URL = path.match(/^((?:(?:[\w\-]+:)?\/)?\/)(.*?)$/);
				if (is_URL) {
					// e.g.,
					// 'http://example.org/path/to/'
					// '//example.org/path/to/'
					// '/example.org/path/to/'
					head = is_URL[1];
					path = is_URL[2];
				} else {
					// e.g., '/path/to/http://example.org/path/to/'
				}
				is_URL = true;
				if (tail = path.match(/^([^#?]+)([#?].*?)$/) || '')
					path = tail[1], tail = tail[2];
				if (/\/$/.test(path))
					// 保存 path 最後的 '/'。
					path = path.slice(0, -1), tail = '/' + tail;
				path = path.replace(/:\/\//g, encodeURIComponent(':/') + '/');
			} else {
				path = path.replace(
						/^(?:[a-zA-Z]:\\?|\\\\(?:[^\\\/]+)\\?|\\|\/)/,
						function($0) {
							head = $0;
							return '';
						})
				// 不應去除前後空白. TODO: use String.prototype.trim()
				// .replace(/\s+$|^\s+/g,'')
				// .replace(/\/\/+/g,'/')
				;
				if (tail = path.match(/^(.*?)([\\\/]+)$/))
					path = tail[1], tail = tail[2].charAt(0);
			}

			var separator_matched = path.match(/[\\\/]/);
			if (!separator_matched)
				return head ? head + path : path || '.';
			path = path.split(/[\\\/]+/);

			for (var i = 0, length = path.length; i < length; i++) {
				if (path[i] === '.')
					path[i] = '';

				else if (path[i] === '..') {
					var j = i;
					while (j > 0)
						if (path[--j] && path[j] !== '..') {
							// 找到第一個非 '', '..' 的以相消。
							path[i] = path[j] = '';
							break;
						}
				}
			}

			while (path.length > 0 && !path[0]
			// '/../path' to '/path'
			|| path[0] === '..' && head)
				path.shift();
			while (path.length > 0 && !path[path.length - 1])
				// 因為有 separator 結尾的話，應該都放在 tail 了；因此此處能去掉所有的空結尾。
				path.pop();

			path = path.join(separator_matched[0])
			// 對 archive.org 之類的網站，不可以簡化 '://'。
			// 若為了預防有些情況下需要保留 '//'，此條需要 comment out。
			// '//' → '/'
			.replace(/([\\\/])[\\\/]+/g, '$1')
			// .replace(head ? /^([\\\/]\.\.)+/g : /^(\.[\\\/])+/g, '')
			;

			// postfix
			if (is_URL)
				// recover. '%3A%2F': encodeURIComponent(':/')
				path = path.replace(/%3A%2F\//g, '://');
			if (head)
				path = head + path;
			else if (!path)
				path = '.';
			if (tail)
				path += tail;

			return path;
		};

		_// JSDT:_module_
		.
		/**
		 * 將輸入的 string 分割成各 module 單元。已去除 library name。<br />
		 * need environment_adapter()<br /> ** 並沒有對 module 做完善的審核!
		 * 
		 * @param {String}
		 *            module_name module name
		 * @returns {Array} module unit array
		 */
		split_module_name = function(module_name) {
			if (false)
				_.debug('['
						+ module_name
						+ ']→['
						+ module_name.replace(/\.\.+|\\\\+|\/\/+/g, '.').split(
								/\.|\\|\/|::/) + ']');
			if (typeof module_name === 'string') {
				module_name = module_name
				// .replace(/\.\.+|\\\\+|\/\/+/g, '.')
				.replace(/[\\\/]+/g, '.').split(/[.\\\/]|::/);
			}

			if (Array.isArray(module_name) && module_name.length) {
				// 去除 library name。
				if (// module_name.length > 1 &&
				_.Class === module_name[0])
					module_name.shift();
				return module_name;
			} else
				return [ '' ];
		};

		_// JSDT:_module_
		.
		/**
		 * 取得 module 之 name。以 library name 起始。
		 * 
		 * @returns {String} module name start with library name
		 */
		to_module_name = function(module, separator) {
			if (_.is_Function(module))
				module = module.Class;
			else if (module === _.env.main_script_name)
				module = _.Class;

			if (typeof module === 'string')
				module = _.split_module_name(module);

			var name = '';
			if (Array.isArray(module)) {
				if (typeof separator !== 'string')
					separator = _.env.module_name_separator;
				if (module[0] !== _.Class)
					name = _.Class + separator;
				name += module.join(separator);
			}

			return name;
		};

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		_// JSDT:_module_
		.is_local = function() {
			// cache
			return (_.is_local = _.constant_function(!_.is_WWW()
					|| window.location.protocol === 'file:'))();
		};

		// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

		_.reset_env();

	}
	// 不用 apply()，因為比較舊的瀏覽器沒有 apply()。
	)(CeL);
}
