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
CeL=function(){};

//	null constructor for [CeL.env]
CeL.env=function(){};
CeL.env.prototype={};

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
	 * library main file base name<br/>
	 * full path: {@link CeL.env.registry_path} + {@link CeL.env.main_script}
	 * @example:
	 * CeL.log('full path: ['+CeL.env.registry_path+CeL.env.main_script+']');
	 * @name	CeL.env.main_script
	 * @type	String
	 */
CeL.env.main_script="";	//	'ce' + env.script_extension;
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
CeL.env.registry_path;	//	(WScript.CreateObject("WScript.Shell"))
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
 * null module constructor
 * @class	data 處理的 functions
 */
CeL.data=function(){};
/**
 * 運算式值的二進位表示法	已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz
 * @param {Number} number	number
 * @param places	places,字元數,使用前置0來填補回覆值
 * @return
 * @example
 * {var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}
 * @memberOf	CeL.data
 */
CeL.data.dec_to_bin=function(number, places){};
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
CeL.data.set_obj_value=function(obj, value, type, mode){};
/**
 * 將字串組分作 Object
 * @param {String} value_set	字串組, e.g., 'a=12,b=34'
 * @param assignment_char	char to assign values, e.g., '='
 * @param end_char	end char of assignment
 * @return
 * @since	2006/9/6 20:55, 2010/4/12 23:06:04
 * @memberOf	CeL.data
 */
CeL.data.split_String_to_Object=function(value_set, assignment_char, end_char){};
/**
 * null module constructor
 * @class	CSV data 的 functions
 */
CeL.data.CSV=function(){};
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
CeL.data.CSV.parse_CSV=function(_t, doCheck, hasTitle){};
/**
 * null module constructor
 * @class	XML 操作相關之 function。
 */
CeL.data.XML=function(){};
/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.locale=function(msg){};
/**
 * null module constructor
 * @class	math 的 functions
 */
CeL.math=function(){};
/**
 * Hamming code
 * @class	Hamming Code 的 constructor
 * @constructor
 */
CeL.math.Hamming=function(){};
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
CeL.math.Hamming.encode=function(data, no_reverse){};
/**
 * 將 Hamming Code 分成 data & check bits
 * @param code	Hamming Code to split
 * @return	[資料位元 data bits, 檢查位元 check bits (parity bits)]
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.split_code=function(code){};
/**
 * decode Hamming Code to data
 * @param code
 * @return
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.decode=function(code){};
/**
 * 顯示 Hamming Code 的計算方法
 * @param {Number} bit_length	bit length. e.g., 8, 16.
 * @memberOf	CeL.math.Hamming
 */
CeL.math.Hamming.show=function(bit_length){};
/**
 * polynomial test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.math.polynomial=function(msg){};
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
CeL.math.quotient=function(numerator, denominator, approximate){};
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
CeL.math.quotient.parse_base=function(number, base, digit_char){};
/**
 * null module constructor
 * @class	native objects 的 functions
 */
CeL.native=function(){};
/**
 * 顯示格式化日期 string
 * @param date_value	要轉換的 date, 值過小時當作時間, <0 轉成當下時間
 * @param mode	要轉換的 mode
 * @param zero_fill	對 0-9 是否補零
 * @param date_separator	date separator
 * @param time_separator	time separator
 * @return	{String}	格式化日期
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
CeL.native.format_date=function format_date(date_value, mode, zero_fill, date_separator, time_separator){};
/**
 * 函數的文字解譯/取得函數的語法
 * @param function_name	function name
 * @param flag	=1: reduce
 * @return
 * @example
 * parsed_data = new parse_Function(function_name);
 * @see
 * http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
 * Syntax error: http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
 * @memberOf	CeL.native
 */
CeL.native.parse_Function=function parse_Function(function_name, flag){};
/**
 * 重新設定 RegExp object 之 flag
 * @param {RegExp} regexp	RegExp object to set
 * @param {String} flag	flag of RegExp
 * @return
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
CeL.native.renew_RegExp_flag=function(regexp, flag){};
/**
 * math test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.SVG=function(msg){};

//	null constructor for [CeL.OS]
CeL.OS=function(){};
CeL.OS.prototype={};

/**
 * Windows test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.OS.Windows=function(msg){};
/**
 * Windows.registry test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.OS.Windows.registry=function(msg){};
/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.HTA=function(msg){};

//	null constructor for [CeL.net]
CeL.net=function(){};
CeL.net.prototype={};

/**
 * null module constructor
 * @class	map 的 functions
 */
