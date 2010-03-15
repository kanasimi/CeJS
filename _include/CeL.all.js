
/*
	本檔案為自動生成，請勿編輯！
	This file is auto created from _structure\structure.js, base.js, package.js
		by tool: built.
*/


//<![CDATA[



/**
 * @name	JavaScript framework: CeL base loader
 * @fileoverview
 * Colorless echo JavaScript kit/library base loader
 * 本檔案包含了呼叫其他 library 需要用到的 function，以及常用 base functions。<br/>
 * <br/>
 * Copyright (C) 2002-, kanashimi <kanasimi@gmail.com>. All Rights Reserved.<br/>
 * <br/>
 * This file is in tab wide of 4 chars, documentation with JsDoc Toolkit (<a href="http://code.google.com/p/jsdoc-toolkit/wiki/TagReference">tags</a>).<br/>
 * <br/>
 * <br/>Please visit <a href="http://lyrics.meicho.com.tw/program/">Colorless echo program room</a> for more informations.
 * @since	自 function.js 0.2 改寫
 * @since	JavaScript 1.2
 * @since	2010/1/9 00:01:52
 * @author	kanasimi@gmail.com
 * @version	$Id: ce.js,v 0.2 2009/11/26 18:37:11 kanashimi Exp $
 */


/*
引用：參照
function addCode

CeL.package


單一JS引用：
//	[function.js]_iF
function _iF(){}_iF.p='HKCU\\Software\\Colorless echo\\function.js.path';if(typeof WScript=="object")try{eval(getU((new ActiveXObject("WScript.Shell")).RegRead(_iF.p)));}catch(e){}
function getU(p,enc){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false);if(enc&&o.overrideMimeType)overrideMimeType('text/xml;charset='+enc);send(null);return responseText;}}
//	[function.js]End


初始化：參照
initialization of function.js

http://www.w3school.com.cn/html5/html5_script.asp
<script type="text/javascript" src="path/to/function.js"></script>
<script type="application/javascript;version=1.7" src="path/to/function.js"></script>


*/



/*
TODO

本 library 大量使用了 arguments.callee，但這與 ECMAScript design principles 不甚相符？
	http://stackoverflow.com/questions/103598/why-was-the-arguments-callee-caller-property-deprecated-in-javascript
	http://wiki.ecmascript.org/doku.php?id=es3.1:design_principles


reset environment (__defineSetter__, __defineGetter__, ..)
in case of
	<a href="http://haacked.com/archive/2009/06/25/json-hijacking.aspx" accessdate="2009/12/2 0:7">JSON Hijacking</a>,
	<a href="http://blog.miniasp.com/post/2009/11/JavaScript-JSON-Hijacking.aspx" accessdate="2009/12/2 0:18">在 Web 2.0 時代必須重視 JavaScript/JSON Hijacking 攻擊</a>,
	etc.
*/


//try{






//void(
//typeof CeL !== 'function' &&
(
/*
 * We can redefine native values only for undefined.<br/>
 * http://weblogs.asp.net/bleroy/archive/2006/08/02/Define-undefined.aspx<br/>
 * <br/>
 * Will speed up references to undefined, and allows redefining its name. (from jQuery)<br/>
 * <br/>
 * 用在比較或是 return undefined<br/>
 * 在舊的 browser 中，undefined 可能不存在。
 */
function(global, _undefined){


//if(typeof global !== 'function') throw new Error(1, 'No global object specified!');


var
	library_name = 'CeL'

	/**
	 * default debug level
	 * @type	{Integral}
	 * @ignore
	 */
	,debug = 0

	//,window

	,old_library_namespace

	//	library base name-space
	,_

	//,_base_function_to_extend
	;


//		members of library	-----------------------------------------------
;


/**
 * Global Scope object<br/>
 * 於 CeL.eval 使用
 * @ignore
 */
//global = this;	//	isWeb()?window:this;


/*
var _Global=(function(){return this;})();
_Global.JustANumber=2;	//	var _GlobalPrototype=_Global.constructor.prototype;_GlobalPrototype.JustANumber=2;
if(typeof _Global=='undefined')_Global=this;
for(i in _Global)alert(i);
*/

//	若已經定義過，跳過。因為已有對 conflict 的對策，因此跳過。
//if(global[library_name] !== undefined) return;


/**
 * Will speed up references to DOM: window, and allows redefining its name. (from jQuery)
 * @ignore
 */
//window = this;


/**
 * 本 JavaScript framework 的框架基本宣告<br/>
 * base name-space declaration of JavaScript library framework
 * @example
 * //	load library
 * <script type="text/javascript" src="../ce.js"></script>
 * //	預防 initial process 到一半彈出警告視窗，所以設大一點。
 * CeL.log.max_length = 20;
 * //	set debug
 * CeL.set_debug();
 *
 * //	判別是否已經 load 過
 * if(typeof CeL !== 'function' || CeL.Class !== 'CeL')
 * 	;	//	CeL has not been loaded
 * @name	CeL
 * @class	Colorless echo JavaScript kit/library: base name-space declaration
 */
_ = function(){
	//	function CeL	//	declaration for debug
	//this.global = arguments[0] || arguments.callee.ce_doc;
	return new (arguments.callee.init.apply(null, arguments));
};

/**
 * JavaScript library framework main class name.
 * @see	<a href="http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf">ECMA-262</a>: Object.Class: A string value indicating the kind of this object.
 * @constant
 */
_.Class = library_name;


/**
 * Map over main name-space in case of overwrite (from jQuery)
 * @ignore
 */
//old_library_namespace = global[library_name];
global[library_name] = _;


/**
 * framework main prototype definition
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_.prototype = {
};




CeL.ce
.
/**
 * 本 library 專用之 evaluate()
 * @param code	code to eval
 * @return	value that eval() returned
 */
eval = function(code) {
	/*
		JSC eval() takes an optional second argument which can be 'unsafe'.
		Mozilla/SpiderMonkey eval() takes an optional second argument which is the scope object for new symbols.

		use window.execScript(code,"JavaScript") in IE: window.execScript()將直接使用全局上下文環境，因此，execScript(Str)中的字符串Str可以影響全局變量。——也包括聲明全局變量、函數以及對象構造器。
	*/
	//this.debug(global.eval, 2);
	//this.debug(global && global.eval && global.eval !== arguments.callee);
	return global && global.eval && global.eval !== arguments.callee ? global.eval.call(global, code) : eval(code);
};


CeL.ce
.
/**
 * simple evaluates to get value of specified various name
 * @param {String} various_name	various name
 * @param {Object} [name_space]	initial name-space. default: global
 * @return	value of specified various name
 * @since	2010/1/1 18:11:40
 * @note
 * 'namespace' 是 JScript.NET 的保留字
 */
eval_various = function(various_name, name_space) {
	//this.debug('get value of [' + various_name + ']');
	if (typeof various_name !== 'string' || !various_name)
		return various_name;

	var i = 0,
	s = various_name.split('.'),
	l = s.length,
	v = name_space || _.env.global;
	//this.debug('global.' + this.Class + ' = ' + _.env.global[this.Class]);

	try {
		while (i < l)
			if (v)
				// this.debug('to [' + s[i] + ']: ' + v[s[i]]),
				v = v[s[i++]];
			else
				throw 1;
	} catch (e) {
		s[i - 1] = '<em>' + s[i - 1] + '</em><span class="debug_weaken">';
		this.debug('Can\'t get [<span title="' + various_name + '">'
				+ s.join('.') + '</span></span>]!');
		return;
	}

	return v;
};




CeL.ce
.
/**
 * 取得執行 script 之 path, 在 .hta 中取代 WScript.ScriptFullName。
 * @return	{String}	執行 script 之 path
 * @return	''	unknown environment
 */
get_script_full_name = function(){
	return	typeof WScript === 'object'? WScript.ScriptFullName
			: typeof location === 'object'? unescape(location.pathname)
			: '';
};

CeL.ce
.
/**
 * 取得執行 script 之名稱
 * @return	{String} 執行 script 之 名稱
 * @return	''	unknown environment
 */
get_script_name = function(){
	var n, i, j;

	if (typeof WScript === 'object') {
		n = WScript.ScriptName;
		i = n.lastIndexOf('.');
		return i == -1 ? n : n.slice(0, i);
	}

	if (typeof location === 'object') {
		n = unescape(location.pathname), j = n.lastIndexOf('.');
		if (!(i = n.lastIndexOf('\\') + 1))
			//	location.pathname 在 .hta 中會回傳 '\' 形式的 path
			i = n.lastIndexOf('/') + 1;
		return i < j ? n.slice(i, j) : n.substr(i);
	}

	return typeof document === 'object' && document === window.document ? document.title : '';
};




CeL.ce
.
/**
 * 取得/設定環境變數 enumeration<br/>
 * （雖然不喜歡另開 name-space，但以 2009 當下的 JsDoc Toolkit 來說，似乎沒辦法創造 enumeration。）
 * @class	環境變數 (environment variables) 與程式會用到的 library 相關變數。
 * @param name	環境變數名稱
 * @param value	環境變數之值
 * @return	舊環境變數之值
 */
env = function(name, value) {
	if (!name)
		return undefined;

	var _s = arguments.callee, v = _s[name];
	if (arguments.length > 1)
		_s[name] = value;
	return isNaN(v) ? '' + v : v;
};


/*
測試各 type:

undefined:
變數值存在且變數 'undefined' 存在時: various === undefined
否則: typeof(various) === 'undefined'

number, boolean, string:
typeof(various) === '~'

** NaN
** int/float

object:
null

不同frame中的Array擁有不同的constructor
*/
/**
 * A cache to the function we use to get the type of specified value.<br/>
 * Get the [[Class]] property of this object.<br/>
 * 不使用 Object.toString() 是怕被 overridden
 * @type	Function
 * @inner
 */
var get_object_type = Object.prototype.toString;

CeL.ce
.
/**
 * 判斷為何種 type。主要用在 Array 等 native object 之判別。
 * @param	value	various or class instance to test
 * @param	{String} [want_type]	type to compare: number, string, boolean, undefined, object, function
 * @param	{Boolean} [get_Class]	get the class name of a class(function) instance.
 * @return	{Boolean}	The type is matched.
 * @return	{String}	The type of value
 * @return	{undefined}	error occurred
 * @example
 * CeL.is_type(value_to_test, 'Array');
 * @since	2009/12/14 19:50:14
 * @see
 * <a href="http://lifesinger.org/blog/2009/02/javascript-type-check-2/" accessdate="2009/12/6 19:10">JavaScript类型检测小结（下） - 岁月如歌</a><br/>
 * <a href="http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/" accessdate="2009/12/6 19:10">Perfection kills &raquo; `instanceof` considered harmful (or how to write a robust `isArray`)</a>
 */
is_type = function(value, want_type, get_Class) {
	var type;
	if (want_type && (type = typeof want_type) !== 'string')
		want_type = type;

	type = value === null ? 'null' : typeof value;

	if (get_Class)
		try {
			if(type === 'function' && value.Class)
				//	get the class name of a class
				//	若 value 為 function 時，測試其本身之 Class。
				type = value.Class;
			else if (type === 'function' || type === 'object') {
				get_Class = value.constructor;
				if (get_Class.Class)
					// get the class name of a class instance
					// 若 value 為 function 且無 Class，或為 object 時，測試其 constructor 之 Class。
					type = get_Class.Class;
				else if (get_Class = ('' + get_Class)
						.match(/^\s*function\s([^\(\s]+)\s*\(/))
					// get Class by function name
					type = get_Class[1];
			}
		} catch (e) {
			this.err(this.Class + '.is_type: Fault to get ths class name of value!');
		}

	if (type !== 'object')
		//	type maybe 'unknown' or 'date'!
		return want_type ? type === want_type.toLowerCase() : type;

	try {
		get_Class = get_object_type.call(value);
	} catch (e) {
		this.err(this.Class + '.is_type: Fault to get object type of value!');
		get_Class = '';
	}

	if (want_type)
		return get_Class === (want_type.charAt(0) === '[' ? want_type
				: '[object ' + want_type + ']');

	if (want_type = get_Class.match(
					/^\[object ([^\]]+)\]$/))
		return want_type[1];

	return type;
};


CeL.ce
.
/**
 * get a type test function
 * @param	{String} want_type	object type to compare
 * @param	{String} [toString_reference]	a reference name to Object.prototype.toString
 * @return	{Function}	type test function
 * @since	2009/12/20 08:38:26
 * @example
 * // 大量驗證時，推薦另外在本身 scope 中造出捷徑：
 * this.OtS = Object.prototype.toString;
 * var is_Array = CeL.object_tester('Array', 'OtS');
 * // test
 * if(is_Array(value))
 * 	//	it's really a native Array
 * 	;
 */
object_tester = function(want_type, toString_reference) {
	var t = '[object ' + want_type + ']';

	return typeof toString_reference === 'string'
		&& toString_reference ?
			new Function('v', 'return "' + t
				+ '"===' + toString_reference + '.call(v)')
			: function(v) {
				return t === get_object_type.call(v);
			};
};

CeL.ce
.
/**
 * Test if the value is a native Array.
 * @param	v	object value
 * @return	{Boolean}	the value is a native Array.
 * @since	2009/12/20 08:38:26
 */
is_Array = _.object_tester('Array');

CeL.ce
.
/**
 * Test if the value is a native Object.
 * @param	v	object value
 * @return	{Boolean}	the value is a native Object.
 * @since	2009/12/20 08:38:26
 */
is_Object = _.object_tester('Object');


CeL.ce
.
/**
 * Setup environment variables
 * @param	{string}[OS_type]	type of OS
 * @return	environment variables set
 */
initial_env = function(OS_type){
	//this.env = {};
	var OS, env = this.env;

	/**
	 * library main file base name<br/>
	 * full path: {@link CeL.env.registry_path} + {@link CeL.env.main_script}
	 * @example:
	 * CeL.log('full path: ['+CeL.env.registry_path+CeL.env.main_script+']');
	 * @name	CeL.env.main_script
	 * @type	String
	 */
	env.main_script = 'ce.js';

	/**
	 * module 中的這 member 定義了哪些 member 不被 extend
	 * @name	CeL.env.not_to_extend_keyword
	 * @type	String
	 */
	env.not_to_extend_keyword = 'no_extend';

	/**
	 * 本 library source 檔案使用之 encoding<br/>
	 * 不使用會產生語法錯誤
	 * @name	CeL.env.source_encoding
	 * @type	String
	 */
	env.source_encoding = 'UTF-16';

	/**
	 * default global object
	 * @name	CeL.env.global
	 * @type	Object
	 */
	env.global = global;

	/**
	 * creator group
	 * @name	CeL.env.company
	 * @type	String
	 */
	env.company = 'Colorless echo';

	env.registry_key = 'HKCU\\Software\\' + env.company + '\\' + this.Class
				+ '.path';
	//if(typeof WScript==='object')
	try {
		/**
		 * 存放在 registry 中的 path
		 * @name	CeL.env.registry_path
		 */
		env.registry_path = (WScript.CreateObject("WScript.Shell"))
				.RegRead(env.registry_key).replace(/[^\\\/]+$/, '');
		//this.debug(env.registry_path);
	} catch (e) {
		// this.warn(e.message);
	}


	//條件式編譯(条件コンパイル) for version>=4, 用 /*@ and @*/ to 判別
	/*@cc_on
	@if(@_PowerPC||@_mac)
	 OS='Mac';
	@else
	 @if(@_win32||@_win64||@_win16)
	  OS='DOS';
	 @else
	  OS='unix';	//	unknown
	 @end
	@end@*/

	/**
	 * 本次執行所在 OS 平台
	 * @name	CeL.env.OS
	 * @type	String
	 */
	env.OS = OS = typeof OS_type === 'string' ? OS_type
			// 假如未設定則取預設值
			: (OS || 'unix');

	/**
	 * 文件預設 new line
	 * @name	CeL.env.new_line
	 * @type	String
	 */
	env.new_line=		OS == 'unix' ? '\n' : OS == 'Mac' ? '\r' : '\r\n';	//	in VB: vbCrLf
	/**
	 * file system 預設 path separator<br/>
	 * platform-dependent path separator character, 決定目錄(directory)分隔
	 * @name	CeL.env.path_separator
	 * @type	String
	 */
	env.path_separator	=	OS == 'unix' ? '/' : '\\';
	/**
	 * 預設 module name separator
	 * @name	CeL.env.module_name_separator
	 * @type	String
	 */
	env.module_name_separator='.';
	/**
	 * path_separator in 通用(regular)運算式
	 * @name	CeL.env.path_separator_RegExp
	 * @type	RegExp
	 */
	env.path_separator_RegExp = this.to_RegExp_pattern ? this
			.to_RegExp_pattern(env.path_separator)
			: (env.path_separator == '\\' ? '\\' : '') + env.path_separator;
	/**
	 * 預設語系
	 * 0x404:中文-台灣,0x0411:日文-日本
	 * @name	CeL.env.locale
	 * @see	<a href="http://msdn.microsoft.com/zh-tw/library/system.globalization.cultureinfo(VS.80).aspx">CultureInfo 類別</a>
	 * @type	Number
	 */
	env.locale = 0x404;

	/**
	 * script name
	 * @name	CeL.env.script_name
	 * @type	String
	 */
	env.script_name = this.get_script_name();
	/**
	 * base path of library
	 * @name	CeL.env.library_base_path
	 * @type	String
	 */
	env.library_base_path = this.get_script_full_name(); // 以 reg 代替

	return env;
};




CeL.ce
.
/**
 * Tell if it's now debugging.
 * @param {int}[debug_level]	if it's now in this debug level.
 * @return	{Boolean}	It's now in specified debug level.
 * @return	{Number}	It's now in what debug level(Integral).
 */
is_debug = function(debug_level){
	return debug_level === undefined ? debug
				: debug >= debug_level;
};

CeL.ce
.
/**
 * Set debugging level
 * @param {int}[debug_level]	The debugging level to set.
 * @type	Integral
 * @return	{Number} debugging level now
 */
set_debug = function(debug_level){
	if (!isNaN(debug_level))
		debug = debug_level;

	else if (debug_level === undefined && !debug)
		debug = 1;

	return debug;
};


/*
CeL.extend(function f_name(){}, object || string, initial arguments);
CeL.extend({name:function(){},.. }, object || string);
CeL.extend([function1,function12,..], object || string);

set .name
*/







CeL.ce
.
/**
 * Get the hash key of text.
 * @param {String} text	text to test
 * @return	{String}	hash key
 */
_get_hash_key = function(text) {
	//text = '' + text;
	var l = text.length, take = 30, from = .3;
	from = Math.floor(l * from);
	//this.log(from + '~' + l + ': ' + (l - from < take ? text : text.substr(from, take)));
	return l - from < take ? text : text.substr(from, take);
};


CeL.ce
.
/**
 * 獲得函數名
 * @param {Function} fr	function reference
 * @param {String} ns	name-space
 * @param {Boolean} force_load	force reload this name-space
 * @return
 * @see
 * 可能的話請改用 {@link CeL.native.parse_Function}(F).funcName
 * @since	2010/1/7 22:10:27
 */
get_Function_name = function(fr, ns, force_load) {
	var _s = arguments.callee,
	//	初始化變數 'm'
	m = 0, ft, b, load, k, i;
	if (!fr)
		fr = _s.caller;

	//	get function text (函數的解譯文字)
	if (typeof fr === 'function') {
		if ('toString' in fr) {
			m = fr.toString;
			delete fr.toString;
		}
		ft = '' + fr;
		if (m)
			fr.toString = m;
	} else
		// typeof fr === 'string'
		ft = '' + fr;

	//	以函數的解譯文字獲得函數名
	m = ft.match(
			//	包含引數:	/^\s*function\s+(\w+)[^(]*\(([^)]*)\)/
			/^function[\s\n]+([^(\s{\n]+)/
			);
	//this.debug('matched ' + m, 1, this.Class + '.get_Function_name');
	if (m)
		//	包含引數:	+ '(' + (f ? m[2] : '') + ')';
		return m[1];


	if (b = _s.b)
		load = _s.ns;
	else
		_s.b = b = {}, _s.ns = load = {};

	if (!ns)
		ns = this;

	//	cache functions
	if ((typeof ns === 'function' || this.is_Object(ns)) && ns.Class
					&& (force_load || !load[ns.Class])) {
		for (i in ns)
			if (typeof ns[i] === 'function'){
				k = this._get_hash_key('' + ns[i]);
				m = ns.Class + '.' + i;
				//this.debug(m + ': ' + k + (', ' + ns[i]).slice(0, 200));
				if(!(m in load)){
					load[m] = 1;
					if (!b[k])
						b[k] = [];
					b[k].push( [ m, ns[i] ]);
				}
			}
		load[ns.Class] = 1;
	}

	//	將函數與 cache 比對以獲得函數名
	if (m = b[this._get_hash_key(ft)])
		for (i = 0; i < m.length; i++) {
			b= m[i][1];
			if (// typeof fr === 'function' &&
					fr === b)
				return m[i][0];
			if (ft === ('' + b))
				return m[i];
		}
};







CeL.ce
.
null_function = function() {};


//	initial

//temporary decoration incase we call for nothing
_.debug = _.err = _.warn = _.log = function(m) {
	var _s=arguments.callee;
	//_s.function_to_call.apply(null,arguments);
	//_s.function_to_call.apply(global, arguments);

	_s.buffer.push(m);

	if (!_s.max_length)
		_s.max_length = 0;

	if (debug && _s.buffer.length > _s.max_length)
		_s.function_to_call.call(global, _s.buffer.join('\n\n')),
		_s.buffer = [];
};
_.log.buffer = [];
_.log.max_length = 0;

var max_log_length = 1000;
_.log.function_to_call =
	typeof JSalert === 'function' ? JSalert:
	typeof WScript==='object'?function(m){m=''+m;if(m.length>2*max_log_length)m=m.slice(0,max_log_length)+'\n\n..\n\n'+m.slice(-max_log_length);WScript.Echo(m);}:
	typeof alert==='object' || typeof alert==='function'? function(m){m=''+m;if(m.length>2*max_log_length)m=m.slice(0,max_log_length)+'\n\n..\n\n'+m.slice(-max_log_length);alert(m);}:
	_.null_function;

_.initial_env();


/*
var test_obj=_(2,'test: initial');

test_obj.test_print('OK!');
*/
;



//setTool(),oldVadapter();	//	當用此檔debug時請執行此行
//alert(ScriptEngine()+' '+ScriptEngineMajorVersion()+'.'+ScriptEngineMinorVersion()+'.'+ScriptEngineBuildVersion());



/*	initialization of function.js
	僅僅執行此檔時欲執行的程序。

TODO

setTool(),oldVadapter();	//	當用此檔debug時請執行此行

	利用.js加上此段與init()，以及.hta（<script type="text/javascript" src="~.js"></script>），可造出 GUI / none GUI 兩種可選擇之介面。
	if(typeof args=='object')init();else window.onload=init;
*/
//args=args.concat(['turnCode.js']);
var _library_onload;
if (_library_onload === undefined){
	_library_onload = function() {
		//WScript.Echo(_.env.ScriptName);
		//_.log(_.env.ScriptName);
		if (1 && _.env.ScriptName === 'ce') {
			//WScript.Echo(_.env.ScriptName);
			_.use('OS.Windows.registry');
			//_.log(_.registryF);

			var _p = _.registryF.getValue(_._iF.p) || '(null)';
			if (_p != _.env.library_base_path) {
				_.log('Change path of [' + _.env.ScriptName + '] from:\n' + _p
						+ '\n to\n' + _.env.library_base_path + '\n\n' + _._iF.p);
				_.registryF.setValue.cid = 1;
				_.registryF.setValue(_._iF.p, _.env.library_base_path, 0, 0, 1);
				_.registryF.setValue.cid = 0;
			}

			if (typeof args === 'object') {// args instanceof Array
				// getEnvironment();
				// alert('Get arguments ['+args.length+']\n'+args.join('\n'));
				if (args.length) {
					var i = 0, p, enc, f, backupDir = dBasePath('kanashimi\\www\\cgi-bin\\program\\log\\');
					if (!fso.FolderExists(backupDir))
						try {
							fso.CreateFolder(backupDir);
						} catch (e) {
							backupDir = dBasePath('kanashimi\\www\\cgi-bin\\game\\log\\');
						}
					if (!fso.FolderExists(backupDir))
						try {
							fso.CreateFolder(backupDir);
						} catch (e) {
							if (2 == alert(
									'無法建立備份資料夾[' + backupDir + ']！\n接下來的操作將不會備份！',
									0, 0, 1 + 48))
								WScript.Quit();
							backupDir = '';
						}
					// addCode.report=true; // 是否加入報告
					for (; i < args.length; i++)
						if ((f = dealShortcut(args[i], 1))
								.match(/\.(js|vbs|hta|s?html?|txt|wsf|pac)$/i)
								&& isFile(f)) {
							p = alert(
									'是否以預設編碼['
											+ ((enc = autodetectEncode(f)) == simpleFileDformat ? '內定語系(' + simpleFileDformat + ')'
													: enc) + ']處理下面檔案？\n' + f,
									0, 0, 3 + 32);
							if (p == 2)
								break;
							else if (p == 6) {
								if (backupDir)
									fso.CopyFile(f, backupDir + getFN(f), true);
								addCode(f);
							}
						}
				} else if (1 == alert('We will generate a reduced ['
						+ _.env.ScriptName + ']\n  to [' + _.env.ScriptName
						+ '.reduced.js].\nBut it takes several time.', 0, 0,
						1 + 32))
					reduceScript(0, _.env.ScriptName + '.reduced.js');
			}//else window.onload=init;

			//_._iF=undefined;
		} //	if(1&&_.env.ScriptName==='function'){
	}; //	_library_onload
}



/*

//	test WinShell	http://msdn.microsoft.com/en-us/library/bb787810(VS.85).aspx
if (0) {
	alert(WinShell.Windows().Item(0).FullName);

	var i, cmd, t = '', objFolder = WinShell.NameSpace(0xa), objFolderItem = objFolder
			.Items().Item(), colVerbs = objFolderItem.Verbs(); // 假如出意外，objFolder==null
	for (i = 0; i < colVerbs.Count; i++) {
		t += colVerbs.Item(i) + '\n';
		if (('' + colVerbs.Item(i)).indexOf('&R') != -1)
			cmd = colVerbs.Item(i);
	}
	objFolderItem.InvokeVerb('' + cmd);
	alert('Commands:\n' + t);

	// objShell.NameSpace(FolderFrom).CopyHere(FolderTo,0); // copy folder
	// objFolderItem=objShell.NameSpace(FolderFrom).ParseName("clock.avi");objFolderItem.Items().Item().InvokeVerb([動作]);
	// objShell.NameSpace(FolderFromPath).Items.Item(mName).InvokeVerb();

	// Sets or gets the date and time that a file was last modified.
	// http://msdn.microsoft.com/en-us/library/bb787825(VS.85).aspx
	// objFolderItem.ModifyDate = "01/01/1900 6:05:00 PM";
	// objShell.NameSpace("C:\Temp").ParseName("Test.Txt").ModifyDate =
	// DateAdd("d", -1, Now()) CDate("19 October 2007")

	// Touch displays or sets the created, access, and modified times of one or
	// more files. http://www.stevemiller.net/apps/
}

//	測試可寫入的字元:0-128,最好用1-127，因為許多編輯器會將\0轉成' '，\128又不確定
if (0) {
	var t = '', f = 'try.js', i = 0;
	for (; i < 128; i++)
		t += String.fromCharCode(i);
	if (simpleWrite(f, t))
		alert('Write error!\n有此local無法相容的字元?');
	else if (simpleRead(f) != t)
		alert('內容不同!');
	else if (simpleWrite(f, dQuote(t) + ';'))
		alert('Write error 2!\n有此local無法相容的字元?');
	else if (eval(simpleRead(f)) != t)
		alert('eval內容不同!');
	else
		alert('OK!');
}
*/


if(_library_onload)
	_library_onload();




}
)(
	//typeof window === 'undefined' ? this : window
	this
)
//)	//	void(
;









/*
TODO:

use -> using because of 'use' is a keyword of JScript.

No eval.
以其他方法取代 eval 的使用。

http://msdn.microsoft.com/en-us/library/2b36h1wa(VS.71).aspx
The arguments object is not available when running in fast mode, the default for JScript .NET. To compile a program from the command line that uses the arguments object, you must turn off the fast option by using /fast-. It is not safe to turn off the fast option in ASP.NET because of threading issues.

*/


typeof CeL === 'function' &&
function(){


var _ = this;




CeL.ce
.
/**
 * 延展物件 (learned from jQuery)
 * @since	2009/11/25 21:17:44
 * @param	variable_set	variable set
 * @param	name_space	extend to what name-space
 * @param	from_name_space	When inputing function names, we need a base name-space to search these functions.
 * @return	library names-pace
 * @see
 * <a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/03/01/jquery-extend.aspx" accessdate="2009/11/17 1:24" title="jQuery.extend的用法 - 黑暗執行緒">jQuery.extend的用法</a>,
 * <a href="http://www.cnblogs.com/rubylouvre/archive/2009/11/21/1607072.html" accessdate="2010/1/1 1:40">jQuery源码学习笔记三 - Ruby's Louvre - 博客园</a>
 */
extend = function(variable_set, name_space, from_name_space){
/*
	if(this.is_debug())
		throw new Error(1, 'UNDO');
*/
	var _s, i, l;

	if(name_space === undefined || name_space === null)
		//	如果沒有指定擴展的對象，則擴展到自身
		name_space = this;

	if(from_name_space === undefined)
		from_name_space = this;

	if(typeof variable_set === 'function'){
		if(this.parse_function){
		}else{
			_.warn('Warning: Please include ' + this.Class + '.parse_function() first!');
		}

	}else if(typeof variable_set === 'string'){
		if(name_space === from_name_space)
			;
		else if(variable_set in from_name_space){
			//_.debug('extend (' + (typeof variable_set) + ') ' + variable_set + '\n=' + from_name_space[variable_set] + '\n\nto:\n' + name_space);
			name_space[variable_set] = from_name_space[variable_set];
		}else
			try{
				name_space[variable_set] = this.eval_various(variable_set);
				//_.debug(variable_set + ' = ' + name_space[variable_set]);
			}catch(e){
				_.warn(this.Class + '.extend:\n' + e.message);
			}

	}else if(variable_set instanceof Array){
		for (_s = arguments.callee, i = 0, l = variable_set.length; i < l; i++) {
			_s.call(this, variable_set[i], name_space, from_name_space);
		}

	}else if(variable_set instanceof Object){
		for(i in variable_set){
			name_space[i] = variable_set[i];
		}
	}

	return this;
};


CeL.ce
.
/**
 * Get file resource<br/>
 * 用於 include JavaScript 檔之類需求時，取得檔案內容之輕量級函數。<br/>
 * 除 Ajax，本函數亦可用在 CScript 執行中。
 * @example
 * //	get contents of [path/to/file]:
 * var file_contents = CeL.get_file('path/to/file');
 * @param	{String} path	URI / full path. <em style="text-decoration:line-through;">不能用相對path！</em>
 * @param	{String} [encoding]	file encoding
 * @return	{String} data	content of path
 * @return	{undefined}	when error occurred: no Ajax function, ..
 * @throws	uncaught exception @ Firefox: 0x80520012 (NS_ERROR_FILE_NOT_FOUND), <a href="http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#exceptions">NETWORK_ERR</a> exception
 * @throws	'Access to restricted URI denied' 當 access 到上一層目錄時 @ Firefox
 * @see
 * <a href=http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx">Cross Site AJAX</a>,
 * <a href="http://domscripting.com/blog/display/91">Cross-domain Ajax</a>,
 * <a href="http://forums.mozillazine.org/viewtopic.php?f=25&amp;t=737645" accessdate="2010/1/1 19:37">FF3 issue with iFrames and XSLT standards</a>,
 * <a href="http://kb.mozillazine.org/Security.fileuri.strict_origin_policy" accessdate="2010/1/1 19:38">Security.fileuri.strict origin policy - MozillaZine Knowledge Base</a>
 * Chrome: <a href="http://code.google.com/p/chromium/issues/detail?id=37586" title="between builds 39339 (good) and 39344 (bad)">NETWORK_ERR: XMLHttpRequest Exception 101</a>
 */
get_file = function(path, encoding){
	//with(typeof window.XMLHttpRequest=='undefined'?new ActiveXObject('Microsoft.XMLHTTP'):new XMLHttpRequest()){

	/**
	 * XMLHttpRequest object.
	 * This can't cache.
	 * @inner
	 * @ignore
	 */
	var o;

	try{
		o = new ActiveXObject('Microsoft.XMLHTTP');
	}catch(e){
		o = new XMLHttpRequest();
	}

	if (o) with (o) {
		open('GET', path, false);

		if (encoding && o.overrideMimeType)
			/*
			 * old: overrideMimeType('text/xml;charset='+encoding);
			 * 但這樣會被當作 XML 解析，產生語法錯誤。
			 */
			overrideMimeType('application/json;charset=' + encoding);

		try {
			//	http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#dfn-send
			//	Invoking send() without the data argument must give the same result as if it was invoked with null as argument.
			send(null);

		} catch (e) {
			//	Apple Safari 3.0.3 may throw NETWORK_ERR: XMLHttpRequest Exception 101
			//this.warn(this.Class + '.get_file: Loading [' + path + '] failed: ' + e);
			//this.err(e);
			//this.debug('Loading [' + path + '] failed.');

			//e.object = o;	//	[XPCWrappedNative_NoHelper] Cannot modify properties of a WrappedNative @ firefox

			o = this.require_netscape_privilege(e, 2);
			//this.debug('require_netscape_privilege return [' + typeof (o) + ('] ' + o).slice(0, 200) + ' ' + (e === o ? '=' : '!') + '== ' + 'error (' + e + ')');
			if (e === o)
				throw e;
			return o;
		}

		//	當在 local 時，成功的話 status === 0。失敗的話，除 IE 外，status 亦總是 0。
		//	status was introduced in Windows Internet Explorer 7.	http://msdn.microsoft.com/en-us/library/ms534650%28VS.85%29.aspx
		//	因此，在 local 失敗時，僅 IE 可由 status 探測，其他得由 responseText 判別。
		//this.debug('Get [' + path + '], status: [' + status + '] ' + statusText);

		return responseText;
	}
	//	else: This browser does not support XMLHttpRequest.

	//	firefox: This function must return a result of type any
	return undefined;
};


CeL.ce
.
/**
 * Ask privilege in mozilla projects.
 * enablePrivilege 似乎只能在執行的 function 本身或 caller 呼叫才有效果，跳出函數即無效，不能 cache，因此提供 callback。
 * 就算按下「記住此決定」，重開瀏覽器後需要再重新授權。
 * @param {String,Error} privilege	privilege that asked 或因權限不足導致的 Error
 * @param {Function,Number} callback	Run this callback if getting the privilege. If it's not a function but a number(經過幾層/loop層數), detect if there's a loop or run the caller.
 * @return	OK / the return of callback
 * @throws	error
 * @since	2010/1/2 00:40:42
 */
require_netscape_privilege = function(privilege, callback) {
	var _s = arguments.callee, f, i,
	/**
	 * raise error.
	 * error 有很多種，所以僅以 'object' 判定。
	 * @inner
	 * @ignore
	 */
	re = function(n, m) {
		//this.debug('Error: ' + m);
		throw privilege && typeof privilege === 'object' ?
			//	Error object
			privilege :
			new Error(n, m);
	};

	if(!_s.enabled)
		re(3, 'Privilege requiring disabled.');

	//	test loop
	//	得小心使用: 指定錯可能造成 loop!
	if (!isNaN(callback) && callback > 0 && callback < 32) {
		for (f = _s, i = 0; i < callback; i++)
			if (f = f.caller)
				f = f.arguments.callee;

		if (f === _s)
			// It's looped
			re(4, 'Privilege requiring looped.');

		callback = 1;

	}else if (typeof callback !== 'function')
		callback = 0;

	f = _s.enablePrivilege;
	if (!f && !(_s.enablePrivilege = f = this
				.eval_various('netscape.security.PrivilegeManager.enablePrivilege')))
		re(1, 'No enablePrivilege get.');

	if (this.is_type(privilege, 'DOMException')
					&& privilege.code === 1012)
		//	http://jck11.pixnet.net/blog/post/11630232
		//	Mozilla的安全機制是透過PrivilegeManager來管理，透過PrivilegeManager的enablePrivilege()函式來開啟這項設定。
		//	須在open()之前呼叫enablePrivilege()開啟UniversalBrowserRead權限。

		//	http://code.google.com/p/ubiquity-xforms/wiki/CrossDomainSubmissionDeployment
		//	Or: In the URL type "about:config", get to "signed.applets.codebase_principal_support" and change its value to true.

		//	由任何網站或視窗讀取私密性資料
		privilege = 'UniversalBrowserRead';

	else if (!privilege || typeof privilege !== 'string')
		re(2, 'Unknown privilege.');

	//this.debug('privilege: ' + privilege);
	try {
		//this.log(this.Class + '.require_netscape_privilege: Asking privilege [' + privilege + ']..');
		f(privilege);
	} catch (e) {
		this.warn(this.Class + '.require_netscape_privilege: User denied privilege [' + privilege + '].');
		throw e;
	}

	//this.debug('OK. Get [' + privilege + ']');


	if (callback === 1) {
		//this.debug('再執行一次 caller..');
		callback = _s.caller;
		return callback.apply(this, callback.arguments);

/*		i = callback.apply(this, callback.arguments);
		this.debug(('return ' + i).slice(0, 200));
		return i;
*/
	} else if (callback)
		// 已審查過，為 function
		return callback();
};

CeL.ce
.
/**
 * 當需要要求權限時，是否執行。（這樣可能彈出對話框）
 * @type	Boolean
 */
require_netscape_privilege.enabled = true;



CeL.ce
.
/*	得知相對 basePath
<script type="text/javascript" src="../baseFunc.js"></script>
var basePath=getBasePath('baseFunc.js');	//	引數為本.js檔名	若是更改.js檔名，亦需要同步更動此值！
*/
get_base_path = function(JSFN){
	if(!JSFN)
		return (typeof WScript === 'object'
					? WScript.ScriptFullName
					: location.href
				).replace(/[^\/\\]+$/, '');

	//	We don't use isObject or so.
	//	通常會傳入的，都是已經驗證過的值，不會出現需要特殊認證的情況。
	//	因此精確繁複的驗證只用在可能輸入奇怪引數的情況。
	if (typeof document !== 'object')
			return '';

	//	form dojo: d.config.baseUrl = src.substring(0, m.index);
	var i, j, b, o = document.getElementsByTagName('script');

	for (i in o)
		try {
			j = o[i].getAttribute('src');
			i = j.lastIndexOf(JSFN);
			if (i !== -1)
				//	TODO: test 是否以 JSFN 作為結尾
				b = j.slice(0, i);
		} catch (e) {
		}

	//this.log()

	//	b || './'
	return b || '';
};

CeL.ce
.
/**
 * default extension of script file.
 * @type	String
 */
script_extension = '.js';//'.txt'

CeL.ce
.
/**
 * get the path of specified module
 * @param {String} module_name	module name
 * @param	{String} file_name	取得在同一目錄下檔名為 file_name 之 path。若填入 '' 可取得 parent 目錄。
 * @return	{String} module path
 */
get_module_path = function(module_name, file_name){
	if(!module_name)
		return module_name;

	//this.debug('load [' + module_name + ']');
	var module_path = this.env.registry_path
				|| this.get_base_path(this.env.main_script)
				|| this.get_base_path()
				;
	module_path += this.split_module_name(module_name).join(/\//.test(module_path)?'/':'\\') + _.script_extension;
	//this.debug(module_path);

	if (file_name !== undefined)
		module_path = module_path.replace(/[^\/]+$/, file_name);
	else if (this.getFP)
		module_path = this.getFP(module_path, 1);

	//this.debug(module_name+': '+module_path);

	return module_path;
};


/*
sample to test:

./a/b
./a/b/
../a/b
../a/b/
a/../b		./b
a/./b		a/b
/../a/b		/a/b
/./a/b		/a/b
/a/./b		/a/b
/a/../b		/b
/a/../../../b	/b
/a/b/..		/a
/a/b/../	/a/
a/b/..		a
a/b/../		a/
a/..		.
./a/b/../../../a.b/../c	../c
../../../a.b/../c	../../../c

*/

//	2009/11/23 22:12:5
if(0)
CeL.ce
.
deprecated_simplify_path = function(path){
	if(typeof path === 'string'){
		path = path.replace(/\s+$|^\s+/,'').replace(/\/\/+/g,'/');

		var p, is_absolute = '/' === path.charAt(0);

		while( path !== (p=path.replace(/\/\.(\/|$)/g,function($0,$1){return $1;})) )
			path = p;
		_.debug('1. '+p);

		while( path !== (p=path.replace(/\/([^\/]+)\/\.\.(\/|$)/g,function($0,$1,$2){alert([$0,$1,$2].join('\n'));return $1 === '..'? $0: $2;})) )
			path = p;
		_.debug('2. '+p);

		if(is_absolute)
			path = path.replace(/^(\/\.\.)+/g,'');
		else
			path = path.replace(/^(\.\/)+/g,'');
		_.debug('3. '+p);

		if(!path)
			path = '.';
	}

	return path;
};

CeL.ce
.
/**
 * 轉化所有 /., /.., //
 * @since	2009/11/23 22:32:52
 * @param {string} path	欲轉化之 path
 * @return	{string} path
 */
simplify_path = function(path){
	if(typeof path === 'string'){
		var i, j, l, is_absolute, head;

		path = path
			.replace(/^[\w\d\-]+:\/\//,function($0){head = $0; return '';})
			//.replace(/\s+$|^\s+/g,'')
			//.replace(/\/\/+/g,'/')
			.split('/');

		i = 0;
		l = path.length;
		is_absolute = !path[0];

		for(;i<l;i++){
			if(path[i] === '.')
				path[i] = '';

			else if(path[i] === '..'){
				j=i;
				while(j>0)
					if(path[--j] && path[j]!='..'){
						path[i] = path[j] = '';	//	相消
						break;
					}
			}
		}

		if(!is_absolute && !path[0])
			path[0] = '.';

		path = path.join('/')
			.replace(/\/\/+/g,'/')
			.replace(is_absolute? /^(\/\.\.)+/g: /^(\.\/)+/g,'')
			;

		if(!path)
			path = '.';

		if(head)
			path = head + path;
	}

	return path;
};





/**
 * 已經 include 之函式或 class
 * @inner
 * @ignore
 */
var loaded_module = {
};

CeL.ce
.
/**
 * Include specified module<br/>
 * 注意：以下的 code 中，CeL.warn 不一定會被執行（可能會、可能不會），因為執行時 code.log 尚未被 include。<br/>
 * 此時應該改用 CeL.use('code.log', callback);<br/>
 * code in head/script/:
 * <pre>
 * CeL.use('code.log');
 * CeL.warn('a WARNING');
 * </pre>
 * **	在指定 callback 時 name_space 無效！
 * **	預設會 extend 到 library 本身下！
 * @param	{String} module	module name
 * @param	{Function} [callback]	callback function
 * @param	{Object, Boolean} [extend_to]	extend to which name-space<br/>
 * false:	just load, don't extend to library name-space<br/>
 * this:	extend to global<br/>
 * object:	extend to specified name-space that you can use [name_space]._func_ to run it<br/>
 * (others, including undefined):	extend to root of this library. e.g., call CeL._function_name_ and we can get the specified function.
 * @return	{Error object}
 * @return	-1	will execute callback after load
 * @return	{undefined}	no error, OK
 * @example
 * CeL.use('code.log', function(){..});
 * CeL.use(['code.log', 'code.debug']);
 * @note
 * 'use' 是 JScript.NET 的保留字
 */
use = function(module, callback, extend_to){
	var _s = arguments.callee, i, l, module_path;

	if (!module)
		return;

	/*
	if (arguments.length > 3) {
		l = arguments.length;
		name_space = arguments[--l];
		callback = arguments[--l];
		--l;
		for (i = 0; i < l; i++)
			_s.call(this, arguments[i], callback, name_space);
		return;
	}
	*/

	if (this.is_type(module, 'Array')) {
		var error;
		for (i = 0, l = module.length; i < l; i++)
			if (error = _s.call(this, module[i], callback, extend_to))
				return error;
		return null;
	}

	if (!(module_path = this.get_module_path(module)) || this.is_loaded(module))
		return null;

	//this.debug('load [' + module + ']:\ntry to load [' + module_path + ']');

	//	including code
	try {
		try{
			// this.debug('load ['+module_path+']');
			// this.debug('load ['+module_path+']:\n'+this.get_file(module_path, this.env.source_encoding));
			//WScript.Echo(this.eval);
			if (i = this.get_file(module_path, this.env.source_encoding))
				//	eval @ global. 這邊可能會出現 security 問題。
				//	TODO: 以其他方法取代 eval 的使用。
				this.eval(i);
			else
				this.warn('Get nothing from [' + module_path + ']! Some error occurred?');
			i = 0;
		} catch (e) {
			i = e;
		}

		if (i) {
			if (callback && window !== undefined) {
				// TODO: 在指定 callback 時使 name_space 依然有效。
				this.include_resource(module_path, {
					module : module,
					callback : callback,
					global : this
				});
				return -1;
			}
			throw i;
		} else
			typeof callback === 'function' && callback();

	} catch (e) {
		//this.err(e);

		// http://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
		// http://reference.sitepoint.com/javascript/DOMException
		if (this.is_type(e, 'DOMException') && e.code === 1012)
			this.err(this.Class
					+ '.use:\n'
					+ e.message
					+ '\n'
					+ module_path
					+ '\n\n程式可能呼叫了一個'
					+ (typeof location === 'object'
						&& location.protocol === 'file:' ? '不存在的，\n或是繞經上層目錄'
								: 'cross domain')
								+ '的檔案？\n\n請嘗試使用相對路徑，\n或 '
								+ this.Class
								+ '.use(module, callback function, name_space)');
		else if (this.is_type(e, 'Error') && (e.number & 0xFFFF) == 5
				|| this.is_type(e, 'XPCWrappedNative_NoHelper')
						&& ('' + e.message).indexOf('NS_ERROR_FILE_NOT_FOUND') !== -1) {
			this.err(this.Class + '.use: 檔案可能不存在？\n[' + module_path + ']' +
					(this.get_error_message
							? ('<br/>' + this.get_error_message(e))
							: '\n' + e.message
					)
				);
		} else
			this.err(this.Class + '.use: Cannot load [' + module + ']!'
					+ (this.get_error_message
							? ('<br/>' + this.get_error_message(e) + '<br/>')
							: '\n[' + (e.constructor) + '] ' + (e.number ? (e.number & 0xFFFF) : e.code) + ': ' + e.message + '\n'
					)
					+ '抱歉！在載入其他網頁時發生錯誤，有些功能可能失常。\n重新讀取(reload)，或是過段時間再嘗試或許可以解決問題。');
		//this.log('Cannot load [' + module + ']!', this.log.ERROR, e);

		return e;
	}


	//typeof name_space !== 'undefined' && this.debug(name_space);
	//	處理 extend to what name-space
	if (!extend_to && extend_to !== false
			//	若是在 .setup_module 中的話，可以探測得到 name_space？（忘了）
			//|| typeof name_space !== 'function'
			|| !(extend_to instanceof Object))
		//	預設會 extend 到 library 本身下
		extend_to = this;

	if (extend_to && (i = this.get_module(module))) {
		var ns = i, kw = this.env.not_to_extend_keyword, no_extend = {};
		//this.debug('load [' + module + ']:\nextend\n' + ns);

		if (kw in ns) {
			l = ns[kw];
			if (typeof l === 'string' && l.indexOf(',') > 0)
				l=l.split(',');

			if (typeof l === 'string') {
				no_extend[l] = 1;
			} else if (l instanceof Array) {
				for (i=0;i<l.length;i++)
					//WScript.Echo('no_extend '+l[i]),
					no_extend[l[i]] = 1;
			} else if (l instanceof Object) {
				no_extend = l;
			}

			no_extend[kw] = 1;
		}

		//	'*': 完全不 extend
		if (!no_extend['*']) {
			no_extend.Class = 1;
			var no_self = 'this' in no_extend;
			if(no_self)
				delete no_extend['this'];

			l = [];
			for (i in ns)
				if (!(i in no_extend))
					l.push(i);

			//this.debug('load [' + module + ']:\nextend\n' + l + '\n\nto:\n' + (extend_to.Class || extend_to));
			this.extend(l, extend_to, ns);

			/*
			 * extend module itself.
			 * e.g., .net.web -> .web
			 */
			if (!no_self && (i = this.split_module_name(module))
							&& (i = i.pop()) && !(i in this))
						this[i] = ns;
		}

	}

};


/*
bad: sometimes doesn't work. e.g. Google Maps API in IE
push inside window.onload:
window.onload=function(){
include_resource(p);
setTimeout('init();',2000);
};

way 3:	ref. dojo.provide();, dojo.require();
document.write('<script type="text/javascript" src="'+encodeURI(p)+'"><\/script>');

TODO:
encode

*/
;

CeL.ce
.
/**
 * include other JavaScript/CSS files
 * @param {String} resource path
 * @param {Function, Object} callback	callback function / 	{callback: callback function, module: module name, global: global object when run callback}
 * @param {Boolean} [use_write]	use document.write() instead of insert a element
 * @param {Boolean} [type]	1: is a .css file, others: script
 */
include_resource = function(path, callback, use_write, type) {
	var _s = arguments.callee, s, t, h;

	if (!_s.loaded){
		s = this.get_include_resource();
		if(!s){
			//	document!=='object': 誤在非 HTML 環境執行，卻要求 HTML 環境下的 resource？
			//if(typeof document==='object')this.warn(this.Class + ".include_resource: Can't load [" + path + "]!");
			return;
		}
		_s.loaded = s[0],
		_s.count = s[1];
	}

	if (path instanceof Array) {
		for (s = 0, t = path.length; s < t; s++)
			_s(path[s], callback, use_write, type);
		return;
	}

	if(path in _s.loaded)
		return;

	if (type === undefined)
		type = /\.css$/i.test(path) ? 1 : 0;

	t = 'text/' + (type === 1 ? 'css' : 'javascript');
/*@cc_on
//use_write=1;	//	old old IE hack
@*/
	if (!use_write)
		try {
			// Dynamic Loading
			// http://code.google.com/apis/ajax/documentation/#Dynamic
			s = document.createElement(type === 1 ? 'link' : 'script');
			s.type = t;
			if (type === 1)
				s.href = path,
				// s.media = 'all',//'print'
				s.rel = 'stylesheet';
			else
				//	TODO: see jquery-1.4a2.js: globalEval
				//	if (is_code) s.text = path;
				s.src = path;

			h = (document.getElementsByTagName('head')[0] || document.body.parentNode
					.appendChild(document.createElement('head')));

			h.appendChild(s);

			//this.debug('HTML:\n' + document.getElementsByTagName('html')[0].innerHTML);
			/*
			 * from jquery-1.4a2.js:
			 * Use insertBefore instead of appendChild to circumvent an IE6 bug
			 *  when using globalEval and a base node is found.
			 * This arises when a base node is used (#2709).
			 * @see
			 * http://github.com/jquery/jquery/commit/d44c5025c42645a6e2b6e664b689669c3752b236
			 * 不過這會有問題: 後加的 CSS file 優先權會比較高。因此，可以的話還是用 appendChild。
			 */
			//h.insertBefore(s, h.firstChild);

			//	.css 移除後會失效
			//h.removeChild(s);

			return s;

		} catch (e) {
			use_write = 1;
		}

	if (use_write)
		document.write(type === 1 ? '<link type="' + t
				+ '" rel="stylesheet" href="' + path + '"><\/link>'
				: '<script type="' + t + '" src="' + path
				// language="JScript"
				+ '"><\/script>');

	_s.loaded[path] = _s.count++;

	if (callback)
		_s.wait_to_call(callback);
};

CeL.ce
.
/**
 * 已經 include_resource 了哪些 JavaScript 檔（存有其路徑）
 * loaded{路徑} = count
 * 本行可省略(only for document)
 */
include_resource.loaded = null;


CeL.ce
.
/**
 * 已經 include_resource 了多少個 JavaScript 檔
 * @type Number
 * 本行可省略(only for document)
 */
include_resource.count = 0;

CeL.ce
.
include_resource.wait_to_call = function(callback) {
	//alert('include_resource.wait_to_call:\n' + _.to_module_name(callback.module));

	if (typeof callback === 'function')
		//	不是 module，僅僅為指定 function 的話，直接等一下再看看。
		//	TODO: 等太久時 error handle
		window.setTimeout(callback, 200);

	else if (callback.global.is_loaded(callback.module)){
		if (typeof callback.callback === 'function')
			callback.callback();
		else if (typeof callback.callback === 'string')
			this.use(callback.callback);
		//	TODO
		//else..

	}else {
		/**
		 * the function it self, not 'this'.
		 * @inner
		 * @ignore
		 */
		var _s = arguments.callee, _t = this;
		window.setTimeout(function() {
			_s.call(_t, callback);
		}, 10);
	}
};

CeL.ce
.
get_include_resource = function(split) {
	if(typeof document!=='object'||!document.getElementsByTagName)
		//	誤在非 HTML 環境執行，卻要求 HTML 環境下的 resource？
		return;

	var i, nodes = document.getElementsByTagName('script'), h, hn, count = 0, p, l;
	if (split)
		h = {
			script : {},
			css : {}
		},
		hn = h.script;
	else
		hn = h = {};

	l = nodes.length;
	for (i = 0; i < l; i++)
		if (p = this.simplify_path(nodes[i].src))
			hn[p] = 1, count++;

	nodes = document.getElementsByTagName('link');
	if (split)
		hn = l.css;

	l = nodes.length;
	for (i = 0; i < l; i++)
		if (p = this.simplify_path(nodes[i].href))
			hn[p] = 1, count++;

	return [ h, count ];
};


CeL.ce
.
/**
 * include resource of module.
 * @example
 * //	外部程式使用時，通常用在 include 相對於 library 本身路徑固定的檔案。
 * //	例如 file_name 改成相對於 library 本身來說的路徑。
 * CeL.include_module_resource('../../game/game.css');
 * @param {String} file_name	與 module 位於相同目錄下的 resource file name
 * @param {String} [module_name]	呼叫的 module name。未提供則設成 library base path，此時 file_name 為相對於 library 本身路徑的檔案。
 * @return
 * @since	2010/1/1-2 13:58:09
 */
include_module_resource = function(file_name, module_name) {
	//var m = this.split_module_name.call(this, module_name);
	//if (m)m[m.length - 1] = file_name;
	return this.include_resource.call(this,
			this.get_module_path(module_name || this.Class, file_name));
};



CeL.ce
.
get_module = function(module_name) {
	module_name = this.split_module_name.call(this, module_name);

	//	TODO: test module_name.length
	if(!module_name)
		return null;

	var i = 0, l = module_name.length, name_space = this;
	//	一層一層 call name-space
	while (i < l)
		try {
			name_space = name_space[module_name[i++]];
		} catch (e) {
			return null;
		}

	return name_space;
};



CeL.ce
.
/**
 * 預先準備好下層 module 定義時的環境。<br/>
 * 請盡量先 call 上層 name-space 再定義下層的。
 * @param	{String} module_name	module name
 * @param	{Function} code_for_including	若欲 include 整個 module 時，需囊括之 code。
 * @return	null	invalid module
 * @return	{Object}	下層 module 之 name-space
 * @return	undefined	something error, e.g., 未成功 load，code_for_including return null, ..
 */
setup_module = function(module_name, code_for_including) {
	module_name = this.split_module_name(module_name);

	//	TODO: test module_name.length
	if(!module_name)
		return null;

	var i = 0, l = module_name.length - 1, name_space = this, name;
	//	一層一層準備好、預定義 name-space
	for (; i < l; i++) {
		if (!name_space[name = module_name[i]])
			//this.debug('預先定義 module [' + this.to_module_name(module_name.slice(0, i + 1)) + ']'),
			name_space[name] = new Function(
					'//	null constructor for module ' +
					this.to_module_name(module_name.slice(0, i + 1)));
		name_space = name_space[name];
	}
	//	name-space 這時是 module 的 parent module。

	if (
			// 尚未被定義或宣告過
			!name_space[name = module_name[l]] ||
			// 可能是之前簡單定義過，例如被上面處理過。這時重新定義，並把原先的 member 搬過來。
			!name_space[name].Class) {

		//	保留原先的 name-space，for 重新定義
		l = name_space[name];

		// extend code, 起始 name-space
		try {
			//this.debug('including code of [' + this.to_module_name(module_name) + ']..'),
			//	TODO: code_for_including(this, load_arguments)
			i = code_for_including(this);
			i.prototype.constructor = i;
			//code_for_including.toString = function() { return '[class_template ' + name + ']'; };
			//i.toString = function() { return '[class ' + name + ']'; };
		} catch (e) {
			this.err(this.Class + '.setup_module: load module ['
					+ this.to_module_name(module_name) + '] error!\n' + e.message);
			i = undefined;
		}
		if (i === undefined)
			return i;
		name_space = name_space[name] = i;

		// 把原先的 member 搬過來
		if (l) {
			delete l.Class;
			//	may use: this.extend()
			for (i in l)
				name_space[i] = l[i];
		}
		name_space.Class = this.to_module_name(module_name);
	}

/*
	l=[];
	for(i in name_space)
		l.push(i);
	WScript.Echo('Get members:\n'+l.join(', '));
*/

	this.set_loaded(name_space.Class, code_for_including);

	return name_space;
};


CeL.ce
.
/**
 * 模擬 inherits
 * @param {String} module_name	欲繼承的 module_name
 * @param initial_arguments	繼承時的 initial arguments
 * @return
 * @see
 * <a href="http://fillano.blog.ithome.com.tw/post/257/17355" accessdate="2010/1/1 0:6">Fillano's Learning Notes | 物件導向Javascript - 實作繼承的效果</a>,
 * <a href="http://www.crockford.com/javascript/inheritance.html" accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>
 */
inherits = function(module_name, initial_arguments) {
	var c = loaded_module[this.to_module_name(module_name)];
	try {
		if (typeof c === 'function')
			return c(this, initial_arguments);
	} catch (e) {
		return e;
	}
};


CeL.ce
.
/**
 * 將輸入的 string 分割成各 module 單元。<br/>
 * need environment_adapter()<br/>
 * ** 並沒有對 module 做完善的審核!
 * @param {String} module_name	module name
 * @return	{Array}	module unit array
 */
split_module_name = function(module_name) {
	//this.debug('[' + module_name + ']→[' + module_name.replace(/\.\.+|\\\\+|\/\/+/g, '.').split(/\.|\\|\/|::/) + ']');
	if (typeof module_name === 'string')
		module_name = module_name.replace(/\.\.+|\\\\+|\/\/+/g, '.').split(/\.|\\|\/|::/);

	if (module_name instanceof Array) {
		//	去除 library name
		if (module_name.length>1 && this.Class == module_name[0])
			module_name.shift();
		return module_name;
	} else
		return null;
};



CeL.ce
.
to_module_name = function(module, separator) {
	if (typeof module === 'function')
		module = module.Class;

	if (typeof module === 'string')
		module = this.split_module_name(module);

	var name = '';
	if (module instanceof Array) {
		if (typeof separator !== 'string')
			separator = this.env.module_name_separator;
		if (module[0] != this.Class)
			name = this.Class + separator;
		name += module.join(separator);
	}

	return name;
};

//	TODO
CeL.ce
.
unload_module = function(module, g){
};


CeL.ce
.
/**
 * 判斷 module 是否存在，以及是否破損。
 * @param	{String} module_name	module name
 * @return	{Boolean} module 是否存在以及良好。
 */
is_loaded = function(module_name) {
	// var _s = arguments.callee;
	//this.debug('test ' + this.to_module_name(module_name));
	return loaded_module[this.to_module_name(module_name)] ? true
			: false;
};



CeL.ce
.
set_loaded = function(module_name, code_for_including) {
	//this.debug(this.to_module_name(module_name));
	loaded_module[this.to_module_name(module_name)] = code_for_including || true;
};




CeL.ce
.
/**
 * module 中需要 include function 時使用。<br/>
 * TODO: 輸入 function name 即可
 * @example
 * //	requires (inside module)
 * if(eval(library_namespace.use_function('data.split_String_to_Object')))return;
 * @param function_list	function list
 * @param [return_extend]	設定時將回傳 object
 * @return	error
 * @since
 * 2009/12/26 02:36:31
 * 2009/12/31 22:21:23	add 類似 'data.' 的形式，為 module。
 */
use_function = function(function_list, return_extend) {
	var list = this.is_Array(function_list) ? function_list
			: typeof function_list === 'string' ? function_list
					.split(',') : 0;

	if (!list || !list.length)
		return 1;

	//this.debug('load function [' + list + ']');

	var i = 0, m, l = list.length, n,
	old_module_name,
	module_hash = {},
	variable_hash = {};

	for (; i < l; i++)
		if ((m = this.split_module_name(list[i])) && m.length > 1) {
			//this.debug('load function [' + m + ']');
			//	if(n): 類似 'data.split_String_to_Object' 的形式，為 function。else: 類似 'data.' 的形式，為 module。
			n = m[m.length - 1];
			//if (!n) this.debug('load module [' + this.to_module_name(m) + ']');

			if(!n)
				m.pop();
			variable_hash[n || m[m.length - 1]] = this.to_module_name(m);
			if (n)
				m.pop();
			//this.debug('test module ['+m.join(this.env.module_name_separator)+']: '+this.eval_various(m.join(this.env.module_name_separator),this));
			module_hash[m.join(this.env.module_name_separator)] = 1;
		}

	m = [];
	for (i in module_hash)
		//this.debug('prepare to load module ['+i+']'),
		m.push(i);

	//this.debug('module [' + (typeof module_name === 'string' ? module_name: undefined) + '] load:\n' + m);

	// include required modules
	m = this.use(
		m,
		//	module_name 為呼叫 modele，在 .use() 中會被重設：eval 時由 modele 裡面的 code 設定。但在 IE 中為 undefined。
		old_module_name = typeof module_name === 'string' ? module_name
				: undefined);

	if (old_module_name)
		module_name = old_module_name;

	//	use 失敗: 需要 callback？
	if (m)
		return 2;

	if(!return_extend)
		l = [];
	for (i in variable_hash) {
		m = this.eval_various(n = variable_hash[i]);
		//this.debug('load [' + n + ']: ' + m);

		//	test if this function exists
		if (typeof m !== 'function') {
			delete variable_hash[i];
			this.err(this.Class + '.use_function: load [' + n
					+ '] error: ' + (m || "Doesn't defined?"));
		} else if (!return_extend)
			l.push(i + '=' + n);
	}

	//if (!return_extend)this.debug('@[' + module_name + ']: var ' + l.join(',') + ';0');

	return return_extend ? variable_hash : l.length ? 'var ' + l.join(',') + ';0' : '';
};


/**
 * 為一些比較舊的版本或不同瀏覽器而做調適。
 * @since	2010/1/14 17:58:31
 * @inner
 * @private
 * @ignore
 */
function environment_adapter() {
	/*
	 * workaround:
	 * 理論上 '.'.split(/\./).length 應該是 2，但 IE 5~8 中卻為 0!
	 * 用 .split('.') 倒是 OK.
	 * TODO:
	 * 應該增加可以管控與回復的手段，預防有時需要回到原有行為。
	 * @since	2010/1/1 19:03:40
	 */
	if ('.'.split(/\./).length === 0)
		(function() {
			var _String_split = String.prototype.split,
				is_Regexp = _.object_tester('RegExp');
			String.prototype.split = function(r) {
				return is_Regexp(r) ?
						_String_split.call(this.valueOf().replace(
								r.global ? r :
									// TODO: 少了 multiline
									new RegExp(r.source, r.ignoreCase ? 'ig' : 'g'),
							'\0'), '\0') :
						_String_split.call(this, r);
			};
		})();
}

environment_adapter();

}.apply(CeL);






//}catch(e){WScript.Echo('There are some error in function.js!\n'+e.message);throw e;}



//CeL.use('code.log');
//CeL.warn('test_print: ' + CeL.code.log.Class);


//]]>





//--------------------------------------------------------------------------------//




/**
 * @name	CeL data function
 * @fileoverview
 * 本檔案包含了 data 處理的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'data';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.data
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

/**
 * null module constructor
 * @class	data 處理的 functions
 */
CeL.data
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.data
.prototype = {
};




/*	2008/7/19 11:13:10
	eval(uneval(o)): IE 沒有 uneval
	http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone

way1:
return YAHOO.lang.JSON.parse( YAHOO.lang.JSON.stringify( obj ) );

TODO:
1.
防止交叉參照版: try
var a=function(){this.a=1,this.b={a:this.a},this.a={b:this.b};},b=cloneObject(a);
.or.
var a={},b;
a.a={a:1};
a.b={a:a.a};
a.a={b:a.b};
b=cloneObject(a);

恐須改成
=new cloneObject();


2.
equal()

*/
function cloneObject(o,noTrivial){
 if(!o||!(o instanceof Object))return o;// || typeof(obj) != 'object'
 var i,r=new o.constructor(o);	//	o.constructor()
 for(i in o)r[i]=noTrivial/*||o[i]===o*/?o[i]:arguments.callee(o[i],deep);	//	o[i]===o: 預防 loop, 但還是不能防止交叉參照
 return r;
}


/*	2004/5/5
	輸入'"','dh"fdgfg'得到2:指向"的位置
*/
function getQuoteIndex(quote,str){	//	quote:['"/]，[/]可能不太適用，除非將/[/]/→/[\/]/
 var i,l=0;
 while(i=str.indexOf(quote,l),i>0&&str.charAt(i-1)=='\\')
  if( str.slice(l,i-2).match(/(\\+)$/) && RegExp.$1.length%2 )break;
  else l=i+1;
 return i;
}



/*	2008/12/21 18:53:42
	value to json
	JavaScript Object Notation	ECMA-262 3rd Edition

	http://stackoverflow.com/questions/1500745/how-to-pass-parameters-in-eval-in-an-object-form
	json={name:'~',values:..,description:'~'}
	window[json.name].apply(null, json.values)


usage:
json(value)

parse:
data=eval('('+data+')');	//	字串的前後記得要加上刮號 ()，這是用來告知 Javascript Interpreter 這是個物件描述，不是要執行的 statement。
eval('data='+data);

TODO:

useObj
	加入function object成員，.prototype可用with()。加入函數相依性(dependency)

array用name:
(function(){
 var o;
 o=[..];
 var i,v={..};
 for(i in v)o[i]=v[i];
 return o; 
})()


據說toJSONString跟parseJSON有可能成為ECMAScript第四版的標準


recursion 循環參照
(function(){
 var o;
 o={a:[]};
 o['b']=[o['a']],
 o['a'].push([o['b']]);
 return o; 
})()



BUG:
function 之名稱被清除掉了，這可能會產生問題！
(function(){
 var f=function(){..};
 f.a=..;
 f.b=..;
 f.prototype={
  a:..,
  b:..
 }
 return f; 
})()


*/
//json[generateCode.dLK]='qNum,dQuote';

json.dL='dependencyList';	//	dependency List Key
json.forceArray=1;

json.indentString='	';
json.NewLine='\n';
json.separator=' ';
function json(val,name,type){	//	type==2: inside object, treat undefined as ''
 var _f=arguments.callee,expA=[],expC=[],vType=typeof val
	,addE=function(o,l,n){
		if(l){
		 o=_f(o,0,2);
		 n=typeof n=='undefined'||n===''?''
			:(/^(\d{1,8})?(\.\d{1,8})?$/.test(n)||/^[a-z_][a-z_\d]{0,30}$/i.test(n)?n:dQuote(n))+':'+_f.separator;
		 expA.push(n,o[1]);

		 //expC.push(_f.indentString+n+o[0].join(_f.NewLine+_f.indentString)+',');
		 o=o[0];
		 o[0]=n+(typeof o[0]=='undefined'?'':o[0]);
		 o[o.length-1]+=',';
		 for(var i=0;i<o.length;i++)
		  o[i]=_f.indentString+(typeof o[i]=='undefined'?'':o[i]);
		 expC=expC.concat(o);
		}else expA.push(o),expC.push(o);
	}
	//	去掉最後一組的 ',' 並作結
	,closeB=function(c){
		var v=expC[expC.length-1];
		if(v.charAt(v.length-1)==',')
		 expC[expC.length-1]=v.slice(0,v.length-1);
		addE(c);
	};

 switch(vType){
  case 'number':
	//	http://msdn2.microsoft.com/zh-tw/library/y382995a(VS.80).aspx
	//	isFinite(value) ? String(value)
	var k=0,m='MAX_VALUE,MIN_VALUE,NEGATIVE_INFINITY,POSITIVE_INFINITY,NaN'.split(','),t=0;
	if(val===NaN||val===Infinity||val===-Infinity)t=''+val;
	else for(;k<m.length;k++)
	 if(val===Number[m[k]]){t='Number.'+m[k];break;}
	if(!t){
	 //	http://msdn2.microsoft.com/zh-tw/library/shydc6ax(VS.80).aspx
	 for(k=0,m='E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2'.split(',');k<m.length;k++)
	  if(val===Math[m[k]]){t='Math.'+m[k];break;}
	 if(!t)
	  if(k=(''+val).match(/^(-?\d*[1-9])(0{3,})$/))
	   t=k[1]+'e'+k[2].length;
	  else{

	   //	有理數判別
	   k=qNum(val);

	   //	小數不以分數顯示. m==1:非分數
	   m=k[1];
	   while(m%2==0)m/=2;
	   while(m%5==0)m/=5;

	   t=k[2]==0 && m!=1?k[0]+'/'+k[1]:
		//	TODO: 加速(?)
		(t=Math.floor(val))==val&&(''+t).length>(t='0x'+val.toString(16)).length?t:val;
	  }

	}
	addE(t);
	break;
  case 'null':
	addE(''+val);
	break;
  case 'boolean':
	addE(val);
	break;
  case 'string':
	addE(dQuote(val));
	break;
  case 'undefined':
	addE(type==2?'':'undefined');
	break;

  case 'function':
	//	加入function object成員，.prototype可用with()。加入函數相依性(dependency)
	var toS,f;
	//	這在多執行緒有機會出問題！
	if(typeof val.toString!='undefined'){toS=val.toString;delete val.toString;}
	f=''+val;
	if(typeof toS!='undefined')val.toString=toS;

	f=f.replace(/\r?\n/g,_f.NewLine);	//	function 才會產生 \r\n 問題，所以先處理掉
	var r=/^function\s+([^(\s]+)/,m=f.match(r),t;
	if(m)m=m[1],addE('//	function ['+m+']'),t=f.replace(r,'function'+_f.separator);
	if(m&&t.indexOf(m)!=-1)alert('function ['+m+'] 之名稱被清除掉了，這可能會產生問題！');
	addE(t||f);
	//	UNDO
	break;

  case 'object':
   try{
	if(val===null){addE(''+val);break;}
	var c=val.constructor;
	if(c==RegExp){
	 addE(val);
	 break;
	}
	if(c==Date || vType=='date'){	//	typeof val.getTime=='function'
	 //	與 now 相隔過短(<1e7, 約3h)視為 now。但若是 new Date()+3 之類的會出現誤差！
	 addE('new Date'+((val-new Date)>1e7?'('+val.getTime()+')':''));	//	date被當作object
	 break;
	}
	if((''+c).indexOf('Error')!=-1){
	 addE('new Error'+(val.number||val.description?'('+(val.number||'')+(val.description?(val.number?',':'')+dQuote(val.description):'')+')':''));
	 break;
	}

	var useObj=0;
	if(c==Array){
	 var i,l=0;
	 if(!_f.forceArray)for(i in val)
	  if(isNaN(i)){useObj=1;break;}else l++;

	 if(_f.forceArray || !useObj && l>val.length*.8){
	  addE('[');
	  for(i=0;i<val.length;i++)
	   addE(val[i],1);
	  closeB(']');
	  break;
	 }else useObj=1;
	}

	if(useObj||c==Object){// instanceof
	 addE('{');
	 for(var i in val)
	  addE(val[i],1,i);
	 closeB('}');
	 break;
	}
	addE(dQuote(val));
	break;
   }catch(e){
    if(28==(e.number&0xFFFF))
     alert('json: Too much recursion?\n循環參照？');
    return;
   }

  case 'unknown':	//	sometimes we have this kind of type
  default:
	alert('Unknown type: ['+vType+'] (constructor: '+val.constructor+'), please contract me!\n'+val);
	break;
	//alert(vType);
 }
 return type?[expC,expA]:expC.join(_f.NewLine);
}

/*
var a=[],b;a.push(b=[a]);json(a);

recursion 循環參照
(function(){
 var o,_1;
 _1=[o];
 o.push(_1];
 return o; 
})()

*/





//{var a=[],b,t='',i;a[20]=4,a[12]=8,a[27]=4,a[29]=4,a[5]=6,a.e=60,a.d=17,a.c=1;alert(a);b=sortValue(a);alert(a+'\n'+b);for(i in b)t+='\n'+b[i]+'	'+a[b[i]];alert(t);}
//	依值排出key array…起碼到現在，我還看不出此函數有啥大功用。
function sortValue(a,mode){	//	array,否則會出現error!	mode=1:相同value的以','合併,mode=2:相同value的以array填入
 var s=[],r=[],i,j,b,k=[];
 for(i in a)	//	使用(i in n)的方法，僅有數字的i會自動排序；這樣雖不必用sort()，但數字亦會轉成字串。
  if((b=isNaN(i)?i:parseFloat(i)),typeof s[j=isNaN(j=a[i])?j:parseFloat(j)]=='undefined')
   k.push(j),s[j]=b;
  else if(typeof s[j]=='object')s[j].push(b);
  else s[j]=[s[j],b];
 for(i=0,k.sort(function(a,b){return a-b;});i<k.length;i++)	//	sort 方法會在原地排序 Array 物件
  if(typeof(b=s[k[i]])=='object')
   if(mode==1)r.push(b.join(','));	//	b.join(',')與''+b效能相同
   else if(mode==2)r.push(b);
   else for(j in b)r.push(b[j]);
  else r.push(b);
 return r;
}


/*	2005/7/18 21:26
	依照所要求的index(sortByIndex_I)對array排序。
	sortByIndex_Datatype表某index為數字/字串或function
	先設定sortByIndex_I,sortByIndex_Datatype再使用array.sort(sortByIndex);

	example:
var array=[
'123	avcf	334',
'131	hj	562',
'657	gfhj	435',
'131	ajy	52',
'345	fds	562',
'52	gh	435',
];
sortByIndex_I=[0,1],sortByIndex_Datatype={0:1,2:1};
for(i in array)array[i]=array[i].split('	');
array.sort(sortByIndex);
alert(array.join('\n'));
*/
var sortByIndex_I,sortByIndex_Datatype;
function sortByIndex(a,b){
 //alert(a+'\n'+b);
 for(var i=0,n;i<sortByIndex_I.length;i++)
  if(sortByIndex_Datatype[n=sortByIndex_I[i]]){
   if(typeof sortByIndex_Datatype[n]=='function'){
    if(n=sortByIndex_Datatype[n](a[n],b[n]))return n;
   }else if(n=a[n]-b[n])return n;
  }else if(a[n]!=b[n])return a[n]>b[n]?1:-1;
 return 0;
}

/*	2005/7/18 21:26
	依照所要求的index對array排序，傳回排序後的index array。
	**假如設定了separator，array的元素會先被separator分割！

	example:
var array=[
'123	avcf	334',
'131	hj	562',
'657	gfhj	435',
'131	ajy	52',
'345	fds	562',
'52	gh	435',
];
alert(getIndexSortByIndex(array,'	',[0,1],[0,2]));
alert(array.join('\n'));	//	已被separator分割！

*/
function getIndexSortByIndex(array,separator,indexArray,isNumberIndex){
 //	判定與事前準備(設定sortByIndex_I,sortByIndex_Datatype)
 if(typeof indexArray=='number')sortByIndex_I=[indexArray];
 else if(typeof indexArray!='object'||indexArray.constructor!=Array)sortByIndex_I=[0];
 else sortByIndex_I=indexArray;
 var i,sortByIndex_A=[];
 sortByIndex_Datatype={};
 if(typeof isNumberIndex=='object'){
  if(isNumberIndex.constructor==Array){
   sortByIndex_Datatype={};
   for(i=0;i<isNumberIndex.length;i++)sortByIndex_Datatype[isNumberIndex[i]]=1;
  }else sortByIndex_Datatype=isNumberIndex;
  for(i in sortByIndex_Datatype)
   if(isNaN(sortByIndex_Datatype[i])||parseInt(sortByIndex_Datatype[i])!=sortByIndex_Datatype[i])delete sortByIndex_Datatype[i];
 }
 if(typeof array!='object')return;

 //	main work: 可以不用重造array資料的話..
 for(i in array){
  if(separator)array[i]=array[i].split(separator);
  sortByIndex_A.push(i);
 }
 sortByIndex_A.sort(function (a,b){return sortByIndex(array[a],array[b]);});

/*	for: 重造array資料
 var getIndexSortByIndexArray=array;
 for(i in getIndexSortByIndexArray){
  if(separator)getIndexSortByIndexArray[i]=getIndexSortByIndexArray[i].split(separator);
  sortByIndex_A.push(i);
 }
 sortByIndex_A.sort(function (a,b){return sortByIndex(getIndexSortByIndexArray[a],getIndexSortByIndexArray[b]);});
*/

 return sortByIndex_A;
}







/*
{var d=new Date;try1();alert(gDate(new Date-d));}
function try1(){
 var s='sde'.x(9999),t='',m,i=0;
 while(m=s.substr(i).match(/s[^s]+/))t+=s.substr(i,RegExp.index),i+=RegExp.lastIndex;	//	way 1:3.24,3.19,3.13
 //while(m=s.match(/s[^s]+/))t+=s.slice(0,RegExp.index),s=s.substr(RegExp.lastIndex);	//	way 2:3.52,3.24,3.29
 //	way 1 is litter better than way 2.
}*/


/*
//	TODO: 對 encodeCode/decodeCode/reduceCode 嚴厲的測試（笑）
{var tr=1,c=simpleRead('function.js'),testF='try.txt',p='',range=99	,sp='='.x(80)+NewLine,tr2=tr,i,j,t,d,d0=new Date,da,db,dc;try{simpleWrite('try.js',c=reduceCode(c),TristateTrue);
 do{da=new Date;t=''+encodeCode(c,p);db=new Date;d=''+decodeCode(t,p);dc=new Date;}while(--tr&&new Date-d0<2e4&&c==d);	//	find different
 //if(d)alert('['+c.length+']→['+t.length+']	( '+(100*t.length/c.length).decp(2)+' %)\n'+t.slice(0,range)+'\n..\n\ndecode →\n'+d.slice(0,range));//+'\n'+c
 for(i=0,j=[];i<c.length;i++)j.push((i%80?'':NewLine)+c.charCodeAt(i));c+=j;
 for(i=0,j=[];i<t.length;i++)j.push((i%80?'':NewLine)+t.charCodeAt(i));t+=j;
 for(i=0,j=[];i<d.length;i++)j.push((i%80?'':NewLine)+d.charCodeAt(i));d+=j;
 simpleWrite(testF,'start at '+gDate(da)+NewLine+'encode: '+gDate(db-da)+NewLine+'decode: '+gDate(dc-db)+NewLine+sp+'['+c.length+']→['+t.length+']	( '+(100*t.length/c.length).decp(2)+' %)'+NewLine+c+NewLine+NewLine+t+NewLine+sp+(typeof encodeCodeC!='undefined'?encodeCodeC+sp:'')+NewLine+d+NewLine+sp+(typeof decodeCodeC!='undefined'?decodeCodeC+sp:'')+'try '+(tr2-tr)+' times '+(c==d?'OK!':'failed @ '+(i=same(c,d))+' .'+NewLine+c.substr(i-9,range)+NewLine+'-'.x(20)+NewLine+d.substr(i-9,range))+NewLine,TristateTrue);
 alert('Test encodeCode over!');
}catch(e){simpleWrite(testF,popErr(e));}}	*/
//{a=simpleRead('function.js');for(i=0;i<encodeCodeDwordsRef.length;i++)a=a.replace(encodeCodeDwordsRef[i].replace(/([()])/g,'\\$1'),'');simpleWrite('try.txt',a);}
/*	編程式碼
	[0-\uffff=65535]
	↓	mapping to
	[1-10,13-29,32-127]:123個	普通char98[9,10,13,32-126], control chars25[1-8,14-29,127]
		[unicode control chars:ucC~ucC+5=1~5 *123^2]+unicode[*123][*1], [low unicode control chars:lucC~lucC+1=6~7]+[c]:char[0-31,127~255(最多2*122-32+127=339)], [片語char code:wordC=8]+片語index, [片語設定char code:wordSet=127]+[ (3 upper bits+) 4 len bits]+[片語index]+words
		尚可用char：16個[14-29]（未來擴充用，如\uhhhhhhhh:19個+4chars，不夠～）
	↓	mapping to
	char[1-9,11-12,14-127]-["\]:123個index

	未來：unicode片語編碼

	JavaScript五大關鍵字 - hax的技術部落格 - JavaEye技術網站	http://hax.javaeye.com/blog/380285
	if,this,function,return,var

	下兩行調到檔案頭
var encodeCodeCC,encodeCodeDwordsRef=['function ','return ','return','undefined','for(','var ','.length','typeof','continue;','if(','else','while(','break;','this.','try{','}catch(','true','false','eval(','new ','Array','Object','RegExp','.replace(','.match(','.push(','.pop(','.split(','isNaN(','.indexOf(','.substr(','with('];
setObjValue('encodeCodeCC','ucC=1,lucC=6,wordC=8,wordS=127','int');
*/
function encodeCode(code,K){	//	code,key
 code=''+code;//code=reduceCode(code);
 if(!code)return;
 var ucC=encodeCodeCC.ucC,lucC=encodeCodeCC.lucC,wordC=encodeCodeCC.wordC,wordS=encodeCodeCC.wordS,rC=87	//	2<rC<ch.length!
 ,rc='',c,i,k=[nullCode('3-'+(code.length>rC?rC:code.length<7?7:code.length),0)],l=nullCode('1-'+rC,0),p,q,r,count,po=0	//	rc:return code,k:encode key array,l:每次跳l個,c,p,q,r:tmp,po:point
 ,recent,words={},wordsRef=encodeCodeDwordsRef.join('\0').split('\0')//,countC=[]	//	最近一次出現時間與出現頻率（次數:frequency）,片語index,片語index參照(reference)
 ,ind=[],ch=[];	//	設定加碼chars：ind:index,用ch[(ind[]+k[])%ch.length]來取得所欲轉換成的字元
 while(k.length<3&&!(l%=k.length))l=nullCode('1-'+rC,0);count=l+l;	//	確保多變性
 //	設定加碼chars
/*
 for(i=1;i<128;i++)
  if(i!=10&&i!=13&&i!=34&&i!=92)ch.push(String.fromCharCode(i));
 for(i=1,j=k.length;i<128;i++)
  if(i!=11&&i!=12&&i!=30&&i!=31){if(++j>=ch.length)j=0;ind[i]=j;}
*/
 for(i=1,j=0;i<128;i++){
  if(i!=11&&i!=12&&i!=30&&i!=31)ind[i]=j++;
  if(i!=10&&i!=13&&i!=34&&i!=92)ch.push(String.fromCharCode(i));
 }
 //	設定加碼key
 for(i=0;i<k.length;i++)k[i]=nullCode('0-'+rC,0);
 if(typeof K=='string')for(i=0,p=K,K=[];i<p.length;i++)K.push(p.charCodeAt(i)%ch.length);
 if(K instanceof Array&&K.length)k=K.concat(k);else K=[];	//	加入自訂key:k=自訂key+亂數key
	//l=51,count=l+l,k=[50,22,22];alert('l='+l+'\ncount='+count+'\n'+k);	//	自行初始設定key
 //	使用下列keyword約可減一成
 recent=[ch.length];
 if(wordsRef.length>recent.length)wordsRef.length=recent.length;//alert(wordsRef.length+','+20*l);
 for(p=20*l,i=0;i<wordsRef.length;i++)recent[words[wordsRef[i]]=i]=p;	//	初始優先權

 //encodeCodeC=['wordsRef='+wordsRef+NewLine,k.length,l+NewLine].concat(k);encodeCodeC.push(NewLine,'-'.x(9),NewLine);if(K.length)encodeCodeC.push('use password['+K.length+']'+K+NewLine);var mm;
 //	開始壓縮與編碼charcode>127
 while(po<code.length){
  if(126<(c=code.charCodeAt(po))||c<9||c<32&&c!=10&&c!=13)
   if(po++,c<340)	//	low unicode
    p=c<32?c:c-95//,mm='low unicode['+c+','+code.charAt(po-1)+'→'+p+']['+(lucC+(p<123?0:1))+','+p%123+']'//95=127-32
    ,c=String.fromCharCode(lucC+(p<123?0:1),p%123),q=2;//q=c.length
   else	//	unicode
    q=(p=(c-(r=c%123))/123)%123,p=(p-q)/123//,mm='unicode['+code.charAt(po-1)+']:[ucC+'+p+']['+q+']['+r+']'
    ,c=String.fromCharCode(ucC+p,q,r),q=3;//q=c.length
  else if(p=code.substr(po).match(/^([.};'"]?\w{2,15})([ (.;{'"])?/)){	//	片語，雖然想在找出[.};'"]時一起處理，但因過於麻煩作罷
   if(!isNaN(words[q=p[1]+p[2]])||!isNaN(words[q=p[1]]))	//	已有此片語
    po+=q.length,c=String.fromCharCode(wordC,q=words[q]),recent[q]=count
    //,mm='已有此片語['+q+']['+wordsRef[q]+']'
    ,q=2;//,countC[q]++
   else if(r=code.indexOf(q=p[1],po+RegExp.lastIndex),r!=-1&&r<5e3+po+RegExp.lastIndex){	//	後面還有此詞：建新片語
    if(p[2]&&(r+=q.length)<code.length&&code.charAt(r)==p[2])q+=p[2];	//	尋求最長片語
    for(r=0,i=1;i<recent.length;i++)if(!recent[i]){r=i;break;}else if(recent[i]<recent[r])r=i;	//	找出最不常用的
    delete words[wordsRef[r]]	//	別忘了刪除原值。But注意！這個delete相當於 words[wordsRef[r]]='' 如此而已！（並不更改length，用.join()仍可發現其存在！）but typeof=='undefined'
    ,po+=q.length,recent[words[wordsRef[r]=q]=r]=count,c=String.fromCharCode(wordS,q.length,r)+q
    //,mm='建新片語['+r+']['+q+']'
    ,q=3;//,countC[r]=1
   }
   else
    c=code.charAt(po++),q=0
    //,mm='片語['+p[1]+']→直接encode['+code.charCodeAt(po-1)+','+c+']'	//	沒有就直接encode
    ;
  }
  else
   c=code.charAt(po++),q=0
   //,mm='直接encode['+code.charCodeAt(po-1)+','+c+']'	//	都不行就直接encode
   ;

  //	加碼與de-quote
  //for(r=[],i=0;i<c.length;i++)r.push(c.charCodeAt(i));alert('get '+mm+' ['+c.length+']'+r+'\n'+c);
  for(r='',i=0;i<c.length;i++)r+=ch[((i&&i<q?c.charCodeAt(i):ind[c.charCodeAt(i)])+k[count%k.length])%ch.length];	//	char code(0)+control code(1-q)+char code
  //encodeCodeC.push(count,'next:'+po,code.charCodeAt(po)+'['+code.charAt(po)+']','control code len:'+q,'編成'+r.length+'['+r+']	'+mm+'	');for(var a,i=0;i<c.length;i++)encodeCodeC.push((i?' ':'')+'ch[('+(i&&i<q?a=c.charCodeAt(i):'ind['+(a=c.charCodeAt(i))+']='+(isNaN(a=ind[a])?'(null)':a))+' +k['+(p=count%k.length)+']='+(!isNaN(p)&&(p=k[p])?p:'(null)')+' )%'+ch.length+'='+(a=((a||0)+(p||0))%ch.length)+' ]=[ '+(!isNaN(a)&&(a=ch[a])?a.charCodeAt(0):'(null)')+' ]'+(a.charCodeAt(0)==r.charCodeAt(i)?'':'err:['+r.charCodeAt(i)+']'));encodeCodeC.push(NewLine);
  rc+=r,count+=l;
 }

 //	組合	p:加碼組
 for(i=K.length,p=(i?ch[0]:'')+ch[k.length-i]+ch[l];i<k.length;i++)p+=ch[k[i]];
 //alert(toCharCode(p)+'\n'+toCharCode(rc));//4,55,54,25,25	53,56,86,22,22,54,86,22
 return p+rc;
}
function toCharCode(s){
 s+='';if(!s)return;var i=0,c=[];
 for(;i<s.length;i++)c.push(s.charCodeAt(i));
 return c;
}
//	解程式碼
function decodeCode(c,K){	//	code,key
 if(!c)return;//c:encoded code
 //var ucC=encodeCodeCC.ucC,lucC=encodeCodeCC.lucC,wordC=encodeCodeCC.wordC,wordS=encodeCodeCC.wordS,words=encodeCodeDwordsRef.join('\0').split('\0')
 var ucC=1,lucC=6,wordC=8,wordS=127,words=['function ','return ','return','undefined','for(','var ','.length','typeof','continue;','if(','else','while(','break;','this.','try{','}catch(','true','false','eval(','new ','Array','Object','RegExp','.replace(','.match(','.push(','.pop(','.split(','isNaN(','.indexOf(','.substr(','with(']	//	精簡實戰版
 ,i,k,l,p,q,r='',w=1,cr=[]
 //	tr:b===''時return a之char code，其他無b時return a之index code，有b時return a-b之char set。出錯時無return
 ,trSet={},tr=function(s,a,b){if(!isNaN(b)&&b){var c,t="";while(a<b)if(!isNaN(c=s.ind[s.c.charCodeAt(a++)])&&!isNaN(c=s.ch[(c+s.k[s.count%s.k.length])%s.ch.length]))t+=String.fromCharCode(c);else return;return t;}else if(!isNaN(a=s.ind[s.c.charCodeAt(a)])&&((a=(a+s.k[s.count%s.k.length])%s.ch.length),typeof b!="string"||!isNaN(a=s.ch[a])))return a;}
 ,ind=[],ch=[];	//	設定解碼chars：ind:index
 //	設定解碼chars
 for(i=1,p=0;i<128;i++){
  if(i!=10&&i!=13&&i!=34&&i!=92)ind[i]=p++;
  if(i!=11&&i!=12&&i!=30&&i!=31)ch.push(i);
 }
 //	取得及設定解碼key
 if(!(p=ind[c.charCodeAt(q=0)])){
  if(typeof K=='string')for(i=0,p=K,K=[];i<p.length;i++)K.push(ch.length-p.charCodeAt(i)%ch.length);
  if(K instanceof Array&&K.length)p=ind[c.charCodeAt(++q)];else return;
 }else K=[];	//	需要密碼
 for(k=[],l=ind[c.charCodeAt(++q)],p+=i=q+1;i<p;i++)k.push(ch.length-ind[c.charCodeAt(i)]);
 if(K.length)k=K.concat(k);
 trSet.c=c=c.substr(p),
 trSet.ind=ind,trSet.ch=ch,trSet.k=k,trSet.count=l;

 //decodeCodeC=['words:'+words+NewLine,k.length,l+NewLine].concat(k);decodeCodeC.push(NewLine+'-'.x(9)+NewLine+'c:	');var mm;for(i=0;i<c.length;i++)decodeCodeC.push(c.charCodeAt(i));decodeCodeC.push(NewLine+'-'.x(9)+NewLine);if(K.length)decodeCodeC.push('use password['+K.length+']'+K+NewLine);
 i=-1;//alert('-1:'+i);
 //	開始解碼
 while((trSet.count+=l),++i<c.length){
  //if((p=c.charCodeAt(i))>127)trSet.c=c=c.slice(0,)+;
  //decodeCodeC.push(trSet.count+'	ch[(ind['+(q=c.charCodeAt(i))+']='+ind[q]+' +k['+(q=trSet.count%k.length)+']='+(q=k[q])+'('+(ch.length-q)+') )%'+ch.length+'='+(q=(ind[c.charCodeAt(i)]+q)%ch.length)+' ]=[ '+ch[q]+' ]',tr(trSet,i,'')+NewLine);
  //decodeCodeC.push(trSet.count+'	ch[(ind['+(q=c.charCodeAt(i+1))+']='+ind[q]+' +k['+(q=trSet.count%k.length)+']='+(q=k[q])+'('+(ch.length-q)+') )%'+ch.length+'='+(q=(ind[c.charCodeAt(i+1)]+q)%ch.length)+' ]=[ '+ch[q]+' ]',tr(trSet,i+1,'')+NewLine);
  //decodeCodeC.push(trSet.count+'	ch[(ind['+(q=c.charCodeAt(i+2))+']='+ind[q]+' +k['+(q=trSet.count%k.length)+']='+(q=k[q])+'('+(ch.length-q)+') )%'+ch.length+'='+(q=(ind[c.charCodeAt(i+2)]+q)%ch.length)+' ]=[ '+ch[q]+' ]',tr(trSet,i+2,'')+NewLine);
  if(isNaN(p=tr(trSet,i,''))){
   alert('decodeCode filed: illegal char ('+c.charCodeAt(i)+') @ '+i+'/'+c.length+'\n'+r);for(i=0,p=String.fromCharCode(k.length,l);i<k.length;i++)p+=String.fromCharCode(k[i]);return p+','+r;
   return;
  }	//	illegal
  //	[ucC|lucC]+unicode, [wordC]+片語index, [wordS]+[ (3 upper bits+) 4 len bits]+[片語index]+words
  if(p==wordS)
   q=tr(trSet,++i),p=tr(trSet,++i),r+=words[p]=tr(trSet,++i,i+q),i+=q-1
   //,mm='設定片語 長'+q+'['+p+']:'+words[p]
   ;
  else if(p==wordC)r+=words[tr(trSet,++i)]
   //,mm='片語'+tr(trSet,i)+'['+words[tr(trSet,i)]+']'
   ;
  else if(p==lucC||p==lucC+1)
   p+=tr(trSet,++i)-lucC,r+=String.fromCharCode(p<32?p:p+95)
   //,mm='low unicode['+r.charCodeAt(r.length-1)+','+r.slice(-1)+'][p='+p+']'
   ;
  else if(ucC<=p&&p<ucC+5)
   r+=String.fromCharCode(((p-ucC)*123+tr(trSet,++i))*123+tr(trSet,++i))
   //,mm='unicode['+r.charCodeAt(r.length-1)+','+r.slice(-1)+'][p='+p+']'
   ;
  else
   r+=String.fromCharCode(p)
   //,mm='普通char('+p+')['+String.fromCharCode(p)+']'
   ;	//	普通char

  //alert(mm+'\n'+r);
  //decodeCodeC.length--,decodeCodeC.push('	'+mm+NewLine);
 }

 return r;
}

//simpleWrite('charCount report3.txt',charCount(simpleRead('function.js')+simpleRead('accounts.js')));
//{var t=reduceCode(simpleRead('function.js')+simpleRead('accounts.js'));simpleWrite('charCount source.js',t),simpleWrite('charCount report.txt',charCount(t));}	//	所費時間：十數秒（…太扯了吧！）
/*	測出各字元的出現率
普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
*/
function charCount(text){
 var i,a,c=[],d,t=''+text,l=t.length,used='',unused='',u1=-1,u2=u1;
 for(i=0;i<l;i++)if(c[a=t.charCodeAt(i)])c[a]++;else c[a]=1;
 for(i=u1;i<256;i++)if(c[i]){if(u2+1===i)used+=','+i,unused+=(u2<0?'':'-'+u2);u1=i;}else{if(u1+1===i)unused+=','+i,used+=(u1<0?'':'-'+u1);u2=i;}
 for(i=0,t='used:'+used.substr(1)+'\nunused:'+unused.substr(1)+'\n',d=sortValue(c,2).reverse();i<d.length;i++){	//	若是reduceCode()的程式，通常在120項左右。
  t+=NewLine+(a=d[i])+'['+fromCharCode(a).replace(/\0/g,'\\0').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t')+']'
	+':	'+(a=c[typeof a=='object'?a[0]:a])+'	'+(100*a/l);
  //if(200*v<l)break;	//	.5%以上者←選購
 }
 alert(t);
 return t;
}

/*	計算字數 word counts
flag:
	(flag&1)==0	表情符號等不算一個字
	(flag&1)==1	連表情符號等也算一個字
	(flag&2)==1	將 HTML tag 全部消掉

可讀性/適讀性
http://en.wikipedia.org/wiki/Flesch-Kincaid_Readability_Test
http://en.wikipedia.org/wiki/Gunning_fog_index
Gunning-Fog Index：簡單的來說就是幾年的學校教育才看的懂你的文章，數字越低代表越容易閱讀，若是高於17那表示你的文章太難囉，需要研究生才看的懂，我是6.08，所以要受過6.08年的學校教育就看的懂囉。
Flesch Reading Ease：這個指數的分數越高，表示越容易了解，一般標準的文件大約介於60~70分之間。
Flesch-Kincaid grade level：和Gunning-Fog Index相似，分數越低可讀性越高，越容易使閱讀者了解，至於此指數和Gunning-Fog Index有何不同，網站上有列出計算的演算法，有興趣的人可以比較比較。

DO.normalize(): 合併所有child成一String, may crash IE6 Win!	http://www.quirksmode.org/dom/tests/splittext.html
*/
function wordCount(t,flag){	//	text, flag
 var isHTML=flag&2;

 if(typeof t=='object')
  if(t.innerText)
   t=t.innerText,isHTML=0;
  else if(t.innerHTML)
   t=t.innerHTML,isHTML=1;

 if(typeof t!='string')
  return 0;

 //	和perl不同，JScript常抓不到(.*?)之後還接特定字串的東西，大概因為沒有s。(.*?)得改作((.|\n)*?)？	或者該加/img？
 if(isHTML)
  t=t.replace(/<!--((.|\n)*?)-->/g,'').replace(/<[\s\n]*\/?[\s\n]*[a-z][^<>]*>/gi,'');

 if(flag&1)
  t=t.replace(/[\+\-*\\\/?!,;.()<>{}\[\]@#$%^&_|"'~`]{2,}/g,';');	//	連表情符號等也算一個字

 return t
	.replace(/[a-zA-ZÀ-ÖØ-öø-ʨ\-'.]{2,}/g,'w')	//	將英文等字改成單一字母。[.]: 縮寫	http://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
	.replace(/[\d:+\-\.\/,]{2,}/g,'d')	//	date/time or number
	.replace(/[\s\n　]+/g,'')	//	再去掉*全部*空白
	.length;
}







//{var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}
//	運算式值的二進位表示法	已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz
function dec_to_bin(n,p){	//	n:number,p:places,字元數,使用前置0來填補回覆值
 if(p&&n+1<(1<<p)){var h='',b=n.toString(2),i=b.length;for(;i<p;i++)h+='0';return h+b;}
 return n.toString(2);	//	native code還是最快！
//	上兩代：慢	var b='',c=1;for(p=p&&n<(p=1<<p)?p:n+1;c<p;c<<=1)b=(c&n?'1':'0')+b;return b;	//	不用'1:0'，型別轉換比較慢.不用i，多一個變數會慢很多
//	上一代：慢	if(p&&n+1<(1<<p)){var h='',c=1,b=n.toString(2);while(c<=n)c<<=1;while(c<p)c<<=1,h+='0';return h+(n?n.toString(2):'');}
}





/*
	設定object之值，輸入item=[value][,item=[value]..]。
	value未設定會自動累加
	使用前不必需先宣告…起碼在現在的JS版本中

	v	(Array)=v,(Object)v=
	[null]=v	累加=v
	v=[null]	v=''

	t:value type	['=','][int|float|_num_]
	*前段
		以[']或["]作分隔重定義指定號[=]與分隔號[,]
	*後段
		數字表累加
		'int'表整數int，累加1
		'float'表示浮點數float，累加.1	bug:應該用.decp()
		不輸入或非數字表示string

	m:mode
	setObjValueFlag.object
	setObjValueFlag.array(10進位/當做數字)
	number:key部分之base(10進位，16進位等)

	example:
	setObjValue('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat','int');	//	自動從0開始設，UTCDay.Tue=2
	setObjValue('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat');	//	UTCDay.Sun=UTCDay.Fri=''
	setObjValue('add','a=3,b,c,d',2);	//	累加2。add.b=5
	setObjValue('add','a,b,c,d',1,setObjValueFlag.array);	//	add[2]='c'
	setObjValue('add','4=a,b,c,d',2,setObjValueFlag.array);	//	累加2。add[8]='c'

Array之另一種表示法：[value1,value2,..]
Object之另一種表示法：{key1:value1,key2:value2,..}

var setObjValueFlag={'object':0,'array':-1};
*/
function setObjValue(o,v,t,m){	//	obj,value,累加/value type,mode/value type
 if(typeof setObjValueFlag!='object')setObjValueFlag={'object':0,'array':-1};	//	object:default
 if(!v||typeof o!='string')return 1;
 var a,b,i=0,p='=',sp=',',e="if(typeof "+o+"!='object')"+o+"=new "+(m?"Array":"Object")//(m?"[]":"{}")
	+";",n,Tint=false,cmC='\\u002c',eqC='\\u003d';//	l:item,n:value to 累加
 if(t){
  if(typeof a=='string'){a=t.charAt(0);if(a=='"'||a=="'"){a=t.split(a);p=a[1],sp=a[2],t=a[3];}}
  if(t=='int')t=1,Tint=true;else if(t=='float')t=.1;else if(isNaN(t))t=0;
  else if(t==parseInt(t))t=parseInt(t),Tint=true;else t=parseFloat(t);	//	t被設成累加數
 }//else t=1;
 if(typeof v=='string')v=v.split(sp);
 // escape regex characters from jQuery
 cmC=new RegExp(cmC.replace(/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1"),'g'),eqC=new RegExp(eqC.replace(/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1"),'g');
 if(t)n=-t;	//	n:現在count到..
 for(;i<v.length;i++){
  if(v[i].indexOf(p)==-1)v[i]=m?p+v[i]:v[i]+p;//if(v[i].indexOf(p)==-1&&m)v[i]=p+v[i];//
  if(m&&v[i]==p){n+=t;continue;}
  a=v[i].split(p);
  if(!m&&!a[0])continue;	//	去掉不合理的(Array可能有NaN index，所以不設條件。)
  a[0]=a[0].replace(cmC,',').replace(eqC,'='),a[1]=a[1].replace(cmC,',').replace(eqC,'=');
  if(t)
   if(m){
    if(!a[0])a[0]=(n+=t);else if(!isNaN(b=m>0?parseInt(a[0],m):a[0]))n=Tint?(a[0]=parseInt(b)):parseFloat(b);
   }else
    if(!a[1])a[1]=(n+=t);else if(!isNaN(a[1]))n=Tint?parseInt(a[1]):parseFloat(a[1]);
  if(!t||Tint&&isNaN(b=parseInt(a[1]))||isNaN(b=parseFloat(a[1])))b=a[1];
  a=a[0];
  e+=o+'['+(!t||isNaN(a)?dQuote(a):a)+']='+(!t||isNaN(b)?dQuote(b):b)+';';
 }
 try{
  //if(o=='kk')alert(e.slice(0,500));
  eval(e);	//	因為沒想到其他方法可存取Global的object，只好使用eval..可以試試obj=setObjValue(0,..){this=new Aaaray/Object}
 }catch(e){popErr(e,'Error @ '+o);return 2;}
}

CeL.data
.
/**
 * 將字串 set 分作 Object
 * @param valueSet
 * @param pointerC
 * @param endC
 * @return
 * @since	2006/9/6 20:55
 * @memberOf	CeL.data
 */
split_String_to_Object = function(valueSet, pointerC, endC) {
	var a, o = {};
	if (!endC)
		endC = /[,;]/;
	if (!pointerC)
		pointerC = /[=:]/;
	valueSet = valueSet.split(endC);
	for (_e in valueSet) {
		//	http://msdn.microsoft.com/library/en-us/jscript7/html/jsmthsplit.asp
		a = valueSet[_e].split(pointerC, 2);
		// alert(valueSet[_e]+'\n'+a[0]+' '+a[1]);
		if (a[0])
			o[a[0]] = a[1];
	}
	return o;
};






/*	2003/10/1 15:46
	比較string:m,n從起頭開始相同字元數
	return null: 格式錯誤，-1: !m||!n
	若一開始就不同：0


TODO:

test starting with

2009/2/7 7:51:58
看來測試 string 的包含，以 .indexOf() 最快。
即使是比較 s.length 為極小常數的情況亦復如此

下面是快到慢：

//	long,short
var contain_substring=[
function(l,s){
 var a=0==l.indexOf(s);
 return a;
}
,function(l,s){
 return 0==l.indexOf(s);
}
,function(l,s){
 return s==l.slice(0,s.length);
}
,function(l,s){
 return l.match(s);
}
,function(l,s){
 for(var i=0;i<s.length;i++)
  if(s.charAt(i)!=l.charAt(i))return 0;
 return 1;
}
];

function test_contain_substring(){
 for(var i=0;i<contain_substring.length;i++){
  var t=new Date;
  for(var j=0;j<50000;j++){
   contain_substring[i]('sdfgjk;sh*dn\\fj;kgsamnd nwgu!eoh;nfgsj;g','sdfgjk;sh*dn\\fj;kgsamnd nwgu!');
   contain_substring[i]('sdbf6a89* /23hsauru','sdbf6a89* /23');
  }
  sl(i+': '+(new Date-t));
 }
}


//	極小常數的情況:
//	long,short
var contain_substring=[
function(l,s){
 var a=0==l.indexOf(s);
 return a;
}
,function(l,s){
 return 0==l.indexOf(s);
}
,function(l,s){
 return s==l.slice(0,1);
}
,function(l,s){
 return s.charAt(0)==l.charAt(0);
}
,function(l,s){
 return l.match(/^\//);
}
];

function test_contain_substring(){
 for(var i=0;i<contain_substring.length;i++){
  var t=new Date;
  for(var j=0;j<50000;j++){
   contain_substring[i]('a:\\sdfg.dfg\\dsfg\\dsfg','/');
   contain_substring[i]('/dsfg/adfg/sadfsdf','/');
  }
  sl(i+': '+(new Date-t));
 }
}


*/
function same_length(m,n){
 if(typeof m!='string'||typeof n!='string')return;
 if(!m||!n)return 0;
 var i=m.length,b=0,s=n.length;
 if(i<s){
  if(0==n.indexOf(m))//m==n.slice(0,i=m.length)
   return i;
 }else if(i=s,0==m.indexOf(n))//n==m.slice(0,i=n.length)
   return i;

 //sl('*same_length: start length: '+i);
 while((i=(i+1)>>1)>1 && (s=n.substr(b,i))){
  //sl('same_length: '+i+','+b+'; ['+m.substr(b)+'], ['+s+'] of ['+n+']');
  if(m.indexOf(s,b)==b)
   b+=i;
 };
 //sl('*same_length: '+i+','+b+'; ['+m.charAt(b)+'], ['+n.charAt(b)+'] of ['+n+']');
 //var s_l=i&&m.charAt(b)==n.charAt(b)?b+1:b;
 //sl('*same_length: '+s_l+':'+m.slice(0,s_l)+',<em>'+m.slice(s_l)+'</em>; '+n.slice(0,s_l)+',<em>'+n.slice(s_l)+'</em>');
 return i&&m.charAt(b)==n.charAt(b)?b+1:b;
}



//-----------------------------------------------------------------------------



/*	將數字轉為 K, M, G 等 SI prefixes 表示方式，例如 6458 轉成 6.31K
	http://en.wikipedia.org/wiki/International_System_of_Units
	http://www.merlyn.demon.co.uk/js-maths.htm#RComma
	http://physics.nist.gov/cuu/Units/prefixes.html
	http://www.uni-bonn.de/~manfear/numbers_names.php
	http://wawa.club.hinet.net/cboard1/HCB_Dis.asp?BrdNo=78&SubNo=78761&Club=0&ClsName=%B1%D0%A8%7C%BE%C7%B2%DF
	http://bbs.thu.edu.tw/cgi-bin/bbscon?board=English&file=M.1046073664.A&num=106
*/
//turnSI[generateCode.dLK]='setTool,decplaces,-turnSI.n,-turnSI.v';
function turnSI(num,d){
 var _f=arguments.callee,p=0,v=_f.v;
 if(!v){
  _f.v=v=[1024];	//	1000 in disk space
  for(var i=1,n=_f.n='k,M,G,T,P,E,Z,Y'.split(','),l=n.length;i<l;i++)
   v[i]=v[i-1]*v[0];
 }
 if(num<v[0])
  return num;

 while(num>=v[p])p++;
 return (num/v[--p]).decp(isNaN(d)?2:d) + _f.n[p];
}

//	將漢字轉為阿拉伯數字表示法(0-99999)
function turnKanjiToNumbers(num){
 if(!num)return 0;
 if(!isNaN(num))return num;
 var i=0,l,m,n='〇,一,二,三,四,五,六,七,八,九'.split(','),d='萬,千,百,十,'.split(','),r=0
	//	Ｏ, ○=[〇]	http://zh.wikipedia.org/wiki/%E6%97%A5%E8%AA%9E%E6%95%B8%E5%AD%97
	,p=(''+num).replace(/\s/g,'').replace(/[Ｏ○]/g,'〇')
	;
 for(;i<n.length;i++)n[n[i]]=i;
 for(i=0;i<d.length;i++){
  if(p&&(m=d[i]?p.indexOf(d[i]):p.length)!=-1)
   if(!m&&d[i]=='十')r+=1,p=p.slice(1);else if(isNaN(l=n[p.slice(0,m).replace(/^〇+/,'')]))return num;else r+=l,p=p.slice(m+1);
  if(d[i])r*=10;
 }
 return r;
}
//alert(turnKanjiToNumbers('四萬〇三百七十九'));
//alert(turnKanjiToNumbers('十'));

//	將數字轉為大寫漢字表示的讀法	,turnToKanjiD,turnToKanjiInit,"turnToKanjiInit();",_turnToKanji,turnToKanji
var turnToKanjiD;
//turnToKanjiInit[generateCode.dLK]='turnToKanjiD';
function turnToKanjiInit(){
 turnToKanjiD={
  'num':['〇,一,二,三,四,五,六,七,八,九'.split(','),'零,壹,貳,參,肆,伍,陸,柒,捌,玖'.split(',')]	//	數字	叄
  //	http://zh.wikipedia.org/wiki/%E5%8D%81%E8%BF%9B%E5%88%B6	http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B0%E5%AD%97	http://lists.w3.org/Archives/Public/www-style/2003Apr/0063.html	http://forum.moztw.org/viewtopic.php?t=3043	http://www.moroo.com/uzokusou/misc/suumei/suumei.html	http://espero.51.net/qishng/zhao.htm	http://www.nchu.edu.tw/~material/nano/newsbook1.htm
  //	十億（吉）,兆（萬億）,千兆（拍）,百京（艾）,十垓（澤）,秭（堯）,秭:禾予;溝(土旁);,無量大數→,無量,大數;[載]之後的[極]有的用[報]	異體：阿僧[禾氏],For Korean:阿僧祗;秭:禾予,抒,杼,For Korean:枾	For Korean:不可思議(不:U+4E0D→U+F967)
  //	Espana應該是梵文所譯 因為根據「大方廣佛華嚴經卷第四十五卷」中在「無量」這個數位以後還有無邊、無等、不可數、不可稱、不可思、不可量、不可說、不可說不可說，Espana應該是指上面其中一個..因為如果你有心查查Espana其實應該是解作西班牙文的「西班牙」
  ,'d':',萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極,恒河沙,阿僧祇,那由他,不可思議,無量大數,Espana'	//	denomination, 單位
  //	http://zh.wikipedia.org/wiki/%E5%8D%81%E9%80%80%E4%BD%8D
  //	比漠微細的，是自天竺的佛經上的數字。而這些「佛經數字」已成為「古代用法」了。
  //	小數單位(十退位)：分,釐(厘),毫(毛),絲,忽,微,纖,沙,塵（納）,埃,渺,漠(皮),模糊,逡巡,須臾（飛）,瞬息,彈指,剎那（阿）,六德(德),虛,空,清,淨	or:,虛,空,清,淨→,空虛,清淨（仄）,阿賴耶,阿摩羅,涅槃寂靜（攸）
  ,'bd':0	//	暫時定義
 };
 with(turnToKanjiD)
  bd=[(',十,百,千'+turnToKanjiD.d).split(','),(',拾,佰,仟'+turnToKanjiD.d).split(',')]	//	base denomination
  ,d=d.split(',');
}
turnToKanjiInit();
/*	處理1-99999的數,尚有bug
	東漢時期的《數述記遺》
		一是上法，為自乘系統: 萬萬為億，億億為兆，兆兆為京。
		二是中法，為萬進系統，皆以萬遞進
		三是下法，為十進系統，皆以十遞進←現代的科學技術上用的“兆”，以及_turnToKanji()用的
*/
//_turnToKanji[generateCode.dLK]='turnToKanjiD,*turnToKanjiInit();';
function _turnToKanji(numStr,kind){
 if(!kind)kind=0;
 var i=0,r='',l=numStr.length-1,d,tnum=turnToKanjiD.num[kind],tbd=turnToKanjiD.bd[kind],zero=tnum[0];	//	用r=[]約多花一倍時間!
 for(;i<=l;i++)
  if((d=numStr.charAt(i))!='0')//if(d=parseInt(numStr.charAt(i)))比較慢
   r+=tnum[d]+tbd[l-i];//'〇一二三四五六七八'.charAt(d) 比較慢
  else if(r.slice(-1)!=zero)if(Math.floor(numStr.substr(i+1)))r+=zero;else break;
 return r;
}
//2.016,2.297,2.016
//{var d=new Date,v='12345236',i=0,a;for(;i<10000;i++)a=turnToKanji(v);alert(v+'\n→'+a+'\ntime:'+gDate(new Date-d));}

//	將數字轉為漢字表示法	num>1京時僅會取概數，此時得轉成string再輸入！
//	統整:尚有bug	廿卅
//turnToKanji[generateCode.dLK]='turnToKanjiD,turnToKanjiInit,_turnToKanji,turnToKanji';//,*turnToKanjiInit();
function turnToKanji(num,kind){
 //num=parseFloat(num);
 if(typeof num=='number')num=num.toString(10);
 num=(''+num).replace(/[,\s]/g,'');
 if(isNaN(num))return '(非數值)';
 if(num.match(/(-?[\d.]+)/))num=RegExp.$1;
 if(!kind)kind=0;

 var j,i,d=num.indexOf('.'),k,l,m,addZero=false,tnum=turnToKanjiD.num[kind],zero=tnum[0],td=turnToKanjiD.d;//i:integer,整數;d:decimal,小數
 if(d==-1)d=0;
 else for(num=num.replace(/0+$/,''),i=num.substr(d+1),num=num.slice(0,d),d='',j=0;j<i.length;j++)
	d+=tnum[i.charAt(j)];	//	小數

 //	至此num為整數
 if(num.charAt(0)=='-')i='負',num=num.substr(1);else i='';
 num=num.replace(/^0+/,'');

 for(m=num.length%4,j=m-4,l=(num.length-(m||4))/4;j<num.length;m=0,l--)//addZero=false,	l=Math.floor((num.length-1)/4)
  if(Math.floor(m=m?num.slice(0,m):num.substr(j+=4,4)))	//	這邊不能用parseInt: parseInt('0~')會用八進位，其他也有奇怪的效果。
   m=_turnToKanji(m,kind),addZero=addZero&&m.charAt(0)!=zero
   ,i+=(addZero?(addZero=false,zero):'')+m+td[l];
  else addZero=true;

 return (i?i.slice(0,2)=='一十'?i.substr(1):i:zero)+(d?'點'+d:'');
}

//	轉換成金錢表示法
//turnToMoney[generateCode.dLK]='turnToKanji';
function turnToMoney(num){
 var i=(num=turnToKanji(num,1)).indexOf('點');
 return i==-1?num+'圓整':num.slice(0,i)+'圓'+num.charAt(++i)+'角'+(++i==num.length?'':num.charAt(i++)+'分')+num.substr(i);
}


//	分斷行	2003/1/25 22:40
function getText(){//html→text
 //<.+?>	<[^>]+>	<\s*\/?\s*[a-zA-Z](.*?)>	<!	過慢?
 return this.valueOf().replace(/<s>[^<]*<\/s>/gi,'').replace(/<w?br[^>]*>/gi,'\n').replace(/<\/?[A-Za-z][^>]*>/g,'');
}
function trimStr_(s,l,m){
 var lt,lt2,gt,i=0,c=l,t='',I=0;//less than,great than,index,left count index(left length now),text now,text index
 while(I<s.length){
  //將lt,gt定在下一label之首尾,i為下一次搜尋起點.label定義:/<.+?>/
  if(i!=-1)if((lt=s.indexOf('<',i))!=-1){
   if((gt=s.indexOf('>',lt+1))==-1)i=lt=-1;
   else{i=gt+1;while(lt!=-1&&(lt2=s.indexOf('<',lt+1))!=-1&&lt2<gt)lt=lt2;}
  }else i=lt=-1;
  //if(s.indexOf('')!=-1)alert(i+','+lt+','+gt+';'+l+','+c+'\n'+t);
  if(lt==-1)gt=lt=s.length;
  //未來:考慮中英文大小，不分隔英文字。前提:'A'<'z'..或許不用
  while(I+c<=lt){t+=s.substr(I,c)+(m?'\n':'<br/>');I+=c;c=l;}
  t+=s.slice(I,gt+1);c-=lt-I;I=gt+1;
 }
 return t;
}
/*	將字串以長l分隔
	m==0: html用, 1:text
*/
//trimStr[generateCode.dLK]='trimStr_';
function trimStr(l,m){
 var s=this.valueOf(),t=[],sp='<br/>';
 if(!s||!l||l<1||!String.fromCharCode)return m?s.gText():s;//||!String.charCodeAt:v5.5
 s=s.turnU(m);//(m):這樣就不用再費心思了.不過既然都作好了,就留著吧..不,還是需要
 if(s.length<=l)return s;
 if(!m)s=s.replace(/<w?br([^>]*)>/gi,sp);

 s=s.split(sp=m?'\n':sp);//deal with line
 try{
  //	預防JS5不能push
  for(var i=0;i<s.length;i++)t.push(trimStr_(s[i],l,m));
 }catch(e){return this.valueOf();}
 return t.join(sp);
}





//-----------------------------------------------------------------------------


//mode=1:不取空字串
function strToArray(s,mode){
	var a=[],last=0,i;
	while((i=s.indexOf(sp,last))!=-1){
		if(mode==0||last!=i)a[a.length]=s.slice(last,i);
		last=i+1;
	}
	if(mode==0||last!=s.length)a[a.length]=s.slice(last);
	return a;
}

//去除s之空白,包括字與字之間的
function disposeSpace(s){
	if(!s)return s;
	var r="",i,last;
	while((i=s.indexOf(' ',last))!=-1)
		r+=s.slice(last,i),last=i+1;
	r+=s.slice(last);
	return r;
}

//以label,mode:m置換s,先找到先贏
//輸入t['$k']=..會有問題，需用t['\\$k']=..
function changeV(s,l,m){
	var i,r,re,t;//var I='';
	if(!m)m='g';
	if(s&&(t=l?l:label))for(i in t){
		//I+=', '+i+'='+t[i];
		re=new RegExp(i,m);
		s=s.replace(re,t[i]);//r=s.replace(re,t[i]);s=r;
	}
	//pLog(I.substr(2));
	//pLog('changeV:'+s);
	return s;
}

/*
//以label置換s,先找到先贏
function changeV(s){
	for(var i,j=0;j<labelN.length;j++)
		if((i=s.indexOf(labelN[j]))!=-1)
			s=s.slice(0,i)+labelV[j]+s.slice(i+labelN[j].length)
			,j=0;//research from begin
	return s;
}*/





return (
	CeL.data
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'locale';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.locale = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();




//	i18n系列	==================

/*	setup message of various languages for i18n (internationalization)
var languagesMessage={},defaultLanguage,useLanguage,languageAlias;
setObjValue('languageAlias','en_US=en_US,en=en_US,English=en_US,zh_TW=zh_TW,zh=zh_TW,tw=zh_TW,中文=zh_TW,Chinese=zh_TW,日本語=ja_JP,Japanese=ja_JP,ja_JP=ja_JP,ja=ja_JP,jp=ja_JP');
*/
//getLanguageAlias[generateCode.dLK]='languageAlias,existLanguageAlias';
function getLanguageAlias(language){
 if(existLanguageAlias(language))language=languageAlias[language];
 return language;
}

//existLanguageAlias[generateCode.dLK]='languageAlias';
function existLanguageAlias(language){
 return language in languageAlias;
}

//	(language, if you want to setup defaultLanguage as well)
//setLanguage[generateCode.dLK]='getLanguageAlias,defaultLanguage,useLanguage';
function setLanguage(language,mode){
 language=getLanguageAlias(language);
 if(mode)defaultLanguage=language;
 else useLanguage=language;
 return useLanguage;
}

//	setMessage(messageIndex1,[local,message],[local,message],messageIndex2,[local,message],[local,message],..)
//setMessage[generateCode.dLK]='languagesMessage,defaultLanguage,getLanguageAlias';
function setMessage(){
 //if(!defaultLanguage)defaultLanguage='en_US';
 //	n.preference('intl.charset.default')	http://chaichan.hp.infoseek.co.jp/qa3500/qa3803.htm	http://articles.techrepublic.com.com/5100-22-5069931.html
 //	http://forum.mozilla.gr.jp/?mode=al2&namber=5608&rev=&&KLOG=39
 //	navigator.language=general.useragent.locale @ about:config
 //	var n=window.navigator;netscape.security.PrivilegeManager.enablePrivilege('UniversalPreferencesRead');setLanguage((n.browserLanguage||(n.preference&&n.preference('intl.accept_languages')?n.preference('intl.accept_languages').split(',')[0]:n.language?n.language.replace(/-/,'_'):'')));
 if(typeof languagesMessage!='object')languagesMessage={};
 var i=0,msgNow,language,msg;
 for(;i<arguments.length;i++){
  msg=arguments[i];
  //alert(typeof msg+','+msg.constructor+','+msg);
  if(typeof msg=='string')msgNow=msg;
  else if(msg instanceof Array){
   language=msg[0],msg=msg[1];
   //alert(language+','+msg);
   if(language==defaultLanguage||!language)msgNow=msg;
   else if(msgNow){
    language=getLanguageAlias(language);
    if(typeof languagesMessage[language]!='object')languagesMessage[language]={};
    //alert('['+language+']['+msgNow+']='+msg);
    languagesMessage[language][msgNow]=msg;
   }
  }
 }
}

//getMessage[generateCode.dLK]='languagesMessage,useLanguage,getLanguageAlias';
function getMessage(message,language){
 language=getLanguageAlias(language);
 try{
  //alert(languagesMessage[language||useLanguage]);
  return languagesMessage[language||useLanguage][message]||message;
 }catch(e){return message;}
}


//	↑i18n系列	==================









//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for math
 * @fileoverview
 * 本檔案包含了 math 的 functions。
 * @since	
 */

/*
TODO:
大數計算
方程式圖形顯示 by SVG
*/


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'math';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.math
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	math 的 functions
 */
CeL.math
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.math
.prototype = {
};





/*
	Math	---------------------------------------------------------------
*/

/*
//{var v=Math.LN2,d=mutual_division(v),q=to_rational_number(v);alert('值	'+v+'\n序列	'+d+'\n近似值	'+q[0]+' / '+q[1]+'\n約	'+(q=q[0]/q[1])+'\n值-近似	'+(q-=v)+'\n差'+(Math.abs(q=10000*q/v)>1?'萬分之'+q.decp(2)+' ( '+q+' / 10000 )':'億分之'+(q*=10000).decp(2)+' ( '+q+' / 100000000 )'),0,'近似值	'+v);}

//{var d=new Date,a=.142857,b=1000000,i=0,c;for(i=0;i<10000;i++)c=mutual_division(a);alert(c+'\n'+gDate(new Date-d));}
*/

CeL.math
.
/**
 * 輾轉相除
 * @param n1	number 1
 * @param n2	number 2
 * @param times	max 次數
 * @return	連分數序列
 */
mutual_division = function(n1, n2, times) {
	var q = [], c;
	if (isNaN(times) || times <= 0)
		times = 40;
	if (!n2 || isNaN(n2))
		n2 = 1;
	if (n1 != Math.floor(n1)) {
		c = n1;
		var i = 9, f = n2;
		while (i--)
			//	整數運算比較快！這樣會造成整數多4%，浮點數多1/3倍的時間，但仍值得。
			if (f *= 10, c *= 10, c === Math.floor(c)) {
				n1 = c, n2 = f;
				break;
			}
	}
	/*
	 while(b&&n--)
	  d.push((a-(c=a%b))/b),a=b,b=c;	//	2.08s@10000	可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
	  //d.push(c=Math.floor(a/b)),c=a-b*c,a=b,b=c;	//	2.14s@10000:mutual_division(.142857)
	  //d.push(Math.floor(a/b)),b=a%(c=b),a=c;	//	2.2s@10000
	 //if(n)d.push(0);
	*/

	//	2.4s@10000	可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
	while (times--)
		if (n2)
			q.push((n1 - (c = n1 % n2)) / n2), n1 = n2, n2 = c;
		else {
			q.push(arguments.callee.done, n1);
			break;
		}

	//	2.26s@10000
	//while(b&&n--)if(d.push((a-(c=a%b))/b),a=b,!(b=c)){d.push(0);break;}

	//var m=1;c=1;while(m&&n--)d.push(m=++c%2?b?(a-(a%=b))/b:0:a?(b-(b%=a))/a:0);//bug

	return q;
};
CeL.math
.
done = -7.2;//''

CeL.math
.
/**
 * 取得連分數序列的數值
 * @param sequence	序列
 * @param max_no	取至第 max_no 個
 * @requires	mutual_division.done
 * @return
 * @see
 * var a=continued_fraction([1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]);
 * alert(a+'\n'+a[0]/a[1]+'\n'+Math.SQRT2+'\n'+(Math.SQRT2-a[0]/a[1])+'\n'+mutual_division(a[0],a[1]));
 */
continued_fraction = function(sequence, max_no) {
	if (typeof s != 'object' || !sequence.length)
		return sequence;

	if (sequence[sequence.length - 2] === _.mutual_division.done)
		sequence.length -= 2;

	if (sequence.length < 1)
		return sequence;

	if (!max_no/* ||max_no<2 */|| max_no > sequence.length)
		max_no = sequence.length;

	var a, b;
	if (max_no % 2)
		b = 1, a = 0;
	else
		a = 1, b = 0;
	// s[max_no++]=1;if(--max_no%2)b=s[max_no],a=s[--max_no];else a=s[max_no],b=s[--max_no];

	//alert('a='+a+',b='+b+',max_no='+max_no);
	while (max_no--)
		if (max_no % 2)
			b += a * sequence[max_no];
		else
			a += b * sequence[max_no];
	//alert('a='+a+',b='+b);
	return [ a, b ];
};


CeL.math
.
/**
 * The best rational approximation. 取得值最接近之有理數 (use 連分數 continued fraction), 取近似值.
 * c.f.,調日法
 * 在分子或分母小於下一個漸進分數的分數中，其值是最接近精確值的近似值。
 * @example
 * to_rational_number(4088/783)
 * @param number	number
 * @param rate	比例在rate以上
 * @param max_no	最多取至序列第max_no個//TODO:並小於l:limit
 * @return	[分子, 分母, 誤差]
 * @requires	mutual_division,continued_fraction
 * @see
 * http://en.wikipedia.org/wiki/Continued_fraction#Best_to_rational_numbers
 */
to_rational_number = function(number, rate, max_no) {
	if (!rate)
		rate = 99;
	var d = _.mutual_division(number, 1, max_no && max_no > 0 ? max_no : 20), i = 0, a, b = d[0];
	if (!b)
		b = d[++i];
	while (++i < d.length && (a = d[i]))
		if (a / b < rate)
			b = a;
		else
			break;

	//library_namespace.debug(d+': '+d.length+','+i+','+d[i]);
	d = _.continued_fraction(d, i);
	//library_namespace.debug(d);
	if (d[1] < 0)
		d[0] = -d[0], d[1] = -d[1];

	return [ d[0], d[1], d[0] / d[1] - number ];
};


/*	最大公因數/公約數	 Greatest Common Divisor

usage:
	gcd(6,9)
	GCD([5,3,8,2,6,9])
*/
//_gcd[generateCode.dLK]='mutual_division,mutual_division_done';
function _gcd(a,b){
 if(isNaN(a)||isNaN(b))
  return isNaN(b)?a:b;

 var d=_.mutual_division(a,b);
 a=d.pop();
 if(d.pop()===_.mutual_division.done)
  return a;
}

CeL.math
.
/**
 * Get GCD of 2 numbers
 * @param n1	number 1
 * @param n2	number 2
 * @return	GCD of the 2 numbers
 */
gcd = function(n1, n2) {
	/*
	if (isNaN(a))
		return b;
	*/
	//	必要!
	if (!n2 || isNaN(n2))
		return n1;

	//	也可最後再 Math.abs
	/*
	if (a < 0)
		a = -a;
	if (b < 0)
		b = -b;
	*/

	//	Euclidean algorithm
	var r;
	while (r = n1 % n2)
		n1 = n2, n2 = r;
	return n2 < 0 ? -n2 : n2;
};

//GCD[generateCode.dLK]='gcd';
function GCD(numA){
 var i=1,g=numA[0];
 for(;i<numA.length;i++)
  if(!isNaN(numA[i]))
   g=gcd(g,numA[i]);
 return g;
}
/*	最小公倍數	 Least Common Multiple

usage:
	lcm(6,9)
	lcm([5,3,8,2,6,9])

TODO:
更快的方法：
短除法
一次算出 GCD, LCM
*/
//lcm[generateCode.dLK]='gcd';
function lcm(a,b){
 var l,g,i=1;
 if( typeof a=='object' && !isNaN(l=a[0]) ){
  while(i<a.length)
   l=lcm(l,a[i++]);
  return l;
 }

 if( (g=gcd(a,b)) && !isNaN(g) )
  return a/g*b;
}


/*
http://www.math.umbc.edu/~campbell/NumbThy/Class/Programming/JavaScript.html
http://aoki2.si.gunma-u.ac.jp/JavaScript/
*/

CeL.math
.
/**
 * 得到平方數，相當於 Math.floor(Math.sqrt(number)).
 * get integer square root
 * @param {Number} positive number
 * @return	r, r^2 <= number < (r+1)^2
 * @example
 * var p = 20374345, q = CeL.math.floor_sqrt(p = p * p - 1); CeL.log(q + '<br/>' + (q * q) + '<br/>' + p + '<br/>' + (++q * q));
 * @see
 * <a href="http://www.azillionmonkeys.com/qed/sqroot.html" accessdate="2010/3/11 18:37">Paul Hsieh's Square Root page</a>
 * <a href="http://www.embeddedrelated.com/usenet/embedded/show/114789-1.php" accessdate="2010/3/11 18:34">Suitable Integer Square Root Algorithm for 32-64-Bit Integers on Inexpensive Microcontroller? | Comp.Arch.Embedded | EmbeddedRelated.com</a>
 */
floor_sqrt = function(number){
	if (isNaN(number = Math.floor(number)))
		return;
	var g = 0, v, h, t;
	while ((t = g << 1) < (v = number - g * g)) {
		//library_namespace.debug(t + ', ' + v);
		h = 1;
		while (h * (h + t) <= v)
			// 因為型別轉關係，還是保留 << 而不用 *2
			h <<= 1;//h *= 2;
		g += h >> 1;//h / 2;//
	}
	//library_namespace.debug('end: ' + t + ', ' + v);
	return g;
};


CeL.math
.
/**
 * 取得某數的質因數，因式分解/素因子分解, factorization, get floor factor.
 * 唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The Fundamental Theorem of Arithmeric) 的數學金科玉律。
 * @param {Number} number
 * @return	{Array} [prime1,power1,prime2,power2,..]
 * @see
 * <a href="http://homepage2.nifty.com/m_kamada/math/10001.htm" accessdate="2010/3/11 18:7">Factorizations of 100...001</a>
 * @requires	floor_sqrt
 */
factorization = function(number) {
	var f = 2, p, a, l, r = [];
	if (isNaN(number) || number < 1 || number >
			/*
			 * javascript 可以表示的最大整數值
			 * 10^21-2^16-1 = 999999999999999934463
			 * @see
			 * http://www.highdots.com/forums/javascript/how-js-numbers-represented-internally-166538-4.html
			 */
			999999999999999934469)
		return;
	number = Math.floor(number);

	// 2,3
	while (number > 1) {
		if (number % f === 0) {
			p = 0;
			do
				number /= f, p++;
			while (number % f === 0); // do{n/=f,p++;}while(n%f==0);
			r.push(f, p);
		}
		if (++f > 3)
			break;
	}

	a = 4, f = 5, l = _.floor_sqrt(number); // 5-初始化
	while (number > 1) {
		if (f > l) {
			r.push(number, 1);
			break;
		}
		// document.write('<br/>'+f+','+n);
		if (number % f === 0) {
			p = 0;
			do {
				number /= f, p++;
			} while (number % f === 0);
			l = _.floor_sqrt(number), r.push(f, p);
		}
		f += a = a === 2 ? 4 : 2;
	}
	return r;
};

/*	test
function count(n){
var a=factorization(n),s='',v=1;
if(a){
 for(var i=0;i<a.length;i+=2){s+='*'+a[i]+(a[i+1]>1?'^'+a[i+1]:'');v*=Math.pow(a[i],a[i+1]);}
 s=s.substr(1)+'='+v+'='+n;
}else s='error! '+n;
document.getElementById('result').value+=s+'\n-------------------------------------------\n';
}
*/


/*	猜測一個數可能的次方數。	2005/2/18 19:20未完成
	type=0:整數,1:有理數
	return [base分子,base分母,exponent分子,exponent分母]
*/
function to_exponent(num,type){
 var bn,bd,en=1,ed,sq=[1,num],t,q,error=1e-9,g=function(n){q=_.to_rational_number(n,99999);if((!type||q[1]==1)&&!(q[0]>99999&&q[1]>99999)&&q[2]/n<error)bn=q[0],bd=q[1],ed=t;};//error:誤差

 if(!ed)g(sq[t=1]);
 if(!ed)g(sq[t=2]=sq[1]*sq[1]);
 if(!ed)g(sq[t=3]=sq[1]*sq[2]);
 if(!ed)g(sq[t=4]=sq[2]*sq[2]);
 if(!ed)g(sq[t=5]=sq[2]*sq[3]);
 if(!ed)bn=num,bd=ed=1;

 return [bn,bd,en,ed];
}
//var t=to_exponent(Math.pow(2/3,1/1));alert(t[0]+'/'+t[1]+'^'+t[2]+'/'+t[3]);




/*
for 出題

runCode.setR=0;
for(var i=0,j,t,s,n_e;i<10;){
 t=2000+8000*Math.random();
 s=get_random_prime.get_different_number_set(3,t,t/8);
 if(s.LCM>9999)continue;
 n_e=[];
 n_e[s.GCD]=1;
 for(j=0;j<s.length;j++)
  if(n_e[s[j]])continue;
  else n_e[s[j]]=1;
 sl([s.GCD,s.LCM]+'<b style="color:#c4a">;</b> '+s);i++;
}

*/

//	求乘積
function get_product(nums,till){	//	num array, 乘到比till小就回傳
 var p=1,i=0,l=nums.length;
 for(;i<l;i++){
  if(till&&p*nums[i]>till)break;
  p*=nums[i];
 }
 return p;
}


//	2009/10/21 11:57:47
//get_random_prime[generateCode.dLK]='get_product';
get_random_prime.primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
function get_random_prime(count,exclude,all_different){	//	個數, 排除
 var _f=arguments.callee,i,j,p=[],l;
 if(!count||count<1)count=1;
 if(!_f.excluded)
  _f.excluded=[];
 if(exclude)exclude=[];

 for(j=0;j<count;j++){
  l=80;	//	timeout
  do{
   i=Math.round(10*Math.tan(Math.random()*1.5));
   if(!--l)return;	//	timeout
  }while(_f.excluded[i]);
  p.push(_f.primes[i]);
  if(exclude)exclude.push(i);
 }

 //	選完才排除本次選的
 if(exclude)
  for(j=0,l=exclude.length;j<l;j++){
   i=exclude[j];
   if(_f.excluded[i])_f.excluded[i]++;
   else _f.excluded[i]=1;
  }

 return count==1?p[0]:p;
}

//	return [GCD, n1, n2, ..]
get_random_prime.get_different_number_set=function(count,till,GCD_till){
 delete this.excluded;
 if(!GCD_till)GCD_till=1e5;
 if(!till)till=1e5;

 var GCD=get_product(this(20,1),GCD_till),na=[],n_e=[],n,i=0,out;
 n_e[GCD]=1;

 for(;i<count;i++){
  out=80;	//	timeout
  do{
   n=this(20);
   n.unshift(GCD);
   n=get_product(n,till);
  }while(n_e[n]&&--out);
  n_e[n]=1;
  na.push(n);
 }

 if(typeof lcm=='function')
  na.LCM=lcm(na);
 na.GCD=GCD;
 return na;
};



CeL.math
.
/**
 * VBScript has a Hex() function but JScript does not.
 * @param {Number} number
 * @return	{String} number in hex
 * @example
 * alert('0x'+CeL.hex(16725))
 */
hex = function(number) {
	return (number < 0 ? number + 0x100000000 : number - 0).toString(16);
}

CeL.math
.
/**
 * 補數
 * @param {Number} number
 * @return	{Number} base	1: 1's Complement, 2: 2's Complement, (TODO: 3, 4, ..)
 * @example
 * alert(complement())
 * @see
 * http://www.tomzap.com/notes/DigitalSystemsEngEE316/1sAnd2sComplement.pdf
 */
complement = function() {
	return this.from.apply(this, arguments);
};

_.complement.prototype = {

base : 2,

bits : 8,

whole : 0,

//	!=0 / true: negative value
sign : 0,

valueOf : function() {
	return this.value;
},

set : function(value) {
	this.sign = value<0;
	this.value = value;
	return this;
},



from : function(number, base) {
	number = ('' + (number||0)).replace(/\s+$|^[\s0]+/g, '');
	//library_namespace.debug(number+':'+number.length +','+ this.bits);
	if (number.length > this.bits)
		throw 'overflow';

	if ((base = Math.floor(base)) && base > 0)
		this.base = base;
	else
		base = this.base;
	//library_namespace.debug(base+"'s Complement");

	this.whole = base == 1 ? Math.pow(2, this.bits) - 1 : Math.pow(base, this.bits);
	//library_namespace.debug(this.whole);

	this.sign = number.length == this.bits;
	this.value = parseInt(number, base);
	return this;
},

to : function(base) {
	if (!(base = Math.floor(base)) || base < 1)
		base = this.base;

	var value = this.value;
	if (this.sign)
		value = this.whole + value;

	//library_namespace.debug(value);
	if (this.sign && value < -this.value 
			|| this.bits - (value = value.toString(Math.max(2, this.base))).length < (this.sign?0:1))
		throw 'overflow';

	return value;
}

};



/*	↑Math	---------------------------------------------------------------
*/





return (
	CeL.math
);
};

//============================================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for native objects
 * @fileoverview
 * 本檔案包含了 native objects 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'native';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.native
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	native objects 的 functions
 */
CeL.native
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.native
.prototype = {
};






/*	opposite of toUTCString()
	尚不成熟！假如是type=='date'，不如用new Date()!
	string大部分可用new Date(Date.parse(str))代替!
	http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx

var UTCDay,UTCMonth;
setObjValue('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat',1);
setObjValue('UTCMonth','Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',1);
var fromUTCStringFormat=[[0,3,2,1,4],[0,5,1,2,3],[0,4,1,2,3]];	//	0:[Mon, 9 Aug 2004 12:05:00 GMT],1:[Thu Sep 30 18:12:08 UTC+0800 2004],2:[Sat Jun 26 18:19:46 2004]
function fromUTCString(str,format){
 var s=''+str,f;
 if(!s)return;
 if(typeof format=='undefined')if(f=Date.parse(s))return new Date(f);else return 'Unknown format!';//format=0;
 if(!isNaN(format)&&format<fromUTCStringFormat.length)f=fromUTCStringFormat[format];
 else return 'Yet support this kind of format['+format+']!\nWe support to '+fromUTCStringFormat.length+'.';
 if(!f[0])f[0]=' ';
 s=s.replace(new RegExp(f[0]+'+','g'),f[0]).split(f[0]);
 if(s.length<f.length)return 'The item length of data: '+s.length+' is less then format['+format+']: '+f.length+'!\n'+s.join(',');// new Date
 if(f.length==5)s[f[4]]=s[f[4]].split(':');
 else if(f.length==7)s[f[4]]=[s[f[4]],s[f[5]],s[f[6]]];
 else return 'Illegal date format!';
 if(format==1&&s[4].match(/([+-]\d{2})/))s[f[4]][0]=parseInt(s[f[3]][0])+parseInt(RegExp.$1);
 alert(str+'\n'+s[f[1]]+','+s[f[2]]+'('+UTCMonth[s[f[2]]]+'),'+s[f[3]]+','+s[f[4]][0]+','+s[f[4]][1]+','+s[f[4]][2]);
 //	check,可以包括星期
 if( !(s[f[2]]=UTCMonth[s[f[2]]]) || !(s=new Date(s[f[1]],s[f[2]],s[f[3]],s[f[4]][0],s[f[4]][1],s[f[4]][2])) )	//	Date.UTC()
  s='Input data error!';
 return s;
}
*/

/*	string <-> date object, Date.parse()
	http://msdn2.microsoft.com/zh-tw/library/t5580e8h(VS.80).aspx


/((\d{1,4})[\/.-])?([01]?\d)([\/.-]([0-3]?\d))?/
/([0-2]?\d):([0-5]?\d)(:([0-5]?\d))?\s*(([PA])M)?/


(


(


(
([12]\d{3}|1?\d{2})

[\/.-]
)?

([01]?\d)

([\/.-]([0-3]?\d)(\.\d+)?)?


|


([0-2]?\d)
:
([0-5]?\d)

(:([0-5]?\d))?

\s*
(([PA])M)?


)



\s*
){1,2}


try:
'2003/1/4  12:53:5'.toDate();
StrToDate.m.join('<br/>');
	$2:year
	$3:month
	$5:mday


*/
StrToDate.pd=/(([12]\d{3}|1\d{2}|[2-9]\d)[\/.\-年])?([01]?\d)([\/.\-月]([0-3]?\d)日?)?/;	//	pattern of date
StrToDate.pt=/([0-2]?\d)[:時]([0-5]?\d)([:分]([0-5]?\d)(\.\d+)?)?\s*(([PA])M)?/i;	//	pattern of time
StrToDate.r1=new RegExp(StrToDate.pd.source+'(\\s+'+StrToDate.pt.source+')?','i');	//	date [time]
StrToDate.r2=new RegExp(StrToDate.pt.source+'(\\s+'+StrToDate.pd.source+')?','i');	//	time [date]
//StrToDate.m;	//	matched string
function StrToDate(s,f,diff){	//	date string, force parse(no Date.parse() try), 時差 in hour(例如 TW: UTC+8 → 8, 可使用.5)
 if(!s)s=this.valueOf();//.toString();
 var m,a,b,c;
 if(!f&&!diff&&(m=Date.parse(s)))return new Date(m);	//	有diff時不使用 Date.parse

 if(m=s.match(/(^|[^\d])([12]\d{3})([^\/.\-年]|$)/))s=m[2]+'/1';	//	僅有年時的bug

 f=1911;	//	小於此年份會加上此年份。for 民國
 if(diff)diff=(new Date).getTimezoneOffset()+parseInt(60*diff);
 if(!diff)diff=0;
 if(m=s.match(StrToDate.r1))
  //	日期先
  //for(var i=1;i<11;i++)m[i]=m[i]?Math.floor(m[i]):0;	//	needless
  a=new Date((b=m[2]-0)&&b<200?b+f:b,m[3]?m[3]-1:0,m[5]||1,	m[12]=='P'||m[13]=='p'?m[7]-0+12:m[7],m[8]-diff,m[10],m[11]*1e3);

 if((!m||!isNaN(m[0]))&&(c=s.match(StrToDate.r2)))	//	不match或僅有一數字
  //	時間先
  m=c,a=new Date((b=m[10]-0)&&b<200?b+f:b,m[11]?m[11]-1:0,m[13]||1,	m[7]=='P'||m[7]=='p'?m[1]-0+12:m[1],m[2]-diff,m[4],m[5]*1e3);

 //var t="match:\n"+s+"\n\n";for(var i=0;i<m.length;i++){t+=(i>9?i:' '+i)+': '+m[i]+'\n';}if(!m[1]||!m[2]||!m[4])alert(t);

 if(StrToDate.m=m){
  //	判別未輸入時預設年份設對了沒：以最接近 now 的為基準
  if(!b && a-new Date(0,0,2)>0 && (
		m=new Date(a),
		a.setFullYear(s=(b=new Date).getFullYear()),
		m.setFullYear(a-b>0?s-1:s+1),
		a-b>0&&a-b>b-m||a-b<0&&a-b<b-m
	))a=m;
  return a;
 }
}

//	Turn to RFC 822 date-time
//DateToRFC822[generateCode.dLK]='setTool,StrToDate';
function DateToRFC822(d){
 if(!(d instanceof Date))d=(''+d).toDate();
 if(!d)d=new Date;
 return d.toGMTString().replace(/UTC/gi,'GMT');
}

//	要用更多樣化的，請使用gDate()
function DateToStr(sp){
 if(!sp)sp='/';
 with(this)return ''+getYear()+sp+(getMonth()+1)+sp+getDate()+' '+getHours()+':'+getMinutes();//+':'+.getSeconds()+'.'+getMilliseconds();
}
//var tt='2001/8/7 03:35PM';alert(tt+'\n'+tt.toDate().toStr());

/*	顯示格式化日期string	input date,mode	2003/10/18 1:04修正
	mode:	+4:不顯示時間,+3:顯示時間至時,+2:顯示時間至分,+1:顯示時間至秒,+0:顯示時間至毫秒(ms)
		+32(4):不顯示日期,+24(3):顯示日期mm/dd,+16(2):顯示日期yyyy/mm,+8(1):顯示日期yyyy/mm/dd(星期),+0:顯示日期yyyy/mm/dd
		+64:input UTC	+128:output UTC
	http://www.merlyn.demon.co.uk/js-dates.htm
	http://aa.usno.navy.mil/data/docs/JulianDate.html

NOTE:
在現有時制下要轉換其他時區之時間成正確time:
d=_其他時區之時間_;
diff=其他時區之時差(例如 TW: UTC+8)
d.setTime(d.getTime()-60000*((new Date).getTimezoneOffset()+diff*60))

*/
//gDate[generateCode.dLK]='dateUTCdiff,setTool,decplaces';
var dateUTCdiff;	//	全球標準時間(UCT)與本地時間之差距
gDate.noZero=1;
function gDate(d,M,sp1,sp2){
 //alert('['+(typeof d)+'] '+d+', '+M);
 if(!M)M=0;
 var isUTC,a,b,T,r=M;M%=64,noZero=arguments.callee.noZero,N=function(n){return noZero||n>9?n:'0'+n;};
 r=(r-M)/64;
 if(r%2==1)a=0;
 else{
  //	UTC time = local time + dateUTCdiff(ms)
  if(isNaN(dateUTCdiff))dateUTCdiff=6e4*(new Date).getTimezoneOffset();	//	.getTimezoneOffset() is in min. 60000(ms)=60*1000(ms)
  a=dateUTCdiff;
 }
 isUTC=r>1;
 if(typeof d=='number' && d>=0)
  d=new Date(Math.abs(d+a)<9e7?d+a:d)
  ,M=32+M%8;	//	d<90000000~24*60*60*1000，判別為當天，只顯示時間。不允許d<0！
 else if(typeof d=='string'&&d.toDate())d=d.toDate();
 else if(typeof d=='date')d=new Date(d);	//	應對在Excel等中會出現的東西
 else if(!(d instanceof Date))d=new Date;//http://www.interq.or.jp/student/exeal/dss/ejs/1/1.html 引数がオブジェクトを要求してくる場合は instanceof 演算子を使用します	typeof d!='object'||d.constructor!=Date	//	new Date==new Date()
 a=sp1||'/',b=sp2||':',T=M%8,M=(M-T)/8,r='';
 if(T>4&&M>3)return '';	//	沒啥好顯示的了
 //	date
 if(M<4){
  r=N((isUTC?d.getUTCMonth():d.getMonth())+1);
  if(M<3)r=(isUTC?d.getUTCFullYear():d.getFullYear())+a+r;
  if(M!=2){
   r+=a+N(isUTC?d.getUTCDate():d.getDate());
   if(M==1)r+='('+(isUTC?d.getUTCDay():d.getDay())+')';
  }
 }
 //	time
 if(T<4){
  if(M<4)r+=' ';	//	日期&時間中間分隔
  r+=N(isUTC?d.getUTCHours():d.getHours())+b;
  if(T<3){
   r+=N(isUTC?d.getUTCMinutes():d.getMinutes());
   if(T<2)r+=b+(T?N(isUTC?d.getUTCSeconds():d.getSeconds()):(isUTC?d.getUTCSeconds()+d.getUTCMilliseconds()/1e3:d.getSeconds()+d.getMilliseconds()/1e3).decp(3));
  }
 }
 return r;
}



/*
	Syntax error: http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
	function經ScriptEngine會轉成/取用'function'開始到'}'為止的字串

	用[var thisFuncName=parse_Function().funcName]可得本身之函數名
	if(_detect_)alert('double run '+parse_Function().funcName+'() by '+parse_Function(arguments.callee.caller).funcName+'()!');

You may use this.constructor


TODO:
to call: parse_Function(this,arguments)
e.g., parent_func.child_func=function(){var name=parse_Function(this,arguments);}

bug:
函數定義 .toString() 時無法使用。
*/
/**
 * 函數的文字解譯/取得函數的語法
 * @param function_name	function name
 * @param flag	=1: reduce
 * @return
 * @example
 * parsed_data = new parse_Function(function_name);
 * @see
 * http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
 * 
 */
function parse_Function(function_name, flag) {
	if (!function_name
			&& typeof (function_name = arguments.callee.caller) !== 'function')
		return;
	if (typeof function_name === 'string')
		this.oriName = function_name,
		// 不加var會變成global變數
		eval('var function_name=' + function_name);

	//	原先：functionRegExp=/^\s*function\s+(\w+) ..	因為有function(~){~}這種的，所以改變。
	var functionRegExp// =/^\s*function\s*(\w*)\s*\(([\w\s,]*)\)\s*\{\s*((.|\n)*)\s*\}\s*$/m
		, functionArguments, functionContents, functionString;

	//	for JScript<=5
	try {
		functionRegExp = new RegExp(
			'^\\s*function\\s*(\\w*)\\s*\\(([\\w\\s,]*)\\)\\s*\\{\\s*((.|\\n)*)\\s*\\}\\s*$', 'm');
	} catch (e) {
	}

	this.func = function_name;
	functionString = '' + function_name;
	//alert(typeof functionString+'\n'+functionString+'\n'+functionString.match(functionRegExp))
	//	detect error
	if (!functionString.match(functionRegExp))
		//	JScript5 不能用throw!	http://www.oldversion.com/Internet-Explorer.html
		//throw new Error(1002,'Syntax error(語法錯誤)');
		return 1002;

	//	可能是用了dupF=oF
	//if(functionString!=RegExp.$1)throw new Error(1,'Function name unmatch(函數名稱不相符)');


	function_name = RegExp.$1;
	functionArguments = RegExp.$2.split(',');
	functionContents = RegExp.$3;
	for ( var i = 0; i < functionArguments.length; i++) {
		functionArguments[i] = functionArguments[i].replace(/\s+$|^\s+/g, '')
				// 去除前後空白
				// .replace(/\s+$/,'').replace(/^\s+/,'')
				;
		if (functionArguments[i].match(/\s/))
			//throw new Error(1002,'Syntax error at arguments(語法錯誤)');
			return 1002;
	}

	//	在HTML中用this.name=會改變window.name!
	this.funcName = function_name;
	this.arguments = functionArguments;
	this.contents = functionContents;
	//this.parse=[functionArguments,functionContents];
	//alert('function '+this.name+'('+this.arguments+'){\n'+this.contents+'}')
	return this;
}




//	補強String.fromCharCode()
function fromCharCode(c){
 if(!isNaN(c))return String.fromCharCode(c);
 try{return eval('String.fromCharCode('+c+');');}catch(e){}//	直接最快
/*
 if(typeof c=='string')return eval('String.fromCharCode('+n+')');//c=c.split(',');	後者可以通過審查
 if(typeof c=='object'){
  var t='',d,i,a,n=[];
  if(c.length)a=c;else{a=[];for(i in c)a.push(c[i]);}
  for(i=0;i<a.length;i++)
   if(!isNaN(c=a[i])||!isNaN(c=(''+a[i]).charCodeAt(0)))n.push(c);	//	跳過無法判讀的值
  return eval('String.fromCharCode('+n+')');//n.join(',')	這樣較快
 }
*/
}





/*	2008/8/2 10:10:49
	對付有時 charCodeAt 會傳回 >256 的數值。	http://www.alanwood.net/demos/charsetdiffs.html
	若確定編碼是 ASCII (char code 是 0~255) 即可使用此函數替代 charCodeAt
*/
function toASCIIcode(s,a){	//	string, at
 var _f=arguments.callee,c;

 if(!_f.t){
  //	initial
  var i=129,t=_f.t=[],l={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
  for(;i<256;i+=2)
   t[i]=i;
  for(i in l)
   //sl(i+' = '+l[i]),
   t[Math.floor(i)]=l[i];
 }

 if(a<0&&!isNaN(s))c=s;
 else c=s.charCodeAt(a||0);

 return c<128?c:_f.t[c]||c;
}


/*	2008/8/2 9:9:16
	encodeURI, encodeURIComponent 僅能編成 utf-8，對於其他 local 編碼可使用本函數。

e.g.,
f.src='http://www.map.com.tw/search_engine/searchBar.asp?search_class=address&SearchWord='+encodeUC(q[0],'big5')




perl
#use Encode qw(from_to);
use Encode;

my $tEnc='utf-8';

$t="金";

$t=Encode::decode($t,'big5');

Encode::from_to($t,$lEnc,$outEnc);

Encode::from_to

@b=split(//,$a);

for($i=0;$i<scalar(@b);$i++){
 $r.=sprintf('%%%X',ord($b[$i]));
};


*/
//encodeUC[generateCode.dLK]='toASCIIcode';
function encodeUC(u,enc){
 if(!enc||enc=='utf8')return encodeURI(u);

 with(new ActiveXObject("ADODB.Stream"))
  Type=2,//adTypeText;
  Charset=enc,
  Open(),
  WriteText(u),
  Position=0,
  Charset='iso-8859-1',
  u=ReadText(),
  Close();

 var i=0,c,r=[];
 for(;i<u.length;i++)
  r.push((c=u.charCodeAt(i))<128?u.charAt(i):'%'+toASCIIcode(c,-1).toString(16).toUpperCase());

 return r.join('').replace(/ /g,'+');
}





/*	String to RegExp	qq// in perl
	(pattern text, flags when need to return RegExp object, char pattern need to escape)
*/
function to_RegExp_pattern(t,toR,p){
 var r=t
	.replace(p||/([.+*?|()\[\]\\{}])/g,'\\$1')	//	不能用 $0
	.replace(/^([\^])/,'\\^').replace(/([$])$/,'\\$')	//	這種方法不完全，例如 /\s+$|^\s+/g
	;
 return toR?new RegExp(r,/^[igms]$/i.test(toR)?toR:''):r;
}
//String.prototype.toRegExp=function(f){return to_RegExp_pattern(this.valueOf(),f);};


/*
	http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx
		如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test 會略過 lastIndex 值，並從字串之首開始搜尋。
	http://www.aptana.com/reference/html/api/RegExp.html

附帶 'g' flag 的 RegExp 對相同字串作 .test() 時，第二次並不會重設。因此像下面的 expression 兩次並不會得到相同結果。
var r=/,/g,t='a,b';WScript.Echo(r.test(t)+','+r.test(t));

改成這樣就可以了：
var r=/,/g,t='a,b',s=renew_RegExp_flag(r,'-g');WScript.Echo(s.test(t)+','+s.test(t));

這倒沒問題：
r=/,/g,a='a,b';if(r.test(a))alert(a.replace(r,'_'));


** delete r.lastIndex; 無效，得用 r.lastIndex=0;
因此下面的亦可：
if(r.global)r.lastIndex=0;
if(r.test(a)){~}
*/
function renew_RegExp_flag(r,f){
 var i,fs={global:'g',ignoreCase:'i',multiline:'m'};

 //	未設定 flag,
 if(!f){
  f='';
  for(i in fs)
   if(r[i])f+=fs[i];
  return f;
 }

 var a=f.charAt(0),F='',m;
 a=a=='+'?1:a=='-'?0:(F=1);

 if(F)
  //	無 [+-]
  F=f;
 else
  //	f: [+-]~ 的情況，parse flag
  for(i in fs)
   if((m=f.indexOf(fs[i],1)!=-1)&&a || !m&&r[i])
    F+=fs[i];
 
 return new RegExp(r.source,F);
}


/*	2004/5/27 16:08
	將 MS-DOS 萬用字元(wildcard characters)轉成 RegExp, 回傳 pattern
	for search

usage:
	p=new RegExp(turnWildcardToRegExp('*.*'))


flag&1	有變化的時候才 return RegExp
flag&2	add ^$


萬用字元經常用在檔名的置換。
* 代表任意檔案名稱
如：ls * 表示列出所有檔案名稱。
? 則代表一個字元
如: ls index.??? 表示列出所有 index.三個字元 的檔案名稱
[ ] 代表選擇其中一個字元
[Ab] 則代表 A 或 b 二者之中的一個字元
如: ls [Ab]same 為 Asame 或 bsame
[! ] 代表除外的一個字元
[!Ab] 則代表 不是 A 且 不是 b 的一個字元
如: [!0-9] 表不是數字字元
如: *[!E] 表末尾不是 E 的檔名

memo:
檔案名稱不可包含字元	** 不包含目錄分隔字元 [\\/]:
/:*?"<>|/

*/

//	萬用字元 RegExp source, ReadOnly
turnWildcardToRegExp.w_chars='*?\\[\\]';

function turnWildcardToRegExp(p,f){	//	pattern, flag

 if(p instanceof RegExp)return p;
 if(!p||typeof p!='string')return;

 var ic=arguments.callee.w_chars,r;
 if((f&1) && !new RegExp('['+ic+']').test(p))
  return p;

 ic='[^'+ic+']';
 r=p
	//	old: 考慮 \
	//.replace(/(\\*)(\*+|\?+|\.)/g,function($0,$1,$2){var c=$2.charAt(0);return $1.length%2?$0:$1+(c=='*'?ic+'*':c=='?'?ic+'{'+$2.length+'}':'\\'+$2);})

	//	處理目錄分隔字元：多轉一，'/' → '\\' 或相反
	.replace(/[\\\/]+/g,typeof dirSp=='string'?dirSp:'\\')

	//	在 RegExp 中有作用，但非萬用字元，在檔名中無特殊作用的
	.replace(/([().^$\-])/g,'\\$1')

	//	* 代表任意檔案字元
	.replace(/\*+/g,'\0*')

	//	? 代表一個檔案字元
	.replace(/\?+/g,function($0){return '\0{'+$0.length+'}'})

	//	translate wildcard characters
	.replace(/\0+/g,ic)

	//	[ ] 代表選擇其中一個字元
	//pass

	//	[! ] 代表除外的一個字元
	.replace(/\[!([^\]]*)\]/g,'[^$1]')

	;


 //	有變化的時候才 return RegExp
 if(!(f&1) || p!=r)try{
  p=new RegExp(f&2?'^'+r+'$':r,'i');
 }catch(e){
  //	輸入了不正確的 RegExp：未預期的次數符號等
 }

 return p;
}




//	string & Number處理	-----------------------------------------------

//	set prototype's function of 內建物件 for 相容性(not good way..)
//setTool[generateCode.dLK]='*setTool();';//,product,countS,decplaces,getText,turnUnicode,trimStr,StrToDate,DateToStr,JSalert
function setTool(){
 if(!String.prototype.x&&typeof product=='function')String.prototype.x=product;
 if(!String.prototype.count&&typeof countS=='function')String.prototype.count=countS;
 if(!Number.prototype.decp&&typeof decplaces=='function')Number.prototype.decp=decplaces;
 if(!String.prototype.gText&&typeof getText=='function')String.prototype.gText=getText;
 if(!String.prototype.turnU&&typeof turnUnicode=='function')String.prototype.turnU=turnUnicode;
 if(!String.prototype.trim&&typeof trimStr=='function')String.prototype.trim=trimStr;
 //if(!Array.prototype.unique&&typeof Aunique=='function')Array.prototype.unique=Aunique;	//	建議不用，因為在for(in Array)時會..

 if(!String.prototype.toDate&&typeof StrToDate=='function')String.prototype.toDate=StrToDate;
 if(!Date.prototype.toStr&&typeof DateToStr=='function')Date.prototype.toStr=DateToStr;
 if(typeof alert=='undefined'&&typeof JSalert=='function')alert=JSalert;	//	在HTML中typeof alert=='object'
}

function Aunique(){return uniqueArray(this);}
function uniqueArray(a,f){	//	array,sortFunction
 if(f)a.sort(f);else a.sort();
 var i=1,j=-1;
 for(;i<a.length;i++)
  if(a[i]==a[i-1]){if(j<0)j=i;}
  else if(j>=0)a.splice(j,i-j),i=j,j=-1;
 if(j>=0)a.splice(j,i-j);
 return a;
}

function product(c){
 if(isNaN(c)||(c=Math.floor(c))<1)return '';
 var i,r='',s=[];s[i=1]=this;
 while(i+i<=c)s[i+i]=s[i]+s[i],i+=i;
 while(c){if(i<=c)r+=s[i],c-=i;i/=2;}
 return r;//in VB:String(c,this)
}
//	計算string中出現k之次數	用s///亦可@perl
function countS(k){	//	k亦可用RegExp
 //var c=0,s=this,i=0,l;if(k&&typeof k=='string'){l=k.length;while((i=this.indexOf(k,i))!=-1)c++,i+=l;}return c;
 return (this.length-this.replace(k,'').length)/k.length;
}


CeL.native
.
/**
 * 取至小數d位，
 * 原因：JScript即使在做加減運算時，有時還是會出現1.4000000000000001，0.0999999999999998等數值。此函數可取至1.4與0.1
 * @param digits	number of decimal places shown
 * @param max	max digits	max==0:round() else floor()
 * @return
 * @see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 * IEEE754の丸め演算は最も報告されるES3「バグ」である。
 * http://www.jibbering.com/faq/#FAQ4_6
 * @example
 * {var d=new Date,v=0.09999998,i=0,a;for(;i<100000;i++)a=v.decp(2);alert(v+'\n→'+a+'\ntime:'+gDate(new Date-d));}
 */
decplaces = function(digits, max) {
	var v = this.valueOf(),
	i, n;

	if (isNaN(v))
		return v;

	if (isNaN(digits) || digits < 0)
		// 內定：8位
		digits = 8;
	else if (digits > 20)
		digits = 20;

	if (!max && Number.prototype.toFixed)
		return parseFloat(v.toFixed(digits));

	if (v < 0)
		// 負數
		n = 1, v = -v;
	if ((i = (v = v.toString(10)).indexOf('e')) != -1)
		return v.charAt(i + 1) == '-' ? 0 : v;

	//library_namespace.debug(v);
	if (i = v.indexOf('.'), i != -1) {
		if (i + 1 + digits < v.length)
			if (max)
				v = v.slice(0, i + 1 + digits);
			else {
				v = '00000000000000000000' + Math.round(
						v.slice(0, i++) + v.substr(i, digits) + '.'
						+ v.charAt(i + digits)).toString(10);
				// (v!=0?alert(v+','+v.length+','+digits+','+v.substr(0,v.length-digits)+','+v.substr(max)):0);
				v = v.slice(0, max = v.length - digits) + '.' + v.substr(max);
			}
	}

	return v ? parseFloat((n ? '-' : '') + v) : 0;
};
/*	old:very slow
function decplaces(d,m){
 var v=this.valueOf(),i;if(isNaN(v))return v;
 if(isNaN(d)||d<0)d=8;	//	內定：8位
 if(!m){
  v=Math.round(Math.pow(10,d)*v);v=v<0?'-'+'0'.x(d)+(-v):'0'.x(d)+v;
  v=v.slice(0,i=v.length-d)+'.'+v.substr(i);
 }else if(i=(v=''+v).indexOf('.')+1)v=v.slice(0,i+(d?d:d-1));
 return parseFloat(v||0);
}
*/

/*
//	增添單位
var addDenominationSet={};
addDenominationSet.a=',,,,'.split(',');
function addDenomination(a,b){

}
*/




//var sourceF=WScript.ScriptName,targetF='test.js';simpleWrite('tmp.js',alert+'\n'+simpleRead+'\n'+simpleWrite+'\nvar t="",ForReading=1,ForWriting=2,ForAppending=8\n,TristateUseDefault=-2,TristateTrue=-1,TristateFalse=0\n,WshShell=WScript.CreateObject("WScript.Shell"),fso=WScript.CreateObject("Scripting.FileSystemObject");\nt='+dQuote(simpleRead(sourceF),80)+';\nsimpleWrite("'+targetF+'",t);//eval(t);\nalert(simpleRead("'+sourceF+'")==simpleRead("'+targetF+'")?"The same (test dQuote OK!)":"Different!");');//WshShell.Run('"'+getFolder(WScript.ScriptFullName)+targetF+'"');
//	determine quotation mark:輸入字串，傳回已加'或"之字串。
/*
dQuote.qc=function(c,C){
	return c<32?'\\'+c:C;
};
*/
function dQuote(s,len,sp){	//	string,分割長度(會採用'~'+"~"的方式),separator(去除末尾用)
 var q;s=''+s;if(sp)s=s.replace(new RegExp('['+sp+']+$'),'');	//	去除末尾之sp
 if(isNaN(len)||len<0)len=0;
 if(len){
  var t='';
  for(;s;)t+='+'+dQuote(s.slice(0,len))+'\n',s=s.substr(len);	//	'\n':NewLine
  return t.substr(1);
 }
 //if(len){var t='';for(;s;)t+='t+='+dQuote(s.slice(0,len))+'\n',s=s.substr(len);return t.substr(3);}	//	test用
 s=s.replace(/\\/g,'\\\\')
	.replace(/\r/g,'\\r').replace(/\n/g,'\\n')	//	\b,\t,\f
	//	轉換控制字符
	.replace(/([\0-\37\x7f\xff])/g,function($0,$1){var c=$1.charCodeAt(0);return c<64?'\\'+c.toString(8):'\\x'+(c<16?'0':'')+c.toString(16);})
	//.replace(/([\u00000100-\uffffffff])/g,function($0,$1){})
	;
 //q=s.length;while(s.charAt(--q)==sp);s=s.slice(0,q+1);
 if(s.indexOf(q="'")!=-1)q='"';
 if(s.indexOf(q)!=-1)s=s.replace(new RegExp(q="'",'g'),"\\'");	//	,alert("Can't determine quotation mark, the resource may cause error.\n"+s);
 return q+s+q;
}

/*	2006/10/27 16:36
	from program\database\BaseF.pm
	check input string send to SQL server
*/
function checkSQLInput(str){
 if(!str)return '';
 // 限制長度
 if(maxInput&&str.length>maxInput)str=str.slice(0,maxInput);
 return str
	// for \uxxxx
	.replace(/\\u([\da-f]{4})/g,function($0,$1){return String.fromCharCode($1);})
	.replace(/\\/g,'\\\\')
	.replace(/\x00/g,'\\0')	//	.replace(/[\x00-\x31]/g,'')
	//.replace(/\x09/g,'\\t')
	//.replace(/\x1a/g,'\\Z')
	.replace(/\r/g,'\\r').replace(/\n/g,'\\n')	//	.replace(/\r\n/g,' ')
	.replace(/'/g,"''")	//	.replace(/"/g,'\\"')
	;
}
// 去掉前後space
function checkSQLInput_noSpace(str){
 return str?checkSQLInput(str.replace(/\s+$|^\s+/g,'')):'';	//	.replace(/[\s\n]+$|^[\s\n]+/g,'')
}


//	轉換字串成數值，包括分數等。分數亦將轉為分數。
function parseNumber(n){
 if(typeof n=='number')return n;
 if(!n||typeof n!='string')return NaN;
 n=n.replace(/(\d),(\d)/g,'$1$2');
 var m;
 if(m=n.match(/(-?[\d.]+)\s+([\d.]+)\/([\d.]+)/)){
  var p=parseFloat(m[1]),q=parseFloat(m[2])/parseFloat(m[3]);
  return p+(m[1].charAt(0)=='-'?-q:q);
 }
 if(m=n.match(/(-?[\d.]+)\/([\d.]+)/))return parseFloat(m[1])/parseFloat(m[2]);	//	new quotient(m[1],m[2])
 try{return isNaN(m=parseFloat(n))&&typeof eval=='function'?eval(n):m;}catch(e){return m;}
}






return (
	CeL.native
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'SVG';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * math test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.SVG = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();





/*
	** 改用 getNetInfo()

	get host name & IP	2005/3/1 22:32
	只能用於WinXP, Win2000 server（換個版本指令以及輸出可能就不同！），而且非常可能出狀況！
	Win98 不能反查，只能 check local IP

//gethost[generateCode.dLK]='Sleep';
function gethost(host){
 var IP,p,c,t,i,f,cmd;
 //	決定shell	cmd 對於 ".. > ""path+filename"" " 似乎不能對應的很好，所以還是使用 "cd /D path;.. > ""filename"" "
 try{c='%COMSPEC% /U /c "',WshShell.Run(c+'"'),p=WScript.ScriptFullName.replace(/[^\\]+$/,''),c+='cd /D ""'+p+'"" && ',cmd=1;}
 catch(e){try{c='%COMSPEC% /c ',WshShell.Run(c),p='C:\\';}catch(e){return;}}
 if(host){
  if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host))IP=host,host=0;
 }else{
  f='ipconfig.tmp.txt';
  WshShell.Run(c+'ipconfig > '+(cmd?'""'+f+'"" "':p+f),0,1);	//	winipcfg
  if(t=simpleRead(f=p+f)){
   if(i=t.indexOf('PPP adapter'),i!=-1)t=t.slice(i);
   else if(i=t.indexOf('Ethernet adapter'),i!=-1)t=t.slice(i);
   if(i=t.indexOf('IP Address'),i!=-1)t=t.slice(i);
   if(t.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/))IP=RegExp.$1;
  }
  try{fso.DeleteFile(f);}catch(e){}
  if(!IP)return [0,0];
 }
 if(!cmd)return [host,IP];	//	Win98沒有nslookup
 f='qDNS.tmp.txt';
 WshShell.Run(c+'nslookup '+(cmd?'""'+(IP||host)+'"" > ""'+f+'"" "':(IP||host)+'>'+p+f),0,1);
 //try{WScript.Sleep(200);}catch(e){}	//	/C:執行字串中所描述的指令然後結束指令視窗	(x)因為用/c，怕尚未執行完。
 if((t=simpleRead(f=p+f)) && t.match(/Server:/)&&t.match(/Address:\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) ){
  t=t.slice(RegExp.lastIndex);
  host=t.match(/Name:\s*([^\s]+)/)?RegExp.$1:0;
  IP=t.match(/Address:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)?RegExp.$1:0;
  //alert(host+'\n'+IP);
 }else host=IP=0;
 try{fso.DeleteFile(f);}catch(e){}
 return [host,IP];
}
*/






/*
取得方法：
wget
curl
lftp
prozilla
puf
CuteFTPPro.TEConnection

XMLHttp
Msxml2.DOMDocument
InternetExplorer.Application
WinHttp.WinHttpRequest.5.1	深入挖掘Windows腳本技術(5) - 網頁特效代碼 - IT學習者	http://www.itlearner.com/Article/2008/4024_5.shtml
	獲取軟件下載的真實地址！再談獲取Response.redirect重定向的URL-asp教程-asp學習網	http://www.aspxuexi.com/xmlhttp/example/2006-8-8/852.htm

*/
//getURI.ws=0;	//	window style: 0: hidden, 1: show
//getURI.temp_file='C:\\getURI.tmp';	//	指定當檔名具有特殊字元時之暫存檔
//getURI.temp_file=function(URI,toFile){return temp_file_path;}
getURI.user_agent='Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)';
//getURI.referer='';
getURI[generateCode.dLK]='initWScriptObj';
function getURI(URI,toFile){
 var _f=arguments.callee,c,tF;
 if(!/^[\x20-\xff]+$/.test(toFile))
  tF=typeof _f.temp_file=='function'?_f.temp_file(URI,toFile):_f.temp_file;
 _f.cmd=c=
	'wget.exe --keep-session-cookies --referer="'
	+(typeof _f.referer=='string'?_f.referer:URI)
	+'" --output-document="'
	+(tF||toFile)
	+(_f.user_agent?'" --user-agent="'+_f.user_agent:'')
	+'" "'+URI+'"';
 try{
  c=WshShell.Run(c,_f.ws||0,true);
  if(tF && fso.FileExists(tF))	//	出問題還是照搬
   fso.MoveFile(tF,toFile);
  if(c && fso.FileExists(toFile)){
   //	需注意出問題過，原先就存在的情況。
   if(!fso.FileExists(toFile+'.unfinished'))
    fso.MoveFile(toFile,toFile+'.unfinished');
  }
  return c;

 }catch(e){
  if((e.number&0xFFFF)==2)
   return 7;	//	'找不到執行檔: wget。您可能需要安裝此程式後再執行。'	http://users.ugent.be/~bpuype/wget/
  return e;
 }

}





/*	for get serial Youtube video

2009/10/18-19 22:09:49	main
2009/10/20 22:40:33	to function

example:

runCode.setR=0;
getURI.ws=1;
var i=0,base_directory='D:\\USB\\graduate\\7-1 環境規劃研究\\movie\\大三峡\\'
,d=get_video('9RlvpgkLj-8 SrA2Aumaa3A 1rFiC1FL8hE RnOGhurSmOM lqz6Epp8UgI cRpgU_pz4xs tK31eZ_kYAE cipv9M3ZRxU t_ikkmW0B6I XW_WNd5oThU WxaeQTd5UNg qaHXR_cnYYY tPOuLU0l26o 5JWy-vUpC-A khPySOdT1IA 1wwG1coW_LE gJc0UWNlgU4 U9z7LpFU5CE OkD_eNdAXlI 466JBDiNJZA 48qloGDgtEk ywHtkjHJkOU qjJUAuGcYYY 2XD_zV7smWI q3_ZAVqBxYg -tO0aizbf9A agWpXY1QfYY agWpXY1QfYY Y82DTRuCczw vo_wJMXBTIs t4tzUnmuFqY mqXtLRn4ZwU Ku2Hrc7eIBE wcP8TxQvs-0 aTBFC1i7jSk GdzbL5zVbjo MjOa_GtyWn8 DUrigblNFTU uPB0157JU1I q4EF8Cc6STo qOoi_bnj0dg EPBpJnsNrUk 9MyOhef-hz8 yvccMsJD8ZY Pl7zKTsejQQ LGlGG2T_onc W5aDXj0M-CM i_NUdBTpmZ4 6ulRnzPbTEk GMxRLPkLm8k FrPf88CUhTQ Jcz_8SxdYPw hqs3fc7z8OE 6Wl2qBDXCys _Nvv0uIbQB0 X1r3pdc2hfg DoVGRALYR04 U2wSiDiAALM eR7tQMByTww 5K3vvDszc0k JLNusVIjHZQ j7z6vsvn-Lk TNU7-HtA-PA dWQqKDfjPKg uwEq6PFTXhw kotFR3u13QA 9G8Fehz25Ls IdFKvaj5Poc 1TDiHNsM1kE SRxZPHWZBZM Rn9T_TR2l9E 4P_UNxwpy0w lknvtYmYPzI'.split(' '),base_directory,'D:\\downloads\\');
for(;i<d.length;i++)
 d[i]=d[i].title+'	'+d[i].hash+'	'+d[i].url;
simpleWrite(base_directory+'list.txt',d.join(NewLine),TristateTrue);


TODO:
get more data of video
multi task
debug: get_video('8bFCwvoICD0','d:\\');
*/

//	get video data
get_video.get_data=function(video_hash){
 var html=getU('http://kej.tw/flvretriever/?videoUrl='+encodeURIComponent('http://www.youtube.com/watch?v='+video_hash)),title,url,m;

 if(html){
  if(m=html.match(/vtitle[^>]+>([^<]+)</))
   title=m[1];
  if(m=html.match(/outputfield[^>]+>([^<]+)</))
   url=HTMLToUnicode(m[1]);

  return {
	hash:video_hash
	,title:title	//	title/name
	,url:url
	,extension:'.flv'	//	what extension
  };
 }
};

//get_video[generateCode.dLK]='initWScriptObj,getURI,getU,HTMLToUnicode';
function get_video(video_hash_array, base_directory, temp_directory, list_only){
 if(!video_hash_array)return;
 if(!(video_hash_array instanceof Array))
  video_hash_array=[video_hash_array];

 var _f=arguments.callee
 ,count=video_hash_array.length
 ,err_count=0
 ,i=0
 ,urls={},name_array=[]
 ,video_data
 ,fp,t
 ;

 if(base_directory&&!/[\\\/]$/.test(base_directory))
  base_directory+=library_namespace.env.path_separator;

 for(;i<count;i++){
  fp='['+(i+1)+'/'+count+'] '+video_hash_array[i];	//	for message show

  if((video_data=_f.get_data(video_hash_array[i])) && video_data.url){
   name_array.push(t=video_data.title);
   urls[t]=video_data;

   sl(fp+' [<a href="'+video_data.url+'">'+t+'</a>]');
   fp=base_directory+t+video_data.extension;

   if(temp_directory && fso.FileExists(getURI.temp_file=temp_directory+video_data.hash+video_data.extension))
    fso.MoveFile(getURI.temp_file,fp);
   if(fso.FileExists(fp)){
    sl('File ['+fp+'] existed.');
    continue;
   }

   //if(temp_directory)sl('temp file: ['+getURI.temp_file+']');
   if(!list_only){
    if(a=getURI(video_data.url,fp))
     err_count++,err(a);
    //Sleep(9);
   }
  }else err_count++,err(fp+(video_data?' ['+video_data.title+']':''));
 }

 sl(err_count?'Error: '+err_count+'/'+count:'All '+count+' files done.');

 //	return video data
 name_array.sort();

 for(i=0,count=name_array.length,t=[];i<count;i++)
  t.push(urls[name_array[i]]);

 return t;
}




/*	自動組態設定檔/自動設定網址
	http://contest.ks.edu.tw/syshtml/proxy-pac.html
	Proxy Auto-Config File Format	http://lyrics.meicho.com.tw/proxy.pac
	http://openattitude.irixs.org/%E7%BC%96%E5%86%99-pac-proxy-auto-config-%E6%96%87%E4%BB%B6/
	http://www.atmarkit.co.jp/fwin2k/experiments/ieproxy/ieproxy_01.html
	http://www.cses.tcc.edu.tw/~chihwu/proxy-pac.htm
	you should configure your server to map the .pac filename extension to the MIME type:
		application/x-ns-proxy-autoconfig

網域名稱之長度，經punycode轉碼後，不得超過63字元,大約二十個中文字以內。

FindProxyForURL 將會傳回一個描寫Proxy組態設定的單一字串。假如該字串為空字串，則表示瀏覽器不使用 Proxy 伺服器。
假如有多個代理伺服器設定同時存在，則最左邊的設定將第一個使用，直 到瀏覽器無法建立連線才會更換到第二個設定。而瀏覽器將會在30分鐘後 自動對於先前無回應的 PROXY 伺服器重新連線。而瀏覽器將會於一個小時 後自動再連線一次（每一次的重新連線都會增加30分鐘）。
如果說所有的 PROXY 伺服器都當掉了，也沒有將 DIRECT 設定在 .pac 檔 案，那麼瀏覽器在嘗試建立連線 20 分鐘後將會詢問是否要暫時忽略 Proxy 服器直接存取網路，下一次詢問的時間則是在 40 分鐘後（注意！每一次 詢問都會增加20分鐘)

http://www.microsoft.com/technet/prodtechnol/ie/ieak/techinfo/deploy/60/en/corpexjs.mspx?mfr=true
The isInNet, isResolvable, and dnsResolve functions query a DNS server.
The isPlainHostName function checks to see if there are any dots in the hostname. If so, it returns false; otherwise, the function returns true.
The localHostOrDomainIs function is executed only for URLs in the local domain.
The dnsDomainIs function returns true if the domain of the hostname matches the domain given.

DIRECT - 不調用代理，直接連接
PROXY host:port - 調用指定代理(host:port)
SOCKS host:port - 調用指定SOCKS代理(host:port)
如果是選用由分號分割的多塊設置，按照從左向右，最左邊的代理會被最優先調用，除非瀏覽器無法成功和proxy建立連接，那麼下一個配置就會被調 用。如果瀏覽器遇到不可用的代理服務器，瀏覽器將在30分鐘後自動重試先前無響應的代理服務器，一個小時後會再次進行嘗試，依此類推，每次間隔時間為 30 分鐘。
*/
function FindProxyForURL(url, host){	//	url: 完整的URL字串, host: 在 URL字串中遠端伺服器的網域名稱。該參數祇是為了 方便而設定的，是與URL在 :// 和 / 中的文字是一模 一樣。但是傳輸阜（The port number）並不包含其中 。當需要的時候可以從URL字串解讀出來。
 var lch=host.toLowerCase();

	//isPlainHostName(lch) || isInNet(lch,"192.168.0.0","255.255.0.0") || isInNet(lch,"127.0.0.0","255.255.0.0") || dnsDomainIs(lch,".tw") ?"DIRECT";
 return //dnsDomainIs(lch,"holyseal.net") || dnsDomainIs(lch,".fuzzy2.com") ? "PROXY 211.22.213.114:8000; DIRECT":	//	可再插入第二、三順位的proxy
/*
http://www.cybersyndrome.net/

http://www.publicproxyservers.com/page1.html
curl --connect-timeout 5 -x 219.163.8.163:3128 http://www.getchu.com/ | grep Getchu.com
curl --connect-timeout 5 -x 64.34.113.100:80 http://www.getchu.com/ | grep Getchu.com
curl --connect-timeout 5 -x 66.98.238.8:3128 http://www.getchu.com/ | grep Getchu.com
*/
	dnsDomainIs(lch,".cn") || dnsDomainIs(lch,"pkucn.com")
						? "PROXY proxy.hinet.net:80; DIRECT":	//	2009/8/16 14:20:32	用 HiNet 網際網路 Proxy Server 上大陸網速度還滿快的	http://www.ltivs.ilc.edu.tw/proxy/proxy/hinet.htm
	dnsDomainIs(lch,".getchu.com")		? "PROXY 219.163.8.163:3128; PROXY 64.34.113.100:80; PROXY 66.98.238.8:3128; DIRECT":
	dnsDomainIs(lch,".minori.ph")		? "PROXY 219.94.198.110:3128; PROXY 221.186.108.237:80; DIRECT":	//	Japan Distorting Open Proxy List	http://www.xroxy.com/proxy--Distorting-JP-nossl.htm
						//	slow:	http://www.cybersyndrome.net/country.html
	dnsDomainIs(lch,".tactics.ne.jp")	? "PROXY 202.175.95.171:8080; PROXY 203.138.90.141:80; DIRECT":
	//dnsDomainIs(lch,".ys168.com")		? "PROXY 76.29.160.230:8000; DIRECT":	//	永硕E盘专业网络硬盘服务

	//	國立高雄師範大學圖書館	69771202	qwer1234
	!host.indexOf("140.127.53.") && !url.indexOf("http:")	//	isInNet(host, "140.127.53.13", "255.255.255.0")
		|| dnsDomainIs(lch,".csis.com.tw")
		|| dnsDomainIs(lch,".ebscohost.com")
		|| dnsDomainIs(lch,".airiti.com")
		|| dnsDomainIs(lch,".cetd.com.tw")
		|| dnsDomainIs(lch,".ceps.com.tw")
		|| dnsDomainIs(lch,"udndata.com")
		|| dnsDomainIs(lch,".wanfangdata.com")
		|| dnsDomainIs(lch,".apabi.com")
		|| dnsDomainIs(lch,".wordpedia.com")
		|| dnsDomainIs(lch,".infolinker.com.tw")
		? "PROXY 140.127.53.13:3128; DIRECT":

	"DIRECT";//:/^[a-z\.\d_\-]+$/.test(lch)?"DIRECT":"PROXY dnsrelay.twnic.net.tw:3127";	//	http://www.twnic.net.tw/proxy.pac	將中文網域名稱轉成英文網域名稱
}





//	http://help.globalscape.com/help/cuteftppro8/
setupCuteFTPSite[generateCode.dLK]='parseURI';
function setupCuteFTPSite(targetS,site){
 if(typeof targetS=='string')targetS=parseURI(targetS,'ftp:');
 if(!targetS)return;

 if(site){
  try{site.Disconnect();}catch(e){}
  try{site.Close();}catch(e){}
 }
 try{
  site=null;
  site=WScript.CreateObject("CuteFTPPro.TEConnection");
  site.Host=targetS.host;
  //	http://help.globalscape.com/help/cuteftppro8/setting_protocols.htm
  site.Protocol=targetS.protocol.replace(/:$/,'').toUpperCase();	//	The default Protocol is FTP, however SFTP (SSH2), FTPS (SSL), HTTP, and HTTPS can also be used)
  if(targetS.username)site.Login=targetS.username;
  if(targetS.password)site.Password=targetS.password;

  site.useProxy="off";
  site.TransferType='binary';

  site.Connect();

  //site.TransferURL("http://lyrics.meicho.com.tw/run.js");
 }catch(e){return;}
 return site;
}


/*
TODO:
transferURL(remote URI,remote URI)
*/
transferURL[generateCode.dLK]='parsePath,parseURI,setupCuteFTPSite';
function transferURL(fromURI,toURI){
 //var connectTo=fromURI.indexOf('://')==-1?toURI:fromURI,CuteFTPSite=setupCuteFTPSite(connectTo);
 var isD,CuteFTPSite,lF,rP;	//	isD: use download (else upload), lF: local file, rP: remote path
 if(fromURI.indexOf('://')!=-1)isD=0;
 else if(toURI.indexOf('://')!=-1)isD=1;
 else return;	//	local to local?
 lF=parsePath(isD?toURI:fromURI);
 CuteFTPSite=setupCuteFTPSite(rP=parseURI(isD?fromURI:toURI,'ftp:'));
 if(!CuteFTPSite||!CuteFTPSite.IsConnected)return;
 //	到這裡之後，就認定CuteFTPPro.TEConnection的initial沒有問題，接下來若出問題，會嘗試重新initial CuteFTPPro.TEConnection

 //	initial local folder
 try{
  if(!site.LocalExists(site.LocalFolder=lF.directory))
   site.CreateLocalFolder(lF.directory);
 }catch(e){return;}
 site.RemoteFolder=rP.pathname;

 if(isD){
  site.Download(rP.fileName,lF.fileName||rP.fileName);
  if(!site.LocalExists(lF.path))return;
 }else{
  site.Upload(lF.fileName,rP.fileName||lF.fileName);
  if(!site.LocalExists(rP.path))return;
 }

 //	get list
 //site.GetList('/OK','','%NAME');
 //var l=site.GetResult().replace(/\r\n?/g,'\n').split('\n');

 //	close
 try{site.Disconnect();}catch(e){}
 site.Close();

 return 1;
}






//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for Windows
 * @fileoverview
 * 本檔案包含了 Windows 專用的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'OS.Windows';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.OS.Windows
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'code.compatibility.is_web,code.compatibility.is_HTA')))
	return;


/**
 * null module constructor
 * @class	web 的 functions
 */
CeL.OS.Windows
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.OS.Windows
.prototype = {
};




//initWScriptObj();
//initWScriptObj[generateCode.dLK]='is_web,is_HTA,ScriptHost,dirSp'.split(',');
//initWScriptObj[generateCode.dLK].push('*var args,WshShell,WinShell,WinShell,fso;initWScriptObj();');
function initWScriptObj(onlyHTML){
 if(typeof WScript=='object'){// && typeof WScript.constructor=='undefined'
  var i=(ScriptHost=WScript.FullName).lastIndexOf(dirSp);
  if(i!=-1)ScriptHost=ScriptHost.slice(i+1);
  WshShell=WScript.CreateObject("WScript.Shell"),WinShell=WScript.CreateObject("Shell.Application"),fso=WScript.CreateObject("Scripting.FileSystemObject");
  args=[];
  for(var i=0,l=WScript.Arguments.length;i<l;i++)
   args.push(WScript.Arguments(i));
 }else{
  if(	//	用 IE 跑不能用 ActiveXObject
	!(typeof onlyHTML==='undefined'?is_web()&&!is_HTA():onlyHTML)//!onlyHTML//
	&& typeof ActiveXObject!='undefined')try{	//	在.hta中typeof WScript=='undefined'
   //	http://msdn.microsoft.com/library/en-us/shellcc/platform/shell/reference/objects/shell/application.asp	http://msdn.microsoft.com/library/en-us/shellcc/platform/shell/programmersguide/shell_intro.asp
   WshShell=new ActiveXObject("WScript.Shell"),WinShell=new ActiveXObject("Shell.Application"),fso=new ActiveXObject("Scripting.FileSystemObject");
   if(is_HTA.HTA)args=is_HTA.HTA.commandLine.split(/\s+/),args.shift();
  }catch(e){}
  //	判斷假如尚未load則排入以確定是否為HTA
  else if(is_web(1)&&!is_HTA()&&!document.getElementsByTagName('body').length)
   setTimeout('initWScriptObj();',9);
 }

 //if(typeof newXMLHttp=='function')XMLHttp=newXMLHttp();

/* @cc_on
@if(@_jscript_version >= 5)
// JScript gives us Conditional compilation, we can cope with old IE versions.
// and security blocked creation of the objects.
 ;//else..
@end@*/
}






/*	2007/11/17 23:3:53
	使用 ADSI (Active Directory Service Interface) 存取資料
	http://support.microsoft.com/kb/234001
	http://www.dbworld.com.tw/member/article/010328b.htm
	http://support.microsoft.com/kb/216393
*/
function addUser(name,pw,group,computer){
 //	http://msdn.microsoft.com/library/en-us/script56/html/wsmthenumprinterconnections.asp
 ;
 //	連上伺服器
 var oIADs,o;
 //	利用Create指令，指定產生一個新的使用者類別，以及使用者帳號的名稱。使用SetInfo的指令將目錄服務中的資料更新。
 try{oIADs=new Enumerator(GetObject(computer='WinNT://'+(computer||(new ActiveXObject('WScript.Network')).ComputerName)));}catch(e){}//WScript.CreateObject('WScript.Network')
 if(oIADs){//try{
  if(name){
   try{o=oIADs.Create('user',name);}catch(e){o=new Enumerator(GetObject(computer+'/'+name));}
   with(o)SetPassword(pw),/*FullName=name,Description=name,*/SetInfo();
   //	Administrators
   if(group)(new Enumerator(GetObject(computer+'/'+group))).Add(o.ADsPath);	//	o.ADsPath: computer+'/'+name
   return o;	//	得到用戶
  }

  //oIADs.Filter=['user'];//new VBArray('user');	//	no use, 改用.AccountDisabled
  o={};
  //	http://msdn2.microsoft.com/en-us/library/aa746343.aspx
  //	對所有的oIADs，通常有Name,Description
  for(var i,j,a,b,p='Name,AccountDisabled,Description,FullName,HomeDirectory,IsAccountLocked,LastLogin,LoginHours,LoginScript,MaxStorage,PasswordExpirationDate,PasswordMinimumLength,PasswordRequired,Profile'.split(',');!oIADs.atEnd();oIADs.moveNext())if(typeof oIADs.item().AccountDisabled=='boolean'){
   for(i=oIADs.item(),j=0,a={};j<p.length;j++)if(b=p[j])try{
    a[b]=i[b];
    if(typeof a[b]=='date')a[b]=new Date(a[b]);
   }catch(e){
    //alert('addUser():\n['+i.name+'] does not has:\n'+b);
    //	刪掉沒有的屬性。但僅少數不具有，所以不能全刪。XP中沒有(?):,AccountExpirationDate,BadLoginAddress,BadLoginCount,Department,Division,EmailAddress,EmployeeID,FaxNumber,FirstName,GraceLoginsAllowed,GraceLoginsRemaining,HomePage,Languages,LastFailedLogin,LastLogoff,LastName,LoginWorkstations,Manager,MaxLogins,NamePrefix,NameSuffix,OfficeLocations,OtherName,PasswordLastChanged,Picture,PostalAddresses,PostalCodes,RequireUniquePassword,SeeAlso,TelephoneHome,TelephoneMobile,TelephoneNumber,TelephonePager,Title
    //p[j]=0;//delete p[j];
   }
   o[i.name]=a;
  }

  return o;
 }//catch(e){}
}
//a=addUser();for(i in a){d=[];for(j in a[i])d.push(j+': '+a[i][j]);alert(d.join('\n'));}





//	特殊功能	-------------------------------------------------------

/*	取得基本環境值
//	test
if(0){
 var o=WinEnvironment;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=SpecialFolder;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=Network;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=NetDrive;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=NetPrinter;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
}
*/
//setTool();
var WinEnvironment,SpecialFolder,Network,NetDrive,NetPrinter;
getEnvironment[generateCode.dLK]='WinEnvironment,SpecialFolder,Network,NetDrive,NetPrinter,*getEnvironment();';
function getEnvironment(){
 if(typeof WshShell!='object'||typeof SpecialFolder=='object')return;

 WinEnvironment={},Network={},NetDrive={},NetPrinter={};
 var i,j,k,o=new Enumerator(WshShell.Environment("Process"));/*	Win9x、NT（Administratorもしくはほかのユーザー）の区別なく、すべての場合でエラーが発生しないようにするには、strTypeに"PROCESS"を指定するとよいでしょう。
	機器上所有已定義的環境變數Windows environment variables	http://msdn2.microsoft.com/en-us/library/fd7hxfdd(VS.85).aspx	http://www.roy.hi-ho.ne.jp/mutaguchi/wsh/refer/lesson11.htm	http://nacelle.info/wsh/03001.php	http://www.cs.odu.edu/~wild/windowsNT/Spring00/wsh.htm
	usual:	ALLUSERSPROFILE,APPDATA,BLASTER,CLASSPATH,CLIENTNAME,CommonProgramFiles,COMPUTERNAME,ComSpec,DEVMGR_SHOW_NONPRESENT_DEVICES,HOMEDRIVE,HOMEPATH,INCLUDE,LIB,LOGONSERVER,NUMBER_OF_PROCESSORS,OS,Os2LibPath,Path,PATHEXT,PROCESSOR_ARCHITECTURE,PROCESSOR_IDENTIFIER,PROCESSOR_LEVEL,PROCESSOR_REVISION,ProgramFiles,PROMPT,QTJAVA,SESSIONNAME,SystemDrive,SystemRoot,TEMP,TMP,USERDOMAIN,USERNAME,USERPROFILE,VS71COMNTOOLS,VSCOMNTOOLS,windir,winbootdir

	WshShell.ExpandEnvironmentStrings("%windir%\\notepad.exe");	WshShell.Environment("Process")("TMP")
	MyShortcut.IconLocation = WSHShell.ExpandEnvironmentStrings("%windir%\\notepad.exe, 0");

	System	HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment
	User	HKEY_CURRENT_USER\Environment
	Volatile	HKEY_CURRENT_USER\Volatile Environment	ログオフとともにクリアされる
	Process, or 98:'WshShell.Environment'==WshShell.Environment("Process"),NT:==WshShell.Environment("System")ただし、Administratorアカウントを持つユーザー以外は、strTypeに"SYSTEM"を指定、もしくは省略するとエラーになります。
 */
 while(!o.atEnd()){
  i=o.item();
  j=i.indexOf('=');//if((j=i.indexOf('='))!=-1)
  WinEnvironment[i.slice(0,j)]=i.substr(j+1);	//	value以';'作為分隔，若有必要可使用.split(';')
  o.moveNext();
 }

 //	http://www.microsoft.com/japan/msdn/library/ja/script56/html/wsprospecialfolders.asp	HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
 //	VB中用For Each .. In可列舉出全部，但JS則不行-_-所以得自己列舉
 // fso.GetSpecialFolder( 0: Windows 文件夾 1: System 文件夾 2: Temp 文件夾 )
 setObjValue('SpecialFolder','AllUsersDesktop,AllUsersStartMenu,AllUsersPrograms,AllUsersStartup,AppData,Desktop,Favorites,Fonts,MyDocuments,NetHood,PrintHood,Programs,Recent,SendTo,StartMenu,Startup,Templates');
 o=WshShell.SpecialFolders;
 for(i in SpecialFolder)SpecialFolder[i]=o(i);
 for(i=0;i<o.Count();i++)SpecialFolder[i]=o.item(i);

 o=new ActiveXObject("WScript.Network");//WScript.CreateObject("WScript.Network");
 //	http://msdn.microsoft.com/library/en-us/script56/html/wsmthenumprinterconnections.asp
 Network.ComputerName=o.ComputerName,Network.UserDomain=o.UserDomain,Network.UserName=o.UserName;
 //	Network Drive & Printer mappings
 j=o.EnumNetworkDrives(),k=1;
 for(i=0;i<j.Count();i+=2)NetDrive[j.Item(i)?j.Item(i):'Volatile'+k++]=NetDrive[i/2]=j.Item(i+1);
 j=o.EnumPrinterConnections(),k=1;
 for(i=0;i<j.Count();i+=2)NetPrinter[j.Item(i)]=NetPrinter[i/2]=j.Item(i+1);
}	//	function getEnvironment()




//	VB的Nothing
function VBNothing(){
 try{
  var rs=new ActiveXObject("ADODB.RecordSet");
  return rs.ActiveConnection;
 }catch(e){}
}

//	VB的array
function VBA(vba){
 try{return new VBArray(vba).toArray();}catch(e){return [];}
}

//	SafeArrayToJSArray: plaese use new VBArray()	http://www.microsoft.com/japan/msdn/japan/msdn/library/ja/script56/html/js56jsobjvbarray.asp
//	VB的SafeArray	JScriptの配列は実際にはCSV文字列だったりする。VBScriptのvartypeに食わせると8(VT_STRING)が返ってくることからもわかる。
function JSArrayToSafeArray(ar){
 if(typeof ar!='object')ar=[ar];
 var i=0,dic=new ActiveXObject("Scripting.Dictionary");
 for(;i<ar.length;i++)dic.add(i,ar[i]);
 return dic.items();
}




/*	http://www.eggheadcafe.com/forumarchives/scriptingVisualBasicscript/Mar2006/post26047035.asp
	Application.DoEvents();
*/
function DoEvents(){
 //Triggers screen updates in an HTA...
 try{
  if(!DoEvents.w)DoEvents.w=typeof WshShell=='object'?WshShell:new ActiveXObject("WScript.Shell");
  DoEvents.w.Run("%COMSPEC% /c exit",0,true);
 }catch(e){}
}
var DoNothing=DoEvents;

function Sleep(_sec){
 if(isNaN(_sec)||_sec<0)_sec=0;
 if(typeof WScript=='object')try{WScript.Sleep(_sec*1e3);}catch(e){}	//	Win98的JScript沒有WScript.Sleep
 else //if(typeof window!='object')
  try{
   if(!Sleep.w)Sleep.w=typeof WshShell=='object'?WshShell:new ActiveXObject("WScript.Shell");
   Sleep.w.Run(_sec?"%COMSPEC% /c ping -n "+(1+_sec)+" 127.0.0.1>nul 2>nul":"%COMSPEC% /c exit",0,true);
  }catch(e){}
}





/*	送key到application	http://msdn.microsoft.com/library/en-us/script56/html/wsmthsendkeys.asp
	SendKeys('a')	送a
	SendKeys("a{1}4{2}5");	送a,等1/10s,送4,等2/10s,送5
	timeOut:	<0:loop, 0 or not set:1 time, >0:be the time(ms)
*/
var SendKeysU;
SendKeys[generateCode.dLK]='Sleep';
function SendKeys(keys,appTitle,timeOut,timeInterval){
 if(typeof WshShell!='object'||typeof WshShell!='object'&&typeof(WshShell=new ActiveXObject("WScript.Shell"))!='object')return 1;
 if(isNaN(timeInterval)||timeInterval<1)timeInterval=100;	//	時間間隔
 timeOut=timeOut?timeOut<0?-1:Math.floor(timeOut/timeInterval)+1:0;
 if(appTitle)
  while(!WshShell.AppActivate(appTitle))
   if(timeOut--)Sleep(timeInterval);else return 2;
 if(!SendKeysU)SendKeysU=100;	//	時間間隔單位
 while(keys.match(/\{([.\d]+)\}/)){
  WshShell.SendKeys(keys.substr(0,RegExp.index));
  Sleep(SendKeysU*RegExp.$1);
  keys=keys.substr(RegExp.lastIndex);
 }
 return WshShell.SendKeys(keys);
}




// Create an object reference: hack?!
//var windows=new WScript();
// Run the calculator program
//windows.explorer.run('calc.exe');
// Writing the local computer name to the screen
//document.write(windows.network.computerName);
// Copy files from one folder to another
//windows.fileSystem.copyFile('c:\\mydocuments\\*.txt', 'c:\\tempfolder\\');





return (
	CeL.OS.Windows
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'OS.Windows.WMI';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * Windows.WMI test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.OS.Windows.WMI = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();





//	WMI set	==================

/*	2007/5/22 23:34:43
	WMI: Windows Management Instrumentation
	http://www.codecomments.com/archive298-2004-5-203306.html
	http://msdn2.microsoft.com/en-us/library/Aa394616
	http://msdn2.microsoft.com/en-us/library/aa389290.aspx
	http://msdn2.microsoft.com/en-us/library/aa389763.aspx
	http://msdn2.microsoft.com/en-us/library/aa393854.aspx	SWbemServices
	http://msdn2.microsoft.com/en-us/library/ms525320.aspx
	http://www.serverwatch.com/tutorials/article.php/1476831
	http://www.serverwatch.com/tutorials/article.php/1476861
	http://www.serverwatch.com/tutorials/article.php/1476871
	http://www.serverwatch.com/tutorials/article.php/1476941

string moniker:
	[[/root/]cimv2:][from[.v]]	[/|\\]root[/|\\]

object moniker:
{
	prefix:'WinMgmts:',	//	moniker prefix
	security:'{impersonationLevel=impersonate}!',
	computer:'.',	//	Computer string(localhost '.')
	p:'cimv2',	//	'/root/' will auto added
	path:'/root/cimv2',	//	Namespace e.g., \root\default

	from:,	//	select from ~
	where:,	//	select from where ~	** You MUST check the string yourself!! This function won't do it!
	v:,	//	value to get
	value:,	//	value used in moniker

	flag:48,	//	flag to call SWbemServices.ExecQuery Method
}

	prefix+security+computer+path+':'+from+'='+value	http://msdn2.microsoft.com/en-us/library/aa389292.aspx

TODO:
多次呼叫最佳化
*/
function getWMIData(moniker,func){	//	moniker, for each do function
 var i,oWMIS,_m={
	prefix:'WinMgmts:'
	,security:'{impersonationLevel=impersonate}!'
	,computer:'.'
	,p:'cimv2'
	,path:''
	,from:''
	,value:''
	,v:''
	,flag:48	//	32: wbemFlagForwardOnly + 16: wbemFlagReturnImmediately
 };
 if(!moniker)moniker='';
 if(typeof moniker=='string'){
  //	parse moniker
  _m.from=moniker;
  //	取得path
  if(i=_m.from.match(/^([^:]+):([^\/\\]*)$/)){
   if(/^[\/\\]/.test(i[1]))_m.path=i[1];else _m.p=i[1];
   _m.from=i[2];
  }
  //	取得from[.v]
  if(i=_m.from.match(/^([^.]+)\.(.*)$/))_m.from=i[1],_m.v=i[2];
 }else for(i in moniker)_m[i]=moniker[i];

 //	create object
 try{
  //with(_m)alert(prefix+security+'//'+computer+(path||'/root/'+p)+(value||value===0?':'+from+'='+value:''));
  with(_m)oWMIS=GetObject(prefix+security+'//'+computer+(path||'/root/'+p)
	//+(func||v?'':(from?':'+from+(value||value==0?'':'='+value):''))	//	有func||_m.v時無條件捨棄，到後面再搞。
	+(value||value===0?':'+from+'='+value:'')
	);
  //oLoc=new ActiveXObject("WbemScripting.SWbemLocator");oSvc=oLoc.ConnectServer(sComputer||null,"root\\default");oReg=oSvc.Get("StdRegProv");	//	http://msdn.microsoft.com/library/en-us/wmisdk/wmi/swbemobject_execmethod_.asp
 }catch(e){
  return;
/*	useless?
  try{
   with(new ActiveXObject("WbemScripting.SWbemLastError"))	//	Error Handling
    return {ProviderName:ProviderName,ParameterInfo:ParameterInfo,Operation:Operation,Description:Description};
  }catch(_e){throw e;}
*/
 }
 if(!func&&!_m.from)return oWMIS;

 //	do search
 var oE;
 try{
  //	http://msdn2.microsoft.com/en-us/library/aa393866.aspx
  oE=oWMIS.ExecQuery('Select * From '+_m.from+(_m['where']?' Where '+_m.where:'')
	,'WQL'	//	String that contains the query language to be used. If specified, this value must be "WQL".
	,_m.flag
  );
 }catch(e){
  //	程式庫未登錄。
  //	此時 typeof oWMIS=='object'
  popErr(e,0,'getWMIData: error occurred!');
  //if(438!=(e.number&0xFFFF))return;
  return;	//	return {item:function(){}};	//	or return a object using wbemQueryFlagPrototype
 }
 oE=new Enumerator(oE);	//	wbemFlagForwardOnly:32+wbemFlagReturnImmediately:16
 //if(func)for(;!oE.atEnd()&&!func(oE.item());oE.moveNext());
 if(func)while(!oE.atEnd()&&!func(oE.item()))oE.moveNext();
 else return _m.v||_m.v===0?oE.item()?oE.item()[_m.v]:null:oE;
}

/*	用在將 WMI date 轉成 javascript date, old: WMIDateStringToDate
	http://www.microsoft.com/technet/scriptcenter/resources/qanda/sept04/hey0907.mspx
	http://www.microsoft.com/technet/scriptcenter/resources/qanda/aug05/hey0802.mspx

TODO:
return ms
*/
getWMIData.DateStringToDate=function(t){
 if(!t)return new Date(0);
 var m=(''+t).match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\.\d+)?([+ \-]\d+)?$/);
 //	http://msdn2.microsoft.com/en-us/library/474de325.aspx
 return m?new Date(m[1],m[2]-1,m[3],m[4],m[5],m[6],m[7]*1e3):t;	//	locale會自己調整
};

/*	用在取得 WMI object 之 property
	http://www.activexperts.com/activmonitor/windowsmanagement/adminscripts/other/wmi/
	http://msdn.microsoft.com/en-us/library/aa393741%28VS.85%29.aspx
*/
getWMIData.getProperties=function(o,is_VBA,is_Date){
 var oP=new Enumerator(o.Properties_),ph={},p;
 while(!oP.atEnd()){
  o=p=oP.item();
  //	自動別日期
  if(typeof p=='object' && /^\d{14}(\.\d+)?([+ \-]\d+)?$/.test(''+p))
   p=this.DateStringToDate(p);
  //	自動別 VBA
  else if(typeof p=='unknown')
   //	from VBA()
   try{p=new VBArray(p).toArray();}catch(e){}
  ph[o.Name]=p;
  oP.moveNext();
 }

 //o=[];for(p in ph)o.push(p+': '+ph[p]);sl(o.join('\n'));
 return ph;
};



/*	cause error!	requires Windows 2003 DNS
	http://forums.devshed.com/dns-36/dns-through-wmi-in-net-140427.html
	http://www.activexperts.com/activmonitor/windowsmanagement/scripts/networking/dns/server/
	http://www.113317.com/blog/article.asp?id=543
	http://blogs.msdn.com/mpoulson/archive/2006/05/10/594950.aspx
	http://www.ureader.com/message/3258511.aspx
	http://www.scriptinganswers.com/forum/forum_posts.asp?TID=516&PID=3124
if(0){
 var qHost='213.22.211.in-addr.arpa',qIP=getWMIData({p:'MicrosoftDNS',from:'MicrosoftDNS_PTRType',where:"OwnerName='"+qHost+"'"}).item();
 alert(qIP.RecordData);
}
*/




/*
	http://msdn2.microsoft.com/en-us/library/aa394239.aspx
	http://tech.163.com/05/0406/10/1GL8FUG200091589.html

test:
with(getSysInfo())alert(Caption+' '+CSDVersion+' '+OtherTypeDescription+'(SP '+ServicePackMajorVersion+'.'+ServicePackMinorVersion+') [Version '+Version+']'
	+'\nWindowsDirectory: '+WindowsDirectory
	+'\nSystemDirectory: '+SystemDirectory
	+'\nFreePhysicalMemory: '+turnSI(FreePhysicalMemory)+'/'+turnSI(PhysicalMemory)+'B ('+PhysicalMemory+' bytes)'
	+'\nOSLanguage: '+OSLanguage+' (0x'+hex(OSLanguage)+')'	//	http://msdn.microsoft.com/zh-tw/library/system.globalization.cultureinfo%28VS.80%29.aspx
	+'\nCountryCode: '+CountryCode
	+'\nCodeSet: CP'+CodeSet	//	http://en.wikipedia.org/wiki/Code_page	http://msdn.microsoft.com/en-us/library/dd317756%28VS.85%29.aspx
	+'\nLocale: '+Locale
	+'\nCurrentTimeZone: '+gDate(CurrentTimeZone*60*1000)
	+'\nMUILanguages: '+MUILanguages
	+'\nBootUpTime: '+LastBootUpTime.toLocaleString()
	+'\nLocalDateTime: '+LocalDateTime.toLocaleString()
	+'\n系統運行 Uptime: '+gDate(Uptime)//+' ms'
	+'\n系統 counter: '+Timestamp+' s'
	+'\nCSName: '+CSName
	+'\nRegisteredUser: '+RegisteredUser
);WScript.Quit();
*/

getSysInfo[generateCode.dLK]='getWMIData';
function getSysInfo(){
 var o=getWMIData('Win32_OperatingSystem').item(),r;
 with(o)r={
	Caption:o.Caption.replace(/\s+$/,''),	//	系統
	Name:o.Name,
	CSDVersion:o.CSDVersion,
	ServicePackMajorVersion:o.ServicePackMajorVersion||(isNaN(o.ServicePackMajorVersion)?'':0),
	ServicePackMinorVersion:o.ServicePackMinorVersion||(isNaN(o.ServicePackMinorVersion)?'':0),
	OtherTypeDescription:o.OtherTypeDescription||'',
	Version:o.Version,	//	系統版本

	WindowsDirectory:o.WindowsDirectory,
	SystemDirectory:o.SystemDirectory,

	CSName:o.CSName,
	RegisteredUser:o.RegisteredUser,

	CurrentTimeZone:o.CurrentTimeZone,
	LastBootUpTime:getWMIData.DateStringToDate(o.LastBootUpTime),	//	系統最後一次啟動的時間
	LocalDateTime:getWMIData.DateStringToDate(o.LocalDateTime),
	OSLanguage:o.OSLanguage,
	CountryCode:o.CountryCode,
	CodeSet:o.CodeSet,
	Locale:o.Locale,
	MUILanguages:VBA(o.MUILanguages),

	FreePhysicalMemory:o.FreePhysicalMemory,
	PhysicalMemory:getWMIData('Win32_PhysicalMemory').item().Capacity,

	// ms	http://msdn2.microsoft.com/en-us/library/aa394272.aspx
	Uptime:getWMIData('Win32_PerfFormattedData_PerfOS_System.SystemUpTime')*1e3,	//	maybe null!
	// 顯示系統運行時間(seconds) (NOT Uptime!)	這個運行時間是從性能計數器中獲得的64位整型數，不會出現在49.7天後溢出的情況。	http://www.dx21.com/SCRIPTING/WMI/SUBCLASS.ASP?CID=201
	//	maybe NaN
	Timestamp:getWMIData('Win32_PerfRawData_PerfOS_System.Timestamp_Sys100NS')/getWMIData('Win32_PerfRawData_PerfOS_System.Frequency_Sys100NS')
 };
 //alert(getWMIData('Win32_PerfRawData_PerfOS_System.Timestamp_Sys100NS')+'/'+getWMIData('Win32_PerfRawData_PerfOS_System.Frequency_Sys100NS'));

 if(!r.Uptime)
  r.Uptime=(new Date()-r.LastBootUpTime);

 return r;
}


/*	http://support.microsoft.com/kb/328874/zh-tw
	http://msdn.microsoft.com/en-us/library/aa394520(VS.85).aspx
	http://msdn.microsoft.com/en-us/library/aa390456(VS.85).aspx	http://school.21tx.com/2004/06/16/11568_4.html
	If this method succeeds and the ActivationRequired property is 1 (one), the method returns 0 (zero). Otherwise, the method returns one of the WMI error constants.

TODO:
判別 OS
*/
getWinID[generateCode.dLK]='getWMIData';
function getWinID(pKey){
 var o=getWMIData('Win32_WindowsProductActivation')
	,WshShell=WScript.CreateObject("WScript.Shell");
 if(!o){alert('getWinID: Can not get Win32_WindowsProductActivation!');return;}
 o=o.item();
 if(o.ActivationRequired){
  //	未啟用 Windows 前, 用錯誤序號會出錯
  alert('Activation Required.');
  return;
 }
 if(pKey)try{
  //	SetProductKey: 修改產品金鑰CD-KEY序號, return 0:OK, else error
  var e=o.SetProductKey(pKey.replace(/[\s\-]/g,''));
  if(e)throw e;
 }catch(e){
  alert('Update failed for ['+pKey+']:\n'+e.description);	//	for old version 有可能：無效的操作, 此時需 delete OOBETimer registry value
  //	TODO: delete OOBETimer registry value for XP 2600: 針對非 Windows XP SP1 或較新版 Windows XP 使用，來停用 Windows。
  //WshShell.RegDelete("HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\WPAEvents\\OOBETimer");
 }
 return o.GetInstallationID(pKey);//||pKey;	//	無法以此方法獲得 ID
}

//  ksp:
//alert(getWinID('Q9FDY-483HM-FV6RQ-2YQQQ-FD7J8'));WScript.Quit();

// NTSU
//alert(getWinID('VWPM3-MH7H6-VDDHG-YVR4Y-W38JQ'));WScript.Quit();
//alert(getWinID());

//alert(getSysInfo().Caption)
//WScript.Quit();

/*
http://163.19.54.70/student/SerialNumber.txt	大量授權
Windows XP Professional		VWPM3-MH7H6-VDDHG-YVR4Y-W38JQ
Windows XP Prof, x64 Ed.	FG2Q3-QX4JG-FQMMB-8XXD6-34MRY
Office XP Applications		MXCVH-R3QQG-DMQ2M-KXPVQ-VKD6W
Office XP Suites		PCCKW-J8Y6T-P632P-9KW9P-PK88B
Office 2003 Applications	TF6RQ-TVG9Q-FVV74-GR4CP-2C2MB
Office 2003 Suites		WCMVH-XJGPJ-G9BKC-2KHY9-Y7V36
Office 2007 Applications	FJXGQ-RDQRY-Q2784-D89BP-M4MYJ
Office 2007 Suites		KX3T3-RYFP7-BMPKG-JXTQ2-9HWBJ

DBXYD-TF477-46YM4-W74MH-6YDQ8 (CD)
W2JJW-4KYDP-2YMKW-FX36H-QYVD8 (FILES)

'Microsoft Windows XP Professional 5.1.2600':'VWPM3-MH7H6-VDDHG-YVR4Y-W38JQ'

ksp:
Windows XP Professional		Q9FDY-483HM-FV6RQ-2YQQQ-FD7J8
Windows XP Prof, x64 Ed.	V3PP8-CD446-62H9J-3XHVF-K44F3
Windows Vista 的 KMS 認證方式，請參考	http://www.ks.edu.tw/KSnet_service.html#D
Office XP Suites		F86BJ-8PJWY-4P8QX-89FKF-896DT
Office 2003 Suites		F4RMR-DKBX3-2TV7F-9T8QJ-8MYQ6
Office 2007 Suites		M3JH3-4R8XX-R37F2-8D8H8-CBVD8

高雄市？
Office 2007
W3GCD-YWK98-8F6BG-2CYBY-KVWBJ


以下序號皆為 VLK 大量授權序號：
HCQ9D-TVCWX-X9QRG-J4B2Y-GR2TT
MRX3F-47B9T-2487J-KWKMF-RPWBY
QC986-27D34-6M3TY-JJXP9-TBGMD
CM3HY-26VYW-6JRYC-X66GX-JVY2D
DP7CM-PD6MC-6BKXT-M8JJ6-RPXGJ
F4297-RCWJP-P482C-YY23Y-XH8W3
HH7VV-6P3G9-82TWK-QKJJ3-MXR96



Windows XP Home Edition 
x:
BQFBV-9J43J-663WJ-T2VDY-X86HY
VTDBB-QVPCJ-33J2V-B9KV4-W2PBM
DJH7R-4CYKJ-GWYDC-7MXHJ-X9VJY
3GT36-XXFDW-JC676-P4FBF-2G6MJ
DGDGK-XVXWR-XJHYK-3688K-8HXYJ
CX7DD-4GX4Y-BTTR4-H88Y7-GQPWQ
J22CH-K4V7X-4G6H6-66JFG-737TK
CG3BH-RG63P-6H2MR-3DVPT-6WTXJ 
JPDR8-7X4G9-Q226K-B7VYR-HFHMD
W888Y-WM6YJ-DJQ27-WRB88-7FG96

*/


/*
	Win32_ComputerSystem:
	http://msdn2.microsoft.com/en-us/library/aa394224.aspx

	Win32_NetworkAdapterConfiguration:
	http://msdn2.microsoft.com/en-us/library/aa394217.aspx
	http://www.microsoft.com/china/technet/community/scriptcenter/topics/networking/01_atnc_intro.mspx
	http://www.codeproject.com/vbscript/ipaddress.asp?df=100&forumid=3295&exp=0&select=123580

to use:
IP=getNetInfo().netif[0].IPAddress[0];

test:
with(getNetInfo())alert(UserName+'\n'+Name+'\n'+Workgroup+'\n'+Domain+'\n'+BootupState);

with(getNetInfo(2)){
 alert(UserName+'\n'+Name+'\n'+Domain+'\n'+BootupState+'\nAll '+netif.length+' interfaces get');
 for(i=0;i<netif.length;i++)with(netif[i])
  sl(Caption+'\n'
	+DNSDomain+'\n'
	+DHCPServer+'\n'
	+DNSHostName+'\n'
	+DNSServerSearchOrder+'\n'
	+IPSubnet+'\n'
	+DefaultIPGateway+'\n'
	+IPAddress+'\n'

	+IPEnabled+'\n'
	+DHCPEnabled+'\n'
	+SettingID+'\n'

	+MACAddress
	);
}
WScript.Quit();

*/
getNetInfo[generateCode.dLK]='getWMIData,VBA';
function getNetInfo(type){	//	default type: ip setted interfaces only, 1: all interfaces, 2: 實體 net interfaces(網路卡，無線)
 var r=getWMIData('Win32_ComputerSystem');
 if(!r||!r.item()){alert('Can not get Win32_ComputerSystem!\nIs this old system or the function is limited?');r={};}
 else{
  r=getWMIData.getProperties(r.item());	//	getWMIData({computer:IP||'.',from:'Win32_ComputerSystem'}).item()
  if(!r.Workgroup)r.Workgroup=r.Domain;	//	        Windows 2000 and Windows NT: Workgroup is not available. Domain: If the computer is not part of a domain, then the name of the workgroup is returned.
 }

/*	waste time
 with(getWMIData('Win32_NTDomain').item()){
  r.Caption=Caption,r.Description=Description;
  if(!r.Name)r.Name=Name;
 }
*/

 r.netif=[];
 getWMIData({from:'Win32_NetworkAdapterConfiguration'
	,where:	type===1?''
		:type===2?'MACAddress!=NULL AND (DHCPEnabled=TRUE OR IPEnabled=TRUE)'// OR IPXEnabled=TRUE	//	這判別法不是很好
		:'IPEnabled=TRUE'	//	'NetEnabled=True': Vista only code?
	}
	,function(o){
		//	在DHCP可能得到兩筆同IP之data
		//	MACAddress: getmac.exe, arp -a, nbtstat -a 192.168.0.1
		r.netif.push(getWMIData.getProperties(o));
	}
 );
 return r;
}


//default DNS
setNetInfo.default_DNS = '168.95.1.1';
// http://en.wikipedia.org/wiki/CIDR_notation
setNetInfo.CIDR_notation = 24;

/**
 * 改變網卡的IP地址: change IP, set IP
 * @param to_s	IP or {IP:''||[], Subnet:''||[], DNS:''||[], Gateway:''||[], GatewayOrder:''||[]}
 * @param from	IP or netif No.
 * @since
 * 2009/5/7 0:24:5	加強
 * 2010/3/3 10:41:17	a work version
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/aa394217%28VS.85%29.aspx" accessdate="2010/3/3 13:15">Win32_NetworkAdapterConfiguration Class (Windows)</a>
 * <a href="http://www.yongfa365.com/item/Use-WMi-Change-IP-VBS-yongfa365.html" accessdate="2010/3/3 13:14">通过 WMI 改变网卡的IP地址 ChangeIP.vbs - 柳永法(yongfa365)'Blog</a>
 * <a href="http://www.microsoft.com/technet/scriptcenter/topics/networking/01_atnc_intro.mspx">Automating TCP/IP Networking on Clients: Part 1: Introduction</a>
 * <a href="http://www.dotblogs.com.tw/PowerHammer/archive/2008/03/24/2060.aspx" accessdate="2010/3/3 13:15">使用 WMI 更改IP、子網路遮罩、閘道、DNS - 強力鎯頭 VB BLOG - 點部落</a>
 * Using NetSh.exe (no reboot required): <a href="http://techsupt.winbatch.com/webcgi/webbatch.exe?techsupt/tsleft.web+WinBatch/How~To+Change~Ip~Address.txt" accessdate="2010/3/3 13:12">WWW Tech Support/WinBatch/How To\Change Ip Address.txt</a>
 * @example
 * setNetInfo({IP:'163.16.20.212',Gateway:254});
 * sl(setNetInfo({IP:'163.16.20.30',Gateway:254}));WScript.Quit();
 * @requires	getWMIData,VBA,JSArrayToSafeArray
 */
function setNetInfo(to_s, from) {

	var _f = arguments.callee, r, count = 0, IPA, i = function(ip) {
		if (!(ip instanceof Array))
			if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip = ''+ip))
				ip = [ ip ];
			else
				return;
		return JSArrayToSafeArray(ip);
	};

	if (typeof to_s != 'object' || to_s instanceof Array)
		// treat as IP
		to_s = {
			IP : to_s
		};

	if (!isNaN(to_s.Gateway))
		to_s.Gateway = (to_s.IP instanceof Array ? to_s.IP.join(',') : to_s.IP)
				.replace(/\d+$/, to_s.Gateway);

	if (!('Subnet' in to_s) || !isNaN(to_s.Subnet)) {
		IPA = [];
		r = isNaN(to_s.Subnet) ? _f.CIDR_notation : to_s.Subnet;
		while (r > 7)
			r -= 8, IPA.push(255);
		IPA.push(parseInt('11111111'.slice(0, r) + '00000000'.slice(r), 2));
		while (IPA.length < 4)
			IPA.push(0);
		to_s.Subnet = IPA.join('.');
	}

	//sl('setNetInfo:\n[' + from + '] → [' + to_s.IP + '/' + to_s.Subnet + ']\nGateway: [' + to_s.Gateway + ']\nDNS: [' + ('DNS' in to_s ? to_s.DNS : _f.default_DNS) + ']');
	//return -1;

	to_s.Subnet = i(to_s.Subnet);
	to_s.IP = i(to_s.IP);
	to_s.DNS = i('DNS' in to_s ? to_s.DNS : _f.default_DNS);

	if ((to_s.Gateway = i(to_s.Gateway)))
		if (!to_s.GatewayOrder)
			for (i = 1, to_s.GatewayOrder = [ 0 ], r = to_s.Gateway instanceof Array ? to_s.Gateway.length
					: 0; i < r;)
				to_s.GatewayOrder.push(++i);
		else if (!(to_s.GatewayOrder instanceof Array))
			to_s.GatewayOrder = [ to_s.GatewayOrder ];

	r = -1;
	if (!from)
		from = 0;
	getWMIData(
			{
				from : 'Win32_NetworkAdapterConfiguration',
				//	這判別法不是很好
				where : 'MACAddress!=NULL AND (DHCPEnabled=TRUE OR IPEnabled=TRUE)'// OR IPXEnabled=TRUE
			},
			function(o) {
				//alert('Get if: ' + o.Caption + '\n' + from + ',' + count);
				//	通常我們不會設定無線連線
				if(/wireless/i.test(o.Caption))
					return;

				if (isNaN(from) || from === count++) {
				for (i = 0, IPA = from ? VBA(o.IPAddress) : [ 1 ]; i < IPA.length; i++) {
					if (!from || IPA[i] === from) {
						r = typeof to_s.IP === 'undefined' ? o.EnableDHCP()
								: o
										.EnableStatic(
												to_s.IP,
												typeof to_s.Subnet === 'undefined' ? o.IPSubnet
														: to_s.Subnet)
										|| typeof to_s.Gateway !== 'undefined'
										&& o.SetGateways(to_s.Gateway,
												to_s.GatewayOrder)
										|| typeof to_s.DNS !== 'undefined'
										&& o.SetDNSServerSearchOrder(to_s.DNS);
							//alert('Set if:\n'+o.Caption+'\nto: '+to_s.IP+'\nerrno: '+r)
							//	TODO: error detection
							return 1;
						}
					}
				}
			});

	//	not found / error
	//	http://msdn.microsoft.com/en-us/library/aa390383%28VS.85%29.aspx
	return r;
}



/*	get IP of Windows Host
	http://www.scriptinganswers.com/forum/forum_posts.asp?TID=516&PID=3124
	Wscript.Network

ping:
	http://blog.blueshop.com.tw/hammerchou/archive/2006/07/08/32205.aspx
1.
GetObject("winmgmts:").Get("NetDiagnostics=@").Ping(strAddr, Ping)
2.
objCls = GetObject("winmgmts:\\" & strMachine & "\root\CIMV2").Get("NetDiagnostics")
objInPara = objCls.Methods_("Ping").inParameters.SpawnInstance_()
objInPara.Properties_("sInAddr") = "www.google.com.tw" // 設定 Ping 的位置
// Ping 為 方法 , ExecMethod 為 執行方法 ( 把參數送入執行 )
objOutPara = objWMIsvc.ExecMethod("NetDiagnostics=@", "Ping", objInPara)
// 取回輸出參數 ( Ping 的結果 ): objOutPara.ReturnValue = True 則 Ping 成功 , 反之則失敗
objOutPara.sOutArg


test:
var h='Public',ip=getIPofHost(h);alert(ip?h+':\n'+ip:'Computer [\\'+h+'] is unreachable!');

*/
getIPofHost[generateCode.dLK]='getWMIData';
function getIPofHost(h){
 var qIP=getWMIData({from:'Win32_PingStatus',where:"Address='"+h+"'"}).item();
 if(!qIP.StatusCode&&qIP.StatusCode!=null)return qIP.ProtocolAddress;
}

//	終止進程	http://msdn2.microsoft.com/en-us/library/aa393907.aspx
killProcess[generateCode.dLK]='getWMIData';
function killProcess(n,isPID){
 var k=0;
 if(typeof isPID=='undefined')isPID=!isNaN(n);
 getWMIData('Win32_Process',function(p){
  with(p)if(isPID)
   if(ProcessId==n){Terminate();k=1;return 1;}
   else if(Caption==n)Terminate(),k++;
 });
 return k;
}


/*	列舉進程	http://msdn2.microsoft.com/en-us/library/aa394372.aspx

test:
alert(getProcess()['explorer.exe'].CommandLine);
for(i=0,p=getProcess();i<p.length;i++)with(p[i])
 alert(i+' / '+p.length+'\n['+ProcessId+'] '+Caption+(Name==Caption?'':' ('+Name+')')+'\n'+(Description==Caption?'':Description+'\n')+CSName+'\n'
	+'Open files: '+HandleCount+'\n'
	//+OSName+'\n'
	+'memory: '+MinimumWorkingSetSize+'-'+MaximumWorkingSetSize+'\n'	//	memory pages visible to the process in physical RAM
	+'Time in kernel mode: '+KernelModeTime+' ms\n'+ExecutablePath+'\n'+CommandLine+'\n'+CreationDate.toLocaleString()
	);
*/
getProcess[generateCode.dLK]='getWMIData';
function getProcess(){
 var r=[];
 getWMIData('Win32_Process',function(p){with(p)r[Caption]=r[r.push({
	ProcessId:ProcessId,
	Caption:Caption,
	ExecutablePath:ExecutablePath,
	CommandLine:CommandLine,
	Name:Name,	//	==Caption
	Description:Description,	//	==Caption
	CSName:CSName,
	HandleCount:HandleCount,
	OSName:OSName,
	MinimumWorkingSetSize:MinimumWorkingSetSize,
	MaximumWorkingSetSize:MaximumWorkingSetSize,
	KernelModeTime:p.KernelModeTime/1e5,	//	100000ms
	CreationDate:getWMIData.DateStringToDate(CreationDate)
 })-1]});
 return r;
}



/*	列舉服務
	http://msdn2.microsoft.com/en-us/library/aa394418.aspx
	http://www.microsoft.com/taiwan/technet/scriptcenter/topics/vista/indexer.mspx

test:
alert(getService()['Event Log'].Description);
for(i=0,s=getService();i<s.length;i++){t=i+' / '+s.length;for(j in s[i])t+='\n'+j+': '+s[i][j];alert(t);}
*/
//getService[generateCode.dLK]='getWMIData';
function getService(){
 var r=[];
 getWMIData('Win32_Service',function(s){with(s)r[Caption]=r[r.push({
	AcceptPause:AcceptPause,
	AcceptStop:AcceptStop,
	Caption:Caption,
	Description:Description,
	DisplayName:DisplayName,
	ExitCode:ExitCode,
	InstallDate:getWMIData.DateStringToDate(InstallDate),
	Name:Name,
	Pathname:Pathname,
	ProcessId:ProcessId,
	ServiceSpecificExitCode:ServiceSpecificExitCode,
	Started:Started,
	StartMode:StartMode,
	StartName:StartName,
	State:State,
	Status:Status,
	SystemName:SystemName
 })-1]});
 return r;
}


/*	http://msdn.microsoft.com/en-us/library/bb774148.aspx
WinShell.ShellExecute(appName, appArgs, appPath, "", 0);	http://msdn.microsoft.com/en-us/library/bb774148.aspx
Private Declare Function ShellExecute Lib "shell32.dll" Alias "ShellExecuteA" (ByVal hwnd As Long, ByVal lpOperation As String, ByVal lpFile As String, ByVal lpParameters As String, ByVal lpDirectory As String, ByVal nShowCmd As Long) As Long
<object runat="server" id="WinShell" scope="page" classid="clsid:13709620-C279-11CE-A49E-444553540000"></object>
<object runat="server" id="fso" scope="page" classid="clsid:0D43FE01-F093-11CF-8940-00A0C9054228"></object>

http://windowssdk.msdn.microsoft.com/en-us/library/ms630425.aspx
WinShell.ShutdownWindows();	//	Open the Shutdown dialog	http://www.robvanderwoude.com/index.html
*/


/*	2008/8/8 18:29:44
	run them with administrator rights	runs under administrator privileges.
帳戶控制	Windows Vista：使用軟體限制原則對抗未授權的軟體	http://www.microsoft.com/taiwan/technet/windowsvista/security/rstrplcy.mspx
http://4sysops.com/archives/vista%E2%80%99s-uac-how-to-elevate-scripts-vbscript-and-jscript/
http://blogs.msdn.com/aaron_margosis/archive/2007/07/01/scripting-elevation-on-vista.aspx
Software\Microsoft\Windows\CurrentVersion\Policies\System\EnableLUA	c:\windows\system32\control.exe /name Microsoft.UserAccounts	http://www.dashken.net/index.php?/archives/280-VBScript-Check-if-OS-is-Vista-and-Vistas-UAC-status.html
http://msdn.microsoft.com/en-us/magazine/cc163486.aspx
HKEY_LOCAL_MACHINESOFTWARE MicrosoftWindowsCurrentVersionPoliciesSystem\ConsentPromptBehaviorAdmin	http://hsu.easynow.com.tw/index.php?load=read&id=28
http://vistavitals.blogspot.com/2008/02/logon-scripts-token-effort.html
runas	http://www.merawindows.com/Forums/tabid/324/forumid/82/postid/32458/scope/posts/Default.aspx
	http://www.winhelponline.com/articles/185/1/VBScripts-and-UAC-elevation.html

http://forums.techarena.in/vista-security/654643.htm
Set objShell = CreateObject("Shell.Application")
Set objFolder = objShell.Namespace("C:\")
Set objFolderItem = objFolder.ParseName("myhta.hta")
objFolderItem.InvokeVerb "runas"

var WinShell=new ActiveXObject("Shell.Application"),p=location.pathname.replace(/[^\\]+$/,''),o=WinShell.Namespace(p).ParseName(location.pathname.slice(p.length));
o.InvokeVerb("runas");

http://www.zaoxue.com/article/tech-28339_2.htm	http://www.lob.cn/vbs/20071126203237.shtml

TODO:
對 prompt 回應不允許時的處理: 若想在受限的情況下使用?
不使用自訂程式	http://msdn.microsoft.com/en-us/library/bb776820(VS.85).aspx
*/
function runas(p){
 if(!p)p=typeof WScript=='object'?WScript.ScriptFullName:unescape(location.pathname);
 var a={js:'wscript.exe',vbs:'wscript.exe',hta:'mshta.exe'},ext=p.match(/([^.]+)$/);
 a=ext&&(ext=ext[1].toLowerCase(),ext in a)?a[ext]:'';
 //	判斷是否有權限
 if(!registryF.checkAccess('HKLM\\SOFTWARE\\')){
  //	以管理者權限另外執行新的	It will get the UAC prompt if this feature is not disabled.
  new ActiveXObject("Shell.Application").ShellExecute(a||p,a?p:'','','runas'/*,5*/);
  //	執行完本身則退出
  if(typeof WScript=='object')WScript.Quit();else if(typeof window=='object')window.close();
 }
}


/*	JScript file: check owner, .exe file
	http://www.microsoft.com/taiwan/technet/scriptcenter/resources/qanda/nov04/hey1115.mspx
	Exec Method (Windows Script Host)	http://msdn.microsoft.com/en-us/library/ateytk4a(VS.85).aspx

usage:
runProg(path): use WshShell.Exec, return [StdOut, StdErr, ExitCode]
runProg(path, 1): use WshShell.Exec, can get output by .StdOut.ReadAll(), or .StdErr.ReadAll()
runProg([path, WindowStyle, WaitonReturn],2): use WshShell.Run
runProg(script path, remote computer): use WshRemote
runProg(path, remote computer): use WMI

TODO:
runProg([path, Verb],3): use Shell.Application InvokeVerb
runProg([path, arg1, arg2,..]): use Shell.Application.ShellExecute


example:
WScript.Echo(runProg('%COMSPEC% /U /c ""C:\\Program Files\\WinRAR\\Rar.exe" vt -scuc "F:\\CLAMP 01.rar""')[0]);


WshShell.Run(command, [WindowStyle 0-10], [WaitonReturn false: nowait & return 0, true: wait & return error code])
WshShell.Exec(),objFolderItem.InvokeVerb()
WshShell.Run('command /k ' + ドライブ +' | cd /D '+ パス);// cd で他ドライブへ移れないので。
*/
//runProg[generateCode.dLK]='initWScriptObj';
function runProg(p,r){try{
 var s;
 if(!r||r===1||r===2)if(typeof (s=new ActiveXObject('WScript.Shell'))=='object'){
  if(typeof p=='object'&&r===2)
   r=s.Run(p[0],p[1],p[2]);
  else if(s=s.Exec(p),r)r=s;
  else with(s){
   while(!Status)WScript.Sleep(80);
   r=[StdOut.ReadAll(),StdErr.ReadAll(),ExitCode];
  }
  return r;
 }else return;

 if(/^[^ ]+\.(j|vb)s$/i.test(p)){
  s=(WScript.CreateObject('WSHController')).CreateScript(p,r);
  s.Execute();
  return s;
 }

 s=GetObject("winmgmts:{impersonationLevel=impersonate}//"+(r||'.')+"/root/cimv2:Win32_Process");
 //if(/^[^ ]+\.(j|vb)s$/i.test(p))p="wscript.exe "+p;
 return s.Create(p/*,null,null,intProcessID*/);	//	Create 方法會讓這個指令碼在「遠端電腦」上執行。
}catch(e){
 //popErr(e);
 return e;
}}	//	function runProg



/*	shutdown/reboot computer	2007/5/8-9 0:8:52
	http://www.robvanderwoude.com/index.html
	http://www.ericphelps.com/batch/samples/reboot.txt

	http://www.semcase.com/docus/iis/prog_wmi_tut_03_01.htm	http://www.semcase.com/docus/iis/iis.htm
	http://support.microsoft.com/kb/913538	當您使用會讓列舉程式物件在 Microsoft Windows Server 2003 或 Microsoft Windows XP 用戶端電腦上進行內部複製的 Windows Management Instrumentation (WMI) 功能時，列舉程式物件於用戶端電腦尚未完成使用列舉程式物件的動作時，即遭取消。此外，WMI 功能還可能傳回錯誤碼。

mode:
0	poweroff (if supported by the hardware)
null,1	reboot
	restart
	logoff
	shutdown
	suspend, sleep, hibernate
	lock
//	standby	http://www.tutorials-xe.com/SCRIPTING/Restart-service/
16	force

	open the shutdown dialog

time: seconds
*/
var shutdownF;
setObjValue('shutdownF','poweroff,reboot,restart,logoff,shutdown,suspend,lock,force=16,dialog=32',1);
shutdown[generateCode.dLK]='initWScriptObj,shutdownF,Sleep';
function shutdown(mode,time/*,message*/){
 if(isNaN(mode))mode=shutdownF.reboot;

 var f,sComputer="."
	,_s,s=function(t){
		if(t)return _s;
		if(time&&!_s)Sleep(time);
		_s=1;
	}
	,force=mode&shutdownF.force
	,sF=function(a){f={};for(i=0;i<a.length;i+=2)f[a[i]]=a[i+1];}
	,oWMIS
	;

 if((mode-=force)==shutdownF.dialog)try{
  s();
  WinShell.ShutdownWindows();
  return;
 }catch(e){}

 // way 1: WMI
 sF([0,0,shutdownF.logoff,0,shutdownF.shutdown,1,shutdownF.reboot,2,shutdownF.force,4,shutdownF.poweroff,8]);
 if(mode in f)try{	//	f.hasOwnProperty(mode)
  f=f[mode]&f[force];
  oWMIS=new Enumerator(
	 GetObject("winmgmts:{impersonationLevel=impersonate,(Shutdown)}//"+(sComputer||'.')+"/root/cimv2")
	 .ExecQuery("Select * from Win32_OperatingSystem")//Select * from Win32_OperatingSystem Where primary=true
	);
  if(!oWMIS)throw 1;
  s();
  for(;!oWMIS.atEnd();oWMIS.moveNext()){
   //oWMIS.item().Reboot();//.Shutdown();	//	force!
   oWMIS.item().Win32Shutdown(f);//if()	//	http://msdn2.microsoft.com/en-us/library/aa394058.aspx
  }
  return;
 }catch(e){}
 // way 2: RUNDLL32 SHELL32.DLL, SHExitWindowsEx [n]
 if(mode in f)try{WshShell.Run(" RUNDLL32 SHELL32.DLL,SHExitWindowsEx "+f[mode]);return;}catch(e){}

 // way 3: shutdown.exe utility
 sF([shutdownF.logoff,'l',shutdownF.poweroff,'s',shutdownF.shutdown,'s',shutdownF.reboot,'r',shutdownF.dialog,'i']);
 if(mode in f)try{WshShell.Run('%windir%\System32\shutdown.exe -'+f+(!time||s(1)?'':' -t '+time)+(force?' -f':''));return;}catch(e){}	//	-s or -r

 // way 4: rundll.exe
 sF([shutdownF.logoff,'SHELL.DLL,RestartDialog',shutdownF.poweroff,'USER.EXE,ExitWindows',shutdownF.shutdown,'USER.EXE,ExitWindows'/*'USER.EXE,#7'||'USER.EXE, #7'||'USER.EXE,#7 0'*/,shutdownF.restart,'USER.EXE,ExitWindowsExec'/*'USER.EXE,#246'*/]);
 if(mode in f)try{WshShell.Run("rundll.exe "+f[mode]);return;}catch(e){}

 // way 5: rundll32.exe
 sF([shutdownF.poweroff,'KRNL386.EXE,exitkernel',shutdownF.shutdown,'USER.EXE,ExitWindows',shutdownF.suspend,'PowrProf.dll,SetSuspendState']);
 if(mode in f)try{WshShell.Run("rundll32.exe "+f[mode]);return;}catch(e){}
 // way 6: RUNDLL32 USER32.DLL
 sF([shutdownF.lock,'LockWorkStation',shutdownF.logoff,'ExitWindowsEx']);
 if(mode in f)try{WshShell.Run("rundll32.exe user32.dll,"+f[mode]);return;}catch(e){}

 // way 7: RUNONCE.EXE	runonce.exe是微軟Run Once的包裝。它用於第三方應用程序的安裝程序。它允許安裝程序添加到啟動項中，用於再次啟動後，進行進一步配置。
 if(mode==shutdownF.reboot)try{WshShell.Run("RUNONCE.EXE -q");return;}catch(e){}

 return 1;
}


//	↑WMI set	==================







//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'OS.Windows';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;



/**
 * Windows test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.OS.Windows = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();










//	有關安裝的部分
function install(dir){//move files: input base dir
 var f,d,i=0,s=0,c=0,l=getResource("filelist").split(/[\r\n]+/);//.replace(/[\r\n]+/g,"\n").split('\n')
 for(;i<l.length;i++)if(l[i]&&l[i].charAt(0)!='#'&&(f=l[i].split('\t'))){
  d=turnToPath(f[1]),f=f[0],d=d?isFolder(d)?(isFolder(d)==2?dir:'')+d+f:d:dir+f;
  if(f)if(c++,d=mv(f,d))pErr(d);else s++;
  else if(d)pLog('フォルダ '+d+' の作成を'+(isFolder(d,1)?'成功':'失敗')+'した');
 }
 if(c)pLog(s+"/"+c+"filesの移動に成功した");
}

function rmProg(){
 if(typeof getResource=='undefined')return;
 var i=0,f,l=getResource("proglist").split(/\r\n/);//.replace(/[\r\n]+/g,"\n").split('\n')
 for(;i<l.length;i++)if(l[i]&&(f=l[i].split('\t')[0]))try{fso.DeleteFile(f);}catch(e){}
}


//	先決條件測試@.js主檔，當沒問題時return 0。此函數若使用到function.js之(其他)功能需include入！
//	include:getScriptName(),mergeScript()
function preCheck(argumentCount,ver,mFN){	//	argument數,最低版本,若ver<5.1時合併檔名
 var SN=getScriptName(),WshShell=WScript.CreateObject("WScript.Shell");
 if(!argumentCount)argumentCount=0;

 if(!WScript.Interactive){
  WshShell.Popup('This program must run in interactive mode!\n此程式需執行於互動模式！',0,SN,48);
  return 5;
 }
 if(WScript.Arguments.length>argumentCount){
  if(typeof WScript.Arguments.ShowUsage=='unknown'||WScript.Arguments.ShowUsage)WScript.Arguments.ShowUsage();
  else WshShell.Popup('Error arguments!\n引數錯誤！',0,SN,16);
  return 6;
 }//else if(2==WshShell.Popup("此程式應用於帳目處理。",0,"確定執行？",1+64))return 4;
 //	以上可置於.wsf中。

 if(!ver||ver<5)ver=5;if(!mFN)mFN='process';
 if(typeof checkVer=='function')checkVer(ver);	//	5.1起才能用.wsf(windows script file)控制
 else if(WScript.Version>5){WshShell.Popup('請執行 '+SN+'.wsf 檔！',0,SN+': 不是執行這個檔喔！',48);return 7;}
 else if(mergeScript(mFN+'.js')){WshShell.Popup('合併檔案失敗！',0,SN,16);return 8;}
 else{
  try{fso.CopyFile(SN+'.ini',mFN+'.ini');}catch(e){}	//	copy .ini
  WshShell.Popup('請設定好 '+mFN+'.ini，\n之後您可試試 '+mFN+'.js 檔，但並不一定能順利執行。',0,SN+': 使用的版本過舊！',48);return 9;
 }

 return 0;
}



/*	2009/6/18 20:46:1
	更新功能 update function

可以嘗試將 for_check 合在 install_url 中。

*/

Update[generateCode.dLK]='getU,getFN,simpleWrite';	//	,Debug_for_include,gDate

function Update(for_check,install_url){
 var _f=arguments.callee;
 return _f.check(_f.setup(for_check,install_url));
}

//	base function

Update.check=function(force){
 if(!this.URL)return;

 if(force||!this.version){
  var d=this.parse(getU(this.URL)||'');
  this.version_get=d;
  //sl('Update.check: version get: ['+this.version_get+']');
 }
 return this.version=[this.version_get,this.version_now,this.URL];
};

Update.set_URL=function(for_check,install_url){
 var unchang=1;
 if(for_check){
  if(unchang)
   unchang= this.URL==for_check;

  //sl('Update.set_URL: 設定檢測 URL: <a href="'+for_check+'">'+for_check+'</a>');
  this.URL=for_check;
 }
 if(install_url){
  if(unchang)
   unchang= this.download_URL==install_url;

  //sl('Update.set_URL: 設定程式下載 URL: <a href="'+install_url+'">'+install_url+'</a>');
  this.download_URL=install_url;
 }
 return !unchang;
};

/*
TODO:
date 相同時比較大小
*/
Update.up_to_date=function(){
 return 0>=this.compare(this.version_now,this.version_get);
};

Update.install=function(){
 var p=getFN(decodeURI(location.pathname)),t=p+'.new',b=p+'.old',f=this.after_install;
 //sl('Update.install: program path: ['+p+']');
 if(this.download(t)){
  try{fso.DeleteFile(b);}catch(e){}
  try{
   fso.MoveFile(p,b);
   fso.MoveFile(t,p);
  }catch(e){f&&f(e,p,t);return;}
  f&&f();
  return 1;
 }
};

Update.check_string='check_string';
Update.download=function(to_where){
 //sl('Update.download: download [<a href="'+this.download_URL+'">'+this.download_URL+'</a>] to ['+to_where+']');
 var data=getU(this.download_URL),f=this.after_download;
 if(data&&(!this.check_string||data.indexOf(this.check_string)!=-1)){
  simpleWrite(to_where,data,TristateTrue);
  f&&f(0,data);
  return data;
 }else f&&f(1,data);
};


//	default user function
Update.setup=function(for_check,install_url){
 var v=document.getElementById('version');
 if(v)v=v.innerHTML.replace(/[\s\n]+$|^[\s\n]+/g,'');
 this.version_now=new Date(v||document.lastModified);
 //sl('Update.setup: version now: ['+this.version_now+']');

 return this.set_URL(for_check,install_url);
};

Update.parse=function(version_data){
 return new Date(version_data||0);
};

Update.compare=function(v1,v2){
 //sl('Update.compare: ['+v2+'] - ['+v1+'] = '+(v2-v1));
 return v2-v1;
};

Update.after_install=function(e,prog,tmp){	//	e: Error object
 if(e){err(e);err('Update.install: 無法替換程式檔 ['+prog+']。新的程式檔置於 ['+tmp+']。');}
 else sl('更新完畢。'),warn('您需要<b onclick="history.go(0);">重新讀取</b>以完成更新！');
};

Update.after_download=function(e,data){	//	e: error code
 if(e)err('Update.download: 下載 [<a href="'+this.download_URL+'">'+this.download_URL+'</a>] 發生錯誤！');
};



/*	讀入單行 item=value 之設定
	!noComment: '#', ';' 起頭、// 之後及 / *..* / 之間將被省略
*/
function parseData(s,noComment){
 if(!s/*||s.charAt(0)=='#'*/ || !noComment&&!(s=s.replace(/([#;]|\/\/).*$/g,'')))return;	//	去掉單行註解
 var t,c,r,i=1;
 if(t=s.match(/\s*\[(.*)\]/))return t[1];	//	分區

 try{	//	沒合在一起是為了在較低版本中r之設定可能失敗
  r=new RegExp('^\\s*([^=]+)\\s*=\\s*([^\\r\\n]*)');
  t=s.match(r);
 }catch(e){t=s.match(/^\s*([^=]+)\s*=\s*([^\r\n]*)/);}	//	使用此式可能導致某些問題

 if(t){//if(t=s.match(/^\s*([^=]+?)\s*=\s*([^\r\n]*)/)){	//	後面的：原先簡潔版
  if(!t[1])return;
  var set=[];set[0]=t[1].replace(/\s+$|^\s+/g,''),t=set[1]=t[2];
  while((c=t.charAt(0))=='"'||c=="'"){
   if(!(c=t.match(new RegExp('^'+c+'([^'+c+']*)'+c+'[^\'"]*(.*)$'))))break;
   //alert('['+set[0]+']=\n'+t+'\n'+c[1]+'\n['+c[2]+']');
   set[i++]=c[1];
   t=c[2];//if(c=t.match(/^\s+/))t=t.substr(c.length);
   //alert('['+t+']');
  }
  return set;
 }
}

/*	readin .ini file
	http://en.wikipedia.org/wiki/Ini_file
*/
parseINI[generateCode.dLK]='initWScriptObj,parseData,ForReading,TristateUseDefault';
function parseINI(FN,format,INIunBlock,noComment){
 var INI={},datas;	//	設定值之陣列,未框起（設定區塊）之值
 if(!INIunBlock)INIunBlock='[unBlock]';	//	未框起（設定區塊）之值
 INI[INIunBlock]={};
 try{
  datas=fso.OpenTextFile(FN,ForReading,false,format||TristateUseDefault);
 }catch(e){}	//	不用openTemplate()：當找不到此.ini檔時pass而不顯示error
 if(!datas){
  //if(!INI)INI=[],INI[block=INIunBlock]=[];return 1;
  //alert('Cannot open:\n'+FN);
  return 0;
 }

 var i,j,index,k,t,block,inC=false;	//	index,temp,區塊,於註解中(in comment)
 //INI=[],INI[block=INIunBlock]=[];	//	每次執行即重設
 while(!datas.AtEndOfStream)if(t=datas.ReadLine()){
  if(!noComment){
   t=t.replace(/\/\/.*/,'');	//	處理/*..*/前先處理//
   k=1;
   while(k){
    k=0;	//	.replace(/\/\*.*?\*\//g,'') 在 ver5 前會出現錯誤
    //if(!inC&&(i=t.indexOf('/*'))!=-1)if((j=t.indexOf('*/',i+2))==-1){inC=true,t=t.slice(0,i);break;}else k=1,t=t.slice(0,i)+t.substr(j+2);
    if(!inC&&(i=t.indexOf('/*'))!=-1){	//	處理註解 /*
     j=i+2;
     do{j=t.indexOf('*/',j);if(t.charAt(j-1)=='\\')j+=2;else break;}while(j!=-1);	//	預防「\*/」
     if(j==-1){inC=true,t=t.slice(0,i);break;}else k=1,t=t.slice(0,i)+t.substr(j+2);
    }
    //if(inC)if((i=t.indexOf('*/'))==-1)t='';else inC=false,t=t.substr(i+2),k=1;
    if(inC){	//	處理*/
     i=0;
     do{i=t.indexOf('*/',i);if(t.charAt(i-1)=='\\')i+=2;else break;}while(i!=-1);	//	預防「\*/」
     if(i==-1)t='';else inC=false,t=t.substr(i+2),k=1;
    }
   }
  }
  //if(!t)continue;alert(t);
  t=parseData(t,noComment);if(!t)continue;
  if(typeof t=='string'&&!INI[block=t])INI[block]={};
  else if(t.length==2)INI[block][t[0]]=t[1];
  else for(i=1,INI[block][t[0]]=[];i<t.length;i++)INI[block][t[0]].push(t[i]);//,alert(block+','+t[0]+','+t[i])
  //if(t[0])alert('INI['+block+']['+t[0]+']='+INI[block][t[0]]);else alert('block='+block);
 }

 datas.Close();
 return INI;
}




/*
	Scriptlet.Typelib對象的設計用途是幫助您創建“Windows 腳本組件”（實質上，這是一種使您編寫的腳本可以像COM對象那樣工作的方法）。
	http://www.microsoft.com/technet/scriptcenter/resources/qanda/feb05/hey0221.mspx
	http://msdn.microsoft.com/library/default.asp?url=/library/en-us/rpc/rpc/guid.asp
*/
function tempGUID(){
 var TypeLib=WScript.CreateObject("Scriptlet.TypeLib"),tGUID;

 try{tGUID=TypeLib.Guid();}
 catch(e){return;}
 finally{TypeLib=null;}	//	即使 try 或 catch 區塊中發生傳回陳述式，或從 catch 區塊中擲出錯誤，仍會執行 finallyStatements 內的程式碼。finallyStatments 保證會永遠執行。

 return tGUID;
}






//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'OS.Windows.registry';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;

	CeL.set_library(lib_name);


/**
 * Windows.registry test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.OS.Windows.registry = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();




/*	http://msdn2.microsoft.com/en-us/library/x05fawxd.aspx
	作Registry的操作
	WshRegistry.Base	設定工作的基準，這應該是個目錄，將會附加在每個key前面

	WshRegistry(key)	WshShell.RegRead()
*undo*				key假如輸入object，會將之一一分開處理，此時WshRegistry.Err會包含所有發生的錯誤，WshRegistry.Err[0]=發生錯誤的數量
*undo*	WshRegistry(key,0,'info')	完整資訊（包括type）
*undo*	WshRegistry(keyDir,keyPattern,'dir')	傳回整個dir的資料。dir的預設值/標準の値：['']
	WshRegistry(key,value[,type])	WshShell.RegWrite()
	WshRegistry(key,value),WshRegistry(key,value,'auto')	auto detect type
	WshRegistry(key,value,1)	WshShell.RegWrite(key,value)
	WshRegistry(key,0,'del')	WshShell.RegDelete()

TODO:
backup all
search

test:
if(0){
 var k="HKCU\\Software\\Colorless echo\\Comparer\\test\\test",r=WshRegistry(k,1),p=function(){if(WshRegistry.Err)alert(WshRegistry.Err.message);else alert('('+typeof r+')'+k+'\n'+r);};
 p();
 WshRegistry(k,0,'del');
 r=WshRegistry(k);
 p();
 r=WshRegistry(k="HKCU\\Software\\Colorless echo\\Comparer\\");
 p();
}

*/
WshRegistry.Err=WshRegistry.Base=0;
function WshRegistry(key,value,type){
 WshRegistry.Err=null;
 if(WshRegistry.Base){if(WshRegistry.Base.slice(-1)!='\\')WshRegistry.Base+='\\';key=WshRegistry.Base+key;}
 if(!key)return;
 //if(typeof WshShell!='object')WshShell=new ActiveXObject("WScript.Shell");
 if(typeof key=='object'){var i,c=0;for(i in key)c+=WshRegistry(i,key[i],type) instanceof Error?0:1;return c;}
 try{
  var _f=WshRegistry.F;
  //if(typeof type=='string')type=_f[type];
  if(type=='del')WshShell.RegDelete(key);
  else if(typeof value!='undefined'){
   if(typeof type=='undefined'||type=='auto')	//	自動判別
    type=typeof value=='number'&&!value%1?'REG_DWORD'	//	DWORD:4bytes,REG_BINARY
    :typeof value=='string'&&value.indexOf('\n')==-1?value.indexOf('%')==-1?'REG_SZ':'REG_EXPAND_SZ'	//	REG_EXPAND_SZ:"%windir%\\calc.exe"等
    :0;	//	unknown:multi_sz/none/dword_big_endian/link/resource_list	http://www.cotse.com/dlf/man/TclCmd/registry.htm,http://cmpp.linuxforum.net/cman/mann/registry.htm
   //if(isNaN(type))WshShell.RegWrite(key,value);else WshShell.RegWrite(key,value,WshRegistry.T[type]);
   if(typeof type=='string')WshShell.RegWrite(key,value,type);else WshShell.RegWrite(key,value);
  }
  value=WshShell.RegRead(key);	//	寫入後再讀取，傳回真正寫入的值
  //alert('('+typeof value+')'+key+'\n'+value);
 }catch(e){
  //	http://klcintw4.blogspot.com/2007/09/javascriptie.html
  if(e.description.indexOf("伺服程式無法產生物件")!=-1)
   alert("請調整IE瀏覽器的安全性\n網際網路選項→安全性→自訂層級\n「起始不標示為安全的ActiveX控制項」設定為啟用或提示。"); 
  WshRegistry.Err=e;return;
 }
 return value;
}


/*
	registry 登錄值/登錄項目操作

bug:
registryF.checkAccess('HKLM') always return false. this is OK: registryF.checkAccess('HKLM\\SOFTWARE\\')

TODO:
Win32_SecurityDescriptor
.moveKey(from,to)
.moveValue(from,to)
用.apply()實作prototype之function，不另外寫。
*/
//registryF[generateCode.dLK]='VBA,JSArrayToSafeArray';
function registryF(path,sComputer,flag){	//	key path, ComputerName, create?
/*
 if(!registryF.prototype.oReg){	//	不能用 this.prototype.~
  var oReg=getWMIData('default:SWbemLocator');//try{oReg=new Enumerator(GetObject("winmgmts:{impersonationLevel=impersonate}//"+(sComputer||'.')+"/root/default:StdRegProv"));}catch(e){}
  if(!oReg)try{
   //	http://msdn2.microsoft.com/en-us/library/aa393774.aspx
   var oLoc=new ActiveXObject("WbemScripting.SWbemLocator")
	,oSvc=oLoc.ConnectServer(sComputer||null,"root/default");
   oReg=oSvc.Get("StdRegProv");
  }catch(e){return;}
  registryF.prototype.oReg=oReg;
 }
*/
/*
 try{
  this.oReg=new ActiveXObject("WbemScripting.SWbemLocator").ConnectServer(sComputer||null,"root/default").Get("StdRegProv");
 }catch(e){return;}	//	User-defined function to format error codes.
*/
 // with(this)base:'',subkey:{},value:{},type:{},flag:0
 this.setPath(path,sComputer);
 return this;
}


//	下面是公私共用 function
/*
http://www.supinfo-projects.com/en/2004/api_basederegistre__vb_en/2/
http://www.microsoft.com/taiwan/msclub/4P/topic_0402-3.aspx
REG_BINARY 二進位制資料。登錄檔編輯器會以十六進位的記數法來顯示二進位制的資料，而你必須用十六進位制的記數法 來輸入二進位的資料。舉個例子來說，如REG_BINARY值為0x02 0xFE 0xA9 0x38 0x92 0x38 0xAB 0xD9。
REG_DWORD 雙字組值(32-bits)。很多REG_DWORD內容值都使用像是布林值(0 或1、true或false、yes或者是no)。你也可以看到時間值以百萬秒(millisecond)的方式被放在REG_DWORD當中(1000 即1秒)。32-bit未指定的範圍可以從0到4,294,967,295，並且32-bit指定數值範圍可以從-2,147,483,648到 2,147,483,647。你可以使用十進位制或者是十六進位制的方法來編輯這些數值。如REG_DWORD值可表示為0xFE020001及 0x10010001。
REG_DWORD_BIG_ENDIAN 雙字組(Double-word)值以最顯著的方式被存放在記憶體當中。這些位元的順多與REG_DWORD的順序相反。舉個例子來說，數值 0x01020304被以0x01 0x02 0x03 0x04的型態放置在記憶體當中，你並不會在Intel-based 的架構中看到諸如此類的架構。
REG_DWORD_LITTLE_ENDIAN 雙字組值至少有顯者的位元組被儲存在記憶體當中，這個型態跟REG_DWORD是相同的，並且因為Intel-based的架構是以這種格式來儲存數值 的，在Windows XP當中，它是最普遍的數值。舉例來說，0x01020304以0x04 0x03 0x02 0x01的內容被存放在記憶體當中，登錄檔編輯器並不提供用來建立REG_DWORD_LITTLE_ENDIAN 值的能力，因為這個數值資料型態對於REG_DWORD在登錄檔當中的角色而言是相同的。
REG_EXPAND_SZ 變數長度的文字資料。以這種資料型態放置的資料可以是變數、及在使用它們之前，用來延伸這些變數的數值的程式。舉個例子來說，REG_EXPAND_SZ 值包含了%USERPROFILE%\Favorites在程式使用它之前，可能被延伸為C:\Documents and Settings\Jerry\Favorites 。這些登錄器API (Application Programming Interface)會依照所呼叫的程式來延伸環境變數REG_EXPAND_SZ字串，所以它在程式沒有擴充他們的時候，是沒有作用的。您可以看看第十章「引用使用者資訊檔」，以學習更多此類內容值的型態，以修正一些有趣的問題。
REG_FULL_RESOURCE_DESCRIPTOR 資源列表會將裝置及裝置的驅動程式列示出來。這也就資料型態對於PNP裝置來講很重要的原因。登錄檔編輯器並不提供任何方去來製作這種型態的內容值，但是 它允許你顯示它們。你可以查看HKLM\HARDWARE\DESCRIPTION\Description做為這類資料型態的範例。
REG_LINK 它是一個連接，而您無法建立REG_LINK值。
REG_MULTI_SZ 包含一個字串列表的二進位值。登錄檔編輯器會在每一行中顯示一個字串，並且允許你編輯這些列表。在 這些登錄檔當中，一個空的字元(0x00)被每個字串分隔開來，並且兩個空的字串被放置在此列表的結尾。
REG_NONE 擁有並未定義的數值。 Consists of hex data.
REG_QWORD Quadruple-word值(64-bits)。此一型態的資料與REG_DWORD型態相似，但是它包含了 64 bits而不是32 bit。而支援此一型態的作業系統只有Windows XP 64-Bit Edition。你可以使用十進位或者是十六進位的記數方法來查看及編輯此類的登錄值。 0xFE02000110010001為REG_QWORD的一個例子。
REG_QWORD_BIG_ENDIAN Quadruple-word值會將最顯著的位元組第一個儲存在記憶體當中。而此位元組的順序則與REG_QWORD儲存這些值的順序相反。你可以查看 REG_DWORD_BIG_ENDIAN得到更多資訊。
REG_QWORD_LITTLE_ENDIAN 至少有Quadruple-word值儲存在記憶體當中。這種型態與REG_QWORD相同。您可以查看REG_DWORD_LITTLE_ENDIAN 取得更多的資訊。登錄檔編輯器並不提供製作REG_QWORD_LITTLE_ENDIAN 內容的能力，因為這個值的型態對於登錄檔中的REG_QWORD而言是唯一的。
REG_RESOURCE_LIST 是REG_FULL_RESOURCE_DESCRIPTION 內容值的列表。登錄檔編輯器允許你查看，但不允許你編輯這種型態的資料。
REG_RESOURCE_REQUIREMENTS_LIST 列示了裝置所需資源的列表。登錄檔編輯器允許你查看，但並不允許你編輯此種型態的值。
REG_SZ 固定長度的文字 REG_DWORD、REG_SZ值為在登錄檔當中最普遍的資料型態。而REG_SZ值的範例為 Microsoft Windows XP或Jerry Honeycutt。每個字串都是以一個鑋值字元為結尾。程式並在REG_SZ值當中並沒有擴充環境變數。
*/
/* private */registryF.typeName='REG_NONE,REG_SZ,REG_EXPAND_SZ,REG_BINARY,REG_DWORD,REG_DWORD_BIG_ENDIAN,REG_LINK,REG_MULTI_SZ,REG_RESOURCE_LIST,REG_FULL_RESOURCE_DESCRIPTOR,REG_RESOURCE_REQUIREMENTS_LIST,REG_QWORD,REG_QWORD_LITTLE_ENDIAN=11'.split(',');
//	將 TypeValue 轉成 TypeName
registryF.getTypeName=registryF.prototype.getTypeName=function(/*int */type){
 return registryF.typeName[type];
};
//	將 TypeName 轉成 TypeValue
registryF.getTypeValue=registryF.prototype.getTypeValue=function(/*string */type){
 if(!registryF.typeValue){
  var i,t=registryF.typeValue={},n=registryF.typeName;
  for(i in n)t[n[i]]=i;
 }
 return registryF.typeValue[type];
};



/*	將 HKEY_CURRENT_USER 等表示法與數字代號互轉
	http://msdn2.microsoft.com/en-us/library/aa393664.aspx
	http://svn.ruby-lang.org/cgi-bin/viewvc.cgi/tags/v1_8_5_19/ext/Win32API/lib/win32/registry.rb?view=markup&pathrev=11732
	http://www.51log.net/dev/304/4539587.htm
*/
registryF.getRegCode=registryF.prototype.getRegCode=function(/*string */name){
 if(!registryF.RegCode){
  var i,r=registryF.RegCode={
	HKCR:0,HKEY_CLASSES_ROOT:0
	,HKCU:1,HKEY_CURRENT_USER:1
	,HKLM:2,HKEY_LOCAL_MACHINE:2
	,HKUS:3,HKU:3,HKEY_USERS:3
	//,HKEY_PERFORMANCE_DATA:4
	,HKCC:5,HKEY_CURRENT_CONFIG:5
	,HKEY_DYN_DATA:6
	//,HKEY_PERFORMANCE_TEXT:0x50
	//,HKEY_PERFORMANCE_NLSTEXT:0x60
  };
  for(var i in r)if(!isNaN(r[i])){
   r[i]+=0x80000000;//&
   if(i.indexOf('_')!=-1)r[r[i]]=i;	//	reverse
  }
 }
 //alert(name+'\n'+registryF.RegCode[name]);
 return registryF.RegCode[name];
};


//	分開base與path，並作檢查。
registryF.separatePath=function(path,sComputer,isValue){
 if(typeof path=='object')return path;	//	處理過的
/*
 if(isNaN(base)&&isNaN(base=this.getRegCode(base))&&typeof path=='string'&&(path=path.match(/^([A-Z_]+)\\(.+)$/)))
  base=this.getRegCode(path[1]),path=path[2];
*/
 var base,v;	//	base, ValueName (or tmp)
 if(typeof path=='string' && (v=path.match(/^([A-Z_]+)(\\(.*))?$/)))
  base=this.getRegCode(v[1]),path=v[3]/*||'\\'*/;

 if(!base/*||isNaN(base)*/)return;
 //alert('registryF.separatePath:\n'+base+'	'+path);
 if(typeof path!='string' || !path&&path!=='')return;

 v=0;
 //	判別輸入
 if(!/[\\]$/.test(path))
  if(!isValue&&this.checkAccess([base,path],1/* KEY_QUERY_VALUE */,sComputer))
   //	輸入 SubkeyName
   path+='\\',v='';
  //	輸入 ValueName
  else if(v=path.match(/^(.+\\)([^\\]+)$/))path=v[1],v=v[2];
  //	輸入 root 之 ValueName，如 HKEY_CURRENT_USER\value
  else v=path,path='';

 if(path[1]=='\\')path[1]='';
 //alert('registryF.separatePath:\n'+base+'\n'+path+'\n'+v);
 return typeof v=='string'?[base,path,v]:[base,path];	//	考慮用{base:,key:,value:}
};
// private
registryF.prototype.separatePath=function(name,base){
 //return this instanceof registryF?[this.base,this.path+path]:registryF.separatePath(path);
 return typeof name=='string'?name.indexOf('\\')==-1?[this.base,this.path,name]:registryF.separatePath(this.getPath()+name,this.computer):[this.base,this.path];
};


/*	主要的 WMI 執行 interface
	http://msdn2.microsoft.com/En-US/library/aa394616.aspx
In scripting or Visual Basic, the method returns an integer value that is 0 (zero) if successful. If the function fails, the return value is a nonzero error code that you can look up in WbemErrorEnum.
*/
registryF.oRegA={};
registryF.runMethod=registryF.prototype.runMethod=function(name,inPO,sComputer/*,flag*/){	//	inPO: input parameters object
 var oReg=this.oReg||registryF.oRegA[sComputer||'.'];
 if(!oReg)try{
  oReg=this.oReg=registryF.oRegA[sComputer||'.']
	=new ActiveXObject('WbemScripting.SWbemLocator')
	.ConnectServer(sComputer||null,'root/default')
	.Get('StdRegProv');
 }catch(e){
  //popErr(e);
  return;
 }

 try{
  var i,oMethod=oReg.Methods_.Item(name)	//	若無此方法會 throw error!
	,oInParam=oMethod.InParameters.SpawnInstance_();
  //if(name=='SetMultiStringValue')for(i in inPO){try{oInParam[i]=inPO[i];}catch(e){popErr(e,0,'registryF.runMethod: '+name+' error:\nset ['+i+'] to ['+inPO[i]+']');}if(name=='CheckAccess')alert(name+': oInParam['+i+']='+inPO[i]);}
  for(i in inPO)oInParam[i]=inPO[i];	//	若無此property會 throw error!
  return oReg.ExecMethod_(oMethod.Name,oInParam);//oOutParam
 }catch(e){
  popErr(e);
  return e;
 }
};


/*	The CheckAccess method verifies that the user has the specified permissions.
	http://msdn2.microsoft.com/en-us/library/aa384911.aspx
	http://msdn2.microsoft.com/en-us/library/ms724878.aspx

制定一個訪問標記以描述訪問新鍵的安全性
    此參數可以是下列值的一個聯合
    KEY_ALL_ACCESS
    KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, KEY_NOTIFY, KEY_CREATE_SUB_KEY, KEY_CREATE_LINK, 和 KEY_SET_VALUE 訪問的聯合.
    KEY_CREATE_LINK
    允許創建嚴格符號的鏈接.
    KEY_CREATE_SUB_KEY
    允許創建子鍵.
    KEY_ENUMERATE_SUB_KEYS
    允許枚舉子鍵.
    KEY_EXECUTE
    允許讀訪問.
    KEY_NOTIFY
    允許改變通知.
    KEY_QUERY_VALUE
    允許查詢子鍵的數據.
    KEY_READ
    KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, 和 KEY_NOTIFY 訪問的聯合.
    KEY_SET_VALUE
    允許設置子鍵的數據.
    KEY_WRITE
    KEY_SET_VALUE 和 KEY_CREATE_SUB_KEY 訪問的聯合

KEY_ALL_ACCESS (0xF003F)	Combines the STANDARD_RIGHTS_REQUIRED, KEY_QUERY_VALUE, KEY_SET_VALUE, KEY_CREATE_SUB_KEY, KEY_ENUMERATE_SUB_KEYS, KEY_NOTIFY, and KEY_CREATE_LINK access rights. (&& READ_CONTROL?)
KEY_CREATE_LINK (0x0020)	Reserved for system use.
KEY_CREATE_SUB_KEY (0x0004)	Required to create a subkey of a registry key.
KEY_ENUMERATE_SUB_KEYS (0x0008)	Required to enumerate the subkeys of a registry key.
KEY_EXECUTE (0x20019)	Equivalent to KEY_READ.
KEY_NOTIFY (0x0010)	Required to request change notifications for a registry key or for subkeys of a registry key.
KEY_QUERY_VALUE (0x0001)	Required to query the values of a registry key.
KEY_READ (0x20019)	Combines the STANDARD_RIGHTS_READ, KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, and KEY_NOTIFY values.
KEY_SET_VALUE (0x0002)	Required to create, delete, or set a registry value.
KEY_WOW64_32KEY (0x0200)	Indicates that an application on 64-bit Windows should operate on the 32-bit registry view. For more information, see Accessing an Alternate Registry View.
	This flag must be combined using the OR operator with the other flags in this table that either query or access registry values.
	Windows 2000:  This flag is not supported.
KEY_WOW64_64KEY (0x0100)	Indicates that an application on 64-bit Windows should operate on the 64-bit registry view. For more information, see Accessing an Alternate Registry View.
	This flag must be combined using the OR operator with the other flags in this table that either query or access registry values.
	Windows 2000:  This flag is not supported.
KEY_WRITE (0x20006)	Combines the STANDARD_RIGHTS_WRITE, KEY_SET_VALUE, and KEY_CREATE_SUB_KEY access rights.

http://www.supinfo-projects.com/en/2004/api_basederegistre__vb_en/2/
*/
registryF.accessFlag={
	KEY_QUERY_VALUE:1
	,KEY_SET_VALUE:2
	,KEY_CREATE_SUB_KEY:4
	,KEY_ENUMERATE_SUB_KEYS:8
	,KEY_NOTIFY:0x10
	,KEY_CREATE_LINK:0x20
	//,KEY_WOW64_32KEY:0x0200
	//,KEY_WOW64_64KEY:0x0100
	,DELETE:0x10000
	,READ_CONTROL:0x20000,STANDARD_RIGHTS_EXECUTE:0x20000,STANDARD_RIGHTS_READ:0x20000,STANDARD_RIGHTS_WRITE:0x20000
	,KEY_WRITE:0x20006
	,KEY_READ:0x20019,KEY_EXECUTE:0x20019
	//,WRITE_DAC:0x40000
	//,WRITE_OWNER:0x80000
	//,STANDARD_RIGHTS_REQUIRED:0xF0000
	,KEY_ALL_ACCESS:0xF003F
	//,SYNCHRONIZE:0x100000
	//,STANDARD_RIGHTS_ALL:0x1F0000
};
//	check access of key base+path
registryF.checkAccess=registryF.prototype.checkAccess=function(path,uRequired,sComputer){
 if(path=this.separatePath(path,sComputer)){
  if(typeof uRequired=='string')uRequired=registryF.accessFlag[uRequired];
  //alert('registryF check:\n'+this.getRegCode(path[0])+'\\'+path[1]+'\n'+this.runMethod('CheckAccess',{hDefKey:path[0],sSubKeyName:path[1],uRequired:uRequired||3/*KEY_QUERY_VALUE+KEY_SET_VALUE*/},sComputer).bGranted);
  try{return this.runMethod('CheckAccess',{hDefKey:path[0],sSubKeyName:path[1],uRequired:uRequired||3/*KEY_QUERY_VALUE+KEY_SET_VALUE*/},sComputer).bGranted;}	//	有可能不存在 .bGranted !
  catch(e){return;}
 }
};


//	一次性功能，不通過創建object
/*	ӥ۞某 path: Subkey(機碼) 之 {ValueName:(int)ValueType} 資訊。無 Value 會 return undefined
registryF.getValue('HKEY_CLASSES_ROOT\\.odp')	傳ީ設值
registryF.getValue('HKEY_CLASSES_ROOT\\.odp\\')	傳回整個目錄值
*/
registryF.getValueType=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer)))return;

 //	http://msdn2.microsoft.com/en-us/library/aa390388.aspx
 var oOutParam=this.runMethod('EnumValues',{hDefKey:path[0],sSubKeyName:path[1]},sComputer),aNames,aTypes,i=0,r={'':1/* 取得預設值: REG_SZ */};
 if(!oOutParam || oOutParam.sNames==null)return;	//	error 大概都是 ==null，可能因為輸入value而非key值
 aNames=oOutParam.sNames.toArray(),aTypes=oOutParam.Types.toArray();
 //aNames.push(''),aTypes.push(1);	//	預設值
 if(flag==1)return [aNames,aTypes];
 for(;i<aNames.length;i++)
  //WScript.Echo('('+sRegTypes[aTypes[i]]+') '+aNames[i]);
  r[aNames[i]]=aTypes[i];//,this.value[aNames[i]]=getValue(aNames[i],aTypes[i]);

 return flag==2?[aNames,r]:typeof path[2]=='string'?r[path[2]]:r;
};
//	傳回某 Value(數值) 之 (int)type 或 {ValueName:(int)ValueType}
registryF.prototype.getValueType=function(name,force){
 if(force||!this.type||!this.type[name]){	//	可能有更新
  var t=registryF.getValueType(this.separatePath(),this.computer,2)||[];
  this.type=(this.valueA=t[0]||[]).length?t[1]:{};
 }
 //alert('registryF.prototype.getValueType:\n'+name+'	'+this.type[name]);
 if(this.type)return typeof name=='string'?this.type[name]:this.type;	//	應先copy
};
registryF.prototype.getValueA=function(force){
 if(force||!this.valueA)this.getValueType(0,1);
 return this.valueA;
};


/*	一次性功能，不通過創建object
	讀取 Subkey(機碼) 之名稱資訊。無 Subkey 會 return undefined

TODO:
return registryF object
*/
registryF.getSubkeyName=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer)))return;
 //alert('registryF.getSubkeyName:\npath: '+path);

 //	http://msdn2.microsoft.com/en-us/library/aa390387.aspx
 var i=0,r={},aNames=this.runMethod('EnumKey',{hDefKey:path[0],sSubKeyName:path[1]=='\\'?'':path[1]},sComputer).sNames;
 if(aNames!=null){	//	error 大概都是 ==null，可能因為: 1.無Subkey 2.輸入value而非key值
  if(flag==1)return aNames;
  for(aNames=aNames.toArray();i<aNames.length;i++)
   r[aNames[i]]={};//registryF(r.base+aNames[i]+'\\')
  //alert('registryF.getSubkeyName: '+aNames.length);
  return flag==2?[aNames,r]:path[2]?path[2] in r:r;
 }
};
registryF.prototype.getSubkeyName=function(force,flag){
 if(force||!this.subkey){
  var t=registryF.getSubkeyName(this.separatePath(),this.computer,2)||[];
  this.subkey=(this.subkeyA=t[0]||[]).length?t[1]:{};
 }
 return flag?this.subkeyA:this.subkey;
};


/*	設定 object 之初始 path。
oRegistryF.subkey
oRegistryF.type
oRegistryF.value
*/
registryF.prototype.setPath=function(path,sComputer){	//	base key path
 if(!(path=registryF.separatePath(path,sComputer)))return;	//	因為是初次設定，所以這裡不能用 this.separatePath()

 this.base=path[0],this.path=path[1],this.computer=sComputer;
 if(!/[\\]$/.test(this.path))this.path+='\\';	//	確保this.path是key值

 //this.subkey={},this.type={},this.value={};	//	預防 no access permission 之後卻還被呼叫
 if(this.checkAccess(0,0,sComputer))
	this.value={}
	,this.type=this.getValueType()
	,this.subkey=this.getSubkeyName(1)
	;
 //	else: no access permission or doesn't exist.
 return path;
};

//	傳回 object 之初始 path。
registryF.prototype.getPath=function(){
 return this.getRegCode(this.base)+'\\'+this.path;
};


registryF.prototype.reset=function(){
 this.subkey={},this.type={},this.value={};	//	預防 no access permission 之後卻還被呼叫
 this.setPath(this.separatePath(),this.computer);
};

//	尚未完善!
registryF.isExist=function(path,sComputer,flag){
 path=this.separatePath(path,sComputer);
 if(!path)return;

 var _t=this.getSubkeyName([path[0],path[1].replace(/[^\\]+\\?$/,'')],0,2);
 _t= _t && (!path[1]||path[1]=='\\'||_t.length&&_t[1][path[1].replace(/^(.*?)([^\\]+)\\?$/,'$2')]);
 return !_t||!path[2]?_t:typeof this.getValueType(path)!='undefined';

 //if(this.checkAccess(path,1/* KEY_QUERY_VALUE */,sComputer))return true;
 //if(flag)return;	//	不以create的方法test。

 //	若可create(並access)，表示不存在（需刪掉建出來的），return false。否則unknown，return undefined。

};
registryF.prototype.isExist=function(name,flag){
 return registryF.isExist(this.separatePath(name),this.computer,flag);
};

//	RegMethod	http://www.cqpub.co.jp/hanbai/pdf/18451/18451_wmi.pdf
registryF.useMethod=',String,ExpandedString,Binary,DWORD,DWORD,String,MultiString,String,MultiString,String,QWORD'.split(',');
registryF.useValueName=',s,s,u,u,u,s,s,s,s,s,u'.split(',');
registryF.useArray=',,,1,,,,1,,1,,'.split(',');
//	以 type 取得 path 之 Value。預設自動判別 type
registryF.getValue=function(path,sComputer,/*int || undefined */type){
 if(!(path=this.separatePath(path,sComputer)))return;
 if(typeof path[2]!='string'){
  //	get all
  var r={},i;
  type=this.getValueType(path,sComputer);
  for(i in type)r[path[2]=i]=this.getValue(path,sComputer,type[i]);
  return r;
 }

 var m;	//	method
 if(!type&&!(type=this.getValueType(path,sComputer))||!(m=this.useMethod[type]))return;

 var oOutParam=this.runMethod('Get'+m+'Value',{hDefKey:path[0],sSubKeyName:path[1],sValueName:path[2]},sComputer);
 if(!oOutParam)return;
 //if(oOutParam.returnValue)return oOutParam.returnValue;

 //	different method return different value name
 oOutParam=oOutParam[this.useValueName[type]+'Value'];
 //	some methods return VB Array
 if(this.useArray[type])oOutParam=VBA(oOutParam);

 //if(!oOutParam)return;
 if(type==7/*REG_MULTI_SZ*/)oOutParam=oOutParam.toArray();
 else if(type==3/*REG_BINARY*/)oOutParam=fromCharCode(oOutParam.toArray());
 //alert(oMethod.Name+'\n'+'('+type+')'+name+'\n'+oOutParam);
 //if(type==3)alert(typeof oOutParam);
 return oOutParam;
};
registryF.prototype.getValue=function(name,/*int || undefined */type){
 var i,v;
 if(typeof name=='string'){
  if(this.getSubkeyName()[name])
   v=registryF.getValue([this.base,this.path+'\\'+name,''],this.computer,1/* 取得預設值: REG_SZ */);
  else{
   if(name in this.value)return this.value[name];//if(m=this.value[name])return m;
   if(!type)type=this.getValueType(name);	//	bug: 假如在之前已經更新過，可能得到錯誤的 type ！
   v=registryF.getValue(this.separatePath(name),this.computer,type);
  }
  if(typeof v!='undefined')this.value[name]=v;
  return v;
 }

 if(!this.gotAllValue){
  //	get all
  for(i in this.type)
   //{v=registryF.getValue(this.separatePath(i),this.computer,this.type[i]);if(typeof v!='undefined')this.value[i]=v;}
   this.value[i]=registryF.getValue(this.separatePath(i),this.computer,this.getValueType(i));
  this.gotAllValue=true;
 }
 return this.value;	//	應先copy
};


/*	僅設定 Value	硬將小數設成REG_DWORD會四捨五入
TODO:
set default value:
setValue('@',object)
*/
registryF.setValue=function(path, value, /*int || undefined */type, sComputer, isValue){
 if(!(path=this.separatePath(path,sComputer,isValue)))return 5;

 if(typeof value=='undefined')return;	//	want to delete?
 if(!type||isNaN(type)&&isNaN(type=this.getTypeValue(type)))	//	自動判別
  type=!isNaN(value)?value%1?1/*REG_SZ*/:4/*REG_DWORD*/	//	DWORD:4bytes, or QWORD
   :typeof value=='string'?
    /^[\x0-\xff]$/.test(value)&&/[\x0\x80-\xff]/.test(value)?3/*REG_BINARY*/
	:value.indexOf('\n')!=-1?7/*REG_MULTI_SZ*/
	:value.indexOf('%')==-1?1/*REG_SZ*/:2/*REG_EXPAND_SZ:"%windir%\\calc.exe"等*/
   :typeof value=='object'?3/*REG_BINARY*/:0/*REG_NONE*/;	//	may buggy
 var m=this.useMethod[type],o;
 //alert('registryF.setValue:\npath:'+path+'\nvalue:'+(''+value).replace(/\0/g,'\\0')+'\ntype:'+type+'\nm:'+m+'\n\ncreate id:'+this.setValue.cid+'\nexist:'+this.isExist([path[0],path[1]]));
 if(!m)return 6;
 if( this.setValue.cid && !this.isExist([path[0],path[1]]) )
  //alert('registryF.setValue: add Key:\n'+path[0]+'\n'+path[1]),
  this.addKey(path);

 o={hDefKey:path[0],sSubKeyName:path[1],sValueName:path[2]};

 //	http://msdn.microsoft.com/en-us/library/aa393286(VS.85).aspx
 if(type==3/*REG_BINARY*/&&typeof value=='string'){
  var i=0,v=value;
  for(value=[];i<v.length;i++)value.push(v.charCodeAt(i));//value.push(''+v.charCodeAt(i));
 }
 //	some methods need VB Array
 if(this.useArray[type])value=JSArrayToSafeArray(value);
 //	different method has different value name
 o[this.useValueName[type]+'Value']=value;

 m=this.runMethod('Set'+m+'Value',o,sComputer);
 return m instanceof Error?m:m.returnValue;
};
//	Create intermediate directories as required.
//	設為true記得setValue後馬上改回來，否則可能出現自動加subkey的情形。
//registryF.setValue.cid=0;
registryF.prototype.setValue=function(name,value,/*int || undefined */type){
 return registryF.setValue(this.separatePath(name),value,type,this.computer);
};


/*
只能刪除葉結點項，連同該子項下的所有值均被刪除(如果不存在子項，或該項下還有子項則不能刪除則無效果)
*/
registryF.deleteKey=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer))
	||path[2]	//	不接受值
	)return;

 flag=flag||0;
 if(flag&1){
  //	recursive
  var i,k=this.getSubkeyName(path,sComputer);
  for(i in k)this.deleteKey([path[0],path[1]+k[i]],sComputer,flag-(flag&2)/* 不連上層empty者一起刪除 */);
  flag-=1;
 }

 //	do deleteKey
 var r=this.runMethod('DeleteKey',{hDefKey:path[0],sSubKeyName:path[1]},sComputer);
 if(!(flag&2))return r instanceof Error?r:r.returnValue;

 //	連上層empty者一起刪除
 flag-=(flag&1)+(flag&2);
 while(!(r instanceof Error) && (r=path[1].match(/^(.+)[^\\]+\\$/,''))){
  path[1]=r[1];
  if(this.getSubkeyName(path,sComputer)||this.getValueType(path,sComputer))break;
  r=this.deleteKey(path,sComputer,flag);
 }
 return path;
};
registryF.prototype.deleteKey=function(name,flag){
 var p=registryF.deleteKey(this.separatePath(name),this.sComputer,flag);
 if(typeof p=='object'&&this.path!=p[1]&&this.path.indexOf(p[1])==0)this.reset();	//	若 p[1] 比較短，表示連本 object 都被刪了。reset
 return p;
};


//	return 0: success, others: failed
registryF.deleteValue=function(path,sComputer){
 if(!(path=this.separatePath(path,sComputer))
	||!path[2]	//	不接受key
	)return;

 var r=this.runMethod('DeleteValue',{hDefKey:path[0],sSubKeyName:path[1],sValueName:path[2]},sComputer);
 return r instanceof Error?r:r.returnValue;
};
registryF.prototype.deleteValue=function(name){
 return registryF.deleteValue(this.separatePath(name),this.computer);
};

//	input key or value, 自動判別
registryF.deletePath=function(path,sComputer){
 if(path=this.separatePath(path,sComputer))
  return path[2]?this.deleteValue(path,sComputer):this.deleteKey(path,sComputer);
};


//	僅設定 Key	add Subkey 創建註冊表項，可以一次創建完整的項子樹(各級不存在也會被創建)
registryF.addKey=function(path,oValue,flag,sComputer){	//	flag:add/overwrite/reset(TODO)
 if(!(path=this.separatePath(path,sComputer)))return;

 var i,r=this.runMethod('CreateKey',{hDefKey:path[0],sSubKeyName:path[1]=path[1]/*+(path[2]||'')*/},sComputer).returnValue;

 if(typeof oValue=='object'){
  r=0;
  for(i in oValue)
   path[2]=i,r+=this.setValue(path,oValue[i],0,sComputer);
 }
 return r;
};
registryF.prototype.addKey=function(name,oValue,flag){	//	flag:add/overwrite/reset(TODO)
 return registryF.addKey(this.separatePath(name),oValue,flag,this.computer);
};


if(0){
_function_onload=0;


var r=new registryF('HKCU\\Software\\Colorless echo\\regTest\\test3\\');
//alert((r.getValue())['test1']);
r.setValue('test3',34452);
r.setValue('test4',34452.53);
r.setValue('test5',{ghjk:'hghj'});
alert(r.getPath()+'\nAccess: '+r.checkAccess()+'\n\n'+r.getValue('test4'));
r.deleteValue('test3');
r.deleteValue('test4');
r.addKey('test\\test1');
alert(r.addKey('test1\\test1'));
r.deleteKey('test\\test1');
r.deleteKey('test1\\test1');


/*
oRegistryF.setValue(name,value,type);
oRegistryF.getValue();
oRegistryF.getValue(name);
oRegistryF.getValueType(name);
oRegistryF.deleteValue(name);
oRegistryF.deleteKey(name);
oRegistryF.addKey(name);
oRegistryF.addKey(name,oValue,flag:add/overwrite/reset);
*/
}

//	or: isHTA
//_iF[generateCode.dLK]='_iF.p,*try{if(typeof WScript=="object"||/\.hta/i.test(location.pathname))eval(getU((new ActiveXObject("WScript.Shell")).RegRead(_iF.p)));}catch(e){},getU';//WScript.Echo(e.message);
_iF.p='HKCU\\Software\\Colorless echo\\CeL.path';
function _iF(){
 //if(typeof WshShell!='object')WshShell=new ActiveXObject("WScript.Shell");
}

CeL.extend({registryF:registryF,_iF:_iF});




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'HTA';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.HTA = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();




//	XMLHttp set	ajax通信処理ライブラリ	==================



/*
to use: include in front:
way1(good: 以reg代替functionPath!):
//	[function.js]_iF
//	[function.js]End

way2(old):
//	[function.js]getU,functionPath,'eval(getU(functionPath));'
//	[function.js]End

old:
function getU(p){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false),send(null);return responseText;}}
*/



/*	JScript or .wsh only, 能 encode
	http://neural.cs.nthu.edu.tw/jang/books/asp/getWebPage.asp?title=10-1%20%E6%8A%93%E5%8F%96%E7%B6%B2%E9%A0%81%E8%B3%87%E6%96%99
*/
function getPage(p,enc,t){	//	page url, encode, POST text
try{
 var X=new ActiveXObject('Microsoft.XMLHTTP'),AS;	//	may error
 X.open(t?'POST':'GET',p,false);
 X.setRequestHeader("Content-Type","application/x-www-form-urlencoded");	//	POST need this
 X.send(t||null);	//	Download the file
 with(AS=new ActiveXObject("ADODB.Stream")){
  Mode=3,	//	可同時進行讀寫
  Type=1,	//	以二進位方式操作
  Open(),	//	開啟物件
  Write(X.responseBody),	//	將 binary 的資料寫入物件內	may error
  Position=0,
  Type=2;	//	以文字模式操作
  if(enc)Charset=enc;	//	設定編碼方式
  X=ReadText();	//	將物件內的文字讀出
 }
 AS=0;//AS=null;	//	free
 return X;
}catch(e){
 //sl('getPage: '+e.message);
}}



/*	set a new XMLHttp
	Ajax程式應該考慮到server沒有回應時之處置

return new XMLHttpRequest(for Ajax, Asynchronous JavaScript and XML) controller
	http://www.xulplanet.com/references/objref/XMLHttpRequest.html
	http://zh.wikipedia.org/wiki/AJAX
	http://jpspan.sourceforge.net/wiki/doku.php?id=javascript:xmlhttprequest:behaviour
	http://www.scss.com.au/family/andrew/webdesign/xmlhttprequest/
	http://developer.apple.com/internet/webcontent/xmlhttpreq.html
	http://www.klstudio.com/catalog.asp?cate=4
	http://wiki.moztw.org/index.php/AJAX_%E4%B8%8A%E6%89%8B%E7%AF%87
	http://www.15seconds.com/issue/991125.htm
	http://www.xmlhttp.cn/manual/xmlhttprequest.members.html
	http://www.blogjava.net/eamoi/archive/2005/10/31/17489.html
	http://www.kawa.net/works/js/jkl/parsexml.html
	http://www.twilightuniverse.com/

	XMLHttp.readyState 所有可能的值如下：
	0 還沒開始
	1 讀取中 Sending Data
	2 已讀取 Data Sent
	3 資訊交換中 interactive: getting data
	4 一切完成 Completed

	XMLHttp.responseText	會把傳回值當字串用
	XMLHttp.responseXML	會把傳回值視為 XMLDocument 物件，而後可用 JavaScript DOM 相關函式處理
	IE only(?):
	XMLHttp.responseBody	以unsigned array格式表示binary data
				try{responseBody=(new VBArray(XMLHttp.responseBody)).toArray();}catch(e){}
				http://aspdotnet.cnblogs.com/archive/2005/11/30/287481.html
	XMLHttp.responseStream	return AdoStream
*/
function newXMLHttp(enc,isText){
 //if(typeof XMLHttp=='object')XMLHttp=null;
 var _new_obj_XMLHttp;
 if(typeof newXMLHttp.objId=='string')_new_obj_XMLHttp=new ActiveXObject(newXMLHttp.objId);	//	speedy
 //	jQuery: Microsoft failed to properly implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available.
 else if(typeof ActiveXObject!='undefined')for(var i=0,a=['Msxml2.XMLHTTP','Microsoft.XMLHTTP','Msxml2.XMLHTTP.4.0'];i<a.length;i++)
  try{_new_obj_XMLHttp=new ActiveXObject(a[i]);newXMLHttp.objId=a[i];break;}catch(e){}//'Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0',["MSXML2", "Microsoft", "MSXML"].['XMLHTTP','DOMDocument'][".6.0", ".4.0", ".3.0", ""]
  //	或直接設定：	XMLHttpRequest=function(){return new ActiveXObject(newXMLHttp.objId);}
 //	皆無：use XMLDocument. The document.all().XMLDocument is a Microsoft IE subset of JavaScript.	http://www.bindows.net/	http://www.java2s.com/Code/JavaScriptReference/Javascript-Properties/XMLDocument.htm
 else if(typeof window=='object'&&window.XMLHttpRequest/* && !window.ActiveXObject*/){//typeof XMLHttpRequest!='undefined'
  _new_obj_XMLHttp=new XMLHttpRequest();
  //	有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type 檔頭（header）時會出錯。為了避免這個問題，你可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
  //	http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
  //	http://www.w3.org/TR/XMLHttpRequest/	search encoding
  if(_new_obj_XMLHttp.overrideMimeType)
   _new_obj_XMLHttp.overrideMimeType('text/'+(isText?'plain':'xml')+(enc?'; charset='+enc:''));//oXML
 }
 return _new_obj_XMLHttp;
}

/*	讀取URL by XMLHttpRequest
	http://jck11.pixnet.net/blog/post/11630232

* 若有多行程或為各URL設定個別XMLHttp之必要，請在一開始便設定getURL.multi_request，並且別再更改。
** 在此情況下，單一URL仍只能有單一個request!
** 設定 dealFunction 須注意程式在等待回應時若無執行其他程式碼將自動中止！
	可設定：
	while(getURL.doing)WScript.Sleep(1);	//||timeout

arguments f:{
	URL:'',	//	The same origin policy prevents document or script loaded from one origin, from getting or setting properties from a of a document from a different origin.(http://www.mozilla.org/projects/security/components/jssec.html#sameorigin)
	enc:'UTF-8',	//	encoding: big5, euc-jp,..
	fn:(dealFunction),	//	onLoad:function(){},
	method:'GET',	//	POST,..
	sendDoc:'text send in POST,..'
	async:ture/false,	//	true if want to asynchronous(非同期), false if synchronous(同期的,會直到readyState==4才return)	http://jpspan.sourceforge.net/wiki/doku.php?id=javascript:xmlhttprequest:behaviour
	user:'userName',
	passwd:'****',	//	password

 //TODO:
	parameters:'~=~&~=~', // {a:1,b:2}
	header:{contentType:'text/xml'},
	contentType:'text/xml',
	run:true/false,	//	do eval
	update:DOMDocument,	//	use onLoad/onFailed to 加工 return text. onFailed(){throw;} will about change.
	interval:\d,
	decay:\d,	//	wait decay*interval when no change
	maxInterval::\d,
	//insertion:top/bottom,..
	onFailed:function(error){this.status;},	//	onFailed.apply(XMLHttp,[XMLHttp.status])
	onStateChange:function(){},
 }


dealFunction:
自行處理	typeof dealFunction=='function':
function dealFunction(error){..}
代為處理	dealFunction=[d_func,0: responseText,1: responseXML]:
	responseXML:	http://msdn2.microsoft.com/en-us/library/ms757878.aspx
function d_func(content,head[,XMLHttp,URL]){
 if(head){
  //	content,head各為XMLHttp.responseText內容及XMLHttp.getAllResponseHeaders()，其他皆可由XMLHttp取得。
 }else{
  //	content為error
 }
}
e.g., the simplest: [function(c,h){h&&alert(c);}]

)
*/
getURL[generateCode.dLK]='newXMLHttp';
function getURL(f){	//	(URL,fn) or flag			URL,dealFunction,method,sendDoc,asyncFlag,userName,password
 var _f=arguments.callee;
 if(typeof _f.XMLHttp=='object'){
  //try{_f.XMLHttp.abort();}catch(e){}
  _f.XMLHttp=null;	//	此時可能衝突或lose?!
 }
 //	處理 arguments
 if(!(f instanceof Object))a=arguments,f={URL:f,fn:a[1],method:a[2],sendDoc:a[3]};

 if(!f.URL||!(_f.XMLHttp=newXMLHttp(f.enc,!/\.x(ht)?ml$/i.test(f.URL))))return;//throw
 //try{_f.XMLHttp.overrideMimeType('text/xml');}catch(e){}
 if(typeof f.async!='boolean')
  //	設定f.async
  f.async=f.fn?true:false;
 else if(!f.async)f.fn=null;
 else if(!f.fn)
  if(typeof _f.HandleStateChange!='function'||typeof _f.HandleContent!='function')
   // 沒有能處理的function
   return;//throw
  else
   f.fn=_f.HandleContent;//null;
 if(/*typeof _f.multi_request!='undefined'&&*/_f.multi_request){
  if(!_f.q)_f.i={},_f.q=[];	//	queue
  _f.i[f.URL]=_f.q.length;	//	** 沒有考慮到 POST 時 URL 相同的情況!
  _f.q.push({uri:f.URL,XMLHttp:_f.XMLHttp,func:f.fn,start:_f.startTime=new Date})
 }else if(_f.q&&typeof _f.clean=='function')_f.clean();

 //	for Gecko Error: uncaught exception: Permission denied to call method XMLHttpRequest.open
 if(f.URL.indexOf('://')!=-1&&typeof netscape=='object')
  if(_f.asked>2){_f.clean(f.URL);return;}
  else try{
   if(typeof _f.asked=='undefined')
    _f.asked=0,alert('我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。');
   netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
  }catch(e){_f.asked++;_f.clean(f.URL);return;}//UniversalBrowserAccess

 //if(isNaN(_f.timeout))_f.timeout=300000;//5*60*1000;
 with(_f.XMLHttp)try{	//	IE:404會throw error, timeout除了throw error, 還會readystatechange; Gecko亦會throw error
  try{setRequestHeader("Accept-Encoding","gzip,deflate");}catch(e){}
  //	Set header so the called script knows that it's an XMLHttpRequest
  //setRequestHeader("X-Requested-With","XMLHttpRequest");
  //	Set the If-Modified-Since header, if ifModified mode.
  //setRequestHeader("If-Modified-Since","Thu, 01 Jan 1970 00:00:00 GMT");
  if(f.method=='POST'){//&&_f.XMLHttp.setRequestHeader
   //setRequestHeader("Content-Length",f.sendDoc.length);	//	use .getAttribute('method') to get	長度不一定如此
   //	有些CGI會用Content-Type測試是XMLHttp或是regular form
   //	It may be necessary to specify "application/x-www-form-urlencoded" or "multipart/form-data" for posted XML data to be interpreted on the server.
   setRequestHeader('Content-Type',f.fn instanceof Array&&f.fn[1]?'text/xml':'application/x-www-form-urlencoded');	//	application/x-www-form-urlencoded;charset=utf-8
  }
  abort();
  open(f.method||'GET',f.URL,f.async,f.user||null,f.passwd||null);
  //alert((f.method||'GET')+','+f.URL+','+f.async);
  //	 根據 W3C的 XMLHttpRequest 規格書上說，①在呼叫 open 時，如果readyState是4(Loaded) ②呼叫abort之後 ③發生其他錯誤，如網路問題，無窮迴圈等等，則會重設所有的值。使用全域的情況就只有第一次可以執行，因為之後的readyState是4，所以onreadystatechange 放在open之前會被清空，因此，onreadystatechange 必須放在open之後就可以避免這個問題。	http://www.javaworld.com.tw/jute/post/view?bid=49&id=170177&sty=3&age=0&tpg=1&ppg=1
  //	每使用一次XMLHttpRequest，不管成功或失敗，都要重設onreadystatechange一次。onreadystatechange 的初始值是 null
  //	After the initial response, all event listeners will be cleared. Call open() before setting new event listeners.	http://www.xulplanet.com/references/objref/XMLHttpRequest.html
  if(f.async)
	_f.doing=(_f.doing||0)+1,
	onreadystatechange=typeof f.fn=='function'?f.fn:function(e){_f.HandleStateChange(e,f.URL,f.fn);},//||null
	//	應加 clearTimeout( )
	setTimeout('try{getURL.'+(_f.multi_request?'q['+_f.i[f.URL]+']':'XMLHttp')+'.onreadystatechange();}catch(e){}',_f.timeout||3e5);//5*60*1000;
  send(f.sendDoc||null);
  if(!f.fn)return responseText;//responseXML: responseXML.loadXML(text)	//	非async(異步的)能在此就得到response。Safari and Konqueror cannot understand the encoding of text files!	http://www.kawa.net/works/js/jkl/parsexml.html
 }catch(e){if(typeof f.fn=='function')f.fn(e);else if(typeof window=='object')window.status=e.message;return e;}
}
getURL.timeoutCode=-7732147;

//	agent handle function
getURL.HandleStateChange=function(e,URL,dealFunction){	//	e: object Error, dealFunction: function(return text, heads, XMLHttpRequest object, URL) | [ function, (default|NULL:responseText, others:responseXML) ]
 var _t=0,isOKc,m=getURL.multi_request,_oXMLH;
 if(m)m=getURL.q[isNaN(URL)?getURL.i[URL]:URL],_oXMLH=m.XMLHttp,dealFunction=m.func,URL=m.uri;else _oXMLH=getURL.XMLHttp;
 if(dealFunction instanceof Array)_t=dealFunction[1],dealFunction=dealFunction[0];
 if(!dealFunction || typeof dealFunction!='function'){getURL.doing--;getURL.clean(URL);return;}
 //	http://big5.chinaz.com:88/book.chinaz.com/others/web/web/xml/index1/21.htm
 if(!e)
  if(typeof _oXMLH=='object'&&_oXMLH){
   if(_oXMLH.parseError&&_oXMLH/*.responseXML*/.parseError.errorCode!=0)
    e=_oXMLH.parseError,e=new Error(e.errorCode,e.reason);
   else if(_oXMLH.readyState==4){	//	only if XMLHttp shows "loaded"
    isOKc=_oXMLH.status;	//	condition is OK?
    isOKc=isOKc>=200&&isOKc<300||isOKc==304||!isOKc&&(location.protocol=="file:"||location.protocol=="chrome:");
    if(dealFunction==getURL.HandleContent)dealFunction(0,isOKc,_oXMLH,URL);//dealFunction.apply()
    else dealFunction(
	isOKc?_t?_oXMLH.responseXML:
		//	JKL.ParseXML: Safari and Konqueror cannot understand the encoding of text files.
		typeof window=='object'&&window.navigator.appVersion.indexOf("KHTML")!=-1&&(e=escape(_oXMLH.responseText),!e.match("%u")&&e.match("%"))?e:_oXMLH.responseText
	:0
	,isOKc?_oXMLH.getAllResponseHeaders():0,_oXMLH,URL);//dealFunction.apply()
    //	URL之protocol==file: 可能需要重新.loadXML((.responseText+'').replace(/<\?xml[^?]*\?>/,""))
    //	用 .responseXML.documentElement 可調用
    getURL.doing--;getURL.clean(URL);
    return;
   }
  }else if(new Date-(m?m.start:getURL.startTime)>getURL.timeout)
   //	timeout & timeout function	http://www.stylusstudio.com/xmldev/199912/post40380.html
   e=new Error(getURL.timeoutCode,'Timeout!');//_oXMLH.abort();
 //alert(URL+'\n'+_t+'\n'+e+'\n'+_oXMLH.readyState+'\n'+dealFunction);
 if(e){dealFunction(e,0,_oXMLH,URL);getURL.doing--;getURL.clean(URL);}//dealFunction.apply(e,URL);
};

/*	agent content handle function
有head時content包含回應，否則content表error
*/
getURL.HandleContent=function(content,head,_oXMLHttp,URL){
 if(head){
  // _oXMLHttp.getResponseHeader("Content-Length")
  alert("URL:	"+URL+"\nHead:\n"+_oXMLHttp.getAllResponseHeaders()+"\n------------------------\nLastModified: "+_oXMLHttp.getResponseHeader("Last-Modified")+"\nResult:\n"+_oXMLHttp.responseText.slice(0,200));//_oXMLHttp.responseXML.xml
 }else{
  //	error	test時，可用getURL.XMLHttp.open("HEAD","_URL_",true);，getURL(url,dealResult,'HEAD',true)。
  if(content instanceof Error)alert('Error occured!\n'+(typeof e=='object'&&e.number?e.number+':'+e.message:e||''));
  else if(typeof _oXMLHttp=='object'&&_oXMLHttp)alert((_oXMLHttp.status==404?"URL doesn't exist!":'Error occured!')+'\n\nStatus: '+_oXMLHttp.status+'\n'+_oXMLHttp.statusText);
 }
};

//	在MP模式下清乾淨queue
getURL.clean=function(i,force){
 if(force||getURL.multi_request)
  if(!i&&isNaN(i)){
   if(getURL.q)
    for(i in getURL.i)
     try{
      getURL.q[getURL.i[i]].XMLHttp.abort();
      //getURL.q[getURL.i[i]].XMLHttp=null;
     }catch(e){}
   getURL.q=getURL.i=0;//null
  }else if(!isNaN(i)||!isNaN(i=getURL.i[typeof i=='object'?i.uri:i])){
   try{getURL.q[i].XMLHttp.abort();}catch(e){};
   //getURL.q[i].XMLHttp=0;
   delete getURL.i[getURL.q[i].uri];getURL.q[i]=0;
  }
};

//	↑XMLHttp set	==================






//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'HTA';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.HTA = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();



/*	Internet Explorer Automation

TODO:
JavaScript closure and IE 4-6 memory leak
Mozilla ActiveX Project	http://www.iol.ie/%7Elocka/mozilla/mozilla.htm
IE臨時文件的位置可以從註冊表鍵值 HKLM\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Cache\paths\Directory 中讀取。
*/
function IEA(URL){

 try{
/*	COM objects
WScript.CreateObject("InternetExplorer.Application","Event_");
new ActiveXObject(class[, servername]);

http://www.cnblogs.com/xdotnet/archive/2007/04/09/javascript_object_activexobject.html
var obj=new ActiveXObject(servername,typename[,location]);
servername提供該對象的應用程序名稱；
typename要創建的對象地類型或類；
location創建該對象得網絡服務器名稱。
*/
  this.app=new ActiveXObject("InternetExplorer.Application");
 }catch(e){
  //return;
 }
 if(!this.app)return;
 this.go(URL||'');	//	要先瀏覽了網頁，才能實行IEApp.Document其他功能。

 return this;

/*	other functions
	http://msdn2.microsoft.com/en-us/library/aa752085.aspx
	http://msdn2.microsoft.com/en-us/library/Aa752084.aspx
IEApp.Visible=true;
IEApp.Offline=true;
IEApp.Document.frames.prompt();
*/
}
IEA.frame=function(d,n){	//	document, name
 try{
  d=d.getElementsByTagName('frame');
  return n?d[n].contentWindow.document:d;
 }catch(e){}
};
IEA.prototype={
//	w:以有無視窗，否則以有無內容判別OK	關掉視窗時， typeof this.app.Visible=='unknown'
OK:function(w){try{if(w?typeof this.app.Visible=='boolean':this.doc().body.innerHTML)return this.app;}catch(e){}},
autoSetBase:true,
baseD:'',
baseP:'',
//initP:'about:blank',
timeout:3e4,	//	ms>0
setBase:function(URL){
 var m=(URL||'').match(/^([\w\d\-]+:\/\/[^\/]+)(.*?)$/);
 if(m)this.baseD=m[1],this.baseP=m[2].slice(0,m[2].lastIndexOf('/')+1);
 //WScript.Echo('IEA.setBase:\ndomin: '+this.baseD+'\npath: '+this.baseP);
 return this.baseD;
},
go:function(URL){	//	URL or history num
 var _t=this;
 try{
  if(URL===''||isNaN(URL)){
   if(URL==='')URL='about:blank';//_t.initP;
   if(URL){
    if(URL.indexOf(':')==-1)//if(URL.indexOf('://')==-1&&URL.indexOf('about:')==-1)
     URL=_t.baseD+(URL.charAt(0)=='/'?'':_t.baseP)+URL;
    _t.app.Navigate(URL);	//	IEApp.Document.frames.open(URL);	**	請注意：這裡偶爾會造成script停滯，並跳出警告視窗！
    if(_t.autoSetBase)_t.setBase(URL);
    _t.wait();
    //_t.win().onclose=function(){return false;};//_t.win().close=null;	//	防止自動關閉
   }
  }else _t.win().history.go(URL),_t.wait();
 }catch(e){}
 eName=0;
 return _t;
},
/*	完全載入
TODO:
http://javascript.nwbox.com/IEContentLoaded/
try{document.documentElement.doScroll('left');}
catch(e){setTimeout(arguments.callee, 50);return;}
instead of onload
*/
waitStamp:0,
waitInterval:200,	//	ms
waitState:3,	//	1-4: READYSTATE_COMPLETE=4	usual set to interactive=3
wait:function(w){
 if(!w&&!(w=this.waitState)||this.waitStamp)return;	//	!!this.waitStamp: wait中
 this.waitStamp=new Date;
 try{	//	可能中途被關掉
  while(new Date-this.waitStamp<this.timeout && (!this.OK(1)||this.app.busy||this.app.readyState<w))
   try{WScript.Sleep(this.waitInterval);}catch(e){}	//	Win98的JScript沒有WScript.Sleep
 }catch(e){}
 w=new Date-this.waitStamp,this.waitStamp=0;
 return w;
},
quit:function(){
 try{this.app.Quit();}catch(e){}
 this.app=null;
 if(typeof CollectGarbage=='function')
  setTimeout('CollectGarbage();',0);	//	CollectGarbage() undocumented IE javascript method: 先置為 null 再 CollectGarbage(); 設置為null,它會斷開對象的引用，但是IE為了節省資源（經常釋放內存也會佔系統資源），因此採用的是延遲釋放策略，你調用CollectGarbage函數，就會強制立即釋放。	http://www.cnblogs.com/stupidliao/articles/797659.html
 return;
},
//	用IE.doc().title or IE.app.LocationName 可反映狀況
doc:function(){
 try{return this.app.document;}catch(e){}
},
href:function(){
 try{return this.app.LocationURL;}catch(e){}
},
win:function(){
 try{return this.doc().parentWindow;}catch(e){}
},
/*
reload:function(){
 try{IE.win().history.go(0);IE.wait();}catch(e){}
},
*/
getE:function(e,o){
 try{return (o||this.doc()).getElementById(e);}catch(e){}
},
getT:function(e,o){
 try{return (o||this.doc()).getElementsByTagName(e);}catch(e){}
},
//	name/id, HTML object to get frame, return document object or not
frame:function(n,f,d){
 try{
  f=f?f.getElementsByTagName('frame'):this.getT('frame');
  if(isNaN(n))
   if(!n)return f;
   else for(var i=0;i<f.length;i++)if(f[i].name==n){n=i;break;}
  if(!isNaN(n))return d?f[n].contentWindow.document:f[n];
 }catch(e){}
},
//	IE.frames()['*']	IEApp.document.frames
//	Cross Site AJAX	http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx
//	Cross-Site XMLHttpRequest	http://ejohn.org/blog/cross-site-xmlhttprequest/
frames:function(){
 try{
  var i=0,f=this.getT('frame'),r=[];
  for(r['*']=[];i<f.length;i++)
   r['*'].push(f(i).name),r[f(i).name]=r[i]=f(i);
  //	use frame.window, frame.document
  return r;
 }catch(e){}
},
//formNA:0,	//	form name array
fillForm_rtE:0,	//	return name&id object. 設置這個還可以強制 do submit 使用 name 為主，不用 id。
fillForm:function(pm,l,fi){	//	parameter={id/name:value}, do submit(num) 或 button id, submit 之 form index 或 id
 try{
  //	,g=f.getElementById	
  var i,j,n={},h=0,f=this.doc().forms[fi||0]||{},t,s=function(o,v){
	 t=o.tagName.toLowerCase();
	 if(t=='select')o.selectedIndex=v;	//	.options[i].value==v	.selectedIndex= 的設定有些情況下會失效
	 //	參考 cookieForm
	 else if(t=='input'){
	  t=o.type.toLowerCase();	//	.getAttribute('type')
	  if(t=='checkbox')o.checked=v;
	  else if(t!='radio')o.value=v;
	  else if(o.value==v)o.checked=true;else return true;	//	return true: 需要再處理
	 }else if(t=='textarea')o.value=v;
	};
/*	needless
  if(!f){
   f=this.getT('form');
   for(i in f)if(f[i].name==fi){f=a[i];break;}
  }
  if(!f)f={};
*/
  for(j in pm)
   if(!(i=/*f.getElementById?f.getElementById(j):*/this.getE(j)) || s(i,pm[j]))n[j]=1,h=1;
  if((h||this.fillForm_rtE) && (i=f.getElementsByTagName?f.getElementsByTagName('input'):this.getT('input')))
   for(j=0;j<i.length;j++)
    if(i[j].name in n)s(i[j],pm[i[j].name]);
    else if(l&&typeof l!='object'&&l==i[j].name)l=i[j];
    //if(i[j].name in pm)s(i[j],pm[i[j].name]);
  if(l){
   if(i=typeof l=='object'?l:/*f.getElementById&&f.getElementById(l)||*/this.getE(l))i.click();
   else f.submit();
   this.wait();
  }else if(this.fillForm_rtE){
   h={'':i};
   for(j=0;j<i.length;j++)if(i[j].name)h[i[j].name]=i[j];
   return h;
  }
 }catch(e){}
 return this;
},
setLoc:function(w,h,l,t){
 try{
  var s=this.win().screen;
  with(this.app){
   if(w){Width=w;if(typeof l=='undefined')l=(s.availWidth-w)/2;}
   if(h){Height=h;if(typeof t=='undefined')t=(s.availHeight-h)/2;}
   if(l)Left=l;
   if(t)Top=t;
  }
 }catch(e){}
 return this;
},
write:function(h){
 try{
  if(!this.doc())this.go('');
  with(this.doc())open(),write(h||''),close();
 }catch(e){}
 return this;
},
//	使之成為 dialog 形式的視窗	http://members.cox.net/tglbatch/wsh/
setDialog:function(w,h,l,t,H){
 try{
  with(this.app)FullScreen=true,ToolBar=false,StatusBar=false;
 }catch(e){}
 this.setLoc(w,h,l,t);
 if(H)this.write(H).focus();
 try{
  //	太早設定 scroll 沒用。
  with(this.doc().body)scroll='no',style.borderStyle='outset',style.borderWidth='3px';
 }catch(e){}
 return this;
},
show:function(s){try{this.app.Visible=s||typeof s=='undefined';}catch(e){}return this;},
focus:function(s){try{if(s||typeof s=='undefined')this.win().focus();else this.win().blur;}catch(e){}return this;}
};	//	IEA.prototype={




//	WSH環境中設定剪貼簿的資料：多此一舉	http://yuriken.hp.infoseek.co.jp/index3.html	http://code.google.com/p/zeroclipboard/
setClipboardText[generateCode.dLK]='IEA';//,clipboardFunction
function setClipboardText(cData,cType){
 if(typeof clipboardFunction=='function')return clipboardFunction();
 var IE=new IEA;
 if(!IE.OK(1))return '';
 if(!cType)cType='text';

 with(IE.win())
  if(cData)window.clipboardData.setData(cType,cData);
  else cData=window.clipboardData.getData(cType);

 IE.quit();//try{IEApp.Quit();}catch(e){}
 return cData||'';
}

//	WSH環境中取得剪貼簿的資料
var getClipboardText=setClipboardText;







//--------------------------------------------------------------------------------//




/**
 * @name	CeL map function
 * @fileoverview
 * 本檔案包含了 map 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.map';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.map
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {


var _module_name = module_name;
//requires
if (library_namespace.use( [ 'data', 'net.web' ], module_name))
	return;
//	module_name 會被重設
module_name = _module_name;

var XML_node = library_namespace.net.web.XML_node,
set_attribute = library_namespace.net.web.set_attribute,
remove_all_child = library_namespace.net.web.remove_all_child,
set_class = library_namespace.net.web.set_class,
split_String_to_Object = library_namespace.data.split_String_to_Object;


/**
 * null module constructor
 * @class	map 的 functions
 */
CeL.net.map
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.net.map
.prototype = {
};





/*	2008/5/29 20:6:23-6/4 2:10:21
7/3 13:34	showNeighbor: 可拖曳 loc->name/address, 有資料的提高優先權, bug fix: 有些太遠的還是會被列入, 有些近的可能因為不是住址而不會被列入
7/9 13:9:15	context menu
7/9 21:12:3	getLocations
2009/7/20 20:27:58	稍作修正


bug:
名稱相同時會出現被覆蓋的情況!


TO TEST:


showClass.setRepository('_ev_');

sC=showClass.showOnScope;

sC('mp',GLog.write);

sC('Fb','mp');

sC('y','Fb');

sC('A','y');


to use:

<script type="text/javascript" src="map.js"></script>
<script type="text/javascript">//<![CDATA[
wAPIcode('Gmap');
//]]></script>


TODO:
分類(Categories)&分顏色顯示
Auto Zoom Out	http://esa.ilmari.googlepages.com/sorry.htm
search data only
preload map & markers
GDirections
圈選
用經緯度查詢

c.f. http://jmaps.digitalspaghetti.me.uk/

http://www.ascc.sinica.edu.tw/nl/90/1706/02.txt
臺灣地區地名網站
http://tgnis.ascc.net
http://placesearch.moi.gov.tw/index_tw.php

地名學名詞解釋彙編
http://webgis.sinica.edu.tw/geo/Termquery.asp

臺灣地區地名相關文獻查詢系統
http://webgis.sinica.edu.tw/geo/reference.html

經濟部中央地質調查所-地質資料整合查詢
http://datawarehouse.moeacgs.gov.tw/geo/index/GISSearch/MSDefault.htm


http://gissrv3.sinica.edu.tw/tgnis_query/link.php?cid=1
http://www.edu.geo.ntnu.edu.tw/modules/wordpress/2008/06/08/yxaewaweaeobmh/


http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=1&d_database=25k_2002
http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=1085&d_database=5000_1
http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=01663&d_database=chen_quo
http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=1663&d_database=chen_jen
http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=11880&d_database=tw_fort
http://gissrv3.sinica.edu.tw/search/left2_detail.php?d_number=02713&d_database=ching

http://gissrv3.sinica.edu.tw/input/detail.php?input_id=45875

資料庫	編號	類型(類別)	名稱	地理座標(經緯度)	所屬縣市鄉鎮(所屬行政區,地點)	別稱	註記(所在圖號)	意義(說明)



http://www.isp.tw/zip.php

小工具

1.溫度轉換
2.進位換算
3.BMI值及熱量需求計算
4.角度徑度換算
5.度量衡計算
6.區碼國碼查詢
7.郵遞區號查詢
8.金融機構代號查詢
9.色彩表示法查詢
10.摩斯密碼及字母述語
11.生肖星座查詢
12.婦女安全期計算
13.花言花語查詢
14.常用機關電話查詢
15.航空公司機場代碼查詢
16.簡易匯率換算
17.國曆農曆換算
18.急救及疾病忌口寶典
19.尺碼對照表
20.自訂公式計算
21.股票投資組合管理


*/



var formToolPath='../order/formTool.js';





/*	初始化 Google Gears
	http://code.google.com/apis/gears/gears_init.js
	http://blog.ericsk.org/archives/978
	http://chuiwenchiu.spaces.live.com/blog/cns!CA5D9227DF9E78E8!1063.entry

	Google Gears退休: Gears功能正被整合到HTML5規格中
	we expect developers to use HTML5 for these features moving forward as it's a standards-based approach that will be available across all browsers.
	http://it.solidot.org/article.pl?sid=09/12/03/0539248
*/
function initGGears(){
 // 檢查是否已經定義 Google Gear
 if(window.google&&google.gears)return;

 var factory=null;
 // 依據不同的瀏覽器，採用不同方式產生 GearFactory
 if(typeof GearsFactory!='undefined')
  //	Firefox
  factory=new GearsFactory();
 else try{
  //	IE
  factory = new ActiveXObject('Gears.Factory');
  // privateSetGlobalObject is only required and supported on WinCE.
  if(factory.getBuildInfo().indexOf('ie_mobile')!=-1)
   factory.privateSetGlobalObject(this);
 }catch(e){
  //	Safari
  if(typeof navigator.mimeTypes!='undefined' && navigator.mimeTypes["application/x-googlegears"]){
   factory=document.createElement("object");
   factory.style.display="none";
   factory.width=factory.height=0;
   factory.type="application/x-googlegears";
   document.documentElement.appendChild(factory);
  }
 }
 if(!factory)
  return 1;

 if(!window.google)window.google={};
 if(!google.gears)google.gears={factory:factory};

}


/*
f={catch:true/false/update, restore:false/true.}
*/
catchFile.ls=0;	//	localServer
catchFile.sn='catch-files';	//	storeName: 定義 Managed Store 的名稱，這個名稱可用於 createManagedStore, removeManagedStore 和 openManagedStore 三個 API
catchFile.s=0;	//	managed store
//
catchFile.f=function(url,success,captureId){};
catchFile.fL=[location.pathname];	//	file list
catchFile.doCache=1;
catchFile.noAsk=1;
function catchFile(fList,f){
 var _f=arguments.callee;
 if(!_f.doCache)return;

 if(window.location.protocol=='file:'){
  sl('catchFile: Google Gears 不能在本機上執行或測試！');
  return 0;
 }

 if(initGGears()){
  if(_f.answered)return 0;
  _f.answered=1;
  if(!_f.noAsk&&confirm('使用本功能必須安裝 Google Gears，請問您要安裝嗎？'))
   window.location.href='http://gears.google.com/';//?action=install&message=加入你的訊息&return=安裝後要導回的網址
  else
   sl('<em>catchFile: 若不安裝 Google Gears 則將無法使用本功能！</em>');
  return 1;
 }

 if(!_f.ls)try{
  // 建立 Local Server
  _f.ls=window.google.gears.factory.create('beta.localserver','1.0');
 }catch(e){
  sl('catchFile: Could not create local server: ['+(e.number&0xFFFF)+'] '+e.message);
  return 2;
 }

 if(!_f.s)try{
  // 建立儲存空間
  _f.s=_f.ls.createManagedStore(_f.sn);
  _f.s=_f.ls.createStore(_f.sn);
 }catch(e){
  if(window.location.protocol=='file:')sl('Google Gears 不能在本機上執行測試!');
  else sl('catchFile: Could not create managed store: ['+(e.number&0xFFFF)+'] '+e.message);
  return 3;
 }

 if((fList instanceof String)&&fList){
  //	untested
  // 指定 json 的 url
  _f.s.manifestUrl(fList);
  // 開始確定版本及同步
  _f.s.checkForUpdate();

  // 為了確認是否同步結束了，可以加入下列的 timer 來檢查：
  var timer = google.gears.factory.create('beta.timer');
  // 每 500ms 檢查一下
  var timerId = timer.setInterval(function() {
   // 同步完成
   if (store.currentVersion) {
    timer.clearInterval(timerId);
    sl('同步完成');
   }
  }, 500);
 }else if((fList instanceof Array)&&fList.length)
  _f.fL=_f.fL.concat(fList);

 // If the store already exists, it will be opened
 if(_f.s)try{
  _f.s.capture(_f.fL,_f.f);
 }catch(e){
  if(e.message=='Url is not from the same origin')sl('需要在同樣的 domain!');
  else sl('catchFile: Could not capture file: ['+(e.number&0xFFFF)+'] '+e.message);
  return 4;
 }

/*
//	uncapture
for (var i=0;i<fList.length;i++){
 _f.s.remove(fList[i]);
}
//	removeStore
if(localServer.openStore(storeName)){
 localServer.removeStore(storeName);
 _f.s=null;
}
*/

}



/*	http://blog.wctang.info/2007/07/use-google-map-api-without-api-key.html
	驗證的程式叫 GValidateKey，是定義在 main.js，但呼叫的動作是寫在 maps.js 裡



function showClass(c,n){
 var i,sp='<hr style="width:40%;float:left;"/><br style="clear:both;"/>',h='<span style="color:#bbb;font-size:.8em;">'
	,p=function(m,p){sl(h+n+(p?'.prototype':'')+'.</span><em>'+m+'</em> '+h+'=</span> '+f(c[m]));}
	,f=function(f){return (f+'').replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;');};
 if(typeof c=='string'){
  if(!n)n=c;
  c=eval(c);
 }
 if(!n)n='';
 sl('<hr/>Show class: ('+(typeof c)+')'+(n?' [<em>'+n+'</em>]':'')+'<br/>'
	//+(n?'<em>'+n+'</em> '+h+'=</span> ':'')
	+f(c));
 if(c){
  sl(sp+'class member:');
  for(i in c)
   if(i!='prototype')p(i);
  sl(sp+'prototype:');
  c=c.prototype;
  for(i in c)
   p(i,1);
 }
 sl('<hr/>');
}

//showClass('GValidateKey');

_v={};
eval('_v.lp=lp;',GValidateKey);
//showClass(_v.lp,'lp');

eval('_v.j=j;',GValidateKey);
//showClass(_v.j,'j');

eval('_v.ep=ep;',GValidateKey);
showClass(_v.ep,'ep');

//sl(_v.lp('http:', 'lyrics.meicho.com.tw', '/game/index.htm').join('<br/>'));

var b = _v.lp('http:', 'lyrics.meicho.com.tw', '/game/index.htm');
    for (var c = 0; c < b.length; ++c) {
        var d = b[c];
        sl(d+'; '+_v.ep(d));
    }

*/
wAPIcode.hl='zh-TW';	//	語系: zh-TW, ja, en
function wAPIcode(w){
 var hl=arguments.callee.hl||'',APIkey={
  Google:{

 /*	在本機上試用 Google Map API 並不需要去申請 API Key
	2008/7/15 20:40:49	但幾天前起 GClientGeocoder 需要。而在 Firefox，即使在 file:// 也不可行??
 */


/*
	//	by fan0123321
	'http://lyrics.meicho.com.tw/':'ABQIAAAAx1BFd-K0IXzdNnudsKfW3BR_OWH2p1vlzGygO-LFq-ywbfjcNBQ4wJpNt5E4VTHG4JLZ_HX8LQxVEQ',
	'https://lyrics.meicho.com.tw/':'ABQIAAAAx1BFd-K0IXzdNnudsKfW3BQ2grkpcb8ONU70KrnysR7Wz3iAOhQ7rov77Kc_pTW2t8r5-BSiIg5j6w',
	'http://kanashimi.meicho.com.tw/':'ABQIAAAAx1BFd-K0IXzdNnudsKfW3BSETOz6DhT-d0fFy_mIERGWK3ymyxQKcydi2zFol0W_QslvBsxp3BffQQ',
	'https://kanashimi.meicho.com.tw/':'ABQIAAAAx1BFd-K0IXzdNnudsKfW3BTFY8WBNAy3k9U7ZNA5kvqHv9VA-BSzdXmlU2Sm9WU6hvuSysY85kLdGw',
*/
	//	by kanasimi
	'http://lyrics.meicho.com.tw/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RR_OWH2p1vlzGygO-LFq-ywbfjcNBQcZtd9Bp9zMEQhrEtSnBy9_wJQmg',
	//	事實上 domain-key 就夠了。
	//'http://lyrics.meicho.com.tw/program/map/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RQQofoUntuAmbaLi2tPP0I7mS20HxSIGUQ5BPerzSbJB2mFqHQq07idRg',
	'https://lyrics.meicho.com.tw/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RQ2grkpcb8ONU70KrnysR7Wz3iAOhS24gkxeP-OqUBmABKA7PZQoacWHQ',
	'http://kanashimi.meicho.com.tw/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RSETOz6DhT-d0fFy_mIERGWK3ymyxSPw4AHxgM4dHjkgesM0FKx4ui2BQ',
	'https://kanashimi.meicho.com.tw/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RTFY8WBNAy3k9U7ZNA5kvqHv9VA-BRu-OKx8fvfBtyuqJZfb5PK0HllUQ'

/*	事實上 [*.]*.com.tw 用下面這個也行。
	'http://com.tw/':'ABQIAAAAgGipxXX8cQ5RHLEVH9TO-RTXVjoday36ta5qc6JGQW5WaWldDhTZrWmq9ZDX6Bhhzgk7MlY9qQXvzA',

對 http://lyrics.meicho.com.tw/game/ 會檢查的：
http://lyrics.meicho.com.tw/game/
http://lyrics.meicho.com.tw/
http://www.lyrics.meicho.com.tw/game/
http://www.lyrics.meicho.com.tw/
http://meicho.com.tw/game/
http://meicho.com.tw/
http://com.tw/game/
http://com.tw/

*/


  },
  Yahoo:{
	//	by colorlessecho for Yahoo! map
	'http://lyrics.meicho.com.tw/':'XX9YCu_V34G1xvKMy7EOmVkPFtALrHIkVP_qG5ANRAzuTNlQKuoXVssSTBYiGSX9gjssAA--'
  },

	'Gmap':['Google',function(k){return 'http://maps.google.com/maps?file=api&amp;v=2&amp;hl='+hl+'&amp;key='+k;}],
	'API':['Google',function(k){return 'http://www.google.com/jsapi?hl='+hl+'&amp;key='+k;}],

	'YMap':['Yahoo',function(k){return 'http://api.maps.yahoo.com/ajaxymap?v=3.8&appid='+k;}],
	'twYMap':['Yahoo',function(k){return 'http://tw.api.maps.yahoo.com/ajaxymap?v=3.8&appid='+k;}],

	'':0
 };



 var l=window.location,h,a;

 if(!(w in APIkey)||!((a=APIkey[w]) instanceof Array)||!(a[0] in APIkey)||typeof (a=APIkey[a[0]])!='object')
  throw 'wAPIcode: This kind ['+w+'] is not included in our code pool!';

 if(l.protocol=='file:')
  //	取得任何 legal key
  for(h in a){if(typeof a[h]=='string')break;}
 else if(!((h=l.href.slice(0,l.href.lastIndexOf(l.pathname)+1)) in a))	//	this is for domain
 //else if(!((h=l.href.replace(/[^\/]+$/,'')) in a))	//	this is for domain+path
  throw 'This domain ['+h+'] is not included in '+APIkey[w][0]+' code pool!';
 //alert('['+h+']\n'+a[h]+'\n'+l.href+'\n'+l.pathname);

 iJS(h=APIkey[w][1](l=a[h]||''),1);	//	Firefox 使用 createElement('script') 不被接受！
 sl('wAPIcode: load ['+APIkey[w][0]+'] '+w+' [<a href="'+h+'">'+h+'</a>]');
 return [l,h];
}



//	init function

var SL=new Debug.log,sl=function(){SL.log.apply(SL,arguments);},err=function(){SL.err.apply(SL,arguments);},warn=function(){SL.warn.apply(SL,arguments);};

var gMap,mapO,mData,lostItem,gLocal,dLoc={tw:[23.7,121]};	//	台灣: 23.7,121


addLoad(function(){
 var b=SL.setBoard('log');
 if(window.location.protocol=='file:'&&b)b.style.display='block';	//	強制顯示 log

 if(init&&init.run)sl('Page loaded. Prepare to initial..');

 if(typeof GLatLng=='undefined'){sl('GMap does not loaded.');return;}

 for(var i in dLoc)
  dLoc[i]=new GLatLng(dLoc[i][0],dLoc[i][1]);

 setTimeout('init(0);',0);
});

init.run=1;
function init(i){
 if(!arguments.callee.run)return;

 var m=0,n;
 switch(i){
  case m++:
   setSize();
   if(typeof preLoadMap=='function')preLoadMap();
   break;
  case m++:
   catchFile.sn='map-files';
   catchFile.f=function(url,success,captureId){
	sl('Capture '+(success?'succeeded':'failed')+': <a href="'+url+'">'+url+'</a>');
   };
   catchFile([
	'map.js',
	'map.css'
   ]);
   break;
  case m++:
   initMap();
   initSearch();
   if(window.location.protocol=='file:')setTimeout('mapO.removeTM();',3000);	//	3000: 適当。隨 client 而有不同。
   break;
  case m++:
   readLoc();
   break;
  case m++:
   loadMapData();
   break;
  case m++:
   placeMapItem();
   break;
  case m++:
   if(typeof additionalFunc=='function')additionalFunc();
   break;
 }
 m=['Starting initial process. Catch files..','Catch done. Initial all components..','Map loaded. Loading address records..','address loaded. Loading map data..','map data loaded. placing map items..','placing done. Do additional works..','Initial done.'];
 sl('init: '+m[i]);
 if(arguments.callee.run && ++i<m.length)
  setTimeout('init('+i+');',1);
}

function setOverviewMap(i){
 var m=mapO.overviewMap,n;
 if(m && (n=m.getOverviewMap())){
  //	因為有時來不及反應，所以放這邊。
  if(!i)n.addControl(new GMenuMapTypeControl(1)),i=1,setTimeout('setOverviewMap(1);',500);
  else m.hide();
 }else /*m.show(),*/setTimeout('setOverviewMap();',500);
}


function initSearch(){
 if(typeof google!='undefined' && google.load)google.load("search","1",{callback:function(){
  gLocal=new getSearch(function(r){
   google.search.LocalSearch.resizeStaticMapUrl(r,100,140);
   mapO.setLatLng(r.address||r.titleNoFormatting,r.lat,r.lng);
   sA(r.address,r.titleNoFormatting,r.phone.join('<br/>')+'<br/>'+r.address);
   //	http://code.google.com/apis/ajaxsearch/documentation/reference.html#_class_GlocalResult
   var h='<div style="background-color:#fef;margin-left:3em;margin-right:3em;padding-top:.5em;padding-bottom:.5em;font-size:.8em;clear:both;margin-bottom:40px;"><b onclick="sA(\''+UnicodeToHTML(r.address,2)+'\',\''+UnicodeToHTML(r.titleNoFormatting,2)+'\',\''+UnicodeToHTML(r.phone.join('<br/>')+'<br/>'+r.address,2)+'\');" title="'+r.titleNoFormatting+'" style="color:#94e;cursor:pointer;"><img style="margin-top:-.5em;float:left;margin-right:1em;" src="'+r.staticMapUrl+'"/>'+r.title
	+'</b><br/>'+r.address+'<br/>'+r.phone.join('<br/>')+(r.phone.length?'<br/>':'')/*+r.listingType+'<br/>'*/+r.content+'<br/>('+r.lat+','+r.lng+') <a href="'+r.url+'" target="_blank">Use Google Maps</a></div>';
   if(sA2.c)sA2.c.innerHTML+=h;else sl(h);
  },'Local');
  sl('initSearch: local search initialed.');
 }});
 else sl('initSearch: Can not initial local search. Please load API.');
}


var _map_tmp_message;
initMap.flag={backgroundColor:'#DDE'};
function initMap(){
 var a,m,i,_f=arguments.callee;
 mapO=new gMap('map_canvas',dLoc.tw,_f.flag);
 //if(!mapO)return 1;

 //mapO.geocoder.setBaseCountryCode('TW');
 sl('initMap: set geocoder country code: '+mapO.geocoder.getBaseCountryCode());

 //	要先 show 才能得到 getOverviewMap()
 if(m=mapO.overviewMap)
  //	IE7 上 .hide() 時 .show() 會出錯
  //	2008/9/6 22:37:33	IE6 也會出錯了
  if(navigator.userAgent.indexOf('MSIE')==-1)
   m.show(),setOverviewMap();

 //	small mark template	http://econym.googlepages.com/custom.htm	http://mapki.com/wiki/Available_Images	http://econym.googlepages.com/geicons.htm	http://code.google.com/apis/maps/documentation/overlays.html#Icons_overview
 //	iconSize 的處理還是有問題。
 mapO.icon(_f.iconOption||{
	shadow:'http://labs.google.com/ridefinder/images/mm_20_shadow.png',
	iconSize:new GSize(12,20),
	shadowSize:new GSize(22,20),
	iconAnchor:new GPoint(6,20),
	infoWindowAnchor:new GPoint(5,1)
 },1);
 mapO.icon(_f.iconArray||[
	{image:'http://labs.google.com/ridefinder/images/mm_20_green.png'},//http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png//{shadow:'http://maps.google.com/mapfiles/kml/pal5/icon14s.png',image:'http://maps.google.com/mapfiles/kml/pal5/icon14.png'},//
	{image:'http://labs.google.com/ridefinder/images/mm_20_yellow.png'},
	{image:'http://labs.google.com/ridefinder/images/mm_20_green.png'},//{icon:G_DEFAULT_ICON},
	{image:'http://labs.google.com/ridefinder/images/mm_20_orange.png'},//'http://maps.google.com/mapfiles/arrow.png',
	''
 ]);
 mapO.runAfterAdd=function(o){getO.add(o.address,o.name);showML.sel(o);showML();};
 mapO.runOnClick=function(o){showML.sel(o);showML();};
 mapO.runAfterRemove=function(o){if(showML.sel()==o)showML.sel(null,1);showML();};
 mapO.notFound=function(a,d){sl('<em>沒找到 ['+a+'] '+d.name+'</em>');return false;};
 //	在 unload 的時候呼叫 GUnload 以避免瀏覽器 memory leak。
 addListener(0,'unload',function(){try{GUnload();}catch(e){}});

 a=function(htm,t,js,ico){
  return '<div class="cm_line" title="'+t+'" onclick="'+js+'" onmouseover="this.className=\'cm_line_mo\';" onmouseout="this.className=\'cm_line\';"><img style="height:1em;width:1em;" src="'+(ico||'http://www.google.com/mapfiles/markerTransparent.png')+'"/> '+htm+'</div>';
 };
 if(m=mapO.map)
  //	use google's message
  i=function(i){try{
	eval('_map_tmp_message=p('+i+');',m);
	var a=_map_tmp_message;
	//sl('setContextMenu '+i+': '+a);
	return a&&a.length<8?a:'';
  }catch(e){}},
  mapO.setContextMenu([
	a(i(10985)||'Zoom in','將地圖於此放大','mapO.showContextMenu(0),mapO.map.zoomIn(mapO.clickLatLng,true);','http://www.google.com/mapfiles/zoom-plus.png')
	,a(i(10986)||'Zoom out','將地圖於此縮小','mapO.showContextMenu(0),mapO.map.zoomOut(mapO.clickLatLng,true);','http://www.google.com/mapfiles/zoom-minus.png')
	,a(/*i(11047)||*/'Set Center','將地圖於此置中','mapO.showContextMenu(0),mapO.setCenter(mapO.clickLatLng);','http://www.google.com/mapfiles/center.png')
	,'<hr/>'
	,a('Search near','搜尋附近','mapO.showContextMenu(0),showNeighbor(mapO.clickLatLng);','http://maps.google.com/mapfiles/kml/pal2/icon13.png')
  ].join('')),
  GEvent.addListener(m,"click",function(){
   mapO.showContextMenu(0);
  }),GEvent.addListener(m,"dragstart",function(){
   mapO.showContextMenu(0);
  });
}


function readLoc(){
 if(loadMapData.dataF)catchFile([loadMapData.dataF,mapO.locFP=loadMapData.dataF+'.adr.csv']);
 mapO.readLoc();
}


//loadMapData.baseD='';
//	預設可使用之模板
loadMapData.getHTM=function(d,type){
 var l=mData[d.name||d.address],a=[mapO.getPoint(d,type)],r=[];
 if(d.address||'')a.unshift(d.address);
 l=l?l.link:'';
 if(!loadMapData.baseD)loadMapData.baseD='';
 if(d.name)		//	不能用 this.baseD
  r.push('<em>'+(l?'<a href="'+loadMapData.baseD+l+'" target="_blank">'+d.name+'</a>':d.name)+'</em>');
 if(d.dscr)r.push(d.dscr);
 r.push('<div class="adr">'+a.join('<br/>')+'</div>');
 if(typeof d.getLength=='function')r.push('length: '+(d.getLength()/1000).toFixed(3)+'km');
 if(typeof d.getArea=='function')r.push('面積: '+d.getArea().toFixed(3)+'m&sup2;');
 //if(showNeighbor.pointer&&d.getLatLng)r.push('距離 '+showNeighbor.pointer.distanceFrom(d.getLatLng()));
 //r.push(,'<hr class="sp"/><span onclick="">search near</span>');
 return r.join('<br/>').replace(/(<\/(div|p)>)\s*<br\/?>/g,'$1');
};
loadMapData.lessItems=3;
loadMapData.forEach=function(mapData,index){};
/*
loadMapData.zIndexP=function(){
 sl('click '+this.name);
 return -1;
};
*/
function loadMapData(){
 /*	load: 這裡假設 data 中標題可作為id（獨一無二）
	map data: [標題	敘述(description)	link	_data_]
	_data_: search string/kind	additional description/data of different kind of data
		search string/additional description (用括弧框起來的)
		'marker'	lat	lng
		'polyline'	points	levels
		'polygon'	points	levels

	mData[標題||address]={};
 */
 mData={};
 var i=0,m,t,_f=arguments.callee;
 _f.run=1;

 try{t=getU(_f.dataF);}catch(e){sl('Get data file ['+_f.dataF+'] error: '+e.message);}
 if(t)t=parseCSV(t);//t.replace(/\r+/g,'').replace(/\n+$/,'').replace(/^\n+/,'').split('\n');
 else t=[],showML.write('No list got of ['+_f.dataF+'].');

 showML.write('總共 '+t.length+' 筆資料正處理中，請稍候…');
 sl('loadMapData: Found '+t.length+' lines. Parsing.. (<em onclick="if(loadMapData.run)loadMapData.run=0,sl(\'User stopped.\');" style="cursor:pointer;">stop</em>)');
 for(;i<t.length&&_f.run;i++){
  //sl(t[i][7]);
  //if(t[i] && (m=t[i].replace(/\\n/g,'<br/>').split('\t')).length>_f.lessItems)
  if(t[i].length>_f.lessItems)
   _f.forEach(t[i],i);
 }
 _f.run=0;
}


placeMapItem.done=function(i){
 //sl('placing done.');
 showML.refresh=1,showML();
 //	workaround 權宜之計: iconSize 的處理還是有問題。
 setTimeout('if(mapO)mapO.iconA[2].image=G_DEFAULT_ICON.image;',500);
};
placeMapItem.step=function(i){
 var _t=this;
 if(_t.run&&i<_t.stepA.length&&(!_t.loadMax||i<_t.loadMax))
  mapO.add(mData[_t.stepA[i++]]),setTimeout('placeMapItem.step('+i+');',0/*i>40?400:i+i*i/4*/);
 else if(_t.done)_t.done(i);
};
placeMapItem.loadMax=80;
function placeMapItem(){
 var _f=arguments.callee,i;
 if(_f.noPlace){	//	一開始不列出點
  if(typeof _f.noPlace=='function')_f.noPlace();
  return;
 }

 lostItem={};
 _f.run=1;
 //showML();
 showML.refresh=0;
 if(_f.step){
  _f.stepA=[];
  for(i in mData)
   lostItem[i]=mData[i],_f.stepA.push(i);//,mapO.add(mData[i]);
  setTimeout('placeMapItem.step(0);',0);
 }else{
  for(i in mData)mapO.add(mData[i]);
  if(_f.done)_f.done();
 }
}



//	interface

//	2008/9/6 15:7:34
//setSize.size=[880,320,240];	//	width, height, menuWidth
setSize.size='95%,70%,25%'.split(',');	//	width, height, menuWidth
setSize.setContainer=function(){
 try{
  this.menuC=(this.menu=document.getElementById('markerList')).parentNode;	//	menuC: menu container
  return this.container=document.getElementById('map_canvas').parentNode;
 }catch(e){}
};
function setSize(){
 var _f=arguments.callee,s=_f.size,_s=s.join('\0').split('\0'),m,a=function(i,k){
	if(!isNaN(s[i]))s[i]+='px';
	if(typeof _s[i]=='string'&&(m=_s[i].match(/^(\d+)%$/)))
	 k=k?'Height':'Width',
	 _s[i]=Math.floor((window.innerHeight?window['inner'+k]:document.documentElement&&document.documentElement.clientHeight?document.documentElement['client'+k]:document.body['offset'+k])*m[1]/100);
 };

/*
 //	from getWinStatus()
 with(document.body.style)width=height='100%';
 sl('setSize: window.inner: '+window.innerWidth+','+window.innerHeight);
 sl('setSize: window.page: '+window.pageXOffset+','+window.pageYOffset);
 sl('setSize: screen: '+screen.width+','+screen.height);
 sl('setSize: document.documentElement.client: '+document.documentElement.clientWidth+','+document.documentElement.clientHeight);
 sl('setSize: document.body.scroll: '+document.body.scrollWidth+','+document.body.scrollHeight);
 sl('setSize: document.body.offset: '+document.body.offsetWidth+','+document.body.offsetHeight);
 sl('setSize: document.body.client: '+document.body.clientWidth+','+document.body.clientHeight);
*/

 a(0);
 a(1,1);
 a(2);
 //sl('setSize: '+_s);

 a=_f.container;
 if(!a&&!(a=_f.setContainer()))return;

 with(a.style)width=s[0],height=s[1];
 with(_f.menuC.style)width=s[2],height=s[1];

 _f.menu.style.height=(_s[1]-_f.menu.offsetTop)+'px';

 //sl('setSize: '+a.offsetWidth+'-'+_f.menuC.offsetWidth+'='+(a.offsetWidth-_f.menuC.offsetWidth));
 //sl('setSize: '+_s[0]+'-'+_s[2]+'='+(_s[0]-_s[2]));
 initMap.flag.size=[
	a.offsetWidth-_f.menuC.offsetWidth-(navigator.userAgent.indexOf('MSIE')==-1?13:1),	//	13: 和 scrollbar 有關嗎??
	(navigator.userAgent.indexOf('MSIE')==-1?_s[1]:_s[1])	//	_s[1] 不能改成 a.offsetHeight
 ];
}



showML.refresh=1;
showML.closeMark='×';
showML.indexA='iA';
showML.selClass='sel';
showML.specialKind='sp';
showML.isSelR=new RegExp('(^|\\s+)'+showML.selClass);
//showML.selO=null;
showML.sel=function(o,removed){
 var _t=this;
 if(typeof o!='undefined'){
  //	GMarker.setImage(src)
  if(!removed&&_t.selO&&_t.selO.setImage)
   try{_t.selO.setImage(mapO.icon().image);}catch(e){}	//	用 try 是因為有時被刪了可是卻還是在（動作太快？），這時要 setImage 會出錯。
  _t.selO=o;
  if(o&&o.setImage)o.setImage(mapO.icon(showSP.selectedI).image);
 }
 return _t.selO;
};
showML.getName=function(o){
 var name=o.parentNode.attributes.getNamedItem(this.indexA),type;
 if(name&&(name=name.nodeValue)&&(type=name.match(/^([a-z]+),(.+)$/i))){
  //sl('showML.getName: ['+type[1]+'] '+type[2]+'('+getO.alias(type[2])+','+mapO.getO(type[1],getO.alias(type[2]))+')');
  //name=,type=type[1];
  return [getO.alias(type[2]),type[1]]//[name,type];
 }
};
showML.write=function(t){
 try{document.getElementById('markerList').innerHTML=t;}catch(e){}
};
function showML(o){
 if(!mapO)return;	//	尚未 initial?

 var _f=arguments.callee;
 if(o){
  var name,type;
  if(type=_f.getName(o)){
   name=type[0],type=type[1];
   if(o.className=='closeMark')
    mapO.remove(name,type);
   else{
    showML.sel(mapO.getO(type,name));//.setImage(mapO.icon(2).image);
    mapO.show(name,type);
    o=o.parentNode;
    for(var i=0,LI=o.parentNode.parentNode.getElementsByTagName('li');i<LI.length;i++)
     if(_f.isSelR.test(LI[i].className))LI[i].className=LI[i].className.replace(_f.isSelR,'');
    o.className+=' '+_f.selClass;
   }
  }
  return false;
 }

 if(!_f.refresh)return;
 //alert(mapO.getOArray('type').join('\n'));

 var t=['<ol>'],a,i,j,id,OK={};
 for(j in mapO.supportKind()){
  a=mapO.getO(j);
  for(i in a){
   //sl(a[i].name+','+a[i].address);
   if(a[i].name in lostItem)delete lostItem[a[i].name];
   else if(('address' in a[i]) && (a[i].address in lostItem))delete lostItem[a[i].address];

   id=typeof a[i].getLatLng=='function'?a[i].getLatLng():a[i].name;
   if(!(id in OK))
    OK[id]=1,
	t.push('<li '+_f.indexA+'="'+j+','+i+'" class="'+(j=='marker'?'':_f.specialKind)+' '+(_f.sel()==a[i]?_f.selClass:'')+'"'
     +'><a href="#" title="'+UnicodeToHTML((
		((a[i].name+'').indexOf(id)!=-1||(a[i].dscr+'').indexOf(id)!=-1?'':id+'\n')
		+(a[i].dscr||i)
		+(showNeighbor.pointer&&typeof a[i].getLatLng=='function'?'\n距離定點 '+(a[i].getLatLng().distanceFrom(showNeighbor.pointer.getLatLng())/1000||0).toFixed(3)+' km':'')
	  ).replace(/<br\/?>/gi,'\n').replace(/\n{2,}/g,'\n'),2)+'" onclick="return showML(this);" onmouseover="showSP(this,1);" onmouseout="showSP(this);">'
     +(a[i].name||i).replace(/<[^>]+>/g,'')
     +'</a> [<a href="#" class="closeMark" onclick="return showML(this);" title="關閉">'+_f.closeMark+'</a>]</li>');// title="remove marker"
  }
 }
 for(i in lostItem)t.push('<li class="lost"><a href="#" onclick="mData['+dQuote(i,0,"'")+'].show=1;mapO.add(mData['+dQuote(i,0,"'")+']);return false;" title="'+UnicodeToHTML(mData[i].name||mData[i].type||'')+'">'+i+'</a></li>');
 t.push('</ol>');
 //sl(UnicodeToHTML(t.join('')),1);
 _f.write(t.join(''));
 if(typeof dealLink=='function')setTimeout('dealLink(0,1);',0);
 return false;
}


//	show spot
showSP.defaultI=0;	//	default icon index
showSP.selectedI=2;	//	selected icon index
function showSP(o,i){
 var _f=arguments.callee;
 if(o){
  var name,type;
  if(type=showML.getName(o)){
   name=type[0],type=type[1];
   o=mapO.getO(type,name);
   if(o&&o.setImage&&o!=showML.sel())
    //sl('showSP: set icon of ['+o.name+'] to '+i),
    o.setImage(mapO.icon(i).image);
  }
  return false;
 }

}

//	應用

function removeAll(){
 showML.refresh=0,lostItem={};
 if(mapO)mapO.removeAll();	//	尚未 initial?
 if(showML)showML.sel(null,1),showML.refresh=1,showML();
}


//	不能造成 type 改變!
function normalizeAddress(t){
 var _f=arguments.callee,a='０１２３４５６７８９';
 if(!_f.dc){_f.nr=new RegExp('['+a+']','g');_f.dc={};for(var i=0;i<a.length;i++)_f.dc[a.charAt(i)]=i;}
 return t.replace(/[\s　]+/g,'').replace(_f.nr,function($0){return _f.dc[$0];});//.replace(/號([^樓]+樓|之.{1,2})$/,'號');
}
/*
http://www.post.gov.tw/post/internet/f_searchzone/sz_a_b_ta.jsp#a
縣市
鄉鎮市區	【市】為縣轄市
村里	直轄市：台北市、高雄市及省轄市：基隆市、新竹市、台中市、嘉義市、台南市以外地區由於路名結構變化較大，有些地區沒有路、街，僅有「村」、「里」名稱
鄰
路街	路名中不可使用（全、半形）阿拉伯數字，必須一律使用中文數字，如中正二路等，惟門牌號不必輸入。	新村、山莊、新城、工業區等與街、路同級之名稱
段
巷	文字巷
弄
號
\d(之\d)樓(之\d)

縣市鄉鎮區村里鄰路街段巷弄號樓
*/
function parseAddress(adr){
 var a={},i,v,w='縣市鄉鎮區村里鄰路街段巷弄號樓',r=new RegExp('[^'+w+']+(['+w+'])','g');
 var _=adr.replace(/[　\s]+/g,'').replace(/號([^樓F]+)F$/,'號$1樓').replace(/^(\d+)?[台臺]灣/,'$1').replace(/^\d+/,function($0){sl('zip:'+$0);r.zip=$0;return '';}).replace(r,function($0,$1){
	 v=$0;
	 if(/縣市/.test(i=$1)&&!r.zip)v.replace(/^\d{3}\d{2}?}/,function($0){r.zip=$0;return '';});
	 a[i]=v;
	 sl(v);
	 return '';
	});
 sl('['+adr+'] --- ['+_+']');
}


//	地址轉 index
getO.n={};	//	name(address) to mapO.getO's name
getO.add=function(alias,name,type){
 if(alias&&name&&alias!=name){
  if(type&&mapO.getO(type,alias)&&!mapO.getO(type,name)){
   var t=name;name=alias,alias=t;
  }
  //sl('getO.add: ['+alias+'] set to ['+name+']'),
  this.n[alias]=name;
 }
};
getO.alias=function(name){return this.n[name]||name;};
function getO(name){
 return mapO.getO(arguments.callee.n[name]||name);
}




/*	search address
sA(index of mData)
sA({type(where):'',name:'',description:''})
sA(type(where),name,description)
*/
function sA(i,a,b){
 if(!mData)return;	//	尚未 initial?
 if(!(i in mData)||arguments.length>1)
  //sl('sA: search '+i),
  mapO.searchPoint.apply(mapO,arguments);
 else
  //sl('sA: call mData['+i+']('+mData[i].type+')'),
  mapO.searchPoint(mData[i]);
 return false;
}

//	先找尋現有資料
function sA2(adr,noFit){
 var _f=arguments.callee;

 if(!noFit){
  showFit(adr
	,function(k,o){return k&&(o.name+o.description).indexOf(k)!=-1;}
	,function(k){_f(adr,1);}
  );
  return;
 }

 if(typeof adr_to_mData!='object'||mapO.LatLngR.test(adr))return sA(adr);

 //return sA(adr_to_mData[adr]||adr);


 if(!_f.c)_f.c=document.getElementById('guess');

 if(!(adr in adr_to_mData)&&(adr.toLowerCase() in adr_to_mData))
  //sl('sA2: ['+adr+']→['+adr.toLowerCase()+']'),
  adr=adr.toLowerCase();
 if(adr_to_mData[adr] in mData){
  var a=adr_to_mData[adr];
  mData[a].show=1;	//	置中
  sA(a);
  if(showML.selO)mapO.showWindow(showML.selO);
 }else if(!_f.c)sA(adr);
 else mapO.getLocations(adr,function(r){
	 var cM='<div style="float:right;cursor:pointer;" title="close" onclick="sA2.c.style.display=\'none\';">[×]</div>';
	 if(gLocal){gLocal.searcher.setCenterPoint(showNeighbor.pointer.getLatLng()||mapO.setCenter()||'台灣');gLocal.s(adr);}
	 if(!r.length){_f.c.innerHTML=cM+'使用 GClientGeocoder.getLocations 沒找到 [<span style="color:#e23;">'+adr+'</span>]：<br/>'+mapO.GeoStatus(mapO.getLocations.errno),_f.c.style.display='block';return;}
	 if(r.length==1&&adr==r[0][2]){sA(adr);if(showML.selO)mapO.showWindow(showML.selO);return;}
	 var i=0,t=[cM+'對於 [<span style="color:#e23;">'+adr+'</span>]，您是不是指：<ol>'];
	 for(;i<r.length;i++)
	  if(r[i][0])
	   //sl('sA2: '+r[i]),
	   t.push('<li><span title="'+r[i][0]+','+r[i][1]+'">〒</span> <span class="point" onclick="sA(this.title);if(showML.selO)mapO.showWindow(showML.selO);return false;" title="'+r[i][2]+'">'+r[i][2]+'</span></li>');
	 t.push('</ol>');
	 _f.c.innerHTML=t.join('');
	 _f.c.style.display='block';
	});//sA(adr);
 return false;
}



/*
從 mData show 符合條件的
*/
showFit.showZoom=40;	//	這以下就 zoom
showFit.limit=80;	//	最多取點數
function showFit(k,func,notFound){
 if(typeof k=='undefined'||!func)return;
 removeAll();
 showML.write('頁面資料讀取中，請稍候…');

 var i,p=[],b,_f=arguments.callee;
 for(i in mData)
  if(func(k,b=mData[i],i) && (b=mapO.searchPoint.call(mapO,b)))	//	確定有找到才 c++
   if(p.push(b), _f.limit&&p.length>_f.limit)break;

 if(p.length<_f.showZoom)
  if(p.length){
   //	zoom
   b=new GLatLngBounds();
   for(i=0;i<p.length;i++)
    b.extend(p[i]);
   mapO.setCenter({p:b.getCenter(),m:'pan',z:mapO.map.getBoundsZoomLevel(b)});
  }else if(notFound)notFound(k);

 return p;
}



/*	只顯示附近的spot
showNeighbor('高雄市苓雅區');

bug:

TODO:
setZoom: getBoundsZoomLevel
addSelf:	加入此點，使之受到管控。預設 false
不在管控內
*/
showNeighbor.pointer=null;	//	default GMarker
showNeighbor.addPointer=function(a){
 var _m=mapO.map,m=mapO.addMarker(
	 new GLatLng(22.62,120.33)//dLoc.tw
	 ,{draggable:true,title:'請拖曳我，以找出鄰近的點。',icon:mapO.icon(3)}
	);
 GEvent.addListener(m,"dragend",function(){
  showNeighbor(m.getLatLng());
 });

 if(this.l)GEvent.removeListener(this.l);
 this.l=GEvent.addListener(_m,"click",function(overlay,point){
  var i,p=[5,10,15,20,30,50],s='<br/><a href="#" onclick="return showNeighbor.byD();" title="search near">搜尋附近</a>';
  for(i=0;i<p.length;i++)s+=' <a href="#" onclick="return showNeighbor.byD('+p[i]+');">'+p[i]+'</a>';
  s+=' km';
  if(overlay==m)m.openInfoWindowHtml('經緯度: '+m.getLatLng()+s);
  else if(!overlay&&point)
   p=m.getLatLng(),m.setLatLng(point),
   m.openInfoWindowHtml(point+'<br/>from: '+p+',<br/>distance: '+(p.distanceFrom(point)/1000).toFixed(3)+'km'+s);
 });

 return this.pointer=m;
};
showNeighbor.arg={	//	傳給 .getNeighbor() 的參數
	//f:'n[i]=n[i][1][2];',	//	不能改變結構！因為需要 getBoundsZoomLevel
	d:30,
	c:9
};
showNeighbor.forEach=function(a){
 //sl('showNeighbor.forEach: ['+(typeof a[1][2])+'] '+a[1][2]);
 sA(a[1][2]);
};
showNeighbor.byD=function(d){
 var _t=this;
 if(d)_t.arg.d=d;
 if(_t.pointer)_t(_t.pointer.getLatLng());
 return false;
};
showNeighbor.notFound=function(address,address_not_found){
 showML.write('抱歉，找不到 <em>'+address+'</em>'+(address_not_found?'':' 附近的點')+'。');
};
function showNeighbor(l,f){//(location | [location, address], addSelf)
 if(!l)return;
 showML.write('頁面資料讀取中，請稍候…');
 var _f=arguments.callee,i,o,adr;
 if(l instanceof Array)adr=l[1],l=l[0];
 //sl('showNeighbor: ['+l+','+adr+'] '+(l instanceof GLatLng)+', '+mapO.getLatLng(l+''));
 if(!(l instanceof GLatLng))
  // 無此資料。嘗試取得 loc..
  return mapO.getLatLng(l+'',[function(p){_f([p,adr||l]);},function(p){if(p)return _f([p,adr||l]);_f.notFound&&_f.notFound(adr||l,1);}]);
 o=mapO.getNeighbor(l,_f.arg);
 if(o.length){
  removeAll();
  var bounds=new GLatLngBounds();
  bounds.extend(l);
  for(i=0;i<o.length;i++){
   if(!isNaN(o[i][1][1]))
    //sl('Add to bound: '+o[i][1][0]+','+o[i][1][1]),
    bounds.extend(new GLatLng(o[i][1][0],o[i][1][1]));
   //sl('add ['+o[i][1][2]+'] by '+(_f.forEach+'').slice(0,20)+'..');
   _f.forEach(o[i]);
  }
  if(!mapO.searchPoint.show)	//	若設了 searchPoint.show，還是會被其他的奪去…
   mapO.setCenter({p:bounds.getCenter(),m:'pan',z:mapO.map.getBoundsZoomLevel(bounds)});
 }else _f.notFound(l);
 if(_f.pointer)_f.pointer.setLatLng(l),_f.pointer.openInfoWindowHtml('搜尋 '+(adr?'<em title="'+l+'">'+adr+'</em> ':l)+' 四周 '+_f.arg.d+' km<br/>找到 '+o.length+'/(最多 '+_f.arg.c+') 個點。');
 //sl('showNeighbor: search around '+l+' (四周 '+_f.arg.d+' km) get '+o.length+'/(max '+_f.arg.c+') results.');
}














//	===================================================
/*
	** use Yahoo! Map to get position of a address

_=this

TODO:


HISTORY:
2008/7/31 19:56:29	create


http://tw.developer.yahoo.com/maps/
http://developer.yahoo.com/maps/ajax/V3.8/index.html
*/
var
getLatLon=

(function(){

var

//	class private	-----------------------------------

//	class name
n='getLatLon',

//	running now
r=0,

//	interval/timeout seed
s=''+Math.random()*1e12,


//	{ address: [function(lat, lng, address), not found function(address)], .. }
o={},

//	queue: [ adr, .. ]
q=[],


//	map object
m,

//	initial
i=function(){
 if(typeof YMap!='function'){
  //sl(n+': Please include YMap first!');
  return 1;
 }

 var o=document.createElement('div');
 document.body.appendChild(o);
 o.style.width=o.style.height='1px';	//	=0 會造成 .getArea() 出問題
 YEvent.Capture(m=new YMap(o),EventsList.onEndGeoCode,c);
 o.style.visibility='hidden';
 //o.style.display='none';	//	會造成 .getArea() 出問題

 //s=Math.random()*1e12+'';
},


//	do query
d=function(){
 //sl(n+'.do query: '+q[0]);
 if(!q||!q.length)r=0;
 else m.geoCodeAddress(q.shift());
},


//	catch function
c=function(r){
 var a=r.Address,f;

 if(f=_.interval)
  setTimeout(n+'("'+s+'");',f);
 else d();

 if(a in o)
  if(f=o[a],r.success)f[0](r.GeoPoint.Lat,r.GeoPoint.Lon,a);
  else f[1]&&f[1](a);
 delete o[a];
},


//	instance constructor	---------------------------
_=function(a,f,nf){	//	address, function, not found function
 if(a===s)return d();

 if(!a||!f || !m&&i())return 1;

 o[a+='']=[f,nf];

 //sl(n+': ('+q.length+')'+[a,f,nf]);
 q.push(a);

 if(!r)r=1,d();
};


//	class public interface	---------------------------

//	interval (ms)
_.interval=0;


//	class constructor	---------------------------

i();


return _;
})();	//	(function(){

//	===================================================


/*	old
//	use Yahoo! Map

//	interval
//getLatLon.t=200;

//	{ address: [function, not found function], .. }
getLatLon.o={};

//	queue: [ adr, .. ]
getLatLon.q=[];

//	initial
getLatLon.i=function(){
 if(typeof YMap!='function'){
  //sl('getLatLon: Please include YMap first!');
  return 1;
 }
 var c=document.createElement('div');
 document.body.appendChild(c);
 c.style.width=c.style.height=0;
 YEvent.Capture(this.m=new YMap(c),EventsList.onEndGeoCode,this.c);
 c.style.display='none';
 this.T=Math.random()*1e12+'';
};

//	catch function
getLatLon.c=function(r){
 var t=getLatLon;
 if(t.t)setTimeout('getLatLon.d("'+t.T+'");',t.t);else getLatLon.d();
 var f=t.o;
 if(r.Address in f)
  if(f=f[r.Address],r.success)f[0](r.GeoPoint.Lat,r.GeoPoint.Lon,r.Address);
  else f[1]&&f[1](r.Address);
 delete t.o[r.Address];
}

//	do query
getLatLon.d=function(){
 var _f=arguments.callee,_t=this,a,f,n;
 //sl('getLatLon.d: '+_t.q[0]);
 if(!_t.q||!_t.q.length)_t.r=0;
 else _t.m.geoCodeAddress(_t.q.shift());
};


//	running
//getLatLon.r=0;

function getLatLon(adr,f,nf){
 var _f=arguments.callee;
 if(adr===_f.T)return _f.d();
 if(!adr||!f || !_f.m&&_f.i())return;

 if(!_f.q)_f.q=[];
 //sl('getLatLon: ('+_f.q.length+')'+[adr,f,nf]);
 _f.o[adr]=[f,nf];
 _f.q.push(adr);

 if(!_f.r){_f.r=1;_f.d();}
}
*/








//	===================================================

/*
	main map function

_=this

TODO:

*/

//var
gMap=

(function(){

//	class private	-----------------------------------
var

//	class interface	-----------------------------------
_=function(){
 //	Dynamic Loading	http://code.google.com/apis/ajax/documentation/#Dynamic
 //if(typeof GMap=='undefined')google.load("maps","2",{language:"ja_JP",callback:mapsLoaded});

 //	init member
 var _t=this,i;
 //	initial instance object
 _t.locArray=[],_t.locArray2=[],_t.locArray_u={},_t.locArray2_u={},_t.iconA=[],_t.iconO={},_t.dMarkerO={};
 _t.kinds={marker:GMarker,polyline:GPolyline,polygon:GPolygon,xml:GGeoXml};	//	If this failed, maybe GMap didn't loaded?
 for(i in _t.kinds)
  if(i in _t)throw 'Error: ['+i+'] is already a member of me!';
  else _t[i]={};


 //	調整 GLatLng 的顯示
 GLatLng.prototype.toS=function(p){
  if(!p)p=_t.precision||0;
  return Number(this.lat()).toFixed(p)+','+Number(this.lng()).toFixed(p);
 };
 GLatLng.prototype.toString=function(p){return '('+this.toS(p)+')';};


/*
	http://blog.wctang.info/2007/07/use-google-map-api-without-api-key.html
	Geocode 查詢每天有 50000 次的限制	使用 Geocoder 就是要連到 Google 去做查詢，而現在 Google 在做 Geocode 查詢時會在 Server 端做 API key 的檢查，這個就躲不掉了
	http://blog.wctang.info/2007/07/use-google-map-geocoder-without-api-key.html


*/
 if(GBrowserIsCompatible()&&!_t.geocoder)
  with(_t.geocoder=new GClientGeocoder())
	setCache(null),	//	disable cache, 因為找到的都被管控了。
	setBaseCountryCode('tw');	//	語系

 //_t.readLoc();
 _t.initMap.apply(_t,arguments);//return _t.initMap.apply(_t,arguments);
};


//	class public	-----------------------------------


//	prototype	-----------------------------------
_.prototype={

//	這些函數可重寫
notFound:function(address,data){
 return 1;//throw 'Address ['+address+'] not found!';
},
//	增加 overlay 後
runAfterAdd:function(obj,type,data,name){},
//	移除 overlay 後
runAfterRemove:function(obj,type){},
//	按 overlay 時
runOnClick:function(obj,type){},

precision:6,	//	精度，算到小數點下第幾位。GMap 2008:6

defaultZoom:14,	//	預設縮放

/*
map,	//	GMap obj

TODO:
use GMarkerManager,	http://code.google.com/apis/maps/documentation/overlays.html#Marker_Manager


//handle array:
marker={'lat,lng':GMarker},	//	GMarker 地圖標記
polyline={points:GPolyline},	//	GPolyline 折線
polygon={points:GPolygon},	//	GPolygon 多邊形
xml={URL:GGeoXml},		//	GGeoXml: xml/kml
*/
kinds:{},
supportKind:function(k){
 return k?k in this.kinds:this.kinds;
},

getKind:function(o){
 for(var i in this.kinds)
  if(o instanceof this.kinds[i])return i;
},


//	讀入先前 catch 的經緯度，存loc而不必每次search
readLoc:function(){
 var _t=this,t,i=0,l,a;
 if(!_t.locFP)_t.locFP='map_loc.dat';	//	紀錄 LatLng/地址 可供 searchPoint() 使用
 //	GDownloadUrl(url,callback)
 try{t=getU(_t.locFP);}catch(e){}
 _t.adr_to_loc={};
 if(!t||!(t=t.replace(/\r/g,'').split('\n')).length)return;

 sl('Get '+t.length+' catched address records from ['+_t.locFP+'].');
 for(;i<t.length;i++)
  if((a=t[i].split('	')).length>1 && (l=a[0].split(',')).length==2)
   _t.adr_to_loc[a[1]]=new GLatLng(l[0],l[1])
   //,sl('readLoc: ['+a[1]+'] '+_t.adr_to_loc[a[1]])
   ;
  else sl('readLoc: error data: '+t[i]);
},

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//	locArray[]=[lat,lng,adr] sort by lat	給 writeLoc() & getNeighbor() 用，僅包含需要 search 的。
locArray:[],
//	寫入 catched 的經緯度
writeLoc:function(s){
 var _t=this,i,t=[],l,a=_t.precision,b,c;
 //sl('writeLoc: We will write data to ['+_t.locFP+'].');
 if(!_t.locFP)return;

 for(i in _t.adr_to_loc)
  if(l=_t.adr_to_loc[i])try{
   if(isNaN(b=Number(l.lat()))||isNaN(c=Number(l.lng())))throw new Error(1,'經緯度非數字');
   t.push([b.toFixed(a),c.toFixed(a),i]);
  }catch(e){sl('writeLoc: Error: '+e.message+': ['+l+'] '+i+', ('+l.lat()+','+l.lng()+')');}

 sl('writeLoc: '+_t.locArray.length+'→'+t.length);
 //	不相同時才作處理
 if(t.length!=_t.locArray.length){
  t.sort(function(l,r){return l[0]-r[0]||l[1]-r[1];});
  for(a=_t.locArray=[],b=_t.locArray_u={},c=[],i=0;i<t.length;i++)
   if(l=t[i]){
    if((l[0]+','+l[1]) in b)sl('writeLoc: 重複住址@ '+l[0]+','+l[1]+': '+b[l[0]+','+l[1]][2]+' , '+l[2]);
    a.push(b[l[0]+','+l[1]]=l);
    c.push(l[0]+','+l[1]+'	'+l[2]);
    //sl('writeLoc: '+i+'/'+t.length+' '+c[c.length-1]);	//	多!!
   }
  //sl('writeLoc: '+(typeof simpleWrite)+','+_t.locFP);
  if(typeof simpleWrite=='function'){
   c=c.join('\n');
   if(typeof simpleRead=='function' && simpleRead(_t.locFP,'utf-8')==c)
    sl('writeLoc: 欲寫入之內容('+c.length+' chars)與標的檔相同。檔案並未變更。');
   else
    //sl('writeLoc: Write '+c.length+' chars to ['+_t.locFP+'].'),
    simpleWrite(_t.locFP,c,'utf-8');
  }//else sl('writeLoc: <em>Warning: function.js is not included?</em>');
 }
 if(s)sl('<textarea>'+t.join('\n')+'</textarea>');
 return t;
},
//	locArray2[]=[lat,lng,adr] sort by lat	給 getNeighbor() 用，包括所有不需要 search 的地址。
locArray2:[],
locArray_u:{},locArray2_u:{},	//	預防重複: locArray_u['lat,lng']=obj of locArray or locArray2
/*	取得鄰近的地點: 經緯度, 最大距離(km)	http://blog.ben.idv.tw/2007/06/blog-post.html	http://hk.geocities.com/hk_weather/big5/others/calculators.html	http://blog.xuite.net/joy715/blog/9285691	http://iask.sina.com.cn/b/6263160.html
mapO.getNeighbor([22.620096,120.333381],"sl(n[i][1][2]);");
return:
	f.d:	距離(km)
	f.c:	最多取用點數，<=0：全取，未設：default
	f.s:	最後時選取與否的篩選設置之函數	傳回數值越大越後面
	f.D:	計算距離之函數，將用來比較
		default			[ [較準確的距離, [lat,lng,adr]],.. ]
		求得較大概的距離(以距離平方比計算,比較快)
					[ [距離, [lat,lng,adr]],.. ]	f.D=function(p,l){var a=l.lat()-p[0],b=l.lng()-p[1];return a*a+b*b;}

	f.f:	對選出之 spot 作最後處置之函數
		default			[ [較準確的距離, [lat,lng,adr]],.. ]
		傳回地址		[ adr1, adr2,.. ]		f.f=	'n[i]=n[i][1][2];'
		傳回 obj		[ [lat,lng,adr],.. ]		f.f=	'n[i]=n[i][1];'
		求得較準確的距離	[ [距離, [lat,lng,adr]],.. ]	f.f=	'n[i][1]=l.distanceFrom(n[i][1]);'
*/
getNeighbor:function(l,f){
 var _t=this,lat,lng,i,n=[],p=function(A){
	//	計算最接近上限mLat之loc
	//	c: 誤差
	var i=0,j=A.length,a,b,c=f._d,mLat=lat-c;
	if(!j)return;
	//sl(mLat+'~'+(lat+c));
	do{
	 //sl(Math.floor((i+j)/2)+'/'+A.length+','+A[a=Math.floor((i+j)/2)]);
	 b=A[a=Math.floor((i+j)/2)][0];
	 if(b>mLat)j=a;else if(b<mLat)i=a;
	}while(i<j-1&&Math.abs(b-mLat)>c);
	//sl('start: from ['+a+'/'+A.length+'] '+A[a].join(':')+' to '+(lat+c));var tt=[];
	for(i=a,mLat=lat+c,a=lng-c,b=lng+c;i<A.length&&A[i][0]<mLat;i++)
	 if(/*tt.push('- '+A[i]+': '+a+','+c+','+b),*/c=A[i][1],a<c&&c<b)
	  //n.push([j=f.D(A[i],l),A[i]]),sl('distance: '+j.toFixed(2)+' to '+A[i]);
	  n.push([f.D(A[i],l),A[i]]);
	//sl(tt.join('<br/>'));
 };
 if(typeof l=='string')l=l.split(',');
 //if(typeof l=='function'&&l.lat&&l.lng)lat=typeof l.lat=='function'?l.lat():l.lat,lng=typeof l.lng=='function'?l.lng():l.lng;
 if(l instanceof GLatLng)lat=l.lat(),lng=l.lng();
 else lat=l[0],lng=l[1],l=new GLatLng(lat,lng);
 //	這邊起 l 為原始點之 GLatLng
 if(typeof f!='object')
  f=isNaN(f)?{f:f}:{d:f};
 f._d=(f.d>0?f.d:20)/111;	//	1度的實際長度~111公里。
 if(!f.D)f.D=function(p,l){
	//var a=lat-p[0],b=lng-p[1];return a*a+b*b;	//	大概的，比較快。
	return l.distanceFrom(new GLatLng(p[0],p[1]));	//	real distance
 };

 //sl(lng+', '+lat+'; '+f._d);
 _t.writeLoc();
 p(_t.locArray);
 _t.locArray2.sort(function(l,r){return l[0]-r[0]||l[1]-r[1];});
 //sl('['+_t.locArray2.length+']<br/>* '+_t.locArray2.join('<br/>* '));
 p(_t.locArray2);
 //sl('Get '+n.length+' records near ('+lat+','+lng+').');

 //	由近至遠 sort
 if(typeof f.s=='undefined')f.s=function(l,r){return l[0]-r[0];};	//	l, r: [distance by f.D,[lat,lng,adr]]
 if(f.s)n.sort(f.s);
 //for(i=0;i<n.length;i++)sl('getNeighbor '+i+': '+n[i][0]+' '+n[i][1][2]);
 if(typeof f.c=='undefined'||f.c&&!isNaN(f.c)&&n.length>f.c)
  n=n.slice(0,f.c>0?f.c:9);	//	預設取 9 個

 if(typeof f.f=='string')f.f=new Function('n','i','l',f.f);
 //sl('Run: [~'+n.length+'] by '+f.f);
 if(typeof f.f=='function')
  for(i=0;i<n.length;i++)f.f(n,i,l);

 return n;
},
/*
http://econym.googlepages.com/geomulti.htm
http://econym.googlepages.com/didyoumean.htm
enum GGeoStatusCode	http://code.google.com/intl/zh-CN/apis/maps/documentation/reference.html#GGeoStatusCode
*/
GeoStatus:function(c){
 var m=this.GeoStatusM;
 if(!m){
  this.GeoStatusM=m={
	G_GEO_SERVER_ERROR:'伺服器錯誤。',
	G_GEO_MISSING_QUERY:'輸入空地址。',
	G_GEO_UNKNOWN_ADDRESS:'找不到指定地址的對應地理位置。可能地址比較新，無法解析地址，地址不正確，或者缺少該地址的數據。',
	G_GEO_UNAVAILABLE_ADDRESS:'由於合法性或合同原因，無法返回給定地址的地理位置信息。',
	G_GEO_BAD_KEY:'給定的密鑰無效或與給定的 host ('+window.location.host+') 不匹配。',
	G_GEO_TOO_MANY_QUERIES:'給定的密鑰超出了 24 小時的請求限制。',
	//404:'沒找到網頁',
	403:'Probably an incorrect error caused by a bug in the handling of invalid JSON',
	G_GEO_SUCCESS:'查詢成功'
  };
  var i,v;
  for(i in m)try{
   if(!isNaN(v=eval(i))&&v!=i)m[v]=m[i];
  }catch(e){}
 }
 return m[c]||'';
},
/*	mapO.getLocations('taiwan',function(r){});
	arguments:
		address, function([[lat,lng,adr], ..]), data object
		address, [deal function, (預設0: 傳入 [[lat,lng,adr], ..], 1: 傳入 GClientGeocoder.getLocations)], data object

http://code.google.com/apis/maps/documentation/services.html#Geocoding_Structured
http://code.google.com/apis/kml/documentation/kmlreference.html#placemark
http://www.step1.cn/googleapi/map/kml.htm#Placemark

to use:
mapO.getLocations('宿舍',function(r){for(var i=0;i<r.length;i++)sl(i+'/'+r.length+' '+r[i]);});
*/
getLocations:function(adr,func,d){
 var _t=this,_f=arguments.callee,a
  //	country code
  ,cc={TW:'台灣',US:'United States',JP:'日本',CN:'中国',KR:'大韓民國',KP:'朝鮮',UK:'United Kingdom'}
  ,ga=function(p){	//	從 Placemark 得到住址(address)資料
	 var c,a,b;
	 if(c=p.AddressDetails.Country){
	  b=c.CountryNameCode;
	  a=b in cc?[cc[b]]:[];
	  if(c=c.AdministrativeArea){
	   if(b=c.AdministrativeAreaName)a.push(b);
	   if(c=c.SubAdministrativeArea){
	    if(b=c.SubAdministrativeAreaName)a.push(b);
	    if(c=c.Locality){
	     if(b=c.PostalCode)a.unshift('['+b.PostalCodeNumber+']');
	     if(b=c.LocalityName)a.push(b);
	     if((c=c.Thoroughfare)&&(b=c.ThoroughfareName))
	      a.push(b);
	    }
	   }
	  }
	  a=a.join(' ');
	 }
	 return p.address?p.address+' ('+a+')':a;
  },
  //	預設代為處理函數組
  f=[
	//	代為處理傳入 [lat,lng,adr]
	function(r){
	 _f.errno=r.Status.code;
	 if(r instanceof GLatLng)
	  r=[[r.lat(),r.lng(),adr]];
	 else if(r.Status.code==G_GEO_SUCCESS){
	   //sl('getLocations: Get '+r.Placemark.length+' place(s) of ['+r.name+'].');
	   //sl('getLocations: [0]: '+r.Placemark[0].name);
	   var i=0,n=r.name,p=r.Placemark,l,a;
	   for(r=[];i<p.length;i++)
	    a=ga(p[i])||n+'('+i+')',
	    //sl('getLocations: ('+p[i].Point.coordinates+') '+a),
	    l=p[i].Point.coordinates,r.push([l[1],l[0],a]),
	    _t.adr_to_loc[a]=new GLatLng(l[1],l[0]);
	 }else r=[];
	 return func(r);
	}
   ,
	//	代為處理傳入 Placemark
	function(r){
	 _f.errno=r.Status.code;
	 if(r instanceof GLatLng)
	  r={Status:{code:G_GEO_SUCCESS},Placemark:[{Point:{coordinates:[r[0],r[1]]}}]};
	 else if(r.Status.code==G_GEO_SUCCESS){
	  //sl('getLocations: find '+r.Placemark.length+' records, '+r.Placemark[0].Point.coordinates+': '+r.Placemark[0].address);
	  //if(r.Placemark.length==1){var l=r.Placemark[0].Point.coordinates;_t.adr_to_loc[r.Placemark[0].address]=new GLatLng(l[1],l[0]);}
	  for(var i=0,n=r.name,p=r.Placemark,l;i<p.length;i++)l=p[i].Point.coordinates,_t.adr_to_loc[ga(p[i])||n+'('+i+')']=new GLatLng(l[1],l[0]);
	 }//else sl('getLocations: search ['+adr+'] fault: ['+r.Status.code+'] '+_t.GeoStatus(r.Status.code));
	 return func(r);
	}
  ];

 if(func instanceof Array)
  a=func[1],
  f=	typeof a=='function'?a
	:typeof a=='number' && f[a]? f[a] 
	:f[0],
  func=func[0];
 else f=f[0];

 return _t.getLatLng(adr+='',[f,function(){return _t.geocoder.getLocations(adr,f);}],d);
},

//	直接手動設定
setLatLng:function(adr,lat,lng){
 if(!(lat instanceof GLatLng))lat=new GLatLng(lat,lng);
 this.adr_to_loc[adr]=lat;
 sl('setLatLng: '+lat+' '+adr);
 return lat;
},

//	經緯度 RegExp
LatLngR:/^\s*(\d{1,3}(\.\d+)?)\s*,\s*(\d{1,3}(\.\d+)?)\s*$/,

/*	未設定 func 則僅回傳 catched 的位置
	You can define your method by .f(adr,c), for example: search by specified SQL server.

TODO:
繼承 Geocoding cache
*/
getLatLng:function(adr,func,d){	//	string address, (function(GLatLng) | [func:function(GLatLng), deal_func:function(GLatLng, address)]), data object
 //if(!adr)return;
 var _t=this,m,a,f,c=function(p){
 	 if(!p)sl('getLatLng: Search failed: '+adr);
	 if(p)_t.adr_to_loc[adr]=p;
	 return func(p,adr)||p;
	};

 if(func instanceof Array)
  f=func[1],func=func[0];

 //sl('getLatLng: search '+adr);
 //	檢測是否為經緯度
 if(m=adr.match(_t.LatLngR)){
  if(a=(d&&d.description||adr).replace(/<[/]?([bh]r|p)[^>]*>/ig,'\n').match(/[^\r\n]+[市區街路][^\r\n]+/))
   //sl('('+m[1]+','+m[3]+') ['+a[0]+']'),
   if(!((m[1]+','+m[3]) in _t.locArray2_u))_t.locArray2.push(_t.locArray2_u[m[1]+','+m[3]]=[m[1],m[3],a[0]]);
  m=new GLatLng(m[1],m[3]);
  return func?func(m):m;
 //	搜尋已知地址
 }else if((m=_t.adr_to_loc) && (m=m[adr]))//sl('getLatLng: deal adr_to_loc['+adr+']='+m[adr]+' get '+(func?c(m):m)/*+' by '+func*/),
  return func?c(m):m;
 //	搜尋未知地址
 else if(func)
  //sl('<em>Not catched: '+adr+'</em>'),
  return _t.geocoder.getLatLng(adr,typeof f=='function'?function(m){f(m,adr);}:c);	//	 原來需要用 arguments.callee.f，但若已經用 var 定義則可直接使用。
},

/*
d={
 name:'',	//	這邊 name 被當作 id, title
 description:'HTML',
 type:'',
 data:['','']
//選用 optional:
 htm:'HTML' / function(obj){return 'HTML';},
//尚未用到︰
 link:'',
};
*/
add:function(d,force){
 if(!d||typeof d!='object')return this;
 var _t=this,o=_t.supportKind(d.type);
 if(!o){_t.searchPoint(d);return this;}

 //if(!(d.type in _t))_t[d.type]={};
 var _S=_t[d.type],_m=this.map,a;
 //if(typeof _S!='object')sl('add: typeof ['+d.type+'] = '+(typeof _S));
 if((d.name in _S)&&!force)return this;	//	已存在

 o=_t.kinds[d.type];
 if(d.type=='marker'){
  o=new o(new GLatLng(d.data[0],d.data[1]),_t.getMarkerO(d));
  //if(d.zIndexP)o._zIndexProcess=o._zIndexProcess,o.zIndexProcess=d.zIndexP;	//	** 可以利用 zIndexP 來在 infowindow is opened 時設定 z-index.. 沒用 @ 2008/6/30 19:43:43
 }else a={points:d.data[0],levels:d.data[1],numLevels:4,zoomFactor:16},
	o=new o.fromEncoded(d.type=='polyline'?a:{polylines:[a],fill:true,outline:true});//geodesic:true	Geodesic means 'along great circle'

 _t._add(o,d);

 return this;
},
searchPoint:function(adr,name,description){
 var _f=arguments.callee,_t=this,type='marker',_M=_t[type],_m=_t.map,latlng,d;
 if(typeof adr=='object')d=adr,adr=adr.type;else d={type:adr,show:_f.show};	//	預設 searchPoint.show
 if(!d.name)d.name=name||adr;
 if(typeof d.description=='undefined')
  if(description)d.description=description;
  else if(d.name!=adr)d.description=adr;
 if(!d.type)return;
 if(isNaN(d.retry)&&!_t.geocoder.getCache())d.retry=2;	//	找不到時重試次數

try{
 if(adr in _M)
  //sl('We already have ['+adr+']'),
  _t.show(_M[adr],type);
 else _t.getLatLng(adr+='',function(point){
	if(!point){
	 if(d.retry){
	  //sl('try once more('+d.retry+'): ['+adr+']');
	  d.retry--,_f.call(_t,d);return false;
	 }else{
	  //sl('searchPoint: not found function: '+_t.notFound);
	  return _t.notFound(adr,d);
	 }
	}else{
	 if(adr in _M)return;	//	可能經過太久才被 load?

	 // ** 注意：這邊沒設 _M[adr]=_M[point.toUrlValue(_t.precision)]
	 var p=new GMarker(latlng=point,_t.getMarkerO(d));
	 if(!d.name)d.name=p+'';
	 //sl('found '+point+' '+d.name+', icon: '+p.getIcon().iconSize);
	 //point='loc: '+point;
	 if(typeof d.description=='undefined')d.description=point;
	 else if(d.description==adr)d.description+='<br/>'+point;
	 //_M=_M[adr];
	 if(!('address' in p))p.address=adr;else throw 'GMarker.address was used: ['+p.address+']!';
	 //sl('Last add '+adr+'..');
	 _t._add(p,d,type);
	}
  },d);
}catch(e){sl('searchPoint: Error: '+adr+', '+_M+': '+e.message);}//throw e;
 return latlng;
},
// private:	註冊 o 成為內容 d={}，並設定 click 等 event
_add:function(o,d,type){
 if(!o)return;
 if(!d)d=o;
 if(!type)type=d.type;
 var _t=this,_S=_t[type],_m=this.map;

 //if(d.name)_S[d.name]=o;	//	或許已經設定過了，這邊就需要跳過。
 if(((d.name||d)+'') in _S)
  sl('_add: Warning: Type '+type+' 已存在 ['+(d.name||d)+']'+(_S[d.name||d].getLatLng?' '+_S[d.name||d].getLatLng():'')+('address' in _S[d.name||d]?' '+_S[d.name||d].address:'')+'!'
	//+'<br/>_add: 將以 ['+(o.name||d.name||d)+']'+(o.getLatLng?' '+o.getLatLng():'')+(o.address?' '+o.address:'')+' 覆寫。'
	);
 _S[d.name||d]=o;	//	必設!!

 if(_m)_m.addOverlay(o);//_t._addOverlay(o);//
 //if(o.getIcon)sl('_add: show '+o.getIcon().iconSize+' '+o.getIcon().image);
 o.name=d.name,o.dscr=d.description;	//	GMarker 中這兩個本來就有被用，偵測也只會發現已使用。
 //	another way to add tooltip: GControlPosition
 if(!('sHtm' in o)){
  if('htm' in d)o.sHtm=typeof d.htm=='function'?d.htm.call(d,o,type):d.htm;
  else o.sHtm=(d.name?'<em>'+d.name+'</em>'+(d.description?'<br/>':''):'')+(d.description||'');
 }else throw '['+type+'].sHtm was used: ['+o.sHtm+']!';
 if(!('sHtmF' in o)){
  if('htmF' in d)
   o.sHtmF=typeof d.htmF=='function'?d.htmF.call(d,o,type):d.htmF;
 }else throw '['+type+'].sHtmF was used: ['+o.sHtm+']!';
 //	openInfoWindowTabs: http://www.geocodezip.com/mapXmlTabsPlus.asp
 GEvent.addListener(o,"click",function(e){
  _t.showWindow(o);
  _t.runOnClick(o,type,e&&e.target||window.event&&window.event.srcElement);
 });
 if(d.show)_t.show(o,type);
 _t.runAfterAdd(o,type,d,d.name||d);
},
_addOverlay:function(o){
 var _t=this,_m=_t.map;
 if(!_t._aa)_t._aa=[];
 if(o){_t._aa.push(o);return;}
 var i;
 while(i=_t._aa.shift())
  _m.addOverlay(i);
},


//	icon setup
defaultIconIndex:0,
iconA:[],
iconO:{},
icon:function(index){
 var _t=this;
 if(index instanceof Array){
  //	設定 icon
  _t.iconA=[];
  for(var a,i=0,p,u;i<index.length;i++)
   if(u=index[i]){
    if(typeof u=='string')u={image:u};
    if(u instanceof Object){
     _t.iconA.push(a=new GIcon(u.icon||_t.iconA[_t.defaultIconIndex]||G_DEFAULT_ICON));
     //a=new GIcon(u.icon||_t.iconA[_t.defaultIconIndex]||G_DEFAULT_ICON);
	 for(p in _t.iconO)	//	default first
      //sl('icon: set icon['+(_t.iconA.length-1)+'].'+p+'='+_t.iconO[p]),
	  a[p]=_t.iconO[p];
     if('temp' in u){	//	template 2
      for(p in u.temp)
	   //sl('icon: template set icon['+(_t.iconA.length-1)+'].'+p+'='+u.temp[p]),
	   a[p]=u.temp[p];
      delete u.temp;
     }
     for(p in u)	//	user set last
	  //sl('icon: specified set icon['+(_t.iconA.length-1)+'].'+p+'='+u[p]),
	  a[p]=u[p];
	 //_t.iconA.push(new GIcon(a));
    }else _t.iconA.push(u);
   }
  return _t.iconA.length;
 }

 if(index instanceof Object){
  //sl('icon: set default icon option');
  for(i in index)
   //sl('icon: set default ['+i+']=['+index[i]+']'),
   _t.iconO[i]=index[i];
  return;
 }

 //	return icon[index]
 if(isNaN(index)||index<0||index>=_t.iconA.length)index=_t.defaultIconIndex;
 //sl('icon: return icon['+index+'] '+(_t.iconA[index]?_t.iconA[index].iconSize+' '+_t.iconA[index].image:'G_DEFAULT_ICON'));
 return _t.iconA[index]||G_DEFAULT_ICON;
},

dMarkerO:{},	//	default marker option
getMarkerO:function(mo,setMO){	//	setMO: set default, 1: add, 2:reset
 var _t=this,i,a={icon:1,title:1,zIndexProcess:1,draggable:1};	//	class GMarkerOptions
 _t.dMarkerO.icon=_t.icon();
 if(setMO){
  if(setMO==2)_t.dMarkerO={};
  setMO=_t.dMarkerO;
 }else{
  //	複製一份
  setMO={};
  for(i in _t.dMarkerO)
   //sl('getMarkerO: from default ['+i+']=['+_t.dMarkerO[i]+']'),
   setMO[i]=_t.dMarkerO[i];
 }
 if(mo instanceof Object)
  for(i in a)
   if(a[i]&&typeof mo[i]!='undefined')
    //sl('getMarkerO: set ['+i+']=['+mo[i]+']'),
	setMO[i]=mo[i];
 //sl('getMarkerO: icon: '+setMO.icon.iconSize+' '+setMO.icon.image);
 return setMO;
},

/*	增加自己控制的 marker，會自動顯現，但不會列入管控，得自己設定。
usage:
mapO.addMarker(dLoc.tw,{draggable:true});
*/
addMarker:function(loc,opt){
 var _t=this,_m=_t.map,m;
 if(_m){
  if(loc instanceof Array)loc=new GLatLng(loc[0],loc[1]);
  m=new GMarker(loc,_t.getMarkerO(opt));
  //sl('addMarker icon: '+_t.getMarkerO(opt).icon.iconSize+' '+_t.getMarkerO(opt).icon.image);
  //sl('addMarker iconSize: '+_t.getMarkerO(opt).iconSize);
  _m.addOverlay(m);
 }
 return m;
},


//	f={p:position, m:method(pan/panBy/set), z:zoom}
setCenter:function(f){
 var _m=this.map;
 if(f instanceof GLatLng||!(f instanceof Object))f={p:f};

 //sl('setCenter: setZoom ['+(f.z||null)+'] @ '+f.p+' by method ['+(f.m||'setCenter')+'].');
 if(!isNaN(f.z))_m.setZoom(f.z);
 if(f.p){
  if(f.p instanceof Array)f.p=new GLatLng(f.p[0],f.p[1]);
  if(f.m=='pan')_m.panTo(f.p);
  else if(f.m=='panBy')_m.panBy(f.p);
  else _m.setCenter(f.p);
 }

 return _m.getCenter();
},

//	zoom above 19	You can set zoom up to 30 by using setCenter() not by setZoom() or zoomIn()	firefox: 45.1238,-123.1138	http://esa.ilmari.googlepages.com/highres.htm
/*
eval('err_noImage=p(10121);',mapO.map);
sl(err_noImage);
*/
zoom:function(z){
 var _t=this,_m=_t.map,m;
 if(typeof z=='string'&&(m=z.match(/^[+-]/)))z=_m.getZoom()+(m[0]=='+'?z:-z);
 if(z)_m.setZoom(z);//try{_m.setCenter(_m.getCenter(),z);}catch(e){}	//	中文中, enableContinuousZoom()? 這麼搞會出錯
 return _m.getZoom();
},
//	show, or focus. f={noCenter:false, redraw: false}
show:function(name,type,f){
 var _t=this,_S=_t[type],_m=_t.map,inC;	//	inC: in control
 if(typeof name=='string')
  if(name in _S)_S=_S[name],inC=1;
  else _S=0;
 else _S=name;
 if(typeof _S!='object'||!_S)return;

 if(_S.isHidden&&_S.isHidden())_S.show();
 if(typeof f!='object')f={noCenter:f};	//	default: don't set to center
 if(!f.noCenter){
  var p=_t.getPoint(_S,type);
  //sl('show: center= '+p);
  if(_m){
   _m.setCenter(p);
   if(_m.getZoom()<9)_m.setZoom(_t.defaultZoom);
   if(inC)_t.showWindow(_S,p);	//	未管控就 showWindow 會有奇妙的結果。
  }
 }
 if(f.redraw && _S.redraw)_S.redraw(true);	//	Front/back order of markers can be messed simply by moving them in south-north direction. (v1) 	http://koti.mbnet.fi/ojalesa/exam/anim_v2.html

 return _t;
},

//	show HTML window (obj, point)	o.sHtmF=show HTML flag: {maxContent:'', ..}: see class GInfoWindowOptions
showWindow:function(o,p){
 //sl('showWindow: '+(p||o.openInfoWindowHtml));
 if(typeof o.openInfoWindowHtml=='function')
  o.openInfoWindowHtml(o.sHtm,o.sHtmF);	//	enableMaximize()
 else this.map.openInfoWindowHtml(p||this.getPoint(o),o.sHtm,o.sHtmF);
},

//	get the GLatLng of the object
getPoint:function(o,type){
 if(!type)type=this.getKind(o);
 //sl('getPoint: ['+type+']'+o.name);
 if(type=='marker'&&typeof o.getLatLng=='function')return o.getLatLng();

 if(typeof o.getBounds=='function')
  return o.getBounds().getCenter();

 if(typeof o.getCenter=='function')
  return o.getCenter();

 if(typeof o.getVertexCount=='function')
  return o.getVertex(Math.floor(o.getVertexCount()/2));
},

getZoom:function(o,type){
 if(!type)type=this.getKind(o);
 //sl('getPoint: ['+type+']'+o.name);

 if(typeof o.getBounds=='function')
  return this.getBoundsZoomLevel(o.getBounds());	//	得到適當的 zoom

 //if(type=='marker')return _t.defaultZoom;
 return _t.defaultZoom;
},


initMap:function(id,latlng,f){	//	container, center, other initial setting flags
 var _t=this,_m,a;
 //	檢查當前瀏覽器是否支持地圖 API 庫
 if(GBrowserIsCompatible()){
  //	指定GMap使用的圖層 @ id
  if(typeof id=='string')id=document.getElementById(id);
  if(!id)return _t;
  _t.canvas=id;	//	container object

  if(!f)f={};
  if(!f.size)
   f.size=f.x&&f.y?[f.x,f.y]:[640,320];
  if(f.size instanceof Array)f.size=new GSize(f.size[0],f.size[1]);

  _m=_t.map=new GMap2(id,f);//=new google.maps.Map2();
  //	設定中心點座標
  _m.setCenter(latlng||new GLatLng(0,0),7);	//	default center.
  //_m.setMapType(G_HYBRID_MAP);
  _m.addMapType(G_PHYSICAL_MAP);	//	地形圖
  _m.addMapType(G_SATELLITE_3D_MAP);	//	with the Google Earth Browser Plug-in

  //	控制元件	客制化: http://julian.norway.idv.tw/index.php/archives/322
  //_m.addControl((new GHierarchicalMapTypeControl()).addRelationship(G_SATELLITE_MAP, G_HYBRID_MAP, "Labels", true));
  //_m.removeMapType(G_HYBRID_MAP);
  _m.addControl(a=_t.overviewMap=new GOverviewMapControl(new GSize(_m.getSize().width/2.5,_m.getSize().height/2)));	//	可折疊的縮小圖
  a.hide();	//	show(), hide().
  //a.getOverviewMap().addControl(new GMenuMapTypeControl(1));	must use setTimeout: getOverviewMap() is not available until after the module has loaded.
  _m.addControl(new GLargeMapControl());	//	加入地圖縮放工具
  _m.addControl(new GMenuMapTypeControl(1));//GMapTypeControl(1)	//	切換地圖型態的按鈕
  _m.addControl(new GScaleControl());	//	地圖比例尺
  _m.enableScrollWheelZoom();
  _m.enableContinuousZoom();	//	平滑放大

  GEvent.addListener(_m,'mouseover',function(){_m.showControls();});
  GEvent.addListener(_m,'mouseout',function(){_m.hideControls();});
 }else{
  sl('<em>抱歉，您的瀏覽器不支援 Google Maps！</em>');
 }
 return _t;
},



/*	移除所有管控項
c.f.,	this.map.clearOverlays()
*/
removeAll:function(type){
 var _t=this,i,o;
 if(!type)for(i in _t.kinds)
  arguments.callee.call(this,i);
 else{
  //sl('removeAll: ('+(typeof type)+') ['+type+'], '+(typeof _t[type]));
  //o=[];for(i in _t[type])o.push(i);for(i=0;i<o.length;i++)_t.remove(o[i],type);
  for(i in _t[type])_t.remove(i,type);
  //_t[type]={};
 }
},

remove:function(n,type){
 var _S=this[type];
 if(n in _S){
  //sl('remove '+type+' ['+n+']: '+(_S[n].name||_S[n].address||_S[n].dscr));
  this.map.removeOverlay(_S[n]);
  delete _S[n];
  this.runAfterRemove(n,type);
 }
 return this;
},

//	http://econym.googlepages.com/example_context.htm
setContextMenu:function(o){
 var _t=this,_m=_t.map,h;
 if(!_m)return;

 if(typeof o!='object'){
  h=o;
  o=document.createElement('div');
  o.className='gMap_contextMenu';
  o.innerHTML=h;
 }

 if(_t.contextMenu)
  _t.contextMenu.replaceNode(o);
 else _m.getContainer().appendChild(_t.contextMenu=o)
  ,GEvent.addListener(_m,'singlerightclick',function(p,t){
   _t.clickLatLng=_m.fromContainerPixelToLatLng(_t.clickPoint=p);
   var x=p.x,y=p.y,w=_m.getSize().width-o.offsetWidth,h=_m.getSize().height-o.offsetHeight;
   if(x>w&&w>0)x=w;
   if(y>h&&h>0)y=h;
   (new GControlPosition(G_ANCHOR_TOP_LEFT,new GSize(x,y))).apply(o);
   _t.showContextMenu(1);
  });

 _t.showContextMenu(0);
 return o;
},
showContextMenu:function(v){
 var o=this.contextMenu;
 if(o)o.style.visibility=v||typeof v=='undefined'?'visible':'hidden';
},

//	get overlay
getO:function(type,name){
 var s=this[type];
 return name?name in s?s[name]:null:s;
},

//	get name of the type
getOArray:function(type){
 var i,a=[],o=this[type];
 if(o)for(i in o)a.push(i);
 return a;
},


/*
var i,t=[],o;
o=GGeoXml.prototype;//GMap2.prototype
sl('['+(typeof o)+'] '+(o+'').replace(/\n/g,'<br/>')+'<hr/>',1);for(i in o)t.push('['+(typeof o[i])+'] '+i);sl(t.sort().join('<br/>'));

TODO:
GEvent.addListener(map,"addoverlay",function(overlay){if(overlay.name){}});
*/
loadXML:function(URL){
 var _t=this,x=new GGeoXml(URL);
 //	.getDefaultCenter(), .getDefaultBounds() 可能是 null
 _t.setCenter({p:x.getDefaultCenter(),z:x.getDefaultBounds(),m:'pan'});
 _t.map.addOverlay(x);
 return _t.xml[URL]=x;
},

//resize map
resize:function(x,y){
 with(this.map.getContainer().style)
  width=x+'px',height=y+'px';
},

//	去除商標, Copyright message
removeTM:function(l){
 var a=this.canvas;
 if(!a)return;
 a=a.getElementsByTagName('a'),i=a.length,t=1;
 //sl('removeTM: '+UnicodeToHTML(document.getElementById('map_canvas').innerHTML));
 for(;i>0&&(t||l);){
  i--;
  //	http://www.google.com/intl/en_ALL/help/terms_maps.html
  if(t && a[i].href.indexOf('terms_maps')!=-1 && a[i].parentNode.tagName.toLowerCase()=='div'){
   //sl('removeTM: remove copyright: '+a[i].href);
   //sl('removeTM: remove copyright: '+UnicodeToHTML(a[i].parentNode.innerHTML));
   removeNode(a[i].parentNode,1);	//	連這div都刪除會有奇怪現象發生
   t=0;
  }else if(l && a[i].innerHTML.indexOf('poweredby.png')!=0){
   //sl('removeTM: remove logo: '+UnicodeToHTML(a[i].parentNode.innerHTML));
   removeNode(a[i].parentNode,1);
   l=0;
  }
 }
}

};	//	_.prototype=


return _;
})();	//	(function(){

//	===================================================


/*	2008/9-10/1
	搜尋用代理工具

usage:
google.load("search","1",{language:"ja_JP",callback:loadSearch});
function loadSearch(){
 gSearch=new getSearch(function(r,p){
  sl('<a href="'+r.unescapedUrl+'">'+r.title+'</a><br/><div style="margin-left:3em;font-size:.8em;">'+r.content+'</div>');
 });
}
 
 
TODO:
Yahoo! Search BOSS	http://developer.yahoo.com/search/boss/

LocalSearch:
http://www.google.com/uds/samples/apidocs/static-tiles.html
http://code.google.com/apis/ajaxsearch/documentation/reference.html#_class_GlocalSearch

*/
function getSearch(fn,kind){	//	deal function, kind: Web/Local
 if(!kind)kind='Web';
 var _t=this,_s=typeof google!='undefined'?google.search:0;
 if(!_s||!_s[kind+'Search'])return;
 _s=_t.searcher=new _s[kind+'Search']();

 if(kind=='Local'){
  //sl('Set center: '+'Taiwan');
  _s.setCenterPoint('台灣');//Taiwan
  _s.setResultSetSize(google.search.Search.LARGE_RESULTSET);
  //_s.setCenterPoint("93108");
 }else{
  _s.setNoHtmlGeneration();
  //.addSearcher(_s,(new google.search.SearcherOptions()).setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN));
 }

 _s.setResultSetSize(google.search.Search.LARGE_RESULTSET);

 _s.setSearchCompleteCallback(_t,_t.searchComplete[kind],[_s]);
 if(fn)_t.sf=fn;
 return _t;
}
getSearch.prototype={

//	country translate
countryT:{Taiwan:'台灣'},

searchComplete:{
Local:function(searcher){
 var r=searcher.results,i=0,a,b,j;
 if(r&&r.length>0)for(;i<r.length;i++){
  o=r[i],a=o.country;
  if(a in this.countryT)a=this.countryT[a];
  o.address=a+o.region+o.city+o.streetAddress;
  o.phone=[];
  if(a=o.phoneNumbers)
   for(j=0;j<a.length;j++)
    o.phone.push((a[j].type?a[j].type+': ':'')+a[j].number);
  this.sf(o);
 }
/*
	var imageUrl = GlocalSearch.computeStaticMapUrl(searcher.results, 350, 400);
	document.getElementById("resultsImg").src = imageUrl;
*/
},
Web:function(searcher){
 var s=searcher,p=s.cursor.currentPageIndex,i=0,r=s.results;
 //sl('<hr/>page '+p+':');
 if(r&&r.length)for(;i<r.length;i++)
  this.sf(r[i],p);
 s.gotoPage(p+1);	//	這會一直執行到不能執行為止。(2008/7: 0-3)
}

},	//	searchComplete


//	deal function
sf:function(r,p){
},

s:function(w){
 //sl('getSearch: search ['+w+']');
 if(w)this.searcher.execute(w);
}

};








return (
	CeL.net.map
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL SVG function
 * @fileoverview
 * 本檔案包含了 SVG 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.SVG';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.SVG
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'net.web.XML_node,net.web.set_attribute,net.web.remove_all_child,net.web.set_class,data.split_String_to_Object')))
	return;


// ============================================================================
//	definition of module SVG

/*

TODO:
animation
.add_image
*/

//	in 運算子會檢查物件是否有名稱為 property 的屬性。它也會檢查物件的原型，查看 property 是否屬於原型鏈結的一部分。如果 property 是在物件或原型鏈結中，則 in 運算子會傳回 true，否則會傳回 false。	http://msdn2.microsoft.com/zh-tw/library/11e33275(VS.80).aspx

//g_SVG[generateCode.dLK]='set_attribute,XML_node,remove_all_child';//removeNode

/**
 * module SVG 物件之 constructor。<br/>
 * 設定 SVG document fragment 並將之插入網頁中。

 * @class	generation of Scalable Vector Graphics<br/>
 * 輔助繪圖的基本功能物件，生成 SVG 操作函數。
 * @since	2006/12/7,10-12
 * @deprecated	Use toolkit listed below instead:<br/>
 * <a href="http://code.google.com/p/svgweb/" accessdate="2009/11/15 16:34" title="svgweb - Project Hosting on Google Code">svgweb</a><br/>
 * <a href="https://launchpad.net/scour" accessdate="2009/11/15 16:35" title="Scour - Cleaning SVG Files in Launchpad">Scour</a>

 * @constructor
 * @param	{int} _width	width of the canvas
 * @param	{int} _height	height of the canvas
 * @param	{color string} [_backgroundColor]	background color of the canvas (UNDO)
 * @requires	set_attribute,XML_node,remove_all_child//removeNode
 * @type	CeL.net.SVG
 * @return	{CeL.net.SVG} CeL.net.SVG object created

 * @see	<a href="http://www.w3.org/TR/SVG/" accessdate="2009/11/15 16:31">Scalable Vector Graphics (SVG) 1.1 Specification</a><br/>
 * <a href="http://zvon.org/xxl/svgReference/Output/" accessdate="2009/11/15 16:31">SVG 1.1 reference with examples</a><br/>
 * <a href="http://www.permadi.com/tutorial/jsFunc/index.html" accessdate="2009/11/15 16:31" title="Introduction and Features of JavaScript &quot;Function&quot; Objects">Introduction and Features of JavaScript &quot;Function&quot; Objects</a><br/>
 * <a href="http://volity.org/wiki/index.cgi?SVG_Script_Tricks" accessdate="2009/11/15 16:31">Volity Wiki: SVG Script Tricks</a><br/>
 * <a href="http://pilat.free.fr/english/routines/js_dom.htm" accessdate="2009/11/15 16:31">Javascript SVG et DOM</a>
 */
CeL.net.SVG
= function(_width, _height, _backgroundColor){
 var _f = arguments.callee, _s;
/*
 if(!_f.createENS()){
  //alert('Your browser doesn't support SVG!');
  return;
 }
*/

 /**
  * SVG document fragment
  * @property
  * @see	<a href="http://www.w3.org/TR/SVG/struct.html#NewDocument" accessdate="2009/11/15 16:53">Defining an SVG document fragment: the 'svg' element</a>
  */
 this.svg=_s=	//	raw
	arguments.length===1 && arguments[0] && typeof arguments[0]==='object' && arguments[0].tagName.toLowerCase()==='svg'
	?arguments[0]
	:_f.createNode('svg')
	;
 if(!_s)return;	//	error!

 //	http://www.w3.org/TR/SVG/struct.html#DefsElement	http://www.svgbasics.com/defs.html
 _s.appendChild(this.defs=_f.createNode('defs'));	//	raw

 //	調整大小
 this.setSize(_width,_height);
 //	set_attribute(_s,{xmlns:_f.NS.SVG});
 set_attribute(_s,{xmlns:'http://www.w3.org/2000/svg'});
 //	may cause error! should use .setAttributeNS()??
 _s.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
 //viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"

 /**
  * 包含了插入元件的原始資訊。<br/>
  * Use {@link #addContain} to add contains.
  * @property
  * @type	Array
  */
 this.contains = [];
 /**
  * 所插入之網頁元素
  * @property
  */
 this.div = null;

 //document.body.appendChild(this.svg);
 return this;//return this.createNode(_nodeN);
};
//_.NS={SVG:'http://www.w3.org/2000/svg',XLink:'http://www.w3.org/1999/xlink'};
_.defaultColor = '#222';

CeL.net.SVG
.
/**
 * default stroke width. 單位: px
 * 
 * @unit px
 * @type Number
 * @memberOf CeL.net.SVG
 */
defaultStrokeWidth = .5;	

//_.defaultColor='#444';_.defaultStrokeWidth=1;

CeL.net.SVG
.
/**
 * 所有造出 id 之 prefix
 * @type	string
 * @memberOf	CeL.net.SVG
 */
idPrefix =
	// +'_SVG_';
	library_namespace.to_module_name(module_name) + '.';

// _.bout closure.
//_.createENS=document.createElementNS?function(){return document.createElementNS(arguments[0],arguments[1]);}:null;
CeL.net.SVG
.
/**
 * create SVG document fragment (only for .createNode)
 * @param _ns	namespaceURI
 * @param _qn	qualifiedName
 * @param _a	propertyA
 * @param _i	innerObj
 * @return
 * @memberOf	CeL.net.SVG
 * @function
 * @private
 */
createENS = function(_ns, _qn, _a, _i) {
	return (
		// document.createElementNS?XML_node(_ns+':'+_qn,_a,0,_i):null;
		XML_node(_ns + ':' + _qn, _a, 0, _i));
};

CeL.net.SVG
.
/**
 * create SVG document fragment 元件(component)。<br/>
 * SVG 之 document fragment 與 HTML 不同 namespace，因此我們需要使用到 <a href="http://www.w3.org/2000/svg">http://www.w3.org/2000/svg</a> 來作為 XML elements 的 namespace。為了未來的兼容性，我們將這個功能獨立出來。
 * @param _nodeN	node/tag name
 * @param {hash|string}_a	attribute/property
 * @param _i	inner object
 * @return	node created or null
 * @memberOf	CeL.net.SVG
 * @private
 * @function
 */
createNode = function(_nodeN,_a,_i){
 //return this.createENS?this.createENS('svg',_nodeN||'svg'):null;
 return _.createENS('svg', _nodeN || 'svg', _a, _i);

 //	Error: uncaught exception: [Exception... "Illegal operation on WrappedNative prototype object"  nsresult: "0x8057000c (NS_ERROR_XPC_BAD_OP_ON_WN_PROTO)"  location: "JS frame :: file:///C:/kanashimi/www/cgi-bin/program/tmp/JavaScript%20Framework/dojo/dojo-0.4.0-ajax/a.htm :: anonymous :: line 29"  data: no]
 //	http://www.codingforums.com/archive/index.php?t-94573.html	When you do var x = document.getElementById and then x('hello') you are executing the function x in the context of the window object instead of the document object. Gecko probably utilizes the scoping of the document object to access some internal methods to execute getElementById, which the window object doesn't have.
 //	http://developer.mozilla.org/en/docs/Safely_accessing_content_DOM_from_chrome	http://developer.mozilla.org/en/docs/Working_around_the_Firefox_1.0.3_DHTML_regression	http://www.codingforums.com/archive/index.php?t-68554.html
 // OK?
 //return this.createENS?this.createENS.call(document,'svg',_nodeN||'svg'):null;
 // fault:
 //return this.createENS===document.createElementNS?document.createElementNS('svg',_nodeN||'svg'):this.createENS?this.createENS('svg',_nodeN||'svg'):null;
 //return this.createENS?(alert(this.createENS===document.createElementNS),Function.apply(this.createENS,['svg',(_nodeN||'svg')])):null;
 //return this.createENS?(alert(this.createENS===document.createElementNS),this.createENS.apply(document.createElementNS,['svg',(_nodeN||'svg')])):null;
};
/*
_.createLink=function(_ref){
 return this.createENS('xLink','xlink:href');
};
*/

CeL.net.SVG
.
/**
 * 從 id 獲得 node
 * @param id	id
 * @return	node
 * @memberOf	CeL.net.SVG
 * @private
 */
getNodeById = function(id) {
	// return this.svg.getElementById(_i);//useless?

	// lookupPrefix()
	return document.getElementById(id);
};

CeL.net.SVG
.
/**
 * get a random ID to use.
 * @param tag	tag name(nodeType)
 * @return	a random ID
 * @memberOf	CeL.net.SVG
 * @private
 */
getRandomID = function(tag) {
	if (typeof tag === 'object')
		tag = tag.tagName/* nodeType */;
	var _j;
	while (_.getNodeById(_j = _.idPrefix + tag + '_'
			+ ('' + Math.random()).slice(2, 6)))
		;
	return _j;
};
CeL.net.SVG
.
/**
 * give a random ID to the specified node.
 * @param _n	node
 * @return	id of the specified node
 * @memberOf	CeL.net.SVG
 * @private
 */
setRandomID = function(_n) {
	if (_n && typeof _n === 'object') {
		/**
		 * id of the specified node
		 * @inner
		 * @ignore
		 */
		var _i = set_attribute(_n, 'id');
		if (!_i)
			set_attribute(_n, {
				id : _i = _.getRandomID(_n)
			});
		return _i;
	}
};

CeL.net.SVG
.
/**
 * 改變 text
 * @param text_node	text object
 * @param text	change to this text
 * @return
 * @memberOf	CeL.net.SVG
 * @see
 * <a href="http://www.w3.org/TR/SVG/text.html" accessdate="2009/12/15 0:2">Text - SVG 1.1 - 20030114</a>
 * <tref xlink:href="#ReferencedText"/>
 */
changeText = function(text_node, text) {
	//if (typeof remove_all_child === 'function')
	//	remove_all_child(text_node);
	//else throw new Error(1, 'changeText: function remove_all_child is not included!');
	remove_all_child(text_node);

	if (text)
		text_node.appendChild(document.createTextNode(text));
	//else removeNode(_textO);
};

CeL.net.SVG
.
addTitle = function(_o, _t_d) {
	if (_t)
		_o.appendChild(this.createNode('title', 0, _t));
	// A more descriptive label should be put in a <desc> child element
	if (_t)
		_o.appendChild(this.createNode('desc', 0, _t));
};


/*	transform	http://www.w3.org/TR/SVG/coords.html#TransformAttribute	http://archive.dojotoolkit.org/nightly/tests/gfx/test_image.html
recommend for performance reasons to use transformation matrices whenever possible.	http://www.mecxpert.de/svg/transform.html
 * @memberOf	module SVG
 */
CeL.net.SVG
.
setTransform = function(_o, _t) {
	//	TODO
	throw new Error(1, 'setTransform: yet implement!');
	set_attribute(_o, {
				transform : _t
			});
};

// ============================================================================
//	definition of module SVG object

_.prototype={

/**
 * 顯現 this module SVG object
 * @param _v	visible
 * @return	this module SVG object
 * @memberOf	CeL.net.SVG
 */
show : function(_v) {
	var _d = this.div;
	if (this.svg)
		if (_d) {// _s.parentNode
			_d.style.display = typeof _v == 'undefined' ? _d.style.display === 'none' ? 'block'
					: 'none'
						: _v ? 'block' : 'none'; // block怪怪的
		} else if (_v || typeof _v == 'undefined')
			this.div = XML_node('div', 0, [ document.body ],
					this.svg);
	return this;
},
setAttribute : function() {
	this.svg && this.svg.setAttribute(arguments);
	return this;
},
//setDimensions
/**
 * 調整 canvas 大小
 * @unit	px
 * @param {Integer} _width	width in px
 * @param {Integer} _height	height in px
 * @return	this module SVG object
 * @memberOf	CeL.net.SVG
 */
setSize : function(_width, _height) {
	_width = parseInt(_width) || 0;
	_height = parseInt(_height) || 0;

	if (_width > 0 && _height > 0)
		set_attribute(this.svg, {
			width : _width,
			height : _height
		});

	return this;
},
getSize : function() {
	return set_attribute(this.svg, 'width,height');
},

/**
 * 將本 Object 附在 _n 上(attach to node)
 * @param _n	HTML/SVG object
 * @return
 */
attach : function(_n) {
	if (typeof _n === 'string')
		_n = _.getNodeById(_n);

	if (!_n)
		return this;

	var _t = _n.tagName.toLowerCase();
	if (_t === 'svg')
		//	TODO: 若不想創建新 node..
		return new _(_n);

	if (_t === 'div') {
		//if(this.div){TODO: 原先已經 attach}
		this.div = _n;
		_n.appendChild(this.svg);
	}

	return this;
},

get_XML : function() {
	var _t = document.createElement('div'), _x, _s = this.svg;

	if (!_s)
		// error!
		return;

	//	TODO: 效率不高!
	_t.appendChild(_s = _s.cloneNode(true));
	_x = _t.innerHTML;
	_t.removeChild(_s);
	// 確保在此環境下 create 出來的會被 destory
	_t = null;
	// ugly hack
	// &lt;?xml version="1.0" encoding="UTF-8" standalone="no"?&gt;
	_x = _x.replace(/(\s)(href=['"])/g, '$1xlink:$2');

	return _x;
},

/**
 * 清除 canvas<br/>
 * 很可能會出問題!
 * @return	this SVG
 * @memberOf	CeL.net.SVG
 * @since	2009/12/18 21:17:09
 */
clean : function() {
	var s = this.svg;
	//	[0]: <defs>
	while (s.childNodes.length > 1)
		//library_namespace.debug(s.childNodes.length + ',' + s.lastChild),
		s.removeChild(s.lastChild);

	// remove childrens of <defs>
	//remove_all_child(s.lastChild, 1);
	s = s.lastChild;
	while (s.hasChildNodes())
		//library_namespace.debug(s.childNodes.length + ',' + s.lastChild),
		s.removeChild(s.lastChild);

	return this;
},

/**
 * 創建本物件之 SVG 群組。<br/>
 * 利用 SVG 群組我們可以同時操作多個 SVG elements。
 * @param {hash|string}_a	attribute/property
 * @param _i	inner object
 * @return	this SVG
 * @memberOf	CeL.net.SVG
 */
createGroup : function(_a, _i) {
	var _g = _.createNode('g', _a, _i);
	this.group = _g;
	return this;
},
/**
 * 綁定 SVG elements 至本物件群組。<br/>
 * 這函數將已存在的 SVG elements 綁定至本物件之群組中。若群組不存在，則創建出一個。
 * @param _n	node
 * @return	this module SVG object
 * @memberOf	CeL.net.SVG
 */
attachGroup : function(_n) {
	if (!this.group)
		this.createGroup();
	this.group.appendChild(_n);
	return this;
},

createSymbol : function(_a, _i) {
	var _s = _.createNode('symbol', _a, _i);
	this.symbol = _s;
	return this;
},
attachSymbol : function(_n) {
	if (!this.symbol)
		this.createSymbol();
	this.symbol.appendChild(_n);
	return this;
},

//	TODO
setFill:function(){throw new Error(1,'setFill: yet implement!');},
setStroke:function(){throw new Error(1,'setStroke: yet implement!');},
setShape:function(){throw new Error(1,'setShape: yet implement!');},
setTransform:function(){throw new Error(1,'setTransform: yet implement!');},

//<animateMotion>,<animateColor>

/**
 * 最後一個增加的 instance
 * @memberOf	CeL.net.SVG
 */
lastAdd: null,
/**
 * 最後一個增加的 definition
 * @memberOf	CeL.net.SVG
 */
lastAddDefs: null,
/**
 * 增加 SVG element。<br/>
 * 結合 .prototype.addDefs 與 .prototype.addUse，作完定義後隨即使用之。
 * @param _n	tagName(nodeType)
 * @param {hash|string} _a	attribute/property
 * @param _i	inner object
 * @return
 * @memberOf	CeL.net.SVG
 */
addNode : function(_n, _a, _i) {
	if (typeof _n == 'string')
		_n = _.createNode(_n, _a, _i);
	if (_n) {
		this.addDefs(_n);
		this.addUse(_n);
	}
	return this;
},

/**
 * 增加 SVG 定義。<br/>
 * SVG 規範中聲明，SVG 的 &lt;use&gt; element 不能引用外部文件或其 elements。因此我們在創建實例之前，需要先在本物件中作定義。
 * @param _n	node
 * @return
 * @memberOf	CeL.net.SVG
 */
addDefs : function(_n) {
	// var _d=this.defs;
	if (_n) {
		_.setRandomID(_n);
		this.defs.appendChild(this.lastAddDefs = _n);
	}
	return this;
},
/**
 * 增加 SVG 實例。<br/>
 * 利用本物件中之定義創建實例並增添至本物件中。<br/>
 * 在裝載 b.svg 時，將 a.svg 中的 defs 中的圖元裝載到 b.svg 中（文件上是兩者是保持獨立的，但在內存中將二者合二為一），這樣就可以在b.svg中直接引用這些圖元了。<br/>
 * SVG 規範中聲明，SVG 的 &lt;use&gt; element 不能引用外部文件或其 elements。因此我們在創建實例之前，需要先在本物件中作定義。
 * @param _i	id
 * @param _a
 * @return
 * @memberOf	CeL.net.SVG
 */
addUse : function(_i, _a) {
	var _s = this.svg, _o = _.createNode('use', _a);
	if (_o && _s && _i) {
		if (typeof _i == 'object')
			_i = _.setRandomID(_i);
		set_attribute(_o, {
			'xlink:href' : '#' + _i
		});
		_s.appendChild(this.lastAdd = _o);
	}
	return this;
},

/**
 * 增加插入的元件。<br/>
 * 應該用 <a href="http://www.w3.org/TR/SVG/struct.html#SymbolElement">symbol</a>
 * @param _o	object reference
 * @param _type	type of this component
 * @param [propertyO]	other properties
 * @return
 * @requires	split_String_to_Object
 * @memberOf	CeL.net.SVG
 */
addContain : function(_o, _type, propertyO) {
	if (_type && this.contains) {
		if (typeof propertyO === 'string')
			propertyO = split_String_to_Object(propertyO);
		if (propertyO.o || propertyO.t)
			this.contains.push( {
				o : _o,
				t : _type,
				p : propertyO
			});
		else
			propertyO.o = _o, propertyO.t = _type, this.contains
			.push(propertyO);
	}
	return this;
},


/**
 * 繪製直線。<br/>
 * 此函數利用 _.eNode 造出直線元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _left
 * @param _top
 * @param _width
 * @param _height
 * @param _color
 * @param _strokeWidth
 * @return
 * @memberOf	CeL.net.SVG
 */
addLine : function(_left, _top, _width, _height, _color,
		_strokeWidth) {
	var _l = _.createNode('line', {
		x1 : _top,
		y1 : _left,
		x2 : _top + _width,
		y2 : _left + _height,
		stroke : _color || this.addLine.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth
	});
	if (_l && this.svg) {
		//this.svg.appendChild(_l);
		this.addNode(_l);
	}
	return this;
},


/**
 * 繪製曲線路徑。<br/>
 * 此函數利用 _.eNode 造出路徑元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param _d
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @return
 * @memberOf	CeL.net.SVG
 */
addPath : function(_d, _color, _strokeWidth, _fill) {
	var _p = _.createNode('path', {
		d : _d,
		stroke : _color || this.addLine.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none'
	});
	if (_p && this.svg)
		this.addNode(_p);
	return this;
},


//xml:space="default|preserve"
/**
 * 添加文字。<br/>
 * 此函數利用 _.eNode 造出文字元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param _text
 * @param _left
 * @param _baseLine
 * @param _color
 * @param _font
 * @return
 * @memberOf	CeL.net.SVG
 */
addText : function(_text,_left,_baseLine,_color,_font){
	if (_color)
		this.addText.defaultColor = _color;
	else
		_color = this.addText.defaultColor;

	if (_font)
		this.addText.defaultFont = _font;
	else
		_font = this.addText.defaultFont;

 //	http://www.w3.org/TR/SVG/text.html	<tref xlink:href="#ReferencedText"/>
 //var _o=document.createTextNode(_text);
 //var _o=_.createNode('tspan',{x:_left,y:_baseLine,stroke:_color||this.addText.defaultColor,style:_font?'font-family:"'+_font+'"':null},_text);
 //this.addNode(_.createNode('text',{x:_left,y:_baseLine,stroke:_color||this.addText.defaultColor,style:_font?'font-family:"'+_font+'"':null},_o));
 //this.lastAdd=_o;

	// ugly hack: 說是_baseLine，其實還是會再往下一點點。
	_baseLine -= 2;
	this.addNode(_.createNode('text', {
		x : _left,
		y : _baseLine,
		stroke : _color || this.addText.defaultColor,
		style : _font ? 'font-family:"' + _font + '"' : null
	}, _text));
	//(text|g).pointer-events="none": Make text unselectable

/*	本法為標準，但FF尚未支援。
 var _s=this.svg,_i=_.getRandomID('text')_.SVG.createNode('text',{id:_i},_text);
 this.addDefs(this.lastAddDefs=_o);
 _o=_.createNode('text',{x:_left,y:_baseLine,stroke:_color||this.addText.defaultColor,style:_font?'font-family:"'+_font+'"':null},0,_t=_.createNode('tref'));
 _t.setAttributeNS('xLink','xlink:href','#'+_i);
 _o.appendChild(_t);
 _s.appendChild(this.lastAdd=_o);
*/

	return this;
},

/**
 * add numbers
 * @param _text
 * @param _left
 * @param _baseLine
 * @param _tW
 * @param _color
 * @param _font
 * @return
 * @see
 * _left: http://www.w3.org/TR/SVG/text.html#TSpanElementXAttribute
 */
addNum : function(_text, _left, _baseLine, _tW, _color, _font) {
	if (!isNaN(_text)) {
		//	說是_baseLine，其實還是會再往下一點點。
		_baseLine -= 2;
		//_text=''+_text;
		_text += '';

		var _o = [], _i = 0, _s = this.svg;
		for (; _i < _text.length; _i++)
			// _text.split('')
			_o.push(_.createNode('tspan', {
				x : _left + _i * _tW
				//, y:_baseLine
			}, _text.charAt(_i)));

		if (_s)
			_s.appendChild(this.lastAdd = _.createNode('text', {
				y : _baseLine,
				stroke : _color || this.addText.defaultColor,
				style : _font ? 'font-family:"' + _font + '"'
						: null
			}, _o));
	}
	return this;
},


/**
 * add parallel graph
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param tramA
 * @return
 * @since	2006/12/18 0:35
 */
addParallelG : function(_ds, _h, _d, _us, tramA) {
	if (_ds && _h) {
		if (isNaN(_us) || _us === '')
			_us = _ds;
		set_attribute(this
				.addPath('M' + _ds + ',' + _h + ' H0 L' + (_d || 0)
						+ ',0' + (_us ? ' h' + _us : '') + ' z'), {
			transform : tramA
		}); //	0==''
	}
	return this;
},

lastQuadrilateral : null,
lastQuadrilateralDefs : null,
/**
 * 畫簡單長方形或平行四邊形、梯形
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param tramA
 * @return
 * @see	<a href="http://zh.wikipedia.org/wiki/%E5%B9%B3%E8%A1%8C%E5%9B%9B%E8%BE%B9%E5%BD%A2">平行四邊形</a>
 * @memberOf	CeL.net.SVG
 */
addQuadrilateral:function(_ds,_h,_d,_us,tramA){	//	down side,height,upper distance,upper side
 this.addParallelG(_ds,_h,_d,_us,tramA).addContain(this.lastQuadrilateralDefs=this.lastAddDefs,'quadrilateral',{down_side:_ds,hight:_h,distance:_d,upper_side:_us});
 this.lastQuadrilateral=this.lastAdd;	//	set_attribute(s.lastQuadrilateral,'fill=none');
 return this;
},

lastTriangle : null,
lastTriangleDefs : null,
/**
 * 畫簡單三角形
 * @since	2006/12/17 12:38
 * @param _ds
 * @param _h
 * @param _d
 * @param tramA
 * @return
 * @memberOf	CeL.net.SVG
 */
addTriangle : function(_ds, _h, _d, tramA) {
	this.addParallelG(_ds, _h, _d, 0, tramA).addContain(
			this.lastTriangleDefs = this.lastAddDefs, 'triangle', {
				down_side : _ds,
				hight : _h,
				distance : _d
			});
	this.lastTriangle = this.lastAdd;
	return this;
},


/**
 * 繪製橢圓曲線。<br/>
 * 此函數利用 _.eNode 造出橢圓曲線元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _rx
 * @param _ry
 * @param _cx
 * @param _cy
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @memberOf	CeL.net.SVG
 */
addEllipsePath : function(_rx, _ry, _cx, _cy, _color, _strokeWidth,
		_fill, tramA) {
	if (_rx) {
		var _e, _p = {
				rx : _rx,
				ry : _ry,
				cx : _cx,
				cy : _cy,
				stroke : _color || this.addEllipsePath.defaultColor,
				'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
				fill : _fill || 'none',
				transform : tramA
		};

		if (!_ry)
			_e = 'circle', _p.r = _rx;
		else
			_e = 'ellipse', _p.rx = _rx, _p.ry = _ry;

		_e = _.createNode(_e, _p);

		if (_e && this.svg)
			this.addNode(_e);
	}
	return this;
},


lastCircle : null,
lastCircleDefs : null,
/**
 * 繪製圓形。<br/>
 * 此函數利用 _.type.addEllipsePath 來畫簡單圓形。
 * @param _r
 * @param _cx
 * @param _cy
 * @return
 * @memberOf	CeL.net.SVG
 */
addCircle : function(_r, _cx, _cy) {
	if (_r)
		this.addEllipsePath(_r, '', _cx, _cy).addContain(
				this.lastCircleDefs = this.lastAddDefs, 'circle', {
					r : _r
				});
	return this;
},

lastEllipse : null,
lastEllipseDefs : null,
/**
 * 繪製簡單圓形/橢圓。<br/>
 * 此函數利用 .prototype.addEllipsePath 來畫簡單橢圓。
 * @param _rx
 * @param _ry
 * @param _cx
 * @param _cy
 * @return
 * @memberOf	CeL.net.SVG
 */
addEllipse : function(_rx, _ry, _cx, _cy) {
	if (_rx) {
		this.addEllipsePath(_rx, _ry, _cx, _cy).addContain(
				this.lastEllipseDefs = this.lastAddDefs, 'ellipse',
				{
					rx : _rx,
					ry : _ry
				});
		this.lastEllipse = this.lastAdd;
	}
	return this;
},


/**
 * 繪製矩形。<br/>
 * 此函數利用 _.eNode 造出矩形路徑元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _w
 * @param _h
 * @param _x
 * @param _y
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @memberOf	CeL.net.SVG
 */
addRect : function(_w, _h, _x, _y, _color, _strokeWidth, _fill,
		tramA) {
	this.addNode(_.createNode('rect', {
		width : _w,
		height : _h,
		x : _x,
		y : _y,
		stroke : _color || this.addRect.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none',
		transform : tramA
	}));
	return this;
},


/**
 * 繪製多邊形。<br/>
 * 此函數利用 _.eNode 造出多邊形路徑元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param {int array} _pA	[x1,y1,x2,y2,x3,y3,..]
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @memberOf	CeL.net.SVG
 */
addPolyline : function(_pA, _color, _strokeWidth, _fill, tramA) {
	var _i = 0, _p = [];
	while (_i < _pA.length)
		_p.push(_pA[_i++] + ',' + _pA[_i++]);
	this.addNode(_.createNode('polyline', {
		points : _p.join(' '),
		stroke : _color || this.addRect.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none',
		transform : tramA
	}));
	return this;
},


addImage : function() {
	//	TODO
	throw new Error(1, 'addImage: yet implement!');
},

/**
 * 功能正常嗎？
 * @return	{Boolean} 功能正常
 */
status_OK : function() {
	// !!: dual-unary operator
	return !!this.svg;
}

};	//	_.prototype={


//	other manual setting
with (_.prototype) {
	addLine.defaultColor = _.defaultColor;
	addPath.defaultColor = _.defaultColor;
	addText.defaultColor = _.defaultColor;
	addText.defaultFont = null;
	addEllipsePath.defaultColor = _.defaultColor;
	addRect.defaultColor = _.defaultColor;
	addPolyline.defaultColor = _.defaultColor;

}

//	↑definition of module SVG object

//	↑definition of module SVG
// ============================================================================


/**#@+
 * @description	use {@link CeL.net.SVG} to draw:
 */

/*
draw_circle[generateCode.dLK]
	=draw_ellipse[generateCode.dLK]
	=draw_triangle[generateCode.dLK]
	=draw_quadrilateral[generateCode.dLK]
	='g_SVG';
*/

CeL.net.SVG
.
/**
 * 繪製圓形。
 * @since	2006/12/19 18:05
 * @param _r
 * @param svgO
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_circle = function(_r, svgO, _color, _fill) {
	var g_SVG = library_namespace.net.SVG;
	if (_r
			&& (svgO || (svgO = new g_SVG(
					(_r + g_SVG.defaultStrokeWidth) * 2,
					(_r + g_SVG.defaultStrokeWidth) * 2).show()))
					&& svgO.status_OK()) {
		svgO.addCircle(_r, _r + g_SVG.defaultStrokeWidth, _r
				+ g_SVG.defaultStrokeWidth);
		return svgO;
	}
};
CeL.net.SVG
.
/**
 * 繪製橢圓。
 * @param _rx
 * @param _ry
 * @param svgO
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_ellipse = function(_rx, _ry, svgO, _color, _fill) {
	var g_SVG = library_namespace.net.SVG;
	if (_rx
			&& _ry
			&& (svgO || (svgO = new g_SVG(
					(_rx + g_SVG.defaultStrokeWidth) * 2,
					(_ry + g_SVG.defaultStrokeWidth) * 2).show()))
					&& svgO.status_OK()) {
		svgO.addEllipse(_rx, _ry, _rx + g_SVG.defaultStrokeWidth, _ry
				+ g_SVG.defaultStrokeWidth);
		return svgO;
	}
};


CeL.net.SVG
.
/**
 * 畫簡單梯形。
 * @since	2006/12/17 12:38
 * @requires	split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_quadrilateral
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param svgO
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_quadrilateral = function(_ds, _h, _d, _us, svgO, _color, _fill) {
	var g_SVG = library_namespace.net.SVG;
	if (isNaN(_us) || _us === '')
		_us = _ds;
	if (_ds
			&& _h
			&& (svgO || (svgO = new g_SVG((_ds > _d + _us ? _ds : _d
					+ _us)
					+ g_SVG.defaultStrokeWidth, _h
					+ g_SVG.defaultStrokeWidth).show()))
					&& svgO.status_OK()) {
		set_attribute(svgO.addQuadrilateral(_ds, _h, _d, _us).lastQuadrilateral,
				{
			stroke : _color,
			fill : _fill
				});
		return svgO;
	}
};

CeL.net.SVG
.
/**
 * 畫簡單三角形。
 * @since	2006/12/17 12:38
 * @requires	split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_triangle
 * @param _ds
 * @param _h
 * @param _d
 * @param svgO
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_triangle = function(_ds, _h, _d, svgO, _color, _fill) {
	var g_SVG = library_namespace.net.SVG;
	if (_ds
			&& _h
			&& (svgO || (svgO = new g_SVG((_ds > _d ? _ds : _d)
					+ g_SVG.defaultStrokeWidth, _h
					+ g_SVG.defaultStrokeWidth).show()))
					&& svgO.status_OK()) {
		set_attribute(svgO.addTriangle(_ds, _h, _d).lastTriangleDefs, {
			stroke : _color,
			fill : _fill
		});
		return svgO;
	}
};

/*
draw_addition[generateCode.dLK]
	=draw_multiplication[generateCode.dLK]
	=draw_long_division[generateCode.dLK]
	='g_SVG,draw_scale';
*/

/**
 * default 畫筆。
 * @inner
 * @private
 */
var draw_scale = {
		/**
		 * text width
		 * @inner
		 * @private
		 */
		tW : 10,
		/**
		 * text height
		 * @inner
		 * @private
		 */
		tH : 2 * (10/* tW */- 2),
		/**
		 * decimal separator, 小數點
		 * @see
		 * <a href="http://en.wikipedia.org/wiki/Decimal_separator" accessdate="2010/1/20 18:29">Decimal separator</a>
		 */
		ds : '.',
		/**
		 * width of decimal separator
		 */
		dsw : 4,
		/**
		 * line height
		 * @inner
		 * @private
		 */
		lH : 4,
		/**
		 * margin left
		 * @inner
		 * @private
		 */
		mL : 0,
		/**
		 * margin top
		 * @inner
		 * @private
		 */
		mT : 0,
		/**
		 * 根號寬, squire width
		 * @inner
		 * @private
		 */
		sW : 10
};
//draw_scale.tH=22,draw_scale.tW=12;	//	for print
CeL.net.SVG
.
/**
 * 利用 module SVG 物件來演示直式加法。
 * @since	2006/12/26 17:47
 * @param num1
 * @param num2
 * @param svgO
 * @param _color
 * @param _font
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_addition=function(num1, num2, svgO, _color, _font) {
	if (!num1 && !num2)
		return;
	var g_SVG = library_namespace.net.SVG;
	var _op = '+';
	if (num2 < 0)
		_op = '-', num2 = -num2;

	var _a = _op == '+' ? (num1 - 0) + (num2 - 0) : num1 - num2,
	_h = 3,
	_w = (num2 += '').length + 2,
	tW = draw_scale.tW,
	tH = draw_scale.tH,
	lH = draw_scale.lH,
	mL = draw_scale.mL,
	mT = draw_scale.mT;

	if ((_a += '').length + 1 > _w)
		_w = _a.length + 1;
	if ((num1 += '').length + 1 > _w)
		_w = num1.length + 1;
	_h = _h * tH + 2 * lH + 2 * mT;
	_w = (2 + _w) * tW + 2 * mL;

	if (svgO && svgO.status_OK())
		svgO.clean();
	else if (!(svgO = new g_SVG).show().status_OK())
		return null;

	svgO.setSize(_w, _h);

	_w -= mL + tW;

	svgO
		.addNum(num1, _w - num1.length * tW, mT + tH, tW, _color, _font)
		.addNum(num2, _w - num2.length * tW, mT + 2 * tH, tW, _color, _font)
		.addText(_op, mL + tW, mT + 2 * tH, _color, _font)
		.addPath('M' + mL + ',' + (mT + 2 * tH + lH / 2) + ' H' + (_w + tW))
		.addNum(_a, _w - _a.length * tW, mT + 3 * tH + lH, tW, _color, _font);

	return svgO;
};
//draw_subtraction[generateCode.dLK]='draw_addition';
CeL.net.SVG
.
/**
 * 呼叫 draw_subtraction 來演示直式減法。因為直式加減法的運算與機制過程非常相似，因此我們以 draw_addition 來一併的處理這兩個相似的運算過程。
 * @since	2006/12/26 17:47
 * @param num1
 * @param num2
 * @param svgO
 * @param _color
 * @param _font
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 */
draw_subtraction = function(num1, num2, svgO, _color, _font) {
	return _.draw_addition.call(this, num1, -num2, svgO, _color, _font);
};

CeL.net.SVG
.
/**
 * 利用 module SVG 物件來演示直式乘法。<br/>
 * TODO: 小數的乘法
 * @since	2006/12/26 17:47
 * @param num1
 * @param num2
 * @param svgO
 * @param _color
 * @param _font
 * @return	module SVG object
 * @memberOf	CeL.net.SVG
 * @see
 * <a href="http://203.71.239.19/math/courses/cs04/M4_6.php" accessdate="2010/1/20 18:5">小數篇：小數的乘法</a>
 */
draw_multiplication=function(num1, num2, svgO, _color, _font) {
	if (!num1 && !num2)
		return;

	var g_SVG = library_namespace.net.SVG;
	var _op = '×', _j, _C = 1, _a = num1 * num2, _h = 0, _w = (num2 += '').length + 2, tW = draw_scale.tW, tH = draw_scale.tH, lH = draw_scale.lH, mL = draw_scale.mL, mT = draw_scale.mT;
	if ((_a += '').length > _w)
		_w = _a.length;
	if ((num1 += '').length > _w)
		_w = num1.length;
	for (_j = 0; _j < num2.length; _j++)
		if (num2.charAt(_j) - 0)
			_h++;
	if (_h == 1)
		_h = 0, _C = 0;
	_h = (3 + _h) * tH + 2 * lH + 2 * mT;
	_w = (2 + _w) * tW + 2 * mL;

	if (svgO && svgO.status_OK())
		svgO.clean();
	else if (!(svgO = new g_SVG).show().status_OK())
		return null;

	svgO.setSize(_w, _h);

	_w -= mL + tW;

	svgO
		.addNum(num1, _w - num1.length * tW, mT + tH, tW, _color, _font)
		.addNum(num2, _w - num2.length * tW, mT + 2 * tH, tW, _color, _font)
		.addText(_op, mL + tW, mT + 2 * tH, _color, _font)
		.addPath('M' + mL + ',' + (_h = mT + 2 * tH + lH / 2) + ' H' + (_w + tW));

	_op = '';
	_h += lH / 2;
	var _w2 = _w, _n;
	if (_C) {
		for (_j = num2.length - 1; _j >= 0; _j--)
			if (_n = num2.charAt(_j) - 0)
				svgO.addNum(_n = (num1 * _n) + _op, _w2 - _n.length
						* tW, _h += tH, tW, _color, _font), _w2 -= tW
						* (_op.length + 1), _op = '';
			else
				_op += '0';
		svgO
		.addPath('M' + mL + ',' + (_h += lH / 2) + ' H'
				+ (_w + tW));
	}

	svgO.addNum(_a, _w - _a.length * tW, _h + lH / 2 + tH, tW, _color, _font);

	return svgO;
};

/*
TODO:
小數
換基底
*/
//draw_long_division[generateCode.dLK]='g_SVG,set_class';//split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_long_division
CeL.net.SVG
.
/**
 * 利用 module SVG 物件來展示<a href="http://en.wikipedia.org/wiki/Long_division" title="long division">直式除法</a>。<br/>
 * !! 尚有許多 bug<br/>
 * @since	2006/12/11-12 11:36
 * @param dividend
 * @param divisor
 * @param	digits_after	TODO: 小數直式除法: 小數點後位數, how many digits after the decimal separator
 * @param svgO
 * @param _color
 * @param _font
 * @return	module SVG object
 * @example
 * // include module
 * CeL.use('net.SVG');
 * 
 * //	way 1
 * var SVG_object = new CeL.SVG;
 * SVG_object.attach('panel_for_SVG').show(1);
 * CeL.draw_long_division(452, 34, SVG_object);
 * // You can also put here.
 * //SVG_object.attach('panel_for_SVG').show(1);
 * 
 * //	way 2
 * var SVG_object = CeL.draw_long_division(100000, 7);
 * SVG_object.attach('panel_for_SVG').show(1);
 * 
 * // 另一次顯示
 * CeL.draw_long_division(100, 7, SVG_object);
 * @memberOf	CeL.net.SVG
 */
draw_long_division = function(dividend, divisor, svgO, _color, _font) {
	if (isNaN(dividend) || isNaN(divisor) || !divisor)
		return;

	var g_SVG = library_namespace.net.SVG;
	/**
	 * 餘數 remainder
	 * @inner
	 * @ignore
	 */
	var remainder;
	/**
	 * 商 quotient
	 * @inner
	 * @ignore
	 */
	var quotient = '' + Math.floor(dividend / divisor),
		tW = draw_scale.tW,
		tH = draw_scale.tH,
		lH = draw_scale.lH,
		mL = draw_scale.mL,
		mT = draw_scale.mT,
		sW = draw_scale.sW,
		bx = mL + ('' + divisor).length * tW + sW,
		by = mT + lH + 2 * tH;

	dividend += '';
	if (svgO && svgO.status_OK())
		svgO.clean();
	else if (!(svgO = new g_SVG).show().status_OK())
		return null;

	svgO
	//.show(1)
	// 調整大小
	.setSize(
			2
			* mL
			+ (('' + divisor).length + dividend.length + 2)
			* tW + sW,
			2 * mT + by + quotient.length * (tH * 2 + lH))
	// 除數 divisor
	.addNum(divisor, mL, by, tW, _color, _font)
	// 商 quotient
	.addNum(quotient,
			bx + (dividend.length - quotient.length) * tW,
			mT + tH, tW, _color, _font)
	// 被除數 dividend
	.addNum(dividend, bx, by, tW, _color, _font)
	// .addNode('path',{d:'M'+(bx+(dividend.length+1)*tW)+','+(by-lH/2-tH)+'
	// H'+(bx-tW)+' a'+tW/2+','+(lH+tH)+' 0 0,1
	// -'+tW/2+','+(lH+tH),stroke:'#000',style:'fill:none;'})
	.addPath(
			'M' + (bx - (tW + sW) / 2) + ',' + (by + lH / 2)
			+ ' a' + tW / 2 + ',' + (lH + tH)
			+ ' 0 0,0 ' + tW / 2 + ',-' + (lH + tH)
			+ ' h' + (dividend.length + 2) * tW);

	svgO.addDefs(g_SVG.createNode('line', {
		x1 : 0,
		y1 : 0,
		x2 : (dividend.length + 1) * tW,
		y2 : 0,
		// 'stroke-width':'1px',
		stroke : svgO.addLine.defaultColor
	}));

	if (svgO.div)
		// svgO.div.className='long_division';
		set_class(svgO.div, 'long_division');

	// 用 symbol??
	svgO.addContain(0, 'long_division', {
		dividend : dividend,
		divisor : divisor
	});

	var _k = 0, a, b, l = svgO.lastAddDefs,
	/**
	 * 被除數處理到第幾位
	 * @inner
	 * @ignore
	 */
	dt = 1;
	remainder = dividend.charAt(0);
	for (; _k < quotient.length;) {
		a = quotient.charAt(_k);
		// if(!a)continue;
		a = '' + a * divisor, b = dividend.length
		- quotient.length + _k + 1;

		svgO.addUse(l, {
			x : bx,
			y : (by + tH + lH / 2)
		}).addNum(a, bx + (b - a.length) * tW, by + tH, tW, _color,
				_font);

		// 以下..ugly hack
		// 先算出餘數
		while ((a == 0 || remainder - a < 0) && dt < dividend.length)
			remainder += dividend.charAt(dt++);
		remainder -= a;
		if (!remainder)
			remainder = '';
		//alert(remainder+','+quotient.charAt(_k+1)+'\n'+(i<quotient.length))
		// 再添加到夠減的位數
		while (quotient.charAt(++_k) == 0 && _k < quotient.length) {
			b++;
			if (remainder || dividend.charAt(dt) > 0)
				remainder += dividend.charAt(dt);
			dt++;
		}
		// 顯示位數微調
		if (dt < dividend.length) {
			b++;
			// 加一位
			remainder += dividend.charAt(dt++);
		} else if (!remainder)
			b--;
		//alert(remainder+','+a+','+dt+'\n'+(remainder<a));
		svgO.addNum(remainder || 0, bx + (b - ('' + remainder).length)
				* tW, by += 2 * tH + lH, tW, _color, _font);
	}

	return svgO;
};


/**#@-*/
//	↑@memberOf	module SVG




return (
	CeL.net.SVG
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for web
 * @fileoverview
 * 本檔案包含了 web 的 functions。
 * @since	
 */

/*
http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K902.aspx
http://www.nczonline.net/blog/2010/01/12/history-of-the-user-agent-string/
當 IE 初次推出它們的 User Agent 標誌的時候，是這個樣子：
MSIE/3.0 (Win95; U)
*/

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.web';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.web
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'code.compatibility.is_DOM,data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	web 的 functions
 */
CeL.net.web
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.net.web
.prototype = {
};






/*
	HTML only	-------------------------------------------------------
*/


/*	test if can use flash

	better use SWFObject:
	http://code.google.com/p/swfobject/

	Browser detect:	http://www.quirksmode.org/js/detect.html
var plugin=(window.navigator.mimeTypes && window.navigator.mimeTypes["application/x-shockwave-flash"]) ? window.navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
if ( plugin ) {
        plugin=parseInt(plugin.description.substring(plugin.description.indexOf(".")-1)) >= 3;
}
else if (window.navigator.userAgent && window.navigator.userAgent.indexOf("MSIE")>=0 && window.navigator.userAgent.indexOf("Windows")>=0) {
        document.write('<SCRIPT LANGUAGE=VBScript\> \n');
        document.write('on error resume next \n');
        document.write('plugin=( IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.6")))\n');
        document.write('<\/SCRIPT\> \n');
}
if ( plugin ) {
        document.write('<OBJECT classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
        document.write('  codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" ');
        document.write(' ID=flash5clickTAG WIDTH='+n_width+' HEIGHT='+n_height+'>');
        document.write(' <PARAM NAME=movie VALUE="'+ n_flashfile +'"><param name=wmode value=opaque><PARAM NAME=loop VALUE=true><PARAM NAME=quality VALUE=high>  ');
        document.write(' <EMBED src="'+ n_flashfile +'" loop=true wmode=opaque quality=high  ');
        document.write(' swLiveConnect=FALSE WIDTH='+n_width+' HEIGHT='+n_height+'');
        document.write(' TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash">');
        document.write(' <\/EMBED>');
        document.write(' <\/OBJECT>');
} else if (!(window.navigator.appName && window.navigator.appName.indexOf("Netscape")>=0 && window.navigator.appVersion.indexOf("2.")>=0)){
        document.write('<A HREF="'+ n_altURL +'" target="'+n_target+'"><IMG SRC="'+ n_altimg +'" WIDTH='+n_width+' HEIGHT='+n_height+' BORDER=0><\/A>');
}
*/

//	從後面調過來的
var setCookieS,disabledKM=0,scrollToXY,scrollToInterval,scrollToOK,doAlertDivName,doAlertOldScrollLocation;
//setObjValue('setCookieS','moment=-1,expires=0,path=0,domain=0,secure=0,DeleteAll=2,DeleteAllRoot,setRoot,setDomain,forever',1);
setCookieS={
		moment:-1,expires:0,path:0,domain:0,secure:0,DeleteAll:2,DeleteAllRoot:3,setRoot:4,setDomain:5,forever:6
		};


//	copy from base.js
//window.onerror=HandleError;
function HandleError(message,url,line){
 // if(window.confirm())_DO_CONTINUE_
 if(window.navigator.appName=="Microsoft Internet Explorer")return !window.confirm(url+'\n\nJavaScript Error: '+line+'\n'+message+'\n\nSee more details?');
 else if(window.navigator.appName=="Netscape")window.navigate('javascript:');//document.location.href="javascript:";
 //return message;	'Warning: function HandleError does not always return a value' in some Firebird with	user_pref("javascript.options.strict", true);	@ prefs.js
}
//window.onresize=OnResize;	//	預防(舊版)NS resize時版面亂掉
function OnResize(){history.go(0);}//location.replace(),location.reload()
//	回上一頁	history.go(-1),history.back()/history.forward()	this.location.replace(document.referrer)	//	Opera's document.referrer returns only null if referrer logging is disabled
if(typeof document=='object')write=document.write;//IE only!!	http://blog.livedoor.jp/dankogai/archives/50952477.html	DOM時代のdocument.write()

/*
http://blog.taragana.com/index.php/archive/how-to-enable-windowstatus-in-firefox/
window.status在firefox下默認是不能修改的。
可以通過工具->選項->網頁特性->啟用javascript->高級->把修改狀態欄文本打上勾就好了。

Open about:config in browser and search for dom.disable_window_status_change. Change it to false.
Additionally in Firefox v1.0, this can be changed via "Tools → Options → Web Features → Enable JavaScript / Advanced → Allow scripts to change status bar text"
In Firefox v1.5, this can be changed via "Tools → Options → Content → Enable JavaScript / Advanced → Allow scripts to change status bar text"
via MozillaZine; learnt the hard way. 
*/
function RollStatus(m,v,from,RollStatusL){//message,速度velocity,from where,unit length(基本上後兩者勿設定)
 var s='    ';//間隔以s
 if(!RollStatusL)RollStatusL=m.length,m+=s+m;if(!from||from>=RollStatusL+s.length)from=0;
 if(!m)if(window.status)RollStatus(window.status,v);else return;else if(m.slice(from)!=window.status&&m.length>L)return;
 var L=99,V=v||999;//L:least length
 while(m.length<L)m+=s+m;
 window.status=m.slice(++from);
 RollStatusS=window.setTimeout('RollStatus("'+m+'",'+V+','+from+','+RollStatusL+');',V);
 //RollStatusS=window.setInterval('RollStatus("'+m+'",'+V+','+from+')',V)
}

//	↑copy from base.js


/*	預防hack：禁止鍵盤keyboard&滑鼠mouse輸入,可以再加上一層div於最上方以防止copy
	下面一行調到檔案頭
var disabledKM=0;
*/
//disableKM[generateCode.dLK]='disabledKM';
function disableKM(s,m){	//	s=1:回復,s=2:使螢幕亦無法捲動(對NS無效),m:message,輸入時發出警告
 /*
 window.onerror=function(){return ture;};
 //	定義亦可用 function document.onmousedown(){..}
 document.onmousedown=document.oncontextmenu=document.onselectstart=document.ondragstart=function(e){return false;};
 //	印刷を禁止して
 window.onbeforeprint=function(){for(i=0;i<document.all.length;i++){if(document.all[i].style.visibility!="hidden"){document.all[i].style.visibility="hidden";document.all[i].id="elmid";}}};
 window.onafterprint=function(){for(i=0;i<document.all.length;i++){if(document.all[i].id=="elmid"){document.all[i].style.visibility="";}}};
 */
 if(!document.body)return;
 if(typeof s=='undefined')s=1;
 if(typeof disabledKM=='undefined')disabledKM=0;

 if(!s){
  if(disabledKM){
   ondragstart=document.body.Oondragstart||null,
   oncontextmenu=document.body.Ooncontextmenu||null,
   onselectstart=document.body.Oonselectstart||null;
   with(window.document.body)
    if(disabledKM==2)style.overflow=typeof document.body.Ooverflow=='string'?Ooverflow:'auto';
   onmousedown=window.Oonmousedown||null,
   onkeydown=window.Oonkeydown||null;
   onmousedown=document.Oonmousedown||null,
   onkeydown=document.Oonkeydown||null;
  }
  disabledKM=0;
  return;
 }

if(disabledKM){with(document.body)	//	已lock時不執行多餘的動作與覆蓋舊資訊
 if(s==2)style.overflow='hidden';
 else if(typeof document.body.Ooverflow=='string')style.overflow=Ooverflow;
}else{
//	<body oncontextmenu="return false" ondragstart="return false" onselectstart="return false">
 with(document.body){	//	預防hack
  //leftMargin=topMargin=rightMargin=bottomMargin=0;	//	使body填滿視窗
  document.body.Ooverflow=style.overflow;
  if(s==2)style.overflow='hidden';	//	使螢幕亦無法捲動
  if(typeof onselectstart!='undefined')document.body.Oonselectstart=onselectstart;
  if(typeof oncontextmenu!='undefined')document.body.Ooncontextmenu=oncontextmenu;
  if(typeof ondragstart!='undefined')document.body.Oondragstart=ondragstart;
  ondragstart=oncontextmenu=onselectstart=function(){return false;}//new Function("return false;");
 }
 //	不要在 document 对象中设置 expando 属性，在 window 对象上设置 expando 属性。
 with(window){
  if(typeof onmousedown!='undefined')document.Oonmousedown=onmousedown;
  if(typeof onkeydown!='undefined')document.Oonkeydown=onkeydown;
 }
 with(window.document){
  //ndblclick=
  if(typeof onmousedown!='undefined')document.Oonmousedown=onmousedown;
  if(typeof onkeydown!='undefined')document.Oonkeydown=onkeydown;
 }
}
 window.onmousedown=window.onkeydown=document.onmousedown=document.onkeydown=document.onContextMenu
	=new Function('e',
			'if(window.navigator.appName=="Microsoft Internet Explorer"&&event.button!=1||window.navigator.appName=="Netscape"&&e.which!=1){'
			+(m?'alert('+dQuote(m)+');':'')+'return false;}');
/*
			'if(window.navigator.appName=="Microsoft Internet Explorer"\
			&&event.button!=1||window.navigator.appName=="Netscape"&&e.which!=1){'+(m?'alert('+dQuote(m)+');':'')+'return false;}');
*/

 //	window.captureEvents(Event.MOUSEUP|Event.MOUSEDOWN);
 //	window.onmousedown=function(e){if(e.which==1){window.captureEvents(Event.MOUSEMOVE);window.onmousemove=rf;}};
 //	window.onmouseup=function(e){if(e.which==1){window.releaseEvents(Event.MOUSEMOVE);window.onmousemove=null;}};
 if(!disabledKM && window.captureEvents)
	window.captureEvents(Event.MOUSEDOWN),
	window.captureEvents(Event.KEYDOWN);

 disabledKM=s;
}

//setObjValue('trigger.f','_switch,_show,_hidden,_test','int');	//	use to control trigger().	test:get what condition with no change
//trigger[generateCode.dLK]='get_element';
function trigger(div,v,s){	//	v:trigger.f	toggle
 if(!s)s='block';
 var N,n='none',f=arguments.callee.f;//inline,list-item. 其他恐造成error!
 //showObj(div);
 if(typeof div=='string')div=typeof get_element=='function'?get_element(div):document.getElementById(div);
 if(!div)return;
 with(div){
  if(!div.style)n='hidden';//visible	//var d=div.style?style:div.visibility;
  if(typeof tagName=='string')N=tagName.toLowerCase();	//	Opera 7.5意外的沒有tagName (-_-) 而Firefox也可能沒有此property
  if((N=='div'||N=='span')&&!innerHTML)if(div.style)style.display=n;else div.visibility=h;//N!='iframe'&&N!='input'
  //alert(v+','+(!v||v==f._switch));
  if(div.style)with(style)return display= !v||v==f._switch? !display||display==n?s:n:	//	display==''時預設為顯示
	v==f._show?s: v==f._hidden?n: /*v==f._test?display:*/display;
 }
}
//simpleWrite('a.txt',reduceCode([f,trigger,setObjValue]));
//for(var i in style)tt+=i+'='+document.getElementById("others").style[i]+"<br/>";document.write(tt);



CeL.net.web
.
/*	http://blog.stevenlevithan.com/archives/faster-than-innerhtml
You can use the above as el = replace_HTML(el, newHtml) instead of el.innerHTML = newHtml.

.innerHTML=,document.createElement(→XML_node()
.innerHTML='' → remove_all_child


http://forum.moztw.org/viewtopic.php?t=17984&postdays=0&postorder=asc&start=15
adoptNode() 會把現有的節點拿去用，ownerDocument 會被變更，被 adopt 的節點會從原來的 document 消失。
importNode() 比較像是 cloneNode() 加上變更 ownerDocument。
以前因為 Gecko 沒有太嚴格，所以可以用 Ajax 取回一個 XML 文件並直接透過 responseXML 把裡面的節點當 HTML 節點一樣的插入現有的網頁。
*/
/**
 * replace HTML
 * @param o
 * @param html
 * @return
 */
replace_HTML = function(o,html){
	if (typeof o === 'string')
		o = document.getElementById(o);
	if (!o || typeof o != 'object')
		return;
	/*@cc_on	// Pure innerHTML is slightly faster in IE
	 o.innerHTML=html||'';
	 return o;
	@*/
	var n = o.cloneNode(false);
	n.innerHTML = html || '';
	o.parentNode.replaceChild(n, o);
	// Since we just removed the old element from the DOM, return a reference to the new element, which can be used to restore variable references.
	return n;
};

/*
使用.firstChild或.lastChild須注意此node可能是text node，不能appendChild。須以.nodeType判別。

http://msdn2.microsoft.com/zh-tw/library/system.xml.xmlnode.removechild(VS.80).aspx
繼承者注意事項 在衍生類別中覆寫 RemoveChild 時，為了要正確引發事件，您必須呼叫基底類別的 RemoveChild 方法。

removeAllChild[generateCode.dLK]='replace_HTML';
function removeAllChild(o){
 //return removeNode(o,1);

 //	http://blog.stevenlevithan.com/archives/faster-than-innerhtml
 if(typeof o=='string')o=document.getElementById(o);
 if(!o||typeof o!='object')return;
 o.parentNode.replaceChild(o.cloneNode(false),o);
 return o;
}

http://www.webreference.com/js/column43/replace.html
The replaceNode method is much more intuitive than the removeNode method. While the removeNode method just removes the specified element and makes its descendents children of their grandfather, the replaceNode method deletes the whole subtree that is rooted at the specified element, and substitutes it with a new element.
node_want_to_replace.removeNode(new_node)
*/
CeL.net.web
.
/**
 * 移除 node
 * @param o
 * @param tag	tag===1: only child, undefined: remove only self, others: only <tag> child
 * @return
 * @memberOf	CeL.net.web
 */
remove_node = function(o,tag){
 var _f=arguments.callee,i;
 if(typeof o==='string')o=document.getElementById(o);
 if(!o||typeof o!='object')return;

 //	remove child
 if(tag){
  if(typeof tag=='string')
   tag=tag.toLowerCase();

  //	safer: if you have any asynchronous events going. But node.hasChildNodes() will always do an evaluation.
  //while(o.hasChildNodes()&&(i=o.firstChild))o.removeChild(i);

  //	don't use for()	http://weblogs.macromedia.com/mesh/archives/2006/01/removing_html_e.html
  i=o.childNodes.length;
  while(i--)
   if(tag===1||tag==o.childNodes[i].tagName.toLowerCase())
    //_f(o.childNodes[i],tag),	//	TODO: 會有問題
    o.removeChild(o.childNodes[i]);
 }

 //	remove self
 return tag||!(i=o.parentNode)?o:i.removeChild(o);	//	if(o.parentNode): 預防輸入的o為create出來的
};

CeL.net.web
.
remove_all_child = _.replace_HTML;






CeL.net.web
.
/**
 * set/get/remove attribute of a element<br/>
 * in IE: setAttribute does not work when used with the style attribute (or with event handlers, for that matter).
 * @param _e	element
 * @param propertyO	attributes object (array if you just want to get)
 * @return
 * @requires	split_String_to_Object
 * @see
 * setAttribute,getAttribute,removeAttribute
 * http://www.quirksmode.org/blog/archives/2006/04/ie_7_and_javasc.html
 * @since	2006/12/10 21:25 分離 separate from XML_node()
 * @memberOf	CeL.net.web
 */
set_attribute=function(_e,propertyO){
 if(typeof _e=='string')_e=typeof get_element=='function'?get_element(_e):document.getElementById(_e);
 if(!_e||!propertyO/*||_e.nodeType==3/* TEXT_NODE */)return;

 var _l,_m,_g,_N={svg:'2000/svg',mathml:'1998/Math/MathML',xhtml:'1999/xhtml',xlink:'1999/xlink'	//	Namespaces:SVG,MathML,XHTML,XLink
		,html:'TR/REC-html40'	//	亦可用'1999/xhtml'
	};
 if(typeof propertyO=='string')propertyO=/[=:]/.test(propertyO)?split_String_to_Object(propertyO):propertyO.split(',');
 if(propertyO instanceof Array)
  _g=propertyO.length==1?propertyO[0]:1,propertyO=split_String_to_Object(propertyO.join(','));

 for(_l in propertyO){
  if(_l=='class'&&!propertyO['className'])propertyO[_l='className']=propertyO['class'];
  if(_g||(_l in propertyO)&&propertyO[_l]!=null)
   if(_l=='className'||typeof propertyO[_l]=='function')if(_g)propertyO[_l]=_e[_l];else _e[_l]=propertyO[_l];//_l=='id'||
	/*
		XML 中id不能以setAttribute設定。
		class不能以setAttribute設定@IE。
		http://www.quirksmode.org/bugreports/archives/2005/03/setAttribute_does_not_work_in_IE_when_used_with_th.html
		IE ignores the "class" setting, and Mozilla will have both a "class" and "className" attribute defined
	*/
   else if(_e.setAttributeNS&&(_m=_l.match(/^(.+):([^:]+)$/))){
    _m=_m[1];
    if(_m.indexOf('://')==-1&&_N[_m.toLowerCase()])_m='http://www.w3.org/'+_N[_m.toLowerCase()];
    if(_g)propertyO[_l]=_e.getAttributeNS(_m,_l);
    else _e.setAttributeNS(_m,_l,propertyO[_l]);//try{_e.setAttributeNS(_m,_l,propertyO[_l]);}catch(e){alert('set_attribute: Error!');}
   }else if(_g)propertyO[_l]=_e.getAttribute(_l);else _e.setAttribute(_l,propertyO[_l]);//_e.setAttributeNS?_e.setAttributeNS(null,_l,propertyO[_l]):_e.setAttribute(_l,propertyO[_l]);
 }
 return typeof _g=='string'?propertyO[_g]:propertyO;
};


CeL.net.web
.
/**
 * append children node to specified element
 * @param node	node / node id
 * @param child_list	children node array
 * @return
 * @since	2007/1/20 14:12
 * @memberOf	CeL.net.web
 */
add_node = function(node, child_list) {
	var _s = arguments.callee;
	if (typeof node === 'string')
		node = typeof get_element === 'function' ? get_element(node) 
				: document.getElementById(node);

	if (node && arguments.length > 2) {
		for ( var _j = 1, l = arguments.length; _j < l; _j++)
			_s(node, arguments[_j]);
		return;
	}

	if (!node || !child_list
			// || node.nodeType === 3/* TEXT_NODE */
	)
		return;

	//	預防 RegExp 等，需要 toString()
	if (child_list instanceof RegExp)
		child_list = '';

	if (typeof child_list === 'object') {
		if (child_list)
			if (child_list instanceof Array
					// && child_list.length
			)
				for ( var _j = 0, l = child_list.length; _j < l; _j++)
					_s(node, child_list[_j]);
			else
				node.appendChild(child_list);
		return;
	}
	if (typeof child_list === 'number' && !isNaN(child_list))
		// child_list=child_list.toString();
		child_list += '';
	if (typeof child_list === 'string') {
		var tag_name = node.tagName.toLowerCase();
		if (tag_name === 'textarea' || tag_name === 'select'
			|| (tag_name === 'input' && node.type === 'text'))
			node.value = child_list;
		else if (tag_name === 'option') {
			if (!node.value)
				node.value = child_list;
			node.innerHTML = child_list;
		} else if (child_list.indexOf('<') != -1)
			//	may cause error: -2146827687 未知的執行階段錯誤 e.g., XML_node('a',0,0,[XML_node('a'),'<br/>']);
			//try{
				node.innerHTML += child_list;
			//}catch(e){node.appendChild(XML_node('span',0,0,child_list));}
		else
			//try{
				node.appendChild(document.createTextNode(child_list));
			//}catch(e){alert(e.description);}
		// else alert('add_node: Error insert contents:\n['+child_list+']');
	}
};



/*
XML_node('div','id:idName');	doesn't insert, just return the object
XML_node('div',{'id':null});	won't set id
XML_node('div',{'id':undefined});	won't set id

XML_node('div','id:idName',1);	insert at last of document
XML_node('div',{id:'idName'},refO);	insert before(prepend) obj refO: refO.parentNode.insertBefore(_newNode_,refO)
XML_node('div','id:idName',document.body);	insert at top of document
XML_node('div','id:idName',[parent]);	append as a child of obj parent: parent.appendChild(_newNode_)
XML_node('div','id:idName',[parent,0]);	append as a child of obj parent: parent.appendChild(_newNode_)
XML_node('div','id:idName',[parent,refNode]);	insert before refNode: parent.insertBefore(_newNode_,refNode)
XML_node('div','id:idName',[parent,refNode,1]);	insert after refNode: UNDO
XML_node('div','id:idName',[parent,1]);	insert as the first child of parent: parent.insertBefore(_newNode_,parent.firstChild)
XML_node('div','id:idName',[0,refNode]);	insert before refNode: document.body.insertBefore(_newNode_,refNode)
XML_node('div','id:idName',[0]);	append after all: document.body.appendChild(_newNode_,refNode)

XML_node('div','id:idName',0,'asas');	insert 'asas' as innerText
XML_node('div','id:idName',0,'<a>sas</a>');	insert 'asas' as innerHTML
XML_node('div','id:idName',0,obj);	insert obj as childNode
XML_node('div','id:idName',0,[o1,o2]);	insert o1,o2 as childNodes


有用到新建 HTML element 的函數執行完畢應該將所有變數，尤其是 object 重設；
這是因為 HTML element 的存在會使函數裡的 object 變數不能被釋放。
設成 null 是因為 null 不能設定 method，而 string, number 可以。

http://www.blogjava.net/tim-wu/archive/2006/05/29/48729.html
為預防IE Cross-Page Leaks，
use:
XML_node(++, ++, [XML_node(.., .., [meta])]);
instead of:
XML_node(.., .., [meta], XML_node(++, ++));
P.S. 2007/11/11 似乎已修正？


buggy 瑕疵:
XML_node(0,0,[parent],'innerText');	return a textNode append as a child of obj parent

TODO:
XML 中 insertBefore(),appendChild()似乎無反應？	http://developer.mozilla.org/en/docs/SVG:Namespaces_Crash_Course
insertAfter

輸入 ( [tagName,{attr1:val1,..},[inner object]], insertBeforeO)
e.g.,
([
	['b',{id:'',class:'',style:{color:''}},
		['span',0,'>>test<<']
	],
	['span',{style:{color:''}},'<<test2>>'],
],insertSetting)

insertSetting:
	(null)		just create & return
	以下：obj===0 則設成 document.body
	parent		appendChild
	[refO,0-4]	0:appendChild, 1: add as firstChild, 2: add as nextSibling, 3: add as priviusSibling


*/
CeL.net.web
.
/**
 * create new HTML/XML <a href="https://developer.mozilla.org/en/DOM/node">node</a>(<a href="https://developer.mozilla.org/en/DOM/element">element</a>)
 * @param tag	tag name
 * @param propertyO	attributes object
 * @param insertBeforeO	object that we wnat to insert before it
 * @param innerObj	inner object(s)
 * @param styleO	style object
 * @return	node object created
 * @requires	set_attribute,add_node
 * @since	2006/9/6 20:29,11/12 22:13
 * @memberOf	CeL.net.web
 */
XML_node = function(tag,propertyO,insertBeforeO,innerObj,styleO){ 
 //	XML 中沒有document.body！
 //if(typeof document.body=='undefined')document.body=document.getElementsByTagName('body')[0];

 if(typeof document!='object'||(!document.createElement&&!document.createElementNS)||!document.body){
  alert('Warning: Cannot create tag ['+tag+'].');
  return;
 }

 var _i={svg:'2000/svg',mathml:'1998/Math/MathML',xhtml:'1999/xhtml',xlink:'1999/xlink'	//	Namespaces:SVG,MathML,XHTML,XLink
		,html:'TR/REC-html40'	//	亦可用'1999/xhtml'
	},_NS,_DOM2=document.createElementNS?1:0	//	use Namespaces or not	//	buggy now.
	,_e='http://www.w3.org/'	//	Namespaces base
	;
/*
 //	依styleO指定 Namespace
 if(typeof styleO=='string'){
  if(styleO.indexOf('://')!=-1)_NS=styleO,styleO=0;
  else if(_i[styleO])_NS=_e+_i[styleO],styleO=0;
 }else _DOM2=0;	//	buggy now.	//else _NS=styleO===null?null:_e+_i['XHTML'];//undefined==null
*/
 //	指定 Namespace
 if(tag)if(_NS=tag.match(/^(.+):([^:]+)$/)){
  tag=_NS[2];
  _NS=_NS[1];
  if(_NS.indexOf('://')==-1&&_i[_NS.toLowerCase()])_NS=_e+_i[_NS];
  //alert('XML_node: Add ['+tag+'] of\n'+_NS);
 }

 /*
	for MathML:
		IE: document.createElement('m:'+tag)	(surely 'mml:', but 'm:' is default of MathPlayer, so now <html> works without the xmlns attribute)
		NS: document.createElementNS('http://www.w3.org/1998/Math/MathML',tag)
 */
 try{_e=tag?_DOM2&&_NS?document.createElementNS(_NS,tag):document.createElement(tag/*.replace(/[<>\/]/g,'')*/):document.createTextNode(innerObj||'');
 }catch(_e){alert('XML_node: Error create tag:\n'+tag/*+'\n'+_e.description*/);return;}
 if(tag)_.set_attribute(_e,propertyO);

 if(tag&&styleO&&_e.style)	//	IE需要先appendChild才能操作style，moz不用..?
  if(typeof styleO=='string')_e.style.cssText=styleO;
  else if(typeof styleO=='object')for(_i in styleO)_e.style[_i=='float'?'cssFloat':_i]=styleO[_i];	//	isIE?"styleFloat":"cssFloat"
  //else alert('XML_node: Error set style:\n['+styleO+']');


 //	插入document中。先插入document而後設定childNodes是因為IE有Cross-Page Leaks	http://www.blogjava.net/tim-wu/archive/2006/05/29/48729.html
 if(insertBeforeO){	//	http://www-128.ibm.com/developerworks/tw/library/x-matters41.html
  var rO=undefined/* [][1] */,tO=function(_o){return typeof _o=='string'&&(_i=document.getElementById(_o))?_i:_o;},iO=tO(insertBeforeO);
  if(iO instanceof Array&&iO.length)	//	Opera9 need .constructor==Array
   //	在disable CSS時可能會 Warning: reference to undefined property iO[1]
   rO=iO.length>1&&tO(iO[1])||0,iO=tO(iO[0]);	//	rO: referrer object, 以此決定以appendChild()或insertBefore()的形式插入
  if( typeof iO!='object' && (iO=document.body, typeof rO=='undefined') )rO=0;
  if(typeof rO=='undefined')iO=(rO=iO).parentNode;
  if(iO)	//	預防輸入的rO為create出來的
   if(rO)try{iO.insertBefore(_e,rO==1?iO.firstChild:rO);}catch(e){alert('XML_node: '+e.message+'\niO:'+iO+'\nrO:'+rO);}//	.firstChild == .childNodes[0]
   else iO.appendChild(_e);//document.body.insertBefore(_e,iO);
 }


 //	設定 childNodes
 if(tag)_.add_node(_e,innerObj);
/*
 if(tag&&innerObj)
  (_i=function(_o){
   if(typeof _o=='object'){
    if(_o)
     if(_o instanceof Array)//&&_o.length
      for(var _j=0;_j<_o.length;_j++)_i(_o[_j]);
     else _e.appendChild(_o);
    return;
   }
   if(typeof _o=='number'&&!isNaN(_o))_o=_o.toString();//_o+='';
   if(typeof _o=='string')
    if(_o.indexOf('<')!=-1)_e.innerHTML+=_o;
    else _e.appendChild(document.createTextNode(_o));
   //else alert('XML_node: Error insert contents:\n['+_o+']');
  })(innerObj);
*/

 //	this helps to fix the memory leak issue
 //	http://www.hedgerwow.com/360/dhtml/ie6_memory_leak_fix/
 //	http://jacky.seezone.net/2008/09/05/2114/
 try{
  return _e;
 }finally{
  _e=null;
 }
};



/*	增加table的列(row)
	please set addTABLEelement.tbodyObj first!!
	e.g.,	addTABLEelement.tbodyObj='placeCostListT';

	addTABLEelement([list1],[list2],..)
	e.g.,	addTABLEelement([1,2,3,4],[4,5,3,4]);
	addTABLEelement([[list1],[list2],..])
	e.g.,	addTABLEelement( [ [1,2,3,4],[4,5,3,4] ] );

	下面調到檔案頭
addTABLEelement.tbodyObj=null,addTABLEelement.doClean=1,addTABLEelement.DtagName='td';	//	addTABLEelement.DtagName: td/th
*/
function addTABLEelement(){
 if(typeof addTABLEelement.tbodyObj!='object')
  addTABLEelement.tbodyObj=document.getElementById(addTABLEelement.tbodyObj);
 var l=arguments;
 if(!addTABLEelement.tbodyObj||!l.length)return;

 if(addTABLEelement.doClean)try{
  addTABLEelement.tbodyObj.innerHTML='';	//	moz
 }catch(e){
  try{
   //alert(addTABLEelement.tbodyObj.rows.length);
   for(var i=addTABLEelement.tbodyObj.rows.length;i>0;)	//	IE
    addTABLEelement.tbodyObj.deleteRow(--i);
  }catch(e){}
 }

 if(l.length==1&&typeof l[0]=='object'&&typeof l[0][0]=='object')l=l[0];
 for(var i=0,j,o,list;i<l.length;i++){
  list=l[i];
  if(typeof list!='object'||!list)continue;
  o=document.createElement('tr');
  for(j=0;j<list.length;j++){
   var s=document.createElement(addTABLEelement.DtagName);
   s.innerHTML=(j in list)?list[j]:'';
   o.appendChild(s);
  }
  addTABLEelement.tbodyObj.appendChild(o);
 }
}


/*	對付IE與Moz不同的text取得方法。現階段不應用innerText，應該用此函數來取得或設定內部text
	http://www.klstudio.com/post/94.html
	DOM: 用.nodeValue
*/
var setTextT;
//setText[generateCode.dLK]='setTextT';
function setText(o,txt){
 if(!o||typeof window!='object'||typeof window.document!='object'
	|| typeof o=='string' && !(o=document.getElementById(o)) )
  return;
 if(typeof setTextT!='string'||!setTextT)
  with(window.document)
   setTextT=typeof document.body.textContent=='string'?'textContent'
	:typeof document.body.innerText=='string'?'innerText'
	:'innerHTML';
 var p=typeof o.value=='string'?'value':setTextT;
 if(typeof txt!='undefined')o[p]=txt;
 //	http://www-128.ibm.com/developerworks/tw/library/x-matters41.html
 if(o.nodeType==3||o.nodeType==4)return o.data;
 //var i=0,t=[];for(;i<o.childNodes.length;i++)t.push(setText(o.childNodes[i]));return t.join('');
 return o[p];
}


/*	用在top的index.htm中，當setTopP()後指定特殊頁面	2005/1/26 21:46
set:	window.onload=setFrame;
	var setFrameTarget='MAIN',setFrameTargetSet={'menu.htm':'MENU','all.htm':'MENU','midi.htm':'MIDI'};

** xhtml1-frameset.dtd中<script>只能放在<head>
*/
var setFrameTarget,setFrameTargetSet;	//	預設target, 轉頁的target lists
//setFrame[generateCode.dLK]='setFrameTarget,setFrameTargetSet';
function setFrame(){
 //alert(window.name);
 //for(var i=0;i<window.frames.length;i++)alert(window.frames[i].name);
 //alert(top.location.href+'\n'+location.href+'\n'+(top.location.href!=location.href)+'\n'+(window.top!=window.window));
 if(window.top!=window.window){//top.location.href!=location.href
  window.top.location.replace(location.href);
  return;
 }
 var l,f;
 try{l=location.hash.slice(1);}catch(e){return;}	//	IE在about:blank的情況下呼叫網頁，網頁完全載入前location無法呼叫。例如從FireFox拉進IE時使用location.*有可能'沒有使用權限'，reload即可。
 if(typeof setFrameTargetSet!='object')setFrameTargetSet={};
 if(l)try{l=decodeURIComponent(l);}catch(e){l=unescape(l);}
 //location.hash='';	//	這一項會reload
 if( l && (f=(f=l.match(/([^\/]+)$/)?RegExp.$1:l)&&(f=f.match(/^([^?#]+)/)?RegExp.$1:f)&&(l in setFrameTargetSet)?setFrameTargetSet[f]:setFrameTarget) && f!=window.name && window.frames[f] && window.frames[f].location.href!=l )
  //alert(l+'\n==>\n'+f),
  window.open(l,f);//if((l=window.open(l,f).top).focus(),alert(l!=self.top),l!=self.top)self.top.close();//alert(l+'\n'+f),	//	moz需要等到frame load之後才能得到window.frames[f].location.href==l的結果，所以可以考慮作setTimeout的延遲。但是假如真的不是預設的page，這樣會造成多load一遍。
 //setTimeout('alert(window.frames["'+f+'"].location.href);',900);
}
/*	set window.top page to certain location
	setTopP(location,search)
	search===setTopP_doTest: do a test, return window.top不為指定頁?1:0
*/
var setTopPDTopP,setTopP_doTest=.234372464;	//	default top page(file) path
//setTopP[generateCode.dLK]='dBasePath,getFN,setTopPDTopP,setTopP_doTest';
function setTopP(l,s){
 if(!setTopPDTopP)return 2;
 if(!l)l=dBasePath(setTopPDTopP)+getFN(setTopPDTopP);//alert(l);
 if(typeof s=='undefined')try{s=window./*self.*/location.search;}catch(e){return;}	//	IE在about:blank的情況下呼叫網頁，網頁完全載入前location無法呼叫。例如從FireFox拉進IE時使用location.*有可能'沒有使用權限'，reload即可。
 var t,r=/[\/\\]$/i,ri=/[\/\\](index.s?html?)?$/i;
 try{
  t=window.top.location.href.replace(/[?#](.*)$/,'');	//	top.location.pathname在遇到local file時可能出問題。若不同domain時top.location也不能取用，應改成window.top!=window.window
 }catch(e){t='';}
 //alert(t+'\n'+l+'\n'+(t!=l));
 if( t!=l && !(r.test(l)&&ri.test(t)) && !(ri.test(l)&&r.test(t)) )
  if(s===setTopP_doTest)return 1;
  //	replace() 方法可以開啟檔案，但是卻不會更動瀏覽器的瀏覽歷程（history）內容
  //	IE6若location.href長度超過2KB，光是'location.search'這項敘述就會導致異常
  else window.top.location.replace(l+s+'#'+encodeURIComponent(location.href));	//	預設page：xx/和xx/index.htm相同
}

//	設在body.onload，改變所有<a>在滑鼠移入移出時的status
var setAstatusOS;	//	old status,也可設定event.srcElement.ostatus等等，但考慮到將造成記憶體浪費…
//setAstatus[generateCode.dLK]='setAstatusOver,setAstatusOut';
function setAstatus(){
 if(typeof event=='undefined')return;//||typeof event.srcElement=='undefined'	//	預防版本過低(4以下)的瀏覽器出現錯誤：event至IE4才出現
 var i,o,l;
 if(o=document.getElementsByTagName('A'))
  for(i=0,l=o.length;i<l;i++)
   if(o[i].title&&!o[i].onmouseover&&!o[i].onmouseout)
    o[i].onmouseover=setAstatusOver,
    o[i].onmouseout=setAstatusOut;
}
//setAstatusOver[generateCode.dLK]=setAstatusOut[generateCode.dLK]='setAstatusOS';
function setAstatusOver(){
 var o=event.srcElement;
 if(o.title){setAstatusOS=window.status,window.status=o.title;return true;}
}
function setAstatusOut(){
 //var o=event.srcElement;if(typeof o.ostatus!='undefined'){window.status=o.ostatus;return true;}
 window.status=setAstatusOS;return true;
}











/*	Copy id(or object) to user's clipboard or Paste clipboard to id(or object).

	return the value set to clipboard
	http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/obj_textrange.asp
	http://msdn.microsoft.com/workshop/author/dhtml/reference/collections/textrange.asp
	http://msdn.microsoft.com/workshop/author/dhtml/reference/methods/execcommand.asp
	way 2:use window.clipboardData	http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/clipboarddata.asp

	clipboardFunction()	paste/get clipboard
	clipboardFunction(0,divObj)	paste/get clipboard to divObj
	clipboardFunction(1,'divObj name')	Copy divObj to clipboard/set clipboard
	clipboardFunction(2,'dcfvdf')	set clipboard by string
	clipboardFunction(3,divObj)	Copies divObj to the clipboard/set clipboard and then deletes it. *return the value set to clipboard
*/
var clipboardFunctionObj='clipboardFunctionDiv';
//clipboardFunction[generateCode.dLK]='clipboardFunctionObj';
function clipboardFunction(m,o){	//	method,object/(string)set value
if(window.navigator.appName=="Microsoft Internet Explorer"){
 var t,O,tN;
 if(m==2)t=o,o='';else if(typeof o=='string')o=document.getElementById(o);
 //	try .nodeName instead of .tagName	http://twpug.net/modules/smartsection/item.php?itemid=35
 if((typeof o!='object'||!o||(tN=(o.tagName||'').toLowerCase())!='textarea'&&tN!='select'&&tN!='option'&&(tN!='input'||o.type!='text')&&(O=o))&&!(o=document.getElementById(clipboardFunctionObj)))	//	textarea,select,option,input需使用.value!	o.type!='INPUT'||o.type!='text'：這樣大概也沒copy的價值了吧，應該會出現錯誤。
  try{document.body.appendChild(o=document.createElement('textarea')),o.id=clipboardFunctionObj;}catch(e){return;}	//	只對IE5.5之後有用
 //var t=document.body.createTextRange();t.moveToElementText(o);
 if(m==2)o.value=t;else{if(O)o.value=O.innerText;if(m==3)t=o.value;}
 if(o.id==clipboardFunctionObj)o.style.display='block';	//	得出現才能execCommand()
 o.createTextRange()//TextRange Object
	.execCommand(m?m==3?"Cut":"Copy":"Paste");
 if(o.id==clipboardFunctionObj)o.style.display='none';
 //t.execCommand("ForeColor","false","plum"),t.execCommand("BackColor","false","glay");
 //alert(o.tagName+'\n'+o.id+'\n['+o.innerText+']\n'+(m?m==3?"Cut":"Copy":"Paste"));
 if(m!=3)t=o.value;
 if(O)O.innerText=o.value;
 return t;
}

//	http://www.mozilla.org/xpfe/xptoolkit/clipboard.html
//	http://mozilla.org/editor/midasdemo/securityprefs.html
//	http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/06/21/4850.aspx
//	http://www.webdeveloper.com/forum/archive/index.php/t-170520.html
//	http://forum.moztw.org/viewtopic.php?p=131407
/*
if(window.navigator.appName=="Netscape"){	//	…不能用！
 if(typeof o=='string')o=document.getElementById(o);
 if(m==2||!o||o.tagName!='TEXTAREA'&&o.tagName!='SELECT'&&o.tagName!='OPTION'&&(o.tagName!='INPUT'||o.type!='text'))return;	//	無法設定

 if(!Zwischenablage){	//	初始設定
  netscape.security.PrivilegeManager.enablePrivilege("UniversalSystemClipboardAccess");
  //var fr=new java.awt.Frame();
  Zwischenablage=new java.awt.Frame().getToolkit().getSystemClipboard();
 }

 if(m==0){
  var Inhalt=Zwischenablage.getContents(null);
  if(Inhalt!=null)o.value=Inhalt.getTransferData(java.awt.datatransfer.DataFlavor.stringFlavor);
 }
 else{	//	m=1,3
  o.select();
  Zwischenablage.setContents(new java.awt.datatransfer.StringSelection(o.value),null);
 }

 return o.value;
}
*/
}	//	clipboardFunction()




Clipboard = function() {
};


CeL.net.web
.
//	2010/1/15 00:17:38
//	IE, FF only
//	http://www.jeffothy.com/weblog/clipboard-copy/
//	http://bravo9.com/journal/copying-into-the-clipboard-with-javascript-in-firefox-safari-ie-opera-292559a2-cc6c-4ebf-9724-d23e8bc5ad8a/
//	http://code.google.com/p/zeroclipboard/
copy_to_clipboard = function(text) {
	var clip;
	if (clip = window.clipboardData) {
		clip.clearData();
		clip.setData('Text', text);
	} else if (is_DOM('Components')){
		library_namespace.require_netscape_privilege(
			//	在您的機器上執行或安裝軟體
			'UniversalXPConnect', function() {
			//	https://developer.mozilla.org/en/Using_the_Clipboard
			//	[xpconnect wrapped nsIClipboardHelper]
			return Components.classes["@mozilla.org/widget/clipboardhelper;1"]
					.getService(Components.interfaces.nsIClipboardHelper)
					//	跳出函數即無效，因此不能 cache。
					.copyString(text);
		});
	}
	//else if (navigator.userAgent.indexOf("Opera") != -1)
	//	window.location = text;
};



/*	2009/5/13 21:21:49
	unfinished
*/
function clipB(){
}
clipB.start_op=function(){
 var o=this.temp_obj;
 if(!o){
  document.body.appendChild(o=document.createElement('div'));
  o.contentEditable=true;	//	for modify
  //o.style.height=0;o.style.width=0;
  this.temp_obj=o;
 }

 document.selection.empty();
 o.innerHTML='';	//	initial
 o.style.display='block';	//	得出現才能 focus(), execCommand()
 o.focus();
 return o;
};
clipB.end_op=function(){
 var o=this.temp_obj;
 document.selection.empty();
 if(o)
  o.style.display='none';
};
//	return [text, obj]
clipB.get_obj=function(t){
 var o;
 if(typeof t=='object' && 'innerHTML' in t || (o=document.getElementById(''+t)) && (t=o))
  return [t.innerHTML,t];
 return [t];
};
clipB.paste_to=function(o){
 o=this.get_obj(o);
 if(o=o[1])
  o.innerHTML=this.get(1);
};
clipB.set=function(o){
 o=this.get_obj(o);
 
};
clipB.get=function(h){	//	get HTML
 var o=this.start_op(),r=document.selection.createRange(),t;
 r.select();
 r.execCommand('Paste');
 t=h?r.htmlText:r.text;
 this.end_op();
 return h?o.innerHTML:o.innerText;
};
clipB.cut_from=function(o){
 o=this.get_obj(o);
 
};


/*	設定document.cookie	You can store up to 20 name=value pairs in a cookie, and the cookie is always returned as a string of all the cookies that apply to the page.

	範例：
setCookie('domain',0);	//	delete domain
setCookie('expires',30);	//	一個月(30 days)
setCookie(name,'jj');	//	設定name之值為jj
setCookie(name,56);	//	設定name之值為56
setCookie(name);	//	除去name
setCookie(setCookieS.setRoot);	//	設給本host全部使用
setCookie(setCookieS.setDomain);	//	設給本domain使用
setCookie(setCookieS.DeleteAll);	//	依現有設定除去所有值
setCookie(setCookieS.DeleteAllRoot);	//	除去所有值
setCookie(setCookieS.forever);	//	永久儲存（千年）
setCookie(setCookieS.moment);	//	準確設定這之後只在這次瀏覽使用這些cookie，也可用setCookie('expires',-1);
setCookie('expires',0);	//	將expires設定成forever或moment後再改回來（不加expires設定）

	下面調到檔案頭
var setCookieS;
setObjValue('setCookieS','moment=-1,expires=0,path=0,domain=0,secure=0,DeleteAll=2,DeleteAllRoot,setRoot,setDomain,forever',1);

TODO:
test various values
document.cookie.setPath("/");

*/
//setCookie[generateCode.dLK]='setCookieS';
function setCookie(name,value){//,flagOnceTime
 if(typeof name=='undefined'||typeof document=='undefined')return;
 try{
  //	This will cause error in Phoenix 0.1:
  // Error: uncaught exception: [Exception... "Component returned failure code: 0x8000ffff (NS_ERROR_UNEXPECTED) [nsIDOMNavigator.cookieEnabled]"  nsresult: "0x8000ffff (NS_ERROR_UNEXPECTED)"  location: "JS frame :: http://lyrics.meicho.com.tw/game/game.js :: setCookie :: line 737"  data: no]
  if(!window.navigator.cookieEnabled)throw 1;
 }catch(e){window.status='We cannot use cookie!';return;}
 if(name===setCookieS.setRoot)name='path',value='/';	//	設給本host全部使用
 else if(name===setCookieS.setDomain)name='domain',value=location.hostname.replace(/^[^.]+\./,'.');	//	設給本domain使用，尚不是很好的判別法。
 else if(name===setCookieS.forever)name='expires',value=1e14;	//	永久儲存，date之time值不能>1e16
 else if(name===setCookieS.moment)name='expires',value=-1;	//	準確設定這之後只在這次瀏覽使用這些cookie

 if(typeof name=='string'&&name.match(/^(expires|path|domain|secure)$/i)){	//	detect special set
  name=RegExp.$1;
  if(name=='expires'&&typeof value=='number'&&value){
   //if(value<8000)value*=86400000;//幾日，86400000=1000*60*60*24
   //value=(new Date(value<3e13?(new Date).getTime()+value:1e14)).toUTCString();	//	3e13~千年
   value=(new Date(value<1e14?value<0?0:(new Date).getTime()+(value<8e3?value*86400000:value):1e14)).toUTCString();
  }
  setCookieS[name]=value;
  return name+'='+value+';';
 }else{var set;
  if(name===setCookieS.DeleteAllRoot)set='expires='+(new Date(0)).toUTCString()+';path=/;';
  else with(setCookieS)set=(typeof value=='undefined'?'expires='+(new Date(0)).toUTCString()+';':expires?'expires='+expires+';':'')+(path?'path='+path+';':'')+(domain?'domain='+domain+';':'')+(secure?'secure;':'');

  if(name===setCookieS.DeleteAll||name===setCookieS.DeleteAllRoot){
/*
   var c=document.cookie;
   while(c.match(/([^=;]+)(=[^;]{0,})?/)){
    c=c.substr(RegExp.lastIndex);
    if(!/expires/i.test(RegExp.$1))document.cookie=RegExp.$1+'=;'+set;
   }
*/
   for(var p=document.cookie.split(';'),n,i=0;i<p.length;i++)
    if(!/^\s*expires\s*$/i.test(n=c[i].split('=')[0]))document.cookie=n+'=;'+set;
   return document.cookie;
  }else{
   //	可用escape(value)/unescape()來設定，速度會比較快，但佔空間。
   //value=name+'='+(typeof value=='undefined'?'':dQuote(''+value).replace(/([\01-\11\13-\14\16-\40=;])/g,function($0,$1){var c=$1.charCodeAt(0),d=c.toString(16);return'\\x'+(c<16?'0':'')+d;}))+';'+set;
   //	2004/11/23 21:11	因為cookie儲存成中文時會fault,所以只好還是使用escape()
   value=name+'='+(typeof value=='undefined'?'':escape(value))+';'+set;
   return value.length<4096&&(document.cookie=value)?value:-1;	//	長度過長時（約4KB）會清空，連原先的值都不復存在！
  }

 }
}

/*	取得document.cookie中所需之值	看起來只能取得相同domain，有設定的path之cookie

	flag=0: only get the first matched value;
	flag=1: only get all matched in a array;
	other flag: auto detect by name

getCookie(name);	//	取得name之值，亦可用RegExp：if(c=getCookie())c['name1']==value1;
getCookie('nn[^=]*');	//	取得所有nn開頭之組合
getCookie();	//	取得所有name=value組
*/
//getCookie[generateCode.dLK]='renew_RegExp_flag';
function getCookie(name,flag){
 if(typeof document!='object'||!document.cookie)return;
 if(!name)name='[^;=\\s]+';//\w+
 var c,R=name instanceof RegExp?name:new RegExp('('+name+')\\s*=\\s*([^;=\\s]*)','g')
	,m=document.cookie.match(R);
 //alert(R+'\n'+m);//alert(R+'\n'+m+'\n'+document.cookie);
 if(!m)return;
 if(R.global)R=renew_RegExp_flag(R,'-g');
 if(m.length>1)if(flag==0 || typeof flag=='undefined'&&typeof name=='string')m=[m.slice(-1)];	//	取最後一個
 if(m.length==1&&typeof m[0]=='string'&&(c=m[0].match(R))[1]==name){	//	表示不是因name為RegExp而得出之值
/*
  if((m=c[2])&&((c=m.charAt(0))=='"'||c=="'")&&c==m.slice(-1))	//	將值為".."或'..'轉為引號中表示之值
   try{
    //alert('get 1:\n'+m+'\n'+unescape(m));
    window.eval('c='+m);return c;
   }catch(e){}
  return m;
*/
  return unescape(c[2]);
 }
 var r={},v,M,i=0;
 //alert(document.cookie+'\n'+R+'\n'+m.length+'\n'+m);

 for(;i<m.length;i++)
  if(typeof m[i]=='string'&&(M=m[i].match(R)))
   r[M[1]]=unescape(M[2]);
/*
 for(;i<m.length;i++){
  M=m[i].match(R),v=unescape(M[2]);
  if(v&&((c=v.charAt(0))=='"'||c=="'")&&c==v.slice(-1))
   try{
    //alert('get 2:\n'+v+'\n'+unescape(v));
    window.eval('c='+v);v=c;
   }catch(e){}
  r[M[1]]=v;	//	有必要可用unescape()，畢竟那是模範做法。
 }
*/

 return r;
}


/*	取得註解部份資料：這個值會連 NewLine 都保存下來
	其實IE用document.getElementsByTagName('!')就可以了，不管幾層都能到。
	註解中[!-]需要escape！IE6之div內不能沒東西，所以得加個&nbsp;（並且得在前面）之後加<!-- -->才有用。

div	從哪裡開始找
level	最多往下找幾層
retType	回傳0:node本身,1:註解值
*/
function getComment(div,level,retType){
 if(!div)div=window.document;
 var i=0,d,_f=arguments.callee;
 if(isNaN(_f.endLevel))_f.endLevel=2;
 if(isNaN(level)||level===-1)_f.a=[],level=_f.endLevel;
 else if(typeof _f.a!='object')_f.a=[];
 div=div.childNodes;
 for(;i<div.length;i++){
  d=div[i];//if(d.nodeType==8)alert(d.tagName+'\n'+d.nodeName+'\n'+d.nodeType+(d.nodeValue?'\n'+d.nodeValue.slice(0,30):''));
  if(d.tagName&&d.tagName=='!')_f.a.push(retType?d:d.text.replace(/^<!(--)?/,'').replace(/(--)?>$/,''));//,alert(d.tagName+'\n'+d.text.slice(0,30));
  else if(d.nodeType==8)_f.a.push(retType?d:d.nodeValue);//alert('*	'+_f.a.length+'\n'+d.nodeValue.slice(0,30));	//	NS	http://allabout.co.jp/career/javascript/closeup/CU20040307/index.htm?FM=cukj&GS=javascript
	//	http://www.w3.org/TR/DOM-Level-2-Core/core.html
	//	ELEMENT_NODE,ATTRIBUTE_NODE,TEXT_NODE,CDATA_SECTION_NODE,ENTITY_REFERENCE_NODE,ENTITY_NODE,PROCESSING_INSTRUCTION_NODE,COMMENT_NODE,DOCUMENT_NODE,DOCUMENT_TYPE_NODE,DOCUMENT_FRAGMENT_NODE,NOTATION_NODE
  if(level&&d.childNodes)_f(d,level-1,retType);
 }
 return _f.a;
}
//window.onload=function(){getComment();alert(getComment.a.length);for(var i=0;i<getComment.a.length;i++)alert('['+getComment.a[i]+']');};






/*	background image load
	**	本函數會倒著load！請將優先度高的排後面！

new Image看起來不是個好方法…
http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/img.asp

var img=new Image(width,heighr);img.onload=function(){docImageElement.src=this.src;}img.src=__SRC__;	//	onload應在前面，預防設定onload前就已被load?

var bgLoadImgA,bgLoadImgLA;
function bgLoadImg(){
 if(location.protocol=='file:')return;
 if(typeof bgLoadImgA=='string'){
  var s=[1];
  try{s.pop();bgLoadImgA=bgLoadImgA.split(',');setTimeout('bgLoadImg();',5000);}catch(e){}	//	測試舊版可能沒有pop()功能，會出現error
  return;
 }
 if(bgLoadImgA.length){var i=new Image(1,1);i.function(){setTimeout('bgLoadImg();',0);},i.src=typeof getObjURL=='function'?getObjURL(bgLoadImgA.pop()):bgLoadImgA.pop();bgLoadImgLA.push(i);}
}


TODO:
Javascript uses automatic garbage collection. Set to [null] as well.	http://www.thescripts.com/forum/thread95206.html
須注意 JavaScript closure and IE 4-6 memory leak! IE 7 seems to have solved the memory leaks.	http://anotherblog.spaces.live.com/blog/cns!E9C5235EBD2C699D!458.entry?ppud=0&wa=wsignin1.0
http://laurens.vd.oever.nl/weblog/items2005/closures/	http://www.blogjava.net/tim-wu/archive/2006/05/29/48729.html
IE 6對於純粹的Script Objects間的Circular References是可以正確處理的，可惜它處理不了的是JScript與Native Object(例如Dom、ActiveX Object)之間的Circular References。
P.S. 2007/11/11 似乎已修正？
*/

/*	bgLoadImg() Cookie版	2006/3/3 20:08
	**	本函數正著load！請將優先度高的排前面！

	To use:
	,setCookieS,setCookie,getCookie,bgLoadImgId,bgLoadImgI,bgLoadImg
	bgLoadImgId='id_of_this_session',bgLoadImgA='img_url1,img_url2,..';	//	** MUST string!
	function getObjURL(bgLoadImgA_element){return the real URL of bgLoadImgA_element;}
	window.onload="bgLoadImg();"

var bgLoadImgId='bg',bgLoadImgI;	//	loaded index
*/
//bgLoadImg[generateCode.dLK]='bgLoadImgId,bgLoadImgI';
function bgLoadImg(i){
 var bgLoadImgM='bgLoadImgOK_'+bgLoadImgId;
//alert('_'+bgLoadImgM+','+bgLoadImgI)
 if(typeof bgLoadImgA!='object'){
  if(!bgLoadImgA||location.protocol=='file:')return;	//	needless
  var r=document.readyState;	//	http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/readystate_1.asp
  if(typeof r=='string'&&r!='complete'){setTimeout('bgLoadImg();',500);return;}
  //	initialization
  bgLoadImgA=bgLoadImgA.replace(/,\s*,/g,',').split(',');
  if(typeof getCookie!='function'||getCookie(bgLoadImgM)!=bgLoadImgA.length){	//	全部OK後就別再來了。
   if(isNaN(bgLoadImgI))bgLoadImgI=0;
   if(typeof r!='string'){setTimeout('bgLoadImg();',5e3);return;}
  }else return;
 }

 //if(!isNaN(i)&&!bgLoadImgA[i].complete);	//	timeout
 if(!isNaN(i)&&i<bgLoadImgI-1)return;	//	防止timeout的備援

 if(typeof setCookie=='function')	//	假如一個圖一個圖標記，setCookie在超過二十個之後好像就沒效了…被限制？
  setCookie(bgLoadImgM,bgLoadImgI);	//	標記已load counter

 if(bgLoadImgI==bgLoadImgA.length)bgLoadImgI++,setTimeout('bgLoadImg();',500);	//	馬上進入判別，最後一個尚未complete
 else if(bgLoadImgI<bgLoadImgA.length){
  var bgLoadImgURL=typeof getObjURL=='function'?getObjURL(bgLoadImgA[bgLoadImgI]):bgLoadImgA[bgLoadImgI];
  //setTimeout('bgLoadImg('+bgLoadImgI+')',5e3);	//	set timeout
  with(bgLoadImgA[bgLoadImgI++]=new Image(1,1))
	onload=function(){setTimeout('bgLoadImg();',0);},	//	這是個多執行緒技巧：假如使用onload=bgLoadImg，有可能在下一指令碼前就已onload，這樣會造成Stack overflow
	src=bgLoadImgURL;
  window.status='bgLoadImg ['+bgLoadImgURL+']: '+bgLoadImgI+' / '+bgLoadImgA.length+'..';
 }else{
/*
  var f=[];
  for(i=0;i<bgLoadImgA.length;i++)if(!bgLoadImgA[i].complete)f.push(bgLoadImgA[i].src);
  if(f.length)setCookie(bgLoadImgM,0);
  window.status='bgLoadImg '+(f.length?'end: failed '+f.length+' / '+bgLoadImgA.length+' ('+f+')':'complete!'),bgLoadImgA=0;
*/
  var f=0;
  for(i=0;i<bgLoadImgA.length;i++)if(!bgLoadImgA[i].complete)f++;
  if(f)setCookie(bgLoadImgM,0);
  window.status='bgLoadImg '+(f?'end: failed '+f+' / '+bgLoadImgA.length:'complete!'),bgLoadImgA=0;
 }
}



/*	儲存/回存使用者輸入之form資料用。	2004/11/23 21:38
		*已測試過text(select-one,textarea,password,hidden)/radio/checkbox/select-multiple
	formIdA:	form id or id array.不輸入或輸入'',0等表示所有的form
	expires:	不輸入或輸入''表示回存，輸入0會以預設days代替，輸入<0會刪除掉cookie中這項設定。
	targetItemA:	要處理的name。例如'name,tel,email'。假如包括unselect，會處理除了targetItemA之外所有的。

	input type="checkbox"	value不能包含';'!
	password也會被儲存，得自己排除!
e.g.,
cookieForm()	recall all items of all forms
cookieForm(0,1,'email');	save all items named 'email' of all forms
cookieForm(0,'','email');	recall all items named 'email' of all forms
cookieForm(0,-1);	消除所有*版面上現有form*之紀錄

TODO:
排除名單
對於較多的entries,也許需要使用到Object[key]來代替String.indexOf(key)
*/
//cookieForm[generateCode.dLK]='getCookie,setCookie';
function cookieForm(formIdA,expires,targetItemA){
 if(typeof document!='object')return;
 if(!formIdA)formIdA=document.getElementsByTagName('FORM');else if(typeof formIdA=='string')formIdA=[formIdA];
 var i,n,o,dealO=function(o){	//	メソッドをプロトタイプではなく、オブジェクト自身にセットしていることです。これでは継承できませんし、ECMAScript のプロトタイプベースのセマンティクスから外れてしまいます。
  for(var j=0,c=o.childNodes,sp=';',e,cn,cv,tp;j<c.length;j++){
   if((e=c[j]).hasChildNodes)dealO(e);
   if(e.name&&typeof e.value!='undefined'){//cv=e.tagName=='TEXTAREA'?e.innerHTML:e.value	//	TEXTAREA,SELECT,OPTION,INPUT需使用.value!
    //if(!e.value&&e.text)e.value=e.text;	//	假如沒有.value,利用.text代替
    if(targetItemA)if(targetItemA.unselect&&targetItemA[e.name]||!targetItemA.unselect&&!targetItemA[e.name])continue;
    //alert((isNaN(expires)?'load':'save')+'\n'+n+'::'+e.name+'['+e.type+']='+e.value);
    cn='cookieForm_'+n+'_'+e.name;cv=e.value;
    tp=e.type.toLowerCase();//e.tagName=='INPUT'?e.type.toLowerCase():'';
    if(isNaN(expires)){if(typeof(cn=getCookie(cn))!='undefined'){
     if(tp=='radio'){
      if(cv==cn)e.checked=true;
     }else if(tp=='checkbox'){
      if(cn.indexOf(sp+cv+sp+sp)!=-1)e.checked=true;
     }else if(tp=='select-multiple')
      for(var i=0;i<e.options.length;i++)
       e.options[i].selected=cn.indexOf(sp+e.options[i].value+sp)!=-1;
     else e.value=cn;
    }}else{
     if(tp=='radio'){if(!e.checked)continue;}
     else if(tp=='checkbox')
      if(cv.indexOf(sp)!=-1)continue;	//	value不能包含sp	checkbox之cookie形式:[;value1;;value2;value3;;value4;]:value1,3:checked
      else cv=((tp=getCookie(cn))&&tp.indexOf(sp+cv+sp)==-1?tp:sp)+cv+sp+(e.checked?sp:'');
     //else if(tp=='select-one')cv=e.options[e.selectedIndex].value;	//	可省略!	用.selectedIndex會比較快，但更改原文件可能會造成index錯誤
     else if(tp=='select-multiple'){
      cv=sp+cv+sp;
      for(var i=e.selectedIndex+1;i<e.options.length;i++)
       if(e.options[i].selected)cv+=e.options[i].value+sp;
     }
     if(expires)setCookie(cn,cv);else setCookie(cn);
    }
   }
  }
 };

 if(targetItemA){
  o=targetItemA;targetItemA={};if(typeof o=='string')o=o.split(',');
  for(i in o)targetItemA[o[i]]=1;
 }
 if(expires==='')expires=NaN;
 if(!isNaN(expires)){
  if(expires)expires=7;	//	預設days
  setCookie(setCookieS.setRoot);	//	Gecko need this
  setCookie('expires',expires);
 }
 for(i=0;i<formIdA.length;i++)if(o=formIdA[i]){
  if(typeof o=='string')o=document.getElementById(n=o);else if(!(n=o.id))n=o.name;
  if(o&&(o.tagName||'').toLowerCase()=='form'&&n&&typeof n=='string')dealO(o);
 }
 if(!isNaN(expires))setCookie('expires',0);

}


//	登入FTP	IE使用者若要上傳，請開啟FTP 站台的資料夾檢視功能。
//	<input type="text" autocomplete="off"/>
function loginFTP(n,p,path,hostname){	//	name,password
 if(!hostname&&!(hostname=location.hostname))return;
 if(n=='ftp'||n=='anonymous')n='';
 if(!p&&n)p=window.prompt('請輸入['+n+']之密碼：');
 if(p==null)return;	//	取消輸入
 p='ftp://'+(n?n+(p?':'+p:'')+'@':'')+(hostname+'/'+(path||'')).replace(/\/{2,}/g,'/');
 window.open(p,'ftpW');//location.href=p;	//	用location.href不能進入資料夾檢視功能
}


//	reference page set	==================

/*	簡化document.getElementById並配合loadReference()	2004/6/25 19:33

	flag:
	get_element.f.ref:可參考reference page
	get_element.f.refOnly:僅參考reference page
	object:參考此document object
*/
//get_element[generateCode.dLK]='referenceDoc,loadReferenceDone,*get_element();';
function get_element(id,flag){
 if(!get_element.f)get_element.f={'self':0,'ref':1,'refOnly':2};//,alert('get_element: set flags get_element.f');	//	在Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.6) Gecko/20040510中會出問題，所以改到函數中執行。但得先執行過一次。
 if(!id||typeof window!='object'||typeof document!='object'||document!=window.document)return null;
 //if(flag)alert('get_element: '+id+','+flag);
 //if(!flag)flag=get_element.f.self;	//	後面暫時沒用到
 if(typeof document!='object'||!document.body)return;	//	document尚未load
 var o;
 if(flag!=get_element.f.refOnly)
  o=document.getElementById?document.getElementById(id):document.all?document.all[id]:document.layers?document.layers[id]:window[id]||null;	//	僅參考reference page時不設定
 //if(flag)alert('get_element: '+id+','+flag+'\nloadReferenceDone='+loadReferenceDone+'\nreferenceDoc: '+referenceDoc+'\no: '+o+'\nreferenceDoc.get: '+referenceDoc.getElementById(id)+'\n'+referenceDoc.body.innerHTML.slice(0,200));
 try{	//	偶爾還是有可能'沒有使用權限'
  if( typeof flag=='object'&&typeof flag.getElementById=='function'&&(o=flag.getElementById(id))
	|| o || flag&&loadReferenceDone==1&&(o=referenceDoc.getElementById(id)) )return o;
 }catch(e){}
 return null;
}

/*	以外掛的reference page配置data object	2004/6/25 21:01

	toUse:
	準備好reference.htm
	在需要的文件加入	window.onload="loadReference()";
	在需要的文件body加入	<iframe id="reference"></iframe>
	function setupPageR()	initial after load of reference page

	如上，再使用get_element()即可得到reference.htm中的obj
*/
var referenceDoc,loadReferenceDone;//,loadReferenceCount;
//loadReference[generateCode.dLK]='get_element,referenceDoc,loadReferenceDone,parseFunction';
function loadReference(referenceURL,iframeId){
 if(loadReferenceDone||typeof location!='object'||!location.protocol||location.protocol=='https:')return;	//	https會拒絕存取，所以直接放棄。
 //if(loadReferenceDone)return;	//	https會拒絕存取，所以直接放棄。
 var o=get_element(iframeId||'reference'),thisFuncName=parseFunction().funcName;
 if(typeof referenceDoc=='object' && typeof referenceDoc.document=='object' && referenceDoc.document){	//	referenceDoc is still contentWindow here.	typeof referenceDoc.document:預防使用https時產生不能讀取的權限問題。
  referenceDoc=o.contentWindow.document;//referenceDoc.document;	//	遺憾：在舊版IE不能用後者。也許是因為舊版IE連contentWindow都會重造。
  o=referenceDoc.body;//alert(o.innerHTML.length+'\n'+o.innerHTML);
  if(o/*&&referenceDoc.body.innerHTML=='string'*/&&o.innerHTML.length){
   //alert(typeof o+','+(o?typeof o.innerHTML+'('+o.innerHTML.length+')\n'+o.innerHTML.slice(0,200):'(null)'));
   //	before IE5, the first argument must be a string.
   //	setTimeout(function_handle,..) 不一定代表setTimeout('function_handle();',..)，可能會傳入奇異的引數！
   if(typeof setupPageR=='function')setTimeout(setupPageR,9);
   loadReferenceDone=1;//window.status='reference page load OK!';alert(window.status);
  }else{
   //try{window.status='Wait while reference page loading..3',alert(window.status+'\nURL:'+o.contentWindow.document.src+'\ncontent('+o.contentWindow.document.body.innerHTML.length+'):\n'+o.contentWindow.document.body.innerHTML);}catch(e){}
   //if(!--loadReferenceCount)history.go(0);
   setTimeout(thisFuncName+'();',200);
  }
  return;
 }
 if(typeof document!='object'||!document.body){	//	document尚未load
  setTimeout(thisFuncName+'();',90);
  return 1;
 }
 //o=get_element(iframeId||'reference');	//	原來把設定放在這，不過反正都要在前面用到…
 if(!o||(o.tagName||'').toLowerCase()!='iframe'){loadReferenceDone=2;return;}	//	iframe不存在
 if(!o.src)o.style.display='none',//'block',//
  o.src=referenceURL;	//	for game.js: typeof relatePath=='function'?relatePath(0,'cgi-bin/game/data/reference.htm'):'data/reference.htm'

 if(typeof o.contentWindow=='object'&&typeof o.contentWindow.document=='object'){	//	typeof o.contentWindow=='object'&&: for JS5	應該不能用o.contentWindow吧？怕o.contentWindow就算沒能載入文件，也會被定義
  //	Martin Honnen wrote: If you load a new document then certainly the browser has to create a new document object.
  referenceDoc=o.contentWindow;//.document;	o.contentWindow.document still index to a blank window here, when new document load, this point to document won't work.

  //window.status='Wait while reference page loading..2';alert(window.status+'\nURL:'+o.src);
  setTimeout(thisFuncName+'();',20);//loadReferenceCount=9;
 }else{
  //if(location.protocol=='https:')return;	//	https會拒絕存取，所以直接放棄。最晚在這就得判別
  if(!referenceDoc)referenceDoc=40;	//	尚未load完成時作倒數計時..假如加上if(o.contentWindow)，這方法正確嗎?
  //else if(isNaN(referenceDoc))return 3;	//	異常(for https):不能用else if(isNaN(referenceDoc))
  try{
   if(referenceDoc--){
    //window.status='Wait while reference page loading..';alert(window.status);
    setTimeout(thisFuncName+'();',300);return 2;
   }else{
    //window.status='reference page load FAILED!';alert(window.status);
    return 4;
   }
  }catch(e){
   return 5;	//	Error: uncaught exception: Permission denied to get property HTMLDocument.document
  }
 }
}
//	translate object(innerHTML) from reference page to document
//transRefObj[generateCode.dLK]='get_element';
function transRefObj(id,id2,force){
 if(typeof id2!='string'&&typeof id2!='object')force=id2,id2=typeof id=='object'?id.id:id;
 var o=typeof id=='object'?id:get_element(id,get_element.f.self),p;
 //alert('transRefObj: '+id2+' -> '+id+'('+(force?'':'not ')+'force)\n'+o+'\ntarget:'+(o.innerHTML?'\n'+o.innerHTML.slice(0,200):' (null)'));
 if( o && (force||!o.innerHTML)
	&& (p=typeof id2=='object'?id2:get_element(id2,get_element.f.refOnly)) && (force||p.innerHTML) )
  try{
	//alert('transRefObj: DO '+id2+' -> '+id+'('+(force?'':'not ')+'force)\n');
	o.appendChild(p.cloneNode(true));
  }catch(e){
/*
   try{
	//alert('transRefObj: try2');
	var i=0;while(i<p.childNodes.length)o.appendChild(p.childNodes[i++].cloneNode(true));
   }catch(e){
*/
	//alert('transRefObj: try3');
	o.innerHTML=p.innerHTML;//p.cloneNode(true);	//serialize(p)	serialize方法把一个node串行化成字符串。在ie环境的具体实现上，对于XmlDocument，使用node.xml，对于HtmlDocument，使用node.outerHTML。	http://my.opera.com/gisor/blog/index.dml/tag/SVG
/*
   }
*/
  }
 return o;
}

//	↑reference page set	==================





//	設定自動捲動
var setAutoScrollTimer,setAutoScrollInterval;
//setAutoScroll[generateCode.dLK]='setAutoScrollTimer,setAutoScrollInterval';
function setAutoScroll(interval,force){
 if(!force)if(typeof document!='object'||setAutoScrollTimer||document.onmousedown||document.ondblclick)return;
 if(interval)setAutoScrollInterval=interval;else if(!setAutoScrollInterval&&!(setAutoScrollInterval=getCookie('setAutoScrollInterval')))setAutoScrollInterval=200;//5,50,100,200,500
 clearInterval(setAutoScrollTimer),setAutoScrollTimer=0;	//	無論如何，先把執行中的幹掉。
 if(setAutoScrollInterval<0){document.onmousedown=document.ondblclick=null;return;}
 document.onmousedown=function(){if(setAutoScrollTimer)window.clearInterval(setAutoScrollTimer),setAutoScrollTimer=0;};
 document.ondblclick=function(){if(setAutoScrollTimer)return;setAutoScrollTimer=window.setInterval('window.scrollBy(0,1);',setAutoScrollInterval);};//window.scrollTo(0,document.body.scrollTop+1);
}


/*	捲到設定的定點，因為某些多工慢速環境中只設定一次沒有用，所以…
	下面一行調到檔案頭
var scrollToXY,scrollToInterval,scrollToOK;
*/
//scrollTo[generateCode.dLK]='scrollToXY,scrollToInterval,scrollToOK,getWinStatus';
function scrollTo(y,x){
 //	initial
 if(typeof scrollToXY!='object')scrollToXY={};

 if(typeof y=='object'&&(!isNaN(y.x)||!isNaN(y.y))){if(!isNaN(y.x))scrollToXY.x=y.x;if(!isNaN(y.y))scrollToXY.y=y.y;}
 else if(y instanceof Array)scrollToXY.x=y[0],scrollToXY.y=y[1];
 else{if(typeof x!='undefined')scrollToXY.x=x;if(typeof y!='undefined')scrollToXY.y=y;}
 if(isNaN(scrollToXY.x))scrollToXY.x=0;if(isNaN(scrollToXY.y))scrollToXY.y=0;

 setTimeout('window.scrollTo(scrollToXY.x,scrollToXY.y);',9);	//	main function
 var _w=getWinStatus();
 //status=scrollToInterval+','+scrollToOK+';'+_w.scrollX+','+scrollToXY.x+';'+_w.scrollY+','+scrollToXY.y;
 if(_w.scrollX==scrollToXY.x&&_w.scrollY==scrollToXY.y){
  if(!--scrollToOK&&scrollToInterval)window.clearInterval(scrollToInterval),scrollToInterval=0;
 }else if(!scrollToInterval)scrollToInterval=window.setInterval('scrollTo();',90),scrollToOK=3;	//	預防萬一：總會跳回原處
}

/*	doAlert() & doAlertAccess：彈出使用注意事項視窗
	下面一行調到檔案頭
var doAlertDivName,doAlertOldScrollLocation;

TODO
設定其不可作用之 background object

	使用方法：
<head>
<script type="text/javascript" src="function.js"></script>
<script type="text/javascript">
window.onload=init;window.onscroll=window.onresize=doAlertScroll;
function init(){doAlertInit('kousi');}
</script>

<style type="text/css"><!--

/*	kousi用	加上filter:alpha(opacity=10);：因為IE5.5不吃DXImageTransform.Microsoft.Alpha，這樣用不能以.filters.alpha.opacity控制。	* /
#kousi{color:blue;background:#e2e0f8;border:double 3px red;padding:.5em;filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80,Style=0);filter:Alpha(Opacity=80,Style=0);z-index:2;overflow:auto;}
#kousiBg{background:blue;filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=30,Style=0);filter:Alpha(Opacity=30,Style=0);z-index:1;}
#kousiI{color:brown;background-color:#e6e6ff;cursor:pointer;border:1 solid red;white-space:nowrap;padding:2px;margin:2px;filter:Alpha(Opacity=80,Style=0);}

#kousi h2{color:brown;margin-left:2em;}
#kousi input{color:#114f12;background-color:#fddbfb;border:1 brown solid;}

--></style>
</head>

<body>
<!--div id="kousiBg"></div--><div id="kousi">
<h2>使用注意事項</h2>

注意事項

<hr style="color:#928cd9"/>
<table style="width:90%;text-align:center;"><tr><td><input type="button" onclick="top.location.href='http://www.hinet.net';" value="誰管你！"/></td>
<td><input type="button" onclick="doAlertAccess();//this.parentNode.parentNode.parentNode.parentNode.parentNode.id" value="我願意遵守上述規定"/></td>
<td><input type="button" onclick="setCookie(setCookieS.forever),setCookie('doAlert',doAlertDivName),doAlertAccess();" value="我往後皆會遵守上述規定"/></td></tr></table>
</div>

<a href="#" onclick="doAlert();">注意事項</a>

正文

</body>
*/
function doAlertResize(){	//	確保置中
 if(typeof doAlertDivName!='string'||!doAlertDivName||!(o=document.getElementById(doAlertDivName)))return;
 with(o.style){
  position='absolute',display='block',width='70%';
/*	因為'%'是以整體長寬為主，故不適用。
  var t=Math.round(50*(1-o.offsetHeight/document.body.clientHeight));
  if(t<0)width='99%',top='0';else top=t+'%';
  t=Math.round(50*(1-o.offsetWidth/document.body.clientWidth));
  left=t<0?'0':t+'%';
*/
  //alert(offsetHeight+','+window.offsetHeight+','+window.innerHeight+','+window.outerHeight);
  if(typeof window.innerHeight=='undefined')window.innerHeight=document.body.clientHeight;
  if(typeof window.innerWidth=='undefined')window.innerWidth=document.body.clientWidth;
  var t=(window.innerHeight-o.offsetHeight)/2;
  if(t<0)width=height='99%',top=0;else top=t+'px';
  t=(window.innerWidth-o.offsetWidth)/2;
  left=t<0?0:t+'px';	//	不用marginTop與marginLeft，因為這裡要放置div
 }
}
//	初始化
//doAlertInit[generateCode.dLK]='setCookie,doAlert';
function doAlertInit(n){	//	n:div name
 //if(typeof doAlertDone!='undefined'&&doAlertDone)return;	//	防止重複執行
 if(!n){	//	doAlertInit()重設
  setCookie(setCookieS.setRoot);	//	Gecko need this
  setCookie('doAlert');
  return;
 }
 var d=document.getElementById(n);
 if(d){
  if(typeof doAlertDivName=='undefined')doAlertDivName=n;
  doAlert();
 }
}
//	出現警告
//doAlert[generateCode.dLK]='doAlertInit,doAlertResize,doAlertAccess,doAlertScroll,doAlertDivName,doAlertOldScrollLocation,getCookie,getWinStatus';
function doAlert(n,m,iconContent){	//	n:name,m:mode=1:use alert(),icon div的文字內容
 if(!n&&typeof doAlertDivName=='string'&&doAlertDivName)n=doAlertDivName;
 var o=document.getElementById(n),oBg=document.getElementById(n+'Bg'),oI=document.getElementById(n+'I');
 if(!document.body||!o||m&&!alert(o.innerHTML))return;	//	alert()會return undefined
 if(!oI)try{
  o.parentNode.insertBefore(oI=document.createElement('div'),o);//document.body.insertBefore();
  oI.id=n+'I';oI.onclick=function(){doAlertInit();doAlert();};oI.title="注意事項";
  oI.innerHTML=iconContent||'別忘了';oI.doAlertScrollT=oI.doAlertScrollL=0;
 }catch(e){return;}	//	只對IE5.5之後有用
 if(!oBg)try{o.parentNode.insertBefore(oBg=document.createElement('div'),o);oBg.id=n+'Bg';}catch(e){return;}	//	只對IE5.5之後有用
 //if(!oI||!oBg)alert('No index or bg div!');
 disableKM(2);doAlertResize();window.Oonresize=window.onresize,window.onresize=doAlertResize;
 with(oI.style)display='none',position='absolute',right='.1em',top='.1em';
 with(oBg.style)position='absolute',left=-parseInt(document.body.leftMargin),top=-parseInt(document.body.topMargin),width=height='110%',display='inline';	//	offset*:唯讀
 if(o.filters)o.filters.alpha.opacity=85;//try{o.filters.alpha.opacity=85;}catch(e){}
 if(oBg.filters)try{oBg.filters.alpha.opacity=30;}catch(e){}
 else{	//	for Moz
  o.style.position='fixed';
  with(oBg.style)position='fixed',opacity=oBg.style['-moz-opacity']=.3,left=top=0,width=height='100%';
 }
 if(getCookie('doAlert')==n)doAlertAccess(n);
 else o=getWinStatus(),doAlertOldScrollLocation=[o.scrollX,o.scrollY],setTimeout('scrollTo(0,0);',0);	//	奇怪的是，直接執行scrollTo(0,0)沒啥用。
}
//	pass
function doAlertAccess(n){
 if(!n&&typeof doAlertDivName=='string'&&doAlertDivName)n=doAlertDivName;
 var o=document.getElementById(n),oBg=document.getElementById(n+'Bg');
 if(oBg)oBg.style.display='none';o.style.display='none';
 disableKM(0);
 window.onresize=window.Oonresize||null;
 if(doAlertOldScrollLocation)scrollTo(doAlertOldScrollLocation,0,1);
 doAlertScroll(1);
}
//	icon div的捲動：置於右上角
//doAlertScroll[generateCode.dLK]='getWinStatus';
function doAlertScroll(m){var oI;
 if(typeof doAlertDivName!='string'||!doAlertDivName||!(oI=document.getElementById(doAlertDivName+'I')))return;
 if(typeof m!='undefined'){
  oI.style.display=m?'block':'none';
  oI.doAlertScrollL=oI.offsetWidth+(m||0);
  if(oI.currentStyle){	//	IE
   if(m=parseInt(oI.currentStyle.paddingTop))oI.doAlertScrollT=m;
   m=parseInt(oI.currentStyle.paddingLeft);
   if(m=parseInt(oI.currentStyle.paddingRight))oI.doAlertScrollL+=m;
  }else{
   oI.style.position='fixed';
/*	//	Moz..but no use
   if(m=oI.offsetTop)oI.doAlertScrollT=m;
   m=oI.offsetLeft;
   if(m=oI.offsetRight)oI.doAlertScrollL+=m;
*/
  }
 }
 //window.status=m=window.scrollX+','+window.scrollY+','+window.innerWidth+','+window.innerHeight+';'+document.body.scrollLeft+','+document.body.scrollTop+','+document.body.offsetWidth+','+document.body.clientWidth+','+oI.offsetWidth+','+document.body.scrollWidth;alert(m);
 m=getWinStatus();
 oI.style.left=m.scrollX+m.windowW-oI.doAlertScrollL+'px';//-document.body.leftMargin-document.body.rightMargin
 oI.style.top=m.scrollY-oI.doAlertScrollT+'px';	//	只有在padding用px時有效！
}


CeL.net.web
.
/**
 * Sets / adds class of specified element.<br/>
 * TODO:<br/>
 * 1. 一次處理多個 className。<br/>
 * 2. 以字串處理可能較快。<br/>
 * 3. 用 +/- 設定。
 * @param element	HTML elements
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @param flag
 * (flag&1)==1:	reset className (else just add)
 * (flag&2)==1:	return {className1:, className2:, ..}
 * (flag&4)==1:	remove className
 * @return
 * @see
 * <a href="http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-95362176" accessdate="2009/12/14 22:26">className of type DOMString</a>,
 * <a href="https://developer.mozilla.org/En/DOM/Element.className" accessdate="2009/12/14 22:27">element.className - MDC</a>
 * @memberOf	CeL.net.web
 */
set_class = function(element, class_name, flag) {
	if (typeof element === 'string')
		element = document.getElementById(element);

	if (typeof element !== 'object' || !element || typeof element.className !== 'string')
		return;
	// if(!flag)flag=0;
	var c, remove = (flag & 4) == 4;

	if (class_name && !remove) {
		c = class_name instanceof Array ? class_name.join(' ') : class_name;
		if (flag & 1)
			element.className = c;
		else
			// add 時不 detect 是為了速度
			element.className += ' ' + c;

		if ((flag & 2) != 2)
			return;
	}

	//sl('set_class: remove [' + class_name + '] from [' + o.className + ']');
	c = element.className.split(/\s+/);
	var r = {}, i;

	for (i in c)
		r[c[i]] = 1;

	if (remove && class_name) {
		if (!(class_name instanceof Array))
			class_name = [ class_name ];
		for (i in class_name) {
			c = class_name[i];
			if (c in r) {
				// has removed
				remove = 0;
				delete r[c];
			}
		}
		if (!remove) {
			c = [];
			for (i in r)
				c.push(i);
			element.className = c.join(' ');
		}
	}

	//sl('set_class: → ['+o.className+']');
	return r;
};

//	if cN instanceof RegExp, cN should has NO global flag.
/**
 * If HTML element has specified class
 * 
 * @param element	HTML elements
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @return
 */
function has_class(element, class_name) {
	var _s = arguments.callee, n = element.className, i;
	//class_name = class_name.replace(/\s+$|^\s+/g, '');
	if (!n || !class_name)
		return;

	if (class_name instanceof Array) {
		for (i = n = 0; i < class_name.length; i++)
			if (_s(element, class_name[i]))
				n++;
		return n;
	}

	if (class_name instanceof RegExp)
		return class_name.test(n);

	if (n === class_name)
		return true;

	//return (new RegExp('(^|\\s)' + class_name + '(\\s|$)'/* ,i */)).test(n);
	return (' '+n+' ').indexOf(' ' + class_name + ' ')!==-1;
};

//	document.getElementsByClassName in prototype.js
function findClassN(cN,p,tagN){	//	className, parentElement, tag name, flag
 var i,c=[],o=(p||document.body).getElementsByTagName(tagN||'*'),r=new RegExp('(^|\\s)'+cN+'(\\s|$)'/*,i*/);
 if(o&&cN)for(i=0;i<o.length;i++)
  if(r.test(o[i].className)/*has_class(o,r)*/)c.push(o[i]);
 return c;
}


/*	處理popup用
	對className的tag作popup處理
	window.onload="dealPopup()";
	<b title="注釋">正文</b>
*/
//dealPopup[generateCode.dLK]='sPop,has_class';
function dealPopup(tag,classN,func){
 if(!tag)tag='b';	/*
	http://enable.nat.gov.tw/document/4_2.jsp
	http://ccca.nctu.edu.tw/~hlb/tavi/ABBRorACRONYM
	應該用abbr(abbreviation/abbrevitated form/簡稱)
	abbr包含acronym(頭文字/首字母縮寫,通常這個字的發音像一個字)
	根據W3C的規範說，中日文的縮寫格式要套用的是abbr標籤。
	XHTML2.0把acronym移掉了，只剩下abbr標籤。
	http://www.sovavsiti.cz/css/abbr.html
	if(!!document.all)document.body.innerHTML=document.body.innerHTML.replace(/<\s*(\/?)\s*abbr([>\s])/gi,'<$1span$2');
*/
 var i,j,o=document.getElementsByTagName(tag),tp;
 if(o.length)for(i=0;i<o.length;i++){
  if(classN&&!has_class(o[i],classN)||func&&func(o[i]))continue;
  //	測試是否有特定標籤
  for(j=0,tp='';j<sPopP.allTypes.length;j++)if(o[i][sPopP.allTypes[j]]){tp=sPopP.allTypes[j];break;}
  //	有的話設定event
  if( tp && (tp=sPop(o[i],sPopF[tp]|sPopF.nopop)) ){
   //o[i].innerHTML+='<b style="color:peru">['+sPopP.types[tp]+']<\/b>';
   if(tp==sPopF.window){
    if(!o[i].onclick)o[i].onclick=new Function('sPop(this,'+tp+');'),o[i].style.cursor='pointer';
   }else if(tp==sPopF.popup){
    if(!o[i].onmouseover){//o[i].ruby=o[i].popup='',
     o[i].onmouseover=new Function('sPop(this,'+tp+');');
     if(!o[i].onmouseout)o[i].onmouseout=new Function('sPop(this,sPopF.clearPop);');
     if(!o[i].onclick)o[i].onclick=new Function('this.onmouseout=null;sPop(this,'+tp+');'),o[i].style.cursor='pointer';
    }
    //else alert(tp+'\n'+sPopF[tp]+'\n'+typeof o[i].onmouseover+'\n'+o[i].onmouseover);
   }
  }
 }
}
/*	注釋(reference) / show popup-window or ruby	2004/4/3 17:20
	http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx

example:
	<b onmouseover="sPop(this,sPopF._type_,'注釋')">txt</b>
	<b onmouseover="sPop(this,sPopF._type_)" title="注釋">txt</b>
	window.onload="dealPopup()"; + <b title="注釋">txt</b>,<b sPop="注釋">txt</b>
	<b onmouseover="sPop('．',this)">txt</b>	在每個字旁邊加上[．]或[。]
	sPop('txt')	popup txt(自動設成sPopF.popup)
	sPop('txt',sPopF.window)	popup txt by window

flag & type:
	sPopF.title/sPopF.auto	（依字數）自動選取
	sPopF.ruby	採用<ruby>
	sPopF.popup	採用popup window
	sPopF.window	將資料開在新視窗

	sPopF.nopop	just test, don't popup(for ruby)
	sPopF.repeat	repeat ruby
	sPopF.clearPop	clear popup window
	sPopF.force	若是不能使用此種表示方法，則放棄顯示。(for popup @ Mozilla)

style class application(應用):
	sPopP.DclassName中所定之className為觸發事件時會設定的class

執行環境environment:
	JScript @ HTML

include function:
	String.x()
	parseFunction()
	setObjValue()
*/
var sPopP={}	//	sPop properties object
	,sPopF	//	flag
	,sPopError//	for error
	;

//	初始值設定 & 設定flag
//if(sPopP)alert('sPopP 已被佔用！');else
function sPopInit(){

	//	預設style class name:(null:used last time),ruby,popup,window
	sPopP.DclassName=',popupedTxt_ruby,popupedTxt,popupedTxt'.split(',');
	//	已登記的背景style,請在CSS中加入[sPopC]_[body class name]
	sPopP.bgS='bgb,bgn';
{
 var i=0,t=sPopP.bgS.split(',');sPopP.bgS={};
 for(;i<t.length;i++)sPopP.bgS[t[i]]=i+1;
}
	//	popup window style
	sPopP.popupS="color:blue;padding:.5em;overflow:auto;position:absolute;top:0;left:0;width:100%;height:100%;scrollbar-face-color:khaki;scrollbar-arrow-color:teal;border:1px solid green;font:normal 10pt tahoma;filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#ffd700, EndColorStr=#ffffff);";
	//	chars to repeat(for ruby)
	sPopP.RepeatC='．。ヽ○●◎☆★※＊＃▽▼△▲◆◇□■↓↑';//.turnU();
	//	types:auto,這些attribute可被處理，且將被視為自動選取type。
	sPopP.autoTypes='title,_sPop';//+',_'+sPopP.functionName
	//	types,最多七種
	sPopP.types='ruby,popup,window';	//	+div(參考dealLinkPopup())
	//	所有可用的types，可用來detect是否能為sPop()所接受。但Mozilla中無法使用title之外的attribute。
	sPopP.allTypes=(sPopP.autoTypes+','+sPopP.types).split(',');
	//	function name
	sPopP.functionName='';//;parseFunction().funcName;
	//	popup window(for popup)
	if(typeof window.createPopup!='undefined')sPopP.window=window.createPopup();
{
 var i=0,t=sPopP.types.split(','),T='';
 for(;i<t.length;)T+=t[i]+'='+ ++i+',';//alert(T);
 setObjValue('sPopF','title=0,auto=0,'
	//+'_'+sPopP.functionName+'=0,'
	+T+'nopop=8,repeat=16,clearPop=32,force=64','int');
}
//	sPopP.types[index]=type name
sPopP.types=(
	//'_'+sPopP.functionName+
	','+sPopP.types).split(',');
sPopP.commentTitle='Comment';	//	註解
sPopP.commentTitlePattern=sPopP.commentTitle+' of %s';
sPopP.closeM='Close';	//	close message: 關閉視窗或popup
sPopP.biggerM='Bigger';	//	bigger message: 放大
sPopP.resetM='Reset size';	//	reset size message: 回復原大小
}

//	主object(正文或主object，會從之取得正文與注釋)[, flag, text string or object(注釋,會蓋過從主object取得之text), 使用的class name]
//sPop[generateCode.dLK]='sPopP,sPopF,sPopInit,*sPopInit();';
function sPop(oPos,flag,oTxt,classN){
 //if(flag&sPopF.clearPop){if(sPopP.window)sPopP.window.hide();return;}

 //	input value test & 修正
 if(!oPos&&!oTxt)return;

 var limitW=screen.width-50,limitH=screen.height>>1;
 if(!sPopP.width)sPopP.width=250;if(sPopP.width>limitW)sPopP.width=limitW;
 if(!sPopP.height)sPopP.height=100;if(sPopP.height>limitH)sPopP.height=limitH;

 //	初始值設定
 if(!sPopP.functionName)
  sPopF[ sPopP.types[0]='_'+(sPopP.functionName=parseFunction().funcName) ]=0;

 var repopMark='repop',repop=oPos===repopMark,nopop=flag&sPopF.nopop,tp=flag&7
	,useAttbTxt=false,brReg=/\r*\n/g,brT='<br/>\n';	//	轉成br用

if(repop){
  if( !sPopP.popObj || typeof sPopP.popObj!='object' || typeof sPopP.popObj.innerHTML!='string' || !sPopP.popObj.innerHTML )return;
  oPos=sPopP.popObj,tp=sPopF.popup;	//	重pop時不作其他判別處置
}else{

 //	處理object
 if( typeof oPos=='string' && oPos )
  if( oPos.length<32 && document.getElementById(oPos) )
   oPos=document.getElementById(oPos);	//	輸入object name時轉成object
  else if(!oTxt)oTxt=oPos	//	若只輸入oPos，將之當作注釋(oTxt)。
	//,oPos=typeof null=='object'?0:null;
	,oPos=0;	//	若是typeof null=='object',請設成false

 //	設定oTxt 1/4
 if( typeof oTxt=='object' && oTxt.innerHTML )oTxt=oTxt.innerHTML;
 else if(oTxt)oTxt+='';	//	轉成string

 //	(自動)判別使用的type
 var useAutoTxt;
 if(tp==sPopF.auto){
  //	設定oTxt 2/4 : 知道是自動判別後先設定
  if( typeof oPos=='object' && (!oTxt||oTxt==0) )
   if(oPos[sPopP.types[0]])oTxt=oPos[sPopP.types[0]],useAutoTxt=true;
   else if(oPos.title)oTxt=oPos.title,useAutoTxt=true;	//	以<b title="~">的用法來說，這是最常經過的path

  //	假如沒有oTxt.gText()，改成oTxt.replace(/<[^>]*>/g,'')之即可。這是為了預防HTML的情形。
  var len=typeof oTxt=='string'?oTxt.length:0;//typeof oTxt=='string'?oTxt.length:typeof oTxt=='object'&&oTxt.innerHTML?oTxt.innerHTML.length:0;
  //alert(len+','+(len*.7)+','+oPos.innerHTML.length);
  if( typeof oPos=='object' && ( oPos.doneRuby || !oPos.innerHTML.match(/<\s*ruby/i) && (len<60&&len*.7-9<(typeof oPos.innerText=='string'?oPos.innerText:oPos.innerHTML).length) ) )
   tp='ruby';	//	ruby的條件
  else if(sPopP.window&&len<300){
   tp='popup';
   if(typeof oPos=='object'&&oPos.title===oTxt)oPos[sPopP.types[0]]=oTxt,oPos.title='';
  }else tp='window';

  //	設定oTxt 3/4 & type
  if( typeof oPos=='object' && (!oTxt||oTxt==0) )
   if(oPos[tp])oTxt=oPos[tp],useAutoTxt=true;

  tp=sPopF[tp];
 }

 //	設定oTxt 4/4
 if( !oTxt||oTxt==0 && typeof oPos!='object')
  if( (oTxt=oPos[sPopP.types[tp]]) || (oTxt=oPos[sPopP.types[0]]) || (oTxt=oPos.title) )useAutoTxt=true;else return;

 //	設定className與position
 sPopP.left=0,sPopP.top=20;	//	popup left,popup top初始值
 if( !oPos || typeof oPos!='object')
  try{sPopP.left+=event.offsetX,sPopP.top+=event.offsetY;}catch(e){}	//	popup在滑鼠指標處	getMouseLoc()	event.layerX || event.offsetX	http://hartshorne.ca/2006/01/18/javascript_events/
 else if( !oPos.className && sPopP.DclassName[tp] ){
  if(!classN&&(classN=document.body.className)&&!sPopP.bgS[classN])classN=0;
  oPos.className=sPopP.DclassName[tp]+(classN?'_'+classN:'');
  var w,s=oPos.style;if(!s.fontWeight&&(w=oPos.parentNode.style.fontWeight))s.fontWeight=w;	//	除非有明確設定font-weight，否則通常不會有效
 }
}

 //	修正
 if( tp==sPopF.popup && !sPopP.window && !(flag&sPopF.force) )
  tp=sPopF.window;	//	Mozilla中無法顯示popup


 //alert(sPopP.types[tp]+','+( sPopP.window || flag&sPopF.force )+','+oTxt);
 //	處理pop
 if(tp==sPopF.ruby){
  if(typeof oPos!='object'||!oPos.innerHTML)return;	//	oPop非HTML element就return
  if(oPos.doneRuby)return tp;	//	已經處理過<ruby>就pass
  //	處理repeat
  if( flag&sPopF.repeat || sPopP.RepeatC.indexOf(oTxt)!=-1 )
   oPos.title='',oTxt=window.navigator.userAgent.indexOf("MSIE")<0?'':oTxt.x(oPos.innerHTML.length/oTxt.length);	//	只有IE提供ruby，所以這時候不宜加入旁點功能。

  try{
   oPos.innerHTML='<ruby><rb>'+oPos.innerHTML+'<\/rb><rp>'
	//	半形與全形的括弧
	+(oTxt?window.navigator.userAgent.indexOf("Opera")>=0||/^[a-z\d\s_,.;"'\[\]{}+\-*\/]*$/i.test(oTxt)?'(<\/rp><rt>'+oTxt+'<\/rt><rp>)':'（<\/rp><rt>'+oTxt+'<\/rt><rp>）':'<\/rp><rt><\/rt><rp>')
	+'<\/rp><\/ruby>';
  }catch(e){
   var n=e.number&0xFFFF;
   if(n==601&&(typeof sPopError=='undefined'||sPopError!=n))alert('Error: '+e.description+' at\n'+oPos.outerHTML+'\n\n★也許是在這之前的tag出錯，例如有<b>卻沒有<\/b>。');
   sPopError=n;
  }
  oPos.doneRuby=true;

 }else if(tp==sPopF.popup){
  if(nopop||!sPopP.window)return tp;
  if(!repop){
   if(useAutoTxt)oTxt=oTxt.replace(brReg,brT);
   //	這是一種註解功能，在mouseout後，假定讀者繼續讀下去，所以就讓popup object消失。想要多看一點的，會去按他，這時才讓popup object繼續存在。
   sPopP.window.document.body.innerHTML=//oTxt=
	'<div style="'+sPopP.popupS+'" onblur="parent.sPopP.window.hide();" title="reference">[<b style="color:peru;cursor:pointer;" onclick="parent.sPopP.window.hide();">'+sPopP.closeMessage+'<\/b>] [<b style="color:green;cursor:pointer;" onclick="with(parent)sPopP.width+=100,sPopP.height+=50,'
	+sPopP.functionName+'(\''+repopMark+'\');">'+sPopP.biggerM+'<\/b>] [<b style="color:orange;cursor:pointer;" onclick="with(parent)sPopP.width=sPopP.height=0,'+sPopP.functionName+'(\''+repopMark+'\');">'+sPopP.resetM+'<\/b>]<hr style="color:purple;height:1px"/>'+oTxt.replace(/'/g,'&#39;')+'<\/div>';
   sPopP.popObj=oPos||document.body;	//	object deal now(for popup:repop)
   //if(typeof oPos.onmouseout!='undefined')oPos.onmouseout=function(){sPopP.window.hide();};
  }
  //alert(sPopP.width+','+sPopP.height);
  if(flag&sPopF.clearPop)sPopP.window.hide();
  else sPopP.window.show(sPopP.left,sPopP.top,sPopP.width,sPopP.height,oPos||document.body);

 }else if(tp==sPopF.window){
  if(nopop)return tp;
  //if(typeof netscape=='object')netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserWrite");	//	創造無邊框視窗:titlebar=no	dependent:ns only	全螢幕：channelmode	带有收藏链接工具栏的窗口：directories	网页对话框：'dialogWidth:400px;dialogHeight:300px;dialogLeft:200px;dialogTop:150px;center:yes;help:yes;resizable:yes;status:yes'
/*
dialogHeight: iHeight 设置对话框窗口的高度。
dialogWidth: iWidth 设置对话框窗口的宽度。 　　
dialogLeft: iXPos 设置对话框窗口相对于桌面左上角的left位置。
dialogTop: iYPos 设置对话框窗口相对于桌面左上角的top位置。
center: {yes | no | 1 | 0 } 指定是否将对话框在桌面上居中，默认值是“yes”。
help: {yes | no | 1 | 0 } 指定对话框窗口中是否显示上下文敏感的帮助图标。默认值是“yes”。 　　
resizable: {yes | no | 1 | 0 } 指定是否对话框窗口大小可变。默认值是“no”。
status: {yes | no | 1 | 0 } 指定对话框窗口是否显示状态栏。对于非模式对话框窗口，默认值是“yes”；对于模式对话框窗口，默认值是 “no”。

window.showModalDialog(), window.showModelessDialog(): IE only. 不如用Ajax
*/
  var w=window.open('','comment','titlebar=no,dependent,resizable=1,menubar=0,toolbar=0,location=0,scrollbars=1,width=550,height=400'/*,fullscreen*/,false)
	,t=sPopP.commentTitle,_t=oPos.innerHTML&&oPos.innerHTML.length<9?sPopP.commentTitlePattern.replace(/%s/,oPos.innerHTML):t;	//	head, document.title
  //if(typeof netscape=='object')netscape.security.PrivilegeManager.disablePrivilege("UniversalBrowserWrite");
  if(document.title)t+=' @ ['+document.title+']',_t+=' @ '+document.title;
  //else t+=' @ [<a href="'+location.href+'">'+location.pathname+'<\/a>]';
  with(w.document)open(),
   write(
	//'<?xml version="1.1" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html;charset=utf-8"/><title>'
	//+_t+'<\/title><script type="text/javascript">window.onblur=function(){window.close();};<\/script><\/head><body><b style="color:#11f;">'+t+':<\/b>'
	'<script type="text/javascript">window.onblur=function(){window.close();};<\/script><b style="color:#11f;">'+t+':<\/b>'
	+(oPos.innerHTML?'<div id="s" style="color:#488;background-color:#FF8;">\n'+oPos.innerHTML.replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;')+'\n<\/div><hr/>':'')	//;white-space:normal;width:500px:useless	** 這邊會對<b title="..等造成影響！
	+'<div id="c" style="color:#404;background-color:#8FF;">\n'+oTxt.replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;')	//	以不換行(pre)的方式顯示.patch
	+'\n<\/div><hr/>[ <b style="cursor:pointer;color:#40f;" onclick="javascript:opener.focus();self.close();">'+sPopP.closeMessage+'<\/b> ]')//+'</body></html>'
   ,close(),title=_t;
  w.focus();
  w=0;	//	open出來的窗口即使close了，它的window對象還是存在的，要記得刪除引用	http://www.blogjava.net/tim-wu/archive/2006/05/29/48729.html
 }//else alert('type error: '+tp+'!');

 return tp;	//	回傳決定的type
}


/*	開啟連結於target
	**	最好將openAtInit();設在onload
	JScript solution for attribute 'target' @ XHTML1.1	<a target="tag">之取代策略
	way 1:	,captureE,openAtInit,"openAtInit();",openAt
	onload: + openAtInit()		,captureE,openAtInit,"openAtInit();",openAt
	target="tag"	→	onclick="return openAt('tag')"
	target="_blank"	→	onclick="return openAt()"
	target="_self"	→	onclick="return openAt(1)"
	way 2:	,openAt
	target="_blank"	→	onclick="return openAt(0,this.href)"
	target="_self"	→	onclick="return openAt(1,this.href)"
	http://tohoho.wakusei.ne.jp/js/event.htm

TODO:
http://hi.baidu.com/monyer/blog/item/56f1c88095fc96d79023d931.html
a{text:expr/*XSS* /ession(target="_blank");}
*/
var captureE;
//	初始化設定
//openAtInit[generateCode.dLK]='captureE';
function openAtInit(){
 if(typeof captureE!='object'&&(typeof Event=='object'||typeof Event=='function')){	//	for moz
  //	http://developer.mozilla.org/en/docs/DOM:element.addEventListener	http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event
  if(Event.mousedown)window.captureEvents(Event.mousedown);
  if(Event.keydown)window.captureEvents(Event.keydown);
  window.onmousedown=window.onkeydown=function(e){
	 captureE=e;//alert('openAtInit: '+e.target.tagName);
	};
 }
 for(var i,a=document.getElementsByTagName('a');i<a.length;i++)
  if(a[i].onclick&&!a[i].onkeypress&&(''+a[i].onclick).indexOf('openAt')!=-1)a[i].onkeypress=a[i].onclick;
}
//	open h(ref) in tag(et)
//openAt[generateCode.dLK]='captureE,openAtInit';
function openAt(tag,h){
 if(!tag)tag='_blank';//typeof tag=='undefined'||
 else if(tag===1)tag='_self';
 var t;
 if(!h&&typeof event=='object')h=event.srcElement.href;

 //	對Gecko等使用標準(?)Document Object Model的
 //	http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 if(!h&&typeof captureE=='object'&&typeof captureE.target=='object'){
  t=captureE.target;
  while(!(h=t.href)&&(t=t.parentNode));
 }

 //alert(h+','+tag+'\n'+captureE.target.parentNode.tagName+":");//+captureE.target.parentElement().tagName
 if(h)window.open(h,tag).focus();
 return false;
}

/*	display mark to valid document
	<div id="valid">&nbsp;</div>
	window.onload="addValid()";
	搞定之後把自己網站提交到W3C Sites收錄。	http://www.w3csites.com/

	for RSS:
	http://rss.scripting.com/?url=http%3A%2F%2Flyrics.meicho.com.tw%2Fgame%2Frss.xml
	http://feedvalidator.org/check.cgi?url=http%3A%2F%2Flyrics.meicho.com.tw%2Fgame%2Frss.xml
*/
function addValid(v,tf){	//	object to insert valid, target window/frame
 if(location.protocol=='file:')return;
 if(!v)v='valid';if(typeof v!='object')v=document.getElementById(v);
 if(!v)return 1;if(v.innerHTML.replace(/&nbsp;/g,'').replace(/\s+/g,''))return 2;

 if(typeof tf=='undefined')tf='valid_window';//tf=dQuote(tf);//tf?' target="'+tf+'"':'';
 var i=0,t='',d,addValidData=[
	'Valid XHTML 1.1! by W3C	http://validator.w3.org/check?uri=referer	http://www.w3.org/Icons/valid-xhtml11'
	//,'Valid XML 1.0! by W3C	'
	,'Valid CSS! by W3C	http://jigsaw.w3.org/css-validator/check/referer	http://jigsaw.w3.org/css-validator/images/vcss'	//	http://jigsaw.w3.org/css-validator/validator?uri=~
	,'Validome Validation Services	http://www.validome.org/referer	http://www.validome.org/images/valid/set2/valid_xhtml_1_1.png'
	,'Another HTML-lint check	http://openlab.ring.gr.jp/k16/htmllint/htmllint.cgi?ViewSource=o	http://openlab.ring.gr.jp/k16/images/ahl-blue.gif'
	,'Bobby WAI-AAA Approved by bobby@watchfire.com	http://bobby.watchfire.com/bobby/bobbyServlet?URL=~&output=Submit&gl=wcag1-aaa	http://bobby.watchfire.com/bobby/html/en/images/approved_aaa.gif'
	,'Bobby 508 Approved by bobby@watchfire.com	http://bobby.watchfire.com/bobby/bobbyServlet?URL=~&output=Submit&gl=sec508	http://bobby.watchfire.com/bobby/html/en/images/approved_508.gif'
	//	http://webxact.watchfire.com/
	];
 for(;i<addValidData.length;i++)
  if(d=addValidData[i].split('	'),d[1])t+=' <a title="'+d[0]+'" href="'+d[1].replace(/~/g,encodeURI(location.href))
	+'" target="'+tf+'">'
	+(d[2]?'<img style="display:inline;width:88px;" alt="'//'" onclick="return openAt(\''+tf+'\');"><img style="display:inline;" alt="'	IE不通
		+d[0]+'" src="'+d[2]+'"/>':d[0])
	+'<\/a>';	//	tf.focus()
  else alert('Validate data defined error!');
 v.innerHTML='Validate this document:<br/>'+t;
 v.style.display='block';
 return t;
}


/*	延遲執行: 加強版的 setTimeout?

id=delayRun(function[,ms=0])

id=delayRun([function,[args],this] [,ms=0])

*/
function delayRun(f,ms){
 var _f=arguments.callee,i;
 if(!_f.fL)_f.fL=[];
 i=_f.fL.length;
 _f.fL.push(f);
 setTimeout('delayRun.run('+i+');',ms||0);
 return i;
}
delayRun.clear=function(i){
 //	clearTimeout(): 為求簡單省略
 delete this.fL[i];
};
delayRun.run=function(i){
 var _t=this,f=_t.fL[i];
 if(f){
  if(typeof f=='function')f();
  else if(f instanceof Array)f[0].apply(f[2]||null,f[1]);
  else eval(f);
  delete _t.fL[i];
 }
};







/*	MsgBox, InputBox Titlebars Prefixed with 'VBScript'	http://support.microsoft.com/default.aspx?scid=kb;en-us;234742
	http://asp.programmershelp.co.uk/vbscriptmsgbox.php
	http://17.webmasters.com/caspdoc/html/vbscript_msgbox_function.htm
請加入下面一段中介function
<script type="text/vbscript">
Function VBalert_vbf()
 VBalert_f.ret=MsgBox(VBalert_f.prompt,VBalert_f.buttons,VBalert_f.title,VBalert_f.helpfile,VBalert_f.context)
End Function
</script>

or use:
window.execScript( sExpression, sLanguage );
*/
//var VBalert_f;VBalert();	//	init
function VBalert(prompt,buttons,title,helpfile,context){
 if(typeof VBalert_f!='object')VBalert_f={},setObjValue('VBalert_f','ret=0,'
	//	http://msdn.microsoft.com/library/en-us/script56/html/vsfctmsgbox.asp
	+'vbOK=1,vbCancel=2,vbAbort=3,vbRetry=4,vbIgnore=5,vbYes=6,vbNo=7,'
	+'vbOKOnly=0,vbOKCancel=1,vbAbortRetryIgnore=2,vbYesNoCancel=3,vbYesNo=4,vbRetryCancel=5,'
	+'vbCritical=16,'	//	Critical Message icon	(x)
	+'vbQuestion=32,'	//	Warning Query icon	(?)
	+'vbExclamation=48,'	//	Warning Message icon	(!)
	+'vbInformation=64,'	//	Information Message icon(i)
	+'vbDefaultButton1=0,vbDefaultButton2=256,vbDefaultButton3=512,vbDefaultButton4=768,vbApplicationModal=0,vbSystemModal=4096','int');
 if(typeof prompt=='undefined')return;
 VBalert_f.prompt=prompt||'',VBalert_f.buttons=buttons||0,VBalert_f.title=title||'';
 //	Not available on 16-bit platforms.	http://msdn.microsoft.com/library/en-us/script56/html/vsfctmsgbox.asp
 VBalert_f.helpfile=helpfile||'',VBalert_f.context=context||0;
 try{
  VBScript:VBalert_vbf();
  return VBalert_f.ret;
 }catch(e){
  //alert('VBalert error:'+e.message);
  alert(VBalert_f.prompt);
 }
}
//alert(VBalert('12',VBalert_f.vbInformation+VBalert_f.vbDefaultButton3));


/*	**	protocol不包含最後的':',search不包含'?',hash不包含'#'
	href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
	host=hostname:port
	pathname=pathname/filename

also see batURL.htm
*/
function parseURL(url){
 if(!url)return;
 var m=url.match(/^([\w-]{2,}):(\/\/)?([^\/]+)(\/.*)?$/),h,p,a,r={};
 if(!m)return;
 r.href=url,r.protocol=m[1],h=m[3],p=m[4];
 if(m=h.match(/^([^@]+)@([^@]+)$/)){
  a=m[1].match(/^([^:]+):?([^:]*)$/);if(!a)return;
  r.username=a[1];if(a[2])r.password=a[2];h=m[2];
 }
 r.host=h;
 if(m=h.match(/^([^:]+):?(\d*)$/)){
  r.hostname=m[1];if(m[2])r.port=parseInt(m[2]);
 }else return;
 if(p){
  if(m=p.match(/^([^\?#]+)([\?#].*)/)){
   a=m[2];
   if(a.match(/^\?([^#]*)(#.*)?$/))r.search=RegExp.$1,r.hash=RegExp.$2.slice(1);
   //else if(a.match(/^#([^\?]*)(\?.*)?$/))r.hash=RegExp.$1,r.search=RegExp.$2.slice(1);	//	先#再?怪怪的
   else return;
   p=m[1];
  }
  r.pathname=p;
  if(i=p.lastIndexOf('/')+1)r.path=p.slice(0,i),r.filename=p.slice(i);
  else r.filename=p;
 }
 return r;
}
//alert(parseURL('ftp://user:cgh@dr.fxgv.sfdg:4231/3452/dgh.rar?fg=23#hhh').hostname);



/*	get window status	取得視窗可利用的size。現在還得用種方法，真是羞恥。	2005/1/13 20:0
	getWinStatus(event object)
	http://www.mozilla.org/docs/dom/domref/dom_window_ref.html
	http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/body.asp
	http://www.howtocreate.co.uk/tutorials/index.php?tut=0&part=16
	http://www.webdevtips.com/webdevtips/faq/javascript/index.shtml
	http://www.quirksmode.org/viewport/compatibility.html
	http://cgi.din.or.jp/~hagi3/JavaScript/JSTips/Mozilla/eventhandle.htm

** untested !!

*/

//var eventObj;
function getWinStatus(o){
 var r={};//var _f=arguments.callee,r={};
 //	已經scroll到哪
 //r.scrollX	=	_f.scrollX();
 //r.scrollY	=	_f.scrollY();
 //	已經scroll到哪	IE7遵照標準，不用 document.body.scrollLeft 而用 document.documentElement.scrollLeft	http://hkom.blog1.fc2.com/blog-entry-423.html	http://diaspar.jp/node/47
 r.scrollX	=	typeof window.pageXOffset!='undefined'?window.pageXOffset: typeof document.body.scrollLeft!='undefined'?document.body.scrollLeft: typeof document.documentElement.scrollLeft!='undefined'?document.documentElement.scrollLeft:  typeof window.scrollX!='undefined'?window.scrollX:null;	//	pageXOffset:之前的?
 r.scrollY	=	typeof window.pageYOffset!='undefined'?window.pageYOffset: typeof document.body.scrollTop!='undefined'?document.body.scrollTop: typeof document.documentElement.scrollTop!='undefined'?document.documentElement.scrollTop: typeof window.scrollY!='undefined'?window.scrollY: null;
 //	能scroll的範圍:不準,yet test	The height of the total page (usually the body element)
 //	t:test, true:all but Explorer Mac, false:Explorer Mac, would also work in Explorer 6 Strict, Mozilla and Safari
 var t=typeof document.body.scrollHeight!='undefined'&&typeof document.body.offsetHeight!='undefined'&&document.body.scrollHeight>document.body.offsetHeight;
 r.scrollW	=	t?document.body.scrollWidth: typeof document.body.offsetWidth!='undefined'?document.body.offsetWidth: null;
 r.scrollH	=	t?document.body.scrollHeight: typeof document.body.offsetHeight!='undefined'?document.body.offsetHeight: null;
 //	window大小
 var NewIE=navigator.appVersion.indexOf("MSIE") != -1 && parseInt(navigator.appVersion.split("MSIE")[1])>6;	//	2009/3/23 1:15:29
 r.windowW	=	typeof window.innerWidth!='undefined'?window.innerWidth: /*typeof offsetWidth!='undefined'?offsetWidth:*/ !NewIE && typeof document.body.clientWidth!='undefined'?document.body.clientWidth: document.documentElement && !isNaN(document.documentElement.clientWidth)?document.documentElement.clientWidth: null;//+offsetLeft
 r.windowH	=	typeof window.innerHeight!='undefined'?window.innerHeight: /*typeof offsetHeight!='undefined'?offsetHeight:*/ !NewIE && typeof document.body.clientHeight!='undefined'?document.body.clientHeight: document.documentElement && !isNaN(document.documentElement.clientHeight)?document.documentElement.clientHeight: null;//+offsetTop

 var noEmu;
 if(!o)o=typeof e=='object'?e:typeof event=='object'?event:typeof eventObj=='object'?(noEmu=1,eventObj):null;
 if(o){
  var isSafari=/Safari/i.test(window.navigator.appName);//yet test
  //	window相對於screen位置:不準,yet test
  r.windowX	=	o.clientX - (( isSafari) ? r.scrollX : 0);
  r.windowY	=	o.clientY - (( isSafari) ? r.scrollY : 0);
  //	mouse位置	http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/obj_event.asp	http://www.mozilla.org/docs/dom/domref/dom_event_ref.html
  r.mouseX	=	o.clientX + ((!isSafari) ? r.scrollX : 0);
  r.mouseY	=	o.clientY + ((!isSafari) ? r.scrollY : 0);
  if(!noEmu)eventObj={'clientX':o.clientX,'clientY':o.clientY};	//	模擬event obj，因為event obj不能在event發生時之function執行完後再取得
  //alert(r.scrollX+','+r.scrollY+'\n'+o.clientX+','+o.clientY);
 }

 return r;
};
//Lazy Function Definition Pattern	http://realazy.org/blog/2007/08/16/lazy-function-definition-pattern/	http://peter.michaux.ca/article/3556
//IE7遵照標準，不用 document.body.scrollLeft 而用 document.documentElement.scrollLeft	http://hkom.blog1.fc2.com/blog-entry-423.html	http://diaspar.jp/node/47
getWinStatus.scrollX=function(){
return (this.scrollX=
typeof window.pageXOffset=='number'?function(){return window.pageXOffset;}:	//	pageXOffset: 之前的?
typeof document.body.scrollLeft!='undefined'?function(){return document.body.scrollLeft;}:
typeof document.documentElement.scrollLeft!='undefined'?function(){return document.documentElement.scrollLeft;}:
typeof window.scrollX!='undefined'?function(){return window.scrollX;}:
function(){return NaN;})();
};
getWinStatus.scrollY=function(){
return (this.scrollY=
typeof window.pageYOffset=='number'?function(){return window.pageYOffset;}:	//	pageYOffset: 之前的?
typeof document.body.scrollTop!='undefined'?function(){return document.body.scrollTop;}:
typeof document.documentElement.scrollTop!='undefined'?function(){return document.documentElement.scrollTop;}:
typeof window.scrollY!='undefined'?function(){return window.scrollY;}:
function(){return NaN;})();
};



/*	取得滑鼠座標
	http://hartshorne.ca/2006/01/23/javascript_cursor_position/
	init
if(typeof Event=='object')document.captureEvents(Event.MOUSEMOVE);	//	for moz
document.onmousemove=getMouseLoc;
var mouseLoc={};
*/
//getMouseLoc[generateCode.dLK]='getWinStatus';
function getMouseLoc(e){
 var l,t;
 if(typeof Event=='object')l=e.pageX,t=e.pageY;
 else	t=getWinStatus(),
	l=window.event.clientX+t.scrollX-(document.documentElement.clientLeft||0),
	t=window.event.clientY+t.scrollY-(document.documentElement.clientTop||0);
 //if(l<0)l=0;if(t<0)t=0;
 mouseLoc.left=l,mouseLoc.top=t;
 return true;
}


/*	http://www.quirksmode.org/dom/getstyles.html
	get style property ( object, property name )

http://www.javaeye.com/post/414063?page=1
大體上， currentStyle 相當於getComputedStyle，而runtimeStyle相當於getOverrideStyle。但是它們還是有很重要的區別。那就是，IE的CSS計算步驟其實是不合標準的。 
document.defaultView在mozilla中是指向window obj的,但是很有可能在其他broswer中就不指向window obj...因為w3c中沒有強行規定document.defaultView一定是一個global obj.
*/
function getStyle(o,p){
 if(typeof o=='string')o=document.getElementById(o);
 var v;
 if(o)
  if(o.currentStyle)v=o.currentStyle[p];
  else if(window.getComputedStyle)
   try{v=document.defaultView.getComputedStyle(o,null).getPropertyValue(p);}catch(e){}
  //else if(v=o['offset'+p.charAt(0).toLowerCase()+p.slice(1).toUpperCase()],!v)v='';
 return v;
}


CeL.net.web
.
/**
 * get the actual position [left,top,width,height] of an HTML node object
 * @param obj
 * @return
 * @memberOf	CeL.net.web
 * @see
 * http://msdn.microsoft.com/library/en-us/dndude/html/dude04032000.asp
 * http://www.mail-archive.com/mochikit@googlegroups.com/msg00584.html
 * http://hartshorne.ca/2006/01/20/javascript_positioning/
 */
get_node_position = function(obj) {
	if (typeof obj === 'string') {
		//	若 obj 為id
		var _o = document.getElementById(obj);
		if (_o)
			obj = _o;
	}

	if (typeof obj === 'object' && typeof obj.offsetLeft !== 'undefined') {
		//	若obj為Document Object
		//alert(obj.id+':'+obj.offsetLeft+','+obj.offsetTop+';'+obj.offsetWidth+','+obj.offsetHeight);
		var l = 0, t = 0, p,
			// n,countH=window.navigator.userAgent.indexOf("MSIE")>=0,add=1,outsideBLOCK=1,
			r = [];
		if (typeof obj.offsetWidth !== 'undefined') {
			var _w = obj.offsetWidth, _h = obj.offsetHeight
				// ,_o=window.getComputedStyle?document.defaultView.getComputedStyle(obj,null):null
				;
			//	http://www.quirksmode.org/dom/getstyles.html
			/*
			   if(_o)	//	moz未包含margin+border+padding	這些值可能會有'em'等等的出現，不一定都是px！
				//alert(_o.getPropertyValue('border-left-width')+','+_o.getPropertyValue('border-right-width')),
				_w+=parseInt(_o.getPropertyValue('border-left-width'))+parseInt(_o.getPropertyValue('border-right-width')),
				_h+=parseInt(_o.getPropertyValue('border-top-width'))+parseInt(_o.getPropertyValue('border-bottom-width'));
			   else if(_o=obj.currentStyle)	//	IE
				//	IE的offset已經包含margin+border+padding的部份??另，這些值可能會有'em'等等的出現，不一定都是px。
				_w+=parseInt(_o['borderLeftWidth'])+parseInt(_o['borderRightWidth']),
				_h+=parseInt(_o['borderTopWidth'])+parseInt(_o['borderBottomWidt都是px;
			*/
			r[2] = r.width = r.w = r.W = _w,
			r[3] = r.height = r.h = r.H = _h;
		}

		//	下面這段依瀏覽器而有不同 (-_-)!!
		//	position:absolute
		//var tt='';	//	for debug
		//	2006/2/14: 經由 offset 一個個溯源
		var _o = obj;
		while(_o&&!isNaN(_o.offsetLeft)){	//	IE在用style:class時會出現誤差。
			/*
			   n=_o.tagName;
			   //if( !/^T(ABLE|BODY|R)$/.test(n=_o.tagName) && (countH||!/^H\d$/.test(n)) )l+=_o.offsetLeft,t+=_o.offsetTop;
			   if(n=='DIV')add=outsideBLOCK;
			   else if(n=='TD' || countH&&/^H\d$/.test(n))add=1;
			   outsideBLOCK= n=='TABLE'||n=='DIV';	//	_o.style.display
			   tt+=(add?'':'#')+n+(_o.style.display?'('+_o.style.display+')':'')+':'+_o.offsetLeft+','+_o.offsetTop+(outsideBLOCK?', outside BLOCK':'')+'\n';
			   if(add)add=0,l+=_o.offsetLeft,t+=_o.offsetTop;
			*/

			l += _o.offsetLeft || 0, t += _o.offsetTop || 0;
			_o = _o.offsetParent;//.parentNode
		}

		//		有些會用到overflow，影響位置。	2008/5/31 0:10:7
		_o = obj;
		while ((_o = _o.parentNode) && _o.tagName.toLowerCase() != 'body')
			l -= _o.scrollLeft || 0, t -= _o.scrollTop || 0;

		//		need to enable definition of tt above
		//alert('l '+l+',t '+t+',w '+r.w+',h '+r.h+(typeof tt=='string'?'\n'+tt:''));

		r[0] = r.left = r.l = r.L = l, r[1] = r.top = r.t = r.T = t;
		return r;
	}
	//return null;
};


/*
//	get the [left,top,width,height] of obj
function get_node_position2(obj){
 if(typeof obj=='string'){var o=document.getElementById(obj);if(o)obj=o;}	//	若loc為id
 if(typeof obj=='object'&&typeof obj.offsetLeft!='undefined'){	//	若obj為Document Object
  //alert(obj.id+':'+obj.offsetLeft+','+obj.offsetTop+';'+obj.offsetWidth+','+obj.offsetHeight);
  var l=obj.offsetLeft,t=obj.offsetTop,n,add,outsideBLOCK,countH=window.navigator.userAgent.indexOf("MSIE")>=0,r=[];
  if(typeof obj.offsetWidth!='undefined')r[2]=r.width=r.w=r.W=obj.offsetWidth,r[3]=r.height=r.h=r.H=obj.offsetHeight;

  //	下面這段依瀏覽器而有不同 (-_-)!!
  //	position:absolute
  //var tt=obj.tagName+':'+obj.offsetLeft+','+obj.offsetTop+'\n';	//	for debug
  while(isNaN((obj=obj.parentNode).offsetLeft)){	//	IE在用style:class時會出現誤差。
   n=obj.tagName;
   //if( !/^T(ABLE|BODY|R)$/.test(n=obj.tagName) && (countH||!/^H\d$/.test(n)) )l+=obj.offsetLeft,t+=obj.offsetTop;
   if(n=='DIV')add=outsideBLOCK;
   else if(n=='TD' || countH&&/^H\d$/.test(n))add=1;
   outsideBLOCK= n=='TABLE'||n=='DIV';	//	obj.style.display
   //tt+=(add?'':'#')+n+(obj.style.display?'('+obj.style.display+')':'')+':'+obj.offsetLeft+','+obj.offsetTop+(outsideBLOCK?', outside BLOCK':'')+'\n';
   if(add)add=0,l+=obj.offsetLeft,t+=obj.offsetTop;
  }
  //alert('l'+l+',t'+t+',w'+w+',h'+h+'\n'+tt);	//	need to enable definition of tt above
  r[0]=r.left=r.l=r.L=l,r[1]=r.top=r.t=r.T=t;
  return r;
 }
}
*/

/*	locate a object(obj/div, dialogue box, popup dialog) on where we want followed window location	2005/1/12 19:-13 21:22
	此函數會盡量不使obj超出window範圍的大小，除非設定了noResize/noMove或發生錯誤。若moveable+resizable(default)，會嘗試先move再resize。
obj:
	object or id
loc:
	[left,top]/[left,top,width,height]/reference obj or id/0||'mouse':by mouse loc
		若left,top設定成%或是0.-，會當作相對於螢幕的比例。
margin:
	0/num=[num,num]/[offset x,offset y]
		在可能的情況下（不會造成超出window範圍）與loc之間空出的距離（所作的位移）。假如未輸入則自動設定。
flag:	locObjF.~	!表示未實作
	下面幾項為預設模式
	auto[Locate]	自動調整位置(default)，若設定abs/rel則不會自動調整。
	resizable	可調整obj大小(default) <-> noResize
	moveable	可移動obj(default) <-> noMove
	下面幾項為模式選擇，擇一。
	auto[Locate]	自動判定並調整位置(default)，若設定abs/rel則不會自動調整。
	abs[olute]	這裡的loc為絕對location。假如有提供margin，則會嘗試定位於loc+margin處。
	rel[ative]	這裡的loc為相對於window左上角的location。假如有提供margin，則會嘗試定位於loc+margin處。
	asDialog,dialog	預設是普通obj，但當設定為此項(dialog)時，loc會被當成reference obj。
			作為某obj(loc)之附屬obj（對話框/說明等），會避開主obj(reference obj)之顯示範圍。
			假如提供的loc並非obj，則會假設主obj是個從loc開始，長寬為margin的object。
	dialogDown,dialogUp,dialogRight,dialogLeft	預設是擺在下面，此flag可改成上面或其他不同方位。
	擇一
	resizable	可調整obj大小(default) <-> noResize
	noResize	不可調整obj大小，若可移動會將整個obj移到能看清的邊界。
	擇一
	moveable	可移動obj(default) <-> noMove
	noMove		不可移動obj，若可調整大小會將整個obj縮到能看清的大小。
	下面幾項可任喜好選購（笑）
	keepDisplay	是否維持顯示之display mode。沒有時則顯示之。
	create		假如不存在此obj就造出來。預設若無法取得此obj則會直接return

	!		!假如沒足夠空間則不顯示，或是僅顯示警告。

*	假如在事件中設定'eventObj=event'可掌握mouse event

TODO:
locObjClip=[l,t,w,h]:	resizable時將obj限制在這個範圍內

to top:
var locObjF;
setObjValue('locObjF','resizable=0,moveable=0,autoLocate=0,auto=0,absolute=1,abs=1,relative=2,rel=2,asDialog=3,dialog=3,modeFlag=3,dialogDown=3,dialogUp=7,dialogRight=11,dialogLeft=15,dialogFlag=15,dialogForce=16,noResize=32,noMove=64,keepDisplay=128,create=256',1);	//	revise
*/
//locObj[generateCode.dLK]='eventObj,locObjF,getWinStatus,locObj';
function locObj(obj,loc,margin,flag){
 //	前置處理
 //	setup obj
 if(!flag)flag=locObjF.auto;
 if(!obj)return;
 if(typeof obj=='string'){
  var id=obj;
  if( !(obj=document.getElementById(id)) && (flag&locObjF.create) )
   document.body.appendChild(obj=document.createElement('div')),obj.id=id;
 }

 var dMargin={'X':2,'Y':2}	//	在dialog時之預設位移
 ,Display=flag&locObjF.keepDisplay?obj.style.display:'block',Visibility=flag&locObjF.keepDisplay?obj.style.visibility:'visible'
 ,win,dialog=(flag&locObjF.modeFlag)==locObjF.dialog?flag&locObjF.dialogFlag:0
 ,turnPercent=function(p,v){
	if(typeof p=='string'){
	 var t=parseFloat(p.match(/([\d.]+)/));
	 p=t?t<2?t*v:t<200?t*v/100:t:0;
	}else if(isNaN(p))p=0;//typeof p1='undefined'&&
	return p;
 },dealPercent=function(o,t){	//	t:0:loc,1:margin
	var d=0;	//	是否重新指定
	if(typeof o=='string')o=o.split(','),d=1;
	if(!dialog&&typeof o=='object'){	//	取百分比%
	 if(typeof o[t?'L':'X']=='undefined'&&typeof o[0]!='undefined')d=1,o=t?{'X':o[0],'Y':o[1]}:{'L':o[0],'T':o[1],'W':o[2],'H':o[3]};	//	假如o[2]未定義，W也會未定義（但有index）
	 if(t)o.X=turnPercent(o.X,win.windowW),o.Y=turnPercent(o.Y,win.windowH);
	 else{
	  o.L=turnPercent(o.L,win.windowW),o.T=turnPercent(o.T,win.windowH);
	  if(typeof o.W=='undefined'){delete o.W;delete o.H;}
	  else o.W=turnPercent(o.W,win.windowW),o.H=turnPercent(o.H,win.windowH);
	 }
	}
	if(d)if(t)margin=o;else loc=o;
 },makeFit=function(l,t,r,b,hc){	//	test if out of range & 將box調整在range[left,top,right,bottom]內：先move，再resize
	if(boxL<l)boxL=l;if(boxT<t)boxT=t;
	var d=r-obj.offsetWidth;
	if(boxL>d)if(l>d)boxW=r-(boxL=l);else boxL=d;
	d=b-obj.offsetHeight;
	if(boxT>d)if(t>d)boxH=b-(boxT=t);else boxT=d;
	else if(hc&&(boxT=hc-obj.offsetHeight/2)<t)boxT=t;
 };

 with(obj.style){
  overflow=visibility='hidden';
  if(width)width='';if(height)height='';	//	重設obj。
  display='block';	//	得設定obj之display，因為不這樣不能定offset。但可不顯現出來…只是好像沒啥效果。
 }

 //if(dialog!=locObjF.dialogDown&&dialog!=locObjF.dialogUp)dialog=0;
 //	setup loc#1: deal dialog
 if(typeof loc=='string'){var o=document.getElementById(loc);if(o)loc=o;}	//	若loc為id
 if(typeof loc=='object'&&typeof loc.offsetLeft!='undefined'){	//	若loc為Document Object
/*
  //alert(loc.id+':'+loc.offsetLeft+','+loc.offsetTop+';'+loc.offsetWidth+','+loc.offsetHeight);
  var l=loc.offsetLeft,t=loc.offsetTop,w,h,n,add,outsideBLOCK,countH=window.navigator.userAgent.indexOf("MSIE")>=0;	//	真妙..moz表示在<H\d>中的obj時不把H\d當作parent算進去
  if(typeof loc.offsetWidth!='undefined')w=loc.offsetWidth,h=loc.offsetHeight;	//	loc.offsetWidth可能未定義？
  //var tt=loc.tagName+':'+loc.offsetLeft+','+loc.offsetTop+'\n';	//	for debug
  //	下面這段依瀏覽器而有不同 (-_-)!!
  while(isNaN((loc=loc.parentNode).offsetLeft)){	//	IE在用style:class時會出現誤差。
   n=loc.tagName;
   //if( !/^T(ABLE|BODY|R)$/.test(n=loc.tagName) && (countH||!/^H\d$/.test(n)) )l+=loc.offsetLeft,t+=loc.offsetTop;
   if(n=='DIV')add=outsideBLOCK;
   else if(n=='TD' || countH&&/^H\d$/.test(n))add=1;
   outsideBLOCK= n=='TABLE'||n=='DIV';	//	loc.style.display
   //tt+=(add?'':'#')+n+(loc.style.display?'('+loc.style.display+')':'')+':'+loc.offsetLeft+','+loc.offsetTop+(outsideBLOCK?', outside BLOCK':'')+'\n';
   if(add)add=0,l+=loc.offsetLeft,t+=loc.offsetTop;
  }
  //alert(l+','+t+'\n'+tt);	//	need to enable definition of tt above
  loc={'L':l,'T':t,'W':w,'H':h};
*/
  loc=get_node_position(loc);
  if((flag&locObjF.modeFlag)==locObjF.auto)flag+=locObjF.dialog-locObjF.auto,dialog=locObjF.dialog;
 }
 //	setup margin
 win=getWinStatus();
 if(!margin)margin=dMargin;//dialog?dMargin:{'X':0,'Y':0};
 else dealPercent(margin,1);
 //	setup loc#2: deal abs/rel
 if(!loc||loc=='mouse')loc={L:win.mouseX||0,T:win.mouseY||0};
 else{
  if((flag&locObjF.modeFlag)==locObjF.auto&&typeof loc=='string'&&/[%.]/.test(loc))
   flag+=locObjF.rel-locObjF.auto;
  dealPercent(loc);
 }
 //alert(loc.L+','+loc.T+';'+margin.X+','+margin.Y);
 if((flag&locObjF.modeFlag)==locObjF.auto)	//	到這裡還沒決定就很奇怪了
  flag+=locObjF[loc.W&&loc.H&&loc.T<win.windowH&&loc.L<win.windowW?(dialog=locObjF.dialog,'dialog'):'abs']-locObjF.auto;

 //	調整與判別
 //alert(loc.L+','+loc.T+';'+margin.X+','+margin.Y);
 //alert(loc.L+margin.X+','+(loc.T+margin.Y));
 //alert('dialog:'+dialog);

 if((flag&locObjF.modeFlag)==locObjF.rel)	//	改成絕對座標。此後僅存abs/dialog
  flag+=locObjF.abs-locObjF.rel//-(flag&locObjF.modeFlag)
  ,loc.L+=win.scrollX,loc.T+=win.scrollY
  ;

 var resizable=!(flag&locObjF.noResize),boxL=loc.L,boxT=loc.T,boxW=-1,boxH=-1;	//	最後要設定的值
 if(flag&locObjF.noMove)
  if(resizable)makeFit((boxL+=margin.X)-margin.X,(boxT+=margin.Y)-margin.Y,win.scrollX+win.windowW,win.scrollY+win.windowH);
  else{
   if(margin.X<0||boxL+margin.X>=win.scrollX&&boxL+margin.X+obj.offsetWidth<win.scrollX+win.windowW)boxL+=margin.X;
   if(margin.Y<0||boxT+margin.Y>=win.scrollY&&boxT+margin.Y+obj.offsetHeight<win.scrollY+win.windowH)boxT+=margin.Y;
  }
 else if(!dialog)	//	abs
  boxL+=margin.X,boxT+=margin.Y,makeFit(win.scrollX,win.scrollY,win.scrollX+win.windowW,win.scrollY+win.windowH);
 else{	//	自動調整位置
  if(dialog){if(!loc.W)loc.W=0;if(!loc.H)loc.H=0;}
  else loc={'L':win.scrollX,'T':win.scrollY,'W':0,'H':0};	//	abs時,相當於dialog在(0,0)大小(0,0)
  if(!obj.innerHTML)obj.innerHTML='&nbsp;';	//	起碼先設定個大小以安排位置
  var lA=win.scrollY+win.windowH-loc.T-loc.H,lB=loc.T-win.scrollY,lC=win.scrollX+win.windowW-loc.L-loc.W,lD=loc.L-win.scrollX
  ,m1=win.scrollX,m2=win.scrollY,m3=win.scrollX+win.windowW,m4=win.scrollY+win.windowH	//	args for makeFit()
  ,movekind;	//	move kind set use locObjF.dialog~ flag
  //alert(lA+','+lB+','+lC+','+lD+'\n'+obj.offsetWidth+','+obj.offsetHeight);
/*
	+---------------------+
	|        ^            |
	|        | lB         |	<--screen (active frame)
	|        |            |
	|<---->#####<-------->|	###:reference obj
	|  lD    |      lC    |
	|        |            |
	|        | lA         |
	|        |            |
	+---------------------+
*/
  //	決定mode
  if(dialog&&(flag&locObjF.dialogForce))movekind=dialog;
  else{
   if( obj.offsetWidth<win.windowW &&
	(dialog!=locObjF.dialogRight&&dialog!=locObjF.dialogLeft||obj.offsetHeight>=win.windowH) )
    if(obj.offsetHeight<lA&&(dialog!=locObjF.dialogUp||obj.offsetHeight>=lB))movekind=locObjF.dialogDown;
    else if(obj.offsetHeight<lB)movekind=locObjF.dialogUp;
   if(!movekind&&obj.offsetHeight<win.windowH)
    if(obj.offsetWidth<lC&&(dialog!=locObjF.dialogLeft||obj.offsetWidth>=lD))movekind=locObjF.dialogRight;
    else if(obj.offsetWidth<lD)movekind=locObjF.dialogLeft;
   if(!movekind)
    movekind=	//	以較大、可視的為準
	dialog!=locObjF.dialogRight&&dialog!=locObjF.dialogLeft?
		lA<lB&&resizable?locObjF.dialogUp:locObjF.dialogDown:	//	沒考慮假如lA<5時..
		lC<lD&&resizable?locObjF.dialogLeft:locObjF.dialogRight;
  }

  //alert(movekind);
  //	決定location
  if(movekind==locObjF.dialogDown)	m2=loc.T+loc.H,boxT+=loc.H;
  else if(movekind==locObjF.dialogUp)	m4=loc.T,boxT-=obj.offsetHeight,margin.Y=-margin.Y;
  else if(movekind==locObjF.dialogRight)m1=loc.L+loc.W,boxL+=loc.W;
  else					m3=loc.L,boxL-=obj.offsetWidth,margin.X=-margin.X;//else if(movekind==locObjF.dialogLeft)

  boxL+=margin.X,boxT+=margin.Y;	//	加上偏移
  if(!resizable){
   if(boxL<m1&&margin.X<0||boxL+obj.offsetWidth>m3&&margin.X>0)boxL-=margin.X;
   if(boxT<m2&&margin.Y<0||boxT+obj.offsetHeight>m4&&margin.Y>0)boxT-=margin.Y;
   m3+=obj.offsetWidth,m4+=obj.offsetHeight;	//	確保不會撞到
  }
  //	奇怪的是，alert(obj.offsetWidth)後obj.offsetWidth就變成0了。可能因為這值需要出函數之後再改。
  //alert(resizable+'\n'+m1+','+m2+','+m3+','+m4+','+movekind+'\n'+obj.offsetWidth+','+obj.offsetHeight);
  makeFit(m1,m2,m3,m4,movekind==locObjF.dialogRight||movekind==locObjF.dialogLeft?loc.T:0);
 }

 //	設定位置
 //alert(boxL+','+boxT+','+boxW+','+boxH+','+Display);
 with(obj.style){
  position	=	'absolute';
  left		=	boxL+'px';
  top		=	boxT+'px';
  if(boxW>=0||boxH>=0){
   overflow	=	'auto';
   //alert(width+','+height+'\n'+typeof width+'\n->w,h:'+boxW+','+boxH);
   if(boxW>=0)width=	boxW+'px';
   if(boxH>=0)height=	boxH+'px';
  }
  display	=	Display;
  visibility	=	Visibility;
 }

 //alert(obj.style.width+','+obj.style.height+'\n'+obj.offsetWidth+','+obj.offsetHeight);
 return obj;
}









//	2007/4/25-27 0:48:22	RFC 3492 IDNA Punycode	未最佳化
function Punycode(){}

Punycode.map='abcdefghijklmnopqrstuvwxyz0123456789',
Punycode.Dmap=0,
Punycode.base=36,//Punycode.map.length
Punycode.tmin=1,
Punycode.tmax=26,
Punycode.skew=38,
Punycode.damp=700,
Punycode.initial_bias=72,//偏移
Punycode.initial_n=0x80,//128
Punycode.prefix="xn--",//the default ACE prefix
Punycode.delimiter='-';
Punycode._b=Punycode.base-Punycode.tmin,
//Punycode._t=(Punycode._b*Punycode.tmax)>>1,
Punycode._t=Math.floor(Punycode._b*Punycode.tmax/2);

//	IDNA ToASCII
Punycode.encodeDomain=function(UURL){
 var m=UURL.match(/^([\w\d\-]+:\/\/)?([^\/]+)/),UDomain=m?m[2]:'',i=(m=UDomain)?UURL.indexOf(m):0;
	//document.write('<hr/>Punycode.encodeDomain UDomain: ['+i+']['+m+']<br/>');
 if(m&&m.replace(/[\x01-\x7f]+/g,''))with(Punycode)
  m=m.replace(/([^.]+)\./g,function($0,$1){
	//document.write($1+'→'+encode($1)+'<br/>');
	 return prefix+encode($1)+'.';
	}),UURL=encodeURI(UURL.slice(0,i)+m+UURL.slice(i+UDomain.length));
 return UURL;
};

//	IDNA ToUnicode
Punycode.decodeDomain=function(PURL){with(Punycode){
 var m=PURL.match(/^([\w\d\-]+:\/\/)?([^\/]+)/),PDomain=m?m[2]:'',i=(m=PDomain)?PURL.indexOf(m):0;
	//document.write('<hr/>Punycode.decodeDomain PDomain: ['+i+']['+m+']<br/>');
 if(m){
  m=m.replace(new RegExp(prefix+'([^.]+)\\.','g'),function($0,$1){
	//document.write($1+'→'+decode($1)+'<br/>');
	 return decode($1)+'.';
	});
  if(m!=PDomain){
   PURL=PURL.slice(0,i)+m+PURL.slice(i+PDomain.length);
   try{PURL=decodeURI(PURL);}catch(e){PURL=unescape(PURL);}
  }
 }
 return PURL;
}};


Punycode.adapt=function(delta,numpoints,firsttime){with(Punycode){
	//document.write('*adapt: '+delta+', '+numpoints+', '+firsttime+', _b='+_b+', _t='+_t+'<br/>');
 delta=firsttime?Math.floor(delta/damp):delta>>1;//Math.floor(delta/(firsttime?damp:2));
 delta+=Math.floor(delta/numpoints);
 var k=0;
 for(;delta>_t;k+=base)delta=Math.floor(delta/_b);
 return k+Math.floor((_b+1)*delta/(delta+skew));
}};

Punycode.encode=function(UString){with(Punycode){
 var n=initial_n,cA=[],m,mA=[],i=0,c
	,q,delta=0,bias=initial_bias,output=UString.replace(/[^\x01-\x7f]+/g,''),h=output.length,b=h;
	//document.write('<hr/>Punycode.encode begin: ['+output+']<br/>');
 if(b)output+=delimiter;

 for(;i<UString.length;i++){
  cA.push(c=UString.charCodeAt(i));
  if(c>n)mA.push(c);
 }
 mA.sort(function(a,b){return b-a;});

 while(h<cA.length){
  do{c=mA.pop();}while(m==c);	//	預防重複
  m=c;
  //if(m-n>(Number.MAX_VALUE-delta)/(h+1)){alert('Punycode: overflow');return;}
  delta+=(m-n)*(h+1);//	should test overflow
  n=m;
  for(i=0;i<cA.length;i++){
   if(c=cA[i],c<n)++delta;//if(c=cA[i],c<n&&!++delta){alert('Punycode: overflow');return;}//	fail on overflow
	//document.write('<b>'+UString.charAt(i)+' '+(c.toString(16)+','+n.toString(16)).toUpperCase()+'</b><br/>');
   if(c==n){
    for(q=delta,k=base;;k+=base){
     t=k<=bias/* +tmin not needed */?tmin:k>=bias+tmax?tmax:k-bias;
     if(q<t)break;
     output+=map.charAt(t+(q-t)%(base-t));
	//document.write('<b>'+output+'</b><br/>');
     q=Math.floor((q-t)/(base-t));
    }
    output+=map.charAt(q);
    bias=adapt(delta,h+1,h==b);
	//document.write('h='+h+'/'+cA.length+', bias='+bias+', '+output+'<br/>');
    delta=0,h++;
   }
  }
  delta++,n++;
 }
	//document.write(UString+'→'+output+'<br/>');
 return output;
}};

Punycode.decode=function(PCode){with(Punycode){
 var n=initial_n,i=0,p=PCode.lastIndexOf(delimiter),bias=initial_bias,output=p==-1?'':PCode.slice(0,p)
	,oldi,w,digit,l;
	//document.write('<hr/>Punycode.decode begin: ['+output+']<br/>');
 if(!Dmap)for(w=0,Dmap={};w<map.length;w++)Dmap[map.charAt(w)]=w;//,document.write('Dmap['+map.charAt(w)+']='+w+'<br/>');
 while(p<PCode.length-1){
  for(oldi=i,w=1,k=base;;k+=base){
   if(++p>=PCode.length){alert('Punycode: invalid input: out of range');return PCode;}
	//document.write('PCode.charAt('+p+')'+' = '+PCode.charAt(p)+' → '+Dmap[PCode.charAt(p)]+'<br/>');
   if(isNaN(digit=Dmap[PCode.charAt(p)])){alert('Punycode: invalid input');return PCode;}
   //if(digit>(Number.MAX_VALUE-i)/w){alert('Punycode: overflow');return;}
   i+=digit*w;
   t=k<=bias/* +tmin not needed */?tmin:k>=bias+tmax?tmax:k-bias;
	//document.write('i='+i+', t='+t+', digit='+digit+', k='+k+'<br/>');
   if(digit<t)break;
   //if(w>Number.MAX_VALUE/(base-t)){alert('Punycode: overflow');return;}
   w*=base-t;
  }
  bias=adapt(i-oldi,l=output.length+1,oldi==0);
	//document.write('bias='+bias+', n='+n+', i='+i+', l='+l+'<br/>');
  //if(i/l>Number.MAX_VALUE-n){alert('Punycode: overflow');return;}
  n+=Math.floor(i/l);
  i%=l;
	//document.write('['+output.length+']'+output+'+'+n+'(0x'+n.toString(16).toUpperCase()+')@'+i+'→');
  output=output.slice(0,i)+String.fromCharCode(n)+output.slice(i);
	//document.write('['+output.length+']'+output+'<br/>');
  i++;
 }
	//document.write(PCode+'→'+output+'<br/>');
 return output;
}};


/*
var testC='Hello-Another-Way--fc4qua05auwb3674vfr0b',rC;
document.write('<hr/>'+
//Punycode.encodeDomain('http://國際.計畫.org/國際.計畫.htm')
Punycode.decodeDomain('http://xn--9cs229l.xn--gpyr35b.org/%E5%9C%8B%E9%9A%9B.%E8%A8%88%E7%95%AB.htm')
//Punycode.encode('463578')
//Punycode.decode('ihqwcrb4cv8a8dqg056pqjye')+'<hr/>'+Punycode.encode('他们为什么不说中文')
//Punycode.decode('ihqwctvzc91f659drss3x8bo0yb')+'<hr/>'+Punycode.encode('他們爲什麽不說中文')
//(rC=Punycode.decode(testC))+'<hr/>'+(rC=Punycode.encode(rC))+'<hr/>'+(testC==rC?'OK':'<b style="color:red">FAILED</b>:<br/>'+testC+'<br/>'+rC)
);
*/



/*	一個非常不好的 deal onload 方法。只在onload不具有arguments時有用，應該亦可用setTimeout('~',0)
	where	0:back,1:front

for IE:
<!--[if IE]><script defer type="text/javascript">
//	onload code
</script><![endif]-->

c.f.	http://www.brothercake.com/	http://simonwillison.net/2004/May/26/addLoadEvent/
	GO1.1 Generic onload by Brothercake
	window.addEventListener,document.addEventListener,typeof window.attachEvent
c.f.	setTimeout('~',0);	不過這不能確定已經load好
*/
/*
function addonload(s,where){
 if(!s||typeof window!='object')return 1;
 if(typeof s=='function'){
  s=parseFunction(s);
  if(!s||!s.funcName)return 2;
  s=s.funcName+'()';
 }
 var o=window.onload?typeof window.onload=='string'?window.onload:parseFunction(window.onload).contents:'';
 window.onload=new Function(where?s+';\n'+o:o+';\n'+s);
}
*/

/*	比較好點的 add onload
這東西頂多只能擺在 include 的 JS file 中，不能 runtime include。

TODO:
http://javascript.nwbox.com/IEContentLoaded/
try{document.documentElement.doScroll('left');}
catch(e){setTimeout(arguments.callee, 50);return;}
instead of onload

可直接參考 SWFObject

DOMContentLoaded是firefox下特有的Event, 當所有DOM解析完以後會觸發這個事件。
DOMContentLoaded與DOM中的onLoad事件與其相近。但onload要等到所有頁面元素加載完成才會觸發, 包括頁面上的圖片等等。

usage: on_load(function(){sl(1);},'sl(2);');
*/
//on_load[generateCode.dLK]='add_listener';
CeL.net.web
.
on_load = function() {
	for ( var i = 0, a = arguments; i < a.length; i++)
		add_listener( {
			load : a[i]
		});
};


CeL.net.web
.
/**
 * bind/add listener<br/>
 * **	對同樣的 object，事件本身還是會依照 call add_listener() 的順序跑，不會因為 pFirst 而改變。
 * **	NOT TESTED!!
 * @param type	listen to what event type
 * @param listener	listener function/function array
 * @param [document_object]	bind/attach to what document object
 * @param [pFirst]	parentNode first
 * @return
 * @since	2010/1/20 23:42:51
 * @see
 * c.f., GEvent.add_listener()
 */
add_listener = function(type, listener, document_object, pFirst) {
	if (!type || !listener)
		return;

	if (typeof listener === 'string')
		listener = new Function('e', listener);

	if(typeof pFirst !== 'bool')
		pFirst = typeof pFirst === 'undefined' ? _s.pFirst : !!pFirst;

	var _s = arguments.callee, i, adder;


	//	進階功能
	if (typeof type === 'object')
		// usage: add_listener({unload:Unload});
		// usage: add_listener({load:{true:[function(){sl(1);},'sl(2);']}});
		for (i in type)
			_s(i, type[i], document_object);// ,sl(i+': '+type[i])

	else if (typeof listener === 'object')
		// usage: add_listener('unload',{true:Unload1});
		// usage: add_listener('unload',[Unload1,Unload2]);
		// 因為 Array 會從最小的開始照順序出，所以這邊不再判別是否為 Array。
		for (i in listener)
			// if(isNaN(f))sl('add_listener: to '+i),_s.pFirst=i==='true';//||i==1||i===true
			_s(type, listener[i], document_object,
					i === 'true' || (i === 'false' ? false : undefined));// ,sl((typeof i)+' ['+i+'] '+_s.pFirst)

	else{
		/*
		 * 先設定好 native listener adding function
		 */
		if (document_object)
			adder = document_object.addEventListener;
		else if (!(adder = _s.global_adder) && adder !== null)
			_s.global_adder = adder = _s.get_adder();


		// 主要核心動作設定之處理
		// sl(type+' ('+((typeof pFirst=='undefined'?_s.pFirst:pFirst?true:false)?'pFirst':'run first')+'): '+listener);
		return adder ?
			adder(type, listener, pFirst)
		: document_object && (adder = document_object.attachEvent) ?
			// http://msdn.microsoft.com/en-us/library/ms536343(VS.85).aspx
			adder('on' + type, listener)
		: _s.default_adder(type, listener, pFirst, document_object)
		;
	}
};

CeL.net.web
.
/**
 * useCapture: parentNode first
 * @see
 * http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-flow
 */
add_listener.pFirst = false;

CeL.net.web
.
/**
 * get (native) global listener adding function
 */
add_listener.get_adder = function() {
	/**
	 * moz, saf1.2, ow5b6.1: window.addEventListener
	 * 
	 * @ignore
	 * @see http://developer.mozilla.org/en/docs/DOM:element.addEventListener
	 *      http://simonwillison.net/2004/May/26/addLoadEvent/
	 */
	return window.addEventListener ||
	/*
	 * op7.50, ie5.0w, ie5.5w, ie6w: window.attachEvent op7.50:
	 * document.attachEvent
	 */
	window.attachEvent ? function(t, l) {
		window.attachEvent('on' + t, l);
	} :
	/*
	 * MSN/OSX, op7.50, saf1.2, ow5b6.1: document.addEventListener
	 */
	document.addEventListener ||
	/*
	 * ie5m, MSN/OSX, ie5.0w, ie5.5w ie6w: document.onreadystatechange
	 */
	null;

};

CeL.net.web
.
/**
 * 含括其他情況。
 * all: window.onload
 * @param type	listen to what event type
 * @param listener	listener function/function array
 * @param [pFirst]	parentNode first
 * @param [document_object]	bind/attach to what document object
 * @return
 * @see
 * http://blog.othree.net/log/2007/02/06/third-argument-of-addeventlistener/
 */
add_listener.default_adder = function(type, listener, pFirst, document_object) {
	if(!document_object)
		document_object = window;

	var old = document_object[type = 'on' + type];
	return document_object[type] =
		old ?
			pFirst ? function() {
				old();
				listener();
			} : function() {
				listener();
				old();
			}
		:
			listener
		;
};



//	阻止 JavaScript 事件冒泡傳遞，使 event 不傳到 parentNode	http://www.jb51.net/html/200705/23/9858.htm
function stopEvent(e,c){
	if(e.preventDefault)
		e.preventDefault();
	else
		// window.event
		e.returnValue=false;

	if(c)
		// cancelBubble 在IE下有效，stopPropagation 在 Firefox 下有效。
		// 停止冒泡，事件不會上升，我們就可以獲取精確的鼠標進入元素。 http://realazy.org/lab/bubble/
		if(e.stopPropagation)
			e.stopPropagation();
		else
			// window.event
			e.cancelBubble=true;
};



/*	↑HTML only	-------------------------------------------------------
*/



var isIE=/*@cc_on!@*/!true;

/*
http://www.real-blog.com/programming/259
http://fettig.net/weblog/2006/10/09/detecting-ie7-in-javascript/

if(typeof window.XMLHttpRequest!="undefined"){
 // IE 7, mozilla, safari, opera 9
}else{
 // IE6, older browsers
}
*/





/*
http://www.cnlei.org/blog/article.asp?id=337
在IE下：
>> 支持keyCode
>> 不支持which和charCode,二者值為 undefined

在Firefox下：
>> 支持keyCode，除功能鍵外，其他鍵值始終為 0
>> 支持which和charCode，二者的值相同

在Opera下：
>> 支持keyCode和which，二者的值相同
>> 不支持charCode，值為 undefined

*/
/**
 * 條碼器(Barcode Scanner)/雷射讀碼器的輸入可用 onkeypress 取得
 * @param callback	callback
 * @return
 * @since	2008/8/26 23:10
 * @example
 * //	usage:
 * deal_barcode(function(t) {
 * 	if (t.length > 9 && t.length < 17)
 * 		document.getElementById("p").value = t,
 * 		document.forms[0].submit();
 * });
 * @memberOf	CeL.net.web
 */
function deal_barcode(callback) {
	var k, lt = 0, st = 0;
	document.onkeypress = function(e) {
		var c = new Date();
		if (
				// 前後不超過 800，
				c - st > 800 ||
				// 與上一輸入不超過 90
				c - lt > 90) {
			st = c;
			k = "";
		}
		lt = c;
		c = e || event;
		c = c.keyCode || c.which || c.charCode;
		if (c > 32 && c < 120)
			k += String.fromCharCode(c);
		else if (c == 13)
			callback(k, e);
	};

};



//	https://addons.mozilla.org/js/search-plugin.js
//	TODO
function addEngine(){
}



//	for string encoding	-------------------------------------------------------
//	將HTML:&#ddd; → Unicode text
//	此函數只能用一次，為輸入資料良好之情況下使用。完整版： HTMLToUnicode
//turnUnicode[generateCode.dLK]='setTool,getText';
function turnUnicode(b){
 //s=s.replace(/&#(\d+);/g,String.fromCharCode("$1"));//行不通
 var s=this.valueOf().replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'"),m,t;

 //舊版本
 //if(m=s.match(/&#(\d{2,7});/g))for(var i=0;i<m.length;i++)s=s.replace(m[i],String.fromCharCode(parseInt(m[i].slice(2,-1))));

 s=s	//.replace(/&#(0*38|[xX]0*26);/g,"\0")	//預防&#38;：&#38;=&
 //	.replace(/&#0*38;([^\d;]|$)/g,"\0$1").replace(/&#[xX]0*26;?([^a-fA-F\d;]|$)/g,"\0$1")

 .replace(/&#0*(\d{2,7});/g,function($0,$1){return String.fromCharCode($1);})	//JScript 5.5~
 //	.replace(/&#0*(\d{2,7});/g,function($0,$1){return $1>1114111?$0:String.fromCharCode($1);})	//預防error之版本,~10FFFF=1114111

 //if(mode=='x')
 //.replace(/&#[xX]0*([a-fA-F\d]{2,6});/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})	//$x111;之版本
 //	.replace(/&#[xX]0*([a-fA-F\d]{2,6});/g,function($0,$1){var t=parseInt($1,16);return t>1114111?$0:String.fromCharCode(t);})

 //.replace(/\0/g,"&")	//預防&#38;回復
 ;
 if(b)s=s.gText();
 return s;
}
//	可適用perl: HTML::Entities::encode_entities()
//	需要escape的: [\<\>\"\'\%\;\)\(\&\+], tr/A-Za-z0-9\ //dc	http://www.cert.org/tech_tips/malicious_code_mitigation.html
function HTMLToUnicode(H,onlyDigital){
 //	使用\0可能會 Warning: non-octal digit in an escape sequence that doesn't match a back-reference
 var t=H.valueOf();
 if(!onlyDigital)
  t=t	.replace(/\0\0/g,'')	//	自動clip null character
	.replace(/&nbsp;/g,' ')
	.replace(/&lt;/g,'<')
	.replace(/&gt;/g,'>')
	.replace(/&quot;/g,'"')
	.replace(/&apos;/g,"'")
	.replace(/&reg;/g,"®")
	;

 t=t	.replace(/&#(0*38|[xX]0*26);/g,"\0\0")	//預防&#38;：&#38;=&
	.replace(/&#0*(\d{2,7});/g,function($0,$1){return $1>1114111?$0:String.fromCharCode($1);})	//預防error之版本,~10FFFF=1114111
	.replace(/&#[xX]0*([a-fA-F\d]{2,6});/g,function($0,$1){var t=parseInt($1,16);return t>1114111?$0:String.fromCharCode(t);})
	;

 if(!onlyDigital)
  t=t	.replace(/\0\0/g,"&")	//預防&#38;回復
	.replace(/&amp;/g,'&')
	;

 return t;
}
/**
 * translate Unicode text to HTML
 * @param {String} text	Unicode text
 * @param mode	mode='x':&#xhhh;
 * @return {String}	HTML
 * @memberOf	CeL.net.web
 */
function toHTML(text, mode) {
	var html = '', t, i = 0;
	for (; i < text.length; i++)
		t = text.charCodeAt(i), html += '&#' + (mode === 'x' ? 'x' + t
				.toString(16) : t) + ';';
	return html;
};
function UnicodeToHTML(U,f){	//	f:flag, f&1!=0: turn \t, (f&2)==0: \n→<br/>, f==4: to quoted
 U=(''+U).replace(/&/g,'&amp;')
	.replace(/&amp;amp;/gi,'&amp;')	//	就是會出現這奇怪情況。
	.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
	;

 if(f==4)return U;

 U=U.replace(/ /g,'&nbsp;');

 //if(!f)f=0;
 if(f&1)U=U.replace(/	/g,'<span style="margin-left:3em;">&nbsp;</span>');
 if(!(f&2))U=U.replace(/(\r?\n)/g,'<br/>$1');//+'<br/>\n';
 return U;
}

function UcodeToTxt(U){	// Ucode:\uhhhh及\xhh之意
 var T=U.replace(/\\\\|\\u005[cC]|\\x5[cC]|\\134/g,"\0")
/*
 //way 1
 .replace(/\\u([a-fA-F\d]{4})/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})
 .replace(/\\x([a-fA-F\d]{2})/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})
 .replace(/\\([0-7]{1,3})/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})
 //way 2
 .replace(/\\(u[a-fA-F\d]{4}|x[a-fA-F\d]{2})/g,function($0,$1){return String.fromCharCode(parseInt($1.substr(1),16));})
 .replace(/\\([0-7]{1,3})/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})
*/
 //way 3
 .replace(/\\(u[a-fA-F\d]{4}|x[a-fA-F\d]{2}|[0-7]{1,3})/g,function($0,$1){var t=$1.charAt(0);return String.fromCharCode(parseInt(t=='u'||t=='x'?$1.substr(1):$1,16));})
 ;

 if(T.indexOf("\\")!=-1)T=T.replace(/\\t/g,"<Tab>").replace(/\\n/g,"<Line Feed>").replace(/\\v/g,"<Vertical Tab>").replace(/\\f/g,"<Form Feed>").replace(/\\r/g,"<Carriage Return>").replace(/\\(.)/g,"$1");
 return T.replace(/\0/g,"\\");
}
function TxtToUcode(T,l){
 var i=0,U='',t;
 if(!l)l=0;
 for(;i<T.length;i++)
  U+= (t=T.charCodeAt(i))<l? T.charAt(i) : (t=t.toString(16),"\\u0000".substr(0,6-t.length)+t);
 return U;
}
function CSSToTxt(C){
 return C.replace(/\\\\|\\0{0,4}5[cC][ \t\r\n\f]?/g,"\0")
 .replace(/\\([a-fA-F\d]{1,6})[ \t\r\n\f]?/g,function($0,$1){return String.fromCharCode(parseInt($1,16));})
 .replace(/\\(.)/g,"$1").replace(/\0/g,"\\");
}
function TxtToCSS(T,r,sp){	//	r:radio,sp:separator
 var i=0,C='',t,p=r&&r>3&&r<9?'0'.x(r-1):'';
 if(!sp)sp='';sp+='\\';

 for(;i<T.length;i++)
  t=T.charCodeAt(i).toString(16)
  ,C+=sp+p.substr(0,r-t.length)+t;	//(p&&r>t.length?p.substr(0,r-t.length):''):如果length是0或負值，會傳回空字串。
 return C.slice(sp.length-1);
}



/*	簡化 HTML (word)
	simplify HTML
	目標：剩下語意部分，去掉 style。
TODO:
保留 b, em
*/

//	保留 color: return style string to add
//reduceHTML.keep_color=
reduceHTML._keep_color=
function(c){
 if(c!='black')return c;
};
reduceHTML.file=function(FP,enc){
 sl('reduceHTML ['+FP+']');
 var t=simpleRead(FP,enc||simpleFileAutodetectEncode),l;
 if(!t){
  err('Open ['+FP+'] failed.');
  return;
 }

 l=t.length;
 t=this(t);

 FP=FP.replace(/\.s?html?$/i,function($0){return '.reduced'+$0;});
 sl('reduceHTML: '+l+'→'+t.length+' ('+parseInt(100*t.length/l)+'%)'+', save to [<a href="'+encodeURI(FP)+'">'+FP+'</a>].');
 simpleWrite(FP,t,'utf-8');
};
function reduceHTML(t){
 if(!t)return;
 var _f=arguments.callee,f=function($0,$1,$2){return $1!=$2||($1.toLowerCase() in {a:1,p:1,head:1})?$0:'';};
 //if(m=t.match(/<!--\[if [^\]]+\]>(.|\n)*?<!\[endif\]-->/))sl(m[0].replace(/</g,'&lt;'));
 //if(m=t.match(/<!\[if !vml\]>((.|\n)*?)<!\[endif\]>/))sl(m[0]);

 t=t
	.replace(/[\s\n]*<(t[dh])([^>]+)>[\s\n]*/ig,function($0,$1,$2){var a=$2.match(/[\s\n](col|row)span=['"]?\d{1,3}['"]?/ig);return '<'+$1+(a?a.join(''):'')+'>';})
	.replace(/<\?xml:namespace[^>]+>/g,'')
	.replace(/[\s\n]*(<\/t[dh]>)[\s\n]*/ig,'$1')
	.replace(/<wbr([^>]*)>/ig,'<br/>')
	.replace(/<([bh]r)[\s\n]+([^>]*)\/?>/ig,function($0,$1,$2){var m=$2.match(/[\s\n;"'][\s\n]*page-break-before[\s\n]*:[\s\n]*([^\s\n;"']+)/);return '<'+$1+(m?' style="page-break-before:'+m[1]+'"':'')+'>';})
	.replace(/<(span|font|p|div|b|u|i)[\s\n]+([^>]*)>/ig,function($0,$1,$2){var t='<'+$1,s='',m;
		if($2.indexOf('Italic')!=-1)s+='font-style:italic;';	//	if(/Italic/i.test($2))s+='font-style:italic;';
		//	TODO: <u>, <b>
		if(_f.keep_color && (m=$2.match(/[\s\n;"'][\s\n]*color[\s\n]*:[\s\n]*([^\s\n;"']+)/)) && (m=_f.keep_color(m[1])))
		 s+='color:'+m+';';	//	保留 color
		return t+(s?' style="'+s+'"':'')+'>';})
	.replace(/<(tr|table)[\s\n]+([^>]*)>/ig,'<$1>')
	.replace(/<span>((.|\n)*?)<\/span>/ig,'$1')	//	不能用 .+|\n ，IE8 sometimes crash
	.replace(/<span>((.|\n)*?)<\/span>/ig,'$1')	//	need several times
	.replace(/<font>((.|\n)*?)<\/font>/ig,'$1')
	.replace(/<([a-z\d]+)>[\s\n]*<\/([a-z\d]+)>/ig,f)
	.replace(/<([a-z\d]+)>[\s\n]*<\/([a-z\d]+)>/ig,f)	//	2 times
	.replace(/<o:p>((.|\n)*?)<\/o:p>/ig,'$1')
	.replace(/<st1:[^>]+>((.|\n)*?)<\/st1:[^>]+>/ig,'$1')
	.replace(/<!\[if !vml\]>((.|\n)*?)<!\[endif\]>/ig,'$1')
	.replace(/<o:SmartTagType [^>]+\/>/ig,'')
/*
  <td>
  <p>&nbsp;</p>
  </td>
*/
	.replace(/<(span|p|div|t[dr])([^>]*>)<(span|p)>(([\s\n]+|&nbsp;)*?)<\/(span|p)><\/(span|p|div|t[dr])>/ig,'<$1$2$4</$7>')
	.replace(/<link rel=(File-List|colorSchemeMapping|themeData|Edit-Time-Data)[^>]+>/ig,'')
	.replace(/^\s*<html[^>]*>(\r?\n)*/,'<html>')
	.replace(/(\r?\n)*<body[^>]+>(\r?\n)*/,'<body>')
	.replace(/(\r?\n)*<!--\[if [^\]]+\]>(.|\n)*?<!\[endif\]-->(\r?\n)*/ig,'')
	.replace(/(\r?\n)*<style[^>]*>(.|\n)*?<\/style>(\r?\n)*/ig,'')
	.replace(/(\r?\n)*<meta[\s\n][^>]+>(\r?\n)*/ig,'')

	//	from HTMLToUnicode()
	.replace(/&#0*(\d{2,7});/ig,function($0,$1){return $1>1114111?$0:String.fromCharCode($1);})	//預防error之版本,~10FFFF=1114111
	.replace(/([\s\n]+|&nbsp;)+$|^([\s\n]+|&nbsp;)+/g,'')
	;

 if(/<table[\s>\r\n]/.test(t))
  //sl('Has table'),
  t=t.replace(/<\/head>/i,'<style type="text/css">table,th,td{border:1px solid #888;border-collapse:collapse;}</style></head>');

 return t;
}


/**
 * 將 BIG5 日文假名碼修改為 Unicode 日文假名
 * @param U
 * @return
 * @see
 * from Unicode 補完計畫 jrename.js
 */
function Big5JPToUnicodeJP(U) {
	var H = '', t, i = 0;
	for (; i < U.length; i++)
		t = c.charCodeAt(0)
		// 某次破解Windows Installer所用的資料
		// ,H+=String.fromCharCode(t>61300?t-48977:t);
		, H += t === 63219 ? 'ー' : String.fromCharCode(
				// ひらがな
				t >= 63223 && t <= 63305 ? t - 50870 :
				// カタカナ
				t >= 63306 && t <= 63391 ? t - 50857 :
				// U.charAt(i);
				t);
	return H;
};


//	↑for string encoding	-----------------------------------------------




return (
	CeL.net.web
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL form function
 * @fileoverview
 * 本檔案包含了 form 的 functions。
 * @since	
 */


/*
改成僅用單一格子
*/

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.form.address';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.form.address
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'net.form.select_input.,data.CSV.parse_CSV')))
	return;

/**
 * JavaScript 地址輸入表單支援 (address input form)，
 * 現有台灣(.TW)可用。
 * @class	form 的 functions
 */
CeL.net.form.address
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.net.form.address
.prototype = {
};





/**
 * 簡易型 net.web.XML_node
 * @param tag	p.appendChild tag
 * @param p	parent node
 * @param t	text
 * @param classN	className
 * @return
 */
var create_DO = function(tag, p, t, classN) {
	var _e;
	if (t && (typeof t != 'object' || (t instanceof Object)))
		t = document.createTextNode(t + '');
	if (typeof tag == 'object') {
		_e = tag;
	} else if (tag) {
		_e = document.createElement(tag);
		if (classN)
			_e.className = classN;
		if (t)
			_e.appendChild(t);
	} else if (t)
		_e = t;
	if (p && _e)
		p.appendChild(_e);
	return _e;
};


//ClassT={Account_input:{},Address_input:{}},	//	class template set


//	===================================================
/*
	used for address input form
	住址輸入

TODO:
parse address


HISTORY:
2008/7/24 20:38:18	create
*/

_.TW=

(/*ClassT.Address_input.TW=*/function(){

var

//	class private	-----------------------------------

/*	存放 data 的 path
path/:
zip/	ZIP code data

*/
path=library_namespace.get_module_path(module_name,''),// './',

/*

ZIP[city: 縣市][district: 鄉鎮市區]=ZIP code

ZIP5[Number(zip3)]={ "zip5,路街":"路街,no_range",.. }

ZIP_to_cd[String(zip3)]=[city,district];

ZIP5_to_town[String(zip5)]=[路街,no_range]

c_d[city]=[district list]

ENG[city][district]=english


cityL, districtL: list for select_input
cityL[_city_name_]='_city_name_ (districts number)'
districtL[_district_name_]={city_name_:1}

*/
ZIP={},ZIP5=[],ZIP_to_cd={},ZIP5_to_town={},ENG={},c_d={},cityL={},districtL={},

getZIP5=function(z3,force){
 var d,i=0,a,Z;
 z3=Math.floor(z3);
 if(!(z3 in ZIP5)||!ZIP5[z3])
  Z=ZIP5[z3]={};
 else if(Z=ZIP5[z3],!force)return Z;

 try{
  d=library_namespace.get_file(path+'zip'+(z3>99?'':z3>9?'0':'00')+z3+'.csv');
 }catch(e){
  //library_namespace.log('getZIP5: <em>Can not get ZIP5 data of ['+(z3>99?'':z3>9?'0':'00')+z3+']</em>!');
  return;
 }

 if(d&&(d=parse_CSV(d)))for(;i<d.length;i++)
  if((a=d[i])&&a.length)Z[a[0]+','+a[3]]=ZIP5_to_town[a[0]]=!a[4]||a[4]=='全'?a[3]:a[3]+','+a[4].replace(/^[　\s]+/,'');//去除前空白
 //else sl('Can not parse ZIP5 data of ['+(z3>99?'':z3>9?'0':'00')+z3+']!');

 //sl('getZIP5: ['+(z3>99?'':z3>9?'0':'00')+z3+'] '+d.length+' records.');

 return Z;
},


addFunc=function(t,f){
 var _t=this,_p=pv(_t);
 create_DO(0,_p.container,' [');
 (create_DO('span',_p.container,t,_.classNameSet.clearMark))
	.onclick=arguments.callee.caller===initI?function(){f.apply(_t);}:f;//function(){f(_p.zipI,_p.cityI,_p.districtI,_p.addressI);};
 create_DO(0,_p.container,']');
},


//	instance constructor	---------------------------
instanceL=[],
initI=function(o,prefix){
 if(typeof o!='object')o=document.getElementById(o);
 if(!o){
  //throw new Error(1,'Can not get outter document object!');
  return;
 }

 if(!prefix)prefix='adr_';

 var _t=this,_p=pv(_t),a;
 instanceL.push(_t);	//	for destructor
 _p.container=o;	//	容器

 //	initial instance object
 _t.nameSet={
  zip:'zip',
  city:'city',
  district:'district',
  address:'address'
 };

 //	layout setup
 _p.fullAdr=create_DO('input',o);	//	最後送出時用
 try{_p.fullAdr['type']='hidden';}catch(e){}	//	低版本 JScript: error
 _p.fullAdr.style.display='none';

 var zipOTrg,zipT=create_DO('span',o,'郵遞區號');	//	TODO: <label>
 a=_p.zipI=new select_input(o,ZIP_to_cd);
 a.setClassName(_.classNameSet.zipI);
 a.setTitle('郵遞區號');

 _p.zipI.dInputted=function(){
  return '['+this.setValue()+']';
 };

 zipOTrg=_p.zipI.triggerToInput;
 _p.zipI.triggerToInput=function(y){
  if(y=y||typeof y=='undefined'){
   zipT.style.display='inline';
   zipOTrg.call(_p.zipI,y);
  }else{
   zipT.style.display='none';
   zipOTrg.call(_p.zipI,y);
  }
 };

 create_DO(0,o,' ');//地址:
 (_p.cityI=new select_input(o,cityL)).setTitle('縣市');
 (_p.districtI=new select_input(o,districtL)).setTitle('鄉鎮市區');
 a=_p.addressI=new select_input(o);
 a.autoShowArrow=1;
 a.setClassName(_.classNameSet.addressI);

/*
 addFunc.call(_t,'全關閉',function(){
 	var _p=pv(this);
	//sl('全關閉: clear all value.');
	_p.zipI.showList(0);
	_p.cityI.showList(0);
	_p.districtI.showList(0);
	_p.addressI.showList(0);
 });
*/
 addFunc.call(_t,'全清除',function(){
 	var _p=pv(this);
	//sl('全清除: clear all value.');
	_p.zipI.setValue(''),		_p.zipI.showList(0),		_p.zipI.triggerToInput();
	_p.cityI.setValue(''),		_p.cityI.showList(0),		_p.cityI.triggerToInput();
	_p.districtI.setValue(''),	_p.districtI.showList(0),	_p.districtI.triggerToInput();
	_p.addressI.setValue(''),	_p.addressI.showList(0),	_p.addressI.triggerToInput();
	_p.addressI.setAllList(null);
 });

 //	功能設定
 var	zipF=_p.zipI.setSearch('startWith'),
	cityF=_p.cityI.setSearch('includeKey'),
	districtF=_p.districtI.setSearch('includeKey')
	;

 a=_p.zipI;
 a.maxList=20,
 a.setMaxLength(5),
 a.onInput=function(k){
  zipF.apply(_p.zipI,arguments);
  _p.addressI.showList(0);
  if(k in ZIP_to_cd){
   var a=ZIP_to_cd[k];
   if(a[0])_p.cityI.setValue(a[0]),_p.cityI.showList(0);
   if(a[1])_p.districtI.setValue(a[1]),_p.districtI.showList(0);
  }else if((k in ZIP5_to_town)&&!_p.addressI.setValue())
   _p.addressI.setValue(ZIP5_to_town[k]),_p.addressI.showList(0);
 };
 a.verify=function(k){
  if(!k&&k!==0)return 1;
  var z;
  if(!/^\d+$/.test(k))return 2;
  //sl('zipI.verify: '+(_t.useZIP5?'Use':'Do not use')+' zip5.');
  if(k.length>=3)
   if(getZIP5(z=k.slice(0,3)), !(z in ZIP_to_cd) || _t.useZIP5&&getZIP5(z)&&(k.length==5&&!(k in ZIP5_to_town)))
    return 1;
 };

 a=_p.cityI;
 a.maxList=0,	//	unlimited
 a.setMaxLength(8),
 a.onInput=function(k){
  cityF.apply(_p.cityI,arguments);
  _p.addressI.showList(0);
  var c=districtL[_p.districtI.setValue()];
  if(!c||!(k in c)){
   //	選了不同的 city
   _p.zipI.setValue('');
   _p.districtI.setValue('');
   _p.addressI.setAllList([]);
   _p.zipI.showList(0),_p.districtI.showList(0);
  }
  if(!isNaN(ZIP[k]))_p.zipI.setValue(ZIP[k]);
  _p.districtI.setAllList(k in c_d?c_d[k]:districtL);
 };
 a.verify=function(k){
  if(!k || k&&!(k in ZIP))return 1;
 };

 a=_p.districtI;
 a.maxList=20,
 a.setMaxLength(20),
 a.onList=function(l,i){
  if(l instanceof Array)
   return [l[i],l[i]];
  for(var d in l[i])break;
  return [i,d];
 };
 a.onInput=function(k){
  districtF.apply(_p.districtI,arguments);
  _p.addressI.showList(0);
  var c=districtL[k],i=_p.cityI.setValue();
  if(c && !(i in c)){
   for(var i in c){c=i;break;}
   _p.cityI.showList(0);
   _p.cityI.setValue(c);
  }else c=i;
  if(c in ZIP){
   _p.cityI.showList(0);
   var z=ZIP[c];
   if(typeof z=='object')
    z=_p.districtI.setValue() in z?ZIP[c][_p.districtI.setValue()]:0;
   if(z)_p.zipI.setValue(z),_p.zipI.showList(0);

   //sl('ZIP['+c+']['+_p.districtI.setValue()+']=['+z+']');
   //if(!z){var i;z=ZIP[c];for(var i in z)sl('* ['+i+']='+z[i]);}
  }
 };
 a.verify=function(k){
  var c=_p.cityI.setValue();
  if(!k || k&& ((c in ZIP)&&typeof ZIP[c]=='object'&&!(k in ZIP[c])) || !c_d[c])return 1;
 };

 a=_p.addressI;
 a.maxList=40,
 a.onList=function(l,i){
  return [l[i]||i,l instanceof Array?l[i]:i,_p.addressI.setValue()];
 };
 a.onSelect=function(l,i){
  var c=i.indexOf(',');
  _p.zipI.setValue(i.slice(0,c));
  _p.zipI.triggerToInput(0);
  return i.slice(c+1);
 };
 a.setSearch('includeKey');
 a.setProperty('onfocus',function(){
  var c=_p.cityI.setValue(),d=_p.districtI.setValue();
  if(c && (c in ZIP) && typeof ZIP[c]=='object' && (d in ZIP[c])){
   _p.zipI.triggerToInput(0);
   _p.cityI.triggerToInput(0);
   _p.districtI.triggerToInput(0);
   //sl('addressI.onfocus: '+(_t.useZIP5?'Use':'Do not use')+' zip5.');
   if(_p.addressI.doFunc)_p.addressI.doFunc=0;
   else if(_t.useZIP5)
    _p.addressI.setAllList(getZIP5(ZIP[c][d])),
    _p.addressI.onInput();
  }
 });
 a.verify=function(k){
  if(!k||k.length<5)return 1;
 };

 _t.setNamePrefix(prefix);

 _t.loaded=1;

},_=function(){initI.apply(this,arguments);},


//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
_p='_'+(Math.random()+'').replace(/\./,''),
//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
pv=function(i,d,k){var V,K=_p('k');return arguments.callee.caller===_p('i')?(V=_p(i[K]=_p()),V.O=i,V.L={}):(K in i)&&(V=_p(i[K]))&&i===V.O?d?(_p(i[K],1),delete i[K]):V.L:{};};

//	class destructor	---------------------------
/*
please call at last (e.g., window.unload)

usage:
classT=classT.destroy();
or if you has something more to do:
classT.destroy()&&classT=null;
*/

_.destroy=function(){for(var i=0;i<instanceL.length;i++)instanceL[i].destroy();_p();};

//	(instance private handle, continue)
eval('_p=(function(){var '+_p+'={a:pv,d:_.destroy,c:0,k:"+pv+'+Math.random()+'",i:initI};return function(i,d){var f=arguments.callee.caller;if(f==='+_p+'.a){if(!d)return i in '+_p+'?'+_p+'[i]:('+_p+'[i='+_p+'.c++]={},i);'+_p+'[i]={};}if(f==='+_p+'.d)'+_p+'={};}})();');
_p.toString=function(){return'';};


//	class public interface	---------------------------


//	預設 className
_.classNameSet={
 clearMark:'adr_clear',
 zipI:'adr_zip',
 addressI:'adr_address'
};


//	read 郵局提供之 CSV file。
//	這應該在所有 new 之前先作！
_.readData=function(url){
 if(!url)return;
 path=url.match(/^(.+\/)?([^\/]+)$/)[1];

 var data,i=0,a,b;
 try{
  a=library_namespace.get_file(url);
 }catch(e){
  //library_namespace.log('readData: <em>Can not get data: ['+url+']!</em> '+e.message);
  return;
 }
 //library_namespace.log('readData: Get data from ['+url+']:<br/>['+a.length+'] '+a.slice(0,200)+'..');
 if(!a||!(data=parse_CSV(a))||data.length<9||data[0].length<3){
  //sl('readData: Can not read data from ['+url+']!');
  return;
 }

 //	reset
 ZIP={},ZIP5=[],ZIP_to_cd={},ZIP5_to_town={},ENG={},c_d={},cityL={},districtL={};

 //sl('readData: Get '+data.length+' data from ['+url+']:<br/>['+data[0]+']<br/>['+data[1]+']<br/>['+data[2]+']');
 for(;i<data.length;i++){
  a=data[i][1].match(/^([^縣市島]{1,3}[縣市島])(.{2,5})$/);
  if(!a){
   //sl('Can not parse: ['+data[i][1]+']');//continue;
   cityL[a=data[i][1]]='';
   //districtL[a]='';
   ZIP_to_cd[ZIP[a]=data[i][0]]=[a],ENG[a]=data[i][2];
  }else{
   b=a[2],a=a[1];
   if(!(b in districtL))districtL[b]={};
   districtL[b][a]=1;	//	districtL[_district_name_]={_city_name_:1}
/*
   if(b in districtL)
    sl('readData: duplicate district: '+a+','+b),
    districtL[b+','+a]=[b,a];
   else
    //sl('readData: set district: '+a+','+b),
    districtL[b]=[b,a];
*/
   if(a in c_d)c_d[a].push(b);else c_d[a]=[b];

   if(!(a in ZIP))ZIP[a]={},ENG[a]={};
   ZIP_to_cd[ZIP[a][b]=data[i][0]]=[a,b],ENG[a][b]=data[i][2];

   //sl('ZIP['+a+']['+b+']=['+data[i][0]+']');
  }
 }

 a=cityL,cityL={};
 for(i in c_d)c_d[i].sort(),cityL[i]=i+' ('+c_d[i].length+')';	//	cityL[_city_name_]='_city_name_ (districts number)'
 for(i in a)cityL[i]=a[i];	//	將不常用（沒district）的放後面
};

//	class constructor	---------------------------

/*	預先讀取同目錄下的 county.txt
這些檔案由臺灣郵政全球資訊網下載專區取得。

*/
_.readData(path+'zip/county.txt');


_.prototype={
//	應該盡量把東西放在 class，instance少一點…？

//	instance public interface	-------------------

//	使用 ZIP5
useZIP5:1,

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//nameSet:{},

setNamePrefix:function(p){
 var _t=this,_p=pv(_t);
 if(typeof p!='undefined'){
  _p.fullAdr.name=_p.namePrefix=p;
  _p.zipI.setName(p+_t.nameSet.zip);
  _p.cityI.setName(p+_t.nameSet.city);
  _p.districtI.setName(p+_t.nameSet.district);
  _p.addressI.setName(p+_t.nameSet.address);
 }
 return _p.namePrefix;
},

setAddress:function(adr){
 var _p=pv(this),r;
 if(typeof adr=='object')
  _p.zipI.setValue(adr.zip),_p.cityI.setValue(adr.city),_p.districtI.setValue(adr.district),_p.addressI.setValue(adr.address);

 r={zip:_p.zipI.setValue(),city:_p.cityI.setValue(),district:_p.districtI.setValue(),address:_p.addressI.setValue()};
 r.fullAddress=(r.zip?'['+r.zip+'] ':'')+r.city+r.district+r.address;//'台灣'+
 return r;
},


//	use instance.submit() to check
submit : function(n) {
	var _t = this, _p = pv(_t);
	if (!_t.loaded)
		return true;

	if (typeof n != 'undefined') {
		_p.zipI.setName('');
		_p.cityI.setName('');
		_p.districtI.setName('');
		_p.addressI.setName('');
		if (n)
			_p.fullAdr.name = n;
	}

	_p.fullAdr.value = _t.setAddress().fullAddress;

	return !_p.zipI.verify(_p.zipI.setValue())
			&& !_p.cityI.verify(_p.cityI.setValue())
			&& !_p.districtI.verify(_p.districtI.setValue())
			&& !_p.addressI.verify(_p.addressI.setValue());
},


//	增加功能 button
addFunc:function(t,f){	//	(text, function)
 addFunc.apply(this,arguments);
},


//	(focus on what <input>, focus or blur)
focus:function(i,f){
 var j,_p=pv(this),alias={a:'addressI',z:'zipI',d:'districtI',c:'cityI'};
 if(i in alias)i=alias[i];else if(i+'I' in _p)i+='I';
 if(i in _p)
  _p[i].focus(f);
 else if(!i)	//	to all
  for(j in alias)_p[alias[j]].focus(f);
},


//	instance destructor	---------------------------
/*
usage:
instance=instance.destroy();
or if you has something more to do:
instance.destroy()&&instance=null;
*/
destroy:function(){
 var _t=this,_p=pv(_t);
 _p.zipI.destroy();
 _p.cityI.destroy();
 _p.districtI.destroy();
 _p.addressI.destroy();
 pv(_t,1);
}
};	//	_.prototype=

return _;
})();	//	(function(){

//	===================================================




return (
	CeL.net.form.address
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL bank account function
 * @fileoverview
 * 本檔案包含了輸入 bank account 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.form.bank_account';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.form.bank_account
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'net.form.select_input.,data.CSV.parse_CSV')))
	return;

/**
 * null module constructor
 * @class	輸入 bank account 的 functions
 */
CeL.net.form.bank_account
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.net.form.bank_account
.prototype = {
};


//	===================================================
/*
	used for bank account & bank id input form

TODO:


HISTORY:
2008/7/26 14:46:14	create
*/

_.TW=

(function(){

var


//	class private	-----------------------------------

//	存放 data 的 path
path = library_namespace.get_module_path(module_name, ''),


// 總單位/支單位帳號長度
mainLen=3,
branchLen=7,

/*

//	and, select_input 用
bank[Number(id)]={
	id:'\d'			//	通匯金融代號, 郵局或是銀行代碼
	name:'',		//	總單位名稱
	digital:\d || [\d,..],	//	帳號長度之描述
	maxD:\d,		//	max 長度
	minD:\d,		//	min 長度
	branch:{		//	分行
		通匯金融代號:支單位名稱,..
	}
}

*/

bank=[],
bankNow,bankIdNow,

getBankID=function(id,force){
 var o=bank[id=Math.floor(id)],l,d;
 if(!o)return;
 if(!force&&('branch' in o))return o.branch;

 //sl('getBankID: load ['+path+'id'+(id>99?'':id>9?'0':'00')+id+'.csv]');
 try{
  d=library_namespace.get_file(path+'id'+(id>99?'':id>9?'0':'00')+id+'.csv');
 }catch(e){
  //library_namespace.log('getBankID: <em>Can not get data: ['+url+']!</em> '+e.message);
  return;
 }
 if(!d||!(d=parse_CSV(d))||!d.length){
  //sl('getBankID: Can not read data from ['+url+']!');
  return;
 }

 
 for(i=0,l=o.branch={};i<d.length;i++)
  if(!isNaN(d[i][0]))
   //sl('getBankID: branch ['+d[i][0]+'] '+d[i][1]),
   l[d[i][0]]=d[i][1];

 return l;
},

//	將帳號長度之描述轉成帳號長度， return max digital
getDigital=function(id){
 var o=bank[id=Math.floor(id)],d,a,i=0,m,max=0,min=Number.MAX_VALUE;
 if(!o)return;	//	error
 if('maxD' in o)return o.maxD;	//	作過了

 //sl('getDigital: get id '+id+', parse ['+o.digital+']');
 d=o.digital,a=d.replace(/\n/g,'').match(/\d{1,2}位/g);

 if(a)	//	有可能資料錯誤，無法取得。
  for(d=[];i<a.length;i++)
   if(m=a[i].match(/\d{1,2}/)){
    d.push(m=Math.floor(m[0]));
    if(min>m)min=m;
    if(max<m)max=m;
   }

 if(!d.length)d=max=min=0;
 else if(d.length==1)d=max=min=d[0];

 //sl('getDigital: '+o.name+' '+min+'-'+max);
 o.maxD=max,o.minD=min;

 return max;
},

//	模擬 inherits
_=library_namespace.inherits('net.form.select_input',function(){
	var _t=this,i;
	if(!_t.loaded)return;

	_t.setClassName('bank_account_input');
	_t.setSearch(function(i,k){
	 //if(k)sl('compare function: ['+k+'], ['+(typeof i)+']'+i);
	 return typeof i=='object'?
	  //	bank
	  i.id.slice(0,k.length)==k||i.name.indexOf(k)!=-1
	  //	bank.branch
	  :i.length<k.length?0/*i==k.slice(0,i.length)*/:i.slice(0,k.length)==k;
	});
	_t.setInputType(1);
	i=_t.onInput;
	(_t.onInput=function(k){
	 //sl('onInput: input ['+k+'] - '+k.slice(0,3))
	 if(_t.inputAs!=2&&k&&k.length>=mainLen){
	  var id=Math.floor(k.slice(0,mainLen)),l;
	  if((bank[id])&&(l=getBankID(id))&&l!==_t.setAllList())
	   bankNow=bank[bankIdNow=id].name,_t.setInputType(0,id),_t.setAllList(l);
	 }else if(bank!==_t.setAllList())bankNow=0,bankIdNow=-1,_t.setInputType(0,-1),_t.setAllList(bank);
	 //	執行主要功能
	 i.apply(_t,arguments);
	 //	若達到標標準，則 triggerToInput。
	 if(!_t.clickNow&&k&&(_t.inputAs==2&&k.length==mainLen||_t.inputAs==3&&k.length==branchLen||k.length==getDigital(bankIdNow)))
	  _t.triggerToInput(0);
	 else _t.focus();
	})();

	//	show arrow
	_t.triggerToInput(1);
	_t.focus(0);
}),
_p=_.prototype;


//	class public interface	---------------------------


//	read bank id data
//	這應該在所有 new 之前先作！
_.readData=function(url){
 if(!url)return;
 path=url.match(/^(.+\/)?([^\/]+)$/)[1];

 var data,i=0,a,b;
 try{
  a=library_namespace.get_file(url);
 }catch(e){
  //library_namespace.log('readData: <em>Can not get data: ['+url+']!</em> '+e.message);
  return;
 }
 if(!a||!(data=parse_CSV(a))||data.length<9||data[0].length<3){
  //sl('readData: Can not read data from ['+url+']!');
  return;
 }

 //	reset
 bank=[];

 for(;i<data.length;i++){
  a=data[i];
  bank[Math.floor(a[0])]={
	id:a[0],	//	通匯金融代號
	name:a[1],	//	總單位名稱
	digital:a[2]	//	帳號長度之描述
  };
 }

};


//	class constructor	---------------------------

_.readData(path+'bank/id.csv');


//	不再使繼承
delete _.clone;


//	instance public interface	-------------------

//	1: all, 2: 到總單位, 3: 到支單位
_p.setInputType=function(t,i){	//	(type,id)
 var _t=this;
 if(t)_t.inputAs=t,i=i||-1;
 t=_t.inputAs;
 if(i)_t.setMaxLength(t==2?mainLen:t==3?branchLen:i<0?20:getDigital(i)?mainLen+getDigital(i):20);	//	mainLen+getDigital(i): 看來似乎必要這麼做
 return t;
};

//	input: (list, index), return [value, title[, key=title||value]]
_p.onList=function(l,i){
 if(bankNow)return [l[i],i+' '+bankNow];
 else if(i in l)return [l[i].name,l[i].id];
};

//	input: (list, index), return value to set as input key
_p.onSelect=function(l,i){
 return bankNow?i:l[i].id;
};

_p.verify=function(k){
 //sl('verify ['+k+']');
 var m;
 if(!k&&k!==0)return 1;
 if(!/^\d+$/.test(k))return 2;
 if(k.length>=mainLen)
  if(!bank[m=Math.floor(k.slice(0,mainLen))] || k.length>=branchLen&&bank[m].branch&&!(k.slice(0,branchLen) in bank[m].branch))
   return 1;
};

return _;
})();	//	(function(){

//	===================================================





return (
	CeL.net.form.bank_account
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL 輸入教育程度的 function
 * @fileoverview
 * 本檔案包含了輸入教育程度的 functions。
 * @since	2010/1/7 23:50:43
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.form.education';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.form.education
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {


/**
 * null module constructor
 * @class	輸入教育程度的 functions
 * @example
 * var education_form = new CeL.education.TW('education');
 */
CeL.net.form.education
= function() {
	//	null module constructor
};


//	===================================================

_.TW=

(function(){

var


//	class private	-----------------------------------


//	模擬 inherits
_ = library_namespace.inherits('net.form.select_input', function() {
	var _t = this;
	if (!_t.loaded)
		return;

	_t.setClassName('education_input');
	_t.setSearch('includeKeyWC');
	_t.setAllList(_t.default_list);

	// show arrow
	_t.triggerToInput(1);
	_t.focus(0);
});


//	class public interface	---------------------------




//	instance public interface	-------------------

//	最高教育程度	http://wwwc.moex.gov.tw/ct.asp?xItem=250&CtNode=1054
_.prototype.default_list =
	//請填寫
	'博士（含）以上,碩士/研究所,學士/大學院校,副學士/專科,高中/高職,國中/國民中學,國小（含）以下,其他：請說明'
	.split(',');


return _;
})();	//	(function(){

//	===================================================





return (
	CeL.net.form.education
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL form function
 * @fileoverview
 * 本檔案包含了 form 的 functions。
 * @since	
 */

/*
TODO:
HTML 5 <datalist> Tag

set focus/blue image

http://www.erichynds.com/examples/jquery-multiselect/examples.htm

http://www.google.com.tw/dictionary
鍵盤選擇時同時改變值
*/

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.form.select_input';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.net.form.select_input
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'net.web.get_node_position')))
	return;

library_namespace.include_module_resource('select_input.css',module_name);

/**
 * 簡易型 net.web.XML_node
 * @param tag	p.appendChild tag
 * @param p	parent node
 * @param t	text
 * @param classN	className
 * @return
 */
var create_DO = function(tag, p, t, classN) {
	var _e;
	if (t && (typeof t != 'object' || (t instanceof Object)))
		t = document.createTextNode(t + '');
	if (typeof tag == 'object') {
		_e = tag;
	} else if (tag) {
		_e = document.createElement(tag);
		if (classN)
			_e.className = classN;
		if (t)
			_e.appendChild(t);
	} else if (t)
		_e = t;
	if (p && _e)
		p.appendChild(_e);
	return _e;
};


/**
 * get scrollbar height
 * @return
 * @since	2008/9/3 23:31:21
 * @see
 * http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
 * lazy evaluation
 * http://peter.michaux.ca/articles/lazy-function-definition-pattern
 */
function scrollbar_width() {
	var _f = arguments.callee;
	if (!_f.w) {
		var w, p = create_DO('div', document.body), c = create_DO('div', p, ' '), s = p.style;
		s.width = s.height = '80px';
		// 有時沒這行才出得來
		// c.style.width='100%';
		s.overflow = 'hidden';
		w = c.offsetWidth;
		s.overflow = 'scroll';
		_f.w = w - c.offsetWidth;
		// sl('scrollbar_width: '+w+'-'+c.offsetWidth+'='+_f.w);
		document.body.removeChild(p);
	}
	return _f.w;
}


/**
 * scroll 到可以看到 object
 * TODO:
 * 考慮可能沒 scrollbar
 * 包括橫向
 * @param o	object
 * @param [p]	parentNode to scroll
 * @return
 * @since	2008/9/3 23:31:29
 */
function scroll_to_show(o, p) {
	if (!p) {
		p = o;
		while ((p = p.parentNode) && p.offsetHeight == p.scrollHeight)
			;
	}
	//sl('scroll_to_show: '+p.scrollTop+', '+p.scrollHeight+', '+p.offsetHeight+', '+o.offsetTop);

	var s, a;
	if (a = o.offsetTop, a < p.scrollTop)
		s = a;
	else if (a = o.offsetTop + o.offsetHeight - p.offsetHeight
			+ scrollbar_width(), a > p.scrollTop)
		if (s = a, a = o.offsetTop, a < s)
			s = a;

	if (!isNaN(s))
		p.scrollTop = s;
}


/*

{
	title: '',
	name: '',
	container: 'id' | obj,
	list: [] | {} | {group1:{}, group2:[],.. },
	default: '' | [],
	type: 'select' | 'radio' | 'checkbox',
}

return <select>


TODO:
複選 <select>
<radio>
<checkbox>
+<label>
autocomplete: 假如所有備取 list 都有一樣的 prefix，則自動完成。
	把後面的用反白自動完成。

在 list 上下安排三角，onmouseover 即可自動滾動。

color panel

http://www.itlearner.com/code/js_ref/choi3.htm
selectName.options[i]=new Options("option_value","option_Text", defaultSelected, selected);
*/

/**
 * container object, list
 * @param o
 * @param l
 * @return
 */
function menu_creater(o, l) {

};



//	===================================================

var

//	class private	-----------------------------------


/*	可紀錄的 set class name，不過對大多數人來說，更常用的是 instance.setClassName

usage:
(item[, obj])		set obj to className item, return real className that setted
(0,'prefix')	set prefix & 重設（全部重跑）
*/
setClassName=function(i,o,noRec){	//	(0, prefix) or (item, object)
 var _t=this,s=_.classNameSet;
 if(!_t.settedClass)_t.settedClass=[];

 if(!o||typeof o==='object'){
  //	設定並回傳 className
  //sl('setClassName: test '+'class_'+i+': '+('class_'+i in _t?'<em>YES</em>':'none'));
  s=[	i in s?
		s[i].charAt(0)==='~'?s.prefix+s[i].slice(1):
		s[i]:
	''
  ];
  if('class_'+i in _t)
   if(i==='error'||i==='warning')s.unshift(_t['class_'+i]);
   else s.push(_t['class_'+i]);
  s=s.join(' ');
  //sl('setClassName: set '+o+(s?' to ['+s+']':', <em>There is no ['+i+'] in classNameSet or instance set.</em>'));
  if(o && (o.className=s,!noRec))
   _t.settedClass.push(s,o);
  return s;
 }

 s.prefix=o;
 o=_t.settedClass;
 //	重設（全部重跑）
 for(var i=0;i<o.length;i++)
  _f.call(_t,o[0],o[1],1);
},

funcButton=function(_t,t,f,title){	//	add text t, function f to instance _t
 var _p=pv(_t),o=create_DO('span',_p.listO,'['),b;
 setClassName.call(_t,'functionB',o);
 b=create_DO('span',o,t);
 setClassName.call(_t,'functionT',b);
 b.title=title,b.onclick=f;
 create_DO(0,o,']');
 return b;
},

//	簡易型
removeAllChild=function(o){
 o.innerHTML='';
 return o;
},

//	show/hide list
showList=function(show){	//	():get, 0:hide, 1:show
 var _t=this,_p=pv(_t),o=_p.listO,s,c=0;

 if(!o)return;
 s=o.style;
 if(show){
  c=get_node_position(_p.inputO);
  s.top=c[1]+c[3]+2+'px';
  s.left=c[0]+'px';

  s.width=_p.inputO.offsetWidth+'px';
  s.height='';	//	reset
  c=s.display='block';
  if(_t.maxListHeight&&o.offsetHeight>_t.maxListHeight)
   s.height=_t.maxListHeight+'px';
 }else if(typeof show!='undefined')
  c=s.display='none';

 if(c)
  create_DO(0,removeAllChild(_p.arrowO),_.textSet[c!='none'?'hideList':'showList']);
 else c=s.display;

 return c!='none';
},


/*	準備選擇清單的某一項
TODO:
自動完成
到最後若可能自動轉到全部
→
*/
cK=0,	//	control key pressed
readyTo=function(e,o){
 if(!e)e=event;
 var _t=this,_p=pv(_t),c,gI=function(o){
  return o&&/*(can_use_special_attribute?o.getAttribute("sIndex"):o.sIndex)*/o.sIndex;
 };
 //sl('readyTo: '+e.type+', key: '+(e.keyCode||e.which||e.charCode)+', _p.listA: '+(_p.listA&&_p.listA.length));

 if(!_p.listA||!_p.listA.length)return;

 if(e.type==='mouseover'||e.type==='mouseout'){
  if(_p.readyItem)setClassName.call(_t,'item',_p.readyItem,0);
  if(e.type==='mouseover')c='item_select',_p.readyItem=o;
  else if(c='item',_p.readyItem===o)_p.readyItem=0;
 //	需更改 _p.inputO.onkeyup 以防止重新 list!!
 }else if(c=e.keyCode||e.which||e.charCode,c==13){
  if(_p.readyItem){
   //sl('readyTo: 以鍵盤選擇: '+_p.readyItem.innerHTML);
   cK=c,_p.readyItem.onclick();	//	用 .click() 無效!
   return false;
  }else return;
 //	key input 用鍵盤控制上下	←↑→↓: 37~40
 }else if(c==38||c==40){
  cK=c;
  o=_p.readyItem;
  //sl('readyTo: 以鍵盤移至: '+(o&&(o.getAttribute("sIndex")+','+o.sIndex)));
  if(!o)o=_p.listA[c==40?0:_p.listA.length-1];
  else{
   //if(!o.getAttribute)throw 1;	IE 可用 getAttribute，FF 或許在 appendChild 之後屬性重設?，得用 o.sIndex
   c=gI(o)+(c==38?-1:1);
   if(c<0||c>=_p.listA.length)return;

   setClassName.call(_t,'item',o,0);
   o=_p.listA[c];
  }
  _p.readyItem=o;

  scroll_to_show(o,_p.listO);
  c='item_select';
 }else if(c==35||c==36){	//	35: End, 36: Home
  cK=c;
  if(o=_p.readyItem)setClassName.call(_t,'item',o,0);
  _p.readyItem=o=_p.listA[c==36?0:_p.listA.length-1];
  scroll_to_show(o,_p.listO);
  c='item_select';
 }else if(c==33||c==34){	//	33: PageUP, 34: PageDown
  cK=c;
  o=_p.readyItem;
  if(!o)return;
  setClassName.call(_t,'item',o,0);
  var i=gI(o),t;
  if(c==33){
   t=_p.listO.scrollTop-1;
   while(i&&_p.listA[i-1].offsetTop>t)i--;
  }else{
   t=_p.listO.scrollTop+_p.listO.offsetHeight-scrollbar_width();
   while(i<_p.listA.length-1&&_p.listA[i+1].offsetTop<t)i++;
  }
  //sl('readyTo: Page: '+i+', top: '+t+', scroll: '+_p.listO.scrollTop);
  if(i==gI(o))
   if(c==33){
    t-=_p.listO.offsetHeight;
    if(t<2)i=0;
    else while(i&&_p.listA[i-1].offsetTop>t)i--;
   }else{
    t+=_p.listO.offsetHeight;
    while(i<_p.listA.length-1&&_p.listA[i+1].offsetTop<t)i++;
   }
  //sl('readyTo: Page: '+i+', top: '+t+', height: '+_p.listO.offsetHeight);
  _p.readyItem=o=_p.listA[i];
  scroll_to_show(o,_p.listO);
  c='item_select';
 }else return;

 setClassName.call(_t,c,o,0);
 return false;
},

//can_use_special_attribute,

//	顯示清單的工具函數
setList=function(l,force,limit,f){
 var _t=this,_p=pv(_t),i,c=0,k,o;
 if(isNaN(limit))limit=isNaN(_t.maxList)?_.maxList:_t.maxList||Number.MAX_VALUE;
 if(!f)f=function(l,i){
  var a=_t.onList(l,i),o;
  if(!a)return;
  o=create_DO('div',0,a[0]);
  setClassName.call(_t,'item',o);
  o.title=a[1];
  k=a[2]||a[1];
  o.onmouseover=o.onmouseout=function(e){readyTo.call(_t,e,o);};
  o.onclick=function(){var v=_t.onSelect(l,i);_t.setValue(v);_t.onInput(v);};

  //	這邊本來放在下面 for 的地方
  c++,_p.listO.appendChild(o);
  //if(!can_use_special_attribute){o.setAttribute("sIndex",1);can_use_special_attribute=o.getAttribute("sIndex")?1:-1;}
  //if(can_use_special_attribute==1)o.setAttribute("sIndex",_p.listA.length);else o.sIndex=_p.listA.length;
  o.sIndex=_p.listA.length;//o.setAttribute("sIndex",o.sIndex=_p.listA.length);
  _p.listA.push(o);

  return o;
 };

 //_t.showList(0);

 _p.listO=removeAllChild(_p.listO),_p.listA=[],_p.readyItem=0;
 if(l instanceof Array){
  for(i=0;i<l.length&&c<limit;i++)
   f(l,i);
 }else
  for(i in l)
   if(c<limit){
    f(l,i);
   }else break;

 //sl('setList: list '+c+' items, key '+k+'=?'+_t.setValue());
 if(c==1&&_t.setValue()==k)c=0;	//	僅有一個且與 key 相同
 if(!force&&!c)return;	//	無 list

 //	add function
 if(c!=_t.allListCount)funcButton(_t,_.textSet.allBtn,function(){_t.doFunc=1;_t.focus();_t.setList(_t.setAllList(),1,Number.MAX_VALUE);},'顯示全部 '+_t.allListCount+' 列表。');
 if(_t.setValue())funcButton(_t,_.textSet.clearBtn,function(){_t.doFunc=2;_t.focus();_t.onInput(_t.setValue(''));},'清除輸入內容，重新列表。');
 funcButton(_t,_.textSet.closeBtn,function(){_t.doFunc=3;_t.showList(0);},'close menu \n關閉列表');

 showList.call(_t,1);
 return _t.listCount=c;
},

//	return verify 之後的 key(<input>) 值
do_verify=function(k){
 var _t=this,c=_t.verify(k||_t.setValue());
 //sl('do_verify: input status: '+(c==1?'warning':c==2?'error':'OK'));

 if(typeof c==='string')_t.setValue(k=c);	//	可以設定 key 值！
 else setClassName.call(_t,c==1?'warning':c==2?'error':'input',pv(_t).inputO,1);

 return k;
},

//	簡易設定常用的 onInput 型式
searchInList=function(f,o){	//	o: 傳入 (list, index, key)
 var _t=this;
 if(typeof f==='string'&&(f in _.searchFunctionSet))f=_.searchFunctionSet[f];

 //	因為允許傳入 list，所以不能在這邊用 _t.setAllList() 判別函數，而得要寫一個泛用的。
 return _t.onInput=function(k,L,force){
  //sl('searchInList, onInput: search ['+k+'] use '+f);

  if(!L)L=_t.setAllList();
  k=do_verify.call(_t,k||'');

  var l,i;

  //sl('searchInList: search '+(L instanceof Array?'array':'object'));
  if(L instanceof Array){
   l=[];//new L.constructor();
   for(i=0;i<L.length;i++)
    if(o?f(L,i,k):L[i]&&f(L[i],k))l.push(L[i]);	//	search value
  }else{
   l={};
   for(i in L)
    if(o?f(L,i,k):i&&f(i,k)||L[i]&&f(L[i],k))l[i]=L[i];	//	search key+value
  }
  _t.setList(l,force);
 };

},


//	切換 input/inputted span
triggerToInput=function(y){	//	切換至 input or not
 var _t=this,_p=pv(_t);
 if(y||typeof y==='undefined'){
  //	to input
  _p.inputtedO.style.display='none';
  if(_t.allListCount)_p.arrowO.style.display='inline';
  _p.inputO.style.display='inline';
  return 1;
 }else{
  //	to inputted span
  _t.showList(0);
  _t.setInputted();
  _p.arrowO.style.display=_p.inputO.style.display='none';
  _p.inputtedO.style.display='inline';
 }
},


/*	配置元件

本函數會配置/增加:
<div>		.container
	<input>	.inputO
	<span>	.inputtedO
	<span>	.arrowO
	<div>	.listO

arguments:
<input> 會被當作 inputO 主元件
<select> 會被當作選項
others: container
*/
dispose=function(o){
 var _t=this,_p=pv(_t),t;

 if(typeof o!=='object')
  o=document.getElementById(o);

 if(!o || (o.tagName.toLowerCase() in {hr:1,br:1}))return;	//	** 這邊應該檢查 o 是不是 <hr/> 等不能加 child 的！

 //sl(('dispose: use <'+o.tagName+'>: '+o.innerHTML).replace(/</g,'&lt;'));

 //	TODO: 這邊應該有一個更完善的刪除策略
 if(_t.loaded){
  t=_p.container;
  //	不必多做功，已經達到所需配置了。
  if(t===o.parentNode)return;
  for(var i=0,e='inputO,inputtedO,arrowO,listO'.split(',');i<e.length;i++)
   //sl('dispose: removeChild '+e[i]),
   _p[e[i]].parentNode.removeChild(_p[e[i]]);//t.removeChild(_p[e[i]]);
  if(!t.childNodes.length)t.parentNode.removeChild(t);
 }


 //	依照各種不同的傳入 object 作出應對
 t=o.tagName.toLowerCase();

 if(t==='input'){
  o.parentNode.insertBefore(
	t=_p.container=create_DO('span'),
	_p.inputO=o
	);
  setClassName.call(_t,'container',t);

  if(!o.className)setClassName.call(_t,'input',o);

  t.appendChild(o.parentNode.removeChild(o));

  o=t;

 }else if(t==='select'){
  o.parentNode.insertBefore(t=_p.container=create_DO('span'),o);

  _p.inputO=create_DO('input',t);
  setClassName.call(_t,'input',_p.inputO);
  _p.inputO.name=o.name;
  if(o.selectedIndex>=0)_p.inputO.value=o.options[o.selectedIndex].value;

  var l={},opt=o.options,i=0;
  for(;i<opt.length;i++)
   l[opt[i].value||opt[i].innerHTML]=opt[i].innerHTML;

  //	list setting
  _t.setAllList(l);

  o.parentNode.removeChild(removeAllChild(o));

  o=t;

 }else{
  _p.container=o;	//	容器
  if(!o.className)setClassName.call(_t,'container',o);

  _p.inputO=create_DO('input',o);
  setClassName.call(_t,'input',_p.inputO);
 }


 //	補足其他的設定
 _p.inputO.setAttribute("autocomplete","off");

 _p.inputtedO=create_DO('span',o);
 setClassName.call(_t,'inputted',_p.inputtedO);
 _p.inputtedO.style.display='none';

 _p.inputtedO.onclick=function(){
  _t.clickNow=1;
  _t.triggerToInput();
  _p.inputO.focus();
  _t.clickNow=0;
 };

 (_p.arrowO=create_DO('span',o,_.textSet.showList))
  .title=_.textSet.arrowTitle;
 setClassName.call(_t,'arrow',_p.arrowO);

 _p.listO=create_DO('div',o);
 _p.arrowO.onmouseover=_p.listO.onmouseover=function(){_t.clickNow=1;};
 _p.arrowO.onmouseout=_p.listO.onmouseout=function(){_t.clickNow=0;};
 setClassName.call(_t,'list',_p.listO);
 _t.showList(0);


 // event setting
 //_p.inputO.onmouseover=
 _p.inputO.onkeydown=function(e){readyTo.call(_t,e);};
 _p.inputO.onmouseup=_p.inputO.onkeyup=_p.inputO.ondragend=function(e){
  if(!e)e=event;
  var c=e.keyCode||e.which||e.charCode;
  //sl('up: '+e.type+', key: '+c+', _p.listA: '+(_p.listA&&_p.listA.length));
  if(cK&&cK==c){cK=0;return false;}
  //	Esc
  if(c==27){_t.showList(0);return false;}
  _t.clickNow=1;_t.onInput(_t.setValue());
 };
 _p.inputO.onmouseout=function(){_t.clickNow=0;};
 if(_p.inputO.addEventListener)_p.inputO.addEventListener('dragdrop',_p.inputO.ondragend,false);
 //if(window.addEventListener)window.addEventListener('click',function(){_t.showList(0);},true);
 //addListener(0,'click',function(){sl('close..');_t.showList(0);sl('close done.');})
 _p.inputO.onblur=function(){
  //if(_t.verify(_t.setValue())==2){alert('Wrong input!');return false;}	//	這在 Firefox 似乎沒啥效果..
/*	設定這項在按 _p.arrowO 的時候會出問題，所以建議在其他地方自訂。
  if(_t.setValue() && (_t.setValue() in _t.setAllList()))
   _t.triggerToInput(0);
*/
  //	TODO: 假如以鍵盤離開，應該也 showList(0);
  //library_namespace.debug('clickNow='+_t.clickNow,1,'_p.inputO.onblur');
  if(_t.clickNow)_t.clickNow=0;
  else _t.showList(0);
 };

 //	show/hide by press arrow
 _p.arrowO.onclick=function(){
  //sl('arrowO.onclick start');
  _t.clickNow=1;
  if(_t.showList())
   //	正在顯示就把他關起來
   _t.showList(0);
  else
   //	沒在顯示就把他開起來: setValue 設定完 list，onInput 模擬 key-down
   _t.onInput(_t.setValue(),0,1);
  _t.clickNow=0;
  //sl('arrowO.onclick end');
 };
 // ondblclick: double click
 //_p.inputO.ondblclick=function(){_t.onInput(_p.inputO.value,0,1);};


 _t.loaded=1;	//	isLoaded

},

//	instance constructor	---------------------------
instanceL=[],
initI=function(o,l,s){	//	(HTML object, list: Array or Object)
 var _t=this,_p;
 // objects setting
 if(typeof o!='object')
  //sl('Use object ['+o+']'),
  o=document.getElementById(o);

 _p=pv(_t);	//	also do initial
 instanceL.push(_t);	//	for destructor

  if(o)
   dispose.call(this,o);
/*
 else{
  //throw new Error(1,'Can not get document object'+(o?' ['+o+']':'')+'!');
  return;
 }
*/

 //	list setting
 if(l&&!_t.allListCount)_t.setAllList(l);

 if(_p.arrowO)
  _p.arrowO.style.display=_t.allListCount?'inline':'none';	//	無 list 的話先不顯示，等有 list 再說。

 //	setup default inputted value
 _t.dInputted=_t.setValue;

 if(s)
  _t.setSearch(s);
 //return _t;
};


//===================================================

/*

_=this

TODO:
浮水印 background-image:url();


HISTORY:
2008/7/22 0:38:14	create
7/27 22:55:18	verify()
8/7 21:18:47	attach()
*/
/**
* 提供有選單的  input
* @class	form 的 functions
* @see
* http://dojocampus.org/explorer/#Dijit_Form%20Controls_Filtering%20Select_Basic
*/
CeL.net.form.select_input
=function(){initI.apply(this,arguments);load_arguments&&load_arguments.apply(this,arguments);},

//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
_p='_'+(Math.random()+'').replace(/\./,''),
//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
pv=function(i,d,k){var V,K=_p('k');return arguments.callee.caller===_p('i')?(V=_p(i[K]=_p()),V.O=i,V.L={}):(K in i)&&(V=_p(i[K]))&&i===V.O?d?(_p(i[K],1),delete i[K]):V.L:{};};

//	(for inherits)	不要 inherit 的把這段刪掉即可。
//(_.clone=arguments.callee).toString=function(){return '[class_template]';};


//	class destructor	---------------------------
/*
please call at last (e.g., window.unload)

usage:
classT=classT.destroy();
or if you has something more to do:
classT.destroy()&&classT=null;
*/

_.destroy=function(){for(var i=0;i<instanceL.length;i++)instanceL[i].destroy();_p();};

//	(instance private handle, continue)
eval('_p=(function(){var '+_p+'={a:pv,d:_.destroy,c:0,k:"+pv+'+Math.random()+'",i:initI};return function(i,d){var f=arguments.callee.caller;if(f==='+_p+'.a){if(!d)return i in '+_p+'?'+_p+'[i]:('+_p+'[i='+_p+'.c++]={},i);'+_p+'[i]={};}if(f==='+_p+'.d)'+_p+'={};}})();');
_p.toString=function(){return'';};


/*
//	測試是否可用自訂之屬性
var o=document.createElement('div');
o.setAttribute('testA',2);
can_use_special_attribute=o.getAttribute('testA');
sl('can_use_special_attribute: '+can_use_special_attribute);
*/

//	class public interface	---------------------------


//	預設清單最大顯示數
_.maxList=10;


//	searchInList 常用到的函數
_.searchFunctionSet={
 allTheSame:function(i,k){return (i+'')===k;},
 startWith:function(i,k){return (i+'').slice(0,k.length)===k;},
 //	不管大小寫 Whether the case
 startWithWC:function(i,k){return (i+'').slice(0,k.length).toLowerCase()===k.toLowerCase();},
 includeKey:function(i,k){return (i+'').toLowerCase().indexOf(k.toLowerCase())!==-1;},
 includeKeyWC:function(i,k){return (i+'').toLowerCase().indexOf((k+'').toLowerCase())!==-1;}
};


//	預設 className	前有 ~ 的會轉成 prefix
_.classNameSet={
 prefix:'si_',
 container:'~container',
 input:'~input',
 inputted:'~inputted',
 arrow:'~arrow',
 list:'~list',
 item:'~item',
 item_select:'~item_select',
 functionB:'~function',
 functionT:'~functionText',
 error:'~error',
 warning:'~warning'
};


//	預設顯示文字
_.textSet={
 showList:'▼',	//	4 way: [▴▸▾◂]
 hideList:'▲',
 arrowTitle:'trigger list \n切換顯示查詢列表',

 allBtn:'全部',
 clearBtn:'清除',
 closeBtn:'關閉'//'×'
};


_.prototype={
//	應該盡量把東西放在 class，instance少一點？

//	instance public interface	-------------------


/*	click 事件進行中
TODO:
用更好的方法取代
*/
clickNow:0,

//	instance 的 <input>,.. 之 className, override _.classNameSet.input,..
//class_input:'~',
//class_item:'~',
//..

//maxList:\d,

//	預設清單 height (px)
maxListHeight:200,


//	設定/取得所有可選的 list
setAllList:function(l){
 var _t=this,_p=pv(_t),i,c=0,s=_p.arrowO;
 _t.showList(0);
 if(typeof l==='object'){
  _p.list=l;
  if(l instanceof Array)c=_t.allListCount=l.length;	//	這不準，得用 onList 測試。
  else{for(i in l)c++;_t.allListCount=c;}
  //sl('setAllList: Get about '+_t.allListCount+' items.');
  if(s)
   if(s=s.style,!c)s.display='none';
   else if(_t.autoShowArrow)s.display='';
 }
 return _p.list;
},
//	自動於有 list 時 show arrow，無時 hide
autoShowArrow:0,

//	設定要顯現的 list，會回傳 list，需注意可能被更改！
setList:function(l){	//	key
 return setList.apply(this,arguments);
},

showList:function(show){
 return showList.apply(this,arguments);
},

/*
showArrow:function(show){
 var a=pv(this).arrowO.style;
 if(typeof show!='undefined')a.display=show?'':'none';
 return a.display;
},
*/

//	每次 input 就會被 call 一次。可用 instance.setSearch('includeKey') 簡易設定
onInput:function(k){	//	key
},

//	設定文字欄位的欄位驗證	return 1: warning, 2: error, string: 將輸入改為回傳值, else OK
//	另外可設定 onkeypress(){return true/false;} 來對每一次按鍵作 check。但這不能處理 paste。	http://irw.ncut.edu.tw/peterju/jscript.html#skill
verify:function(k){	//	key
},

//	input: (list, index), return [value, title[, key=title||value]]
onList:function(l,i){
 return [l[i]||i,l instanceof Array?l[i]:i];
},

//	input: (list, index), return value to set as input key
onSelect:function(l,i){
 return l instanceof Array?l[i]:i;
},

/*	searchInList 的減縮版
_.searchInList.call(_instance_,'includeKey');
eq
_instance_.setSearch('includeKey');
*/
setSearch:function(f){
 return searchInList.call(this,f);
},

setClassName:function(n){
 var t=this;
 if(n)t.class_input=t.class_error=t.class_warning=n;
 else if(typeof n!='undefined'){delete t.class_input;delete t.class_error;delete t.class_warning;}
 return setClassName.call(this,'input',pv(this).inputO);
},


setProperty:function(p,v){
 var i=pv(this).inputO;
 //sl('setProperty: '+p+'='+i[p]+'→'+v);
 if(typeof v!='undefined'&&v!=null)i[p]=v;
 return i[p];
},

//	set/get input value
setValue:function(v){
 if(typeof v!=='undefined')
  this.triggerToInput();
 //library_namespace.log('setValue: '+this.setProperty('value',v));
 v=this.setProperty('value',v);
 //library_namespace.log('setValue: '+v);
 if(arguments.callee.caller!==do_verify)
  //library_namespace.log('setValue: call do_verify('+v+'), list: ['+this.allListCount+']'+this.setAllList()),
  do_verify.call(this,v);
 return v;
},

//	set inputted value: 轉換成輸入過的 <span> 時，設定其之值。
setInputted:function(v){
 var _p=pv(this),i=_p.inputO;
 if(typeof v==='undefined')v=this.dInputted();	//	dInputted: default inputted value, =setValue
 create_DO(0,removeAllChild(_p.inputtedO),v);
 return v;
},

setMaxLength:function(l){
 //sl('setMaxLength: set length '+(l>0?l:null));
 return this.setProperty('maxLength',l>0?l:null);
},

setName:function(n){
 this.setProperty('id',n);
 return this.setProperty('name',n);
},

setTitle:function(t){
 if(t)pv(this).inputtedO.title=t;
 return this.setProperty('title',t||null);
},

//	切換 inputted span/input
triggerToInput:function(){
 return triggerToInput.apply(this,arguments);
},


/*
	for Unobtrusive JavaScript: 為未啟用JavaScript的情況提供替代方案。
	接上 <input> 或 <select>
*/
attach:function(o){	//	(input or select object)
 //sl('attach: '+o);
 //o.replaceNode(_p.inputO);
 o=dispose.call(this,o);
 this.setAllList(this.setAllList());
 return o;
},


//	(focus or blur, 不驅動 onfocus/onblur)
focus:function(f){	//	,noE
 var i=pv(this).inputO;
/*
 sl('focus: '+(f?'focus':'blur')+(noE?' and no event':''));
 if(f||typeof f==='undefined'){
  if(noE)noE=i.onfocus,i.onfocus=null;
  i.focus();
  //if(noE)i.onfocus=noE;
 }else{
  if(noE)noE=i.onblur,i.onblur=null;else this.showList(0);
  i.blur();
  //if(noE)i.onblur=noE;
 }
*/
 if(f||typeof f==='undefined')
  i.focus();
 else
  this.showList(0),
  i.blur();
},


//	instance destructor	---------------------------
/*
usage:
instance=instance.destroy();
or if you has something more to do:
instance.destroy()&&instance=null;
*/
destroy:function(){pv(this,1);}

};	//	_.prototype=


//	===================================================


//	prevent re-use. 防止再造 
//delete _.clone;


return (
	CeL.net.form.select_input
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'SVG';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * math test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.SVG = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();






/*	國際標準書號check	2004/11/22 20:
	http://zh.wikipedia.org/wiki/ISBN
	http://www.hkpl.gov.hk/tc_chi/books_reg/books_reg_n13d/books_reg_n13d.html
	http://www.isbn-international.org/converter/converter.html
	http://www.isbn.org/converterpub.asp
	輸入ISBN可test是否正確，若輸入不完全的（僅缺校驗碼check digit），則會輸出完全碼

	[3]國別語種識別代號：用以識別出版社所屬的國家、語文、地域等。香港的代號是「962」或「988」。
	[3]出版社識別代號：識別某一出版社。
	[3]書名版別代號：由出版社自行為新出版的書種或版本編配。
	[1]稽核數碼：用以核對書號是否正確。
	每部分由連字號或空位分隔。

常用check法： for 1652
checksum：1+6+5+2(mod 10)
質數除法：1652(mod prime)
modulus & weight(模數與權數)：ISBN等, 1*9+6*8+5*7+2*6(mod p)

*/
function checkISBN10(code){
 if(!/^\d{9}[\dxX]?$/.test(code=(''+code).replace(/[-\s]/g,'')))return;
 var i=0,c=0;	//	c:check digit
 for(;i<9;)c+=code.charAt(i++)*i;
 c%=11;if(c==10)c='X';
 return code.length==9?code+c:c==(i=code.charAt(9))||c=='X'&&i=='x';
}
//	2006/11/8 19:09
function checkISBN13(code){
 if(!/^\d{12,13}$/.test(code=(''+code).replace(/[-\s]/g,'')))return;
 var i=1,c=0;	//	c:check digit
 for(;i<12;i+=2)c+=Math.floor(code.charAt(i));
 for(c*=3,i=0;i<12;i+=2)c+=Math.floor(code.charAt(i));
 c=(220-c)%10;	//	220:大於(1*6+3*6)，%10==0即可。
 return code.length==12?code+c:c==code.charAt(12);
}

/*	臺灣地區國民身份證代字 Identity Card No. check	2004/11/22 22:31
	輸入身份證號碼可test是否正確，若輸入不完全的（僅缺檢查碼），則會輸出完全碼
var checkTWIDC='ABCDEFGHJKLMNPQRSTUVXYWZIO',checkTWIDCity='臺北市,臺中市,基隆市,臺南市,高雄市,臺北縣,宜蘭縣,桃園縣,新竹縣,苗栗縣,臺中縣,南投縣,彰化縣,雲林縣,嘉義縣,臺南縣,高雄縣,屏東縣,花蓮縣,臺東縣,澎湖縣,陽明山,,,嘉義市,新竹市'.split(',');	//	checkTWIDCity:代號表
*/
function checkTWID(ID,city,sex){	//	提供city/sex時ID只需要輸入流水號
 ID=(''+ID).replace(/ /g,'').toUpperCase();
 if(sex)ID=(sex=sex=='男'?1:sex=='女'?2:sex)+ID;
 var i,c;	//	check digit
 if(city&&(i=(c=checkTWIDCity.join(',')).indexOf(''+city))!=-1)
  i=c.slice(0,i),city=i.length-i.replace(/,/g,'').length;
 if(isNaN(city))city=checkTWIDC.indexOf(ID.charAt(0));else ID=checkTWIDC.charAt(city)+ID;
 if(!/^[A-Z][12]\d{7,8}$/.test(ID))return;
 if(!sex)sex=ID.charAt(1)==1?'男':'女';


/*	old:網路上流傳的演算法,slow
 c=''+(10+city),c=9*c.charAt(1)+parseInt(c.charAt(0));
 for(i=1;i<9;i++)c+=(9-i)*ID.charAt(i);
 c%=10;
 if(ID.length==10&&parseInt(ID.charAt(9))+c!=10)return null;
 if(ID.length==9)ID+=10-c;
*/

 for(i=1,c=city,c+=9-(c-c%10)/10;i<9;)c+=ID.charAt(i++)*i;
 c%=10;
 if(ID.length==10){if(ID.charAt(9)!=c)return null;}else if(ID.length==9)ID+=c;

 return [ID,checkTWIDCity[city],sex,c];
}
//	check only
function checkTWIDNo(ID){
 var i=1,c='ABCDEFGHJKLMNPQRSTUVXYWZIO'.indexOf(ID.charAt(0).toUpperCase());
 for(c+=9-(c-c%10)/10;i<9;)c+=ID.charAt(i++)*i;
 return c%10==ID.charAt(9);
}





/*	判斷キリ番等,counter專用	2004/8/26 20:14
	キリ番ゲッターidお名前(げっちゅ～)	home	mail	num	キリである理由	ip	date	msg	point(得點)
	キリ番 2000 まで、あと 265 です。ゲットは推定 5月31日(金) 9：17 頃です。	キリの良い番号（キリ番）・数字の揃った番号（ゾロ目）または語呂の良い番号（ゴロ番、面白く読める番号）を踏んだ方
	還可以加的：445533等
*/
var isLuckyNum_dDigit=3;	//	最低位數downmost digit>1
function isLuckyNum(num){	//	return luck kind
 if(!/^\d{1,20}$/.test(''+num)){alert();return;}
 num=parseInt(num,10);
 if(!num||num<1)return;
 num+='';
 if(!isLuckyNum_dDigit||isLuckyNum_dDigit<2)isLuckyNum_dDigit=3;	//	default
 //if(num.length==1)return '首十位';
 if(num.length<isLuckyNum_dDigit)return;
 if(num.match(new RegExp('(0{'+isLuckyNum_dDigit+',})$')))return '下'+RegExp.$1.length+'桁のキリ番';
 if(num.match(new RegExp('(9{'+isLuckyNum_dDigit+',})$')))return '前後賞：差一'+(1+RegExp.$1.length)+'位數整～';
 if(num.match(new RegExp('(0{'+(isLuckyNum_dDigit-1)+',}1)$')))return '前後賞：'+(1+RegExp.$1.length)+'位數過一～';
 if(num.match(new RegExp('('+num.slice(-1)+'{'+isLuckyNum_dDigit+',})$')))return '下'+RegExp.$1.length+'桁のゾロ目';

 var i=2,c=Math.floor(num.charAt(0)),d=num.charAt(1)-c;c+=d;
 while(i<num.length)if(num.charAt(i++)!=(c+=d)){d=0;break;}
 if(d)return '連番（公差'+d+'の等差数列）';

 i=2,c=Math.floor(num.charAt(0)),d=num.charAt(1)/c;c*=d;
 while(i<num.length)if(num.charAt(i++)!=(c*=d)){d=0;break;}
 if(d)return '公比'+(d>1?d:'1/'+(1/d))+'の等比数列';

 if( num.length>=isLuckyNum_dDigit){
  c=Math.floor(num.length/2),d=1;
  if(num.slice(0,c)==num.substr(num.length-c))return c+'桁の対称形';

  for(i=0;i<=c;i++)if(num.charAt(i)!=num.charAt(num.length-1-i)){d=0;break;}
  if(d)return c+'桁の左右対称（鏡像、シンメトリィ）';

  for(i=2;i<=c;i++){
   d=num.slice(0,i);var s=d;while(s.length<num.length)s+=d;
   if(num==s.slice(0,num.length))return i+'位數循環/回文';
  }

  for(i=2,c=Math.floor(num.charAt(0)),d=Math.floor(num.charAt(1));i<num.length;i++)
   if(num.charAt(i)==c+d)c=d,d=Math.floor(num.charAt(i));else{d=0;break;}
  if(d)return 'Fibonacci数列';
 }

}





//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'math.polynomial';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * polynomial test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.math.polynomial = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();



//	polynomial	-----------------------------------

/*
	return [r1,r2,..[,餘式]]
	** 若有無法解的餘式，會附加在最後!

高次代數方程數值求根解法:	http://www.journals.zju.edu.cn/sci/2003/200303/030305.pdf	http://tsg.gxtvu.com.cn/eduwest/web_courseware/maths/0092/2/2-3.htm
	修正牛頓法 1819年霍納法 伯努利法 勞思表格法	http://en.wikipedia.org/wiki/Ruffini%27s_rule
	Newton's method牛頓法	x2=x1-f(x1)/f'(x1)	http://zh.wikipedia.org/wiki/%E7%89%9B%E9%A1%BF%E6%B3%95
四次方程Finding roots	http://zh.wikipedia.org/wiki/%E5%9B%9B%E6%AC%A1%E6%96%B9%E7%A8%8B
一元三次方程的公式解	http://en.wikipedia.org/wiki/Cubic_equation	http://math.xmu.edu.cn/jszg/ynLin/JX/jiaoxueKJ/5.ppt

var rootFindingFragment=1e-15;	//	因為浮點乘除法而會產生的誤差
*/
rootFinding[generateCode.dLK]='rootFindingFragment';
function rootFinding(polynomial){
 var r=[],a,q;

 //alert(NewtonMethod(polynomial));

 while(a=polynomial.length,a>1){
  if(a<4){
   if(a==2)r.push(-polynomial[1]/polynomial[0]);
   else{
    a=polynomial[1]*polynomial[1]-4*polynomial[0]*polynomial[2];	//	b^2-4ac
    q=2*polynomial[0];
    if(a<0)a=(Math.sqrt(-a)/Math.abs(q))+'i',q=-polynomial[1]/q,r.push(q+'+'+a,q+'-'+a);
    else a=Math.sqrt(a)/q,q=-polynomial[1]/q,r.push(q+a,q-a);
   }
   polynomial=[];break;
  }else if(a=NewtonMethod(polynomial),Math.abs(a[1])>rootFindingFragment){
   //alert('rootFinding: NewtonMethod 無法得出根!\n誤差:'+a[1]);
   break;
  }
  a=qNum(a[0],1e6);//alert(a[0]+'/'+a[1]);
  q=pLongDivision(polynomial,[a[1],-a[0]]);
  if(Math.abs(q[1][0])>pLongDivisionFragment){alert('rootFinding error!\n誤差:'+q[1][0]);break;}
  r.push(a[0]/a[1]),polynomial=q[0];
  //alert('get root: '+a[0]+'\n'+polynomial);
 }

 if(polynomial.length==5){	//	兩對共軛虛根四次方程
  q=[],a=polynomial.length,i=0;
  while(--a)q.push(polynomial[i++]*a);	//	微分
  if(q=rootFinding(q),q.length>1){
   //a=0;for(var i=0;i<polynomial.length;i++)a=a*q[0]+polynomial[i];
   //	將函數上下移動至原極值有根處，則會有二重根。原函數之根應為(-b +- (b^2-4ac)^.5)/2a，則此二重根即為-b/2a（？）
   //	故可將原函數分解為(x^2-2*q[n]*x+&)(?x^2+?x+?)
   //	以長除法解之可得&有三解:a*&^2+(-2*q[n]*(b+2*a*q[n])-c)*&+e=0 or ..
   q=q[0],a=4*polynomial[0]*q+polynomial[1];
   if(a==0){a=rootFinding([polynomial[0],-2*q*(polynomial[1]+2*q*polynomial[0])-polynomial[2],polynomial[4]]);if(a.length<2)a=null;else a=a[0];}
   else a=(2*polynomial[2]*q+polynomial[3]-2*polynomial[0]*q*(2*polynomial[0]*q+polynomial[1]))/a;
   var o;
   if(!isNaN(a)&&(q=pLongDivision(polynomial,o=[1,-2*q,a]),Math.abs(q[1][0])<pLongDivisionFragment&&Math.abs(q[1][1])<pLongDivisionFragment))
    a=rootFinding(q[0]),r.push(a[0],a[1]),a=rootFinding(o),r.push(a[0],a[1]),polynomial=[];
  }
 }

 if(polynomial.length>1){
  r.push(polynomial);
  //if(polynomial.length%2==1)alert('rootFinding error!');
 }
 return r;
}
//alert(rootFinding(getPbyR([1,4/3,5,2,6])).join('\n'));
//alert(NewtonMethod(getPbyR([1,4,5,2,6])).join('\n'));
//alert(rootFinding([1,4,11,14,10]).join('\n'));
//alert(rootFinding([1,2,3,2,1]).join('\n'));

/*	長除法 polynomial long division	http://en.wikipedia.org/wiki/Polynomial_long_division	2005/3/4 18:48
	dividend/divisor=quotient..remainder

	input	(dividend,divisor)
	return	[商,餘式]

var pLongDivisionFragment=1e-13;	//	因為浮點乘除法而會產生的誤差
*/
pLongDivision[generateCode.dLK]='pLongDivisionFragment';
function pLongDivision(dividend,divisor){
 if(typeof dividend!='object'||typeof divisor!='object')return;
 while(!dividend[0])dividend.shift();while(!divisor[0])dividend.shift();
 if(!dividend.length||!divisor.length)return;

 var quotient=[],remainder=[],r,r0=divisor[0],c=-1,l2=divisor.length,l=dividend.length-l2+1,i;
 for(i=0;i<dividend.length;i++)remainder.push(dividend[i]);
 while(++c<l)
  for(quotient.push(r=remainder[c]/r0),i=1;i<l2;i++){
   remainder[c+i]-=r*divisor[i];
   //if(Math.abs(remainder[c+i])<Math.abs(.00001*divisor[i]*r))remainder[c+i]=0;
  }
 return [quotient,remainder.slice(l)];
}
//alert(pLongDivision([4,-5,3,1/3+2/27-1],[3,-1]).join('\n'));

/*
//	polynomial multiplication乘法
function polynomialMultiplication(pol1,pol2){
 //for()
}
*/

/*	Newton Iteration Function	2005/2/26 1:4
	return [root,誤差]
*/
function NewtonMethod(polynomial,init,diff,count){
 var x=0,d,i,t,l,o,dp=[];
 if(!polynomial||!(d=l=polynomial.length))return;
 while(--d)dp.push(polynomial[x++]*d);	//	dp:微分derivative
 if(!diff)diff=rootFindingFragment;diff=Math.abs(diff);
 if(!count)count=15;
 x=init||0,o=diff+1,l--;
 //alert(polynomial+'\n'+dp+'\n'+diff+',l:'+l);
 while(o>diff&&count--){
  //alert(count+':'+x+','+d);
  for(d=t=i=0;i<l;i++)d=d*x+polynomial[i],t=t*x+dp[i];
  d=d*x+polynomial[l];
  //alert(d+'/'+t);
  if(t)d/=t;else d=1;//alert();
  t=Math.abs(d);
  if(o<=t)if(o<rootFindingFragment)break;else x++;	//	test
  o=t,x-=d;
 }
 return [x,d];
}

//	從roots得到多項式	2005/2/26 0:45
function getPbyR(roots){
 var p,r,i,c=0,l;
 if(!roots||!(l=roots.length))return;
 p=[1,-roots.pop()];
 while(++c<l)
  if(r=roots.pop()){p.push(-r*p[i=c]);while(i)p[i]-=p[--i]*r;}
  else p.push(0);
 return p;
}

//alert(getPbyR([1,2,3]));
//document.write(Newton1(getPbyR([2,32,5,3])));

//	↑polynomial	-----------------------------------







//--------------------------------------------------------------------------------//




/**
 * @name	CeL quotient function
 * @fileoverview
 * 本檔案包含了 quotient 的 functions。
 * @since	2010/3/11 16:59:59
 * @example
 * CeL.use('math');	//	TODO: bug
 * CeL.use('math.quotient');
 * var q1 = new CeL.quotient(2,3);
 * //	數字基底的轉換:
 * CeL.log(CeL.quotient.parse_base('4877.6'.toLowerCase(),10).to_base(16).replace(/_([^\(]+)/,'_<i style="text-decoration:overline">$1</i>'));
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'math.quotient';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.math.quotient
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
//library_namespace.use('math');
if (eval(library_namespace.use_function(
		'math.to_rational_number,math.gcd,math.factorization')))
	return;

//library_namespace.debug(to_rational_number);
//library_namespace.debug(gcd);


//============================================================================
//	definition of module quotient

var
/*
整數部分
分數	fraction
真分數	proper fraction
vinculum  = "divide by"
*/
/**
 * 有理數 rational number，有理数全体のつくる集合はしばしば、商を意味する quotient の頭文字をとり、太字の Q で表す。<br/>
 * 若要輸入不同基底的數值，請用 parse_base()
 * @param	numerator	分子
 * @param	denominator	分母
 * @param {Boolean} approximate	取近似值
 * @example
 * CeL.log((new CeL.quotient(3,4)).count('*',new CeL.quotient(2,7)).reduce().to_print_mode());
 * @class	quotient 的 functions
 * @constructor
 */
CeL.math.quotient
= function(numerator, denominator, approximate) {
	if (typeof numerator === 'object' && numerator instanceof _
			//&& numerator.Class === 'quotient'
			)
		return numerator;
	if (isNaN(numerator))
		numerator = 0;
	if (!denominator || isNaN(denominator))
		denominator = 1;
	else if (denominator < 0)
		denominator = -denominator, numerator = -numerator;

	// to_rational_number 需 test，並回傳(分子,分母,誤差)！
	var q = to_rational_number(numerator);
	//library_namespace.debug(numerator + ' → ' + q);
	if (!q)
		numerator = 0;
	else if (approximate || !q[2])
		// 無誤差時使用之
		numerator = q[0], denominator *= q[1] || 1;
	else
		while (numerator % 1 || denominator % 1)
			// 化為整數
			numerator *= 10, denominator *= 10;

	// value
	this.n = numerator, this.d = denominator;
	// this.type='quotient';
	//library_namespace.debug(this.n + ' / ' + this.d);
	return this;
};

//class public interface	---------------------------

CeL.math.quotient
.
/**
 * 循環節分隔符號：整數.小數__repetend_separator__循環節
 * @memberOf	CeL.math.quotient
 */
repetend_separator = '_';//' '

CeL.math.quotient
.
/**
 * 數字集
 * @memberOf	CeL.math.quotient
 * @see
 * http://en.wikipedia.org/wiki/Numerical_digit
 */
digit_char = '0123456789abcdefghijklmnopqrstuvwxyz';//.split('')


CeL.math.quotient
.
/**
 * 轉換指定進位的數字成為 quotient 物件
 * @since	2004/7/9 16:13
 * @param number	數字
 * @param base	基底
 * @param digit_char	循環小數 digit 字集
 * @return	回傳 quotient 物件，請用 quotient.to_base() 傳回所欲之 base
 * @memberOf	CeL.math.quotient
 * @example
 * var q=parse_base('10000.'+_.repetend_separator+'3',11);
 * if(!q)alert('bad input!');else library_namespace.debug('<br/>'+q.base(8)+','+q.base()+' , '+q.to_print_mode()+','+q.print(1)+','+q.to_print_mode(2)+','+q.to_print_mode(3,0,'',5));
 */
parse_base = function(number, base, digit_char) {
	// if(!num) num = 0;
	if ((!(base = Math.floor(base)) || base < 2) && digit_char)
		base = digit_char.length;

	if (!digit_char)
		digit_char = _.digit_char;
	if (isNaN(base) || base < 2 || base > digit_char.length)
		base = 10;
	if (!number || base === 10
			&& ('' + number).indexOf(_.repetend_separator) === -1)
		// 可能有循環小數，所以不能放過僅僅 base === 10
		return new _(number);

	var i = 0, n = new _(0, 1), m = 0, t = 0, p, c = {}, r = new _(0, 1);
	for (; i < digit_char.length; i++)
		c[digit_char.charAt(i)] = i; // 字集

	number += '', i = -1, n.d = r.d = 1;
	//library_namespace.debug('<br/>'+i+','+num.length+','+t+','+num+','+n.to_print_mode());
	if (number.charAt(0) === '-')
		i = 0, m = 1;
	while (++i < number.length && (p = number.charAt(i)) != '.')
		// 整數
		if (isNaN(p = c[p]) || p >= base)
			// error!
			return;
		else
			t = t * base + p;
	//library_namespace.debug('<br/>'+i+','+num.length+','+t+','+num+','+n.to_print_mode());
	while (++i < number.length
			&& (p = number.charAt(i)) != _.repetend_separator)
		// 小數
		if (isNaN(p = c[p]) || p >= base)
			// error!
			return;
		else
			n.n = n.n * base + p, n.d *= base;
	while (++i < number.length)
		// 循環節
		if (isNaN(p = c[number.charAt(i)]) || p >= base)
			return; // error!
		else
			r.n = r.n * base + p, r.d *= base;
	//library_namespace.debug('<br/>**'+n.to_print_mode());
	//	善後
	n = n.count('+=', t);
	if (r.n)
		r.d = (r.d - 1) * n.d, n.count('+=', r);
	n.reduce();
	//library_namespace.debug('<br/>*'+n.to_print_mode());
	if (m)
		n.n = -n.n;
	return n;
};



CeL.math.quotient
.prototype = {

//	instance public interface	-------------------


/**
 * 最簡分數/化簡, 約分 reduction
 * @return	化簡後的
 * @name	CeL.math.quotient.prototype.reduce
 */
reduce : function() {
	var g = gcd(this.n, this.d);
	if (g && g > 1)
		this.n /= g, this.d /= g;
	return this;
},

/**
 * 四則運算 + - * / (+-×÷)**[=]
 * @param op	operator
 * @param q2	the second quotient
 * @return	計算後的結果
 * @see
 * http://www.javaworld.com.tw/jute/post/view?bid=35&id=30169&tpg=1&ppg=1&sty=1&age=0#30169
 * @name	CeL.math.quotient.prototype.count
 */
count : function(op, q2) {
	var q;
	if (op.slice(-1) === '=')
		q = this, op = op.slice(0, -1);
	else
		q = new _(this);

	q2 = new _(q2);
	//library_namespace.debug('<br/>'+this.type+','+q.to_print_mode()+' , '+q2.to_print_mode());
	if (op === '-')
		q2.n = -q2.n, op = '+';
	else if (op === '/') {
		var t = q2.n;
		q2.n = q2.d, q2.d = t, op = '*';
	}
	//library_namespace.debug('<br/>'+q.to_print_mode(1)+','+q2.to_print_mode(1));
	if (op === '+')
		q.n = q.n * q2.d + q.d * q2.n, q.d *= q2.d;
	else if (op === '*')
		q.n *= q2.n, q.d *= q2.d;
	// N! 是指 N的階乘 (Factorial,power)
	else if ((op === '**' || op === '^') && q2.reduce().d === 1) {
		q.reduce(), q.n = Math.pow(q.n, q2.n), q.d = Math.pow(q.d, q2.n);
		return q;
	} else {
		library_namespace.err('illegal operator [' + op + ']!');
		return this;
	}
	//library_namespace.debug('<br/>'+q.to_print_mode(1)+','+q2.to_print_mode(1));
	//	other: error
	//library_namespace.debug('<br/>_'+q.reduce().to_print_mode());
	try {
		return q.reduce();
	} catch (e) {
	}
	return q;
},

/**
 * 依指定基底轉成循環小數 circulating decimal / repeating decimal。
 * 特殊情況可以考慮使用 .toString()，會快很多。
 * TODO: 小數
 * @since	2004/7/9 13:28
 * @param base	基底
 * @param digit_char	循環小數 digit 字集
 * @return	(decimal/數字部分string,repunitIndex/循環節Repetend出現在)
 * @see
 * http://mathworld.wolfram.com/RepeatingDecimal.html
 * http://hk.geocities.com/goodprimes/OFrp.htm
 * @name	CeL.math.quotient.prototype.to_base
 */
to_base : function(base, digit_char) {
	//if (!isNaN(digit_char)) digit_char += '';
	if (typeof digit_char !== 'string' || digit_char.length < 2)
		// 字集
		digit_char = _.digit_char;

	// 基底預設為 10 進位
	if (!(base = Math.floor(base)) || base == 10 ||
			// illegal base
			base < 2 || base > digit_char.length)
		return this.to_decimal();

	this.reduce();
	var d = this.d, o = this.n, i, t, m = 0,
	// find base 的因數(factor)
	f = factorization(base);
	if (o < 0)
		// 負數
		o = -o, m = 1;

	// find 分母的因數(factor)與基底 base 之交集(不能用gcd)
	for (i = 0, g = 1, t = d; i < f.length; i += 2)
		while (t % f[i] === 0)
			g *= f[i], t /= f[i];

	// get 整數 integer 部分 → out
	f = o % d;
	i = (o - f) / d;
	o = '';
	while (i)
		t = i % base, i = (i - t) / base, o = digit_char.charAt(t) + o;
	if (!o)
		o = '0', m = 0;
	//library_namespace.debug('<br/>_' + typeof o + ',' + (o || '(null)') + ',' + o);
	if (!f)
		return m ? '-' + o : o;

	// 進入小數
	o += '.';

	// set 餘數f/分母d, 餘數residue mark r=f, 循環節 Repetend location of out:l, 已解決的因數 s
	var r = f, l = o.length, s = 1;

	// do main loop
	// while(o.length-l<d){ // 限制?位: debug用
	for (;;) {
		//library_namespace.debug('<br/>.'+r+','+f+'/'+d+'('+base+'),'+s+':'+g+','+o);
		if (!f) {
			// 可以整除，無循環。
			l = 0;
			break;
		}
		f *= base;
		if (s === g) {
			// 分母與 base 已互質
			t = f, f %= d, o += digit_char.charAt((t - f) / d);
			if (f === r)
				// bingo! 餘數重複出現，循環節結束。
				break;
		} else {
			// f 與 d 已互質
			t = gcd(base, d), s *= t, f /= t, d /= t,
			//	do the same thing
			t = f, f %= d, o += digit_char.charAt((t - f) / d),
			//	r 需重設..此處有否可能出問題? maybe not?
			r = f, l = o.length;
		}
	}

	//	善後
	if (l)
		o += '(' + (o.length - l) + ')', o = o.slice(0, l)
		+ _.repetend_separator + o.substr(l);
	if (m)
		o = '-' + o;
	return o;
},

/**
 * 為十進位最佳化的 to_base()
 * @since 2004/7/9 13:47
 * @return
 * @name	CeL.math.quotient.prototype.to_decimal
 */
to_decimal : function() {
	this.reduce();
	var d = this.d, t = d, g = 1, m = 0, f, o = this.n;
	if (o < 0)
		o = -o, m = 1; // 負數

	// find 分母的 2,5 因數
	while (t % 2 === 0)
		g <<= 1, t >>= 1;
		while (t % 5 === 0)
			g *= 5, t /= 5;

		// get 整數 integer 部分 → out
		f = o % d, o = (o - f) / d;
		//library_namespace.debug('<br/>_'+typeof o+','+(o||'(null)')+','+o);
		if (!f)
			// 留下+-
			return (m ? '-' : '') + o;

	// 進入小數
	o += '.';

	// set 餘數f/分母d, 餘數 residue mark r=f, 循環節 Repetend location of out:l, 已解決的因數 s
	var r = f, l = o.length, s = 1;

	// do main loop
	// while(o.length-l<d){// 限制?位:debug用
	for (;;) {
		//library_namespace.debug('<br/>.'+r+','+f+'/'+d+','+s+':'+g+','+o);
		if (!f) {
			// 可以整除，無循環。
			l = 0;
			break;
		}
		f *= 10;
		if (s === g) {
			// 分母與 base 已互質
			t = f, f %= d, o += (t - f) / d;
			if (f === r)
				// bingo! 循環節結束
				break;
		} else {
			t = d % 5 === 0 ? d % 2 === 0 ? 10 : 5 : 2, s *= t, f /= t, d /= t,
			// do the same thing
			t = f, f %= d, o += (t - f) / d,
			// r 需重設..此處有否可能出問題? maybe not?
			r = f, l = o.length;
		}
	}

	//	善後
	if (l)
		o += '(' + (o.length - l) + ')',
		o = o.slice(0, l) + _.repetend_separator + o.substr(l);
	if (m)
		o = '-' + o;
	return o;
},


/*
有效位數、小數位數	http://technet.microsoft.com/zh-tw/library/ms190476.aspx
Precision, Scale
有效位數是數字的位數。小數位數是數字中在小數點右側的位數。例如，123.45 這個數字的有效位數是 5，小數位數是 2。
Precision is the number of digits in a number. Scale is the number of digits to the right of the decimal point in a number. For example, the number 123.45 has a precision of 5 and a scale of 2.
*/

/**
 * 顯示數字
 * @since	2004/7/9 14:23
 * @param mode	顯示模式
 * 0	假分數 improper fraction,
 * 1	帶分數 mixed number,
 * 2	直接除(10進位),
 * 3	轉成循環小數,除至小數點下digit位數（非四捨五入！）.
 * @param base	基底
 * @param sum_char	顯示帶分數時代表整數與真分數之間的分隔。多為' '或'+'或''。
 * @param digit	轉成循環小數時，代表循環小數 digit 字集
 * @return	{String}	顯示模式數字
 * @name	CeL.math.quotient.prototype.to_print_mode
 */
to_print_mode : function(mode, base, sum_char, digit) {
	if (mode < 3 || !mode) {
		if (mode === 2)
			return this.n / this.d;
		var p, f;
		if (!mode || this.n < this.d)
			p = this.n + '/' + this.d;
		else
			f = this.n % this.d,
			p = (this.n - f) / this.d
					+ (f ? (sum_char || '+') + f + '/' + this.d : '');
		return p;
	}

	if (mode === 3) {
		var n = this.to_base(base, sum_char);
		if (isNaN(digit))
			return n;
		var f = n.indexOf(_.repetend_separator), b = n.indexOf('.');
		if (f === -1 || !digit)
			return b === -1 ? n :
				digit ? n.slice(0, b + digit + 1) : n.slice(0, b);
		digit += b + 1,
		//	循環節
		b = n.substr(f + 1),
		n = n.slice(0, f);
		while (n.length < digit)
			n += b;
		return n.slice(0, digit);
	}
},

/**
 * 測試大小
 * @param q2	the second quotient
 * @return	{Number}	0:==, <0:<, >0:>
 * @name	CeL.math.quotient.prototype.compare_to
 */
compare_to : function(q2) {
	q2 = new _(q2);
	return this.n * q2.d - this.d * q2.n;
}

};

//	setup toString function
_.prototype.toString = _.prototype.to_print_mode;

return (
	CeL.math.quotient
);
};

//============================================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//





/**
 * @name	CeL file function
 * @fileoverview
 * 本檔案包含了 file functions。
 * @since	
 */




if (typeof CeL === 'function'){

	/**
	 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
	 * @type	String
	 * @constant
	 * @inner
	 * @ignore
	 */
var module_name = 'IO.file';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.IO.file
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function() {

/**
 * null module constructor
 * @class	檔案操作相關之 function。
 */
CeL.IO.file
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.IO.file
.prototype = {
};




//	path處理	-------------------------------------------------------

//	path,mode=1:去除檔名，只餘目錄，如輸入http://hostname/aaa/bbb/ccc得到http://hostname/aaa/bbb/	尚未處理：: * ?
//reducePath[generateCode.dLK]='dirSp,dirSpR';
function reducePath(p,m){
 //alert(typeof p+'\n'+p);
 if(!(p=''+p))return;
 var t;
 if(t=p.match(/^"([^"]*)/))p=t[1];
 if(t=p.match(/(.*)\|<>/))p=t[1];
 //Windows environment variables在真實path前,尚未測試！
 if(typeof WinEnvironment=='object'&&(t=p.match(/%(.+)%/g)))for(i in t)
  if(WinEnvironment[i])p.replace(new RegExp(i,"ig"),WinEnvironment[i]);
 p=p.replace(new RegExp(dirSp=='/'?'\\\\':'/',"g"),dirSp);
 if(m&&(t=p.lastIndexOf(dirSp))!=-1&&t+1!=p.length)p=p.slice(0,t+1);//去除檔名：假如輸入sss/ddd，會把ddd除去！需輸入sss/ddd/以標示ddd為目錄
 //p=p.replace(new RegExp(dirSp+dirSp,'g'),dirSp);	//	\\→\，未考慮到'\\pictures\scenic\canyon.bmp'的情況
 return p.replace(new RegExp('^(\\.'+dirSpR+')+'),'')	//	.\→''
 .replace(new RegExp(dirSpR+'(\\.'+dirSpR+')+','g'),dirSp)	//	\.\→\
 .replace(new RegExp('[^.'+dirSpR+']+'+dirSpR+'\\.\\.'+dirSpR,'g'),'');	//	xx\..\→''
}
//alert(reducePath('http://hostname/../aaa/bbb/../ccc/../ddd',1));

//	去除hostname等，如輸入http://hostname/aaa/bbb/ccc得到aaa/bbb/ccc/
//	假如輸入的格式不正確，可能得出不預期的回應值！
/*	對dirSp.length>1的情形（嚴謹）
function getPathOnly(p){
 //discard hash & search
 var i=p.lastIndexOf('?'),j=p.lastIndexOf('#'),dirSpL=dirSp.length;
 if(i==-1)i=j;else if(j!=-1&&i>j)i=j;if(i!=-1)p=p.slice(0,i);
 //	去除http://hostname/等
 if(p.slice(0,5)=='file:///')p=p.substr('file:///'.length);	//	對file:///特別處理！
 else if((i=p.indexOf(':'+dirSp+dirSp))!=-1&&(i=p.indexOf(dirSp,i+(':'+dirSp+dirSp).length))!=-1))p=p.substr(i+dirSpL);	//	http://hostname/path→path
 else if(p.slice(0,dirSpL)==dirSp)
 //	/usr/local/→usr/local/
 if(p.substr(dirSpL,dirSpL)!=dirSp)p=p.substr(dirSpL);
 //	去除\\hostname\
 else if((i=p.indexOf(dirSp,dirSpL+dirSpL))>dirSpL+dirSpL)p=p.substr(i+dirSpL);
 //	\\\zzzz的情形：不合法的路徑
 else if(i!=-1)throw new Error(1,'illegal path:'+p);
 return p;
}
*/
//	對dirSp.length==1的情形簡化
//getPathOnly[generateCode.dLK]='dirSp';//,isFile
function getPathOnly(p){
 //discard hash & search
 var i=p.lastIndexOf('?'),j=p.lastIndexOf('#');
 if(i==-1)i=j;else if(j!=-1&&i>j)i=j;if(i!=-1)p=p.slice(0,i);
 //	去除http://hostname/等
 if(p.slice(0,8)=='file:///')p=p.substr(8);	//	對file:///（應該是file:）特別處理！
 else if((i=p.indexOf(':'+dirSp+dirSp))!=-1&&(i=p.indexOf(dirSp,i+3)!=-1))p=p.substr(i+1);	//	http://hostname/path→path
 else if(p.charAt(0)==dirSp)
  //	/usr/local/→usr/local/
  if(p.charAt(1)!=dirSp)p=p.substr(1);
  //	去除\\hostname\	不去除：.replace(/[^\\]+$/,'')
  else if((i=p.indexOf(dirSp,2))>2)p=p.substr(i+1);
  //	\\\zzzz的情形：不合法的路徑
  else if(i!=-1)throw new Error(1,'illegal path:'+p);
 if(typeof isFile=='function'&&isFile(p))	//	!isWeb()&&~
  p=p.replace(new RegExp(dirSpR+'[^'+dirSpR+']+$'),dirSp);
 return p;
}






//	use dBasePath()
function basePath(){
 return typeof location=='object'?location.href:	//	location.pathname
	typeof WshShell=='object'?WshShell.CurrentDirectory:
	typeof WScript=='object'?WScript.ScriptFullName:'';
}

/*	2003/10/1 15:57
	pn(path now)相對於bp(base path)之path(增加../等)
*/
//relatePath[generateCode.dLK]='reducePath,isAbsPath,same_length,dirSp,dirSpR';
//,WScript,WshShell
function relatePath(bp,pn){
 if(!pn)pn=typeof location=='object'?location.href:typeof WScript=='object'?WScript.ScriptFullName:'';
 if(!bp)bp=typeof location=='object'?location.href:typeof WshShell=='object'?WshShell.CurrentDirectory:typeof WScript=='object'?WScript.ScriptFullName:'';
 //alert('relatePath: parse 1\n'+bp+'\n'+pn);
 var p=reducePath(pn);
 if(!p)return;
 var d=reducePath(bp,1);
 if(!d||!isAbsPath(d))return p;	//	bp需要是絕對路徑

 //alert('relatePath: parse 2\n'+d+'\n'+p);
 if(!isAbsPath(p)){	//	p非絕對路徑時先處理成絕對路徑
  var q=p.indexOf(dirSp,1);	//	預防第一字元為dirSp
  if(q==-1)q=p;else q=p.slice(0,q);	//	取得第一識別用目錄名
  //alert('relatePath: parse 3\n'+d+'\n'+q);
  q=d.indexOf(q);
  if(q==-1)return p;
  p=d.slice(0,q)+p;

/*
  var i=0,q=p.split(dirSp),s=new Array(q.length),a=-1,P,bigPC=0,bigP;
  //	找出最大連續相同路徑:尚未最佳化
  for(i=0;i<q.length;i++){
   if(a==-1)P=q[i];else P+=dirSp+q[i];
   if(d.indexOf(P)==-1){if(a!=-1&&s[a]>bigPC)bigPC=s[a],bigP=P;a=-1;}
   else{if(a==-1)a=i;++s[a];}
  }
  d=d.indexOf(bigP);
*/
 }
 var s=same_length(p,d);

 //alert('dirSp:	'+dirSp+'\npath now:\n	'+p+'\nbase path:\n	'+d+'\nsame:	'+s);
 //alert(p+'\n'+d+'\n'+s+'\n'+d.substr(s)+'\n'+d.substr(s).match(new RegExp(dirSp,'g')).length);
 //pLog(d.charAt(s-1)+','+d.slice(0,s)+':'+s+','+d.slice(0,s).lastIndexOf(dirSp));
 if(s>0&&d.charAt(s-1)!=dirSp)s=d.slice(0,s).lastIndexOf(dirSp)+1;
 return s>0?d.substr(s).replace(new RegExp('([^'+dirSpR+']+'+dirSpR+')','g'),'..'+dirSp)+p.substr(s):p;
}
//	想要保持 Protocol，但卻是不同機器時	http://nedbatchelder.com/blog/200710.html#e20071017T215538
//alert(relatePath('//lyrics.meicho.com.tw/game/game.pl?seg=diary21','cgi-bin/game/photo/'));WScript.Quit();


/*	得知相對basePath
<script type="text/javascript" src="../baseFunc.js"></script>
var basePath=getBasePath('baseFunc.js');	//	引數為本.js檔名	若是更改.js檔名，亦需要同步更動此值！
*/
function getBasePath(JSFN){
 if(!JSFN)return typeof WScript=='object'?WScript.ScriptFullName.replace(/[^\/]+$/,''):'';
 var i,j,b,o=document.getElementsByTagName('script');
 for(i in o)try{j=o[i].getAttribute('src');i=j.indexOf(JSFN);if(i!=-1)b=j.slice(0,i);}catch(e){}
 return b||'';	//	alert()
}

//	determine Base Path(base path的範本,path now)
//dBasePath[generateCode.dLK]='reducePath,getPathOnly,dirSp,dirSpR';
function dBasePath(bp,pn){
 if(!pn)pn=typeof location=='object'?location.href:
	//typeof WshShell=='object'?WshShell.CurrentDirectory:	//	用在把檔案拉到此檔上時不方便
	typeof WScript=='object'?WScript.ScriptFullName:'';
 var p=reducePath(pn,1);if(!p)return;if(!bp)return p;

 var i,j,k,t,d=getPathOnly(reducePath(bp,1)).match(new RegExp('([^'+dirSpR+']+'+dirSpR+')','g'));	//split()
 if(!d)return;

 for(i=0,t='';i<d.length;i++)if(p.lastIndexOf(dirSp+d[i])!=-1){t=dirSp;while(d[i]&&(k=p.lastIndexOf(t+d[i]))!=-1)j=k,t+=d[i++];while(d[i])t+=d[i++];break;}
 if(!t)return p;//alert("Can't find base directory of this file!\n"+pn+'\n\nTreat base directory as:\n'+p);//
 //alert('dBasePath:\nbp='+bp+'\npn='+pn+'\n\n'+p.slice(0,j)+'\n'+t+'\n'+(t.replace(new RegExp('([^'+dirSpR+']+'+dirSpR+')','g'),' ').length-1));
 return p.slice(0,j)+t;
}
//alert(dBasePath('kanashimi/www/cgi-bin/game/'));


// site to site: proxy
function parseURI(URI,Dprotocol){
 var m,n;
 if(typeof URI!='string'||!(m=URI.match(/^(([\w\d\-\:]+)\/\/)?([^\/]+)(.+)?$/)))return;//不能用 instanceof String!
 URI={URI:URI};
 if(m[2]||Dprotocol)URI.protocol=m[2]||Dprotocol;

 if(n=(URI.host=m[3]).match(/^(.+?):(\d+)$/))URI.hostname=n[2],URI.port=n[2];
 else if(URI.hostname=m[3],(n={'http':80,'ftp':21}[URI.protocol]))URI.port=n;

 m=m[4];
 if(n=m.match(/^(.*)(\?.*?)$/))URI.search=n[2],m=n[1];
 if(n=m.match(/^(.*)(#.*?)$/))URI.hash=n[2],m=n[1];
 URI.pathname=m;

 URI.URL=URI.href=(URI.protocol?URI.protocol+'//':'')+(URI.username?URI.username+(URI.password?':'+URI.password:'')+'@':'')+URI.host+(URI.port?':'+URI.port:'')+URI.pathname+(URI.hash||'')+(URI.search||'');

 return URI;
}

// cf: getFN()
function parsePath(path){
 if(typeof path!='string'||!path)return;

 var s={oInput:path},m;
 if(m=path.match(/^(([A-Za-z]):\\)(([^\\]+\\)*)([^\\]+)?$/)){
  s.drive=m[2],s.pathName=m[3],s.fileName=m[5];
 }else if(m=path.match(/^file:\/\/\/([A-Za-z]):\/(([^\/]+\/)*)([^\/]+)?$/)){
  s.drive=m[1],s.pathName=m[2].replace(/\//g,'\\'),s.fileName=m[4].replace(/\//g,'\\');
 }
 s.path=s.pathName+s.fileName;
 s.location=s.drive+':\\'+s.path;
 s.directory=s.drive+':\\'+s.pathName;

 return s;
}


//	absolute or relative path, not very good solution
//isAbsPath[generateCode.dLK]='dirSp,dirSpR';
function isAbsPath(p){//alert(typeof p+'\n'+p);
 return p&&(dirSp=='/'&&p.charAt(0)==dirSp||new RegExp('^(\\\\|[A-Za-z]+:)'+dirSpR).test(p));	//	?true:false
}
//alert(dBasePath('kanashimi/www/cgi-bin/game/'));

//	轉成path（加'\'）
function turnToPath(p){return p?p+(p.slice(-1)=='\\'?'':'\\'):'';}
//	僅取得path部分(包括 dirSp)，不包括檔名。
//getFilePath[generateCode.dLK]='dirSp';
function getFilePath(p){
 var i=p.lastIndexOf(dirSp);
 if(i==-1)p+=dirSp;	//	相對路徑?
 else if(i<p.length-1)p=p.slice(0,i+1);	//	取得path部分
 return p;
}
/*	傳回包括檔名之絕對/相對路徑，假如是資料夾，也會回傳資料夾路徑。可包含'.','..'等	the return value include ? #
	在Win/DOS下輸入'\'..會加上base driver
	若只要相對路徑，可用reducePath()。取得如'..\out'的絕對路徑可用getFP('../out',1)
*/
//getFP[generateCode.dLK]='dBasePath,reducePath,isAbsPath,getPathOnly,relatePath';
function getFP(p,m,bp){	//	path,mode=0:傳回auto(維持原狀),1:傳回絕對路徑,2:傳回相對路徑,base path
 //old:	return (p.lastIndexOf('\\')==-1&&p.lastIndexOf('/')==-1?getFolder(getScriptFullName()):'')+p;//getF
 if(!p)return'';
 if(p.charAt(0)=='\\'&&dBasePath(bp).match(/^(\\\\|[A-Za-z]+:)/))p=RegExp.$1+p;
 p=reducePath(p);
 if(m==1){
  if(!isAbsPath(p))p=reducePath((bp?getPathOnly(bp):dBasePath())+p);	//	當為相對路徑時前置base path
 }else if(m==2&&isAbsPath(p))p=relatePath(dBasePath(bp),p);
 return p;
}
//	傳回檔名部分，the return value include ? #
//getFN[generateCode.dLK]='getFP,dirSp';
function getFN(p,bp,m){	//	path,base path,mode=0:檔名,1:(當輸入為不可信賴的字串時)去除檔名中不允許的字元，割掉? #等
 p=getFP(p,0,bp);
 p=p.slice(p.lastIndexOf(dirSp)+1);	//	不能用.substr(p.lastIndexOf(dirSp))+dirSp,因為p.lastIndexOf(dirSp)可能==-1	//	比起(m=p.lastIndexOf(dirSp))==-1?p:p.substr(m+1);此法比較直接，不過感覺多一道手續…
 if(m){
  if(p.match(/[#?]/))p=p.substr(0,RegExp.lastIndex-1);
  p=p.replace(/[\\\/:*?"<>|]/g,'_');//[ \.]	//	去除檔名中不允許的字元
 }
 return p;
}
//	傳回檔案/資料夾物件	FileSystemObjectのバグ(制限)で、環境によっては2G以上の領域を認識できません。WSH5.6ではこのバグが修正されています。
//getF[generateCode.dLK]='isFile,dealShortcut,getFP,dirSp,getFolder,initWScriptObj';
function getF(p,m,bp){	//	path,mode=0:auto(維持原狀),1:絕對路徑,2:相對路徑,base path
 try{return isFile(p=dealShortcut(getFP(p,m,bp),1))?fso.GetFile(p):fso.GetFolder(p);}
 catch(e){return p.indexOf(dirSp)==-1?getF(getFolder(WScript.ScriptFullName)+p,m,bp):null;}
}
//alert(getFP('\program files\\xxx\\xxx.exe',2));





return (
	CeL.IO.file
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL file function for Windows
 * @fileoverview
 * 本檔案包含了 Windows 的 file functions。
 * @since	2009/12/1
 */

/*
 * TODO
 * http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K869.aspx
 */

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'IO.Windows.file';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.IO.Windows.file
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {


/**
 * null module constructor
 * @class	Windows 下，檔案操作相關之 function。
 */
CeL.IO.Windows.file
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.IO.Windows.file
.prototype = {
};



/*
	JScript only	-------------------------------------------------------
*/

CeL.IO.Windows.file
.
/**
 * FileSystemObject Object I/O mode enumeration
 * @see	<a href="http://msdn.microsoft.com/en-us/library/314cz14s%28VS.85%29.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @memberOf	CeL.IO.Windows.file
 */
iomode = {
	// * @_description <a href="#.iomode">iomode</a>: Open a file for reading only. You can't write to this file.
	/**
	 * Open a file for reading only. You can't write to this file.
	 * @memberOf	CeL.IO.Windows.file
	 */
	ForReading : 1,
	/**
	 * Open a file for writing.
	 * @memberOf	CeL.IO.Windows.file
	 */
	ForWriting : 2,
	/**
	 * Open a file and write to the end of the file.
	 * @memberOf	CeL.IO.Windows.file
	 */
	ForAppending : 8
};

CeL.IO.Windows.file
.
/**
 * FileSystemObject Object file open format enumeration
 * @see	<a href="http://msdn.microsoft.com/en-us/library/314cz14s%28VS.85%29.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @memberOf	CeL.IO.Windows.file
 */
open_format = {
	/**
	 * Opens the file using the system default.
	 * @memberOf	CeL.IO.Windows.file
	 */
	TristateUseDefault : -2,
	/**
	 * Opens the file as Unicode.
	 * @memberOf	CeL.IO.Windows.file
	 */
	TristateTrue : -1,
	/**
	 * Opens the file as ASCII.
	 * @memberOf	CeL.IO.Windows.file
	 */
	TristateFalse : 0
};


var path_separator = library_namespace.env.path_separator, path_separator_RegExp = library_namespace.env.path_separator_RegExp, new_line = library_namespace.env.new_line, WshShell,
/**
 * FileSystemObject
 * @inner
 * @ignore
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/z9ty6h50%28VS.85%29.aspx" accessdate="2010/1/9 8:10">FileSystemObject Object</a>
 */
fso = WScript.CreateObject("Scripting.FileSystemObject"),
// XMLHttp,
WinShell // initWScriptObj
, args, ScriptHost;


/*	↑JScript only	-------------------------------------------------------
*/




/*

return {Object} report
	.list	files matched
	.succeed	success items
	.failed	failed items
	.log	log text
	.undo	undo data

usage example:
	move_file()	get file list array of current dir.
	move_file(0,0,'dir')	get file list array of dir.
	move_file('*.*','*.jpg','dir')	Error! Please use RegExp('.*\..*') or turnWildcardToRegExp('*.*')
	move_file(/file(\d+).jpg/,0,'dir')	get file list array of dir/file(\d+).jpg
	move_file(f1,move_file.f.remove)	delete f1
	move_file('f1','f2')	[f1]->[f2]
	move_file('f1','f2','.',move_file.f.copy|move_file.f.reverse)	copy [./f2] to [./f1]
	move_file(/file(\d+).jpg/,/file ($1).jpg/,'dir')	[dir/file(\d+).jpg]->[dir/file ($1).jpg]	can't use fuzzy or reverse in this time

prog example:
	function move_file_filter(fn){var n=fn.match(/0000(\d+)\(\d\)\.pdf/);if(!n)return true;n=n[1];if(n!=0&&n!=1&&n!=7&&n!=10&&n!=13&&n!=15&&n!=26&&n!=28)return true;try{n=fn.match(/(\d+)\(\d\)\.pdf/);FileSystemObject.MoveFile(n[1]+'('+(n[1]?vol-1:vol-2)+').pdf',n[1]+'.pdf');}catch(e){}return;}
	var vol=11,doMove=move_file(new RegExp('(\\d+)\\('+vol+'\\)\\.pdf'),'$1.pdf');
	write_to_file('move.log','-'.x(60)+new_line+doMove.log,open_format.TristateTrue,ForAppending);
	write_to_file('move.undo.'+vol+'.txt',doMove.undo,open_format.TristateTrue),write_to_file('move.undo.'+vol+'.bat',doMove.undo);//bat不能用open_format.TristateTrue
	alert('Done '+doMove.succeed+'/'+doMove.list.length);

	for Win98, turn lower case:
	move_file(/^[A-Z\d.]+$/,function($0){return '_mv_tmp_'+$0.toLowerCase();},'.',move_file.f.include_folder|move_file.f.include_subfolder);
	alert(move_file(/^_mv_tmp_/,'','.',move_file.f.include_folder|move_file.f.include_subfolder).log);


for(var i=0,j,n,m;i<40;i++)
 if(!fso.FileExists(n='0000'+(i>9?'':'0')+i+'.pdf'))for(j=0;j<25;j++)
  if(fso.FileExists(m='0000'+(i>9?'':'0')+i+'('+j+').pdf')){try{fso.MoveFile(m,n);}catch(e){}break;}

TODO:
move newer	把新檔移到目的地，舊檔移到 bak。

*/
CeL.IO.Windows.file
.
/**
 * move/rename files, ** use RegExp, but no global flag **<br/>
 * 可用 move_file_filter() 來排除不要的<br/>
 * 本函數可能暫時改變目前工作目錄！
 * @param from
 * @param to
 * @param base_path
 * @param flag
 * @param {Function} filter	可用 filter() 來排除不要的
 * @return	{Object} report
 * @since	2004/4/12 17:25
 * @requires	path_separator,fso,WshShell,new_line,Enumerator
 * @memberOf	CeL.IO.Windows.file
 */
move_file = function(from, to, base_path, flag, filter) {
	var _s = arguments.callee, _f = _s.f
	// '.?': 一定會match
	default_from = new RegExp('.?'), t, CurrentDirectory, report = {};
	// alert(typeof from+','+from.constructor);
	if (flag & _f.reverse)
		//flag-=_f.reverse,
		t = from, from = to, to = t;
	if (!from)
		from = default_from;
	else if (typeof from != 'string'
		&& (typeof from != 'object' || !(from instanceof RegExp)
				&& !(from = '' + from)))
		from = default_from;
	report.list = [], report.succeed = report.failed = 0,
	report.undo = report.log = '';

	if (!base_path)
		base_path = '.' + path_separator;
	else if (typeof get_folder === 'function')
		base_path = get_folder(base_path);

	if ((base_path = '' + base_path).slice(
			// -1, or try: base_path.length-path_separator.length
			-1) != path_separator)
		base_path += path_separator;

	if (typeof fso === 'undefined')
		fso = new ActiveXObject("Scripting.FileSystemObject");
	else if (typeof fso !== 'object')
		throw new Error(1, 'fso was already seted!');
	try {
		dir = fso.GetFolder(base_path);
	} catch (e) {
		throw new Error(e.number,
				'move_file(): 基準路徑不存在\n' + e.description);
	}

	// TODO: 對from不存在與為folder之處裡: fuzzy

	if (flag & _f.include_subfolder) {
		CurrentDirectory = WshShell.CurrentDirectory;
		for ( var i = new Enumerator(dir.SubFolders); !i.atEnd(); i
		.moveNext())
			_s(from, to, i.item(), flag);
		if (base_path)
			// 改變目前工作目錄
			WshShell.CurrentDirectory = base_path;
	}
	// if(flag&_f.include_folder){}
	var i, f = new Enumerator(dir.Files), use_exact = typeof from === 'string', overwrite = flag
	& _f.overwrite, not_test = !(flag & _f.Test), func = flag
	& _f.copy ? 'copy' : to === _f.remove || flag & _f.remove
			&& !to ? 'delete' : from != default_from || to ? 'move'
					: 'list';
	// if(func=='delete')to=_f.remove; // 反正不是用這個判別的
	//alert('use_exact: '+use_exact+'\nbase_path: '+base_path+'\nfrom: '+from);
	// BUG: 這樣順序會亂掉，使得 traverse (遍歷)不完全
	for (; !f.atEnd(); f.moveNext())
		if (i = f.item(), use_exact && i.Name == from || !use_exact
				&& from.test(i.Name)) {
			report.list.push(i.Name);

			if (typeof filter == 'function' && !filter(i.Name))
				continue;
			t = func == 'copy' || func == 'move' ? i.Name.replace(from,
					typeof to === 'object' ? to.source : to) : '';

			if (t)
				try {
					report.log += func + ' [' + i.Name + ']'
					+ (t ? ' to [' + t + '] ' : '');
					var u = '';
					t = (base_path == default_from ? base_path : '')
					+ t;
					if (func == 'delete') {
						if (not_test)
							i.Delete(overwrite);
					} else if (!fso.FileExists(t) || overwrite) {
						if (not_test) {
							if (overwrite && fso.FileExists(t))
								fso.DeleteFile(t);
							if (func == 'copy')
								//	Copy() 用的是 FileSystemObject.CopyFile or FileSystemObject.CopyFolder, 亦可用萬用字元(wildcard characters)
								i.Copy(t, overwrite);
							else
								i.Move(t);
						}
						u = 'move	' + t + '	' + i.Name + new_line;
					} else {
						report.log += ': target existing, ';
						throw 1;
					}
					report.log += 'succeed.' + new_line,
					report.undo += u, report.succeed++;
				} catch (e) {
					report.log += 'failed.' + new_line, report.failed++;
				}
				//alert(i.Name+','+t);
		}

	if (flag & _f.include_subfolder && CurrentDirectory)
		WshShell.CurrentDirectory = CurrentDirectory;
	report.log += new_line + (not_test ? '' : '(test)') + func + ' ['
	+ from + '] to [' + to + ']' + new_line
	+ (typeof gDate == 'function' ? gDate() + '	' : '')
	+ 'done ' + report.succeed + '/' + report.list.length
	+ new_line;
	return report;
};

//var move_file.f;
//setObjValue('move_file.f','none=0,overwrite=1,fuzzy=2,reverse=4,include_folder=8,include_subfolder=16,Test=32,copy=64,remove=128','int');
CeL.IO.Windows.file
.
/**
 * <a href="#.move_file">move_file</a> 的 flag enumeration
 * @constant
 * @memberOf	CeL.IO.Windows.file
 */
move_file.f = {
		/**
		 * null flag
		 * @memberOf CeL.IO.Windows.file
		 */
		none : 0,
		/**
		 * overwrite target
		 * @memberOf CeL.IO.Windows.file
		 */
		overwrite : 1,
		/**
		 * If source don't exist but target exist, than reverse.
		 * @deprecated	TODO
		 * @memberOf CeL.IO.Windows.file
		 */
		fuzzy : 2,
		/**
		 * reverse source and target
		 * @memberOf CeL.IO.Windows.file
		 */
		reverse : 4,
		/**
		 * include folder
		 * @memberOf CeL.IO.Windows.file
		 */
		include_folder : 8,
		/**
		 * include sub-folder
		 * @memberOf CeL.IO.Windows.file
		 */
		include_subfolder : 16,
		/**
		 * Just do a test
		 * @memberOf CeL.IO.Windows.file
		 */
		Test : 32,
		/**
		 * copy, instead of move the file
		 * @memberOf CeL.IO.Windows.file
		 */
		copy : 64,
		/**
		 * 當 target 指定此 flag，或包含此 flag 而未指定 target 時，remove the source。
		 * @memberOf CeL.IO.Windows.file
		 */
		remove : 128
};

CeL.IO.Windows.file
.
/**
 * move file
 * @requires	fso,get_folder,getFN,initWScriptObj
 * @memberOf	CeL.IO.Windows.file
 */
mv = function(from, to, dir, onlyFN, reverse) {
	if (!from || !to || from == to)
		return new Error(1, 'filename error.');
	var e;
	dir = get_folder(dir);

	if (reverse)
		e = from, from = to, to = e;
	e = function(_i) {
		return fso.FileExists(_i) ? _i : dir ? dir
				+ (onlyFN ? getFN(_i) : _i) : null;
	};

	try {
		// alert('mv():\n'+dir+'\n\n'+e(from)+'\n→\n'+e(to));
		fso.MoveFile(e(from), e(to));
		return;
	} catch (e) {
		e.message = 'mv():\n' + from + '\n→\n' 
				+ to// +'\n\n'+e.message
				;
		return e;
	}
};


/*
function mv(from,to,dir,onlyFN,reverse){
 var e,_f,_t;
 dir=get_folder(dir);

 if(reverse)e=from,from=to,to=e;
 _f=from;
 _t=to;
 to=0;
 e=function(_i){
  return fso.FileExists(_i)?_i:dir&&fso.FileExists(_i=dir+(onlyFN?getFN(_i):_i))?_i:0;
 };

 try{
  if(!(_f=e(_f)))to=1;else if(!(_t=e(_t)))to=2;
  else{
   alert('mv():\n'+dir+'\n\n'+_f+'\n→\n'+_t);
   fso.MoveFile(_f,_t);
   return;
  }
 }catch(e){return e;}
 return e||new Error(to,(to==1?'移動するファイルは存在しない':'移動先が既存した')+':\n'+_f+'\n→\n'+_t);
}


function mv(from,to,dir,onlyFN,reverse){
 var e,_f,_t;
 dir=get_folder(dir);

 if(reverse)e=from,from=to,to=e;
 _f=from,_t=to,to=e=0;

 try{
  if(!fso.FileExists(_f)&&(!dir||!fso.FileExists(_f=dir+(onlyFN?getFN(_f):_f))))to=1;
  else if(fso.FileExists(_t)&&(!dir||fso.FileExists(_t=dir+(onlyFN?getFN(_t):_t))))to=2;
  else{
   alert('mv():\n'+dir+'\n'+_f+'\n→\n'+_t);
   //fso.MoveFile(_f,_t);
   return;
  }
 }catch(e){}
 return e||new Error(to,(to==1?'移動するファイルは存在しない':'移動先が既存した')+':\n'+_f+'\n→\n'+_t);
}

*/


/*

下面一行調到檔案頭
var get_file_details_items,get_file_details_get_object=-62.262;
*/
CeL.IO.Windows.file
.
/**
 * get file details (readonly)
 * @example
 * get_file_details('path');
 * get_file_details('file/folder name',parentDir);
 * get_file_details('path',get_file_details_get_object);
 * @see	<a href="http://msdn.microsoft.com/en-us/library/bb787870%28VS.85%29.aspx" accessdate="2009/11/29 22:52" title="GetDetailsOf Method (Folder)">GetDetailsOf Method (Folder)</a>
 * @memberOf	CeL.IO.Windows.file
 */
get_file_details = function(fileObj, parentDirObj) {
	var i, n, r;
	// WinShell=new ActiveXObject("Shell.Application");
	if (typeof WinShell == 'undefined' || !fileObj)
		return;

	// deal with fileObj & parentDirObj
	if (parentDirObj === get_file_details_get_object)
		parentDirObj = 0, n = 1;
	// else n='';
	if (!parentDirObj) {
		// fileObj is path
		if (typeof fileObj != 'string')
			return;
		if (i = fileObj.lastIndexOf('/') + 1)
			parentDirObj = fileObj.slice(0, i - 1), fileObj = fileObj
			.slice(i);
		else
			return;
	}
	if (typeof parentDirObj == 'string')
		parentDirObj = WinShell.NameSpace(parentDirObj);
	if (typeof fileObj == 'string' && fileObj)
		fileObj = parentDirObj.ParseName(fileObj);
	if (n)
		// just get [(object)parentDirObj,(object)fileObj]
		return [ parentDirObj, fileObj ];

	// get item name
	if (typeof get_file_details_items != 'object') {
		get_file_details_items = [];
		for (i = 0, j; i < 99; i++)
			// scan cols
			if (n = WinShell.NameSpace(0).GetDetailsOf(null, i))
				get_file_details_items[i] = n;
	}

	// main process
	//for(i=0,r=[];i<get_file_details_items.length;i++)
	r = [];
	for (i in get_file_details_items) {
		//if(get_file_details_items[i])
		r[get_file_details_items[i]] = r[i] = parentDirObj
		.GetDetailsOf(fileObj, i);
	}

	return r;
};


CeL.IO.Windows.file
.
/**
 * FileSystemObject Object Attributes Property
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/5tx15443%28VS.85%29.aspx" accessdate="2010/1/9 8:11">Attributes Property</a>
 * @memberOf	CeL.IO.Windows.file
 * @since	2010/1/9 08:33:36
 */
fso_attributes = {
	/**
	 * Default. No attributes are set.
	 * @memberOf	CeL.IO.Windows.file
	 */
	none : 0,
	/**
	 * Normal file. No attributes are set.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Normal : 0,
	/**
	 * Read-only file. Attribute is read/write.
	 * @memberOf	CeL.IO.Windows.file
	 */
	ReadOnly : 1,
	/**
	 * Hidden file. Attribute is read/write.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Hidden : 2,
	/**
	 * System file. Attribute is read/write.
	 * @memberOf	CeL.IO.Windows.file
	 */
	System : 4,
	/**
	 * Disk drive volume label. Attribute is read-only.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Volume : 8,
	/**
	 * Folder or directory. Attribute is read-only.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Directory : 16,
	/**
	 * File has changed since last backup. Attribute is read/write.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Archive : 32,
	/**
	 * Link or shortcut. Attribute is read-only.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Alias : 1024,
	/**
	 * Compressed file. Attribute is read-only.
	 * @memberOf	CeL.IO.Windows.file
	 */
	Compressed : 2048
};

//	reverse map
_.fso_attributes_reverse=[];
for (i in _.fso_attributes)
	if (i !== 'none')
		_.fso_attributes_reverse[_.fso_attributes[i]] = i;

/*
TODO
	未來：change_attributes(path,'-ReadOnly&-Hidden&-System')

下面調到檔案頭
setObjValue('Attribute','Normal=0,none=0,ReadOnly=1,Hidden=2,System=4,Volume=8,Directory=16,Archive=32,Alias=64,Compressed=128','int');
setObjValue('AttributeV','0=Normal,1=ReadOnly,2=Hidden,4=System,8=Volume,16=Directory,32=Archive,64=Alias,128=Compressed');
*/
CeL.IO.Windows.file
.
/**
 * 改變檔案之屬性。
 * chmod @ UNIX
 * @param	F	file path
 * @param	A	attributes, 屬性
 * @example
 * change_attributes(path,'-ReadOnly');
 * @memberOf	CeL.IO.Windows.file
 */
change_attributes = function(F, A) {
	if (!F)
		return -1;

	if (typeof F === 'string')
		try {
			F = fso.GetFile(F);
		} catch (e) {
			return -2;
		}

	var a;
	try {
		a = F.Attributes;
	} catch (e) {
		return -3;
	}

	if (typeof A === 'undefined')
		A = a;
	else if (A === '' || A == 'Archive')
		A = 32;
	else if (A == 'Normal')
		A = 0;
	else if (isNaN(A))
		if (A.charAt(0) === 'x' || A.charAt(0) === '-')
			if (A = -_.fso_attributes[A.substr(1)], A && a % (A << 2))
				A = a + A;
			else
				A = a;
		else if (A = _.fso_attributes[A], A && a % (A << 2) == 0)
			A = a + A;
		else
			A = a;
	else if (_.fso_attributes_reverse[A])
		if (a % (A << 2) == 0)
			A = a + A;
		else
			A = a;
	else if (_.fso_attributes_reverse[-A])
		if (a % (A << 2))
			A = a + A;
		else
			A = a;

	if (a != A)
		try {
			F.Attributes = A;
		} catch (e) {
			//popErr(e);
			library_namespace.err(e);
			//	70：防寫（沒有使用權限）
			return 70 == (e.number & 0xFFFF) ? -8 : -9;
		}
	return F.Attributes;
};





CeL.IO.Windows.file
.
/**
 * 開檔處理<br/>
 * 測試是否已開啟資料檔之測試與重新開啟資料檔
 * @param FN	file name
 * @param NOTexist	if NOT need exist
 * @param io_mode	IO mode
 * @return
 * @requires	fso,WshShell,iomode
 * @memberOf	CeL.IO.Windows.file
 */
openDataTest = function(FN, NOTexist, io_mode) {
	if (!FN)
		return 3;
	if (NOTexist && !fso.FileExists(FN))
		return 0;
	if (!io_mode)
		io_mode = _.iomode.ForAppending;
	for (;;)
		try {
			var Fs = fso.OpenTextFile(FN, ForAppending);
			Fs.Close();
			break;
		} catch (e) {
			// 對執行時檔案已經開啟之處理
			//if(typeof e=='object'&&e.number&&(e.number&0xFFFF)==70)
			if ((e.number & 0xFFFF) != 70) {
				return pErr(e, 0,
						'開啟資料檔 [<green>' + FN + '<\/>] 時發生錯誤！'),
						6 == alert(
								'開啟資料檔 [' + FN + ']時發生不明錯誤，\n	是否中止執行？',
								0, ScriptName + ' 測試是否已開啟資料檔：發生不明錯誤！',
								4 + 48) ? 1 : 0;
			}
			if (2 == WshShell.Popup(
					'★資料檔：\n\	' + FN + '\n	無法寫入！\n\n可能原因與解決方法：\n	①資料檔已被開啟。執行程式前請勿以其他程式開啟資料檔！\n	②資料檔被設成唯讀，請取消唯讀屬性。',
					0, ScriptName + '：資料檔開啟發生錯誤！', 5 + 48))
				return 2;
		}
	return 0;
};

CeL.IO.Windows.file
.
/**
 * 
 * @param FN
 * @param format
 * @param io_mode
 * @return
 */
open_template = function(FN, format, io_mode) {
	/**
	 * file
	 * @inner
	 * @ignore
	 */
	var F,
	/**
	 * file streams
	 * @inner
	 * @ignore
	 */
	Fs;
	if (!io_mode)
		io_mode = _.iomode.ForReading;
	if (!format)
		//format=autodetectEncode(FN);
		format = _.open_format.TristateUseDefault;// TristateTrue
	try {
		F = fso.GetFile(FN);
		//Fs=_.open_file(FN,format,io_mode);
		Fs = F.OpenAsTextStream(io_mode, format);
	} catch (e) {
		// 指定的檔案不存在?
		pErr(e);
		// quit();
	}
	return Fs;
};

//var openOut.f;	//	default format
function openOut(FN,io_mode,format){
 var OUT,OUTs,_f=arguments.callee.f;
 if(!io_mode)io_mode=_.iomode.ForWriting;
 if(!format)format=_f=='string'&&_f?_f:_.open_format.TristateUseDefault;
 try{
  OUT=fso.GetFile(FN);
 }
 catch(e){try{
  //指定的檔案不存在
  var tmp=fso.CreateTextFile(FN,true);
  tmp.Close();
  OUT=fso.GetFile(FN);
 }catch(e){pErr(e);}}

 try{OUTs=OUT.OpenAsTextStream(io_mode,format);}catch(e){pErr(e);}

 return OUTs;
};







//	2007/5/31 21:5:16
compressF.tool={
	WinRAR:{path:'"%ProgramFiles%\\WinRAR\\WinRAR.exe"',ext:'rar'
		,c:{cL:'$path $cmd $s $archive -- $files',cmd:'a'	//	cL:command line, c:compress, s:switch
			,s:'-u -dh -m5 -os -r -ts'	// -rr1p -s<N> -ap -as -ep1 -tl -x<f> -x@<lf> -z<f>  -p[p] -hp[p]	//	rar等
			//,l:'-ilog logFN'
		}
		,u:{cL:'$path $cmd $archive $eF $eTo',cmd:'e'}	//	uncompress
		,t:{cL:'$path $cmd $archive',cmd:'t'}	//	test
	}
	,'7-Zip':{path:'"%ProgramFiles%\\7-Zip\\7zg.exe"',ext:'7z'
		,c:{cL:'$path $cmd $s $archive $files',cmd:'u',s:'-mx9 -ms -mhe -mmt -uy2'}	//	compress
		,u:{cL:'$path $cmd $archive $eF $_e',cmd:'e',_e:function(fO){return fO.eTo?'-o'+fO.eTo:'';}}	//	uncompress
		,t:{cL:'$path $cmd $archive',cmd:'t'}	//	test
	}
}
/*
test:
var base='C:\\kanashimi\\www\\cgi-bin\\program\\misc\\';
compress(base+'jit','_jit.htm',{tool:'7-Zip',s:''});
uncompress(base+'jit',base,{tool:'7-Zip'});


fO={
	tool:'WinRAR'	//	or '7-Zip'
	,m:'c'	//	method
	,s:''	//	switch
	,archive:''	//	archive file
	,files=''	//	what to compress
	,eTo=''	//	where to uncompress
	,eF=''	//	what to uncompress
	,rcL=1	//	rebuild command line
}
*/
// solid, overwrite, compressLevel, password
function compressF(fO){	//	flags object
 // 參數檢查: 未完全
 if(!fO)fO={};
 if(typeof fO!='object')return;
 if(!fO.tool)fO.tool='WinRAR';
 //if(!fO.m)fO.m='c';//method
 if(!fO.m||!fO.archive&&(fO.m!='c'||fO.m=='c'&&!fO.files))return;
 if(fO.m=='c'){
  if(typeof fO.files!='object')fO.files=fO.files?[fO.files]:fO.archive.replace(/\..+$/,'');
  if(!fO.archive)fO.archive=fO.files[0].replace(/[\\\/]$/,'')+_t.ext;
  fO.files='"'+fO.files.join('" "')+'"';
 }
 var i,_t=compressF.tool[fO.tool],_m,_c;
 if(!_t||!(_m=_t[fO.m]))return;
 else if(!/\.[a-z]+$/.test(fO.archive))fO.archive+='.'+_t.ext;
 //if(fO.bD)fO.archive=fO.bD+(/[\\\/]$/.test(fO.bD)?'':'\\')+fO.archive;	//	base directory, work directory, base folder
 if(!/["']/.test(fO.archive))fO.archive='"'+fO.archive+'"';
 //alert('compressF(): check OK.');
 // 構築 command line
 if(_m._cL&&!fO.rcL)_c=_m._cL;	//	rebuild command line
 else{
  _c=_m.cL.replace(/\$path/,_t.path);
  for(i in _m)if(typeof fO[i]=='undefined')_c=_c.replace(new RegExp('\\$'+i),typeof _m[i]=='function'?_m[i](fO):_m[i]||'');
  _m._cL=_c;
  //alert('compressF():\n'+_c);
 }
 for(i in fO)_c=_c.replace(new RegExp('\\$'+i),fO[i]||'');
 if(_c.indexOf('$')!=-1){alert('compressF() error:\n'+_c);return;}
 alert('compressF() '+(_c.indexOf('$')==-1?'run':'error')+':\n'+_c);
 // run
 WshShell.Run(_c,0,true);
}
//compress[generateCode.dLK]='compressF';
function compress(archive,files,fO){	//	compress file path, what to compress, flags object
 if(!fO)fO={};else if(typeof fO!='object')return;
 if(!fO.m)fO.m='c';
 if(archive)fO.archive=archive;
 if(files)fO.files=files;
 return compressF(fO);
}
//uncompress[generateCode.dLK]='uncompressF';
function uncompress(archive,eTo,fO){	//	compress file path, where to uncompress, flags object
 if(!fO)fO={};else if(typeof fO!='object')return;
 if(!fO.m)fO.m='u';
 if(!fO.eF)fO.eF='';
 if(archive)fO.archive=archive;
 if(eTo)fO.eTo=eTo;
 return compressF(fO);
};







/*
	轉換捷徑, 傳回shortcut的Object. true path
	http://msdn2.microsoft.com/en-us/library/xk6kst2k.aspx
	http://yuriken.hp.infoseek.co.jp/index3.html
*/
var p;
//dealShortcut[generateCode.dLK]='initWScriptObj';//,parseINI
function dealShortcut(path,rtPath){
 if(typeof path!='string')path='';
 else if(/\.(lnk|url)$/i.test(path)){
  var sc=WshShell.CreateShortcut(path),p=sc.TargetPath,_i;
  //	檔名有可能是不被容許的字元（不一定總是有'?'），這時只有.url以文字儲存還讀得到。
  if(/*(''+sc).indexOf('?')!=-1*/!p&&/\.url$/i.test(path)&&typeof parseINI=='function'){
   p=parseINI(path,0,1);
   sc={_emu:p};
   sc.TargetPath=(p=p.InternetShortcut).URL;
   for(_i in p)sc[_i]=p[_i];
/*
URL File Format (.url)	http://www.cyanwerks.com/file-format-url.html
[DEFAULT]
BASEURL=http://so.7walker.net/guide.php
[DOC#n(#n#n#n…)]
[DOC#4#5]
BASEURL=http://www.someaddress.com/frame2.html
[DOC_adjustiframe]
BASEURL=http://so.7walker.net/guide.php
ORIGURL=http://so.7walker.net/guide.php
[InternetShortcut]
URL=http://so.7walker.net/guide.php
Modified=50A8FD7702D1C60106
WorkingDirectory=C:\WINDOWS\
ShowCommand=	//	規定Internet Explorer啟動後窗口的初始狀態：7表示最小化，3表示最大化；如果沒有ShowCommand這一項的話則表示正常大小。
IconIndex=1	//	IconFile和IconIndex用來為Internet快捷方式指定圖標
IconFile=C:\WINDOWS\SYSTEM\url.dll
Hotkey=1601

Hotkey:
下面加起來: Fn 單獨 || (Fn || base) 擇一 + additional 擇2~3
base:
0=0x30(ASCII)
9=0x39(ASCII)
A=0x41(ASCII)
Z=0x5a(ASCII)
;=0xba
=
,
-
.
/
`=0xc0
[=0xdb
\
]
'=0xde

Fn:
F1=0x70
..
F12=0x7b

additional:
Shift=0x100
Ctrl=0x200
Alt=0x400

*/
   p=p.URL;
  }
  if(!rtPath)return sc;
  path=/^file:/i.test(p)?p.replace(/^[^:]+:\/+/,'').replace(/[\/]/g,'\\'):p;	//	/\.url$/i.test(path)?'':p;
 }
 return rtPath?path:null;
};

//filepath=OpenFileDialog();	基於安全，IE無法指定初始值或型態
//OpenFileDialog[generateCode.dLK]='IEA';
function OpenFileDialog(){
 var IE=new IEA,o;
 if(!IE.OK(1))return null;
 IE.write('<input id="file" type="file"/>');// value="'+dP+'"	useless
 with(IE.getE('file'))focus(),click(),o=value;
 //IE.setDialog(200,400).show(1);
 IE.quit();
 return o||null;
};


//	是否為檔案
function isFile(p,c){//file path,create
 if(!p)return 0;
 if(typeof fso=='undefined')
  fso=new ActiveXObject("Scripting.FileSystemObject");
 if(fso.FileExists(p))
  return true;

 p=getFN(p);
 if(c)try{c=fso.CreateTextFile(p,true);c.Close();}catch(e){}
 return fso.FileExists(p);
};
//	是否為目錄
function isFolder(p,c){if(!p)return 0;//path,create	return 0:not,1:absolute,2:relative path
 if(fso.FolderExists(p=turnToPath(p)))return isAbsPath(p)?1:2;
 if(c)try{fso.CreateFolder(p);return isAbsPath(p)?1:2;}catch(e){}
 return 0;
}
//	get directory name of a path
function get_folder(FP,mode){	//	mode=0:path,1:filename
 if(typeof FP=='object'&&typeof FP.Path=='string')
  if(typeof FP.IsRootFolder!='undefined')return FP.Path;
  else FP=FP.Path;
 if(typeof FP!='string')return '';
 //else if(/^[a-z]$/i.test(FP))FP+=':\\';
 //if(FP.slice(-1)!='\\')FP+='\\';
 var i=FP.lastIndexOf('\\');
 if(i==-1)i=FP.lastIndexOf('/');
 return i==-1?FP:mode?FP.substr(i+1):FP.slice(0,i+1);
}



//	取得下一個序號的檔名，如輸入pp\aa.txt將嘗試pp\aa.txt→pp\aa[pattern].txt
function getNextSerialFN(FP,bs,pattern){	//	FP:file path,bs:begin serial,pattern:增添主檔名的模式，包含Ser的部分將被轉換為序號
 if(!FP)return;if(isNaN(bs))if(!fso.FileExists(FP))return FP;else bs=0;
 var i=FP.lastIndexOf('.'),base,ext,Ser=':s:';
 if(i==-1)base=FP,ext='';else base=FP.slice(0,i),ext=FP.substr(i);	//fso.GetBaseName(filespec);fso.GetExtensionName(path);fso.GetTempName();
 if(!pattern)pattern='_'+Ser;i=pattern.indexOf(Ser);
 if(i==-1)base+=pattern;else base+=pattern.slice(0,i),ext=pattern.substr(i+Ser.length)+ext;
 for(i=bs||0;i<999;i++)if(!fso.FileExists(base+i+ext))return base+i+ext;
 return;
}


CeL.IO.Windows.file
.
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @example
 * //	較安全的讀檔：
 * t=translate_AdoStream_binary_data(read_all_file(FP,'binary'));
 * write_to_file(FP,t,'iso-8859-1');
 * @see
 * <a href="http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html">Hawk&apos;s W3 Laboratory : Disposable WSH : 番外編：文字エンコーディングとADODB.Stream</a>
 * @memberOf	CeL.IO.Windows.file
 */
translate_AdoStream_binary_data=function(data,len,type){
	var _s = arguments.callee,_i=0,charArray,val,DOM=_s.XMLDOM,pos,txt;
 if(!DOM)
  try{
	DOM=_s.XMLDOM=(new ActiveXObject("Microsoft.XMLDOM")).createElement('tmp');	//	要素名は何でも良い
	DOM.dataType='bin.hex';
  }catch(e){return;}
 if(data!==0)DOM.nodeTypedValue=data,txt=DOM.text,pos=0;//binary data
 else pos=_s.pos,txt=_s.text;
 if(isNaN(len)||len>txt.length/2)len=txt.length/2;

 if(type){
  for(val=0;_i<len;i++)val=0x100*val+parseInt(txt.substr(pos,2),16),pos+=2;
  _s.pos=pos;
  return val;
 }

/*
 if(!(len>0)||len!=parseInt(len))
  alert(pos+','+_i+'==0~len='+len+','+txt.slice(0,8));
*/
 charArray=new Array(parseInt(len));	//	Error 5029 [RangeError] (facility code 10): 陣列長度必須是一有限的正整數
 for(;_i<len;_i++)	//	極慢！用charString+=更慢。
  try{
   //if(_i%100000==0)alert(i);
   //if(_i==40)alert(String.fromCharCode(parseInt(txt.substr(pos,2),16))+'\n'+charArray.join(''));
   charArray.push(String.fromCharCode(parseInt(txt.substr(pos,2),16))),pos+=2;
   //charArray[_i]=String.fromCharCode((t.charCodeAt(_i<<1)<<8)+t.charCodeAt((_i<<1)+1));
  }catch(e){
   e.description='translate_AdoStream_binary_data: 輸入了錯誤的資料:\n'+e.description;
   throw e;
  }
 if(!data)_s.pos=pos;
 return charArray.join('');
};

CeL.IO.Windows.file
.
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @param	data	以 adTypeBinary 讀到的資料
 * @param	pos	position
 * @since	2007/9/19 20:58:26
 * @memberOf	CeL.IO.Windows.file
 */
Ado_binary = function(data,pos){
 this.newDOM();

 if(typeof data=='string'){
  if(!data||typeof getFP=='function'&&!(data=getFP(data)))return;
  this.newFS(data);
  this.setPos(pos||0);
 }else this.setData(data,pos);
};
CeL.IO.Windows.file
.
/**
 * @memberOf	CeL.IO.Windows.file
 */
Ado_binary.prototype={
/**
 * 設定 data
 * 
 * @param data	binary data
 * @param pos
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
setData : function(data, pos) {
	this.DOM.nodeTypedValue = data,// binary data
	this.bt = this.DOM.text;// binary text
	if (!this.AdoS)
		this.len = this.bt.length / 2;
	this.setPos(pos || 0);
},
setPos : function(p) {
	if (!isNaN(p)) {
		if (p < 0)
			p = 0;
		else if (p > this.len)
			p = this.len;
		this.pos = p;
	}
	return this.pos;
},
testLen : function(len) {
	if (!len || len < 0)
		len = this.len;
	if (this.pos + len > this.len)
		len = this.len - this.pos;
	return len;
},
/**
 * read data
 * @private
 * @param len	length
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
readData : function(len) {
	this.AdoS.Position = this.pos;
	var _data = this.AdoS.Read(len);
	//	讀 binary data 用 'iso-8859-1' 會 error encoding.
	this.setData(_data, this.AdoS.Position);
},
read : function(len) {
	var charArray = new Array(len = this.testLen(len)), _i = 0;
	this.readData(len);
	for (; _i < len; _i++)
		try {
			charArray.push(String.fromCharCode(parseInt(this.bt
					.substr(2 * _i, 2), 16)));
			// charArray[i]=String.fromCharCode((t.charCodeAt(i<<1)<<8)+t.charCodeAt((i<<1)+1));
		} catch (e) {
			this.retErr(e);
		}
		return charArray.join('');
},
readNum : function(len) {
	len = this.testLen(len);
	this.readData(len);
	var val = 0, _i = len;
	for (; _i > 0;)
		try {
			val = 0x100 * val
			+ parseInt(this.bt.substr(2 * (--_i), 2), 16);
		} catch (e) {
			this.retErr(e);
		}
		return val;
},
readHEX : function(len) {
	len = this.testLen(len);
	this.readData(len);
	return this.bt;
},
retErr : function(e) {
	e.description = 'translate_AdoStream_binary_data: 輸入了錯誤的資料:\n' + e.description;
	throw e;
},
/**
 * @private
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
newDOM : function() {
	this.DOM = null;
	// try{
	this.DOM = (new ActiveXObject("Microsoft.XMLDOM"))
	.createElement('tmp' + Math.random()); // 要素名は何でも良い
	// }catch(e){return;}
	this.DOM.dataType = 'bin.hex';
},
/**
 * @private
 * @param FP
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
newFS : function(FP) {
	if (FP)
		this.FP = FP;
	else if (!(FP = this.FP))
		return;
	var _i = _.open_file.returnADO;
	_.open_file.returnADO = true;
	this.AdoS = _.open_file(FP, 'binary');
	_.open_file.returnADO = _i;
	if (!this.AdoS)
		return;
	this.AdoS.LoadFromFile(FP);
	this.len = this.AdoS.Size;
},
/**
 * 實際上沒多大效用。實用解決法：少用 AdoStream.Write()
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
renew : function() {
	this.bt = this.data = 0;
	this.newDOM();
	if (this.AdoS && this.FP) {
		this.pos = this.AdoS.Position;
		this.AdoS.Close();
		this.AdoS = null;
		this.newFS();
	}
},
destory : function(e) {
	if (this.AdoS)
		this.AdoS.Close();
	this.AdoS = this.pos = this.bt = this.data = 0;
}
}; //	Ado_binary.prototype={


/*
//	速度過慢，放棄。
//_.open_file.returnADO=true;
function dealBinary(FP,func,interval){
 var t,fs=_.open_file(FP,'binary',ForReading);
 if(!fs)return;
 AdoStream.LoadFromFile(FP);
 if(!interval)interval=1;
 //alert(fs.size)
 while(!fs.EOS)
  if(func(translate_AdoStream_binary_data(fs.Read(interval))))return;
 func();
 fs.Close();
}
*/

/*	配合simple系列使用
http://thor.prohosting.com/~mktaka/html/utf8.html
http://www.andrewu.co.uk/webtech/comment/?703
http://www.blueidea.com/bbs/NewsDetail.asp?id=1488978
http://www.blueidea.com/bbs/NewsDetail.asp?GroupName=WAP+%BC%BC%CA%F5%D7%A8%C0%B8&DaysPrune=5&lp=1&id=1524739
C#	http://www.gotdotnet.com/team/clr/bcl/TechArticles/TechArticles/IOFAQ/FAQ.aspx
http://www.sqlxml.org/faqs.aspx?faq=2
http://www.imasy.or.jp/~hir/hir/tech/js_tips.html

ADODB.Stream	最大問題：不能append
http://msdn2.microsoft.com/en-us/library/ms808792.aspx
http://msdn.microsoft.com/library/en-us/ado270/htm/mdmscadoenumerations.asp
http://study.99net.net/study/web/asp/1067048121.html	http://www.6to23.com/s11/s11d5/20031222114950.htm
http://blog.csdn.net/dfmz007/archive/2004/07/23/49373.aspx
*/
var AdoStream,AdoEnums;	//	ADO Enumerated Constants	http://msdn.microsoft.com/library/en-us/ado270/htm/mdmscadoenumerations.asp
/*	搬到前面
setObjValue('AdoEnums','adTypeBinary=1,adTypeText=2'	//	StreamTypeEnum
+',adReadAll=-1,adReadLine=-2'	//	StreamReadEnum	http://msdn2.microsoft.com/en-us/library/ms806462.aspx
+',adSaveCreateNotExist=1,adSaveCreateOverWrite=2'	//	SaveOptionsEnum
+',adCR=13,adCRLF=-1,adLF=10'	//	LineSeparatorsEnum
,'int');
*/
AdoEnums = {
	adTypeBinary : 1,
	adTypeText : 2,
	adReadAll : -1,
	adReadLine : -2,
	adSaveCreateNotExist : 1,
	adSaveCreateOverWrite : 2,
	adCR : 13,
	adCRLF : -1,
	adLF : 10
};


//_.open_file[generateCode.dLK]='AdoEnums,simpleFileErr,ForReading,ForWriting,ForAppending,TristateUseDefault';//AdoStream
CeL.IO.Windows.file
.
/**
 * 提供給 <a href="#.read_all_file">read_all_file</a>, <a href="#.write_to_file">write_to_file</a> 使用的簡易開檔函數
 * @param FN	file path
 * @param format	open format, e.g., open_format.TristateUseDefault
 * @param io_mode	open mode, e.g., iomode.ForWriting
 * @memberOf	CeL.IO.Windows.file
 */
open_file=function(FN,format,io_mode){
 //if(!FN||typeof isAbsPath=='function'&&typeof getFN=='function'&&!isAbsPath(FN)&&!(FN=getFN(FN)))return;
 //if(!FN||typeof getFP=='function'&&!(FN=getFP(FN)))return;
	var _s = arguments.callee;
 if(typeof format=='string'){
  if(!_s.returnADO&&typeof AdoStream!='undefined')
   try{AdoStream.Close();AdoStream=null;}catch(e){}
  try{
   AdoStream=new ActiveXObject("ADODB.Stream");//var objStream=Server.CreateObject("ADODB.Stream");	//	ASPの場合,Err.Number=-2147221005表不支援
  }catch(e){simpleFileErr=e;AdoStream=null;}
  if(AdoStream){
   //AdoStream.Mode=3;	//	read write
   if(format=='binary')AdoStream.Type=AdoEnums.adTypeBinary;	//	以二進位方式操作
   else{
    AdoStream.Type=AdoEnums.adTypeText;
    try{AdoStream.Charset=format;}catch(e){throw new Error(e.number,'open_file: Error format:\n	('+typeof format+') ['+format+']\n'+e.description);}	//	UTF-8,unicode,shift_jis,Big5,GB2312,ascii=iso-8859-1,_autodetect,_autodetect_all..	HKEY_CLASSES_ROOT\MIME\Database\Charset
   }
   AdoStream.Open();
   //AdoStream.Position=0,AdoStream.LineSeparator=AdoEnums.adLF;
   if(_s.returnADO){var _A=AdoStream;AdoStream=null;return _A;}
   return 0;
  }
  format=0;
 }
 var fs;
 //	使用某些防毒軟體(如諾頓 Norton)時，.OpenTextFile() 可能會被攔截，因而延宕。
 try{
  if(io_mode==_.iomode.ForAppending&&!fso.FileExists(FN))io_mode=_.iomode.ForWriting;	//	無此檔時改 writing
  fs=fso.OpenTextFile(FN,io_mode||_.iomode.ForReading,io_mode==_.iomode.ForWriting/*create*/,format||_.open_format.TristateUseDefault);
 }catch(e){
  simpleFileErr=e;
  try{fs.Close();}catch(e){}
  return -1;
 }
 return fs;
};
CeL.IO.Windows.file
.open_file.returnADO=false;
CeL.IO.Windows.file
.open_file.error;

//	若是僅使用普通的開檔方法（_.open_format.TristateTrue/_.open_format.TristateFalse等，不使用ADODB.Stream），直接引用下兩函數與fso段定義即可。否則還需要引入_.open_file(),setObjValue(),dQuote()
var simpleFileErr,
	//_autodetect	autodetectEncode(file)
	simpleFileAutodetectEncode=-5.4,
	simpleFileDformat=
	CeL.IO.Windows.file
	.open_format.TristateUseDefault;

//_.read_all_file[generateCode.dLK]=_.write_to_file[generateCode.dLK]='simpleFileErr,simpleFileAutodetectEncode,simpleFileDformat,initWScriptObj';//_.open_file,autodetectEncode,getFP,_.open_format.TristateUseDefault
//_.read_all_file[generateCode.dLK]+=',ForReading';_.write_to_file[generateCode.dLK]+=',ForWriting';
//_.read_all_file[generateCode.dLK]+=',translate_AdoStream_binary_data';	//	for _.read_all_file(FP,'binary')
CeL.IO.Windows.file
.
/**
 * 讀取檔案
 * @param FN	file path
 * @param format	open encode = simpleFileDformat
 * @param io_mode	open IO mode = ForReading
 * @param func	do this function per line, or [func, maxsize] (TODO)
 * @return {String} 檔案內容
 * @memberOf	CeL.IO.Windows.file
 */
read_all_file=function(FN,format,io_mode,func){
 simpleFileErr=0;if(format==simpleFileAutodetectEncode)
  format=typeof autodetectEncode=='function'?autodetectEncode(FN):simpleFileDformat;
 if(!FN||typeof getFP=='function'&&!(FN=getFP(FN)))return;
 //var a,fs;try{fs=fso.OpenTextFile(FN,io_mode||_.iomode.ForReading,false,format||simpleFileDformat),a=fs.ReadAll(),fs.Close();}catch(e){simpleFileErr=e;return;}
 var a,fs;//,i,s=0,t;
 if(typeof _.open_file!='function')
  //{if(!FN||typeof getFP=='function'&&!(FN=getFP(FN)))return;
  try{fs=fso.OpenTextFile(FN,io_mode||_.iomode.ForReading,false/*create*/,format||simpleFileDformat);}
  catch(e){simpleFileErr=e;return;}
 else if(fs=_.open_file(FN,format||simpleFileDformat,io_mode||_.iomode.ForReading),fs===-1)return;

 //if(func instanceof Array)s=func[1],func=func[0];
 if(fs!==0)try{
  if(func)
   while(!fs.AtEndOfStream)func(fs.ReadLine());
/*
   while(!fs.AtEndOfStream){
    for(t='',i=0;!fs.AtEndOfStream&&(!t||i<s);i++)
     t+=fs.ReadLine();
    a+=func(t);
   }
*/
  else a=fs.ReadAll();
  fs.Close();
 }catch(e){simpleFileErr=e;try{fs.Close();}catch(e){}return;}
 else if(typeof AdoStream!='undefined'&&AdoStream)
  try{
   AdoStream.LoadFromFile(FN);
   if(AdoStream.Type==AdoEnums.adTypeBinary){
    a=AdoStream.Read(AdoEnums.adReadAll);	//	讀 binary data 用 'iso-8859-1' 會 error encoding.
    if(_.read_all_file.turnBinToStr&&typeof translate_AdoStream_binary_data=='function')a=translate_AdoStream_binary_data(a);
   }else if(func)
    while(!AdoStream.EOS)func(AdoStream.ReadText(AdoEnums.adReadLine));
/*
    while(!AdoStream.EOS){
     for(t='',i=0;!AdoStream.AtEndOfStream&&(!t||i<s);i++)
      t+=AdoStream.ReadText(AdoEnums.adReadLine);
     a+=func(t);
    }
*/
   else a=AdoStream.ReadText(AdoEnums.adReadAll);
   AdoStream.Close();
  }catch(e){
   simpleFileErr=e;
   try{AdoStream.Close();}catch(e){}
   return;
  }
 else simpleFileErr=new Error(1,'unknown error!'),simpleFileErr.name='unknownError';
 return a;
};
CeL.IO.Windows.file
.read_all_file.turnBinToStr=true;


CeL.IO.Windows.file
.
/**
 * 將 content 寫入 file
 * ** ADODB.Stream does not support appending!
 * @param FN	file path
 * @param content	content to write
 * @param format	open format = simpleFileDformat
 * @param io_mode	write mode = ForWriting, e.g., ForAppending
 * @param N_O	DO NOT overwrite
 * @return error No.
 * @memberOf	CeL.IO.Windows.file
 */
write_to_file = function(FN, content, format, io_mode, N_O) {
	simpleFileErr = 0;
	if (format == simpleFileAutodetectEncode)
		format = typeof autodetectEncode == 'function' ? autodetectEncode(FN)
				: simpleFileDformat;
		if (!FN || typeof getFP == 'function' && !(FN = getFP(FN)))
			return 2;
		//var fs;try{fs=fso.OpenTextFile(FN,iomode||ForWriting,true,format||TristateUseDefault);}catch(e){return 2;}if(!fs)return 3;
		//try{fs.Write(content);}catch(e){return e.number&0xFFFF==5?5:4;}	//	5:content中有此local無法相容的字元，例如在中文中寫入日文假名
		var fs;
		if (typeof _.open_file != 'function')
			// {if(!FN||typeof getFP=='function'&&!(FN=getFP(FN)))return 2;
			try {
				fs = fso.OpenTextFile(FN, io_mode || _.iomode.ForWriting,
						true/* create */, format || simpleFileDformat);
				if (!fs)
					return 3;
			} catch (e) {
				simpleFileErr = e;
				return 2;
			}
			else if (fs = _.open_file(FN, format || simpleFileDformat, io_mode
					|| _.iomode.ForWriting), fs === -1)
				return 3;
			else if (!fs && isNaN(fs))
				return 2;
		if (fs !== 0)
			try {
				fs.Write(content);
				fs.Close();
			} catch (e) {
				simpleFileErr = e;
				try {
					fs.Close();
				} catch (e) {
				}
				return simpleFileErr.number & 0xFFFF == 5 ? 5 : 4;
			}
			// AdoStream.SaveToFile()需在AdoStream.Write之後！
			else if (typeof AdoStream != 'undefined' && AdoStream)
				try {
					if (AdoStream.Type == AdoEnums.adTypeText)
						AdoStream.WriteText(content);
					else
						AdoStream.Write(content);
					AdoStream.SaveToFile(FN, io_mode
							|| AdoEnums.adSaveCreateOverWrite);
					AdoStream.Close();
				} catch (e) {
					simpleFileErr = e;
					try {
						AdoStream.Close();
					} catch (e) {
					}
					return 6;
				}
				else {
					simpleFileErr = new Error(1, 'unknown error!'),
					simpleFileErr.name = 'unknownError';
					return 1;
				}
};

//	TODO: unfinished
//simpleDealFile[generateCode.dLK]='autodetectEncode,_.read_all_file,_.write_to_file';
CeL.IO.Windows.file
.
simpleDealFile=function(inFN,func,outFN,format,io_mode,N_O){
 if(!inFN)return;
 if(!outFN)outFN=inFN;
 var e=autodetectEncode(inFN),i=_.read_all_file(inFN,e),o=_.read_all_file(outFN,e),t=func(i,inFN);
 if(typeof t=='string'&&o!=t)return _.write_to_file(outFN,t,e,N_O);
};

/*
var autodetectEncodeSP,autodetectEncodeCode;	//	特殊字元，各種編碼及判別所需最短長度
setObjValue('autodetectEncodeSP','3005=J,3006=J,3402=J,3447=C,3468=J,3473=C,359e=C,360e=C,361a=C,3918=C,396e=C,39cf=C,39d0=C,39df=C,3a73=C,3b4e=C,3b77=J,3c6e=C,3ce0=C,3f57=J,4056=C,415f=C,42c6=J,4302=J,4337=C,43ac=C,43b1=C,43dd=C,44be=J,44d4=J,44d6=C,464c=C,4661=C,4723=C,4729=C,477c=C,478d=C,4947=C,497a=C,497d=C,'
+'4982=C,4983=C,4985=C,4986=C,499b=C,499f=C,49b0=J,49b6=C,49b7=C,4c77=C,4c9f=C,4ca0=C,4ca1=C,4ca2=C,4ca3=C,4d13=C,4d14=C,4d15=C,4d16=C,4d17=C,4d18=C,4d19=C,4dae=C,4e12=J,4e13=C,4e1a=C,4e1b=C,4e1c=C,4e1d=C,4e24=C,4e25=C,4e27=C,4e28=J,4e2a=C,4e34=C,4e3a=C,4e3c=J,4e3d=C,4e3e=C,4e49=C,'
+'4e4c=C,4e50=C,4e54=C,4e60=C,4e61=C,4e62=J,4e66=C,4e70=C,4e71=C,4e8f=C,4e9a=C,4ea7=C,4ea9=C,4eb2=C,4eb5=C,4ebf=C,4ec5=C,4ece=C,4ed0=J,4ed1=C,4ed3=C,4eea=C,4eec=C,4f17=C,4f1b=C,4f1d=J,4f1e=C,4f1f=C,4f20=C,4f24=C,4f25=C,4f26=C,4f27=C,4f2a=C,4f65=C,4f66=J,4fa0=C,4fa1=J,4fa4=J,4fa5=C,'
+'4fa6=C,4fa7=C,4fa8=C,4fa9=C,4faa=C,4fac=C,4fb0=J,4fe3=J,4fe4=J,4fe5=J,4fe6=C,4fe7=J,4fe8=C,4fe9=C,4fea=C,4fed=C,5039=J,503a=C,503b=J,503e=C,5051=J,507b=C,507e=C,507f=C,50a5=C,50a7=C,50a8=C,50a9=C,50cd=J,50de=C,50f2=J,5170=C,5173=C,5174=C,517b=C,517d=C,5181=C,5188=C,5199=C,519b=C,'
+'519c=C,51af=C,51b2=C,51bb=C,51e4=C,51e7=J,51e9=J,51ea=J,51eb=C,51ed=C,51ee=J,51ef=C,51fb=C,51ff=C,520d=C,5218=C,5219=C,521a=C,521b=C,522b=C,522c=C,522d=C,523d=C,523f=C,5240=C,5242=C,5250=C,5251=C,5257=C,5267=C,5273=C,529d=C,529e=C,52a1=C,52a8=C,52b1=C,52b2=C,52b3=C,52bf=C,52cb=C,'
+'52da=C,5301=J,5302=J,5307=J,5326=C,532e=C,533b=C,534e=C,534f=C,5355=C,5356=C,5362=C,5364=C,536b=C,5385=C,5386=C,5389=C,538b=C,538c=C,538d=C,5395=C,53a0=C,53a3=C,53bf=C,53c2=C,53c6=C,53c7=C,53cc=C,53d1=C,53d8=C,53f6=C,53f7=C,53f9=C,53fa=J,53fd=C,540b=J,5413=C,5417=C,542f=C,544e=J,'
+'544f=J,5452=C,5453=C,5455=C,5456=C,5457=C,5458=C,545b=C,545c=C,5484=J,5491=J,5499=C,549b=C,549c=J,549d=C,54cd=C,54d1=C,54d2=C,54d3=C,54d4=C,54d5=C,54d7=C,54d8=J,54d9=C,54dd=C,54df=C,54e9=J,5500=J,551b=C,551d=C,5520=C,5521=C,5522=C,5553=C,5567=C,556c=C,556d=C,556e=C,5570=C,5578=C,'
+'55b0=J,55b7=C,55bd=C,55be=C,55eb=C,55f3=C,5624=C,5631=C,565c=C,565d=C,5678=J,567a=J,56a3=C,56c9=J,56ce=J,56e2=C,56ed=C,56f2=J,56f4=C,56f5=C,56fe=C,5706=C,5715=J,5726=J,5737=J,5738=J,5739=C,573a=C,5746=J,5757=C,575a=C,575b=C,575c=C,575d=C,575e=C,575f=C,5760=C,5784=C,5786=C,5788=J,'
+'5789=J,5792=C,57a4=J,57a6=C,57a9=C,57ab=C,57ac=J,57ad=C,57b0=J,57b2=C,57b3=J,57d6=J,57d8=C,57d9=C,57da=C,5811=C,5815=C,5840=J,5870=J,5899=C,58b8=J,58b9=J,58d7=J,58e5=J,58ee=C,58f0=C,58f3=C,58f6=C,58f8=C,5904=C,5907=C,5934=C,5939=C,593a=C,5941=C,594b=C,5956=C,5986=C,5987=C,5988=C,'
+'598b=J,599b=J,59a9=C,59aa=C,59ab=C,59c9=J,5a04=C,5a05=C,5a06=C,5a07=C,5a08=C,5a32=C,5a34=C,5a47=J,5a72=J,5a73=C,5a74=C,5a75=C,5a76=C,5aac=J,5ad2=C,5ad4=C,5af1=C,5b00=C,5b36=J,5b59=C,5b66=C,5b6a=C,5b93=J,5b9e=C,5ba0=C,5ba1=C,5baa=C,5bbd=C,5bbe=C,5bc9=J,5bdd=C,5bf9=C,5bfb=C,5bfc=C,'
+'5bff=C,5c06=C,5c14=C,5c18=C,5c1d=C,5c27=C,5c34=C,5c3d=C,5c42=C,5c5e=C,5c61=C,5c66=C,5c76=J,5c7f=C,5c81=C,5c82=C,5c96=C,5c97=C,5c98=C,5c9a=C,5c9b=C,5cbc=J,5cbd=C,5cbe=J,5cbf=C,5cc3=C,5cc4=C,5cc5=J,5ce0=J,5ce1=C,5ce3=C,5ce4=C,5ce6=C,5d02=C,5d03=C,5d10=C,5d2c=C,5d2d=C,5d58=C,5d59=J,'
+'5d5a=C,5d5d=C,5d76=J,5dc5=C,5de9=C,5def=C,5e01=C,5e05=C,5e08=C,5e0f=C,5e10=C,5e1c=C,5e26=C,5e27=C,5e2e=C,5e3b=C,5e3c=C,5e7f=C,5e83=J,5e86=C,5e90=C,5e91=C,5e93=C,5e94=C,5e99=C,5e9e=C,5e9f=C,5ebc=C,5f00=C,5f03=C,5f16=J,5f20=C,5f25=C,5f2f=C,5f39=C,5f41=J,5f45=J,5f52=C,5f53=C,5f55=C,'
+'5f7b=C,5f84=C,5f95=C,5fa4=J,5fc6=C,5fdc=J,5fe7=C,5ff0=J,5ffe=C,6001=C,6002=C,6003=C,6004=C,6005=C,6006=C,603a=J,603b=C,603c=C,603f=C,604b=C,6073=C,6076=C,6077=J,6078=C,6079=C,607a=C,607b=C,607c=C,607d=C,60ab=C,60ac=C,60ad=C,60af=C,60e7=C,60e8=C,60e9=C,60eb=C,60ec=C,60ed=C,60ee=C,'
+'60ef=C,6124=C,6126=C,6151=C,6164=C,61d1=C,61d2=C,6206=C,620b=C,620f=C,6217=C,6218=C,6256=J,6267=C,6268=J,6269=C,626a=C,626b=C,626c=C,629a=C,629f=C,62a0=C,62a1=C,62a2=C,62a4=C,62a5=C,62c5=C,62df=C,62e2=C,62e3=C,62e5=C,62e6=C,62e7=C,62e8=C,62e9=C,630a=J,6317=J,6318=J,631a=C,631b=C,'
+'631c=C,631d=C,631e=C,631f=C,6320=C,6321=C,6322=C,6324=C,6325=C,6326=C,6327=J,635e=C,635f=C,6361=C,6363=C,6364=J,6386=C,63b3=C,63b4=C,63b5=J,63b7=C,63b8=C,63ba=C,63bc=C,63fd=C,63ff=C,6400=C,6401=C,6402=C,6405=C,643e=J,6444=C,6445=C,6446=C,6448=C,644a=C,6484=C,64b5=C,64b7=C,64ba=C,'
+'64d3=C,64de=C,6512=C,654c=C,655b=C,6570=C,658b=C,6593=C,65a9=C,65ad=C,65e0=C,65e7=C,65f6=C,65f7=C,65f8=C,6619=C,663c=C,663d=C,663e=C,6653=C,6654=C,6655=C,6682=C,6683=J,66a7=C,66fb=J,6722=J,672f=C,6740=C,6741=J,6742=C,6743=C,6761=C,6762=J,6763=J,6764=J,6765=C,6766=J,6768=C,678c=J,'
+'679e=C,67a0=J,67a1=J,67a2=C,67a3=C,67a5=C,67a6=J,67a7=C,67a8=C,67a9=J,67aa=C,67ab=C,67ad=C,67d5=J,67e0=C,67fd=C,67fe=J,6802=J,6803=J,6807=C,6808=C,6809=C,680a=C,680b=C,680c=C,680d=J,680e=C,680f=C,6811=C,682c=J,6837=C,683e=C,685b=J,685c=J,685d=J,6861=C,6862=C,6863=C,6864=C,6865=C,'
+'6866=C,6867=C,6868=C,6869=C,6898=C,68a6=C,68ba=J,68bb=J,68c0=C,68c2=C,6917=J,6919=J,691a=J,691b=J,691f=C,6920=C,6921=J,6923=J,6924=C,6925=J,6926=J,6928=J,692a=J,692d=C,693f=J,697c=C,697e=J,697f=J,6980=J,6981=J,6984=C,6987=C,6988=C,6989=C,698a=J,69c7=J,69da=C,69db=C,69dd=J,69df=C,'
+'69e0=C,6a2b=J,6a2e=J,6a2f=C,6a30=J,6a31=C,6a3b=J,6a67=J,6a72=J,6a73=J,6a78=J,6a79=C,6a7c=C,6ab0=J,6ae4=J,6b1f=J,6b22=C,6b24=C,6b27=C,6b7c=C,6b87=C,6b8b=C,6b92=C,6b93=C,6b9a=C,6ba1=C,6ba8=C,6bb4=C,6bbb=C,6bc2=C,6bd5=C,6bd9=C,6bdf=J,6be1=C,6bee=J,6bf5=C,6c07=C,6c17=J,6c22=C,6c29=C,'
+'6c47=C,6c49=C,6c62=J,6c64=C,6c9f=C,6ca3=C,6ca4=C,6ca5=C,6ca6=C,6ca7=C,6ca8=C,6ca9=C,6caa=C,6cea=C,6cf7=C,6cf8=C,6cfa=C,6cfb=C,6cfc=C,6cfd=C,6cfe=C,6d43=C,6d45=C,6d46=C,6d47=C,6d48=C,6d49=C,6d4a=C,6d4b=C,6d4d=C,6d4e=C,6d4f=C,6d50=C,6d51=C,6d52=C,6d53=C,6d54=C,6d55=C,6d9b=C,6d9c=J,'
+'6d9d=C,6d9e=C,6d9f=C,6da0=C,6da1=C,6da2=C,6da4=C,6da6=C,6da7=C,6da8=C,6da9=C,6e0a=C,6e0d=C,6e0e=C,6e10=C,6e11=C,6e14=C,6e17=C,6e7e=C,6e7f=C,6e82=J,6e83=C,6e85=C,6e87=C,6ed7=C,6ede=C,6edf=C,6ee0=C,6ee1=C,6ee4=C,6ee5=C,6ee6=C,6ee8=C,6ee9=C,6eea=C,6f47=C,6f4b=C,6f4d=C,6f57=J,6f59=C,'
+'6f76=J,6f9c=C,6fbe=C,6fd1=C,6fd2=C,6ff9=J,704f=C,7067=C,706d=C,706f=C,7075=C,707e=C,707f=C,7080=C,7089=C,709c=C,709d=C,70b9=C,70bb=J,70bc=C,70bd=C,70c1=C,70c2=C,70c3=C,70db=C,70e6=C,70e7=C,70e8=C,70e9=C,70eb=C,70ec=C,70ed=C,7116=C,7118=C,7144=J,7173=J,7194=J,7195=J,71f5=J,7231=C,'
+'7232=C,7237=C,7240=C,724d=C,7275=C,727a=C,728a=C,72b6=C,72b7=C,72b8=C,72b9=C,72c6=J,72c8=C,72de=C,72ec=C,72ed=C,72ee=C,72ef=C,72f1=C,72f2=C,7303=C,730e=C,7315=C,7321=C,732b=C,732e=C,7341=C,736d=C,7391=C,739b=C,73ae=C,73af=C,73b0=C,73b1=C,73ba=C,73c6=J,73d1=C,73f2=C,740e=C,740f=C,'
+'7410=C,7411=J,743c=C,7443=J,7477=C,748e=C,74d2=C,74e7=J,74e9=J,74ea=J,74ef=C,74f0=J,74f1=J,74f2=J,74f8=J,74fc=J,7505=J,7523=C,7535=C,753b=C,753c=J,7545=C,7551=J,7560=J,7569=J,7573=J,7574=C,757d=J,7596=C,7597=C,759f=C,75a0=C,75a1=C,75ac=C,75ae=C,75af=C,75c7=J,75c8=C,75c9=C,75e8=C,'
+'75eb=C,7605=C,7606=C,7617=C,7618=C,762a=C,762b=C,762e=C,763b=C,763e=C,763f=C,764c=J,765e=C,7663=C,7667=C,766a=J,766b=C,7691=C,76b1=C,76b2=C,76cf=C,76d0=C,76d1=C,76d6=C,76d8=C,770d=C,7750=C,7751=C,7792=C,7798=C,77a9=C,77eb=C,77f6=C,77fe=C,77ff=C,7800=C,7801=C,7816=C,7817=C,781a=C,'
+'781c=C,783a=C,783b=C,783e=C,7840=C,7855=C,7856=C,7857=C,7859=C,785a=C,7872=J,7874=J,7877=C,788d=C,7897=J,789b=C,789c=C,78b5=J,78b8=C,7935=J,793c=C,794e=C,7962=C,796f=C,7977=C,7978=C,7985=C,79ef=C,79f0=C,79fd=C,7a23=C,7a2d=C,7a33=C,7a43=J,7a51=C,7a5d=J,7a77=C,7a83=C,7a8d=C,7a8e=C,'
+'7a9c=C,7a9d=C,7aa5=C,7aa6=C,7aad=C,7ac8=C,7acd=J,7acf=J,7ad3=J,7ad5=J,7ad6=C,7ade=C,7ae1=J,7aea=C,7af0=J,7b02=J,7b03=C,7b0b=C,7b14=C,7b15=C,7b39=J,7b3a=C,7b3c=C,7b3d=J,7b3e=C,7b5a=C,7b5b=C,7b79=C,7b7e=C,7b80=C,7b93=C,7ba5=J,7ba6=C,7ba7=C,7ba8=C,7ba9=C,7baa=C,7bab=C,7bcf=J,7bd1=C,'
+'7bd3=C,7bee=C,7c13=J,7c16=C,7c17=J,7c31=J,7c41=C,7c4f=J,7c74=C,7c75=J,7c7b=C,7c7e=J,7c81=J,7c82=J,7c8d=J,7c8f=J,7c90=J,7c9c=C,7c9d=C,7ca0=J,7ca8=J,7caa=C,7cab=J,7cad=J,7cae=C,7cc0=J,7cc1=C,7cce=J,7cd8=J,7d25=C,7d26=J,7d27=C,7d5d=C,7d76=C,7d77=C,7d89=C,7d9b=J,7dab=C,7db3=C,7dd1=C,'
+'7dd5=J,7dfc=C,7e05=J,7e27=C,7e28=J,7e4a=J,7e67=J,7e6e=C,7e83=J,7e90=J,7ea0=C,7ea1=C,7ea2=C,7ea3=C,7ea4=C,7ea5=C,7ea6=C,7ea7=C,7ea8=C,7ea9=C,7eaa=C,7eab=C,7eac=C,7ead=C,7eaf=C,7eb0=C,7eb1=C,7eb2=C,7eb3=C,7eb4=C,7eb5=C,7eb6=C,7eb7=C,7eb8=C,7eb9=C,7eba=C,7ebc=C,7ebd=C,7ebe=C,7ebf=C,'
+'7ec0=C,7ec1=C,7ec2=C,7ec3=C,7ec4=C,7ec5=C,7ec6=C,7ec7=C,7ec8=C,7ec9=C,7eca=C,7ecb=C,7ecc=C,7ecd=C,7ece=C,7ecf=C,7ed0=C,7ed1=C,7ed2=C,7ed3=C,7ed4=C,7ed5=C,7ed6=C,7ed7=C,7ed8=C,7ed9=C,7eda=C,7edb=C,7edc=C,7edd=C,7ede=C,7edf=C,7ee0=C,7ee1=C,7ee2=C,7ee3=C,7ee5=C,7ee6=C,7ee7=C,7ee8=C,'
+'7ee9=C,7eea=C,7eeb=C,7eed=C,7eee=C,7eef=C,7ef0=C,7ef2=C,7ef3=C,7ef4=C,7ef5=C,7ef6=C,7ef7=C,7ef8=C,7efa=C,7efb=C,7efc=C,7efd=C,7efe=C,7eff=C,7f00=C,7f01=C,7f02=C,7f03=C,7f04=C,7f05=C,7f06=C,7f07=C,7f08=C,7f09=C,7f0a=C,7f0c=C,7f0e=C,7f11=C,7f12=C,7f13=C,7f14=C,7f15=C,7f16=C,7f17=C,'
+'7f18=C,7f19=C,7f1a=C,7f1b=C,7f1c=C,7f1d=C,7f1e=C,7f1f=C,7f20=C,7f21=C,7f22=C,7f23=C,7f24=C,7f25=C,7f26=C,7f27=C,7f28=C,7f29=C,7f2a=C,7f2b=C,7f2c=C,7f2d=C,7f2e=C,7f2f=C,7f30=C,7f31=C,7f32=C,7f33=C,7f34=C,7f35=C,7f3c=J,7f42=C,7f4e=C,7f57=C,7f5a=C,7f62=C,7f74=C,7f81=C,7f9f=C,7faa=J,'
+'7fd8=C,7fda=C,8022=C,8027=C,802e=C,8038=C,8042=C,804b=C,804c=C,804d=C,8054=C,8062=J,8069=C,806a=C,8083=C,80a0=C,80a4=C,80be=C,80bf=C,80c0=C,80c1=C,80c6=C,80e7=C,80e8=C,80ea=C,80eb=C,80f1=J,80f6=C,8109=C,810d=C,810f=C,8110=C,8111=C,8113=C,8114=C,8135=J,8136=C,8138=C,8156=C,8158=C,'
+'817a=J,817b=C,817e=C,8191=C,81a4=J,81b5=J,81cd=J,81dc=C,8206=C,8220=J,822e=J,8230=C,8231=C,823b=C,8249=J,825d=J,8260=J,8270=C,8273=C,827a=C,8282=C,8297=C,829c=C,82a6=C,82c1=C,82c5=J,82c7=C,82c8=C,82cb=C,82cd=C,82cf=C,830e=C,830f=C,8311=C,8314=C,8315=C,834e=J,835a=C,835b=C,835c=C,'
+'835e=C,835f=C,8360=C,8361=C,8363=C,8364=C,8365=C,8366=C,8367=C,8368=C,8369=C,836a=C,836b=C,836c=C,836d=C,836e=C,836f=C,83b1=C,83b2=C,83b3=C,83b4=C,83b7=C,83b8=C,83b9=C,83ba=C,83bc=C,8419=J,841a=C,841d=C,8421=J,8422=J,8424=C,8425=C,8426=C,8427=C,8428=C,8429=J,8464=C,8485=J,8487=C,'
+'8489=C,848b=C,848c=C,8493=C,84d9=J,84da=J,84dc=J,84dd=C,84df=C,84e3=C,84e6=C,8534=C,8536=J,8537=C,8539=C,853a=C,853c=C,8552=C,8572=C,8574=C,85ae=C,85d3=C,85f4=C,8612=J,8630=J,8645=J,864f=C,8651=C,8672=J,867d=C,867e=C,867f=C,8680=C,8681=C,8682=C,86ab=J,86ac=C,86ca=C,86ce=C,86cf=C,'
+'86ee=C,86ef=J,86f0=C,86f1=C,86f2=C,86f3=C,86f4=C,8717=C,8747=C,8748=C,8749=C,877c=C,877e=C,87a7=J,87a8=C,87a9=J,87cf=C,87d0=J,87f5=J,8845=C,8846=C,8854=C,8865=C,886c=C,8884=C,8885=C,889c=C,88ad=C,88b0=J,88c3=J,88c4=J,88c5=C,88c6=C,88e2=C,88e3=C,88e4=C,88e5=C,8902=J,8904=J,891b=C,'
+'891c=J,8934=C,8947=C,8977=J,898e=C,89c1=C,89c2=C,89c3=C,89c4=C,89c5=C,89c6=C,89c7=C,89c8=C,89c9=C,89ca=C,89cb=C,89cc=C,89ce=C,89cf=C,89d0=C,89d1=C,89de=C,8a29=C,8a33=J,8a5f=C,8a89=C,8a8a=C,8aac=C,8aad=J,8aae=J,8ada=J,8b21=C,8b2d=C,8ba1=C,8ba2=C,8ba3=C,8ba4=C,8ba5=C,8ba6=C,8ba7=C,'
+'8ba8=C,8ba9=C,8baa=C,8bab=C,8bad=C,8bae=C,8baf=C,8bb0=C,8bb2=C,8bb3=C,8bb4=C,8bb5=C,8bb6=C,8bb7=C,8bb8=C,8bb9=C,8bba=C,8bbb=C,8bbc=C,8bbd=C,8bbe=C,8bbf=C,8bc0=C,8bc1=C,8bc2=C,8bc3=C,8bc4=C,8bc5=C,8bc6=C,8bc7=C,8bc8=C,8bc9=C,8bca=C,8bcb=C,8bcc=C,8bcd=C,8bce=C,8bcf=C,8bd1=C,8bd2=C,'
+'8bd3=C,8bd4=C,8bd5=C,8bd6=C,8bd7=C,8bd8=C,8bd9=C,8bda=C,8bdb=C,8bdd=C,8bde=C,8bdf=C,8be0=C,8be1=C,8be2=C,8be3=C,8be4=C,8be5=C,8be6=C,8be7=C,8be8=C,8be9=C,8beb=C,8bec=C,8bed=C,8bee=C,8bef=C,8bf0=C,8bf1=C,8bf2=C,8bf3=C,8bf4=C,8bf5=C,8bf6=C,8bf7=C,8bf8=C,8bf9=C,8bfa=C,8bfb=C,8bfc=C,'
+'8bfd=C,8bfe=C,8bff=C,8c00=C,8c01=C,8c02=C,8c03=C,8c04=C,8c05=C,8c06=C,8c07=C,8c08=C,8c09=C,8c0a=C,8c0b=C,8c0c=C,8c0d=C,8c0e=C,8c0f=C,8c10=C,8c11=C,8c12=C,8c13=C,8c14=C,8c15=C,8c16=C,8c17=C,8c18=C,8c19=C,8c1a=C,8c1b=C,8c1c=C,8c1d=C,8c1e=C,8c1f=C,8c20=C,8c21=C,8c22=C,8c23=C,8c24=C,'
+'8c25=C,8c26=C,8c27=C,8c28=C,8c29=C,8c2a=C,8c2b=C,8c2c=C,8c2d=C,8c2e=C,8c2f=C,8c30=C,8c31=C,8c32=C,8c33=C,8c34=C,8c35=C,8c36=C,8c6e=C,8cae=J,8ceb=C,8cec=J,8d0b=C,8d1c=C,8d1d=C,8d1e=C,8d1f=C,8d21=C,8d22=C,8d23=C,8d24=C,8d25=C,8d26=C,8d27=C,8d28=C,8d29=C,8d2a=C,8d2b=C,8d2c=C,8d2d=C,'
+'8d2e=C,8d2f=C,8d30=C,8d31=C,8d32=C,8d33=C,8d34=C,8d35=C,8d36=C,8d37=C,8d38=C,8d39=C,8d3a=C,8d3b=C,8d3c=C,8d3d=C,8d3e=C,8d3f=C,8d41=C,8d42=C,8d43=C,8d44=C,8d45=C,8d46=C,8d48=C,8d49=C,8d4a=C,8d4b=C,8d4c=C,8d4d=C,8d4e=C,8d4f=C,8d50=C,8d52=C,8d53=C,8d54=C,8d55=C,8d56=C,8d57=C,8d58=C,'
+'8d59=C,8d5a=C,8d5b=C,8d5c=C,8d5d=C,8d5e=C,8d60=C,8d61=C,8d62=C,8d63=C,8d6a=C,8d71=J,8d75=C,8d8b=C,8db1=C,8db8=C,8dc3=C,8dc4=C,8def=J,8df4=J,8df5=C,8df7=C,8df8=C,8df9=C,8dfb=C,8e0c=C,8e2c=C,8e2f=C,8e51=C,8e52=C,8e7f=C,8e8f=C,8e9c=C,8eae=J,8eaf=C,8eb5=J,8ebb=J,8ebe=J,8ec5=J,8ec8=J,'
+'8ee4=C,8ef2=C,8f4c=J,8f66=C,8f67=C,8f68=C,8f69=C,8f6b=C,8f6c=C,8f6d=C,8f6e=C,8f6f=C,8f70=C,8f71=C,8f72=C,8f73=C,8f74=C,8f76=C,8f77=C,8f78=C,8f79=C,8f7a=C,8f7b=C,8f7c=C,8f7d=C,8f7e=C,8f7f=C,8f82=C,8f83=C,8f84=C,8f85=C,8f86=C,8f87=C,8f88=C,8f89=C,8f8a=C,8f8b=C,8f8d=C,8f8e=C,8f8f=C,'
+'8f90=C,8f91=C,8f93=C,8f94=C,8f95=C,8f96=C,8f97=C,8f98=C,8f99=C,8f9a=C,8f9e=C,8fa9=C,8fab=C,8fb7=J,8fb9=C,8fbb=J,8fbc=J,8fbd=C,8fbe=C,8fc1=C,8fc7=C,8fc8=C,8fd0=C,8fd8=C,8fd9=C,8fda=J,8fdb=C,8fdc=C,8fdd=C,8fde=C,8fdf=C,8fe9=C,8ff9=C,9009=C,900a=C,9012=C,9026=C,9027=J,903b=C,9056=J,'
+'9057=C,9093=C,909d=C,90ac=C,90ae=C,90b9=C,90ba=C,90bb=C,90cf=C,90d0=C,90d1=C,90d2=J,90d3=C,90e6=C,90e7=C,90f8=C,915b=J,915d=C,9171=C,917d=C,917e=C,917f=C,9196=C,91ca=C,91d7=J,91fa=C,91fb=J,91fe=C,9208=C,920e=C,9225=J,9226=J,9228=J,9229=J,922c=J,9239=J,923e=J,9255=C,9262=C,926b=J,'
+'9274=C,9286=J,92ab=J,92ae=C,92af=J,92b1=C,92c5=J,92e5=C,92ed=C,92f2=J,9307=C,9332=C,9335=J,933a=J,933e=C,9340=C,9341=C,9344=J,9369=C,9384=C,9386=J,9387=C,93b8=C,93b9=J,93bf=C,93e5=J,93f0=C,941d=C,9420=J,9421=J,9426=C,9427=C,942f=C,9453=J,9454=C,9465=C,9479=C,9486=C,9487=C,9488=C,'
+'9489=C,948a=C,948b=C,948c=C,948d=C,948e=C,948f=C,9490=C,9492=C,9493=C,9494=C,9495=C,9496=C,9497=C,9498=C,9499=C,949a=C,949b=C,949d=C,949e=C,949f=C,94a0=C,94a1=C,94a2=C,94a4=C,94a5=C,94a6=C,94a7=C,94a8=C,94a9=C,94aa=C,94ab=C,94ac=C,94ad=C,94ae=C,94af=C,94b0=C,94b1=C,94b2=C,94b3=C,'
+'94b4=C,94b5=C,94b6=C,94b7=C,94b9=C,94ba=C,94bb=C,94bc=C,94bd=C,94be=C,94bf=C,94c0=C,94c1=C,94c2=C,94c3=C,94c4=C,94c5=C,94c6=C,94c8=C,94c9=C,94ca=C,94cb=C,94cc=C,94cd=C,94ce=C,94cf=C,94d0=C,94d1=C,94d2=C,94d3=C,94d5=C,94d7=C,94d9=C,94db=C,94dc=C,94dd=C,94de=C,94df=C,94e0=C,94e1=C,'
+'94e2=C,94e3=C,94e4=C,94e5=C,94e7=C,94e8=C,94e9=C,94ea=C,94eb=C,94ec=C,94ed=C,94ee=C,94ef=C,94f0=C,94f1=C,94f2=C,94f3=C,94f5=C,94f6=C,94f7=C,94f8=C,94f9=C,94fa=C,94fc=C,94fd=C,94fe=C,94ff=C,9500=C,9501=C,9502=C,9503=C,9504=C,9505=C,9506=C,9507=C,9508=C,9509=C,950b=C,950c=C,950e=C,'
+'950f=C,9510=C,9511=C,9512=C,9513=C,9514=C,9515=C,9517=C,9518=C,9519=C,951a=C,951b=C,951d=C,951e=C,951f=C,9521=C,9522=C,9523=C,9524=C,9525=C,9526=C,9527=C,9528=C,952b=C,952d=C,952e=C,952f=C,9530=C,9531=C,9532=C,9534=C,9535=C,9536=C,9537=C,9538=C,9539=C,953b=C,953c=C,953e=C,953f=C,'
+'9540=C,9541=C,9542=C,9543=C,9544=C,9545=C,9547=C,9549=C,954a=C,954b=C,954c=C,954d=C,954e=C,954f=C,9550=C,9551=C,9552=C,9553=C,9554=C,9556=C,9557=C,9558=C,955a=C,955b=C,955c=C,955d=C,955e=C,9562=C,9563=C,9564=C,9565=C,9566=C,9567=C,9568=C,9569=C,956a=C,956b=C,956c=C,956d=C,956e=C,'
+'956f=C,9570=C,9571=C,9572=C,9573=C,9574=C,9576=C,957f=C,9584=J,9587=J,958a=J,9596=J,95a0=J,95a7=C,95aa=J,95b2=C,95b8=J,95e6=J,95e8=C,95e9=C,95ea=C,95ed=C,95ee=C,95ef=C,95f0=C,95f1=C,95f2=C,95f4=C,95f5=C,95f7=C,95f8=C,95f9=C,95fa=C,95fb=C,95fc=C,95fd=C,95fe=C,95ff=C,9600=C,9601=C,'
+'9602=C,9603=C,9604=C,9605=C,9606=C,9608=C,9609=C,960a=C,960b=C,960c=C,960d=C,960e=C,960f=C,9610=C,9611=C,9612=C,9614=C,9615=C,9616=C,9617=C,9619=C,961a=C,961f=C,9633=C,9634=C,9635=C,9636=C,9645=C,9646=C,9647=C,9648=C,9649=C,9655=C,9668=C,9669=C,968f=C,9690=C,96b6=C,96be=C,96cf=C,'
+'96e0=C,96eb=J,96f3=C,96fe=C,9701=C,972d=C,974d=J,974e=J,974f=J,9753=C,9765=C,9779=J,9786=J,9790=J,9791=C,9792=C,979c=J,97af=C,97bd=C,97e6=C,97e7=C,97e8=C,97e9=C,97ea=C,97eb=C,97ec=C,97f5=C,983d=C,9854=C,986c=C,9875=C,9876=C,9877=C,9878=C,9879=C,987a=C,987b=C,987c=C,987d=C,987e=C,'
+'987f=C,9880=C,9881=C,9882=C,9883=C,9884=C,9885=C,9886=C,9887=C,9888=C,9889=C,988a=C,988b=C,988c=C,988d=C,988f=C,9890=C,9891=C,9893=C,9894=C,9896=C,9897=C,9898=C,9899=C,989b=C,989c=C,989d=C,989e=C,989f=C,98a0=C,98a1=C,98a2=C,98a4=C,98a5=C,98a6=C,98a7=C,98aa=J,98ce=C,98d2=C,98d3=C,'
+'98d4=C,98d5=C,98d7=C,98d8=C,98d9=C,98de=C,98e8=C,98ff=C,9904=C,990d=C,990e=C,990f=C,9919=J,991c=C,9936=C,9937=C,9942=J,994a=C,9962=C,9965=C,9966=C,9967=C,9968=C,9969=C,996a=C,996b=C,996c=C,996d=C,996e=C,996f=C,9970=C,9971=C,9972=C,9973=C,9974=C,9975=C,9976=C,9977=C,9978=C,9979=C,'
+'997a=C,997b=C,997c=C,997d=C,997f=C,9981=C,9983=C,9984=C,9985=C,9986=C,9987=C,9988=C,9989=C,998a=C,998b=C,998d=C,998e=C,998f=C,9990=C,9991=C,9992=C,9993=C,9994=C,9995=C,99e1=C,99f2=J,9a6b=J,9a6c=C,9a6d=C,9a6e=C,9a6f=C,9a70=C,9a71=C,9a73=C,9a74=C,9a75=C,9a76=C,9a77=C,9a78=C,9a79=C,'
+'9a7a=C,9a7b=C,9a7c=C,9a7d=C,9a7e=C,9a7f=C,9a80=C,9a81=C,9a82=C,9a84=C,9a85=C,9a86=C,9a87=C,9a88=C,9a8a=C,9a8b=C,9a8c=C,9a8e=C,9a8f=C,9a90=C,9a91=C,9a92=C,9a93=C,9a96=C,9a97=C,9a98=C,9a9a=C,9a9b=C,9a9c=C,9a9d=C,9a9e=C,9a9f=C,9aa0=C,9aa1=C,9aa2=C,9aa4=C,9aa5=C,9aa7=C,9ac5=C,9acb=C,'
+'9acc=C,9aea=J,9b13=C,9b47=C,9b49=C,9b5d=J,9b5e=J,9b6c=J,9b74=J,9b78=J,9b79=J,9b81=C,9b84=J,9b8d=C,9b8e=C,9b95=J,9b96=J,9b97=J,9b98=J,9b9d=C,9b9f=J,9ba3=C,9bb1=J,9bb4=J,9bba=C,9bce=J,9bcf=J,9bd0=J,9bd1=J,9bd2=J,9be1=J,9bf0=J,9bf1=J,9bf2=J,9bf3=J,9bff=C,9c02=C,9c04=J,9c0c=C,9c10=C,'
+'9c12=J,9c18=J,9c1f=C,9c21=J,9c27=C,9c2e=J,9c2f=J,9c30=J,9c35=C,9c39=J,9c45=C,9c47=J,9c48=J,9c5a=J,9c69=J,9c6a=J,9c6b=J,9c70=J,9c7c=C,9c7d=C,9c7f=C,9c81=C,9c82=C,9c85=C,9c86=C,9c87=C,9c88=C,9c8a=C,9c8b=C,9c8d=C,9c8e=C,9c8f=C,9c90=C,9c91=C,9c92=C,9c94=C,9c96=C,9c97=C,9c99=C,9c9a=C,'
+'9c9b=C,9c9c=C,9c9d=C,9c9e=C,9c9f=C,9ca0=C,9ca1=C,9ca2=C,9ca3=C,9ca4=C,9ca5=C,9ca6=C,9ca7=C,9ca8=C,9ca9=C,9cab=C,9cad=C,9cae=C,9cb0=C,9cb1=C,9cb2=C,9cb3=C,9cb5=C,9cb6=C,9cb7=C,9cb8=C,9cbb=C,9cbd=C,9cbf=C,9cc1=C,9cc3=C,9cc4=C,9cc5=C,9cc6=C,9cc7=C,9cca=C,9ccc=C,9ccd=C,9cce=C,9ccf=C,'
+'9cd1=C,9cd2=C,9cd3=C,9cd4=C,9cd5=C,9cd6=C,9cd7=C,9cd8=C,9cd9=C,9cdb=C,9cdc=C,9cdd=C,9cde=C,9cdf=C,9ce2=C,9ce3=C,9cec=C,9cf0=J,9cfe=C,9d2b=J,9d30=J,9d34=C,9d46=J,9d47=J,9d48=J,9d64=J,9d6e=C,9d93=C,9da5=C,9dab=J,9dc0=C,9dc4=C,9dc9=C,9e0a=C,9e1f=C,9e20=C,9e21=C,9e22=C,9e23=C,9e25=C,'
+'9e26=C,9e27=C,9e28=C,9e29=C,9e2a=C,9e2b=C,9e2c=C,9e2d=C,9e2e=C,9e2f=C,9e30=C,9e31=C,9e32=C,9e33=C,9e35=C,9e36=C,9e37=C,9e38=C,9e39=C,9e3a=C,9e3b=C,9e3c=C,9e3d=C,9e3e=C,9e3f=C,9e41=C,9e42=C,9e43=C,9e44=C,9e45=C,9e46=C,9e47=C,9e48=C,9e49=C,9e4a=C,9e4b=C,9e4c=C,9e4f=C,9e50=C,9e51=C,'
+'9e52=C,9e55=C,9e56=C,9e57=C,9e58=C,9e59=C,9e5a=C,9e5b=C,9e5c=C,9e5e=C,9e61=C,9e63=C,9e64=C,9e65=C,9e66=C,9e67=C,9e68=C,9e69=C,9e6a=C,9e6b=C,9e6c=C,9e6d=C,9e6f=C,9e70=C,9e73=C,9e7e=C,9e91=J,9ea6=C,9eaf=C,9eb8=C,9ebd=C,9ebf=J,9ec9=C,9ee1=C,9ee9=C,9efe=C,9f0b=C,9f0d=C,9f21=J,9f50=C,'
+'9f51=C,9f7f=C,9f80=C,9f83=C,9f84=C,9f85=C,9f86=C,9f87=C,9f88=C,9f89=C,9f8a=C,9f8b=C,9f8c=C,9f99=C,9f9a=C,9f9b=C,9f9f=C,fa0f=J,fa13=J,fa20=J,fa21=J,fa24=J,fa29=J',1,16);
//	HKEY_CLASSES_ROOT\MIME\Database\Charset
//	將gb排在Big5前面是因為gb常用字在Big5中常常是0x8000之後的常用字，Big5常用字卻常常是gb中奇怪字碼與罕用字
setObjValue('autodetectEncodeCode','GB2312=3000,Big5=3000,shift_jis=900,iso-8859-1=2000',1);


TODO:
只檢測常用的幾個字，無法判別才廣泛測試。
*/
//var FN='I:\\Documents and Settings\\kanashimi\\My Documents\\kanashimi\\www\\cgi-bin\\game\\sjis.txt',enc=autodetectEncode(FN);alert('['+enc+'] '+FN+'\n'+_.read_all_file(FN,enc).slice(0,900));
/*	自動判別檔案（或字串）之編碼	文字エンコーディング判定を行う
	http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html
	http://www.ericphelps.com/q193998/
	http://hp.vector.co.jp/authors/VA003334/ado/adostream.htm
*/
//autodetectEncode[generateCode.dLK]='isFile,simpleFileDformat,_.open_file,autodetectStringEncode,autodetectHTMLEncode';
CeL.IO.Windows.file
.
autodetectEncode=function(FN,isHTML){
 var t,code;
 if(typeof ActiveXObject=='undefined'){alert("autodetectEncode: Can't find ActiveXObject!");return;}
 //if(typeof autodetectHTMLEncode!='function')isHTML=false;
 if(!isFile(FN))return FN.length<64?simpleFileDformat:(t=autodetectStringEncode(FN))?t:(isHTML||typeof isHTML=='undefined')&&(t=autodetectHTMLEncode(FN))?t:simpleFileDformat;
 _.open_file(FN,'iso-8859-1');	//	讀 binary data 用 'iso-8859-1' 會 error encoding.
 if(!AdoEnums||!AdoStream)return simpleFileDformat;
 AdoStream.LoadFromFile(FN);
 t=AdoStream.ReadText(3);//Read(3);//
 //alert(FN+'\n'+t.charCodeAt(0)+','+t.charCodeAt(1)+','+t.charCodeAt(2));

 //if(typeof t!='string')return simpleFileDformat;//t=''+t;	//	此時type通常是unknown，不能用+=
 //	Unicode的Byte Order Mark(BOM)在UTF-16LE(little endian)裏，它是以FF-FE這兩個bytes表達，在BE(big endian)裏，是FEFF。而在UTF-8裏，它是以EF-BB-BF這三個bytes表達。
 if(t.slice(0,2)=='\xFF\xFE')code='unicodeFFFE';
 else if(t.slice(0,2)=='\xFE\xFF')code='unicode';
 else if(t=='\xEF\xBB\xBF')code='UTF-8';
 else{
  // 即使是用OpenTextFile(_.open_format.TristateFalse)，UTF-8還是會被轉換而判別不出來。
  //	from http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html
  var l,codes={},reg=new RegExp(),stream=new ActiveXObject("ADODB.Stream");
  codes['iso-8859-1']='[\\x09\\x0a\\x0d\\x20-\\x7e]';
  codes['big5']=codes['iso-8859-1']+
	'|[\\xa4-\\xc6\\xc9-\\xf9][\\x40-\\xfe]';	//	http://www.cns11643.gov.tw/web/word/big5/index.html
  codes['shift_jis']=codes['iso-8859-1']+
	'|[\\x81-\\x9f\\xe0-\\xef\\xfa-\\xfc][\\x40-\\x7e\\x80-\\xfc]|[\\xa1-\\xdf]';	//	http://hp.vector.co.jp/authors/VA013241/misc/shiftjis.html
  codes['euc-jp']=codes['iso-8859-1']+
	'|\\x8f[\\xa1-\\xfe][\\xa1-\\xfe]|[\\xa1-\\xfe][\\xa1-\\xfe]|\\x8e[\\xa1-\\xdf]';
  codes['utf-8']=codes['iso-8859-1']+
	'|[\\xc0-\\xdf][\\x80-\\xbf]|[\\xe0-\\xef][\\x80-\\xbf]{2}|[\\xf0-\\xf7][\\x80-\\xbf]{3}'+
	'|[\\xf8-\\xfb][\\x80-\\xbf]{4}|[\\xfc-\\xfd][\\x80-\\xbf]{5}';
  codes['gb2312']=codes['iso-8859-1']+	//	GBK
	'|[\\xa1-\\xf7][\\xa1-\\xfe]';	//	http://zh.wikipedia.org/wiki/GB_18030	http://zh.wikipedia.org/wiki/GB_2312

  stream.type=AdoEnums.adTypeBinary;
  stream.open();
  stream.loadFromFile(FN);
  stream.position=0;
  t=stream.read();
  stream.close();
  stream=null;

  t=translate_AdoStream_binary_data(t,4e3);

  for(var _e in codes){
   reg=new RegExp('^(?:'+codes[_e]+')');
   var l=0,s=t;
   while(l!=s.length)l=s.length,s=s.replace(reg,"");
   if(s==""){code=_e;break;}
  }

 }
 //sl('autodetectEncode: coding: ['+code+'] in parse 1.');

 //	假如是HTML檔，判斷是否有charset設定。這個判別放在unicode之後，其他自動判別之前。
 if(isHTML||typeof isHTML=='undefined'&&/\.s?html?$/i.test(FN)){
  if(AdoStream.Type==AdoEnums.adTypeBinary)_.open_file(FN,'iso-8859-1');
  AdoStream.Position=0,AdoStream.Charset='iso-8859-1';	//	讀 binary data 用 'iso-8859-1' 會 error encoding.
  if(t=autodetectHTMLEncode(AdoStream.ReadText(4e3)))code=t;
 }
 //sl('autodetectEncode: coding: ['+code+'] in parse 2.');

 //autodetectEncodeCode.GB2312=900000;	// 4 test
 if(!code)for(var i in autodetectEncodeCode){
  if(AdoStream.Type==AdoEnums.adTypeBinary)_.open_file(FN,'iso-8859-1');
  if(AdoStream.Position=0,i==autodetectStringEncode(AdoStream.ReadText(autodetectEncodeCode[AdoStream.Charset=i]))){code=i;break;}
 }

 AdoStream.Close();
 return code||simpleFileDformat;	//	ascii=iso-8859-1,_autodetect,_autodetect_all
};

//	判斷HTML檔是否有charset設定
function autodetectHTMLEncode(fc){	//	file contents
 var t;
 if( fc.match(/<\s*meta\s+([^>]+)>/i)
	&& ((t=RegExp.$1).match(/content="([^"]+)"/i)||t.match(/content=([^\w]+)/i))
	&& (t=RegExp.$1).match(/charset=([\w-]{2,})/i)
	|| fc.match(/<\?\s*xml\s[^>]+\sencoding\s*=\s*["']([a-z\d\-]+)["']/i)
	)
 return RegExp.$1;
};
CeL.IO.Windows.file
.
/**
 * 靠常用字自動判別字串之編碼	string,預設編碼
 */
autodetectStringEncode=function(str){
 if(typeof str!='string'||!(str=str.replace(/\s+/g,'')))return;
 var len=str.length,i=0,c,a,kana=0,jianhuazi=0,halfwidthKatakana=0,Hangul=0,ascii=0,asciiHigh=0,kanji=0,kokuji=0,symbol=0,unknown=0;
 //if(len>9000)len=9000;
 //var unknownC='';

 //	char分類
 for(;i<len;i++)
  if(c=str.charCodeAt(i),c<0x80)ascii++;
  else if(c<0x100)asciiHigh++;
  else if(c>0x3040&&c<0x30ff)kana++;
  else if(c==0x30fb||c>0xff65&&c<0xff9e)halfwidthKatakana++;
  else if(c>=0x1100&&c<0x11fa||c>=0xac00&&c<0xad00||c>=0xd700&&c<0xd7a4)Hangul++;
  else if(c>0x4dff&&c<0x9fa6){kanji++,a=autodetectEncodeSP[c];if(a=='C')jianhuazi++;else if(a=='J')kokuji++;}
  else if(c>0xfa00&&c<0xfa6b){if(autodetectEncodeSP[c]=='J')kokuji++;}
  else if(c>0x2010&&c<0x2610||c>=0xfe30&&c<0xfe70||c>0xff00&&c<0xff5f)symbol++;
  else if(c>=0x3000&&c<0x3400||c>0x33ff&&c<0x4db6)
   if(autodetectEncodeSP[c]=='J')kokuji++;else symbol++;
  else unknown++;//,unknownC+=str.charAt(i);

 //alert('len='+len+'\nkana='+kana+'\nkokuji='+kokuji+'\njianhuazi='+jianhuazi+'\nhalfwidthKatakana='+halfwidthKatakana+'\nHangul='+Hangul+'\nascii='+ascii+'\nasciiHigh='+asciiHigh+'\nkanji='+kanji+'\nsymbol='+symbol+'\nunknown='+unknown);
 //if(unknownC)alert('unknown:\n'+unknownC.slice(0,200));//alert(unknownC.slice(0,200)+'\n'+str.slice(0,1000));
 //	依各種常用字母之條件判別
 return ascii+asciiHigh==len?'iso-8859-1'
	:unknown>.05*(len-ascii)?''//unicode	//	unknown不能太多
	:kana>.2*len&&kanji+kana+symbol>3*halfwidthKatakana?'shift_jis'
	:kanji+symbol>.7*(len-ascii)&&kana<.05*(len-ascii)?	jianhuazi>.1*kanji?'GB2312':'Big5'
	:Hangul+symbol>.7*(len-ascii)?'korean'//ks_c_5601
	:kanji>.2*(len-ascii)?	jianhuazi>.1*kanji?kokuji>.02*kanji?'unicode':'GB2312':kokuji>.02*kanji?'shift_jis':'Big5'
	:'';//unicode
};

/*
http://bbs.ee.ntu.edu.tw/boards/Linux/7/9/58.html	http://libai.math.ncu.edu.tw/~shann//Chinese/big5.html	http://wiki.debian.org.tw/index.php/Big5Variants	http://leoboard.cpatch.org/cgi-bin/topic.cgi?forum=20&topic=64&changemode=1
http://www.theorem.ca/~mvcorks/cgi-bin/unicode.pl.cgi?start=F900&end=FAFF	http://homepage1.nifty.com/nomenclator/unicode/normalization.htm

Unicode的漢字大致是以康熙部首排序，不過間中有部分字排錯部首筆劃
第一批在1993年加進Unicode的，
於中國內地、台灣、南韓及日本已有字集的漢字，
編碼於U+4E00至U+9FA5，
亦有部分南韓重覆漢字被編到U+F900至U+FA0B、
兩個Big-5重覆漢字被編到U+FA0C至U+FA0D、
日本廠商漢字被編到U+FA0E至U+FA2D

全形符號（只限鍵盤上那94個）位於U+FF01至U+FF5E
中日韓專用符號放到了U+3000至U+33FF內，
其餘有部分符號放到了U+2XXX及U+FE30至U+FE6F

第二批在1999年加進Unicode的，
加進了新加坡用漢字、南韓PKS C 5700-2 1994、
部分CNS11643第三、四、十五字面等用字、
未包括在第一批字的數個GB字集用字，
被編入U+3400至U+4DB5

第三批在2001年加進Unicode的，
加進了CNS11643第三、四、五、六、七、十五字面所有字、
香港增補字集用字、四庫全書、辭海、辭源、康熙字典、
漢語大字典、漢語大詞典內的所有用字，
被編入U+20000至U+2A6D6
JIS-X0213漢字被加到U+FA30至U+FA6A
CNS11643重覆漢字被加到U+2F800至U+2FA1D

简化字总表	http://cdns.twnic.net.tw/cjktable/	http://www.sxyw.cn/YuWenGongZuo/gfzs22.htm	http://huayuqiao.org/articles/xieshiya/Simplified/6_XinJiaPoTiaoZhengJianTiZi-XP.htm	http://www.hk-place.com/vp.php?board=2&id=333-9
简化字分布似乎並無規範，只好以array判斷:

<div id="dataGB">
http://cdns.twnic.net.tw/cjktable/simtab.html
簡化字總表之 UNICODE 碼表
</div>
<div id="dataJP">
http://homepage2.nifty.com/TAB01645/ohara/index_j2.htm
JIS区点索引
</div>

<script type="text/javascript">
var i=0,c=0,autodetectEncodeSP=[],m=document.getElementById('dataGB').innerHTML.match(/\([0-9A-F]{4},\w*\)/g),t="setObjValue('autodetectEncodeSP','";
for(;i<m.length;i++)//if(m[i].indexOf('C')!=-1&&m[i].slice(m[i].indexOf(',')+1).indexOf('T')==-1)t+=m[i].substr(1,5);
 if(m[i].indexOf('T')==-1)autodetectEncodeSP[parseInt(m[i].substr(1,4),16)]='C';
for(i=0,m=document.getElementById('dataJP').innerHTML.match(/【.】/g);i<m.length;i++)
 autodetectEncodeSP[parseInt(m[i].charCodeAt(1))]=autodetectEncodeSP[parseInt(m[i].charCodeAt(1))]?0:'J';

m=[];for(i in autodetectEncodeSP)m.push(parseInt(i));m.sort();
for(i=0;i<m.length;i++)if(autodetectEncodeSP[m[i]]){t+=m[i].toString(16)+'='+autodetectEncodeSP[m[i]]+',',c++;if(c%40==0)t+="'<br/>+'";}
alert(c+'字');
document.getElementById('dataJP').innerHTML='';
document.getElementById('dataGB').innerHTML=t.slice(0,-1)+"',1,16);";
</script>


和製漢字(国字)は、和語(ﾔﾏﾄｺﾄﾊﾞ)に相当する漢字が無い場合に新規につくられたもので、奈良時代から作られた。ほとんどは訓読みしかない。魚篇や木篇が多い。
http://homepage2.nifty.com/TAB01645/ohara/index.htm
http://zh.wiktionary.org/wiki/%E8%BE%BB
http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=8fbb
http://jprs.jp/doc/rule/saisoku-1-wideusejp-furoku-4.html
http://m2000.idv.tw/informer/zhi/char-root.htm
http://www.ajisai.sakura.ne.jp/~dindi/chrc/ref/wincode2.txt
http://cs-people.bu.edu/butta1/personal/hkscs/hkscs-oct.html
http://www.nobi.or.jp/i/kotoba/kanji/wasei-kanji.html
http://www.melma.com/mag/52/m00011552/a00000066.html


韓語字母/諺文
http://www.sinica.edu.tw/~cytseng/Korean%20reader/hangul.htm
http://www.unicode.org/charts/normalization/

old:
//	自動判別檔案（或字串）之編碼
function autodetectEncode(FN){
 if(!isFile(FN))return FN.length>64?autodetectStringEncode(FN):simpleFileDformat;
 _.open_file(FN,'iso-8859-1');
 if(!AdoEnums)return simpleFileDformat;
 //AdoStream.Type=AdoEnums.adTypeBinary;
 AdoStream.LoadFromFile(FN);
 var t=AdoStream.ReadText(3),code;
 //	Unicode的Byte Order Mark(BOM)在UTF-16LE(little endian)裏，它是以FF-FE這兩個bytes表達，在BE(big endian)裏，是FEFF。而在UTF-8裏，它是以EF-BB-BF這三個bytes表達。
 if(t.slice(0,2)=='\xFF\xFE')code='unicodeFFFE';
 if(t.slice(0,2)=='\xFE\xFF')code='unicode';
 if(t=='\xEF\xBB\xBF')code='UTF-8';
 if(code){AdoStream.Close();return code;}

 if(!code)with(AdoStream){
  //	將sjis排在gb與Big5前面是因為sjis常符合gb，且sjis之判定相當嚴。
  if(!code)Position=0,Charset='shift_jis',code=autodetectStringEncode(ReadText(900),Charset);
  //	將gb排在Big5前面是因為gb常用字在Big5中常常是0x8000之後的常用字，Big5常用字卻常常是gb中奇怪字碼與罕用字
  if(!code)Position=0,Charset='GB2312',code=autodetectStringEncode(ReadText(2000),Charset);
  if(!code)Position=0,Charset='Big5',code=autodetectStringEncode(ReadText(2000),Charset);
 }

 AdoStream.Close();
 return code||simpleFileDformat;	//	ascii=iso-8859-1,_autodetect,_autodetect_all
}
//	靠常用字自動判別字串之編碼	string,預設編碼
function autodetectStringEncode(str,dcode){
 var code;
 if(str.length>9000)str=str.slice(0,9000);

 //	將sjis排在gb與Big5前面是因為sjis常符合gb，且sjis之判定相當嚴。
 if(dcode=='shift_jis'||!dcode&&!code){
  //	http://www.asahi-net.or.jp/~hc3j-tkg/unicode/	http://www.unicode.org/Public/UNIDATA/DerivedCoreProperties.txt
  var i=0,c,k=0,u=0,h=0;//h_=u_=k_='';
  for(;i<str.length;i++)if(c=str.charCodeAt(i),c>0xFF)
	if(c==0x30FB||c>0xFF65&&c<0xFF9E)h++;//,h_+=str.charAt(i);//||c==0xE134	//	HALFWIDTH KATAKANA LETTER等可能不是日文文件中會出現的char
	else if(c>0x3040&&c<0x30FF)k++;//,k_+=str.charAt(i);	//	kana
	else u++;//,u_+=str.charAt(i);	//	unknown kanji
  //alert(k+','+u+','+h+'\n*'+k_+'\n*'+u_+'\n*'+h_);//alert(u_.charCodeAt(2));
  if(k+u>2*h)code='shift_jis';	//	HALFWIDTH KATAKANA LETTER數目比漢字少時判別為shift_jis
 }

//	將gb排在Big5前面是因為gb常用字在Big5中常常是0x8000之後的常用字，Big5常用字卻常常是gb中奇怪字碼與罕用字
 if(dcode=='Big5'||dcode=='GB2312'||!dcode&&!code){
  var i=0,c,k=0,u=0;//k_=u_='';
  for(;i<str.length;i++)if(c=str.charCodeAt(i),c>0xFF)
	if(c>0x4DFF&&c<0x9FA6||c>0xFF00&&c<0xFF5F||c>0x33ff&&c<0x4DB6||c==0x2605||c==0x2606)k++;//,k_+=str.charAt(i);	//	2605,6:★☆
	else u++;//,u_+=str.charAt(i);
  //alert(k+','+u+'\n'+k_+'\n*'+u_);
  if(k>5*u)code=dcode||'Big5';	//	漢字比不認識的字多時判定
 }

 if(dcode=='iso-8859-1'||dcode=='ascii'||!dcode&&!code){
 }

 return code;
}
*/


/*	將 iso-8859-1 轉成utf-8
To use:
..
translated=turnBinStr(original);
..
translated=turnBinStr();	//	delete temp file
*/
turnBinStr.temp_file='turnBinStr.tmp';	//	temp file name
function turnBinStr(t,_enc){
 if(typeof t!='undefined'){
  if(!turnBinStr.tmpF)turnBinStr.tmpF=getFP(turnBinStr.temp_file,1);

  //t+='';
  //if(t.replace(/[^\x00-\x7f]+/g,''))return t;
  //var _q=t.replace(/[^?]+/g,'').length,_t,_j=0;
  _.write_to_file(turnBinStr.tmpF,''+t,'iso-8859-1');
  //alert(turnBinStr.tmpF+'\n'+simpleFileErr.description+'\n'+t+'\n'+_.read_all_file(turnBinStr.tmpF,'utf-8'));
  return _.read_all_file(turnBinStr.tmpF,'utf-8');
/*
  if(!_enc)_enc='utf-8,Big5,shift_jis,euc-jp,GB2312'.split(',');
  else if(!(_enc instanceof Array))_enc=[_enc];
  for(;_j<_enc.length;_j++)
   if((_t=_.read_all_file(turnBinStr.tmpF,_enc[_j])).replace(/[^?]+/g,'').length==_q)
    return _t;//'['+_enc[_j]+']'+
  return t;
*/
 }
 try{fso.DeleteFile(turnBinStr.tmpF);}catch(e){}	//	有時會出錯
}





//folder_info[generateCode.dLK]='initWScriptObj';
//	需同時修改if(traverseSubDirectory==folder_info.f.noNewObj)段落之return!

//setObjValue('folder_info.f','noNewObj=-1,files,dirs,fsize,size,Tsize=3,Tfiles,Tdirs',1);
CeL.IO.Windows.file
.
/**
 * Get the infomation of folder
 * @param folder_path	folder path
 * @param file_filter
 * @param traverseSubDirectory
 * @return
 * @example
 * var finfo=new folder_info(path or folder object,extFilter,0/1);
 * @deprecated	以 <a href="#.traverse_file_system">traverse_file_system</a> 代替
 * @memberOf	CeL.IO.Windows.file
 */
folder_info=function(folder_path,file_filter,traverseSubDirectory){
 var dir,filesCount,subDirectorysCount,total_size_of_files,total_size_of_this_folder,total_filesCount,total_subDirectorysCount;
 filesCount=subDirectorysCount=total_size_of_files=total_size_of_this_folder=total_filesCount=total_subDirectorysCount=0;
 if(typeof traverseSubDirectory=='undefined')traverseSubDirectory=1;

 if(typeof folder_path=='object')dir=folder_path;
 else if(folder_path){
  if(!folder_path.slice(-1)!=path_separator)folder_path+=path_separator;
  try{dir=fso.GetFolder(folder_path);}catch(e){dir=0;}
 }

 if(dir){
  total_subDirectorysCount=subDirectorysCount=dir.SubFolders.Count;
  var i,t,f=new Enumerator(dir.SubFolders);
  if(traverseSubDirectory||traverseSubDirectory==folder_info.f.noNewObj)for(;!f.atEnd();f.moveNext()){
   i=f.item();
   t=folder_info(i,file_filter,folder_info.f.noNewObj);
   //alert(i.path+'\n'+t[folder_info.f.size]+','+t[folder_info.f.Tfiles]+','+t[folder_info.f.Tdirs]);
   total_size_of_this_folder+=t[folder_info.f.size];
   total_filesCount+=t[folder_info.f.Tfiles];
   total_subDirectorysCount+=(t[folder_info.f.Tdirs]||0);
  }

  //alert(dir.files.Count+'\n'+total_filesCount);
  total_filesCount+=(filesCount=dir.files.Count);
  f=new Enumerator(dir.files);
  for(;!f.atEnd();f.moveNext()){
   i=f.item();
   if(file_filter&&!file_filter.test(i.name))continue;
   //if(traverseSubDirectory!=folder_info.f.noNewObj)alert(i.name+': '+i.size+' / '+total_size_of_files);
   total_size_of_files+=i.size;
  }

  total_size_of_this_folder+=total_size_of_files;
 }

 //alert(dir.path+'\nfile filter: '+file_filter+'\n'+filesCount+','+subDirectorysCount+','+total_size_of_files+','+total_size_of_this_folder+','+total_filesCount+','+total_subDirectorysCount);
 if(traverseSubDirectory==folder_info.f.noNewObj)
  return [filesCount,subDirectorysCount,total_size_of_files,total_size_of_this_folder,total_filesCount,total_subDirectorysCount];

 this.files=this[folder_info.f.files]=filesCount;
 this.dirs=this[folder_info.f.dirs]=subDirectorysCount;
 this.fsize=this[folder_info.f.fsize]=total_size_of_files;
 this.size=this[folder_info.f.size]=total_size_of_this_folder;
 this.Tfiles=this[folder_info.f.Tfiles]=total_filesCount;
 this.Tdirs=this[folder_info.f.Tdirs]=total_subDirectorysCount;
 return this;
};
CeL.IO.Windows.file
.
/**
 * <a href="#.folder_info">folder_info</a> 的 flag enumeration
 * @memberOf	CeL.IO.Windows.file
 * @constant
 */
folder_info.f={
	noNewObj:-1,
	files:0,
	dirs:1,
	fsize:2,
	size:3,
	Tsize:3,
	Tfiles:4,
	Tdirs:5
};


/*	list files of folder	改編自 folder_info()
	var files=new listFile(path or folder object,extFilter,flag);

*/
//listFile[generateCode.dLK]='initWScriptObj';
//	需同時修改if(flag==listFile.f.noNewObj)段落之return!

//setObjValue('listFile.f','ignoreCase=1',1);
listFile.f={
	ignoreCase:1
};

function listFile(folder_path,file_filter,flag){
 var files=[];
 if(typeof flag=='undefined')flag=0;

 if(typeof folder_path=='object')dir=folder_path;
 else if(folder_path){
  if(!folder_path.slice(-1)!=path_separator)folder_path+=path_separator;
  try{dir=fso.GetFolder(folder_path);}catch(e){dir=0;}
 }

 if(dir){
  var i,f=new Enumerator(dir.files);
  for(;!f.atEnd();f.moveNext()){
   i=f.item();
   if(file_filter&&!file_filter.test(i.name))continue;
   files.push(i.name);
  }
 }

 return files;
}






/*
in UNIX:
iconv -l
iconv -c -f UTF-16 -t BIG5-HKSCS function.js

*/
CeL.IO.Windows.file
.
/**
 * 將編碼為fromCode之檔案fileName中所有不合編碼toCode之char以encodeFunction轉換
 * @param fileName
 * @param toCode
 * @param fromCode
 * @param encodeFunction
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
iconv_file=function(fileName, toCode, fromCode, encodeFunction) {
	return iconv(_.read_all_file(fileName, fromCode), toCode,
			encodeFunction);
};

CeL.IO.Windows.file
.
/*	將string text中所有不合編碼toCode之char以encodeFunction轉換
convert string encoding<br/>

CeL.iconv('測試每個字元 abc あaいiうuえeおo','Big5')

TODO:
一次寫入多 bytes
*/
//var iconvError=[];
iconv=function(text, toCode, encodeFunction) {
	if (!text)
		return '';

	// alert('iconv: ['+toCode+']\n'+text.slice(0,200));
	if (/utf-?(8|16([bl]e)?)/i.test(toCode))
		//	skip Unicode
		return HTMLToUnicode(text, 1);

	if (_.open_file(0, toCode || simpleFileDformat) !== 0){
		//	error occurred
		iconvError = simpleFileErr;
		CeL.log(iconvError.message);
		return text;
	}

	// AdoStream.Type=AdoEnums.adTypeText;
	if (!encodeFunction)
		encodeFunction =
			// typeof toHTML ==='function' ? totoHTML:
			function(t) {
				return '\\u' + t.charCodeAt(0);
			};
	// iconvError=[];

	var charToSet, i = 0, t = '';
	//	測試每個字元
	for (; i < text.length; i++)
		try {
			charToSet = text.charAt(i);
			if (charToSet.charCodeAt(0) < 256) {
				//	對於 code 過小的，直接匯入以增加速度。
				t += charToSet;
				continue;
			}
			AdoStream.Position = 0;
			AdoStream.WriteText(charToSet);
			AdoStream.Position = 0;
			t += charToSet == AdoStream.ReadText(AdoEnums.adReadAll) ? charToSet
					: encodeFunction(charToSet);
		} catch (e) {
			//iconvError.push(e.description);
			t += encodeFunction(charToSet);
		}

	try {
		AdoStream.Close();
	} catch (e) {
	}
	return t;
};



//---------------------------------------------------


/*
var driverProperty,folderProperty,fileProperty;
setObjValue('driverProperty','AvailableSpace,DriveLetter,DriveType,FileSystem,FreeSpace,IsReady,Path,RootFolder,SerialNumber,ShareName,TotalSize,VolumeName',1,setObjValueFlag.array);
setObjValue('folderProperty','Attributes,DateCreated,DateLastAccessed,DateLastModified,Drive,Name,ParentFolder,Path,ShortName,ShortPath,Size,Type,Files,IsRootFolder,SubFolders',1,setObjValueFlag.array);//Files起為Folder property
fileProperty=folderProperty.slice(0,12);//folderProperty.sort();
*/


//var kkk='';_.traverse_file_system(function(fileItem,itemType){kkk+=(itemType==_.traverse_file_system.f.driver?fileItem.DriveLetter+':('+fileItem.VolumeName+')':fileItem.Name+(itemType==_.traverse_file_system.f.folder?path_separator:''))+'\n';},'I:\\Documents and Settings\\kanashimi\\My Documents\\kanashimi\\www\\cgi-bin\\program');_.write_to_file('tmp.txt',kkk,'unicode');
/*

_.traverse_file_system(FS_function_array)	省略path會當作所有Drives
_.traverse_file_system(FS_function_array,'c:')	c:→c:\→sub dir of c:\
_.traverse_file_system(FS_function_array,'c:\\')	c:\→sub dir of c:\
_.traverse_file_system(FS_function_array,'c:\\cc')	c:\cc,cc為dir→sub dir of c:\cc\
_.traverse_file_system(FS_function_array,'c:\\cc\\')	c:\cc\→sub dir of c:\cc\
_.traverse_file_system(FS_function_array,['c:\\cc\\','d:\\dd'])	c:\cc\→sub dir of c:\cc\→d:\dd→sub dir of d:\dd
_.traverse_file_system([,folderFunction],'.');


_.traverse_file_system([,folderFunction],basePath);
function folderFunction(folderItem){
 t=folderItem.Path.slice(same_length(basePath,folderItem.Path));
 //if(t==folderItem.Name)	//	僅單層subdir次目錄
 //if(t.indexOf(path_separator)==t.lastIndexOf(path_separator))	//	僅單層及次層subdir次目錄
 if(t.replace(new RegExp('[^'+path_separator_RegExp+']','g'),'').length<3)	//	僅3層subdir以下
  ;
}


//	itemType=0:file/1:folder/2:driver
function fsoFunction(fsi,itemType){if(!itemType){}}
function fileFunction(fileItem){}
function folderFunction(folderItem){}
function driverFunction(driverItem){}

filter:
	file_filter	僅單一 filter 時預設當作 file_filter, should has NO global flag.
	[file_filter,folder_filter]
file_filter	篩選檔案, should has NO global flag.
folder_filter	篩選資料夾, should has NO global flag.


tip:
使用相對路徑，如'..'開頭時需用getFP()調整過。
用folder.Size==0可判別是否為empty folder

TODO:
限定traverse深度幾層,sort=8,preOrder=0,widthFirst=0,postOrder=16,depthFirst=16
*/
//_.traverse_file_system.stop=false;

//_.traverse_file_system[generateCode.dLK]='initWScriptObj';
CeL.IO.Windows.file
.
/**
 * 巡覽 file system 的公用函數
 * @param FS_function_array	file system handle function array
 * @param path	target path
 * @param filter	filter
 * @param flag	see <a href="#.traverse_file_system.f">flag</a>
 * @return
 * @memberOf	CeL.IO.Windows.file
 * @see	<a href="http://msdn.microsoft.com/library/en-us/script56/html/0fa93e5b-b657-408d-9dd3-a43846037a0e.asp">FileSystemObject</a>
 */
traverse_file_system = function(FS_function_array, path, filter, flag){
	var _s = arguments.callee, _f = _s.f;

	// initial
	// 預設 flag
	// if(isNaN(flag))flag=_f.traverse;

	//library_namespace.log('traverse_file_system:\n[' + path + ']');
	if (FS_function_array === _f.get_object)
		// or FS_function_array=[,,]:	可以使用 Array 常值中的空白元素來建立零星稀疏的陣列。
		FS_function_array = new Array(_f.func_length),
		flag = _f.get_object;
	else {
		/*
		if (FS_function_array instanceof Array && FS_function_array.length == 1)
			FS_function_array = FS_function_array[0];
		*/
		if (typeof FS_function_array === 'function') {
			var i = FS_function_array;
			FS_function_array = [ i, i, i ];
		}
	}
	//library_namespace.log('traverse_file_system: fso:\n[' + fso + ']');
	if (typeof fso !== 'object' || !(FS_function_array instanceof Array)
			|| !FS_function_array.length)
		return;
	//library_namespace.log('traverse_file_system: FS_function_array:\n[' + FS_function_array + ']');
	if (!filter)
		filter = [];
	else if (filter instanceof RegExp)
		// filter=[filter,filter]; 通常我們輸入的只會指定 file filter
		filter = [ filter, ];
	else if (typeof filter !== 'object')
		filter = [ filter, ];

	//library_namespace.log('traverse_file_system: FS_function_array:\n[' + FS_function_array + ']');
	var item, iType, fc, i, traverse = !(flag & _f.no_traverse), objBuf = [], typeBuf = [], folder_filter = filter[1], testFilter = function(
			f) {
		try {
			// f instanceof RegExp
			f.test('');
		}
		catch (e) {
			// throw new Error(e.number,'traverse_file_system: 錯誤的 filter:\n'+f+'\n'+e.description);
			e.description = 'traverse_file_system: 錯誤的 filter:\n' + f + '\n'
			+ e.description;
			throw e;
		}
	};
	if (filter = filter[0])
		if (typeof filter === 'string')
			filter = new RegExp(filter);
		else
			testFilter(filter);
	if (folder_filter)
		if (typeof folder_filter === 'string')
			folder_filter = new RegExp(folder_filter);
		else
			testFilter(folder_filter);
	// if(flag!=_f.get_object)alert(filter+'\n'+folder_filter);
	// 至此 filter 代表 file_filter, vs. folder_filter


	// 轉換輸入之各項成fso object
	if (!path) { // 取得各個driver code
		if (flag === _f.get_object)
			return;
		for ( var drivers = new Enumerator(fso.Drives); !drivers.atEnd(); drivers
		.moveNext())
			objBuf.push(drivers.item()), typeBuf
			.push(_f.driver);
		objBuf.reverse(), typeBuf.reverse();
	} else if (typeof path === 'object')
		if (path.length) {
			for (i = 0; i < path.length; i++)
				if (item = _s(_f.get_object,
						'' + path[i], filter, flag))
					objBuf.push(item[0]), typeBuf.push(item[1]);
		} else {
			item = typeof path.IsReady !== 'undefined' ? _f.driver
					: typeof path.IsRootFolder !== 'undefined' ? _f.folder
							: typeof path.Path !== 'undefined' ? _f.file
									: _f.NULL;
			if (_f.NULL != -1)
				objBuf.push(path), typeBuf.push(item);
		}
	else {
		i = true; // fault
		if (i)
			try {
				objBuf.push(fso.GetFolder(path)), typeBuf
				.push(_f.folder), i = false;
			} catch (e) {
			}// fso.FolderExists()
			if (i)
				try {
					objBuf.push(fso.GetFile(path)), typeBuf
					.push(_f.file), i = false;
				} catch (e) {
				}// fso.FileExists()
				if (i && path == fso.GetDriveName(path))
					try {
						objBuf.push(fso.GetDrive(path)), typeBuf
						.push(_f.driver), i = false;
					} catch (e) {
					}
	}
	if (flag == _f.get_object)
		return objBuf[0] ? [ objBuf[0], typeBuf[0] ] : 0;

		// FS_function_array.length=_f.func_length;
		for (i = 0; i < _f.func_length; i++)
			// 可以安排僅對folder或是file作用之function
			if (typeof FS_function_array[i] !== 'function')
				FS_function_array[i] = function() {};
			//alert(objBuf.length+','+typeBuf.length+'\n'+typeBuf);
			// main loop
			while (!_s.stop && objBuf.length)
				if (item = objBuf.pop()) // fsoFunction執行途中可能將此項目刪除
					switch (iType = typeBuf.pop()) {
					case _f.folder:
						if (!folder_filter || folder_filter.test(item.Name))
							FS_function_array[iType](item, iType);
						// if(traverse||traverse!==0){
						// if(!traverse)traverse=0; // 加上次一層: 會連這次一層之檔案都加上去。
						if (traverse)
							for (fc = new Enumerator(item.SubFolders); !fc.atEnd(); fc
							.moveNext())
								if (i = fc.item(), !folder_filter
										|| folder_filter.test(i.Name))
									objBuf.push(i), typeBuf
									.push(_f.folder);
						// }
						// try 以防item已經被刪除
						try {
							fc = new Enumerator(item.Files);
						} catch (e) {
							fc = 0;
						}
						if (fc) {
							// for(;!fc.atEnd();fc.moveNext())if(i=fc.item(),!filter||filter.test(i.Name))FS_function_array[_f.file](i,_f.file);
							// 因為檔案可能因改名等改變順序，因此用.moveNext()的方法可能有些重複，有些漏掉未處理。
							for (item = []; !fc.atEnd(); fc.moveNext())
								item.push(fc.item());
							for (i in item)
								if (i = item[i], !filter || filter.test(i.Name))
									FS_function_array[_f.file](i,
											_f.file);
						}
						break;
					case _f.file:
						if (!filter || filter.test(item.Name))
							FS_function_array[iType](item, iType);
						break;
					case _f.driver:
						if (!item.IsReady)
							break;
						FS_function_array[iType](item, iType);
						if (traverse)
							objBuf.push(item.RootFolder), typeBuf
							.push(_f.folder);
						// break;
						//default:break;
					}

};


//setObjValue('traverse_file_system.f','get_object=-2,NULL=-1,file,folder,driver,func_length,traverse=0,no_traverse=4',1);//,sort=8,preOrder=0,widthFirst=0,postOrder=16,depthFirst=16
CeL.IO.Windows.file
.
/**
 * <a href="#.traverse_file_system">traverse_file_system</a> 的 flag enumeration
 * @memberOf	CeL.IO.Windows.file
 * @constant
 */
traverse_file_system.f = {
		/**
		 * return object
		 * @memberOf	CeL.IO.Windows.file
		 */
		get_object : -2,
		/**
		 * null flag
		 * @private
		 * @memberOf	CeL.IO.Windows.file
		 */
		NULL : -1,
		/**
		 * 用於指示 file
		 * @private
		 * @memberOf	CeL.IO.Windows.file
		 */
		file : 0,
		/**
		 * 用於指示 folder
		 * @private
		 * @memberOf	CeL.IO.Windows.file
		 */
		folder : 1,
		/**
		 * 用於指示 driver
		 * @private
		 * @memberOf	CeL.IO.Windows.file
		 */
		driver : 2,
		/**
		 * handle function 應有的長度
		 * @private
		 * @memberOf	CeL.IO.Windows.file
		 */
		func_length : 3,
		/**
		 * 深入下層子目錄及檔案
		 * @memberOf	CeL.IO.Windows.file
		 */
		traverse : 0,
		/**
		 * 不深入下層子目錄及檔案
		 * @memberOf	CeL.IO.Windows.file
		 */
		no_traverse : 4
};


return (
	CeL.IO.Windows.file
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for CSV data
 * @fileoverview
 * 本檔案包含了 CSV data 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'data.CSV';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.data.CSV
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	CSV data 的 functions
 */
CeL.data.CSV
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.data.CSV
.prototype = {
};





/*

TODO:
可一筆一筆處理，不佔記憶體。
DoEvents

http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html
GetKeywords: function(str) {
 o: return '\\b(' + str.replace(/\s+/g, '|') + ')\\b';
 x: return '\\b' + str.replace(/\s+/g, '\\b|\\b') + '\\b';
},


http://www.jsdb.org/
jsdb.from_array
jsdb.from_CSV
jsdb.from_CSV_file
jsdb.select=function(
	field	//	[1,0,1,1,1] || '1010100' || 'a,b,c,d' || {a:0,b:1,c:1}
	,where	//	function(o={a:,b:,c:}){..;return select;} || {a:3} || {a:function(a){..;return select;}} || {a://} || {op:'a&&b||c',a:[3,4,6,11],b:[4,5,6],c:32}
	)
jsdb.concat(table1, table2, id filed/[id fileds] = auto detect)
jsdb.from_HTML_TABLE(data,for_every_cell)
jsdb.transpose	//	轉置
jsdb.to_CSV
jsdb.to_HTML_TABLE
jsdb.to_array(row_first)
jsdb.to_object(row_first)

*/

CeL.data.CSV
.
/**
 * parse CSV data to JSON	讀入 CSV 檔
 * @param {String} _t	CSV text data
 * @param {Boolean} doCheck check if data is valid
 * @param {Boolean} hasTitle	there's a title line
 * @return	{Array}	[ [L1_1,L1_2,..], [L2_1,L2_2,..],.. ]
 * @memberOf	CeL.data.CSV
 * @example
 * //	to use:
 * var data=parse_CSV('~');
 * data[_line_][_field_]
 *
 * //	hasTitle:
 * var data = parse_CSV('~',0,1);
 * //data[_line_][data.t[_title_]]
 *
 * //	then:
 * data.tA	=	title line
 * data.t[_field_name_]	=	field number of title
 * data.it	=	ignored title array
 * data[num]	=	the num-th line (num: 0,1,2,..)
 * @see
 * <a href="http://www.jsdb.org/" accessdate="2010/1/1 0:53">JSDB: JavaScript for databases</a>,
 * <a href="http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html" accessdate="2010/1/1 0:53">John Hax: A lesson of RegExp: 50x faster with just one line patch</a>
 */
parse_CSV = function(_t, doCheck, hasTitle) {
	if (!_t || !/[^\n]/.test(_t = _t.replace(/\r\n?/g, '\n')))
		return;
	//_t+=_t.slice(-1)!='\n\n'?'\n':'\n';//if(_t.slice(-1)!='\n')_t+='\n';//if(!/\n/.test(_t))_t+='\n';	//	後面一定要[\n]是bug?

	var _f = arguments.callee, _r = [], _a, _b = {}, _i = 0, _m = _f.fd

/*
Here is a workaround for Opera 10.00 alpha build 1139 bug

'\u10a0'.match(/[^\u10a1]+/)
and
'\u10a0'.match(/[^"]+/)
gives different result.
The latter should '\u10a0' but it gives null.

But
'\u10a0'.match(/[^"\u109a]+/)
works.

*/
	, c = '\u10a0'.match(/[^"]+/) ? '' : '\u109a'
	;


	for (_m = '((|[^' + _f.td + _m
			// +c: for Opera bug
			+ c
			+ '\\n][^' + _m
			// +c: for Opera bug
			+ c
			+ '\\n]*'; _i <
			// 這裡不加  _f.td 可以 parse 更多狀況
			_f.td.length; _i++)
		_a = _f.td.charAt(_i), _b[_a] = new RegExp(_a + _a, 'g'), _m += '|'
			+ _a + '(([^' + _a
			// +c: for Opera bug
			+ c
			// 不用 [^'+_a+']+| 快很多
			+ ']|' + _a + _a + '|\\n)*)' + _a;
	_m += ')[' + _f.fd + '\\n])';
/*
 _m=
	'((|[^\'"'+_m+'\\n][^'+_m+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n])'
	'((|[^\'"'+_m+'\\n$][^'+_m+'\\n$]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n$])'
_a='((|[^"\''+_f.fd+'\\n][^'+_f.fd+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_f.fd+'\\n])',alert(_m+'\n'+_a+'\n'+(_m==_a));
*/
	//alert( 'now:\n' + new RegExp(_m,'g').source + '\n\nfull:\n' + /((|[^'",;\t\n$][^,;\t\n$]*|'((''|[^']|\n)*)'|"((""|[^"]|\n)*)")[,;\t\n$])/.source);
	if (doCheck
			&& !new RegExp('^(' + _m + ')+$').test(_t.slice(-1) == '\n' ? _t
					: _t + '\n'))
		throw new Error(1, "parse_CSV(): Can't parse data!\npattern: /^" + _m
				+ "$/g");

	for (_a = [], _i = 0, _m = (_t.slice(-1) == '\n' ? _t : _t + '\n')
			.match(new RegExp(_m, 'g')); _i < _m.length; _i++) {
		_a.push(_b[_t = _m[_i].charAt(0)] ? _m[_i].slice(1, -2).replace(_b[_t],
				_t) : _m[_i].slice(0, -1));
		//alert('['+_i+'] '+_m[_i]+'|\n'+_a.slice(-1));
		if (_m[_i].slice(-1) == '\n')
			_r.push(_a), _a = [];
	}
	//if(_a.length)_r.push(_a);

	if (typeof hasTitle == 'undefined')
		hasTitle = _f.hasTitle === null ? 0 : _f.hasTitle;
	if (hasTitle) {
		// ignored title array
		_r.it = [];
		while (_a = _r.shift(), _a.length < _r[0].length)
			// 預防 title 有許多行
			_r.it.push(_a);
		for (_r.tA = _a, _b = _r.t = {}, _i = 0; _i < _a.length; _i++)
			_b[_a[_i]] = _i;
	}

	// _r=[ [L1_1,L1_2,..], [L2_1,L2_2,..],.. ]
	return _r;
};
/**
 * field delimiter
 */
_.parse_CSV.fd = '\\t,;';// :\s
/**
 * text delimiter
 */
_.parse_CSV.td = '"\'';
//_.parse_CSV.ld	line delimiter: only \n, \r will be ignored.
/**
 * auto detect.. no title
 */
_.parse_CSV.hasTitle = null;
//_.parse_CSV.title_word='t';	//	data[parse_CSV.title_word]=title row array
//_.parse_CSV.fd=';',parse_CSV.td='"',alert(parse_CSV('"dfdf\nsdff";"sdf""sadf\n""as""dfsdf";sdfsadf;"dfsdfdf""dfsadf";sfshgjk',1).join('\n'));WScript.Quit();



//	2007/8/6 17:53:57-22:11:22

/*
test:
'dfgdfg,"fgd",dfg'
'dfgdfg,"fgd",dfg'

'sdfsdf','ssdfdf'',''sdf'

*/
/**
 * 讀入CSV檔<br/>
 * !! slow !!
 * @since 2007/8/6 17:53:57-22:11:22
 * @see 可參考 JKL.ParseXML.CSV.prototype.parse_CSV	2007/11/4 15:49:4
 * @deprecated 廢棄: use parse_CSV() instead
 * @param FP file path
 * @param FD field delimiter([,;:	]|\s+)
 * @param TD text delimiter['"]
 * @param hasTitle the data has a title line
 * @return Array contains data
 */
//readCSVdata[generateCode.dLK]='autodetectEncode,simpleRead,simpleFileAutodetectEncode';
function readCSVdata(FP,FD,TD,hasTitle,enc){
 var t=simpleRead(FP,enc||simpleFileAutodetectEncode).replace(/^[\r\n\s]+/,''),r=[],reg={
	'"':/"?(([^"]+|"")+)"?([,;:	]|[ \r\n]+)/g,
	"'":/'?(([^']+|'')+)'?([,;:	]|[ \r\n]+)/g
 };
 //	detect delimiter
/*
 if(!FD||!TD){
  var a,b,i=0,F='[,;:	\s]',T='[\'"]',r=new RegExp('(^'+(TD||T)+'|('+(TD||T)+')('+(FD||F)+')('+(TD||T)+')|'+(TD||T)+'$)','g');
  F={},T={};
  try{
   t.replace(/(^['"]|(['"])([,;:	\s])(['"])|['"]$)/g,function($0,$1,$2,$3,$4){
    if(!$2)T[$0]=(T[$0]||0)+1;
    else if($2==$4)T[$2]=(T[$2]||0)+1,F[$3]=(F[$3]||0)+1;
    if(i++>20)break;
    return $0;
   });
  }catch(e){}
  if(!FD){a=b=0;for(i in F)if(F[i]>a)a=F[b=i];FD=b;}
  if(!TD){a=b=0;for(i in T)if(T[i]>a)a=T[b=i];TD=b;}
 }
*/
 if(!TD){
  l=t.indexOf('\n');
  if(l==-1)t.indexOf('\r');
  l=(l==-1?t:t.slice(0,l));
  if(!l.replace(reg['"'],''))TD='"';
  else if(!l.replace(reg["'"],''))TD="'";
  else return;
 }
 reg=reg[TD];

 l=[];if(!hasTitle)r.length=1;
 (t+'\n').replace(reg,function($0,$1,$2,$3){
	l.push($1);
	if(/\r\n/.test($3))r.push(l),l=[];
	return '';
 });
 if(hasTitle)
  for(l=0,r.t={};l<r[0].length;l++)r.t[r[0][l]]=l;
 return r;
}


toCSV.fd=',';	//	field delimiter
toCSV.td='"';	//	text delimiter
toCSV.force_td=1;	//	是否強制加上 text delimiter
toCSV.ld='\n';	//	line delimiter
function toCSV(o,title){
 var CSV=[],_f=arguments.callee,s,r,td=_f.td,a=td,i=0,t=function(t){
	var i=0,l=[];
	for(;i<t.length;i++)
	 l.push(s&&s.test(t[i])?t[i].replace(r,a):t[i]);
	i=_f.force_td?(td||''):'';
	CSV.push(i+l.join(i+_f.fd+i)+i);
 };

 if(a)s=new RegExp('\\'+a),r=new RegExp('\\'+a,'g'),a+=a;
 else if(toCSV.ld=='\n')s=/\n/,r=/\n/g,a='\\n';
 if(title)if(title instanceof Array)t(title);

 for(;i<o.length;i++)t(o[i]);

 return CSV.join(_f.ld);
}
/*	old:
function quoteCSVfield(t,d){
 if(!d)d='"';
 for(var i=0,j,rd=new RegExp(d,'g'),d2=d+d;i<t.length;i++){
  for(j=0;j<t[i].length;j++)
   if(typeof t[i][j]=='string')t[i][j]=d+t[i][j].replace(rd,d2)+d;
  if(t[i] instanceof Array)t[i]=t[i].join(',');
 }
 return t.join('\n')+'\n';
}
*/






return (
	CeL.data.CSV
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL file function for XML
 * @fileoverview
 * 本檔案包含了 XML 的 file functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'data.XML';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.data.XML
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {


/**
 * null module constructor
 * @class	XML 操作相關之 function。
 */
CeL.data.XML
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.data.XML
.prototype = {
};





/*	parse XML document
	http://www.adp-gmbh.ch/web/js/msxmldom/methods_properties.html
	http://www.w3pop.com/learn/view/doc/transform_XML/
	http://www.vacant-eyes.jp/Tips/txml/030.aspx
	http://www.klstudio.com/post/94.html
	http://xmljs.sourceforge.net/
	ajaxslt	http://code.google.com/p/ajaxslt/

flag:	dcba in binary
	isFP:
	a==0	view as text
	a==1	view as filename	If you want to parse a local file, You can use XSLT as well.
	rX:
	b==0	return dom.documentElement object
	b==1	return dom object
	fast:
	c==0	normal speed
	c==1	faster: ignore check

to use:
	filtered_node=return_nodes.selectSingleNode("/tag1/tag2[tag3='1041']")
	nodes.selectSingleNode("~").Text;
	nodes.item(0).text;
	node.getAttribute("~");
	node.attributes(0).firstChild.nodeValue.valueOf()
	node.attributes.item(0).firstChild.nodeValue.valueOf()
	node.attributes.getNamedItem("~").nodeValue.valueOf()
	..

getXML():
loadXML(getU('全省空白價目表.xml')).getElementsByTagName("Worksheet").length


TODO:
可參考 JKL.ParseXML, http://doctype.googlecode.com/svn/trunk/goog/dom/xml.js
postXML()和parseXML(text/HTML object/array)方法
MSXML2.XSLTemplate

libXmlRequest Library
r=document.implementation.createDocument("",XMLtext,null);
r.appendChild(r.createElement(XMLtext));


string = (new XMLSerializer()).serializeToString(xmlobject);

*/
function loadXML(XMLtext,flag){
 var dom//,xmlDoc
	,isFP=flag%2,rX,fast;

 if(window.DOMParser){
  dom=(new DOMParser).parseFromString(XMLtext,'text/xml');//'application/xml'
  if(!dom.documentElement||dom.documentElement.tagName=='parsererror')
   throw new Error(1,dom.documentElement.firstChild.data+'\n'+dom.documentElement.firstChild.nextSibling.firstChild.data);
  return dom;
 }

 if(typeof ActiveXObject==='undefined'){
  dom=document.createElement('div');
  dom.innerHTML=XMLtext;
  return dom;
 }

 try{	//	ActiveXObject is supported
  // フリースレッド DOM ドキュメントを使用すれば、ファイルを共有アプリケーション状態に取り込むことができます。
  // フリースレッド モデルの欠点の 1 つは、未使用のメモリのクリーンアップにおける待ち時間が増大し、それ以降の操作のパフォーマンスに影響を及ぼすということです (実際にはクリーンアップが遅れているだけなのに、これをメモリ リークとして報告してくる人もいます)。
  //	http://www.microsoft.com/japan/msdn/columns/xml/xml02212000.aspx
  dom=new ActiveXObject("Microsoft.FreeThreadedXMLDOM");
 }catch(e){
  dom=new ActiveXObject("Microsoft.XMLDOM");//CreateObject("Microsoft.XMLDOM");	MSXML3.DOMDocument,MSXML2.DOMDocument,MSXML.DOMDocument,	Msxml2.DOMDocument.6.0,Msxml2.DOMDocument.5.0,Msxml2.DOMDocument.4.0,MSXML4.DOMDocument,Msxml2.DOMDocument.3.0
 }

 if(!dom)throw new Error(1,'No parser!');

 flag>>=1;rX=flag%2;flag>>=1;fast=flag%2;

 // faster: 既定の 「レンタル」 スレッディング モデルを使用する方法です (このスレッディング モデルでは、DOM ドキュメントは一度に 1 つのスレッドからしか使用できません)。
 //	http://www.microsoft.com/japan/msdn/columns/xml/xml02212000.aspx
 if(fast)with(dom)validateOnParse=resolveExternals=preserveWhiteSpace=false;

 if(isFP){
  dom.async=false;//'false'
  //dom.validateOnParse=true;	//	DTD Validation
  dom.load(XMLtext);
 }else dom.loadXML(XMLtext);
 //if(Number(dom.parseError))throw dom.parseError;	//	or return null
 return rX?dom:dom.documentElement;	//	with(dom.parseError)errorCode,reason,line
}

/*	untested
TODO:
(new XSLTProcessor()).importStylesheet(XMLF);	libXmlRequest Library
*/
//applyXSLT[generateCode.dLK]='loadXML';
function applyXSLT(XMLF, XSLTF) {
	return loadXML(XSLTF, 1 + 2).transformNode(loadXML(XSLTF, 1 + 2));
};



/*
to use: include in front:
way1(good: 以reg代替functionPath!):
//	[function.js]_iF
//	[function.js]End

way2(old):
//	[function.js]getU,functionPath,'eval(getU(functionPath));'
//	[function.js]End

old:
function getU(p){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false),send(null);return responseText;}}
*/



/*	JScript or .wsh only, 能 encode
	http://neural.cs.nthu.edu.tw/jang/books/asp/getWebPage.asp?title=10-1%20%E6%8A%93%E5%8F%96%E7%B6%B2%E9%A0%81%E8%B3%87%E6%96%99
*/
function getPage(p,enc,t){	//	page url, encode, POST text
try{
 var X=new ActiveXObject('Microsoft.XMLHTTP'),AS;	//	may error
 X.open(t?'POST':'GET',p,false);
 X.setRequestHeader("Content-Type","application/x-www-form-urlencoded");	//	POST need this
 X.send(t||null);	//	Download the file
 with(AS=new ActiveXObject("ADODB.Stream")){
  Mode=3,	//	可同時進行讀寫
  Type=1,	//	以二進位方式操作
  Open(),	//	開啟物件
  Write(X.responseBody),	//	將 binary 的資料寫入物件內	may error
  Position=0,
  Type=2;	//	以文字模式操作
  if(enc)Charset=enc;	//	設定編碼方式
  X=ReadText();	//	將物件內的文字讀出
 }
 AS=0;//AS=null;	//	free
 return X;
}catch(e){
 //sl('getPage: '+e.message);
}}



/*	set a new XMLHttp
	Ajax程式應該考慮到server沒有回應時之處置

return new XMLHttpRequest(for Ajax, Asynchronous JavaScript and XML) controller
	http://www.xulplanet.com/references/objref/XMLHttpRequest.html
	http://zh.wikipedia.org/wiki/AJAX
	http://jpspan.sourceforge.net/wiki/doku.php?id=javascript:xmlhttprequest:behaviour
	http://www.scss.com.au/family/andrew/webdesign/xmlhttprequest/
	http://developer.apple.com/internet/webcontent/xmlhttpreq.html
	http://www.klstudio.com/catalog.asp?cate=4
	http://wiki.moztw.org/index.php/AJAX_%E4%B8%8A%E6%89%8B%E7%AF%87
	http://www.15seconds.com/issue/991125.htm
	http://www.xmlhttp.cn/manual/xmlhttprequest.members.html
	http://www.blogjava.net/eamoi/archive/2005/10/31/17489.html
	http://www.kawa.net/works/js/jkl/parsexml.html
	http://www.twilightuniverse.com/

	XMLHttp.readyState 所有可能的值如下：
	0 還沒開始
	1 讀取中 Sending Data
	2 已讀取 Data Sent
	3 資訊交換中 interactive: getting data
	4 一切完成 Completed

	XMLHttp.responseText	會把傳回值當字串用
	XMLHttp.responseXML	會把傳回值視為 XMLDocument 物件，而後可用 JavaScript DOM 相關函式處理
	IE only(?):
	XMLHttp.responseBody	以unsigned array格式表示binary data
				try{responseBody=(new VBArray(XMLHttp.responseBody)).toArray();}catch(e){}
				http://aspdotnet.cnblogs.com/archive/2005/11/30/287481.html
	XMLHttp.responseStream	return AdoStream
*/
function newXMLHttp(enc,isText){
 //if(typeof XMLHttp=='object')XMLHttp=null;
 var _new_obj_XMLHttp;
 if(typeof newXMLHttp.objId=='string')_new_obj_XMLHttp=new ActiveXObject(newXMLHttp.objId);	//	speedy
 //	jQuery: Microsoft failed to properly implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available.
 else if(typeof ActiveXObject!='undefined')for(var i=0,a=['Msxml2.XMLHTTP','Microsoft.XMLHTTP','Msxml2.XMLHTTP.4.0'];i<a.length;i++)
  try{_new_obj_XMLHttp=new ActiveXObject(a[i]);newXMLHttp.objId=a[i];break;}catch(e){}//'Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0',["MSXML2", "Microsoft", "MSXML"].['XMLHTTP','DOMDocument'][".6.0", ".4.0", ".3.0", ""]
  //	或直接設定：	XMLHttpRequest=function(){return new ActiveXObject(newXMLHttp.objId);}
 //	皆無：use XMLDocument. The document.all().XMLDocument is a Microsoft IE subset of JavaScript.	http://www.bindows.net/	http://www.java2s.com/Code/JavaScriptReference/Javascript-Properties/XMLDocument.htm
 else if(typeof window=='object'&&window.XMLHttpRequest/* && !window.ActiveXObject*/){//typeof XMLHttpRequest!='undefined'
  _new_obj_XMLHttp=new XMLHttpRequest();
  //	有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type 檔頭（header）時會出錯。為了避免這個問題，你可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
  //	http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
  //	http://www.w3.org/TR/XMLHttpRequest/	search encoding
  if(_new_obj_XMLHttp.overrideMimeType)
   _new_obj_XMLHttp.overrideMimeType('text/'+(isText?'plain':'xml')+(enc?'; charset='+enc:''));//oXML
 }
 return _new_obj_XMLHttp;
}

/*	讀取URL by XMLHttpRequest

* 若有多行程或為各URL設定個別XMLHttp之必要，請在一開始便設定getURL.multi_request，並且別再更改。
** 在此情況下，單一URL仍只能有單一個request!
** 設定 dealFunction 須注意程式在等待回應時若無執行其他程式碼將自動中止！
	可設定：
	while(getURL.doing)WScript.Sleep(1);	//||timeout

arguments f:{
	URL:'',	//	The same origin policy prevents document or script loaded from one origin, from getting or setting properties from a of a document from a different origin.(http://www.mozilla.org/projects/security/components/jssec.html#sameorigin)
	enc:'UTF-8',	//	encoding: big5, euc-jp,..
	fn:(dealFunction),	//	onLoad:function(){},
	method:'GET',	//	POST,..
	sendDoc:'text send in POST,..'
	async:ture/false,	//	true if want to asynchronous(非同期), false if synchronous(同期的,會直到readyState==4才return)	http://jpspan.sourceforge.net/wiki/doku.php?id=javascript:xmlhttprequest:behaviour
	user:'userName',
	passwd:'****',	//	password

 //TODO:
	parameters:'~=~&~=~', // {a:1,b:2}
	header:{contentType:'text/xml'},
	contentType:'text/xml',
	run:true/false,	//	do eval
	update:DOMDocument,	//	use onLoad/onFailed to 加工 return text. onFailed(){throw;} will about change.
	interval:\d,
	decay:\d,	//	wait decay*interval when no change
	maxInterval::\d,
	//insertion:top/bottom,..
	onFailed:function(error){this.status;},	//	onFailed.apply(XMLHttp,[XMLHttp.status])
	onStateChange:function(){},
 }


dealFunction:
自行處理	typeof dealFunction=='function':
function dealFunction(error){..}
代為處理	dealFunction=[d_func,0: responseText,1: responseXML]:
	responseXML:	http://msdn2.microsoft.com/en-us/library/ms757878.aspx
function d_func(content,head[,XMLHttp,URL]){
 if(head){
  //	content,head各為XMLHttp.responseText內容及XMLHttp.getAllResponseHeaders()，其他皆可由XMLHttp取得。
 }else{
  //	content為error
 }
}
e.g., the simplest: [function(c,h){h&&alert(c);}]

)
*/
//getURL[generateCode.dLK]='newXMLHttp';
function getURL(f){	//	(URL,fn) or flag			URL,dealFunction,method,sendDoc,asyncFlag,userName,password
 var _f=arguments.callee;
 if(typeof _f.XMLHttp=='object'){
  //try{_f.XMLHttp.abort();}catch(e){}
  _f.XMLHttp=null;	//	此時可能衝突或lose?!
 }
 //	處理 arguments
 if(!(f instanceof Object))a=arguments,f={URL:f,fn:a[1],method:a[2],sendDoc:a[3]};

 if(!f.URL||!(_f.XMLHttp=newXMLHttp(f.enc,!/\.x(ht)?ml$/i.test(f.URL))))return;//throw
 //try{_f.XMLHttp.overrideMimeType('text/xml');}catch(e){}
 if(typeof f.async!='boolean')
  //	設定f.async
  f.async=f.fn?true:false;
 else if(!f.async)f.fn=null;
 else if(!f.fn)
  if(typeof _f.HandleStateChange!='function'||typeof _f.HandleContent!='function')
   // 沒有能處理的function
   return;//throw
  else
   f.fn=_f.HandleContent;//null;
 if(/*typeof _f.multi_request!='undefined'&&*/_f.multi_request){
  if(!_f.q)_f.i={},_f.q=[];	//	queue
  _f.i[f.URL]=_f.q.length;	//	** 沒有考慮到 POST 時 URL 相同的情況!
  _f.q.push({uri:f.URL,XMLHttp:_f.XMLHttp,func:f.fn,start:_f.startTime=new Date})
 }else if(_f.q&&typeof _f.clean=='function')_f.clean();

 //	for Gecko Error: uncaught exception: Permission denied to call method XMLHttpRequest.open
 if(f.URL.indexOf('://')!=-1&&typeof netscape=='object')
  if(_f.asked>2){_f.clean(f.URL);return;}
  else try{
   if(typeof _f.asked=='undefined')
    _f.asked=0,alert('我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。');
   netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
  }catch(e){_f.asked++;_f.clean(f.URL);return;}//UniversalBrowserAccess

 //if(isNaN(_f.timeout))_f.timeout=300000;//5*60*1000;
 with(_f.XMLHttp)try{	//	IE:404會throw error, timeout除了throw error, 還會readystatechange; Gecko亦會throw error
  try{setRequestHeader("Accept-Encoding","gzip,deflate");}catch(e){}
  //	Set header so the called script knows that it's an XMLHttpRequest
  //setRequestHeader("X-Requested-With","XMLHttpRequest");
  //	Set the If-Modified-Since header, if ifModified mode.
  //setRequestHeader("If-Modified-Since","Thu, 01 Jan 1970 00:00:00 GMT");
  if(f.method=='POST'){//&&_f.XMLHttp.setRequestHeader
   //setRequestHeader("Content-Length",f.sendDoc.length);	//	use .getAttribute('method') to get	長度不一定如此
   //	有些CGI會用Content-Type測試是XMLHttp或是regular form
   //	It may be necessary to specify "application/x-www-form-urlencoded" or "multipart/form-data" for posted XML data to be interpreted on the server.
   setRequestHeader('Content-Type',f.fn instanceof Array&&f.fn[1]?'text/xml':'application/x-www-form-urlencoded');	//	application/x-www-form-urlencoded;charset=utf-8
  }
  abort();
  open(f.method||'GET',f.URL,f.async,f.user||null,f.passwd||null);
  //alert((f.method||'GET')+','+f.URL+','+f.async);
  //	 根據 W3C的 XMLHttpRequest 規格書上說，①在呼叫 open 時，如果readyState是4(Loaded) ②呼叫abort之後 ③發生其他錯誤，如網路問題，無窮迴圈等等，則會重設所有的值。使用全域的情況就只有第一次可以執行，因為之後的readyState是4，所以onreadystatechange 放在open之前會被清空，因此，onreadystatechange 必須放在open之後就可以避免這個問題。	http://www.javaworld.com.tw/jute/post/view?bid=49&id=170177&sty=3&age=0&tpg=1&ppg=1
  //	每使用一次XMLHttpRequest，不管成功或失敗，都要重設onreadystatechange一次。onreadystatechange 的初始值是 null
  //	After the initial response, all event listeners will be cleared. Call open() before setting new event listeners.	http://www.xulplanet.com/references/objref/XMLHttpRequest.html
  if(f.async)
	_f.doing=(_f.doing||0)+1,
	onreadystatechange=typeof f.fn=='function'?f.fn:function(e){_f.HandleStateChange(e,f.URL,f.fn);},//||null
	//	應加 clearTimeout( )
	setTimeout('try{getURL.'+(_f.multi_request?'q['+_f.i[f.URL]+']':'XMLHttp')+'.onreadystatechange();}catch(e){}',_f.timeout||3e5);//5*60*1000;
  send(f.sendDoc||null);
  if(!f.fn)return responseText;//responseXML: responseXML.loadXML(text)	//	非async(異步的)能在此就得到response。Safari and Konqueror cannot understand the encoding of text files!	http://www.kawa.net/works/js/jkl/parsexml.html
 }catch(e){if(typeof f.fn=='function')f.fn(e);else if(typeof window=='object')window.status=e.message;return e;}
}
getURL.timeoutCode=-7732147;

//	agent handle function
getURL.HandleStateChange=function(e,URL,dealFunction){	//	e: object Error, dealFunction: function(return text, heads, XMLHttpRequest object, URL) | [ function, (default|NULL:responseText, others:responseXML) ]
 var _t=0,isOKc,m=getURL.multi_request,_oXMLH;
 if(m)m=getURL.q[isNaN(URL)?getURL.i[URL]:URL],_oXMLH=m.XMLHttp,dealFunction=m.func,URL=m.uri;else _oXMLH=getURL.XMLHttp;
 if(dealFunction instanceof Array)_t=dealFunction[1],dealFunction=dealFunction[0];
 if(!dealFunction || typeof dealFunction!='function'){getURL.doing--;getURL.clean(URL);return;}
 //	http://big5.chinaz.com:88/book.chinaz.com/others/web/web/xml/index1/21.htm
 if(!e)
  if(typeof _oXMLH=='object'&&_oXMLH){
   if(_oXMLH.parseError&&_oXMLH/*.responseXML*/.parseError.errorCode!=0)
    e=_oXMLH.parseError,e=new Error(e.errorCode,e.reason);
   else if(_oXMLH.readyState==4){	//	only if XMLHttp shows "loaded"
    isOKc=_oXMLH.status;	//	condition is OK?
    isOKc=isOKc>=200&&isOKc<300||isOKc==304||!isOKc&&(location.protocol=="file:"||location.protocol=="chrome:");
    if(dealFunction==getURL.HandleContent)dealFunction(0,isOKc,_oXMLH,URL);//dealFunction.apply()
    else dealFunction(
	isOKc?_t?_oXMLH.responseXML:
		//	JKL.ParseXML: Safari and Konqueror cannot understand the encoding of text files.
		typeof window=='object'&&window.navigator.appVersion.indexOf("KHTML")!=-1&&!(e=escape(_oXMLH.responseText)).match("%u")&&e.match("%")?e:_oXMLH.responseText
	:0
	,isOKc?_oXMLH.getAllResponseHeaders():0,_oXMLH,URL);//dealFunction.apply()
    //	URL之protocol==file: 可能需要重新.loadXML((.responseText+'').replace(/<\?xml[^?]*\?>/,""))
    //	用 .responseXML.documentElement 可調用
    getURL.doing--;getURL.clean(URL);
    return;
   }
  }else if(new Date-(m?m.start:getURL.startTime)>getURL.timeout)
   //	timeout & timeout function	http://www.stylusstudio.com/xmldev/199912/post40380.html
   e=new Error(getURL.timeoutCode,'Timeout!');//_oXMLH.abort();
 //alert(URL+'\n'+_t+'\n'+e+'\n'+_oXMLH.readyState+'\n'+dealFunction);
 if(e){dealFunction(e,0,_oXMLH,URL);getURL.doing--;getURL.clean(URL);}//dealFunction.apply(e,URL);
};

/*	agent content handle function
有head時content包含回應，否則content表error
*/
getURL.HandleContent=function(content,head,_oXMLHttp,URL){
 if(head){
  // _oXMLHttp.getResponseHeader("Content-Length")
  alert("URL:	"+URL+"\nHead:\n"+_oXMLHttp.getAllResponseHeaders()+"\n------------------------\nLastModified: "+_oXMLHttp.getResponseHeader("Last-Modified")+"\nResult:\n"+_oXMLHttp.responseText.slice(0,200));//_oXMLHttp.responseXML.xml
 }else{
  //	error	test時，可用getURL.XMLHttp.open("HEAD","_URL_",true);，getURL(url,dealResult,'HEAD',true)。
  if(content instanceof Error)alert('Error occured!\n'+(typeof e=='object'&&e.number?e.number+':'+e.message:e||''));
  else if(typeof _oXMLHttp=='object'&&_oXMLHttp)alert((_oXMLHttp.status==404?"URL doesn't exist!":'Error occured!')+'\n\nStatus: '+_oXMLHttp.status+'\n'+_oXMLHttp.statusText);
 }
};

//	在MP模式下清乾淨queue
getURL.clean=function(i,force){
 if(force||getURL.multi_request)
  if(!i&&isNaN(i)){
   if(getURL.q)
    for(i in getURL.i)
     try{
      getURL.q[getURL.i[i]].XMLHttp.abort();
      //getURL.q[getURL.i[i]].XMLHttp=null;
     }catch(e){}
   getURL.q=getURL.i=0;//null
  }else if(!isNaN(i)||!isNaN(i=getURL.i[typeof i=='object'?i.uri:i])){
   try{getURL.q[i].XMLHttp.abort();}catch(e){};
   //getURL.q[i].XMLHttp=0;
   delete getURL.i[getURL.q[i].uri];getURL.q[i]=0;
  }
};

//	↑XMLHttp set	==================






return (
	CeL.data.XML
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




/**
 * @name	CeL function for compatibility
 * @fileoverview
 * 本檔案包含了相容性 test 專用的 functions。
 * @since	
 */

/*
http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K875.aspx
8進制數字表示被禁止， 010 代表 10 而不是 8
引入備受歡迎的 JSON 對象
Array 對象內置了一些標準函數，如 indexOf(), map(), filter(), reduce()
# Object.keys() 會列出對象中所有可以枚舉的屬性
# Object.getOwnPropertyNames() 會列出對象中所有可枚舉以及不可枚舉的屬性
# Object.getPrototypeof() 返回給定對象的原型
*/

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'code.compatibility';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.code.compatibility
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	**	no requires


/**
 * null module constructor
 * @class	相容性 test 專用的 functions
 */
CeL.code.compatibility
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.code.compatibility
.prototype = {
};






/*	對於舊版沒有Array.push()等函數時之判別及處置,舊版adapter
	從(typeof object.reverse=='function')可偵測object是否為Array
	http://www.coolcode.cn/?p=126
*/
//oldVadapter[generateCode.dLK]='*oldVadapter();';
function oldVadapter(){
 //var _Global=typeof window=='object'?window:this;
 // Global undefined variable
/*
 if(typeof _Global=='undefined')window.undefined=_Global;
 else _Global.undefined=_Global.undefined;
*/

 if(!Array.prototype.push&&typeof Apush=='function')Array.prototype.push=Apush;
 if(!Array.prototype.pop&&typeof Apop=='function')Array.prototype.pop=Apop;
 if(!Array.prototype.shift&&typeof Ashift=='function')Array.prototype.shift=Ashift;
 if(!Array.prototype.unshift&&typeof Aunshift=='function')Array.prototype.unshift=Aunshift;
 //	apply & call: after ECMAScript 3rd Edition	不直接用undefined: for JS5
 if(typeof Function.prototype.apply=='undefined'&&typeof Fapply=='function')Function.prototype.apply=Fapply;
 if(typeof Function.prototype.call=='undefined'&&typeof Fcall=='function')Function.prototype.call=Fcall;
 //if(typeof isNaN!='function'&&typeof NisNaN=='function')isNaN=NisNaN;
 if(typeof encodeURI!='function'&&typeof escape=='function')encodeURI=escape;
 if(typeof decodeURI!='function'&&typeof unescape=='function')decodeURI=unescape;
 if(typeof encodeURIComponent!='function'&&typeof encodeURI=='function')encodeURIComponent=encodeURI;
 if(typeof decodeURIComponent!='function'&&typeof decodeURI=='function')decodeURIComponent=decodeURI;
}

function Apush(o){this[this.length]=o;return this;}
//	將 element_toPush 加入 array_pushTo 並篩選重複的（本來已經加入的並不會變更）
//	array_reverse[value of element_toPush]=index of element_toPush
function pushUnique(array_pushTo,element_toPush,array_reverse){
 if(!array_pushTo||!element_toPush)return array_pushTo;
 var i;
 if(!array_reverse)
  for(array_reverse=new Array,i=0;i<array_pushTo;i++)
   array_reverse[array_pushTo[i]]=i;

 if(typeof element_toPush!='object')
  i=element_toPush,element_toPush=new Array,element_toPush.push(i);

 var l;
 for(i in element_toPush)
  if(!array_reverse[element_toPush])
   //array_pushTo.push(element_toPush),array_reverse[element_toPush]=array_pushTo.length;
   array_reverse[array_pushTo[l=array_pushTo.length]=element_toPush[i]]=l;

 return array_pushTo;
}

function Apop(){
 if(!this.length)return;
 var t=this.slice(-1);this.length--;return t;//不能用return this[--this.length];
}
function Ashift(){
 //var t=this[0],s=this.join('\0');s=s.substr(s.indexOf('\0')+1);this.length=0;this.push(s.split('\0'));return t;
 var t=this[0];
 this.value=this.slice(1);	//	ECMAScript 不允許設定 this=
 return t;
}
function Aunshift(o){
 if(!this.length)return;
 //var t=this.join('\0');this.length=0;this.push(o);this.push(t.split('\0'));return this;
 return this.value=[o].concat(this);	//	ECMAScript 不允許設Κ this=
}	//	不能用t=this.valueOf(); .. this.push(t);
//	奇怪的是，這個版本(5.1版)尚不提供isNaN。(should be isNaN, NOT isNAN)
//	變數可以與其本身比較。如果比較結果不相等，則它會是 NaN。原因是 NaN 是唯一與其本身不相等的值。
//function NisNaN(v){var a=typeof v=='number'?v:parseInt(v);return /*typeof v=='number'&&*/a!=a;}//parseFloat(v)	alert(typeof a+','+a+','+(a===a));
//oldVadapter();

/*	http://www.cnblogs.com/sunwangji/archive/2007/06/26/791428.html	http://www.cnblogs.com/sunwangji/archive/2006/08/21/482341.html
	http://msdn.microsoft.com/en-us/library/4zc42wh1(VS.85).aspx
	http://www.interq.or.jp/student/exeal/dss/ejs/3/1.html
	http://blog.mvpcn.net/fason/
	http://d.hatena.ne.jp/m-hiyama/20051017/1129510043
	http://noir.s7.xrea.com/archives/000203.html

http://msdn.microsoft.com/en-us/library/4zc42wh1(VS.85).aspx
傳回某物件的方法，以另一個物件取代目前的物件。
apply是將現在正在執行的function其this改成apply的引數。所有函數內部的this指針都會被賦值為oThis，這可實現將函數作為另外一個對象的方法運行的目的
xxx.apply(oThis,arrayArgs): 執行xxx，執行時以oThis作為 this，arrayArgs作為 arguments

http://www.tohoho-web.com/js/object.htm#inheritClass
クラスを継承する	親のクラスが持っている機能をすべて使用することができます。

to make classChild inheritance classParent:	http://www.interq.or.jp/student/exeal/dss/ejs/3/2.html
function classChild(_args1,_args2,..){
 處理arguments：arguments.pop() or other way

 classParent.call(this,_args1,_args2,..);	//	way1
 classParent.apply(this,arguments);	//	way2
 //this.constructor=classChild;	//	maybe needless

 // ..
}
classChild.prototype=new classParent;	//	for (objChild instanceof objParent)	關鍵字: 繼承，原型
classChild.prototype.methodOfParent=function(..){..};	//	オーバーライド

var objChild=new classChild(_args);
classParent.prototype.methodOfParent.call(objChild, ..);	//	基底プロトタイプのメソッドを呼び出す。ただしこの呼び出し自体は Programmer が Person を継承しているかどうかを何も考慮していません。


因 arguments 非instanceof Array，arguments.join(sp) → Array.prototype.join.call(arguments,sp)
*/
/**
 * @ignore
 */
if(0)function Fapply(/* object */ oThis /* = null */, /* Array */ arrayArgs /* = null */) {
 if(oThis == null || oThis == undefined)	//	グローバルオブジェクトに適用
  return arrayArgs == null || arrayArgs == undefined? this(): this(arrayArgs);
 if(!(oThis instanceof Object))
  return undefined;	//	実際は throw TypeError();

 oThis.$_funcTmp000 = this;

 var oReturn;
 if(arrayArgs == null || arrayArgs == undefined)
  oReturn = oThis.$_funcTmp000();
 else if(arrayArgs instanceof Array){
  var i=0,args=[];
  for(;i<arrayArgs.length;i++)
   args[i]='arrayArgs['+i+']';//args.push('arrayArgs['+i+']');
  oReturn = eval("oThis.$_funcTmp000("+args.join(",")+");");	//	因為arrayArgs[i]之type不固定，故不能直接用arrayArgs.join(",")
 }//else{delete oThis.$_funcTmp000;throw TypeError();}

 delete oThis.$_funcTmp000;
 return oReturn;
}
/*	http://msdn.microsoft.com/library/CHT/jscript7/html/jsmthcall.asp
call 方法是用來呼叫代表另一個物件的方法。call 方法可讓您將函式的物件內容從原始內容變成由 thisObj 所指定的新物件。
如果未提供 thisObj 的話，將使用 global 物件作為 thisObj。
*/
/**
 * @ignore
 */
if(0)function Fcall(/* object */ oThis /* = null [, arg1[, arg2[, ... [, argN]]]]] */){
 var argu=[];
 for(var i=1;i<arguments.length;i++)
  argu[i-1]=arguments[i];	//	argu.push(arguments[i]);
 return this.apply(oThis, argu);
}




CeL.code.compatibility
.
/**
 * Are we in a web environment?
 * @param W3CDOM	Are we in a W3C DOM environment?
 * @return	We're in a web environment.
 * @since	2009/12/29 19:18:53
 * @see
 * use lazy evaluation
 * @memberOf	CeL.code.compatibility
 */
is_web = function(W3CDOM) {
	var _s = arguments.callee;
	if (!('web' in _s))
		_s.W3CDOM =
				(
				_s.web = typeof window === 'object'
						&& typeof document === 'object'
						&& window.document === document
						// 下兩個在 IE5.5 中都是 Object
						//&& library_namespace.is_type(window, 'global')
						//&& library_namespace.is_type(document, 'HTMLDocument')
				)
				// W3CDOM, type: Object @ IE5.5
				&& document.createElement
				// &&!!document.createElement
				//	type: Object @ IE5.5
				&& document.getElementsByTagName;

	return W3CDOM ? _s.W3CDOM : _s.web;
};


CeL.code.compatibility
.
/**
 * 判斷為 DOM。
 * @param	name	various name
 * @return	{Boolean}	various is object of window
 * @since	2010/1/14 22:04:37
 */
is_DOM = function(name) {
	var r = _.is_web();
	if (!r || !name)
		return r;

	// CeL.debug(CeL.is_type(window[name]));
	try {
		eval('r=' + name);
		r = r === window[name];
	} catch (e) {
		r = false;
	}
	return r;
};


//is_HTA[generateCode.dLK]='is_web';
CeL.code.compatibility
.
/**
 * Are we run in HTA?<br/>
 * ** HTA 中應該在 onload 中呼叫，否則 document.getElementsByTagName 不會有東西！
 * @param [id]	HTA tag id (only used in low version that we have no document.getElementsByTagName)
 * @return	We're in HTA
 * @require	is_web
 * @since	2009/12/29 19:18:53
 * @memberOf	CeL.code.compatibility
 * @see
 * http://msdn2.microsoft.com/en-us/library/ms536479.aspx
 * http://www.microsoft.com/technet/scriptcenter/resources/qanda/apr05/hey0420.mspx
 * http://www.msfn.org/board/lofiversion/index.php/t61847.html
 * lazy evaluation
 * http://peter.michaux.ca/articles/lazy-function-definition-pattern
 */
is_HTA = function(id) {
	var _s = arguments.callee, a;
	if ('HTA' in _s)
		return _s.HTA;

	if (is_web(1)) {
		a = document.getElementsByTagName('APPLICATION');
		a = a && a.length === 1 && a[0];
	} else
		a = is_web() && id && document.all && document.all[id];

	return _s.HTA = a;
};



//	版本檢查
function checkVer(ver){
 if(!ver||ver<5)ver=5;	//WScript.FullName,WScript.Path
 with(WScript)if(Version<ver)with(WshShell){
  var promptTitle=Locale==0x411?'アップグレードしませんか？':'請升級'
  ,promptC=Locale==0x411?"今使ってる "+WScript.Name+" のバージョンは古過ぎるから、\nMicrosoft Windows スクリプト テクノロジ Web サイトより\nバージョン "
	+Version+" から "+ver+" 以上にアップグレードしましょう。":"正使用的 "+WScript.Name+" 版本過舊，\n請至 Microsoft Windows 網站將版本由 "
	+Version+" 升級到 "+ver+" 以上。"
  ,url=/*Locale==0x411?*/"http://www.microsoft.com/japan/developer/scripting/default.htm";
  if(1==Popup(promptC,0,promptTitle,1+48))Run(url);
  Quit(1);
 }
}





return (
	CeL.code.compatibility
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};




//--------------------------------------------------------------------------------//




(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'debug';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;

	CeL.set_library(lib_name);

/**
 * setup debug library
 * @namespace	debug library
 * @memberOf	CeL
 */
CeL.debug = function() {
};


CeL.set_loaded(lib_name);

})();







//JSalert[generateCode.dLK]='getScriptName';//,*var ScriptName=getScriptName();
/**
 * 顯示訊息視窗<br/>
 * alert() 改用VBScript的MsgBox可產生更多效果，但NS不支援的樣子。
 * @param message	message or object
 * @param {Number} [wait]	the maximum length of time (in seconds) you want the pop-up message box displayed.
 * @param {String} [title]	title of the pop-up message box.
 * @param {Number} [type]	type of buttons and icons you want in the pop-up message box.
 * @return	{Integer} number of the button the user clicked to dismiss the message box.
 * @requires	CeL.get_script_name
 * @see	<a href="http://msdn.microsoft.com/library/en-us/script56/html/wsmthpopup.asp">Popup Method</a>
 */
function JSalert(message, wait, title, type) {
	var _f=arguments.callee;
	if (typeof _f.cmd === 'undefined') // 控制是否彈跳出視窗
		_f.cmd = typeof WScript === 'object'
				&& /cscript\.exe$/i.test(WScript.FullName);

	// if(!message)message+='';//if(typeof message==='undefined')message='';else if(!message)message+=''; //
	// 有時傳入如message==null會造成error
	// WScript.Echo()會視情況：視窗執行時彈跳出視窗，cmd執行時直接顯示。但需要用cscript執行時才有效果。
	// http://www.microsoft.com/technet/scriptcenter/guide/sas_wsh_mokz.mspx
	// 可以用 WScript.Echo(t1,t2,..)，中間會以' '間隔
	if (_f.cmd && argument.length < 2)
		return WScript.Echo(message);

	if (!title &&
			// typeof getScriptName === 'function'
			this.get_script_name
			)
		title = getScriptName();

	if (isNaN(type))// typeof type!=='number'
		type = 64;

/*
	if (typeof WshShell != 'object')
		if (typeof WScript === 'object')
			WshShell = WScript.CreateObject("WScript.Shell");
		else
			return undefined;
*/
	if (this.WshShell != 'object')
		if (typeof WScript === 'object')
			this.WshShell = WScript.CreateObject("WScript.Shell");
		else
			return undefined;


	return this.WshShell.Popup(
			//	''+message: 會出現 typeof message==='object' 卻不能顯示的
			'' + message,
			wait, title, type
			);
}

// popup object Error(錯誤)
//popErr[generateCode.dLK]='JSalert,setTool,parse_Function';
function popErr(e,t,f){	//	error object, title, additional text(etc. function name)
 var T=typeof e;
 //alert((T=='object')+','+(e.constructor)+','+(Error)+','+(e instanceof Error))
 //	這裡e instanceof Error若是T=='object'&&e.constructor==Error有時不能達到效果！
 //	use: for(i in e)
 T=e instanceof Error?'Error '+(e.number&0xFFFF)+(e.name?' ['+e.name+']':'')+' (facility code '+(e.number>>16&0x1FFF)+'):\n'+e.description+(!e.message||e.message==e.description?'':'\n\n'+e.message):!e||T=='string'?e:'('+T+')'+e;
 f=f?(''+f).replace(/\0/g,'\\0')+'\n\n'+T:T;
 //	.caller只在執行期間有效。_function_self_.caller可用 arguments.callee.caller 代替，卻不能用arguments.caller
 //	arguments.callee.caller 被取消了。	http://www.opera.com/docs/specs/js/ecma/	http://bytes.com/forum/thread761008.html	http://www.javaeye.com/post/602661	http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/cd3d6d6abcdd048b
 if(typeof WshShell=='object')
  WshShell.Popup(f,0,t||'Error '+(arguments.callee.caller==null?'from the top level':'on '+(typeof parse_Function=='function'?parse_Function(arguments.callee.caller).funcName:'function'))+' of '+ScriptName,16);
 else alert(f);
 return T;
}






/*	debug用:	show function Class	2008/7/23 16:33:42
	!! unfinished !!
	//	http://fillano.blog.ithome.com.tw/post/257/59403
	//	** 一些內建的物件，他的屬性可能會是[[DontEnum]]，也就是不可列舉的，而自訂的物件在下一版的ECMA-262中，也可以這樣設定他的屬性。


usage:
showClass('registryF');
showClass(registryF);


trace 的技巧：

對沒 prototype 的，可能是：
var cl=(function(){
 return new ((function(){var kkk='xsa',aa=function(){return kkk;},init=function(){kkk='22';},_=function(){init();};_.prototype.get=function(){return aa();};return _;})());
})();
cl.constructor=null;	//	絕技…無效

sl(cl.get());
showClass('cl');
eval('sl(kkk)',cl.get);


*/

function showClass(c,n){
 var i,sp='<hr style="width:40%;float:left;"/><br style="clear:both;"/>',h='<span style="color:#bbb;font-size:.8em;">'
	,p=function(m,p){sl(h+n+(p?'.prototype':'')+'.</span><em>'+m+'</em> '+h+'=</span> '+f(c[m]));}
	,f=function(f){return (''+f).replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;');};
 if(typeof c=='string'){
  if(!n)n=c;
  c=eval(c);
 }
 if(!n)n='';
 sl('<hr/>Show class: ('+(typeof c)+')'+(n?' [<em>'+n+'</em>]':'')+'<br/>'
	//+(n?'<em>'+n+'</em> '+h+'=</span> ':'')
	+f(c));
 if(c){
  sl(sp+'class member:');
  for(i in c)
   if(i!='prototype')p(i);
  sl(sp+'prototype:');
  c=c.prototype;
  for(i in c)
   p(i,1);
 }
 sl('<hr/>');
}

showClass.repository={};
showClass.repositoryName='';
showClass.setRepository=function(n){
 var _f=arguments.callee;
 _f.repositoryName=n;
 _f.repository=eval(n);
 if(!_f.repository)_f.repository=eval(n+'={}');
};
/**
 * ** loop?
 * @param	name	name
 * @param	scope	scope
 * @ignore
 * @return
 */
showClass.showOnScope = function(name, scope) {
	var _f = arguments.callee, r = _f.repository;
	// 遇到 _f.repositoryName 剛好為 local 值時會失效。
	eval(_f.repositoryName + '.' + name + '=' + name, typeof scope == 'string' ? r[scope] : scope);
	return _f(r[name], name);
};


//	debug用:	show contents of object	2000-2003/2/22 15:49
//var i,t='';for(i in o)t+=i+':'+o[i];alert(t);
function showObj(obj,mode,searchKey,printmode,range){//object,mode,search string
 var Obj,m='',M=[],M_=0,i,v,search,r2=99,sp='	';if(!range)range=2e3;
 if(typeof obj=='object')Obj=obj;else if(typeof obj=='string'&&typeof document!='undefined')
  if((i=obj.indexOf('.'))<1)Obj=document.getElementById(obj);
  else if(Obj=document.getElementById(obj.slice(0,i)),typeof Obj=='object')Obj=eval('Obj.'+obj.substr(i+1));
 if(!Obj)try{Obj=eval(obj);}catch(e){Obj=obj;}
 search=searchKey?isNaN(searchKey)?searchKey==''?0:2:1:searchKey==0?1:0;//0:not search,1:num,2:string
 if(search==1&&searchKey!=''+parseFloat(searchKey))search=2;
 //if(searchKey)if(isNaN(searchKey))if(searchKey=='')search=0;else search=2;else search=1;else search=0;
 //if(!mode&&mode!=0&&is.ns4)mode=1;
 if(typeof Obj=='object'&&Obj)
  if(!mode){for(i in Obj)m+=i+sp;if(m)M.push(m),M_+=m.length,m='';}
  else if(mode==1){
   for(i in Obj){v=''+Obj[i];//''+eval('Obj.'+i);
    if(search&&i.indexOf(searchKey)==-1&&(!v||search==2&&v.indexOf(searchKey)==-1||v!=searchKey))continue;
    m+=i+'='+(v?typeof v=='string'&&v.length>r2?v.slice(0,r2)+'..(string length '+v.length+')':v:'(nothing:'+typeof v+')')+sp;
    if(m.length>range)M.push(m),M_+=m.length,m='';
   }
   if(m)M.push(m),M_+=m.length,m='';
  }else m+='Error mode '+mode+' .';
 else m='** No such object: '+obj+' ! **\n('+typeof obj+')'+obj+'='+Obj;
 if(printmode&&printmode==1&&typeof document!='undefined')
  with(document)open('text/plain'),clear(),write('content of '+obj+':'+(search?'search for '+searchKey+(search==1?'(num)':'(str)'):'')+' <!-- reload to HTML --><br/>\n'+m),close();
 else if(M_)for(v=i=0;i<M.length;i++)t=obj+' : '+v+'-'+(v+=M[i].length)+'/'+M_+(search?', search for '+searchKey+(search==1?'(number)':'(string)')+'.':''),alert(t+' [Enter] to continue..\n\n'+M[i]);
 else alert('showObj() error:\n'+(m||'show '+obj+': Got nothing!'));
}





//--------------------------------------------------------------------------------//




/**
 * @name	CeL log function
 * @fileoverview
 * 本檔案包含了 log functions。
 * @since	2009/11/17
 * @see
 * <a href="http://getfirebug.com/lite.html" accessdate="2010/1/1 14:54">Firebug Lite</a>,
 * <a href="http://www.mozilla.org/projects/venkman/" accessdate="2010/1/1 16:43">Venkman JavaScript Debugger project page</a>
 */

/*
TODO:
emergency/urgent situation alert
會盡量以網頁上方/頂部黄色的導航條/警告條展示
「不再顯示」功能
*/



//WScript.Echo(this.Class);

//	若 library base 尚未 load 或本 module 已經 loaded 則跳過。
if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'code.log';

//var do_before_including = function() {};

/*	to include:
	include code_for_including
	<div id="debug_panel"></div>
	var SL=new Debug.log('debug_panel'),sl=function(){SL.log.apply(SL,arguments);},err=function(){SL.err.apply(SL,arguments);},warn=function(){SL.warn.apply(SL,arguments);};

	http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx

	if possible, use Firebug Lite instead.
	http://benalman.com/projects/javascript-debug-console-log/
*/


//	===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。通常即 CeL。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {
//WScript.Echo(this);

var

//	class private	-----------------------------------

//	class name, 需要用到這個都不是好方法。
//cn='Debug.log',

/**
 * private storage pool
 * @ignore
 */
p=[],

log_data = function(m, l) {
	this.m = m;
	this.l = l;
	return this;
},

/**
 * default write/show log function
 * @ignore
 * @param	{string} id	element id
 */
w = function(id) {
	var o, m, c, _p = p[id], _t = _p.instance,
	/**
	 * buffer
	 * @inner
	 * @ignore
	 */
	b = _p.buf,
	B = _p.board, F = _p.do_function, level;

	if (_p.clean)
		_t.clear(), _p.clean = 0;

	if (!B && !F)
		return;

	while (b.length) {
		m = b.shift(); // 預防 MP 時重複顯示
		if (F)
			F(m);

		//	IE8: 'constructor' 是 null 或不是一個物件
		try {
			c = m.constructor;
			// alert((m.constructor === log_data) + '\n' + m.constructor + '\n' + m);
		} catch (e) {
		}
		if (c === log_data) {
			if (!isNaN(m.l) && m.l < library_namespace.set_debug())
				continue;
			c = m.l in _t.className_set ? m.l : 0;
			m = m.m;
			if (c in _t.message_prefix)
				m = _t.message_prefix[c] + m;
			c = _t.className_set[c];
		} else{
			//	add default style set
			if (c = _t.message_prefix.log)
				m = c + m;
			c = _t.className_set.log || 0;
		}
		_p.lbuf.push(m);

		if (B) { // && typeof document==='object'
			o = _p.instance.log_tag;
			if (o) {
				o = document.createElement(o);
				if (c)
					o.className = c;

				o.innerHTML = typeof m === 'string' ?
						// for character (null)
						m.replace(/\x00/g,
						'<span class="control_character">\\x00</span>')
						//	'­' 這符號可以自動斷行，並在斷行時自動加上個橫槓。在顯示長整數時較有用。
						.replace(/(\d{20})/g,'$1­')
						: m;
			} else
				o = document.createTextNode(m);
			B.appendChild(o);
		}
	}

	//if(_t.auto_hide)B.style.display=B.innerHTML?'block':'none';
	if (B && _t.auto_scroll)
		with (B)
			scrollTop = scrollHeight - clientHeight;
},


/**
 * save log
 * @ignore
 * @param	m	message
 * @param	{string} id	element id
 * @param	force	force to clean the message area
 */
s = function(m, id, force) {
	var _p = p[id], _t = _p.instance, f = _p.logF, s = _t.save_log;
	if (!s || typeof s === 'function' && !s(m, l))
		return;

	if (m)
		_p.sbuf
				.push(m = (_t.save_date && typeof gDate == 'function' ? _t.save_new_line
						+ gDate() + _t.save_new_line
						: '')
						+ m);

	if (force || _t.flush || _p.sbufL > _t.save_limit)
		try {
			if (f
					|| _t.log_file
					&& (f = _p.logF = fso.OpenTextFile(_t.log_file,
							8/* ForAppending */, true/* create */,
							_t.log_encoding)))
				f.Write(_p.sbuf.join(_t.save_new_line)), _p.sbuf = [],
						_p.sbufL = 0, _t.error_message = 0;
		} catch (e) {
			_t.error_message = e;// err(e);
		}
	else if (m)
		_p.sbufL += m.length;
},

//	instance constructor	---------------------------
//	(document object)
/*

_=this


TODO:
set class in each input
input array
show file path & directory functional	可從 FSO operation.hta 移植
增加 group 以便在多次輸入時亦可 trigger 或排版

count
c.f.: GLog

dependency:

*/
/**
 * initial a log tool's instance/object
 * @class	log function
 * @see	usage: <a href="#.extend">CeL.code.log.extend</a>
 * @since	2008/8/20 23:9:48
 * @requires	gDate(),NewLine,fso

 * @constructor
 * @name	CeL.code.log
 * @param	{String, object HTMLElement} obj	message area element or id
 * @param	{Object} [className_set]	class name set
 */
_tmp;CeL.code.log
= function(obj, className_set) {
	// Initial instance object. You can set it yourself.
	/**
	 * log 時 warning/error message 之 className
	 * @name	CeL.code.log.prototype.className_set
	 */
	this.className_set = className_set || {
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.log} 時使用的 className, DEFAULT className.
			 * @name	CeL.code.log.prototype.className_set.log
			 */
			log : 'debug_log',
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.warn} 時使用的 className
			 * @name	CeL.code.log.prototype.className_set.warn
			 */
			warn : 'debug_warn',
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.err} 時使用的 className
			 * @name	CeL.code.log.prototype.className_set.err
			 */
			err : 'debug_err',
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.set_board} 時設定 log panel 使用的 className
			 * @name	CeL.code.log.prototype.className_set.panel
			 */
			panel : 'debug_panel'
	};

	/**
	 * log 時 warning/error message 之 prefix
	 * @name	CeL.code.log.prototype.message_prefix
	 */
	this.message_prefix = {
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.log} 時使用的 prefix, DEFAULT prefix.
			 * @name	CeL.code.log.prototype.message_prefix.log
			 */
			log : '',
			/**
			 * @description	當呼叫 {@link CeL.code.log.prototype.warn} 時使用的 prefix
			 * @name	CeL.code.log.prototype.message_prefix.warn
			 */
			warn : '',
			/**
			 * @description	表示當呼叫 {@link CeL.code.log.prototype.err}, 是錯誤 error message 時使用的 prefix
			 * @name	CeL.code.log.prototype.message_prefix.err
			 */
			err : '<em>!! Error !!</em> '
	};

	this.id = p.length;
	p.push( {
		instance : this,
		/**
		 * write buffer
		 */
		buf : [],
		/**
		 * save buffer when we need to save the messages
		 */
		sbuf : [],
		/**
		 * length of save buffer
		 */
		sbufL : 0,
		/**
		 * now logged buffer
		 */
		lbuf : []
	}); 
	this.set_board(obj);
};



//	class public interface	---------------------------

CeL.code.log
.
/**
 * do the log action
 * @memberOf	CeL.code.log
 * @private
 */
do_log = function(id) {
/*	這段應該只在 module namespace 重複定義時才會發生
 var I=p[id];
 if(!I){
  alert('.do_log: not exist: ['+id+']');
  return;
 }
 I=I.instance;
*/
	var I = p[id].instance;
	if (I.do_log)
		I.do_log();
};


CeL.code.log
.
/**
 * 對各種不同 error object 作應對，獲得可理解的 error message。
 * @param	e	error object
 * @param	new_line	new_line
 * @param	caller	function caller
 * @memberOf	CeL.code.log
 * @see
 * http://msdn.microsoft.com/en-us/library/ms976144.aspx
 * The facility code establishes who originated the error. For example, all internal script engine errors generated by the JScript engine have a facility code of "A".
 * http://msdn.microsoft.com/en-us/library/ms690088(VS.85).aspx
 * 
 * http://msdn.microsoft.com/en-us/library/t9zk6eay.aspx
 * http://msdn.microsoft.com/en-us/library/microsoft.jscript.errorobject.aspx
 * Specifies the name of the type of the error.
 * Possible values include Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, and URIError.
 */
get_error_message = function(e, new_line, caller) {
	if (!new_line)
		new_line = _.prototype.save_new_line;

	if (!caller)
		caller = arguments.callee.caller;

	// from popErr()
	//	type
	var T = library_namespace.is_type(e),
	//	message
	m = T === 'Error' ?
			'Error '
			+ (caller === null ? 'from the top level: ' : '@function: ')
			+ (e.number & 0xFFFF) + (e.name ? ' [' + e.name + '] ' : ' ')
			+ '(facility code ' + (e.number >> 16 & 0x1FFF) + '): '
			+ new_line
			+ (e.description || '').replace(/\r?\n/g, '<br/>')
			+ (!e.message || e.message === e.description ?
				'' :
				new_line
					+ new_line
					+ ('' + e.message).replace(/\r?\n/g, '<br/>')
			)

		: T === 'DOMException'?
			//	http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-17189187
			'[' + T + '] ' + e.code + ': ' + e.message

		: !e || T === 'string' ? e

		: '[' + T + '] ' + (e.message || e);


	if (library_namespace.is_debug(2) && typeof e === 'object' && e)
		for (T in e)
			try{
				m += '<br/> <span class="debug_debug">' + T + '</span>: '
						+ (T === 'stack' ? ('' + e[T]).replace(
							/[\r\n]+$/, '').replace(/\n/g,
							'<br/>- ') : e[T]);
			}catch (e) {}

	//m += ' (' + arguments.callee.caller + ')';
	return m;
};


CeL.code.log
.
/**
 * get new extend instance
 * @param	{String, object HTMLElement} [obj]	message area element or id
 * @return	{Array} [ instance of this module, log function, warning function, error function ]
 * @example
 * //	status logger
 * var SL=new CeL.code.log('log'),sl=SL[1],warn=SL[2],err=SL[3];
 * sl(msg);
 * sl(msg,clear);
 * @memberOf	CeL.code.log
 * @since	2009/8/24 20:15:31
 */
extend = function(obj, className_set) {
	//CeL.Log=new CeL.code.log(function(m){var F=typeof JSalert==='function'?JSalert:typeof alert==='function'?alert:WScript.Echo;F(typeof m==='object'?'['+m.l+'] '+m.m:m);});
	/**
	 * new instance
	 * @type	CeL.code.log
	 * @inner
	 * @ignore
	 */
	var o = new
			CeL.code.log
			(
			obj ||
			//	預設以訊息框代替
			new Function('m',
					(typeof JSalert === 'function' ? 'JSalert':
						typeof WScript === 'object' ? 'WScript.Echo':
					'alert') +
			"(typeof m==='object'?'['+m.l+'] '+m.m:m);"),
			className_set);

	return [ o, function() {
		o.log.apply(o, arguments);
	}, function() {
		o.warn.apply(o, arguments);
	}, function() {
		o.err.apply(o, arguments);
	} ];

};



/*
_.option_open=function(p){

};

_.option_file=function(p){
};

_.option_folder=function(p){
};
*/

//	class constructor	---------------------------


CeL.code.log
.prototype = {

//	instance public interface	-------------------

/**
 * 當執行寫檔案或任何錯誤發生時之錯誤訊息。<br/>
 * while error occurred.. should read only
 * @name	CeL.code.log.prototype.error_message
 */
error_message : '',

/**
 * 超過這長度才 save。<=0 表示 autoflash，非數字則不紀錄。
 * @name	CeL.code.log.prototype.save_limit
 * @type	Number
 */
save_limit : 4000,

/**
 * 在 log 結束時執行，相當於 VB 中 DoEvent() 或 。
 * @name	CeL.code.log.prototype.do_event
 */
do_event : library_namespace.DoNoting || null,


/**
 * log 時使用之 tagName, 可用 div / span 等。若不設定會用 document.createTextNode
 * @name	CeL.code.log.prototype.log_tag
 */
log_tag : 'div',


/**
 * boolean or function(message, log level) return save or not
 * 
 * @name CeL.code.log.prototype.save_log
 * @type Boolean
 */
save_log : false,
/**
 * save log to this file path
 * 
 * @name CeL.code.log.prototype.log_file
 * @type Boolean
 */
log_file : false,
/**
 * auto save log. 若未設定，記得在 onunload 時 .save()
 * 
 * @name CeL.code.log.prototype.flush
 * @type Boolean
 */
flush : false,
/**
 * 在 save log 時 add date
 * 
 * @name CeL.code.log.prototype.save_date
 * @type Boolean
 */
save_date : true,
/**
 * 在 save log 時的換行
 * 
 * @name CeL.code.log.prototype.save_new_line
 * @type string
 */
save_new_line : library_namespace.env.new_line || '\r\n',
/**
 * 在 save log 時的 encoding
 * 
 * @name CeL.code.log.prototype.log_encoding
 */
log_encoding : -1,//TristateTrue


/**
 * 自動捲動
 * 
 * @name CeL.code.log.prototype.auto_scroll
 * @type Boolean
 */
auto_scroll : true,
/**
 * 沒有內容時自動隱藏
 * 
 * @deprecated TODO
 * @name CeL.code.log.prototype.auto_hide
 * @type Boolean
 */
auto_hide : false,

/**
 * 等待多久才顯示 log。若為 0 則直接顯示。<br/>
 * (WScript 沒有 setTimeout)
 * @name	CeL.code.log.prototype.interval
 */
interval : typeof setTimeout === 'undefined' ? 0 : 1,

/**
 * log function (no delay)
 * @name	CeL.code.log.prototype.do_log
 */
do_log : function(level) {
	// if(p[this.id].th)clearTimeout(p[this.id].th);

	// reset timeout handle
	p[this.id].th = 0;

	w(this.id);
},

/**
 * class instance 預設作 log 之 function
 * @param {String} m	message
 * @param clean	clean message area
 * @param level	log level
 * @return
 * @name	CeL.code.log.prototype.log
 */
log : function(m, clean, level) {
	var t = this, _p = p[t.id];
	//var msg_head=(arguments.callee.caller+'').match(/function\s([^\(]+)/);if(msg_head)msg_head=msg_head[1]+' ';
	s(m, t.id, level);

	// window.status = m;
	if (level)
		m = new log_data(m, level);

	if (clean)
		// clean log next time
		_p.clean = 1, _p.buf = [ m ];
	else
		_p.buf.push(m);

	if (!t.interval)
		t.do_log();
	else if (!_p.th)
		if (typeof window.setTimeout === 'undefined')
			t.interval = 0, t.do_log();
		else
			// _p.th=setTimeout(cn+'.do_log('+t.id+');',t.interval);
			_p.th = window.setTimeout(function() {
				_.do_log(t.id);
			}, t.interval);

	if (t.do_event)
		t.do_event();
},

/*
TODO:
other methods: INFO,DEBUG,WARNING,ERROR,FATAL,UNKNOWN
*/

/**
 * save message
 * @name	CeL.code.log.prototype.save
 */
save : function() {
	s('', this.id, 1/* force */);
},

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//className_set:{},

/**
 * log a warning
 * @name	CeL.code.log.prototype.warn
 */
warn : function(m, clean) {
	this.log(m, clean, 'warn');
},

/**
 * deal with error message
 * @name	CeL.code.log.prototype.err
 */
err : function(e, clean) {
	this.log(_.get_error_message(e, this.save_new_line,
						arguments.callee.caller), clean, 'err');
},


/**
 * 設定寫入到哪<br/>set log board for each instance (document object)
 * @name	CeL.code.log.prototype.set_board
 */
set_board : function(o) {
	var _t = this, _p = p[_t.id];
	if (o)
		if (typeof o === 'function')
			_p.do_function = o;

		else {
			if (typeof o !== 'object'
				&& typeof document === 'object')
				o = document.getElementById(o);
			if (o
					// TODO
					// && library_namespace.is_HTML_obj(o)
				) {
				_p.board = o;
				if (_t = _t.className_set.panel)
					o.className += _t;
				delete _p.do_function;
			}
		}

	return _p.board;
},

/**
 * 獲取當前 buffer 中的 log
 * @name	CeL.code.log.prototype.get_log
 */
get_log : function() {
	return p[this.id].lbuf;
},

/**
 * show/hide log board
 * @name	CeL.code.log.prototype.trigger
 */
trigger : function(s) {
	var _s = p[this.id].board.style;
	if (typeof s === 'undefined')
		s = _s.display === 'none';
	_s.display = s ? 'block' : 'none';
},

/**
 * clear log board
 * @name	CeL.code.log.prototype.clear_board
 */
clear_board : function(b) {
	b.innerHTML = '';
},

/**
 * 清除全部訊息 clear message
 * @name	CeL.code.log.prototype.clear
 */
clear : function() {
	var _p = p[this.id];
	if (_p.board)
		this.clear_board(_p.board);
	_p.lbuf = [];
}

};


/**
 * 不 extend 的 member
 * @ignore
 */
CeL.code.log
.no_extend = 'this,do_log,extend';

return (
	CeL.code.log
);
};

//	===================================================

/**
 * modele namespace
 * @type	CeL.code.log
 * @inner
 * @ignore
 */
var ns = CeL.setup_module(module_name, code_for_including);

//WScript.Echo(n.extend);

//code_for_including[generateCode.dLK]='*var Debug={log:code_for_including()};';

CeL.include_module_resource('log.css', module_name);

//	為本 library 用
if (!CeL.Log) {
	var o = ns.extend(), i,
		l = {
			/*
			 * WHITE SMILING FACE (U+263A).
			 * http://decodeunicode.org/en/u+263a
			 */
			'log' : '☺',
			/*
			 * U+26A1 HIGH VOLTAGE SIGN
			 */
			'em' : '⚡',
			/*
			 * WARNING SIGN (U+26A0).
			 */
			'warn' : '⚠',
			/*
			 * U+2620 SKULL AND CROSSBONES
			 */
			'err' : '☠',
			/*
			 * U+2689 BLACK CIRCLE WITH TWO WHITE DOTS
			 */
			'debug' : '⚉'
		},
		t = '<img class="debug_icon" src="' + CeL.get_module_path(module_name, '') + 'icon/';

	// override CeL.log
	CeL.Log = o[0];
	CeL.Log.className_set.em = 'debug_em';
	CeL.Log.className_set.debug = 'debug_debug';

	for(i in l)
		CeL.Log.message_prefix[i] = t + i + '.png" alt="[' + l[i]
			+ ']" title="' + l[i] + ' ' + i + '"/> ';


	l = CeL.log && CeL.log.buffer;

	CeL.log = o[1];
	CeL.warn = o[2];
	CeL.err = o[3];
	CeL.em = function(m, c) {
		CeL.Log.log.call(CeL.Log, m, c, 'em');
	};
	CeL.debug = function(m, l, caller, c) {
		//alert(CeL.is_debug() + ',' + l + '(' + (l === undefined) + '),' + m);
		if (CeL.is_debug(l)){
			if(!caller)
				caller = CeL.get_Function_name(arguments.callee.caller);

			CeL.Log.log.call(
					CeL.Log,
					caller ?
							'<span class="debug_caller">'
							+ caller//(caller.charAt(0) === '.' ? CeL.Class + caller : caller)
							+ '</span>: ' + m
						: m
					, c, 'debug'
			);
		}
	};

	if (l)
		for (i in l)
			CeL.debug('(before loading ' + module_name + ') ' + l[i]);
}

}





//--------------------------------------------------------------------------------//




/**
 * @name	CeL code reorganize function
 * @fileoverview
 * 本檔案包含了程式碼重整的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'code.reorganize';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @name	CeL.code.reorganize
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {


/**
 * null module constructor
 * @class	程式碼重整相關之 function。
 */
CeL.code.reorganize
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
CeL.code.reorganize
.prototype = {
};





//	取得[SN].wsf中不包括自己（[SN].js），其餘所有.js的code。
//	若想在低版本中利用eval(AllFuncCode(ScriptName))來補足，有時會出現奇怪的現象，還是別用好了。
//AllFuncCode[generate_code.dLK]='simpleRead';
function AllFuncCode(SN) {
	if (!SN)
		SN = ScriptName;
	var t = '', i, a = simpleRead(SN + '.wsf'), l = a ? a
			.match(/[^\\\/:*?"<>|'\r\n]+\.js/gi) : [ SN + '.js' ];

	for (i in l)
		if (l[i] != SN + '.js' && (a = simpleRead(l[i])))
			t += a;
	return t;
};


//var OK=addCode('alert,simpleWrite',['alert','NewLine','AllFuncCode']);if(typeof OK=='string')simpleWrite('try.js',OK),alert('done');else alert('OK:'+OK);
//addCode('複製 -backup.js');
/*
{var ss=[23,23.456,undefined,Attribute,null,Array,'567','abc'],l=80,repF='tmp.txt',sa=ss,st=addCode('',['ss']),t;
 ss='(reseted)';try{eval(st);}catch(e){}t=(sa===ss)+': '+typeof sa+'→'+typeof ss+'\n';
 simpleWrite(repF,t+sa+'\n→\n'+ss+'\n\n◎eval:\n'+st);
 alert(t+(sa=''+sa,sa.length<l?sa:sa.slice(0,l/2)+'\n..'+sa.slice(sa.length-l/2))+'\n→\n'+(ss=''+ss,ss.length<l?ss:ss.slice(0,l/2)+'\n..'+ss.slice(ss.length-l/2))+'\n\n'+(ss=''+st,ss.length<l?ss:ss.slice(0,200)+'\n..\n'+ss.slice(ss.length-200)));
}
*/

/*	將各function加入檔案中，可做成HTML亦可用之格式
	加入識別格式：
//	from function.js	-------------------------------------------------------------------

//e.g.,
//	[function.js](f1,f2,'string'	//	'string'或"string"中包含的需要是完整的敘述句
//	number var,string var,object var,date var,undefined  var)

//e.g.,
//	[function.js](OS,NewLine,dirSp,dirSpR,'var ScriptName=getScriptName();',ForReading,ForWriting,ForAppending,TristateUseDefault,TristateTrue,TristateFalse,WshShell,fso,args,'initWScriptObj();',initWScriptObj,setTool,JSalert,Str2Date,Date2Str,decplaces,dQuote,setObjValue,getScriptFullName,getScriptName,'setTool();',WinEnvironment,SpecialFolder,Network,NetDrive,NetPrinter,getEnvironment,'getEnvironment();',dateUTCdiff,gDate)
//e.g.,
//	[function.js]("var NewLine='\n',OS='unix',dirSp=dirSpR='/';",dQuote,setTool,product,decplaces,countS,getText,turnUnicode,trimStr_,trimStr,StrToDate,DateToStr,reducePath,getPathOnly,getFN,getFP,dBasePath,trigger,setTopP,setAstatusOS,setAstatus,setAstatusOver,setAstatusOut,doAlertResize,doAlertInit,doAlert,doAlertAccess,doAlertScroll,setCookie,getCookie,scrollTo,disableKM,setCookieS,*disabledKM=0;,scrollToXY,scrollToInterval,scrollToOK,doAlertDivName,doAlertOldScrollLocation,parse_Function,dealPopup,sPopP,sPopF,sPopInit,sPopInit,sPop,setTextT,setText)

..(inclide code)
//	[function.js]End	-------------------------------------------------------------------
//	↑from function.js	-------------------------------------------------------------------


TODO:
.htm 加入 .replace(/\//g,'\\/')
*/
addCode.report=false;	//	是否加入報告
//addCode[generate_code.dLK]='NewLine,isFile,simpleRead,autodetectEncode,generate_code,JSalert,setTool,*setTool();';
function addCode(FN,Vlist,startStr,endStr){	//FN:filename(list),Vlist:多加添的function/var list
 if(!startStr)startStr='//	['+WScript.ScriptName+']';
 if(!endStr)endStr=startStr+'End';
 //alert(isFile(FN)+'\n'+startStr+'\n'+endStr);

 if(typeof FN=='string')FN=[isFile(FN)?FN:startStr+(FN?'('+FN+')':'')+NewLine+endStr+NewLine];
 if(typeof Vlist=='string')Vlist=[Vlist];else if(typeof Vlist!='object')Vlist=[];

 var i,j,F,a,A,start,end,codeHead,b,c,d,f,m,OK=0
 ,s='()[]{}<>\u300c\u300d\u300e\u300f\u3010\u3011\u3008\u3009\u300a\u300b\u3014\u3015\uff5b\uff5d\ufe35\ufe36\ufe39\ufe3a\ufe37\ufe38\ufe3b\ufe3c\ufe3f\ufe40\ufe3d\ufe3e\ufe41\ufe42\ufe43\ufe44\uff08\uff09\u300c\u300d\u300e\u300f\u2018\u2019\u201c\u201d\u301d\u301e\u2035\u2032'//「」『』【】〈〉《》〔〕｛｝︵︶︹︺︷︸︻︼︿﹀︽︾﹁﹂﹃﹄（）「」『』‘’“”〝〞‵′
 ,endC,req,directInput='*',tmpExt='.tmp',encode,oriC;


 for(i in FN)try{
  if(a=oriC=isFile(FN[i])?simpleRead(FN[i],encode=autodetectEncode(FN[i])):FN[i],!a)continue;A='',dones=[],doneS=0;
  //sl(a.slice(0,200));

/*	判斷NL這段將三種資料作比較就能知道為何這麼搞。

~\r:

\r	123
\n	1
\r\n	2
\n-\r	-120


~\n:

\r	1
\n	123
\r\n	2
\n-\r	120


~\r\n:

\r	123
\n	123
\r\n	123
\n-\r	-2~2
*/
  NL=a.replace(/[^\n]+/g,'').length,b=a.replace(/[^\r]+/g,'').length;
  if(NL!=b&&NL&&b){
   alert("There're some encode problems in the file:\n"+FN[i]+'\n\\n: '+NL+'\n\\r: '+b);
   NL=Math.max(NL,b)>10*Math.abs(NL-b)?'\r\n':NL>b?'\n':'\r';
  }else NL=NL?b?'\r\n':'\n':'\r';

  //sl(a.indexOf(startStr)+'\n'+startStr+'\n'+a.slice(0,200));
  // TODO: a=a.replace(/(startReg)(.*?)(endReg)/g,function($0,$1,$2,$3){.. return $1+~+$3;});
  while((start=a.indexOf(startStr))!=-1){//&&(end=a.indexOf(endStr,start+startStr.length))!=-1
   //	initial reset
   codeHead=codeText=endC='',req=[],j=0;
   //	判斷 end index
   if((end=a.indexOf(endStr,start+startStr.length))==-1){
    alert('addCode: There is start mark without end mark!\nendStr:\n'+endStr);
    //	未找到格式則 skip
    break;
   }
   //	b=inner text
   b=a.slice(start+startStr.length,end);
   b=b.split(NL);//b=b.split(NL=b.indexOf('\r\n')!=-1?'\r\n':b.indexOf('\n')!=-1?'\n':'\r');	//	test檔案型式：DOS or UNIX.最後一位元已被split掉
   if(c=b[0].match(/^\s*([^\w])/)){
    codeHead+=b[0].slice(0,RegExp.lastIndex),b[0]=b[0].slice(RegExp.lastIndex);
    if(s.indexOf(c=c[1])%2==0)endC=s.charAt(s.indexOf(c)+1);else endC=c;
   }
   //NL=b[0].slice(-1)=='\r'?'\r\n':'\n';	//	移到前面：因為需要以NL作split	test檔案型式：DOS or UNIX.最後一位元已被split掉
   //alert('endC='+endC+',j='+j+',d='+d+'\n'+b[0]+'\nNewLine:'+(NL=='\n'?'\\n':NL=='\r\n'?'\\r\\n':'\\r')+'\ncodeHead:\n'+codeHead);

   do{
    if(!j)d=0;else if(b[j].slice(0,2)!='//')continue;else d=2;//if(d==b[j].length)continue;	//	不需要d>=b[j].length
    for(;;){
     //alert('search '+b[j].slice(d));
     if( (c=b[j].slice(d).match(/^[,\s]*([\'\"])/)) && (f=d+RegExp.lastIndex)<=b[j].length &&
    		 	//	(c=c[1], f<b[j].length)
    			(c=c[1]) && f<b[j].length
     		){	//	.search(
      //alert(b[j].charAt(f)+'\n'+c+'\n^(.*[^\\\\])['+c+']');
      if(b[j].charAt(f)==c){alert('addCode: 包含['+c+c+']:\n'+b[j].slice(f));continue;}	//	'',""等
      if(c=b[j].slice(f).match(new RegExp('^(.+?[^\\\\])['+c+']'))){d=f+RegExp.lastIndex;req.push(directInput/*+b[j].charAt(f-1) 改進後不需要了*/+c[1]);continue;}
      alert('addCode: Can not find end quota:\n'+b[j].slice(f));
     }
     //alert(d+','+b[j].length+'\nsearch to '+b[j].slice(d));

     //	出現奇怪現象請加"()"
     //if((c=b[j].slice(d).match(/([^,\s]+)([,\s]*)/))&& ( (d+=RegExp.lastIndex)==b[j].length || /[,\n]/.test(c[2])&&d<b[j].length ) ){	//	不需要\s\r
     if((c=b[j].slice(d).match(/([^,\s]+)[,\s]*/))&&(d+=RegExp.lastIndex)<=b[j].length){	//	不需要\s\r
      //if(!/[,\n]/.test(c[2])&&d<b[j].length)break;
      //alert(RegExp.index+','+d+','+b[j].length+','+endC+'\n['+c[1]+']\n['+c[2]+']\n'+b[j].slice(d));
      if(!endC||(m=c[1].indexOf(endC))==-1)req.push(c[1]);
      else{if(m)req.push(c[1].slice(0,m));endC='';break;}
     }else break;
    }
    codeHead+=b[j]+NL;
    //alert('output startStr:\n'+startStr+'\ncodeHead:\n'+codeHead);
   }while(endC&&++j<b.length);
   //for(j=0,b=[];j<req.length;j++)b.push(req[j]);	//	不能用b=req：object是用參考的，這樣會改到req本身！
   //for(j=0;j<Vlist.length;j++)b.push(Vlist[j]);	//	加入附加的變數

   b=generate_code(req.concat(Vlist),NL,directInput);
   codeText=codeHead+(arguments.callee.report?'/*	addCode @ '+gDate('',1)	//	report
	+(req.length?NL+'	request variables ['+req.length+']:	'+req:'')
	+(Vlist.length?NL+'	addition lists ['+Vlist.length+']:	'+Vlist:'')
	+(req.length&&Vlist.length&&b[2].length<req.length+Vlist.length?NL+'	Total request ['+b[2].length+']:	'+b[2]:'')
	+(b[4].length?NL+'	really done ['+b[4].length+']:	'+b[4]:'')
	+(b[5].length?NL+'	cannot found ['+b[5].length+']:	'+b[5]:'')
	+(b[6].length?NL+'	all listed ['+b[6].length+']:	'+b[6]:'')
	//+(b[3].length?NL+'	included function ['+b[3].length+']:	'+b[3]:'')
	+NL+'	*/':'')+NL+reduceCode(b[0]).replace(/([};])function(\s)/g,'$1'+NL+'function$2').replace(/}var(\s)/g,'}'+NL+'var$1')/*.replace(/([;}])([a-z\._\d]+=)/ig,'$1'+NL+'$2')*/+NL+b[1]+NL;
   //alert(start+','+end+'\n'+a.length+','+end+','+endStr.length+','+(end+endStr.length)+'\n------------\n'+codeText);//+a.slice(end+endStr.length)
   A+=a.slice(0,start+startStr.length)+codeText+a.substr(end,endStr.length),a=a.substr(end+endStr.length);
  }

  if(FN.length==1&&!isFile(FN[i]))
   return A;
  else if(A&&oriC!=A+a)	//	有變化才寫入
   if(!simpleWrite(FN[i]+tmpExt,A+a,encode))
    try{fso.DeleteFile(FN[i]);fso.MoveFile(FN[i]+tmpExt,FN[i]);OK++;}catch(e){}//popErr(e);
   else try{fso.DeleteFile(FN[i]+tmpExt);}catch(e){}//popErr(simpleFileErr);popErr(e);
  //else{alert('addCode error:\n'+e.message);continue;}
 }catch(e){
  //popErr(e);
  throw e;
 }

 return FN.length==1&&OK==1?A:OK;	//	A:成功的最後一個檔之內容
}


/*	script終結者…
try.wsf
	<package><job id="try"><script type="text/javascript" language="JScript" src="function.js"></script><script type="text/javascript" language="JScript" src="try.js"></script></job></package>
try.js
	destoryScript('WshShell=WScript.CreateObject("WScript.Shell");'+NewLine+NewLine+alert+NewLine+NewLine+'alert("資料讀取錯誤！\\n請檢查設定是否有錯！");');
*/
function destoryScript(code,addFN){try{	//	input indepent code, additional files
 var SN=getScriptName(),F,a,listJs,i,len,self=SN+'.js';
 if(!code)code='';//SN='try';
 a=simpleRead(SN+'.wsf');if(!a)a='';
 listJs=a.match(/[^\\\/:*?"<>|'\r\n]+\.(js|vbs|hta|s?html?|txt|wsf|pac)/gi);	//	一網打盡
 //,listWsf=(SN+'.wsf\n'+a).match(/[^\\\/:*?"<>|'\r\n]+\.wsf/gi);
 for(i=0,F={};i<listJs.length;i++)F[listJs[i]]=1;
 if(typeof addFN=='object')for(i in addFN)F[addFN[i]]=1;
 else if(addFN)F[addFN]=1;
 listJs=[];for(i in F)listJs[listJs.length]=i;	//	避免重複
 //alert(listJs.join('\n'));

 //done all .js @ .wsf & files @ additional list without self
 for(i=0;i<listJs.length;i++)if(listJs[i]!=self)try{	//	除了self外殺無赦
  if(!listJs[i].match(/\.js$/i)&&listJs[i]!=SN+'.wsf'){try{fso.DeleteFile(listJs[i],true);}catch(e){}continue;}	//	非.js就讓他死
  if(changeAttributes(F=fso.GetFile(listJs[i]),'-ReadOnly'))throw 0;	//	取消唯讀
  a=addNullCode(F.size);//a=listJs[i].match(/\.js$/i)?addNullCode(F.size):'';	先確認檔案存在，再幹掉他
  //alert('done '+listJs[i]+'('+F.size+')\n'+(a.length<500?a:a.slice(0,500)+'..'));
  simpleWrite(listJs[i],a);
 }catch(e){
  //popErr(e);
 }

 //done .wsf
 try{
  if(changeAttributes(F=fso.GetFile(SN+'.wsf'),'-ReadOnly'))throw 0;
  a='<package><job id="'+SN+'"><script type="text/javascript" src="'+SN+'.js"><\/script><\/job><\/package>';
  //alert('done '+SN+'.wsf'+'('+F.size+')\n'+a);
  //a='<package><job id="'+SN+'"><script type="text/javascript" src="function.js"><\/script><script type="text/javascript" src="'+SN+'.js"><\/script><\/job><\/package>';
  simpleWrite(SN+'.wsf',a);
 }catch(e){
  //popErr(e);
 }

 //done self
 if(listJs.length)try{
  if(changeAttributes(F=fso.GetFile(self),'-ReadOnly')<0)throw 0;
  a=(F.size-code.length)/2,a=addNullCode(a)+code+addNullCode(a);
  if(F.Attributes%2)F.Attributes--;	//	取消唯讀
  //alert('done '+self+'('+F.size+')\n'+(a.length<500?a:a.slice(0,500)+'..'));
  //a='setTool(),destoryScript();';
  simpleWrite(self,a);
 }catch(e){
  //popErr(e);
 }

 //run self & WScript.Quit()
 //return WshShell.Run('"'+getScriptFullName()+'"');
 return 0;
}catch(e){return 1;}}

/*	for version<5.1:因為不能用.wsf，所以需要合併成一個檔。
	請將以下函數copy至.js主檔後做適當之變更
	getScriptName(),mergeScript(FN),preCheck(ver)
*/
//	將script所需之檔案合併
//	因為常由preCheck()呼叫，所以所有功能亦需內含。
function mergeScript(FN){
 var i,n,t,SN=getScriptName(),NewLine,fso,ForReading,ForWriting,ForAppending;
 if(!NewLine)NewLine='\r\n';
 if(!fso)fso=WScript.CreateObject("Scripting.FileSystemObject");
 if(!ForReading)ForReading=1,ForWriting=2,ForAppending=8;
try{

 //	from .wsf
 /*var F=fso.OpenTextFile(SN+'.wsf',ForReading)
 //,R=new RegExp('src\s*=\s*["\']?(.+\.js)["\']?\s*','gi')
 ,a=F.ReadAll();F.Close();*/
 a=simpleRead(SN+'.wsf'),
 S=fso.OpenTextFile(FN,ForWriting,true/*create*/);

try{
 //t=a.match(/<\s*resource\s+id=(['"].*['"])\s*>((.|\r\n)*?)<\/\s*resource\s*>/gi);
 //	5.1版以下果然還是不能成功實行，因為改變regexp不能達到目的：沒能找到t。所以在下面第一次test失敗後即放棄；改用.ini設定。
 var r=new RegExp("<\\s*resource\\s+id=(['\"].*['\"])\\s*>((.|\\r\\n)*?)<\\/\\s*resource\\s*>","ig");
 t=a.match(r);
 S.WriteLine('//	mergeScript: from '+SN+'.wsf');
 S.WriteLine("function getResource(id){");
 if(!t||!t.length)S.WriteLine(" return ''");
 else for(i=0;i<t.length;i++){
  //alert(i+':'+t[i]);
  //n=t[i].match(/<\s*resource\s+id=(['"].*['"])\s*>((.|\r\n)*?)<\/\s*resource\s*>/i);
  r=new RegExp("<\\s*resource\\s+id=(['\"].*['\"])\\s*>((.|\\r\\n)*?)<\\/\\s*resource\\s*>","i");
  n=t[i].match(r);
  S.WriteLine(
	" "
	+(i?":":"return ")
	+"id=="+n[1]
	+"?'"
	+n[2].replace(/\r?\n/g,'\\n')
	+"'"
  );
 }
 S.WriteLine(" :'';"+NewLine+"}"+NewLine);
}catch(e){}

 //	from .js
 t=a.match(/src\s*=\s*["']?(.+\.js)["']?\s*/gi);
 for(i=0;i<t.length;i++){
  //alert(i+':'+t[i].match(/src\s*=\s*["']?(.+\.js)["']?\s*/i)[1]);
  //try{F=fso.OpenTextFile(n=t[i].match(/src\s*=\s*["']?(.+\.js)["']?\s*/i)[1],ForReading);}
  //catch(e){continue;}
  //S.WriteLine('//	mergeScript: from script	'+n);S.WriteBlankLines(1);S.WriteLine(F.ReadAll());
  //S.WriteLine('//	mergeScript: from script	'+n+NewLine+NewLine+F.ReadAll());
  //F.Close();
  S.WriteLine('//	mergeScript: from script	'+(n=t[i].match(/src\s*=\s*["']?(.+\.js)["']?\s*/i)[1])+NewLine+NewLine+simpleRead(n));
 }
 S.Close();
}catch(e){return 1;}
 return 0;
}





//var fa=function(a,s){return '"'+a+k+"'";},fb=function kk(a,t){return a;},fc=new Function('return b+b;'),Locale2=fa,Locale3=fb,Locale4=fc,r=generate_code(['fa','fb','fc','Locale2','Locale3','Locale4','kk']);alert(r.join('\n★'));try{eval(r[0]);alert(fa);}catch(e){alert('error!');}
/*	use for JSON (JavaScript Object Notation)
	利用[*現有的環境*]及變數設定生成code，因此並不能完全重現所有設定，也無法判別函數間的相依關係。
	DirectlyInput:	[directInput]string
	輸出string1（可reduceCode）,輸出string2（主要為object definition，不需reduceCode，以.replace(/\r\n/g,'')即可reduce）,總共要求的變數（去掉重複）,包含的函數（可能因參考而有添加）,包含的變數（可能因參考而有添加）,未包含的變數

	未來：對Array與Object能確實設定之	尚未對應：Object遞迴/special Object(WScript,Excel.Application,內建Object等)/special function(內建函數如Math.floor與其他如WScript.CreateObject等)
	JScript中對應資料型態，應考慮到內建(intrinsic 或 built-in)物件(Boolean/Date/Function/Number/Array/Object(需注意遞迴:Object之值可為Object))/Time/Error/RegExp/Regular Expression/String/Math)/string/integer/Byte/number(float/\d[de]+-\d/Number.MAX_VALUE/Number.MIN_VALUE)/special number(NaN/正無限值:Number.POSITIVE_INFINITY/負無限值:Number.NEGATIVE_INFINITY/正零/負零)/date/Boolean/undefined(尚未設定值)/undcleared(尚未宣告)/Null/normal Array/normal Object/special Object(WScript,Automation物件如Excel.Application,內建Object等)/function(實體/參考/anonymous)/special function(內建函數如isNaN,Math之屬性&方法Math[.{property|method}]與其他如WScript.CreateObject等)/unknown(others)

**	需同步更改 json()


TODO:
Object.toSource()
Array.toSource()
json	http://www.json.org/json.js


XML Object

bug:
函數定義 .toString() 時無法使用。


使用 \uXXXX 使.js跨語系
含中文行
→
//turnBy	含中文行
\x..
考慮註解&執行時語系

to top BEFORE ANY FUNCTIONS:
generate_code.dLK='dependencyList';	//	dependency List Key
*/
//generate_code[generate_code.dLK]='setObjValue,dQuote';
generate_code.ddI='*';	//	default directInput symbol
generate_code.dsp=',';	//	default separator
function generate_code(Vlist,NL,directInput){	//	變數list,NewLine,直接輸入用辨識碼
 var codeText='',afterCode='',vars=[],vari=[],func=[],done=[],undone=[],t,i=0,c=0,val,vName,vType;	//	vars:處理過的variables（不論是合法或非合法）,c:陳述是否已完結
 if(!NL)NL=NewLine;if(!directInput)directInput=generate_code.ddI;
 if(typeof Vlist=='string')Vlist=Vlist.split(generate_code.dsp);

 for(;i<Vlist.length;i++)if(!((vName=''+Vlist[i]) in vars)){	//	c(continue)=1:var未截止,vName:要加添的變數內容
  vars[vName]=vari.length,vari.push(vName);	//	避免重複

  //	不加入的
  if(vName.charAt(0)=='-'){
   vars[vName.slice(1)]=-1;
   continue;
  }

  //	直接輸出
  if(vName.slice(0,directInput.length)==directInput){
   if(c)codeText+=';'+NL,c=0;codeText+=val=vName.substr(directInput.length);
   done.push('(DirectlyInput)'+val);continue;
  }
  try{eval('vType=typeof(val='+vName+');');}//void
  catch(e){undone.push((vType?'('+vType+')':'')+vName+'(error '+(e.number&0xFFFF)+':'+e.description+')');continue;}	//	.constructor	b:type,c:已起始[var ];catch b:語法錯誤等,m:未定義


  if(vType=='function'){	//	or use switch-case
   //	加入function object成員，.prototype可用with()。加入函數相依性(dependency)
   try{eval("var j,k;for(j in "+vName+")if(j=='"+generate_code.dLK+"'&&(k=typeof "+vName+"."+generate_code.dLK+",k=='string'||"+vName+"."+generate_code.dLK+" instanceof Array)){j="+vName+"."+generate_code.dLK+";if(k=='string')j=j.split(',');for(k in j)if(j[k])Vlist.push(j[k]);}else Vlist.push('"+vName+".'+j);for(j in "+vName+".prototype)Vlist.push('"+vName+".prototype.'+j);");}
   catch(e){undone.push('('+vType+')'+vName+'.[child]'+'(error '+(e.number&0xFFFF)+':'+e.description+')');}

   val=(''+val).replace(/[\r\n]/g,NL);	//	function 才會產生 \r\n 問題，所以先處理掉
   if( (t=val.match(/^\s*function\s*\(/)) || val.match(/^\s*function\s+([\w_]*)([^(]*)\(/) )	//	這種判別法不好！
    if(t||(t=RegExp.$1)=='anonymous'){
     func.push(vName);vType=(typeof t=='string'?t:'no named')+' '+vType;
     if(t=='anonymous'){	//	忠於原味（笑）anonymous是從new Function(文字列を使って)來的
      var m=val.match(/\(([^)]*)\)\s*{/),l=RegExp.lastIndex,q=val.match(/[^}]*$/);q=RegExp.index;
      if(!m){undone.push('(anonymous function error:'+val+')'+vName);continue;}
      if(t=m[1].replace(/,/g,"','"))t="'"+t+"',";t='new Function('+t+dQuote(reduceCode(val.slice(l,q-1)))+')';
     }else t=val;
    }else if(t==vName){	//	関数(function): http://www.interq.or.jp/student/exeal/dss/ejs/1/2.html
     if(c)codeText+=';'+NL,c=0;func.push(vName),codeText+=val+NL;continue;
    }else if(val.indexOf('[native code]')!=-1){undone.push('(native code function error:'+val+')'+vName);continue;}	//	內建(intrinsic 或 built-in)函數：這種判別法不好！
    else if(t in vars)done.push('('+vType+')'+vName),func.push(vName);	//	已經登錄過了，所以就這麼下去..
    else{if(c)codeText+=';'+NL;codeText+=val+NL;vars[t]=vari.length,done.push('('+vType+')'+t),func.push(t,vName),c=0;}
   else{undone.push('(function error:'+val+')'+vName);continue;}//unknown
  }else if(vType=='number'){
   //	http://msdn2.microsoft.com/zh-tw/library/y382995a(VS.80).aspx
   var k=0,m='MAX_VALUE,MIN_VALUE,NEGATIVE_INFINITY,POSITIVE_INFINITY,NaN'.split(',');
   if(val===NaN||val===Infinity||val===-Infinity)t=''+val;
   else for(t=0;k<m.length;k++)if(val===Number[m[k]]){t='Number.'+m[k];break;}
   if(!t){
    //	http://msdn2.microsoft.com/zh-tw/library/shydc6ax(VS.80).aspx
    for(k=0,m='E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2'.split(',');k<m.length;k++)if(val===Math[m[k]]){t='Math.'+m[k];break;}
    if(!t)t=(t=Math.floor(val))==val&&(''+t).length>(t='0x'+val.toString(16)).length?t:val;
   }
  }else if(vType=='boolean'||val===null)t=val;//String(val)//val.toString()	//	typeof null is 'object'
  else if(vType=='string')t=dQuote(val);
  else if(vType=='object'&&typeof val.getTime=='function'||vType=='date')t='new Date('+((val-new Date)>999?val.getTime():'')+')';	//	date被當作object
  //	http://msdn2.microsoft.com/en-us/library/dww52sbt.aspx
  else if(vType=='object'&&/*val.constructor==Error  "[object Error]" */(''+val.constructor).indexOf('Error')!=-1)
   t='new Error'+(val.number||val.description?'('+(val.number||'')+(val.description?(val.number?',':'')+dQuote(val.description):'')+')':'');
/*
  else if(vName=='setObjValueFlag'){	//	明白宣示在這裡就插入依存函數：不如用 setObjValueFlag,'setObjValue();'
   if(!vars['setObjValue']||!vars['dQuote'])Vlist=Vlist.slice(0,i).concat('setObjValue','dQuote',Vlist.slice(i));
   Vlist[i--]=directInput+'var setObjValueFlag;';continue;
  }
*/
  else if(vType=='object'&&(val.constructor==Object||val.constructor==Array)){// instanceof
   var k,T='',T_='',T_2='',_i=0,cmC='\\u002c',eqC='\\u003d',NL_="'"+NL+"+'",maxLen=300-NL_.length;	//	type;loop用,Text,間距,integer?
   if(val.constructor==Object){
    t='';
    //	http://fillano.blog.ithome.com.tw/post/257/59403
    //	** 一些內建的物件，他的屬性可能會是[[DontEnum]]，也就是不可列舉的，而自訂的物件在下一版的ECMA-262中，也可以這樣設定他的屬性。
    for(k in val)
     if(typeof val[k]=='object'||typeof val[k]=='function')
      Vlist.push(vName+'.'+k);	//	簡單的Object遞迴
     else{
      T_2=k.replace(/,/g,cmC).replace(/=/g,eqC)+'='+(''+val[k]).replace(/,/g,cmC).replace(/=/g,eqC)+',';
      if(T_.length+T_2.length>maxLen)T+=T_+NL_,T_=T_2;else T_+=T_2;
      if(!_i&&parseInt(val[k])==val[k])_i=1;else if(_i<2&&parseFloat(val[k])==val[k]&&parseInt(val[k])!=val[k])_i=2;
     }
    T+=T_;
   }else{// if(val.constructor==Array)
    var base=16,d_,d=-1,k_,kA=[];
    for(k in val)
     if(typeof val[k]=='object'||typeof val[k]=='function')
      Vlist.push(vName+'.'+k);	//	簡單的Object遞迴
     else kA.push(parseInt(k)==k?parseInt(k):k);	//	因為Array中仍有可能存在非數字index
    kA.sort(),vType='Array',t=','+base;
    for(k_=0;k_<kA.length;k_++){
     if(!((k=kA[k_]) in val)){if(d_!='*')if(k-d==1)d_+=',';else d_='*';}
     else{
      T_2=(k-d==1?'':d_!='*'&&k-d<3/*k.toString(base).length-1*/?d_:(isNaN(k)?k.replace(/,/g,cmC).replace(/=/g,eqC):k.toString(base))+'=')+(''+val[k]).replace(/,/g,cmC).replace(/=/g,eqC)+',',d_='';
      if(T_.length+T_2.length>maxLen)T+=T_+NL_,T_=T_2;else T_+=T_2;
     }
     d=k;if(!_i&&parseInt(val[k])==val[k])_i=1;else if(_i<2&&parseFloat(val[k])==val[k]&&parseInt(val[k])!=val[k])_i=2;
    }
    T+=T_;
   }
   if(T){
    if(!vars['setObjValue']||!vars['dQuote']){
     Vlist.push('setObjValue','dQuote');	//	假如沒有setObjValue則須將之與其所依存之函數（dQuote）一同加入
     if(!vars['setObjValueFlag'])Vlist.push(directInput+'var setObjValueFlag;');
    }
    afterCode+="setObjValue('"+vName+"','"+T.slice(0,-1)+"'"+(_i?_i==1?",1":",.1":t?",1":'')+t+");"+NL,t=1;
   }else t=vType=='Object'?'{}':'[]';//new Object(), new Array()
  }else if(vType=='object'&&val.constructor==RegExp)t=val;
  else if(vType=='undefined')t=1;	//	有定義(var)但沒設定值，可計算undefined數目
  else if(t=1,vType!='unknown')
   if((''+val).match(/^\s*\[[Oo]bject\s*(\w+)\]\s*$/))t=RegExp.$1;	//	僅對Math有效？
   else vType='unknown type: '+vType+' (constructor: '+val.constructor+')',alert(vName+': '+vType+', please contract me!\n'+val);	//	未知
  else alert('The type of '+vName+' is "'+vType+'"!');	//	unknown
  if(typeof t!='undefined'){
   if(vName.indexOf('.')==-1)codeText+=(c?',':'var ')+vName+(t===1&&vType!='number'?'':'='+t),c=1;//alert(codeText.substr(codeText.length-200));
   else if(t!==1||vType=='number')codeText+=(c?';':'')+vName+'='+t+';',c=0;
  }
  done.push('('+vType+')'+vName);
 }
 if(c)codeText+=';'+NL;//,c=0;//alert(codeText.substr(codeText.length-200));//alert(afterCode);
 return [codeText,afterCode,vari,func,done,undone,Vlist];
}



//	null code series
//simpleWrite('try.js',addNullCode(50000));
var nullCodeData,nullCodeDataL,addNullCodeD;	//	處理nullCode的變數暫存,nullCodeData[變數名]=變數值,nullCodeDataL=length,addNullCodeD:addNullCode data,因為每次都重新執行nullCode()很費時間
function addNullCode(len,type){	//	為了基底才能加入function而作
 var s='',t,l,i,j;if(typeof addNullCodeD!='object')addNullCodeD=[];qq=0;
 while(s.length<len){
/*  t=Math.random()<.5?'function':'';
  s+=len-s.length>9?nullCode((len/2>999?999:len/2)+'-'+len,t):nullCode(len,t);*/
  l=len-s.length>9?len>2e3?999:len/2:len;
  j=0;for(i in addNullCodeD)if(i>l)break;else j=i;
  if(j&&j>99){if(len-s.length>99)t=nullCode(nullCode(99,0)),s+=(addNullCodeD[t.length]=t);while(len-s.length>j)s+=addNullCodeD[j];}
  s+=j&&len-s.length-j<50?addNullCodeD[j]
                                       //	:(t=nullCode(l),addNullCodeD[t.length]=t);
                                       :(t=nullCode(l)?addNullCodeD[t.length]=t:'');
 }
 return s;
}
function nullCodeDataAdd(vari,val){	//	variables,value
 if(vari){
  if(typeof nullCodeData!='object')nullCodeData={},nullCodeDataI=[],nullCodeDataL=0;
  if(!(vari in nullCodeData))nullCodeDataI.push(vari),nullCodeDataL++;
  nullCodeData[vari]=val;
 }
}
//var t=nullCode('230-513','function');alert(t.length+'\n'+t);
//	產生無用的垃圾碼
//	其他方法（有閒情逸致時再加）：/**/,//,var vari=num+-*/num,str+-str,if(typeof vari=='~'){},try{eval('~');}catch(e){},eval('try{}catch(e){}');if()WScript.Echo();
function nullCode(len,type){	//	len:\d-\d
 var t='',vari=[],u,d;	//	variables;up,down:長度上下限
 if(typeof nullCodeData!='object')nullCodeData={},nullCodeDataI=[],nullCodeDataL=0;
 if(typeof len=='number')u=d=Math.floor(len);
 else if(len=''+len,(i=len.indexOf('-'))!=-1)d=parseInt(len.slice(0,i)),u=parseInt(len.substr(i+1));
 if(u<d){var a=d;d=u,u=a;}if(!len||!u||len<0)return'';
 if(typeof type!='string')type=typeof type;

 //if(type=='boolean'){return Math.random()<.5?1:0;}
 if(type=='number'){return Math.floor(Math.random()*(u-d)+d);}
 if(type=='n2'){if(u<9&&d<9)d=Math.pow(10,d),u=Math.pow(10,u);return Math.floor(Math.random()*(u-d)+d);}
 if(type=='string'){
	 //	if(d<0&&(d=0,u<0))
	 if(d<0&&u<(d=0))
		 return'';for(var i=0,l=nullCode(d+'-'+u,0),t=[];i<l;i++)t.push(nullCode('32-128',0));return fromCharCode(t);
 }
 if(type=='vari'){	//	變數variables
  if(d)d--;u--;if(u>32)u=32;else if(u<1)u=1;	//	最長變數:32
  var a,i,l,c=0;
  do{
   t=[],a=nullCode('65-123',0),i=0,l=nullCode(d+'-'+u,0);
   if(a>90&&a<97)a=95;t.push(a);
   for(;i<l;i++){a=nullCode('55-123',0);if(a>90&&a<97)a=95;else if(a<65)a-=7;t.push(a);}	//	code:48-57,65-90,95,97-122;
   t=fromCharCode(t);try{eval('a=typeof '+t+'!="undefined";');}catch(e){}	//	確保是新的變數
   if(c%9==0&&d<u)++d;
  }while(++c<99&&(a||(t in nullCodeData)));	//	不能確保是新變數的話，給個新的：繼續作。★此作法可能導致長時間的迴圈delay！因此限制最多99次。
  //if(c==99){alert('重複：['+a+']'+t);WScript.Quit();}
  return t;
 }
 if(type=='function'){
  var i=0,l=nullCode('0-9',0),fN=nullCode('2-30','vari'),a=NewLine+'function '+fN+'(',b=NewLine+'}'+NewLine,v,D=[];	//	fN:函數名
  nullCodeDataAdd(fN,'function');	//	只加入函數名
  if(l){for(;i<l;i++)v=nullCode('2-30','vari'),a+=v+',',D.push(v);a=a.slice(0,-1);}a+='){';
  l=(a+b).length+NewLine.length;
  if(u<l)return nullCode(len);
  return a+(NewLine+nullCode((d<l?0:d-l)+'-'+(u-l))).replace(/\n/g,'\n	')+b;
 }
 //	others:type=='code'
 var l=nullCode(len,0);
 while(t.length<l){
  var a,v,va=(Math.random()<.5?(va=nullCode('1-6',0)):dQuote(va=nullCode('5-'+(u-t.length>50?50:u-t.length),'string')));
  if(u-t.length>20&&Math.random()<.9){
   if(Math.random()<.7&&nullCodeDataL>9)v=nullCodeDataI[nullCode(0+'-'+nullCodeDataL,0)],a=v+'='+va;
   else v=nullCode('1-9','vari'),a='var '+v+(Math.random()<.3?'':'='+va);
   a+=';'+(Math.random()<.4?NewLine:'');nullCodeDataAdd(v,va);
  }else{a=Math.floor(Math.random()*4);a=a==1?'	':a||u<t.length+NewLine.length?' ':NewLine;}
  if(t.length+a.length<=u)t+=a;
 }
 return t;
}
//	↑null code series



/*	tech.data:

string:
['"]~$1

RegExp:
[/]~$1[a-z]*
[/]~$1[gim]*
=RegExp.[source|test(|exec(]

.match(RegExp)
.replace(RegExp,)
.search(RegExp)

op[/]:
word/word
word/=word

~:
/\\{0,2,4,6,..}$/

註解comment:
/*~* /
//~\n

符號denotation:/[+-*=/()&^,<>|!~%\[\]?:{};]+/
+-
word:/[\w]+/

program:
((denotation|word|comment)+(string|RegExp)*)+

test:
i++ +
a+=++i+4
++a+i++==++j+ ++e
a++ += ++d
a++ + ++b

for(.*;;)


*/
/*	精簡程式碼部分：去掉\n,;前後的空白等，應由reduceCode()呼叫
	http://dean.edwards.name/packer/
*/
function reduceCode_subR(code){
 //code=code.replace(/\s*\n+\s/g,'');	//	比下一行快很多，但為了正確性而放棄。
 code=code.replace(/([^\s]?)\s*\n+\s*([^\s]?)/g,function($0,$1,$2){var a=$1,b=$2;return a+(a&&b&&a.match(/\w/)&&b.match(/\w/)?' ':'')+b;})	//	當每一行都去除\n也可時方能使用！否則會出現「需要;」的錯誤！
	.replace(/\s+$|^\s+/g,'');
 //if(code.match(/\s+$/))code=code.slice(0,RegExp.index);
 //if(code.match(/^\s+/))code=code.substr(RegExp.lastIndex);

/*	對喜歡將\n當作;的，請使用下面的；但這可能造成失誤，例如[a=(b+c)\nif(~)]與[if(~)\nif(~)]
 var m,a;
 while(m=code.match(/\s*\n+\s*(.?)/))
  a=RegExp.lastIndex,code=code.slice(0,RegExp.index)+(m[1].match(/\w/)?';':'')+code.substr(a-(m[1]?1:0));
 if(m=code.match(/\s+$/))code=code.slice(0,RegExp.index);
 if(m=code.match(/^\s+(.?)/)){code=code.substr(RegExp.lastIndex-1);if((m[0].indexOf('\n')!=-1&&m[1].match(/\w/)))code=';'+code;}
*/
 code=code//.replace(/([^;])\s*\n+\s*/g,'$1;').replace(/\s*\n+\s*/g,'')	//	最後再作

 //.replace(/for\s*\(([^;]*);\s*;/g,'for;#$1#')	//	因為直接執行下行敘述會將for(~;;也變成for(~;，所以需先作處理。
 //.replace(/\s*;+\s*/g,';')	//	在''等之中執行此行可能出問題，因此另外置此函數。
 //.replace(/for;#([^#]*)#/g,'for($1;;')

 //.replace(/(.)\s+([+\-]+)/g,function($0,$1,$2){return $1+($1=='+'||$1=='-'?' ':'')+$2;}).replace(/([+-]+)\s+(.)/g,function($0,$1,$2){return $1+($2=='+'||$2=='-'?' ':'')+$2;})	//	+ ++ +
 .replace(/([+\-])\s+([+\-])/g,'$1 $2').replace(/([^+\-])\s+([+-])/g,'$1$2').replace(/([+\-])\s+([^+\-])/g,'$1$2')	//	+ ++ +

 .replace(/\s*([()\[\]&|^{*\/%<>,~!?:.]+)\s*/g,'$1')	//	.replace(/\s*([()\[\]&|{}/%,!]+)\s*/g,'$1')	//	去掉'}'，因為可能是=function(){};或={'ucC':1};
 .replace(/([a-zA-Z])\s+([=+\-])/g,'$1$2').replace(/([=+\-])\s+([a-zA-Z])/g,'$1$2')
 .replace(/\s*([+\-*\/%=!&^<>]+=)\s*/g,'$1')//.replace(/\s*([{}+\-*/%,!]|[+\-*\/=!<>]?=|++|--)\s*/g,'$1')

 .replace(/for\(([^;]*);;/g,'for;#$1#')	//	因為直接執行下行敘述會將for(~;;也變成for(~;，所以需先作處理。
 //.replace(/};+/g,'}')	/*.replace(/;{2,}{/g,'{')*/.replace(/{;+/g,'{')//.replace(/;*{;*/g,'{')//在quotation作修正成效不彰
 .replace(/\s*([{;]);+\s*/g,'$1')//.replace(/\s*([{};]);+\s*/g,'$1')	//	去掉'}'，因為可能是=function(){};或={'ucC':1};
 .replace(/for;#([^#]*)#/g,'for($1;;')

 .replace(/\s{2,}/g,' ')
 .replace(/([^)]);}/g,'$1}')	//	~;while(~);}	but: ~;i=(~);} , {a.b();}
 ;
 //if(code.charAt(0)=="'")code=(code.charAt(1)=='}'?'}':code.charAt(1)==';'?'':code.charAt(1))+code.substr(2);
 return code;
}
/*	精簡程式碼：去掉註解與\s\n	use for JSON (JavaScript Object Notation)
	bug:
	當每一行都去除\n也可時方能使用！否則會出現「需要;」的錯誤！
	可能會lose條件式編譯（@cc_on等）的資訊或判別錯誤！另外，尚不保證不會lose或更改程式碼！

	http://www.dreamprojections.com/syntaxhighlighter/Default.aspx

TODO:
將 local various 甚至 global 依頻率縮短，合併以字串組合代替。	selectable
safer cut '\r\n'
{_exp1_;_exp2_;}	→	_exp1_,_exp2_;
safer cut ';'	;}	→	}
compress: eval("~")

(function(~){~})(~);

var fascii2ascii = (function(){
  var cclass
   = '['+String.fromCharCode(0xff01)+'-'+String.fromCharCode(0xff5e)+']';
  var re_fullwidth = new RegExp(cclass, 'g');
  var substitution = function(m){
    return String.fromCharCode(m.charCodeAt(0) - 0xfee0); // 0xff00 - 0x20
  };
  return function(s){ return s.replace(re_fullwidth, substitution) };
})();




/*@cc_on	OK
/*@ cc_on	error
/* @cc_on	無效


JSlint 可以協助您檢查出有問題的程式碼。
http://www.jslint.com/

Javascript compressor
http://dean.edwards.name/packer/
http://javascriptcompressor.com/
http://www.creativyst.com/Prod/3/
http://www.radok.com/javascript-compression.html
http://alex.dojotoolkit.org/shrinksafe/
http://www.saltstorm.net/depo/esc/introduction.wbm
*/
//reduceCode[generate_code.dLK]='reduceCode_subR';
function reduceCode(code,mode){	//	code:輸入欲精簡之程式碼,mode=1:''中unicode轉\uHHHH
 if(!code)return'';	//sss=0,mmm=90;
 var A='',a=''+code,m,b,q,c,Begin,End;
 //reduceCodeM=[''];
 while(a.match(/['"\/]/)){
  with(RegExp)Begin=index,End=lastIndex,m=lastMatch;
//alert(a);
  if(Begin&&a.charAt(Begin-1)=='$'){A+=reduceCode_subR(a.slice(0,Begin))+m,a=a.substr(End);continue;}	//	RegExp.$'等

  if(m=='/')if(m=a.charAt(RegExp.lastIndex),m=='*'||m=='/'){	//	comment
   //if(++sss>mmm-2&&alert('sss='+sss+NewLine+a),sss>mmm){alert('comment');break;}
   //A+=reduceCode_subR(a.slice(0,Begin)),b=m=='*'?'*/':'\n',m=a.indexOf(b,End+1);//A+=a.slice(0,RegExp.index),b=m=='*'?'*/':'\n',m=a.substr(RegExp.lastIndex).indexOf(b);//
   A+=reduceCode_subR(a.slice(0,Begin)),b=m=='*'?'*/':'\n';
   m=End+1;
   do{m=a.indexOf(b,m);if(a.charAt(m-1)=='\\')m+=2;else break;}while(m!=-1);	//	預防「\*/」…其實其他地方（如["']）也需要預防，但沒那精力了。
   //reduceCodeM.push('find comment:	Begin='+Begin+',End='+End+',m='+m+',b='+b.replace(/\n/g,'\\n')+NewLine+(m-End>200||m==-1?a.substr(Begin,200)+'..':a.slice(Begin,m))+NewLine+NewLine+'continue:'+NewLine+a.substr(m+b.length,200)+'..');
   if(m==-1)if(b=='\n'){a='';break;/*return A;*/}else throw new Error(1,'[/*] without [*/]!\n'+a.substr(Begin,200));
   else if(7+End<m&&	//	7: 最起碼應該有這麼多 char 的 comment 才列入查核
	/^@[cei][a-z_]+/.test(a.substring(End+1,m-5))//a.substring(End+1,m-5).indexOf('@cc_on')==0	不一定只有 cc_on
	)
    //alert('There is conditional compilation detected,\n you may need pay attention to:\n'+a.substring(End+1,m-5)),
    A+=a.slice(End-1,m+b.length).replace(/\s*(\/\/[^\r\n]*)?(\r?\n)\s*/g,'$2'),a=a.slice(m+b.length);	//	對條件式編譯全選，預防資訊lose。僅有'/*@cc_on'才列入，\/*\s+@\s+cc_on不可！
   else if(a=a.substr(m+b.length),A.match(/\w$/)&&a.match(/^\s*\w/))A+=' ';	//	預防return /*~*/a被轉為returna
  }else{	//	RegExp
   //reduceCodeM.push('find RegExp:	Begin='+Begin+NewLine+a.substr(Begin,200)+NewLine+'-'.x(20)+NewLine+A.substr(A.length-200)+'..');
   b=a.slice(0,Begin),m=1;//c=Begin,q=End

   if(b.match(/(^|[(;+=!{}&|:\\\?,])\s*$/))m=1;	//	RegExp:以起頭的'/'前面的字元作判別，前面是這些則為RegExp
   else if(b.match(/[\w)\]]\s*$/))m=0;	//	前面是這些則為op
   else throw new Error(1,'Unknown [/]! Please check it and add rules!\n'+b+'\n-------------\n'+a.slice(0,End+80)
	//+'\n-------------\n'+A
	);	//	需再加強前兩項判別之處

   if(!m)A+=reduceCode_subR(a.slice(0,End)),a=a.substr(End);//if(!m)A+=a.slice(0,q),a=a.substr(q);//	應該是op之類//
   else{A+=reduceCode_subR(a.slice(0,Begin)),a=a.substr(Begin),c=0;//else{A+=a.slice(0,c),a=a.substr(c),c=0;//
    //if(++sss>mmm-2&&alert('sss='+sss+'\n'+a),sss>mmm){alert('reg');break;}
    while(m=a.substr(c).match(/([^\\]|[\\]{2,})([[\/\n])/)){	//	去掉[]
     //reduceCodeM.push('find RegExp [ or / or \\n :'+NewLine+a.substr(c+RegExp.index+1,20));
     if(m[1].length>1&&m[1].length%2==1){c+=RegExp.lastIndex-1;continue;}	//	奇數個[\]後
     else if(m=m[2],m=='/')break;
     if(m=='[')
      while((m=a.substr(c+=RegExp.lastIndex).match(/([^\\]|[\\]{2,})\]/))){	//	不用c+=RegExp.index+1是因[]中一定得有字元
       if(m[1].length>1&&m[1].length%2==1){c+=RegExp.lastIndex-1;continue;}	//	奇數個[\]後
       c+=RegExp.lastIndex-1;m=1;break;	//	-1:因為偵測'['時需要前一個字元
	//if(++sss>mmm-2&&alert('sss='+sss+'\nc='+c+'\n'+a.substr(c)),sss>mmm){alert('reg 2');break;}
      }
     if(m!=1)throw new Error(1,'RegExp error!\nbegin with:\n'+a.substr(Begin,200));
    }
    //reduceCodeM.push('find RegExp 2:'+NewLine+a.slice(0,c+RegExp.lastIndex));
    A+=a.slice(0,c+=RegExp.lastIndex),a=a.substr(c);//q=RegExp.lastIndex,alert('reg:'+Begin+','+c+','+q+'\n'+a.slice(0,Begin)+'\n-------\n'+a.slice(Begin,c+q)+'\n-------\n'+a.substr(c+q,200));return A;
    //q=RegExp.lastIndex,A+=reduceCode_subR(a.slice(0,Begin))+a.slice(Begin,c+=q),a=a.substr(c);//A+=a.slice(0,c+=RegExp.lastIndex),a=a.substr(c);//
   }
  }else{	//	quotation
//alert('quotation:\n'+a)
   //reduceCodeM.push('find quotation:'+NewLine+a.substr(RegExp.index,200));
   //if(++sss>mmm-2&&alert('sss='+sss+'\n'+a),sss>mmm){alert('quo');break;}
   //c=RegExp.index,b=a.substr(RegExp.lastIndex-1).match(new RegExp('[^\\\\]('+(q=m)+'|\\n)'));	較正式



/*

   q=m;	//	2009/8/16 15:59:02 FAILED

function test_quotation(){
'\';		//	Error
'\\\';		//	Error
'\\\\\';	//	Error
'';
'n';
'\\';
'nn';
'\\n';
'n\\';
'n\\n';
'\\\\';
'\\\\n';
'n\\\\';
'n\\\\n';
'nn\\\\';
'nn\\\\n';
'nnn\\\\';
'nnn\\\\n';
}
alert(reduceCode(test_quotation));

alert(reduceCode(reduceCode));


   //	找到 '\n' 為止，考慮 [\\\\]\\r?\\n
   c=Begin+1,b='';
   while((c=a.indexOf('\n',c))!=-1){
    q=a.charAt(c-1);
    if(q=='\\'||q=='\r'&&a.charAt(c-2)=='\\'){
     c++;
     continue;
    }
     
   }
   ;
   if(a.charAt(c-1))

   //alert('use RegExp: '+new RegExp('^([^\\\\\\r\\n]*|[\\\\][^\\r\\n]|[\\\\]\\r?\\n)*('+q+'|\\n)'));
   b=a.slice(Begin+1).match(new RegExp('^([^\\\\\\r\\n]*|[\\\\][^\\r\\n]|[\\\\]\\r?\\n)*('+q+'|\\n)'));	//	too slow!
alert('test string:\n'+a.slice(Begin+1))
   if(!b||b[2]=='\n')
    throw new Error(1,'There is a start quotation mark ['+q+'] without a end quotation mark!\nbegin with:\n'+a.substr(Begin,200));	//	語法錯誤?
   q=RegExp.lastIndex+1;

*/

   //	未考慮 '\n' (不能 check error!)
   c=Begin,q=m;
   while(b=a.substr(c).match(new RegExp('([^\\\\\\r]|\\\\{2,})('+q+'|\\r?\\n)')))	//	考慮 [\\\\]\\r?\\n
    if(b[1].length>1&&b[1].length%2==1)
     c=RegExp.lastIndex-1;
    else break;

   if(!b||b[2]=='\n')
    throw new Error(1,'There is a start quotation mark ['+q+'] without a end quotation mark!\nget:['+b+']\nbegin with:\n'+a.substr(Begin,200));	//	語法錯誤?
   //reduceCodeM.push('find quota ['+q+']:'+NewLine+a.substr(c,RegExp.lastIndex)+NewLine+'continue:'+NewLine+a.substr(c+RegExp.lastIndex,99));

   q=RegExp.lastIndex;



   //alert('q='+q+',['+b[0]+']');
   //alert(b[1]);
   //alert(b[2]);

   b=a.substr(Begin,q).replace(/\\\r?\n/g,'');
   //alert('mode='+mode);
   if(mode==1){
    m='';
    for(var i=0;i<=q;i++)
     m+=b.charCodeAt(i)>127?'\\u'+b.charCodeAt(i).toString(16):b.charAt(i);
   }
   else m=b;

   A+=reduceCode_subR(a.slice(0,Begin))+m,a=a.substr(Begin+q);//A+=a.slice(0,c+=RegExp.lastIndex),a=a.substr(c);//

   //alert('A='+A);
   //alert('a='+a);

   //if(!/^[\s\r\n]*\}/.test(a))A+=';';	//	對於 ~';{ → ~'{ 或  ~';if → ~'if  不被接受。
  }
 }

 //	後續處理
 A+=reduceCode_subR(a);
 //A=A.replace(/([^;])\s*\n+\s*/g,'$1;');	//	這兩行在reduceCode_subR()中已處理
 //A=A.replace(/\s*\n+\s*/g,'');//while(A.match(/\s*\n\s*/))A=A.replace(/\s*\n\s*/g,'');//

 return A;
}




/*	精簡整個檔的程式碼…and test程式是否有語法不全處（例如沒加';'）

flag={doTest:bool,doReport:bool,outEnc:(enc),copyOnFailed:bool,startFrom:// | '',addBefore:'',runBefore:function}

startFrom 若為 // 則應為 startAfter!!

@deprecated use <a href="http://closure-compiler.appspot.com/" accessdate="2009/12/3 12:13">Closure Compiler Service</a>

TODO:


*/
//reduceScript[generate_code.dLK]='autodetectEncode,simpleRead,simpleWrite,reduceCode,isFile';
function reduceScript(originScriptFileName,outScriptFileName,flag){	//	origin javascript file name, target javascript file name
 if(!originScriptFileName)
  originScriptFileName=WScript.ScriptFullName;

 if(!outScriptFileName)
  outScriptFileName=originScriptFileName+'.reduced.js';//.compressed.js	//	getFP(originScriptFileName.replace(/\.ori/,''),1);

 if(!flag)flag={};

 if(!fso)fso=new ActiveXObject("Scripting.FileSystemObject");

 //	同檔名偵測（若自行把 .ori 改成標的檔等，把標的檔先 copy 成原來檔案。）
 if(originScriptFileName==outScriptFileName){
  if(2==WshShell.Popup('origin file and output file is the same!'+(flag.originFile?"\nI'll try to copy it back.":''),0,'Copy target as origin file',1+48))return;
  if(!flag.originFile)return;
  if(isFile(originScriptFileName=flag.originFile)){
   alert('origin file is exist! Please rename the file!');
   return;
  }
  try{fso.CopyFile(outScriptFileName,originScriptFileName);}catch(e){alert('Failed to copy file!');return;}
 }

 if(!isFile(originScriptFileName)){
  alert("Origin javascript file doesn't not found!\n"+originScriptFileName);
  return;
 }

 var sp='='.x(80)+NewLine,reduceCodeM=[],enc=autodetectEncode(originScriptFileName),i,outenc=autodetectEncode(outScriptFileName);

 if(!flag.outEnc)
  flag.outEnc=outenc||enc||TristateTrue;


 try{
  var f=simpleRead(originScriptFileName,enc),ot=simpleRead(outScriptFileName,flag.outEnc),r='';
  if(typeof f!='string')throw new Error(1,"Can't read file ["+originScriptFileName+"]!");
  t=flag.runBefore?flag.runBefore(f)||f:f;
  if(flag.startFrom)
   if(typeof flag.startFrom=='string'){
    if((i=t.indexOf(flag.startFrom))!=-1)t=t.slice(i);
   }else if(flag.startFrom instanceof RegExp)
    t=t.replace(flag.startFrom,'');
  t=reduceCode(t);
  t=(flag.addBefore||'')+t.replace(/([};])function(\s)/g,'$1\nfunction$2').replace(/}var(\s)/g,'}\nvar$1')/*.replace(/([;}])([a-z\._\d]+=)/ig,'$1\n$2')*/+reduceCodeM.join(NewLine+sp);
  //	不相同才 run
  if(t)if(t!=ot||outenc!=flag.outEnc)simpleWrite(outScriptFileName,t,flag.outEnc);else r='* 欲寫入之內容('+t.length+' chars)與標的檔相同。檔案並未變更。\n';

  if(flag.doTest)eval('if(0){if(0){if(0){'+t+'}}}');//void	//should use windows.eval	//if(WScript.ScriptName!=outScriptFileName)eval(t);
  if(flag.doReport)alert('OK!\n'+r+'\n'+f.length+'→'+t.length+'(origin output: '+ot.length+') ('+(100*t.length/f.length).decp(2)+'%)\n\n['+enc+'] '+originScriptFileName+'\n→\n['+flag.outEnc+'] '+outScriptFileName);
 }catch(e){
  if(6==alert('reduceScript: Error occured!\nDo you want to write error message to target file?\n'+outScriptFileName,0,0,3+32))
   simpleWrite(outScriptFileName,popErr(e)+NewLine+NewLine+reduceCodeM.join(NewLine+sp),TristateTrue/*enc*/,0,true);
  if(flag.copyOnFailed)try{fso.CopyFile(originScriptFileName,outScriptFileName);}catch(e){alert('Failed to copy file!');return;}
 }
}




/*	縮減 HTML 用 .js大小+自動判別	2008/7/31 17:40:40
	!! arguments unfinished !!

usage: include code in front:
//	[function.js]_iF,rJS
//	[function.js]End

rJS({add:'/*\nCopyright 2008 kanashimi\n欲使用此工具功能者，請聯絡作者。\n*\/\n'});

//	code start

(main code)..

TODO:
自動選擇 target 之模式（不一定是 .ori）
*/
//rJS[generate_code.dLK]='reduceScript';
function rJS(f){	//	flag
 if(typeof WScript=='object'){
  var o=WScript,t,n;
  if(typeof reduceScript!='function')
   o.Echo('Please include function.js to generate code.');
  else
   f=f||{},n=o.ScriptFullName,t=n.replace(/\.ori/,''),
   reduceScript(n,t,{
	doReport:1,
	outEnc:'UTF-8',
	startFrom:f.cut||/^(.|\n)+code\s+start\r?\n/,
	addBefore:f.add,
	originFile:t.replace(f.ori||/(\.[^.]+)$/,'.ori$1')
   });
  o.Quit();
 }
}


/*
try{var　o;try{o=new ActiveXObject('Microsoft.XMLHTTP')}catch(e){o=new XMLHttpRequest()}with(o)open('GET',(new　ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL.path'),false),send(null),eval(responseText)}catch(e){}

*/
//(''+CeL.library_loader).replace(/^\s*function\s*\(\s*\)\s*{\s*/,'').replace(/\s*}\s*;\s*$/,'');
CeL.code.reorganize
.
/**
 * for 引用：　include library 自 registry 中的 path
 * @since	2009/11/25 22:59:02
 * @memberOf	CeL.code.reorganize
 */
library_loader_by_registry = function() {
	//if (typeof WScript == "object")
		try {
			var o;
			try {
				o = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e) {
				o = new XMLHttpRequest();
			}
			with (o)
				open('GET', (new ActiveXObject("WScript.Shell")).RegRead(library_namespace.env.registry_key), false),
				send(null),
				eval(responseText);
		} catch (e) {
		}
};


CeL.code.reorganize
.
/**
 * get various from code
 * @param {String} code	程式碼
 * @param {Boolean} fill_code	(TODO) 不只是定義，在 .code 填入程式碼。
 * @return	{Object}	root namespace
 * @since	2009/12/5 15:04:42, 2009/12/20 14:33:30
 * @memberOf	CeL.code.reorganize
 */
get_various_from_code = function(code, fill_code) {
	//library_namespace.log(''+code.slice(0, 100));

	//	使用 .split(/\r?\n/) 應注意：這實際上等於 .split(/(\r?\n)+/) (??)
	code = code.split(/\r?\n/);

	var i, m, last_code = [],
	/**
	 * 現在所處之 line
	 * @inner
	 * @ignore
	 */
	line = '',
	/**
	 * code.length, 加快速度用
	 * @constant
	 * @inner
	 * @ignore
	 */
	l = code.length,
	/**
	 * root namespace
	 * @inner
	 * @ignore
	 */
	ns={},
	/**
	 * 暫存 code(變數定義)
	 * @inner
	 * @ignore
	 */
	tmp_code,
	/**
	 * 名稱暫存變數
	 * @inner
	 * @ignore
	 */
	name,
	/**
	 * arguments 暫存變數<br/>
	 * e.g., 變數 name
	 * @inner
	 * @ignore
	 */
	various,
	/**
	 * 本變數之 properties。<br/>
	 * properties = { property: text contents of this property }
	 * @inner
	 * @ignore
	 */
	properties,
	/**
	 * 最後一次定義的變數名，用於之後若有變數需要繼承 namespace 時。
	 * @inner
	 * @ignore
	 */
	latest_name,
	/**
	 * 從變數定義取得變數名。
	 * @param	{String} _	變數定義
	 * @inner
	 * @ignore
	 */
	set_name = function(_) {
		name = (properties.name || (properties.memberOf ? (_.replace(
				/[\s\n]+/g, '').indexOf(properties.memberOf + '.') === -1 ? properties.memberOf + '.'
						: '')
						+ _ /* .replace(/^(.+)\./,'') */
						: properties.property ? latest_name ? latest_name + '.prototype.'
								+ _.replace(/^(.+)\./, '') : '' : _)).replace(
										/[\s\n]+/g, '');
	};

	for (i = 0; i < l; i++) {
		line = code[i];

		if (/^\s*\/\*\*/.test(line)) {
			//	處理 '/**' 之註解（這些是有意義的）
			properties = {};
			//	都沒有 '@' 時，預設為 @description
			properties[name = 'description'] = '';
			tmp_code = [];
			//library_namespace.log('' + line);
			while (i < l && line.indexOf('*/') === -1) {
				//library_namespace.log('' + line);
				tmp_code.push(line);
				if (m = line.match(/^\s+\*\s+@([_a-zA-Z\d\$.]+)\s+([^\s].+)$/))
					properties[name = m[1]] = m[2];
				else if (m = line.match(/^\s+\*\s+@([_a-zA-Z\d\$.]+)/))
					properties[name = m[1]] = 1;
				else if (m = line.match(/^\s+\*\s+([^\s].+)$/)) {
					if (properties[name] === 1)
						properties[name] = m[2];
					else
						properties[name] += (properties[name] ? '\n' : '') + m[2];
				}
				line = code[++i];
			}

			//library_namespace.log('[' + i + ']' + '\n' + tmp_code.join('\n') + '\n' + line);
			if (m = line.match(/(.*?\*\/)/)) {
				tmp_code.push(m[1]);
				line = line.replace(/(.*?)\*\//, '');

				//	初始化函式名
				name = '';

				/*
				 * 註解處理完了，接下來是變數。先把整個定義區放到 line。
				 * 這邊處理三種定義法:
				 * function name() {};
				 * var name = function(){};
				 * var name = 123;
				 */
				while (!/^\s*function\s$/.test(line) && !/[=;,]/.test(line))
					line += ' ' + code[++i];

				if (m = line.match(/^\s*function\s+([_a-zA-Z\d\$.]*)\s*\((.*)/)) {
					// function name() {};
					set_name(m[1]);
					various = m[2];
					while (i < l && various.indexOf(')') === -1)
						various += code[++i];
					m = various.match(/^[^)]*/);
					tmp_code.push(name + '=function(' + m[0] + '){};');

				} else if (m = line
						.match(/^\s*(var\s+)?([_a-zA-Z\d\$.]+)\s*=\s*(.+)/)) {
					set_name(m[2]);
					various = m[3];
					if (/^\s*function(\s+[_a-zA-Z\d\$]+)?\s*\(/.test(various)) {
						// var name = function(){};
						while (i < l && various.indexOf(')') === -1)
							various += code[++i];
						m = various.match(/^[^)]+\)/);
						tmp_code.push(name + '=' + m[0] + '{};');

					} else {
						// var name = 123;
						if (!properties.type)
							if (/^['"]/.test(various)) {
								properties.type = 'string';
							} else if (!isNaN(various)) {
								properties.type = 'number';
							} else if (/^(true|false)([\s;,]|$)/.test(various)) {
								properties.type = 'bool';
							} else if (various.charAt(0) === '[') {
								properties.type = 'array';
							} else if (various.charAt(0) === '{') {
								properties.type = 'object';
							} else if (various.charAt(0) === '/') {
								properties.type = 'regexp';
							} else if (/^regexp obj(ect)?$/.test(properties.type)) {
								properties.type = 'regexp';
							}

						//if (name === 'module_name');

						switch ((properties.type || '').toLowerCase()) {
						case 'string':
							m = various.replace(/\s*[,;]*\s*$/, '');
							//library_namespace.log('['+m+']');
							if (/^'[^\\']*'$/.test(m)
									|| /^"[^\\"]*"$/.test(m)) {
								various = '=' + m + ';';
							} else {
								various = '="";	//	' + various;
							}
							break;
						case 'bool':
						case 'boolean':
							if (m = various.toLowerCase().match(
									/^(true|false)([\s,;]|$)/i)) {
								various = '=' + m[1] + ';';
							} else {
								various = '=true;	//	' + various;
							}
							break;
						case 'number':
						case 'int':
						case 'integer':
							if (!isNaN(various)) {
								various = '=' + various + ';';
							} else {
								various = '=0;	//	' + various;
							}
							break;
						case 'array':
							various = '=' + '[];';
							break;
						case 'object':
							if (various.charAt(0) === '{') {
								while (i < l){
									if (various.lastIndexOf('}') !== -1) {
										m = various.slice(1, various.lastIndexOf('}'));
										if (m.lastIndexOf('/*') === -1
												|| m.lastIndexOf('/*') < m
														.lastIndexOf('*/'))
											break;
									}
									various += '\n' + code[++i];
								}
								m = various.replace(/\s*\/\/[^\n]*/g, '').replace(
										/\/\*((.|\n)*?)\*\//g, '').replace(/}(.*)$/,
										'}');
								if (0 && m.length > 3)
									library_namespace.log(name + '\n' + m
									// + '\n'+v
									);
								if (/^{([\s\n]*(('[^']*'|"[^"]*"|[_a-zA-Z\d\$.]+))[\s\n]*:('[^']*'|"[^"]*"|[\s\n\d+\-*\/()\^]+|true|false|null)+|,)*}/
										.test(m))
									various = '=' + various.replace(/}(.*)$/, '}') + ';';
								else
									various = '=' + '{};';
							} else
								various = '=' + '{};';
							break;
						case 'regexp':
							if (/^\/.+\/$/.test(various))
								various = '=' + various + ';';
							else {
								various = '=' + '/^regexp$/;	//	' + various;
							}
							break;
						default:
							if (/^[_a-zA-Z\d\$.]/.test(various)) {
								// reference
								various = ';//' + (properties.type ? '[' + properties.type + ']' : '')
										+ various;
							} else {
								// unknown code
								various = ';	//	'
										+ (properties.type ? '[' + properties.type + ']' : '')
										+ various;
							}
						}
						tmp_code.push(name + various);
					}
				}

				if (name && !properties.ignore && !properties.inner && !properties.private){
					if (!properties.property)
						//	定義最後一次變數名
						latest_name = name;

					name = name.split('.');
					//	將變數定義設置到 ns
					var np = ns, nl = name.length - 1, n;
					for (m = 0; m < nl; m++){
						n = name[m];
						if (!(n in np))
							// 初始設定 namespace
							np[n] = {
										'this' : ''
									};
						else if (typeof np[n] !== 'object')
							np[n] = {
										'this' : np[n]
									};
						np = np[n];
					}

					n = name[nl];
					//if (n in np) library_namespace.log('get_various_from_code: get duplicate various: [' + name.join('.') + ']');

					np[n] = tmp_code.join(library_namespace.env.new_line);
				}
			}
		}
	}

	return ns;
};


CeL.code.reorganize
.
/**
 * 把 get_various_from_code 生成的 namespace 轉成 code
 * @param	{Object} ns	root namespace
 * @param	{String} [prefix]	(TODO) prefix of root namespace
 * @param	{Array}	[code_array]	inner use, please don't specify this value.
 * @return	{String}	code
 * @since	2009/12/20 14:51:52
 * @memberOf	CeL.code.reorganize
 */
get_code_from_generated_various = function(ns, prefix, code_array) {
	var _s = arguments.callee, i, return_text = 0;

	if (!code_array)
		code_array = [], return_text = 1;

	//	先處理 'this'
	if (prefix) {
		if (!/\.prototype$/.test(prefix))
			if (i = ns['this']) {
				code_array.push(i);
				delete ns['this'];
			} else
				code_array.push('',
						'//	null constructor for [' + prefix + ']',
						prefix + '=function(){};',
						prefix + '.prototype={};');
		prefix += '.';
	} else
		prefix = '';


	for (i in ns)
		if (typeof ns[i] === 'string')
			code_array.push(ns[i]);
		else
			_s(ns[i], prefix + i, code_array);

	return return_text ? code_array
					.join(library_namespace.env.new_line)
					//.replace(/[\r\n]+/g,library_namespace.env.new_line)
					: code_array;
};



return (
	CeL.code.reorganize
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};
