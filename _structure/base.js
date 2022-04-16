
/**
 * @name CeL: JS library base function
 * @fileoverview 本檔案包含了 library 常用 base functions。
 * @since 2010/1/8 22:21:36
 */


/**
 * <code>
TODO
將 module_name 改成 arguments
http://threecups.org/?p=129

http://cdnjs.com/

listen language change event
play board

use <a href="http://prototyp.ical.ly/index.php/2007/03/01/javascript-design-patterns-1-the-singleton/" accessdate="2010/4/25 0:23" title="prototyp.ical.ly &amp;raquo; Javascript Design Patterns - 1. The Singleton">Singleton pattern</a>,
Module 模式或單例模式（<a href="http://zh.wikipedia.org/wiki/%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F" accessdate="2010/4/25 0:25" title="单例模式">Singleton</a>）<a href="http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K950.aspx" accessdate="2010/4/25 0:24" title="那些相见恨晚的 JavaScript 技巧 - 基于 COMSHARP CMS">為 Douglas Crockford 所推崇</a>，並被大量應用在 Yahoo User Interface Library YUI。

http://wiki.forum.nokia.com/index.php/JavaScript_Performance_Best_Practices
http://ioio.name/core-javascript-pitfalls.html

CommonJS
http://www.heliximitate.cn/studyblog/archives/tag/commonjs





</code>
 */



/**
 * <code>
// TODO
// 2011/7/31 21:18:01




//module

//typeof CeL_id === 'string' && typeof this[CeL_id] === 'function' &&
typeof CeL === 'function' && CeL.run({
name:[module_name],
require:[function_name,module_name],

code:function(CeL){

var private_value=1;

function module_function_1(arg) {
	;
}
module_function_1.required='';


function module_class_1(arg) {
	;
}

function get_value(){
	return private_value;
}

module_class_1.prototype.print=function(){};
module_class_1.print=function(){};


return {module_function_1,module_class_1};

}

});



</code>
 */