CeL.net.map=function(){};
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
CeL.net.SVG=function(_width, _height, _backgroundColor){};

 /**
  * SVG document fragment
  * @property
  * @see	<a href="http://www.w3.org/TR/SVG/struct.html#NewDocument" accessdate="2009/11/15 16:53">Defining an SVG document fragment: the 'svg' element</a>
  */
CeL.net.SVG.prototype.svg;//_s=	//	raw
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
CeL.net.SVG.prototype.div;//null;
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
CeL.net.SVG.changeText=function(text_node, text){};
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
CeL.net.SVG.draw_circle=function(_r, svgO, _color, _fill){};
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
CeL.net.SVG.draw_ellipse=function(_rx, _ry, svgO, _color, _fill){};
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
CeL.net.SVG.draw_quadrilateral=function(_ds, _h, _d, _us, svgO, _color, _fill){};
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
CeL.net.SVG.draw_triangle=function(_ds, _h, _d, svgO, _color, _fill){};
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
CeL.net.SVG.draw_addition=function(num1, num2, svgO, _color, _font){};
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
CeL.net.SVG.draw_subtraction=function(num1, num2, svgO, _color, _font){};
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
CeL.net.SVG.draw_multiplication=function(num1, num2, svgO, _color, _font){};
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
CeL.net.SVG.draw_long_division=function(dividend, divisor, svgO, _color, _font){};
/**
 * null module constructor
 * @class	web 的 functions
 */
CeL.net.web=function(){};
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
CeL.net.web.trigger_display=function(element, type){};
/**
 * replace HTML
 * @param o
 * @param html
 * @return
 * @memberOf	CeL.net.web
 */
CeL.net.web.replace_HTML=function(o,html){};
/**
 * 移除 node.
 * TODO:
 * also remove event handlers
 * @param o
 * @param tag	tag===1: only child, undefined: remove only self, others: only <tag> child
 * @return
 * @memberOf	CeL.net.web
 */
CeL.net.web.remove_node=function remove_node(o, tag){};
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
CeL.net.web.set_attribute=function(_e,propertyO){};
/**
 * append children node to specified element
 * @param node	node / node id
 * @param child_list	children node array
 * @return
 * @since	2007/1/20 14:12
 * @memberOf	CeL.net.web
 */
CeL.net.web.add_node=function add_node(node, child_list){};
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
CeL.net.web.XML_node=function(tag,propertyO,insertBeforeO,innerObj,styleO){};
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
CeL.net.web.table_list=function(data, table, header, do_clean){};
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
CeL.net.web.parse_URI=function(URI){};
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
CeL.net.web.get_element=function get_element(id, flag){};
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
CeL.net.web.set_class=function(element, class_name, flag){};
/**
 * get current computed style property of specified HTML element.
 * TODO: 整合 get_node_position, _.set_style
 * @param element	HTML element
 * @param name	W3C style property name (e.g., no '-webkit-background-clip')
 * @return
 * @see
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
CeL.net.web.get_style=function(element, name, not_computed){};
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
CeL.net.web.get_node_position=function(obj){};
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
CeL.net.web.deal_barcode=function(callback){};
/**
 * translate Unicode text to HTML
 * @param {String} text	Unicode text
 * @param mode	mode='x':&#xhhh;
 * @return {String}	HTML
 * @memberOf	CeL.net.web
 */
CeL.net.web.toHTML=function(text, mode){};

//	null constructor for [CeL.net.form]
CeL.net.form=function(){};
CeL.net.form.prototype={};

/**
 * JavaScript 地址輸入表單支援 (address input form)，
 * 現有台灣(.TW)可用。
 * @class	form 的 functions
 */
CeL.net.form.address=function(){};
/**
 * null module constructor
 * @class	輸入 bank account 的 functions
 */
CeL.net.form.bank_account=function(){};
/**
 * null module constructor
 * @class	輸入教育程度的 functions
 * @example
 * var education_form = new CeL.education.TW('education');
 */
CeL.net.form.education=function(){};
/**
* 提供有選單的  input
* @class	form 的 functions
* @see
* http://dojocampus.org/explorer/#Dijit_Form%20Controls_Filtering%20Select_Basic
*/
CeL.net.form.select_input=function(){};

