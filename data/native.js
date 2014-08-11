
/**
 * @name	CeL function for native (built-in) objects.
 * @fileoverview
 * 本檔案包含了 native objects 的擴充功能。
 * @since	
 */

/*

http://www.hunlock.com/blogs/Ten_Javascript_Tools_Everyone_Should_Have

see:
https://github.com/andrewplummer/Sugar
*/

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'data.native',
//require : '',
code : function(library_namespace) {

//	requiring
//var parse_escape;
//eval(this.use());


/**
 * null module constructor
 * @class	native objects 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};


/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};

// 基本上與程式碼設計合一，僅表示名義，不可更改。
var NOT_FOUND = -1;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//

// cache
var set_method = library_namespace.set_method,
//https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
SUPERSCRIPT_NUMBER = superscript_integer.map = (superscript_integer.digits = '⁰¹²³⁴⁵⁶⁷⁸⁹').split(''),
SUBSCRIPT_NUMBER = subscript_integer.map = (subscript_integer.digits = '₀₁₂₃₄₅₆₇₈₉').split('');

SUPERSCRIPT_NUMBER['+'] = '⁺';
SUPERSCRIPT_NUMBER['-'] = '⁻';
SUBSCRIPT_NUMBER['+'] = '₊';
SUBSCRIPT_NUMBER['-'] = '₋';

function superscript_integer() {
	var v = [];
	String(this | 0).split('').forEach(function(i) {
		v.push(SUPERSCRIPT_NUMBER[i]);
	});
	return v.join('');
}

function subscript_integer() {
	var v = [];
	String(this | 0).split('').forEach(function(i) {
		v.push(SUBSCRIPT_NUMBER[i]);
	});
	return v.join('');
}




/**
 * padding / fill.<br />
 * 將 string 以 character 補滿至長 length。<br />
 * TODO:
 * 效能測試:與 "return n > 9 ? n : '0' + n;" 相較。
 * 
 * @example <code>
 * CeL.assert([CeL.pad(23,5),'00023']);
 * //	null string
 * CeL.assert([''.pad(5),'     ']);
 * //	basic test
 * CeL.assert(['sa'.pad(5),'   sa']);
 * CeL.assert(['23'.pad(5),'00023']);
 * CeL.assert(['2347823'.pad(5),'2347823']);
 * CeL.assert(['23'.pad(4,'s',1),'23ss']);
 * //	character.length > 1
 * CeL.assert(['23'.pad(6,'01'),'010123']);
 * CeL.assert(['23'.pad(6,'012'),'012023']);
 * CeL.assert(['2347823'.pad(5,'01'),'2347823']);
 * CeL.assert(['23'.pad(6,'12',1),'231212']);
 * </code>
 * 
 * @param {String}string
 *            基底 string。
 * @param {Integer}length
 *            補滿至長 length。
 * @param {String}character
 *            以 character 補滿。
 * @param {Boolean}from_right
 *            補滿方向。基本為 5 → ' 5'，設定 from_right 時，為 5 → '5 '。
 * 
 * @since	2012/3/25 19:46:42
 * 
 * @returns {String} padding 過後之 string
 */
function pad(string, length, character, from_right) {
	// 為負數作特殊處理。
	// e.g., pad(-9, 3) === '-09'
	if (typeof string === 'number' && string < 0
	//
	&& !from_right && (!character || character == '0'))
		return '-' + pad(-string, length - 1, '0');

	string = String(string);

	// 差距。
	var gap = length - string.length;
	if (gap > 0) {
		//library_namespace.debug(gap + ' [' + character + ']');
		if (!character || typeof character !== 'string')
			character = typeof character === 'number' ? String(character)
					: string === '' || isNaN(string) ? ' ' : '0';

		var l = character.length,
		/**
		 * TODO: binary extend.<br />
		 * .join() is too slow.
		 */
		fill = new Array(l > 1 ? Math.ceil(gap / l) : gap);
		//library_namespace.debug('fill.length = ' + fill.length);

		if (from_right) {
			fill[0] = string;
			fill.length++;
			string = fill.join(character);
			if (string.length > length)
				string = string.slice(0, length);
		} else if (l > 1) {
			fill.length++;
			string = fill.join(character).slice(0, gap) + string;
		} else {
			fill.push(string);
			string = fill.join(character);
		}
	}
	return string;
}

_.pad = pad;




/*
	function經ScriptEngine會轉成/取用'function'開始到'}'為止的字串

	用[var thisFuncName=parse_function().funcName]可得本身之函數名
	if(_detect_)alert('double run '+parse_function().funcName+'() by '+parse_function(arguments.callee.caller).funcName+'()!');

You may use this.constructor


TODO:
to call: parse_function(this,arguments)
e.g., parent_func.child_func=function(){var name=parse_function(this,arguments);}

bug:
函數定義 .toString() 時無法使用。
*/
_// JSDT:_module_
.
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
 * @_memberOf	_module_
 * @since	2010/5/16 23:04:54
 */
parse_function = function parse_function(function_name, flag) {
	if (!function_name
			&& typeof (function_name = parse_function.caller) !== 'function')
		return;
	if (typeof function_name === 'string'
			&& !(function_name = library_namespace.get_various(function_name)))
		return;

	var fs = String(function_name), m = fs.match(/^function[\s\n]+(\w*)[\s\n]*\(([\w,\s\n]*)\)[\s\n]*\{[\s\n]*([\s\S]*)[\s\n]*\}[\s\n]*$/);
	//library_namespace.debug(typeof function_name + '\n' + fs + '\n' + m);

	// detect error, 包含引數
	// 原先：functionRegExp=/^\s*function\s+(\w+) ..
	// 因為有function(~){~}這種的，所以改變。
	if (!m)
		// JScript5 不能用throw!
		// http://www.oldversion.com/Internet-Explorer.html
		throw new Error(1002, 'Syntax error (語法錯誤)');

	if (function_name != m[1])
		library_namespace.warn('Function name unmatch (函數名稱不相符，可能是用了reference？)');

	//library_namespace.debug('function ' + m[1] + '(' + m[2] + '){\n' + m[3] + '\n}');

	return {
		string : fs,
		name : m[1],
		// 去除前後空白
		arguments : m[2].replace(/[\s\n]+/g, '').split(','),
		code : m[3]
	};
};




//	補強 String.fromCharCode()
function fromCharCode(c) {
	if (!isNaN(c))
		return String.fromCharCode(c);
	try {
		// 直接最快
		return eval('String.fromCharCode(' + c + ');');
	} catch (e) {
	}

/*
if (typeof c == 'string')
	return eval('String.fromCharCode(' + n + ')');// c=c.split(','); 後者可以通過審查
if (typeof c == 'object') {
	var t = '', d, i, a, n = [];
	if (c.length)
		a = c;
	else {
		a = [];
		for (i in c)
			a.push(c[i]);
	}
	for (i = 0; i < a.length; i++)
		if (!isNaN(c = a[i]) || !isNaN(c = ('' + a[i]).charCodeAt(0)))
			n.push(c); // 跳過無法判讀的值
	return eval('String.fromCharCode(' + n + ')');//n.join(',')	這樣較快
}
*/
};





_// JSDT:_module_
.
/**
 * 對付有時 charCodeAt 會傳回 >256 的數值。
 * 若確定編碼是 ASCII (char code 是 0~255) 即可使用此函數替代 charCodeAt。
 * @param text	string
 * @param position	at what position
 * @return
 * @since	2008/8/2 10:10:49
 * @see
 * http://www.alanwood.net/demos/charsetdiffs.html
 * @_memberOf	_module_
 */
toASCIIcode = function (text, position) {
	var _f = arguments.callee, c;

	if (!_f.t) {
		// initial
		var i = 129, t = _f.t = [], l = {
			8364 : 128,
			8218 : 130,
			402 : 131,
			8222 : 132,
			8230 : 133,
			8224 : 134,
			8225 : 135,
			710 : 136,
			8240 : 137,
			352 : 138,
			8249 : 139,
			338 : 140,
			381 : 142,
			8216 : 145,
			8217 : 146,
			8220 : 147,
			8221 : 148,
			8226 : 149,
			8211 : 150,
			8212 : 151,
			732 : 152,
			8482 : 153,
			353 : 154,
			8250 : 155,
			339 : 156,
			382 : 158,
			376 : 159
		};
		for (; i < 256; i += 2)
			t[i] = i;
		for (i in l)
			// sl(i+' = '+l[i]),
			t[Math.floor(i)] = l[i];
	}

	if (position < 0 && !isNaN(text))
		c = text;
	else
		c = text.charCodeAt(position || 0);

	return c < 128 ? c : (_f.t[c] || c);
};


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
function encodeUC(u, enc) {
	if (!enc || enc == 'utf8')
		return encodeURI(u);

	var i = 0, c = new ActiveXObject("ADODB.Stream"), r = [];
	// adTypeText;
	c.Type = 2;
	c.Charset = enc;
	c.Open();
	c.WriteText(u);
	c.Position = 0;
	c.Charset = 'iso-8859-1';
	u = c.ReadText();
	c.Close();

	for (; i < u.length; i++)
		r.push((c = u.charCodeAt(i)) < 128 ? u
				.charAt(i) : '%'
				+ toASCIIcode(c, -1).toString(16)
				.toUpperCase());

	return r.join('').replace(/ /g, '+');
}




_// JSDT:_module_
.
/**
 * String pattern (e.g., "/a+/g") to RegExp pattern.
 * cf. qq// in perl.
 * 
 * String.prototype.to_RegExp_pattern = function(f) { return to_RegExp_pattern(this.valueOf(), f); };
 * 
 * @param {String} pattern	pattern text.
 * @param {RegExp} [escape_pattern]	char pattern need to escape.
 * @param {Boolean|String} [RegExp_flag]	flags when need to return RegExp object.
 * 
 * @return	{String|RegExp} escaped RegExp pattern or RegExp object.
 */
to_RegExp_pattern = function(pattern, escape_pattern, RegExp_flag) {
	var r = pattern
		// 不能用 $0
		.replace(escape_pattern || /([.+*?|()\[\]\\{}])/g, '\\$1')
		// 這種方法不完全，例如對 /^\s+|\s+$/g
		.replace(/^([\^])/, '\\^').replace(/(\$)$/, '\\$');
	return RegExp_flag ? new RegExp(r, /^[igms]+$/i.test(RegExp_flag) ? RegExp_flag : '') : r;
};




/**
 * 將 String pattern (e.g., "/a+/g") 轉成 RegExp。<br />
 * TODO:<br />
 * and, or, not.<br />
 * (?:(^|\s*\|)\s*(!)?(\/(?:[^\/]+|\\\/)(\/([a-z]*))?|\\([^\s]+)|[^\s]+))+<br />
 * {Object|Array}preprocessor<br />
 * 
 * @param {String}pattern
 *            欲轉換成 RegExp 的 pattern text。
 * @param {Function|String}[unknown_handler]
 *            當遇到不明 pattern 時的處理程序。若輸入 ('/..', 'flag') 則會將之當作 flag。
 * @returns {RegExp} RegExp object。
 * 
 * @since 2012/10/13 10:22:20
 */
function String_to_RegExp(pattern, unknown_handler) {
	if (typeof pattern === 'string') {
		if (typeof String_to_RegExp.preprocessor === 'function')
			pattern = String_to_RegExp.preprocessor(pattern);

		if (typeof pattern === 'string' && pattern.length > 1)
			if (pattern.charAt(0) === '/') {
				library_namespace.debug('Treat [' + pattern + '] as RegExp.', 3, 'String_to_RegExp');
				var m = pattern.match(/^\/(.+)\/([a-z]*)$/),
				//	設定 flag。
				flag = m ? m[2] : typeof unknown_handler === 'string' ? unknown_handler : String_to_RegExp.default_flag;

				try {
					try {
						pattern = new RegExp(m ? m[1] : pattern.slice(1), flag);
					} catch (e) {
						try {
							if (m) {
								//	設定絕對可接受的 flag，或完全不設定。
								pattern = new RegExp(m[1]);
								library_namespace.warn('String_to_RegExp: Invalid flags: [' + flag + ']');
							} else
								throw 1;
						} catch (e) {
							library_namespace.warn('String_to_RegExp: Illegal pattern: [' + m[1] + ']');
						}
					}
				} catch (e) {
					library_namespace.debug('Error: [' + pattern + '] 並非 RegExp？' + e.message, 2, 'String_to_RegExp');
				}

			} else if (pattern.charAt(0) === '\\' && typeof library_namespace.wildcard_to_RegExp === 'function') {
				library_namespace.debug('Treat [' + pattern + '] as wildcard search string.', 3, 'String_to_RegExp');
				pattern = new RegExp(library_namespace.wildcard_to_RegExp(pattern));
			}

		if (typeof pattern === 'string')
			try {
				pattern = typeof unknown_handler === 'function' ? unknown_handler(pattern)
						// default unknown handler.
						: new RegExp(pattern
								//.replace(/,/g, '|')
						);
			} catch (e) {
				library_namespace.debug('無法轉換 [' + pattern + ']', 3, 'String_to_RegExp');
			}
	}

	return pattern;
}

String_to_RegExp.default_flag = 'i';

// 前置處理。
String_to_RegExp.preprocessor = function(pattern) {
	var m;
	if (pattern.length < 800
			&& (m = pattern.match(/^／((?:＼／|[^\\\/|?*":<>／\0-\x1f]+)+)／([a-z]*)(?:\.[^.]+)?$/)))
		try {
			/**
			 * @see application.net.to_file_name()
			 */
			library_namespace.debug('因為 pattern ['+pattern+'] 以 "／" 起首，可能是以 directory name / file name 充當 pattern，嘗試將之還原為 regular pattern。', 2, 'String_to_RegExp.preprocessor');

			pattern = new RegExp(m[1]
			// functional characters
			.replace(/＼/g, '\\')
			.replace(/／/g, '/')
			.replace(/｜/g, '|')
			.replace(/？/g, '?')
			.replace(/＊/g, '*')
			//
			.replace(/((?:^|[^\\])(?:\\\\)*)\\([\\\/|?*])/g,
				function($0, $1, $2) {
					return $1 + '[\\$2' + {
						'\\' : '＼',
						'/' : '／',
						'|' : '｜',
						'?' : '？',
						'*' : '＊'
					}[$2] + ']';
				})

			// normal characters
			.replace(/＂/g, '["＂]')
			.replace(/：/g, '[:：]')
			.replace(/＜/g, '[<＜]')
			.replace(/＞/g, '[>＞]')

			//	control characters
			.replace(/_/g, '[_\\r\\n\\t\\f\\v]'), m[2]);

		} catch (e) {
		}

	return pattern;
};


/**
 * 將 string 轉成 search pattern，並回傳是否 matched。
 * 
 * @param {String}pattern
 *            欲轉換成 RegExp 的 pattern。
 * @param {String}[text]
 *            欲測試的 text。
 * @param {Function}[unknown_handler]
 *            當遇到不明 pattern 時的處理程序。
 * @returns 是否 matched。
 * 
 * @since 2012/10/13 10:22:20
 */
function is_matched(pattern, text, unknown_handler) {
	pattern = String_to_RegExp(pattern, unknown_handler);

	if (typeof text !== 'string')
		if (typeof text === 'undefined' || text === null)
			return pattern;
		else
			text = String(text);

	return library_namespace.is_RegExp(pattern) ? text.match(pattern)
			: text.indexOf(String(pattern)) !== NOT_FOUND;
}

_.is_matched = is_matched;


/**
 * 重新設定 RegExp object 之 flag.
 * change the flag of a RegExp instances.
 * @param {RegExp}regexp	RegExp object to set
 * @param {String}flag	flag of RegExp
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
 * if(r.test(a))library_namespace.debug(a.replace(r,'_'));
 * 
 * //	delete r.lastIndex; 無效，得用 r.lastIndex=0; 因此下面的亦可：
 * if(r.global)r.lastIndex=0;
 * if(r.test(a)){~}
 * 
 * @see
 * http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx,
 * 如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test 會略過 lastIndex 值，並從字串之首開始搜尋。
 * http://www.aptana.com/reference/html/api/RegExp.html
 * @_memberOf	_module_
 */
function renew_RegExp_flag(regexp, flag) {
	var i, flag_set = {
		global : 'g',
		ignoreCase : 'i',
		multiline : 'm'
	};

	// 未指定 flag: get flag
	if (!flag) {
		flag = '';
		for (i in flag_set)
			if (regexp[i])
				flag += flag_set[i];
		return flag;
	}

	var a = flag.charAt(0), F = '', m;
	a = a === '+' ? 1 : a === '-' ? 0 : (F = 1);

	if (F)
		// 無 [+-]
		F = flag;
	else
		// f: [+-]~ 的情況，parse flag
		for (i in flag_set)
			if ((m = flag.indexOf(flag_set[i], 1) != NOT_FOUND) && a || !m
					&& regexp[i])
				F += flag_set[i];

	// for JScript<=5
	try{
		return new RegExp(regexp.source, F);
	}catch (e) {
		// TODO: handle exception
	}
};

_// JSDT:_module_
.
renew_RegExp_flag = renew_RegExp_flag;


/*	2004/5/27 16:08
	將 MS-DOS 萬用字元(wildcard characters)轉成 RegExp, 回傳 pattern
	for search

usage:
	p=new RegExp(wildcard_to_RegExp('*.*'))


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
wildcard_to_RegExp.w_chars = '*?\\[\\]';

function wildcard_to_RegExp(p, f) { // pattern, flag

	if (library_namespace.is_RegExp(p))
		return p;
	if (!p || typeof p !== 'string')
		return;

	var ic = wildcard_to_RegExp.w_chars, r;
	if ((f & 1) && !new RegExp('[' + ic + ']').test(p))
		return p;

	ic = '[^' + ic + ']';
	r = p
		//	old: 考慮 \
		//.replace(/(\\*)(\*+|\?+|\.)/g,function($0,$1,$2){var c=$2.charAt(0);return $1.length%2?$0:$1+(c=='*'?ic+'*':c=='?'?ic+'{'+$2.length+'}':'\\'+$2);})

		//	處理目錄分隔字元：多轉一，'/' → '\\' 或相反
		.replace(/[\\\/]+/g, library_namespace.env.path_separator)

		//	在 RegExp 中有作用，但非萬用字元，在檔名中無特殊作用的
		.replace(/([().^$\-])/g, '\\$1')

		//	* 代表任意檔案字元
		.replace(/\*+/g, '\0*')

		//	? 代表一個檔案字元
		.replace(/\?+/g, function($0) {
			return '\0{' + $0.length + '}';
		})

		//	translate wildcard characters
		.replace(/\0+/g, ic)

		//	[ ] 代表選擇其中一個字元
		//pass

		//	[! ] 代表除外的一個字元
		.replace(/\[!([^\]]*)\]/g, '[^$1]')
		;


	// 有變化的時候才 return RegExp
	if (!(f & 1) || p !== r)
		try {
			p = new RegExp(f & 2 ? '^' + r + '$' : r, 'i');
		} catch (e) {
			//	輸入了不正確的 RegExp：未預期的次數符號等
		}

	return p;
}

function remove_Object_value(object, value) {
	for ( var i in object)
		if (object[i] === value)
			delete object[i];
}

_// JSDT:_module_
.
remove_Object_value = remove_Object_value;


//	string & Number 處理	-----------------------------------------------


function split_String_by_length_(s, l, m) {
	// less than,great than,index,left count index(left length now),text
	// now,text index
	var lt, lt2, gt, i = 0, c = l, t = '', I = 0;
	while (I < s.length) {
		// 將lt,gt定在下一label之首尾,i為下一次搜尋起點.label定義:/<.+?>/
		if (i != -1)
			if ((lt = s.indexOf('<', i)) != NOT_FOUND) {
				if ((gt = s.indexOf('>', lt + 1)) == NOT_FOUND)
					i = lt = NOT_FOUND;
				else {
					i = gt + 1;
					while (lt != NOT_FOUND && (lt2 = s.indexOf('<', lt + 1)) != NOT_FOUND
							&& lt2 < gt)
						lt = lt2;
				}
			} else
				i = lt = NOT_FOUND;
		if (false && s.indexOf('') != NOT_FOUND)
			alert(i + ',' + lt + ',' + gt + ';' + l + ',' + c + '\n' + t);
		if (lt == NOT_FOUND)
			gt = lt = s.length;
		// 未來:考慮中英文大小，不分隔英文字。前提:'A'<'z'..或許不用
		while (I + c <= lt) {
			t += s.substr(I, c) + (m ? '\n' : '<br />');
			I += c;
			c = l;
		}
		t += s.slice(I, gt + 1);
		c -= lt - I;
		I = gt + 1;
	}
	return t;
}
/*	將字串以長l分隔
	m==0: html用, 1:text
*/
//split_String_by_length[generateCode.dLK]='split_String_by_length_';
function split_String_by_length(l, m) {
	var s = this.valueOf(), t = [], sp = '<br />';
	if (!s || !l || l < 1
	// ||!String.charCodeAt: for v5.5
	|| !String.fromCharCode)
		return m ? s.gText() : s;
	// (m):這樣就不用再費心思了.不過既然都作好了,就留著吧..不,還是需要
	s = s.turnU(m);
	if (s.length <= l)
		return s;
	if (!m)
		s = s.replace(/<w?br([^>]*)>/gi, sp);

	s = s.split(sp = m ? '\n' : sp);// deal with line
	try {
		// 預防JS5不能push
		for (var i = 0; i < s.length; i++)
			t.push(split_String_by_length_(s[i], l, m));
	} catch (e) {
		return this.valueOf();
	}
	return t.join(sp);
}


/**
 * get string between head and foot.<br />
 * 取得 text 中，head 與 foot 之間的字串。不包括 head 與 foot。<br />
 * 可以 [3] last index 是否回傳 NOT_FOUND (-1) 檢測到底是有找到，只是回傳空字串，或是沒找到。
 * 
 * @example <code>

CeL.assert([ '0123456789123456789'.between('567', '345'), '8912' ]);
CeL.assert([ '0123456789123456789'.between('567', '89'), '' ]);
CeL.assert([ '0123456789123456789'.between('54'), '' ]);
CeL.assert([ CeL.get_intermediate([ '0123456789123456789', '54' ])[3], -1 ]);
CeL.assert([ '0123456789123456789'.between('567'), '89123456789' ]);
CeL.assert([ '0123456789123456789'.between(null, '345'), '012' ]);

 * </code>
 * 
 * @param {Array}data
 *            [ text 欲篩選字串, head 首字串, foot 尾字串, start index ]
 * 
 * @returns [ 0: text 欲篩選字串, 1: head 首字串, 2: foot 尾字串, 3: last index, 4: head 與 foot 之間的字串 ]
 * 
 * @since 2014/8/4 21:34:31
 */
function get_intermediate_Array(data) {
	if (data && data[0]
	// = String(data[0])
	) {
		// start index of intermediate. 
		var index;
		if (!data[1])
			index = 0;
		else if ((index = data[0].indexOf(data[1], data[3])) !== NOT_FOUND)
			index += data[1].length;
		library_namespace.debug('head index: ' + index, 4);

		if((data[3] = index) !== NOT_FOUND
				&& (!data[2] || (data[3] = data[0].indexOf(data[2], index)) !== NOT_FOUND))
			data[4] = data[2] ? data[0].slice(index, data[3])
			//
			: index ? data[0].slice(index)
			//
			: data[0];
	}
	return data;
}

/**
 * get string between head and foot.<br />
 * 取得 text 中，head 與 foot 之間的字串。不包括 head 與 foot。<br />
 * 可以是否回傳 undefined 檢測到底是有找到，只是回傳空字串，或是沒找到。
 * 
 * @example <code>

CeL.assert([ '0123456789123456789'.between('567', '345'), '8912' ]);
CeL.assert([ '0123456789123456789'.between('567', '89'), '' ]);
CeL.assert([ '0123456789123456789'.between('54'), '' ]);
CeL.assert([ CeL.get_intermediate('0123456789123456789', '54'), undefined ]);
CeL.assert([ '0123456789123456789'.between('567'), '89123456789' ]);
CeL.assert([ '0123456789123456789'.between(null, '345'), '012' ]);

 * </code>
 * 
 * @param {String}text
 *            欲篩選字串。
 * @param {String}[head]
 *            首字串。
 * @param {String}[foot]
 *            尾字串。
 * 
 * @returns head 與 foot 之間的字串。
 * 
 * @since 2014/7/26 11:28:18
 */
function get_intermediate(text, head, foot, index, return_data) {
	if (return_data)
		// [ last index, head 與 foot 之間的字串 ]
		return_data = [ NOT_FOUND, ];

	if (text
	// = String(text)
	) {
		// start index of intermediate. 
		if (!head)
			index = 0;
		else if ((index = text.indexOf(head, index | 0)) !== NOT_FOUND)
			index += head.length;
		library_namespace.debug('head index: ' + index, 4);

		if (index !== NOT_FOUND
				&& (!foot || (foot = text.indexOf(foot, index)) !== NOT_FOUND)) {
			head = foot ? text.slice(index, foot) : index ? text.slice(index)
					: text;
			if (return_data)
				return_data = [ foot || text.length, head ];
			else
				return head;
		}
	}

	if (return_data)
		return return_data;
}

_.get_intermediate = get_intermediate;

/*

var data = html.set_intermediate('>', '<'), text;

text = data.find().find().find().toString();

while (data.next()) {
	text = data.toString();
}

while (typeof (text = data.find()) === 'string') {
	;
}

*/
function next_intermediate(index) {
	if (this[3] !== NOT_FOUND) {
		var data = get_intermediate(this[0], this[1], this[2], this[3], true);
		library_namespace.debug('Get [' + data + ']', 4);
		if((this[3] = data[0]) !== NOT_FOUND) {
			this[4] = data[1];
			return this;
		}
	}
}
function find_intermediate(index) {
	this.next();
	return this;
}
function intermediate_result() {
	return this[3] !== NOT_FOUND && this[4] || '';
}
function intermediate_between() {
	return String.prototype.between.apply(this.toString(), arguments);
}
function set_intermediate(head, foot) {
	var data = [ this, head, foot ];
	data.next = next_intermediate;
	data.find = find_intermediate;
	data.toString = intermediate_result;
	//data.between = intermediate_between;
	return data;
}


//---------------------------------------------------------------------//


function set_bind(handler, need_meny_arg) {
	return need_meny_arg ?
	function(args) {
		if(arguments.length < 2)
			return handler(this, args);

		// Array.from()
		args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		return handler.apply(handler, args);
	}
	:
	function(args) {
		return handler(this, args);
	};
}

function set_bind_valueOf(handler, need_meny_arg) {
	var ReturnIfAbrupt = function (v) {
		//尚有未竟之處。
		switch (library_namespace.is_type(v)) {
		case 'Boolean':
		case 'Number':
		case 'String':
			v = v.valueOf();
		}
		return v;
	};
	return need_meny_arg ?
	function(args) {
		if(arguments.length < 2)
			return handler(ReturnIfAbrupt(this), args);

		// Array.from()
		args = Array.prototype.slice.call(arguments);
		args.unshift(ReturnIfAbrupt(this));
		return handler.apply(handler, args);
	}
	:
	function(args) {
		return handler(ReturnIfAbrupt(this), args);
	};
}

// ReturnIfAbrupt
var need_valueOf = false;
String.prototype.test_valueOf =
(function() {
	return function(){if(typeof this!=='string')if(this&&typeof this.valueOf()==='string')need_valueOf=true;else library_namespace.err('set_bind: 無法判別是否該使用 .valueOf()！');};
})();
'.'.test_valueOf();
String.prototype.test_valueOf = undefined;
try {
	delete String.prototype.test_valueOf;
} catch (e) {}

_.set_bind = need_valueOf ? set_bind_valueOf : set_bind;


//	TODO: use CeL.object_hash()
// array,sortFunction
function unique_Array(a, f) {
	if (f)
		a.sort(f);
	else
		a.sort();

	var i = 1, j = -1;
	for (; i < a.length; i++)
		if (a[i] === a[i - 1]) {
			if (j < 0)
				j = i;
		} else if (j >= 0)
			a.splice(j, i - j), i = j, j = -1;

	if (j >= 0)
		a.splice(j, i - j);
	return a;
}


/**
 * Count occurrence of $search in string.<br />
 * 計算 string 中出現 search 之次數。<br />
 * 
 * 用 s/// 亦可 @ perl
 * 
 * @param {String}string
 *            在 string 中搜尋。
 * @param {String|RegExp}search
 *            搜尋對象。
 * @param {Integer}[position]
 *            開始搜尋的位置(start index)。
 * 
 * @returns {Integer} string 中出現 search 之次數。
 * 
 * @see http://jsperf.com/count-string-occurrence-in-string,
 *      http://jsperf.com/count-the-number-of-occurances-in-string
 *      http://stackoverflow.com/questions/881085/count-the-number-of-occurences-of-a-character-in-a-string-in-javascript
 * 
 * @since 2013/2/13 11:12:38 重構
 * @since 2014/8/11 12:54:34 重構
 */
function count_occurrence(string, search, position) {
	// 正規化 position 成 index (0, 1, ..)。
	// 注意:過大的 position 在 |0 時會變成負數!
	if (isNaN(position) || (position |= 0) < 0)
		position = 0;

	if (position > 0)
		string = string.slice(position);

	return string.split(search).length - 1;

	// 以下放棄。

	if (library_namespace.is_RegExp(search))
		return (string = (position > 0 ? string.slice(position) : string)
				.match(search)) ? string.length : 0;

	// 正規化 search。
	if (!search || !(search = String(search)))
		return 0;

	// 使用 String.prototype.indexOf (searchString, position)
	var count = 0, length = search.length;

	while ((position = string.indexOf(search, position)) !== NOT_FOUND)
		count++, position += length;

	return count;
}


/**
 * 取至小數 digits 位， 肇因： JScript即使在做加減運算時，有時還是會出現 3*1.6=4.800000000000001,
 * 2.4/3=0.7999999999999999 等數值。此函數可取至 1.4 與 0.1。 c.f., round()
 * 
 * @param {Number}
 *            [decimals] 1,2,..: number of decimal places shown
 * @param {Number}
 *            [max] max decimals max===0:round() else floor()
 * @return
 * 取至小數 digits 位後之數字。
 * 
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 *      IEEE754の丸め演算は最も報告されるES3「バグ」である。
 *      http://www.jibbering.com/faq/#FAQ4_6
 *      http://en.wikipedia.org/wiki/Rounding
 * 
 * @example <code>
 * var d=new Date,v=0.09999998,i=0,a;
 * for(;i<100000;i++)a=v.to_fixed(2);
 * alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));
 * </code>
 * 
 * @_memberOf _module_
 */
function slow_to_fixed(decimals, max) {
	var value = this.valueOf(), i, negative;

	if (isNaN(value))
		return value;

	if (isNaN(decimals) || (decimals = Math.floor(decimals)) < 0)
		// 內定：8位
		decimals = 8;
	else if (decimals > 20)
		decimals = 20;

	if (!max && Number.prototype.toFixed)
		return parseFloat(value.toFixed(decimals).replace(/\.?0+$/, ''));

	if (value < 0)
		// 負數
		negative = true, value = -value;

	value = value.toString(10);
	i = value.indexOf('e');
	if (i !== NOT_FOUND) {
		// e-\d: 數字太小.
		return value.charAt(i + 1) === '-' ? 0 : value;
	}

	library_namespace.debug(value, 2);
	// TODO: using +.5 的方法
	// http://clip.artchiu.org/2009/06/26/%E4%BB%A5%E6%95%B8%E5%AD%B8%E7%9A%84%E5%8E%9F%E7%90%86%E8%99%95%E7%90%86%E3%80%8C%E5%9B%9B%E6%8D%A8%E4%BA%94%E5%85%A5%E3%80%8D/
	i = value.indexOf('.');
	if (i !== NOT_FOUND && i + 1 + decimals < value.length) {
		if (max) {
			value = '00000000000000000000'
					+ Math.round(
							value.slice(0, i++) + value.substr(i, decimals) + '.'
									+ value.charAt(i + decimals)).toString(10);
			if (value != 0)
				library_namespace.debug(value + ',' + value.length + ','
						+ decimals + ',' + value.substr(0, value.length - decimals)
						+ ',' + value.substr(max), 2);
			max = value.length - decimals;
			value = value.slice(0, max) + '.' + value.substr(max);
		} else
			value = value.slice(0, i + 1 + decimals);
	}

	return value ? parseFloat((negative ? '-' : '') + value) : 0;
}
/*	old:very slow
function to_fixed(d,m){
 var v=this.valueOf(),i;if(isNaN(v))return v;
 if(isNaN(d)||d<0)d=8;	//	內定：8位
 if(!m){
  v=Math.round(Math.pow(10,d)*v);v=v<0?'-'+'0'.repeat(d)+(-v):'0'.repeat(d)+v;
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


/**
 * 取至小數 digits 位， 肇因： JScript即使在做加減運算時，有時還是會出現 3*1.6=4.800000000000001,
 * 2.4/3=0.7999999999999999 等數值。此函數可取至 1.4 與 0.1，避免 <a href="http://en.wikipedia.org/wiki/Round-off_error" accessdate="2012/9/19 22:21" title="Round-off error">round-off error</a>。<br>
 * c.f., Math.round()
 * 
 * @param {Number}
 *            [decimals] 1,2,..: number of decimal places shown.
 * @return
 * 取至小數 digits 位後之數字。
 * 
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 *      IEEE754の丸め演算は最も報告されるES3「バグ」である。
 *      http://www.jibbering.com/faq/#FAQ4_6
 *      http://en.wikipedia.org/wiki/Rounding
 * 
 * @example <code>
 * var d=new Date,v=0.09999998,i=0,a;
 * for(;i<100000;i++)a=v.to_fixed(2);
 * alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));
 * </code>
 * 
 * @_memberOf _module_
 */
function native_to_fixed(decimals) {
	//	(21.1*2006).toFixed(11) === "42326.60000000001"
	//	(21.1*200006).toFixed(9)==="4220126.600000001"
	//	256738996346789.1.toFixed(10)==="256738996346789.0937500000"
	return decimals <= 0 ? Math.round(this) : parseFloat(this.toFixed(decimals || 12));
}

var to_fixed = slow_to_fixed;
_.to_fixed = slow_to_fixed;


//var sourceF=WScript.ScriptName,targetF='test.js';simpleWrite('tmp.js',alert+'\n'+simpleRead+'\n'+simpleWrite+'\nvar t="",ForReading=1,ForWriting=2,ForAppending=8\n,TristateUseDefault=-2,TristateTrue=-1,TristateFalse=0\n,WshShell=WScript.CreateObject("WScript.Shell"),fso=WScript.CreateObject("Scripting.FileSystemObject");\nt='+dQuote(simpleRead(sourceF),80)+';\nsimpleWrite("'+targetF+'",t);//eval(t);\nalert(simpleRead("'+sourceF+'")==simpleRead("'+targetF+'")?"The same (test dQuote OK!)":"Different!");');//WshShell.Run('"'+getFolder(WScript.ScriptFullName)+targetF+'"');
//	determine quotation mark:輸入字串，傳回已加'或"之字串。
/*
dQuote.qc=function(c,C){
	return c<32?'\\'+c:C;
};

TODO:
use JSON.stringify()

*/
//string,分割長度(會採用'~'+"~"的方式),separator(去除末尾用)
function dQuote(s, len, sp) {
	var q;
	s = String(s);
	if (sp)
		// 去除末尾之sp
		s = s.replace(new RegExp('[' + sp + ']+$'), '');
	if (isNaN(len) || len < 0)
		len = 0;
	if (len) {
		var t = '';
		for (; s;)
			t += '+' + dQuote(s.slice(0, len))
			// '\n':line_separator
			+ '\n', s = s.substr(len);
		return t.substr(1);
	}

	// test用
	if (false && len) {
		var t = '';
		for (; s;)
			t += 't+=' + dQuote(s.slice(0, len)) + '\n', s = s.substr(len);
		return t.substr(3);
	}

	s = s.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n')
	// \b,\t,\f

	// 轉換控制字符
	.replace(
			/([\0-\37\x7f\xff])/g,
			function($0, $1) {
				var c = $1.charCodeAt(0);
				return c < 64 ? '\\' + c.toString(8) : '\\x'
						+ (c < 16 ? '0' : '') + c.toString(16);
			})
	// .replace(/([\u00000100-\uffffffff])/g, function($0, $1) {})
	;
	if (false) {
		q = s.length;
		while (s.charAt(--q) == sp)
			;
		s = s.slice(0, q + 1);
	}
	if (s.indexOf(q = "'") != NOT_FOUND)
		q = '"';
	if (s.indexOf(q) != NOT_FOUND) {
		library_namespace.debug(
		//
		"Can't determine quotation mark, the resource may cause error.\n" + s);
		s = s.replace(new RegExp(q = "'", 'g'), "\\'");
	}
	return q + s + q;
}


_// JSDT:_module_
.
/**
 * check input string send to SQL server
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 * @_memberOf	_module_
 */
checkSQLInput = function(string) {
	if (!string)
		return '';

	// 限制長度
	if (maxInput && string.length > maxInput)
		string = string.slice(0, maxInput);

	return string
		// for \uxxxx
		.replace(/\\u([\da-f]{4})/g, function($0, $1) {
			return String.fromCharCode($1);
		}).replace(/\\/g, '\\\\')
	
		// .replace(/[\x00-\x31]/g,'')
		.replace(/\x00/g, '\\0')
	
		// .replace(/\x09/g,'\\t')
		// .replace(/\x1a/g,'\\Z')
	
		// .replace(/\r\n/g,' ')
		.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
	
		// .replace(/"/g,'\\"')
		.replace(/'/g, "''");
};




_// JSDT:_module_
.
/**
 * 轉換字串成數值，包括分數等。分數亦將轉為分數。
 * @param {String} number	欲轉換之值。
 * @return
 * @_memberOf	_module_
 */
parse_number = function(number) {
	var m = typeof number;
	if (m === 'number')
		return number;
	if (!number || m !== 'string')
		return NaN;

	number = number.replace(/(\d),(\d)/g, '$1$2');
	if (m = number.match(/(-?[\d.]+)\s+([\d.]+)\/([\d.]+)/)) {
		var p = parseFloat(m[1]), q = parseFloat(m[2]) / parseFloat(m[3]);
		return p + (m[1].charAt(0) === '-' ? -q : q);
	}
	if (m = number.match(/(-?[\d.]+)\/([\d.]+)/))
		// new quotient(m[1],m[2])
		return parseFloat(m[1]) / parseFloat(m[2]);

/*
	try {
		return isNaN(m = parseFloat(number)) ?
				//	TODO: security hole
				eval(number) : m;
	} catch (e) {
		return m;
	}
*/
};


//	非 deep, 淺層/表面 clone/copy: using Array.from().
var Array_clone = Array.prototype.slice;
Array_clone = Array_clone.call.bind(Array_clone);
(function () {
	var a = [2, 3], b = Array_clone(a);
	if (b.join(',') !== '2,3')
		Array_clone = function clone() {
			//	Array.prototype.slice.call(array);
			//	library_namespace.get_tag_list(): Array.prototype.slice.call(document.getElementsByTagName(tagName));
			return this.slice(0);
		};
})();



//	將 element_toPush 加入 array_pushTo 並篩選重複的（本來已經加入的並不會變更）
//	array_reverse[value of element_toPush]=index of element_toPush
function pushUnique(array_pushTo, element_toPush, array_reverse) {
	if (!array_pushTo || !element_toPush)
		return array_pushTo;
	var i;
	if (!array_reverse)
		for (array_reverse = new Array, i = 0; i < array_pushTo; i++)
			array_reverse[array_pushTo[i]] = i;

	if (typeof element_toPush != 'object')
		i = element_toPush, element_toPush = new Array, element_toPush.push(i);

	var l;
	for (i in element_toPush)
		if (!array_reverse[element_toPush])
			// array_pushTo.push(element_toPush),array_reverse[element_toPush]=array_pushTo.length;
			array_reverse[array_pushTo[l = array_pushTo.length] = element_toPush[i]] = l;

	return array_pushTo;
}




/**
 * append/merge to original Array.<br />
 * Array.prototype.concat does not change the existing arrays, it only returns a copy of the joined arrays.
 * 
 * @param {Array}array
 *            添加至此 Array list.
 * @param {Array}list
 *            欲添加的 Array list.
 * @param {Integer}index
 *            從 list[index] 開始 append。
 * @returns this
 */
function append_to_Array(list, index) {
	if (list
			&& (index ? 0 < (index = parseInt(index)) && index < list.length
					: list.length))
		Array.prototype.push.apply(this,
				index ? Array.prototype.slice.call(list, index) : list);

	return this;
}




/*

// to inherit from native object:

function Child(){
	// Parent: native object
	var instance = new Parent;

	// do something need to apply arguments
	;

	// The same as `instance.__proto__ = Child.prototype;`
	Object.setPrototypeOf(instance, Child.prototype);
	// ↑ ** if there is no prototype chain, we should copy the properties manually.

	// do something need to initialize
	;

	return instance;
}

// setup inheritance: only works for prototype chain.
// The same as `Child.prototype = new Parent;`
Object.setPrototypeOf(Child.prototype, Parent.prototype);

// setup Child.prototype.attributes
Child.prototype.property = property;
Child.prototype.method = function () { };

*/

// subclass and inherit from Array
// 注意:此處的繼承重視原生 Array 之功能，因此 instance instanceof SubArray 於 IE8 等舊版中不成立。
function new_Array_instance(array_type, no_proto, items) {
	var instance;
	// 除 Array 外，其他 TypedArray，如 Uint32Array 有不同行為。
	// 此處僅處理 constructor。
	if (array_type === Array)
		if (items && 1 < items.length)
			// 將 items copy 至 this instance。
			Array.prototype.push.apply(instance = new Array, items);
		else
			instance = new Array(items && items.length ? items[0] : 0);
	else
		instance = items ? new array_type(items[0]) : new array_type();

	if (no_proto)
		// if there is no prototype chain, we should copy the properties manually.
		// TODO: 此方法極無效率！此外，由於並未使用 .prototype，因此即使採用 delete instance[property]，也無法得到預設值，且不能探測是否為 instance 特有 property。
		set_method(instance, this.prototype, null);
	else
		Object.setPrototypeOf(instance, this.prototype);
	return instance;
}

function Array_derive(sub_class, array_type) {
	if (!array_type)
		array_type = Array;
	Object.setPrototypeOf(sub_class.prototype, array_type.prototype);
	return new_Array_instance.bind(sub_class, array_type, false);
}

function Array_derive_no_proto(sub_class, array_type) {
	// e.g., IE8
	return new_Array_instance.bind(sub_class, array_type || Array, true);
}

/*

// @example

function SubArray(){
	var instance = SubArray.new_instance(arguments);

	// do something need to initialize
	;

	return instance;
}
// setup inheritance
SubArray.new_instance = Array.derive(SubArray);
// setup SubArray.prototype
SubArray.prototype.property = property;
SubArray.prototype.method = function () { };


// manually test code

// setup

// see data.code.compatibility.
if (!Object.setPrototypeOf && typeof {}.__proto__ === 'object')
	Object.setPrototypeOf = function (object, proto) { object.__proto__ = proto; return object; };

Array.derive = Object.setPrototypeOf ? Array_derive : Array_derive_no_proto;


// main test code

function SubArray() {
	var instance = new_instance(arguments);

	// do something need to initialize
	;

	return instance;
}
// setup inheritance
var new_instance = Array.derive(SubArray);
// setup SubArray.prototype
SubArray.prototype.last = function () { return this[this.length - 1]; };

var a = new SubArray(2, 7, 4), b = [4]; a[6] = 3; a.push(8);
if (Object.setPrototypeOf && !(a instanceof SubArray) || !(a instanceof Array) || a[1] !== 7 || a.length !== 8 || a.last() !== 8 || b.last) console.error('failed');



function SubUint32Array() {
	var instance = SubUint32Array.new_instance(arguments);

	// do something need to initialize
	;

	return instance;
}
// setup inheritance
SubUint32Array.new_instance = Array.derive(SubUint32Array, Uint32Array);
// setup SubUint32Array.prototype
SubUint32Array.prototype.last = function () { return this[this.length - 1]; };

var a = new SubUint32Array(8, 7, 4), b = new Uint32Array(4); a[6] = 3; a[7] = 5; a[8] = 4;
if (Object.setPrototypeOf && !(a instanceof SubUint32Array) || !(a instanceof Uint32Array) || a[8] || a[6] !== 3 || a.length !== 8 || a.last() !== 5 || b.last) console.error('failed');


*/

set_method(Array, {
	// for data.clone()
	clone: Array_clone,
	derive: Object.setPrototypeOf ? Array_derive : Array_derive_no_proto
});



/**
 * <code>

// 檢驗準確度。
[ 0, 1, 2, 3, 4, 8, 10, 127, 128, 129, 1023, 1024, 1025 ].forEach(function(
		amount) {
	CeL.log('test ' + amount);
	var array = this.array, i = array.length, test;
	// 擴增 array。
	array.length = amount;
	for (; i < amount; i++)
		// array = [ 0, 2, 4, 6, 8, .. ]
		array[i] = i << 1;

	if (amount > 0)
		amount--;
	// amount: array 之最大值。
	for (i = 0, amount <<= 1; i < 2 + amount; i++) {
		CeL.assert([ (i > amount ? amount : i) >> 1,
				search_sorted_Array(array, i, {
					found : true
				}) ], 'search_sorted_Array(Array[ 0 - ' + (amount >> 1)
				+ ' ], ' + i + ') = ' + search_sorted_Array(array, i, {
					found : true
				}) + ' !== ' + (i > amount ? amount : i) >> 1);
	}
}, {
	array : []
});

CeL.assert([ 1, search_sorted_Array([ 0, 2, 4 ], 3, {
	found : true
}) ]);


 </code>
 */

/**
 * 以二分搜尋法(binary search)搜尋已排序的 array。<br />
 * binary search an Array.<br />
 * **注意：使用前須先手動將 array 排序！<br />
 * TODO: 依資料分布:趨近等差/等比/對數等，以加速搜尋。
 * 
 * cf.
 * Array.prototype.search()
 * 
 * @param {Array}array
 *            由小至大已排序的 array。
 * @param value
 *            value to search.
 * @param {Object}options
 *            options = {<br />
 *            found : found_callback(index, closed/未準確相符合，僅為趨近、近似),<br />
 *            near : not_found_callback(較小的 index),<br />
 *            start : start index,<br />
 *            last : last/end index,<br />
 *            length : search length.<br />
 *            <em>last 與 length 二選一。</em><br /> }
 * 
 * @returns 未設定 options 時，未找到為 NOT_FOUND(-1)，找到為 index。
 * 
 * @since 2013/3/3 19:30:2 create.<br />
 */
function search_sorted_Array(array, value, options) {
	if (typeof options === 'function')
		options = {
			comparator : options
		};
	else if (typeof options === 'boolean'
			|| Array.isArray(options))
		options = {
			found : options
		};
	else if (library_namespace.is_digits(options)) {
		options = {
			start : options
		};
	} else if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	var callback, comparison, not_found = true,
	//
	comparator = options.comparator || search_sorted_Array.default_comparator,
	//
	start = (options.start | 0) || 0, small = start, index = start,
	//
	big = (options.last | 0)
			|| (options.length ? options.length | 0 + start - 1
					: array.length - 1);

	// main comparare loop
	// http://codereview.stackexchange.com/questions/1480/better-more-efficient-way-of-writing-this-javascript-binary-search
	for (;;)
		if (small > big) {
			if (comparison < 0 && index > start)
				// 修正成較小的 index。
				// 除非是 [2,3].search_sorted(1.5,{found:1})，
				// 否則 assert: big + 1 === start === index
				index--;
			break;

		} else {
			comparison = comparator(value, array[index = (small + big) >> 1]
			// , index
			);

			// 若下一 loop 跳出，則此時之狀態為
			// start = index = big; value 介於 array[index±1]。
			// 或
			// start = index, big; value 介於兩者間。

			if (comparison < 0) {
				big = index - 1;
				// 若下一 loop 跳出，則此時之狀態為
				// big, start = index
				// value 介於兩者間。

			} else if (comparison > 0) {
				small = index + 1;
				// 若下一 loop 跳出，則此時之狀態為
				// index = big, small
				// value 介於兩者間。

			} else {
				not_found = false;
				break;
			}
		}

	// 挑一個可用的。
	callback = not_found && options.near || options.found;

	return Array.isArray(callback) ? callback[index]
	//
	: typeof callback === 'function' ? callback.call(array, index, not_found)
	//
	: not_found && !callback ? NOT_FOUND : index;
}

search_sorted_Array.default_comparator = function(a, b) {
	// return a - b;
	return a < b ? -1 : a > b ? 1 : 0;
};

_.search_sorted_Array = search_sorted_Array;


set_method(String.prototype, {
	count_of : set_bind(count_occurrence, true),
	//gText : getText,
	//turnU : turnUnicode,
	split_by : split_String_by_length,
	pad : set_bind(pad, true),
	toRegExp : set_bind(String_to_RegExp, true),
	between : function(head, foot, index, return_data) {
		// 確保可用 string.between().between() 的方法來作簡易篩選。
		/*
		var data = get_intermediate([ this, head, foot, index ]);
		return data[3] !== NOT_FOUND && data[4] || '';
		*/
		return get_intermediate(this, head, foot, index, return_data) || '';
	},
	set_intermediate : set_intermediate
});

set_method(Number.prototype, {
	// 'super' 於 IE 為保留字。
	to_super : superscript_integer,
	to_sub : subscript_integer,
	to_fixed : to_fixed,
	pad : set_bind(pad, true)
});

set_method(RegExp.prototype, {
	reflag : set_bind(renew_RegExp_flag)
});

set_method(library_namespace.env.global, {
	//	在HTML中typeof alert=='object'
	//alert : JSalert
});

//	建議不用，因為在for(in Array)時會..
set_method(Array.prototype, {
	//clone: Array.prototype.slice,
	append: append_to_Array,
	uniq: set_bind(unique_Array),
	search_sorted: set_bind(search_sorted_Array, true)
});

//---------------------------------------------------------------------//


/**
 * patch: parse ISO date String for IE.<br />
 * for this function, you should also include 'data.code.compatibility' for toISOString().
 * 
 * @example <code>

CeL.log((new Date).toISOString());
CeL.log('' + CeL.ISO_date((new Date).toISOString()));

 * </code>
 * 
 * @param {String}ISO_date_String
 * 
 * @returns {Date} date
 * 
 * @since 2014/7/26 11:56:1
 */
function IE_ISO_date(ISO_date_String) {
	return new Date(IE_ISO_date.parse(ISO_date_String));
}

// 應測試是否可正確 parse。
if (isNaN(Date.parse('0000-01-01T00:00:00.000Z'))) {
	// IE8?
	IE_ISO_date.offset = (new Date).getTimezoneOffset();

	IE_ISO_date.parse = function(ISO_date_String) {
		if (false) {
			library_namespace.debug(ISO_date_String.replace(/\.\d{3}Z$/, '')
					.replace(/-/, '/'));
			library_namespace.debug(Date.parse(ISO_date_String.replace(/\.\d{3}Z$/, '')
					.replace(/-/, '/')));
		}
		return Date.parse(ISO_date_String.replace(/\.\d{3}Z$/, '').replace(/-/,
				'/'))
				+ IE_ISO_date.offset;
	};
} else
	// normal.
	IE_ISO_date.parse = Date.parse;

_.ISO_date = IE_ISO_date;

//---------------------------------------------------------------------//


return (
	_// JSDT:_module_
);
}


});

