
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
name : 'data.native',
//require : '',
code : function(library_namespace) {


var
/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
NOT_FOUND = ''.indexOf('_');

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



// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

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
	this.digits().forEach(function(i) {
		v.push(SUPERSCRIPT_NUMBER[i]);
	});
	return v.join('');
}

function subscript_integer() {
	var v = [];
	this.digits().forEach(function(i) {
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

// More examples: see /_test suite/test.js

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
	if (!function_name)
		try {
			function_name = parse_function.caller;
			if (typeof function_name !== 'function')
				return;
		} catch (e) {
			return;
		}
	if (typeof function_name === 'string'
			&& !(function_name = library_namespace.get_various(function_name)))
		return;

	var fs = String(function_name), m = fs.match(library_namespace.PATTERN_function);
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
 * ASCII_code_at, 對付有時 charCodeAt 會傳回 >256 的數值。
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
		// initialize
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
			t[i | 0] = l[i];
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




/**
 * String pattern (e.g., "/a+/g") to RegExp pattern.<br />
 * escape RegExp pattern，以利作為 RegExp source 使用。<br />
 * cf. qq// in perl.
 * 
 * String.prototype.to_RegExp_pattern = function(f) { return
 * to_RegExp_pattern(this.valueOf(), f); };
 * 
 * @param {String}pattern
 *            pattern text.
 * @param {RegExp}[escape_pattern]
 *            char pattern need to escape.
 * @param {Boolean|String}[RegExp_flag]
 *            flags when need to return RegExp object.
 * 
 * @return {String|RegExp} escaped RegExp pattern or RegExp object.
 */
function to_RegExp_pattern(pattern, escape_pattern, RegExp_flag) {
	pattern = pattern
	// 不能用 $0。
	.replace(escape_pattern || /([.*?+^$|()\[\]\\{}])/g, '\\$1')
	// 這種方法不完全，例如對 /^\s+|\s+$/g
	.replace(/^([\^])/, '\\^').replace(/(\$)$/, '\\$');

	return RegExp_flag ? new RegExp(pattern,
			/^[igms]+$/i.test(RegExp_flag) ? RegExp_flag : '') : pattern;
}
_// JSDT:_module_
.
to_RegExp_pattern = to_RegExp_pattern;

// CeL.ignore_first_char_case('abc') === '[Aa]bc'
function ignore_first_char_case(pattern) {
	// pattern 無特殊字元！否則應該出警告。
	var lower_case = pattern.charAt(0),
	//
	upper_case = lower_case.toUpperCase();
	if (upper_case !== lower_case
	//
	|| upper_case !== (lower_case = upper_case.toLowerCase()))
		pattern = '[' + upper_case + lower_case + ']' + pattern.slice(1);
	return pattern;
}
_// JSDT:_module_
.
ignore_first_char_case = ignore_first_char_case;

// CeL.ignore_case_pattern('abc') === '[Aa][Bb][Cc]'
function ignore_case_pattern(pattern, only_first_char) {
	pattern = pattern.split('');
	// pattern 無特殊字元！否則應該出警告。
	pattern.forEach(function (lower_case, index) {
		var upper_case = lower_case.toUpperCase();
		if (upper_case !== lower_case
		//
		|| upper_case !== (lower_case = upper_case.toLowerCase()))
			pattern[index] = '[' + upper_case + lower_case + ']';
	})
	return pattern.join('');
}
_// JSDT:_module_
.
ignore_case_pattern = ignore_case_pattern;

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



var RegExp_flags = /./g.flags === 'g'
	// get RegExp.prototype.flags
	? function(regexp) {
	return regexp.flags;
} : function(regexp) {
	// regexp = RegExp.prototype.toString.call(regexp);
	// return ('' + regexp).match(/[^\/]*$/)[0];
	regexp = '' + regexp;
	return regexp.slice(regexp.lastIndexOf('/') + 1);

	var flags = [];
	for ( var flag in RegExp_flags.flags)
		if (regexp[flag])
			flags.push(RegExp_flags.flags[flag]);
	return flags.join('');
};

RegExp_flags.flags = {
	// Proposed for ES6
	// extended : 'x',
	global : 'g',
	ignoreCase : 'i',
	multiline : 'm',
	unicode : 'u',
	sticky : 'y'
};

library_namespace.RegExp_flags = RegExp_flags;

// RegExp.prototype.flags
// 注意: 本 shim 實際上應放置於 data.code.compatibility。惟其可能會被省略執行，因此放置於此。
if (!('flags' in RegExp.prototype)
		// library_namespace.env('not_native_keyword')
		&& !Object.defineProperty[library_namespace.env.not_native_keyword])
	Object.defineProperty(RegExp.prototype, 'flags', {
		get : function() {
			return RegExp_flags(this);
		}
	});


/*

use (new RegExp(regexp.source, flag)) instead.
or even (new RegExp(regexp, flag)):
RexExp constructor no longer throws when the first argument is a RegExp and the second argument is present. Instead it creates a new RegExp using the same patterns as the first arguments and the flags supplied by the second argument.

*/

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
			if ((m = flag.indexOf(flag_set[i], 1) !== NOT_FOUND) && a || !m
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

//---------------------------------------------------------------------//

// Unicode category
// https://github.com/slevithan/xregexp/blob/master/xregexp-all.js#L1725
// http://stackoverflow.com/questions/11598786/how-to-replace-non-printable-unicode-characters-javascript

// 使用例之說明：
// @see CeL.data.native for Unicode category (e.g., \p{Cf})

if (false) {
	var
	/** 振り仮名 / 読み仮名 の正規表現。 @type {RegExp} @see [[d:Property:P1814|假名]] */
	PATTERN_読み仮名 = CeL.RegExp(/^[\p{Hiragana}\p{Katakana}ー・ 　]+$/);
}

var Unicode_category = {
		// Control
		Cc : '\0-\x1F\x7F-\x9F',
		// Format
		Cf : '\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB',
		// Unassigned
		Cn : '\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u0560\u0588\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u05FF\u061D\u070E\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5-\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5E\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u2065\u2072\u2073\u208F\u209D-\u209F\u20BF-\u20CF\u20F1-\u20FF\u218C-\u218F\u23FB-\u23FF\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BBA-\u2BBC\u2BC9\u2BD2-\u2BEB\u2BF0-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E43-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FD6-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7AE\uA7AF\uA7B8-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD\uFEFE\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE\uFFFF',
		// Private_Use
		Co : '\uE000-\uF8FF',
		// Surrogate
		Cs : '\uD800-\uDFFF',
		// Other
		C : '\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u0560\u0588\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5-\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5E\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BF-\u20CF\u20F1-\u20FF\u218C-\u218F\u23FB-\u23FF\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BBA-\u2BBC\u2BC9\u2BD2-\u2BEB\u2BF0-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E43-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FD6-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7AE\uA7AF\uA7B8-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF',

		// 振り仮名 / 読み仮名
		// http://www.unicode.org/charts/PDF/U3040.pdf
		Hiragana : '\u3041-\u3096\u309D-\u309F',
		Katakana : '\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D'
};

if (!('unicode' in RegExp.prototype)) {
	Unicode_category.C = Unicode_category.C.replace('\uD7FC',
	// exclude surrogate pair control characters
	// (surrogate code point, \uD800-\uDFFF)
	'\uD7FC-\uD7FF\uE000');
}

// invalid characters @ wikitext, XML.
Unicode_category.invalid = Unicode_category.C.replace('\0',
// 去除 \t\n\r
'\0-\x08\x0B\x0C\x0E');

/**
 * 可以使用 /\p{C}/ 之類的 RegExp。
 * 
 * @param {String|RegExp}source
 *            source of RegExp instance.
 * @param {String}[flag]
 *            flag of RegExp instance.
 * 
 * @returns {RegExp}RegExp instance.
 */
function new_RegExp(source, flag) {
	if (library_namespace.is_RegExp(source)) {
		if (flag === undefined)
			flag = source.flags;
		source = source.source;
	}
	if (typeof flag === 'string' && !('unicode' in RegExp.prototype))
		flag = flag.replace(/u/g, '');

	// 後處理 Unicode category。
	source = source.replace(/\\p{([A-Z][A-Za-z_]*)}/g, function(all, category) {
		return Unicode_category[category] || all;
	});

	return new RegExp(source, flag);
}

new_RegExp.category = Unicode_category;

_.RegExp = new_RegExp;

//---------------------------------------------------------------------//

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


// String.covers()
// @see Knuth–Morris–Pratt algorithm
/*
	return true: 兩者相同, false: 兩者等長但不相同,
	1: str2為str1之擴展 (str2涵蓋str1), -1: str1為str2之擴展, 2: 兩者等價, 0: 皆非
*/
function String_covers(string_1, string_2, options) {
	// 預先處理函數. e.g., 是否忽略大小寫
	if (options && typeof options.preprocessor === 'function') {
		string_1 = options.preprocessor(string_1);
		string_2 = options.preprocessor(string_2);
	}

	if (string_1.length === string_2.length) {
		if (string_1 === string_2)
			return true;
		if (!options || !options.force || typeof options.equals !== 'function')
			// 就算兩者等長但不相同，還是有可能等價。
			return false;
	}

	var result = 1;
	//	swap: string_2 轉成長的。	(短,長)
	if (string_1.length > string_2.length) {
		result = string_2, string_2 = string_1, string_1 = result;
		result = -1;
	}

	//string_1 = string_1.replace(/\s+/g, ' ');

	// .split('')
	string_1 = string_1.chars();
	string_2 = string_2.chars();

	var string_1_index = 0, string_2_index = 0,
		character_1 = string_1[0],
		// comparer
		equals = options && typeof options.equals === 'function' ? options.equals : String_covers.equals;

	string_2.some(function(character_2, index) {
		if (equals(character_1, character_2))
			if (++string_1_index === string_1.length) {
				string_2_index = index;
				return true;
			} else
				character_1 = string_1[string_1_index];
	});

	return string_1_index === string_1.length ? result : 0;
}

String_covers.equals = function(a, b) {
	return a === b;
};

//	compare file name. 比較檔名是否相同。str2 為 str1 添加字元後的擴展？表示兩檔名等價
String_covers.file_name_equals = function(a, b) {
	return a === b || /^[ ・.]+$/.test(a + b) || /^[-～]+$/.test(a + b) || /^[［\[]+$/.test(a + b) || /^[］\]]+$/.test(a + b);
};


set_method(String, {
	covers : String_covers,
	similarity : similarity_coefficient
});


function split_String_by_length_(s, l, m) {
	// less than,great than,index,left count index(left length now),text
	// now,text index
	var lt, lt2, gt, i = 0, c = l, t = '', I = 0;
	while (I < s.length) {
		// 將lt,gt定在下一label之首尾,i為下一次搜尋起點.label定義:/<.+?>/
		if (i !== NOT_FOUND)
			if ((lt = s.indexOf('<', i)) !== NOT_FOUND) {
				if ((gt = s.indexOf('>', lt + 1)) === NOT_FOUND)
					i = lt = NOT_FOUND;
				else {
					i = gt + 1;
					while (lt !== NOT_FOUND && (lt2 = s.indexOf('<', lt + 1)) !== NOT_FOUND
							&& lt2 < gt)
						lt = lt2;
				}
			} else
				i = lt = NOT_FOUND;
		if (false && s.indexOf('') !== NOT_FOUND)
			alert(i + ',' + lt + ',' + gt + ';' + l + ',' + c + '\n' + t);
		if (lt === NOT_FOUND)
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
/*	將字串以長l分隔, split String by fixed length.
	m==0: html用, 1:text.
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
 * 將字串以長 size 切割。
 * 
 * @param {Integer}size
 *            切割大小。可以 ((.length / count) | 0 ) 取得。
 * @returns {Array} chunks
 * 
 * @see <a
 *      href="http://stackoverflow.com/questions/7033639/javascript-split-large-string-in-n-size-chunks"
 *      accessdate="2015/3/2 23:27">regex - javascript: Split large string in
 *      n-size chunks - Stack Overflow</a>
 */
function chunk(size) {
	if ((size |= 0) < 1)
		return [ this ];

	var index = 0, length = this.length, result = [];
	for (; index < length; index += size)
		result.push(this.substr(index, size));

	return result;
}

// To test if RegExp.prototype has unicode flag: if ('unicode' in RegExp.prototype) {}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp


var split_by_code_point, PATTERN_char;
/**
 * 對於可能出現 surrogate pairs 的字串，應當以此來取代 .split('')！<br />
 * handling of surrogate pairs / code points
 * 
 * @see
 * https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B10000_to_U.2B10FFFF
 * http://teppeis.hatenablog.com/entry/2014/01/surrogate-pair-in-javascript
 */
try {
	// tested @ Edge/12.10240
	PATTERN_char = new RegExp('.', 'ug');
	split_by_code_point = function() {
		return this.match(PATTERN_char);
	};

} catch (e) {
	PATTERN_char = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
	split_by_code_point = function() {
		return PATTERN_char.test(this)
		//
		? this.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|./g) : this.split('');
	};
}

// String..prototype.codePoints()
// http://docs.oracle.com/javase/8/docs/api/java/lang/CharSequence.html#codePoints--
function codePoints() {
	return split_by_code_point.call(this)
	// need data.code.compatibility!
	.map(function(char) {
		return char.codePointAt(0);
	});
}


/**
 * get string between head and foot.<br />
 * 取得 text 中，head 與 foot 之間的字串。不包括 head 與 foot。<br />
 * 可以 [3] last index 是否回傳 NOT_FOUND (-1) 檢測到底是有找到，只是回傳空字串，或是沒找到。
 * 
 * @example <code>

// More examples: see /_test suite/test.js

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
 * 回傳 undefined 表示沒找到。只是回傳空字串表示其間為空字串。
 * 
 * TODO: lastIndexOf()
 * 
 * @example <code>

// More examples: see /_test suite/test.js

 * </code>
 * 
 * @param {String}text
 *            欲篩選字串。
 * @param {String}[head]
 *            首字串。 TODO: RegExp
 * @param {String}[foot]
 *            尾字串。 TODO: RegExp
 * 
 * @returns head 與 foot 之間的字串。undefined 表示沒找到。
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


// ---------------------------------------------------------------------//

var no_string_index;
try {
	no_string_index = '01';
	no_string_index = !(no_string_index[1] === '1');
} catch (e) {
	// e.g., IE 6
	no_string_index = true;
}

// Levenshtein distance (edit distance)
// @see
// https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
// http://www.codeproject.com/Articles/13525/Fast-memory-efficient-Levenshtein-algorithm
// http://locutus.io/php/strings/levenshtein/
// https://github.com/component/levenshtein/blob/master/index.js
// https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
// http://jsperf.com/levenshtein-distance-2
function Levenshtein_distance(string_1, string_2) {
	var
	length_1 = string_1 && string_1.length || 0,
	length_2 = string_2 && string_2.length || 0;
	// degenerate cases
	if (length_1 === 0) { return length_2; }
	if (length_2 === 0) { return length_1; }
	if (length_1 === length_2 && string_1 === string_2) {
		return 0;
	}

	if (no_string_index) {
		// for IE 6, or use .charAt()
		string_1 = string_1.split('');
		string_2 = string_2.split('');
	}

	// create two work vectors of integer distances
	var vector_1 = new Array(length_2 + 1), i = 0;
	// initialize vector_1 (the previous row of distances)
	// this row is A[0][i]: edit distance for an empty string_1
	// the distance is just the number of characters to delete from string_2
	for (; i <= length_2; i++) {
		vector_1[i] = i;
	}

	for (i = 0; i < length_1; i++) {
		// calculate vector_2 (current row distances) from the previous row vector_1

		// use formula to fill in the rest of the row
		for (var j = 0,
		// first element of vector_2 is A[i+1][0]
		//   edit distance is delete (i+1) chars from string_1 to match empty string_2
		last_vector_2 = i + 1, vector_2 = [ last_vector_2 ]; j < length_2; j++) {
			last_vector_2 = Math.min(
			// The cell immediately above + 1
			last_vector_2 + 1,
			// The cell immediately to the left + 1
			vector_1[j + 1] + 1,
			// The cell diagonally above and to the left plus the cost
			vector_1[j] + (/*cost*/ string_1[i] === string_2[j] ? 0 : 1));
			vector_2.push(last_vector_2);
		}

		// copy vector_2 (current row) to vector_1 (previous row) for next iteration
		vector_1 = vector_2;
	}

	return vector_2[length_2];
}

