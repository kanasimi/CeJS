/**
 * 本 JavaScript framework 的框架基本宣告<br/>
 * base name-space declaration of JavaScript library framework
 * @example
 * //	load library
 * <script type="text/javascript" src="../ce.js"></script>
 * //	預防 initialization 到一半彈出警告視窗，所以設大一點。
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
CeL=function(){
	///	<summary>
	///	本 JavaScript framework 的框架基本宣告<br/>
	///	base name-space declaration of JavaScript library framework
	///	</summary>
	///	<example>
	///	//	load library
	///	<script type="text/javascript" src="../ce.js"></script>
	///	//	預防 initialization 到一半彈出警告視窗，所以設大一點。
	///	CeL.log.max_length = 20;
	///	//	set debug
	///	CeL.set_debug();
	///	*
	///	//	判別是否已經 load 過
	///	if(typeof CeL !== 'function' || CeL.Class !== 'CeL')
	///	;	//	CeL has not been loaded
	///	</example>
	///	<name>CeL</name>
	///	<class>Colorless echo JavaScript kit/library: base name-space declaration</class>

};
/**
 * JavaScript library framework main class name.
 * @see	<a href="http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf">ECMA-262</a>: Object.Class: A string value indicating the kind of this object.
 * @constant
 */
//CeL.Class;//library_name;
	/**
	 * framework main prototype definition
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
CeL.prototype={};
/**
 * 本 library 專用之 evaluate()。
 * 
 * 若在 function 中 eval 以獲得 local various，在舊 browser 中須加 var。
 * e.g., 'var local_various=' + ..
 * 不加 var 在舊 browser 中會變成 global 變數。
 * @param code	script code to evaluate
 * @return	value that evaluate process returned
 * @see	window.eval === window.parent.eval
 */
CeL.eval_code=function eval_code(code){
	///	<summary>
	///	本 library 專用之 evaluate()。
	///	*
	///	若在 function 中 eval 以獲得 local various，在舊 browser 中須加 var。
	///	e.g., 'var local_various=' + ..
	///	不加 var 在舊 browser 中會變成 global 變數。
	///	</summary>
	///	<param name="code" type="" optional="false">script code to evaluate</param>
	///	<returns>value that evaluate process returned</returns>
	///	<see>window.eval === window.parent.eval</see>

};
/**
 * evaluate @ Global scope.
 * By the ECMA-262, new Function() will 'Pass in the Global Environment as the Scope parameter.'
 * @param code	script code to evaluate
 * @return	value that evaluate process returned
 */
CeL.global_eval=new Function("");
/**
 * simple evaluates to get value of specified various identifier name.
 * 不使用 eval().
 * @param {String} various_name	various identifier name. e.g., /[a-z\d$_]+(.[a-z\d_]+)+/i
 * @param {Object|Function} [name_space]	initialize name-space. default: global
 * @return	value of specified various identifier name
 * @since	2010/1/1 18:11:40
 * @note
 * 'namespace' 是 JScript.NET 的保留字
 * 
 * 在兩個子層(a.b.c)下，這樣作效率較差 @User agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.29 Safari/533.4:
 * function(v){try{return(new Function('return('+v+')'))();}catch(e){}}
 */
CeL.get_various=function(various_name, name_space){
	///	<summary>
	///	simple evaluates to get value of specified various identifier name.
	///	不使用 eval().
	///	</summary>
	///	<param name="various_name" type="String" optional="false">various identifier name. e.g., /[a-z\d$_]+(.[a-z\d_]+)+/i</param>
	///	<param name="name_space" type="Object|Function" optional="true">initialize name-space. default: global</param>
	///	<returns>value of specified various identifier name</returns>
	///	<since>2010/1/1 18:11:40</since>
	///	<note>
	///	'namespace' 是 JScript.NET 的保留字
	///	*
	///	在兩個子層(a.b.c)下，這樣作效率較差 @User agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.29 Safari/533.4:
	///	function(v){try{return(new Function('return('+v+')'))();}catch(e){}}
	///	</note>

};
/**
 * 取得執行 script 之 path, 在 .hta 中取代 WScript.ScriptFullName。
 * @return	{String}	執行 script 之 path
 * @return	''	unknown environment
 */
CeL.get_script_full_name=function(){
	///	<summary>取得執行 script 之 path, 在 .hta 中取代 WScript.ScriptFullName。</summary>
	///	<returns type="String">執行 script 之 path</returns>
	///	<returns>''	unknown environment</returns>

};
/**
 * 取得執行 script 之名稱
 * @return	{String} 執行 script 之 名稱
 * @return	''	unknown environment
 */
CeL.get_script_name=function(){
	///	<summary>取得執行 script 之名稱</summary>
	///	<returns type="String">執行 script 之 名稱</returns>
	///	<returns>''	unknown environment</returns>

};
/**
 * 取得/設定環境變數 enumeration<br/>
 * （雖然不喜歡另開 name-space，但以 2009 當下的 JsDoc Toolkit 來說，似乎沒辦法創造 enumeration。）
 * @class	環境變數 (environment variables) 與程式會用到的 library 相關變數。
 * @param {String} name	環境變數名稱
 * @param value	環境變數之值
 * @return	舊環境變數之值
 */
CeL.env=function env(name, value){
	///	<summary>
	///	取得/設定環境變數 enumeration<br/>
	///	（雖然不喜歡另開 name-space，但以 2009 當下的 JsDoc Toolkit 來說，似乎沒辦法創造 enumeration。）
	///	</summary>
	///	<class>環境變數 (environment variables) 與程式會用到的 library 相關變數。</class>
	///	<param name="name" type="String" optional="false">環境變數名稱</param>
	///	<param name="value" type="" optional="false">環境變數之值</param>
	///	<returns>舊環境變數之值</returns>

};
	/**
	 * default extension of script file.
	 * 設定成 '.' 時由 CeL.get_script_base_path 設定
	 * @type	String
	 * @see
	 * <a href="http://soswitcher.blogspot.com/2009/05/blogger-host-javascript-file-for-free.html" accessdate="2010/3/11 23:30">Blogger - Host Javascript File for Free - Blogger,Javascript - Blogger Blog by Switcher</a>
	 * @name	CeL.env.script_extension
	 */
CeL.env.script_extension="";	//	typeof WScript === 'undefined' ? '.' : '.js';//'.txt'
	/**
	 * library main file base name
	 * @name	CeL.env.main_script_name
	 * @type	String
	 */
CeL.env.main_script_name='ce';
	/**
	 * library main file name<br/>
	 * full path: {@link CeL.env.registry_path} + {@link CeL.env.main_script}
	 * @example:
	 * CeL.log('full path: ['+CeL.env.registry_path+CeL.env.main_script+']');
	 * @name	CeL.env.main_script
	 * @type	String
	 */
CeL.env.main_script="";	//	env.main_script_name + env.script_extension;
	/**
	 * module 中的這 member 定義了哪些 member 不被 extend
	 * @name	CeL.env.not_to_extend_keyword
	 * @type	String
	 */
CeL.env.not_to_extend_keyword='no_extend';
	/**
	 * 本 library source 檔案使用之 encoding<br/>
	 * 不使用會產生語法錯誤
	 * @name	CeL.env.source_encoding
	 * @type	String
	 */
CeL.env.source_encoding='UTF-16';
	/**
	 * default global object
	 * @name	CeL.env.global
	 * @type	Object
	 */
CeL.env.global={};
	/**
	 * creator group
	 * @name	CeL.env.company
	 * @type	String
	 */
CeL.env.company='Colorless echo';
		/**
		 * 存放在 registry 中的 path
		 * @name	CeL.env.registry_path
		 */
//CeL.env.registry_path;	//	(WScript.CreateObject("WScript.Shell"))
	/**
	 * 本次執行所在 OS 平台
	 * @name	CeL.env.OS
	 * @type	String
	 */
CeL.env.OS="";	//	OS = typeof OS_type === 'string' ? OS_type
	/**
	 * 文件預設 new line
	 * @name	CeL.env.new_line
	 * @type	String
	 */
CeL.env.new_line="";	//	OS == 'unix' ? '\n' : OS == 'Mac' ? '\r' : '\r\n';	//	in VB: vbCrLf
	/**
	 * file system 預設 path separator<br/>
	 * platform-dependent path separator character, 決定目錄(directory)分隔
	 * @name	CeL.env.path_separator
	 * @type	String
	 */
CeL.env.path_separator="";	//	OS == 'unix' ? '/' : '\\';
	/**
	 * 預設 module name separator
	 * @name	CeL.env.module_name_separator
	 * @type	String
	 */
CeL.env.module_name_separator='.';
	/**
	 * path_separator in 通用(regular)運算式
	 * @name	CeL.env.path_separator_RegExp
	 * @type	RegExp
	 */
CeL.env.path_separator_RegExp=/^regexp$/;	//	this.to_RegExp_pattern ? this
	/**
	 * 預設語系
	 * 0x404:中文-台灣,0x0411:日文-日本
	 * @name	CeL.env.locale
	 * @see	<a href="http://msdn.microsoft.com/zh-tw/library/system.globalization.cultureinfo(VS.80).aspx">CultureInfo 類別</a>
	 * @type	Number
	 */
CeL.env.locale=0;	//	0x404;
	/**
	 * script name
	 * @name	CeL.env.script_name
	 * @type	String
	 */
CeL.env.script_name="";	//	this.get_script_name();
	/**
	 * base path of library
	 * @name	CeL.env.library_base_path
	 * @type	String
	 */
CeL.env.library_base_path="";	//	this.get_script_full_name(); // 以 reg 代替
	/**
	 * Legal identifier name in RegExp.
	 * 這 pattern 會佔去兩個筆紀錄: first letter, and least.
	 * .replace(/_/ [g],'for first letter')
	 * .replace(/\\d/,'for least')
	 * 這邊列出的只是合法 identifier 的子集且未去除 reserved words!
	 * @name	CeL.env.identifier_RegExp
	 * @see
	 * ECMA-262	7.6 Identifier Names and Identifiers
	 */
CeL.env.identifier_RegExp=/^regexp$/;	//	/([a-zA-Z$_]|\\u[\da-fA-F]{4})([a-zA-Z$_\d]+|\\u[\da-fA-F]{4}){0,63}/;
	/**
	 * Legal identifier name in String from env.identifier_RegExp.
	 * @name	CeL.env.identifier_String
	 */
//CeL.env.identifier_String;//env.identifier_RegExp.source;
/**
 * 判斷為何種 type。主要用在 Error, DOMException 等 native object 之判別。
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
 * <a href="http://lifesinger.org/blog/2009/02/javascript-type-check-2/" accessdate="2009/12/6 19:10">JavaScript\u31867型\u26816\u27979小\u32467（下） - \u23681月如歌</a><br/>
 * <a href="http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/" accessdate="2009/12/6 19:10">Perfection kills &raquo; `instanceof` considered harmful (or how to write a robust `isArray`)</a>
 */
CeL.is_type=function(value, want_type, get_Class){
	///	<summary>判斷為何種 type。主要用在 Error, DOMException 等 native object 之判別。</summary>
	///	<param name="value" type="" optional="false">various or class instance to test</param>
	///	<param name="want_type" type="String" optional="true">type to compare: number, string, boolean, undefined, object, function</param>
	///	<param name="get_Class" type="Boolean" optional="true">get the class name of a class(function) instance.</param>
	///	<returns type="Boolean">The type is matched.</returns>
	///	<returns type="String">The type of value</returns>
	///	<returns type="undefined">error occurred</returns>
	///	<example>CeL.is_type(value_to_test, 'Array');</example>
	///	<since>2009/12/14 19:50:14</since>
	///	<see>
	///	<a href="http://lifesinger.org/blog/2009/02/javascript-type-check-2/" accessdate="2009/12/6 19:10">JavaScript\u31867型\u26816\u27979小\u32467（下） - \u23681月如歌</a><br/>
	///	<a href="http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/" accessdate="2009/12/6 19:10">Perfection kills &raquo; `instanceof` considered harmful (or how to write a robust `isArray`)</a>
	///	</see>

};
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
CeL.object_tester=function(want_type, toString_reference){
	///	<summary>get a type test function</summary>
	///	<param name="want_type" type="String" optional="false">object type to compare</param>
	///	<param name="toString_reference" type="String" optional="true">a reference name to Object.prototype.toString</param>
	///	<returns type="Function">type test function</returns>
	///	<since>2009/12/20 08:38:26</since>
	///	<example>
	///	// 大量驗證時，推薦另外在本身 scope 中造出捷徑：
	///	this.OtS = Object.prototype.toString;
	///	var is_Array = CeL.object_tester('Array', 'OtS');
	///	// test
	///	if(is_Array(value))
	///	//	it's really a native Array
	///	* 	;
	///	</example>

};
/**
 * Setup environment variables
 * @param	{String} [OS_type]	type of OS
 * @return	{Object}	environment variables set
 */
CeL.initial_env=function(OS_type){
	///	<summary>Setup environment variables</summary>
	///	<param name="OS_type" type="String" optional="true">type of OS</param>
	///	<returns type="Object">environment variables set</returns>

};
/**
 * Tell if it's now debugging.
 * @param {Integral} [debug_level]	if it's now in this debug level.
 * @return	{Boolean}	It's now in specified debug level.
 * @return	{Number}	It's now in what debug level(Integral).
 */
CeL.is_debug=function(debug_level){
	///	<summary>Tell if it's now debugging.</summary>
	///	<param name="debug_level" type="Integral" optional="true">if it's now in this debug level.</param>
	///	<returns type="Boolean">It's now in specified debug level.</returns>
	///	<returns type="Number">It's now in what debug level(Integral).</returns>

};
/**
 * Set debugging level
 * @param {Integral} [debug_level]	The debugging level to set.
 * @type	Integral
 * @return	{Number} debugging level now
 */
CeL.set_debug=function(debug_level){
	///	<summary>Set debugging level</summary>
	///	<param name="debug_level" type="Integral" optional="true">The debugging level to set.</param>
	///	<returns type="Number">debugging level now</returns>

};
/**
 * Get the hash key of text.
 * @param {String} text	text to test
 * @return	{String}	hash key
 */
CeL._get_hash_key=function(text){
	///	<summary>Get the hash key of text.</summary>
	///	<param name="text" type="String" optional="false">text to test</param>
	///	<returns type="String">hash key</returns>

};
/**
 * 獲得函數名
 * @param {Function} fr	function reference
 * @param {String} ns	name-space
 * @param {Boolean} force_load	force reload this name-space
 * @return
 * @see
 * 可能的話請改用 {@link CeL.native.parse_function}(F).funcName
 * @since	2010/1/7 22:10:27
 */
CeL.get_function_name=function get_function_name(fr, ns, force_load){
	///	<summary>獲得函數名</summary>
	///	<param name="fr" type="Function" optional="false">function reference</param>
	///	<param name="ns" type="String" optional="false">name-space</param>
	///	<param name="force_load" type="Boolean" optional="false">force reload this name-space</param>
	///	<returns/>
	///	<see>可能的話請改用 {@link CeL.native.parse_function}(F).funcName</see>
	///	<since>2010/1/7 22:10:27</since>

};
/**
 * 延展物件 (learned from jQuery)
 * @since	2009/11/25 21:17:44
 * @param	variable_set	variable set
 * @param	{Object|Function} name_space	extend to what name-space
 * @param	from_name_space	When inputing function names, we need a base name-space to search these functions.
 * @return	library names-pace
 * @see
 * <a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/03/01/jquery-extend.aspx" accessdate="2009/11/17 1:24" title="jQuery.extend的用法 - 黑暗執行緒">jQuery.extend的用法</a>,
 * <a href="http://www.cnblogs.com/rubylouvre/archive/2009/11/21/1607072.html" accessdate="2010/1/1 1:40">jQuery源\u30721\u23398\u20064\u31508\u35760三 - Ruby's Louvre - 博客\u22253</a>
 */
CeL.extend=function extend(variable_set, name_space, from_name_space){
	///	<summary>延展物件 (learned from jQuery)</summary>
	///	<since>2009/11/25 21:17:44</since>
	///	<param name="variable_set" type="" optional="false">variable set</param>
	///	<param name="name_space" type="Object|Function" optional="false">extend to what name-space</param>
	///	<param name="from_name_space" type="" optional="false">When inputing function names, we need a base name-space to search these functions.</param>
	///	<returns>library names-pace</returns>
	///	<see>
	///	<a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/03/01/jquery-extend.aspx" accessdate="2009/11/17 1:24" title="jQuery.extend的用法 - 黑暗執行緒">jQuery.extend的用法</a>,
	///	<a href="http://www.cnblogs.com/rubylouvre/archive/2009/11/21/1607072.html" accessdate="2010/1/1 1:40">jQuery源\u30721\u23398\u20064\u31508\u35760三 - Ruby's Louvre - 博客\u22253</a>
	///	</see>

};
/**
 * workaround.
 * 把 name_space 下的 function_name (name_space[function_name]) 換成 new_function。
 * @example
 * library_namespace.replace_function(_, 'to_SI_prefix', to_SI_prefix);
 * @param name_space	which name-space
 * @param {String} function_name	name_space.function_name
 * @param {Function} new_function	replace to what function
 * @return	new_function
 */