//	null constructor for [CeL.misc]
CeL.misc=function(){};
CeL.misc.prototype={};

/**
 * null module constructor
 * @class	check 處理的 functions
 */
CeL.misc.check=function(){};

//	null constructor for [CeL.IO]
CeL.IO=function(){};
CeL.IO.prototype={};

/**
 * null module constructor
 * @class	檔案操作相關之 function。
 */
CeL.IO.file=function(){};

//	null constructor for [CeL.IO.Windows]
CeL.IO.Windows=function(){};
CeL.IO.Windows.prototype={};

/**
 * null module constructor
 * @class	Windows 下，檔案操作相關之 function。
 */
CeL.IO.Windows.file=function(){};
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
CeL.IO.Windows.file.move_file=function move_file(from, to, base_path, flag, filter){};
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
CeL.IO.Windows.file.move_1_file=function(from, to, dir, only_filename, reverse){};
/**
 * get file details (readonly)
 * @example
 * get_file_details('path');
 * get_file_details('file/folder name',parentDir);
 * get_file_details('path',get_file_details_get_object);
 * @see	<a href="http://msdn.microsoft.com/en-us/library/bb787870%28VS.85%29.aspx" accessdate="2009/11/29 22:52" title="GetDetailsOf Method (Folder)">GetDetailsOf Method (Folder)</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.get_file_details=function(fileObj, parentDirObj){};
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
CeL.IO.Windows.file.change_attributes=function(F, A){};
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
CeL.IO.Windows.file.openDataTest=function(FN, NOTexist, io_mode){};
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @example
 * //	較安全的讀檔：
 * t=translate_AdoStream_binary_data(read_all_file(FP,'binary'));
 * write_to_file(FP,t,'iso-8859-1');
 * @see
 * <a href="http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html">Hawk&apos;s W3 Laboratory : Disposable WSH : 番外編：文字\u12456\u12531\u12467\u12540\u12487\u12451\u12531\u12464\u12392ADODB.Stream</a>
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.translate_AdoStream_binary_data=function translate_AdoStream_binary_data(data, len, type){};
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @param	data	以 adTypeBinary 讀到的資料
 * @param	pos	position
 * @since	2007/9/19 20:58:26
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.Ado_binary=function(data,pos){};
/**
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.Ado_binary.prototype={};
/**
 * 提供給 <a href="#.read_all_file">read_all_file</a>, <a href="#.write_to_file">write_to_file</a> 使用的簡易開檔函數
 * @param FN	file path
 * @param format	open format, e.g., open_format.TristateUseDefault
 * @param io_mode	open mode, e.g., iomode.ForWriting
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.open_file=function open_file(FN, format, io_mode){};
/**
 * 讀取檔案
 * @param FN	file path
 * @param format	open encode = simpleFileDformat
 * @param io_mode	open IO mode = ForReading
 * @param func	do this function per line, or [func, maxsize] (TODO)
 * @return {String} 檔案內容
 * @memberOf	CeL.IO.Windows.file
 */
CeL.IO.Windows.file.read_all_file=function(FN,format,io_mode,func){};
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
CeL.IO.Windows.file.write_to_file=function(FN, content, format, io_mode, N_O){};
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
CeL.IO.Windows.file.folder_info=function(folder_path,file_filter,traverseSubDirectory){};
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
CeL.IO.Windows.file.iconv_file=function(fileName, toCode, fromCode, encodeFunction){};
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
CeL.IO.Windows.file.traverse_file_system=function traverse_file_system(FS_function_array, path, filter, flag){};

//	null constructor for [CeL.code]
CeL.code=function(){};
CeL.code.prototype={};

/**
 * null module constructor
 * @class	相容性 test 專用的 functions
 */
CeL.code.compatibility=function(){};
/**
 * Are we in a web environment?
 * @param W3CDOM	Are we in a W3C DOM environment?
 * @return	We're in a web environment.
 * @since	2009/12/29 19:18:53
 * @see
 * use lazy evaluation
 * @memberOf	CeL.code.compatibility
 */
CeL.code.compatibility.is_web=function is_web(W3CDOM){};
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
CeL.code.compatibility.is_HTA=function is_HTA(id){};

//	null constructor for [CeL.code.log]
CeL.code.log=function(){};
CeL.code.log.prototype={};


	/**
	 * log 時 warning/error message 之 className
	 * @name	CeL.code.log.prototype.className_set
	 */