_.edit_distance = Levenshtein_distance;

// =====================================================================================================================

function set_bind(handler, need_meny_arg) {
	if (typeof need_meny_arg !== 'boolean')
		need_meny_arg = handler.length > 1;

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


/**
 * 
 * @param {Array}array
 * @param {Function}[comparator]
 * @returns
 */
function unique_and_sort_Array(array, comparator) {
	if (comparator)
		array.sort(comparator);
	else
		array.sort();

	var i = 1, j = -1;
	for (; i < array.length; i++)
		if (array[i] === array[i - 1]) {
			if (j < 0)
				j = i;
		} else if (j >= 0)
			array.splice(j, i - j), i = j, j = -1;

	if (j >= 0)
		array.splice(j, i - j);
	return array;
}

var type_index = {
	string : 0,
	number : 1,
	boolean : 2,
	'undefined' : 3
};
/**
 * 去掉已排序，或最起碼將相同元素集在一起之 Array 中重複的 items。<br />
 * 應能確保順序不變。
 */
function unique_Array(sorted) {
	var array = [];

	if (sorted) {
		var last;
		this.forEach(function(element) {
			if (last !== element)
				array.push(element);
			last = element;
		});

	} else {
		// 以 hash 純量 index 加速判別是否重複。
		var hash = library_namespace.null_Object();
		this.forEach(function(element) {
			var type = typeof element;
			// 能確保順序不變。
			if (type in type_index) {
				// TODO: -0
				if(!(element in hash) || !(type_index[type] in hash[element])) {
					array.push(element);
					(hash[element] = [])[type_index[type]] = null;
				}
			} else if (array.indexOf(element) === NOT_FOUND)
				array.push(element);
		});
	}

	return array;
}



/**
 * 取交集 a1 ∩ a2
 * 
 * @param {Array}a1
 *            array 1
 * @param {Array}a2
 *            array 2
 * @param {Boolean}[sorted]
 *            a1, a2 are sorted.
 * 
 * @returns {Array}intersection of a1 and a2
 */
function Array_intersection(a1, a2, sorted) {
	if (!sorted) {
		a1 = a1.clone().sort(Number_ascending);
		a2 = a2.clone().sort(Number_ascending);
	}

	var index_a1 = 0, index_a2 = 0,
	// Object.create(a1)
	result = [];
	for (; index_a1 < a1.length && index_a2 < a2.length; index_a1++) {
		var item = a1[index_a1];
		while (a2[index_a2] < item)
			index_a2++;
		if (a2[index_a2] === item) {
			// 相同元素最多取 a1, a2 之最小個數。
			index_a2++;
			result.push(item);
		}
	}
	return result;
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
 * @param {Number}[decimals]
 *            1,2,...: number of decimal places shown
 * @param {Number}[max]
 *            maximum decimals. max===0:round() else floor()
 * 
 * @return 取至小數 digits 位後之數字。
 * 
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 *      IEEE754の丸め演算は最も報告されるES3「バグ」である。 http://www.jibbering.com/faq/#FAQ4_6
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

	if (isNaN(decimals) || (decimals = Math.floor(decimals)) < 0) {
		// TODO: using Number.EPSILON

		// 內定：10位
		decimals = 10;
	} else if (decimals > 20)
		// 16: Math.ceil(Math.abs(Math.log10(Number.EPSILON)))
		decimals = 16;

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

//(15*1.33).to_fixed()===19.95

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
 * @param {Number}[decimals]
 *            1,2,..: number of decimal places shown.
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

/**
 * non-negative modulo, positive modulo.
 * 保證 modulo 結果 >=0。
 * 轉成最接近 0 之正 index。
 * 
 * @param {Number}dividend
 *            被除數。
 * @param {Number}divisor
 *            除數。
 * 
 * @returns {Number}remainder 餘數
 */
function non_negative_modulo(dividend, divisor) {
	if (false)
		return ((dividend % divisor) + divisor) % divisor;

	if ((dividend %= divisor) < 0)
		dividend += divisor;
	return dividend;
}



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
	if (s.indexOf(q = "'") !== NOT_FOUND)
		q = '"';
	if (s.indexOf(q) !== NOT_FOUND) {
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

	// 限制長度 maximum input length
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


/**
 * filter object. .map() of {Object}<br />
 * for Object.filter()
 * 
 * @param {Object}object
 *            object to filter
 * @param {Function}filter
 *            callback/receiver to filter the value. <br />
 *            filter(value, key, object) is true: will be preserved.
 * 
 * @returns filtered object
 */
function Object_filter(object, filter) {
	if (typeof filter !== 'function' || typeof object !== 'object')
		return object;

	var key, delete_keys = [];
	for (key in object) {
		if (!filter(object[key], key, object))
			// 在這邊 delete object[key] 怕會因執行環境之不同實作方法影響到 text 的結構。
			delete_keys.push(key);
	}

	if (delete_keys.length > 0)
		delete_keys.forEach(function(key) {
			delete object[key];
		});
}


/**
 * clone object.<br />
 * for Object.clone()
 * 
 * @param {Object}object
 *            object to clone
 * @param {Boolean}deep
 *            deep clone / with trivial
 * 
 * @returns {Object}cloned object
 * 
 * @see clone() @ CeL.data
 */
function Object_clone(object, deep) {
	if (!object || typeof object !== 'object') {
		// 純量。
		return object;
	}

	// for read-only??
	// return Object.create(object);

	if (Array.isArray(object)) {
		// TODO: for {Array}
	}

	if (deep) {
		// @see
		// http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
		return JSON.parse(JSON.stringify(object));
	}

	// shallow clone Object.
	return Object.assign(Object.create(
	// copy prototype
	Object.getPrototypeOf(object)), object);
}



/**
 * Test if no property in the object.<br />
 * for Object.is_empty(), Object.isEmpty()
 * 
 * for ArrayLike, use .length instead. This method includes non-numeric
 * property.
 * 
 * @param {Object}object
 *            object to test
 * 
 * @returns {Boolean}the object is empty.
 * 
 * @see http://stackoverflow.com/questions/3426979/javascript-checking-if-an-object-has-no-properties-or-if-a-map-associative-arra
 */
function Object_is_empty(object) {
	if (object !== null)
		for ( var key in object) {
			if (!object.hasOwnProperty || object.hasOwnProperty(key)) {
				return false;
			}
		}
	return true;
}

/**
 * Count properties of the object.<br />
 * for Object.size()
 * 
 * for ArrayLike, use .length instead. This method will count non-numeric
 * properties.
 * 
 * @param {Object}object
 *            object to count properties
 * 
 * @returns {Boolean}properties count
 * 
 * @see http://stackoverflow.com/questions/5223/length-of-a-javascript-object-that-is-associative-array
 */
function Object_size(object) {
	if (object === null)
		return 0;
	var count = 0;
	for ( var key in object) {
		if (!object.hasOwnProperty || object.hasOwnProperty(key)) {
			count++;
		}
	}
	return count;
}


set_method(Object, {
	filter : Object_filter,
	clone : Object_clone,
	is_empty : Object_is_empty,
	size : Object_size
});


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
 * Array.prototype.concat does not change the existing arrays, it only returns a
 * copy of the joined arrays.
 * 
 * @param {Array}array
 *            添加至此 Array list.
 * @param {Array}list
 *            欲添加的 Array list. TODO: 若非Array，則會當作單一元素 .push()。
 * @param {Integer}index
 *            從 list[index] 開始 append。
 * 
 * @returns this
 */
function append_to_Array(list, index) {
	if (Array.isArray(list) && (index ? 0 < (index = parseInt(index))
	//
	&& index < list.length : list.length)) {
		Array.prototype.push.apply(this, index ? Array.prototype.slice.call(
				list, index) : list);
		//this = this.concat(list);
		//this = Array.prototype.concat.apply(this, arguments);
	}

	return this;
}



// Array.prototype.frequency()
// values count, 發生率
function array_frequency(select_max, target) {
	var count = 0;
	if (target !== undefined) {
		this.forEach(library_namespace.is_RegExp(pattern) ? function(item) {
			if (target.test(item))
				count++;
		} : function(item) {
			if (item === target)
				count++;
		});
		return count;
	}

	// new Map()
	var hash = library_namespace.null_Object();
	if (!select_max) {
		this.forEach(function(item) {
			if (item in hash) {
				hash[item]++;
			} else
				hash[item] = 1;
		});
		return hash;
	}

	var max_count = 0, max_index;
	this.forEach(function(item, index) {
		var count;
		if (item in hash) {
			count = ++hash[item];
		} else
			count = hash[item] = 1;
		if (select_max === true) {
			if (max_count < count) {
				max_count = count;
				max_index = index;
			}
		} else if (max_count <= count) {
			if (max_count < count
			// select_max = 1: maximum case 也選擇較大的 item, -1: min case 選擇較小的 item
			|| !(select_max < 0 ? this[max_index] < (isNaN(item) ? item : +item)
								: this[max_index] > (isNaN(item) ? item : +item)))
				max_index = index;
			max_count = count;
		}
	}, this);
	// hash[this[max_index]] === max_count
	return {
		hash : hash,
		value : this[max_index],
		count : max_count,
		index : max_index
	};
}

/*

// to inherit from native object:

function Child() {
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


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create

*/

// subclass and inherit from Array
// 注意: 此處的繼承重視原生 Array 之功能，因此 instance instanceof SubArray 於 IE8 等舊版中不成立。
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
	else {
		Object.setPrototypeOf(instance, this.prototype);
		//TODO: NG:
		//instance.prototype = Object.create(this.prototype);
	}

	return instance;
}

function Array_derive(sub_class, array_type) {
	if (!array_type)
		array_type = Array;

	Object.setPrototypeOf(sub_class.prototype, array_type.prototype);
	//TODO: NG:
	//sub_class.prototype = Object.create(array_type.prototype);

	return new_Array_instance.bind(sub_class, array_type, false);
}

function Array_derive_no_proto(sub_class, array_type) {
	// e.g., IE8
	return new_Array_instance.bind(sub_class, array_type || Array, true);
}

/*

// @example

function SubArray() {
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
	derive: Object.setPrototypeOf ? Array_derive : Array_derive_no_proto,
	intersection: Array_intersection
});


// ------------------------------------
// comparator, compare_function, sort_function


// 用於由小至大升序序列排序, ascending, smallest to largest, A to Z。
// 注意：sort 方法會在原地排序 Array 物件。
// @see std::less<int>()
function ascending(a, b) {
	// '12/34', '56/78' 可以比大小，但不能相減。
	// 但這對數字有問題: '1212'<'987'
	// 若對一般物件，採用 .sort() 即可。
	return a < b ? -1 : a > b ? 1 : 0;
}

function Number_ascending(a, b) {
	// 升序序列排序: 小→大
	return a - b;

	// '12/34', '56/78' 可以比大小，但不能相減。
	// 但這對數字有問題: '1212'<'987'
	// 若對一般物件，採用 .sort() 即可。
	return a < b ? -1 : a > b ? 1 : 0;

	return _1 - _2;
	return Math.sign(a - b);
}

function Number_descending(a, b) {
	// 降序序列排序: 大→小
	return b - a;

	return a < b ? 1 : a > b ? -1 : 0;
}

_.ascending = Number_ascending;
_.descending = Number_descending;


/**
 * 以二分搜尋法(binary search)搜尋已排序的 array。<br />
 * binary search an Array.<br />
 * ** 注意：使用前須先手動將 array 排序！<br />
 * TODO: 依資料分布:趨近等差/等比/對數等，以加速搜尋。
 * 
 * cf.
 * Array.prototype.search()
 * 
 * @param {Array}array
 *            由小至大已排序的 array。
 * @param value
 *            value to search.
 * @param {Object}[options]
 *            附加參數/設定特殊功能與選項 options = {<br />
 *            found : found_callback(index, not_found: closed/未準確相符合，僅為趨近、近似),<br />
 *            near : not_found_callback(較小的 index, not_found),<br />
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
	if (library_namespace.is_RegExp(value) && (!options || !options.comparator)) {
		// 處理搜尋 {RegExp} 的情況:　此時回傳最後一個匹配的 index。欲找首次出現，請用 first_matched()。
		if (value.global) {
			library_namespace.err('search_sorted_Array: 當匹配時，不應採用 .global！ ' + value);
		}
		if (!options) {
			options = library_namespace.null_Object();
		}
		options.comparator = function (v) {
			return value.test(v) ? -1 : 1;
		};
		if (!('near' in options)) {
			options.near = true;
		}
	} else if (!options
	//
	&& (typeof value === 'object' || typeof value === 'function')) {
		options = value;
		value = undefined;
	}

	if (typeof options === 'function') {
		options = {
			comparator : options
		};
	} else if (typeof options === 'boolean'
			|| Array.isArray(options)) {
		options = {
			found : options
		};
	} else if (library_namespace.is_digits(options)) {
		options = {
			start : options
		};
	} else if (!library_namespace.is_Object(options)) {
		options = library_namespace.null_Object();
	}

	var callback, comparison, not_found = true,
	//
	comparator = options.comparator
	|| (typeof array[0] === 'number' ? Number_ascending : search_sorted_Array.default_comparator),
	//
	start = (options.start | 0) || 0, small = start, index = start,
	//
	big = (options.last | 0)
			|| (options.length ? options.length | 0 + start - 1
					: array.length - 1);

	// main comparare loop
	// http://codereview.stackexchange.com/questions/1480/better-more-efficient-way-of-writing-this-javascript-binary-search
	while (true) {
		if (small > big) {
			if (comparison > 0 && index > start)
				// 修正成較小的 index。
				// 除非是 [2,3].search_sorted(1.5,{found:1})，
				// 否則 assert: big + 1 === start === index
				index--;
			break;

		} else {
			// 首引數應該採用最多資訊者，因此array[]擺在value前。
			comparison = comparator(array[index = (small + big) >> 1], value
			// , index
			);

			// 若下一 loop 跳出，則此時之狀態為
			// start = index = big; value 介於 array[index±1]。
			// 或
			// start = index, big; value 介於兩者間。

			if (comparison > 0) {
				// 往前找
				big = index - 1;
				// 若下一 loop 跳出，則此時之狀態為
				// big, start = index
				// value 介於兩者間。

			} else if (comparison < 0) {
				// 往後找
				small = index + 1;
				// 若下一 loop 跳出，則此時之狀態為
				// index = big, small
				// value 介於兩者間。

			} else {
				not_found = false;
				break;
			}
		}
	}

	// 挑一個可用的。
	callback = not_found && options.near || options.found;
	// console.log([ not_found, callback, index ]);

	return Array.isArray(callback) ? callback[index]
	//
	: typeof callback === 'function' ? callback.call(array, index, not_found)
	//
	: not_found && (!callback
	// 當 library_namespace.is_RegExp(value) 時，callback 僅表示匹不匹配。
	|| library_namespace.is_RegExp(value)
	// assert: 此時 index === 0 or array.length-1
	// 這樣會判別並回傳首個匹配的。
	&& (index === 0 && comparator(array[index]) > 0)) ? NOT_FOUND : index;
}

search_sorted_Array.default_comparator = ascending;

_.search_sorted_Array = search_sorted_Array;



// return first matched index.
// assert: array 嚴格依照 mismatched→matched，有個首次出現的切分點。
function first_matched(array, pattern, get_last_matched) {
	if (!array || !pattern) {
		return NOT_FOUND;
	}
	var first_matched_index = array.length;
	if (first_matched_index === 0) {
		return NOT_FOUND;
	}
	var is_RegExp = library_namespace.is_RegExp(pattern),
	is_Function = !is_RegExp && library_namespace.is_Function(pattern),
	//
	last_mismatched_index = 0;
	if (is_RegExp && pattern.global) {
		library_namespace.err('first_matched: 當匹配時，不應採用 .global！ ' + pattern);
	}

	var matched;
	while (last_mismatched_index < first_matched_index) {
		// binary search
		var index = (last_mismatched_index + first_matched_index) / 2 | 0;
		matched = is_RegExp ? pattern.test(array[index]) : is_Function ? pattern(array[index]) : array[index].includes(pattern);
		if (false && matched && is_RegExp) {
			library_namespace.log(last_mismatched_index + '-[' + index + ']-' + first_matched_index + '/' + array.length + ': ' + matched + ' ' + pattern);
			console.log(array[index].match(pattern));
		}
		if (get_last_matched ? !matched : matched) {
			first_matched_index = index;
		} else if (last_mismatched_index === index) {
			break;
		} else {
			last_mismatched_index = index;
		}
	}

	if (get_last_matched) {
		if (last_mismatched_index === 0 && !matched) {
			library_namespace.debug('Not found.', 3, 'first_matched');
			return NOT_FOUND;
		}
		library_namespace.debug('return ' + last_mismatched_index, 3, 'first_matched');
		return last_mismatched_index;
	}

	return first_matched_index === array.length ? NOT_FOUND : first_matched_index;
}

_.first_matched = first_matched;



/**
 * merge / combine string with duplicated characters.<br />
 * merge 2 array by order, without order change<br />
 * 警告: 此法僅於無重複元素時有效。
 * 
 * @param {Array}sequence_list
 *            sequence list to merge
 * 
 * @returns {Array}merged chain
 * 
 * @see find duplicate part of 2 strings<br />
 *      https://en.wikipedia.org/wiki/String_metric
 *      https://en.wikipedia.org/wiki/Shortest_common_supersequence_problem
 *      http://codegolf.stackexchange.com/questions/17127/array-merge-without-duplicates
 *      https://en.wikipedia.org/wiki/Topological_sorting
 */
function merge_unduplicated_sequence(sequence_list) {
	var map = library_namespace.null_Object();

	function add_node(element, index) {
		var chain = map[element];
		if (!chain)
			chain = map[element]
			// [ 0: possible backward, 1: possible foreword ]
			= [ library_namespace.null_Object(),
					library_namespace.null_Object() ];
		if (index > 0)
			// 登記前面的。
			chain[0][this[index - 1]] = true;
		if (index + 1 < this.length)
			// 登記前面的。
			chain[1][this[index + 1]] = true;
		return;
		// 不必記太多，反而稱加操作複雜度。上面的相當於把 'abc' 拆成 'ab', 'bc'
		var i = 0;
		for (; i < index; i++)
			// 登記前面的。
			chain[0][this[i]] = true;
		// i++: skip self
		for (i++; i < this.length; i++)
			// 登記後面的。
			chain[1][this[i]] = true;
	}

	sequence_list.forEach(function(sequence) {
		if (typeof sequence === 'string')
			sequence = sequence.split('');
		if (typeof sequence.forEach === 'function'
		// && Array.isArray(sequence)
		) {
			sequence.forEach(add_node, sequence);
		} else {
			library_namespace
					.warn('merge_unduplicated_sequence: Invalid sequence: ['
							+ sequence + ']');
		}
	});

	// 此法僅於無重複時有效。
	/**
	 * result chain / sequence.<br />
	 * result = [ start of chain, ends of chain ]
	 * 
	 * @type {Array}
	 */
	var result = [ [], [] ];
	while (true) {
		/** {Array}temporary queue */
		var queue = [ [], [] ],
		/** {Array}elements added */
		added = [];
		for ( var element in map) {
			if (element in added)
				continue;
			// 先考慮添入起首，再考慮結尾。
			if (Object.is_empty(map[element][0])) {
				queue[0].push(element);
				// 登記。
				added.push(element);
				continue;
			}
			if (Object.is_empty(map[element][1])) {
				queue[1].push(element);
				// 登記。
				added.push(element);
				continue;
			}
		}

		if (added.length === 0)
			// nothing can do.
			// e.g., a ring / cycle, 有重複。
			break;

		if (queue[0].length === 1)
			result[0].push(queue[0][0]);
		else if (queue[0].length > 0) {
			// 有多重起頭。
			throw 'Invalid starts: ' + queue[0];
		}
		if (queue[1].length === 1)
			result[1].unshift(queue[1][0]);
		else if (queue[1].length > 0) {
			// 有多重結尾。
			throw 'Invalid ends: ' + queue[1];
		}

		// remove node.
		added.forEach(function(element) {
			var data = map[element];
			for ( var node in data[0])
				delete map[node][1][element];
			for ( var node in data[1])
				delete map[node][0][element];
			delete map[element];
		});
	}

	result = result[0].concat(result[1]);
	return result;
}

_.merge_sequence = merge_unduplicated_sequence;


// ---------------------------------------------------------------------//

// https://en.wikipedia.org/wiki/Letter_case#Headings_and_publication_titles
// http://adminsecret.monster.com/training/articles/358-what-to-capitalize-in-a-title
// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
// to_title_case()
// Capitalize the first letter of string
// also use CSS: text-transform:capitalize;
// @see Camel_to_underscore() @ data.code
function toTitleCase(to_lower_first) {
	var title = this.trim();
	if (to_lower_first)
		title = title.toLowerCase();
	return title.replace(/(^|\s)((\w)(\w*))/g, function($0, $1, $2, $3, $4) {
		// console.log($0);
		return $2 in toTitleCase.lower ? $0 : $2 in toTitleCase.upper ? $0.toUpperCase() : ($1 ? ' ' : '') + $3.toUpperCase() + $4;
	})
	// capitalize the first and last word of the title itself.
	// in case title === ''
	.replace(/^\w/, function($0) {
		return $0.toUpperCase();
	}).replace(/\s(\w)([\w\-]*)$/, function($0, $1, $2) {
		return ' ' + $1.toUpperCase() + $2;
	});
}

/**
 * add exception words
 * 
 * @param {String|Array}words
 *            exception words
 */
toTitleCase.add_exception = function(words, upper) {
	// initialize
	if (!toTitleCase.lower)
		toTitleCase.lower = library_namespace.null_Object();
	if (!toTitleCase.upper)
		toTitleCase.upper = library_namespace.null_Object();

	var target = upper ? toTitleCase.upper : toTitleCase.lower;

	if (typeof words === 'string')
		words = words.split(',');

	if (Array.isArray(words))
		words.forEach(function(word) {
			target[word] = true;
		});
	else
		Object.assign(target, words);
};

toTitleCase
	.add_exception('at,by,down,for,from,in,into,like,near,of,off,on,onto,over,past,to,upon,with,and,but,or,yet,for,nor,so,as,if,once,than,that,till,when,to,a,an,the');
toTitleCase
	.add_exception('id,tv,i,ii,iii,iv,v,vi,vii,viii,ix,x,xi,xii,xiii', true);




if (false) {
	// 警告:這將使 node.js 6.2.2 卡住。
	/\[\[(?:[^\[\]]+|\[[^\[]|\][^\]])*\]\]/
			.test("[[                                     [[ ]] [[ ]] [[ ]] ]]");
}

if (false) {
	// 若要消除 "'''" 與 "''"，應將長的置於前面。
	wikitext = wikitext.remove_head_tail("'''", 0, ' ').remove_head_tail("''",
			0, ' ');
}

/**
 * 去除首尾。這或許該置於 CeL.data.native...
 * 
 * @param {String}text
 *            指定的輸入字串。
 * @param {String}head
 *            欲移除之首字串。
 * @param {String}[tail]
 *            欲移除之尾字串。
 * @param {String}[insert_string]
 *            將首尾以((insert_string))取代。 有設定 insert_string 時，會保留內容物。未設定
 *            insert_string 時，會將內容物連同首尾一同移除。
 * 
 * @returns {String}replaced text. 變更/取代後的結果。
 */
function remove_head_tail(text, head, tail, insert_string) {
	var head_eq_tail, index_start, index_end;
	if (!tail) {
		tail = head;
		head_eq_tail = true;
	} else {
		head_eq_tail = head === tail;
	}

	var head_length = head.length, tail_length = tail.length;

	while (true) {

		if (head_eq_tail) {
			// 改採自前面搜尋模式。
			index_start = text.indexOf(head);
			if (index_start === NOT_FOUND) {
				// 無首
				return text;
			}
			index_end = text.indexOf(tail, index_start + head_length);
			if (index_end === NOT_FOUND) {
				// 有首無尾
				return text;
			}

		} else {
			index_end = text.indexOf(tail);
			if (index_end === NOT_FOUND) {
				// 無尾
				return text;
			}
			// 須預防中間包含 head / tail 之字元。
			index_start = text.lastIndexOf(head, index_end - head_length);
			if (index_start === NOT_FOUND) {
				// 有尾無首
				return text;
			}
		}

		text = text.slice(0, index_start)
		// 未設定 insert_string 時，會將內容物連同首尾一同移除。
		+ (insert_string === undefined ? '' : insert_string
		// 有設定 insert_string 時，會保留內容物。
		+ text.slice(index_start + head_length, index_end) + insert_string)
				+ text.slice(index_end + tail_length);
	}
}



/**
 * 持續執行 .replace()，直到處理至穩定平衡無變動為止。
 * 
 * @param {String}text
 *            指定的輸入字串。
 * @param {RegExp}pattern
 *            要搜索的正規表示式/規則運算式模式。
 * @param {String|Function}replace_to
 *            用於替換的字串。
 * 
 * @returns {String}replaced text. 變更/取代後的結果。
 */
function replace_till_stable(text, pattern, replace_to) {
	library_namespace.debug('pattern: ' + pattern, 6, 'replace_till_stable');
	for (var original; original !== text;) {
		original = text;
		text = original.replace(pattern, replace_to);
		library_namespace.debug('[' + original + '] '
				+ (original === text ? 'done.' : '→ [' + text + ']'), 6, 'replace_till_stable');
	}
	return text;
}


/**
 * 當欲變更/取代文字前後的文字符合要求時，才執行取代。
 * 
 * @param {String}text
 *            指定的輸入字串。
 * @param {RegExp}pattern
 *            要搜索的正規表示式/規則運算式模式。
 * @param {String|Function}replace_to
 *            用於替換的字串。
 * @param {Function|Undefined}[match_previous]
 *            filter match_previous(previous token) return true if it's OK to
 *            replace, false if it's NOT OK to replace.
 * @param {Function|Undefined}[match_next]
 *            filter match_next(next token) return true if it's OK to replace,
 *            false if it's NOT OK to replace.
 * 
 * @returns {String}replaced text. 變更/取代後的結果。
 */
function replace_check_near(text, pattern, replace_to, match_previous,
		match_next) {
	var matched, results = [], last_index = 0;
	if (!pattern.global) {
		library_namespace.debug("The pattern doesn't has 'global' flag!", 2,
				'replace_check_near');
	}

	while (matched = pattern.exec(text)) {
		library_namespace.debug(pattern + ': ' + matched, 5,
				'replace_check_near');
		var previous_text = text.slice(last_index, matched.index),
		//
		_last_index = matched.index + matched[0].length;
		if ((!match_previous || match_previous(previous_text))
		// context 上下文 前後文
		// 前面的 foregoing paragraphs, see above, previously stated, precedent
		// 後面的 behind rearwards;back;posteriority;atergo;rearward
		&& (!match_next || match_next(text.slice(_last_index)))) {
			last_index = pattern.lastIndex;
			library_namespace.debug(previous_text + ',' + matched[0] + ','
					+ matched[0].replace(pattern, replace_to), 5,
					'replace_check_near');
			results.push(
			//
			previous_text, matched[0].replace(pattern, replace_to));
			// restore lastIndex.
			pattern.lastIndex = last_index;
			last_index = _last_index;
		}
		if (!pattern.global) {
			// 僅執行此一次。
			break;
		}
	}

	// 收尾。理想的 pattern 應該用 /([\s\S]*?)(delimiter|$)/g 之類，如此則無須收尾。
	if (last_index < text.length) {
		if (last_index === 0)
			// 完全沒相符的。
			return text;
		results.push(text.slice(last_index));
	}
	return results.join('');
}


var PATTERN_bigrams = /.{2}/g;

/**
 * Get Sørensen index, or Dice's coefficient.
 * 
 * String.similarity()
 * 
 * @param {String}string_1
 *            sequence 1
 * @param {String}string_2
 *            sequence 2
 * 
 * @returns {Number}index (or named coefficient)
 * 
 * @see https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
 */
function similarity_coefficient(string_1, string_2) {
	var count = 0,
	//
	bigrams_1 = string_1.match(PATTERN_bigrams).concat(
			string_1.slice(1).match(PATTERN_bigrams)),
	//
	bigrams_2 = string_2.match(PATTERN_bigrams).concat(
			string_2.slice(1).match(PATTERN_bigrams));

	bigrams_1.forEach(function(bigram) {
		if (bigrams_2.includes(bigram))
			count++;
	});

	// 0–1
	return 2 * count / (bigrams_1.length + bigrams_2.length);
}


// ------------------------------------


set_method(String.prototype, {
	covers : function(string) {
		return this.length >= string.length
		//
		&& !!String_covers(string, this);
	},

	count_of : set_bind(count_occurrence, true),
	//gText : getText,
	//turnU : turnUnicode,
	
	//split_by : split_String_by_length,
	chunk : chunk,

	// 對於可能出現 surrogate pairs 的字串，應當以此來取代 .split('')！
	chars : split_by_code_point,
	codePoints : codePoints,

	remove_head_tail : set_bind(remove_head_tail, true),

	// repeatedly replace till stable
	replace_till_stable : set_bind(replace_till_stable, true),
	replace_check_near : set_bind(replace_check_near, true),

	pad : set_bind(pad, true),
	toRegExp : set_bind(String_to_RegExp, true),
	toTitleCase : toTitleCase,
	between : function(head, foot, index, return_data) {
		// 確保可用 string.between().between() 的方法來作簡易篩選。
		/*
		var data = get_intermediate([ this, head, foot, index ]);
		return data[3] !== NOT_FOUND && data[4] || '';
		*/
		return get_intermediate(this, head, foot, index, return_data) || '';
	},
	set_intermediate : set_intermediate,

	edit_distance : set_bind(Levenshtein_distance)
});

set_method(Number.prototype, {
	// 'super' 於 IE 為保留字。
	to_super : superscript_integer,
	to_sub : subscript_integer,
	to_fixed : to_fixed,
	mod : set_bind(non_negative_modulo),
	pad : set_bind(pad, true)
});

set_method(RegExp.prototype, {
	clone : function() {
		// TODO: this.hasOwnProperty()
		return new RegExp(this.source, this.flags);
	},
	reflag : set_bind(renew_RegExp_flag)
});

set_method(library_namespace.env.global, {
	//	在 old IE 中 typeof alert==='object'
	//alert : JSalert,

	// https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
	// TODO: window.postMessage can be used to trigger an immediate but yielding callback.
	setImmediate : function setImmediate(callback, parameters) {
		return setTimeout(typeof callback === 'function' ? function() {
			if (parameters)
				callback.apply(null, parameters);
			else
				// 因為 setTimeout(callback, 0) 可能傳入未規範的 arguments，因此不在外面處理 callback。
				callback();
		}
		// 特殊功能... for {String}
		: callback, 0);
	},
	clearImmediate : function clearImmediate(id) {
		return clearTimeout(id);
	}
});

//	建議不用，因為在for(in Array)時會...
set_method(Array.prototype, {
	// Array.prototype.clone
	clone : function() {
		// TODO: this.hasOwnProperty()
		return this.slice();
	},
	remove_once: function(value) {
		var index = this.indexOf(value);
		if (index !== NOT_FOUND)
			return this.splice(index, 1);
	},
	// remove all.
	// value 很多的話，應該用 delete + 去除 blank。
	remove: function(value) {
		var index = 0;
		while((index = this.indexOf(value, index)) !== NOT_FOUND)
			this.splice(index, 1);
	},
	// Array.prototype.sum()
	sum: function(using_index) {
		// total summation
		// ABSORBING_ELEMENT
		var sum = 0;
		this.forEach(using_index ? function(e, i) {
			sum += i;
		} : function(e) {
			sum += +e;
		});
		return sum;
	},
	// Array.prototype.product()
	product: function(using_index) {
		// MULTIPLICATIVE_IDENTITY
		var product = 1;
		this.every(using_index ? function(e, i) {
			return product *= i;
		} : function(e) {
			return product *= +e;
		});
		return product;
	},
	// Array.prototype.to_hash()
	// ['1e3',5,66]→{'1e3':0,'5':1,'66':2}
	// {Function}[get_key]
	to_hash: function(get_key, hash) {
		if (!hash) {
			hash = library_namespace.null_Object();
		}
		// TODO: 衝突時處理。
		this.forEach(get_key ? function(item, index) {
			item = get_key(item);
			hash[typeof item === 'object' ? JSON.stringify(item) : item] = index;
		} : function(item, index) {
			hash[typeof item === 'object' ? JSON.stringify(item) : item] = index;
		});
		return hash;
	},
	// Array.prototype.frequency()
	frequency : array_frequency,
	//clone: Array.prototype.slice,
	append: append_to_Array,
	uniq: unique_Array,
	// Array.prototype.search_sorted
	search_sorted: set_bind(search_sorted_Array, true),
	// Array.prototype.first_matched
	first_matched: set_bind(first_matched, true),

	// empty the array. 清空 array
	// Array.prototype.clear()
	clear : function(length) {
		length = Math.max(0, length | 0);
		// This is faster than ((this.length = 0))
		while (this.length > length)
			this.pop();
		return this;
	}
});

// ---------------------------------------------------------------------//


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



set_method(Date.prototype, {
	clone : function() {
		// TODO: this.hasOwnProperty()
		return new Date(this.getTime());
	}
});


// ---------------------------------------------------------------------//


return (
	_// JSDT:_module_
);
}


});