CeL.replace_function=function(name_space, function_name, new_function){
	///	<summary>
	///	workaround.
	///	把 name_space 下的 function_name (name_space[function_name]) 換成 new_function。
	///	</summary>
	///	<example>library_namespace.replace_function(_, 'to_SI_prefix', to_SI_prefix);</example>
	///	<param name="name_space" type="" optional="false">which name-space</param>
	///	<param name="function_name" type="String" optional="false">name_space.function_name</param>
	///	<param name="new_function" type="Function" optional="false">replace to what function</param>
	///	<returns>new_function</returns>

};
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
CeL.get_file=function(path, encoding){
	///	<summary>
	///	Get file resource<br/>
	///	用於 include JavaScript 檔之類需求時，取得檔案內容之輕量級函數。<br/>
	///	除 Ajax，本函數亦可用在 CScript 執行中。
	///	</summary>
	///	<example>
	///	//	get contents of [path/to/file]:
	///	var file_contents = CeL.get_file('path/to/file');
	///	</example>
	///	<param name="path" type="String" optional="false">URI / full path. <em style="text-decoration:line-through;">不能用相對path！</em></param>
	///	<param name="encoding" type="String" optional="true">file encoding</param>
	///	<returns type="String">data	content of path</returns>
	///	<returns type="undefined">when error occurred: no Ajax function, ..</returns>
	///	<throws>uncaught exception @ Firefox: 0x80520012 (NS_ERROR_FILE_NOT_FOUND), <a href="http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#exceptions">NETWORK_ERR</a> exception</throws>
	///	<throws>'Access to restricted URI denied' 當 access 到上一層目錄時 @ Firefox</throws>
	///	<see>
	///	<a href=http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx">Cross Site AJAX</a>,
	///	<a href="http://domscripting.com/blog/display/91">Cross-domain Ajax</a>,
	///	<a href="http://forums.mozillazine.org/viewtopic.php?f=25&amp;t=737645" accessdate="2010/1/1 19:37">FF3 issue with iFrames and XSLT standards</a>,
	///	<a href="http://kb.mozillazine.org/Security.fileuri.strict_origin_policy" accessdate="2010/1/1 19:38">Security.fileuri.strict origin policy - MozillaZine Knowledge Base</a>
	///	Chrome: <a href="http://code.google.com/p/chromium/issues/detail?id=37586" title="between builds 39339 (good) and 39344 (bad)">NETWORK_ERR: XMLHttpRequest Exception 101</a>
	///	</see>

};
/**
 * Ask privilege in mozilla projects.
 * enablePrivilege 似乎只能在執行的 function 本身或 caller 呼叫才有效果，跳出函數即無效，不能 cache，因此提供 callback。
 * 就算按下「記住此決定」，重開瀏覽器後需要再重新授權。
 * @param {String|Error} privilege	privilege that asked 或因權限不足導致的 Error
 * @param {Function|Number} callback	Run this callback if getting the privilege. If it's not a function but a number(經過幾層/loop層數), detect if there's a loop or run the caller.
 * @return	OK / the return of callback
 * @throws	error
 * @since	2010/1/2 00:40:42
 */
CeL.require_netscape_privilege=function require_netscape_privilege(privilege, callback){
	///	<summary>
	///	Ask privilege in mozilla projects.
	///	enablePrivilege 似乎只能在執行的 function 本身或 caller 呼叫才有效果，跳出函數即無效，不能 cache，因此提供 callback。
	///	就算按下「記住此決定」，重開瀏覽器後需要再重新授權。
	///	</summary>
	///	<param name="privilege" type="String|Error" optional="false">privilege that asked 或因權限不足導致的 Error</param>
	///	<param name="callback" type="Function|Number" optional="false">Run this callback if getting the privilege. If it's not a function but a number(經過幾層/loop層數), detect if there's a loop or run the caller.</param>
	///	<returns>OK / the return of callback</returns>
	///	<throws>error</throws>
	///	<since>2010/1/2 00:40:42</since>

};
/**
 * 當需要要求權限時，是否執行。（這樣可能彈出對話框）
 * @type	Boolean
 */
CeL.require_netscape_privilege.enabled=true;
/**
 * 得知 script file 之相對 base path
 * @param	{String} JSFN	script file name
 * @return	{String} relative base path
 * @example
 * <script type="text/javascript" src="../baseFunc.js"></script>
 * //	引數為本.js檔名。若是更改.js檔名，亦需要同步更動此值！
 * var basePath=get_script_base_path('baseFunc.js');
 * perl: use File::Basename;
 */
CeL.get_script_base_path=function(JSFN){
	///	<summary>得知 script file 之相對 base path</summary>
	///	<param name="JSFN" type="String" optional="false">script file name</param>
	///	<returns type="String">relative base path</returns>
	///	<example>
	///	<script type="text/javascript" src="../baseFunc.js"></script>
	///	//	引數為本.js檔名。若是更改.js檔名，亦需要同步更動此值！
	///	var basePath=get_script_base_path('baseFunc.js');
	///	perl: use File::Basename;
	///	</example>

};
/**
 * get the path of specified module
 * @param {String} module_name	module name
 * @param	{String} file_name	取得在同一目錄下檔名為 file_name 之 path。若填入 '' 可取得 parent 目錄。
 * @return	{String} module path
 */
CeL.get_module_path=function(module_name, file_name){
	///	<summary>get the path of specified module</summary>
	///	<param name="module_name" type="String" optional="false">module name</param>
	///	<param name="file_name" type="String" optional="false">取得在同一目錄下檔名為 file_name 之 path。若填入 '' 可取得 parent 目錄。</param>
	///	<returns type="String">module path</returns>

};
/**
 * 轉化所有 /., /.., //
 * @since	2009/11/23 22:32:52
 * @param {String} path	欲轉化之 path
 * @return	{String} path
 */
CeL.simplify_path=function(path){
	///	<summary>轉化所有 /., /.., //</summary>
	///	<since>2009/11/23 22:32:52</since>
	///	<param name="path" type="String" optional="false">欲轉化之 path</param>
	///	<returns type="String">path</returns>

};
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
 * @param	{Object|Boolean} [extend_to]	extend to which name-space<br/>
 * false:	just load, don't extend to library name-space<br/>
 * this:	extend to global<br/>
 * object:	extend to specified name-space that you can use [name_space]._func_ to run it<br/>
 * (others, including undefined):	extend to root of this library. e.g., call CeL._function_name_ and we can get the specified function.
 * @return	{Error}
 * @return	-1	will execute callback after load, 不代表一定 load 了!
 * @return	{undefined}	no error, OK
 * @example
 * CeL.use('code.log', function(){..});
 * CeL.use(['code.log', 'code.debug']);
 * @note
 * 'use' 是 JScript.NET 的保留字
 */
CeL.use=function requires(module, callback, extend_to){
	///	<summary>
	///	Include specified module<br/>
	///	注意：以下的 code 中，CeL.warn 不一定會被執行（可能會、可能不會），因為執行時 code.log 尚未被 include。<br/>
	///	此時應該改用 CeL.use('code.log', callback);<br/>
	///	code in head/script/:
	///	<pre>
	///	CeL.use('code.log');
	///	CeL.warn('a WARNING');
	///	</pre>
	///	**	在指定 callback 時 name_space 無效！
	///	**	預設會 extend 到 library 本身下！
	///	</summary>
	///	<param name="module" type="String" optional="false">module name</param>
	///	<param name="callback" type="Function" optional="true">callback function</param>
	///	<param>
	///	{Object|Boolean} [extend_to]	extend to which name-space<br/>
	///	false:	just load, don't extend to library name-space<br/>
	///	this:	extend to global<br/>
	///	object:	extend to specified name-space that you can use [name_space]._func_ to run it<br/>
	///	(others, including undefined):	extend to root of this library. e.g., call CeL._function_name_ and we can get the specified function.
	///	</param>
	///	<returns type="Error"/>
	///	<returns>-1	will execute callback after load, 不代表一定 load 了!</returns>
	///	<returns type="undefined">no error, OK</returns>
	///	<example>
	///	CeL.use('code.log', function(){..});
	///	CeL.use(['code.log', 'code.debug']);
	///	</example>
	///	<note>'use' 是 JScript.NET 的保留字</note>

};
/**
 * include other JavaScript/CSS files
 * @param {String} resource path
 * @param {Function|Object} callback
 * 		use_write ? test function{return } : callback function
 * 		/	{callback: callback function, module: module name, global: global object when run callback}
 * @param {Boolean} [use_write]	use document.write() instead of insert a element
 * @param {Boolean} [type]	1: is a .css file, others: script
 */
CeL.include_resource=function include_resource(path, callback, use_write, type){
	///	<summary>include other JavaScript/CSS files</summary>
	///	<param name="resource" type="String" optional="false">path</param>
	///	<param>
	///	{Function|Object} callback
	///	use_write ? test function{return } : callback function
	///	/	{callback: callback function, module: module name, global: global object when run callback}
	///	</param>
	///	<param name="use_write" type="Boolean" optional="true">use document.write() instead of insert a element</param>
	///	<param name="type" type="Boolean" optional="true">1: is a .css file, others: script</param>

};
/**
 * 已經 include_resource 了哪些 JavaScript 檔（存有其路徑）.
 * loaded{路徑} = count,
 * 本定義可省略(only for documentation)
 * @type	{Object}
 */
//CeL.include_resource.loaded;//[{Object}]null;
/**
 * 已經 include_resource 了多少個 JavaScript 檔.
 * 本定義可省略(only for documentation)
 * @type Number
 */
CeL.include_resource.count=0;	//	0;
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
CeL.include_module_resource=function(file_name, module_name){
	///	<summary>include resource of module.</summary>
	///	<example>
	///	//	外部程式使用時，通常用在 include 相對於 library 本身路徑固定的檔案。
	///	//	例如 file_name 改成相對於 library 本身來說的路徑。
	///	CeL.include_module_resource('../../game/game.css');
	///	</example>
	///	<param name="file_name" type="String" optional="false">與 module 位於相同目錄下的 resource file name</param>
	///	<param name="module_name" type="String" optional="true">呼叫的 module name。未提供則設成 library base path，此時 file_name 為相對於 library 本身路徑的檔案。</param>
	///	<returns/>
	///	<since>2010/1/1-2 13:58:09</since>

};
/**
 * 預先準備好下層 module 定義時的環境。<br/>
 * 請盡量先 call 上層 name-space 再定義下層的。
 * @param	{String} module_name	module name
 * @param	{Function} code_for_including	若欲 include 整個 module 時，需囊括之 code。
 * @return	null	invalid module
 * @return	{Object}	下層 module 之 name-space
 * @return	undefined	something error, e.g., 未成功 load，code_for_including return null, ..
 */
CeL.setup_module=function(module_name, code_for_including){
	///	<summary>
	///	預先準備好下層 module 定義時的環境。<br/>
	///	請盡量先 call 上層 name-space 再定義下層的。
	///	</summary>
	///	<param name="module_name" type="String" optional="false">module name</param>
	///	<param name="code_for_including" type="Function" optional="false">若欲 include 整個 module 時，需囊括之 code。</param>
	///	<returns>null	invalid module</returns>
	///	<returns type="Object">下層 module 之 name-space</returns>
	///	<returns>undefined	something error, e.g., 未成功 load，code_for_including return null, ..</returns>

};
/**
 * 是否 cache code。
 * 若不是要重構 code 則不需要。
 * @type	Boolean
 */
CeL.cache_code=false;
/**
 * 模擬 inherits
 * @param {String} module_name	欲繼承的 module_name
 * @param initial_arguments	繼承時的 initial arguments
 * @return
 * @see
 * <a href="http://fillano.blog.ithome.com.tw/post/257/17355" accessdate="2010/1/1 0:6">Fillano's Learning Notes | 物件導向Javascript - 實作繼承的效果</a>,
 * <a href="http://www.crockford.com/javascript/inheritance.html" accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>
 */
CeL.inherits=function(module_name, initial_arguments){
	///	<summary>模擬 inherits</summary>
	///	<param name="module_name" type="String" optional="false">欲繼承的 module_name</param>
	///	<param name="initial_arguments" type="" optional="false">繼承時的 initial arguments</param>
	///	<returns/>
	///	<see>
	///	<a href="http://fillano.blog.ithome.com.tw/post/257/17355" accessdate="2010/1/1 0:6">Fillano's Learning Notes | 物件導向Javascript - 實作繼承的效果</a>,
	///	<a href="http://www.crockford.com/javascript/inheritance.html" accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>
	///	</see>

};
/**
 * 將輸入的 string 分割成各 module 單元。<br/>
 * need environment_adapter()<br/>
 * ** 並沒有對 module 做完善的審核!
 * @param {String} module_name	module name
 * @return	{Array}	module unit array
 */
CeL.split_module_name=function(module_name){
	///	<summary>
	///	將輸入的 string 分割成各 module 單元。<br/>
	///	need environment_adapter()<br/>
	///	** 並沒有對 module 做完善的審核!
	///	</summary>
	///	<param name="module_name" type="String" optional="false">module name</param>
	///	<returns type="Array">module unit array</returns>

};
/**
 * 判斷 module 是否存在，以及是否破損。
 * @param	{String} module_name	module name
 * @return	{Boolean} module 是否存在以及良好。
 */
CeL.is_loaded=function(module_name){
	///	<summary>判斷 module 是否存在，以及是否破損。</summary>
	///	<param name="module_name" type="String" optional="false">module name</param>
	///	<returns type="Boolean">module 是否存在以及良好。</returns>

};
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
 * 2010/6/14 22:58:18	避免相互 require
 */
CeL.use_function=function(function_list, return_extend){
	///	<summary>
	///	module 中需要 include function 時使用。<br/>
	///	TODO: 輸入 function name 即可
	///	</summary>
	///	<example>
	///	//	requires (inside module)
	///	if(eval(library_namespace.use_function('data.split_String_to_Object')))return;
	///	</example>
	///	<param name="function_list" type="" optional="false">function list</param>
	///	<param name="return_extend" type="" optional="true">設定時將回傳 object</param>
	///	<returns>error</returns>
	///	<since>
	///	2009/12/26 02:36:31
	///	2009/12/31 22:21:23	add 類似 'data.' 的形式，為 module。
	///	2010/6/14 22:58:18	避免相互 require
	///	</since>

};
/**
 * null module constructor
 * @class	data 處理的 functions
 */
CeL.data=function(){
	///	<summary>null module constructor</summary>
	///	<class>data 處理的 functions</class>

};
/**
 * clone native Object
 * @param {Object} object
 * @param {Boolean} not_trivial
 * @return
 * @since	2008/7/19 11:13:10
 */
CeL.data.clone_object=clone_object=function(object, not_trivial){
	///	<summary>clone native Object</summary>
	///	<param name="object" type="Object" optional="false"/>
	///	<param name="not_trivial" type="Boolean" optional="false"/>
	///	<returns/>
	///	<since>2008/7/19 11:13:10</since>

};
/**
 * 測出各字元的出現率。 普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
 * 
 * @param {String} text
 *            文檔
 * @return
 * @memberOf CeL.data
 */