CeL.code.log.prototype.className_set;//className_set || {
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
CeL.code.log.get_error_message=function(e, new_line, caller){};
/**
 * get node description
 * @param	node	HTML node
 * @memberOf	CeL.code.log
 */
CeL.code.log.node_description=function(node, flag){};
/**
 * reorganize functions
 * @class	程式碼重整相關之 function。
 * @constructor
 */
CeL.code.reorganize=function(){};
/**
 * for 引用：　include library 自 registry 中的 path
 * @since	2009/11/25 22:59:02
 * @memberOf	CeL.code.reorganize
 */
CeL.code.reorganize.library_loader_by_registry=function(){};
/**
 * get various from code
 * @param {String} code	程式碼
 * @param {Boolean} fill_code	(TODO) 不只是定義，在 .code 填入程式碼。
 * @return	{Object}	root namespace
 * @since	2009/12/5 15:04:42, 2009/12/20 14:33:30
 * @memberOf	CeL.code.reorganize
 */
CeL.code.reorganize.get_various_from_code=function(code, fill_code){};
/**
 * 把 get_various_from_code 生成的 namespace 轉成 code
 * @param	{Object} ns	root namespace
 * @param	{String} [prefix]	(TODO) prefix of root namespace
 * @param	{Array}	[code_array]	inner use, please don't specify this value.
 * @return	{String}	code
 * @since	2009/12/20 14:51:52
 * @memberOf	CeL.code.reorganize
 */
CeL.code.reorganize.get_code_from_generated_various=function(ns, prefix, code_array){};
/**
 * setup debug library
 * @namespace	debug library
 * @memberOf	CeL
 */
CeL.debug=function(){};

//	null constructor for [_]
_=function(){};
_.prototype={};

/**
 * JavaScript library framework main class name.
 * @see	<a href="http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf">ECMA-262</a>: Object.Class: A string value indicating the kind of this object.
 * @constant
 */
_.Class;//library_name;
/**
 * framework main prototype definition
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_.prototype={};

//	null constructor for [_.parse_CSV]
_.parse_CSV=function(){};
_.parse_CSV.prototype={};

/**
 * field delimiter
 */
_.parse_CSV.fd="";	//	'\\t,;';// :\s
/**
 * text delimiter
 */
_.parse_CSV.td="";	//	'"\'';
/**
 * auto detect.. no title
 */
_.parse_CSV.hasTitle;//null;
/**
 * 本 library 專用之 evaluate()
 * @param code	script code to evaluate
 * @return	value that evaluate process returned
 */
eval_code=function eval_code(code){};
/**
 * evaluate @ Global scope.
 * By the ECMA-262, new Function() will 'Pass in the Global Environment as the Scope parameter.'
 * @param code	script code to evaluate
 * @return	value that evaluate process returned
 */
global_eval;//new Function('code', 'return eval(code);');
/**
 * simple evaluates to get value of specified various name
 * @param {String} various_name	various name
 * @param {Object|Function} [name_space]	initialize name-space. default: global
 * @return	value of specified various name
 * @since	2010/1/1 18:11:40
 * @note
 * 'namespace' 是 JScript.NET 的保留字
 * 
 * 在兩個子層(a.b.c)下，這樣作效率較差 @User agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.29 Safari/533.4:
 * function(v){try{return(new Function('return('+v+')'))();}catch(e){}}
 */
get_various=function(various_name, name_space){};
/**
 * 取得執行 script 之 path, 在 .hta 中取代 WScript.ScriptFullName。
 * @return	{String}	執行 script 之 path
 * @return	''	unknown environment
 */
get_script_full_name=function(){};
/**
 * 取得執行 script 之名稱
 * @return	{String} 執行 script 之 名稱
 * @return	''	unknown environment
 */
get_script_name=function(){};
/**
 * 取得/設定環境變數 enumeration<br/>
 * （雖然不喜歡另開 name-space，但以 2009 當下的 JsDoc Toolkit 來說，似乎沒辦法創造 enumeration。）
 * @class	環境變數 (environment variables) 與程式會用到的 library 相關變數。
 * @param {String} name	環境變數名稱
 * @param value	環境變數之值
 * @return	舊環境變數之值
 */
env=function env(name, value){};
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
is_type=function(value, want_type, get_Class){};
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
object_tester=function(want_type, toString_reference){};
/**
 * Setup environment variables
 * @param	{String} [OS_type]	type of OS
 * @return	{Object}	environment variables set
 */