// void(
// typeof CeL !== 'function' &&
(
/**
 * We can redefine native values only for undefined.<br />
 * http://weblogs.asp.net/bleroy/archive/2006/08/02/Define-undefined.aspx<br />
 * <br />
 * Will speed up references to undefined, and allows redefining its name. (from
 * jQuery)<br />
 * <br />
 * 用在比較或是 return undefined<br />
 * 在舊的 browser 中，undefined 可能不存在。
 */
function (globalThis) {

	if (false)
		if (typeof globalThis !== 'object' && typeof globalThis !== 'function')
			throw new Error('No globalThis object specified!');

	var
		// https://developers.google.com/closure/compiler/docs/js-for-compiler
		/** @const */ library_name = 'CeL',

		/**
		 * library version.
		 * 
		 * @type {String}
		 * @ignore
		 */
		library_version = '4.5.0',


		/**
		 * default debug level
		 * 
		 * @type {ℕ⁰:Natural+0}
		 * @ignore
		 */
		debug = 0,
		// 原生 console。
		// typeof console !== 'undefined' && console
		has_console = typeof console === 'object'
		//
		&& (typeof console.log === 'function'
		// in IE 8, typeof console.log === 'object'.
		|| typeof console.log === 'object')
		&& typeof console.error === typeof console.log
		&& typeof console.trace === typeof console.log,


		old_namespace,

		// default not_native_keyword.
		KEY_not_native = typeof Symbol === 'function' ? Symbol('not_native') : 'not_native',

		// _base_function_to_extend,

		function_name_pattern;


	// members of library -----------------------------------------------

	// define 'undefined'
	try {
		// undefined === void 0
		if (undefined !== undefined) {
			throw 1;
		}
		// eval('if(undefined!==undefined){throw 1;}');
	} catch (e) {
		// Firefox/49.0 WebExtensions 可能 throw:
		// Error: call to eval() blocked by CSP
		// @see
		// https://developer.mozilla.org/en-US/docs/Archive/Firefox_OS/Firefox_OS_apps/Building_apps_for_Firefox_OS/CSP

		// or: undefined=void 0
		if (e === 1)
			eval('undefined=this.undefined;');
	}


	try {
		old_namespace = globalThis[library_name];
	} catch (e) {
		// throw { message: '' };
		throw new Error(library_name + ': Cannot get the global scope object!');
	}



	if (false) {
		_Global.JustANumber = 2;
		var _GlobalPrototype = _Global.constructor.prototype;
		_GlobalPrototype.JustANumber = 2;
	}

	// 若已經定義過，跳過。因為已有對 conflict 的對策，因此跳過。
	if (false)
		if (globalThis[library_name] !== undefined)
			return;


	/**
	 * Will speed up references to DOM: window, and allows redefining its name.
	 * (from jQuery)
	 * 
	 * @ignore
	 */
	// window = this;


	/**
	 * 本 JavaScript framework 的框架基本宣告。<br />
	 * base name-space declaration of JavaScript library framework
	 * 
	 * @name CeL
	 * @class Colorless echo JavaScript kit/library: library base name-space
	 */
	function _() {
		/**
		 * function CeL: library root<br />
		 * declaration for debug
		 */
		// this.globalThis = arguments[0] || arguments.callee.ce_doc;
		// return new (this.init.apply(globalThis, arguments));
	};

	// if (typeof _.prototype !== 'object')
	_// JSDT:_module_
	.
	/**
	 * framework main prototype definition for JSDT: 有 prototype 才會將之當作 Class
	 */
	prototype = {
	};

	// _.library_version =
	_.version = library_version;
	_.build_date = new Date();

	// name-space 歸屬設定

	_// JSDT:_module_
	.
	get_old_namespace = function () {
		return old_namespace;
	};

	_// JSDT:_module_
	.
	recover_namespace = function () {
		if (old_namespace === undefined)
			delete globalThis[library_name];
		else
			globalThis[library_name] = old_namespace;
		return _;
	};



	_// JSDT:_module_
	.
	/**
	 * JavaScript library framework main class name.
	 * 
	 * @see <a
	 *      href="http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf">ECMA-262</a>:
	 *      Object.Class: A string value indicating the kind of this object.
	 * @constant
	 */
	Class = library_name;

	var is_WWW = typeof window === 'object'
		&& (globalThis === window
			// 2021/11/16 e.g., under https://web.archive.org/
			// `window is {Proxy} of `globalThis`
			|| window.window === window && _ === window[library_name])
		// 由條件嚴苛的開始。
		&& typeof navigator === 'object'
			// Internet Explorer 6.0 (6.00.2900.2180),
			// Internet Explorer 7.0 (7.00.5730.13) 中，
			// navigator === window.navigator 不成立！
			&& navigator == window.navigator
		&& typeof location === 'object'
			&& location === window.location
		// object || function
		&& typeof setTimeout !== 'undefined'
			&& setTimeout === window.setTimeout
		&& typeof document === 'object'
			&& document === window.document
		// 下兩個在 IE5.5 中都是 Object
		// && _.is_type(window, 'globalThis')
		// && _.is_type(document, 'HTMLDocument')

		// && navigator.userAgent
	,
	is_W3CDOM =
		is_WWW
		// W3CDOM, type: Object @ IE5.5
		&& document.createElement
		// &&!!document.createElement
		// type: Object @ IE5.5
		&& document.getElementsByTagName;

	_// JSDT:_module_
	.
	/**
	 * Are we in a web environment?
	 * 
	 * @param {Boolean}
	 *            W3CDOM Test if we are in a World Wide Web Consortium (W3C)
	 *            Document Object Model (DOM) environment.
	 * 
	 * @return We're in a WWW environment.
	 * 
	 * @since 2009/12/29 19:18:53
	 * @see use lazy evaluation / lazy loading
	 * @_memberOf _module_
	 */
	is_WWW = function (W3CDOM) {
		return W3CDOM ? is_W3CDOM : is_WWW;
	};


	_// JSDT:_module_
	.
	/**
	 * 本 library 專用之 evaluate()。
	 * 
	 * 若在 function 中 eval 以獲得 local variable，在舊 browser 中須加 var。<br />
	 * e.g., 'var local_variable=' + ..<br />
	 * 不加 var 在舊 browser 中會變成 global 變數。
	 * 
	 * @param {String}code
	 *            script code to evaluate
	 * 
	 * @returns value that evaluate process returned
	 * @see window.eval === window.parent.eval
	 *      http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript
	 *      http://perfectionkills.com/global-eval-what-are-the-options/
	 */
	eval_code = globalThis.execScript ?
	function (code) {
		// 解決 CeL.run() 在可以直接取得 code 的情況下，於舊版 JScript 可能會以 eval() 來 include，
		// 這將造成 var 的值不會被設定到 global scope。

		// use window.execScript(code, "JavaScript") in JScript:
		// window.execScript() 將直接使用全局上下文環境，
		// 因此，execScript(Str)中的字符串Str可以影響全局變量。——也包括聲明全局變量、函數以及對象構造器。

		// window.execScript doesn’t return a value.
		return globalThis.execScript(code, "JavaScript");
	}
	:
	function eval_code(code) {
		/**
		 * JSC eval() takes an optional second argument which can be 'unsafe'.<br />
		 * Mozilla/SpiderMonkey eval() takes an optional second argument which
		 * is the scope object for new symbols.
		 */
		if (false) {
			_.debug(globalThis.eval, 2);
			_.debug(globalThis.eval && globalThis.eval !== arguments.callee);
		}
		// NO globalThis.eval.call(global, code) :
		// http://perfectionkills.com/global-eval-what-are-the-options/

		// TODO: 似乎不總是有用。見 era.htm。
		return globalThis.eval && globalThis.eval !== eval_code ? globalThis.eval(code)
			// QuickJS 2020-04-12 必須把本段註解全部刪除，否則不能正常執行。應為 bug。
			// 這種表示法 Eclipse Kepler (4.3.2) SR2 之 JsDoc 尚無法處理。
			: (0, eval)(code);
	};


	try {
		_// JSDT:_module_
		.
		/**
		 * evaluate @ Global scope.<br />
		 * 
		 * By the ECMA-262, new Function() will 'Pass in the Global Environment
		 * as the Scope parameter.'<br />
		 * 
		 * copy from jQuery core.js
		 * 
		 * @param {String}code
		 *            script code to evaluate
		 * 
		 * @returns value that evaluate process returned
		 * @see <a
		 *      href="http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context"
		 *      accessdate="2011/8/6 8:56">Eval JavaScript in a global context |
		 *      Java.net</a> use execScript on Internet Explorer
		 */
		global_eval = new Function('code', 'return '
			+ (
					typeof execScript === 'function' ? 'execScript('
					: is_WWW ? 'window.eval(' : 'eval.call(null,'
			)
			+ 'code)');
	} catch (e) {
		// Firefox/49.0 WebExtensions 可能 throw:
		// Error: call to Function() blocked by CSP
		_.global_eval = function(code) {
			_.error('global_eval: Can not eval()!');
		};
	}


	// 2019/6/3 18:16:44 CeL.null_Object() → Object.create(null)
	if (typeof Object.create !== 'function') {
		// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/create
		// 先暫時給一個，用於 `Object.create(null)`。
		(Object.create = function create(proto, propertiesObject) {
			// new Object();
			var new_Object = {};
			new_Object.__proto__ = proto;
			if(typeof propertiesObject === "object") {
				Object.defineProperties(new_Object, propertiesObject);
			}
	        return new_Object;
		})[KEY_not_native] = true;
	}

	/**
	 * setup options. 前置處理 options，正規化 read-only 參數。
	 * 
	 * @example<code>
	   //	// 前導作業/前置處理。
	   //	if (!library_namespace.is_Object(options))
	   //		options = Object.create(null);
	   // →
	   //	options = library_namespace.setup_options(options);
	   //	options = library_namespace.setup_options(options, true);
	 * </code>
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Boolean}[new_one]
	 *            重新造出可被更改的選項。當會更改到options時，再設定此項。
	 * 
	 * @returns {Object}選項。
	 * 
	 * @since 2016/3/13 13:58:9
	 */
	function _setup_options(options, new_one) {
		if (options && !new_one) {
			return options;
		}

		// create a new one. copy options.
		// or use Object.clone(options)
		options = Object.assign(Object.create(null), options);
		// 註冊為副本。
		options.new_NO = (options.new_NO | 0) + 1;
		return options;
	}
	/**
	 * setup options. 前置處理 options，正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。<br />
	 * 僅用在<b>不會改變</b> options 的情況。
	 * 
	 * @example<code>
	   //	// 前導作業/前置處理。
	   //	if (!library_namespace.is_Object(options))
	   //		options = Object.create(null);
	   // →
	   //	options = library_namespace.setup_options(options);
	 * </code>
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * 
	 * @returns {Object}選項。
	 * 
	 * @since 2016/3/13 13:58:9
	 */
	function setup_options(options) {
		if (typeof options === 'string') {
			// e.g., 'bot' → {bot:true}
			// e.g., 'bot|minor' → {bot:true,minor:true}
			var _options = Object.create(null), i = 0;
			for (options = options.split('|'); i < options.length; i++) {
				if (options[i]) {
					_options[options[i]] = true;
				}
			}
			return _options;
		}
		// e.g., number: Invalid option?
		return (typeof options === 'object' /* || typeof options === 'function' */)
		// typeof null === 'object'
		&& options || Object.assign(Object.create(null), options);
	}
	/**
	 * setup options. 前置處理 / clone options，避免修改或覆蓋附加參數。<br />
	 * 重新造出可被更改的選項。當會更改到 options 時，再使用此函數。
	 * 
	 * @example<code>

	// 前導作業/前置處理。
	// 重新造一個 options 以避免污染。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);
	// →
	options = library_namespace.new_options(options);
	// 使用新語法。
	options = { ...options };

	</code>
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * 
	 * @returns {Object}選項。
	 * 
	 * @since 2016/03/14 16:34:09
	 */
	function new_options(options) {
		// create a new one. copy options.
		// or use Object.clone(options)
		var length = arguments.length;
		if (_.is_Object(options)) {
			if ((new_options.new_key in options) && length === 1) {
				// converted
				return options;
			}
			options = Object.assign(Object.create(null), options);
		} else {
			options = Object.create(null);
		}
		if (length > 1) {
			for(var i = 1; i < length; i++)
				// if (_.is_Object(arguments[i]))
				if (arguments[i])
					Object.assign(options, arguments[i]);
		}
		Object.defineProperty(options, new_options.new_key, {
			// let [new_options.new_key] deletable
			configurable : true,
			// 不允許 enumerable 以避免此屬性被使用。
			// enumerable : false
			value : true
		});
		return options;
	}
	new_options.new_key = 'is new options';
	// 不會更動 options 的用此。
	_.setup_options = setup_options;
	// 會更動 options 的用此。
	_.new_options = new_options;


	var modify_function_hash = Object.create(null);

	_// JSDT:_module_
	.
	/**
	 * simple evaluates to get the value of specified variable identifier name.
	 * 
	 * 不使用 eval() 的方法，一層一層 call name-space。
	 * 
	 * BUG: 無論是不是相同 name_space，只要 variable_name 相同，即會執行 modify_function。<br />
	 * 以記憶體空間換取時間效率，會增加記憶體空間之使用。
	 * 
	 * 在兩個子層(a.b.c)下，這樣作效率較差@Chrome/5.0.375.29:<br />
	 * function(v){try{return(new Function('return('+v+')'))();}catch(e){}}
	 * 
	 * TODO:<br />
	 * 不存在時 throw.
	 * 
	 * @param {String}variable_name
	 *            variable identifier name. e.g., /[a-z\d$_]+(.[a-z\d_]+)+/i
	 * @param {Function}[modify_function]
	 *            註冊: 當以 .set_value() 改變時，順便執行此函數:<br />
	 *            modify_function(value, variable_name).
	 * @param {Object|Function}[name_space]
	 *            initialize name-space. default: globalThis.
	 * @param [value]
	 *            設定 variable 為 value.
	 * 
	 * @returns value of specified variable identifier name
	 * 
	 * @since 2010/1/1 18:11:40
	 * @note 'namespace' 是 JScript.NET 的保留字。
	 * 
	 * @see https://github.com/tc39/proposal-optional-chaining
	 */
	value_of = function (variable_name, modify_function, name_space, value) {
		var variable_name_array;
		if (Array.isArray(variable_name) && variable_name.length > 0) {
			variable_name_array = variable_name;
			variable_name = variable_name.join('.');
			// 在 Object("") 的情況下，typeof this==='object'。此時不可用 typeof。
		} else if (typeof variable_name === 'string' && variable_name)
			variable_name_array = variable_name.split('.');
		else
			// return variable_name: 預防 value_of(null/undefined/NaN)
			return variable_name;

		// _.debug('get value of [' + variable_name + ']');
		if (_.is_Function(modify_function)) {
			if (variable_name in modify_function_hash)
				modify_function_hash[variable_name].push(modify_function);
			else
				modify_function_hash[variable_name] = [modify_function];
		}

		var i = 0,
		// TODO:
		// 可處理如:
		// obj1 . obj2 [ ' obj3.4 * \[ ' ] [''] . obj5 [ " obj6 \" \' \] . " ]
		// or detect obj1 .. obj2
		l = variable_name_array.length,
		v = name_space ||
			// `CeL.env.global`, NOT `CeL.env.globalThis`
			globalThis,
		// do set value
		do_set = arguments.length > 3;
		if (false)
			_.debug('globalThis.' + _.Class + ' = ' + _.env.global[_.Class]);

		if (do_set)
			l--;

		try {
			while (i < l) {
				// _.debug('to [' + variable_name_array[i] + ']: ' +
				// v[variable_name_array[i]]),
				if (variable_name_array[i] in v)
					v = v[variable_name_array[i++]];
				else
					throw 1;
			}

			if (do_set) {
				v[variable_name_array[i]] = value;
				do_set = modify_function_hash[variable_name];
				if (do_set)
					for (i in do_set)
						try {
							do_set[i](value, variable_name);
						} catch (e) {
							// TODO: handle exception
						}
			}

		} catch (e) {
			variable_name_array[i] = '<em>' + variable_name_array[i] + '</em><span class="debug_weaken">';
			if (false)
				alert(_.log.buffer.length + ',' + _.log.max_length + '\n'
						+ _.debug);
			_.debug('Cannot ' + (do_set ? 'set' : 'get') +
					' variable [<span title="' + variable_name + '">' + variable_name_array.join('.') + '</span></span>]!', 2, 'value_of');
			// throw
			return undefined;
		}

		return v;
	};


	_// JSDT:_module_
	.
	/**
	 * simple evaluates to set value of specified variable identifier name.<br />
	 * 不使用 eval().
	 * 
	 * @param {String}variable_name
	 *            variable identifier name. e.g., /[a-z\d$_]+(.[a-z\d_]+)+/i
	 * @param [value]
	 *            設定 variable 為 value.
	 * @param {Object|Function}[name_space]
	 *            initialize name-space. default: globalThis.
	 * 
	 * @returns name-space of specified variable identifier name.<br />
	 *          e.g., return a.b.c when call .set_value('a.b.c.d').
	 * @since 2011/8/27 15:43:03
	 */
	set_value = function (variable_name, value, name_space) {
		return _.value_of(variable_name, null, name_space, value);
	};


	// ------------------------------------------------------------------------

	_// JSDT:_module_
	.
	/**
	 * is index 用, only digits. 整數 >= 0.<br />
	 * cf. Number.isInteger()
	 * 
	 * @param value
	 *            value to test
	 * @returns if value only digits.
	 */
	is_digits = function (value) {
		// 須預防 TypeError: Cannot convert object to primitive value。
		return typeof value !== 'object'
		// value == value | 0
		// value == (value >>> 0)
		&& /^\d+$/.test(value);
	};


	if (false)
		if (!globalThis.is_digits)
			globalThis.is_digits = _.is_digits;


	/**
	 * 測試各 type:
	 * 
	 * undefined:<br />
	 * 變數值存在且變數 'undefined' 存在時: variable === undefined<br />
	 * 否則: typeof(variable) === 'undefined'
	 * 
	 * TODO:<br />
	 * void(1) === void(0) === undefined
	 * 
	 * number, boolean, string:<br />
	 * typeof(variable) === '~'<br />
	 * 
	 * TODO:<br />
	 * NaN<br />
	 * int/float
	 * 
	 * object:<br />
	 * null
	 * 
	 * 不同 frame 中的 Array 擁有不同的 constructor
	 */
	/**
	 * A cache to the function we use to get the type of specified value.<br />
	 * Get the [[Class]] property of this object.<br />
	 * 不使用 Object.toString() 是怕被 overridden
	 * 
	 * @type {Function}
	 * @inner
	 */
	var get_object_type = Function.prototype.bind
		? Function.prototype.call.bind(Object.prototype.toString)
		: function (o) { return Object.prototype.toString.call(o); };

	_.get_object_type = get_object_type;

	_// JSDT:_module_
	.
	/**
	 * 判斷為何種 type。主要用在 Error, DOMException 等 native methods / native objects /
	 * built-in objects 之判別。
	 * 
	 * @param value
	 *            variable or class instance to test
	 * @param {String}[want_type]
	 *            type to compare: number, string, boolean, undefined, object,
	 *            function
	 * @param {Boolean}[get_Class]
	 *            get the class name of a class(function) instance.
	 * 
	 * @returns {Boolean} The type is matched.
	 * @returns {String} The type of value
	 * @returns {undefined} error occurred
	 * 
	 * @example<code>

	CeL.is_type(value_to_test, 'Array');

	</code>
	 * 
	 * @since 2009/12/14 19:50:14
	 * @see <a
	 *      href="http://lifesinger.org/blog/2009/02/javascript-type-check-2/"
	 *      accessdate="2009/12/6 19:10">JavaScript类型检测小结（下） - 岁月如歌</a><br />
	 *      <a
	 *      href="http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/"
	 *      accessdate="2009/12/6 19:10">Perfection kills &raquo; `instanceof`
	 *      considered harmful (or how to write a robust `isArray`)</a>
	 */
	is_type = function is_type(value, want_type, get_Class) {
		var type;
		if (want_type && (type = typeof want_type) !== 'string')
			want_type = type;

		type = value === null ? String(value) : typeof value;

		if (get_Class)
			try {
				if (type === 'function' && value.Class)
					// get the class name of a class
					// 若 value 為 function 時，測試其本身之 Class。
					type = value.Class;
				else if (type === 'function' || type === 'object')
					if (('constructor' in value) && (get_Class = value.constructor).Class)
						// get the class name of a class instance
						// 若 value 為 function 且無 Class，或為 object 時，測試其
						// constructor 之 Class。
						type = get_Class.Class;
					else if (get_Class = _.get_function_name(get_Class))
						// get Class by function name
						type = get_Class;
			} catch (e) {
				_.error(_.Class + '.is_type: Fault to get ths class name of value!');
			}

		if (type !== 'object')
			// type maybe 'unknown' or 'date'!
			return want_type ? type === want_type.toLowerCase() : type;

		try {
			get_Class = get_object_type(value);
		} catch (e) {
			_.error(_.Class + '.is_type: Fault to get object type of value!');
			get_Class = '';
		}

		if (want_type)
			return get_Class === (want_type.charAt(0) === '[' ? want_type
					: '[object ' + want_type + ']');

		want_type = get_Class.match(/^\[object ([^\]]+)\]$/);
		if (want_type)
			return want_type[1];

		return type;
	};


	_// JSDT:_module_
	.
	/**
	 * get a type test function
	 * 
	 * @example<code>
	 * // 大量驗證時，推薦另外在本身 scope 中造出捷徑：
	 * _.OtS = Object.prototype.toString;
	 * var is_Person = CeL.type_tester('Person', 'OtS');
	 * // test
	 * if(is_Person(value))
	 *  // it's really a Person object
	 *  ;
	 * </code>
	 * 
	 * @param {String}want_type
	 *            object type to compare
	 * @param {String}[toString_reference]
	 *            a reference name to Object.prototype.toString
	 * 
	 * @returns {Function} type test function
	 * @since 2009/12/20 08:38:26
	 */
	type_tester = function type_tester(want_type, toString_reference) {
		var t = '[object ' + want_type + ']';

		if (false)
		return new Function('v', 'return "' + t + '"==='
				+ (toString_reference ||
				// 在 Google Chrome 中，
				// 'Object.prototype.toString' 可以與其 reference 同速度，
				// 但其他的 reference 會快些。
				'Object.prototype.toString'
				)
				+ '.call(v);');

		return typeof toString_reference === 'string'
			&& toString_reference ?
				new Function('v', 'return "' + t
					+ '"===' + toString_reference + '.call(v);')

				// slow@Chrome
				: function (v) { return t === get_object_type(v); };
				// faster@Chrome
				// : new Function('v', 'return "' + t +
				// '"===Object.prototype.toString.call(v);');

	};

	_// JSDT:_module_
	.
	/**
	 * Test if the value is a native Function.
	 * 
	 * @param v
	 *            value to test
	 * @returns {Boolean} the value is a native Function.
	 * @since 2009/12/20 08:38:26
	 */
	is_Function =
		// _.type_tester('Function');
		function is_Function(v) {
		// typeof 比 Object.prototype.toString 快，
		// 不過得注意有些 native object 可能 type 是 'function'，但不具有 function 特性。
		return get_object_type(v) === '[object Function]';

		// 須注意，在 firefox 3 中，
		// typeof [object HTMLObjectElement] 之外的 HTMLElement 皆 ===
		// 'function'，

		// 因此光用 typeof() === 'function' 而執行下去會得出
		// [XPCWrappedNative_NoHelper] Component is not available

		if (false)
			return typeof v === 'function'
					|| get_object_type(v) === '[object Function]';
	};


	_// JSDT:_module_
	.
	/**
	 * Test if the value is a native ECMAScript Object / plain {Object}. is an
	 * ordinary object.<br />
	 * 去除 null, undefined。 TODO:<br />
	 * test null<br />
	 * BUG: IE8 中 is_Object(ELEMENT_NODE) === true！
	 * 
	 * @param v
	 *            value to test
	 * @returns {Boolean} the value is an ordinary object (a native Object).
	 *          else: exotic object, ECMAScript function object (pure function),
	 *          a primitive value.
	 * @since 2009/12/20 08:38:26
	 */
	is_Object =
		// MSIE 6.0 - 9.0 (JScript 9.0.16450):
		// Object.prototype.toString.call(undefined) === '[object Object]'
		// Object.prototype.toString.call(null) === '[object Object]'
		get_object_type(null) === '[object Object]' || get_object_type(undefined) === '[object Object]' ?
		function is_Object(v) {
			// &&: 除非為必要條件，否則越難達到、評估成本越小的應擺前面。
			return get_object_type(v) === '[object Object]'
			// && typeof v !== 'undefined' && v !== null
			&& v
			// incase CeL.is_Object(new CeL.URI())
			&& (!v.__proto__ || v.__proto__.constructor === Object);
		}
		:
		// _.type_tester('Object');
		function is_Object(v) {
			// 非如此不得與 jQuery 平起平坐…
			return get_object_type(v) === '[object Object]'
			// incase CeL.is_Object(new CeL.URI())
			// (!v.__proto__ || v instanceof Object)
			&& (!v.__proto__ || v.__proto__.constructor === Object);
		};

	_// JSDT:_module_
	.
	is_empty_object = function is_empty_object(value) {
		if (typeof value === 'object') {
			// TODO: using value.hasOwnProperty()
			for (var key in value) {
				return false;
			}
			return true;
		}
		// return undefined: not object.
	};

	_.is_RegExp = _.type_tester('RegExp');

	// Object.getPrototypeOf
	_.is_Date = false && (new Date).__proto__ === Date.prototype ? function(value) {
		return value && value.__proto__ === Date.prototype;
	} : _.type_tester('Date');


	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	function is_version(version_now, version_to_test, exactly) {
		if (!isNaN(version_now)) {
			if (!version_to_test) {
				// 數字化版本號
				return +version_now;
			}
			return exactly ? version_now == version_to_test
					: version_now > version_to_test;
		}

		if (typeof version_now === 'string') {
			version_now = version_now.replace(/^v(?:er)/i, '');
			version_to_test = version_to_test && String(version_to_test).replace(/^v(?:er)/i, '');
			if (exactly) {
				return version_now === version_to_test;
			}
			version_now = version_now.split('.');
			if (!version_to_test) {
				// 數字化版本號 function digitize_version(version)
				// v0.9 → 0.09
				// v0.10 → 0.10
				// v0.12 → 0.12
				// v4.9 → 4.09
				// v15.12.0 → 15.12
				// v16.1 → 16.01
				// 預防: +1.9 > +1.10 == 1.1
				return +version_now[0] + version_now[1] / 100;
			}

			version_to_test = version_to_test.split('.');
			var diff = version_now[0] - version_to_test[0];
			if (diff)
				return diff > 0;

			if (!version_to_test[1])
				return true;
			diff = version_now[1] - version_to_test[1];
			if (diff)
				return diff > 0;

			return !version_to_test[2] || +version_now[2] >= +version_to_test[2];
		}

		if (!version_to_test)
			return version_now;
	}

	/**
	 * 檢測 Web browser / engine 相容性，runtime environment 執行環境。
	 * 
	 * Warning: should use CeL.platform('node', '12.10'), NOT
	 * CeL.platform('node', 12.10)
	 * 
	 * @param {String|Object}key
	 *            Web browser / engine name.
	 * @param {String|Number}[version]
	 *            最低版本。
	 * @param {Boolean}[exactly]
	 *            需要準確相同。
	 * 
	 * @returns {Boolean} 相容
	 */
	function platform(key, version, exactly) {
		// CeL.platform({name: version}, exactly);
		var tmp;
		if (_.is_Object(key)) {
			for (tmp in key) {
				// version 當作 exactly
				if (platform(tmp, key[tmp], version))
					return true;
			}
			return false;
		}
	
		key = String(key).toLowerCase();
		if (key in platform.alias)
			key = platform.alias[key];
		// CeL.platform(name, version, exactly);
		tmp = platform.browser;
		if (tmp && tmp.toLowerCase() === key
				&& (!version || is_version(platform.version, version, exactly))) {
			return true;
		}

		tmp = platform.engine;
		if (tmp && tmp.toLowerCase() === key
				&& (!version || is_version(platform.engine_version, version, exactly))) {
			return true;
		}

		tmp = platform.OS;
		if (tmp && tmp.toLowerCase().indexOf(
			//
			key === 'windows' ? 'win' : key) === 0) {
			return true;
		}

		return false;
	};

	platform.alias = {
		ie : 'msie',
		explorer : 'msie',
		'internet explorer' : 'msie'
	};

	platform.toString = function() {
		return platform.browser + ' ' + platform.version;
	};

	try {
		/**
		 * is_nodejs, shortcut for node.js: nodejs version.<br />
		 * Node.js 有比較特殊的 global scope 處理方法。<br />
		 * 有可能為 undefined!
		 * 
		 * @type {String|Undefined}
		 */
		platform.nodejs =
			// typeof global === 'object' &&
			typeof require === 'function' && require('fs')
			//
			&& typeof process === 'object' && typeof process.versions === 'object'
			//
			&& typeof console === 'object' && typeof console.log === 'function'
			// use `CeL.platform('node', version_to_test)`
			// if you want to test the version
			&& process.versions.node;
	} catch(e) {
		// require('fs') error?
	}

	platform.is_Windows = function() {
		// https://www.lisenet.com/2014/get-windows-system-information-via-wmi-command-line-wmic/
		// TODO: `wmic OS get Caption,CSDVersion,OSArchitecture,Version`

		// WMIC is deprecated.
		// https://docs.microsoft.com/zh-tw/dotnet/api/system.environment.osversion
		// nvironment.OSVersion屬性不提供可靠的方式，來識別正確的作業系統和它的版本。 因此，我們不建議使用此方法。
		// `PowerShell.exe -Command "&
		// {[System.Environment]::OSVersion.Version}"`

		// Windows: process.platform.toLowerCase().startsWith('win')
		// @see os.version()
		return platform.OS && platform.OS.toLowerCase().indexOf('win') === 0;
	};

	if (is_WWW)
		(function() {
			// e.g., 'Win32'
			platform.OS = navigator.platform;
			// shortcut for Windows
			platform.Windows = platform.is_Windows();
	
			var userAgent = String(navigator.userAgent), matched;
			platform.mobile = /mobile/i.test(userAgent);

			// 特別的網頁瀏覽器放前面。因此 "IE" 應置於後。
			if (matched = userAgent
					.match(/(Chromium|Chrome|Opera|Safari|Firefox|(?:MS)?IE)[\/ ](\d+\.\d+)/i)) {
				platform.browser = matched[1];
				platform.version = +matched[2];
			} else if (matched = userAgent.match(/rv:(\d+\.\d+)/)) {
				// http://msdn.microsoft.com/zh-tw/library/ie/hh869301%28v=vs.85%29.aspx
				// 依賴使用者代理字串的網站應該更新為使用現代技術，例如功能偵測、調適型配置以及其他現代做法。
				// 瀏覽器版本現在由新的修訂版 ("rv") 權杖報告。
				// The revision token indicates the version of IE11
				platform.browser = 'MSIE';
				platform.version = +matched[1];
			}
	
			// Web browser layout engine.
			var tmp = navigator.product;
			if (matched = userAgent
					.match(/(Gecko|WebKit|Blink|KHTML|Presto|Trident)[\/ ](\d+(?:\.\d+))/i)) {
				if (tmp && tmp !== matched[1] && has_console) {
					// e.g., IE 11
					console.error('platform: navigator engine error! [' + tmp
							+ '] != [' + matched[1] + ']');
				}
				platform.engine = matched[1];
				platform.engine_version = +matched[2];
			} else
				// Firefox: Gecko
				platform.engine = tmp;
		})();

	// for node.js: .platform.browser, .platform.is_interactive will setup in
	// _structure/module.js.

	_.platform = platform;

	// ------------------------------------------------------------------------

	var
	// is Microsoft Windows Script Host (WSH)
	script_host = !is_WWW && typeof WScript === 'object';

	// for JScript: 在 IE8, IE9 中，get_object_type(WScript) 為 '[object Object]' !!
	if (script_host = script_host && (!_.is_Object(WScript) || String(WScript) === 'Windows Script Host') && WScript.FullName) {
		_// JSDT:_module_
		.
		/**
		 * the fully qualified path of the host executable.<br />
		 * 'cscript' || 'wscript'
		 * 
		 * @see http://msdn.microsoft.com/en-us/library/z00t383b(v=vs.84).aspx
		 * @_memberOf _module_
		 */
		script_host = script_host = script_host.replace(/^(.+)\\/, '').toLowerCase().replace(/\.exe$/, '');
	}

	// 需要測試的環境 (both old and new; node, WScript, ...)：
	// Unix (e.g., Tool Labs) (included + jsub + interactive 互動形式)
	// Windows console (both included / interactive 互動形式)

	// cache. (('')) for unknown environment.
	var script_full_path = '';

	if (is_WWW) {
		script_full_path = unescape(window.location.pathname) || script_full_path;

	} else if (script_host) {
		// 在 .hta 中取代 WScript.ScriptFullName。
		script_full_path = WScript.ScriptFullName || script_full_path;

	} else if (platform.nodejs) {
		// 2021/4/20 11:36:5 require.main===undefined @ new electron-builder
		// package
		// may use `module.filename`
		if (require.main) {
			// for newer node.js. 須放置於 ((__filename)) 判斷前!
			script_full_path = require.main.filename || script_full_path;

		} else if (false /* 20160609 deprecated */) {
			// 以 require('/path/to/node.loader.js') 之方法 include library 時，
			// ((__filename)) 會得到 loader 之 path，
			// 且不能從 globalThis.__filename 獲得 script path，只好另尋出路。

			// isTTY: 為 nodejs: interactive 互動形式。
			// 但 isTTY 在 command line 執行程式時也會為 true！
			// && (process.stdout && !process.stdout.isTTY

			// Unix node console 時 include 的話無 require.main，而 __filename 為
			// node.loader.js 之 full path。

			// for old node.js
			// @see __dirname
			script_full_path = typeof __filename === 'string' && __filename || script_full_path;
			// process.argv[1]: 這不一定會包含 path！
			// || process.argv && process.argv[1])

			if (!script_full_path) {
				// debug
				console.error('No script_full_path @ nodejs!');
				console.log(process);
				console.log('require.main: ' + JSON.stringify(require.main));
				console.log('require.main.filename: ' + (require.main && require.main.filename));
				console.log('__filename: ' + __filename);
				console.trace(script_full_path);
			}
		}

	} else if (_.is_Object(old_namespace)) {
		// for jslibs 與特殊環境. 需確認已定義 _.is_Object()
		script_full_path = old_namespace.loader_script || script_full_path;
	}



	_// JSDT:_module_
	.
	/**
	 * 取得執行 script 之 path。
	 * 
	 * @returns {String}執行 script 之 path。
	 * @returns '' Unknown environment
	 */
	get_script_full_name = function () {
		return script_full_path;
	};

	_// JSDT:_module_
	.
	/**
	 * 取得執行 script 之名稱(不包括 .js 等 extension).
	 * 
	 * 在有 script 的情況，應該為 script name。<br />
	 * 在 node.js interactive 的情況，應該為 ''。
	 * 
	 * @returns {String} 執行 script 之 名稱。
	 * @returns '' unknown environment
	 */
	get_script_name = function (get_file_name) {
		var full_path = _.get_script_full_name(), m = full_path.match(/[^\\\/]*$/);
		return get_file_name ? m[0] : m[0].replace(/\.[^.]*$/, '');
	};

	if (false)
		_// JSDT:_module_
		.
		deprecated_get_script_name = function () {
			// deprecated
			var n, i, j;

			if (script_host) {
				n = WScript.ScriptName;
				i = n.lastIndexOf('.');
				return i === -1 ? n : n.slice(0, i);
			}

			if (is_WWW) {
				n = unescape(window.location.pathname), j = n.lastIndexOf('.');
				if (!(i = n.lastIndexOf('\\') + 1))
					// location.pathname 在 .hta 中會回傳 '\' 形式的 path
					i = n.lastIndexOf('/') + 1;
				// return window.document.title;
				return i < j ? n.slice(i, j) : n.slice(i);
			}
		};


	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// 環境變數處理。

	// 先建一個出來以利使用。
	_.env = Object.create(null);

	_// JSDT:_module_
	.
	/**
	 * Setup environment variables. 重新設定環境變數 (environment variables) enumeration
	 * 與程式會用到的 library 相關變數 / configuration。
	 * 
	 * @param {String}[OS_type]
	 *            type of OS
	 * @param {Boolean}[reset]
	 *            reset the environment variables
	 * 
	 * @returns {Object} environment variables set
	 */
	reset_env = function reset_env(OS_type, reset) {
		// CeL.env[環境變數名稱]=環境變數之值. this === _ === library_namespace
		var OS, env = !reset && _.env || (_.env = Object.create(null)),
		//
		win_env_keys = 'PROMPT|HOME|PUBLIC|SESSIONNAME|LOCALAPPDATA|OS|Path|PROCESSOR_IDENTIFIER|SystemDrive|SystemRoot|TEMP|TMP|USERNAME|USERPROFILE|ProgramData|ProgramFiles|ProgramFiles(x86)|ProgramW6432|windir'.split('|');

		if (platform.nodejs) {
			// import all environment variables
			Object.assign(env, process.env);
		}

		/**
		 * library main file base name
		 * 
		 * @name CeL.env.main_script_name
		 * @type {String}
		 */
		env.main_script_name = 'ce';

		/**
		 * default extension of script file.<br />
		 * setup_extension @ CeL.get_script_base_path() 可能會再設定一次，偵測為 .txt 的情況。
		 * @type {String}
		 * @see <a
		 *      href="http://soswitcher.blogspot.com/2009/05/blogger-host-javascript-file-for-free.html"
		 *      accessdate="2010/3/11 23:30">Blogger - Host Javascript File for
		 *      Free - Blogger,Javascript - Blogger Blog by Switcher</a>
		 * @name CeL.env.script_extension
		 */
		env.script_extension = '.js';

		/**
		 * library main file name<br />
		 * setup_extension @ CeL.get_script_base_path() 可能會再設定一次，偵測為 .txt 的情況。
		 * 
		 * full path: {@link CeL.env.registry_path} +
		 * {@link CeL.env.main_script}
		 * 
		 * @example<code>
		 * CeL.log('full path: [' + CeL.env.registry_path + CeL.env.main_script + ']');
		 * </code>
		 * 
		 * @name CeL.env.main_script
		 * @type {String}
		 */
		env.main_script = env.main_script_name + env.script_extension;

		/**
		 * module 中的這 member 定義了哪些 member 不被 extend。
		 * 
		 * @name CeL.env.not_to_extend_keyword
		 * @type {String}
		 */
		env.not_to_extend_keyword = 'no_extend';

		/**
		 * 非 native 的 method (native methods / native objects / built-in
		 * objects)， 可由 [KEY_not_native] ([CeL.env.not_native_keyword]) 來判別是否為
		 * native method。<br />
		 * e.g., use Object.defineProperty[CeL.env.not_native_keyword] to test
		 * if the browser don't have native support for Object.defineProperty().
		 * 
		 * @name CeL.env.not_native_keyword
		 * @type {String}
		 */
		env.not_native_keyword = KEY_not_native;

		/**
		 * 本 library source 檔案使用之 encoding。<br />
		 * Windows 中不使用會產生語法錯誤!
		 * 
		 * e.g., 'UTF-16', 'UTF-8'
		 * 
		 * @name CeL.env.source_encoding
		 * @type {String}
		 */
		env.source_encoding = 'UTF-16';

		/**
		 * creator group / 組織名稱 organization name
		 * 
		 * @name CeL.env.organization
		 * @type {String}
		 */
		env.organization = 'Colorless echo';

		/**
		 * default globalThis object. 有可能為 undefined!
		 * 
		 * @name CeL.env.globalThis
		 * @type {Object}
		 */
		env.global = globalThis;
		// from now on, `CeL.env.global` 已被覆蓋。

		/**
		 * 在 registry 中存放 library 資料的 base path
		 * 
		 * @name CeL.env.registry_base
		 * @type {String}
		 */
		env.registry_base = 'HKCU\\Software\\' + env.organization + '\\' + _.Class
					+ '\\';
		/**
		 * 在 registry 中存放 library 在 File System 中的 base path 的 key name
		 * 
		 * @name CeL.env.registry_base
		 * @type {String}
		 */
		env.registry_path_key_name = env.registry_base + 'path';
		// if(typeof WScript === 'object')
		try {
			// WScript.Echo(env.registry_path_key_name);
			// WScript.Echo(_.get_script_base_path());
			
			var WshShell = WScript.CreateObject("WScript.Shell");
			/**
			 * 存放在 registry 中的 path，通常指的是 library 在 File System 中的 base path。<br />
			 * 將在 setup_library_base_path 以此設定 base path，並以此決定 module path。
			 * 
			 * @name CeL.env.registry_path
			 * @type {String}
			 * @see https://msdn.microsoft.com/en-us/library/x83z1d9f.aspx
			 * 
			 */
			env.registry_path = WshShell.RegRead(env.registry_path_key_name)
			// 去除 filename
			// .replace(/[^\\\/]+$/, '')
			;
			// _.debug(env.registry_path);

			// @see getEnvironment() @ CeL.application.OS.Windows
			var WshEnvironment = WshShell.Environment("Process");
			for (var index = 0; index < win_env_keys.length; index++) {
				var key = win_env_keys[index], value = WshEnvironment(key);
				if (value)
					env[key] = value;
			}

		} catch (e) {
			// _.warn(e.message);
		}

		if (platform.nodejs) {
			// 環境變數 in node.js
			if (false) {
				for (var index = 0; index < win_env_keys.length; index++) {
					var key = win_env_keys[index], value = process.env[key];
					if (value)
						env[key] = value;
				}
			}

			var node_os = require('os');

			if (!env.home
			// home directory 用戶個人文件夾 家目錄
			&& !(env.home = typeof node_os.homedir === 'function' && node_os.homedir()
			/**
			 * @see https://nodejs.org/api/os.html#os_os_userinfo_options
			 * 
			 * The value of homedir returned by os.userInfo() is provided by the
			 * operating system. This differs from the result of os.homedir(),
			 * which queries environment variables for the home directory before
			 * falling back to the operating system response.
			 * 
			 * os.userInfo() Throws a SystemError if a user has no username or
			 * homedir.
			 */
			|| typeof node_os.userInfo === 'function' && node_os.userInfo() && node_os.userInfo().homedir
			// http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
			|| process.env.HOME || process.env.USERPROFILE)
			// e.g., Windows 10
			&& process.env.HOMEDRIVE && process.env.HOMEPATH) {
				/** {String}user home directory */
				env.home = process.env.HOMEDRIVE + process.env.HOMEPATH;
			}

			if (!env.user) {
				env.user = typeof node_os.userInfo === 'function' && node_os.userInfo() && node_os.userInfo().username
				|| process.env.USER || process.env.USERNAME
				// e.g., macOS
				|| process.env.LOGNAME;
			}

			env.line_separator = node_os.EOL || env.line_separator;

			// Release memory. 釋放被占用的記憶體。
			node_os = null;
		}

		// 條件式編譯(条件コンパイル) for version>=4, 用 /*@ and @*/ to 判別。
		// http://msdn.microsoft.com/en-us/library/ie/8ka90k2e(v=vs.94).aspx
		/**
		 * Conditional compilation is not supported in Internet Explorer 11
		 * Standards mode and Windows Store apps. Conditional compilation is
		 * supported in Internet Explorer 10 Standards mode and in all earlier
		 * versions.
		 */
/**
 * <code>
/*@cc_on
@if(@_PowerPC||@_mac)
OS='Mac';
@else
@if(@_win32||@_win64||@_win16)
OS='Windows';
@else
OS='UNIX'; // unknown
@end
@end@
 */

		/**
		 * 本次執行所在 OS 平台。
		 * 
		 * @name CeL.env.OS
		 * @type {String}
		 */
		env.OS = OS = OS_type || OS
				// @see os.version()
				|| platform.nodejs && process.platform
				// 假如未設定則由 path 判斷。
				|| (_.get_script_full_name().indexOf('\\') !== -1 ? 'Windows' : 'UNIX')
				//
				|| env.OS;

		var is_UNIX = env.OS.toLowerCase() in {
			// macOS @ node.js
			darwin : true,
			linux : true,
			freebsd : true,
			unix : true
		};

		/**
		 * 文件預設 line separator / NewLine / new_line / line delimiter。<br />
		 * in VB: vbCrLf
		 * 
		 * @name CeL.env.line_separator
		 * @type {String}
		 */
		env.line_separator =
				is_UNIX ? '\n' : OS === 'Mac' ? '\r'
				// e.g., 'win32'
				: '\r\n';

		/**
		 * file system 預設 path separator。<br />
		 * platform-dependent path separator character, 決定目錄(directory)分隔。
		 * 
		 * @name CeL.env.path_separator
		 * @type {String}
		 * 
		 * @see https://stackoverflow.com/questions/125813/how-to-determine-the-os-path-separator-in-javascript
		 */
		env.path_separator =
			platform.nodejs && require('path') && require('path').sep
			|| (is_UNIX ? '/' : '\\');

		if (env.home && !/[\\\/]$/.test(env.home)) {
			// CeL.append_path_separator(CeL.env.home)
			env.home += env.path_separator;
		}

		/**
		 * library 之外部檔案 (external source files) 放置地。 純目錄名，不加目錄分隔。
		 * 
		 * @name CeL.env.external_directory_name
		 * @type {String}
		 */
		env.external_directory_name = 'external';

		/**
		 * library 之資源文件 (resource files) 放置地。 純目錄名，不加目錄分隔。 resources/
		 * 
		 * @name CeL.env.resources_directory_name
		 * @type {String}
		 */
		env.resources_directory_name = 'resources';

		/**
		 * 預設 module name separator。
		 * 
		 * @name CeL.env.module_name_separator
		 * @type {String}
		 */
		env.module_name_separator = '.';
		/**
		 * path_separator pattern in 通用(regular)運算式。
		 * 
		 * @name CeL.env.path_separator_pattern
		 * @type {String}
		 */
		env.path_separator_pattern = _.to_RegExp_pattern ?
				_.to_RegExp_pattern(env.path_separator)
				: (env.path_separator === '\\' ? '\\' : '') + env.path_separator;
		/**
		 * 預設語系。<br />
		 * 0x404:中文-台灣,<br />
		 * 0x0411:日文-日本
		 * 
		 * @name CeL.env.locale
		 * @see <a
		 *      href="http://msdn.microsoft.com/zh-tw/library/system.globalization.cultureinfo(VS.80).aspx">CultureInfo
		 *      類別</a>
		 * @type {Number}
		 */
		env.locale = 0x404;

		/**
		 * script name.
		 * 
		 * @name CeL.env.script_name
		 * @type {String}
		 */
		env.script_name = _.get_script_name();
		/**
		 * base path of script.
		 * 
		 * TODO:<br />
		 * 以 reg 代替
		 * 
		 * @name CeL.env.script_base_path
		 * @type {String}
		 */
		env.script_base_path = _.get_script_full_name()
			// 去除 filename
			.replace(/[^\\\/]+$/, '');

		/**
		 * Legal identifier name in RegExp.<br />
		 * 這 pattern 會佔去兩個筆紀錄: first letter, and least.<br />
		 * .replace(/_/ [g],'for first letter')<br />
		 * .replace(/\\d/,'for least')<br />
		 * 這邊列出的只是合法 identifier 的*子集*，且未去除 reserved words!<br />
		 * 請注意實際判別須加入 ^..$
		 * 
		 * 不用 \d 而用 0-9 是因為 \d 還包括了 MATHEMATICAL BOLD DIGIT。<br />
		 * <a href="http://blog.est.im/archives/3229" accessdate="2010/11/16
		 * 20:6">基于正则的URL匹配安全性考虑</a>
		 * 
		 * @name CeL.env.identifier_RegExp
		 * @type {RegExp}
		 * @see ECMA-262 7.6 Identifier Names and Identifiers
		 */
		env.identifier_RegExp = /([a-zA-Z$_]|\\u[0-9a-fA-F]{4})([a-zA-Z$_0-9]+|\\u[0-9a-fA-F]{4}){0,63}/;

		/**
		 * Legal identifier name in String from env.identifier_RegExp.
		 * 
		 * @name CeL.env.identifier_String
		 */
		env.identifier_String = env.identifier_RegExp.source;

		// test for-of statement (IterationStatement)
		try {
			env.has_for_of = new Function('for(var i of [7])return i===7;')();
		} catch (e) {
			// TODO: handle exception
		}

		// arrow function
		try {
			env.has_arrow_function = new Function('a','return((a)=>a+1)(a);')(2) === 3;
		} catch (e) {
			// TODO: handle exception
		}

		// RegExp lookbehind assertions
		// from ECMA-262, 9th edition, ECMAScript 2018
		try {
			env.has_RegExp_lookbehind = '$12.34'.match(new RegExp('(?<=\\D)\\d+'))[0] === '12'
				// http://2ality.com/2017/05/regexp-lookbehind-assertions.html
				&& 'a1ba2ba3b'.match(new RegExp('(?<=b)a.b', 'g')).join(',') === 'a2b,a3b'
				&& '0b11b22b33b4'.match(new RegExp('(?<!1)b\\d', 'g')).join(',') === 'b1,b3,b4';
		} catch (e) {
			// TODO: handle exception
		}

		// BigInt
		try {
			env.has_bigint = typeof BigInt === 'function' && typeof BigInt(1) === 'bigint'
				&& eval('999999n*8888888n*777777777n===6913572635062427358024n');
		} catch (e) {
			// TODO: handle exception
		}

		// ** 亦即，所有預先設定 (configuration) 應該放置於 CeL.env 之下。
		// 把 old_namespace.env 下原先的環境設定 copy 過來。
		// 例如用在直接讀取檔案內容並 eval()，要設定 env.script_extension, env.main_script 的情況。
		if (_.is_Object(old_namespace) && _.is_Object(old_namespace.env)) {
			Object.assign(env, old_namespace.env);
		}

		return env;
	};


	_// JSDT:_module_
	.
	// TODO
	get_identifier_RegExp = function (pattern, flag, add_for_first_letter, add_for_all_letter) {
		var s = _.env.identifier_String;
		if (add_for_first_letter)
			s = s.replace(/_/g, add_for_first_letter);
		if (add_for_all_letter)
			s = s.replace(/0-9/g, add_for_all_letter);

		return new RegExp(
				(get_object_type(pattern) === '[object RegExp]' ? pattern.source : pattern)
					.replace(/$identifier/g, s), flag || '');
	};


	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * setting pair.<br />
	 * 提供給函數設定 flag / optional argument 處理用。
	 * 
	 * @example <code>

	var setting = setting_pair({});

	 * </code>
	 * 
	 * @param default_setting
	 *            預設 setting.
	 * 
	 * @returns {Function}
	 */
	function setting_pair(default_setting) {
		var setting_now = default_setting || Object.create(null),
		setting_handle = function (name, value) {
			if (_.is_Object(name)) {
				// setter
				for (var i in name) {
					// _.debug('[' + i + ']=[' + name[i] + ']'),
					if (typeof name[i] !== 'undefined')
						setting_now[i] = name[i];
					else if (i in setting_now)
						delete setting_now[i];
				}
				return setting_now;
			}

			if (Array.isArray(name)) {
				// getter
				var r = [];
				name.forEach(function (n, i) {
					if (n in setting_now)
						r[i] = setting_now[n];
				});
				return r;
			}

			if (false)
				if (arguments.length > 1)
					_.debug('[' + name + ']=[' + value + ']');
			return arguments.length > 1 ? (setting_now[name] = value)
					: name ? setting_now[name] : setting_now;
		};
		setting_handle.reset = function (setting) {
			return setting_now = setting || Object.create(null);
		};

		// additional setting.
		for (var i = 1, length = arguments.length, o; i < length; i++)
			if (_.is_Object(o = arguments[i]))
				setting_handle(o);

		return setting_handle;
	}


	/**
	 * <code>

	setting_pair.prototype.handle = function(name, value) {
		var setting_now = this.setting_now;

		if (_.is_Object(name)) {
			// setter
			for ( var i in name) {
				//_.debug('[' + i + ']=[' + name[i] + ']'),
				if(typeof name[i] !== 'undefined')
					setting_now[i] = name[i];
				else if(i in setting_now)
					delete setting_now[i];
			}
			return setting_now;
		}

		if (Array.isArray(name)) {
			// getter
			var i, r = [], n;
			for (i in name) {
				n = name[i];
				if (n in setting_now)
					r[i] = setting_now[n];
			}
			return r;
		}

		//if(arguments.length > 1) _.debug('[' + name + ']=[' + value + ']');
		return arguments.length > 1 ? (setting_now[name] = value)
				: setting_now[name];
	};
	setting_pair.prototype.reset = function(setting) {
		return this.setting_now = setting || Object.create(null);
	};

	</code>
	 */


	_// JSDT:_module_
	.
	setting_pair = setting_pair;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// for debug & log.


	_// JSDT:_module_
	.
	/**
	 * Tell if it's now debugging.
	 * 
	 * @param {ℕ⁰:Natural+0}[debug_level]
	 *            if it's now in this debug level.
	 * 
	 * @returns {Boolean} It's now in specified debug level.
	 * @returns {ℕ⁰:Natural+0} It's now in what debug level (Integer).
	 */
	is_debug = function (debug_level) {
		return typeof debug_level !== 'number' ? debug || 0
				: debug >= debug_level;
	};

	_// JSDT:_module_
	.
	/**
	 * Set debugging level
	 * 
	 * @param {ℕ⁰:Natural+0}[debug_level]
	 *            The debugging level to set.
	 * 
	 * @type {ℕ⁰:Natural+0}
	 * @returns {ℕ⁰:Natural+0} debugging level now
	 */
	set_debug = function (debug_level) {
		if (!isNaN(debug_level))
			debug = Math.max(0, debug_level);

		else if (typeof debug_level === 'undefined' && !debug)
			debug = 1;

		if (Error.stackTraceLimit > 0) {
			// Node.js: default: 10
			Error.stackTraceLimit = debug > 2 ? 100 : debug > 0 ? 15 : 10;
		}

		return debug;
	};





	_// JSDT:_module_
	.
	/**
	 * Get the hash key of text.
	 * 
	 * @param {String}text
	 *            text to test
	 * 
	 * @returns {String} hash key
	 */
	_get_hash_key = function (text) {
		// text = String(text);
		// text = '' + text;
		var l = text.length, take = 30, from = .3;
		from = Math.floor(l * from);
		if (false)
			_.log(from + '~' + l + ': '
					+ (l - from < take ? text : text.substr(from, take)));
		return l - from < take ? text : text.substr(from, take);
	};

	/**
	 * <code>

	Chrome/22.0.1229.64
	fast->slow:
	(1000000*Math.random())>>>0
		but int32 only
	parseInt(1000000*Math.random())
	Math.floor(1000000*Math.random())

	</code>
	 */



	// for JScript<=5
	try {
		// @deprecated /^\s*function[\s\n]+(\w+)[\s\n]*\(/
		// ^\\s*: JScript 6-9 native object 需要這個。
		// function_name_pattern = new
		// RegExp('^\\s*function[\\s\\n]+(\\w+)[\\s\\n]*\\(');

		_.PATTERN_function = function_name_pattern =
		// [ all, function name, function arguments, function body ]
		/^\s*function(?:[\s\n]+([^\s\n]*?)[\s\n]*)?\([\s\n]*([^)]*?)[\s\n]*\)[\s\n]*{[\s\n]*([\s\S]*)[\s\n]*}[\s\n;]*$/;

		// TODO: arrow function expression
		// [ all, function arguments, function body ]
		// e.g., "(n) => {return n>0;}"
		/^\s*\([\s\n]*([^)]*?)[\s\n]*\)[\s\n]*=>[\s\n]*{[\s\n]*([\s\S]*)[\s\n]*}[\s\n;]*$/;

	} catch (e) {
		function_name_pattern = function emulate_function_name(fs) {
			fs = String(fs);
			var l = 'function ', r, s;

			if (fs.indexOf(l) === 0) {
				l = l.length;
				s = {
					' ': 1,
					'\n': 1,
					'\r': 1,
					'\t': 1
				};
				while (fs.charAt(l) in s)
					l++;
				r = fs.indexOf('(', l);
				while (fs.charAt(--r) in s) { }

				return [, fs.slice(l, r + 1)];
			}
		};
		// TODO
		if (typeof RegExp !== 'object')
			globalThis.RegExp = function () { };
	}

	/**
	 * 獲得函數名。
	 * 
	 * @param {Function}fr
	 *            function reference
	 * @param {String}ns
	 *            name-space
	 * @param {Boolean}force_load
	 *            force reload this name-space
	 * 
	 * @returns
	 * @see 可能的話請改用 {@link CeL.native.parse_function}(F).funcName
	 * @since 2010/1/7 22:10:27
	 */
	function get_function_name(fr, ns, force_load) {
		if (!fr)
			try {
				fr = arguments.caller;
			} catch (e) {
				if (!fr)
					return '';
			}

		if (fr.name)
			return fr.name;

		var
		// 初始化變數 'm'。
		// 不用 insteadof 是怕傳入奇怪的東西，例如 {String} script code.
		m = typeof fr,
		// function body text (函數的解譯文字)
		ft, b, load, k, i;

		if (m === 'function') {
			// 勿更改傳入之 argument
			if(false){
				if ('toString' in fr) {
					m = fr.toString;
					delete fr.toString;
				}
				ft = String(fr);
				if (m)
					fr.toString = m;
			}

			// TODO: cache Function.prototype.toString
			ft = Function.prototype.toString.call(fr);
		} else if (m === 'string')
			// typeof fr === 'string'
			ft = fr;
		else
			return '';

		// 以函數的解譯文字獲得函數名
		m = _.is_RegExp(function_name_pattern) ?
				// 包含引數: + '(' + (f ? m[2] : '') + ')';
				((m = ft.match(function_name_pattern)) && m[1] || /^[a-zA-Z_\d.]{1,30}$/.test(ft) && ft || 0)
				: function_name_pattern instanceof Function ?
					function_name_pattern(ft)
					: 0;
		if (m) {
			// _.debug('matched ' + m, 1, _.Class + '.get_function_name');
			return m;
		}
		// 無法從 function code 本身得到 name 之資訊。
		// 匿名函數?

		// 查詢是否是已註冊之 function。
		b = get_function_name.b;
		if (b)
			load = get_function_name.ns;
		else
			get_function_name.b = b = Object.create(null), get_function_name.ns = load = Object.create(null);

		if (!ns)
			ns = _;

		// cache functions
		if ((_.is_Function(ns) || _.is_Object(ns)) && ns.Class
						&& (force_load || !load[ns.Class])) {
			for (i in ns)
				if (typeof ns[i] === 'function') {
					k = _._get_hash_key(String(ns[i]));
					m = ns.Class + _.env.module_name_separator + i;
					// _.debug(m + ': ' + k + (', ' + ns[i]).slice(0, 200));
					if (!(m in load)) {
						load[m] = 1;
						if (!b[k])
							b[k] = [];
						b[k].push([m, ns[i]]);
					}
				}
			load[ns.Class] = 1;
		}

		// 將函數與 cache 比對以獲得函數名。
		// TODO: Array.prototype.indexOf()
		m = b[_._get_hash_key(ft)];
		if (m)
			for (i = 0; i < m.length; i++) {
				b = m[i][1];
				if (// typeof fr === 'function' &&
						fr === b || ft === String(b))
					return m[i][0];
			}

		return '';// '(unknown)';
	};

	_// JSDT:_module_
	.
	get_function_name = get_function_name;


	// noop
	_// JSDT:_module_
	.
	null_function =
		// new Function;
		function () { };


	_// JSDT:_module_
	.
	constant_function = function(value) {
		value = String(value);

		if (!(value in constant_function)
			// true/false/Number/null/undefined/global variables only!
			// && ((value in globalThis) || !isNaN(value))
			) {
			constant_function[value] = new Function('return(' + value + ')');
		}
		return constant_function[value];
	};

	try {
		_.constant_function(false);
	} catch (e) {
		// Firefox/49.0 WebExtensions 可能 throw:
		// Error: call to Function() blocked by CSP
		_.constant_function = function(value) {
			return function() {
				return value;
			};
		};
	}

	// ---------------------------------------------------------------------//
	// Initialization

	// ---------------------------------------------------------------------//
	// 處理 styled/stylized messages.
	// @see
	// https://stackoverflow.com/questions/22155879/how-do-i-create-formatted-javascript-console-log-messages

	/**
	 * 將 messages 去掉 style，轉成 plain text messages。
	 * 
	 * @param {Array}messages
	 *            附加格式的訊息。 messages with style.
	 * 
	 * @returns {String}plain text messages.
	 */
	function SGR_to_plain(messages) {
		return Array.isArray(messages) ? messages.filter(function(message, index) {
			return index % 2 === 0;
		}).join('')
		// '' + messages
		: messages;
	}

	/** {Object}cache for CeL.interact.console.SGR */
	var SGR, SGR_debug;

	/**
	 * 在已經存在 SGR 的功能下，以之格式化訊息。
	 * 
	 * @param {Array}messages
	 *            附加格式的訊息。 messages with style. 將當作 new SGR() 之 arguments。
	 * 
	 * @returns {String}formatted messages. 格式化後的訊息。
	 * 
	 * @see 'interact.console'
	 */
	function new_SGR(messages) {
		// 注意: 在 call stack 中有 SGR 時會造成:
		// RangeError: Maximum call stack size exceeded
		// 因此不能用於測試 SGR 本身! 故須避免之。
		// CeL.is_debug(min_debug): assert: SGR 在這 level 以上才會呼叫 .debug()。
		// TODO: 檢測 call stack。
		return _.is_debug(SGR_debug)
		// 若 SGR.CSI 被改過，則即便顯示亦無法得到預期之結果，不如跳過。
		|| SGR.CSI !== SGR.default_CSI ? SGR_to_plain(messages)
		// 顯示具格式（如 color 顏色）的 messages。
		: new SGR(messages).toString();
	}

	/**
	 * 處理 console 之 message。添加主控端報告的顯示格式（如 color 顏色）。<br />
	 * 若無法執行 new SGR()，則會將 messages 轉成 plain text。實作部分詳見 SGR。
	 * 
	 * @param {Array}messages
	 *            附加格式的訊息。 messages with style.
	 * 
	 * @returns {String}格式化後的訊息。
	 * 
	 * @see to_SGR() @ 'application.debug.log'
	 */
	function to_SGR(messages) {
		if (_.SGR) {
			SGR = _.SGR;
			SGR_debug = SGR.min_debug_level;
			return (_.to_SGR = new_SGR)(messages);
		}
		// 將 messages 去掉 style，轉成 plain text messages。
		return SGR_to_plain(messages);
	}

	// 在 WWW 的環境下，則直接 pass style 設定。
	_.to_SGR = is_WWW ? SGR_to_plain : to_SGR;

	// --------------------------------

	var
	/** {RegExp}是否具有 caller。能辨識紀錄之 caller。須排除"C:\"之類。 */
	PATTERN_log_caller = /^([a-z_\d.]{2,}:\s*)(.+)$/i,
	/** {Boolean}使用 styled 紀錄。 */
	using_style = !_.env.no_log_style,
	/** {Object}default style of console. */
	default_style = {
		// trace : '',
		// debug 另外設定。
		// debug : '',
		log : 'green',
		// information
		info : 'cyan',
		// warning
		warn : 'yellow',
		error : 'red;bg=white'
	};

	// a simple simulation of CeL.application.locale.gettext
	// Please include application.locale if you need a full version.
	// cache gettext only inside sync function, or using CeL.gettext instead:
	// application.locale 會自動 overwrite .gettext。
	// 假如多次使用，不如直接 include application.locale。
	function simple_gettext(text_id) {
		if (false && _.locale && _.locale.gettext) {
			_.gettext = _.locale.gettext;
			return _.gettext.apply(null, arguments);
		}

		// a simplified version
		// assert: typeof text_id === 'string'
		var arg = arguments;
		return text_id.replace(/%(\d+)/g, function(all, NO) {
			return NO < arg.length ?
			// extract_message_from_nodes(arg[NO])
			arg[NO] : all;
		});
	}

	_.gettext = simple_gettext;

	/**
	 * @example <code>

	var gettext = CeL.cache_gettext(function(_) { gettext = _; });
	var gettext = CeL.cache_gettext(_ => gettext = _);

	 </code>
	 */
	_.cache_gettext = function(adapter) {
		return function _gettext() {
			var gettext = _.locale && _.locale.gettext;
			if (gettext) {
				adapter(gettext);
			} else {
				gettext = simple_gettext;
			}

			return gettext.apply ? gettext.apply(null, arguments)
			// 這方法沒有準確符合arguments的長度，有缺陷。
			: gettext(arguments[0], arguments[1], arguments[2], arguments[3]);
		};
	};

	if (platform.nodejs && process.versions) {
		process.versions[library_name.toLowerCase()] = library_version;
		if (using_style === undefined) {
			// 若為 nodejs，預設使用 styled 紀錄。
			// using_style = _.platform.nodejs
			using_style = !!process.versions.node;
		}
	}

	function is_DOM_node(node) {
		return _.is_Object(node) && ('T' in node
		// || 'span' in node
		);
	}

	// 在沒有載入 new_node() @ CeL.DOM 的情況下嘗試解析 DOM object
	function extract_message_from_nodes(nodes, style_array) {
		if (Array.isArray(nodes)) {
			// nodes.forEach()
			for (var index = 0; index < nodes.length; index++) {
				var node = nodes[index];
				nodes[index] = extract_message_from_nodes(node, style_array);
				if (_.gettext.append_message_tail_space && node && node.T) {
					var inner = nodes[index + 1];
					// 只是簡易處理，不完善。
					// @see CeL.interact.DOM.new_node()
					inner = _.gettext.apply(null, Array.isArray(inner) ? inner : [ inner ]);
					nodes[index] = _.gettext.append_message_tail_space(nodes[index], {
						no_more_convert : true,
						next_sentence : inner
					});
				}
			}
			return nodes.join('');
		}

		if (!_.is_Object(nodes)) {
			if (style_array) {
				style_array.push(style_array.has_style ? [
				style_array.has_style.fg ? '-fg' : '',
				style_array.has_style.bg ? '-bg' : ''].join(';') : '', nodes);
				if (style_array.has_style)
					style_array.has_style = true;
			}
			return nodes;
		}

		var tag_name = nodes.$;
		if (!tag_name) {
			for (tag_name in nodes) {
				break;
			}
		}

		var inner = nodes[tag_name];
		if (tag_name !== 'T') {
			inner = extract_message_from_nodes(inner);
		} {
			inner = _.gettext.apply(null, Array.isArray(inner) ? inner : [ inner ]);
		}

		var color_index = _.SGR && _.SGR.color_index,
		//
		style = color_index && (nodes.style || nodes.S);
		// console.log(style);
		// parse CSS to SGR color style
		if (typeof style === 'string') {
			style.replace(/(?:^|[;\s])(background-)?color\s*:\s*([^\s;]+)/g, function(all, bg, color) {
				color = color.toLowerCase();
				if (!(color in color_index))
					return;
				if (typeof style === 'string') {
					style = Object.create(null);
				}
				style[bg ? 'bg' : 'fg'] = color;
			});
			if (typeof style === 'string') {
				style = '';
			}
		} else if (style && ((style.color in color_index)
			|| (style.backgroundColor in color_index))) {
			style = {
				fg : (style.color in color_index) && style.color || '',
				bg : (style.backgroundColor in color_index) && style.backgroundColor || ''
			};
		} else
			style = '';

		if (style_array) {
			style_array.push(style, inner);
			if (style)
				style_array.has_style = style;
		}
		// 不再傳入 style_array
		return inner;
	}

	/**
	 * 預先處理 messages。
	 * 
	 * TODO: 判別 console 是否具備 stylify/著色功能。
	 * 
	 * @param {Array|String}messages
	 *            欲記錄訊息。
	 * @param {Boolean}[from_styled_logger]
	 *            caller is styled logger.
	 * 
	 * @returns {Array}styled messages
	 */
	function preprocess_messages(messages, type, from_styled_logger) {
		// console.log(using_style);
		// console.trace(messages);
		if (!using_style) {
			// 不採用 styled log。不自動著色。
			return typeof messages === 'string' ? messages : SGR_to_plain(messages);
		}

		var style_array;
		if (Array.isArray(messages)) {
			// messages.forEach()
			for (var index = 0; index < messages.length; index++) {
				if (is_DOM_node(messages[index])) {
					style_array = true;
					break;
				}
			}

		} else if (is_DOM_node(messages)) {
			style_array = true;
		}
		if (style_array) {
			// 從頭到尾沒有特殊格式的話，就轉成純粹的字串。
			messages = extract_message_from_nodes(messages, style_array = [ '' ]);
			if (style_array.has_style) {
				// reset style
				if (_.is_Object(style_array.has_style)) {
					style_array.push([
		  				style_array.has_style.fg ? '-fg' : '',
  						style_array.has_style.bg ? '-bg' : ''].join(';'), '');
				}
				messages = style_array;
			}
			// console.trace(style_array);
		}

		var matched;
		if (typeof messages === 'string') {
			// 自動著色。
			matched = messages.match(PATTERN_log_caller);
			if (matched) {
				// e.g., CeL.log("function_name: messages");
				messages = [ matched[1], default_style[type], matched[2], 0 ];
			} else {
				messages = [ '', default_style[type], messages, 0 ];
			}

		} else if (from_styled_logger) {
			// assert: Array.isArray(messages)
			// 自動著色。
			// TODO: 效果不佳。
			matched = messages[0].match(PATTERN_log_caller);
			if (matched) {
				// e.g., CeL.log([ 'function_name: messages 0', 'style',
				// 'messages 1' ]);
				messages.splice(0, 1, '', default_style[type], matched[1], 0, matched[2]);
				// 最後設定 reset，避免影響到後頭之顯示。
				if (messages.length % 2 === 0)
					messages.push('', 0);
				else
					messages.push(0);
			}
		}

		return _.to_SGR(messages);
	}

	/**
	 * 不能放在 if (has_console) {} 中 @ node.js v0.10.25:
	 * 
	 * <code>
	   SyntaxError: In strict mode code, functions can only be declared at top level or immediately within another function.
	   </code>
	 */
	function setup_log(type) {
		// 將 CeL[type] 轉成 console[_type]。
		var _type = type;
		if (!console[_type])
			// e.g., 不見得在所有平台上都有 console.info() 。
			return;

		_[type] = function(messages, clear) {
			if (clear && console.clear)
				console.clear();
			// IE8 中，無法使用 console.log.apply()。
			// return console[type].apply(console, arguments);
			console[_type](preprocess_messages(messages, type));
		};

		/**
		 * setup frontend of styled messages. 使可輸入 CeL.s*().
		 * 
		 * <code>
		   CeL.slog([ 'CeJS: This is a ', 'fg=yellow', 'styled', '-fg', ' message.' ]);
		   CeL.sinfo('CeJS: There are some informations.');
		   </code>
		 */
		_['s' + type] = function(messages, clear) {
			if (clear && console.clear)
				console.clear();
			console[_type](preprocess_messages(messages, type, true));
		};
	}

	// temporary decoration of debug console,
	// in case we call for nothing and raise error
	if (has_console) {
		_.env.has_console = has_console;

		// 利用原生 console 來 debug。
		// 不直接指定 console.*: 預防 'Uncaught TypeError: Illegal invocation'.

		(function() {
			for ( var type in default_style) {
				// default style: foreground 前景
				default_style[type] = 'fg=' + default_style[type];
				setup_log(type);
			}
		})();

		// caller: from what caller
		_.debug = function (messages, level, caller) {
			if (!_.is_debug(level))
				return;

			if (caller) {
				caller = _.get_function_name(caller) + ': ';
				if (typeof messages === 'object') {
					if (Array.isArray(messages)) {
						// e.g., CeL.debug([{T:'msg'},'msg2'],1,'caller');
						messages.unshift(caller);
					} else {
						// e.g., CeL.debug({T:'msg'},1,'caller');
						messages = [ caller, messages ];
					}
				} else {
					// e.g., CeL.debug('msg',1,'caller');
					messages = caller + messages;
				}
			}
			// console.trace()
			console.log(preprocess_messages(messages, 'debug'));
		};
		// styled logger
		_.sdebug = function (messages, level, caller) {
			if (!_.is_debug(level))
				return;
			if (caller) {
				if (!Array.isArray(messages))
					// assert: (typeof messages === 'string')
					messages = [ messages ];
				messages.unshift('fg=blue', _.get_function_name(caller) + ': ', 0);
				messages = _.to_SGR(messages);
			} else {
				messages = preprocess_messages(messages, 'debug', true);
			}
			// console.trace()
			console.log(messages);
		}

	} else {
		_.error = _.warn = _.log = function (message) {
			/**
			 * 請注意:<br />
			 * _.log.buffer === this.log.buffer !== log.buffer<br />
			 * 
			 * 在 WScript 中 需要用 _.log，其他則可用 log。<br />
			 * 因此應該將所有類似的值指定給雙方，並注意不是[常數]的情況。
			 */
			var _s = _.log;
			// _s.function_to_call.apply(null,arguments);
			// _s.function_to_call.apply(globalThis, arguments);

			_s.buffer.push(message);

			if (!(_s.max_length >= 0))
				_s.max_length = 0;

			// 沒加 'debug &&' 在 IE 中會跳出大量 alert.
			if (debug && _s.buffer.length > _s.max_length) {
				_s.function_to_call.call(globalThis, _s.buffer.join('\n\n'));
				// reset buffer
				_s.buffer = [];
			}
		};

		_.debug = function (message, level, from) {
			if (_.is_debug(level))
				return _.log((from && (from = _.get_function_name(from)) ? from + ': ' : '[debug] ') + message);
		};

		/**
		 * test:<br />
		 * var k=function l(){alert(l.m);};k.m=1;alert(l.m+','+k.m);k();
		 * 
		 * JScript 中<br />
		 * k();<br />
		 * 為 undefined, 其他會把 "l." 代換成 "k."？
		 * 
		 * @inner
		 */
		// _.debug.buffer = _.error.buffer = _.warn.buffer =
		_.log.buffer = [];


		// _.debug.max_length = _.error.max_length = _.warn.max_length =
		_.log.max_length = 0;
		// if(!isNaN(CeL.log.max_length)) CeL.log.max_length = 20;


		var max_log_length = 1000,
		prepare_message = function (message) {
			message = String(message);
			if (message.length > 2 * max_log_length)
				message = message.slice(0, max_log_length) + '\n\n...\n\n' + message.slice(-max_log_length);
			return message;
		};

		// _.debug.function_to_call = _.error.function_to_call =
		// _.warn.function_to_call =

		_.log.function_to_call =
			// console 已在前面特別處理，以作美化。
			// typeof JSalert === 'function' ? JSalert :
			script_host ?
				function (message) { WScript.Echo(prepare_message(message)); } :
			// for jslibs
			typeof _configuration === 'object' && typeof _configuration.stdout === 'function' ?
				function (message) { _configuration.stdout(prepare_message(message) + '\n'); } :
			// for JSDB
			typeof writeln === 'function' ?
				function (message) { writeln(prepare_message(message)); } :
			// 預設以訊息框代替。
			typeof alert === 'object' || typeof alert === 'function' ?
				function (message) { alert(prepare_message(message)); } :
			// 無任何可用之反映管道。
			_.null_function;
	}

	// cache
	_.debug_console = function debug_console() {};
	_.debug_console.log = _.log;
	_.debug_console.warn = _.warn;
	_.debug_console.error = _.error;
	_.debug_console.debug = _.debug;

	// CeL.log_temporary(): temporary message
	// console_message(), log_status(), interactive_message()
	// Will re-set @ set_initializor() @ module.js
	_.log_temporary = _.null_function;

	// ---------------------------------------------------------------------//
	// 補強 (shim, polyfill) 用的 functions。
	// setup Object.defineProperty()

	/**
	 * 修改/加入屬性 propertyKey 至物件 object。<br />
	 * shim for 先前過舊的版本。
	 * 
	 * @param {Object|Function}object
	 *            要加入或修改屬性的目標物件。
	 * @param {String}propertyKey
	 *            屬性名稱。
	 * @param {Object}attributes
	 *            屬性的描述元。
	 * @returns 目標物件 object。
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
	 */
	function defineProperty(object, propertyKey, attributes) {
		if ('value' in attributes) {
			object[propertyKey] = attributes.value;

		} else if (typeof attributes.get === 'function') {
			try {
				object[propertyKey] = attributes.get();
				if (_.is_debug(2))
					_.warn('Object.defineProperty: 將設定成 get() 所得之值 ['
							+ object[propertyKey] + ']！');
			} catch (error) {
				// TODO: handle exception
			}
			// ignore .set
		}
		// else: nothing to set.

		return object;
	}
	defineProperty[KEY_not_native] = true;

	if (typeof Object.defineProperty !== 'function') {
		// 會動到原來的 Object.defineProperty。
		Object.defineProperty = defineProperty;
	} else {
		try {
			(function () {
				// workaround for Object.defineProperty @ IE8
				// http://kangax.github.com/es5-compat-table/
				// In Internet Explorer 8 Object.defineProperty only accepts DOM
				// objects (MSDN reference).
				// http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
				// Trying to use Object.defineProperty() on native objects
				// throws an error.
				var o = {};
				if (Object.defineProperty({}, 'p', { value : o }).p !== o)
					throw 1;

			})();

		} catch (e) {
			// backup original Object.defineProperty.
			var _defineProperty = Object._defineProperty = Object.defineProperty;
			// copy from interact.DOM
			// for IE5-8
			(Object.defineProperty = function IE5_to_8_defineProperty(target, propertyKey, attributes) {
				if (Object.prototype.toString.call(target) === '[object Object]'
					// e.g., IE 5-8. 這種判別方法有漏洞!
					&& typeof target.nodeType === 'number')
					try {
						return _defineProperty(target, propertyKey, attributes);
					} catch (e) {
					}

				// 不作錯誤偵測: 不能設定，就直接 throw。
				return defineProperty(target, propertyKey, attributes);
			})[KEY_not_native] = true;
		}
	}

	// 確認 Object.defineProperty() 是否能正確設值。
	if (!Object.defineProperty[KEY_not_native]) {
		try {
			(function() {
				var i, value = 7, old_value = value,
				//
				test_Funciton = function() {
				};
				Object.defineProperty(test_Funciton, 'size', {
					// enumerable : false,
					// configurable : false,
					get : function() {
						return value;
					},
					set : function(v) {
						if (value - 1 === v)
							value = v;
					}
				});
				for (i in test_Funciton)
					if (i === 'size')
						throw 1;
				try {
					test_Funciton.size = value + 1;
				} catch (e) {
				}
				try {
					delete test_Funciton.size;
				} catch (e) {
				}
				if (test_Funciton.size !== value)
					throw 1;
				test_Funciton.size = value - 1;
				if (test_Funciton.size !== value || test_Funciton.size === old_value)
					throw 1;
			})();

		} catch (e) {
			// Don't have standard Object.defineProperty()!
			Object.defineProperty[KEY_not_native] = true;
		}
	}

	// ---------------------------------------------------------------------------//
	// 這裡添加本 library base 會用到的，或重要的，過於基本的 native function
	// (標準已規定，但先前版本未具備的內建物件功能)。

	// 添加 method, to add method, use set_method() or Object.defineProperties()
	// or Object.defineProperty()
	// 延展物件, to add property, use Object.assign()

	// 因為 set_method() 會用到 is_debug()，因此須先確保 is_debug() 已 loaded。

	// ^\s*: JScript 6-9 native object 需要這個。
	// console.log() @ node.js: "function () {...}"
	// TODO: see ((function_name_pattern)) above
	// @see
	// https://tc39.github.io/Function-prototype-toString-revision/#prod-NativeFunction
	// [ all, IdentifierName ]
	// 舊的 JS environment 無法取得 FormalParameters。
	var native_pattern = /^\s*function\s+(\w*)\s*\([^()]*\)\s*{\s*\[native code\]\s*}\s*$/;

	_.is_native_Function = function(variable) {
		return typeof variable === 'function'
		// is a builtin function
		&& native_pattern.test(Function.prototype.toString.call(variable));
	};

	/**
	 * 若 variable 為 Standard Built-in ECMAScript Objects / native object /
	 * native ECMASCript object, 則回傳其 name / Constructor name。<br />
	 * 現行實作並未有標準支持！
	 * 
	 * @param variable
	 *            欲測試之 variable。
	 * @returns native object 之 name。
	 */
	function native_name(variable) {
		try {
			var value, match;

			// TODO: Function.prototype.bind 可能造成非 native Function 卻形如 "[native
			// code]" @ Firefox 20。
			// 注意: '' + Object.create(null) 會 throw TypeError: Cannot convert
			// object to primitive value
			if (typeof variable === 'function'
			//
			&& (match = Function.prototype.toString.call(variable).match(native_pattern)))
				return match[1];

			match = String(variable.constructor).match(native_pattern);
			if (match && (value = _.value_of(match[1])) && variable === value.prototype)
				return match[1] + '.prototype';

			if (variable === Math)
				// '' + Math === "[object Math]" @ Chrome/36
				return 'Math';

		} catch (e) {
			// TODO: handle exception
		}
	}

	_// JSDT:_module_
	.
	native_name = native_name;

	// need_to_check_in_for_in = undefined || { 'valueOf' : {}.valueOf,
	// 'toString' : {}.toString };
	var need_to_check_in_for_in = (function() {
		var key = {}, need_to_check = {
			_valueOf : key.valueOf,
			_toString : key.toString
		};
		for (key in {
			// IE8 中，以 for ( in ) 迭代，會漏掉 valueOf, toString 這兩個。
			valueOf : function() {
			},
			toString : function() {
			}
		})
			delete need_to_check['_' + key];

		for (key in need_to_check)
			return need_to_check;
	})();

	/**
	 * 設定物件方法:<br />
	 * extend properties to name_space.<br />
	 * 將 from_name_space 下的 variable_set 延展/覆蓋到 name_space。<br />
	 * Object.defineProperties() without overwrite extend properties to
	 * name_space.
	 * 
	 * @example <code>
	 * var o={a:0,b:1,c:'a',d:2,e:'g',f:4};
	 * CeL.set_method({a:1,b:2,c:3},o,[function(key){return !CeL.is_digits(o[key]);},'b','c','d','e','s']);
	 * // {a:1,b:1,c:3,d:2}
	 * </code>
	 * 
	 * 注意: CeL.set_method() 不覆蓋原有的設定。欲覆蓋原有的設定請用 Object.assign()。
	 * 
	 * @param {Object|Function}name_space
	 *            target name-space. extend to what name-space.
	 * @param {Object|Function}properties
	 *            欲延展那些 properties.
	 * @param {Undefined|Boolean|String|Array|Object|Function}[filter]
	 *            {Boolean} false: preserve NONE. overwrite even 衝突.<br />
	 *            {Boolean} true: preserve ALL. don't overwrite if 衝突.<br />
	 *            <br />
	 *            {Null} null: the same as false.<br />
	 *            undefined: default: if the target has the same key, preserve
	 *            the same type.<br />
	 *            {String} preserve type, should be this type. 若已存在此 type，或 eval
	 *            後回傳 true (function)，則不 overwrite。<br />
	 *            <br />
	 *            {Object} {key : 'preserve type'}<br />
	 *            {Array} [keys]: copy 所有 type 不同之 keys。<br />
	 *            {Function} filter(key, name_space, properties) return true:
	 *            preserve, false: copy the key.
	 * @param {Object}[attributes]
	 *            attributes used in Object.defineProperty()
	 * @returns target name-space
	 * @see
	 * @since 2014/5/5<br />
	 *        2014/5/6 refactoring 重構
	 */
	function set_method(name_space, properties, filter, attributes) {
		if (!attributes)
			attributes = Object.create(null);

		if (!name_space) {
			_.debug('沒有指定擴展的對象，擴展到 set_method.default_target。', 1, 'set_method');
			if (!(name_space = set_method.default_target))
				if (name_space === null
				// && _.is_Object(properties)
				)
					return name_space;
				else
					name_space = Object.create(null);
		}

		if (name_space === properties) {
			_.debug('(' + properties + '): 目標與來源相同。', 2, 'set_method');
			return;
		}

		var key;
		// assert: 在 Array.isArray() 設定前，不可以使用 filter。
		if (filter && Array.isArray(filter)) {
			// filter: Array → Object
			key = filter;
			filter = Object.create(null);
			if (typeof key[0] === 'string')
				// set default value: overwrite.
				key.unshift(false);
			key.forEach(function(k, i, o) {
				if (i === 0)
					key = o[i];
				else
					filter[o[i]] = key;
			});
		}

		function setter() {
			// !_.is_Function()
			var value = filter, not_native_keyword = _.env.not_native_keyword || KEY_not_native;
			if (_.is_Object(filter))
				if (key in properties)
					value = filter[key];
				else
					// 僅考慮 filter 與 properties 皆包含的屬性。
					return;

			if (typeof value === 'function'
				//
				&& (value = value(key, name_space, properties)) === true)
					// 直接跳過，保留原值。
					return;

			if (typeof value === 'string') {
				// _.is_type()
				value = typeof name_space[key] === value;
			} else if (value) {
				if (value === true)
					// 偵測是否已經存在 target name_space。
					value = key in name_space;
				else
					_.warn('set_method.setter: Unknown filter: [' + value + ']');
			} else if (value !== false) {
				// undefined, null, NaN
				value = typeof name_space[key] === typeof properties[key]
				// 假如原先有的並非原生函數，應該是有比較好、針對性的實作方法，那麼就用新的覆蓋舊的。
				&& name_space[key] && !name_space[key][not_native_keyword];
			}

			if (value)
				return;

			attributes.value = value = properties[key];
			// 以新的覆蓋舊的。
			if (name_space[key] && name_space[key][not_native_keyword]) {
				try {
					delete name_space[key];
				} catch (e) {
					// TODO: handle exception
				}
			}

			// Opera/9.80 中，set_method(Number, ..) 會造成：
			// Object.defineProperty: first argument not an Object
			try {
				Object.defineProperty(name_space, key, attributes);
			} catch (e) {
				name_space[key] = value;
			}

			// 放這邊，確保 not_native_keyword 一定會被設定。
			var name = native_name(name_space);
			if (name && typeof value === 'function') {
				try {
					Object.defineProperty(value,
					// 設定非 native 之 flag.
					not_native_keyword, {
						value : true
					});
				} catch (e) {
					value[not_native_keyword] = true;
				}
			} else if (typeof value === 'function') {
				value[not_native_keyword] = true;
			}

			// Warning: 由於執行時可能處於 log() stack 中，若 log() 會用到 set_method()，這邊又
			// call .debug()，可能會循環呼叫，造成 stack overflow。
			if (_.is_debug(name ? 1 : 3)) {
				// 若更動 native Object 等，則作個警示。
				_.debug((name || '(' + _.is_type(name_space) + ')')
						+ '.' + key + ' = (' + (typeof value) + ')'
						+ (_.is_debug(4) || typeof value !== 'function'
								&& typeof value !== 'object' && typeof value !== 'symbol' ? ' [' + value + ']'
								: ''), 1, 'set_method');
			}
		}

		// TODO: 若 {Function}properties 另外處理，依現行實作會出問題?
		for (key in (_.is_Object(filter) ? filter : properties))
			setter();

		if (need_to_check_in_for_in
			// Object 的情況，已經在前面處理完了。
			&& !_.is_Object(filter)) {
			if (!filter)
				filter = false;
			for (key in need_to_check_in_for_in)
				// assert: !== 須由左至右運算。
				// assert: i = 0; [ 1, 2 ][i] !== [ 2, 2 ][i = 1];
				if (need_to_check_in_for_in[key] !== properties[key = key.slice(1)])
					setter();
		}

		return name_space;
	}
	_.set_method = set_method;


	/**
	 * Test if the value is a native Array.
	 * 
	 * @param v
	 *            value to test
	 * @returns {Boolean} the value is a native Array.
	 * @since 2009/12/20 08:38:26
	 */
	set_method(Array, {
		isArray: // _.type_tester('Array');
		function isArray(v) {
			// instanceof 比 Object.prototype.toString 快
			return v instanceof Array
					|| get_object_type(v) === '[object Array]';
		}
	});


	// Warning: 在 node.js v0.10.48 下，對於以 set/get 來設定 target[key]
	// 的情況，可能造成設定完後 process, console 變成未定義之變數。
	// node.js v0.12.18 下沒有這個問題。
	_.need_avoid_assign_to_setter = platform.nodejs && !platform('node', '0.12');

	set_method(Object, {
		// Object.defineProperties()
		defineProperties : function defineProperties(object, properties) {
			var key;
			for (key in properties)
				Object.defineProperty(object, key, properties[key]);
			if (need_to_check_in_for_in)
				for (key in need_to_check_in_for_in)
					// assert: !== 須由左至右運算。
					// assert: i = 0; [ 1, 2 ][i] !== [ 2, 2 ][i = 1];
					if (need_to_check_in_for_in[key] !== properties[key = key
							.slice(1)])
						Object.defineProperty(object, key, properties[key]);
			return object;
		},
		// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/create
		// Object.create() 指定其原型物件與屬性，創建一個新物件。
		create : function create(proto, propertiesObject) {
			if (proto === null && !propertiesObject) {
				/**
				 * 取得裸 Object (naked Object)。
				 * 
				 * TODO: 快速回應的方法。但不見得在所有環境都適用，還需要再經過測試。
				 * 
				 * @returns 裸 Object (naked Object)。
				 */
				return {};
			}

			if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
				throw TypeError('Object prototype may only be an Object or null');
			}

			var object = new Object();
			object.__proto__ = proto;
			/**
			 * Object.create(null) 可取得裸 Object (naked Object)。Object prototype
			 * may only be an Object or null<br />
			 * 預防 Object.prototype 有東西，並消除 .toString() 之類。<br />
			 * 
			 * 注意: '' + Object.create(null) 會 throw TypeError: Cannot convert
			 * object to primitive value
			 * 
			 * @see <a href="http://hax.iteye.com/blog/1663476"
			 *      accessdate="2013/1/8 20:17">如何创建一个JavaScript裸对象 - hax的技术部落格 -
			 *      ITeye技术网站</a>
			 */
			for ( var attribute in object) {
				// This will also delete .__proto__
				delete object[attribute];
			}

			if (typeof propertiesObject === 'object')
				Object.defineProperties(object, propertiesObject);
			return object;
		},
		// 延展物件
		// to add property, use Object.assign()
		// application.debug.log use this.
		assign : function assign(target, source) {
			target = Object(target);
			for (var index = 1, length = arguments.length, key; index < length;) {
				source = Object(arguments[index++]);
				for (key in source) {
					// Warning: 可能得注意 `need_avoid_assign_to_setter`
					// @see CeL.application.net.URI()
					target[key] = source[key];
				}
				if (need_to_check_in_for_in)
					for (key in need_to_check_in_for_in)
						// assert: !== 須由左至右運算。
						// assert: i = 0; [ 1, 2 ][i] !== [ 2, 2 ][i = 1];
						if (need_to_check_in_for_in[key] !== source[key = key
								.slice(1)])
							target[key] = source[key];
			}
			return target;
		}
	});

	set_method(Array.prototype, {
		// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
		forEach: function forEach(callbackfn, thisArg) {
			for (var index = 0, length = this.length,
				// 使用 Function.prototype.call。
					use_call = thisArg !== undefined && thisArg !== null
					&& typeof callbackfn.call === 'function';
				index < length; index++)
				// 為允許 delete，先作 check。
				if (index in this) {
					if (use_call) {
						callbackfn.call(thisArg, this[index], index, this);
					} else {
						// 少一道手續。
						callbackfn(this[index], index, this);
					}
				}
		}
	});

	// ---------------------------------------------------------------------//

	// @see CeL.data.code.compatibility.is_thenable()
	// cf. Promise.isPromise()
	function is_thenable(value) {
		return value
		// https://github.com/then/is-promise/blob/master/index.js
		// && (typeof value === 'object' || typeof value === 'function')
		&& typeof value.then === 'function';
	}

	function is_async_function(value) {
		// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
		// 注意 AsyncFunction 不是一個全域物件。 它可以以下程式碼獲得。
		// Object.getPrototypeOf(async function(){}).constructor
		return typeof value === 'function'
		// to allow async functions:
		// https://github.com/tc39/ecmascript-asyncawait/issues/78
		&& value.constructor.name === 'AsyncFunction';
	}


	function run_and_then(first_to_run, and_then, error_catcher) {
		if (!error_catcher) {
			var result = first_to_run();
			if (is_thenable(result))
				return result.then(and_then);

			return and_then(result);
		}

		try {
			var result = first_to_run();
			if (is_thenable(result))
				return result.then(and_then, error_catcher);

			return and_then(result);
		} catch(e) {
			return error_catcher(e);
		}
	}

	set_method(_, {
		is_thenable : is_thenable,
		is_async_function : is_async_function,
		run_and_then : run_and_then
	});

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// 依賴於 set_method() 設定完之後才能使用的方法


	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// for software verification(驗證) and validation(驗收).

	// _.preserve_verify_code = false;



	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// 最終設定。

	if (false) {
		var test_obj = _(2, 'test: Initialization');

		test_obj.test_print('OK!');
	}

	if (false) {
		if (has_console) {
			console.log('globalThis: ' + typeof globalThis);
			console.log(library_name + ': ' + typeof globalThis[library_name]);
		}
	}

	/**
	 * 能執行到最後都沒出錯才設定到 globalThis。
	 * 
	 * @ignore
	 */
	globalThis[library_name] = _;
	if (typeof module === 'object'
	// NG if we have specified module.exports: ((module.exports === exports))
	// http://weizhifeng.net/node-js-exports-vs-module-exports.html
	// 如果module.exports當前沒有任何屬性的話，exports會把這些屬性賦予module.exports。
	&& typeof module.exports === 'object') {
		module.exports = _;
	}

	// test globalThis.
	try {
		if (_ !== eval(library_name))
			throw 1;
		// TODO: test delete globalThis object.
	} catch (e) {
		if (e === 1) {
			// 若失敗，表示其他對 globalThis 的操作亦無法成功。可能因為 globalThis 並非真的
			// Global，或權限被限制了？
			_.warn('無法正確設定 globalThis object!');
		} else if (e && e.message && e.message.indexOf('by CSP') !== -1) {
			// Firefox/49.0 WebExtensions 可能 throw:
			// Error: call to eval() blocked by CSP
			_.env.no_eval = true;
			// use chrome.tabs.executeScript(null, {code:''});
		}
	}


}
)(
	/**
	 * Global Scope object 整體<br />
	 * 於 CeL.eval_code 使用.<br />
	 * 
	 * TODO:<br />
	 * Function constructor evaluates in a scope of that function, not in a
	 * global scope.<br />
	 * http://perfectionkills.com/global-eval-what-are-the-options/
	 * 
	 * @ignore
	 * @see <a
	 *      href="http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript"
	 *      accessdate="2011/8/6 10:7">How to get the Global Object in
	 *      JavaScript? - Stack Overflow</a>
	 */

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
	typeof globalThis === 'object' && globalThis.Array === Array && globalThis

	// In strict mode, this inside globe functions is undefined.
	// https://developer.mozilla.org/en/JavaScript/Strict_mode
	|| typeof window !== 'undefined' && window
	// isWeb() ? window : this;

	// https://github.com/tc39/proposal-global
	// 由於在HTML Application環境中，self並不等於window，但是應該要用window，所以先跳過這一項。
	// 因著HTA的問題，要採用也必須放在window之後。
	|| typeof self !== 'undefined' && self

	// e.g., node.js
	|| typeof global === 'object' && global.Array === Array && global
	// http://nodejs.org/api/globals.html
	// node.js requires this method to setup REALLY global various:
	// require isn't actually a global but rather local to each module.
	// However, this causes CSP violations in Chrome apps.
	|| Function('return this')()
	// (function(){return this;})()
)
// ) // void(
;