CeL.data.char_frequency=function (text){
	///	<summary>
	///	測出各字元的出現率。 普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
	///	*
	///	</summary>
	///	<param name="text" type="String" optional="false">文檔</param>
	///	<returns/>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * 計算字數 word counts.
 * 
 * @param {String} text
 *            文檔
 * @param flag
 * @return
 * @memberOf CeL.data
 */
CeL.data.count_word=function(text, flag){
	///	<summary>
	///	計算字數 word counts.
	///	*
	///	</summary>
	///	<param name="text" type="String" optional="false">文檔</param>
	///	<param name="flag" type="" optional="false"/>
	///	<returns/>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * 運算式值的二進位表示法	已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz
 * @param {Number} number	number
 * @param places	places,字元數,使用前置0來填補回覆值
 * @return
 * @example
 * {var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}
 * @memberOf	CeL.data
 */
CeL.data.dec_to_bin=function(number, places){
	///	<summary>運算式值的二進位表示法	已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz</summary>
	///	<param name="number" type="Number" optional="false">number</param>
	///	<param name="places" type="" optional="false">places,字元數,使用前置0來填補回覆值</param>
	///	<returns/>
	///	<example>{var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}</example>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * 設定object之值，輸入item=[value][,item=[value]..]。
 * value未設定會自動累加。
 * 使用前不必需先宣告…起碼在現在的JS版本中
 * @param obj	object name that need to operate at
 * @param value	valueto set
 * @param type	累加 / value type
 * @param mode	mode / value type
 * @return
 * @memberOf	CeL.data
 */
CeL.data.set_obj_value=function(obj, value, type, mode){
	///	<summary>
	///	設定object之值，輸入item=[value][,item=[value]..]。
	///	value未設定會自動累加。
	///	使用前不必需先宣告…起碼在現在的JS版本中
	///	</summary>
	///	<param name="obj" type="" optional="false">object name that need to operate at</param>
	///	<param name="value" type="" optional="false">valueto set</param>
	///	<param name="type" type="" optional="false">累加 / value type</param>
	///	<param name="mode" type="" optional="false">mode / value type</param>
	///	<returns/>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * 將字串組分作 Object
 * @param {String} value_set	字串組, e.g., 'a=12,b=34'
 * @param assignment_char	char to assign values, e.g., '='
 * @param end_char	end char of assignment
 * @return
 * @since	2006/9/6 20:55, 2010/4/12 23:06:04
 * @memberOf	CeL.data
 */
CeL.data.split_String_to_Object=function(value_set, assignment_char, end_char){
	///	<summary>將字串組分作 Object</summary>
	///	<param name="value_set" type="String" optional="false">字串組, e.g., 'a=12,b=34'</param>
	///	<param name="assignment_char" type="" optional="false">char to assign values, e.g., '='</param>
	///	<param name="end_char" type="" optional="false">end char of assignment</param>
	///	<returns/>
	///	<since>2006/9/6 20:55, 2010/4/12 23:06:04</since>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * test if 2 string is at the same length
 * @param s1	string 1
 * @param s2	string 2
 * @return
 * @memberOf	CeL.data
 */
CeL.data.same_length=function(s1, s2){
	///	<summary>test if 2 string is at the same length</summary>
	///	<param name="s1" type="" optional="false">string 1</param>
	///	<param name="s2" type="" optional="false">string 2</param>
	///	<returns/>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * 將數字轉為 K, M, G 等 SI prefixes 表示方式，例如 6458 轉成 6.31K。
 * @param {Number} number	數字
 * @param {Number} digits	to fixed digit
 * @type	{String}
 * @return	{String}	SI prefixes 表示方式
 * @requires	setTool,to_fixed
 * @memberOf	CeL.data
 */
CeL.data.to_SI_prefix=function (number, digits){
	///	<summary>將數字轉為 K, M, G 等 SI prefixes 表示方式，例如 6458 轉成 6.31K。</summary>
	///	<param name="number" type="Number" optional="false">數字</param>
	///	<param name="digits" type="Number" optional="false">to fixed digit</param>
	///	<returns type="String">SI prefixes 表示方式</returns>
	///	<requires>setTool,to_fixed</requires>
	///	<memberOf>CeL.data</memberOf>

};
/**
 * null module constructor
 * @class	CSV data 的 functions
 */
CeL.data.CSV=function(){
	///	<summary>null module constructor</summary>
	///	<class>CSV data 的 functions</class>

};
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
CeL.data.CSV.parse_CSV=function(_t, doCheck, hasTitle){
	///	<summary>parse CSV data to JSON	讀入 CSV 檔</summary>
	///	<param name="_t" type="String" optional="false">CSV text data</param>
	///	<param name="doCheck" type="Boolean" optional="false">check if data is valid</param>
	///	<param name="hasTitle" type="Boolean" optional="false">there's a title line</param>
	///	<returns type="Array">[ [L1_1,L1_2,..], [L2_1,L2_2,..],.. ]</returns>
	///	<memberOf>CeL.data.CSV</memberOf>
	///	<example>
	///	//	to use:
	///	var data=parse_CSV('~');
	///	data[_line_][_field_]
	///	*
	///	//	hasTitle:
	///	var data = parse_CSV('~',0,1);
	///	//data[_line_][data.t[_title_]]
	///	*
	///	//	then:
	///	data.tA	=	title line
	///	data.t[_field_name_]	=	field number of title
	///	data.it	=	ignored title array
	///	data[num]	=	the num-th line (num: 0,1,2,..)
	///	</example>
	///	<see>
	///	<a href="http://www.jsdb.org/" accessdate="2010/1/1 0:53">JSDB: JavaScript for databases</a>,
	///	<a href="http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html" accessdate="2010/1/1 0:53">John Hax: A lesson of RegExp: 50x faster with just one line patch</a>
	///	</see>

};
/**
* field delimiter
*/
CeL.data.CSV.parse_CSV.fd="";	//	'\\t,;';// :\s
/**
* text delimiter
*/
CeL.data.CSV.parse_CSV.td="";	//	'"\'';
/**
* auto detect.. no title
*/
//CeL.data.CSV.parse_CSV.hasTitle;//null;
/**
 * null module constructor
 * @class	XML 操作相關之 function。
 */
CeL.data.XML=function(){
	///	<summary>null module constructor</summary>
	///	<class>XML 操作相關之 function。</class>

};
/**
 * null module constructor
 * @class	locale 的 functions
 */
CeL.locale=function(){
	///	<summary>null module constructor</summary>
	///	<class>locale 的 functions</class>

};
/**
 * null module constructor
 * @class	math 的 functions
 */
CeL.math=function(){
	///	<summary>null module constructor</summary>
	///	<class>math 的 functions</class>

};
/**
 * 輾轉相除 n1/n2 或 小數 n1/1 轉成 整數/整數
 * @param {Number} n1	number 1
 * @param {Number} [n2]	number 2
 * @param {Number} times	max 次數, 1,2,..
 * @return	{Array}	連分數序列 ** 負數視 _.mutual_division.done 而定!
 */
CeL.math.mutual_division=function mutual_division(n1, n2, times){
	///	<summary>輾轉相除 n1/n2 或 小數 n1/1 轉成 整數/整數</summary>
	///	<param name="n1" type="Number" optional="false">number 1</param>
	///	<param name="n2" type="Number" optional="true">number 2</param>
	///	<param name="times" type="Number" optional="false">max 次數, 1,2,..</param>
	///	<returns type="Array">連分數序列 ** 負數視 _.mutual_division.done 而定!</returns>

};
/**
 * !!mode:連分數處理，對負數僅有最初一數為負。
 */
//CeL.math.mutual_division.mode;//0;
/**
 * 取得連分數序列的數值
 * @param {Array} sequence	序列
 * @param {Number} [max_no]	取至第 max_no 個
 * @requires	mutual_division.done
 * @return
 * @see
 * var a=continued_fraction([1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]);
 * alert(a+'\n'+a[0]/a[1]+'\n'+Math.SQRT2+'\n'+(Math.SQRT2-a[0]/a[1])+'\n'+mutual_division(a[0],a[1]));
 */
CeL.math.continued_fraction=function(sequence, max_no){
	///	<summary>取得連分數序列的數值</summary>
	///	<param name="sequence" type="Array" optional="false">序列</param>
	///	<param name="max_no" type="Number" optional="true">取至第 max_no 個</param>
	///	<requires>mutual_division.done</requires>
	///	<returns/>
	///	<see>
	///	var a=continued_fraction([1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]);
	///	alert(a+'\n'+a[0]/a[1]+'\n'+Math.SQRT2+'\n'+(Math.SQRT2-a[0]/a[1])+'\n'+mutual_division(a[0],a[1]));
	///	</see>

};
/**
 * The best rational approximation. 取得值最接近之有理數 (use 連分數 continued fraction), 取近似值.
 * c.f., 調日法
 * 在分子或分母小於下一個漸進分數的分數中，其值是最接近精確值的近似值。
 * @example
 * to_rational_number(4088/783)
 * @param {Number} number	number
 * @param {Number} [rate]	比例在 rate 以上
 * @param {Number} [max_no]	最多取至序列第 max_no 個
 * 					TODO : 並小於 l: limit
 * @return	[分子, 分母, 誤差]
 * @requires	mutual_division,continued_fraction
 * @see
 * http://en.wikipedia.org/wiki/Continued_fraction#Best_to_rational_numbers
 */
CeL.math.to_rational_number=function(number, rate, max_no){
	///	<summary>
	///	The best rational approximation. 取得值最接近之有理數 (use 連分數 continued fraction), 取近似值.
	///	c.f., 調日法
	///	在分子或分母小於下一個漸進分數的分數中，其值是最接近精確值的近似值。
	///	</summary>
	///	<example>to_rational_number(4088/783)</example>
	///	<param name="number" type="Number" optional="false">number</param>
	///	<param name="rate" type="Number" optional="true">比例在 rate 以上</param>
	///	<param>
	///	{Number} [max_no]	最多取至序列第 max_no 個
	///	TODO : 並小於 l: limit
	///	</param>
	///	<returns>[分子, 分母, 誤差]</returns>
	///	<requires>mutual_division,continued_fraction</requires>
	///	<see>http://en.wikipedia.org/wiki/Continued_fraction#Best_to_rational_numbers</see>

};
/**
 * Get GCD of 2 numbers
 * @param n1	number 1
 * @param n2	number 2
 * @return	GCD of the 2 numbers
 */
CeL.math.gcd=function(n1, n2){
	///	<summary>Get GCD of 2 numbers</summary>
	///	<param name="n1" type="" optional="false">number 1</param>
	///	<param name="n2" type="" optional="false">number 2</param>
	///	<returns>GCD of the 2 numbers</returns>

};
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
CeL.math.floor_sqrt=function(number){
	///	<summary>
	///	得到平方數，相當於 Math.floor(Math.sqrt(number)).
	///	get integer square root
	///	</summary>
	///	<param name="positive" type="Number" optional="false">number</param>
	///	<returns>r, r^2 <= number < (r+1)^2</returns>
	///	<example>var p = 20374345, q = CeL.math.floor_sqrt(p = p * p - 1); CeL.log(q + '<br/>' + (q * q) + '<br/>' + p + '<br/>' + (++q * q));</example>
	///	<see>
	///	<a href="http://www.azillionmonkeys.com/qed/sqroot.html" accessdate="2010/3/11 18:37">Paul Hsieh's Square Root page</a>
	///	<a href="http://www.embeddedrelated.com/usenet/embedded/show/114789-1.php" accessdate="2010/3/11 18:34">Suitable Integer Square Root Algorithm for 32-64-Bit Integers on Inexpensive Microcontroller? | Comp.Arch.Embedded | EmbeddedRelated.com</a>
	///	</see>

};
/**
 * 取得某數的質因數，因式分解/素因子分解, factorization, get floor factor.
 * 唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The Fundamental Theorem of Arithmeric) 的數學金科玉律。
 * @param {Number} number
 * @return	{Array} [prime1,power1,prime2,power2,..]
 * @see
 * <a href="http://homepage2.nifty.com/m_kamada/math/10001.htm" accessdate="2010/3/11 18:7">Factorizations of 100...001</a>
 * @requires	floor_sqrt
 */
CeL.math.factorization=function(number){
	///	<summary>
	///	取得某數的質因數，因式分解/素因子分解, factorization, get floor factor.
	///	唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The Fundamental Theorem of Arithmeric) 的數學金科玉律。
	///	</summary>
	///	<param name="number" type="Number" optional="false"/>
	///	<returns type="Array">[prime1,power1,prime2,power2,..]</returns>
	///	<see><a href="http://homepage2.nifty.com/m_kamada/math/10001.htm" accessdate="2010/3/11 18:7">Factorizations of 100...001</a></see>
	///	<requires>floor_sqrt</requires>

};
/**
 * VBScript has a Hex() function but JScript does not.
 * @param {Number} number
 * @return	{String} number in hex
 * @example
 * alert('0x'+CeL.hex(16725))
 */
CeL.math.hex=function(number){
	///	<summary>VBScript has a Hex() function but JScript does not.</summary>
	///	<param name="number" type="Number" optional="false"/>
	///	<returns type="String">number in hex</returns>
	///	<example>alert('0x'+CeL.hex(16725))</example>

};
/**
 * 補數計算。
 * 正數的補數即為自身。若要求得互補之後的數字，請設成負數。
 * @param {Number} number
 * @return	{Number} base	1: 1's Complement, 2: 2's Complement, (TODO: 3, 4, ..)
 * @example
 * alert(complement())
 * @see
 * http://www.tomzap.com/notes/DigitalSystemsEngEE316/1sAnd2sComplement.pdf
 * http://en.wikipedia.org/wiki/Method_of_complements
 * http://en.wikipedia.org/wiki/Signed_number_representations
 * @since	2010/3/12 23:47:52
 */
CeL.math.complement=function(){
	///	<summary>
	///	補數計算。
	///	正數的補數即為自身。若要求得互補之後的數字，請設成負數。
	///	</summary>
	///	<param name="number" type="Number" optional="false"/>
	///	<returns type="Number">base	1: 1's Complement, 2: 2's Complement, (TODO: 3, 4, ..)</returns>
	///	<example>alert(complement())</example>
	///	<see>
	///	http://www.tomzap.com/notes/DigitalSystemsEngEE316/1sAnd2sComplement.pdf
	///	http://en.wikipedia.org/wiki/Method_of_complements
	///	http://en.wikipedia.org/wiki/Signed_number_representations
	///	</see>
	///	<since>2010/3/12 23:47:52</since>

};
/**
 * Hamming code
 * @class	Hamming Code 的 constructor
 * @constructor
 */
CeL.math.Hamming=function(){
	///	<summary>Hamming code</summary>
	///	<class>Hamming Code 的 constructor</class>

};
/**
 * 是否左右顛倒。
 * default: data[1,2,..] 左至右, reverse: data[..,2,1] 右至左
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.reverse=false;
/**
 * encode data to Hamming Code.
 * @param data	data stream
 * @param no_reverse	forced NO reverse
 * @return	{String} encoded Hamming Code
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.encode=function(data, no_reverse){
	///	<summary>encode data to Hamming Code.</summary>
	///	<param name="data" type="" optional="false">data stream</param>
	///	<param name="no_reverse" type="" optional="false">forced NO reverse</param>
	///	<returns type="String">encoded Hamming Code</returns>
	///	<memberOf>CeL.math.Hamming</memberOf>

};
/**
 * 將 Hamming Code 分成 data & check bits
 * @param code	Hamming Code to split
 * @return	[資料位元 data bits, 檢查位元 check bits (parity bits)]
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.split_code=function(code){
	///	<summary>將 Hamming Code 分成 data & check bits</summary>
	///	<param name="code" type="" optional="false">Hamming Code to split</param>
	///	<returns>[資料位元 data bits, 檢查位元 check bits (parity bits)]</returns>
	///	<memberOf>CeL.math.Hamming</memberOf>

};
/**
 * decode Hamming Code to data
 * @param code
 * @return
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.decode=function(code){
	///	<summary>decode Hamming Code to data</summary>
	///	<param name="code" type="" optional="false"/>
	///	<returns/>
	///	<memberOf>CeL.math.Hamming</memberOf>

};
/**
 * 顯示 Hamming Code 的計算方法
 * @param {Number} bit_length	bit length. e.g., 8, 16.
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.show=function(bit_length){
	///	<summary>顯示 Hamming Code 的計算方法</summary>
	///	<param name="bit_length" type="Number" optional="false">bit length. e.g., 8, 16.</param>
	///	<memberOf>CeL.math.Hamming</memberOf>

};
/**
 * null module constructor
 * @class 數學多項式相關之 function。
 * @constructor
 */
CeL.math.polynomial=function (){
	///	<summary>null module constructor</summary>
	///	<class>數學多項式相關之 function。</class>

};
/**
 * 有理數 rational number，有理\u25968全体\u12398\u12388\u12367\u12427集合\u12399\u12375\u12400\u12375\u12400、商\u12434意味\u12377\u12427 quotient \u12398頭文字\u12434\u12392\u12426、太字\u12398 Q \u12391表\u12377。<br/>
 * 若要輸入不同基底的數值，請用 parse_base()
 * @param	numerator	分子
 * @param	denominator	分母
 * @param {Boolean} approximate	取近似值
 * @example
 * CeL.log((new CeL.quotient(3,4)).count('*',new CeL.quotient(2,7)).reduce().to_print_mode());
 * @class	quotient 的 functions
 * @constructor
 */
CeL.math.quotient=function(numerator, denominator, approximate){
	///	<summary>
	///	有理數 rational number，有理\u25968全体\u12398\u12388\u12367\u12427集合\u12399\u12375\u12400\u12375\u12400、商\u12434意味\u12377\u12427 quotient \u12398頭文字\u12434\u12392\u12426、太字\u12398 Q \u12391表\u12377。<br/>
	///	若要輸入不同基底的數值，請用 parse_base()
	///	</summary>
	///	<param name="numerator" type="" optional="false">分子</param>
	///	<param name="denominator" type="" optional="false">分母</param>
	///	<param name="approximate" type="Boolean" optional="false">取近似值</param>
	///	<example>CeL.log((new CeL.quotient(3,4)).count('*',new CeL.quotient(2,7)).reduce().to_print_mode());</example>
	///	<class>quotient 的 functions</class>

};
/**
 * 循環節分隔符號：整數.小數__repetend_separator__循環節
 * @memberOf	CeL.math.quotient
 */
CeL.math.quotient.repetend_separator="";	//	'_';//' '
/**
 * 數字集
 * @memberOf	CeL.math.quotient
 * @see
 * <a href="http://en.wikipedia.org/wiki/Numerical_digit" accessdate="2010/4/16 20:47">Numerical digit</a>
 */
CeL.math.quotient.digit_char="";	//	'0123456789abcdefghijklmnopqrstuvwxyz';//.split('')
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
 * if(!q)
 * 	alert('bad input!');
 * else
 * 	library_namespace.debug('<br/>'+q.base(8)+','+q.base()+' , '+q.to_print_mode()+','+q.print(1)+','+q.to_print_mode(2)+','+q.to_print_mode(3,0,'',5));
 */
CeL.math.quotient.parse_base=function(number, base, digit_char){
	///	<summary>轉換指定進位的數字成為 quotient 物件</summary>
	///	<since>2004/7/9 16:13</since>
	///	<param name="number" type="" optional="false">數字</param>
	///	<param name="base" type="" optional="false">基底</param>
	///	<param name="digit_char" type="" optional="false">循環小數 digit 字集</param>
	///	<returns>回傳 quotient 物件，請用 quotient.to_base() 傳回所欲之 base</returns>
	///	<memberOf>CeL.math.quotient</memberOf>
	///	<example>
	///	var q=parse_base('10000.'+_.repetend_separator+'3',11);
	///	if(!q)
	///	alert('bad input!');
	///	else
	///	library_namespace.debug('<br/>'+q.base(8)+','+q.base()+' , '+q.to_print_mode()+','+q.print(1)+','+q.to_print_mode(2)+','+q.to_print_mode(3,0,'',5));
	///	</example>

};
/**
 * null module constructor
 * @class	native objects 的 functions
 */
CeL.native=function(){
	///	<summary>null module constructor</summary>
	///	<class>native objects 的 functions</class>

};
/**
 * 顯示格式化日期 string
 * @param date_value	要轉換的 date, 值過小時當作時間, <0 轉成當下時間
 * @param {Number} mode	要轉換的 mode
 * @param {Boolean} zero_fill	對 0-9 是否補零
 * @param {String} date_separator	date separator
 * @param {String} time_separator	time separator
 * @return	{String}	格式化後的日期
 * @example
 * alert(format_date());
 * @since	2003/10/18 1:04 修正
 * @since	2010/4/16 10:37:30	重構(refactoring)
 * @requires setTool,to_fixed
 * @see
 * http://www.merlyn.demon.co.uk/js-dates.htm,
 * http://aa.usno.navy.mil/data/docs/JulianDate.html
 * @memberOf	CeL.native
 */
CeL.native.format_date=function format_date(date_value, mode, zero_fill, date_separator, time_separator){
	///	<summary>顯示格式化日期 string</summary>
	///	<param name="date_value" type="" optional="false">要轉換的 date, 值過小時當作時間, <0 轉成當下時間</param>
	///	<param name="mode" type="Number" optional="false">要轉換的 mode</param>
	///	<param name="zero_fill" type="Boolean" optional="false">對 0-9 是否補零</param>
	///	<param name="date_separator" type="String" optional="false">date separator</param>
	///	<param name="time_separator" type="String" optional="false">time separator</param>
	///	<returns type="String">格式化後的日期</returns>
	///	<example>alert(format_date());</example>
	///	<since>2003/10/18 1:04 修正</since>
	///	<since>2010/4/16 10:37:30	重構(refactoring)</since>
	///	<requires>setTool,to_fixed</requires>
	///	<see>
	///	http://www.merlyn.demon.co.uk/js-dates.htm,
	///	http://aa.usno.navy.mil/data/docs/JulianDate.html
	///	</see>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * 函數的文字解譯/取得函數的語法
 * @param {Function|String} function_name	function name or function structure
 * @param flag	=1: reduce
 * @return
 * @example
 * parsed_data = new parse_function(function_name);
 * @see
 * http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
 * Syntax error: http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
 * @memberOf	CeL.native
 * @since	2010/5/16 23:04:54
 */
CeL.native.parse_function=function parse_function(function_name, flag){
	///	<summary>函數的文字解譯/取得函數的語法</summary>
	///	<param name="function_name" type="Function|String" optional="false">function name or function structure</param>
	///	<param name="flag" type="" optional="false">=1: reduce</param>
	///	<returns/>
	///	<example>parsed_data = new parse_function(function_name);</example>
	///	<see>
	///	http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
	///	Syntax error: http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
	///	</see>
	///	<memberOf>CeL.native</memberOf>
	///	<since>2010/5/16 23:04:54</since>

};
/**
 * 對付有時 charCodeAt 會傳回 >256 的數值。
 * 若確定編碼是 ASCII (char code 是 0~255) 即可使用此函數替代 charCodeAt。
 * @param text	string
 * @param position	at what position
 * @return
 * @since	2008/8/2 10:10:49
 * @see
 * http://www.alanwood.net/demos/charsetdiffs.html
 * @memberOf	CeL.native
 */
CeL.native.toASCIIcode=function (text, position){
	///	<summary>
	///	對付有時 charCodeAt 會傳回 >256 的數值。
	///	若確定編碼是 ASCII (char code 是 0~255) 即可使用此函數替代 charCodeAt。
	///	</summary>
	///	<param name="text" type="" optional="false">string</param>
	///	<param name="position" type="" optional="false">at what position</param>
	///	<returns/>
	///	<since>2008/8/2 10:10:49</since>
	///	<see>http://www.alanwood.net/demos/charsetdiffs.html</see>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * String pattern (e.g., "/a+/g") to RegExp pattern.
 * qq// in perl.
 * String.prototype.toRegExp = function(f) { return to_RegExp_pattern(this.valueOf(), f); };
 * @param {String} pattern	pattern text
 * @param {Boolean|String} [RegExp_flag]	flags when need to return RegExp object
 * @param {RegExp} [escape_pattern]	char pattern need to escape
 * @return	{RegExp} RegExp object
 */
CeL.native.to_RegExp_pattern=function(pattern, RegExp_flag, escape_pattern){
	///	<summary>
	///	String pattern (e.g., "/a+/g") to RegExp pattern.
	///	qq// in perl.
	///	String.prototype.toRegExp = function(f) { return to_RegExp_pattern(this.valueOf(), f); };
	///	</summary>
	///	<param name="pattern" type="String" optional="false">pattern text</param>
	///	<param name="RegExp_flag" type="Boolean|String" optional="true">flags when need to return RegExp object</param>
	///	<param name="escape_pattern" type="RegExp" optional="true">char pattern need to escape</param>
	///	<returns type="RegExp">RegExp object</returns>

};
/**
 * 重新設定 RegExp object 之 flag
 * @param {RegExp} regexp	RegExp object to set
 * @param {String} flag	flag of RegExp
 * @return	{RegExp}
 * @example
 * 附帶 'g' flag 的 RegExp 對相同字串作 .test() 時，第二次並不會重設。因此像下面的 expression 兩次並不會得到相同結果。
 * var r=/,/g,t='a,b';
 * WScript.Echo(r.test(t)+','+r.test(t));
 * 
 * //	改成這樣就可以了：
 * var r=/,/g,t='a,b',s=renew_RegExp_flag(r,'-g');
 * WScript.Echo(s.test(t)+','+s.test(t));
 * 
 * //	這倒沒問題：
 * r=/,/g,a='a,b';
 * if(r.test(a))alert(a.replace(r,'_'));
 * 
 * //	delete r.lastIndex; 無效，得用 r.lastIndex=0; 因此下面的亦可：
 * if(r.global)r.lastIndex=0;
 * if(r.test(a)){~}
 * 
 * @see
 * http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx,
 * 如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test 會略過 lastIndex 值，並從字串之首開始搜尋。
 * http://www.aptana.com/reference/html/api/RegExp.html
 * @memberOf	CeL.native
 */
CeL.native.renew_RegExp_flag=function(regexp, flag){
	///	<summary>重新設定 RegExp object 之 flag</summary>
	///	<param name="regexp" type="RegExp" optional="false">RegExp object to set</param>
	///	<param name="flag" type="String" optional="false">flag of RegExp</param>
	///	<returns type="RegExp"/>
	///	<example>
	///	附帶 'g' flag 的 RegExp 對相同字串作 .test() 時，第二次並不會重設。因此像下面的 expression 兩次並不會得到相同結果。
	///	var r=/,/g,t='a,b';
	///	WScript.Echo(r.test(t)+','+r.test(t));
	///	*
	///	//	改成這樣就可以了：
	///	var r=/,/g,t='a,b',s=renew_RegExp_flag(r,'-g');
	///	WScript.Echo(s.test(t)+','+s.test(t));
	///	*
	///	//	這倒沒問題：
	///	r=/,/g,a='a,b';
	///	if(r.test(a))alert(a.replace(r,'_'));
	///	*
	///	//	delete r.lastIndex; 無效，得用 r.lastIndex=0; 因此下面的亦可：
	///	if(r.global)r.lastIndex=0;
	///	if(r.test(a)){~}
	///	*
	///	</example>
	///	<see>
	///	http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx,
	///	如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test 會略過 lastIndex 值，並從字串之首開始搜尋。
	///	http://www.aptana.com/reference/html/api/RegExp.html
	///	</see>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * 取至小數 d 位，
 * 肇因： JScript即使在做加減運算時，有時還是會出現 1.4000000000000001、0.0999999999999998 等數值。此函數可取至 1.4 與 0.1。
 * c.f., round()
 * @param {Number} digits	1,2,..: number of decimal places shown
 * @param {Number} [max]	max digits	max===0:round() else floor()
 * @return
 * @see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 * IEEE754\u12398丸\u12417演算\u12399最\u12418報告\u12373\u12428\u12427ES3「\u12496\u12464」\u12391\u12354\u12427。
 * http://www.jibbering.com/faq/#FAQ4_6
 * http://en.wikipedia.org/wiki/Rounding
 * @example
 * {var d=new Date,v=0.09999998,i=0,a;for(;i<100000;i++)a=v.to_fixed(2);alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));}
 * @memberOf	CeL.native
 */
CeL.native.to_fixed=function(digits, max){
	///	<summary>
	///	取至小數 d 位，
	///	肇因： JScript即使在做加減運算時，有時還是會出現 1.4000000000000001、0.0999999999999998 等數值。此函數可取至 1.4 與 0.1。
	///	c.f., round()
	///	</summary>
	///	<param name="digits" type="Number" optional="false">1,2,..: number of decimal places shown</param>
	///	<param name="max" type="Number" optional="true">max digits	max===0:round() else floor()</param>
	///	<returns/>
	///	<see>
	///	https://bugzilla.mozilla.org/show_bug.cgi?id=5856
	///	IEEE754\u12398丸\u12417演算\u12399最\u12418報告\u12373\u12428\u12427ES3「\u12496\u12464」\u12391\u12354\u12427。
	///	http://www.jibbering.com/faq/#FAQ4_6
	///	http://en.wikipedia.org/wiki/Rounding
	///	</see>
	///	<example>{var d=new Date,v=0.09999998,i=0,a;for(;i<100000;i++)a=v.to_fixed(2);alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));}</example>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * check input string send to SQL server
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 * @memberOf	CeL.native
 */
CeL.native.checkSQLInput=function (string){
	///	<summary>check input string send to SQL server</summary>
	///	<param name="string" type="String" optional="false">input string</param>
	///	<returns type="String">轉換過的 string</returns>
	///	<since>2006/10/27 16:36</since>
	///	<see>from lib/perl/BaseF.pm (or program/database/BaseF.pm)</see>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * check input string send to SQL server 並去掉前後 space
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 * function strip() @ Prototype JavaScript framework
 * @memberOf	CeL.native
 */
CeL.native.checkSQLInput_noSpace=function(string){
	///	<summary>check input string send to SQL server 並去掉前後 space</summary>
	///	<param name="string" type="String" optional="false">input string</param>
	///	<returns type="String">轉換過的 string</returns>
	///	<since>2006/10/27 16:36</since>
	///	<see>
	///	from lib/perl/BaseF.pm (or program/database/BaseF.pm)
	///	function strip() @ Prototype JavaScript framework
	///	</see>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * 轉換字串成數值，包括分數等。分數亦將轉為分數。
 * @param {String} number	欲轉換之值
 * @return
 * @memberOf	CeL.native
 */
CeL.native.parse_number=function(number){
	///	<summary>轉換字串成數值，包括分數等。分數亦將轉為分數。</summary>
	///	<param name="number" type="String" optional="false">欲轉換之值</param>
	///	<returns/>
	///	<memberOf>CeL.native</memberOf>

};
/**
 * null module constructor
 * @class	net 的 functions
 */
CeL.net=function(){
	///	<summary>null module constructor</summary>
	///	<class>net 的 functions</class>

};
/**
 * null module constructor
 * @class	web Ajax 的 functions
 */
CeL.net.Ajax=function(){
	///	<summary>null module constructor</summary>
	///	<class>web Ajax 的 functions</class>

};
/**
 * null module constructor
 * @class	web HTA 的 functions
 */
CeL.net.HTA=function(){
	///	<summary>null module constructor</summary>
	///	<class>web HTA 的 functions</class>

};
/**
 * null module constructor
 * @class	map 的 functions
 */
CeL.net.map=function(){
	///	<summary>null module constructor</summary>
	///	<class>map 的 functions</class>

};
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
CeL.net.SVG=function(_width, _height, _backgroundColor){
	///	<summary>
	///	module SVG 物件之 constructor。<br/>
	///	設定 SVG document fragment 並將之插入網頁中。
	///	</summary>
	///	<class>
	///	generation of Scalable Vector Graphics<br/>
	///	輔助繪圖的基本功能物件，生成 SVG 操作函數。
	///	</class>
	///	<since>2006/12/7,10-12</since>
	///	<deprecated>
	///	Use toolkit listed below instead:<br/>
	///	<a href="http://code.google.com/p/svgweb/" accessdate="2009/11/15 16:34" title="svgweb - Project Hosting on Google Code">svgweb</a><br/>
	///	<a href="https://launchpad.net/scour" accessdate="2009/11/15 16:35" title="Scour - Cleaning SVG Files in Launchpad">Scour</a>
	///	</deprecated>
	///	<param name="_width" type="int" optional="false">width of the canvas</param>
	///	<param name="_height" type="int" optional="false">height of the canvas</param>
	///	<param name="_backgroundColor" type="colorstring" optional="true">background color of the canvas (UNDO)</param>
	///	<requires>set_attribute,XML_node,remove_all_child//removeNode</requires>
	///	<returns type="CeL.net.SVG">CeL.net.SVG object created</returns>
	///	<see>
	///	<a href="http://www.w3.org/TR/SVG/" accessdate="2009/11/15 16:31">Scalable Vector Graphics (SVG) 1.1 Specification</a><br/>
	///	<a href="http://zvon.org/xxl/svgReference/Output/" accessdate="2009/11/15 16:31">SVG 1.1 reference with examples</a><br/>
	///	<a href="http://www.permadi.com/tutorial/jsFunc/index.html" accessdate="2009/11/15 16:31" title="Introduction and Features of JavaScript &quot;Function&quot; Objects">Introduction and Features of JavaScript &quot;Function&quot; Objects</a><br/>
	///	<a href="http://volity.org/wiki/index.cgi?SVG_Script_Tricks" accessdate="2009/11/15 16:31">Volity Wiki: SVG Script Tricks</a><br/>
	///	<a href="http://pilat.free.fr/english/routines/js_dom.htm" accessdate="2009/11/15 16:31">Javascript SVG et DOM</a>
	///	</see>

};

 /**
  * SVG document fragment
  * @property
  * @see	<a href="http://www.w3.org/TR/SVG/struct.html#NewDocument" accessdate="2009/11/15 16:53">Defining an SVG document fragment: the 'svg' element</a>
  */
//CeL.net.SVG.prototype.svg;//_s=	//	raw
 /**
  * 包含了插入元件的原始資訊。<br/>
  * Use {@link #addContain} to add contains.
  * @property
  * @type	Array
  */
CeL.net.SVG.prototype.contains=[];
 /**
  * 所插入之網頁元素
  * @property
  */
//CeL.net.SVG.prototype.div;//null;
/**
 * default stroke width. 單位: px
 * 
 * @unit px
 * @type Number
 * @memberOf CeL.net.SVG
 */
CeL.net.SVG.defaultStrokeWidth=0;	//	.5;	
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
CeL.net.SVG.changeText=function(text_node, text){
	///	<summary>改變 text</summary>
	///	<param name="text_node" type="" optional="false">text object</param>
	///	<param name="text" type="" optional="false">change to this text</param>
	///	<returns/>
	///	<memberOf>CeL.net.SVG</memberOf>
	///	<see>
	///	<a href="http://www.w3.org/TR/SVG/text.html" accessdate="2009/12/15 0:2">Text - SVG 1.1 - 20030114</a>
	///	<tref xlink:href="#ReferencedText"/>
	///	</see>

};
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
CeL.net.SVG.draw_circle=function(_r, svgO, _color, _fill){
	///	<summary>繪製圓形。</summary>
	///	<since>2006/12/19 18:05</since>
	///	<param name="_r" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_fill" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_ellipse=function(_rx, _ry, svgO, _color, _fill){
	///	<summary>繪製橢圓。</summary>
	///	<param name="_rx" type="" optional="false"/>
	///	<param name="_ry" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_fill" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_quadrilateral=function(_ds, _h, _d, _us, svgO, _color, _fill){
	///	<summary>畫簡單梯形。</summary>
	///	<since>2006/12/17 12:38</since>
	///	<requires>split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_quadrilateral</requires>
	///	<param name="_ds" type="" optional="false"/>
	///	<param name="_h" type="" optional="false"/>
	///	<param name="_d" type="" optional="false"/>
	///	<param name="_us" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_fill" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_triangle=function(_ds, _h, _d, svgO, _color, _fill){
	///	<summary>畫簡單三角形。</summary>
	///	<since>2006/12/17 12:38</since>
	///	<requires>split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_triangle</requires>
	///	<param name="_ds" type="" optional="false"/>
	///	<param name="_h" type="" optional="false"/>
	///	<param name="_d" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_fill" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_addition=function(num1, num2, svgO, _color, _font){
	///	<summary>利用 module SVG 物件來演示直式加法。</summary>
	///	<since>2006/12/26 17:47</since>
	///	<param name="num1" type="" optional="false"/>
	///	<param name="num2" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_font" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_subtraction=function(num1, num2, svgO, _color, _font){
	///	<summary>呼叫 draw_subtraction 來演示直式減法。因為直式加減法的運算與機制過程非常相似，因此我們以 draw_addition 來一併的處理這兩個相似的運算過程。</summary>
	///	<since>2006/12/26 17:47</since>
	///	<param name="num1" type="" optional="false"/>
	///	<param name="num2" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_font" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>

};
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
CeL.net.SVG.draw_multiplication=function(num1, num2, svgO, _color, _font){
	///	<summary>
	///	利用 module SVG 物件來演示直式乘法。<br/>
	///	TODO: 小數的乘法
	///	</summary>
	///	<since>2006/12/26 17:47</since>
	///	<param name="num1" type="" optional="false"/>
	///	<param name="num2" type="" optional="false"/>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_font" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<memberOf>CeL.net.SVG</memberOf>
	///	<see><a href="http://203.71.239.19/math/courses/cs04/M4_6.php" accessdate="2010/1/20 18:5">小數篇：小數的乘法</a></see>

};
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
CeL.net.SVG.draw_long_division=function(dividend, divisor, svgO, _color, _font){
	///	<summary>
	///	利用 module SVG 物件來展示<a href="http://en.wikipedia.org/wiki/Long_division" title="long division">直式除法</a>。<br/>
	///	!! 尚有許多 bug<br/>
	///	</summary>
	///	<since>2006/12/11-12 11:36</since>
	///	<param name="dividend" type="" optional="false"/>
	///	<param name="divisor" type="" optional="false"/>
	///	<param name="digits_after" type="" optional="false">TODO: 小數直式除法: 小數點後位數, how many digits after the decimal separator</param>
	///	<param name="svgO" type="" optional="false"/>
	///	<param name="_color" type="" optional="false"/>
	///	<param name="_font" type="" optional="false"/>
	///	<returns>module SVG object</returns>
	///	<example>
	///	// include module
	///	CeL.use('net.SVG');
	///	*
	///	//	way 1
	///	var SVG_object = new CeL.SVG;
	///	SVG_object.attach('panel_for_SVG').show(1);
	///	CeL.draw_long_division(452, 34, SVG_object);
	///	// You can also put here.
	///	//SVG_object.attach('panel_for_SVG').show(1);
	///	*
	///	//	way 2
	///	var SVG_object = CeL.draw_long_division(100000, 7);
	///	SVG_object.attach('panel_for_SVG').show(1);
	///	*
	///	// 另一次顯示
	///	CeL.draw_long_division(100, 7, SVG_object);
	///	</example>
	///	<memberOf>CeL.net.SVG</memberOf>

};
/**
 * null module constructor
 * @class	web 的 functions
 */
CeL.net.web=function(){
	///	<summary>null module constructor</summary>
	///	<class>web 的 functions</class>

};
/**
 * 判斷為 HTML Element。
 * @param	value	value to test
 * @return	{Boolean}	value is HTML Element
 * @since	2010/6/23 02:32:41
 * @memberOf	CeL.net.web
 * @see
 * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
 * http://www.w3.org/DOM/
 */
CeL.net.web.is_HTML_element=function(value){
	///	<summary>判斷為 HTML Element。</summary>
	///	<param name="value" type="" optional="false">value to test</param>
	///	<returns type="Boolean">value is HTML Element</returns>
	///	<since>2010/6/23 02:32:41</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>
	///	http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
	///	http://www.w3.org/DOM/
	///	</see>

};
/**
 * 判斷為指定 nodeType 之 HTML Element。
 * @param	value	value to test
 * @param	type	type
 * @return	{Boolean}	value is the type of HTML Element
 * @since	2010/6/23 02:32:41
 * @memberOf	CeL.net.web
 * @see
 * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
 * http://www.w3.org/DOM/
 */
CeL.net.web.is_HTML_element_type=function(value, type){
	///	<summary>判斷為指定 nodeType 之 HTML Element。</summary>
	///	<param name="value" type="" optional="false">value to test</param>
	///	<param name="type" type="" optional="false">type</param>
	///	<returns type="Boolean">value is the type of HTML Element</returns>
	///	<since>2010/6/23 02:32:41</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>
	///	http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
	///	http://www.w3.org/DOM/
	///	</see>

};
/**
 * 判斷為 HTML Element。
 * @param	value	value to test
 * @return	{Boolean}	value is HTML Element
 * @since	2010/6/23 02:32:41
 * @memberOf	CeL.net.web
 * @see
 * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
 * http://www.w3.org/DOM/
 */
CeL.net.web.is_element_node=function(value){
	///	<summary>判斷為 HTML Element。</summary>
	///	<param name="value" type="" optional="false">value to test</param>
	///	<returns type="Boolean">value is HTML Element</returns>
	///	<since>2010/6/23 02:32:41</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>
	///	http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-58190037,
	///	http://www.w3.org/DOM/
	///	</see>

};
/**
 * trigger/swap display and visibility.
 * display:none or visibility:hidden.
 * TODO: computed style
 * @param element	HTML element
 * @param {String|Number} type	show or hidden or set the status type:
 * 			{Number}: 0: hidden(→none), 1: show(→block), 2||undefined: switch, others: get status only with no change
 * 			{String}: set CSS: display type: none, '', block, inline, list-item. 其他恐造成 error?
 * @return	display status
 * @since	2010/4/1 10:24:43 rewrite
 * @see
 * http://www.w3schools.com/CSS/pr_class_visibility.asp
 * http://www.w3schools.com/css/pr_class_display.asp
 * http://www.javaeye.com/topic/140784
 * 	通過element.style對象只能取得內聯的樣式，也就是說只能取得html標籤裡寫的屬性。 
 * @requires	[_.get_element],[_.get_style]
 * @memberOf	CeL.net.web
 */
CeL.net.web.trigger_display=function(element, type){
	///	<summary>
	///	trigger/swap display and visibility.
	///	display:none or visibility:hidden.
	///	TODO: computed style
	///	</summary>
	///	<param name="element" type="" optional="false">HTML element</param>
	///	<param>
	///	{String|Number} type	show or hidden or set the status type:
	///	{Number}: 0: hidden(→none), 1: show(→block), 2||undefined: switch, others: get status only with no change
	///	{String}: set CSS: display type: none, '', block, inline, list-item. 其他恐造成 error?
	///	</param>
	///	<returns>display status</returns>
	///	<since>2010/4/1 10:24:43 rewrite</since>
	///	<see>
	///	http://www.w3schools.com/CSS/pr_class_visibility.asp
	///	http://www.w3schools.com/css/pr_class_display.asp
	///	http://www.javaeye.com/topic/140784
	///	通過element.style對象只能取得內聯的樣式，也就是說只能取得html標籤裡寫的屬性。
	///	</see>
	///	<requires>[_.get_element],[_.get_style]</requires>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * replace HTML
 * @param o
 * @param html
 * @return
 * @memberOf	CeL.net.web
 */
CeL.net.web.replace_HTML=function(o, html){
	///	<summary>replace HTML</summary>
	///	<param name="o" type="" optional="false"/>
	///	<param name="html" type="" optional="false"/>
	///	<returns/>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * 移除 node.
 * TODO:
 * also remove event handlers
 * @param o
 * @param tag	tag===1: only child, undefined: remove only self, others: only <tag> child
 * @return
 * @memberOf	CeL.net.web
 */
CeL.net.web.remove_node=function remove_node(o, tag){
	///	<summary>
	///	移除 node.
	///	TODO:
	///	also remove event handlers
	///	</summary>
	///	<param name="o" type="" optional="false"/>
	///	<param name="tag" type="" optional="false">tag===1: only child, undefined: remove only self, others: only <tag> child</param>
	///	<returns/>
	///	<memberOf>CeL.net.web</memberOf>

};
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
CeL.net.web.set_attribute=function(_e, propertyO, ns){
	///	<summary>
	///	set/get/remove attribute of a element<br/>
	///	in IE: setAttribute does not work when used with the style attribute (or with event handlers, for that matter).
	///	</summary>
	///	<param name="_e" type="" optional="false">element</param>
	///	<param name="propertyO" type="" optional="false">attributes object (array if you just want to get)</param>
	///	<returns/>
	///	<requires>split_String_to_Object</requires>
	///	<see>
	///	setAttribute,getAttribute,removeAttribute
	///	http://www.quirksmode.org/blog/archives/2006/04/ie_7_and_javasc.html
	///	</see>
	///	<since>2006/12/10 21:25 分離 separate from XML_node()</since>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * append children node to specified element
 * @param node	node / node id
 * @param child_list	children node array
 * @return
 * @since	2007/1/20 14:12
 * @memberOf	CeL.net.web
 */
CeL.net.web.add_node=function add_node(node, child_list){
	///	<summary>append children node to specified element</summary>
	///	<param name="node" type="" optional="false">node / node id</param>
	///	<param name="child_list" type="" optional="false">children node array</param>
	///	<returns/>
	///	<since>2007/1/20 14:12</since>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * instead of createNode().
 * TODO: 分割功能(set_attrib, add_child, ..), 簡化
 * @param nodes	node structure
 * @param layer	where to layer this node. e.g., parent node
 * @return
 * @since	2010/6/21 13:45:02
 */
CeL.net.web.new_node=function(nodes, layer){
	///	<summary>
	///	instead of createNode().
	///	TODO: 分割功能(set_attrib, add_child, ..), 簡化
	///	</summary>
	///	<param name="nodes" type="" optional="false">node structure</param>
	///	<param name="layer" type="" optional="false">where to layer this node. e.g., parent node</param>
	///	<returns/>
	///	<since>2010/6/21 13:45:02</since>

};
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
CeL.net.web.XML_node=function(tag, propertyO, insertBeforeO, innerObj, styleO){
	///	<summary>create new HTML/XML <a href="https://developer.mozilla.org/en/DOM/node">node</a>(<a href="https://developer.mozilla.org/en/DOM/element">element</a>)</summary>
	///	<param name="tag" type="" optional="false">tag name</param>
	///	<param name="propertyO" type="" optional="false">attributes object</param>
	///	<param name="insertBeforeO" type="" optional="false">object that we wnat to insert before it</param>
	///	<param name="innerObj" type="" optional="false">inner object(s)</param>
	///	<param name="styleO" type="" optional="false">style object</param>
	///	<returns>node object created</returns>
	///	<requires>set_attribute,add_node</requires>
	///	<since>2006/9/6 20:29,11/12 22:13</since>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * 設定 HTML element 的 text。
 * 對付IE與Moz不同的text取得方法。現階段不應用innerText，應該用此函數來取得或設定內部text。
 * TODO: DOM: 用.nodeValue
 * @param element	HTML element
 * @param {String} text	the text to be set
 * @return
 * @see
 * http://www.klstudio.com/post/94.html
 * @memberOf	CeL.net.web
 */
CeL.net.web.set_text=function (element, text){
	///	<summary>
	///	設定 HTML element 的 text。
	///	對付IE與Moz不同的text取得方法。現階段不應用innerText，應該用此函數來取得或設定內部text。
	///	TODO: DOM: 用.nodeValue
	///	</summary>
	///	<param name="element" type="" optional="false">HTML element</param>
	///	<param name="text" type="String" optional="false">the text to be set</param>
	///	<returns/>
	///	<see>http://www.klstudio.com/post/94.html</see>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * fill data to table.
 * 增加 table 的列(row)
 * @param {Array|Object} data	data list
 * @param table	table element
 * @param {Array} header	header list
 * @return
 * @example
 * table_list([list1],[list2],..)
 * e.g.,	table_list([1,2,3,4],[4,5,3,4]);
 * table_list([[list1],[list2],..])
 * e.g.,	table_list( [ [1,2,3,4],[4,5,3,4] ] );
 * @since	2010/05/03 14:13:18
 * @memberOf	CeL.net.web
 * @see
 * http://www.datatables.net/
 */
CeL.net.web.table_list=function(data, table, header, do_clean){
	///	<summary>
	///	fill data to table.
	///	增加 table 的列(row)
	///	</summary>
	///	<param name="data" type="Array|Object" optional="false">data list</param>
	///	<param name="table" type="" optional="false">table element</param>
	///	<param name="header" type="Array" optional="false">header list</param>
	///	<returns/>
	///	<example>
	///	table_list([list1],[list2],..)
	///	e.g.,	table_list([1,2,3,4],[4,5,3,4]);
	///	table_list([[list1],[list2],..])
	///	e.g.,	table_list( [ [1,2,3,4],[4,5,3,4] ] );
	///	</example>
	///	<since>2010/05/03 14:13:18</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>http://www.datatables.net/</see>

};
/**
 * Parses URI
 * @param {String} URI	URI to parse
 * @return	parsed object
 * @example
 * alert(parse_URI('ftp://user:cgh@dr.fxgv.sfdg:4231/3452/dgh.rar?fg=23#hhh').hostname);
 * @since	2010/4/13 23:53:14 from parseURI+parseURL
 * @memberOf	CeL.net.web
 * @see
 * RFC 1738, RFC 2396, RFC 3986,
 * Uniform Resource Identifier (URI): Generic Syntax,
 * http://tools.ietf.org/html/rfc3987,
 * http://flanders.co.nz/2009/11/08/a-good-url-regular-expression-repost/,
 * http://www.mattfarina.com/2009/01/08/rfc-3986-url-validation,
 * also see batURL.htm
 */
CeL.net.web.parse_URI=function(URI){
	///	<summary>Parses URI</summary>
	///	<param name="URI" type="String" optional="false">URI to parse</param>
	///	<returns>parsed object</returns>
	///	<example>alert(parse_URI('ftp://user:cgh@dr.fxgv.sfdg:4231/3452/dgh.rar?fg=23#hhh').hostname);</example>
	///	<since>2010/4/13 23:53:14 from parseURI+parseURL</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>
	///	RFC 1738, RFC 2396, RFC 3986,
	///	Uniform Resource Identifier (URI): Generic Syntax,
	///	http://tools.ietf.org/html/rfc3987,
	///	http://flanders.co.nz/2009/11/08/a-good-url-regular-expression-repost/,
	///	http://www.mattfarina.com/2009/01/08/rfc-3986-url-validation,
	///	also see batURL.htm
	///	</see>

};
/**
 * 簡化 document.getElementById 並配合 loadReference()
 * @since 2004/6/25 19:33
 * @param id	所欲找尋之 element id
 * @param flag
 *            {HTML Object} object: 參考此 document object
 *            {Number} flag: 參見 code
 * @return	{HTML Object} Object
 * @requires	referenceDoc,loadReferenceDone,`get_element();`
 * @memberOf	CeL.net.web
 */
CeL.net.web.get_element=function get_element(id, flag){
	///	<summary>簡化 document.getElementById 並配合 loadReference()</summary>
	///	<since>2004/6/25 19:33</since>
	///	<param name="id" type="" optional="false">所欲找尋之 element id</param>
	///	<param>
	///	flag
	///	{HTML Object} object: 參考此 document object
	///	{Number} flag: 參見 code
	///	</param>
	///	<returns type="HTMLObject">Object</returns>
	///	<requires>referenceDoc,loadReferenceDone,`get_element();`</requires>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * Sets / adds class of specified element.<br/>
 * TODO:<br/>
 * 1. 一次處理多個 className。<br/>
 * 2. 以字串處理可能較快。<br/>
 * 3. 用 +/- 設定。
 * @param element	HTML elements
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @param flag
 * default: just add the specified className
 * (flag&1)==1:	reset className (else just add)
 * (flag&2)==1:	return {className1:, className2:, ..}
 * (flag&4)==1:	remove className
 * @return
 * @see
 * <a href="http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-95362176" accessdate="2009/12/14 22:26">className of type DOMString</a>,
 * <a href="https://developer.mozilla.org/En/DOM/Element.className" accessdate="2009/12/14 22:27">element.className - MDC</a>
 * @memberOf	CeL.net.web
 */
CeL.net.web.set_class=function(element, class_name, flag){
	///	<summary>
	///	Sets / adds class of specified element.<br/>
	///	TODO:<br/>
	///	1. 一次處理多個 className。<br/>
	///	2. 以字串處理可能較快。<br/>
	///	3. 用 +/- 設定。
	///	</summary>
	///	<param name="element" type="" optional="false">HTML elements</param>
	///	<param name="class_name" type="" optional="false">class name || {class name 1:, class name 2:, ..}</param>
	///	<param>
	///	flag
	///	default: just add the specified className
	///	(flag&1)==1:	reset className (else just add)
	///	(flag&2)==1:	return {className1:, className2:, ..}
	///	(flag&4)==1:	remove className
	///	</param>
	///	<returns/>
	///	<see>
	///	<a href="http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-95362176" accessdate="2009/12/14 22:26">className of type DOMString</a>,
	///	<a href="https://developer.mozilla.org/En/DOM/Element.className" accessdate="2009/12/14 22:27">element.className - MDC</a>
	///	</see>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * If HTML element has specified class
 * 
 * @param element	HTML elements
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @return
 */
CeL.net.web.has_class=function(element, class_name){
	///	<summary>
	///	If HTML element has specified class
	///	*
	///	</summary>
	///	<param name="element" type="" optional="false">HTML elements</param>
	///	<param name="class_name" type="" optional="false">class name || {class name 1:, class name 2:, ..}</param>
	///	<returns/>

};
/**
 * 
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @param parent
 * @param tag_name	tag name
 * @return
 * @see
 * document.getElementsByClassName in prototype.js
 */
CeL.net.web.find_class=function(class_name, parent, tag_name, flag){
	///	<summary>*</summary>
	///	<param name="class_name" type="" optional="false">class name || {class name 1:, class name 2:, ..}</param>
	///	<param name="parent" type="" optional="false"/>
	///	<param name="tag_name" type="" optional="false">tag name</param>
	///	<returns/>
	///	<see>document.getElementsByClassName in prototype.js</see>

};
/**
 * get current computed style property of specified HTML element.
 * TODO: 整合 get_node_position, _.set_style
 * @param element	HTML element
 * @param name	W3C style property name (e.g., no '-webkit-background-clip')
 * @return
 * @see
 * http://en.wikipedia.org/wiki/Internet_Explorer_box_model_bug, http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K983.aspx,
 * curCss @ jQuery, http://api.jquery.com/category/css/,
 * <a href="http://www.quirksmode.org/dom/getstyles.html" accessdate="2010/4/1 15:44">JavaScript - Get Styles</a>,
 * <a href="http://www.javaeye.com/topic/140784?page=2" accessdate="2010/4/1 15:41">style.display取值不\u23545，\u38590道是\u27983\u35272器bug？\u35752\u35770第2\u39029:  - JavaScript - web - JavaEye\u35770\u22363</a>
 * 大體上， currentStyle 相當於getComputedStyle，而runtimeStyle相當於getOverrideStyle。但是它們還是有很重要的區別。那就是，IE的CSS計算步驟其實是不合標準的。
 * document.defaultView在mozilla中是指向window obj的,但是很有可能在其他broswer中就不指向window obj...因為w3c中沒有強行規定document.defaultView一定是一個global obj.
 * 
 * 返回頁內樣式表定義的類，那麼可以使用DOM樣式表對象來訪問：
 * var oCssRulers = document.styleSheets[0].cssRulers || document.styleSheets[0].rulers;
 * (前者是DOM方法，後者是IE私有方法)
 * alert(oCssRulers[0].style.display);
 * @since	2010/4/2 00:14:09	rewrite
 * @memberOf	CeL.net.web
 */
CeL.net.web.get_style=function(element, name, not_computed){
	///	<summary>
	///	get current computed style property of specified HTML element.
	///	TODO: 整合 get_node_position, _.set_style
	///	</summary>
	///	<param name="element" type="" optional="false">HTML element</param>
	///	<param name="name" type="" optional="false">W3C style property name (e.g., no '-webkit-background-clip')</param>
	///	<returns/>
	///	<see>
	///	http://en.wikipedia.org/wiki/Internet_Explorer_box_model_bug, http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K983.aspx,
	///	curCss @ jQuery, http://api.jquery.com/category/css/,
	///	<a href="http://www.quirksmode.org/dom/getstyles.html" accessdate="2010/4/1 15:44">JavaScript - Get Styles</a>,
	///	<a href="http://www.javaeye.com/topic/140784?page=2" accessdate="2010/4/1 15:41">style.display取值不\u23545，\u38590道是\u27983\u35272器bug？\u35752\u35770第2\u39029:  - JavaScript - web - JavaEye\u35770\u22363</a>
	///	大體上， currentStyle 相當於getComputedStyle，而runtimeStyle相當於getOverrideStyle。但是它們還是有很重要的區別。那就是，IE的CSS計算步驟其實是不合標準的。
	///	document.defaultView在mozilla中是指向window obj的,但是很有可能在其他broswer中就不指向window obj...因為w3c中沒有強行規定document.defaultView一定是一個global obj.
	///	*
	///	返回頁內樣式表定義的類，那麼可以使用DOM樣式表對象來訪問：
	///	var oCssRulers = document.styleSheets[0].cssRulers || document.styleSheets[0].rulers;
	///	(前者是DOM方法，後者是IE私有方法)
	///	alert(oCssRulers[0].style.display);
	///	</see>
	///	<since>2010/4/2 00:14:09	rewrite</since>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * get the actual position [left,top,width,height] of an HTML node object
 * @param obj
 * @return
 * @memberOf	CeL.net.web
 * @see
 * http://en.wikipedia.org/wiki/Internet_Explorer_box_model_bug, http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K983.aspx,
 * http://msdn.microsoft.com/library/en-us/dndude/html/dude04032000.asp,
 * http://www.mail-archive.com/mochikit@googlegroups.com/msg00584.html,
 * http://hartshorne.ca/2006/01/20/javascript_positioning/
 */
CeL.net.web.get_node_position=function(obj){
	///	<summary>get the actual position [left,top,width,height] of an HTML node object</summary>
	///	<param name="obj" type="" optional="false"/>
	///	<returns/>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>
	///	http://en.wikipedia.org/wiki/Internet_Explorer_box_model_bug, http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K983.aspx,
	///	http://msdn.microsoft.com/library/en-us/dndude/html/dude04032000.asp,
	///	http://www.mail-archive.com/mochikit@googlegroups.com/msg00584.html,
	///	http://hartshorne.ca/2006/01/20/javascript_positioning/
	///	</see>

};
/**
 * 比較好點的 add onload。
 * 比起 add_listener()，本函數在已經 load 時依然會執行，而 add_listener 因為是用榜定的方法，因此 load 完就不再觸發(?)。
 * 這東西頂多只能擺在 include 的 JS file 中，不能 runtime include。
 * @example
 * CeL.use('net.web');
 * CeL.on_load(function(){sl(1);},'sl(2);');
 * @requires	_.add_listener,_.DOM_loaded
 * @see
 * jQuery: $(document).ready(listener);
 * DOMContentLoaded	http://webdesign.piipo.com/jquery/jquery_events
 * 可直接參考 SWFObject。
 * TODO:
 * <a href="http://javascript.nwbox.com/IEContentLoaded/" accessdate="2010/6/3 11:15" title="IEContentLoaded - An alternative for DOMContentLoaded on Internet Explorer">IEContentLoaded</a>
 * DOMContentLoaded是firefox下特有的Event, 當所有DOM解析完以後會觸發這個事件。
 * DOMContentLoaded與DOM中的onLoad事件與其相近。但onload要等到所有頁面元素加載完成才會觸發, 包括頁面上的圖片等等。
 * <a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/06/05/jquery-ready-vs-load.aspx" accessdate="2010/6/3 11:17">jQuery ready vs load - 黑暗執行緒</a>
 * $(document).ready(fn)發生在"網頁本身的HTML"載入後就觸發，而$(window).load(fn)則會等到"網頁HTML 標籤中引用的圖檔、內嵌物件(如Flash)、IFrame"等拉哩拉雜的東西都載入後才會觸發。
 * @memberOf	CeL.net.web
 */
CeL.net.web.on_load=function on_load(){
	///	<summary>
	///	比較好點的 add onload。
	///	比起 add_listener()，本函數在已經 load 時依然會執行，而 add_listener 因為是用榜定的方法，因此 load 完就不再觸發(?)。
	///	這東西頂多只能擺在 include 的 JS file 中，不能 runtime include。
	///	</summary>
	///	<example>
	///	CeL.use('net.web');
	///	CeL.on_load(function(){sl(1);},'sl(2);');
	///	</example>
	///	<requires>_.add_listener,_.DOM_loaded</requires>
	///	<see>
	///	jQuery: $(document).ready(listener);
	///	DOMContentLoaded	http://webdesign.piipo.com/jquery/jquery_events
	///	可直接參考 SWFObject。
	///	TODO:
	///	<a href="http://javascript.nwbox.com/IEContentLoaded/" accessdate="2010/6/3 11:15" title="IEContentLoaded - An alternative for DOMContentLoaded on Internet Explorer">IEContentLoaded</a>
	///	DOMContentLoaded是firefox下特有的Event, 當所有DOM解析完以後會觸發這個事件。
	///	DOMContentLoaded與DOM中的onLoad事件與其相近。但onload要等到所有頁面元素加載完成才會觸發, 包括頁面上的圖片等等。
	///	<a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/06/05/jquery-ready-vs-load.aspx" accessdate="2010/6/3 11:17">jQuery ready vs load - 黑暗執行緒</a>
	///	$(document).ready(fn)發生在"網頁本身的HTML"載入後就觸發，而$(window).load(fn)則會等到"網頁HTML 標籤中引用的圖檔、內嵌物件(如Flash)、IFrame"等拉哩拉雜的東西都載入後才會觸發。
	///	</see>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * bind/add listener.
 * listener 應該加上 try{}catch{}，否則會搞不清楚哪裡出問題。
 * **	對同樣的 object，事件本身還是會依照 call add_listener() 的順序跑，不會因為 p_first 而改變。
 * **	NOT TESTED!!
 * TODO:
 * removeEventListener,
 * remove_listener(),
 * default 'this'
 * @param type	listen to what event type
 * @param listener	listener function/function array/function string,
 * 				須 String 之 recursive function 時可 "(function(){return function f(){f();};})()"
 * 			function(e){var target=e?e.target:(e=window.event).srcElement;if(e.stopPropagation)e.stopPropagation();else e.cancelBubble=true;if(e.preventDefault)e.preventDefault();else e.returnValue=false;return false;}
 * @param [document_object]	bind/attach to what document object
 * @param [p_first]	parentNode first
 * @return
 * @since	2010/1/20 23:42:51
 * @see
 * c.f., GEvent.add_listener()
 * @memberOf	CeL.net.web
 */
CeL.net.web.add_listener=function add_listener(type, listener, document_object, p_first){
	///	<summary>
	///	bind/add listener.
	///	listener 應該加上 try{}catch{}，否則會搞不清楚哪裡出問題。
	///	**	對同樣的 object，事件本身還是會依照 call add_listener() 的順序跑，不會因為 p_first 而改變。
	///	**	NOT TESTED!!
	///	TODO:
	///	removeEventListener,
	///	remove_listener(),
	///	default 'this'
	///	</summary>
	///	<param name="type" type="" optional="false">listen to what event type</param>
	///	<param>
	///	listener	listener function/function array/function string,
	///	須 String 之 recursive function 時可 "(function(){return function f(){f();};})()"
	///	function(e){var target=e?e.target:(e=window.event).srcElement;if(e.stopPropagation)e.stopPropagation();else e.cancelBubble=true;if(e.preventDefault)e.preventDefault();else e.returnValue=false;return false;}
	///	</param>
	///	<param name="document_object" type="" optional="true">bind/attach to what document object</param>
	///	<param name="p_first" type="" optional="true">parentNode first</param>
	///	<returns/>
	///	<since>2010/1/20 23:42:51</since>
	///	<see>c.f., GEvent.add_listener()</see>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * useCapture: parentNode first
 * @see
 * <a href="http://www.w3.org/TR/DOM-Level-3-Events/#event-flow" accessdate="2010/4/16 22:40">Document Object Model (DOM) Level 3 Events Specification</a>,
 * <a href="http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventTarget" accessdate="2010/4/16 22:42">Interface EventTarget</a>
 */
CeL.net.web.add_listener.p_first=false;
/**
 * get (native) global listener adding function.
 * TODO: 只設定一次
 */
CeL.net.web.add_listener.get_adder=function(){
	///	<summary>
	///	get (native) global listener adding function.
	///	TODO: 只設定一次
	///	</summary>

};
/**
 * 含括其他情況。
 * all: window.onload.
 * TODO: use queue
 * @param type	listen to what event type
 * @param listener	listener function/function array
 * @param [p_first]	parentNode first
 * @param [document_object]	bind/attach to what document object
 * @return
 * @see
 * http://blog.othree.net/log/2007/02/06/third-argument-of-addeventlistener/
 */
CeL.net.web.add_listener.default_adder=function(type, listener, p_first, document_object){
	///	<summary>
	///	含括其他情況。
	///	all: window.onload.
	///	TODO: use queue
	///	</summary>
	///	<param name="type" type="" optional="false">listen to what event type</param>
	///	<param name="listener" type="" optional="false">listener function/function array</param>
	///	<param name="p_first" type="" optional="true">parentNode first</param>
	///	<param name="document_object" type="" optional="true">bind/attach to what document object</param>
	///	<returns/>
	///	<see>http://blog.othree.net/log/2007/02/06/third-argument-of-addeventlistener/</see>

};
/**
 * TODO:
 * 觸發函數.
 * 當無法執行 DOM 操作時（尚未載入、版本太舊不提供支援等）以此為主。
 * add_listener.list[type]=[listener list]
 */
CeL.net.web.add_listener.list={};
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
CeL.net.web.deal_barcode=function(callback){
	///	<summary>條碼器(Barcode Scanner)/雷射讀碼器的輸入可用 onkeypress 取得</summary>
	///	<param name="callback" type="" optional="false">callback</param>
	///	<returns/>
	///	<since>2008/8/26 23:10</since>
	///	<example>
	///	//	usage:
	///	deal_barcode(function(t) {
	///	if (t.length > 9 && t.length < 17)
	///	document.getElementById("p").value = t,
	///	document.forms[0].submit();
	///	});
	///	</example>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * translate Unicode text to HTML
 * @param {String} text	Unicode text
 * @param mode	mode='x':&#xhhh;
 * @return {String}	HTML
 * @memberOf	CeL.net.web
 */
CeL.net.web.toHTML=function(text, mode){
	///	<summary>translate Unicode text to HTML</summary>
	///	<param name="text" type="String" optional="false">Unicode text</param>
	///	<param name="mode" type="" optional="false">mode='x':&#xhhh;</param>
	///	<returns type="String">HTML</returns>
	///	<memberOf>CeL.net.web</memberOf>

};
/**
 * Translate a query string to a native Object contains key/value pair set.
 * @param	{String} query_string	query string. default: location.search
 * @param	{Object} add_to	append to this object
 * @return	key/value pairs
 * @type	Object
 * @since	2010/6/16 15:18:50
 * @memberOf	CeL.net.web
 * @see
 */
CeL.net.web.get_query=function(query_string, add_to){
	///	<summary>Translate a query string to a native Object contains key/value pair set.</summary>
	///	<param name="query_string" type="String" optional="false">query string. default: location.search</param>
	///	<param name="add_to" type="Object" optional="false">append to this object</param>
	///	<returns type="Object">key/value pairs</returns>
	///	<since>2010/6/16 15:18:50</since>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see/>

};
/**
 * Translate a native Object contains key/value pair set to a query string.
 * TODO
 * @param	{Object} query_Object	query Object.
 * @return	{String} query string
 * @type	String
 * @memberOf	CeL.net.web
 * @see
 * jQuery.param
 */
CeL.net.web.to_query_string=function(query_Object){
	///	<summary>
	///	Translate a native Object contains key/value pair set to a query string.
	///	TODO
	///	</summary>
	///	<param name="query_Object" type="Object" optional="false">query Object.</param>
	///	<returns type="String">query string</returns>
	///	<memberOf>CeL.net.web</memberOf>
	///	<see>jQuery.param</see>

};
/**
 * 將 BIG5 日文假名碼修改為 Unicode 日文假名
 * @param {String} U	Unicode text
 * @return
 * @see
 * from Unicode 補完計畫 jrename.js
 */
CeL.net.web.Big5JPToUnicodeJP=function (U){
	///	<summary>將 BIG5 日文假名碼修改為 Unicode 日文假名</summary>
	///	<param name="U" type="String" optional="false">Unicode text</param>
	///	<returns/>
	///	<see>from Unicode 補完計畫 jrename.js</see>

};

//	null constructor for [CeL.net.form]
CeL.net.form=function(){};
CeL.net.form.prototype={};

/**
 * JavaScript 地址輸入表單支援 (address input form)，
 * 現有台灣(.TW)可用。
 * @class	form 的 functions
 */
CeL.net.form.address=function(){
	///	<summary>
	///	JavaScript 地址輸入表單支援 (address input form)，
	///	現有台灣(.TW)可用。
	///	</summary>
	///	<class>form 的 functions</class>

};
/**
 * null module constructor
 * @class	輸入 bank account 的 functions
 */
CeL.net.form.bank_account=function(){
	///	<summary>null module constructor</summary>
	///	<class>輸入 bank account 的 functions</class>

};
/**
 * null module constructor
 * @class	輸入教育程度的 functions
 * @example
 * var education_form = new CeL.education.TW('education');
 */
CeL.net.form.education=function(){
	///	<summary>null module constructor</summary>
	///	<class>輸入教育程度的 functions</class>
	///	<example>var education_form = new CeL.education.TW('education');</example>

};
/**
* 提供有選單的  input
* @class	form 的 functions
* @see
* http://dojocampus.org/explorer/#Dijit_Form%20Controls_Filtering%20Select_Basic
*/
CeL.net.form.select_input=function(){
	///	<summary>
	///	* 提供有選單的  input
	///	* @class	form 的 functions
	///	* @see
	///	* http://dojocampus.org/explorer/#Dijit_Form%20Controls_Filtering%20Select_Basic
	///	</summary>

};

//	null constructor for [CeL.OS]
CeL.OS=function(){};
CeL.OS.prototype={};

/**
 * null module constructor
 * @class	web 的 functions
 */
CeL.OS.Windows=function(){
	///	<summary>null module constructor</summary>
	///	<class>web 的 functions</class>

};
/**
 * null module constructor
 * @class	Windows job 的 functions
 */
CeL.OS.Windows.job=function(){
	///	<summary>null module constructor</summary>
	///	<class>Windows job 的 functions</class>

};
/**
 * null module constructor
 * @class	Windows registry 的 functions
 */
CeL.OS.Windows.registry=function(){
	///	<summary>null module constructor</summary>
	///	<class>Windows registry 的 functions</class>

};
/**
 * null module constructor
 * @class	WMI 的 functions
 */
CeL.OS.WMI=function(){
	///	<summary>null module constructor</summary>
	///	<class>WMI 的 functions</class>

};
/**
 * get CIDR data
 * @param {Number} CIDR	CIDR mask bits, 0~32
 * @param {String} IP	IPv4, e.g., 1.2.3.4
 * @return	CIDR data
 * @since	2010/4/21 22:56:16
 * @memberOf	CeL.OS.WMI
 */
CeL.OS.WMI.CIDR_to_IP=function (CIDR, IP){
	///	<summary>get CIDR data</summary>
	///	<param name="CIDR" type="Number" optional="false">CIDR mask bits, 0~32</param>
	///	<param name="IP" type="String" optional="false">IPv4, e.g., 1.2.3.4</param>
	///	<returns>CIDR data</returns>
	///	<since>2010/4/21 22:56:16</since>
	///	<memberOf>CeL.OS.WMI</memberOf>

};
/**
 * 改變網卡的IP地址: change IP, set IP
 * @param to_s	IP or {IP:''||[], CIDR:24||.CIDR_notation, Subnet:''||[], DNS:''||[], Gateway:254||[], GatewayOrder:''||[]}
 * @param from	IP or netif No.
 * @since
 * 2009/5/7 0:24:5	加強
 * 2010/3/3 10:41:17	a work version
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/aa394217%28VS.85%29.aspx" accessdate="2010/3/3 13:15">Win32_NetworkAdapterConfiguration Class (Windows)</a>
 * <a href="http://www.yongfa365.com/item/Use-WMi-Change-IP-VBS-yongfa365.html" accessdate="2010/3/3 13:14">通\u36807 WMI 改\u21464网卡的IP地址 ChangeIP.vbs - 柳永法(yongfa365)'Blog</a>
 * <a href="http://www.microsoft.com/technet/scriptcenter/topics/networking/01_atnc_intro.mspx">Automating TCP/IP Networking on Clients: Part 1: Introduction</a>
 * <a href="http://www.dotblogs.com.tw/PowerHammer/archive/2008/03/24/2060.aspx" accessdate="2010/3/3 13:15">使用 WMI 更改IP、子網路遮罩、閘道、DNS - 強力鎯頭 VB BLOG - 點部落</a>
 * Using NetSh.exe (no reboot required): <a href="http://techsupt.winbatch.com/webcgi/webbatch.exe?techsupt/tsleft.web+WinBatch/How~To+Change~Ip~Address.txt" accessdate="2010/3/3 13:12">WWW Tech Support/WinBatch/How To\Change Ip Address.txt</a>
 * @example
 * set_net_info({IP:'163.16.20.212',Gateway:254});
 * sl(set_net_info({IP:'163.16.20.30',Gateway:254}));WScript.Quit();
 * @requires	getWMIData,VBA,JSArrayToSafeArray,CIDR_to_IP
 * @memberOf	CeL.OS.WMI
 */
CeL.OS.WMI.set_net_info=function (to_s, from){
	///	<summary>改變網卡的IP地址: change IP, set IP</summary>
	///	<param name="to_s" type="" optional="false">IP or {IP:''||[], CIDR:24||.CIDR_notation, Subnet:''||[], DNS:''||[], Gateway:254||[], GatewayOrder:''||[]}</param>
	///	<param name="from" type="" optional="false">IP or netif No.</param>
	///	<since>
	///	2009/5/7 0:24:5	加強
	///	2010/3/3 10:41:17	a work version
	///	</since>
	///	<see>
	///	<a href="http://msdn.microsoft.com/en-us/library/aa394217%28VS.85%29.aspx" accessdate="2010/3/3 13:15">Win32_NetworkAdapterConfiguration Class (Windows)</a>
	///	<a href="http://www.yongfa365.com/item/Use-WMi-Change-IP-VBS-yongfa365.html" accessdate="2010/3/3 13:14">通\u36807 WMI 改\u21464网卡的IP地址 ChangeIP.vbs - 柳永法(yongfa365)'Blog</a>
	///	<a href="http://www.microsoft.com/technet/scriptcenter/topics/networking/01_atnc_intro.mspx">Automating TCP/IP Networking on Clients: Part 1: Introduction</a>
	///	<a href="http://www.dotblogs.com.tw/PowerHammer/archive/2008/03/24/2060.aspx" accessdate="2010/3/3 13:15">使用 WMI 更改IP、子網路遮罩、閘道、DNS - 強力鎯頭 VB BLOG - 點部落</a>
	///	Using NetSh.exe (no reboot required): <a href="http://techsupt.winbatch.com/webcgi/webbatch.exe?techsupt/tsleft.web+WinBatch/How~To+Change~Ip~Address.txt" accessdate="2010/3/3 13:12">WWW Tech Support/WinBatch/How To\Change Ip Address.txt</a>
	///	</see>
	///	<example>
	///	set_net_info({IP:'163.16.20.212',Gateway:254});
	///	sl(set_net_info({IP:'163.16.20.30',Gateway:254}));WScript.Quit();
	///	</example>
	///	<requires>getWMIData,VBA,JSArrayToSafeArray,CIDR_to_IP</requires>
	///	<memberOf>CeL.OS.WMI</memberOf>

};

//	null constructor for [CeL.misc]
CeL.misc=function(){};
CeL.misc.prototype={};

/**
 * null module constructor
 * @class	check 處理的 functions
 */
CeL.misc.check=function(){
	///	<summary>null module constructor</summary>
	///	<class>check 處理的 functions</class>

};

//	null constructor for [CeL.IO]
CeL.IO=function(){};
CeL.IO.prototype={};

/**
 * null module constructor
 * @class	檔案操作相關之 function。
 */
CeL.IO.file=function(){
	///	<summary>null module constructor</summary>
	///	<class>檔案操作相關之 function。</class>

};
/**
 * determine base path.
 * 給定 base path 的結構後，藉由 path_now 推測 base path 的 full path.
 * cf. 
 * @param {String} base_path_structure	base path 的範本結構
 * @param {String} path_now
 * @return	{String}	推測的 base path full path
 * @example
 * alert(determine_base_path('kanashimi/www/cgi-bin/game/'));
 * @requres	reducePath,getPathOnly,dirSp,dirSpR
 * @memberOf	CeL.IO.file
 */
CeL.IO.file.determine_base_path=function (base_path_structure, path_now){
	///	<summary>
	///	determine base path.
	///	給定 base path 的結構後，藉由 path_now 推測 base path 的 full path.
	///	cf.
	///	</summary>
	///	<param name="base_path_structure" type="String" optional="false">base path 的範本結構</param>
	///	<param name="path_now" type="String" optional="false"/>
	///	<returns type="String">推測的 base path full path</returns>
	///	<example>alert(determine_base_path('kanashimi/www/cgi-bin/game/'));</example>
	///	<requres>reducePath,getPathOnly,dirSp,dirSpR</requres>
	///	<memberOf>CeL.IO.file</memberOf>

};
/**
 * cf: getFN()
 * @param {String} path	path name
 * @return
 * @memberOf	CeL.IO.file
 */
CeL.IO.file.parse_path=function (path){
	///	<summary>cf: getFN()</summary>
	///	<param name="path" type="String" optional="false">path name</param>
	///	<returns/>
	///	<memberOf>CeL.IO.file</memberOf>

};
/**
 * is absolute or relative path, not very good solution
 * @param {String} path
 * @return
 * @requires	dirSp,dirSpR
 * @memberOf	CeL.IO.file
 */
CeL.IO.file.is_absolute_path=function (path){
	///	<summary>is absolute or relative path, not very good solution</summary>
	///	<param name="path" type="String" optional="false"/>
	///	<returns/>
	///	<requires>dirSp,dirSpR</requires>
	///	<memberOf>CeL.IO.file</memberOf>

};

//	null constructor for [CeL.IO.Windows]
CeL.IO.Windows=function(){};
CeL.IO.Windows.prototype={};

/**
 * null module constructor
 * @class	Windows 下，檔案操作相關之 function。
 */
CeL.IO.Windows.file=function(){
	///	<summary>null module constructor</summary>
	///	<class>Windows 下，檔案操作相關之 function。</class>

};
/**
 * FileSystemObject Object I/O mode enumeration
 * @see	<a href="http://msdn.microsoft.com/en-us/library/314cz14s%28VS.85%29.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.iomode={
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
/**
 * FileSystemObject Object file open format enumeration
 * @see	<a href="http://msdn.microsoft.com/en-us/library/314cz14s%28VS.85%29.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.open_format={
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
/**
 * move/rename files, ** use RegExp, but no global flag **<br/>
 * 可用 move_file_filter() 來排除不要的<br/>
 * 本函數可能暫時改變目前工作目錄！
 * @param {String} from	from file
 * @param {String} to	to file
 * @param {String} base_path	base path
 * @param flag
 * @param {Function} filter	可用 filter() 來排除不要的
 * @return	{Object} report
 * @since	2004/4/12 17:25
 * @requires	path_separator,fso,WshShell,new_line,Enumerator
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.move_file=function move_file(from, to, base_path, flag, filter){
	///	<summary>
	///	move/rename files, ** use RegExp, but no global flag **<br/>
	///	可用 move_file_filter() 來排除不要的<br/>
	///	本函數可能暫時改變目前工作目錄！
	///	</summary>
	///	<param name="from" type="String" optional="false">from file</param>
	///	<param name="to" type="String" optional="false">to file</param>
	///	<param name="base_path" type="String" optional="false">base path</param>
	///	<param name="flag" type="" optional="false"/>
	///	<param name="filter" type="Function" optional="false">可用 filter() 來排除不要的</param>
	///	<returns type="Object">report</returns>
	///	<since>2004/4/12 17:25</since>
	///	<requires>path_separator,fso,WshShell,new_line,Enumerator</requires>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * <a href="#.move_file">move_file</a> 的 flag enumeration
 * @constant
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.move_file.f={
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
/**
 * move file
 * @requires	fso,get_folder,getFN,initWScriptObj
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.move_1_file=function(from, to, dir, only_filename, reverse){
	///	<summary>move file</summary>
	///	<requires>fso,get_folder,getFN,initWScriptObj</requires>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * get file details (readonly)
 * @example
 * get_file_details('path');
 * get_file_details('file/folder name',parentDir);
 * get_file_details('path',get_file_details_get_object);
 * @see	<a href="http://msdn.microsoft.com/en-us/library/bb787870%28VS.85%29.aspx" accessdate="2009/11/29 22:52" title="GetDetailsOf Method (Folder)">GetDetailsOf Method (Folder)</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.get_file_details=function(fileObj, parentDirObj){
	///	<summary>get file details (readonly)</summary>
	///	<example>
	///	get_file_details('path');
	///	get_file_details('file/folder name',parentDir);
	///	get_file_details('path',get_file_details_get_object);
	///	</example>
	///	<see><a href="http://msdn.microsoft.com/en-us/library/bb787870%28VS.85%29.aspx" accessdate="2009/11/29 22:52" title="GetDetailsOf Method (Folder)">GetDetailsOf Method (Folder)</a></see>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * FileSystemObject Object Attributes Property
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/5tx15443%28VS.85%29.aspx" accessdate="2010/1/9 8:11">Attributes Property</a>
 * @memberOf	CeL.IO.Windows.file
 * @since	2010/1/9 08:33:36
 */
CeL.IO.Windows.file.fso_attributes={
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
/**
 * 改變檔案之屬性。
 * chmod @ UNIX
 * @param	F	file path
 * @param	A	attributes, 屬性
 * @example
 * change_attributes(path,'-ReadOnly');
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.change_attributes=function(F, A){
	///	<summary>
	///	改變檔案之屬性。
	///	chmod @ UNIX
	///	</summary>
	///	<param name="F" type="" optional="false">file path</param>
	///	<param name="A" type="" optional="false">attributes, 屬性</param>
	///	<example>change_attributes(path,'-ReadOnly');</example>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
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
CeL.IO.Windows.file.openDataTest=function(FN, NOTexist, io_mode){
	///	<summary>
	///	開檔處理<br/>
	///	測試是否已開啟資料檔之測試與重新開啟資料檔
	///	</summary>
	///	<param name="FN" type="" optional="false">file name</param>
	///	<param name="NOTexist" type="" optional="false">if NOT need exist</param>
	///	<param name="io_mode" type="" optional="false">IO mode</param>
	///	<returns/>
	///	<requires>fso,WshShell,iomode</requires>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * 
 * @param FN
 * @param format
 * @param io_mode
 * @return
 */
CeL.IO.Windows.file.open_template=function(FN, format, io_mode){
	///	<summary>*</summary>
	///	<param name="FN" type="" optional="false"/>
	///	<param name="format" type="" optional="false"/>
	///	<param name="io_mode" type="" optional="false"/>
	///	<returns/>

};
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @example
 * //	較安全的讀檔：
 * t=translate_AdoStream_binary_data(read_file(FP,'binary'));
 * write_file(FP,t,'iso-8859-1');
 * @see
 * <a href="http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html">Hawk&apos;s W3 Laboratory : Disposable WSH : 番外編：文字\u12456\u12531\u12467\u12540\u12487\u12451\u12531\u12464\u12392ADODB.Stream</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.translate_AdoStream_binary_data=function translate_AdoStream_binary_data(data, len, type){
	///	<summary>轉換以 adTypeBinary 讀到的資料</summary>
	///	<example>
	///	//	較安全的讀檔：
	///	t=translate_AdoStream_binary_data(read_file(FP,'binary'));
	///	write_file(FP,t,'iso-8859-1');
	///	</example>
	///	<see><a href="http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html">Hawk&apos;s W3 Laboratory : Disposable WSH : 番外編：文字\u12456\u12531\u12467\u12540\u12487\u12451\u12531\u12464\u12392ADODB.Stream</a></see>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @param	data	以 adTypeBinary 讀到的資料
 * @param	pos	position
 * @since	2007/9/19 20:58:26
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.Ado_binary=function(data,pos){
	///	<summary>轉換以 adTypeBinary 讀到的資料</summary>
	///	<param name="data" type="" optional="false">以 adTypeBinary 讀到的資料</param>
	///	<param name="pos" type="" optional="false">position</param>
	///	<since>2007/9/19 20:58:26</since>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.Ado_binary.prototype={};
/**
 * 提供給 <a href="#.read_file">read_file</a>, <a href="#.write_file">write_file</a> 使用的簡易開檔函數
 * @param FN	file path
 * @param format	open format, e.g., open_format.TristateUseDefault
 * @param io_mode	open mode, e.g., iomode.ForWriting
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.open_file=function open_file(FN, format, io_mode){
	///	<summary>提供給 <a href="#.read_file">read_file</a>, <a href="#.write_file">write_file</a> 使用的簡易開檔函數</summary>
	///	<param name="FN" type="" optional="false">file path</param>
	///	<param name="format" type="" optional="false">open format, e.g., open_format.TristateUseDefault</param>
	///	<param name="io_mode" type="" optional="false">open mode, e.g., iomode.ForWriting</param>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * 讀取檔案
 * @param FN	file path
 * @param format	open encode = simpleFileDformat
 * @param io_mode	open IO mode = ForReading
 * @param func	do this function per line, or [func, maxsize] (TODO)
 * @return {String} 檔案內容
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.read_file=function(FN,format,io_mode,func){
	///	<summary>讀取檔案</summary>
	///	<param name="FN" type="" optional="false">file path</param>
	///	<param name="format" type="" optional="false">open encode = simpleFileDformat</param>
	///	<param name="io_mode" type="" optional="false">open IO mode = ForReading</param>
	///	<param name="func" type="" optional="false">do this function per line, or [func, maxsize] (TODO)</param>
	///	<returns type="String">檔案內容</returns>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
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
CeL.IO.Windows.file.write_file=function(FN, content, format, io_mode, N_O){
	///	<summary>
	///	將 content 寫入 file
	///	** ADODB.Stream does not support appending!
	///	</summary>
	///	<param name="FN" type="" optional="false">file path</param>
	///	<param name="content" type="" optional="false">content to write</param>
	///	<param name="format" type="" optional="false">open format = simpleFileDformat</param>
	///	<param name="io_mode" type="" optional="false">write mode = ForWriting, e.g., ForAppending</param>
	///	<param name="N_O" type="" optional="false">DO NOT overwrite</param>
	///	<returns>error No.</returns>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * 靠常用字自動判別字串之編碼	string,預設編碼
 */
CeL.IO.Windows.file.autodetectStringEncode=function(str){
	///	<summary>靠常用字自動判別字串之編碼	string,預設編碼</summary>

};
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
CeL.IO.Windows.file.folder_info=function(folder_path,file_filter,traverseSubDirectory){
	///	<summary>Get the infomation of folder</summary>
	///	<param name="folder_path" type="" optional="false">folder path</param>
	///	<param name="file_filter" type="" optional="false"/>
	///	<param name="traverseSubDirectory" type="" optional="false"/>
	///	<returns/>
	///	<example>var finfo=new folder_info(path or folder object,extFilter,0/1);</example>
	///	<deprecated>以 <a href="#.traverse_file_system">traverse_file_system</a> 代替</deprecated>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
/**
 * <a href="#.folder_info">folder_info</a> 的 flag enumeration
 * @memberOf	CeL.IO.Windows.file
 * @constant
 */
CeL.IO.Windows.file.folder_info.f={
		noNewObj : -1,
		files : 0,
		dirs : 1,
		fsize : 2,
		size : 3,
		Tsize : 3,
		Tfiles : 4,
		Tdirs : 5
};
/**
 * 將編碼為fromCode之檔案fileName中所有不合編碼toCode之char以encodeFunction轉換
 * @param fileName
 * @param toCode
 * @param fromCode
 * @param encodeFunction
 * @return
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.iconv_file=function(fileName, toCode, fromCode, encodeFunction){
	///	<summary>將編碼為fromCode之檔案fileName中所有不合編碼toCode之char以encodeFunction轉換</summary>
	///	<param name="fileName" type="" optional="false"/>
	///	<param name="toCode" type="" optional="false"/>
	///	<param name="fromCode" type="" optional="false"/>
	///	<param name="encodeFunction" type="" optional="false"/>
	///	<returns/>
	///	<memberOf>CeL.IO.Windows.file</memberOf>

};
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
CeL.IO.Windows.file.traverse_file_system=function traverse_file_system(FS_function_array, path, filter, flag){
	///	<summary>巡覽 file system 的公用函數</summary>
	///	<param name="FS_function_array" type="" optional="false">file system handle function array</param>
	///	<param name="path" type="" optional="false">target path</param>
	///	<param name="filter" type="" optional="false">filter</param>
	///	<param name="flag" type="" optional="false">see <a href="#.traverse_file_system.f">flag</a></param>
	///	<returns/>
	///	<memberOf>CeL.IO.Windows.file</memberOf>
	///	<see><a href="http://msdn.microsoft.com/library/en-us/script56/html/0fa93e5b-b657-408d-9dd3-a43846037a0e.asp">FileSystemObject</a></see>

};

//	null constructor for [CeL.code]
CeL.code=function(){};
CeL.code.prototype={};

/**
 * null module constructor
 * @class	相容性 test 專用的 functions
 */
CeL.code.API=function(){
	///	<summary>null module constructor</summary>
	///	<class>相容性 test 專用的 functions</class>

};
/**
 * 自動挑選 domain
 * @param	API	API name
 * @param	callback	null: do NOT load
 * @return	[ API url, API key ]
 * @since	2010/6/20 22:12:23
 * @see
 * 
 */
CeL.code.API.use_API=function(API, callback){
	///	<summary>自動挑選 domain</summary>
	///	<param name="API" type="" optional="false">API name</param>
	///	<param name="callback" type="" optional="false">null: do NOT load</param>
	///	<returns>[ API url, API key ]</returns>
	///	<since>2010/6/20 22:12:23</since>
	///	<see>*</see>

};
/**
 * 語系. e.g., zh-TW, ja, en
 */
CeL.code.API.use_API.language='zh-TW';
/**
 * 為 Microsoft Translator 設置
 * @param text	test to translate
 * @param callback	callback(from text,to text)
 * @param [from_enc]
 * @param [to_enc]
 * @return
 * @see
 * http://msdn.microsoft.com/en-us/library/ff512406.aspx
 */
CeL.code.API.add_Microsoft_translate=function(text, callback, from_enc, to_enc){
	///	<summary>為 Microsoft Translator 設置</summary>
	///	<param name="text" type="" optional="false">test to translate</param>
	///	<param name="callback" type="" optional="false">callback(from text,to text)</param>
	///	<param name="from_enc" type="" optional="true"/>
	///	<param name="to_enc" type="" optional="true"/>
	///	<returns/>
	///	<see>http://msdn.microsoft.com/en-us/library/ff512406.aspx</see>

};
/**
 * null module constructor
 * @class	相容性 test 專用的 functions
 */
CeL.code.compatibility=function(){
	///	<summary>null module constructor</summary>
	///	<class>相容性 test 專用的 functions</class>

};
/**
 * Are we in a web environment?
 * @param W3CDOM	Are we in a W3C DOM environment?
 * @return	We're in a web environment.
 * @since	2009/12/29 19:18:53
 * @see
 * use lazy evaluation
 * @memberOf	CeL.code.compatibility
 */
CeL.code.compatibility.is_web=function is_web(W3CDOM){
	///	<summary>Are we in a web environment?</summary>
	///	<param name="W3CDOM" type="" optional="false">Are we in a W3C DOM environment?</param>
	///	<returns>We're in a web environment.</returns>
	///	<since>2009/12/29 19:18:53</since>
	///	<see>use lazy evaluation</see>
	///	<memberOf>CeL.code.compatibility</memberOf>

};
/**
 * 判斷為 DOM。
 * @param	name	various name @ name-space window. e.g., document, location
 * @return	{Boolean}	various is object of window
 * @since	2010/1/14 22:04:37
 * @memberOf	CeL.code.compatibility
 */
CeL.code.compatibility.is_DOM=function(name){
	///	<summary>判斷為 DOM。</summary>
	///	<param name="name" type="" optional="false">various name @ name-space window. e.g., document, location</param>
	///	<returns type="Boolean">various is object of window</returns>
	///	<since>2010/1/14 22:04:37</since>
	///	<memberOf>CeL.code.compatibility</memberOf>

};
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
CeL.code.compatibility.is_HTA=function is_HTA(id){
	///	<summary>
	///	Are we run in HTA?<br/>
	///	** HTA 中應該在 onload 中呼叫，否則 document.getElementsByTagName 不會有東西！
	///	</summary>
	///	<param name="id" type="" optional="true">HTA tag id (only used in low version that we have no document.getElementsByTagName)</param>
	///	<returns>We're in HTA</returns>
	///	<require>is_web</require>
	///	<since>2009/12/29 19:18:53</since>
	///	<memberOf>CeL.code.compatibility</memberOf>
	///	<see>
	///	http://msdn2.microsoft.com/en-us/library/ms536479.aspx
	///	http://www.microsoft.com/technet/scriptcenter/resources/qanda/apr05/hey0420.mspx
	///	http://www.msfn.org/board/lofiversion/index.php/t61847.html
	///	lazy evaluation
	///	http://peter.michaux.ca/articles/lazy-function-definition-pattern
	///	</see>

};
/**
 * null module constructor
 * @class	code.debug 的 functions
 */
CeL.code.debug=function(){
	///	<summary>null module constructor</summary>
	///	<class>code.debug 的 functions</class>

};
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
 * @memberOf	CeL.code.debug
 */
CeL.code.debug.JSalert=function (message, wait, title, type){
	///	<summary>
	///	顯示訊息視窗<br/>
	///	alert() 改用VBScript的MsgBox可產生更多效果，但NS不支援的樣子。
	///	</summary>
	///	<param name="message" type="" optional="false">message or object</param>
	///	<param name="wait" type="Number" optional="true">the maximum length of time (in seconds) you want the pop-up message box displayed.</param>
	///	<param name="title" type="String" optional="true">title of the pop-up message box.</param>
	///	<param name="type" type="Number" optional="true">type of buttons and icons you want in the pop-up message box.</param>
	///	<returns type="Integer">number of the button the user clicked to dismiss the message box.</returns>
	///	<requires>CeL.get_script_name</requires>
	///	<see><a href="http://msdn.microsoft.com/library/en-us/script56/html/wsmthpopup.asp">Popup Method</a></see>
	///	<memberOf>CeL.code.debug</memberOf>

};

//	null constructor for [CeL.code.log]
CeL.code.log=function(){};
CeL.code.log.prototype={};


	/**
	 * log 時 warning/error message 之 className
	 * @name	CeL.code.log.prototype.className_set
	 */
//CeL.code.log.prototype.className_set;//className_set || {
	/**
	 * log 時 warning/error message 之 prefix
	 * @name	CeL.code.log.prototype.message_prefix
	 */
CeL.code.log.prototype.message_prefix={
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
CeL.code.log.get_error_message=function get_error_message(e, new_line, caller){
	///	<summary>對各種不同 error object 作應對，獲得可理解的 error message。</summary>
	///	<param name="e" type="" optional="false">error object</param>
	///	<param name="new_line" type="" optional="false">new_line</param>
	///	<param name="caller" type="" optional="false">function caller</param>
	///	<memberOf>CeL.code.log</memberOf>
	///	<see>
	///	http://msdn.microsoft.com/en-us/library/ms976144.aspx
	///	The facility code establishes who originated the error. For example, all internal script engine errors generated by the JScript engine have a facility code of "A".
	///	http://msdn.microsoft.com/en-us/library/ms690088(VS.85).aspx
	///	*
	///	http://msdn.microsoft.com/en-us/library/t9zk6eay.aspx
	///	http://msdn.microsoft.com/en-us/library/microsoft.jscript.errorobject.aspx
	///	Specifies the name of the type of the error.
	///	Possible values include Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, and URIError.
	///	</see>

};
/**
 * get node description
 * 
 * @param node
 *            HTML node
 * @memberOf CeL.code.log
 */
CeL.code.log.node_description=function(node, flag){
	///	<summary>
	///	get node description
	///	*
	///	</summary>
	///	<param name="node" type="" optional="false">HTML node</param>
	///	<memberOf>CeL.code.log</memberOf>

};
/**
 * get new extend instance
 * @param	{String|object HTMLElement} [obj]	message area element or id
 * @return	{Array} [ instance of this module, log function, warning function, error function ]
 * @example
 * 
 * //	status logger
 * var SL=new CeL.code.log('log'),sl=SL[1],warn=SL[2],err=SL[3];
 * sl(msg);
 * sl(msg,clear);
 * 
 * //	general log
 * function_set = new CeL.code.log.extend('panel',{});
 * // 1.
 * function_set = new CeL.code.log.extend('panel',{});
 * logger = function_set[1];
 * // 2.
 * log_only = (new CeL.code.log.extend('panel',{}))[1];
 * 
 * @_memberOf	CeL.code.log
 * @since	2009/8/24 20:15:31
 */
CeL.code.log.extend=function(obj, className_set){
	///	<summary>get new extend instance</summary>
	///	<param name="obj" type="String|objectHTMLElement" optional="true">message area element or id</param>
	///	<returns type="Array">[ instance of this module, log function, warning function, error function ]</returns>
	///	<example>
	///	*
	///	//	status logger
	///	var SL=new CeL.code.log('log'),sl=SL[1],warn=SL[2],err=SL[3];
	///	sl(msg);
	///	sl(msg,clear);
	///	*
	///	//	general log
	///	function_set = new CeL.code.log.extend('panel',{});
	///	// 1.
	///	function_set = new CeL.code.log.extend('panel',{});
	///	logger = function_set[1];
	///	// 2.
	///	log_only = (new CeL.code.log.extend('panel',{}))[1];
	///	*
	///	</example>
	///	<_memberOf>CeL.code.log</_memberOf>
	///	<since>2009/8/24 20:15:31</since>

};
/**
 * null module constructor
 * @class 程式碼重整相關之 function。
 * @constructor
 */
CeL.code.reorganize=function (){
	///	<summary>null module constructor</summary>
	///	<class>程式碼重整相關之 function。</class>

};
/**
* 取得[script_filename].wsf中不包括自己（[script_filename].js），其餘所有 .js 的code。
* 若想在低版本中利用eval(get_all_functions(ScriptName))來補足，有時會出現奇怪的現象，還是別用好了。
* @param {String} script_filename
* @return
* @requires	ScriptName,simpleRead
*/
CeL.code.reorganize.get_all_functions=function (script_filename){
	///	<summary>
	///	* 取得[script_filename].wsf中不包括自己（[script_filename].js），其餘所有 .js 的code。
	///	* 若想在低版本中利用eval(get_all_functions(ScriptName))來補足，有時會出現奇怪的現象，還是別用好了。
	///	* @param {String} script_filename
	///	* @return
	///	* @requires	ScriptName,simpleRead
	///	</summary>

};
/**
* for 引用：　include library 自 registry 中的 path
* @since	2009/11/25 22:59:02
* @_memberOf	_module_
*/
CeL.code.reorganize.library_loader_by_registry=function (){
	///	<summary>
	///	* for 引用：　include library 自 registry 中的 path
	///	* @since	2009/11/25 22:59:02
	///	* @_memberOf	_module_
	///	</summary>

};
/**
* get various from code
* @param {String} code	程式碼
* @param {Boolean} fill_code	(TODO) 不只是定義，在 .code 填入程式碼。
* @return	{Object}	root namespace
* @since	2009/12/5 15:04:42, 2009/12/20 14:33:30
* @_memberOf	_module_
*/
CeL.code.reorganize.get_various_from_code=function (code, fill_code){
	///	<summary>
	///	* get various from code
	///	* @param {String} code	程式碼
	///	* @param {Boolean} fill_code	(TODO) 不只是定義，在 .code 填入程式碼。
	///	* @return	{Object}	root namespace
	///	* @since	2009/12/5 15:04:42, 2009/12/20 14:33:30
	///	* @_memberOf	_module_
	///	</summary>

};
/**
* 把 get_various_from_code 生成的 namespace 轉成 code
* @param	{Object} ns	root namespace
* @param	{String} [prefix]	(TODO) prefix of root namespace
* @param	{Array}	[code_array]	inner use, please don't specify this value.
* @return	{String}	code
* @since	2009/12/20 14:51:52
* @_memberOf	_module_
*/
CeL.code.reorganize.get_code_from_generated_various=function (ns, prefix, code_array){
	///	<summary>
	///	* 把 get_various_from_code 生成的 namespace 轉成 code
	///	* @param	{Object} ns	root namespace
	///	* @param	{String} [prefix]	(TODO) prefix of root namespace
	///	* @param	{Array}	[code_array]	inner use, please don't specify this value.
	///	* @return	{String}	code
	///	* @since	2009/12/20 14:51:52
	///	* @_memberOf	_module_
	///	</summary>

};