initial_env=function(OS_type){};
/**
 * Tell if it's now debugging.
 * @param {Integral} [debug_level]	if it's now in this debug level.
 * @return	{Boolean}	It's now in specified debug level.
 * @return	{Number}	It's now in what debug level(Integral).
 */
is_debug=function(debug_level){};
/**
 * Set debugging level
 * @param {Integral} [debug_level]	The debugging level to set.
 * @type	Integral
 * @return	{Number} debugging level now
 */
set_debug=function(debug_level){};
/**
 * Get the hash key of text.
 * @param {String} text	text to test
 * @return	{String}	hash key
 */
_get_hash_key=function(text){};
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
get_Function_name=function get_Function_name(fr, ns, force_load){};
/**
 * get new extend instance
 * @param	{String, object HTMLElement} [obj]	message area element or id
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
extend=function(obj, className_set){};
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
get_file=function(path, encoding){};
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
require_netscape_privilege=function require_netscape_privilege(privilege, callback){};
/**
 * 當需要要求權限時，是否執行。（這樣可能彈出對話框）
 * @type	Boolean
 */
require_netscape_privilege.enabled=true;
/**
 * 得知 script file 之相對 base path
 * @param	{String} JSFN	script file name
 * @return	{String} 相對 base path
 * @example
 * <script type="text/javascript" src="../baseFunc.js"></script>
 * //	引數為本.js檔名。若是更改.js檔名，亦需要同步更動此值！
 * var basePath=get_script_base_path('baseFunc.js');
 */
get_script_base_path=function(JSFN){};
/**
 * get the path of specified module
 * @param {String} module_name	module name
 * @param	{String} file_name	取得在同一目錄下檔名為 file_name 之 path。若填入 '' 可取得 parent 目錄。
 * @return	{String} module path
 */
get_module_path=function(module_name, file_name){};
/**
 * 轉化所有 /., /.., //
 * @since	2009/11/23 22:32:52
 * @param {String} path	欲轉化之 path
 * @return	{String} path
 */
simplify_path=function(path){};
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
 * @return	{Error object}
 * @return	-1	will execute callback after load
 * @return	{undefined}	no error, OK
 * @example
 * CeL.use('code.log', function(){..});
 * CeL.use(['code.log', 'code.debug']);
 * @note
 * 'use' 是 JScript.NET 的保留字
 */
use=function requires(module, callback, extend_to){};
/**
 * include other JavaScript/CSS files
 * @param {String} resource path
 * @param {Function|Object} callback	callback function / 	{callback: callback function, module: module name, global: global object when run callback}
 * @param {Boolean} [use_write]	use document.write() instead of insert a element
 * @param {Boolean} [type]	1: is a .css file, others: script
 */
include_resource=function include_resource(path, callback, use_write, type){};
/**
 * 已經 include_resource 了哪些 JavaScript 檔（存有其路徑）
 * loaded{路徑} = count
 * 本行可省略(only for document)
 */
include_resource.loaded;//null;
/**
 * 已經 include_resource 了多少個 JavaScript 檔
 * @type Number
 * 本行可省略(only for document)
 */
include_resource.count;//[Number
undefined]0;
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
include_module_resource=function(file_name, module_name){};
/**
 * 預先準備好下層 module 定義時的環境。<br/>
 * 請盡量先 call 上層 name-space 再定義下層的。
 * @param	{String} module_name	module name
 * @param	{Function} code_for_including	若欲 include 整個 module 時，需囊括之 code。
 * @return	null	invalid module
 * @return	{Object}	下層 module 之 name-space
 * @return	undefined	something error, e.g., 未成功 load，code_for_including return null, ..
 */
setup_module=function(module_name, code_for_including){};
/**
 * 是否 cache code。
 * 若不是要重構 code 則不需要。
 * @type	Boolean
 */
cache_code=false;
/**
 * 模擬 inherits
 * @param {String} module_name	欲繼承的 module_name
 * @param initial_arguments	繼承時的 initial arguments
 * @return
 * @see
 * <a href="http://fillano.blog.ithome.com.tw/post/257/17355" accessdate="2010/1/1 0:6">Fillano's Learning Notes | 物件導向Javascript - 實作繼承的效果</a>,
 * <a href="http://www.crockford.com/javascript/inheritance.html" accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>
 */
inherits=function(module_name, initial_arguments){};
/**
 * 將輸入的 string 分割成各 module 單元。<br/>
 * need environment_adapter()<br/>
 * ** 並沒有對 module 做完善的審核!
 * @param {String} module_name	module name
 * @return	{Array}	module unit array
 */
split_module_name=function(module_name){};
/**
 * 判斷 module 是否存在，以及是否破損。
 * @param	{String} module_name	module name
 * @return	{Boolean} module 是否存在以及良好。
 */
is_loaded=function(module_name){};
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
use_function=function(function_list, return_extend){};
/**
 * clone native Object
 * @param {Object} object
 * @param {Boolean} not_trivial
 * @return
 * @since	2008/7/19 11:13:10
 */
clone_object=function(object, not_trivial){};
/**
 * 測出各字元的出現率。
 * 普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
 * @param text	文檔
 * @return
 */
charCount=function(text){};
/**
 * 計算字數 word counts.
 * @param text
 * @param flag
 * @return
 */
wordCount=function(text, flag){};
/**
 * test if 2 string is at the same length
 * @param s1	string 1
 * @param s2	string 2
 * @return
 */
same_length=function(s1, s2){};
	/**
	 * 本 library / module 之 id
	 */
lib_name='debug';
/**
 * 輾轉相除 n1/n2 或 小數 n1/1 轉成 整數/整數
 * @param {Number} n1	number 1
 * @param {Number} [n2]	number 2
 * @param {Number} times	max 次數, 1,2,..
 * @return	{Array}	連分數序列 ** 負數視 _.mutual_division.done 而定!
 */
mutual_division=function mutual_division(n1, n2, times){};
/**
 * !!mode:連分數處理，對負數僅有最初一數為負。
 */
mutual_division.mode;//0;
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
continued_fraction=function(sequence, max_no){};
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
to_rational_number=function(number, rate, max_no){};
/**
 * Get GCD of 2 numbers
 * @param n1	number 1
 * @param n2	number 2
 * @return	GCD of the 2 numbers
 */
gcd=function(n1, n2){};
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
floor_sqrt=function(number){};
/**
 * 取得某數的質因數，因式分解/素因子分解, factorization, get floor factor.
 * 唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The Fundamental Theorem of Arithmeric) 的數學金科玉律。
 * @param {Number} number
 * @return	{Array} [prime1,power1,prime2,power2,..]
 * @see
 * <a href="http://homepage2.nifty.com/m_kamada/math/10001.htm" accessdate="2010/3/11 18:7">Factorizations of 100...001</a>
 * @requires	floor_sqrt
 */
factorization=function(number){};
/**
 * VBScript has a Hex() function but JScript does not.
 * @param {Number} number
 * @return	{String} number in hex
 * @example
 * alert('0x'+CeL.hex(16725))
 */
hex=function(number){};
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
complement=function(){};
/**
 * String pattern (e.g., "/a+/g") to RegExp pattern.
 * qq// in perl.
 * String.prototype.toRegExp = function(f) { return to_RegExp_pattern(this.valueOf(), f); };
 * @param {String} pattern	pattern text
 * @param {Boolean|String} [RegExp_flag]	flags when need to return RegExp object
 * @param {RegExp} [escape_pattern]	char pattern need to escape
 * @return	{RegExp} RegExp object
 */
to_RegExp_pattern=function(pattern, RegExp_flag, escape_pattern){};
/**
 * 取至小數 d 位，
 * 肇因： JScript即使在做加減運算時，有時還是會出現 1.4000000000000001、0.0999999999999998 等數值。此函數可取至 1.4 與 0.1
 * @param {Number} digits	1,2,..: number of decimal places shown
 * @param {Number} [max]	max digits	max===0:round() else floor()
 * @return
 * @see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 * IEEE754\u12398丸\u12417演算\u12399最\u12418報告\u12373\u12428\u12427ES3「\u12496\u12464」\u12391\u12354\u12427。
 * http://www.jibbering.com/faq/#FAQ4_6
 * @example
 * {var d=new Date,v=0.09999998,i=0,a;for(;i<100000;i++)a=v.to_fixed(2);alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));}
 */
to_fixed=function(digits, max){};
/**
 * check input string send to SQL server
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 */
checkSQLInput=function(string){};
/**
 * check input string send to SQL server 並去掉前後 space
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 */
checkSQLInput_noSpace=function(string){};
/**
 * 轉換字串成數值，包括分數等。分數亦將轉為分數。
 * @param {String} number	欲轉換之值
 * @return
 */
parse_number=function(number){};
/**
 * get CIDR data
 * @param {Number} CIDR	CIDR mask bits, 0~32
 * @param {String} IP	IPv4, e.g., 1.2.3.4
 * @return	CIDR data
 * @since	2010/4/21 22:56:16
 */
CIDR_to_IP=function(CIDR, IP){};
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
 */
set_net_info=function(to_s, from){};
/**
 * If HTML element has specified class
 * 
 * @param element	HTML elements
 * @param class_name	class name || {class name 1:, class name 2:, ..}
 * @return
 */
has_class=function(element, class_name){};
/**
 * bind/add listener<br/>
 * **	對同樣的 object，事件本身還是會依照 call add_listener() 的順序跑，不會因為 pFirst 而改變。
 * **	NOT TESTED!!
 * TODO:
 * removeEventListener
 * remove_listener()
 * @param type	listen to what event type
 * @param listener	listener function/function array/function string,
 * 				須 String 之 recursive function 時可 "(function(){return function f(){f();};})()"
 * 			function(e){var target=e?e.target:(e=window.event).srcElement;if(e.stopPropagation)e.stopPropagation();else e.cancelBubble=true;if(e.preventDefault)e.preventDefault();else e.returnValue=false;return false;}
 * @param [document_object]	bind/attach to what document object
 * @param [pFirst]	parentNode first
 * @return
 * @since	2010/1/20 23:42:51
 * @see
 * c.f., GEvent.add_listener()
 */
add_listener=function add_listener(type, listener, document_object, pFirst){};
/**
 * useCapture: parentNode first
 * @see
 * <a href="http://www.w3.org/TR/DOM-Level-3-Events/#event-flow" accessdate="2010/4/16 22:40">Document Object Model (DOM) Level 3 Events Specification</a>,
 * <a href="http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventTarget" accessdate="2010/4/16 22:42">Interface EventTarget</a>
 */
add_listener.pFirst=false;
/**
 * get (native) global listener adding function
 */
add_listener.get_adder=function(){};
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
add_listener.default_adder=function(type, listener, pFirst, document_object){};
/**
 * 將 BIG5 日文假名碼修改為 Unicode 日文假名
 * @param U
 * @return
 * @see
 * from Unicode 補完計畫 jrename.js
 */
Big5JPToUnicodeJP=function(U){};
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
scroll_to_show=function(o, p){};
/**
 * container object, list
 * @param o
 * @param l
 * @return
 */
menu_creater=function(o, l){};
/**
 * 切換 [input] / inputted [span]
 * @param {Boolean|undefined} to_input	切換至 input or not. default: 切換至 [input]
 * @return
 */
triggerToInput=function(to_input){};
/**
 * determine base path.
 * 給定 base path 的結構後，藉由 path_now 推測 base path 的 full path
 * @param {String} base_path_structure	base path 的範本結構
 * @param {String} path_now
 * @return	{String}	推測的 base path full path
 * @example
 * alert(dBasePath('kanashimi/www/cgi-bin/game/'));
 * @requres	reducePath,getPathOnly,dirSp,dirSpR
 */
dBasePath=function(base_path_structure, path_now){};
/**
 * cf: getFN()
 * @param {String} path	path name
 * @return
 */
parse_path=function(path){};
/**
 * is absolute or relative path, not very good solution
 * @param {String} path
 * @return
 * @requires	dirSp,dirSpR
 */
is_absolute_path=function(path){};
/**
 * 
 * @param FN
 * @param format
 * @param io_mode
 * @return
 */
open_template=function(FN, format, io_mode){};
/**
 * 靠常用字自動判別字串之編碼	string,預設編碼
 */
autodetectStringEncode=function(str){};
/**
 * 判斷為 DOM。
 * @param	name	various name @ name-space window. e.g., document, location
 * @return	{Boolean}	various is object of window
 * @since	2010/1/14 22:04:37
 */
is_DOM=function(name){};
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
JSalert=function(message, wait, title, type){};
/**
 * 取得[script_filename].wsf中不包括自己（[script_filename].js），其餘所有 .js 的code。
 * 若想在低版本中利用eval(get_all_functions(ScriptName))來補足，有時會出現奇怪的現象，還是別用好了。
 * @param {String} script_filename
 * @return
 * @requires	ScriptName,simpleRead
 */
get_all_functions=function(script_filename){};